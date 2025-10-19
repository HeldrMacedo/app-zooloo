import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Deseja realmente sair do aplicativo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50 p-6">
      {/* Header */}
      <View className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="person" size={24} color="#3B82F6" />
            </View>
            <View>
              <Text className="text-lg font-bold text-gray-900">
                Olá, {user?.name || 'Usuário'}!
              </Text>
              <Text className="text-sm text-gray-600">
                {user?.email}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="p-2 bg-red-50 rounded-lg"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
        
        <View className="border-t border-gray-200 pt-4">
          <Text className="text-sm text-gray-600 mb-1">Login:</Text>
          <Text className="text-base font-medium text-gray-900 mb-3">
            {user?.login}
          </Text>
          
          <Text className="text-sm text-gray-600 mb-1">Status:</Text>
          <View className="flex-row items-center">
            <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            <Text className="text-sm font-medium text-green-600">
              {user?.active === 'Y' ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        </View>
      </View>

      {/* Welcome Message */}
      <View className="bg-blue-50 rounded-2xl p-6 mb-6">
        <View className="flex-row items-center mb-3">
          <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
          <Text className="text-lg font-semibold text-blue-900 ml-2">
            Login realizado com sucesso!
          </Text>
        </View>
        <Text className="text-blue-700">
          Você está autenticado no sistema com token JWT válido por 24 horas.
        </Text>
      </View>

      {/* App Info */}
      <View className="bg-white rounded-2xl shadow-lg p-6">
        <Text className="text-lg font-bold text-gray-900 mb-4">
          Informações do App
        </Text>
        
        <View className="space-y-3">
          <View className="flex-row items-center">
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text className="text-gray-700 ml-3">Autenticação JWT segura</Text>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="time" size={20} color="#F59E0B" />
            <Text className="text-gray-700 ml-3">Sessão válida por 24 horas</Text>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="refresh" size={20} color="#3B82F6" />
            <Text className="text-gray-700 ml-3">Renovação automática de token</Text>
          </View>
        </View>
      </View>
    </View>
  );
}


