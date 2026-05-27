import { Stack } from 'expo-router';

export default function ApostaLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="modalidades" 
        options={{ title: 'Jogo do Bicho', headerBackTitle: 'Voltar' }} 
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
