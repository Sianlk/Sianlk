import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Animated, ActivityIndicator,
  FlatList, SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SW, height: SH } = Dimensions.get('window');
const API = 'https://sianlk-unified-9w6jz.ondigitalocean.app';

const T = {
  bg: '#0A0A0F', card: '#13131A', border: '#1E1E2E',
  accent: '#7C3AED', cyan: '#06B6D4', text: '#E2E8F0',
  muted: '#64748B', green: '#10B981', red: '#EF4444', yellow: '#F59E0B',
};

function Particles({ count = 14, accent = T.accent }) {
  const anims = useRef(Array.from({ length: count }, () => ({
    op: new Animated.Value(0), x: Math.random() * SW, y: Math.random() * SH,
    size: Math.random() * 3 + 1, dur: 2500 + Math.random() * 2500, delay: Math.random() * 1800,
  }))).current;
  useEffect(() => {
    anims.forEach(p => Animated.loop(Animated.sequence([
      Animated.delay(p.delay),
      Animated.timing(p.op, { toValue: 0.65, duration: p.dur, useNativeDriver: true }),
      Animated.timing(p.op, { toValue: 0, duration: p.dur, useNativeDriver: true }),
    ])).start());
  }, []);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {anims.map((p, i) => (
        <Animated.View key={i} style={{ position: 'absolute', left: p.x, top: p.y, width: p.size, height: p.size, borderRadius: p.size / 2, backgroundColor: i % 2 === 0 ? accent : T.cyan, opacity: p.op }} />
      ))}
    </View>
  );
}

function GCard({ children, style }: any) {
  return (
    <View style={[{ backgroundColor: 'rgba(19,19,26,0.93)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(124,58,237,0.16)', overflow: 'hidden' }, style]}>
      {children}
    </View>
  );
}

function GBtn({ label, onPress, style, loading, accent = T.accent }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.82}>
      <LinearGradient colors={[accent, T.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 24, borderRadius: 12, gap: 8 }}>
        {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{label}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

async function apiFetch(method: string, path: string, body?: any, token?: string | null) {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${API}${path}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json();
  if (!r.ok) throw new Error(d.detail || 'Error');
  return d;
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AuthScreen({ navigation }: any) {
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [name, setName] = useState('');
  const [loading, setLoading] = useState(false); const [err, setErr] = useState('');
  const submit = async () => {
    if (!email || !pw) return setErr('Fill in all fields');
    setLoading(true); setErr('');
    try {
      let token: string;
      if (mode === 'register') {
        const r = await apiFetch('POST', '/api/auth/register', { email, password: pw, full_name: name || email.split('@')[0] });
        token = r.access_token;
      } else {
        const fd = new URLSearchParams(); fd.append('username', email); fd.append('password', pw);
        const r = await fetch(`${API}/api/auth/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() });
        const d = await r.json(); if (!r.ok) throw new Error(d.detail);
        token = d.access_token;
      }
      await AsyncStorage.setItem('sianlk_t', token);
      navigation.replace('Main');
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: T.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#180530', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 28 }}>
        <Text style={{ color: T.text, fontSize: 28, fontWeight: '800', marginBottom: 6 }}>{mode === 'login' ? 'Welcome back' : 'Create account'}</Text>
        <Text style={{ color: T.muted, marginBottom: 28, fontSize: 14 }}>{mode === 'login' ? 'Sign in to continue' : 'Free to start'}</Text>
        <GCard style={{ padding: 18, marginBottom: 16 }}>
          {mode === 'register' && <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 15, marginBottom: 12 }} placeholder="Full name" placeholderTextColor={T.muted} value={name} onChangeText={setName} autoCapitalize="words" />}
          <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 15, marginBottom: 12 }} placeholder="Email" placeholderTextColor={T.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 15 }} placeholder="Password" placeholderTextColor={T.muted} value={pw} onChangeText={setPw} secureTextEntry onSubmitEditing={submit} />
          {err ? <Text style={{ color: T.red, marginTop: 10, fontSize: 13 }}>{err}</Text> : null}
        </GCard>
        <GBtn label={mode === 'login' ? 'Sign In' : 'Create Account'} onPress={submit} loading={loading} style={{ marginBottom: 14 }} />
        <TouchableOpacity onPress={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErr(''); }} style={{ alignItems: 'center' }}>
          <Text style={{ color: T.muted, fontSize: 13 }}>{mode === 'login' ? "No account? " : "Have an account? "}<Text style={{ color: T.cyan, fontWeight: '600' }}>{mode === 'login' ? 'Create one free' : 'Sign in'}</Text></Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function SplashScreen({ navigation }: any) {
  const scale = useRef(new Animated.Value(0.2)).current; const op = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.parallel([Animated.spring(scale, { toValue: 1, tension: 45, friction: 7, useNativeDriver: true }), Animated.timing(op, { toValue: 1, duration: 900, useNativeDriver: true })]).start(); AsyncStorage.getItem('sianlk_t').then(t => setTimeout(() => navigation.replace(t ? 'Main' : 'Onboarding'), 2200)); }, []);
  return (<View style={ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }><LinearGradient colors={['#7C3AED44', '#0A0A0F', '#0A0A0F']} style={StyleSheet.absoluteFill} /><Particles count={20} accent='#7C3AED' /><Animated.View style={ alignItems: 'center', transform: [{ scale }], opacity: op }><LinearGradient colors={['#7C3AED', T.cyan]} style={ width: 110, height: 110, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }><Text style={ fontSize: 52 }>{'🔮'}</Text></LinearGradient><Text style={ color: T.text, fontSize: 32, fontWeight: '900', marginTop: 20 }>{'AIB'}</Text><Text style={ color: T.muted, fontSize: 14, marginTop: 6 }>{'AI Brain Dashboard'}</Text></Animated.View></View>);
}

function OnboardingScreen({ navigation }: any) {
  const [idx, setIdx] = useState(0); const anim = useRef(new Animated.Value(1)).current;
  const SLIDES_G = [ { emoji: '🔮', title: 'AI Brain Dashboard', desc: 'Model routing, embeddings, AI analytics and infrastructure' }, { emoji: '⚡', title: 'Quantum-Powered', desc: 'Advanced AI algorithms give you capabilities no other app can match.' }, { emoji: '🚀', title: 'Built for Scale', desc: 'Used by thousands of professionals. No limits, no compromises.' } ];
  const advance = () => { Animated.sequence([Animated.timing(anim, { toValue: 0, duration: 160, useNativeDriver: true }), Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true })]).start(() => { if (idx < SLIDES_G.length - 1) setIdx(i => i + 1); else navigation.replace('Auth'); }); };
  const s = SLIDES_G[idx];
  return (<View style={ flex: 1, backgroundColor: T.bg }><LinearGradient colors={['#7C3AED22', '#0A0A0F']} style={StyleSheet.absoluteFill} /><SafeAreaView style={ flex: 1 }><View style={ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }><Animated.View style={ alignItems: 'center', opacity: anim }><Text style={ fontSize: 88 }>{s.emoji}</Text><Text style={ color: T.text, fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 16, marginBottom: 14 }>{s.title}</Text><Text style={ color: T.muted, fontSize: 16, textAlign: 'center', lineHeight: 26 }>{s.desc}</Text></Animated.View></View><View style={ padding: 28 }><View style={ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 26 }>{SLIDES_G.map((_, i) => <View key={i} style={ width: i === idx ? 22 : 6, height: 6, borderRadius: 3, backgroundColor: i === idx ? '#7C3AED' : T.border } />)}</View><GBtn label={idx < SLIDES_G.length - 1 ? 'Next →' : 'Get Started Free'} onPress={advance} accent="{color}" /></View></SafeAreaView></View>);
}

function HomeScreen({ navigation }: any) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start(); }, []);
  const ITEMS: [string, string, string][] = [["\ud83e\udde0", "Model Router", "Optimal AI routing"], ["\ud83d\udd22", "Embeddings", "Text \u2192 vectors"], ["\ud83d\udcca", "Analytics", "AI usage dashboard"], ["\u26a1", "API Tester", "Test all endpoints"]];
  return (<View style={ flex: 1, backgroundColor: T.bg }><LinearGradient colors={['#7C3AED22', '#0A0A0F', '#08080E']} style={StyleSheet.absoluteFill} /><Particles count={16} accent="{color}" /><SafeAreaView style={ flex: 1 }><Animated.ScrollView style={ opacity: fade } contentContainerStyle={ padding: 22, paddingBottom: 40 }><Text style={ color: T.text, fontSize: 26, fontWeight: '800', marginBottom: 4 }>{'AIB 🔮'}</Text><Text style={ color: T.muted, marginBottom: 22, fontSize: 14 }>{'Model routing, embeddings, AI analytics and infrastructure'}</Text><LinearGradient colors={['#7C3AED', T.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={ borderRadius: 20, padding: 22, marginBottom: 20 }><Text style={ color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 }>{'AI Infrastructure'}</Text><Text style={ color: 'rgba(255,255,255,0.82)', fontSize: 14 }>{'Model routing, embeddings, AI analytics and infrastructure'}</Text></LinearGradient>{ITEMS.map(([icon, label, sub]: any, i: number) => (<TouchableOpacity key={i} style={ marginBottom: 10 }><GCard style={ padding: 16 }><View style={ flexDirection: 'row', alignItems: 'center', gap: 12 }><Text style={ fontSize: 26 }>{icon}</Text><View style={ flex: 1 }><Text style={ color: T.text, fontWeight: '600', fontSize: 14 }>{label}</Text><Text style={ color: T.muted, fontSize: 12 }>{sub}</Text></View><Text style={ color: T.muted }>›</Text></View></GCard></TouchableOpacity>))}</Animated.ScrollView></SafeAreaView></View>);
}

function MainTabs() {
  return (<Tab.Navigator screenOptions={ headerShown: false, tabBarStyle: { backgroundColor: '#0F0F17', borderTopColor: T.border, height: Platform.OS === 'ios' ? 88 : 64, paddingBottom: Platform.OS === 'ios' ? 28 : 10, paddingTop: 8 }, tabBarActiveTintColor: '#7C3AED', tabBarInactiveTintColor: T.muted, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' } }><Tab.Screen name="Home" component={HomeScreen} options={ tabBarIcon: ({ color }) => <Text style={ fontSize: 22, color }>🏠</Text>, tabBarLabel: 'Home' } /></Tab.Navigator>);
}

export default function App() {
  return (
    <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: T.bg, card: T.card, border: T.border } }}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
