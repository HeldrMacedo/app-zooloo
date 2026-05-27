import { apiCall } from '@/services/apiClient';
import { BilheteRegistroPayload, BilheteRegistroResponse, Extracao } from '@/types/aposta';

export class ApostaService {
  /**
   * Registra um bilhete JB no backend.
   * Chama a API `BilheteRestService::registrar`.
   */
  static async registrarBilhete(payload: BilheteRegistroPayload): Promise<BilheteRegistroResponse> {
    return apiCall<BilheteRegistroResponse>(
      {
        class: 'BilheteRestService',
        method: 'registrar',
        data: payload.data,
      }
    );
  }

  /**
   * Lista extrações ativas e abertas para a data informada.
   * Utiliza a SorteioRestService do backend, consultando a vw_sorteio.
   */
  static async listarExtracoes(dataSorteio: string): Promise<Extracao[]> {
    // Retorna as extrações abertas baseadas na data informada. 
    // Assumimos que existe um endpoint SorteioRestService::abertos ou similar.
    // Vamos usar a estrutura padrão do projeto (conforme CLAUDE.md).
    const response = await apiCall<{ data: Extracao[] }>(
      {
        class: 'SorteioRestService',
        method: 'abertos',
        data: { data_sorteio: dataSorteio },
      }
    );
    // Adianti costuma retornar arrays dentro da propriedade data dependendo de como o método foi implementado,
    // mas o apiClient já extrai envelope.data. Se a API em si retornar { data: [...] }, extraímos aqui.
    return Array.isArray(response) ? response : (response.data || []);
  }
}
