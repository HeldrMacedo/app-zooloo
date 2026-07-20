import { colors } from '@/assets/styles/colors';
import { Screen } from '@/components/ui/screen';
import { useCarrinho } from '@/context/CarrinhoContext';
import { calcularTotalAposta } from '@/utils/apostaHelpers';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const NUMEROS_PREMIO = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface IntervaloAdicionado {
  id: string;
  minPremio: number;
  maxPremio: number;
  valorDecimal: number;
  total: number;
  rateado: boolean;
}

export default function PremiosScreen() {
  const params = useLocalSearchParams();
  const { adicionarItem } = useCarrinho();

  const modalidadeId = Number(params.modalidadeId) || 2;
  const modalidadeNome = (params.modalidadeNome as string) || 'MILHAR';
  const modalidadeSigla = (params.modalidadeSigla as string) || 'M';
  const palpitesStr = (params.palpites as string) || '[]';
  const palpites: string[] = JSON.parse(palpitesStr);

  const [listaIntervalos, setListaIntervalos] = useState<IntervaloAdicionado[]>([]);
  const [premiosSelecionados, setPremiosSelecionados] = useState<number[]>([1]);
  const [rateado, setRateado] = useState(false);
  const [valorStr, setValorStr] = useState('');

  const valorDecimal = Number(valorStr.replace(',', '.')) || 0;

  const handlePressPremio = (num: number) => {
    let novos = [...premiosSelecionados];
    if (novos.includes(num)) {
      novos = novos.filter((n) => n !== num);
    } else {
      novos.push(num);
    }

    if (novos.length === 0) novos = [1];

    novos.sort((a, b) => a - b);

    const min = novos[0];
    const max = novos[novos.length - 1];

    const arrayContiguo = [];
    for (let i = min; i <= max; i++) {
      arrayContiguo.push(i);
    }

    setPremiosSelecionados(arrayContiguo);
  };

  const minPremio = premiosSelecionados[0];
  const maxPremio = premiosSelecionados[premiosSelecionados.length - 1];

  const totalOpcaoAtual = useMemo(() => {
    const subTotal = calcularTotalAposta(valorDecimal, minPremio, maxPremio, rateado);
    return subTotal * palpites.length;
  }, [valorDecimal, minPremio, maxPremio, rateado, palpites.length]);

  const totalGeral = useMemo(() => {
    if (listaIntervalos.length > 0) {
      return listaIntervalos.reduce((acc, curr) => acc + curr.total, 0);
    }
    return totalOpcaoAtual;
  }, [listaIntervalos, totalOpcaoAtual]);

  const handleAdicionarIntervalo = () => {
    if (valorDecimal <= 0) {
      alert('Digite um valor maior que zero.');
      return;
    }
    const novoIntervalo: IntervaloAdicionado = {
      id: Math.random().toString(36).substring(2, 9),
      minPremio,
      maxPremio,
      valorDecimal,
      total: totalOpcaoAtual,
      rateado,
    };
    setListaIntervalos([...listaIntervalos, novoIntervalo]);
    setValorStr('');
  };

  const removerIntervalo = (id: string) => {
    setListaIntervalos(listaIntervalos.filter((i) => i.id !== id));
  };

  const handleAdicionar = () => {
    let intervalos = [...listaIntervalos];

    if (intervalos.length === 0) {
      if (valorDecimal <= 0) {
        alert('Adicione pelo menos um intervalo válido.');
        return;
      }
      intervalos = [
        {
          id: 'temp',
          minPremio,
          maxPremio,
          valorDecimal,
          total: totalOpcaoAtual,
          rateado,
        },
      ];
    }

    try {
      intervalos.forEach((intervalo) => {
        adicionarItem({
          modalidade: {
            id: modalidadeId,
            nome: modalidadeNome,
            sigla: modalidadeSigla,
            digitos: 4,
          },
          palpites,
          colocacao_inicial: intervalo.minPremio,
          colocacao_final: intervalo.maxPremio,
          valor_palpite: intervalo.valorDecimal,
          total_item: intervalo.total,
          bitT_rateado: intervalo.rateado,
        });
      });

      router.dismissAll();
      router.push('/aposta/modalidades');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const canAddInterval = valorDecimal > 0;
  const canAddToCart = listaIntervalos.length > 0 || valorDecimal > 0;

  return (
    <Screen safe="withHeader">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.palpitesBlock}>
            <Text style={styles.mutedLabel}>Palpites ({modalidadeNome}):</Text>
            <Text style={styles.palpitesValue}>{palpites.join(', ')}</Text>
          </View>

          <View style={styles.premiosBlock}>
            <Text style={styles.sectionTitle}>Selecione os Prêmios (1º ao 10º): </Text>
            <View style={styles.premiosGrid}>
              {NUMEROS_PREMIO.map((num) => {
                const selecionado = premiosSelecionados.includes(num);
                return (
                  <TouchableOpacity
                    key={num}
                    onPress={() => handlePressPremio(num)}
                    style={[
                      styles.premioCircle,
                      selecionado ? styles.premioSelected : styles.premioUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.premioNumber,
                        selecionado ? styles.premioNumberSelected : styles.premioNumberUnselected,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <View style={styles.resetRow}>
                <Text>Resetar: </Text>
                <Pressable onPress={() => setPremiosSelecionados([1])}>
                  <Ionicons name="sync" size={24} color={colors.black} />
                </Pressable>
              </View>
            </View>
            <Text style={styles.rangeHint}>
              Do {minPremio}º ao {maxPremio}º prêmio.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.modoRow}>
              <Text style={styles.sectionTitleNoMargin}>Modo de Valor</Text>
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, !rateado && styles.switchLabelActiveBlue]}>
                  Por Cada
                </Text>
                <Switch
                  value={rateado}
                  onValueChange={setRateado}
                  trackColor={{ false: colors.blue[500], true: colors.success.DEFAULT }}
                  thumbColor={colors.white}
                />
                <Text style={[styles.switchLabelRight, rateado && styles.switchLabelActiveGreen]}>
                  Rateado
                </Text>
              </View>
            </View>

            <Text style={styles.valorLabel}>Valor da Aposta (R$):</Text>
            <TextInput
              style={styles.valorInput}
              keyboardType="numeric"
              value={valorStr}
              onChangeText={(t) => setValorStr(t.replace(/[^0-9,.]/g, '').replace('.', ','))}
              placeholder="0,00"
              placeholderTextColor={colors.text.placeholder}
            />

            <TouchableOpacity
              onPress={handleAdicionarIntervalo}
              style={[
                styles.intervalButton,
                canAddInterval ? styles.buttonBlue : styles.buttonDisabled,
              ]}
              disabled={!canAddInterval}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Adicionar Intervalo</Text>
            </TouchableOpacity>
          </View>

          {listaIntervalos.length > 0 && (
            <View style={styles.listaBlock}>
              <Text style={styles.sectionTitle}>Intervalos Adicionados:</Text>
              {listaIntervalos.map((item) => (
                <View key={item.id} style={styles.intervaloCard}>
                  <View>
                    <Text style={styles.intervaloTitle}>
                      {item.minPremio}º ao {item.maxPremio}º{' '}
                      <Text style={styles.intervaloMeta}>
                        • {item.rateado ? 'Rateado' : 'Por Cada'}
                      </Text>
                    </Text>
                    <Text style={styles.intervaloValor}>
                      Valor: R$ {item.valorDecimal.toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                  <View style={styles.intervaloRight}>
                    <TouchableOpacity
                      onPress={() => removerIntervalo(item.id)}
                      style={styles.trashButton}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.danger.DEFAULT} />
                    </TouchableOpacity>
                    <Text style={styles.intervaloTotal}>
                      R$ {item.total.toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Estimado:</Text>
            <Text style={styles.totalValue}>
              R$ {totalGeral.toFixed(2).replace('.', ',')}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleAdicionar}
            style={[
              styles.cartButton,
              canAddToCart ? styles.buttonGreen : styles.buttonDisabled,
            ]}
            disabled={!canAddToCart}
            activeOpacity={0.85}
          >
            <Ionicons
              name="cart-outline"
              size={24}
              color={colors.white}
              style={styles.cartIcon}
            />
            <Text style={styles.cartButtonText}>Adicionar ao Carrinho</Text>
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
  },
  palpitesBlock: {
    marginBottom: 24,
  },
  mutedLabel: {
    color: colors.gray[500],
    marginBottom: 4,
  },
  palpitesValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[800],
    letterSpacing: 4,
  },
  premiosBlock: {
    marginBottom: 4,
  },
  sectionTitle: {
    color: colors.gray[700],
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionTitleNoMargin: {
    color: colors.gray[700],
    fontWeight: '700',
  },
  premiosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  premioCircle: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  premioSelected: {
    backgroundColor: colors.blue[600],
  },
  premioUnselected: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  premioNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  premioNumberSelected: {
    color: colors.white,
  },
  premioNumberUnselected: {
    color: colors.gray[600],
  },
  resetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeHint: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  modoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginRight: 8,
    color: colors.gray[400],
  },
  switchLabelRight: {
    marginLeft: 8,
    color: colors.gray[400],
  },
  switchLabelActiveBlue: {
    fontWeight: '700',
    color: colors.blue[600],
  },
  switchLabelActiveGreen: {
    fontWeight: '700',
    color: colors.green[600],
  },
  valorLabel: {
    color: colors.gray[700],
    fontWeight: '700',
    marginBottom: 8,
  },
  valorInput: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[800],
  },
  intervalButton: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonBlue: {
    backgroundColor: colors.blue[600],
  },
  buttonGreen: {
    backgroundColor: colors.green[600],
  },
  buttonDisabled: {
    backgroundColor: colors.gray[300],
  },
  buttonText: {
    color: colors.white,
    fontWeight: '700',
  },
  listaBlock: {
    marginBottom: 24,
  },
  intervaloCard: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  intervaloTitle: {
    fontWeight: '700',
    color: colors.gray[800],
  },
  intervaloMeta: {
    fontWeight: '400',
    color: colors.gray[500],
  },
  intervaloValor: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
  },
  intervaloRight: {
    alignItems: 'flex-end',
  },
  trashButton: {
    padding: 4,
    marginBottom: 4,
  },
  intervaloTotal: {
    fontWeight: '700',
    color: colors.blue[800],
  },
  totalBox: {
    backgroundColor: colors.blue[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.blue[100],
  },
  totalLabel: {
    color: colors.blue[800],
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.blue[900],
  },
  cartButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  cartIcon: {
    marginRight: 8,
  },
  cartButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
