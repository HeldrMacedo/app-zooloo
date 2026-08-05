import { NativeModule, requireNativeModule } from 'expo';

export type BluetoothDevice = {
  name: string;
  macAddress: string;
};

declare class ZoolooPrinterModule extends NativeModule {
  getPairedDevices(): Promise<BluetoothDevice[]>;
  connect(macAddress: string): Promise<boolean>;
  disconnect(): Promise<boolean>;
  isConnected(): Promise<boolean>;
  printText(text: string): Promise<boolean>;
  printCommand(command: number[]): Promise<boolean>;
  printLines(lines: string[]): Promise<boolean>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ZoolooPrinterModule>('ZoolooPrinter');
