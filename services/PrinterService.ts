import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';
import ZoolooPrinterModule, { BluetoothDevice } from '../modules/zooloo-printer';

const PREFERRED_PRINTER_KEY = '@zooloo/printer.preferred';

export type PreferredPrinter = {
  name: string;
  macAddress: string;
};

export type PrinterBackend = 'bluetooth' | 'internal';

export class PrinterService {
  /**
   * Backends disponíveis neste build/device.
   * Internal (CloudPOS) só aparece quando o adapter nativo reportar suporte.
   */
  static async getAvailableBackends(): Promise<PrinterBackend[]> {
    const backends: PrinterBackend[] = ['bluetooth'];
    if (await PrinterService.isInternalPrinterAvailable()) {
      backends.push('internal');
    }
    return backends;
  }

  /**
   * Impressora embutida da maquininha (CloudPOS).
   * Stub: false até integração com SDK oficial (ver docs/superpowers/specs/2026-08-04-cloudpos-printer.md).
   */
  static async isInternalPrinterAvailable(): Promise<boolean> {
    try {
      const mod = ZoolooPrinterModule as {
        isInternalPrinterAvailable?: () => Promise<boolean>;
      };
      if (typeof mod.isInternalPrinterAvailable === 'function') {
        return await mod.isInternalPrinterAvailable();
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Solicita permissões Bluetooth em runtime (Android 12+).
   */
  static async ensureBluetoothPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    const apiLevel =
      typeof Platform.Version === 'number'
        ? Platform.Version
        : parseInt(String(Platform.Version), 10);

    if (!Number.isNaN(apiLevel) && apiLevel < 31) {
      return true;
    }

    try {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      ]);

      return (
        result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
        PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      console.error('Erro ao solicitar permissões Bluetooth:', error);
      return false;
    }
  }

  /**
   * Obtém a lista de dispositivos Bluetooth pareados
   */
  static async getPairedDevices(): Promise<BluetoothDevice[]> {
    try {
      if (!(await PrinterService.ensureBluetoothPermissions())) {
        return [];
      }
      return await ZoolooPrinterModule.getPairedDevices();
    } catch (error) {
      console.error('Erro ao buscar dispositivos pareados:', error);
      return [];
    }
  }

  /**
   * Conecta a uma impressora Bluetooth através do MAC Address.
   * Se `name` for informado e a conexão tiver sucesso, salva como preferida.
   */
  static async connect(macAddress: string, name?: string): Promise<boolean> {
    try {
      if (!(await PrinterService.ensureBluetoothPermissions())) {
        return false;
      }
      const success = await ZoolooPrinterModule.connect(macAddress);
      if (success && name) {
        await PrinterService.savePreferredPrinter({ name, macAddress });
      } else if (success) {
        const preferred = await PrinterService.getPreferredPrinter();
        if (!preferred || preferred.macAddress !== macAddress) {
          await PrinterService.savePreferredPrinter({
            name: preferred?.name || macAddress,
            macAddress,
          });
        }
      }
      return success;
    } catch (error) {
      console.error('Erro ao conectar com a impressora:', error);
      return false;
    }
  }

  /**
   * Desconecta da impressora atual
   */
  static async disconnect(): Promise<boolean> {
    try {
      return await ZoolooPrinterModule.disconnect();
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      return false;
    }
  }

  /**
   * Indica se o socket nativo ainda está aberto.
   */
  static async isConnected(): Promise<boolean> {
    try {
      if (typeof ZoolooPrinterModule.isConnected === 'function') {
        return await ZoolooPrinterModule.isConnected();
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar conexão da impressora:', error);
      return false;
    }
  }

  /**
   * Reconecta à impressora preferida se necessário.
   */
  static async ensureConnected(): Promise<boolean> {
    if (!(await PrinterService.ensureBluetoothPermissions())) {
      return false;
    }

    if (await PrinterService.isConnected()) {
      return true;
    }

    const preferred = await PrinterService.getPreferredPrinter();
    if (!preferred) {
      return false;
    }

    return PrinterService.connect(preferred.macAddress, preferred.name);
  }

  static async savePreferredPrinter(device: PreferredPrinter): Promise<void> {
    await AsyncStorage.setItem(PREFERRED_PRINTER_KEY, JSON.stringify(device));
  }

  static async getPreferredPrinter(): Promise<PreferredPrinter | null> {
    try {
      const raw = await AsyncStorage.getItem(PREFERRED_PRINTER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PreferredPrinter;
      if (!parsed?.macAddress) return null;
      return {
        name: parsed.name || parsed.macAddress,
        macAddress: parsed.macAddress,
      };
    } catch (error) {
      console.error('Erro ao ler impressora preferida:', error);
      return null;
    }
  }

  static async clearPreferredPrinter(): Promise<void> {
    await AsyncStorage.removeItem(PREFERRED_PRINTER_KEY);
  }

  /**
   * Envia texto para a impressora
   */
  static async printText(text: string): Promise<boolean> {
    try {
      return await ZoolooPrinterModule.printText(text);
    } catch (error) {
      console.error('Erro ao imprimir texto:', error);
      return false;
    }
  }

  /**
   * Imprime um cupom, usando formatação simples ESC/POS.
   * Retorna false se qualquer passo nativo falhar.
   */
  static async printReceipt(lines: string[]): Promise<boolean> {
    try {
      if (typeof ZoolooPrinterModule.printLines === 'function') {
        return await ZoolooPrinterModule.printLines(lines);
      }

      // Fallback legado (um write por linha)
      if (!(await ZoolooPrinterModule.printCommand([0x1b, 0x40]))) {
        return false;
      }

      for (const line of lines) {
        if (!(await ZoolooPrinterModule.printText(line + '\n'))) {
          return false;
        }
      }

      if (!(await ZoolooPrinterModule.printText('\n\n\n'))) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao imprimir cupom:', error);
      return false;
    }
  }
}
