import { useAuth } from '@/context/AuthContext'; // Ajuste o caminho se necessário
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { logout, user } = useAuth(); 

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#fff" />
          </View>
          <Text style={styles.userName}>{user?.name || 'Utilizador'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@exemplo.com'}</Text>
        </View>
      </View>

      <View style={styles.drawerContent}>
        <DrawerItem
          label="Home"
          icon={({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          )}
          onPress={() => {
            props.navigation.closeDrawer();
            router.push('/(tabs)'); 
          }}
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
        />
        {/* Adicione outros DrawerItems aqui */}
         <DrawerItem
          label="Profile"
          icon={({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          )}
          onPress={() => {
            props.navigation.closeDrawer();
            console.log('Navigate to profile');
             // Ex: router.push('/profile'); // Se tiver essa rota
          }}
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
        />
         <DrawerItem
          label="Settings"
          icon={({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          )}
          onPress={() => {
            props.navigation.closeDrawer();
            console.log('Navigate to settings');
             // Ex: router.push('/settings');
          }}
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
        />
        {/* ... mais itens ... */}
        <View style={styles.divider} />
         <DrawerItem
          label="Help"
          icon={({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          )}
          onPress={() => { /* ... */ }}
          labelStyle={styles.drawerItemLabel} style={styles.drawerItem}
        />
         <DrawerItem
          label="About"
          icon={({ color, size }) => (
            <Ionicons name="information-circle-outline" size={size} color={color} />
          )}
          onPress={() => { /* ... */ }}
          labelStyle={styles.drawerItemLabel} style={styles.drawerItem}
        />
      </View>

      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

// --- COMPONENTE PRINCIPAL DO LAYOUT ---
export default function TabLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // Esconde o header padrão do Drawer
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
        drawerActiveTintColor: '#007AFF',
        drawerInactiveTintColor: '#666',
        drawerPosition: 'left',
        // swipeEnabled: true, // Habilitar gesto de swipe se desejar
        // gestureHandlerProps: { /* props adicionais se necessário */ },
      }}
    >
      {/* A Screen aqui APENAS configura a rota 'index' para o Drawer */}
      <Drawer.Screen
        name="index" // Corresponde ao ficheiro app/(tabs)/index.tsx
        options={{
          drawerLabel: 'Home',
          title: 'Home', // Título que pode aparecer no header (se estivesse visível)
        }}
        // SEM 'component' ou 'children'
      />
      {/* Adicione outras Drawer.Screen aqui para outras rotas DENTRO do (tabs)
          que devem aparecer no Drawer menu, por exemplo:
      <Drawer.Screen
        name="profile" // Corresponderia a app/(tabs)/profile.tsx
        options={{
          drawerLabel: 'Profile',
          title: 'Perfil',
        }}
      />
      */}
    </Drawer>
  );
}

// Estilos (mantidos da versão anterior, relevantes para o DrawerContent)
const styles = StyleSheet.create({
  // ... (Estilos para drawerContainer, drawerHeader, profileSection, avatar, etc.) ...
  // --- Estilos do Drawer ---
  drawerContainer: { flex: 1, backgroundColor: '#fff', },
  drawerHeader: { backgroundColor: '#007AFF', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, },
  profileSection: { alignItems: 'center', },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 10, },
  userName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4, },
  userEmail: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, },
  drawerContent: { flex: 1, paddingTop: 10, },
  drawerItem: { marginHorizontal: 10, borderRadius: 8, marginVertical: 2, },
  drawerItemLabel: { fontSize: 15, fontWeight: '500', marginLeft: -16, },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E0E0E0', marginVertical: 15, marginHorizontal: 20, },
  drawerFooter: { padding: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E0E0E0', },
  logoutButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#FFF1F1', },
  logoutText: { marginLeft: 10, fontSize: 15, fontWeight: '500', color: '#FF4D4D', },
  // Os estilos da CustomBottomTab, CircularActionButton NÃO são mais necessários AQUI
});