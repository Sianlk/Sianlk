/**
 * Sianlk — App Navigation Structure
 */
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAuthStore} from '../store/authStore';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

export const linking = {
  prefixes: ['https://sianlk.sianlk.com', 'sianlk://'],
  config: {
    screens: {
      Auth: { screens: {
        Login: 'auth/login', Register: 'auth/register',
        ForgotPassword: 'auth/forgot-password', MFA: 'auth/mfa',
      } },
      App: { screens: {
        Home: '', Profile: 'profile', Settings: 'settings',
      } },
    },
  },
};

const LoginScreen          = React.lazy(() => import('../screens/LoginScreen'));
const RegisterScreen       = React.lazy(() => import('../screens/RegisterScreen'));
const ForgotPasswordScreen = React.lazy(() => import('../screens/ForgotPasswordScreen'));
const MFAScreen            = React.lazy(() => import('../screens/MFAScreen'));
const OnboardingScreen     = React.lazy(() => import('../screens/OnboardingScreen'));
const HomeScreen           = React.lazy(() => import('../screens/HomeScreen'));
const ProfileScreen        = React.lazy(() => import('../screens/ProfileScreen'));
const SettingsScreen       = React.lazy(() => import('../screens/SettingsScreen'));

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login"      component={LoginScreen} />
      <Stack.Screen name="Register"   component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="MFA"        component={MFAScreen} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#1D4ED8',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: { borderTopWidth: 0, elevation: 8, height: 60 },
    }}>
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Profile"  component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const {accessToken} = useAuthStore();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {accessToken ? (
        <Stack.Screen name="App"  component={AppTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
