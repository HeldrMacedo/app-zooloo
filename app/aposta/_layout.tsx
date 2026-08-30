import { colors } from '@/assets/styles/colors';
import { Stack } from 'expo-router';

export default function ApostaLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.brand.system,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="modalidades"
        options={{ title: 'JB', headerBackTitle: 'Voltar' }}
      />
      <Stack.Screen
        name="milhar"
        options={{ title: 'Digite o Palpite', headerBackTitle: 'Voltar' }}
      />
      <Stack.Screen
        name="premios"
        options={{ title: 'Prêmios e Valor', headerBackTitle: 'Voltar' }}
      />
      <Stack.Screen
        name="preview"
        options={{ title: 'Carrinho', headerBackTitle: 'Voltar' }}
      />
    </Stack>
  );
}
