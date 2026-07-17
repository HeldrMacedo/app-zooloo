import { SYSTEM_BAR_COLOR, SYSTEM_BAR_STYLE } from '@/constants/system-bars';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Platform } from 'react-native';

type SystemBarStyle = 'light' | 'dark';

type Options = {
  color?: string;
  /** light = ícones claros (fundo escuro); dark = ícones escuros (fundo claro) */
  style?: SystemBarStyle;
};

/**
 * Aplica cor da navigation bar (Android) e do root view.
 * Com edge-to-edge, a cor visual da faixa também é pintada pelo componente Screen.
 */
export function useSystemBars(options: Options = {}) {
  const color = options.color ?? SYSTEM_BAR_COLOR;
  const style = options.style ?? SYSTEM_BAR_STYLE;

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(color).catch(() => {
      // ignore — web / ambientes sem nativo
    });

    if (Platform.OS !== 'android') return;

    void (async () => {
      try {
        // Em edge-to-edge a barra pode ser transparente; ainda assim reforçamos cor + botões.
        await NavigationBar.setBackgroundColorAsync(color);
        await NavigationBar.setButtonStyleAsync(style);
      } catch {
        // ignore
      }
    })();
  }, [color, style]);
}
