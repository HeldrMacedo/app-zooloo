import ZoolooPrinterModule, { BluetoothDevice } from '../modules/zooloo-printer';

export class PrinterService {
  /**
   * Obtém a lista de dispositivos Bluetooth pareados
   */
  static async getPairedDevices(): Promise<BluetoothDevice[]> {
    try {
      return await ZoolooPrinterModule.getPairedDevices();
    } catch (error) {
      console.error('Erro ao buscar dispositivos pareados:', error);
      return [];
    }
  }

  /**
   * Conecta a uma impressora Bluetooth através do MAC Address
   */
  static async connect(macAddress: string): Promise<boolean> {
    try {
      return await ZoolooPrinterModule.connect(macAddress);
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
   * Imprime um cupom simulado, usando formatação simples ESC/POS
   */
  static async printReceipt(lines: string[]): Promise<boolean> {
    try {
      // ESC/POS Reset
      await ZoolooPrinterModule.printCommand([0x1B, 0x40]);
      
      for (const line of lines) {
        await ZoolooPrinterModule.printText(line + '\n');
      }

      // Feed paper
      await ZoolooPrinterModule.printText('\n\n\n');
      return true;
    } catch (error) {
      console.error('Erro ao imprimir cupom:', error);
      return false;
    }
  }
}
