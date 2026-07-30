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

export interface BilheteRegistroResponse {
  jb_id: number;
  bilhete_numero: number;
  string_autorizacao: string;
  total_bilhete: number;
  data_hora: string;
  vendedor_nome: string;
}
