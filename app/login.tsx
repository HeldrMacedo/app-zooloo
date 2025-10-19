import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AuthService from '@/services/auth';
import { useAuth } from '@/hooks/use-auth';

export default function LoginScreen() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!login.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.login({
        login: login.trim(),
        password: password.trim(),
      });

      if (response.success) {
        // Aguardar um pouco para o hook useAuth atualizar
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      }
    } catch (error) {
      Alert.alert(
        'Erro no Login',
        error instanceof Error ? error.message : 'Erro desconhecido'
      );
    } finally {
      setIsLoading(false);
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
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo/Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-center text-gray-900 mb-2">
              Bem-vindo
            </Text>
            <Text className="text-base text-center text-gray-600">
              Faça login para continuar
            </Text>
          </View>

          {/* Login Form */}
          <View className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            {/* Login Field */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Usuário
              </Text>
              <TextInput
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:border-blue-500 focus:bg-white"
                placeholder="Digite seu usuário"
                value={login}
                onChangeText={setLogin}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Password Field */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Senha
              </Text>
              <TextInput
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:border-blue-500 focus:bg-white"
                placeholder="Digite sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`w-full py-4 rounded-lg ${
                isLoading
                  ? 'bg-gray-400'
                  : 'bg-blue-600 active:bg-blue-700'
              }`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
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

          {/* Additional Info */}
          <View className="items-center">
            <Text className="text-sm text-gray-500 text-center">
              Problemas para acessar?{'\n'}
              Entre em contato com o administrador
            </Text>
          </View>

          {/* Token Info */}
          <View className="mt-8 p-4 bg-blue-50 rounded-lg">
            <Text className="text-xs text-blue-600 text-center">
              🔒 Sessão segura com token JWT{'\n'}
              Validade: 24 horas
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}