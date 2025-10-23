import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Slot, usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Animation settings
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

const OFFSET = 60;

/**
 * Custom Drawer Content Component
 *
 * @param {DrawerContentComponentProps} props - Properties passed by React Navigation Drawer.
 * @returns {JSX.Element} The custom drawer content UI.
 */
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
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
          <Text style={styles.userName}>User</Text>
          <Text style={styles.userEmail}>user@example.com</Text>
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
        
        <DrawerItem
          label="Profile"
          icon={({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          )}
          onPress={() => {
            props.navigation.closeDrawer();
            console.log('Navigate to profile');
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
          }}
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
        />
        
        <DrawerItem
          label="Notifications"
          icon={({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          )}
          onPress={() => {
            props.navigation.closeDrawer();
            console.log('Navigate to notifications');
          }}
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
        />
        
        <View style={styles.divider} />
        
        <DrawerItem
          label="Help"
          icon={({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          )}
          onPress={() => {
            props.navigation.closeDrawer();
            console.log('Navigate to help');
          }}
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
        />
        
        <DrawerItem
          label="About"
          icon={({ color, size }) => (
            <Ionicons name="information-circle-outline" size={size} color={color} />
          )}
          onPress={() => {
            props.navigation.closeDrawer();
            console.log('Navigate to about');
          }}
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
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

const FloatingActionButton = ({ 
  isExpanded, 
  index, 
  icon, 
  onPress, 
  label 
}: {
  isExpanded: Animated.SharedValue<boolean>;
  index: number;
  icon: string;
  onPress: () => void;
  label: string;
}) => {
  const animatedStyles = useAnimatedStyle(() => {
    const moveValue = isExpanded.value ? OFFSET * (index + 1) : 0;
    const translateValue = withSpring(-moveValue, SPRING_CONFIG);
    const delay = index * 100;
    const scaleValue = isExpanded.value ? 1 : 0;
    
    return {
      transform: [
        { translateY: translateValue },
        { scale: withDelay(delay, withTiming(scaleValue, { duration: 200 })) },
      ],
    };
  });

  return (
    <AnimatedPressable 
      style={[animatedStyles, styles.floatingButton]}
      onPress={onPress}
      accessibilityLabel={label}
    >
      <Ionicons name={icon as any} size={20} color="#fff" />
    </AnimatedPressable>
  );
};

/**
 * Circular Action Button Component
 *
 * This component provides a main circular button that, when pressed, reveals several floating action buttons with a smooth animation.
 * It also shows a semi-transparent overlay on the background.
 *
 * @returns {JSX.Element} The circular action button UI.
 */
const CircularActionButton = () => {
  const isExpanded = useSharedValue(false);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    isExpanded.value = !isExpanded.value;
  };

  const plusIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isExpanded.value ? '45deg' : '0deg', { duration: 200 }) }],
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isExpanded.value ? 1.1 : 1, SPRING_CONFIG) }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isExpanded.value ? 0.7 : 0),
  }));

  const actions = [
    { icon: 'camera', label: 'Camera', onPress: () => console.log('Camera pressed') },
    { icon: 'add-circle', label: 'Add', onPress: () => console.log('Add pressed') },
    { icon: 'search', label: 'Search', onPress: () => console.log('Search pressed') },
  ];

  return (
    <>
      <AnimatedPressable
        style={[styles.overlay, overlayStyle]}
        onPress={() => (isExpanded.value = false)}
        pointerEvents={isExpanded.value ? 'auto' : 'none'}
      />
      <View style={styles.circularButtonContainer}>
        {actions.map((action, index) => (
          <FloatingActionButton
            key={action.label}
            isExpanded={isExpanded}
            index={index}
            icon={action.icon}
            onPress={() => {
              isExpanded.value = false;
              action.onPress();
            }}
            label={action.label}
          />
        ))}
        
        <AnimatedTouchableOpacity
          style={[styles.circularButton, backgroundStyle]}
          onPress={handlePress}
          accessibilityLabel="Action Menu"
          accessibilityHint="Tap to open quick actions"
        >
          <Animated.View style={plusIconStyle}>
            <Ionicons name="add" size={28} color="#fff" />
          </Animated.View>
        </AnimatedTouchableOpacity>
      </View>
    </>
  );
};

/**
 * Custom Bottom Tab Bar Component
 *
 * This component renders the main navigation bar at the bottom of the screen.
 * It includes a drawer toggle, a central circular action button, and a home button.
 *
 * @returns {JSX.Element} The custom bottom tab bar UI.
 */
const CustomBottomTab = () => {
  const router = useRouter();
  const pathname = usePathname();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleDrawerToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  const handleHomePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)');
  };

  const isHomeActive = pathname === '/(tabs)' || pathname === '/(tabs)/';

  return (
    <View style={[styles.bottomTab, { paddingBottom: insets.bottom }]}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={handleDrawerToggle}
        accessibilityLabel="Open side menu"
        accessibilityHint="Tap to open the navigation menu"
      >
        <Ionicons name="menu" size={24} color="#666" />
        <Text style={styles.tabLabel}>Menu</Text>
      </TouchableOpacity>

      <CircularActionButton />

      <TouchableOpacity
        style={styles.tabButton}
        onPress={handleHomePress}
        accessibilityLabel="Go to Home"
        accessibilityHint="Tap to navigate to the home screen"
      >
        <Ionicons 
          name={isHomeActive ? "home" : "home-outline"} 
          size={24} 
          color={isHomeActive ? "#007AFF" : "#666"} 
        />
        <Text style={[styles.tabLabel, { color: isHomeActive ? "#007AFF" : "#666" }]}>
          Home
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function TabLayout() {
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
      <Drawer.Screen name="index" options={{ drawerLabel: 'Home', title: 'Home' }}>
        {() => (
          <View style={styles.container}>
            <Slot />
            <CustomBottomTab />
          </View>
        )}
      </Drawer.Screen>
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  bottomTab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4.0,
    zIndex: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 60,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
    fontWeight: '500',
  },
  circularButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    bottom: 20,
  },
  circularButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5.0,
  },
  floatingButton: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF8E8E',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 5,
  },
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