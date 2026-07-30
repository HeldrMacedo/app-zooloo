import { ApostaService } from '../../services/apostaService';
import { apiCall } from '../../services/apiClient';

jest.mock('../../services/apiClient', () => ({
  apiCall: jest.fn(),
}));

describe('ApostaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registrarBilhete', () => {
    it('deve chamar apiCall com os parametros corretos', async () => {
      const mockPayload = {
        data: {
          terminal_id: 1,
          jogos: [
            {
              sorteio_id: 10,
              modalidade_id: 2,
              palpites: ['1234'],
              colocacao_inicial: 1,
              colocacao_final: 5,
              valor_palpite: 5.0,
            }
          ]
        }
      };

      const mockResponse = {
        jb_id: 100,
        bilhete_numero: 123456,
        string_autorizacao: 'hash123',
        total_bilhete: 25.0,
        data_hora: '2023-10-10 10:00:00',
        vendedor_nome: 'Vendedor Teste'
      };

      (apiCall as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await ApostaService.registrarBilhete(mockPayload);

      expect(apiCall).toHaveBeenCalledWith({
        class: 'BilheteRestService',
        method: 'registrar',
        data: mockPayload.data,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listarExtracoes', () => {
    it('deve chamar apiCall e retornar as extracoes', async () => {
      const mockDataSorteio = '2023-10-10';
      const mockResponse = [
        { sorteio_id: 8, extracao_id: 6, descricao: 'CM 17:00', descricao_mobile: 'CM 17:00', hora_limite: '17:00:00' }
      ];

      // O service simula o retorno envelopado ou array direto
      (apiCall as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await ApostaService.listarExtracoes(mockDataSorteio);

      expect(apiCall).toHaveBeenCalledWith({
        class: 'SorteioRestService',
        method: 'abertos',
        data: { data_sorteio: mockDataSorteio },
      });
      expect(result).toEqual(mockResponse);
    });

    it('deve extrair data caso a api retorne num envelope', async () => {
      const mockDataSorteio = '2023-10-10';
      const mockResponseData = [
        { sorteio_id: 8, extracao_id: 6, descricao: 'CM 17:00', descricao_mobile: 'CM 17:00', hora_limite: '17:00:00' }
      ];

      (apiCall as jest.Mock).mockResolvedValueOnce({ data: mockResponseData });

      const result = await ApostaService.listarExtracoes(mockDataSorteio);

      expect(result).toEqual(mockResponseData);
    });
  });
});
