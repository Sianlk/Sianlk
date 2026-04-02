import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen     from '../screens/HomeScreen';
import ProfileScreen  from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1D4ED8',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {{ backgroundColor: '#fff', borderTopColor: '#E5E7EB', paddingBottom: 4 }},
      }}
    >
      <Tab.Screen name="Home"     component={HomeScreen}
        options={{ tabBarIcon: ({focused}) => <TabIcon emoji="🏠" focused={focused} /> }} />
      <Tab.Screen name="Profile"  component={ProfileScreen}
        options={{ tabBarIcon: ({focused}) => <TabIcon emoji="👤" focused={focused} /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen}
        options={{ tabBarIcon: ({focused}) => <TabIcon emoji="⚙️" focused={focused} /> }} />
    </Tab.Navigator>
  );
}
