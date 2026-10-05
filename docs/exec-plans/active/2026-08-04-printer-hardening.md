# Plano: Hardening e conclusão da impressão térmica (Bluetooth + POS)

> **Status (2026-08-09):** Tasks 1–8 **código concluído**. Task 9 pendente só de **dev build Android + smoke em device físico** (e merge quando validar). CloudPOS real continua bloqueado por SDK oficial.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar a impressão Bluetooth usável de ponta a ponta no app (permissões, persistência, falhas corretas, bilhete real) e preparar o caminho da impressora interna da maquininha (CloudPOS), cobrindo os bugs e pendências já identificados.

**Architecture:** Manter o Expo Module `modules/zooloo-printer` como bridge nativa e `PrinterService` como única fachada JS. Evoluir o serviço com: permissões Android, preferência de impressora (AsyncStorage), impressão com checagem de sucesso, reconexão e encoding. Integrar `PuleTermica` ao serviço. Deixar CloudPOS (impressora embutida) como adapter separado no mesmo módulo, sem misturar com o socket Bluetooth.

**Tech Stack:** Expo 54, React Native 0.81, Expo Modules (Kotlin), AsyncStorage, PermissionsAndroid / `expo-modules` permissions, ESC/POS, (fase 2) CloudPOS SDK do app-base.

## Global Constraints

- **Plataforma alvo de impressão nativa:** Android only (iOS: no-op seguro / mensagem clara; web: fallback Share/print).
- **Não quebrar Expo Go em web:** stubs web devem expor a mesma API e retornar falha controlada, sem throw.
- **Não copiar dezenas de drivers do app-base** na fase Bluetooth: um driver ESC/POS genérico robusto basta.
- **Persistência de MAC/nome:** `AsyncStorage` (não SecureStore) — não é segredo sensível; seguir padrão de `secureStorage.ts` apenas para chaves de preferência simples se já existir helper, senão AsyncStorage direto no PrinterService.
- **TDD:** cada task de lógica de serviço começa com teste unitário falhando.
- **Commits:** pequenos, por task, mensagens em inglês ou pt-BR consistentes com o repo.
- **Dev build obrigatório** após mudanças nativas (`npx expo run:android`).
- **CloudPOS (fase 2)** depende de AAR/SO do fabricante; se o SDK não puder ser empacotado limpo no Expo Module, a task 8 entrega spike + interface + stub, sem forçar integração incompleta em produção.

---

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---------|------------------|
| `modules/zooloo-printer/android/.../PrinterManager.kt` | Socket BT, encoding, isConnected, disconnect-before-connect, cut, buffer |
| `modules/zooloo-printer/android/.../ZoolooPrinterModule.kt` | Exportar funções nativas (incl. isConnected; depois POS) |
| `modules/zooloo-printer/src/ZoolooPrinterModule.ts` | Tipos TS da bridge nativa |
| `modules/zooloo-printer/src/ZoolooPrinterModule.web.ts` | Stub web com mesma API |
| `modules/zooloo-printer/index.ts` | Re-exports (incl. BluetoothDevice) |
| `modules/zooloo-printer/android/src/main/AndroidManifest.xml` | Permissões BT com flags corretas |
| `services/PrinterService.ts` | Fachada: permissões, preferências, printReceipt, ensureConnected |
| `components/PuleTermica.tsx` | Imprimir bilhete via PrinterService (+ fallback Share) |
| `app/(tabs)/configuracoes.tsx` | Pedir permissões, restaurar preferência, status real |
| `__tests__/services/PrinterService.test.ts` | Cobertura dos novos comportamentos |
| `components/PuleTermica.tsx` helpers (exportar `gerarLinhasComprovante`) | Reuso de layout ESC/POS em linhas |
| (fase 2) `PrinterManager.kt` / CloudPOS adapter | Impressora interna da maquininha |

---

## Fase 1 — Bluetooth usável em produção

### Task 1: Corrigir sucesso de impressão e API do PrinterService

**Files:**
- Modify: `services/PrinterService.ts`
- Modify: `__tests__/services/PrinterService.test.ts`
- Modify: `modules/zooloo-printer/src/ZoolooPrinterModule.ts` (tipos se faltar `printCommand`)

**Interfaces:**
- Consumes: `ZoolooPrinterModule.printCommand`, `printText` → `Promise<boolean>`
- Produces:
  - `PrinterService.printReceipt(lines: string[]): Promise<boolean>` — retorna `false` se qualquer passo falhar
  - `PrinterService.printText(text: string): Promise<boolean>` — propaga `false`

- [x] **Step 1: Escrever testes falhando para falha silenciosa**

```ts
it('deve retornar false se printCommand falhar', async () => {
  (ZoolooPrinterModule.printCommand as jest.Mock).mockResolvedValue(false);
  (ZoolooPrinterModule.printText as jest.Mock).mockResolvedValue(true);
  const ok = await PrinterService.printReceipt(['Linha']);
  expect(ok).toBe(false);
});

it('deve retornar false se algum printText falhar', async () => {
  (ZoolooPrinterModule.printCommand as jest.Mock).mockResolvedValue(true);
  (ZoolooPrinterModule.printText as jest.Mock)
    .mockResolvedValueOnce(true)
    .mockResolvedValueOnce(false);
  const ok = await PrinterService.printReceipt(['A', 'B']);
  expect(ok).toBe(false);
});
```

- [x] **Step 2: Rodar testes e confirmar falha**

```bash
npm test -- __tests__/services/PrinterService.test.ts
```

Expected: FAIL nos novos casos (hoje retorna `true`).

- [x] **Step 3: Implementar checagem de retorno em `printReceipt`**

```ts
static async printReceipt(lines: string[]): Promise<boolean> {
  try {
    if (!(await ZoolooPrinterModule.printCommand([0x1B, 0x40]))) return false;
    for (const line of lines) {
      if (!(await ZoolooPrinterModule.printText(line + '\n'))) return false;
    }
    if (!(await ZoolooPrinterModule.printText('\n\n\n'))) return false;
    return true;
  } catch (error) {
    console.error('Erro ao imprimir cupom:', error);
    return false;
  }
}
```

- [x] **Step 4: Rodar testes**

```bash
npm test -- __tests__/services/PrinterService.test.ts
```

Expected: PASS (incluindo os já existentes).

- [x] **Step 5: Commit**

```bash
git add services/PrinterService.ts __tests__/services/PrinterService.test.ts
git commit -m "fix(printer): honor native false returns in printReceipt"
```

---

### Task 2: Permissões Bluetooth em runtime

**Files:**
- Modify: `services/PrinterService.ts`
- Modify: `__tests__/services/PrinterService.test.ts`
- Modify: `modules/zooloo-printer/android/src/main/AndroidManifest.xml`
- Modify: `app/(tabs)/configuracoes.tsx` (chamar ensurePermissions ao carregar)

**Interfaces:**
- Produces:
  - `PrinterService.ensureBluetoothPermissions(): Promise<boolean>`
  - `getPairedDevices` / `connect` chamam ensure antes de operar

**Comportamento:**
- Android API ≥ 31: pedir `BLUETOOTH_CONNECT` (e `BLUETOOTH_SCAN` só se for necessário listar; bonded devices exigem CONNECT).
- Android < 31: permissões legacy já no manifest; retornar `true`.
- iOS/web: retornar `true` (sem BT real) ou `false` no Android se negado.

- [x] **Step 1: Testes com mock de PermissionsAndroid / Platform**

```ts
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: { OS: 'android', Version: 33 },
    PermissionsAndroid: {
      PERMISSIONS: {
        BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
        BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
      },
      RESULTS: { GRANTED: 'granted', DENIED: 'denied' },
      requestMultiple: jest.fn(),
    },
  };
});

it('retorna false se permissão Bluetooth for negada', async () => {
  (PermissionsAndroid.requestMultiple as jest.Mock).mockResolvedValue({
    'android.permission.BLUETOOTH_CONNECT': 'denied',
  });
  expect(await PrinterService.ensureBluetoothPermissions()).toBe(false);
});
```

- [x] **Step 2: Implementar `ensureBluetoothPermissions`**

```ts
import { PermissionsAndroid, Platform } from 'react-native';

static async ensureBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  if (typeof Platform.Version === 'number' && Platform.Version < 31) return true;
  const result = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
  ]);
  return (
    result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
    PermissionsAndroid.RESULTS.GRANTED
  );
}
```

- [x] **Step 3: Guardas em `getPairedDevices` e `connect`**

Se permissão falhar: retornar `[]` / `false` e logar (UI em configuracoes já alerta lista vazia; melhorar mensagem se possível).

- [x] **Step 4: Manifest — marcar scan como neverForLocation (quando aplicável)**

Em `AndroidManifest.xml` do módulo:

```xml
<uses-permission
  android:name="android.permission.BLUETOOTH_SCAN"
  android:usesPermissionFlags="neverForLocation" />
```

(Se `usesPermissionFlags` exigir `tools:targetApi`, adicionar namespace tools.)

- [x] **Step 5: Em `configuracoes.tsx`, no `loadDevices`, chamar `ensureBluetoothPermissions` primeiro e Alert se negado**

```ts
const ok = await PrinterService.ensureBluetoothPermissions();
if (!ok) {
  Alert.alert(
    'Permissão necessária',
    'Ative a permissão de Bluetooth para listar e conectar impressoras.'
  );
  setDevices([]);
  return;
}
```

- [x] **Step 6: Testes + commit**

```bash
npm test -- __tests__/services/PrinterService.test.ts
git add services/PrinterService.ts __tests__/services/PrinterService.test.ts \
  modules/zooloo-printer/android/src/main/AndroidManifest.xml \
  app/\(tabs\)/configuracoes.tsx
git commit -m "fix(printer): request Bluetooth permissions at runtime"
```

---

### Task 3: Persistência da impressora preferida + reconexão

**Files:**
- Modify: `services/PrinterService.ts`
- Modify: `__tests__/services/PrinterService.test.ts`
- Modify: `app/(tabs)/configuracoes.tsx`

**Interfaces:**
- Produces:
  - `PrinterService.savePreferredPrinter(device: { name: string; macAddress: string }): Promise<void>`
  - `PrinterService.getPreferredPrinter(): Promise<{ name: string; macAddress: string } | null>`
  - `PrinterService.clearPreferredPrinter(): Promise<void>`
  - `PrinterService.ensureConnected(): Promise<boolean>` — reconecta ao MAC preferido se necessário
- Storage key: `@zooloo/printer.preferred` (JSON `{ name, macAddress }`)

- [x] **Step 1: Testes de persistência com mock AsyncStorage**

```ts
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

it('salva e recupera impressora preferida', async () => {
  await PrinterService.savePreferredPrinter({
    name: 'MTP-II',
    macAddress: '00:11:22:33:44:55',
  });
  await expect(PrinterService.getPreferredPrinter()).resolves.toEqual({
    name: 'MTP-II',
    macAddress: '00:11:22:33:44:55',
  });
});
```

- [x] **Step 2: Implementar save/get/clear com AsyncStorage**

- [x] **Step 3: Em `connect` bem-sucedido, opcionalmente aceitar `name` e salvar preferida**

Assinatura preferida:

```ts
static async connect(macAddress: string, name?: string): Promise<boolean>
```

Se `success && name`, chamar `savePreferredPrinter`.

- [x] **Step 4: Adicionar `isConnected` nativo (mínimo) + `ensureConnected`**

Bridge:

```ts
// ZoolooPrinterModule.ts
isConnected(): Promise<boolean>;
```

Kotlin:

```kotlin
fun isConnected(): Boolean {
  return bluetoothSocket?.isConnected == true && outputStream != null
}
```

JS:

```ts
static async ensureConnected(): Promise<boolean> {
  if (!(await PrinterService.ensureBluetoothPermissions())) return false;
  try {
    if (await ZoolooPrinterModule.isConnected()) return true;
  } catch { /* web stub */ }
  const preferred = await PrinterService.getPreferredPrinter();
  if (!preferred) return false;
  return PrinterService.connect(preferred.macAddress, preferred.name);
}
```

- [x] **Step 5: `configuracoes.tsx` — ao montar, restaurar `connectedDevice` se preferida existir e `ensureConnected`**

- [x] **Step 6: Testes + commit**

```bash
npm test -- __tests__/services/PrinterService.test.ts
git commit -m "feat(printer): persist preferred printer and reconnect"
```

---

### Task 4: Robustez nativa Bluetooth (disconnect, encoding, cut, buffer)

**Files:**
- Modify: `modules/zooloo-printer/android/.../PrinterManager.kt`
- Modify: `modules/zooloo-printer/android/.../ZoolooPrinterModule.kt`
- Modify: `modules/zooloo-printer/src/ZoolooPrinterModule.ts`
- Modify: `services/PrinterService.ts`
- Modify: `__tests__/services/PrinterService.test.ts`

**Comportamentos nativos:**

1. **`connect`:** chamar `disconnect()` no início para evitar socket órfão.
2. **Encoding:** escrever texto em `Charset.forName("ISO-8859-1")` (compatível com a maioria das ESC/POS BR); manter fallback UTF-8 se charset indisponível.
3. **`printReceipt` no nativo OU batch no service:** preferir um método `printLines(lines: List<String>): Boolean` que:
   - ESC @ reset
   - junta linhas com `\n`
   - feed `\n\n\n`
   - cut parcial `GS V 0` = `[0x1D, 0x56, 0x00]` (ignorar falha do cut se impressora não suportar — se write do cut falhar, ainda considerar sucesso se o texto saiu? **Decisão:** cut best-effort: falha do cut não falha o cupom se o texto imprimiu).
4. Expor `printLines` e `isConnected` no Module.

- [x] **Step 1: Atualizar tipos TS**

```ts
declare class ZoolooPrinterModule extends NativeModule {
  getPairedDevices(): Promise<BluetoothDevice[]>;
  connect(macAddress: string): Promise<boolean>;
  disconnect(): Promise<boolean>;
  isConnected(): Promise<boolean>;
  printText(text: string): Promise<boolean>;
  printCommand(command: number[]): Promise<boolean>;
  printLines(lines: string[]): Promise<boolean>;
}
```

- [x] **Step 2: Implementar Kotlin**

```kotlin
fun connect(macAddress: String): Boolean {
  disconnect()
  // ... existing connect body
}

fun printText(text: String): Boolean {
  return try {
    if (outputStream == null) return false
    val charset = try { charset("ISO-8859-1") } catch (_: Exception) { Charsets.UTF_8 }
    outputStream?.write(text.toByteArray(charset))
    outputStream?.flush()
    true
  } catch (e: IOException) {
    e.printStackTrace()
    false
  }
}

fun printLines(lines: List<String>): Boolean {
  if (outputStream == null) return false
  if (!printCommand(byteArrayOf(0x1B, 0x40))) return false
  val body = lines.joinToString("\n", postfix = "\n\n\n")
  if (!printText(body)) return false
  // best-effort partial cut
  printCommand(byteArrayOf(0x1D, 0x56, 0x00))
  return true
}
```

- [x] **Step 3: `PrinterService.printReceipt` passa a preferir `printLines` se existir, senão fallback loop**

```ts
static async printReceipt(lines: string[]): Promise<boolean> {
  try {
    if (typeof ZoolooPrinterModule.printLines === 'function') {
      return await ZoolooPrinterModule.printLines(lines);
    }
    // fallback legado...
  } catch (error) {
    console.error('Erro ao imprimir cupom:', error);
    return false;
  }
}
```

- [x] **Step 4: Testes mockando `printLines`**

```ts
it('usa printLines quando disponível', async () => {
  (ZoolooPrinterModule as any).printLines = jest.fn().mockResolvedValue(true);
  const ok = await PrinterService.printReceipt(['A']);
  expect(ok).toBe(true);
  expect((ZoolooPrinterModule as any).printLines).toHaveBeenCalledWith(['A']);
});
```

- [x] **Step 5: Rebuild Android (mudança nativa)**

```bash
npx expo run:android
```

- [x] **Step 6: Commit**

```bash
git commit -m "fix(printer): harden native BT connect, ISO-8859-1, printLines+cut"
```

---

### Task 5: Stub web + limpeza de scaffold morto

**Files:**
- Modify: `modules/zooloo-printer/src/ZoolooPrinterModule.web.ts`
- Modify: `modules/zooloo-printer/expo-module.config.json` (remover apple se não houver iOS, ou manter e documentar)
- Optional delete/leave: `ZoolooPrinterView*.tsx/kt` — se View não está no ModuleDefinition, remover exports mortos **ou** deixar mas não importar no app

**Interfaces web (mesma API, falha controlada):**

```ts
class ZoolooPrinterModule extends NativeModule<ZoolooPrinterModuleEvents> {
  async getPairedDevices() { return []; }
  async connect(_mac: string) { return false; }
  async disconnect() { return true; }
  async isConnected() { return false; }
  async printText(_text: string) { return false; }
  async printCommand(_cmd: number[]) { return false; }
  async printLines(_lines: string[]) { return false; }
}
```

- [x] **Step 1: Implementar stub web**
- [x] **Step 2: Ajustar `expo-module.config.json` para `platforms: ["android", "web"]` se não houver pasta `ios/`**
- [x] **Step 3: Garantir que app não importa `ZoolooPrinterView`**
- [x] **Step 4: Commit**

```bash
git commit -m "fix(printer): complete web stub and trim unused view scaffolding"
```

---

### Task 6: Integrar bilhete real (`PuleTermica` → PrinterService)

**Files:**
- Modify: `components/PuleTermica.tsx`
- Create (opcional): `utils/comprovanteLines.ts` se quiser extrair helper
- Test: se houver testes de componente; senão teste unitário do helper de linhas

**Comportamento:**
1. Extrair `gerarLinhasComprovante(data): string[]` (hoje `gerarTextoComprovante` faz `join('\n')` — manter texto e linhas).
2. `handleImprimir`:
   - web: `window.print` / Share
   - android: `ensureConnected()` → se false, Alert pedindo configurar em Ajustes + opção Share
   - se conectado: `printReceipt(lines)` → Alert sucesso/erro
3. Manter botão WhatsApp inalterado.
4. Feedback de loading no botão enquanto imprime.

- [x] **Step 1: Extrair linhas**

```ts
export function gerarLinhasComprovante(data: BilheteRegistroResponse): string[] {
  // mover corpo atual de gerarTextoComprovante, return lines em vez de join
}

function gerarTextoComprovante(data: BilheteRegistroResponse): string {
  return gerarLinhasComprovante(data).join('\n');
}
```

- [x] **Step 2: handleImprimir Android**

```ts
const handleImprimir = async () => {
  const lines = gerarLinhasComprovante(data);
  const texto = lines.join('\n');

  if (Platform.OS === 'web') {
    // print window ou share
    return;
  }

  setPrinting(true);
  try {
    const connected = await PrinterService.ensureConnected();
    if (!connected) {
      Alert.alert(
        'Impressora não conectada',
        'Configure uma impressora em Ajustes ou compartilhe o comprovante.',
        [
          { text: 'Compartilhar', onPress: () => Share.share({ message: texto }) },
          { text: 'OK', style: 'cancel' },
        ]
      );
      return;
    }
    const ok = await PrinterService.printReceipt(lines);
    if (!ok) {
      Alert.alert('Erro', 'Falha ao imprimir. Verifique a impressora e tente novamente.');
      return;
    }
    Alert.alert('Sucesso', 'Comprovante enviado para a impressora.');
  } finally {
    setPrinting(false);
  }
};
```

- [x] **Step 3: Smoke manual checklist**
  - Ajustes: permissão → listar → conectar → teste
  - Aposta: imprimir comprovante na térmica
  - Sem impressora: Alert + Share

- [x] **Step 4: Commit**

```bash
git commit -m "feat(printer): print real ticket via PrinterService in PuleTermica"
```

---

### Task 7: UX de configurações (status, desconectar, teste honesto)

**Files:**
- Modify: `app/(tabs)/configuracoes.tsx`

**Melhorias:**
- Mostrar impressora preferida mesmo offline
- Botão Desconectar
- Teste de impressão usa `ensureConnected` + trata `false` de `printReceipt` (já parcialmente existe)
- Empty state com hint de permissão + pareamento Android

- [x] **Step 1: UI desconectar + preferida**
- [x] **Step 2: `handleTestPrint` usa `ensureConnected` e Alert de sucesso se `true`**
- [x] **Step 3: Commit**

```bash
git commit -m "feat(printer): improve settings UX for connect/disconnect/test"
```

---

## Fase 2 — Impressora interna da maquininha (CloudPOS)

### Task 8: Spike CloudPOS + contrato de adapter

**Files (investigação / possível create):**
- Create: `docs/design-docs/2026-08-04-cloudpos-printer.md` (notas do spike)
- Possibly create: `modules/zooloo-printer/android/.../CloudPosPrinter.kt`
- Modify: `PrinterManager` → facade que escolhe backend `bluetooth` | `cloudpos`

**Objetivo do spike (1–2h, sem falsa conclusão de “pronto”):**
1. Mapear no app-base: `e2/s.java` (`PrinterGrupoM`), `POSTerminal.getDevice(DeviceName.PRINTER)`, open/printText/close.
2. Listar artefatos necessários: `libjni_cloudpos_printer.so` (ABI), classes `com.cloudpos.*`, possível AAR oficial vs código decompilado (licença!).
3. Decidir: (A) AAR oficial do fabricante, (B) service AIDL do device, (C) adiar se só temos .so decompilado sem SDK limpo.
4. Definir API unificada:

```ts
// PrinterService
static async getAvailableBackends(): Promise<Array<'bluetooth' | 'internal'>>
static async printReceipt(lines: string[], options?: { backend?: 'auto' | 'bluetooth' | 'internal' }): Promise<boolean>
```

Auto: tenta `internal` se disponível no device, senão Bluetooth preferido.

- [x] **Step 1: Documentar achados do spike em markdown**
- [x] **Step 2: Se SDK viável — implementar `printInternal(lines)` nativo mínimo** — *N/A (SDK oficial ausente; ver Step 3)*
- [x] **Step 3: Se SDK inviável — stub `isInternalPrinterAvailable(): false` + `printInternal` + UI “indisponível neste build” + contrato `printReceipt(..., { backend })`**
- [x] **Step 4: Commit do que for real (sem half-SDK pirata)**

```bash
git commit -m "feat(printer): CloudPOS spike and internal printer adapter contract"
```

> **Gate:** não mergear CloudPOS com .so/classes decompiladas sem validação legal/SDK oficial.

---

## Fase 3 — Verificação final

### Task 9: Verification gate

**Files:** none (comandos)

- [x] **Step 1: Unit tests**

```bash
npm test -- __tests__/services/PrinterService.test.ts
```

Expected: all green.

- [x] **Step 2: Lint**

```bash
npm run lint
```

- [ ] **Step 3: Dev build Android**

```bash
npx expo run:android
```

- [ ] **Step 4: Checklist manual em device físico**

| Cenário | Esperado |
|---------|----------|
| Negar permissão BT | Alert; lista vazia |
| Conceder permissão + pareado | Lista dispositivos |
| Conectar + cupom teste | Imprime com acentos ok |
| Matar app e reabrir | Reconecta preferida / allow ensureConnected |
| Imprimir bilhete pós-aposta | Imprime na térmica |
| Sem impressora | Alert + Share |
| Web | Não crasha; fallback print/share |

- [x] **Step 5: Atualizar roadmap se existir checkbox da Fase 3 impressão**

Arquivos: `docs/exec-plans/roadmap.md`, `docs/exec-plans/completed/fase-2-aposta-bicho.md` (marcar o que saiu de “Share only”).

---

## Ordem de execução e dependências

```text
Task 1 (printReceipt truth)
  → Task 2 (permissions)
  → Task 3 (persist + ensureConnected)  [precisa isConnected nativo mínimo]
  → Task 4 (native harden + printLines) [pode fundir isConnected da Task 3 se preferir]
  → Task 5 (web stub)
  → Task 6 (PuleTermica)  [depende 1–3]
  → Task 7 (settings UX)
  → Task 8 (CloudPOS spike)  [paralelo após 4 se outro dev]
  → Task 9 (verify)
```

**Nota de fusão:** Tasks 3 e 4 tocam o módulo nativo; se um único dev, implementar `isConnected` + disconnect-before-connect + encoding + `printLines` num único rebuild Android.

---

## Cobertura dos achados da análise

| Achado | Task |
|--------|------|
| printReceipt retorna true com falha | 1 |
| Sem permissão runtime Android 12+ | 2 |
| Sem persistência MAC / reconnect | 3 |
| Socket órfão no reconnect | 4 |
| UTF-8 / acentos | 4 |
| Falta cut / muitos round-trips | 4 |
| Stub web incompleto | 5 |
| Scaffold View morto / apple sem iOS | 5 |
| PuleTermica usa Share | 6 |
| UX settings incompleta | 7 |
| Maquininha interna CloudPOS | 8 |
| Como validar no device | 9 |

---

## Fora de escopo (proposital)

- Portar 21 drivers de marca do app-base
- QR/barcode nativos no cupom (pode ser task futura)
- iOS Bluetooth printing
- Expo Go com módulo nativo (impossível; sempre dev client)

---

## Self-review

1. **Spec coverage:** Todos os bugs/pendências da análise têm task.
2. **Placeholders:** Nenhum TBD operacional; CloudPOS tem gate explícito de SDK.
3. **Tipos:** `BluetoothDevice`, `printLines`, `isConnected`, `ensureConnected`, `savePreferredPrinter` consistentes entre tasks.
4. **TDD:** Tasks de serviço começam com teste; nativo validado por rebuild + checklist (sem JVM unit test do Kotlin neste plano).
