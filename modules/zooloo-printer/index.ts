// Re-export the native module. On web, it will be resolved to ZoolooPrinterModule.web.ts
// and on native platforms to ZoolooPrinterModule.ts
export { default } from './src/ZoolooPrinterModule';
export * from './src/ZoolooPrinter.types';
