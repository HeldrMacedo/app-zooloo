import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Deseja realmente sair do aplicativo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <Screen safe="withTabBar" className="justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </Screen>
    );
  }

  return (
    <Screen safe="withTabBar">
      <View className="flex-1 p-6">
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Olá, {user?.nome || 'Vendedor'}</Text>
            <Text className="text-gray-500">O que deseja fazer hoje?</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} className="p-3 bg-red-50 rounded-full">
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          <TouchableOpacity
            onPress={() => router.push('/aposta/modalidades')}
            className="bg-blue-600 rounded-2xl p-6 shadow-sm flex-row items-center justify-between"
          >
            <View>
              <Text className="text-white text-2xl font-bold mb-1">Jogo do Bicho</Text>
              <Text className="text-blue-100">Faça sua aposta agora</Text>
            </View>
            <View className="bg-blue-500 p-3 rounded-full">
              <Ionicons name="dice-outline" size={32} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}
