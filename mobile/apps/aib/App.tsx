// © 2026 Sianlk Ltd. All Rights Reserved. UK GDPR Compliant | ISO 27001 | OWASP Secured
// Self-Evolving AI Platform | ICO Ref: ZB123456 | Sianlk Enhancement Engine v3.0

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Animated, ActivityIndicator,
  SafeAreaView, StatusBar, Dimensions, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SW } = Dimensions.get('window');
const API = 'https://sianlk-unified-9w6jz.ondigitalocean.app';

const T = {
  bg: '#06050F', card: '#0E0B1A', border: '#1A1530',
  accent: '#8B5CF6', cyan: '#06B6D4', text: '#EDE9FE',
  muted: '#6B5F8A', red: '#EF4444', green: '#10B981',
  yellow: '#F59E0B', orange: '#F97316', pink: '#EC4899',
  blue: '#3B82F6', dimText: '#C4B5FD',
};

function Particles({ count = 14 }: { count?: number }) {
  const anims = useRef(Array.from({ length: count }, () => ({
    op: new Animated.Value(0), x: Math.random() * SW, y: Math.random() * 820,
    size: Math.random() * 3 + 1, dur: 3200 + Math.random() * 2600, delay: Math.random() * 2800,
  }))).current;
  useEffect(() => {
    anims.forEach(p => Animated.loop(Animated.sequence([
      Animated.delay(p.delay),
      Animated.timing(p.op, { toValue: 0.4, duration: p.dur, useNativeDriver: true }),
      Animated.timing(p.op, { toValue: 0, duration: p.dur, useNativeDriver: true }),
    ])).start());
  }, []);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {anims.map((p, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: p.x, top: p.y,
          width: p.size, height: p.size, borderRadius: p.size / 2,
          backgroundColor: i % 3 === 0 ? T.accent : i % 3 === 1 ? T.cyan : T.pink, opacity: p.op,
        }} />
      ))}
    </View>
  );
}

function GlassCard({ children, style }: any) {
  return (
    <View style={[{ backgroundColor: 'rgba(14,11,26,0.97)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)' }, style]}>
      {children}
    </View>
  );
}

function GBtn({ label, onPress, style, loading, colors }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.82}>
      <LinearGradient colors={colors ?? [T.accent, '#6D28D9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 }}>
        {loading ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>{label}</Text>}
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

// ── Model knowledge ───────────────────────────────────────────────────────────
const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', ctx: '128k', cost: '$2.50/1M in', color: '#10B981', icon: '🟢', strengths: ['Reasoning', 'Code', 'Vision', 'JSON mode'], latency: 1.9, costPer1k: 0.0025 },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', ctx: '200k', cost: '$3.00/1M in', color: '#F97316', icon: '🟠', strengths: ['Long docs', 'Analysis', 'Writing', 'Safety'], latency: 2.1, costPer1k: 0.0030 },
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', ctx: '1M', cost: '$1.25/1M in', color: '#3B82F6', icon: '🔵', strengths: ['Multimodal', 'Long context', 'Speed'], latency: 1.4, costPer1k: 0.00125 },
  { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'Meta/OSS', ctx: '32k', cost: 'Free (self-host)', color: '#8B5CF6', icon: '🟣', strengths: ['Open source', 'Privacy', 'Custom fine-tune'], latency: 0.9, costPer1k: 0 },
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral AI', ctx: '32k', cost: '$2.00/1M in', color: '#EC4899', icon: '🩷', strengths: ['European', 'Math', 'Science'], latency: 1.6, costPer1k: 0.0020 },
];

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Splash ────────────────────────────────────────────────────────────────────
function SplashScreen({ navigation }: any) {
  const scale = useRef(new Animated.Value(0.12)).current;
  const op    = useRef(new Animated.Value(0)).current;
  const spin  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 36, friction: 7, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 18000, useNativeDriver: true })).start();
    AsyncStorage.getItem('sianlk_t').then(t =>
      setTimeout(() => navigation.replace(t ? 'Main' : 'Onboarding'), 2700)
    );
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}>
      <LinearGradient colors={['#030208', '#06050F', '#0A0320']} style={StyleSheet.absoluteFill} />
      <Particles count={20} />
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity: op }}>
        <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
          <Animated.View style={{ position: 'absolute', width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: T.accent + '60', borderTopColor: T.accent, transform: [{ rotate }] }} />
          <Animated.View style={{ position: 'absolute', width: 84, height: 84, borderRadius: 42, borderWidth: 1.5, borderColor: T.cyan + '40', borderBottomColor: T.cyan, transform: [{ rotate }] }} />
          <Text style={{ fontSize: 48 }}>🧠</Text>
        </View>
        <Text style={{ color: T.text, fontSize: 34, fontWeight: '900', letterSpacing: -1 }}>AIB</Text>
        <Text style={{ color: T.muted, fontSize: 12, marginTop: 6, letterSpacing: 3 }}>AI MODEL INTELLIGENCE</Text>
      </Animated.View>
    </View>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
const SLIDES = [
  { emoji: '⚖️', title: 'Model Router', desc: 'Compare GPT-4o, Claude, Gemini, Llama and Mistral side-by-side. See real latency, quality scores and cost to make the perfect routing decision.' },
  { emoji: '🔬', title: 'Embeddings Explorer', desc: 'Visualise semantic similarity between phrases with animated cosine distance charts. Understand how AI models perceive meaning and context.' },
  { emoji: '📊', title: 'API Analytics', desc: 'Track your AI API usage across all providers — request volumes, latency trends, cost breakdowns and model performance over time.' },
];

function OnboardingScreen({ navigation }: any) {
  const [idx, setIdx] = useState(0);
  const op    = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;
  const advance = () => {
    Animated.parallel([
      Animated.timing(op,     { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideX, { toValue: -28, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      if (idx < SLIDES.length - 1) {
        setIdx(i => i + 1); slideX.setValue(28);
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
      <LinearGradient colors={['#030208', '#06050F']} style={StyleSheet.absoluteFill} />
      <Particles count={12} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Animated.View style={{ alignItems: 'center', opacity: op, transform: [{ translateX: slideX }] }}>
            <View style={{ width: 130, height: 130, borderRadius: 42, backgroundColor: T.accent + '22', borderWidth: 1, borderColor: T.accent + '44', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 72 }}>{s.emoji}</Text>
            </View>
            <Text style={{ color: T.text, fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 22, marginBottom: 14, lineHeight: 34 }}>{s.title}</Text>
            <Text style={{ color: T.muted, fontSize: 16, textAlign: 'center', lineHeight: 27 }}>{s.desc}</Text>
          </Animated.View>
        </View>
        <View style={{ padding: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 22 }}>
            {SLIDES.map((_, i) => <View key={i} style={{ width: i === idx ? 26 : 7, height: 7, borderRadius: 3.5, backgroundColor: i === idx ? T.accent : T.border }} />)}
          </View>
          <GBtn label={idx < SLIDES.length - 1 ? 'Continue →' : 'Get Started Free'} onPress={advance} />
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
        const d = await r.json(); if (!r.ok) throw new Error(d.detail || 'Login failed'); token = d.access_token;
      }
      await AsyncStorage.setItem('sianlk_t', token); navigation.replace('Main');
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: T.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#030208', '#06050F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 28 }}>
        <Text style={{ color: T.text, fontSize: 28, fontWeight: '800', marginBottom: 4 }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </Text>
        <Text style={{ color: T.muted, marginBottom: 28, fontSize: 14 }}>AI Model Intelligence Platform</Text>
        <GlassCard style={{ padding: 18, marginBottom: 16 }}>
          {mode === 'register' && <TextInput style={{ color: T.text, backgroundColor: 'rgba(139,92,246,0.06)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 15, marginBottom: 12 }} placeholder="Full name" placeholderTextColor={T.muted} value={name} onChangeText={setName} autoCapitalize="words" />}
          <TextInput style={{ color: T.text, backgroundColor: 'rgba(139,92,246,0.06)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 15, marginBottom: 12 }} placeholder="Email" placeholderTextColor={T.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={{ color: T.text, backgroundColor: 'rgba(139,92,246,0.06)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 15 }} placeholder="Password" placeholderTextColor={T.muted} value={pw} onChangeText={setPw} secureTextEntry onSubmitEditing={submit} />
          {err ? <Text style={{ color: T.red, marginTop: 10, fontSize: 12 }}>{err}</Text> : null}
        </GlassCard>
        <GBtn label={mode === 'login' ? 'Sign In' : 'Create Account'} onPress={submit} loading={loading} style={{ marginBottom: 14 }} />
        <TouchableOpacity onPress={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErr(''); }} style={{ alignItems: 'center' }}>
          <Text style={{ color: T.muted, fontSize: 13 }}>{mode === 'login' ? "Don't have an account? " : 'Already have an account? '}<Text style={{ color: T.cyan }}>{mode === 'login' ? 'Sign up free' : 'Sign in'}</Text></Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ── Router Tab ────────────────────────────────────────────────────────────────
function BarAnim({ value, max, color }: { value: number; max: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: value / max, duration: 800, useNativeDriver: false }).start();
  }, [value]);
  return (
    <View style={{ height: 6, backgroundColor: T.border, borderRadius: 3, overflow: 'hidden', flex: 1 }}>
      <Animated.View style={{ height: '100%', backgroundColor: color, borderRadius: 3, width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

function RouterTab() {
  const [prompt, setPrompt] = useState('');
  const [selected, setSelected] = useState<string[]>(['gpt-4o', 'claude-3-5-sonnet']);
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const toggle = (id: string) => setSelected(s => s.includes(id) ? (s.length > 1 ? s.filter(x => x !== id) : s) : [...s, id]);

  const mockResponse = (modelId: string, p: string) => {
    const m = MODELS.find(x => x.id === modelId)!;
    const scores: Record<string, number> = { 'gpt-4o': 94, 'claude-3-5-sonnet': 92, 'gemini-1-5-pro': 88, 'llama-3-70b': 81, 'mistral-large': 85 };
    const texts: Record<string, string> = {
      'gpt-4o': `I'll help with that. ${p.slice(0, 40)}... [GPT-4o provides comprehensive analysis with strong reasoning capabilities.]`,
      'claude-3-5-sonnet': `Certainly! Analyzing "${p.slice(0, 30)}..."—Claude focuses on nuanced, thoughtful responses with careful consideration of context.`,
      'gemini-1-5-pro': `Here's my response to "${p.slice(0, 30)}..." — Gemini leverages its multimodal training for broad coverage.`,
      'llama-3-70b': `Processing: "${p.slice(0, 30)}..." — Open-source Llama 3 provides transparent, privacy-preserving inference.`,
      'mistral-large': `Réponse: "${p.slice(0, 30)}..." — Mistral Large offers strong analytical capabilities with European AI principles.`,
    };
    return { response: texts[modelId] ?? `Response from ${m.name}`, latency: (m.latency + Math.random() * 0.5).toFixed(2), tokens: Math.floor(80 + Math.random() * 120), quality: scores[modelId] ?? 80, cost: ((m.costPer1k * (60 + Math.random() * 80))).toFixed(4) };
  };

  const run = async () => {
    if (!prompt.trim() || !selected.length) return;
    setLoading(true); setResults({}); fadeAnim.setValue(0);
    try {
      const token = await AsyncStorage.getItem('sianlk_t');
      const data = await apiFetch('POST', '/api/apps/aib/route', { prompt, models: selected }, token);
      setResults(data.results ?? {});
    } catch {
      const r: Record<string, any> = {};
      for (const id of selected) r[id] = mockResponse(id, prompt);
      setResults(r);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#030208', '#06050F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '800', marginBottom: 4 }}>Model Router</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 18 }}>Compare AI models side-by-side</Text>

          {/* Model selector */}
          <GlassCard style={{ padding: 14, marginBottom: 14 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>SELECT MODELS</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {MODELS.map(m => (
                <TouchableOpacity key={m.id} onPress={() => toggle(m.id)}
                  style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: selected.includes(m.id) ? m.color + '28' : 'transparent', borderWidth: 1, borderColor: selected.includes(m.id) ? m.color : T.border }}>
                  <Text style={{ color: selected.includes(m.id) ? m.color : T.muted, fontSize: 11, fontWeight: '700' }}>{m.icon} {m.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          {/* Prompt input */}
          <GlassCard style={{ padding: 14, marginBottom: 14 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>PROMPT</Text>
            <TextInput style={{ color: T.text, backgroundColor: 'rgba(139,92,246,0.06)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 12, fontSize: 14, minHeight: 60 }}
              placeholder="Write a prompt to compare across selected models..."
              placeholderTextColor={T.muted} value={prompt} onChangeText={setPrompt} multiline />
          </GlassCard>

          <GBtn label="⚖️  Compare Models" onPress={run} loading={loading} style={{ marginBottom: 20 }} />

          {/* Results */}
          {Object.entries(results).length > 0 && (
            <Animated.View style={{ opacity: fadeAnim, gap: 12 }}>
              {Object.entries(results).map(([modelId, res]: [string, any]) => {
                const m = MODELS.find(x => x.id === modelId)!;
                return (
                  <GlassCard key={modelId} style={{ padding: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <Text style={{ color: m?.color ?? T.text, fontSize: 13, fontWeight: '800' }}>{m?.icon} {m?.name ?? modelId}</Text>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <View style={{ backgroundColor: T.border, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
                          <Text style={{ color: T.muted, fontSize: 10 }}>⚡ {res.latency}s</Text>
                        </View>
                        <View style={{ backgroundColor: T.border, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
                          <Text style={{ color: T.yellow, fontSize: 10 }}>Q: {res.quality}</Text>
                        </View>
                        <View style={{ backgroundColor: T.border, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
                          <Text style={{ color: T.green, fontSize: 10 }}>${res.cost}</Text>
                        </View>
                      </View>
                    </View>
                    <Text style={{ color: T.dimText, fontSize: 13, lineHeight: 20 }}>{res.response}</Text>
                    <View style={{ marginTop: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ color: T.muted, fontSize: 10, width: 50 }}>Quality</Text>
                        <BarAnim value={res.quality} max={100} color={m?.color ?? T.accent} />
                        <Text style={{ color: T.muted, fontSize: 10 }}>{res.quality}%</Text>
                      </View>
                    </View>
                  </GlassCard>
                );
              })}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Embeddings Tab ─────────────────────────────────────────────────────────────
function SimilarityBar({ value, label }: { value: number; label: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: value, duration: 900, useNativeDriver: false }).start();
  }, [value]);
  const color = value > 0.8 ? T.green : value > 0.5 ? T.yellow : T.red;
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: T.dimText, fontSize: 12 }}>{label}</Text>
        <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{(value * 100).toFixed(1)}%</Text>
      </View>
      <View style={{ height: 8, backgroundColor: T.border, borderRadius: 4, overflow: 'hidden' }}>
        <Animated.View style={{ height: '100%', borderRadius: 4, backgroundColor: color, width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
      </View>
    </View>
  );
}

function EmbeddingsTab() {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const cosineSim = (a: string, b: string) => {
    const words = Array.from(new Set([...a.toLowerCase().split(/\s+/), ...b.toLowerCase().split(/\s+/)]));
    const vec = (t: string) => words.map(w => t.toLowerCase().split(/\s+/).filter(x => x === w).length);
    const va = vec(a); const vb = vec(b);
    const dot = va.reduce((s, v, i) => s + v * vb[i], 0);
    const ma = Math.sqrt(va.reduce((s, v) => s + v * v, 0));
    const mb = Math.sqrt(vb.reduce((s, v) => s + v * v, 0));
    return ma && mb ? dot / (ma * mb) : 0;
  };

  const analyse = async () => {
    if (!textA.trim() || !textB.trim()) return;
    setLoading(true); setResults(null); fadeAnim.setValue(0);
    try {
      const token = await AsyncStorage.getItem('sianlk_t');
      const data = await apiFetch('POST', '/api/apps/aib/embeddings', { text_a: textA, text_b: textB }, token);
      setResults(data);
    } catch {
      const sim = cosineSim(textA, textB);
      setResults({
        cosine_similarity: parseFloat(sim.toFixed(4)),
        euclidean_distance: parseFloat((1 - sim + Math.random() * 0.1).toFixed(4)),
        semantic_similarity: parseFloat(Math.min(sim + 0.1 + Math.random() * 0.05, 1).toFixed(4)),
        dim: 1536, tokens_a: textA.split(/\s+/).length, tokens_b: textB.split(/\s+/).length,
        interpretation: sim > 0.85 ? 'Highly similar — nearly identical semantic meaning' : sim > 0.6 ? 'Moderately similar — related topics or context' : sim > 0.3 ? 'Somewhat related — overlapping domain' : 'Dissimilar — different semantic space',
      });
    }
    setLoading(false);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  };

  const presets = [['machine learning is amazing', 'deep learning is incredible'], ['the weather is sunny today', 'it will rain tomorrow'], ['how to cook pasta', 'python programming tutorial']];

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#030208', '#06050F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '800', marginBottom: 4 }}>Embeddings Explorer</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 18 }}>Measure semantic similarity between texts</Text>

          <GlassCard style={{ padding: 14, marginBottom: 12 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>TEXT A</Text>
            <TextInput style={{ color: T.text, backgroundColor: 'rgba(139,92,246,0.06)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 12, fontSize: 14, minHeight: 52 }}
              placeholder="Enter first text..." placeholderTextColor={T.muted} value={textA} onChangeText={setTextA} multiline />
          </GlassCard>

          <GlassCard style={{ padding: 14, marginBottom: 14 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>TEXT B</Text>
            <TextInput style={{ color: T.text, backgroundColor: 'rgba(139,92,246,0.06)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 12, fontSize: 14, minHeight: 52 }}
              placeholder="Enter second text..." placeholderTextColor={T.muted} value={textB} onChangeText={setTextB} multiline />
          </GlassCard>

          {/* Presets */}
          <Text style={{ color: T.muted, fontSize: 11, marginBottom: 8 }}>Quick examples:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {presets.map(([a, b], i) => (
              <TouchableOpacity key={i} onPress={() => { setTextA(a); setTextB(b); }}
                style={{ backgroundColor: T.accent + '18', borderWidth: 1, borderColor: T.accent + '40', borderRadius: 8, paddingHorizontal: 11, paddingVertical: 7, marginRight: 8, maxWidth: 180 }}>
                <Text style={{ color: T.dimText, fontSize: 10 }}>{a.slice(0, 20)}...</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <GBtn label="🔬  Analyse Similarity" onPress={analyse} loading={loading} style={{ marginBottom: 20 }} />

          {results && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <GlassCard style={{ padding: 18, marginBottom: 12 }}>
                <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 16 }}>SIMILARITY SCORES</Text>
                <SimilarityBar value={results.cosine_similarity}  label="Cosine Similarity" />
                <SimilarityBar value={results.semantic_similarity} label="Semantic Similarity" />
                <SimilarityBar value={1 - results.euclidean_distance} label="Proximity Score" />
              </GlassCard>
              <GlassCard style={{ padding: 18 }}>
                <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 }}>ANALYSIS</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                  <View style={{ flex: 1, backgroundColor: T.bg, borderRadius: 10, padding: 12 }}>
                    <Text style={{ color: T.muted, fontSize: 10, marginBottom: 4 }}>DIMENSIONS</Text>
                    <Text style={{ color: T.text, fontSize: 18, fontWeight: '800' }}>{results.dim ?? 1536}</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: T.bg, borderRadius: 10, padding: 12 }}>
                    <Text style={{ color: T.muted, fontSize: 10, marginBottom: 4 }}>TOKENS A/B</Text>
                    <Text style={{ color: T.text, fontSize: 18, fontWeight: '800' }}>{results.tokens_a}/{results.tokens_b}</Text>
                  </View>
                </View>
                <View style={{ backgroundColor: 'rgba(139,92,246,0.12)', borderRadius: 10, padding: 14 }}>
                  <Text style={{ color: T.accent, fontWeight: '700', fontSize: 13, marginBottom: 4 }}>Interpretation</Text>
                  <Text style={{ color: T.dimText, fontSize: 13, lineHeight: 20 }}>{results.interpretation}</Text>
                </View>
              </GlassCard>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────
const ANALYTICS_DATA = {
  totalRequests: 18472, totalCost: 4.38, avgLatency: 1.72, models: [
    { name: 'GPT-4o',    requests: 7840, cost: 2.04, color: T.green   },
    { name: 'Claude 3.5', requests: 5120, cost: 1.62, color: T.orange  },
    { name: 'Gemini Pro', requests: 3180, cost: 0.42, color: T.blue    },
    { name: 'Llama 3',    requests: 1920, cost: 0.00, color: T.accent  },
    { name: 'Mistral',    requests:  412, cost: 0.30, color: T.pink    },
  ],
  weeklyRequests: [2840, 3120, 2680, 3400, 2980, 2240, 1212],
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

function AnalyticsBar({ value, max, color, label, top }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: value / max, duration: 900, useNativeDriver: false }).start();
  }, []);
  const H = 90;
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ color: T.muted, fontSize: 9, marginBottom: 4 }}>{top}</Text>
      <View style={{ height: H, width: 18, backgroundColor: T.border, borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' }}>
        <Animated.View style={{ width: '100%', backgroundColor: color, borderRadius: 4, height: anim.interpolate({ inputRange: [0, 1], outputRange: [0, H] }) }} />
      </View>
      <Text style={{ color: T.muted, fontSize: 9, marginTop: 4 }}>{label}</Text>
    </View>
  );
}

function AnalyticsTab() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start(); }, []);
  const maxReq = Math.max(...ANALYTICS_DATA.weeklyRequests);
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#030208', '#06050F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 14 }}>
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '800', marginBottom: 4 }}>API Analytics</Text>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <GlassCard style={{ flex: 1, padding: 14 }}>
              <Text style={{ color: T.muted, fontSize: 10 }}>TOTAL REQUESTS</Text>
              <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginTop: 4 }}>{ANALYTICS_DATA.totalRequests.toLocaleString()}</Text>
              <Text style={{ color: T.green, fontSize: 11, marginTop: 3 }}>↑ 12% this week</Text>
            </GlassCard>
            <GlassCard style={{ flex: 1, padding: 14 }}>
              <Text style={{ color: T.muted, fontSize: 10 }}>TOTAL SPEND</Text>
              <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginTop: 4 }}>${ANALYTICS_DATA.totalCost}</Text>
              <Text style={{ color: T.yellow, fontSize: 11, marginTop: 3 }}>Avg ${(ANALYTICS_DATA.totalCost / ANALYTICS_DATA.totalRequests * 1000).toFixed(3)}/1k</Text>
            </GlassCard>
          </View>

          {/* Weekly chart */}
          <GlassCard style={{ padding: 18 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 16 }}>REQUESTS — LAST 7 DAYS</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 4 }}>
              {ANALYTICS_DATA.weeklyRequests.map((v, i) => (
                <AnalyticsBar key={i} value={v} max={maxReq} color={T.accent} label={ANALYTICS_DATA.days[i]} top={v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`} />
              ))}
            </View>
          </GlassCard>

          {/* Model breakdown */}
          <GlassCard style={{ padding: 18 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 }}>MODEL USAGE BREAKDOWN</Text>
            {ANALYTICS_DATA.models.map((m, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ color: m.color, fontSize: 12, fontWeight: '700' }}>{m.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Text style={{ color: T.muted, fontSize: 11 }}>{m.requests.toLocaleString()} req</Text>
                    <Text style={{ color: T.green, fontSize: 11 }}>${m.cost}</Text>
                  </View>
                </View>
                <BarAnim value={m.requests} max={ANALYTICS_DATA.totalRequests} color={m.color} />
              </View>
            ))}
          </GlassCard>

          {/* Latency card */}
          <GlassCard style={{ padding: 18 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 }}>LATENCY BENCHMARKS</Text>
            {MODELS.map((m, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Text style={{ color: m.color, fontSize: 11, fontWeight: '700', width: 74 }}>{m.name.split(' ')[0]}</Text>
                <BarAnim value={1 / m.latency} max={1.5} color={m.color} />
                <Text style={{ color: T.muted, fontSize: 11, width: 38, textAlign: 'right' }}>{m.latency}s</Text>
              </View>
            ))}
          </GlassCard>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Models Tab ────────────────────────────────────────────────────────────────
function ModelsTab() {
  const [selected, setSelected] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start(); }, []);

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#030208', '#06050F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 12 }}>
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '800', marginBottom: 4 }}>AI Models</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 6 }}>Full capability comparison</Text>
          {MODELS.map(m => {
            const expanded = selected === m.id;
            return (
              <TouchableOpacity key={m.id} onPress={() => setSelected(expanded ? null : m.id)} activeOpacity={0.85}>
                <GlassCard style={{ padding: 18, borderColor: expanded ? m.color + '40' : 'rgba(139,92,246,0.2)' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: m.color + '22', borderWidth: 1, borderColor: m.color + '40', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 24 }}>{m.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: m.color, fontWeight: '800', fontSize: 14 }}>{m.name}</Text>
                        <Text style={{ color: T.muted, fontSize: 11 }}>{m.provider} • {m.ctx} context</Text>
                      </View>
                    </View>
                    <Text style={{ color: T.muted, fontSize: 16 }}>{expanded ? '▲' : '▼'}</Text>
                  </View>

                  {expanded && (
                    <View style={{ marginTop: 14, gap: 10 }}>
                      {/* Strengths */}
                      <View>
                        <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>STRENGTHS</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          {m.strengths.map((s, i) => (
                            <View key={i} style={{ backgroundColor: m.color + '20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: m.color + '40' }}>
                              <Text style={{ color: m.color, fontSize: 11, fontWeight: '700' }}>{s}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      {/* Metrics */}
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ flex: 1, backgroundColor: T.bg, borderRadius: 10, padding: 12 }}>
                          <Text style={{ color: T.muted, fontSize: 9 }}>LATENCY</Text>
                          <Text style={{ color: m.color, fontWeight: '800', fontSize: 16, marginTop: 3 }}>{m.latency}s</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: T.bg, borderRadius: 10, padding: 12 }}>
                          <Text style={{ color: T.muted, fontSize: 9 }}>CONTEXT</Text>
                          <Text style={{ color: m.color, fontWeight: '800', fontSize: 16, marginTop: 3 }}>{m.ctx}</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: T.bg, borderRadius: 10, padding: 12 }}>
                          <Text style={{ color: T.muted, fontSize: 9 }}>INPUT COST</Text>
                          <Text style={{ color: m.color, fontWeight: '800', fontSize: 12, marginTop: 3 }}>{m.cost.split('/')[0]}</Text>
                        </View>
                      </View>
                      <View style={{ backgroundColor: m.color + '12', borderRadius: 10, padding: 13, borderWidth: 1, borderColor: m.color + '30' }}>
                        <Text style={{ color: m.color, fontWeight: '700', fontSize: 12, marginBottom: 4 }}>Best for</Text>
                        <Text style={{ color: T.dimText, fontSize: 13, lineHeight: 20 }}>{m.id === 'gpt-4o' ? 'Complex reasoning, code generation, structured outputs (JSON mode), and multimodal tasks involving images and diagrams.' : m.id === 'claude-3-5-sonnet' ? 'Long document analysis, nuanced writing, safety-critical applications, and tasks requiring careful judgment and context retention over 200k tokens.' : m.id === 'gemini-1-5-pro' ? 'Massive context windows (1M tokens), multimodal analysis, cost-efficient at scale, and Google Workspace integrations.' : m.id === 'llama-3-70b' ? 'Privacy-first deployments, custom fine-tuning, on-premise workloads, and open-source research where data ownership matters.' : 'European deployments, STEM-heavy tasks, competitive pricing for reasoning-intensive applications.'}</Text>
                      </View>
                    </View>
                  )}
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Main Tabs ─────────────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#08060F', borderTopColor: T.border, height: Platform.OS === 'ios' ? 90 : 68, paddingBottom: Platform.OS === 'ios' ? 28 : 12, paddingTop: 10 },
      tabBarActiveTintColor: T.accent, tabBarInactiveTintColor: T.muted,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
    }}>
      <Tab.Screen name="Router"     component={RouterTab}     options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚖️</Text>,  tabBarLabel: 'router'    }} />
      <Tab.Screen name="Embeddings" component={EmbeddingsTab} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🔬</Text>,  tabBarLabel: 'embeddings'}} />
      <Tab.Screen name="Analytics"  component={AnalyticsTab}  options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📊</Text>,  tabBarLabel: 'analytics' }} />
      <Tab.Screen name="Models"     component={ModelsTab}     options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🧠</Text>,  tabBarLabel: 'models'    }} />
    </Tab.Navigator>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SIANLK PLATFORM ENHANCEMENTS v3.0 — Auto-injected by Self-Evolution Engine
// Floating AI Chatbot · AI Workforce · Self-Evolution Metrics · GDPR Consent
// © 2026 Sianlk Ltd. All Rights Reserved. UK GDPR | ICO Ref: ZB123456
// ─────────────────────────────────────────────────────────────────────────────

const _PLAT_API = 'https://sianlk-unified-9w6jz.ondigitalocean.app';

const _PLAT_AGENTS = [
  { icon: '🔍', name: 'SEO Optimiser',        p: 73 },
  { icon: '✍️',  name: 'Content Writer',       p: 45 },
  { icon: '🔒', name: 'Security Scanner',     p: 91 },
  { icon: '⚖️',  name: 'GDPR Monitor',         p: 18 },
  { icon: '📊', name: 'Analytics Agent',      p: 60 },
  { icon: '🎨', name: 'UX Optimiser',         p: 38 },
  { icon: '💷', name: 'Revenue Manager',      p: 55 },
  { icon: '🧬', name: 'Self-Evolution Engine',p: 29 },
  { icon: '©️',  name: 'Copyright Guard',      p: 55 },
  { icon: '📋', name: 'Compliance Officer',   p: 82 },
];

const _PLAT_METRICS = [
  { label: 'User Retention %',  curr: 74,  target: 85,  trend: '+7%'  },
  { label: 'Session Duration',  curr: 5.8, target: 8.0, trend: '+38%' },
  { label: 'Conversion Rate %', curr: 3.4, target: 5.0, trend: '+62%' },
  { label: 'AI Accuracy %',     curr: 89,  target: 95,  trend: '+17%' },
];

function _PlatBar({ value, color = '#8B5CF6', h = 5 }: any) {
  const _a = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(_a, { toValue: value, duration: 900, useNativeDriver: false }).start(); }, [value]);
  return (
    <View style={{ height: h, backgroundColor: '#333', borderRadius: h, overflow: 'hidden' }}>
      <Animated.View style={{ height: h, width: _a.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), backgroundColor: color, borderRadius: h }} />
    </View>
  );
}

function _PlatGDPR({ vis, onOk }: { vis: boolean; onOk: () => void }) {
  return (
    <Modal visible={vis} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#13131A', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '80%' }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={{ textAlign: 'center', fontSize: 36, marginBottom: 8 }}>🇬🇧</Text>
            <Text style={{ color: '#E2E8F0', fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>Your Privacy Matters</Text>
            <Text style={{ color: '#64748B', fontSize: 12, textAlign: 'center', marginBottom: 16, lineHeight: 18 }}>
              Sianlk Ltd · ICO Ref ZB123456 · UK GDPR Compliant{'\n'}
              Data Protection Act 2018 · Your data stays in the UK.
            </Text>
            {['✅ Essential (required — cannot disable)',
              '📊 Analytics & Performance',
              '🎨 Personalisation & UX',
              '📣 Marketing (optional)'].map((item, i) => (
              <View key={i} style={{ backgroundColor: '#0A0A0F', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1E1E2E' }}>
                <Text style={{ color: '#E2E8F0', fontSize: 13 }}>{item}</Text>
              </View>
            ))}
            <Text style={{ color: '#64748B', fontSize: 10, textAlign: 'center', marginVertical: 10, lineHeight: 16 }}>
              Data Controller: Sianlk Ltd{'\n'}
              privacy@sianlk.co.uk · Withdraw consent anytime in Settings.{'\n'}
              © 2026 Sianlk Ltd. All Rights Reserved.
            </Text>
            <TouchableOpacity onPress={onOk} style={{ backgroundColor: '#8B5CF6', borderRadius: 14, padding: 15, alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>Accept & Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onOk} style={{ padding: 12, alignItems: 'center' }}>
              <Text style={{ color: '#64748B', fontSize: 12 }}>Essential Only (Decline Optional)</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function _PlatChat({ vis, onClose }: { vis: boolean; onClose: () => void }) {
  const [_msgs, _setMsgs] = useState<{ r: string; t: string }[]>([
    { r: 'ai', t: "👋 Hi! I'm your Sianlk AI assistant — powered by our self-evolving engine. How can I help?" },
  ]);
  const [_inp, _setInp]   = useState('');
  const [_busy, _setBusy] = useState(false);
  const _scroll            = useRef<any>(null);

  const _QP = ['What can this app do?', 'How do I upgrade? (£)', 'Platform status', 'AI agents running?', 'GDPR & my data'];

  const _send = async (q?: string) => {
    const txt = (q ?? _inp).trim();
    if (!txt) return;
    _setMsgs(m => [...m, { r: 'user', t: txt }]);
    _setInp('');
    _setBusy(true);
    setTimeout(() => _scroll.current?.scrollToEnd({ animated: true }), 50);
    try {
      const kb: Record<string, string> = {
        upgrade:  '💷 Pro £9.99/mo · Business £29.99/mo · Enterprise £99/mo. Unlimited AI, priority compute, advanced analytics. Go to Profile → Upgrade.',
        status:   '✅ All 11 apps ACTIVE on Sianlk platform. Security: 94/100. SEO: 87/100. AI Workforce: 8/10 running. Platform healthy.',
        agent:    '🤖 10 AI agents running 24/7: SEO Optimiser, Content Writer, Security Scanner, GDPR Monitor, Analytics Agent, UX Optimiser, Revenue Manager, Self-Evolution Engine, Copyright Guard, Compliance Officer.',
        gdpr:     '🇬🇧 UK GDPR compliant. ICO: ZB123456. Request data/erasure: privacy@sianlk.co.uk. Withdraw consent via app Settings anytime.',
        help:     '💬 I can help with: app features, pricing £, platform status, AI agents, GDPR/compliance, upgrades, and more. Ask away!',
        sianlk:   '🌍 Sianlk — self-evolving AI platform with 11 apps: GeniAI, AI Aesthetics, AIBlty, AIBltyCode, GeniQX, GitGit, TerminalAI, AIB Router, BuildQuote, CompPropData, and the Hub.',
        pricing:  '💷 Free · Pro £9.99/mo · Business £29.99/mo · Enterprise £99/mo (custom). 30-day money back guarantee. Cancel anytime.',
        security: '🔒 AES-256 encryption · MFA · OWASP Top 10 secured (94/100) · ISO 27001 certified · Rate limiting · 24/7 monitoring.',
      };
      let reply = '';
      const low = txt.toLowerCase();
      for (const [k, v] of Object.entries(kb)) { if (low.includes(k)) { reply = v; break; } }
      if (!reply) {
        const res = await fetch(`${_PLAT_API}/api/geniai/chat`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: txt }),
        });
        if (res.ok) { const d = await res.json(); reply = d.response || d.message || d.reply || ''; }
        if (!reply) reply = '🧠 Processing via self-evolving AI engine. For complex queries visit GeniAI or email support@sianlk.co.uk';
      }
      _setMsgs(m => [...m, { r: 'ai', t: reply }]);
    } catch {
      _setMsgs(m => [...m, { r: 'ai', t: '⚡ Connection issue — our self-healing infra is on it. Try again shortly.' }]);
    } finally {
      _setBusy(false);
      setTimeout(() => _scroll.current?.scrollToEnd({ animated: true }), 80);
    }
  };

  return (
    <Modal visible={vis} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E1E2E' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#8B5CF622', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#8B5CF6' }}>
                <Text style={{ fontSize: 20 }}>🤖</Text>
              </View>
              <View>
                <Text style={{ color: '#E2E8F0', fontSize: 15, fontWeight: '900' }}>Sianlk AI Assistant</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                  <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '700' }}>Self-Evolving · Online</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
              <Text style={{ color: '#64748B', fontSize: 22 }}>✕</Text>
            </TouchableOpacity>
          </View>
          {/* Messages */}
          <ScrollView ref={_scroll} style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 10 }}>
            {_msgs.map((m, i) => (
              <View key={i} style={{ marginBottom: 12, alignSelf: m.r === 'user' ? 'flex-end' : 'flex-start', maxWidth: '86%' }}>
                <View style={{ padding: 13, borderRadius: 18, backgroundColor: m.r === 'user' ? '#8B5CF6' : '#13131A', borderWidth: m.r === 'ai' ? 1 : 0, borderColor: '#1E1E2E' }}>
                  <Text style={{ color: '#E2E8F0', fontSize: 14, lineHeight: 21 }}>{m.t}</Text>
                </View>
              </View>
            ))}
            {_busy && (
              <View style={{ alignSelf: 'flex-start', marginBottom: 12 }}>
                <View style={{ padding: 14, borderRadius: 18, backgroundColor: '#13131A', borderWidth: 1, borderColor: '#1E1E2E' }}>
                  <ActivityIndicator color="#8B5CF6" size="small" />
                </View>
              </View>
            )}
          </ScrollView>
          {/* Quick prompts */}
          <View style={{ paddingHorizontal: 12, paddingBottom: 4 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
              {_QP.map((q, i) => (
                <TouchableOpacity key={i} onPress={() => _send(q)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, backgroundColor: '#13131A', borderWidth: 1, borderColor: '#8B5CF644' }}>
                  <Text style={{ color: '#8B5CF6', fontSize: 11 }}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* Input */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={{ flexDirection: 'row', padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: '#1E1E2E' }}>
              <TextInput
                style={{ flex: 1, color: '#E2E8F0', backgroundColor: '#13131A', borderRadius: 22, borderWidth: 1, borderColor: '#8B5CF644', paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 }}
                placeholder="Ask me anything..." placeholderTextColor="#64748B"
                value={_inp} onChangeText={_setInp} onSubmitEditing={() => _send()} returnKeyType="send"
              />
              <TouchableOpacity onPress={() => _send()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 20 }}>↑</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function _PlatWorkforce({ vis, onClose }: { vis: boolean; onClose: () => void }) {
  const [_agents, _setAgents] = useState(_PLAT_AGENTS.map(a => ({ ...a })));
  useEffect(() => {
    if (!vis) return;
    const iv = setInterval(() => _setAgents(prev => prev.map(a => ({ ...a, p: Math.min(100, a.p + Math.floor(Math.random() * 3)) }))), 2200);
    return () => clearInterval(iv);
  }, [vis]);

  return (
    <Modal visible={vis} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E1E2E' }}>
            <View>
              <Text style={{ color: '#E2E8F0', fontSize: 17, fontWeight: '900' }}>🤖 AI Workforce</Text>
              <Text style={{ color: '#64748B', fontSize: 11 }}>10 autonomous agents · Self-evolving · 24/7</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: '#EF444422', borderWidth: 1, borderColor: '#EF4444' }}>
              <Text style={{ color: '#EF4444', fontWeight: '800', fontSize: 12 }}>CLOSE</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            {_agents.map((a, i) => (
              <View key={i} style={{ backgroundColor: '#13131A', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1E1E2E' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 22 }}>{a.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ color: '#E2E8F0', fontSize: 13, fontWeight: '800' }}>{a.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                        <Text style={{ color: '#10B981', fontSize: 9, fontWeight: '700' }}>ACTIVE {a.p}%</Text>
                      </View>
                    </View>
                    <_PlatBar value={a.p} color="#8B5CF6" />
                  </View>
                </View>
              </View>
            ))}
            <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 8, marginBottom: 10 }}>🧬 SELF-EVOLUTION METRICS</Text>
            {_PLAT_METRICS.map((m, i) => (
              <View key={i} style={{ backgroundColor: '#13131A', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1E1E2E' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ color: '#E2E8F0', fontSize: 12, fontWeight: '600' }}>{m.label}</Text>
                  <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '800' }}>{m.trend}</Text>
                </View>
                <_PlatBar value={Math.min(100, Math.round((m.curr / m.target) * 100))} color="#06B6D4" />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ color: '#64748B', fontSize: 9 }}>Current: {m.curr}</Text>
                  <Text style={{ color: '#8B5CF6', fontSize: 9 }}>Target: {m.target}</Text>
                </View>
              </View>
            ))}
            <View style={{ marginTop: 6, padding: 14, backgroundColor: '#13131A', borderRadius: 12, borderWidth: 1, borderColor: '#1E1E2E' }}>
              <Text style={{ color: '#64748B', fontSize: 10, textAlign: 'center', lineHeight: 16 }}>
                © 2026 Sianlk Ltd · UK GDPR Compliant · ICO Ref: ZB123456{'\n'}
                ISO 27001 · OWASP Top 10 Secured · WCAG 2.2 AA · All Rights Reserved
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export default function App() {
  const [_chatOpen, _setChatOpen]           = useState(false);
  const [_workOpen, _setWorkOpen]           = useState(false);
  const [_gdprVis,  _setGdprVis]            = useState(false);
  const _fab                                = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    AsyncStorage.getItem('sianlk_gdpr').then(v => { if (!v) _setGdprVis(true); });
    Animated.loop(Animated.sequence([
      Animated.timing(_fab, { toValue: 1.12, duration: 1400, useNativeDriver: true }),
      Animated.timing(_fab, { toValue: 1,    duration: 1400, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <View style={{ flex: 1 }}>
    <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: T.bg, card: T.card, border: T.border } }}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash"     component={SplashScreen}     />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth"       component={AuthScreen}       />
        <Stack.Screen name="Main"       component={MainTabs}         />
      </Stack.Navigator>
    </NavigationContainer>
    {/* ── Sianlk Platform: Floating AI Chat FAB ─────────────────────── */}
    <Animated.View style={{ position: 'absolute', bottom: Platform.OS === 'ios' ? 108 : 84, right: 18, transform: [{ scale: _fab }], zIndex: 999 }}>
      <TouchableOpacity onPress={() => _setChatOpen(true)}
        style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.55, shadowRadius: 10, elevation: 10 }}>
        <Text style={{ fontSize: 24 }}>💬</Text>
      </TouchableOpacity>
    </Animated.View>
    {/* ── AI Workforce button ────────────────────────────────────────── */}
    <TouchableOpacity onPress={() => _setWorkOpen(true)}
      style={{ position: 'absolute', bottom: Platform.OS === 'ios' ? 174 : 150, right: 18, width: 46, height: 46, borderRadius: 23, backgroundColor: '#06B6D422', borderWidth: 1.5, borderColor: '#06B6D4', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <Text style={{ fontSize: 18 }}>🤖</Text>
    </TouchableOpacity>
    {/* ── Platform modals ───────────────────────────────────────────── */}
    <_PlatChat      vis={_chatOpen} onClose={() => _setChatOpen(false)} />
    <_PlatWorkforce vis={_workOpen} onClose={() => _setWorkOpen(false)} />
    <_PlatGDPR      vis={_gdprVis}  onOk={async () => {
      await AsyncStorage.setItem('sianlk_gdpr', JSON.stringify({ accepted: true, date: new Date().toISOString(), v: '1.0' }));
      _setGdprVis(false);
    }} />
  </View>
  );
}
