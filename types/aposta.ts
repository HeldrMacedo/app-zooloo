export interface Modalidade {
  id: number;
  nome: string;
  sigla: string;
  digitos: number;
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
