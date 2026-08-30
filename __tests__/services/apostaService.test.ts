import { ApostaService } from '../../services/apostaService';
import { apiCall } from '../../services/apiClient';

jest.mock('../../services/apiClient', () => ({
  apiCall: jest.fn(),
}));

describe('ApostaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listarModalidades', () => {
    it('deve chamar apiCall com os parametros corretos para filtro_banca = 1 por padrao', async () => {
      const mockBackendData = [
        {
          modalidade_id: 2,
          jogo_id: 2,
          apresentacao: 'MILHAR',
          abreviacao: 'M',
          tamanho_max: 4,
          ativo: 'S',
        },
        {
          modalidade_id: 4,
          jogo_id: 4,
          apresentacao: 'CENTENA',
          abreviacao: 'C',
          tamanho_max: 3,
          ativo: 'N',
        },
      ];

      (apiCall as jest.Mock).mockResolvedValueOnce(mockBackendData);

      const result = await ApostaService.listarModalidades(1);

      expect(apiCall).toHaveBeenCalledWith({
        class: 'ModalidadeRestService',
        method: 'listar',
        data: { filtro_banca: 1 },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 2,
          nome: 'MILHAR',
          sigla: 'M',
          digitos: 4,
          ativa: true,
          modalidade_id: 2,
          jogo_id: 2,
          filtro_banca: 1,
        }),
      );
      expect(result[1]).toEqual(
        expect.objectContaining({
          id: 4,
          nome: 'CENTENA',
          sigla: 'C',
          digitos: 3,
          ativa: false,
          modalidade_id: 4,
          jogo_id: 4,
          filtro_banca: 1,
        }),
      );
    });

    it('deve extrair data caso a api retorne dentro do envelope data', async () => {
      const mockBackendEnvelope = {
        data: [
          {
            id: 6,
            nome: 'GRUPO',
            sigla: 'G',
            digitos: 2,
            ativa: true,
          },
        ],
      };

      (apiCall as jest.Mock).mockResolvedValueOnce(mockBackendEnvelope);

      const result = await ApostaService.listarModalidades(1);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(6);
      expect(result[0].nome).toBe('GRUPO');
      expect(result[0].sigla).toBe('G');
      expect(result[0].digitos).toBe(2);
      expect(result[0].ativa).toBe(true);
    });

    it('deve lidar com resposta vazia graciosamente', async () => {
      (apiCall as jest.Mock).mockResolvedValueOnce({ data: null });

      const result = await ApostaService.listarModalidades(1);

      expect(result).toEqual([]);
    });
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
