/** Valida se o palpite tem exatamente a quantidade de dígitos numéricos exigida pela modalidade. */
export const validarMilhar = (palpite: string, digitos = 4): boolean => {
  if (!Number.isInteger(digitos) || digitos <= 0) return false;
  return new RegExp(`^\\d{${digitos}}$`).test(palpite);
};

export const calcularTotalAposta = (
  valor: number,
  colocacaoInicial: number,
  colocacaoFinal: number,
  bitT_rateado: boolean
): number => {
  if (valor <= 0) return 0;
  if (colocacaoInicial > colocacaoFinal) return 0;

  const qtdPremios = colocacaoFinal - colocacaoInicial + 1;

  if (bitT_rateado) {
    // Se for rateado, o valor total do item é exatamente o valor digitado.
    return valor;
  } else {
    // Se for 'Por Cada', o valor total é o valor multiplicado pela quantidade de prêmios.
    return valor * qtdPremios;
  }
};

export const parsePalpitesPosicionais = (palpites: string[]): string => {
  // O backend espera a string separada por vírgula. 
  // Na Fase 0 confirmaremos se existem zeros à esquerda ou outros paddings.
  // Por enquanto (MVP Milhar), unimos com vírgula.
  return palpites.join(',');
};

/** Retorna a data atual no fuso horário local no formato YYYY-MM-DD (evitando timezone skew do toISOString). */
export const getHojeLocalDate = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
