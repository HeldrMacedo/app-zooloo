import { AuthProvider, useAuth } from '@/context/AuthContext'; // Importar AuthProvider e useAuth
import { CarrinhoProvider } from '@/context/CarrinhoContext';
import { SYSTEM_BAR_COLOR } from '@/constants/system-bars';
import { useSystemBars } from '@/hooks/use-system-bars';
import { SplashScreen, Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import '../assets/styles/global.css';

// Previne que o splash screen desapareça automaticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // SafeAreaProvider no root garante insets corretos em todas as telas.
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CarrinhoProvider>
          <RootLayoutNav />
        </CarrinhoProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth(); // Obter estado do contexto

  // Cor padrão das barras do sistema no app (cada Screen reforça ao focar).
  useSystemBars({ color: SYSTEM_BAR_COLOR, style: 'light' });

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
      router.replace(isAuthenticated ? '/(tabs)' : '/login');
    }
  }, [isLoading, isAuthenticated]);

  // Não renderizar nada até que o estado de carregamento inicial seja resolvido
  // e a navegação inicial ocorra. O SplashScreen cobre a tela.
  if (isLoading) {
     return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="aposta" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}