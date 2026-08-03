import { PrinterService } from '../../services/PrinterService';
import ZoolooPrinterModule from '../../modules/zooloo-printer';

// Mocking the native module
jest.mock('../../modules/zooloo-printer', () => ({
  getPairedDevices: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  printText: jest.fn(),
  printCommand: jest.fn(),
}));

describe('PrinterService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar a lista de dispositivos pareados', async () => {
    const mockDevices = [{ name: 'MOCK_PRINTER', macAddress: '00:11:22:33:44:55' }];
    (ZoolooPrinterModule.getPairedDevices as jest.Mock).mockResolvedValue(mockDevices);

    const devices = await PrinterService.getPairedDevices();
    expect(devices).toEqual(mockDevices);
    expect(ZoolooPrinterModule.getPairedDevices).toHaveBeenCalledTimes(1);
  });

  it('deve lidar com erro ao buscar dispositivos e retornar array vazio', async () => {
    (ZoolooPrinterModule.getPairedDevices as jest.Mock).mockRejectedValue(new Error('Bluetooth Error'));

    const devices = await PrinterService.getPairedDevices();
    expect(devices).toEqual([]);
  });

  it('deve conectar a uma impressora corretamente', async () => {
    (ZoolooPrinterModule.connect as jest.Mock).mockResolvedValue(true);

    const success = await PrinterService.connect('00:11:22:33:44:55');
    expect(success).toBe(true);
    expect(ZoolooPrinterModule.connect).toHaveBeenCalledWith('00:11:22:33:44:55');
  });

  it('deve formatar e imprimir um cupom básico chamando as funções do módulo nativo', async () => {
    (ZoolooPrinterModule.printCommand as jest.Mock).mockResolvedValue(true);
    (ZoolooPrinterModule.printText as jest.Mock).mockResolvedValue(true);

    const lines = ['Zooloo Bet', 'Bilhete: 12345'];
    const success = await PrinterService.printReceipt(lines);

    expect(success).toBe(true);
    // Verifica o comando ESC/POS de Reset
    expect(ZoolooPrinterModule.printCommand).toHaveBeenCalledWith([0x1b, 0x40]);
    // Verifica impressão de texto
    expect(ZoolooPrinterModule.printText).toHaveBeenCalledWith('Zooloo Bet\n');
    expect(ZoolooPrinterModule.printText).toHaveBeenCalledWith('Bilhete: 12345\n');
    // Verifica se alimentou o papel (Feed)
    expect(ZoolooPrinterModule.printText).toHaveBeenCalledWith('\n\n\n');
  });
});
