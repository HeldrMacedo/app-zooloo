import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
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

const SPRING_CONFIG = { damping: 15, stiffness: 150, mass: 1 };
const OFFSET = 60;

const FloatingActionButton = ({
  isExpanded, index, icon, onPress, label
}: { isExpanded: Animated.SharedValue<boolean>; index: number; icon: string; onPress: () => void; label: string; }) => {
  const animatedStyles = useAnimatedStyle(() => {
    const moveValue = isExpanded.value ? OFFSET * (index + 1) : 0;
    const translateValue = withSpring(-moveValue, SPRING_CONFIG);
    const delay = index * 100;
    const scaleValue = isExpanded.value ? 1 : 0;
    return { transform: [{ translateY: translateValue }, { scale: withDelay(delay, withTiming(scaleValue, { duration: 200 })) }] };
  });
  return (
    <AnimatedPressable style={[animatedStyles, styles.floatingButton]} onPress={onPress} accessibilityLabel={label}>
      <Ionicons name={icon as any} size={20} color="#fff" />
    </AnimatedPressable>
  );
};

const CircularActionButton = () => {
  const isExpanded = useSharedValue(false);
  const handlePress = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); isExpanded.value = !isExpanded.value; };
  const plusIconStyle = useAnimatedStyle(() => ({ transform: [{ rotate: withTiming(isExpanded.value ? '45deg' : '0deg', { duration: 200 }) }] }));
  const backgroundStyle = useAnimatedStyle(() => ({ transform: [{ scale: withSpring(isExpanded.value ? 1.1 : 1, SPRING_CONFIG) }] }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: withTiming(isExpanded.value ? 0 : 0) }));
  const actions = [
    { icon: 'bug', label: 'JB', onPress: () => console.log('Camera pressed') },
    { icon: 'add-circle', label: 'Lotinha', onPress: () => console.log('Add pressed') },
    { icon: 'search', label: 'Quininha', onPress: () => console.log('Search pressed') },
  ];
  return (
    <>
      <AnimatedPressable style={[styles.overlay, overlayStyle]} onPress={() => (isExpanded.value = false)} pointerEvents={isExpanded.value ? 'auto' : 'none'}/>
      <View style={styles.circularButtonContainer}>
        {actions.map((action, index) => (
          <FloatingActionButton key={action.label} isExpanded={isExpanded} index={index} icon={action.icon}
            onPress={() => { isExpanded.value = false; action.onPress(); }} label={action.label} />
        ))}
        <AnimatedTouchableOpacity style={[styles.circularButton, backgroundStyle]} onPress={handlePress} accessibilityLabel="Action Menu" accessibilityHint="Tap to open quick actions">
          <Animated.View style={plusIconStyle}>
            <Ionicons name="add" size={28} color="#fff" />
          </Animated.View>
        </AnimatedTouchableOpacity>
      </View>
    </>
  );
};

export const CustomBottomTab = () => { 
  const router = useRouter();
  const pathname = usePathname();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const handleDrawerToggle = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.dispatch(DrawerActions.toggleDrawer()); };
  const handleHomePress = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)'); };
  const isHomeActive = pathname === '/(tabs)' || pathname === '/(tabs)/';
  return (
    <View style={[styles.bottomTab, { paddingBottom: insets.bottom }]}>
      <TouchableOpacity style={styles.tabButton} onPress={handleDrawerToggle} accessibilityLabel="Open side menu" accessibilityHint="Tap to open the navigation menu">
        <Ionicons name="menu" size={24} color="#666" />
        <Text style={styles.tabLabel}>Menu</Text>
      </TouchableOpacity>
      <CircularActionButton />
      <TouchableOpacity style={styles.tabButton} onPress={handleHomePress} accessibilityLabel="Go to Home" accessibilityHint="Tap to navigate to the home screen">
        <Ionicons name={isHomeActive ? "home" : "home-outline"} size={24} color={isHomeActive ? "#007AFF" : "#666"} />
        <Text style={[styles.tabLabel, { color: isHomeActive ? "#007AFF" : "#666" }]}>Home</Text>
      </TouchableOpacity>
    </View>
  );
};


interface TabLayoutWrapperProps {
  children: React.ReactNode;
}

export const TabLayoutWrapper: React.FC<TabLayoutWrapperProps> = ({ children }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.content}>
        {children}
      </View>
      <CustomBottomTab />
    </View>
  );
};

// Estilos necessários para o Wrapper e a BottomTab
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Cor de fundo geral
  },
  content: {
    flex: 1, // Ocupa todo o espaço exceto a barra inferior
  },
  bottomTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    //backgroundColor: 'red',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom:4,
    height: 60,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    color: '#666',
    fontWeight: '500',
  },
  circularButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    bottom: 10,
    width: 60,
    height: 60,
  },
  circularButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
  },
  floatingButton: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF8E8E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 10,
  },
});