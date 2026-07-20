import { colors } from '@/assets/styles/colors';
import { Screen } from '@/components/ui/screen';
import { useCarrinho } from '@/context/CarrinhoContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Modalidades estáticas para MVP - depois virão do backend.
// Apenas a MILHAR está ativa para esta fase.
const MODALIDADES = [
  { id: 2, nome: 'MILHAR', sigla: 'M', digitos: 4, ativa: true },
  { id: 4, nome: 'CENTENA', sigla: 'C', digitos: 3, ativa: false },
  { id: 6, nome: 'GRUPO', sigla: 'G', digitos: 2, ativa: false },
  { id: 8, nome: 'DEZENA', sigla: 'D', digitos: 2, ativa: false },
];

export default function ModalidadesScreen() {
  const navigation = useNavigation();
  const { itensQuantidade } = useCarrinho();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push('/aposta/preview')}
          style={styles.cartButton}
        >
          <Ionicons name="cart-outline" size={28} color={colors.gray[800]} />
          {itensQuantidade > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itensQuantidade}</Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, itensQuantidade]);

  const handleSelect = (mod: (typeof MODALIDADES)[0]) => {
    if (mod.ativa) {
      router.push({
        pathname: '/aposta/milhar',
        params: { id: mod.id, nome: mod.nome, sigla: mod.sigla, digitos: mod.digitos },
      });
    }
  };

  return (
    <Screen safe="withHeader" contentStyle={styles.screenContent} styleBarBottom={colors.black}>
      <Text style={styles.title}>Selecione a Modalidade</Text>

      <FlatList
        data={MODALIDADES}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelect(item)}
            disabled={!item.ativa}
            style={[styles.card, item.ativa ? styles.cardActive : styles.cardInactive]}
            activeOpacity={0.85}
          >
            <View>
              <Text style={[styles.cardName, !item.ativa && styles.cardNameInactive]}>
                {item.nome}
              </Text>
              <Text style={styles.cardDigits}>{item.digitos} dígitos</Text>
            </View>
            <View style={[styles.siglaWrap, item.ativa ? styles.siglaActive : styles.siglaInactive]}>
              <Text style={[styles.siglaText, !item.ativa && styles.siglaTextInactive]}>
                {item.sigla}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    padding: 16,
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
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: colors.gray[500],
    marginBottom: 8,
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
  cardName: {
    fontSize: 20,
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
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  siglaActive: {
    backgroundColor: colors.blue[100],
  },
  siglaInactive: {
    backgroundColor: colors.gray[200],
  },
  siglaText: {
    fontWeight: '700',
    color: colors.blue[700],
  },
  siglaTextInactive: {
    color: colors.gray[400],
  },
});
