import { registerWebModule, NativeModule } from 'expo';

import { ZoolooPrinterModuleEvents } from './ZoolooPrinter.types';
import type { BluetoothDevice } from './ZoolooPrinterModule';

class ZoolooPrinterModule extends NativeModule<ZoolooPrinterModuleEvents> {
  async getPairedDevices(): Promise<BluetoothDevice[]> {
    return [];
  }

  async connect(_macAddress: string): Promise<boolean> {
    return false;
  }

  async disconnect(): Promise<boolean> {
    return true;
  }

  async isConnected(): Promise<boolean> {
    return false;
  }

  async printText(_text: string): Promise<boolean> {
    return false;
  }

  async printCommand(_command: number[]): Promise<boolean> {
    return false;
  }

  async printLines(_lines: string[]): Promise<boolean> {
    return false;
  }
}

export default registerWebModule(ZoolooPrinterModule, 'ZoolooPrinterModule');
