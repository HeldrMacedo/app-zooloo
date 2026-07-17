import PuleTermica from '@/components/PuleTermica';
import { Screen } from '@/components/ui/screen';
import { useCarrinho } from '@/context/CarrinhoContext';
import { ApostaService } from '@/services/apostaService';
import { Extracao } from '@/types/aposta';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';

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
      // Retorna as extrações abertas para a data
      const data = await ApostaService.listarExtracoes(dataSorteio);

      setExtracoes(data || []);
      // Auto-selecionar a primeira se houver
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
    // Se ratear, o total do bilhete não multiplica pela qtde de extrações
    // Se não ratear, multiplica
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
      // Para cada extração selecionada, precisamos montar a lista de jogos, 
      // ou enviar de forma que a API do backend entenda.
      // O BilheteRestService espera "jogos" com "sorteio_id".
      // Vamos criar a combinação itens x extracoes
      const jogosPayload = [];
      for (const excId of extracoesSelecionadas) {
        for (const item of itens) {
          // O valor se rateado precisa ser dividido localmente ou o backend faz isso?
          // O backend da regra no BilheteRestService.php não parece dividir localmente o valor rateado.
          // Para o MVP: assumimos que o "valor_palpite" enviado é o valor final por jogo
          const valor = ratearExtracoes
            ? item.valor_palpite / extracoesSelecionadas.length
            : item.valor_palpite;

          jogosPayload.push({
            sorteio_id: excId, // Na API é sorteio_id
            modalidade_id: item.modalidade.id,
            palpites: item.palpites,
            colocacao_inicial: item.colocacao_inicial,
            colocacao_final: item.colocacao_final,
            valor_palpite: valor
          });
        }
      }

      const payload = {
        data: {
          terminal_id: 1, // Fixado para MVP
          jogos: jogosPayload
        }
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

  if (reciboData) {
    return (
      <Modal visible animationType="slide">
        <Screen contentClassName="bg-white" className="p-4">
          <PuleTermica data={reciboData} onFechar={() => {
            setReciboData(null);
            router.dismissAll();
          }} />
        </Screen>
      </Modal>
    );
  }

  return (
    <Screen safe="withHeader" className="p-4">
      <ScrollView>
        <Text className="text-xl font-bold text-gray-800 mb-4">Revisar Apostas</Text>

        {itens.length === 0 ? (
          <View className="bg-white p-6 rounded-xl border border-gray-200 items-center">
            <Text className="text-gray-500">Nenhuma aposta no carrinho.</Text>
          </View>
        ) : (
          itens.map((item) => (
            <View key={item.id_interno} className="bg-white p-4 rounded-xl border border-gray-200 mb-3 shadow-sm flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-bold text-gray-800 text-lg">
                  {item.modalidade.nome} <Text className="font-normal text-gray-500">({item.colocacao_inicial}º ao {item.colocacao_final}º)</Text>
                </Text>
                <Text className="text-blue-600 font-bold tracking-widest mt-1">{item.palpites.join(', ')}</Text>
                <Text className="text-gray-500 mt-2 text-xs">
                  {item.bitT_rateado ? 'Rateado' : 'Por Cada'} • R$ {item.valor_palpite.toFixed(2).replace('.', ',')}
                </Text>
              </View>
              <View className="items-end">
                <TouchableOpacity onPress={() => removerItem(item.id_interno)} className="p-2">
                  <Ionicons name="trash-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
                <Text className="font-bold text-lg text-gray-800 mt-2">
                  R$ {item.total_item.toFixed(2).replace('.', ',')}
                </Text>
              </View>
            </View>
          ))
        )}

        <Text className="text-lg font-bold text-gray-800 mt-6 mb-4">Sorteios Disponíveis</Text>
        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
          {/* Data fake picker. Em producao usa-se datetimepicker */}
          <View className="flex-row items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <Text className="text-gray-600">Data do Sorteio</Text>
            <Text className="font-bold text-blue-600">{dataSorteio}</Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#3B82F6" />
          ) : extracoes.length === 0 ? (
            <Text className="text-gray-500 text-center">Nenhuma extração aberta para hoje.</Text>
          ) : (
            <View>
              {extracoes.map((ext) => {
                const isSelected = extracoesSelecionadas.includes(ext.extracao_id);
                return (
                  <TouchableOpacity
                    key={ext.extracao_id}
                    onPress={() => handleToggleExtracao(ext.extracao_id)}
                    className="flex-row items-center justify-between py-3"
                  >
                    <View>
                      <Text className={`font-bold ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                        {`Extração ${ext.descricao || ext.descricao_mobile}`}
                      </Text>
                      <Text className="text-xs text-gray-500">Até {ext.hora_limite}</Text>
                    </View>
                    <View className={`w-6 h-6 rounded-md border items-center justify-center
                      ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                      {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {extracoesSelecionadas.length > 1 && (
                <View className="flex-row items-center justify-between border-t border-gray-100 pt-4 mt-2">
                  <Text className="text-gray-700">Ratear Valor (Dividir entre as extrações?)</Text>
                  <Switch value={ratearExtracoes} onValueChange={setRatearExtracoes} />
                </View>
              )}
            </View>
          )}
        </View>

        <View className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
          <View className="flex-row justify-between mb-2">
            <Text className="text-blue-800">Subtotal</Text>
            <Text className="text-blue-800 font-bold">R$ {getTotalEstimado().toFixed(2).replace('.', ',')}</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-blue-800">Multiplicador</Text>
            <Text className="text-blue-800 font-bold">x {ratearExtracoes ? 1 : Math.max(1, extracoesSelecionadas.length)} extração(ões)</Text>
          </View>
          <View className="flex-row justify-between border-t border-blue-200 pt-4">
            <Text className="text-blue-900 font-bold text-lg">Total do Bilhete</Text>
            <Text className="text-blue-900 font-black text-2xl">R$ {calcularTotalFinal().toFixed(2).replace('.', ',')}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleConfirmar}
          disabled={loading || itens.length === 0 || extracoesSelecionadas.length === 0}
          className={`h-14 rounded-xl items-center justify-center shadow-sm mb-12 flex-row
            ${(loading || itens.length === 0 || extracoesSelecionadas.length === 0) ? 'bg-gray-300' : 'bg-green-600'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" className="mr-2" />
          ) : (
            <Ionicons name="checkmark-circle-outline" size={24} color="white" className="mr-2" />
          )}
          <Text className="text-white text-lg font-bold">
            {loading ? 'Registrando...' : 'Confirmar e Enviar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}
