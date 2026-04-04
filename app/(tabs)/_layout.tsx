// app/(tabs)/_layout.tsx
// Sianlk
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../src/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.gray400,
      tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.gray100, height: 60 },
      headerShown: false,
    }}>
      <Tabs.Screen name="index"   options={{ title:'Home',    tabBarIcon:({color,size})=><Ionicons name="home" color={color} size={size}/> }} />
      <Tabs.Screen name="ai"      options={{ title:'AI',      tabBarIcon:({color,size})=><Ionicons name="sparkles" color={color} size={size}/> }} />
      <Tabs.Screen name="explore" options={{ title:'Platform Hub',  tabBarIcon:({color,size})=><Ionicons name="grid" color={color} size={size}/> }} />
      <Tabs.Screen name="profile" options={{ title:'Profile', tabBarIcon:({color,size})=><Ionicons name="person" color={color} size={size}/> }} />
    </Tabs>
  );
}
