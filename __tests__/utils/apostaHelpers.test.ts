import { validarMilhar, calcularTotalAposta, parsePalpitesPosicionais } from '../../utils/apostaHelpers';

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
});
