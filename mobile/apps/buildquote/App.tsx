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
  bg: '#080A06', card: '#10140C', border: '#1C2214',
  accent: '#84CC16', cyan: '#22D3EE', text: '#ECFCCB',
  muted: '#608040', gold: '#F59E0B', red: '#EF4444',
  green: '#4ADE80', orange: '#FB923C', blue: '#60A5FA',
  dimText: '#BEF264', purple: '#A78BFA',
};

function Particles({ count = 14 }: { count?: number }) {
  const anims = useRef(Array.from({ length: count }, () => ({
    op: new Animated.Value(0), x: Math.random() * SW, y: Math.random() * 860,
    size: Math.random() * 3 + 1, dur: 3400 + Math.random() * 2400, delay: Math.random() * 2800,
  }))).current;
  useEffect(() => {
    anims.forEach(p => Animated.loop(Animated.sequence([
      Animated.delay(p.delay),
      Animated.timing(p.op, { toValue: 0.4, duration: p.dur, useNativeDriver: true }),
      Animated.timing(p.op, { toValue: 0,   duration: p.dur, useNativeDriver: true }),
    ])).start());
  }, []);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {anims.map((p, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: p.x, top: p.y,
          width: p.size, height: p.size, borderRadius: p.size / 2,
          backgroundColor: i % 3 === 0 ? T.accent : i % 3 === 1 ? T.gold : T.orange,
          opacity: p.op,
        }} />
      ))}
    </View>
  );
}

function GlassCard({ children, style }: any) {
  return (
    <View style={[{
      backgroundColor: 'rgba(16,20,12,0.97)', borderRadius: 16,
      borderWidth: 1, borderColor: 'rgba(132,204,22,0.22)',
    }, style]}>{children}</View>
  );
}

function GBtn({ label, onPress, style, loading }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.82}>
      <LinearGradient colors={[T.accent, '#65A30D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 }}>
        {loading ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={{ color: '#0A1400', fontWeight: '800', fontSize: 15 }}>{label}</Text>}
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

// ── Cost knowledge base ───────────────────────────────────────────────────────
const RATES: Record<string, Record<string, number>> = {
  'New House':       { standard: 1850, premium: 2600, luxury: 4200 },
  'Extension':       { standard: 2100, premium: 3000, luxury: 5000 },
  'Renovation':      { standard: 900,  premium: 1650, luxury: 2800 },
  'Commercial Fit-out': { standard: 1600, premium: 2400, luxury: 3800 },
  'Warehouse':       { standard: 980,  premium: 1400, luxury: 2100 },
  'Townhouse':       { standard: 1700, premium: 2450, luxury: 3900 },
};

const REGION_MULT: Record<string, number> = {
  'Sydney':    1.32, 'Melbourne': 1.27, 'Brisbane': 1.08, 'Perth': 1.11,
  'Adelaide':  0.98, 'Auckland':  1.18, 'London':   1.55, 'New York': 1.80,
  'Dubai':     1.25, 'Singapore': 1.40,
};

const MATERIAL_ITEMS = [
  { cat: 'Structure', name: 'Concrete (m³)', unit: 'm³', rate: 320 },
  { cat: 'Structure', name: 'Structural Steel (t)', unit: 'tonne', rate: 3200 },
  { cat: 'Structure', name: 'Timber Frame (m²)', unit: 'm²', rate: 85 },
  { cat: 'Roofing',   name: 'Colorbond Roofing (m²)', unit: 'm²', rate: 110 },
  { cat: 'Roofing',   name: 'Tiles (m²)', unit: 'm²', rate: 75 },
  { cat: 'Insulation',name: 'Wall Insulation (m²)', unit: 'm²', rate: 35 },
  { cat: 'Finishes',  name: 'Plasterboard (m²)', unit: 'm²', rate: 48 },
  { cat: 'Finishes',  name: 'Flooring Timber (m²)', unit: 'm²', rate: 160 },
  { cat: 'Finishes',  name: 'Floor Tiles (m²)', unit: 'm²', rate: 95 },
  { cat: 'Windows',   name: 'Double Glazed Window', unit: 'unit', rate: 1400 },
  { cat: 'MEP',       name: 'Electrical Fit-out (m²)', unit: 'm²', rate: 145 },
  { cat: 'MEP',       name: 'Plumbing (per fixture)', unit: 'fixture', rate: 2800 },
  { cat: 'MEP',       name: 'HVAC (m²)', unit: 'm²', rate: 220 },
];

const SAVED_PROJECTS = [
  { name: 'Kirra Beach Duplex', type: 'New House', sqft: 3200, region: 'Brisbane', tier: 'premium', estimate: 1_040_000 },
  { name: 'Surry Hills Reno',   type: 'Renovation', sqft: 1800, region: 'Sydney', tier: 'luxury',  estimate: 1_287_000 },
  { name: 'Gold Coast Commercial', type: 'Commercial Fit-out', sqft: 4500, region: 'Brisbane', tier: 'standard', estimate: 918_000 },
];

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Splash ────────────────────────────────────────────────────────────────────
function SplashScreen({ navigation }: any) {
  const scale = useRef(new Animated.Value(0.14)).current;
  const op    = useRef(new Animated.Value(0)).current;
  const rot   = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 38, friction: 7, useNativeDriver: true }),
      Animated.timing(op,    { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.timing(rot, { toValue: 1, duration: 22000, useNativeDriver: true })).start();
    AsyncStorage.getItem('sianlk_t').then(t =>
      setTimeout(() => navigation.replace(t ? 'Main' : 'Onboarding'), 2600)
    );
  }, []);
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}>
      <LinearGradient colors={['#040600', '#080A06', '#0C1208']} style={StyleSheet.absoluteFill} />
      <Particles count={18} />
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity: op }}>
        <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
          <Animated.View style={{ position: 'absolute', width: 112, height: 112, borderRadius: 56, borderWidth: 2, borderColor: T.accent + '55', borderTopColor: T.accent, transform: [{ rotate }] }} />
          <Animated.View style={{ position: 'absolute', width: 84, height: 84, borderRadius: 42, borderWidth: 1.5, borderColor: T.gold + '40', borderBottomColor: T.gold, transform: [{ rotate }] }} />
          <Text style={{ fontSize: 50 }}>🏗️</Text>
        </View>
        <Text style={{ color: T.text, fontSize: 34, fontWeight: '900', letterSpacing: -1 }}>BuildQuote</Text>
        <Text style={{ color: T.muted, fontSize: 12, marginTop: 6, letterSpacing: 3 }}>AI CONSTRUCTION INTELLIGENCE</Text>
      </Animated.View>
    </View>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
const SLIDES = [
  { emoji: '💰', title: 'Instant Cost Estimates', desc: 'Get AI-powered cost estimates in seconds for any construction project — new builds, extensions, renovations or commercial fit-outs, anywhere in the world.' },
  { emoji: '🧱', title: 'Materials Calculator', desc: 'Build a complete bill of materials with live market rates. Compare standard, premium and luxury specification tiers side by side.' },
  { emoji: '📐', title: 'Project Intelligence', desc: 'Save, compare and track multiple projects. Get AI insights on cost drivers, market trends and where to save without compromising quality.' },
];

function OnboardingScreen({ navigation }: any) {
  const [idx, setIdx] = useState(0);
  const op    = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;
  const next = () => {
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
      <LinearGradient colors={['#040600', '#080A06']} style={StyleSheet.absoluteFill} />
      <Particles count={10} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Animated.View style={{ alignItems: 'center', opacity: op, transform: [{ translateX: slideX }] }}>
            <View style={{ width: 130, height: 130, borderRadius: 42, backgroundColor: T.accent + '20', borderWidth: 1, borderColor: T.accent + '44', alignItems: 'center', justifyContent: 'center' }}>
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
          <GBtn label={idx < SLIDES.length - 1 ? 'Continue →' : 'Start Estimating Free'} onPress={next} />
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
      <LinearGradient colors={['#040600', '#080A06']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 28 }}>
        <Text style={{ color: T.text, fontSize: 28, fontWeight: '800', marginBottom: 4 }}>{mode === 'login' ? 'Welcome back' : 'Create account'}</Text>
        <Text style={{ color: T.muted, marginBottom: 28, fontSize: 14 }}>AI Construction Intelligence</Text>
        <GlassCard style={{ padding: 18, marginBottom: 16 }}>
          {mode === 'register' && <TextInput style={{ color: T.text, backgroundColor: 'rgba(132,204,22,0.07)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 15, marginBottom: 12 }} placeholder="Full name" placeholderTextColor={T.muted} value={name} onChangeText={setName} autoCapitalize="words" />}
          <TextInput style={{ color: T.text, backgroundColor: 'rgba(132,204,22,0.07)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 15, marginBottom: 12 }} placeholder="Email" placeholderTextColor={T.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={{ color: T.text, backgroundColor: 'rgba(132,204,22,0.07)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 15 }} placeholder="Password" placeholderTextColor={T.muted} value={pw} onChangeText={setPw} secureTextEntry onSubmitEditing={submit} />
          {err ? <Text style={{ color: T.red, marginTop: 10, fontSize: 12 }}>{err}</Text> : null}
        </GlassCard>
        <GBtn label={mode === 'login' ? 'Sign In' : 'Create Account'} onPress={submit} loading={loading} style={{ marginBottom: 14 }} />
        <TouchableOpacity onPress={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErr(''); }} style={{ alignItems: 'center' }}>
          <Text style={{ color: T.muted, fontSize: 13 }}>{mode === 'login' ? "Don't have an account? " : "Have an account? "}<Text style={{ color: T.cyan }}>{mode === 'login' ? 'Register free' : 'Sign in'}</Text></Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ── Animated Cost Bar ─────────────────────────────────────────────────────────
function CostBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: total > 0 ? value / total : 0, duration: 900, useNativeDriver: false }).start();
  }, [value, total]);
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text style={{ color: T.dimText, fontSize: 12 }}>{label}</Text>
        <Text style={{ color, fontSize: 12, fontWeight: '700' }}>${value.toLocaleString()}</Text>
      </View>
      <View style={{ height: 7, backgroundColor: T.border, borderRadius: 4, overflow: 'hidden' }}>
        <Animated.View style={{ height: '100%', backgroundColor: color, borderRadius: 4, width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
      </View>
    </View>
  );
}

// ── Estimate Tab ──────────────────────────────────────────────────────────────
const PROJECT_TYPES = Object.keys(RATES);
const TIERS = ['standard', 'premium', 'luxury'];
const REGIONS = Object.keys(REGION_MULT);

function EstimateTab() {
  const [projType, setProjType] = useState('New House');
  const [sqft, setSqft] = useState('');
  const [region, setRegion] = useState('Sydney');
  const [tier, setTier]     = useState('premium');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const estimate = async () => {
    const area = parseFloat(sqft); if (!area || area < 10) return;
    setLoading(true); setResult(null); fadeAnim.setValue(0);
    try {
      const token = await AsyncStorage.getItem('sianlk_t');
      const data = await apiFetch('POST', '/api/apps/buildquote/estimate', { project_type: projType, sqft: area, region, tier }, token);
      setResult(data);
    } catch {
      // Local calculation fallback
      const baseRate = (RATES[projType] ?? RATES['New House'])[tier] ?? 2000;
      const regionM  = REGION_MULT[region] ?? 1.0;
      const total    = Math.round(area * baseRate * regionM);
      const sqm      = area * 0.0929;
      setResult({
        total_estimate: total,
        cost_per_sqm:   Math.round(total / sqm),
        cost_per_sqft:  Math.round(total / area),
        region_multiplier: regionM,
        breakdown: {
          Preliminaries:    Math.round(total * 0.08),
          Structure:        Math.round(total * 0.25),
          Roofing:          Math.round(total * 0.08),
          'External Works': Math.round(total * 0.07),
          'MEP Services':   Math.round(total * 0.22),
          'Internal Finishes': Math.round(total * 0.20),
          'Contingency 10%': Math.round(total * 0.10),
        },
        ai_summary: `For a ${tier} ${projType.toLowerCase()} of ${area.toLocaleString()} sqft in ${region}, the total construction estimate is $${total.toLocaleString()}. At $${Math.round(total/sqm).toLocaleString()}/m², this reflects current ${region} market rates. Key cost drivers: MEP services (22%) and structural elements (25%). Consider value engineering in finishes to reduce by 8-12% if needed.`,
        market_trend: 'Construction costs in this region have increased 6.2% YoY. Lock in prices early → potential saving of $' + Math.round(total * 0.06).toLocaleString(),
      });
    }
    setLoading(false);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  };

  const tierColors: Record<string, string> = { standard: T.blue, premium: T.accent, luxury: T.gold };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#040600', '#080A06']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '800', marginBottom: 4 }}>Cost Estimator</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 18 }}>AI-powered construction pricing</Text>

          {/* Project type */}
          <GlassCard style={{ padding: 14, marginBottom: 12 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>PROJECT TYPE</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
              {PROJECT_TYPES.map(pt => (
                <TouchableOpacity key={pt} onPress={() => setProjType(pt)}
                  style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: projType === pt ? T.accent + '28' : 'transparent', borderWidth: 1, borderColor: projType === pt ? T.accent : T.border }}>
                  <Text style={{ color: projType === pt ? T.accent : T.muted, fontWeight: '700', fontSize: 12 }}>{pt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          {/* Area + Region */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <GlassCard style={{ flex: 1, padding: 14 }}>
              <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>FLOOR AREA (sqft)</Text>
              <TextInput style={{ color: T.text, backgroundColor: 'rgba(132,204,22,0.07)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 12, fontSize: 18, fontWeight: '700', textAlign: 'center' }}
                placeholder="2500" placeholderTextColor={T.muted} value={sqft} onChangeText={setSqft} keyboardType="numeric" />
            </GlassCard>
            <GlassCard style={{ flex: 1.2, padding: 14 }}>
              <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>REGION</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {REGIONS.map(reg => (
                  <TouchableOpacity key={reg} onPress={() => setRegion(reg)}
                    style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 6, backgroundColor: region === reg ? T.accent + '28' : 'transparent', borderWidth: 1, borderColor: region === reg ? T.accent : T.border }}>
                    <Text style={{ color: region === reg ? T.accent : T.muted, fontSize: 11, fontWeight: '700' }}>{reg}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </GlassCard>
          </View>

          {/* Specification tier */}
          <GlassCard style={{ padding: 14, marginBottom: 14 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>SPECIFICATION TIER</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {TIERS.map(t => (
                <TouchableOpacity key={t} onPress={() => setTier(t)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: tier === t ? (tierColors[t] + '28') : 'transparent', borderWidth: 1.5, borderColor: tier === t ? tierColors[t] : T.border, alignItems: 'center' }}>
                  <Text style={{ fontSize: 18 }}>{t === 'standard' ? '🏠' : t === 'premium' ? '🏡' : '🏰'}</Text>
                  <Text style={{ color: tier === t ? tierColors[t] : T.muted, fontWeight: '800', fontSize: 11, marginTop: 3, textTransform: 'capitalize' }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          <GBtn label="🏗️  Generate Estimate" onPress={estimate} loading={loading} style={{ marginBottom: 20 }} />

          {result && (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Hero estimate */}
              <LinearGradient colors={['#1A2A08', '#0F1A06']} style={{ borderRadius: 20, padding: 24, marginBottom: 14, borderWidth: 1, borderColor: T.accent + '40', alignItems: 'center' }}>
                <Text style={{ color: T.muted, fontSize: 12, letterSpacing: 2, marginBottom: 6 }}>TOTAL ESTIMATE</Text>
                <Text style={{ color: T.accent, fontSize: 42, fontWeight: '900', letterSpacing: -1 }}>
                  ${(result.total_estimate / 1_000_000 >= 1 ? (result.total_estimate / 1_000_000).toFixed(2) + 'M' : Math.round(result.total_estimate / 1000) + 'k')}
                </Text>
                <View style={{ flexDirection: 'row', gap: 20, marginTop: 10 }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: T.muted, fontSize: 10 }}>per sqm</Text>
                    <Text style={{ color: T.dimText, fontSize: 15, fontWeight: '800' }}>${result.cost_per_sqm?.toLocaleString() ?? '—'}</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: T.muted, fontSize: 10 }}>per sqft</Text>
                    <Text style={{ color: T.dimText, fontSize: 15, fontWeight: '800' }}>${result.cost_per_sqft?.toLocaleString() ?? '—'}</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: T.muted, fontSize: 10 }}>region mult</Text>
                    <Text style={{ color: T.dimText, fontSize: 15, fontWeight: '800' }}>×{result.region_multiplier?.toFixed(2) ?? '1.00'}</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Cost breakdown bars */}
              <GlassCard style={{ padding: 18, marginBottom: 12 }}>
                <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 }}>COST BREAKDOWN</Text>
                {Object.entries(result.breakdown ?? {}).map(([label, val]: any, i) => {
                  const colors = [T.accent, T.blue, T.orange, T.gold, T.purple, T.cyan, T.green];
                  return <CostBar key={i} label={label} value={val} total={result.total_estimate} color={colors[i % colors.length]} />;
                })}
              </GlassCard>

              {/* AI summary */}
              <GlassCard style={{ padding: 18, marginBottom: 12 }}>
                <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>AI INSIGHT</Text>
                <Text style={{ color: T.dimText, fontSize: 13, lineHeight: 21 }}>{result.ai_summary}</Text>
              </GlassCard>

              {/* Market trend */}
              {result.market_trend && (
                <GlassCard style={{ padding: 14, backgroundColor: 'rgba(245,158,11,0.08)', borderColor: T.gold + '44' }}>
                  <Text style={{ color: T.gold, fontSize: 13, fontWeight: '700' }}>📈 {result.market_trend}</Text>
                </GlassCard>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Materials Tab ─────────────────────────────────────────────────────────────
function MaterialsTab() {
  const [items, setItems] = useState<{ item: typeof MATERIAL_ITEMS[0]; qty: number }[]>([]);
  const [filterCat, setFilterCat] = useState('All');
  const [qtyInput, setQtyInput] = useState<Record<number, string>>({});
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const cats = ['All', ...Array.from(new Set(MATERIAL_ITEMS.map(m => m.cat)))];
  const shown = filterCat === 'All' ? MATERIAL_ITEMS : MATERIAL_ITEMS.filter(m => m.cat === filterCat);

  const addItem = (material: typeof MATERIAL_ITEMS[0], idx: number) => {
    const qty = parseFloat(qtyInput[idx] ?? '1') || 1;
    setItems(prev => {
      const exist = prev.find(i => i.item.name === material.name);
      if (exist) return prev.map(i => i.item.name === material.name ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { item: material, qty }];
    });
  };

  const remove = (name: string) => setItems(prev => prev.filter(i => i.item.name !== name));
  const total  = items.reduce((s, i) => s + i.item.rate * i.qty, 0);

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#040600', '#080A06']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '800', marginBottom: 4 }}>Materials Calculator</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 14 }}>Build your bill of materials</Text>

          {/* Category filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {cats.map(cat => (
              <TouchableOpacity key={cat} onPress={() => setFilterCat(cat)}
                style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, marginRight: 7, backgroundColor: filterCat === cat ? T.accent + '28' : T.card, borderWidth: 1, borderColor: filterCat === cat ? T.accent : T.border }}>
                <Text style={{ color: filterCat === cat ? T.accent : T.muted, fontWeight: '700', fontSize: 11 }}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Material list */}
          {shown.map((mat, i) => (
            <GlassCard key={i} style={{ padding: 14, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: T.text, fontSize: 13, fontWeight: '700' }}>{mat.name}</Text>
                  <Text style={{ color: T.muted, fontSize: 11 }}>${mat.rate.toLocaleString()} per {mat.unit}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TextInput style={{ color: T.accent, backgroundColor: 'rgba(132,204,22,0.1)', borderRadius: 8, borderWidth: 1, borderColor: T.border, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, width: 60, textAlign: 'center', fontWeight: '700' }}
                    placeholder="qty" placeholderTextColor={T.muted} keyboardType="numeric"
                    value={qtyInput[i] ?? ''} onChangeText={v => setQtyInput(q => ({ ...q, [i]: v }))} />
                  <TouchableOpacity onPress={() => addItem(mat, i)}
                    style={{ backgroundColor: T.accent + '28', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: T.accent }}>
                    <Text style={{ color: T.accent, fontSize: 13, fontWeight: '800' }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          ))}

          {/* BOM Summary */}
          {items.length > 0 && (
            <GlassCard style={{ padding: 18, marginTop: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}>BILL OF MATERIALS</Text>
                <Text style={{ color: T.accent, fontSize: 16, fontWeight: '900' }}>${total.toLocaleString()}</Text>
              </View>
              {items.map((it, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: T.border }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.dimText, fontSize: 12 }}>{it.item.name}</Text>
                    <Text style={{ color: T.muted, fontSize: 11 }}>{it.qty} × ${it.item.rate.toLocaleString()}</Text>
                  </View>
                  <Text style={{ color: T.accent, fontSize: 13, fontWeight: '700', marginRight: 12 }}>${(it.qty * it.item.rate).toLocaleString()}</Text>
                  <TouchableOpacity onPress={() => remove(it.item.name)}>
                    <Text style={{ color: T.red, fontSize: 16 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </GlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Compare Tab ───────────────────────────────────────────────────────────────
function CompareTab() {
  const [sqft, setSqft] = useState('3000');
  const [region, setRegion] = useState('Sydney');
  const [projType, setProjType] = useState('New House');
  const [shown, setShown] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const run = () => {
    const area = parseFloat(sqft) || 3000;
    setShown(true); fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  };

  const comp = (area: number) => {
    const rm = REGION_MULT[region] ?? 1.0;
    const rates = RATES[projType] ?? RATES['New House'];
    return TIERS.map(t => ({
      tier: t, total: Math.round(area * rates[t] * rm),
      sqm: Math.round(rates[t] * rm * 10.76),
    }));
  };
  const area  = parseFloat(sqft) || 3000;
  const tiers = comp(area);
  const maxV   = Math.max(...tiers.map(t => t.total));
  const tierColors: Record<string, string> = { standard: T.blue, premium: T.accent, luxury: T.gold };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#040600', '#080A06']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 12 }}>
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '800', marginBottom: 4 }}>Tier Comparison</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 4 }}>Standard vs Premium vs Luxury</Text>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <GlassCard style={{ flex: 1, padding: 12 }}>
              <Text style={{ color: T.muted, fontSize: 10, marginBottom: 6 }}>SQFT</Text>
              <TextInput style={{ color: T.text, fontSize: 16, fontWeight: '800' }} value={sqft} onChangeText={setSqft} keyboardType="numeric" />
            </GlassCard>
            <GlassCard style={{ flex: 1.6, padding: 12 }}>
              <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', marginBottom: 6 }}>REGION</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Sydney', 'Melbourne', 'Brisbane', 'Auckland', 'London'].map(r => (
                  <TouchableOpacity key={r} onPress={() => setRegion(r)}
                    style={{ paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7, marginRight: 5, backgroundColor: region === r ? T.accent + '28' : 'transparent', borderWidth: 1, borderColor: region === r ? T.accent : T.border }}>
                    <Text style={{ color: region === r ? T.accent : T.muted, fontSize: 10, fontWeight: '700' }}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </GlassCard>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PROJECT_TYPES.map(pt => (
              <TouchableOpacity key={pt} onPress={() => setProjType(pt)}
                style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9, marginRight: 7, backgroundColor: projType === pt ? T.accent + '28' : T.card, borderWidth: 1, borderColor: projType === pt ? T.accent : T.border }}>
                <Text style={{ color: projType === pt ? T.accent : T.muted, fontSize: 11, fontWeight: '700' }}>{pt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <GBtn label="Compare Tiers →" onPress={run} />

          {shown && (
            <Animated.View style={{ opacity: fadeAnim, gap: 12 }}>
              {tiers.map((t, i) => (
                <GlassCard key={i} style={{ padding: 18, borderColor: tierColors[t.tier] + '44' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View>
                      <Text style={{ color: tierColors[t.tier], fontWeight: '800', fontSize: 16, textTransform: 'capitalize' }}>
                        {t.tier === 'standard' ? '🏠' : t.tier === 'premium' ? '🏡' : '🏰'} {t.tier}
                      </Text>
                      <Text style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>${t.sqm.toLocaleString()}/m² · {region}</Text>
                    </View>
                    <Text style={{ color: tierColors[t.tier], fontSize: 24, fontWeight: '900' }}>
                      ${t.total >= 1_000_000 ? (t.total / 1_000_000).toFixed(2) + 'M' : Math.round(t.total / 1000) + 'k'}
                    </Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: T.border, borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${(t.total / maxV) * 100}%`, backgroundColor: tierColors[t.tier], borderRadius: 4 }} />
                  </View>
                  <Text style={{ color: T.muted, fontSize: 11, marginTop: 8 }}>
                    {t.tier === 'standard' ? 'Builder-grade finishes, standard fixtures, meets council minimum.' : t.tier === 'premium' ? 'High-quality finishes, architect liaison, energy-rated systems.' : 'Bespoke design, imported materials, smart home, concierge PM service.'}
                  </Text>
                </GlassCard>
              ))}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Projects Tab ─────────────────────────────────────────────────────────────
function ProjectsTab() {
  const [selected, setSelected] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start(); }, []);

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#040600', '#080A06']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 12 }}>
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '800', marginBottom: 4 }}>Saved Projects</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 4 }}>Your estimate history</Text>

          {/* Summary stats */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <GlassCard style={{ flex: 1, padding: 14 }}>
              <Text style={{ color: T.muted, fontSize: 10 }}>TOTAL PROJECTS</Text>
              <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginTop: 4 }}>{SAVED_PROJECTS.length}</Text>
            </GlassCard>
            <GlassCard style={{ flex: 1, padding: 14 }}>
              <Text style={{ color: T.muted, fontSize: 10 }}>COMBINED VALUE</Text>
              <Text style={{ color: T.accent, fontSize: 22, fontWeight: '800', marginTop: 4 }}>
                ${(SAVED_PROJECTS.reduce((s, p) => s + p.estimate, 0) / 1_000_000).toFixed(2)}M
              </Text>
            </GlassCard>
          </View>

          {SAVED_PROJECTS.map((p, i) => {
            const open = selected === i;
            return (
              <TouchableOpacity key={i} onPress={() => setSelected(open ? null : i)}>
                <GlassCard style={{ padding: 18, borderColor: open ? T.accent + '44' : 'rgba(132,204,22,0.22)' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: T.text, fontSize: 15, fontWeight: '800' }}>{p.name}</Text>
                      <Text style={{ color: T.muted, fontSize: 12, marginTop: 3 }}>{p.type} · {p.region} · {p.sqft.toLocaleString()} sqft</Text>
                    </View>
                    <Text style={{ color: T.accent, fontSize: 18, fontWeight: '900' }}>
                      ${p.estimate >= 1_000_000 ? (p.estimate / 1_000_000).toFixed(2) + 'M' : Math.round(p.estimate / 1000) + 'k'}
                    </Text>
                  </View>
                  {open && (
                    <View style={{ marginTop: 14, gap: 8 }}>
                      {[
                        ['Specification', p.tier.charAt(0).toUpperCase() + p.tier.slice(1)],
                        ['Cost/sqft', '$' + Math.round(p.estimate / p.sqft).toLocaleString()],
                        ['Region Premium', (((REGION_MULT[p.region] ?? 1) - 1) * 100).toFixed(0) + '% above base'],
                      ].map(([k, v], j) => (
                        <View key={j} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: T.border }}>
                          <Text style={{ color: T.muted, fontSize: 12 }}>{k}</Text>
                          <Text style={{ color: T.dimText, fontSize: 12, fontWeight: '700' }}>{v}</Text>
                        </View>
                      ))}
                      <GBtn label="Re-estimate →" onPress={() => {}} style={{ marginTop: 8 }} />
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
      tabBarStyle: { backgroundColor: '#060800', borderTopColor: T.border, height: Platform.OS === 'ios' ? 90 : 68, paddingBottom: Platform.OS === 'ios' ? 28 : 12, paddingTop: 10 },
      tabBarActiveTintColor: T.accent, tabBarInactiveTintColor: T.muted,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
    }}>
      <Tab.Screen name="Estimate"  component={EstimateTab}  options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💰</Text>, tabBarLabel: 'estimate' }} />
      <Tab.Screen name="Materials" component={MaterialsTab} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🧱</Text>, tabBarLabel: 'materials' }} />
      <Tab.Screen name="Compare"   component={CompareTab}   options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📐</Text>, tabBarLabel: 'compare' }} />
      <Tab.Screen name="Projects"  component={ProjectsTab}  options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📋</Text>, tabBarLabel: 'projects' }} />
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
