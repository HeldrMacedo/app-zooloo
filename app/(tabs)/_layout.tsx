import { TabBarBackground } from '@/components/ui/tab-bar-background';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#E5E7EB',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
