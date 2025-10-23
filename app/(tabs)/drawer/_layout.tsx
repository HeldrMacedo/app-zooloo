import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

// Componente customizado do conteúdo do drawer
function CustomDrawerContent(props: any) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#fff" />
          </View>
          <Text style={styles.userName}>Usuário</Text>
          <Text style={styles.userEmail}>usuario@exemplo.com</Text>
        </View>
      </View>

      <View style={styles.drawerContent}>
        <DrawerItem
          label="Home"
          icon={({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          )}
          onPress={() => router.push('/(tabs)')}
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
        />
        
        <DrawerItem
          label="Perfil"
          icon={({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          )}
          onPress={() => {
            // Implementar navegação para perfil
            console.log('Navegar para perfil');
          }}
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
        />
        
        <DrawerItem
          label="Configurações"
          icon={({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          )}
          onPress={() => {
            // Implementar navegação para configurações
            console.log('Navegar para configurações');
          }}
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
        />
        
        <DrawerItem
          label="Notificações"
          icon={({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          )}
          onPress={() => {
            // Implementar navegação para notificações
            console.log('Navegar para notificações');
          }}
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
        />
        
        <View style={styles.divider} />
        
        <DrawerItem
          label="Ajuda"
          icon={({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          )}
          onPress={() => {
            // Implementar navegação para ajuda
            console.log('Navegar para ajuda');
          }}
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
        />
        
        <DrawerItem
          label="Sobre"
          icon={({ color, size }) => (
            <Ionicons name="information-circle-outline" size={size} color={color} />
          )}
          onPress={() => {
            // Implementar navegação para sobre
            console.log('Navegar para sobre');
          }}
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
        />
      </View>

      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
        drawerActiveTintColor: '#007AFF',
        drawerInactiveTintColor: '#666',
        drawerPosition: 'left',
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Home',
          title: 'Home',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerHeader: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
  },
  drawerItem: {
    marginHorizontal: 10,
    borderRadius: 8,
  },
  drawerItemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  drawerFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B6B',
  },
});