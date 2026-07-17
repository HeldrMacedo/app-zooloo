import { colors } from '@/assets/styles/colors';
import { SYSTEM_BAR_COLOR } from '@/constants/system-bars';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Fundo da tab bar: área dos ícones branca + faixa inferior azul
 * (home indicator / botões do sistema no Android edge-to-edge).
 */
export function TabBarBackground() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.systemStrip,
          { height: Math.max(insets.bottom, 0) },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  systemStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: SYSTEM_BAR_COLOR,
  },
});