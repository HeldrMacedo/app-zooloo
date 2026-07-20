/**
 * Tokens de cor globais do app.
 * Use em StyleSheet / style prop. Evite hex solto nos componentes de tela.
 */
export const colors = {
  white: '#FFFFFF',
  black: '#000000',

  brand: {
    /** Azul principal (botões de login / CTAs de marca) */
    primary: '#1F319D',
    /** Azul das barras do sistema (status / navigation) */
    system: '#2563EB',
  },

  /** Azul de UI (cards, chips, links, ações secundárias) */
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  green: {
    600: '#16A34A',
    700: '#15803D',
  },

  red: {
    50: '#FEF2F2',
    400: '#F87171',
    500: '#EF4444',
  },

  yellow: {
    50: '#FEFCE8',
  },

  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  text: {
    title: '#495057',
    secondary: '#4B5563',
    label: '#374151',
    body: '#1F2937',
    inverse: '#FFFFFF',
    placeholder: '#9CA3AF',
    muted: '#6B7280',
  },

  background: {
    screen: '#F9FAFB',
    card: '#FFFFFF',
    input: '#FFFFFF',
  },

  border: {
    default: '#D1D5DB',
    light: '#E5E7EB',
  },

  danger: {
    DEFAULT: '#EF4444',
  },

  success: {
    DEFAULT: '#10B981',
  },
} as const;

export type Colors = typeof colors;
