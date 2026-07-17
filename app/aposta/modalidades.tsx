import { Screen } from '@/components/ui/screen';
import { useCarrinho } from '@/context/CarrinhoContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

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
          className="mr-4 relative p-2"
        >
          <Ionicons name="cart-outline" size={28} color="#1F2937" />
          {itensQuantidade > 0 && (
            <View className="absolute top-0 right-0 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">{itensQuantidade}</Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, itensQuantidade]);

  const handleSelect = (mod: typeof MODALIDADES[0]) => {
    if (mod.ativa) {
      // Navegamos passando a modalidade por param
      router.push({
        pathname: '/aposta/milhar',
        params: { id: mod.id, nome: mod.nome, sigla: mod.sigla, digitos: mod.digitos }
      });
    }
  };

  return (
    <Screen safe="withHeader" className="p-4">
      <Text className="text-lg font-semibold text-gray-700 mb-4">
        Selecione a Modalidade
      </Text>

      <FlatList
        data={MODALIDADES}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelect(item)}
            disabled={!item.ativa}
            className={`p-5 mb-3 rounded-xl border flex-row items-center justify-between shadow-sm
              ${item.ativa
                ? 'bg-white border-blue-200 opacity-100'
                : 'bg-gray-100 border-gray-200 opacity-50'
              }`}
          >
            <View>
              <Text className={`text-xl font-bold ${item.ativa ? 'text-gray-900' : 'text-gray-400'}`}>
                {item.nome}
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                {item.digitos} dígitos
              </Text>
            </View>
            <View className={`w-10 h-10 rounded-full items-center justify-center ${item.ativa ? 'bg-blue-100' : 'bg-gray-200'}`}>
              <Text className={`font-bold ${item.ativa ? 'text-blue-700' : 'text-gray-400'}`}>{item.sigla}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}
