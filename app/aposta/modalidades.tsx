import { colors } from '@/assets/styles/colors';
import { Screen } from '@/components/ui/screen';
import { useCarrinho } from '@/context/CarrinhoContext';
import { ApostaService } from '@/services/apostaService';
import { Modalidade } from '@/types/aposta';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ModalidadesScreen() {
  const navigation = useNavigation();
  const { itensQuantidade } = useCarrinho();

  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarModalidades = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Carrega as modalidades cadastradas para Jogo do Bicho (filtro_banca = 1)
      const data = await ApostaService.listarModalidades(1);
      setModalidades(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar modalidades.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarModalidades();
  }, [carregarModalidades]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push('/aposta/preview')}
          style={styles.cartButton}
          testID="cart-button"
        >
          <Ionicons name="cart-outline" size={28} color={colors.white} />
          {itensQuantidade > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itensQuantidade}</Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, itensQuantidade]);

  const handleSelect = (mod: Modalidade) => {
    if (mod.ativa) {
      router.push({
        pathname: '/aposta/milhar',
        params: {
          modalidadeId: String(mod.id),
          modalidadeNome: mod.nome,
          modalidadeSigla: mod.sigla,
          digitos: String(mod.digitos),
        },
      });
    }
  };

  return (
    <Screen safe="withHeader" contentStyle={styles.screenContent} styleBarBottom={colors.black}>
      <Text style={styles.title}>Selecione a Modalidade</Text>

      {loading && !refreshing ? (
        <View style={styles.centerContainer} testID="loading-indicator">
          <ActivityIndicator size="large" color={colors.blue[600]} />
          <Text style={styles.loadingText}>Carregando modalidades...</Text>
        </View>
      ) : error && modalidades.length === 0 ? (
        <View style={styles.centerContainer} testID="error-container">
          <Ionicons name="alert-circle-outline" size={48} color={colors.red[500]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => carregarModalidades()}
            activeOpacity={0.8}
            testID="retry-button"
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={modalidades}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => carregarModalidades(true)}
              colors={[colors.blue[600]]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma modalidade cadastrada encontrada.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              disabled={!item.ativa}
              style={[styles.card, item.ativa ? styles.cardActive : styles.cardInactive]}
              activeOpacity={0.85}
              testID={`modalidade-card-${item.id}`}
            >
              <View style={styles.cardInfo}>
                <Text style={[styles.cardName, !item.ativa && styles.cardNameInactive]}>
                  {item.nome}
                </Text>
                <Text style={styles.cardDigits}>
                  {item.digitos > 0 ? `${item.digitos} dígitos` : 'Modalidade ativa'}
                </Text>
              </View>
              <View style={[styles.siglaWrap, item.ativa ? styles.siglaActive : styles.siglaInactive]}>
                <Text style={[styles.siglaText, !item.ativa && styles.siglaTextInactive]}>
                  {item.sigla}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  cartButton: {
    marginRight: 16,
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.red[500],
    borderRadius: 999,
    // minWidth (nao width) porque o carrinho chega a 150 itens.
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[500],
    marginBottom: 12,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.gray[600],
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.red[500],
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.blue[600],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.gray[500],
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    padding: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  cardActive: {
    backgroundColor: colors.white,
    borderColor: colors.blue[200],
    opacity: 1,
  },
  cardInactive: {
    backgroundColor: colors.gray[100],
    borderColor: colors.border.light,
    opacity: 0.5,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },
  cardNameInactive: {
    color: colors.gray[400],
  },
  cardDigits: {
    color: colors.gray[500],
    fontSize: 14,
    marginTop: 4,
  },
  siglaWrap: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  siglaActive: {
    backgroundColor: colors.blue[100],
  },
  siglaInactive: {
    backgroundColor: colors.gray[200],
  },
  siglaText: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.blue[700],
  },
  siglaTextInactive: {
    color: colors.gray[400],
  },
});
