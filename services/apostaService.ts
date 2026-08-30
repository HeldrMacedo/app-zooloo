import { apiCall } from '@/services/apiClient';
import { BilheteRegistroPayload, BilheteRegistroResponse, Extracao, Modalidade } from '@/types/aposta';

export class ApostaService {
  /**
   * Lista as modalidades cadastradas no backend.
   * Filtra por filtro_banca (1 = Jogo do Bicho, 2 = Quininha, 3 = Seninha, 4 = Lotinha).
   * Consulta a API `ModalidadeRestService::listar`.
   */
  static async listarModalidades(filtroBanca: number = 1): Promise<Modalidade[]> {
    const response = await apiCall<{ data: Record<string, unknown>[] } | Record<string, unknown>[]>(
      {
        class: 'ModalidadeRestService',
        method: 'listar',
        data: { filtro_banca: filtroBanca },
      }
    );

    const rawList: Record<string, unknown>[] = Array.isArray(response)
      ? response
      : ((response as { data: Record<string, unknown>[] }).data || []);

    return rawList.map((item) => {
      const id = Number(item.id ?? item.modalidade_id ?? 0);
      const nome = String(item.nome ?? item.apresentacao ?? item.descricao ?? '');
      const sigla = String(item.sigla ?? item.abreviacao ?? '');
      const digitos = Number(item.digitos ?? item.tamanho_max ?? 0);

      const isAtiva =
        item.ativa !== undefined
          ? Boolean(item.ativa)
          : item.ativo !== undefined
            ? item.ativo === 'S' || item.ativo === true || item.ativo === 1 || item.ativo === '1'
            : true;

      return {
        id,
        nome,
        sigla,
        digitos,
        ativa: isAtiva,
        modalidade_id: item.modalidade_id !== undefined ? Number(item.modalidade_id) : id,
        jogo_id: item.jogo_id !== undefined ? Number(item.jogo_id) : undefined,
        filtro_banca: item.filtro_banca !== undefined ? Number(item.filtro_banca) : filtroBanca,
        apresentacao: item.apresentacao ? String(item.apresentacao) : nome,
        abreviacao: item.abreviacao ? String(item.abreviacao) : sigla,
        tamanho_max: item.tamanho_max !== undefined ? Number(item.tamanho_max) : digitos,
        qtd_colocacao_premio:
          item.qtd_colocacao_premio !== undefined ? Number(item.qtd_colocacao_premio) : undefined,
        multiplicador: item.multiplicador !== undefined ? Number(item.multiplicador) : undefined,
        ordem: item.ordem !== undefined ? Number(item.ordem) : undefined,
        ativo: item.ativo !== undefined ? (item.ativo as string | boolean) : isAtiva ? 'S' : 'N',
      };
    });
  }
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
