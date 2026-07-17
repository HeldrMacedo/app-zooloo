import { SYSTEM_BAR_COLOR } from '@/constants/system-bars';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Fundo da tab bar: área dos ícones branca + faixa inferior azul
 * (home indicator / botões do sistema no Android edge-to-edge).
 */
export function TabBarBackground() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: Math.max(insets.bottom, 0),
          backgroundColor: SYSTEM_BAR_COLOR,
        }}
      />
    </View>
  );
}
