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
  bg: '#0E050F', card: '#160A18', border: '#2A1030',
  accent: '#EC4899', cyan: '#06B6D4', text: '#FDF4FF',
  muted: '#8B5A7A', gold: '#F59E0B', green: '#10B981',
  orange: '#F97316', purple: '#A78BFA', dimText: '#F9A8D4',
  rose: '#FB7185', lavender: '#C084FC',
};

function Particles({ count = 16 }: { count?: number }) {
  const anims = useRef(Array.from({ length: count }, () => ({
    op: new Animated.Value(0), x: Math.random() * SW, y: Math.random() * 860,
    size: Math.random() * 3.5 + 1, dur: 3000 + Math.random() * 2800, delay: Math.random() * 3000,
  }))).current;
  useEffect(() => {
    anims.forEach(p => Animated.loop(Animated.sequence([
      Animated.delay(p.delay),
      Animated.timing(p.op, { toValue: 0.45, duration: p.dur, useNativeDriver: true }),
      Animated.timing(p.op, { toValue: 0,    duration: p.dur, useNativeDriver: true }),
    ])).start());
  }, []);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {anims.map((p, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: p.x, top: p.y,
          width: p.size, height: p.size, borderRadius: p.size / 2,
          backgroundColor: i % 4 === 0 ? T.accent : i % 4 === 1 ? T.lavender : i % 4 === 2 ? T.rose : T.cyan,
          opacity: p.op,
        }} />
      ))}
    </View>
  );
}

function GlassCard({ children, style }: any) {
  return (
    <View style={[{
      backgroundColor: 'rgba(22,10,24,0.97)', borderRadius: 16,
      borderWidth: 1, borderColor: 'rgba(236,72,153,0.22)',
    }, style]}>{children}</View>
  );
}

function GBtn({ label, onPress, style, loading }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.82}>
      <LinearGradient colors={[T.accent, '#BE185D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
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

// ── Beauty knowledge ──────────────────────────────────────────────────────────
const SKIN_PROFILES: Record<string, { desc: string; concerns: string[]; ingredients: string[]; avoid: string[] }> = {
  'Dry':        { desc: 'Lacks moisture, can feel tight and flaky.', concerns: ['Dehydration', 'Flaking', 'Dullness', 'Fine lines'], ingredients: ['Hyaluronic Acid', 'Ceramides', 'Squalane', 'Shea Butter', 'Glycerin'], avoid: ['Alcohol', 'Sulphates', 'Fragrance'] },
  'Oily':       { desc: 'Excess sebum production, prone to enlarged pores.', concerns: ['Shine', 'Enlarged pores', 'Blackheads', 'Breakouts'], ingredients: ['Niacinamide', 'Salicylic Acid', 'Retinol', 'Zinc', 'Clay'], avoid: ['Heavy oils', 'Comedogenic ingredients'] },
  'Combination':{ desc: 'Oily T-zone with dry or normal cheeks.', concerns: ['Uneven texture', 'Pores', 'Shine', 'Dryness'], ingredients: ['Niacinamide', 'Hyaluronic Acid', 'AHA/BHA', 'Green Tea'], avoid: ['Over-stripping cleansers', 'Heavy creams on T-zone'] },
  'Sensitive':  { desc: 'Reacts easily, prone to redness and irritation.', concerns: ['Redness', 'Sensitivity', 'Burning', 'Rosacea'], ingredients: ['Centella Asiatica', 'Aloe Vera', 'Chamomile', 'Oat Extract', 'Bisabolol'], avoid: ['Acids', 'Fragrance', 'Essential oils', 'Retinol (initially)'] },
  'Normal':     { desc: 'Balanced moisture, minimal concerns.', concerns: ['Maintenance', 'Prevention', 'Brightening'], ingredients: ['Vitamin C', 'Retinol', 'SPF 50+', 'Peptides'], avoid: ['Nothing critical — experiment!'] },
  'Acne-Prone': { desc: 'Prone to breakouts, congestion and blemishes.', concerns: ['Acne', 'Post-acne marks', 'Scarring', 'Congestion'], ingredients: ['Benzoyl Peroxide', 'Salicylic Acid', 'Niacinamide', 'Azelaic Acid', 'Retinol'], avoid: ['Coconut oil', 'Comedogenic SPF', 'Heavy makeup'] },
};

const FACE_SHAPES = ['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Oblong'];
const SKIN_TONES  = ['Fair', 'Light', 'Medium', 'Tan', 'Deep', 'Rich'];
const UNDERTONES  = ['Cool', 'Warm', 'Neutral', 'Olive'];

const ROUTINES: Record<string, { am: string[]; pm: string[] }> = {
  'Dry':         { am: ['Gentle cream cleanser', 'Hyaluronic acid serum', 'Niacinamide', 'Rich moisturiser', 'SPF 50+'], pm: ['Oil cleanser → Cream cleanser', 'Retinol (3×/wk)', 'Ceramide moisturiser', 'Facial oil'] },
  'Oily':        { am: ['Foaming gel cleanser', 'Niacinamide 10%', 'Light gel moisturiser', 'Oil-free SPF 50+'], pm: ['Salicylic acid cleanser', 'BHA toner', 'Retinol 0.5%', 'Lightweight gel moisturiser'] },
  'Combination': { am: ['Balancing cleanser', 'Vitamin C serum', 'Light moisturiser', 'SPF 50+'], pm: ['Micellar cleanse + rinse', 'AHA toner', 'Spot treat T-zone', 'Balancing moisturiser'] },
  'Sensitive':   { am: ['Micellar water', 'Centella serum', 'Barrier cream', 'Mineral SPF 50'], pm: ['Gentle cream cleanser', 'Aloe vera gel', 'Barrier repair cream'] },
  'Normal':      { am: ['Gel cleanser', 'Vitamin C 15%', 'Hyaluronic acid', 'Moisturiser SPF 50+'], pm: ['Double cleanse', 'Retinol 1%', 'Peptide moisturiser', 'Facial oil (optional)'] },
  'Acne-Prone':  { am: ['Salicylic cleanser', 'Niacinamide + Zinc', 'Oil-free SPF 50+'], pm: ['BHA cleanser', 'Azelaic acid 10%', 'Benzoyl peroxide spot (3×/wk)', 'Light gel moisturiser'] },
};

const TRENDS_DATA = [
  { name: 'Glass Skin', emoji: '✨', trend: 'Viral', desc: 'Layered hydration for a dewy, translucent complexion. Key: toning water, essence, serum, moisturiser in quick succession.', growth: 94 },
  { name: 'Skin Cycling', emoji: '🔄', trend: 'Growing', desc: '4-night rotation: Exfoliate → Retinol → Recover × 2. Reduces irritation while maximising actives.', growth: 87 },
  { name: 'Slugging', emoji: '💧', trend: 'Stable', desc: 'Petrolatum (Vaseline) as the final PM step to lock in moisture overnight. Best for dry and sensitive skin.', growth: 72 },
  { name: 'Barrier Repair', emoji: '🛡️', trend: 'Growing', desc: 'Ceramide + cholesterol + fatty acid formulas to rebuild the skin\u2019s natural moisture barrier.', growth: 89 },
  { name: 'Bakuchiol', emoji: '🌿', trend: 'Steady', desc: 'Plant-based retinol alternative. Same anti-ageing results without the irritation — safe in pregnancy.', growth: 68 },
  { name: 'LED Therapy', emoji: '💡', trend: 'Booming', desc: 'At-home red (anti-ageing) and blue (anti-acne) LED panels. Clinical backing growing rapidly.', growth: 91 },
];

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Splash ────────────────────────────────────────────────────────────────────
function SplashScreen({ navigation }: any) {
  const scale = useRef(new Animated.Value(0.12)).current;
  const op    = useRef(new Animated.Value(0)).current;
  const hue   = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 36, friction: 7, useNativeDriver: true }),
      Animated.timing(op,    { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(hue, { toValue: 1, duration: 4000, useNativeDriver: true }),
      Animated.timing(hue, { toValue: 0, duration: 4000, useNativeDriver: true }),
    ])).start();
    AsyncStorage.getItem('sianlk_t').then(t =>
      setTimeout(() => navigation.replace(t ? 'Main' : 'Onboarding'), 2700)
    );
  }, []);
  const ringScale = hue.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  return (
    <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}>
      <LinearGradient colors={['#0A020C', '#0E050F', '#1A0520']} style={StyleSheet.absoluteFill} />
      <Particles count={20} />
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity: op }}>
        <Animated.View style={{ transform: [{ scale: ringScale }], alignItems: 'center', justifyContent: 'center', width: 130, height: 130, marginBottom: 22 }}>
          <LinearGradient colors={[T.accent, T.lavender, T.cyan, T.accent]} style={{ width: 126, height: 126, borderRadius: 63, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 62 }}>✨</Text>
            </View>
          </LinearGradient>
        </Animated.View>
        <Text style={{ color: T.text, fontSize: 34, fontWeight: '900', letterSpacing: -0.5 }}>AIaesthetics</Text>
        <Text style={{ color: T.muted, fontSize: 12, marginTop: 6, letterSpacing: 3 }}>AI BEAUTY INTELLIGENCE</Text>
      </Animated.View>
    </View>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
const SLIDES = [
  { emoji: '🧴', title: 'Skin Analysis AI', desc: 'Input your skin type, tone and concerns — get a complete personalised routine with clinically-backed ingredients and products ranked for your profile.' },
  { emoji: '💄', title: 'Colour Theory AI', desc: 'Discover your seasonal colour type, best makeup undertones and which finishes suit your unique complexion for the most flattering looks.' },
  { emoji: '📈', title: 'Beauty Trends', desc: 'Stay ahead with live trend intelligence — from viral TikTok routines to dermatologist-backed treatments, ranked by efficacy and skin type suitability.' },
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
      <LinearGradient colors={['#0A020C', '#0E050F']} style={StyleSheet.absoluteFill} />
      <Particles count={10} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Animated.View style={{ alignItems: 'center', opacity: op, transform: [{ translateX: slideX }] }}>
            <LinearGradient colors={[T.accent + '30', T.lavender + '30']} style={{ width: 130, height: 130, borderRadius: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.accent + '44' }}>
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
          <GBtn label={idx < SLIDES.length - 1 ? 'Continue →' : 'Start Beauty Journey'} onPress={next} />
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
      <LinearGradient colors={['#0A020C', '#0E050F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 28 }}>
        <Text style={{ color: T.text, fontSize: 28, fontWeight: '800', marginBottom: 4 }}>{mode === 'login' ? 'Welcome back' : 'Join AIaesthetics'}</Text>
        <Text style={{ color: T.muted, marginBottom: 28, fontSize: 14 }}>AI Beauty Intelligence Platform</Text>
        <GlassCard style={{ padding: 18, marginBottom: 16 }}>
          {mode === 'register' && <TextInput style={{ color: T.text, backgroundColor: 'rgba(236,72,153,0.07)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 15, marginBottom: 12 }} placeholder="Full name" placeholderTextColor={T.muted} value={name} onChangeText={setName} autoCapitalize="words" />}
          <TextInput style={{ color: T.text, backgroundColor: 'rgba(236,72,153,0.07)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 15, marginBottom: 12 }} placeholder="Email" placeholderTextColor={T.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={{ color: T.text, backgroundColor: 'rgba(236,72,153,0.07)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 13, fontSize: 15 }} placeholder="Password" placeholderTextColor={T.muted} value={pw} onChangeText={setPw} secureTextEntry onSubmitEditing={submit} />
          {err ? <Text style={{ color: '#EF4444', marginTop: 10, fontSize: 12 }}>{err}</Text> : null}
        </GlassCard>
        <GBtn label={mode === 'login' ? 'Sign In' : 'Create Account'} onPress={submit} loading={loading} style={{ marginBottom: 14 }} />
        <TouchableOpacity onPress={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErr(''); }} style={{ alignItems: 'center' }}>
          <Text style={{ color: T.muted, fontSize: 13 }}>{mode === 'login' ? "New here? " : "Have an account? "}<Text style={{ color: T.cyan }}>{mode === 'login' ? 'Create free account' : 'Sign in'}</Text></Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(anim, { toValue: score, duration: 1000, useNativeDriver: false }).start(); }, [score]);
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View style={{ width: 62, height: 62, borderRadius: 31, borderWidth: 3, borderColor: color + '40', backgroundColor: color + '18', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color, fontSize: 16, fontWeight: '900' }}>{score}</Text>
      </View>
      <Text style={{ color: T.muted, fontSize: 10, marginTop: 5, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

// ── Skin Analysis Tab ─────────────────────────────────────────────────────────
function SkinTab() {
  const [skinType, setSkinType] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [age, setAge] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const ALL_CONCERNS = ['Acne', 'Redness', 'Dark spots', 'Fine lines', 'Wrinkles', 'Pores', 'Dullness', 'Dark circles', 'Uneven tone', 'Dehydration'];
  const toggleConcern = (c: string) => setConcerns(cs => cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c]);

  const analyse = async () => {
    if (!skinType) return;
    setLoading(true); setResult(null); fadeAnim.setValue(0);
    try {
      const token = await AsyncStorage.getItem('sianlk_t');
      const data  = await apiFetch('POST', '/api/apps/aiaesthetics/analyse', { skin_type: skinType, concerns, age }, token);
      setResult(data);
    } catch {
      const profile = SKIN_PROFILES[skinType] ?? SKIN_PROFILES['Normal'];
      const routine = ROUTINES[skinType]     ?? ROUTINES['Normal'];
      const ageN    = parseInt(age) || 28;
      setResult({
        skin_type: skinType,
        hydration_score: skinType === 'Dry' ? 42 : skinType === 'Oily' ? 78 : 65,
        barrier_score:   skinType === 'Sensitive' ? 38 : skinType === 'Acne-Prone' ? 55 : 72,
        glow_score:      skinType === 'Normal' ? 84 : skinType === 'Oily' ? 88 : 65,
        age_concern_offset: ageN > 35 ? 8 : ageN > 45 ? 15 : 0,
        profile,
        routine,
        top_ingredients: profile.ingredients.slice(0, 4),
        avoid: profile.avoid,
        ai_summary: `Your ${skinType.toLowerCase()} skin at age ${ageN} needs a focus on ${profile.concerns.slice(0, 2).join(' and ').toLowerCase()}. ${profile.desc} The most impactful ingredients for your profile are: ${profile.ingredients.slice(0, 3).join(', ')}. ${concerns.length > 0 ? `Addressing your specific concern of ${concerns[0].toLowerCase()}: add ${profile.ingredients[0]} to your AM routine.` : ''}`,
      });
    }
    setLoading(false);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#0A020C', '#0E050F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '800', marginBottom: 4 }}>Skin Analysis</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 18 }}>AI-powered personalised skin intelligence</Text>

          {/* Skin type */}
          <GlassCard style={{ padding: 14, marginBottom: 12 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>YOUR SKIN TYPE</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {Object.keys(SKIN_PROFILES).map(t => (
                <TouchableOpacity key={t} onPress={() => setSkinType(t)}
                  style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: skinType === t ? T.accent + '28' : 'transparent', borderWidth: 1, borderColor: skinType === t ? T.accent : T.border }}>
                  <Text style={{ color: skinType === t ? T.accent : T.muted, fontWeight: '700', fontSize: 12 }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          {/* Age + concerns */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <GlassCard style={{ flex: 0.4, padding: 14 }}>
              <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>AGE</Text>
              <TextInput style={{ color: T.text, fontSize: 20, fontWeight: '800', textAlign: 'center' }} placeholder="28" placeholderTextColor={T.muted} value={age} onChangeText={setAge} keyboardType="numeric" />
            </GlassCard>
            <GlassCard style={{ flex: 1, padding: 14 }}>
              <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>CONCERNS (optional)</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {ALL_CONCERNS.map(c => (
                  <TouchableOpacity key={c} onPress={() => toggleConcern(c)}
                    style={{ paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, backgroundColor: concerns.includes(c) ? T.accent + '28' : 'transparent', borderWidth: 1, borderColor: concerns.includes(c) ? T.accent : T.border }}>
                    <Text style={{ color: concerns.includes(c) ? T.accent : T.muted, fontSize: 10 }}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>
          </View>

          <GBtn label="✨  Analyse My Skin" onPress={analyse} loading={loading} style={{ marginBottom: 20 }} />

          {result && (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Score rings */}
              <GlassCard style={{ padding: 18, marginBottom: 12 }}>
                <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 }}>SKIN HEALTH SCORES</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <ScoreRing score={result.hydration_score} label="Hydration" color={T.cyan} />
                  <ScoreRing score={result.barrier_score}   label="Barrier" color={T.lavender} />
                  <ScoreRing score={result.glow_score}      label={result.skin_type + ' Glow'} color={T.accent} />
                </View>
              </GlassCard>

              {/* AI summary */}
              <GlassCard style={{ padding: 18, marginBottom: 12 }}>
                <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>AI INSIGHT</Text>
                <Text style={{ color: T.dimText, fontSize: 13, lineHeight: 21 }}>{result.ai_summary}</Text>
              </GlassCard>

              {/* AM Routine */}
              <GlassCard style={{ padding: 18, marginBottom: 12 }}>
                <Text style={{ color: T.gold, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>☀️ AM ROUTINE</Text>
                {(result.routine?.am ?? []).map((step: string, i: number) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 10, paddingVertical: 7, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: T.border }}>
                    <Text style={{ color: T.accent, fontSize: 12, fontWeight: '800', width: 22 }}>0{i + 1}</Text>
                    <Text style={{ color: T.dimText, flex: 1, fontSize: 13, lineHeight: 18 }}>{step}</Text>
                  </View>
                ))}
              </GlassCard>

              {/* PM Routine */}
              <GlassCard style={{ padding: 18, marginBottom: 12 }}>
                <Text style={{ color: T.lavender, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>🌙 PM ROUTINE</Text>
                {(result.routine?.pm ?? []).map((step: string, i: number) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 10, paddingVertical: 7, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: T.border }}>
                    <Text style={{ color: T.lavender, fontSize: 12, fontWeight: '800', width: 22 }}>0{i + 1}</Text>
                    <Text style={{ color: T.dimText, flex: 1, fontSize: 13, lineHeight: 18 }}>{step}</Text>
                  </View>
                ))}
              </GlassCard>

              {/* Ingredients */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <GlassCard style={{ flex: 1, padding: 14 }}>
                  <Text style={{ color: T.green, fontSize: 10, fontWeight: '700', marginBottom: 8 }}>✅ HERO INGREDIENTS</Text>
                  {(result.top_ingredients ?? []).map((ing: string, i: number) => (
                    <Text key={i} style={{ color: T.dimText, fontSize: 12, paddingVertical: 3 }}>• {ing}</Text>
                  ))}
                </GlassCard>
                <GlassCard style={{ flex: 1, padding: 14 }}>
                  <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: '700', marginBottom: 8 }}>⛔ AVOID</Text>
                  {(result.avoid ?? []).map((ing: string, i: number) => (
                    <Text key={i} style={{ color: T.muted, fontSize: 12, paddingVertical: 3 }}>• {ing}</Text>
                  ))}
                </GlassCard>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Colour Analysis Tab ───────────────────────────────────────────────────────
const SEASONAL_PALETTES: Record<string, { season: string; desc: string; bestColors: string[]; makeup: { lips: string; eyes: string; blush: string }; avoid: string[] }> = {
  'Cool-Fair':    { season: 'Cool Winter', desc: 'High contrast, clear undertones, looks best in jewel tones and true winter shades.', bestColors: ['Sapphire Blue', 'Emerald', 'True Red', 'Fuchsia', 'Ice Pink', 'Pure White'], makeup: { lips: 'Berry, Raspberry, True Red', eyes: 'Silver, Charcoal, Plum', blush: 'Rose Pink, Raspberry' }, avoid: ['Orange', 'Warm Browns', 'Mustard', 'Peach'] },
  'Warm-Medium':  { season: 'Warm Autumn', desc: 'Rich, earthy undertones glow in warm golden and earthy palettes.', bestColors: ['Terracotta', 'Olive', 'Rust', 'Mustard', 'Warm Brown', 'Camel'], makeup: { lips: 'Brick Red, Terracotta, Nude Brown', eyes: 'Bronze, Copper, Warm Brown', blush: 'Peach, Coral, Dusty Rose' }, avoid: ['Cool Pink', 'Blue-Red', 'Silver', 'Icy Tones'] },
  'Neutral-Light':{ season: 'Soft Spring', desc: 'Balanced, adaptable undertones suited to soft, clear and fresh colours.', bestColors: ['Powder Blue', 'Soft Pink', 'Mint', 'Ivory', 'Lavender', 'Periwinkle'], makeup: { lips: 'Peachy Pink, Coral, Soft Rose', eyes: 'Mauve, Taupe, Light Brown', blush: 'Soft Peach, Light Coral' }, avoid: ['Black', 'Very Dark Tones', 'Heavy Contrast'] },
  'Cool-Deep':    { season: 'Deep Winter', desc: 'Deep, cool colouring — bold and dramatic looks are most flattering.', bestColors: ['Black', 'Deep Purple', 'Burgundy', 'Forest Green', 'Royal Blue', 'Deep teal'], makeup: { lips: 'Deep Berry, Dark Red, Plum', eyes: 'Black, Deep Navy, Espresso', blush: 'Deep Rose, Mauve' }, avoid: ['Warm Beige', 'Orange', 'Light Pastels'] },
};

function ColourTab() {
  const [skinTone, setSkinTone] = useState('');
  const [undertone, setUndertone] = useState('');
  const [result, setResult] = useState<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const analyse = () => {
    if (!skinTone || !undertone) return;
    fadeAnim.setValue(0);
    const key = Object.keys(SEASONAL_PALETTES).find(k => k.toLowerCase().includes(undertone.toLowerCase())) ?? (skinTone === 'Fair' || skinTone === 'Light' ? 'Cool-Fair' : skinTone === 'Deep' || skinTone === 'Rich' ? 'Cool-Deep' : 'Neutral-Light');
    const palette = SEASONAL_PALETTES[key];
    setResult({ ...palette, skin_tone: skinTone, undertone, key });
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  };

  const SWATCH_COLORS = ['#1E3A5F', '#2D6A4F', '#C0392B', '#E74C9A', '#BFD9F5', '#FAEBD7', '#8B4513', '#556B2F', '#B7472A', '#D4A853', '#5D478B', '#2C7744'];

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#0A020C', '#0E050F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 12 }}>
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '800', marginBottom: 4 }}>Colour Analysis</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 4 }}>Discover your seasonal colour type</Text>

          <GlassCard style={{ padding: 14 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>SKIN TONE</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SKIN_TONES.map(t => (
                <TouchableOpacity key={t} onPress={() => setSkinTone(t)}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: skinTone === t ? T.accent + '28' : 'transparent', borderWidth: 1, borderColor: skinTone === t ? T.accent : T.border }}>
                  <Text style={{ color: skinTone === t ? T.accent : T.muted, fontWeight: '700', fontSize: 12 }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          <GlassCard style={{ padding: 14 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>UNDERTONE</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {UNDERTONES.map(u => (
                <TouchableOpacity key={u} onPress={() => setUndertone(u)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: undertone === u ? T.accent + '28' : 'transparent', borderWidth: 1, borderColor: undertone === u ? T.accent : T.border, alignItems: 'center' }}>
                  <Text style={{ fontSize: 16 }}>{u === 'Cool' ? '❄️' : u === 'Warm' ? '🔥' : u === 'Neutral' ? '⚖️' : '🫒'}</Text>
                  <Text style={{ color: undertone === u ? T.accent : T.muted, fontWeight: '700', fontSize: 10, marginTop: 3 }}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          <GBtn label="💄  Analyse My Palette" onPress={analyse} />

          {result && (
            <Animated.View style={{ opacity: fadeAnim, gap: 12 }}>
              {/* Season hero */}
              <LinearGradient colors={[T.accent + '28', T.lavender + '18']} style={{ borderRadius: 20, padding: 20, borderWidth: 1, borderColor: T.accent + '44' }}>
                <Text style={{ color: T.muted, fontSize: 10, letterSpacing: 2 }}>YOUR SEASON</Text>
                <Text style={{ color: T.text, fontSize: 24, fontWeight: '900', marginTop: 4 }}>{result.season}</Text>
                <Text style={{ color: T.dimText, fontSize: 13, lineHeight: 20, marginTop: 8 }}>{result.desc}</Text>
              </LinearGradient>

              {/* Best colours */}
              <GlassCard style={{ padding: 18 }}>
                <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 }}>BEST COLOURS FOR YOU</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {result.bestColors.map((c: string, i: number) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: T.border }}>
                      <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: SWATCH_COLORS[i % SWATCH_COLORS.length] }} />
                      <Text style={{ color: T.dimText, fontSize: 12 }}>{c}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>

              {/* Makeup */}
              <GlassCard style={{ padding: 18 }}>
                <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 }}>MAKEUP PALETTE</Text>
                {[['💋 Lips', result.makeup.lips], ['👁️ Eyes', result.makeup.eyes], ['🌸 Blush', result.makeup.blush]].map(([k, v], i) => (
                  <View key={i} style={{ flexDirection: 'row', paddingVertical: 8, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: T.border }}>
                    <Text style={{ color: T.muted, fontSize: 12, width: 80 }}>{k}</Text>
                    <Text style={{ color: T.dimText, flex: 1, fontSize: 13 }}>{v}</Text>
                  </View>
                ))}
              </GlassCard>

              {/* Avoid */}
              <GlassCard style={{ padding: 14, backgroundColor: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.3)' }}>
                <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>⛔ AVOID WEARING</Text>
                <Text style={{ color: T.muted, fontSize: 13 }}>{result.avoid.join('  •  ')}</Text>
              </GlassCard>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Trends Tab ────────────────────────────────────────────────────────────────
function TrendsTab() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start(); }, []);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#0A020C', '#0E050F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={{ padding: 18, paddingBottom: 40, gap: 10 }}>
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '800', marginBottom: 4 }}>Beauty Trends</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 10 }}>What's trending in skincare 2026</Text>

          {/* Viral banner */}
          <LinearGradient colors={[T.accent + '30', T.lavender + '20']} style={{ borderRadius: 18, padding: 20, borderWidth: 1, borderColor: T.accent + '50', marginBottom: 4 }}>
            <Text style={{ color: T.accent, fontSize: 11, fontWeight: '700', letterSpacing: 2 }}>🔥 MOST VIRAL RIGHT NOW</Text>
            <Text style={{ color: T.text, fontSize: 22, fontWeight: '900', marginTop: 4 }}>Glass Skin</Text>
            <Text style={{ color: T.dimText, fontSize: 13, lineHeight: 20, marginTop: 6 }}>94% growth month-over-month. Layered hydration formula taking over skincare.</Text>
          </LinearGradient>

          {TRENDS_DATA.map((trend, i) => (
            <TouchableOpacity key={i} onPress={() => setOpen(open === i ? null : i)}>
              <GlassCard style={{ padding: 16, borderColor: open === i ? T.accent + '44' : 'rgba(236,72,153,0.22)' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <Text style={{ fontSize: 28 }}>{trend.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: T.text, fontWeight: '800', fontSize: 15 }}>{trend.name}</Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 3 }}>
                        <View style={{ backgroundColor: trend.trend === 'Viral' ? T.accent + '28' : trend.trend === 'Booming' ? '#F97316' + '28' : T.lavender + '20', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 }}>
                          <Text style={{ color: trend.trend === 'Viral' ? T.accent : trend.trend === 'Booming' ? '#F97316' : T.lavender, fontSize: 9, fontWeight: '700' }}>↑ {trend.trend.toUpperCase()}</Text>
                        </View>
                        <Text style={{ color: T.muted, fontSize: 11 }}>{trend.growth}% growth</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={{ color: T.muted, fontSize: 14 }}>{open === i ? '▲' : '▼'}</Text>
                </View>
                {open === i && (
                  <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: T.border, paddingTop: 12 }}>
                    <Text style={{ color: T.dimText, fontSize: 13, lineHeight: 21 }}>{trend.desc}</Text>

                    {/* Trend bar */}
                    <View style={{ marginTop: 12 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                        <Text style={{ color: T.muted, fontSize: 10 }}>Momentum</Text>
                        <Text style={{ color: T.accent, fontSize: 10, fontWeight: '700' }}>{trend.growth}%</Text>
                      </View>
                      <View style={{ height: 6, backgroundColor: T.border, borderRadius: 3, overflow: 'hidden' }}>
                        <View style={{ height: '100%', width: `${trend.growth}%`, borderRadius: 3, backgroundColor: T.accent }} />
                      </View>
                    </View>
                  </View>
                )}
              </GlassCard>
            </TouchableOpacity>
          ))}
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
      tabBarStyle: { backgroundColor: '#0A0310', borderTopColor: T.border, height: Platform.OS === 'ios' ? 90 : 68, paddingBottom: Platform.OS === 'ios' ? 28 : 12, paddingTop: 10 },
      tabBarActiveTintColor: T.accent, tabBarInactiveTintColor: T.muted,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
    }}>
      <Tab.Screen name="Skin"   component={SkinTab}   options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🧴</Text>, tabBarLabel: 'skin' }} />
      <Tab.Screen name="Colour" component={ColourTab} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🎨</Text>, tabBarLabel: 'colour' }} />
      <Tab.Screen name="Trends" component={TrendsTab} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📈</Text>, tabBarLabel: 'trends' }} />
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
