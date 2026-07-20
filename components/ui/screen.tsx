import { colors } from '@/assets/styles/colors';
import { SYSTEM_BAR_COLOR, SYSTEM_BAR_STYLE } from '@/constants/system-bars';
import { useSystemBars } from '@/hooks/use-system-bars';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Presets de faixas do sistema por tipo de navegação:
 * - default: top + bottom (login, modal fullscreen)
 * - withHeader: só bottom (Stack com header nativo no top)
 * - withTabBar: só top (a faixa inferior azul fica no TabBarBackground)
 * - none: sem faixas (controle manual)
 */
const BAR_PRESETS = {
  default: { top: true, bottom: true },
  withHeader: { top: false, bottom: true },
  withTabBar: { top: true, bottom: false },
  none: { top: false, bottom: false },
} as const;

export type ScreenSafePreset = keyof typeof BAR_PRESETS;

export type ScreenProps = {
  children: ReactNode;
  /**
   * Quais faixas do sistema pintar com a cor da marca.
   * @default 'default'
   */
  safe?: ScreenSafePreset;
  /** Cor das faixas status/navigation. Default: azul da marca. */
  systemBarColor?: string;
  /** Estilo dos ícones do sistema. Default: light (brancos). */
  systemBarStyle?: 'light' | 'dark';
  /**
   * Estilos do **conteúdo** (padding, justify, background, etc.).
   * Nunca aplicar padding no shell externo — isso encolhia as faixas do sistema.
   */
  contentStyle?: StyleProp<ViewStyle>;
  /** Estilo do container externo (faixas + conteúdo). */
  style?: StyleProp<ViewStyle>;
  /** Cor da faixa inferior. Default: preto. */
  styleBarBottom?: string;
};

/**
 * Container de tela com safe area e faixas coloridas nas barras do sistema.
 * As faixas top/bottom ficam sempre edge-to-edge (largura total da tela).
 */
export function Screen({
  children,
  safe = 'default',
  systemBarColor = SYSTEM_BAR_COLOR,
  systemBarStyle = SYSTEM_BAR_STYLE,
  contentStyle,
  style,
  styleBarBottom = colors.black,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bars = BAR_PRESETS[safe];

  useSystemBars({ color: systemBarColor, style: systemBarStyle });

  const bottomBarColor = styleBarBottom || systemBarColor;

  return (
    <SafeAreaProvider>
      <View style={[styles.shell, { backgroundColor: systemBarColor }, style]}>
        <StatusBar style={systemBarStyle} backgroundColor={systemBarColor} />

        {bars.top ? (
          <View style={{ height: insets.top, backgroundColor: systemBarColor }} />
        ) : null}

        <View style={[styles.content, contentStyle]}>{children}</View>

        {bars.bottom ? (
          <View style={{ height: insets.bottom, backgroundColor: bottomBarColor }} />
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background.screen,
  },
});
