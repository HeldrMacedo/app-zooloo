import { Screen } from '@/components/ui/screen';
import { validarMilhar } from '@/utils/apostaHelpers';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function MilharScreen() {
  const params = useLocalSearchParams();
  const modalidadeId = Number(params.id) || 2;
  const modalidadeNome = params.nome as string || 'MILHAR';
  const modalidadeSigla = params.sigla as string || 'M';
  const digitosReq = Number(params.digitos) || 4;

  const [palpite, setPalpite] = useState('');
  const [palpitesAdicionados, setPalpitesAdicionados] = useState<string[]>([]);
  const [error, setError] = useState('');

  const tryAddPalpite = useCallback((valor: string) => {
    if (!validarMilhar(valor, digitosReq)) {
      setError(`O palpite deve ter exatamente ${digitosReq} dígitos numéricos.`);
      return;
    }

    setPalpitesAdicionados((prev) => {
      // if (prev.includes(valor)) {
      //   setError('Este palpite já foi adicionado.');
      //   return prev;
      // }
      setError('');
      return [...prev, valor];
    });
    // Limpa o campo para o próximo palpite (milhar, centena, dezena, etc.)
    setPalpite('');
  }, [digitosReq]);

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
        palpites: JSON.stringify(palpitesConfirmados)
      }
    });
  };

  const handleChangePalpite = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, digitosReq);
    setError('');

    if (cleaned.length === digitosReq) {
      // Completou a quantidade de dígitos da modalidade: adiciona automaticamente
      tryAddPalpite(cleaned);
    } else {
      setPalpite(cleaned);
    }
  };

  const placeholder = '0'.repeat(Math.max(digitosReq, 1));

  return (
    <Screen safe="withHeader">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
          <Text className="text-xl font-bold text-gray-800 mb-2">
            {modalidadeNome} ({modalidadeSigla})
          </Text>
          <Text className="text-gray-500 mb-6">
            Digite {digitosReq} números para formar seu palpite. O palpite é adicionado automaticamente.
          </Text>

          <View className="mb-4">
            <View className="flex-row items-center border border-gray-300 bg-white rounded-lg px-4 h-14">
              <TextInput
                className="flex-1 text-2xl font-bold text-gray-800 tracking-widest text-center"
                keyboardType="number-pad"
                maxLength={digitosReq}
                value={palpite}
                onChangeText={handleChangePalpite}
                placeholder={placeholder}
                autoFocus
              />
            </View>
            {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}
          </View>

          {palpitesAdicionados.length > 0 && (
            <View className="mt-4 mb-8">
              <Text className="text-sm font-semibold text-gray-600 mb-2">Palpites Atuais:</Text>
              <View className="flex-row flex-wrap">
                {palpitesAdicionados.map((p, idx) => (
                  <TouchableOpacity
                    key={`${p}-${idx}`}
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
              ${palpitesAdicionados.length > 0 ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <Text className="text-white text-lg font-bold">Próximo</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
