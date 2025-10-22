import { useAuth } from '@/context/AuthContext'; // Usar o contexto
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, TouchableOpacity, View } from 'react-native';
// Não precisa mais do router aqui para redirecionar para login

export default function HomeScreen() {
  // Obter user e logout do contexto. isLoading e isAuthenticated não são estritamente necessários aqui
  // porque o _layout já garante que esta tela só é mostrada se autenticado.
  const { user, logout, isLoading } = useAuth(); // Mantemos isLoading para o estado inicial

  // O useEffect de redirecionamento foi movido para _layout.tsx

  const handleLogout = () => {
    Alert.alert( 'Logout', 'Deseja realmente sair do aplicativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: async () => {
            await logout(); // Chama o logout do contexto
            // Não precisa mais de router.replace aqui
          },
        },
      ]
    );
  };

  // O _layout agora mostra o SplashScreen durante o isLoading inicial.
  // Poderia adicionar um loading aqui se houver carregamento *específico* desta tela,
  // mas o carregamento inicial de auth é tratado acima. Se chegar aqui e isLoading ainda for true
  // (improvável devido ao _layout), pode mostrar um loading.
   if (isLoading) {
     return (
       <View className="flex-1 justify-center items-center bg-gray-50">
         <ActivityIndicator size="large" color="#3B82F6" />
       </View>
     );
   }

  // Se chegou aqui, o utilizador está autenticado (garantido pelo _layout)
  return (
    <View className="flex-1 bg-gray-50 p-6">
       {/* ... (resto da UI como antes, usando user) ... */}
        <TouchableOpacity
            onPress={handleLogout}
            className="p-2 bg-red-50 rounded-lg"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
        {/* ... */}
    </View>
  );
}