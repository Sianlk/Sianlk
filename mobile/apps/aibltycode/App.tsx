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
  const scale = useRef(new Animated.Value(0.2)).current;
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([Animated.spring(scale, { toValue: 1, tension: 45, friction: 7, useNativeDriver: true }), Animated.timing(op, { toValue: 1, duration: 900, useNativeDriver: true })]).start();
    AsyncStorage.getItem('sianlk_t').then(t => setTimeout(() => navigation.replace(t ? 'Main' : 'Onboarding'), 2200));
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}>
      <LinearGradient colors={['#001A26', '#0A0A0F', '#001020']} style={StyleSheet.absoluteFill} />
      <Particles count={20} accent={T.cyan} />
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity: op }}>
        <LinearGradient colors={[T.cyan, '#0066FF']} style={{ width: 110, height: 110, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 52 }}>💻</Text>
        </LinearGradient>
        <Text style={{ color: T.text, fontSize: 32, fontWeight: '900', marginTop: 20 }}>AIBLTYCode</Text>
        <Text style={{ color: T.muted, fontSize: 14, marginTop: 6 }}>AI code assistant on mobile</Text>
      </Animated.View>
    </View>
  );
}

const SLIDES_C = [
  { emoji: '⚡', title: 'AI Code Completion', desc: 'Complete, debug and improve code in any language with GPT-4o level intelligence.' },
  { emoji: '🔍', title: 'Deep Code Review', desc: 'Security scan, performance analysis and quality score on any code snippet.' },
  { emoji: '📖', title: 'Code Explainer', desc: 'Understand any code at beginner, intermediate or advanced depth instantly.' },
];

function OnboardingScreen({ navigation }: any) {
  const [idx, setIdx] = useState(0); const anim = useRef(new Animated.Value(1)).current;
  const advance = () => { Animated.sequence([Animated.timing(anim, { toValue: 0, duration: 160, useNativeDriver: true }), Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true })]).start(() => { if (idx < SLIDES_C.length - 1) setIdx(i => i + 1); else navigation.replace('Auth'); }); };
  const s = SLIDES_C[idx];
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#001A26', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Animated.View style={{ alignItems: 'center', opacity: anim }}>
            <Text style={{ fontSize: 88 }}>{s.emoji}</Text>
            <Text style={{ color: T.text, fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 16, marginBottom: 14 }}>{s.title}</Text>
            <Text style={{ color: T.muted, fontSize: 16, textAlign: 'center', lineHeight: 26 }}>{s.desc}</Text>
          </Animated.View>
        </View>
        <View style={{ padding: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 26 }}>
            {SLIDES_C.map((_, i) => <View key={i} style={{ width: i === idx ? 22 : 6, height: 6, borderRadius: 3, backgroundColor: i === idx ? T.cyan : T.border }} />)}
          </View>
          <GBtn label={idx < SLIDES_C.length - 1 ? 'Next →' : 'Start Coding'} onPress={advance} accent={T.cyan} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function EditorScreen() {
  const [code, setCode] = useState('def fibonacci(n):\n    # TODO: implement\n    pass');
  const [lang, setLang] = useState('python');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState<'complete'|'explain'|'review'>('complete');
  const [loading, setLoading] = useState(false);
  const LANGS = ['python', 'javascript', 'typescript', 'go', 'rust', 'java', 'swift'];
  const run = async () => {
    setLoading(true); setResult('');
    try {
      const token = await AsyncStorage.getItem('sianlk_t');
      const ep = mode === 'complete' ? 'complete' : mode === 'explain' ? 'explain' : 'review';
      const data = await apiFetch('POST', `/api/apps/aibltycode/${ep}`, { code, language: lang, detail_level: 'intermediate' }, token);
      setResult(data.completion || data.explanation || data.review || 'Done.');
    } catch (e: any) { setResult('Error: ' + e.message); } finally { setLoading(false); }
  };
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '800', marginBottom: 16 }}>💻 AI Code Editor</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {LANGS.map(l => <TouchableOpacity key={l} onPress={() => setLang(l)} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: l === lang ? 'rgba(6,182,212,0.2)' : T.card, borderWidth: 1, borderColor: l === lang ? T.cyan : T.border, marginRight: 8 }}><Text style={{ color: l === lang ? T.cyan : T.muted, fontWeight: '600', fontSize: 13 }}>{l}</Text></TouchableOpacity>)}
          </ScrollView>
          <GCard style={{ padding: 14, marginBottom: 14 }}>
            <TextInput style={{ color: '#A0E86A', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, minHeight: 150, lineHeight: 20 }} value={code} onChangeText={setCode} multiline placeholder="Paste or type your code here..." placeholderTextColor={T.muted} />
          </GCard>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            {(['complete', 'explain', 'review'] as const).map(m => <TouchableOpacity key={m} onPress={() => setMode(m)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: mode === m ? 'rgba(6,182,212,0.18)' : T.card, borderWidth: 1, borderColor: mode === m ? T.cyan : T.border, alignItems: 'center' }}><Text style={{ color: mode === m ? T.cyan : T.muted, fontWeight: '700', fontSize: 13 }}>{m.charAt(0).toUpperCase() + m.slice(1)}</Text></TouchableOpacity>)}
          </View>
          <GBtn label={loading ? 'Processing...' : '⚡ Run AI'} onPress={run} loading={loading} accent={T.cyan} style={{ marginBottom: 18 }} />
          {result ? <GCard style={{ padding: 16 }}><Text style={{ color: T.muted, fontSize: 11, fontWeight: '700', marginBottom: 8 }}>AI RESULT</Text><Text style={{ color: T.text, fontSize: 13, lineHeight: 21, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>{result}</Text></GCard> : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function HomeScreen({ navigation }: any) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start(); }, []);
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#001520', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <Particles count={16} accent={T.cyan} />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView style={{ opacity: fade }} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
          <Text style={{ color: T.text, fontSize: 26, fontWeight: '800', marginBottom: 6 }}>AIBLTYCode 💻</Text>
          <Text style={{ color: T.muted, marginBottom: 24 }}>AI-powered mobile code assistant</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Editor')} style={{ marginBottom: 16 }}>
            <LinearGradient colors={[T.cyan, '#0066FF']} style={{ borderRadius: 20, padding: 22 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 4 }}>Open Code Editor</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Complete, review or explain any code</Text>
            </LinearGradient>
          </TouchableOpacity>
          {[{ emoji: '🐛', label: 'Debug Assistant', desc: 'Paste error → get fix instantly' }, { emoji: '📝', label: 'Code Templates', desc: 'Production-ready code snippets' }, { emoji: '🏗️', label: 'Architecture Review', desc: 'Design patterns & best practices' }].map((item, i) => (
            <TouchableOpacity key={i} style={{ marginBottom: 10 }}>
              <GCard style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
                  <View style={{ flex: 1 }}><Text style={{ color: T.text, fontWeight: '600', fontSize: 14 }}>{item.label}</Text><Text style={{ color: T.muted, fontSize: 12 }}>{item.desc}</Text></View>
                  <Text style={{ color: T.muted }}>›</Text>
                </View>
              </GCard>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#0F0F17', borderTopColor: T.border, height: Platform.OS === 'ios' ? 88 : 64, paddingBottom: Platform.OS === 'ios' ? 28 : 10, paddingTop: 8 }, tabBarActiveTintColor: T.cyan, tabBarInactiveTintColor: T.muted, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' } }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>, tabBarLabel: 'Home' }} />
      <Tab.Screen name="Editor" component={EditorScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💻</Text>, tabBarLabel: 'Editor' }} />
    </Tab.Navigator>
  );
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
