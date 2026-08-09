# Spike: impressora interna CloudPOS (maquininha)

**Data:** 2026-08-04  
**Status:** spike documentado + **contrato/stub no código** — **não integrado em produção** (sem SDK oficial)

Contrato já exposto:

- Nativo: `isInternalPrinterAvailable()` / `printInternal(lines)` → `false` (stub)
- JS: `PrinterService.getAvailableBackends()`, `printReceipt(lines, { backend })`
- UI Ajustes: banner “Impressora interna (CloudPOS) indisponível neste build”

## Contexto

O app-base (`../app-base`) imprime em dois caminhos:

1. **Bluetooth ESC/POS** — socket SPP (já coberto no módulo `zooloo-printer`).
2. **Impressora embutida POS** — CloudPOS SDK via `POSTerminal.getDevice(DeviceName.PRINTER)`.

Referência principal no app-base:

- `sources/e2/s.java` (decompilado como `PrinterGrupoM`)
- `sources/com/cloudpos/printer/PrinterDevice.java`
- `sources/com/cloudpos/sdk/printer/impl/PrinterDeviceImpl.java`
- Native libs: `resources/lib/armeabi-v7a/libjni_cloudpos_printer*.so`

Fluxo típico no legado:

```java
PrinterDevice printer = (PrinterDevice) POSTerminal.getInstance(context)
    .getDevice(DeviceName.PRINTER);
printer.open();
printer.printText(format, line);
printer.close();
```

## Artefatos necessários

| Artefato | Situação no monorepo |
|----------|----------------------|
| `.so` CloudPOS (armeabi-v7a) | Presente no APK decompilado do app-base |
| Classes Java `com.cloudpos.*` | Presentes (decompiladas/ofuscadas) |
| AAR/SDK **oficial** do fabricante | **Não** encontrado no repositório |
| arm64-v8a printer `.so` | Não listado (só armeabi-v7a no extract) |

## Decisões

| Opção | Avaliação |
|-------|-----------|
| **A)** AAR oficial do fabricante do terminal | Preferida — legal e estável |
| **B)** Service AIDL do device (se o OEM expõe) | Viável em alguns modelos SmartPOS |
| **C)** Empacotar classes/SO decompilados | **Rejeitado** para merge em produção sem validação legal e sem ABIs completas |

**Decisão atual:** (C) adiada. Stub de contrato no `PrinterService` / módulo com `isInternalPrinterAvailable() === false` até haver SDK oficial ou AIDL do hardware alvo.

## Contrato JS unificado (futuro)

```ts
type PrinterBackend = 'bluetooth' | 'internal';

// PrinterService
getAvailableBackends(): Promise<PrinterBackend[]>
printReceipt(lines: string[], options?: {
  backend?: 'auto' | 'bluetooth' | 'internal'
}): Promise<boolean>
```

**Auto:** tenta `internal` se `isInternalPrinterAvailable()`, senão Bluetooth preferido.

## API nativa mínima (quando SDK existir)

```kotlin
fun isInternalPrinterAvailable(): Boolean
fun printInternal(lines: List<String>): Boolean
// open → printText loop → feed → close; thread dedicada
```

## Riscos

- Licença e redistribuição do CloudPOS SDK
- Dependência de modelo/OEM (não todo Android POS é CloudPOS)
- ABI: builds arm64 modernos podem falhar se só houver `armeabi-v7a`
- Threading: impressão bloqueante no main thread causa ANR

## Próximos passos (fora deste hardening)

1. Identificar modelo da maquininha (WizarPOS, Newland, etc.) e baixar SDK oficial.
2. Integrar AAR em `modules/zooloo-printer/android/libs/`.
3. Implementar `CloudPosPrinter.kt` e registrar no module.
4. UI em Ajustes: seletor Bluetooth vs Interna.
5. Teste físico em terminal real (não emulador).
