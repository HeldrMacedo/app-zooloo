/*
 * Caminho: heldrmacedo/app-zooloo/app-zooloo-feature-menu-drawer/app/(tabs)/index.tsx
 */
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'; // Usar ScrollView se necessário
// Importe o Wrapper que contém a CustomBottomTab
import { TabLayoutWrapper } from '@/components/TabLayoutWrapper'; // Ajuste o caminho se necessário

export default function HomeScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      // O wrapper pode ter um fundo, então o loading pode ser simples
      <TabLayoutWrapper>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </TabLayoutWrapper>
    );
  }

  // Não precisa verificar isAuthenticated aqui, pois _layout já garante

  return (
    <TabLayoutWrapper>
      {/* Usar ScrollView se o conteúdo puder exceder a altura da tela */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
              {/* Botão de Logout está no Drawer */}
            </View>
            <View className="border-t border-gray-200 pt-4">
              <Text className="text-sm text-gray-600 mb-1">Login:</Text>
              <Text className="text-base font-medium text-gray-900 mb-3">
                  {user?.login}
              </Text>
              <Text className="text-sm text-gray-600 mb-1">Status:</Text>
              <View className="flex-row items-center">
                  <View className={`w-2 h-2 rounded-full mr-2 ${user?.active === 'Y' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <Text className={`text-sm font-medium ${user?.active === 'Y' ? 'text-green-600' : 'text-red-600'}`}>
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
      </ScrollView>
    </TabLayoutWrapper>
  );
}