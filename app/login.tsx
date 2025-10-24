import { useAuth } from '@/context/AuthContext'; // Usar o contexto
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function LoginScreen() {
  const [loginInput, setLoginInput] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth(); // Obter apenas a função login

  // O useEffect de redirecionamento foi movido para _layout.tsx

  const handleLogin = async () => {
    if (!loginInput.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }
    setIsSubmitting(true);
    try {
      await login({ login: loginInput.trim(), password: password.trim() });
      // Não precisa mais de router.replace aqui, o _layout tratará disso
    } catch (error) {
      Alert.alert('Erro no Login', error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center px-6 py-12">
          {/* Header */}
          <View className="mb-8 items-center">
            <Text className="text-3xl font-bold text-center text-[#495057] mb-2">
              Bem-vindo
            </Text>
            <Text className="text-base text-center text-gray-600">
              Faça login para continuar
            </Text>
          </View>

          {/* Login Form */}
          <View className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Login
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 bg-white"
                placeholder="Digite seu login"
                value={loginInput}
                onChangeText={setLoginInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Senha
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 bg-white"
                placeholder="Digite sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              className={`w-full py-4 rounded-lg ${
                isSubmitting
                  ? 'bg-gray-400'
                  : 'bg-[#1F319D] active:bg-[#1F319D]'
              }`}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View className="flex-row justify-center items-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-semibold text-base ml-2">
                    Entrando...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-base text-center">
                  Entrar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}