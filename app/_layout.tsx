import { AuthProvider, useAuth } from '@/context/AuthContext'; // Importar AuthProvider e useAuth
import { CarrinhoProvider } from '@/context/CarrinhoContext';
import { SYSTEM_BAR_COLOR } from '@/constants/system-bars';
import { useSystemBars } from '@/hooks/use-system-bars';
import { SplashScreen, Stack, router, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

// Previne que o splash screen desapareça automaticamente
SplashScreen.preventAutoHideAsync();

/** Rotas acessíveis sem autenticação (login + serial do terminal). */
const PUBLIC_ROUTES = new Set(['login', 'terminal']);

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
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  // Cor padrão das barras do sistema no app (cada Screen reforça ao focar).
  useSystemBars({ color: SYSTEM_BAR_COLOR, style: 'light' });

  useEffect(() => {
    if (isLoading) return;

    SplashScreen.hideAsync();

    const root = segments[0] as string | undefined;
    const onPublicRoute = root != null && PUBLIC_ROUTES.has(root);

    if (isAuthenticated) {
      // Já autenticado: se estiver em rota pública de auth, vai para home.
      if (onPublicRoute) {
        router.replace('/(tabs)');
      }
      return;
    }

    // Não autenticado: não force /login se já estiver em rota pública (ex.: /terminal).
    if (!onPublicRoute) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, segments]);

  // Não renderizar nada até que o estado de carregamento inicial seja resolvido
  // e a navegação inicial ocorra. O SplashScreen cobre a tela.
  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="terminal" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="aposta" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
