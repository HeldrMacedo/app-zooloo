import { colors } from '@/assets/styles/colors';
import { Screen } from '@/components/ui/screen';
import { getDeviceSerial } from '@/services/deviceSerial';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TerminalScreen() {
  const [serial, setSerial] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const value = await getDeviceSerial();
        if (mounted) setSerial(value);
      } catch {
        if (mounted) setSerial(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCopy = async () => {
    if (!serial) return;
    try {
      await Clipboard.setStringAsync(serial);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Erro', 'Não foi possível copiar o serial.');
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backButton}
            testID="terminal-back-button"
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text.body} />
          </TouchableOpacity>
          <Text style={styles.title}>Terminal / Dispositivo</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.card}>
          <Text style={styles.help}>
            Este número de serial identifica o aparelho de venda. Ele precisa estar cadastrado
            no sistema Zooloo (Cadastros → Terminal) para permitir login e emissão de apostas.
          </Text>

          <Text style={styles.serialLabel}>Serial do dispositivo</Text>

          {loading ? (
            <ActivityIndicator color={colors.brand.primary} style={styles.loader} />
          ) : (
            <Text style={styles.serialValue} selectable testID="terminal-serial-value">
              {serial ?? 'Indisponível'}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.button, (!serial || loading) && styles.buttonDisabled]}
            onPress={handleCopy}
            disabled={!serial || loading}
            activeOpacity={0.8}
            testID="terminal-copy-button"
          >
            <MaterialIcons
              name={copied ? 'check' : 'content-copy'}
              size={18}
              color={colors.text.inverse}
            />
            <Text style={styles.buttonText}>{copied ? 'Copiado!' : 'Copiar serial'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace('/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Voltar ao login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.title,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  help: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  serialLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.label,
    marginBottom: 8,
  },
  serialValue: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.text.body,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  loader: {
    marginVertical: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.brand.primary,
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[400],
  },
  buttonText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text.label,
    fontWeight: '600',
    fontSize: 16,
  },
});
