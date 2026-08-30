/**
 * Helpers para ler params do Expo Router.
 *
 * O router serializa params na URL, então tudo chega como `string` — e como
 * `string[]` quando a mesma chave aparece repetida. Os casts `as string`
 * espalhados pelas telas ignoravam esse segundo caso, o que fazia `Number()`
 * devolver NaN e `JSON.parse` lançar durante o render.
 */

export type RouteParamValue = string | string[] | undefined;

/** Normaliza um param para string única (pega o primeiro quando vem repetido). */
export const firstParam = (valor: RouteParamValue): string | undefined => {
  if (Array.isArray(valor)) return valor[0];
  return valor;
};

/** Lê um param numérico, caindo no fallback quando ausente ou inválido. */
export const numberParam = (valor: RouteParamValue, fallback: number): number => {
  const bruto = firstParam(valor);
  if (bruto == null || bruto === '') return fallback;
  const numero = Number(bruto);
  return Number.isFinite(numero) ? numero : fallback;
};

/** Lê um param de texto, caindo no fallback quando ausente. */
export const stringParam = (valor: RouteParamValue, fallback: string): string => {
  const bruto = firstParam(valor);
  return bruto == null || bruto === '' ? fallback : bruto;
};

/**
 * Lê um array de strings serializado como JSON.
 * Nunca lança: param malformado devolve o fallback.
 */
export const jsonArrayParam = (
  valor: RouteParamValue,
  fallback: string[] = [],
): string[] => {
  const bruto = firstParam(valor);
  if (!bruto) return fallback;

  try {
    const parsed: unknown = JSON.parse(bruto);
    if (!Array.isArray(parsed)) return fallback;
    if (!parsed.every((item) => typeof item === 'string')) return fallback;
    return parsed as string[];
  } catch {
    return fallback;
  }
};
