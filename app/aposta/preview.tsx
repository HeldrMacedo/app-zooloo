import { colors } from '@/assets/styles/colors';
import PuleTermica from '@/components/PuleTermica';
import { Screen } from '@/components/ui/screen';
import { useCarrinho } from '@/context/CarrinhoContext';
import { ApostaService } from '@/services/apostaService';
import { Extracao } from '@/types/aposta';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PreviewScreen() {
  const { itens, removerItem, limparCarrinho, getTotalEstimado } = useCarrinho();

  const [dataSorteio, setDataSorteio] = useState(new Date().toISOString().split('T')[0]);
  const [extracoes, setExtracoes] = useState<Extracao[]>([]);
  const [extracoesSelecionadas, setExtracoesSelecionadas] = useState<number[]>([]);
  const [ratearExtracoes, setRatearExtracoes] = useState(false);
  const [loading, setLoading] = useState(false);

  const [reciboData, setReciboData] = useState<any>(null);

  useEffect(() => {
    carregarExtracoes();
  }, [dataSorteio]);

  const carregarExtracoes = async () => {
    setLoading(true);
    try {
      const data = await ApostaService.listarExtracoes(dataSorteio);

      setExtracoes(data || []);
      if (data && data.length > 0) {
        setExtracoesSelecionadas([data[0].extracao_id]);
      } else {
        setExtracoesSelecionadas([]);
      }
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Falha ao buscar extrações');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExtracao = (id: number) => {
    let selecionadas = [...extracoesSelecionadas];
    if (selecionadas.includes(id)) {
      selecionadas = selecionadas.filter((e) => e !== id);
    } else {
      selecionadas.push(id);
    }
    setExtracoesSelecionadas(selecionadas);
  };

  const calcularTotalFinal = () => {
    const qtde = Math.max(1, extracoesSelecionadas.length);
    const subTotal = getTotalEstimado();
    return ratearExtracoes ? subTotal : subTotal * qtde;
  };

  const handleConfirmar = async () => {
    if (itens.length === 0) {
      Alert.alert('Erro', 'O carrinho está vazio.');
      return;
    }
    if (extracoesSelecionadas.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos uma extração.');
      return;
    }

    setLoading(true);
    try {
      const jogosPayload = [];
      for (const excId of extracoesSelecionadas) {
        for (const item of itens) {
          const valor = ratearExtracoes
            ? item.valor_palpite / extracoesSelecionadas.length
            : item.valor_palpite;

          jogosPayload.push({
            sorteio_id: excId,
            modalidade_id: item.modalidade.id,
            palpites: item.palpites,
            colocacao_inicial: item.colocacao_inicial,
            colocacao_final: item.colocacao_final,
            valor_palpite: valor,
          });
        }
      }

      const payload = {
        data: {
          terminal_id: 1,
          jogos: jogosPayload,
        },
      };

      const response = await ApostaService.registrarBilhete(payload);
      setReciboData(response);
      limparCarrinho();
    } catch (e: any) {
      Alert.alert('Erro ao Registrar', e.message || 'Houve um erro.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDisabled =
    loading || itens.length === 0 || extracoesSelecionadas.length === 0;

  if (reciboData) {
    return (
      <Modal visible animationType="slide">
        <Screen contentStyle={styles.reciboScreen}>
          <PuleTermica
            data={reciboData}
            onFechar={() => {
              setReciboData(null);
              router.dismissAll();
            }}
          />
        </Screen>
      </Modal>
    );
  }

  return (
    <Screen safe="withHeader" contentStyle={styles.screenContent}>
      <ScrollView>
        <Text style={styles.pageTitle}>Revisar Apostas</Text>

        {itens.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhuma aposta no carrinho.</Text>
          </View>
        ) : (
          itens.map((item) => (
            <View key={item.id_interno} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>
                  {item.modalidade.nome}{' '}
                  <Text style={styles.itemMeta}>
                    ({item.colocacao_inicial}º ao {item.colocacao_final}º)
                  </Text>
                </Text>
                <Text style={styles.itemPalpites}>{item.palpites.join(', ')}</Text>
                <Text style={styles.itemDetail}>
                  {item.bitT_rateado ? 'Rateado' : 'Por Cada'} • R${' '}
                  {item.valor_palpite.toFixed(2).replace('.', ',')}
                </Text>
              </View>
              <View style={styles.itemRight}>
                <TouchableOpacity
                  onPress={() => removerItem(item.id_interno)}
                  style={styles.trashButton}
                >
                  <Ionicons name="trash-outline" size={24} color={colors.danger.DEFAULT} />
                </TouchableOpacity>
                <Text style={styles.itemTotal}>
                  R$ {item.total_item.toFixed(2).replace('.', ',')}
                </Text>
              </View>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Sorteios Disponíveis</Text>
        <View style={styles.sorteiosCard}>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Data do Sorteio</Text>
            <Text style={styles.dataValue}>{dataSorteio}</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.blue[500]} />
          ) : extracoes.length === 0 ? (
            <Text style={styles.emptyExtracoes}>Nenhuma extração aberta para hoje.</Text>
          ) : (
            <View>
              {extracoes.map((ext) => {
                const isSelected = extracoesSelecionadas.includes(ext.extracao_id);
                return (
                  <TouchableOpacity
                    key={ext.extracao_id}
                    onPress={() => handleToggleExtracao(ext.extracao_id)}
                    style={styles.extracaoRow}
                  >
                    <View>
                      <Text
                        style={[
                          styles.extracaoTitle,
                          isSelected ? styles.extracaoSelected : styles.extracaoUnselected,
                        ]}
                      >
                        {`Extração ${ext.descricao || ext.descricao_mobile}`}
                      </Text>
                      <Text style={styles.extracaoHora}>Até {ext.hora_limite}</Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        isSelected ? styles.checkboxSelected : styles.checkboxUnselected,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color={colors.white} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {extracoesSelecionadas.length > 1 && (
                <View style={styles.ratearRow}>
                  <Text style={styles.ratearLabel}>
                    Ratear Valor (Dividir entre as extrações?)
                  </Text>
                  <Switch value={ratearExtracoes} onValueChange={setRatearExtracoes} />
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalMuted}>Subtotal</Text>
            <Text style={styles.totalMutedBold}>
              R$ {getTotalEstimado().toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.totalRowSpaced]}>
            <Text style={styles.totalMuted}>Multiplicador</Text>
            <Text style={styles.totalMutedBold}>
              x {ratearExtracoes ? 1 : Math.max(1, extracoesSelecionadas.length)} extração(ões)
            </Text>
          </View>
          <View style={styles.totalFinalRow}>
            <Text style={styles.totalFinalLabel}>Total do Bilhete</Text>
            <Text style={styles.totalFinalValue}>
              R$ {calcularTotalFinal().toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleConfirmar}
          disabled={confirmDisabled}
          style={[
            styles.confirmButton,
            confirmDisabled ? styles.buttonDisabled : styles.buttonGreen,
          ]}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} style={styles.confirmIcon} />
          ) : (
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={colors.white}
              style={styles.confirmIcon}
            />
          )}
          <Text style={styles.confirmText}>
            {loading ? 'Registrando...' : 'Confirmar e Enviar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    padding: 16,
  },
  reciboScreen: {
    backgroundColor: colors.white,
    padding: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.gray[500],
  },
  itemCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: '700',
    color: colors.gray[800],
    fontSize: 18,
  },
  itemMeta: {
    fontWeight: '400',
    color: colors.gray[500],
  },
  itemPalpites: {
    color: colors.blue[600],
    fontWeight: '700',
    letterSpacing: 4,
    marginTop: 4,
  },
  itemDetail: {
    color: colors.gray[500],
    marginTop: 8,
    fontSize: 12,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  trashButton: {
    padding: 8,
  },
  itemTotal: {
    fontWeight: '700',
    fontSize: 18,
    color: colors.gray[800],
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[800],
    marginTop: 24,
    marginBottom: 16,
  },
  sorteiosCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: 24,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    paddingBottom: 16,
    marginBottom: 16,
  },
  dataLabel: {
    color: colors.gray[600],
  },
  dataValue: {
    fontWeight: '700',
    color: colors.blue[600],
  },
  emptyExtracoes: {
    color: colors.gray[500],
    textAlign: 'center',
  },
  extracaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  extracaoTitle: {
    fontWeight: '700',
  },
  extracaoSelected: {
    color: colors.blue[800],
  },
  extracaoUnselected: {
    color: colors.gray[700],
  },
  extracaoHora: {
    fontSize: 12,
    color: colors.gray[500],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.blue[600],
    borderColor: colors.blue[600],
  },
  checkboxUnselected: {
    backgroundColor: colors.white,
    borderColor: colors.border.default,
  },
  ratearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 16,
    marginTop: 8,
  },
  ratearLabel: {
    color: colors.gray[700],
    flex: 1,
    marginRight: 8,
  },
  totalsBox: {
    backgroundColor: colors.blue[50],
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.blue[100],
    marginBottom: 32,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalRowSpaced: {
    marginBottom: 16,
    marginTop: 8,
  },
  totalMuted: {
    color: colors.blue[800],
  },
  totalMutedBold: {
    color: colors.blue[800],
    fontWeight: '700',
  },
  totalFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.blue[200],
    paddingTop: 16,
  },
  totalFinalLabel: {
    color: colors.blue[900],
    fontWeight: '700',
    fontSize: 18,
  },
  totalFinalValue: {
    color: colors.blue[900],
    fontWeight: '900',
    fontSize: 24,
  },
  confirmButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 48,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonGreen: {
    backgroundColor: colors.green[600],
  },
  buttonDisabled: {
    backgroundColor: colors.gray[300],
  },
  confirmIcon: {
    marginRight: 8,
  },
  confirmText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
