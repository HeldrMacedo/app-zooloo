import { validarMilhar, calcularTotalAposta, parsePalpitesPosicionais, getHojeLocalDate, montarJogosPayload } from '../../utils/apostaHelpers';
import type { ApostaItem } from '../../types/aposta';

describe('apostaHelpers', () => {
  describe('validarMilhar', () => {
    it('deve retornar true para strings de 4 digitos numericos', () => {
      expect(validarMilhar('0000')).toBe(true);
      expect(validarMilhar('1234')).toBe(true);
      expect(validarMilhar('9999')).toBe(true);
    });

    it('deve retornar false para strings que não tem 4 digitos', () => {
      expect(validarMilhar('123')).toBe(false);
      expect(validarMilhar('12345')).toBe(false);
      expect(validarMilhar('')).toBe(false);
    });

    it('deve retornar false para strings não numericas', () => {
      expect(validarMilhar('12a4')).toBe(false);
      expect(validarMilhar('abcd')).toBe(false);
    });

    it('deve validar conforme a quantidade de digitos da modalidade', () => {
      expect(validarMilhar('123', 3)).toBe(true);   // Centena
      expect(validarMilhar('12', 2)).toBe(true);    // Dezena / Grupo
      expect(validarMilhar('1234', 3)).toBe(false);
      expect(validarMilhar('1', 2)).toBe(false);
      expect(validarMilhar('1234', 4)).toBe(true);  // Milhar
    });
  });

  describe('calcularTotalAposta', () => {
    it('deve calcular corretamente para valor Por Cada (bitT = false)', () => {
      // 1 premio (ex: 1 ao 1)
      expect(calcularTotalAposta(5.00, 1, 1, false)).toBe(5.00);
      // 5 premios (ex: 1 ao 5) -> 5 * 5 = 25
      expect(calcularTotalAposta(5.00, 1, 5, false)).toBe(25.00);
    });

    it('deve calcular corretamente para valor Rateado (bitT = true)', () => {
      // 5 premios, mas rateado -> total = valor da aposta
      expect(calcularTotalAposta(10.00, 1, 5, true)).toBe(10.00);
    });

    it('deve retornar 0 se valor invalido', () => {
      expect(calcularTotalAposta(-5, 1, 5, false)).toBe(0);
      expect(calcularTotalAposta(0, 1, 5, false)).toBe(0);
    });

    it('deve retornar 0 se colocacoes invalidas', () => {
      expect(calcularTotalAposta(10, 5, 1, false)).toBe(0);
    });
  });

  describe('parsePalpitesPosicionais', () => {
    it('deve juntar os palpites com virgula', () => {
      expect(parsePalpitesPosicionais(['1234', '5678'])).toBe('1234,5678');
      expect(parsePalpitesPosicionais(['0000'])).toBe('0000');
    });
  });

  describe('getHojeLocalDate', () => {
    it('deve formatar data local no formato YYYY-MM-DD sem fuso UTC', () => {
      const mockDate = new Date(2026, 6, 29, 21, 30, 0); // 2026-07-29 21:30:00 local
      expect(getHojeLocalDate(mockDate)).toBe('2026-07-29');
    });
  });

  describe('montarJogosPayload', () => {
    const item = (rateado: boolean): ApostaItem => ({
      id_interno: '1',
      modalidade: { id: 33, nome: 'MILHAR', sigla: 'M', digitos: 4 },
      palpites: ['1421', '8763'],
      colocacao_inicial: 1,
      colocacao_final: 5,
      valor_palpite: 1,
      total_item: rateado ? 2 : 10,
      bitT_rateado: rateado,
    });

    it('envia rateado para o backend calcular total e valor por colocação', () => {
      expect(montarJogosPayload([item(false)], [9], false)).toEqual([
        {
          sorteio_id: 9,
          modalidade_id: 33,
          palpites: ['1421', '8763'],
          colocacao_inicial: 1,
          colocacao_final: 5,
          valor_palpite: 1,
          rateado: false,
        },
      ]);
    });

    it('divide o valor entre as extrações quando ratearExtracoes', () => {
      const jogos = montarJogosPayload([item(true)], [9, 10], true);
      expect(jogos.map((j) => [j.sorteio_id, j.valor_palpite, j.rateado])).toEqual([
        [9, 0.5, true],
        [10, 0.5, true],
      ]);
    });
  });
});
