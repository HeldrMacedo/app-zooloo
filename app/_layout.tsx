import { AuthProvider, useAuth } from '@/context/AuthContext'; // Importar AuthProvider e useAuth
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SplashScreen, Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../assets/styles/global.css';

// Previne que o splash screen desapareça automaticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Envolve tudo com o AuthProvider
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth(); // Obter estado do contexto

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
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {/*
         O Slot aqui renderizará ou a tela de Login ou o Layout das Tabs,
         dependendo da navegação controlada pelo useEffect acima.
         Se você tiver um Stack principal, use-o aqui.
         Se as tabs e o login forem rotas de nível superior, Slot está correto.
         Considerando a estrutura, talvez um Stack seja mais apropriado
         para definir as telas de login e (tabs).
      */}
       <Stack screenOptions={{ headerShown: false }}>
         <Stack.Screen name="login" />
         <Stack.Screen name="(tabs)" />
         {/* Adicione outras telas de nível superior se houver, como 'modal' */}
         <Stack.Screen name="modal" options={{ presentation: 'modal' }}/>
       </Stack>
      {/* <Slot /> */}
    </>
  );
}