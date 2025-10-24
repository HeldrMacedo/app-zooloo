import { AuthProvider, useAuth } from '@/context/AuthContext'; // Importar AuthProvider e useAuth
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SplashScreen, Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import '../assets/styles/global.css';

// Previne que o splash screen desapareça automaticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Envolve tudo com o AuthProvider
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaView>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth(); // Obter estado do contexto

  useEffect(() => {
    console.log(`RootLayoutNav Effect: isLoading=${isLoading}, isAuthenticated=${isAuthenticated}`);
    if (!isLoading) {
      SplashScreen.hideAsync(); // Esconde o splash screen quando a verificação inicial terminar
      if (isAuthenticated) {
        console.log("RootLayoutNav: Autenticado, garantindo que está em /tabs");
        // Se estiver autenticado, certifique-se de que está no grupo (tabs)
        // O router.replace pode ser redundante se a navegação inicial já o colocar lá,
        // mas garante que não fique preso no login se o estado mudar.
        router.replace('/(tabs)');
      } else {
        console.log("RootLayoutNav: Não autenticado, garantindo que está em /login");
        // Se não estiver autenticado, certifique-se de que está na tela de login
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated]); // Executa quando isLoading ou isAuthenticated mudam

  // Não renderizar nada até que o estado de carregamento inicial seja resolvido
  // e a navegação inicial ocorra. O SplashScreen cobre a tela.
  if (isLoading) {
     return null;
  }

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {/*
         O Stack aqui renderizará ou a tela de Login ou o Layout das Tabs com Drawer,
         dependendo da navegação controlada pelo useEffect acima.
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