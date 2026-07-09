import { useCarrinho } from '@/context/CarrinhoContext';
import { calcularTotalAposta } from '@/utils/apostaHelpers';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const modalidadeNome = params.modalidadeNome as string || 'MILHAR';
  const modalidadeSigla = params.modalidadeSigla as string || 'M';
  const palpitesStr = params.palpites as string || '[]';
  const palpites: string[] = JSON.parse(palpitesStr);

  const [listaIntervalos, setListaIntervalos] = useState<IntervaloAdicionado[]>([]);
  const [premiosSelecionados, setPremiosSelecionados] = useState<number[]>([1]); // começa com 1 selecionado
  const [rateado, setRateado] = useState(false); // bitT: false = cada, true = rateado
  const [valorStr, setValorStr] = useState('');

  const valorDecimal = Number(valorStr.replace(',', '.')) || 0;

  const handlePressPremio = (num: number) => {
    // Modo livre simplificado: toggle na seleção.
    // Para simplificar a lógica de "contíguo", assumimos que o app envia o menor e maior,
    // mas a regra do MVP fala em colocar array. A API espera `colocacao_inicial` e `colocacao_final`.
    // Então, para esta tela, se o usuário seleciona não contínuo, pegaremos min e max,
    // e preencheremos o meio para garantir a regra da API.

    let novos = [...premiosSelecionados];
    if (novos.includes(num)) {
      novos = novos.filter((n) => n !== num);
    } else {
      novos.push(num);
    }

    if (novos.length === 0) novos = [1]; // não permite zerar

    novos.sort((a, b) => a - b);

    // Forçar contiguidade baseado em min e max para envio à API
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
    setValorStr(''); // limpa o valor para evitar duplicação acidental
  };

  const removerIntervalo = (id: string) => {
    setListaIntervalos(listaIntervalos.filter((i) => i.id !== id));
  };

  const handleAdicionar = () => {
    let intervalos = [...listaIntervalos];

    // Se a lista está vazia, tentar auto-adicionar o que está na tela
    if (intervalos.length === 0) {
      if (valorDecimal <= 0) {
        alert('Adicione pelo menos um intervalo válido.');
        return;
      }
      intervalos = [{
        id: 'temp',
        minPremio,
        maxPremio,
        valorDecimal,
        total: totalOpcaoAtual,
        rateado,
      }];
    }

    try {
      intervalos.forEach((intervalo) => {
        adicionarItem({
          modalidade: { id: modalidadeId, nome: modalidadeNome, sigla: modalidadeSigla, digitos: 4 },
          palpites,
          colocacao_inicial: intervalo.minPremio,
          colocacao_final: intervalo.maxPremio,
          valor_palpite: intervalo.valorDecimal,
          total_item: intervalo.total,
          bitT_rateado: intervalo.rateado,
        });
      });

      // Volta pra raiz para poder adicionar outro
      router.dismissAll();
      router.push('/aposta/modalidades');
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="mb-6">
          <Text className="text-gray-500 mb-1">Palpites ({modalidadeNome}):</Text>
          <Text className="text-lg font-bold text-gray-800 tracking-widest">{palpites.join(', ')}</Text>
        </View>

        <View className="mb-1">
          <Text className="text-gray-700 font-bold mb-3">Selecione os Prêmios (1º ao 10º): </Text>
          <View className="flex-row flex-wrap justify-between">
            {NUMEROS_PREMIO.map((num) => {
              const selecionado = premiosSelecionados.includes(num);
              return (
                <TouchableOpacity
                  key={num}
                  onPress={() => handlePressPremio(num)}
                  className={`w-[18%] aspect-square rounded-full items-center justify-center mb-3 shadow-sm
                    ${selecionado ? 'bg-blue-600' : 'bg-white border border-gray-200'}`}
                >
                  <Text className={`text-lg font-bold ${selecionado ? 'text-white' : 'text-gray-600'}`}>
                    {num}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <View className="flex-row items-center"><Text>Resetar: </Text><Pressable onPress={() => setPremiosSelecionados([1])}><Ionicons name="sync" size={24} color="black" /></Pressable></View>
          </View>
          <Text className="text-xs text-gray-500 text-center mt-1">
            Do {minPremio}º ao {maxPremio}º prêmio.
          </Text>
        </View>

        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-700 font-bold">Modo de Valor</Text>
            <View className="flex-row items-center">
              <Text className={`mr-2 ${!rateado ? 'font-bold text-blue-600' : 'text-gray-400'}`}>Por Cada</Text>
              <Switch
                value={rateado}
                onValueChange={setRateado}
                trackColor={{ false: '#3B82F6', true: '#10B981' }}
                thumbColor="#ffffff"
              />
              <Text className={`ml-2 ${rateado ? 'font-bold text-green-600' : 'text-gray-400'}`}>Rateado</Text>
            </View>
          </View>

          <Text className="text-gray-700 font-bold mb-2">Valor da Aposta (R$):</Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 rounded-lg h-14 px-4 text-2xl font-bold text-gray-800"
            keyboardType="numeric"
            value={valorStr}
            onChangeText={(t) => setValorStr(t.replace(/[^0-9,.]/g, '').replace('.', ','))}
            placeholder="0,00"
          />

          <TouchableOpacity
            onPress={handleAdicionarIntervalo}
            className={`mt-4 h-12 rounded-xl items-center justify-center shadow-sm ${valorDecimal > 0 ? 'bg-blue-600' : 'bg-gray-300'}`}
            disabled={valorDecimal <= 0}
          >
            <Text className="text-white font-bold">Adicionar Intervalo</Text>
          </TouchableOpacity>
        </View>

        {listaIntervalos.length > 0 && (
          <View className="mb-6">
            <Text className="text-gray-700 font-bold mb-3">Intervalos Adicionados:</Text>
            {listaIntervalos.map((item) => (
              <View key={item.id} className="bg-white p-3 rounded-xl border border-gray-200 mb-2 shadow-sm flex-row justify-between items-center">
                <View>
                  <Text className="font-bold text-gray-800">
                    {item.minPremio}º ao {item.maxPremio}º <Text className="font-normal text-gray-500">• {item.rateado ? 'Rateado' : 'Por Cada'}</Text>
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    Valor: R$ {item.valorDecimal.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
                <View className="items-end">
                  <TouchableOpacity onPress={() => removerIntervalo(item.id)} className="p-1 mb-1">
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                  <Text className="font-bold text-blue-800">
                    R$ {item.total.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View className="bg-blue-50 p-4 rounded-xl mb-8 flex-row justify-between items-center border border-blue-100">
          <Text className="text-blue-800 font-bold">Total Estimado:</Text>
          <Text className="text-2xl font-black text-blue-900">
            R$ {totalGeral.toFixed(2).replace('.', ',')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleAdicionar}
          className={`h-14 rounded-xl items-center justify-center shadow-sm flex-row ${(listaIntervalos.length > 0 || valorDecimal > 0) ? 'bg-green-600' : 'bg-gray-300'}`}
          disabled={listaIntervalos.length === 0 && valorDecimal <= 0}
        >
          <Ionicons name="cart-outline" size={24} color="white" className="mr-2" />
          <Text className="text-white text-lg font-bold">Adicionar ao Carrinho</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
