import { colors } from '@/assets/styles/colors';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { logout, isLoading } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Deseja realmente sair do aplicativo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <Screen safe="withTabBar" contentStyle={styles.loadingContent}>
        <ActivityIndicator size="large" color={colors.black} />
      </Screen>
    );
  }

  return (
    <Screen safe="withTabBar">
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, Helder</Text>
            <Text style={styles.subtitle}>O que deseja fazer hoje?</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={colors.danger.DEFAULT} />
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => router.push('/aposta/modalidades')}
            style={styles.gameCard}
            activeOpacity={0.85}
          >
            <View>
              <Text style={styles.gameTitle}>Jogo do Bicho</Text>
              <Text style={styles.gameSubtitle}>Faça sua aposta agora</Text>
            </View>
            <View style={styles.gameIconWrap}>
              <Ionicons name="dice-outline" size={32} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
  },
  subtitle: {
    color: colors.text.muted,
    marginTop: 2,
  },
  logoutButton: {
    padding: 12,
    backgroundColor: colors.red[50],
    borderRadius: 999,
  },
  actions: {
    flex: 1,
  },
  gameCard: {
    backgroundColor: colors.blue[600],
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  gameTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  gameSubtitle: {
    color: colors.blue[100],
  },
  gameIconWrap: {
    backgroundColor: colors.blue[500],
    padding: 12,
    borderRadius: 999,
  },
});
