import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Animated, ActivityIndicator,
  FlatList, SafeAreaView, StatusBar, Dimensions, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { width: SW, height: SH } = Dimensions.get('window');
const API = 'https://sianlk-unified-9w6jz.ondigitalocean.app';

// ── Design System ──────────────────────────────────────────────────────────
const T = {
  bg: '#0A0A0F', card: '#13131A', border: '#1E1E2E',
  accent: '#7C3AED', cyan: '#06B6D4', text: '#E2E8F0',
  muted: '#64748B', green: '#10B981', red: '#EF4444',
  yellow: '#F59E0B', surface: '#0F0F17',
};

// ── API helper ─────────────────────────────────────────────────────────────
const api = {
  async req(method: string, path: string, body?: any, token?: string | null) {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    const r = await fetch(`${API}${path}`, {
      method, headers: h, body: body ? JSON.stringify(body) : undefined,
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.detail || 'Error');
    return d;
  },
  async login(email: string, password: string) {
    const fd = new URLSearchParams();
    fd.append('username', email); fd.append('password', password);
    const r = await fetch(`${API}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: fd.toString(),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.detail || 'Login failed');
    return d;
  },
};

// ── Particles ─────────────────────────────────────────────────────────────
function Particles({ count = 16 }) {
  const anims = useRef(
    Array.from({ length: count }, () => ({
      opacity: new Animated.Value(0),
      x: Math.random() * SW,
      y: Math.random() * SH,
      size: Math.random() * 3 + 1,
      color: Math.random() > 0.5 ? T.accent : T.cyan,
      dur: 2000 + Math.random() * 3000,
      delay: Math.random() * 2000,
    }))
  ).current;

  useEffect(() => {
    anims.forEach(p => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(p.opacity, { toValue: 0.7, duration: p.dur, useNativeDriver: true }),
          Animated.timing(p.opacity, { toValue: 0, duration: p.dur, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {anims.map((p, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: p.x, top: p.y,
          width: p.size, height: p.size, borderRadius: p.size / 2,
          backgroundColor: p.color, opacity: p.opacity,
        }} />
      ))}
    </View>
  );
}

// ── Glass Card ────────────────────────────────────────────────────────────
function GCard({ children, style }: any) {
  return (
    <View style={[{
      backgroundColor: 'rgba(19,19,26,0.92)', borderRadius: 16,
      borderWidth: 1, borderColor: 'rgba(124,58,237,0.18)', overflow: 'hidden',
    }, style]}>
      {children}
    </View>
  );
}

// ── Gradient Button ───────────────────────────────────────────────────────
function GBtn({ label, onPress, style, loading, secondary }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.82}>
      <LinearGradient
        colors={secondary ? ['#1E1E2E', '#13131A'] : [T.accent, T.cyan]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          paddingVertical: 15, paddingHorizontal: 24, borderRadius: 12,
          borderWidth: secondary ? 1 : 0, borderColor: T.border, gap: 8 }}>
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{label}</Text>
        }
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────
function Field({ label, ...props }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      {label ? <Text style={{ color: T.muted, fontSize: 11, fontWeight: '700',
        letterSpacing: 0.8, marginBottom: 6 }}>{label.toUpperCase()}</Text> : null}
      <TextInput
        style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10,
          borderWidth: 1, borderColor: T.border, padding: 14, color: T.text, fontSize: 15 }}
        placeholderTextColor={T.muted} {...props}
      />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// SCREENS
// ══════════════════════════════════════════════════════════════════════════

// ── Splash ────────────────────────────────────────────────────────────────
function SplashScreen({ navigation }: any) {
  const scale = useRef(new Animated.Value(0.2)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 45, friction: 7, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 1800, useNativeDriver: true }),
    ])).start();
    (async () => {
      const t = await AsyncStorage.getItem('sianlk_t');
      setTimeout(() => navigation.replace(t ? 'Main' : 'Onboarding'), 2400);
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}>
      <LinearGradient colors={['#180530', '#0A0A0F', '#001A26']} style={StyleSheet.absoluteFill} />
      <Particles count={24} />
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity }}>
        <Animated.View style={{
          shadowColor: T.accent,
          shadowOpacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] }),
          shadowRadius: 40, elevation: 30,
        }}>
          <LinearGradient colors={[T.accent, T.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ width: 110, height: 110, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 52 }}>✨</Text>
          </LinearGradient>
        </Animated.View>
        <Text style={{ color: T.text, fontSize: 38, fontWeight: '900', marginTop: 22, letterSpacing: -0.5 }}>GeniAI</Text>
        <Text style={{ color: T.muted, fontSize: 14, marginTop: 6 }}>Quantum-powered intelligence</Text>
      </Animated.View>
    </View>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────
const SLIDES = [
  { emoji: '🧠', title: 'Quantum Intelligence', desc: 'Powered by quantum-inspired algorithms that understand context, intent and nuance better than any other AI.' },
  { emoji: '🎭', title: 'Custom AI Personas', desc: 'Build AI personalities tailored to exactly how you work — a mentor, a creative partner, a strategic advisor.' },
  { emoji: '🚀', title: 'Always Evolving', desc: 'GeniAI learns from every conversation, remembers your preferences, and improves its responses over time.' },
];

function OnboardingScreen({ navigation }: any) {
  const [idx, setIdx] = useState(0);
  const anim = useRef(new Animated.Value(1)).current;

  const advance = () => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      if (idx < SLIDES.length - 1) setIdx(i => i + 1);
      else navigation.replace('Auth');
    });
  };

  const s = SLIDES[idx];
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#170430', '#0A0A0F', '#001520']} style={StyleSheet.absoluteFill} />
      <Particles count={18} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 36 }}>
          <Animated.View style={{ alignItems: 'center', opacity: anim }}>
            <Text style={{ fontSize: 88, marginBottom: 4 }}>{s.emoji}</Text>
            <Text style={{ color: T.text, fontSize: 30, fontWeight: '800', textAlign: 'center', marginTop: 16, marginBottom: 16, letterSpacing: -0.3 }}>{s.title}</Text>
            <Text style={{ color: T.muted, fontSize: 16, textAlign: 'center', lineHeight: 26 }}>{s.desc}</Text>
          </Animated.View>
        </View>
        <View style={{ padding: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
            {SLIDES.map((_, i) => (
              <Animated.View key={i} style={{
                width: i === idx ? 24 : 6, height: 6, borderRadius: 3,
                backgroundColor: i === idx ? T.accent : T.border,
              }} />
            ))}
          </View>
          <GBtn label={idx < SLIDES.length - 1 ? 'Continue →' : 'Get Started Free'} onPress={advance} />
          {idx < SLIDES.length - 1 && (
            <TouchableOpacity onPress={() => navigation.replace('Auth')} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: T.muted, fontSize: 14 }}>Skip intro</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

// ── Auth ──────────────────────────────────────────────────────────────────
function AuthScreen({ navigation }: any) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const slideY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const submit = async () => {
    if (!email.trim() || !password) return setError('Please fill in all fields');
    if (mode === 'register' && password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true); setError('');
    try {
      let token: string;
      if (mode === 'register') {
        const r = await api.req('POST', '/api/auth/register', { email: email.trim(), password, full_name: name || email.split('@')[0] });
        token = r.access_token;
      } else {
        const r = await api.login(email.trim(), password);
        token = r.access_token;
      }
      await AsyncStorage.setItem('sianlk_t', token);
      navigation.replace('Main');
    } catch (e: any) {
      setError(e.message || 'Authentication failed');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: T.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#180530', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <Particles count={10} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 28 }} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity, transform: [{ translateY: slideY }] }}>
            <LinearGradient colors={[T.accent, T.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ width: 58, height: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 28 }}>✨</Text>
            </LinearGradient>
            <Text style={{ color: T.text, fontSize: 28, fontWeight: '800', marginBottom: 6 }}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </Text>
            <Text style={{ color: T.muted, marginBottom: 32, fontSize: 15 }}>
              {mode === 'login' ? 'Sign in to continue' : 'Start free — no card needed'}
            </Text>

            <GCard style={{ padding: 20, marginBottom: 20 }}>
              {mode === 'register' && (
                <Field label="Full Name" placeholder="Your name" value={name} onChangeText={setName} autoCapitalize="words" />
              )}
              <Field label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <Field label="Password" placeholder={mode === 'register' ? 'Min 8 characters' : 'Your password'} value={password} onChangeText={setPassword} secureTextEntry onSubmitEditing={submit} style={{ marginBottom: 0 }} />
              {error ? (
                <Text style={{ color: T.red, marginTop: 12, fontSize: 13 }}>{error}</Text>
              ) : null}
            </GCard>

            <GBtn label={mode === 'login' ? 'Sign In' : 'Create Account'} onPress={submit} loading={loading} style={{ marginBottom: 16 }} />
            <TouchableOpacity onPress={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }} style={{ alignItems: 'center' }}>
              <Text style={{ color: T.muted, fontSize: 14 }}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <Text style={{ color: T.cyan, fontWeight: '600' }}>
                  {mode === 'login' ? 'Create one free' : 'Sign in'}
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ── Chat (Core Feature) ───────────────────────────────────────────────────
type Msg = { id: string; role: 'user' | 'ai'; text: string };

function ChatScreen() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: '0', role: 'ai', text: "Hello! I'm GeniAI — your quantum-powered AI companion. Ask me anything. 🌟" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [persona] = useState('GeniAI');
  const listRef = useRef<FlatList>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const uid = Date.now().toString();
    setMsgs(m => [...m, { id: uid, role: 'user', text }]);
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('sianlk_t');
      const data = await api.req('POST', '/api/ai/complete', { message: text, max_tokens: 500, app_slug: 'geniai' }, token);
      setMsgs(m => [...m, { id: uid + 'r', role: 'ai', text: data.content || 'No response.' }]);
    } catch {
      setMsgs(m => [...m, { id: uid + 'r', role: 'ai', text: '⚠️ Connection issue. Please try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMsg = ({ item }: { item: Msg }) => (
    <View style={{ flexDirection: 'row', justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
      {item.role === 'ai' && (
        <LinearGradient colors={[T.accent, T.cyan]} style={{ width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0, marginTop: 2 }}>
          <Text style={{ fontSize: 16 }}>✨</Text>
        </LinearGradient>
      )}
      <View style={{
        maxWidth: SW * 0.74, padding: 13,
        backgroundColor: item.role === 'user' ? T.accent : 'rgba(19,19,26,0.95)',
        borderRadius: 18, borderBottomRightRadius: item.role === 'user' ? 4 : 18,
        borderBottomLeftRadius: item.role === 'ai' ? 4 : 18,
        borderWidth: item.role === 'ai' ? 1 : 0, borderColor: T.border,
      }}>
        <Text style={{ color: T.text, fontSize: 15, lineHeight: 23 }}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#0D0D14', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: T.border, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LinearGradient colors={[T.accent, T.cyan]} style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18 }}>✨</Text>
          </LinearGradient>
          <View>
            <Text style={{ color: T.text, fontWeight: '700', fontSize: 15 }}>{persona}</Text>
            <Text style={{ color: T.green, fontSize: 11 }}>● Quantum active</Text>
          </View>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
          <FlatList data={msgs} renderItem={renderMsg} keyExtractor={m => m.id}
            ref={listRef} contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })} />
          {loading && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <LinearGradient colors={[T.accent, T.cyan]} style={{ width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16 }}>✨</Text>
              </LinearGradient>
              <GCard style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  {[0, 1, 2].map(i => <View key={i} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: T.muted }} />)}
                </View>
              </GCard>
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: T.border }}>
            <TextInput multiline maxLength={2000}
              style={{ flex: 1, backgroundColor: 'rgba(19,19,26,0.9)', borderRadius: 14, borderWidth: 1, borderColor: T.border, padding: 13, color: T.text, fontSize: 15, maxHeight: 120 }}
              placeholder="Ask GeniAI anything…" placeholderTextColor={T.muted}
              value={input} onChangeText={setInput} />
            <TouchableOpacity onPress={send} style={{ alignSelf: 'flex-end' }}>
              <LinearGradient colors={[T.accent, T.cyan]} style={{ width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 22, color: '#fff' }}>↑</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────
const PERSONAS = [
  { emoji: '🧠', name: 'Genius', desc: 'Supreme intellect' },
  { emoji: '🎨', name: 'Creative', desc: 'Imaginative visionary' },
  { emoji: '⚡', name: 'Executor', desc: 'Direct action-taker' },
  { emoji: '🔬', name: 'Scientist', desc: 'Analytical thinker' },
];

function HomeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [selectedPersona, setSelectedPersona] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    (async () => {
      const t = await AsyncStorage.getItem('sianlk_t');
      if (t) { try { setUser(await api.req('GET', '/api/auth/me', undefined, t)); } catch {} }
    })();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#100320', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <Particles count={20} />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView style={{ flex: 1, opacity: fadeAnim }} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
          <View style={{ marginBottom: 28 }}>
            <Text style={{ color: T.muted, fontSize: 13, marginBottom: 2 }}>{greeting()},</Text>
            <Text style={{ color: T.text, fontSize: 27, fontWeight: '800', letterSpacing: -0.3 }}>
              {user?.full_name?.split(' ')[0] || 'there'} 👋
            </Text>
          </View>

          {/* Hero CTA */}
          <TouchableOpacity onPress={() => navigation.navigate('Chat')} activeOpacity={0.88} style={{ marginBottom: 24 }}>
            <LinearGradient colors={[T.accent, T.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ borderRadius: 22, padding: 24, overflow: 'hidden' }}>
              <Particles count={6} />
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>QUANTUM ACTIVE</Text>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 6 }}>Start a New Chat</Text>
              <Text style={{ color: 'rgba(255,255,255,0.76)', fontSize: 14 }}>Ask anything — powered by GPT-4o + quantum engine</Text>
              <View style={{ position: 'absolute', right: 22, top: '50%', marginTop: -18 }}>
                <Text style={{ fontSize: 36 }}>→</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Personas */}
          <Text style={{ color: T.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>AI Personas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 26 }}>
            {PERSONAS.map((p, i) => (
              <TouchableOpacity key={i} onPress={() => setSelectedPersona(i)} style={{ marginRight: 10 }}>
                <View style={{
                  backgroundColor: i === selectedPersona ? 'rgba(124,58,237,0.2)' : T.card,
                  borderWidth: 1, borderColor: i === selectedPersona ? T.accent : T.border,
                  borderRadius: 14, padding: 14, width: 110, alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 28, marginBottom: 6 }}>{p.emoji}</Text>
                  <Text style={{ color: i === selectedPersona ? T.accent : T.text, fontWeight: '700', fontSize: 13 }}>{p.name}</Text>
                  <Text style={{ color: T.muted, fontSize: 11, textAlign: 'center', marginTop: 2 }}>{p.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quick prompts */}
          <Text style={{ color: T.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Quick Prompts</Text>
          {[
            { emoji: '💡', text: 'Give me a creative business idea', tag: 'Business' },
            { emoji: '🔍', text: 'Explain quantum computing simply', tag: 'Learning' },
            { emoji: '✍️', text: 'Write a professional email for me', tag: 'Writing' },
            { emoji: '🐛', text: 'Review my code for bugs', tag: 'Code' },
          ].map((item, i) => (
            <TouchableOpacity key={i} onPress={() => navigation.navigate('Chat')} activeOpacity={0.8} style={{ marginBottom: 10 }}>
              <GCard style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(124,58,237,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.text, fontSize: 14, fontWeight: '500' }}>{item.text}</Text>
                  </View>
                  <View style={{ backgroundColor: 'rgba(6,182,212,0.13)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ color: T.cyan, fontSize: 11, fontWeight: '600' }}>{item.tag}</Text>
                  </View>
                </View>
              </GCard>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────
function SettingsScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('sianlk_t');
      if (t) { try { setUser(await api.req('GET', '/api/auth/me', undefined, t)); } catch {} }
    })();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('sianlk_t');
    navigation.replace('Auth');
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 48 }}>
          <Text style={{ color: T.text, fontSize: 26, fontWeight: '800', marginBottom: 24 }}>Settings</Text>

          {user && (
            <GCard style={{ padding: 18, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <LinearGradient colors={[T.accent, T.cyan]} style={{ width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>{user.email?.charAt(0).toUpperCase()}</Text>
                </LinearGradient>
                <View>
                  <Text style={{ color: T.text, fontWeight: '700', fontSize: 15 }}>{user.full_name || 'User'}</Text>
                  <Text style={{ color: T.muted, fontSize: 13 }}>{user.email}</Text>
                  <Text style={{ color: T.accent, fontSize: 12, fontWeight: '600', marginTop: 2 }}>{(user.plan || 'FREE').toUpperCase()}</Text>
                </View>
              </View>
            </GCard>
          )}

          {[
            { title: 'Preferences', items: [
              { icon: '🔔', label: 'Notifications', toggle: true, value: notifications, onToggle: setNotifications },
              { icon: '📳', label: 'Haptic Feedback', toggle: true, value: haptics, onToggle: setHaptics },
            ]},
            { title: 'Account', items: [
              { icon: '🎭', label: 'Manage Personas', toggle: false },
              { icon: '⭐', label: 'Upgrade to Pro', toggle: false },
              { icon: '🔒', label: 'Privacy & Security', toggle: false },
              { icon: '📖', label: 'Help & Support', toggle: false },
            ]},
          ].map((section, si) => (
            <View key={si} style={{ marginBottom: 22 }}>
              <Text style={{ color: T.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 }}>{section.title.toUpperCase()}</Text>
              <GCard>
                {section.items.map((item: any, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: i < section.items.length - 1 ? 1 : 0, borderBottomColor: T.border }}>
                    <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                    <Text style={{ color: T.text, flex: 1, fontSize: 15 }}>{item.label}</Text>
                    {item.toggle ? (
                      <Switch value={item.value} onValueChange={item.onToggle} trackColor={{ false: T.border, true: T.accent }} thumbColor="#fff" />
                    ) : (
                      <Text style={{ color: T.muted, fontSize: 18 }}>›</Text>
                    )}
                  </View>
                ))}
              </GCard>
            </View>
          ))}

          <TouchableOpacity onPress={logout}>
            <GCard style={{ padding: 16, borderColor: 'rgba(239,68,68,0.25)' }}>
              <Text style={{ color: T.red, textAlign: 'center', fontWeight: '700', fontSize: 15 }}>Sign Out</Text>
            </GCard>
          </TouchableOpacity>

          <Text style={{ color: T.muted, textAlign: 'center', fontSize: 12, marginTop: 24 }}>GeniAI v1.0.0 · Sianlk Platform · Quantum Engine Active</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Navigation ────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ name, color }: { name: string; color: string }) {
  return <Text style={{ fontSize: 22, color }}>{name}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#0F0F17', borderTopColor: T.border, height: Platform.OS === 'ios' ? 88 : 64, paddingBottom: Platform.OS === 'ios' ? 28 : 10, paddingTop: 8 },
      tabBarActiveTintColor: T.accent, tabBarInactiveTintColor: T.muted,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <TabIcon name="🏠" color={color} />, tabBarLabel: 'Home' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarIcon: ({ color }) => <TabIcon name="✨" color={color} />, tabBarLabel: 'GeniAI' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: ({ color }) => <TabIcon name="⚙️" color={color} />, tabBarLabel: 'Settings' }} />
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
