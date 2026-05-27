import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { calcularTotalAposta } from '@/utils/apostaHelpers';
import { useCarrinho } from '@/context/CarrinhoContext';

const NUMEROS_PREMIO = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function PremiosScreen() {
  const params = useLocalSearchParams();
  const { adicionarItem } = useCarrinho();
  
  const modalidadeId = Number(params.modalidadeId) || 2;
  const modalidadeNome = params.modalidadeNome as string || 'MILHAR';
  const modalidadeSigla = params.modalidadeSigla as string || 'M';
  const palpitesStr = params.palpites as string || '[]';
  const palpites: string[] = JSON.parse(palpitesStr);

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

  const totalCalculado = useMemo(() => {
    // O valor digitado é por palpite. Se tiver 2 palpites, multiplica por 2 no totalEstimado?
    // A regra diz: Valor da Aposta (Total_Item) = (Valor * QtdPremios) * QtdePalpites
    // Mas se for rateado: Valor da Aposta = Valor * QtdePalpites
    const subTotal = calcularTotalAposta(valorDecimal, minPremio, maxPremio, rateado);
    return subTotal * palpites.length;
  }, [valorDecimal, minPremio, maxPremio, rateado, palpites.length]);

  const handleAdicionar = () => {
    if (valorDecimal <= 0) {
      alert('Digite um valor maior que zero.');
      return;
    }

    try {
      adicionarItem({
        modalidade: { id: modalidadeId, nome: modalidadeNome, sigla: modalidadeSigla, digitos: 4 },
        palpites,
        colocacao_inicial: minPremio,
        colocacao_final: maxPremio,
        valor_palpite: valorDecimal,
        total_item: totalCalculado,
        bitT_rateado: rateado,
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

        <View className="mb-6">
          <Text className="text-gray-700 font-bold mb-3">Selecione os Prêmios (1º ao 10º):</Text>
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
          </View>
          <Text className="text-xs text-gray-500 text-center mt-2">
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
        </View>

        <View className="bg-blue-50 p-4 rounded-xl mb-8 flex-row justify-between items-center border border-blue-100">
          <Text className="text-blue-800 font-bold">Total Estimado:</Text>
          <Text className="text-2xl font-black text-blue-900">
            R$ {totalCalculado.toFixed(2).replace('.', ',')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleAdicionar}
          className={`h-14 rounded-xl items-center justify-center shadow-sm ${valorDecimal > 0 ? 'bg-green-600' : 'bg-gray-300'}`}
          disabled={valorDecimal <= 0}
        >
          <Text className="text-white text-lg font-bold">Adicionar ao Carrinho</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
