import {
  firstParam,
  jsonArrayParam,
  numberParam,
  stringParam,
} from '@/utils/routeParams';

describe('routeParams', () => {
  describe('firstParam', () => {
    it('devolve a string quando o param e simples', () => {
      expect(firstParam('abc')).toBe('abc');
    });

    it('devolve o primeiro item quando a chave veio repetida na URL', () => {
      expect(firstParam(['a', 'b'])).toBe('a');
    });

    it('devolve undefined quando ausente', () => {
      expect(firstParam(undefined)).toBeUndefined();
    });
  });

  describe('numberParam', () => {
    it('converte string numerica', () => {
      expect(numberParam('4', 2)).toBe(4);
    });

    it('usa fallback para param ausente ou vazio', () => {
      expect(numberParam(undefined, 2)).toBe(2);
      expect(numberParam('', 2)).toBe(2);
    });

    it('usa fallback para texto nao numerico em vez de NaN', () => {
      expect(numberParam('abc', 2)).toBe(2);
    });

    it('converte a partir do primeiro item de um array', () => {
      expect(numberParam(['3', '9'], 2)).toBe(3);
    });
  });

  describe('stringParam', () => {
    it('usa fallback para ausente e vazio', () => {
      expect(stringParam(undefined, 'M')).toBe('M');
      expect(stringParam('', 'M')).toBe('M');
    });

    it('normaliza array para o primeiro item', () => {
      expect(stringParam(['MILHAR', 'X'], 'M')).toBe('MILHAR');
    });
  });

  describe('jsonArrayParam', () => {
    it('faz parse de um array de strings', () => {
      expect(jsonArrayParam('["1234","5678"]')).toEqual(['1234', '5678']);
    });

    it('devolve fallback para JSON malformado em vez de lancar', () => {
      expect(() => jsonArrayParam('{{{')).not.toThrow();
      expect(jsonArrayParam('{{{')).toEqual([]);
    });

    it('devolve fallback quando o JSON nao e array', () => {
      expect(jsonArrayParam('{"a":1}')).toEqual([]);
    });

    it('devolve fallback quando o array tem itens nao-string', () => {
      expect(jsonArrayParam('[1,2]')).toEqual([]);
    });

    it('devolve fallback para param ausente', () => {
      expect(jsonArrayParam(undefined)).toEqual([]);
    });
  });
});
