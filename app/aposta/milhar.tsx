import { colors } from '@/assets/styles/colors';
import { Screen } from '@/components/ui/screen';
import { validarMilhar } from '@/utils/apostaHelpers';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function MilharScreen() {
  const params = useLocalSearchParams();
  const modalidadeId = Number(params.id) || 2;
  const modalidadeNome = (params.nome as string) || 'MILHAR';
  const modalidadeSigla = (params.sigla as string) || 'M';
  const digitosReq = Number(params.digitos) || 4;

  const [palpite, setPalpite] = useState('');
  const [palpitesAdicionados, setPalpitesAdicionados] = useState<string[]>([]);
  const [error, setError] = useState('');

  const tryAddPalpite = useCallback(
    (valor: string) => {
      if (!validarMilhar(valor, digitosReq)) {
        setError(`O palpite deve ter exatamente ${digitosReq} dígitos numéricos.`);
        return;
      }

      setPalpitesAdicionados((prev) => {
        setError('');
        return [...prev, valor];
      });
      setPalpite('');
    },
    [digitosReq],
  );

  const handleRemovePalpite = (p: string) => {
    setPalpitesAdicionados((prev) => prev.filter((item) => item !== p));
  };

  const handleAvancar = () => {
    if (palpitesAdicionados.length === 0) {
      if (validarMilhar(palpite, digitosReq)) {
        avancarParaPremios([palpite]);
      } else {
        setError('Adicione pelo menos um palpite válido.');
      }
      return;
    }

    avancarParaPremios(palpitesAdicionados);
  };

  const avancarParaPremios = (palpitesConfirmados: string[]) => {
    router.push({
      pathname: '/aposta/premios',
      params: {
        modalidadeId,
        modalidadeNome,
        modalidadeSigla,
        palpites: JSON.stringify(palpitesConfirmados),
      },
    });
  };

  const handleChangePalpite = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, digitosReq);
    setError('');

    if (cleaned.length === digitosReq) {
      tryAddPalpite(cleaned);
    } else {
      setPalpite(cleaned);
    }
  };

  const placeholder = '0'.repeat(Math.max(digitosReq, 1));
  const canAdvance = palpitesAdicionados.length > 0;

  return (
    <Screen safe="withHeader">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>
            {modalidadeNome} ({modalidadeSigla})
          </Text>
          <Text style={styles.subtitle}>
            Digite {digitosReq} números para formar seu palpite. O palpite é adicionado
            automaticamente.
          </Text>

          <View style={styles.inputSection}>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                maxLength={digitosReq}
                value={palpite}
                onChangeText={handleChangePalpite}
                placeholder={placeholder}
                placeholderTextColor={colors.text.placeholder}
                autoFocus
              />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          {palpitesAdicionados.length > 0 && (
            <View style={styles.chipsSection}>
              <Text style={styles.chipsLabel}>Palpites Atuais:</Text>
              <View style={styles.chipsRow}>
                {palpitesAdicionados.map((p, idx) => (
                  <TouchableOpacity
                    key={`${p}-${idx}`}
                    onPress={() => handleRemovePalpite(p)}
                    style={styles.chip}
                  >
                    <Text style={styles.chipText}>{p}</Text>
                    <Text style={styles.chipRemove}>X</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.flex} />

          <TouchableOpacity
            onPress={handleAvancar}
            style={[styles.nextButton, canAdvance ? styles.nextButtonActive : styles.nextButtonDisabled]}
            activeOpacity={0.85}
          >
            <Text style={styles.nextButtonText}>Próximo</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: 8,
  },
  subtitle: {
    color: colors.gray[500],
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[800],
    letterSpacing: 4,
    textAlign: 'center',
  },
  error: {
    color: colors.red[500],
    marginTop: 8,
  },
  chipsSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  chipsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: colors.blue[50],
    borderWidth: 1,
    borderColor: colors.blue[200],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    color: colors.blue[800],
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: 4,
  },
  chipRemove: {
    color: colors.red[400],
    fontWeight: '700',
    fontSize: 12,
  },
  nextButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  nextButtonActive: {
    backgroundColor: colors.blue[600],
  },
  nextButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
