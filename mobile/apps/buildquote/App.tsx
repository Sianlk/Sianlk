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
  return (<View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}><LinearGradient colors={['#1A1000', '#0A0A0F', '#100A00']} style={StyleSheet.absoluteFill} /><Particles count={20} accent={T.yellow} /><Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity: op }}><LinearGradient colors={[T.yellow, '#F97316']} style={{ width: 110, height: 110, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 52 }}>🏗️</Text></LinearGradient><Text style={{ color: T.text, fontSize: 32, fontWeight: '900', marginTop: 20 }}>BuildQuote</Text><Text style={{ color: T.muted, fontSize: 14, marginTop: 6 }}>AI construction quoting</Text></Animated.View></View>);
}

const SLIDES_B = [
  { emoji: '🏗️', title: 'AI Cost Estimation', desc: 'Quantum-optimised construction cost estimates accurate to within 12% — faster than any human estimator.' },
  { emoji: '📋', title: 'Instant Breakdowns', desc: 'Detailed line-item quotes covering materials, labour, permits and contingencies in seconds.' },
  { emoji: '💰', title: 'Save & Share', desc: 'Generate professional PDF quotes to send to clients or compare with contractor bids.' },
];

function OnboardingScreen({ navigation }: any) {
  const [idx, setIdx] = useState(0); const anim = useRef(new Animated.Value(1)).current;
  const advance = () => { Animated.sequence([Animated.timing(anim, { toValue: 0, duration: 160, useNativeDriver: true }), Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true })]).start(() => { if (idx < SLIDES_B.length - 1) setIdx(i => i + 1); else navigation.replace('Auth'); }); };
  const s = SLIDES_B[idx];
  return (<View style={{ flex: 1, backgroundColor: T.bg }}><LinearGradient colors={['#1A1000', '#0A0A0F']} style={StyleSheet.absoluteFill} /><SafeAreaView style={{ flex: 1 }}><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}><Animated.View style={{ alignItems: 'center', opacity: anim }}><Text style={{ fontSize: 88 }}>{s.emoji}</Text><Text style={{ color: T.text, fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 16, marginBottom: 14 }}>{s.title}</Text><Text style={{ color: T.muted, fontSize: 16, textAlign: 'center', lineHeight: 26 }}>{s.desc}</Text></Animated.View></View><View style={{ padding: 28 }}><View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 26 }}>{SLIDES_B.map((_, i) => <View key={i} style={{ width: i === idx ? 22 : 6, height: 6, borderRadius: 3, backgroundColor: i === idx ? T.yellow : T.border }} />)}</View><GBtn label={idx < SLIDES_B.length - 1 ? 'Next →' : 'Get My Quote'} onPress={advance} accent={T.yellow} /></View></SafeAreaView></View>);
}

function QuoteScreen() {
  const [projectType, setProjectType] = useState('residential'); const [sqft, setSqft] = useState(''); const [quality, setQuality] = useState('standard'); const [result, setResult] = useState<any>(null); const [loading, setLoading] = useState(false);
  const PROJECT_TYPES = ['Residential', 'Commercial', 'Renovation', 'Addition'];
  const QUALITIES = ['Budget', 'Standard', 'Premium', 'Luxury'];
  const getQuote = async () => {
    if (!sqft) return; setLoading(true);
    try { const token = await AsyncStorage.getItem('sianlk_t'); const data = await apiFetch('POST', '/api/apps/buildquote/estimate', { project_type: projectType, sqft: parseFloat(sqft), location: 'United States', quality, timeline_weeks: 12 }, token); setResult(data); } catch (e: any) { setResult({ error: e.message }); } finally { setLoading(false); }
  };
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}><SafeAreaView style={{ flex: 1 }}><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 20 }}>🏗️ Get AI Quote</Text>
      <GCard style={{ padding: 18, marginBottom: 16 }}>
        <Text style={{ color: T.muted, fontSize: 11, fontWeight: '700', marginBottom: 10 }}>PROJECT TYPE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {PROJECT_TYPES.map(t => <TouchableOpacity key={t} onPress={() => setProjectType(t.toLowerCase())} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: projectType === t.toLowerCase() ? 'rgba(245,158,11,0.2)' : T.card, borderWidth: 1, borderColor: projectType === t.toLowerCase() ? T.yellow : T.border, marginRight: 8 }}><Text style={{ color: projectType === t.toLowerCase() ? T.yellow : T.muted, fontWeight: '600', fontSize: 13 }}>{t}</Text></TouchableOpacity>)}
        </ScrollView>
        <Text style={{ color: T.muted, fontSize: 11, fontWeight: '700', marginBottom: 8 }}>SQUARE FOOTAGE</Text>
        <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 16, marginBottom: 16 }} placeholder="e.g. 2500" placeholderTextColor={T.muted} value={sqft} onChangeText={setSqft} keyboardType="numeric" />
        <Text style={{ color: T.muted, fontSize: 11, fontWeight: '700', marginBottom: 10 }}>QUALITY LEVEL</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {QUALITIES.map(q => <TouchableOpacity key={q} onPress={() => setQuality(q.toLowerCase())} style={{ flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: quality === q.toLowerCase() ? 'rgba(245,158,11,0.18)' : T.card, borderWidth: 1, borderColor: quality === q.toLowerCase() ? T.yellow : T.border, alignItems: 'center' }}><Text style={{ color: quality === q.toLowerCase() ? T.yellow : T.muted, fontWeight: '600', fontSize: 12 }}>{q}</Text></TouchableOpacity>)}
        </View>
      </GCard>
      <GBtn label={loading ? 'Calculating...' : '⚡ Get Quantum Quote'} onPress={getQuote} loading={loading} accent={T.yellow} style={{ marginBottom: 16 }} />
      {result && !result.error && (
        <GCard style={{ padding: 18 }}>
          <Text style={{ color: T.yellow, fontWeight: '800', fontSize: 28, marginBottom: 4 }}>${result.estimated_total?.toLocaleString()}</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 4 }}>Range: ${result.low_estimate?.toLocaleString()} – ${result.high_estimate?.toLocaleString()}</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 16 }}>${result.cost_per_sqft}/sqft</Text>
          <Text style={{ color: T.text, fontSize: 13, lineHeight: 21 }}>{result.ai_breakdown}</Text>
        </GCard>
      )}
    </ScrollView></SafeAreaView></View>
  );
}

function HomeScreen({ navigation }: any) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start(); }, []);
  return (<View style={{ flex: 1, backgroundColor: T.bg }}><LinearGradient colors={['#150A00', '#0A0A0F']} style={StyleSheet.absoluteFill} /><Particles count={16} accent={T.yellow} /><SafeAreaView style={{ flex: 1 }}><Animated.ScrollView style={{ opacity: fade }} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}><Text style={{ color: T.text, fontSize: 26, fontWeight: '800', marginBottom: 6 }}>BuildQuote 🏗️</Text><Text style={{ color: T.muted, marginBottom: 24 }}>Quantum-powered construction estimates</Text><TouchableOpacity onPress={() => navigation.navigate('Quote')} style={{ marginBottom: 16 }}><LinearGradient colors={[T.yellow, '#F97316']} style={{ borderRadius: 20, padding: 22 }}><Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 4 }}>Get AI Quote</Text><Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Accurate construction cost estimate in seconds</Text></LinearGradient></TouchableOpacity>{[{ emoji: '📋', label: 'Saved Quotes', desc: 'View your previous estimates' }, { emoji: '📊', label: 'Cost Tracker', desc: 'Monitor project spending' }, { emoji: '🤝', label: 'Contractor Connect', desc: 'Find verified contractors' }].map((item, i) => (<TouchableOpacity key={i} style={{ marginBottom: 10 }}><GCard style={{ padding: 16 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Text style={{ fontSize: 26 }}>{item.emoji}</Text><View style={{ flex: 1 }}><Text style={{ color: T.text, fontWeight: '600', fontSize: 14 }}>{item.label}</Text><Text style={{ color: T.muted, fontSize: 12 }}>{item.desc}</Text></View><Text style={{ color: T.muted }}>›</Text></View></GCard></TouchableOpacity>))}</Animated.ScrollView></SafeAreaView></View>);
}

function MainTabs() {
  return (<Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#0F0F17', borderTopColor: T.border, height: Platform.OS === 'ios' ? 88 : 64, paddingBottom: Platform.OS === 'ios' ? 28 : 10, paddingTop: 8 }, tabBarActiveTintColor: T.yellow, tabBarInactiveTintColor: T.muted, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' } }}><Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>, tabBarLabel: 'Home' }} /><Tab.Screen name="Quote" component={QuoteScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏗️</Text>, tabBarLabel: 'Quote' }} /></Tab.Navigator>);
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
