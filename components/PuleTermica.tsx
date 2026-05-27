import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BilheteRegistroResponse } from '@/types/aposta';

interface PuleTermicaProps {
  data: BilheteRegistroResponse;
  onFechar: () => void;
}

export default function PuleTermica({ data, onFechar }: PuleTermicaProps) {
  // PuleTérmica: simula uma largura de 32 a 48 colunas de impressora térmica
  // Monospaced text
  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold">Recibo Emitido</Text>
        <TouchableOpacity onPress={onFechar} className="p-2">
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={{ padding: 16, alignItems: 'center' }}>
        <View 
          className="bg-yellow-50 p-4 shadow-sm"
          style={{ width: '100%', maxWidth: 350, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}
        >
          <Text className="text-center font-bold text-lg mb-2" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
            *** JOGO DO BICHO ***
          </Text>
          <Text className="text-center text-xs mb-4" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
            Via do Cliente
          </Text>

          <Text className="text-sm mb-1" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
            DATA/HORA: {data.data_hora}
          </Text>
          <Text className="text-sm mb-1" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
            VENDEDOR: {data.vendedor_nome}
          </Text>
          <Text className="text-sm mb-1" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
            BILHETE : {data.bilhete_numero}
          </Text>
          <Text className="text-sm mb-4" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
            NSU     : {data.jb_id}
          </Text>

          <Text className="text-center font-bold text-sm mb-2" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
            --------------------------------
          </Text>

          <Text className="font-bold text-sm mb-2" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
            APOSTAS REGISTRADAS
          </Text>
          {/* O MVP retorna apenas resumo, mas na real viria detalhes ou apenas totalizamos */}
          <Text className="text-sm mb-4" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
            Consulte os detalhes no histórico.
          </Text>

          <Text className="text-center font-bold text-sm mb-2" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
            --------------------------------
          </Text>

          <View className="flex-row justify-between mb-4">
            <Text className="font-bold text-lg" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>TOTAL R$</Text>
            <Text className="font-bold text-lg" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
              {data.total_bilhete.toFixed(2).replace('.', ',')}
            </Text>
          </View>

          <Text className="text-center font-bold text-sm mt-4 mb-2" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
            HASH DE SEGURANÇA
          </Text>
          <Text className="text-center text-xs break-all" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
            {data.string_autorizacao}
          </Text>

          <Text className="text-center text-xs mt-6 text-gray-500" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
            Boa sorte!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
