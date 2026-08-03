import { registerWebModule, NativeModule } from 'expo';

import { ZoolooPrinterModuleEvents } from './ZoolooPrinter.types';

class ZoolooPrinterModule extends NativeModule<ZoolooPrinterModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ZoolooPrinterModule, 'ZoolooPrinterModule');
