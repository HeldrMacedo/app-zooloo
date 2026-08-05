import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';
import { PrinterService } from '../../services/PrinterService';
import ZoolooPrinterModule from '../../modules/zooloo-printer';

jest.mock('../../modules/zooloo-printer', () => ({
  getPairedDevices: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  isConnected: jest.fn(),
  printText: jest.fn(),
  printCommand: jest.fn(),
  printLines: jest.fn(),
}));

describe('PrinterService', () => {
  const originalPlatform = { ...Platform };

  afterEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalPlatform.OS,
    });
    Object.defineProperty(Platform, 'Version', {
      configurable: true,
      value: originalPlatform.Version,
    });
  });

  beforeEach(async () => {
    await AsyncStorage.clear();
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'android',
    });
    Object.defineProperty(Platform, 'Version', {
      configurable: true,
      value: 33,
    });
    jest.spyOn(PermissionsAndroid, 'requestMultiple').mockResolvedValue({
      [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]: PermissionsAndroid.RESULTS.GRANTED,
      [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]: PermissionsAndroid.RESULTS.GRANTED,
    } as Awaited<ReturnType<typeof PermissionsAndroid.requestMultiple>>);
  });

  it('deve retornar a lista de dispositivos pareados', async () => {
    const mockDevices = [{ name: 'MOCK_PRINTER', macAddress: '00:11:22:33:44:55' }];
    (ZoolooPrinterModule.getPairedDevices as jest.Mock).mockResolvedValue(mockDevices);

    const devices = await PrinterService.getPairedDevices();
    expect(devices).toEqual(mockDevices);
    expect(ZoolooPrinterModule.getPairedDevices).toHaveBeenCalledTimes(1);
  });

  it('deve lidar com erro ao buscar dispositivos e retornar array vazio', async () => {
    (ZoolooPrinterModule.getPairedDevices as jest.Mock).mockRejectedValue(
      new Error('Bluetooth Error'),
    );

    const devices = await PrinterService.getPairedDevices();
    expect(devices).toEqual([]);
  });

  it('retorna false se permissão Bluetooth for negada', async () => {
    (PermissionsAndroid.requestMultiple as jest.Mock).mockResolvedValue({
      [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]: PermissionsAndroid.RESULTS.DENIED,
      [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]: PermissionsAndroid.RESULTS.DENIED,
    });

    await expect(PrinterService.ensureBluetoothPermissions()).resolves.toBe(false);
  });

  it('não lista dispositivos se permissão for negada', async () => {
    (PermissionsAndroid.requestMultiple as jest.Mock).mockResolvedValue({
      [PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]: PermissionsAndroid.RESULTS.DENIED,
    });

    const devices = await PrinterService.getPairedDevices();
    expect(devices).toEqual([]);
    expect(ZoolooPrinterModule.getPairedDevices).not.toHaveBeenCalled();
  });

  it('deve conectar a uma impressora corretamente', async () => {
    (ZoolooPrinterModule.connect as jest.Mock).mockResolvedValue(true);

    const success = await PrinterService.connect('00:11:22:33:44:55', 'MTP-II');
    expect(success).toBe(true);
    expect(ZoolooPrinterModule.connect).toHaveBeenCalledWith('00:11:22:33:44:55');
    await expect(PrinterService.getPreferredPrinter()).resolves.toEqual({
      name: 'MTP-II',
      macAddress: '00:11:22:33:44:55',
    });
  });

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

  it('ensureConnected reconecta à preferida quando desconectado', async () => {
    await PrinterService.savePreferredPrinter({
      name: 'MTP-II',
      macAddress: '00:11:22:33:44:55',
    });
    (ZoolooPrinterModule.isConnected as jest.Mock).mockResolvedValue(false);
    (ZoolooPrinterModule.connect as jest.Mock).mockResolvedValue(true);

    const ok = await PrinterService.ensureConnected();
    expect(ok).toBe(true);
    expect(ZoolooPrinterModule.connect).toHaveBeenCalledWith('00:11:22:33:44:55');
  });

  it('ensureConnected retorna true se já estiver conectado', async () => {
    (ZoolooPrinterModule.isConnected as jest.Mock).mockResolvedValue(true);

    const ok = await PrinterService.ensureConnected();
    expect(ok).toBe(true);
    expect(ZoolooPrinterModule.connect).not.toHaveBeenCalled();
  });

  it('deve formatar e imprimir um cupom básico via printLines', async () => {
    (ZoolooPrinterModule.printLines as jest.Mock).mockResolvedValue(true);

    const lines = ['Zooloo Bet', 'Bilhete: 12345'];
    const success = await PrinterService.printReceipt(lines);

    expect(success).toBe(true);
    expect(ZoolooPrinterModule.printLines).toHaveBeenCalledWith(lines);
  });

  it('fallback legado: retorna false se printCommand falhar', async () => {
    delete (ZoolooPrinterModule as { printLines?: unknown }).printLines;
    (ZoolooPrinterModule.printCommand as jest.Mock).mockResolvedValue(false);
    (ZoolooPrinterModule.printText as jest.Mock).mockResolvedValue(true);

    const ok = await PrinterService.printReceipt(['Linha']);
    expect(ok).toBe(false);
  });

  it('fallback legado: retorna false se algum printText falhar', async () => {
    delete (ZoolooPrinterModule as { printLines?: unknown }).printLines;
    (ZoolooPrinterModule.printCommand as jest.Mock).mockResolvedValue(true);
    (ZoolooPrinterModule.printText as jest.Mock)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const ok = await PrinterService.printReceipt(['A', 'B']);
    expect(ok).toBe(false);
  });

  it('fallback legado: imprime cupom com reset e feed', async () => {
    delete (ZoolooPrinterModule as { printLines?: unknown }).printLines;
    (ZoolooPrinterModule.printCommand as jest.Mock).mockResolvedValue(true);
    (ZoolooPrinterModule.printText as jest.Mock).mockResolvedValue(true);

    const lines = ['Zooloo Bet', 'Bilhete: 12345'];
    const success = await PrinterService.printReceipt(lines);

    expect(success).toBe(true);
    expect(ZoolooPrinterModule.printCommand).toHaveBeenCalledWith([0x1b, 0x40]);
    expect(ZoolooPrinterModule.printText).toHaveBeenCalledWith('Zooloo Bet\n');
    expect(ZoolooPrinterModule.printText).toHaveBeenCalledWith('Bilhete: 12345\n');
    expect(ZoolooPrinterModule.printText).toHaveBeenCalledWith('\n\n\n');
  });

  it('backends: sem CloudPOS reporta apenas bluetooth', async () => {
    await expect(PrinterService.isInternalPrinterAvailable()).resolves.toBe(false);
    await expect(PrinterService.getAvailableBackends()).resolves.toEqual(['bluetooth']);
  });
});
