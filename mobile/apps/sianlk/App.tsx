import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Animated, ActivityIndicator,
  SafeAreaView, StatusBar, Dimensions, FlatList, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SW } = Dimensions.get('window');
const API = 'https://sianlk-unified-9w6jz.ondigitalocean.app';

const T = {
  bg: '#0A0A0F', card: '#13131A', border: '#1E1E2E',
  accent: '#8B5CF6', cyan: '#06B6D4', text: '#E2E8F0',
  muted: '#64748B', green: '#10B981', red: '#EF4444',
  yellow: '#F59E0B', orange: '#F97316', pink: '#EC4899',
};

function Particles({ count = 18 }: { count?: number }) {
  const anims = useRef(Array.from({ length: count }, () => ({
    op: new Animated.Value(0),
    x: Math.random() * SW, y: Math.random() * 900,
    size: Math.random() * 3 + 1,
    dur: 2400 + Math.random() * 2800, delay: Math.random() * 2400,
    color: ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981', '#F97316'][Math.floor(Math.random() * 5)],
  }))).current;
  useEffect(() => {
    anims.forEach(p => Animated.loop(Animated.sequence([
      Animated.delay(p.delay),
      Animated.timing(p.op, { toValue: 0.55, duration: p.dur, useNativeDriver: true }),
      Animated.timing(p.op, { toValue: 0, duration: p.dur, useNativeDriver: true }),
    ])).start());
  }, []);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {anims.map((p, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: p.x, top: p.y,
          width: p.size, height: p.size, borderRadius: p.size / 2,
          backgroundColor: p.color, opacity: p.op,
        }} />
      ))}
    </View>
  );
}

function GCard({ children, style }: any) {
  return (
    <View style={[{
      backgroundColor: 'rgba(19,19,26,0.97)', borderRadius: 16,
      borderWidth: 1, borderColor: 'rgba(139,92,246,0.14)',
    }, style]}>{children}</View>
  );
}

function GBtn({ label, onPress, style, loading, colors = [T.accent, '#7C3AED'] }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.82}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 24, borderRadius: 12 }}>
        {loading ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{label}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

async function apiFetch(method: string, path: string, body?: any, token?: string | null) {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${API}${path}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json();
  if (!r.ok) throw new Error(d.detail || JSON.stringify(d));
  return d;
}

// ── All 11 apps ───────────────────────────────────────────────────────────────
const APPS = [
  { slug: 'geniai',      name: 'GeniAI',       emoji: '🤖', color: T.accent,  desc: 'Streaming AI chat & personas',          category: 'AI'        },
  { slug: 'aiaesthetics',name: 'AI Aesthetics', emoji: '💆', color: T.pink,    desc: 'Skin analysis & beauty AI',             category: 'Health'    },
  { slug: 'aiblty',      name: 'AIBlty',        emoji: '🧠', color: T.cyan,    desc: 'Skills assessment & learning path',     category: 'Education' },
  { slug: 'aibltycode',  name: 'AIBltyCode',    emoji: '💻', color: T.green,   desc: 'AI code editor & explainer',           category: 'Dev'       },
  { slug: 'buildquote',  name: 'BuildQuote',    emoji: '🏗️', color: T.yellow,  desc: 'Quantum construction estimator',        category: 'Business'  },
  { slug: 'comppropdata',name: 'CompPropData',  emoji: '🏘️', color: T.green,   desc: 'Commercial property intelligence',      category: 'Business'  },
  { slug: 'geniqx',      name: 'GeniQX',        emoji: '⚛️', color: '#A78BFA', desc: 'Quantum circuit studio',                category: 'Science'   },
  { slug: 'gitgit',      name: 'GitGit',        emoji: '🦄', color: T.orange,  desc: 'AI Git intelligence & PR review',       category: 'Dev'       },
  { slug: 'sianlk',      name: 'Sianlk Hub',    emoji: '🌐', color: T.accent,  desc: 'Platform hub & cross-app dashboard',   category: 'Platform'  },
  { slug: 'terminalai',  name: 'TerminalAI',    emoji: '⌨️', color: '#34D399', desc: 'AI command explainer & terminal help',  category: 'Dev'       },
  { slug: 'aib',         name: 'AIB',           emoji: '🔬', color: T.cyan,    desc: 'AI model router & embeddings tester',  category: 'AI'        },
];

const STATS = [
  { label: 'Total Apps',      value: '11',    color: T.accent, emoji: '🚀' },
  { label: 'AI Requests',     value: '2.4k',  color: T.cyan,   emoji: '⚡' },
  { label: 'Active Users',    value: '148',   color: T.green,  emoji: '👥' },
  { label: 'Uptime',          value: '99.8%', color: T.yellow, emoji: '✅' },
];

const RECENT_ACTIVITY = [
  { app: 'GeniAI',     event: 'Chat session — 24 turns',       ago: '3m',  color: T.accent },
  { app: 'AIBlty',     event: 'Assessment completed — Score 82', ago: '8m',  color: T.cyan   },
  { app: 'BuildQuote', event: 'Estimate generated — $2.4M',     ago: '19m', color: T.yellow },
  { app: 'CompProp',   event: 'Valuation: $4.2M office CBD',     ago: '31m', color: T.green  },
  { app: 'GitGit',     event: 'PR reviewed — 3 issues found',   ago: '1h',  color: T.orange },
];

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Splash ────────────────────────────────────────────────────────────────────
function SplashScreen({ navigation }: any) {
  const scale = useRef(new Animated.Value(0.1)).current;
  const op    = useRef(new Animated.Value(0)).current;
  const rot   = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 36, friction: 7, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 750, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.timing(rot, { toValue: 1, duration: 8000, useNativeDriver: true })).start();
    AsyncStorage.getItem('sianlk_t').then(t =>
      setTimeout(() => navigation.replace(t ? 'Main' : 'Onboarding'), 2600)
    );
  }, []);
  const rotDeg = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}>
      <LinearGradient colors={['#130A2A', '#0A0A0F', '#051020']} style={StyleSheet.absoluteFill} />
      <Particles count={26} />
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity: op }}>
        <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={{ position: 'absolute', transform: [{ rotate: rotDeg }] }}>
            <LinearGradient colors={[T.accent, T.cyan, T.pink, T.orange]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ width: 120, height: 120, borderRadius: 60, padding: 3 }}>
              <View style={{ flex: 1, borderRadius: 57, backgroundColor: T.bg }} />
            </LinearGradient>
          </Animated.View>
          <Text style={{ fontSize: 52 }}>🌐</Text>
        </View>
        <Text style={{ color: T.text, fontSize: 34, fontWeight: '900', marginTop: 22, letterSpacing: -0.5 }}>Sianlk Hub</Text>
        <Text style={{ color: T.muted, fontSize: 13, marginTop: 6, letterSpacing: 2 }}>AI PLATFORM SUITE · 11 APPS</Text>
      </Animated.View>
    </View>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
const SLIDES = [
  { emoji: '🚀', title: 'One Hub. 11 AI Apps.', desc: 'Sianlk Hub is your command centre for the entire AI platform suite — GeniAI, GeniQX, GitGit, AIBlty, CompPropData and more.' },
  { emoji: '📊', title: 'Cross-App Intelligence', desc: 'See your usage, insights and AI-powered recommendations across all apps in one unified dashboard.' },
  { emoji: '⚡', title: 'Instant Access', desc: 'Launch any app with one tap. Switch contexts instantly. Your account and preferences sync across the entire Sianlk ecosystem.' },
];

function OnboardingScreen({ navigation }: any) {
  const [idx, setIdx] = useState(0);
  const op    = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;
  const advance = () => {
    Animated.parallel([
      Animated.timing(op,     { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideX, { toValue: -30, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      if (idx < SLIDES.length - 1) {
        setIdx(i => i + 1); slideX.setValue(30);
        Animated.parallel([
          Animated.timing(op,     { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.timing(slideX, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start();
      } else navigation.replace('Auth');
    });
  };
  const s = SLIDES[idx];
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#130A2A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <Particles count={10} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Animated.View style={{ alignItems: 'center', opacity: op, transform: [{ translateX: slideX }] }}>
            <LinearGradient colors={[T.accent + '40', T.cyan + '25']}
              style={{ width: 130, height: 130, borderRadius: 42, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 72 }}>{s.emoji}</Text>
            </LinearGradient>
            <Text style={{ color: T.text, fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 22, marginBottom: 14, lineHeight: 34 }}>{s.title}</Text>
            <Text style={{ color: T.muted, fontSize: 16, textAlign: 'center', lineHeight: 27 }}>{s.desc}</Text>
          </Animated.View>
        </View>
        <View style={{ padding: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 22 }}>
            {SLIDES.map((_, i) => <View key={i} style={{ width: i === idx ? 26 : 7, height: 7, borderRadius: 3.5, backgroundColor: i === idx ? T.accent : T.border }} />)}
          </View>
          <GBtn label={idx < SLIDES.length - 1 ? 'Continue →' : 'Enter Hub'} onPress={advance} />
        </View>
      </SafeAreaView>
    </View>
  );
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function AuthScreen({ navigation }: any) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(''); const [pw, setPw] = useState('');
  const [name, setName] = useState(''); const [loading, setLoading] = useState(false); const [err, setErr] = useState('');
  const submit = async () => {
    if (!email || !pw) return setErr('Please fill in all fields');
    setLoading(true); setErr('');
    try {
      let token: string;
      if (mode === 'register') {
        const r = await apiFetch('POST', '/api/auth/register', { email, password: pw, full_name: name || email.split('@')[0] });
        token = r.access_token;
      } else {
        const fd = new URLSearchParams(); fd.append('username', email); fd.append('password', pw);
        const r = await fetch(`${API}/api/auth/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() });
        const d = await r.json(); if (!r.ok) throw new Error(d.detail || 'Login failed'); token = d.access_token;
      }
      await AsyncStorage.setItem('sianlk_t', token); navigation.replace('Main');
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: T.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#130A2A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 28 }}>
        <Text style={{ color: T.text, fontSize: 30, fontWeight: '800', marginBottom: 6 }}>{mode === 'login' ? 'Enter the Hub 🌐' : 'Join Sianlk'}</Text>
        <Text style={{ color: T.muted, marginBottom: 28, fontSize: 14 }}>One account. All 11 AI apps.</Text>
        <GCard style={{ padding: 18, marginBottom: 16 }}>
          {mode === 'register' && <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 14, fontSize: 15, marginBottom: 12 }} placeholder="Full name" placeholderTextColor={T.muted} value={name} onChangeText={setName} autoCapitalize="words" />}
          <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 14, fontSize: 15, marginBottom: 12 }} placeholder="Email" placeholderTextColor={T.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 14, fontSize: 15 }} placeholder="Password" placeholderTextColor={T.muted} value={pw} onChangeText={setPw} secureTextEntry onSubmitEditing={submit} />
          {err ? <Text style={{ color: T.red, marginTop: 10, fontSize: 13 }}>{err}</Text> : null}
        </GCard>
        <GBtn label={mode === 'login' ? 'Sign In' : 'Join Free'} onPress={submit} loading={loading} style={{ marginBottom: 14 }} />
        <TouchableOpacity onPress={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErr(''); }} style={{ alignItems: 'center' }}>
          <Text style={{ color: T.muted, fontSize: 13 }}>{mode === 'login' ? 'No account? ' : 'Have an account? '}<Text style={{ color: T.cyan, fontWeight: '600' }}>{mode === 'login' ? 'Join free' : 'Sign in'}</Text></Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ── Home Tab ──────────────────────────────────────────────────────────────────
function HomeTab() {
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'AI', 'Dev', 'Business', 'Health', 'Education', 'Science', 'Platform'];
  const filtered = filter === 'All' ? APPS : APPS.filter(a => a.category === filter);
  const numCols = 3;
  const itemW = (SW - 40 - 16) / numCols;

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#130A2A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <Particles count={14} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Hero header */}
          <LinearGradient colors={[T.accent + 'CC', T.cyan + 'CC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ margin: 18, borderRadius: 24, padding: 22 }}>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700', letterSpacing: 2 }}>SIANLK PLATFORM</Text>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 }}>11 AI Apps</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>Quantum-powered · Unified platform</Text>
          </LinearGradient>

          {/* Stats row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, gap: 10, marginBottom: 22 }}>
            {STATS.map((s, i) => (
              <GCard key={i} style={{ padding: 16, alignItems: 'center', minWidth: 90 }}>
                <Text style={{ fontSize: 20, marginBottom: 4 }}>{s.emoji}</Text>
                <Text style={{ color: s.color, fontSize: 20, fontWeight: '900' }}>{s.value}</Text>
                <Text style={{ color: T.muted, fontSize: 10, textAlign: 'center', marginTop: 2 }}>{s.label}</Text>
              </GCard>
            ))}
          </ScrollView>

          {/* Category filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, gap: 8, marginBottom: 18 }}>
            {categories.map(c => (
              <TouchableOpacity key={c} onPress={() => setFilter(c)}
                style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: filter === c ? T.accent + '33' : T.card, borderWidth: 1, borderColor: filter === c ? T.accent : T.border }}>
                <Text style={{ color: filter === c ? T.accent : T.muted, fontWeight: '600', fontSize: 12 }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* App grid */}
          <Text style={{ color: T.text, fontSize: 17, fontWeight: '700', marginHorizontal: 18, marginBottom: 14 }}>{filter === 'All' ? 'All Apps' : filter}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 18, gap: 8 }}>
            {filtered.map((app, i) => (
              <TouchableOpacity key={app.slug} activeOpacity={0.82}
                onPress={() => Linking.openURL(`https://sianlk-unified-9w6jz.ondigitalocean.app/${app.slug}`)}
                style={{ width: itemW, marginBottom: 6 }}>
                <GCard style={{ padding: 14, alignItems: 'center' }}>
                  <LinearGradient colors={[app.color + '33', app.color + '11']}
                    style={{ width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 26 }}>{app.emoji}</Text>
                  </LinearGradient>
                  <Text style={{ color: T.text, fontSize: 11, fontWeight: '700', textAlign: 'center', marginBottom: 3, lineHeight: 15 }}>{app.name}</Text>
                  <Text style={{ color: T.muted, fontSize: 9, textAlign: 'center', lineHeight: 13 }}>{app.desc}</Text>
                </GCard>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Dashboard Tab ─────────────────────────────────────────────────────────────
function DashboardTab() {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }).start(); }, []);
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#130A2A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView style={{ opacity: fade }} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
          <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 20 }}>📊 Dashboard</Text>

          {/* Usage chart placeholder */}
          <GCard style={{ padding: 20, marginBottom: 16 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 }}>PLATFORM USAGE (7 DAYS)</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 70, paddingBottom: 4 }}>
              {[40, 65, 45, 80, 55, 90, 72].map((h, i) => {
                const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                return (
                  <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                    <LinearGradient colors={[T.accent, T.cyan]} style={{ width: '80%', height: h * 0.6, borderRadius: 4 }} />
                    <Text style={{ color: T.muted, fontSize: 9, marginTop: 4 }}>{dayLabels[i]}</Text>
                  </View>
                );
              })}
            </View>
          </GCard>

          {/* AI request count by app */}
          <GCard style={{ padding: 18, marginBottom: 16 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 }}>REQUESTS BY APP</Text>
            {[
              { name: 'GeniAI',      reqs: 842, color: T.accent },
              { name: 'AIBlty',      reqs: 481, color: T.cyan   },
              { name: 'GitGit',      reqs: 378, color: T.orange },
              { name: 'CompPropData',reqs: 312, color: T.green  },
              { name: 'GeniQX',      reqs: 194, color: '#A78BFA'},
            ].map((app, i) => {
              const pct = app.reqs / 842;
              return (
                <View key={i} style={{ marginBottom: 11 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: T.text, fontSize: 13 }}>{app.name}</Text>
                    <Text style={{ color: app.color, fontWeight: '700', fontSize: 12 }}>{app.reqs}</Text>
                  </View>
                  <View style={{ height: 5, backgroundColor: T.border, borderRadius: 3 }}>
                    <View style={{ height: 5, borderRadius: 3, backgroundColor: app.color, width: `${Math.round(pct * 100)}%` }} />
                  </View>
                </View>
              );
            })}
          </GCard>

          {/* Recent activity */}
          <GCard style={{ padding: 18 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 }}>RECENT ACTIVITY</Text>
            {RECENT_ACTIVITY.map((a, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: i < RECENT_ACTIVITY.length - 1 ? 1 : 0, borderBottomColor: T.border }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: a.color }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: T.text, fontSize: 13, lineHeight: 18 }}>{a.event}</Text>
                  <Text style={{ color: T.muted, fontSize: 11 }}>{a.app} · {a.ago} ago</Text>
                </View>
              </View>
            ))}
          </GCard>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ navigation }: any) {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('sianlk_t').then(async t => {
      if (!t) { setLoading(false); return; }
      try {
        const d = await apiFetch('GET', '/api/auth/me', undefined, t);
        setEmail(d.email ?? '');
      } catch {}
      setLoading(false);
    });
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('sianlk_t');
    navigation.replace('Auth');
  };

  const SETTINGS = [
    { icon: '🔔', label: 'Notifications',     sub: 'Activity alerts & updates' },
    { icon: '🎨', label: 'Appearance',         sub: 'Dark mode active' },
    { icon: '🔒', label: 'Privacy & Security', sub: 'Data encryption enabled' },
    { icon: '🌐', label: 'Language',           sub: 'English' },
    { icon: '📱', label: 'App Permissions',    sub: 'Camera, notifications' },
    { icon: '💬', label: 'Support & Feedback', sub: 'Get help or report issues' },
    { icon: '📄', label: 'Terms & Privacy',    sub: 'Legal information' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#130A2A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
          <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 20 }}>👤 Profile</Text>

          {/* Avatar */}
          <GCard style={{ padding: 22, marginBottom: 20, alignItems: 'center' }}>
            <LinearGradient colors={[T.accent, T.cyan]}
              style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 38 }}>🌐</Text>
            </LinearGradient>
            <Text style={{ color: T.text, fontSize: 18, fontWeight: '800', marginBottom: 4 }}>
              {loading ? '...' : email.split('@')[0] || 'User'}
            </Text>
            <Text style={{ color: T.muted, fontSize: 14 }}>{loading ? '' : email}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <View style={{ alignItems: 'center', paddingHorizontal: 18 }}>
                <Text style={{ color: T.accent, fontSize: 20, fontWeight: '900' }}>11</Text>
                <Text style={{ color: T.muted, fontSize: 11 }}>Apps</Text>
              </View>
              <View style={{ width: 1, backgroundColor: T.border }} />
              <View style={{ alignItems: 'center', paddingHorizontal: 18 }}>
                <Text style={{ color: T.cyan, fontSize: 20, fontWeight: '900' }}>2.4k</Text>
                <Text style={{ color: T.muted, fontSize: 11 }}>Requests</Text>
              </View>
              <View style={{ width: 1, backgroundColor: T.border }} />
              <View style={{ alignItems: 'center', paddingHorizontal: 18 }}>
                <Text style={{ color: T.green, fontSize: 20, fontWeight: '900' }}>Free</Text>
                <Text style={{ color: T.muted, fontSize: 11 }}>Plan</Text>
              </View>
            </View>
          </GCard>

          {/* Upgrade banner */}
          <LinearGradient colors={[T.accent, T.cyan]} style={{ borderRadius: 16, padding: 18, marginBottom: 20 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 4 }}>⚡ Upgrade to Pro</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 12 }}>Unlimited AI requests, priority quantum compute, advanced analytics</Text>
            <TouchableOpacity style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20, alignSelf: 'flex-start' }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>View Plans →</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Settings */}
          <GCard style={{ padding: 4, marginBottom: 16 }}>
            {SETTINGS.map((s, i) => (
              <TouchableOpacity key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: i < SETTINGS.length - 1 ? 1 : 0, borderBottomColor: T.border }}>
                <Text style={{ fontSize: 20, marginRight: 14 }}>{s.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: T.text, fontSize: 14, fontWeight: '600' }}>{s.label}</Text>
                  <Text style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>{s.sub}</Text>
                </View>
                <Text style={{ color: T.muted, fontSize: 16 }}>›</Text>
              </TouchableOpacity>
            ))}
          </GCard>

          <TouchableOpacity onPress={logout}
            style={{ backgroundColor: T.red + '22', borderWidth: 1, borderColor: T.red + '44', borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ color: T.red, fontWeight: '700', fontSize: 15 }}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Main Tabs ─────────────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#0D0D14', borderTopColor: T.border, height: Platform.OS === 'ios' ? 90 : 68, paddingBottom: Platform.OS === 'ios' ? 28 : 12, paddingTop: 10 },
      tabBarActiveTintColor: T.accent, tabBarInactiveTintColor: T.muted,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
    }}>
      <Tab.Screen name="Home"      component={HomeTab}      options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🚀</Text>, tabBarLabel: 'Apps' }} />
      <Tab.Screen name="Dashboard" component={DashboardTab} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📊</Text>, tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Profile"   component={ProfileTab}   options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>, tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: T.bg, card: T.card, border: T.border } }}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash"     component={SplashScreen}     />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth"       component={AuthScreen}       />
        <Stack.Screen name="Main"       component={MainTabs}         />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
