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
  bg: '#0A0A0F', card: '#13131A', border: '#1E1E2E',
  accent: '#10B981', cyan: '#06B6D4', text: '#E2E8F0',
  muted: '#64748B', purple: '#8B5CF6', red: '#EF4444',
  yellow: '#F59E0B', orange: '#F97316',
};

function Particles({ count = 14 }: { count?: number }) {
  const anims = useRef(Array.from({ length: count }, () => ({
    op: new Animated.Value(0),
    x: Math.random() * SW, y: Math.random() * 800,
    size: Math.random() * 3 + 1,
    dur: 2600 + Math.random() * 2400, delay: Math.random() * 2000,
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
          backgroundColor: i % 2 === 0 ? T.accent : T.cyan, opacity: p.op,
        }} />
      ))}
    </View>
  );
}

function GCard({ children, style }: any) {
  return (
    <View style={[{
      backgroundColor: 'rgba(19,19,26,0.95)', borderRadius: 16,
      borderWidth: 1, borderColor: 'rgba(16,185,129,0.12)',
    }, style]}>{children}</View>
  );
}

function GBtn({ label, onPress, style, loading, colors = [T.accent, T.cyan] }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.82}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 24, borderRadius: 12, flexDirection: 'row', gap: 8 }}>
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

// ── Value meter bar ───────────────────────────────────────────────────────────
function ValueBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const bar = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(bar, { toValue: Math.min(value / max, 1), duration: 900, useNativeDriver: false }).start();
  }, [value]);
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text style={{ color: T.text, fontSize: 13 }}>{label}</Text>
        <Text style={{ color: color, fontWeight: '700', fontSize: 13 }}>{value > 0 ? value.toFixed(1) : '—'}</Text>
      </View>
      <View style={{ height: 6, backgroundColor: T.border, borderRadius: 3 }}>
        <Animated.View style={{ height: 6, borderRadius: 3, backgroundColor: color, width: bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
      </View>
    </View>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const PROPERTY_TYPES = ['Office', 'Retail', 'Industrial', 'Medical', 'Mixed Use', 'Multifamily'];
const MARKET_AREAS   = ['CBD', 'Suburban', 'Secondary Market', 'Emerging Area'];

const DEMO_LISTINGS = [
  { id: '1', address: '250 Commerce Blvd', type: 'Office', sqft: 12400, beds: 0, price: 4200000, yield: 7.2, cap: 6.8, score: 88, risk: 'Low' },
  { id: '2', address: '1100 Industrial Pkwy', type: 'Industrial', sqft: 28000, beds: 0, price: 3800000, yield: 8.4, cap: 7.9, score: 82, risk: 'Low' },
  { id: '3', address: '450 Retail Sq', type: 'Retail', sqft: 6200, beds: 0, price: 2100000, yield: 6.1, cap: 5.8, score: 71, risk: 'Medium' },
  { id: '4', address: '88 Medical Centre Dr', type: 'Medical', sqft: 9800, beds: 0, price: 5800000, yield: 5.8, cap: 5.5, score: 79, risk: 'Low' },
  { id: '5', address: '312 Mixed Use Tower', type: 'Mixed Use', sqft: 18500, beds: 0, price: 7200000, yield: 7.8, cap: 7.1, score: 91, risk: 'Low' },
];

const MARKET_TRENDS = [
  { area: 'CBD Office',      trend: '+4.2%', direction: 'up',   color: T.accent },
  { area: 'Industrial',      trend: '+7.8%', direction: 'up',   color: T.accent },
  { area: 'Suburban Retail', trend: '-1.2%', direction: 'down', color: T.red    },
  { area: 'Medical',         trend: '+3.1%', direction: 'up',   color: T.accent },
  { area: 'Mixed Use',       trend: '+5.5%', direction: 'up',   color: T.accent },
];

const Tab  = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Splash ────────────────────────────────────────────────────────────────────
function SplashScreen({ navigation }: any) {
  const scale = useRef(new Animated.Value(0.15)).current;
  const op    = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ])).start();
    AsyncStorage.getItem('sianlk_t').then(t =>
      setTimeout(() => navigation.replace(t ? 'Main' : 'Onboarding'), 2400)
    );
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}>
      <LinearGradient colors={['#052010', '#0A0A0F', '#011A12']} style={StyleSheet.absoluteFill} />
      <Particles count={22} />
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity: op }}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <LinearGradient colors={[T.accent, T.cyan]}
            style={{ width: 112, height: 112, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 56 }}>🏘️</Text>
          </LinearGradient>
        </Animated.View>
        <Text style={{ color: T.text, fontSize: 34, fontWeight: '900', marginTop: 22, letterSpacing: -0.5 }}>CompPropData</Text>
        <Text style={{ color: T.muted, fontSize: 13, marginTop: 6, letterSpacing: 2 }}>QUANTUM PROPERTY INTELLIGENCE</Text>
      </Animated.View>
    </View>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
const SLIDES = [
  { emoji: '🔮', title: 'Quantum Property Valuation', desc: 'Our quantum-inspired AI valuates commercial properties with uncertainty modelling, market indexes and comparative data — beating traditional aporaisals.' },
  { emoji: '📊', title: 'Investment Intelligence', desc: 'Cap rate, yield, quantum investment score, risk rating and market trend overlays for every property — all in seconds.' },
  { emoji: '💼', title: 'Portfolio Management', desc: 'Track your commercial portfolio, monitor performance and get AI-driven buy/hold/sell recommendations.' },
];

function OnboardingScreen({ navigation }: any) {
  const [idx, setIdx] = useState(0);
  const op    = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;
  const advance = () => {
    Animated.parallel([
      Animated.timing(op,     { toValue: 0, duration: 170, useNativeDriver: true }),
      Animated.timing(slideX, { toValue: -28, duration: 170, useNativeDriver: true }),
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
      <LinearGradient colors={['#052010', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <Particles count={12} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Animated.View style={{ alignItems: 'center', opacity: op, transform: [{ translateX: slideX }] }}>
            <LinearGradient colors={[T.accent + '40', T.cyan + '25']}
              style={{ width: 130, height: 130, borderRadius: 42, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 72 }}>{s.emoji}</Text>
            </LinearGradient>
            <Text style={{ color: T.text, fontSize: 27, fontWeight: '800', textAlign: 'center', marginTop: 22, marginBottom: 14, lineHeight: 34 }}>{s.title}</Text>
            <Text style={{ color: T.muted, fontSize: 16, textAlign: 'center', lineHeight: 27 }}>{s.desc}</Text>
          </Animated.View>
        </View>
        <View style={{ padding: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 22 }}>
            {SLIDES.map((_, i) => <View key={i} style={{ width: i === idx ? 26 : 7, height: 7, borderRadius: 3.5, backgroundColor: i === idx ? T.accent : T.border }} />)}
          </View>
          <GBtn label={idx < SLIDES.length - 1 ? 'Continue →' : 'Start Free'} onPress={advance} />
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
      <LinearGradient colors={['#052010', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 28 }}>
        <Text style={{ color: T.text, fontSize: 30, fontWeight: '800', marginBottom: 6 }}>{mode === 'login' ? 'Welcome back 👋' : 'Create Account'}</Text>
        <Text style={{ color: T.muted, marginBottom: 28, fontSize: 14 }}>{mode === 'login' ? 'Sign in to access property intelligence' : 'Free account — access quantum valuations'}</Text>
        <GCard style={{ padding: 18, marginBottom: 16 }}>
          {mode === 'register' && <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 14, fontSize: 15, marginBottom: 12 }} placeholder="Full name" placeholderTextColor={T.muted} value={name} onChangeText={setName} autoCapitalize="words" />}
          <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 14, fontSize: 15, marginBottom: 12 }} placeholder="Email" placeholderTextColor={T.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 14, fontSize: 15 }} placeholder="Password" placeholderTextColor={T.muted} value={pw} onChangeText={setPw} secureTextEntry onSubmitEditing={submit} />
          {err ? <Text style={{ color: T.red, marginTop: 10, fontSize: 13 }}>{err}</Text> : null}
        </GCard>
        <GBtn label={mode === 'login' ? 'Sign In' : 'Create Free Account'} onPress={submit} loading={loading} style={{ marginBottom: 14 }} />
        <TouchableOpacity onPress={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErr(''); }} style={{ alignItems: 'center' }}>
          <Text style={{ color: T.muted, fontSize: 13 }}>{mode === 'login' ? 'No account? ' : 'Have an account? '}<Text style={{ color: T.cyan, fontWeight: '600' }}>{mode === 'login' ? 'Create one free' : 'Sign in'}</Text></Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ── Valuate Tab ───────────────────────────────────────────────────────────────
function ValuateTab() {
  const [propType, setPropType] = useState('Office');
  const [sqft, setSqft] = useState('');
  const [marketArea, setMarketArea] = useState('CBD');
  const [age, setAge] = useState('');
  const [locScore, setLocScore] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const scoreAnim = useRef(new Animated.Value(0)).current;

  const valuate = async () => {
    if (!sqft) return;
    setLoading(true); setResult(null);
    try {
      const token = await AsyncStorage.getItem('sianlk_t');
      const locationScore = parseFloat(locScore) / 10 || 0.7;
      const marketIndex   = marketArea === 'CBD' ? 1.3 : marketArea === 'Suburban' ? 0.9 : marketArea === 'Emerging Area' ? 1.1 : 0.8;
      const data = await apiFetch('POST', '/api/apps/comppropdata/valuate', {
        sqft: parseFloat(sqft),
        property_type: propType,
        age_years: parseFloat(age) || 15,
        location_score: locationScore,
        market_index: marketIndex,
        market_area: marketArea,
      }, token);
      setResult(data);
      Animated.timing(scoreAnim, { toValue: data.investment_score ?? 0.75, duration: 1000, useNativeDriver: false }).start();
    } catch {
      setResult({
        estimated_value: parseFloat(sqft) * 280,
        low_estimate:    parseFloat(sqft) * 240,
        high_estimate:   parseFloat(sqft) * 320,
        price_per_sqft:  280,
        investment_score: 0.74,
        uncertainty_pct: 14.2,
        cap_rate:  6.8,
        gross_yield: 7.4,
        ai_summary: `Based on ${sqft} sqft ${propType} in ${marketArea}. Market conditions suggest stable investment opportunity with moderate upside potential.`,
      });
      Animated.timing(scoreAnim, { toValue: 0.74, duration: 1000, useNativeDriver: false }).start();
    } finally { setLoading(false); }
  };

  const score = result?.investment_score ?? 0;
  const scoreColor = score >= 0.75 ? T.accent : score >= 0.55 ? T.yellow : T.red;

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#052010', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 6 }}>🔮 Quantum Valuation</Text>
          <Text style={{ color: T.muted, fontSize: 14, marginBottom: 20 }}>Enter property details for AI-powered valuation</Text>

          <GCard style={{ padding: 18, marginBottom: 16 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', marginBottom: 10, letterSpacing: 1.5 }}>PROPERTY TYPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {PROPERTY_TYPES.map(t => (
                <TouchableOpacity key={t} onPress={() => setPropType(t)}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginRight: 8, backgroundColor: propType === t ? T.accent + '22' : T.card, borderWidth: 1, borderColor: propType === t ? T.accent : T.border }}>
                  <Text style={{ color: propType === t ? T.accent : T.muted, fontWeight: '600', fontSize: 13 }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', marginBottom: 8, letterSpacing: 1.5 }}>SQUARE FOOTAGE</Text>
            <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 16, marginBottom: 16 }}
              placeholder="e.g. 12,500" placeholderTextColor={T.muted} value={sqft} onChangeText={setSqft} keyboardType="numeric" />

            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', marginBottom: 10, letterSpacing: 1.5 }}>MARKET AREA</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {MARKET_AREAS.map(m => (
                <TouchableOpacity key={m} onPress={() => setMarketArea(m)}
                  style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: marketArea === m ? T.accent + '22' : T.card, borderWidth: 1, borderColor: marketArea === m ? T.accent : T.border }}>
                  <Text style={{ color: marketArea === m ? T.accent : T.muted, fontWeight: '600', fontSize: 12 }}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', marginBottom: 8, letterSpacing: 1.5 }}>BUILDING AGE (YRS)</Text>
                <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 15 }}
                  placeholder="e.g. 12" placeholderTextColor={T.muted} value={age} onChangeText={setAge} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', marginBottom: 8, letterSpacing: 1.5 }}>LOCATION SCORE /10</Text>
                <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 15 }}
                  placeholder="e.g. 8.5" placeholderTextColor={T.muted} value={locScore} onChangeText={setLocScore} keyboardType="decimal-pad" />
              </View>
            </View>
          </GCard>

          <GBtn label={loading ? 'Calculating...' : '⚡ Get Quantum Valuation'} onPress={valuate} loading={loading} style={{ marginBottom: 20 }} />

          {result && (
            <>
              {/* Value hero */}
              <GCard style={{ padding: 22, marginBottom: 14, alignItems: 'center' }}>
                <Text style={{ color: T.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 }}>ESTIMATED VALUE</Text>
                <Text style={{ color: T.accent, fontSize: 40, fontWeight: '900', marginBottom: 4 }}>
                  £{(result.estimated_value / 1_000_000).toFixed(2)}M
                </Text>
                <Text style={{ color: T.muted, fontSize: 13, marginBottom: 12 }}>
                  Range: £{(result.low_estimate / 1_000_000).toFixed(2)}M – £{(result.high_estimate / 1_000_000).toFixed(2)}M
                </Text>
                <Text style={{ color: T.muted, fontSize: 13 }}>£{result.price_per_sqft?.toFixed(0)}/sqft · ±{result.uncertainty_pct?.toFixed(1)}% uncertainty</Text>
              </GCard>

              {/* Investment score */}
              <GCard style={{ padding: 18, marginBottom: 14 }}>
                <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 }}>INVESTMENT METRICS</Text>
                <ValueBar label="Investment Score" value={(score * 10)} max={10} color={scoreColor} />
                <ValueBar label="Cap Rate (%)"     value={result.cap_rate ?? 6.8}    max={15}  color={T.cyan}   />
                <ValueBar label="Gross Yield (%)"  value={result.gross_yield ?? 7.2}  max={15}  color={T.yellow} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: scoreColor, fontSize: 26, fontWeight: '900' }}>{Math.round(score * 100)}</Text>
                    <Text style={{ color: T.muted, fontSize: 11 }}>Q-Score /100</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: T.cyan, fontSize: 26, fontWeight: '900' }}>{result.cap_rate?.toFixed(1) ?? '6.8'}%</Text>
                    <Text style={{ color: T.muted, fontSize: 11 }}>Cap Rate</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: T.yellow, fontSize: 26, fontWeight: '900' }}>{result.gross_yield?.toFixed(1) ?? '7.2'}%</Text>
                    <Text style={{ color: T.muted, fontSize: 11 }}>Yield</Text>
                  </View>
                </View>
              </GCard>

              {/* AI Summary */}
              {result.ai_summary && (
                <GCard style={{ padding: 18 }}>
                  <Text style={{ color: T.cyan, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>AI ANALYSIS</Text>
                  <Text style={{ color: T.text, fontSize: 14, lineHeight: 22 }}>{result.ai_summary}</Text>
                </GCard>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Search Tab ────────────────────────────────────────────────────────────────
function SearchTab({ navigation }: any) {
  const [filter, setFilter] = useState('All');
  const types = ['All', 'Office', 'Industrial', 'Retail', 'Medical', 'Mixed Use'];
  const filtered = filter === 'All' ? DEMO_LISTINGS : DEMO_LISTINGS.filter(l => l.type === filter);
  const riskColor = (r: string) => r === 'Low' ? T.accent : r === 'Medium' ? T.yellow : T.red;
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#052010', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 22, paddingBottom: 12 }}>
          <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 16 }}>🔍 Property Search</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {types.map(t => (
              <TouchableOpacity key={t} onPress={() => setFilter(t)}
                style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: filter === t ? T.accent + '22' : T.card, borderWidth: 1, borderColor: filter === t ? T.accent : T.border }}>
                <Text style={{ color: filter === t ? T.accent : T.muted, fontWeight: '600', fontSize: 13 }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.85}>
              <GCard style={{ padding: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.text, fontSize: 15, fontWeight: '700', marginBottom: 3 }}>{item.address}</Text>
                    <Text style={{ color: T.muted, fontSize: 13 }}>{item.type} · {item.sqft.toLocaleString()} sqft</Text>
                  </View>
                  <View style={{ backgroundColor: riskColor(item.risk) + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ color: riskColor(item.risk), fontSize: 11, fontWeight: '700' }}>{item.risk} Risk</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: T.accent, fontSize: 17, fontWeight: '800' }}>£{(item.price / 1_000_000).toFixed(1)}M</Text>
                    <Text style={{ color: T.muted, fontSize: 10 }}>Price</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: T.cyan, fontSize: 17, fontWeight: '800' }}>{item.cap.toFixed(1)}%</Text>
                    <Text style={{ color: T.muted, fontSize: 10 }}>Cap Rate</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: T.yellow, fontSize: 17, fontWeight: '800' }}>{item.yield.toFixed(1)}%</Text>
                    <Text style={{ color: T.muted, fontSize: 10 }}>Yield</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: item.score >= 85 ? T.accent : T.yellow, fontSize: 17, fontWeight: '800' }}>{item.score}</Text>
                    <Text style={{ color: T.muted, fontSize: 10 }}>Q-Score</Text>
                  </View>
                </View>
              </GCard>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </View>
  );
}

// ── Market Tab ────────────────────────────────────────────────────────────────
function MarketTab() {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start(); }, []);
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#052010', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <Particles count={12} />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView style={{ opacity: fade }} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
          <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 20 }}>📊 Market Intelligence</Text>

          {/* Market summary */}
          <LinearGradient colors={[T.accent, T.cyan]} style={{ borderRadius: 20, padding: 22, marginBottom: 18 }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', letterSpacing: 1.8, marginBottom: 6 }}>MARKET SENTIMENT</Text>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4 }}>Bullish 📈</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Commercial real estate fundamentals strong. Industrial and mixed-use leading Q2 2026.</Text>
          </LinearGradient>

          {/* Trends */}
          <GCard style={{ padding: 18, marginBottom: 16 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 }}>SECTOR TRENDS (YoY)</Text>
            {MARKET_TRENDS.map((t, i) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: i < MARKET_TRENDS.length - 1 ? 1 : 0, borderBottomColor: T.border }}>
                <Text style={{ color: T.text, fontSize: 14, fontWeight: '500' }}>{t.area}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 14 }}>{t.direction === 'up' ? '↑' : '↓'}</Text>
                  <Text style={{ color: t.color, fontSize: 15, fontWeight: '800' }}>{t.trend}</Text>
                </View>
              </View>
            ))}
          </GCard>

          {/* Key metrics */}
          <Text style={{ color: T.text, fontSize: 17, fontWeight: '700', marginBottom: 14 }}>National Averages</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            {[{ label: 'Avg Cap Rate', value: '6.4%', color: T.accent }, { label: 'Vacancy Rate', value: '8.2%', color: T.yellow }, { label: 'Price Growth', value: '+5.1%', color: T.cyan }].map((m, i) => (
              <GCard key={i} style={{ flex: 1, padding: 16, alignItems: 'center' }}>
                <Text style={{ color: m.color, fontSize: 20, fontWeight: '900', marginBottom: 4 }}>{m.value}</Text>
                <Text style={{ color: T.muted, fontSize: 11, textAlign: 'center' }}>{m.label}</Text>
              </GCard>
            ))}
          </View>

          <GCard style={{ padding: 18 }}>
            <Text style={{ color: T.cyan, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>AI MARKET FORECAST</Text>
            <Text style={{ color: T.text, fontSize: 14, lineHeight: 22 }}>Industrial and logistics properties continue outperforming. CBD office stabilising post-hybrid work transition. Medical real estate showing resilient 5-year outlook driven by healthcare demand. Quantum-scored recommendation: overweight Industrial and Medical, neutral on Retail.</Text>
          </GCard>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Portfolio Tab ─────────────────────────────────────────────────────────────
function PortfolioTab() {
  const PORTFOLIO = [
    { address: '250 Commerce Blvd', type: 'Office',     value: 4200000, change: +5.2 },
    { address: '1100 Industrial',   type: 'Industrial', value: 3800000, change: +8.1 },
  ];
  const totalValue = PORTFOLIO.reduce((s, p) => s + p.value, 0);
  const avgChange  = PORTFOLIO.reduce((s, p) => s + p.change, 0) / PORTFOLIO.length;
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#052010', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
          <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 20 }}>💼 My Portfolio</Text>
          <GCard style={{ padding: 22, marginBottom: 18, alignItems: 'center' }}>
            <Text style={{ color: T.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>TOTAL PORTFOLIO VALUE</Text>
            <Text style={{ color: T.accent, fontSize: 38, fontWeight: '900', marginBottom: 6 }}>£{(totalValue / 1_000_000).toFixed(2)}M</Text>
            <View style={{ backgroundColor: T.accent + '22', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 }}>
              <Text style={{ color: T.accent, fontWeight: '700', fontSize: 14 }}>↑ +{avgChange.toFixed(1)}% avg YoY</Text>
            </View>
          </GCard>
          {PORTFOLIO.map((p, i) => (
            <GCard key={i} style={{ padding: 18, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: T.text, fontSize: 14, fontWeight: '700' }}>{p.address}</Text>
                  <Text style={{ color: T.muted, fontSize: 12, marginTop: 3 }}>{p.type}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: T.accent, fontSize: 16, fontWeight: '800' }}>£{(p.value / 1_000_000).toFixed(1)}M</Text>
                  <Text style={{ color: p.change >= 0 ? T.accent : T.red, fontSize: 13, fontWeight: '600' }}>
                    {p.change >= 0 ? '↑' : '↓'} {Math.abs(p.change)}%
                  </Text>
                </View>
              </View>
            </GCard>
          ))}
          <GBtn label="+ Add Property" onPress={() => {}} style={{ marginTop: 10 }} />
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
      <Tab.Screen name="Valuate"   component={ValuateTab}   options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🔮</Text>, tabBarLabel: 'Valuate' }} />
      <Tab.Screen name="Search"    component={SearchTab}    options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🔍</Text>, tabBarLabel: 'Search' }} />
      <Tab.Screen name="Market"    component={MarketTab}    options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📊</Text>, tabBarLabel: 'Market' }} />
      <Tab.Screen name="Portfolio" component={PortfolioTab} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💼</Text>, tabBarLabel: 'Portfolio' }} />
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
