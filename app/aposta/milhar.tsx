import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { validarMilhar } from '@/utils/apostaHelpers';

export default function MilharScreen() {
  const params = useLocalSearchParams();
  const modalidadeId = Number(params.id) || 2;
  const modalidadeNome = params.nome as string || 'MILHAR';
  const modalidadeSigla = params.sigla as string || 'M';
  const digitosReq = Number(params.digitos) || 4;

  const [palpite, setPalpite] = useState('');
  const [palpitesAdicionados, setPalpitesAdicionados] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleAddPalpite = () => {
    if (!validarMilhar(palpite)) {
      setError(`O palpite deve ter exatamente ${digitosReq} dígitos numéricos.`);
      return;
    }
    if (palpitesAdicionados.includes(palpite)) {
      setError('Este palpite já foi adicionado.');
      return;
    }
    setPalpitesAdicionados([...palpitesAdicionados, palpite]);
    setPalpite('');
    setError('');
  };

  const handleRemovePalpite = (p: string) => {
    setPalpitesAdicionados(palpitesAdicionados.filter(item => item !== p));
  };

  const handleAvancar = () => {
    if (palpitesAdicionados.length === 0) {
      if (validarMilhar(palpite)) {
        // Se tem algo digitado mas não adicionado à lista, vamos usar ele.
        avancarParaPremios([palpite]);
      } else {
        setError('Adicione pelo menos um palpite válido.');
      }
      return;
    }
    
    // Avança passando a array de palpites confirmada
    avancarParaPremios(palpitesAdicionados);
  };

  const avancarParaPremios = (palpitesConfirmados: string[]) => {
    router.push({
      pathname: '/aposta/premios',
      params: { 
        modalidadeId, 
        modalidadeNome, 
        modalidadeSigla,
        palpites: JSON.stringify(palpitesConfirmados) 
      }
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
        <Text className="text-xl font-bold text-gray-800 mb-2">
          {modalidadeNome} ({modalidadeSigla})
        </Text>
        <Text className="text-gray-500 mb-6">
          Digite {digitosReq} números para formar seu palpite.
        </Text>

        <View className="mb-4">
          <View className="flex-row items-center border border-gray-300 bg-white rounded-lg px-4 h-14">
            <TextInput
              className="flex-1 text-2xl font-bold text-gray-800 tracking-widest text-center"
              keyboardType="number-pad"
              maxLength={digitosReq}
              value={palpite}
              onChangeText={(text) => {
                setPalpite(text.replace(/[^0-9]/g, ''));
                setError('');
              }}
              placeholder="0000"
              autoFocus
            />
            {palpite.length === digitosReq && (
              <TouchableOpacity onPress={handleAddPalpite} className="bg-blue-100 p-2 rounded ml-2">
                <Text className="text-blue-700 font-bold">ADD</Text>
              </TouchableOpacity>
            )}
          </View>
          {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}
        </View>

        {palpitesAdicionados.length > 0 && (
          <View className="mt-4 mb-8">
            <Text className="text-sm font-semibold text-gray-600 mb-2">Palpites Atuais:</Text>
            <View className="flex-row flex-wrap">
              {palpitesAdicionados.map((p, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => handleRemovePalpite(p)}
                  className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-full m-1 flex-row items-center"
                >
                  <Text className="text-blue-800 font-bold mr-2 tracking-widest">{p}</Text>
                  <Text className="text-red-400 font-bold text-xs">X</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View className="flex-1" />

        <TouchableOpacity
          onPress={handleAvancar}
          className={`h-14 rounded-xl items-center justify-center shadow-sm 
            ${(palpitesAdicionados.length > 0 || palpite.length === digitosReq) 
              ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
          <Text className="text-white text-lg font-bold">Próximo</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
