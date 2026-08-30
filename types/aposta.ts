export interface Modalidade {
  id: number;
  nome: string;
  sigla: string;
  digitos: number;
  ativa?: boolean;
  modalidade_id?: number;
  jogo_id?: number;
  filtro_banca?: number;
  apresentacao?: string;
  abreviacao?: string;
  tamanho_max?: number;
  qtd_colocacao_premio?: number;
  multiplicador?: number;
  ordem?: number;
  ativo?: string | boolean;
}

export interface ApostaItem {
  id_interno: string; // ID gerado localmente (ex: uuid) para controle no carrinho
  modalidade: Modalidade;
  palpites: string[]; // Array de strings com os palpites (ex: ['1234'])
  colocacao_inicial: number;
  colocacao_final: number;
  valor_palpite: number;
  total_item: number; // Calculado localmente para UX
  bitT_rateado: boolean; // false = 'Por Cada', true = 'Rateado'
}

export interface Extracao {
  sorteio_id: number;
  extracao_id: number;
  descricao: string;
  descricao_mobile: string;
  hora_limite: string;
  selecionada?: boolean; // Controle na UI do Preview
}

export interface JogoPayload {
  sorteio_id: number;
  modalidade_id: number;
  palpites: string[];
  colocacao_inicial: number;
  colocacao_final: number;
  valor_palpite: number;
}

export interface BilheteRegistroPayload {
  data: {
    terminal_id: number;
    nome_cliente?: string;
    fone_cliente?: string;
    jogos: JogoPayload[];
  };
}

export interface SorteioDetalhe {
  jb_sorteio_id: number;
  sorteio_id: number;
  sorteio_numero?: number;
  data_sorteio?: string;
  extracao_descricao: string;
  modalidade_id: number;
  modalidade_apresentacao: string;
  palpites: string[];
  colocao_inicial: number;
  colocao_final: number;
  valor_palpites: number;
  total_sorteio: number;
  sorteado?: string;
  sorteado_valor?: number;
  previsao_premio?: number;
}

export interface BilheteRegistroResponse {
  jb_id: number;
  bilhete_numero: number;
  string_autorizacao: string;
  total_bilhete: number;
  data_hora: string;
  vendedor_nome: string;
  area_descricao?: string;
  nome_cliente?: string;
  fone_cliente?: string;
  terminal_id?: number | string;
  sorteios?: SorteioDetalhe[];
}

/**
 * Contrato dos params do fluxo de aposta (modalidades → milhar → premios).
 *
 * Todos os valores são `string` porque o Expo Router serializa params na URL.
 * Use os helpers de `@/utils/routeParams` para converter com segurança.
 */
/**
 * `type` (nao `interface`) porque o Expo Router exige compatibilidade com
 * `UnknownOutputParams` (`Record<string, string | string[]>`), e interfaces nao
 * ganham index signature implicita em TypeScript.
 *
 * Os valores sao `string | string[]`: o router devolve array quando a mesma
 * chave aparece repetida na URL. Use os helpers de `@/utils/routeParams`.
 */
export type MilharRouteParams = {
  modalidadeId: string | string[];
  modalidadeNome: string | string[];
  modalidadeSigla: string | string[];
  digitos: string | string[];
};

export type PremiosRouteParams = MilharRouteParams & {
  /** Array de palpites serializado como JSON. */
  palpites: string | string[];
};
