import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Animated, ActivityIndicator,
  SafeAreaView, StatusBar, Dimensions,
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
  yellow: '#F59E0B', orange: '#F97316',
};

function Particles({ count = 14 }: { count?: number }) {
  const anims = useRef(Array.from({ length: count }, () => ({
    op: new Animated.Value(0),
    x: Math.random() * SW, y: Math.random() * 800,
    size: Math.random() * 3 + 1,
    dur: 2600 + Math.random() * 2400,
    delay: Math.random() * 2000,
  }))).current;
  useEffect(() => {
    anims.forEach(p =>
      Animated.loop(Animated.sequence([
        Animated.delay(p.delay),
        Animated.timing(p.op, { toValue: 0.6, duration: p.dur, useNativeDriver: true }),
        Animated.timing(p.op, { toValue: 0, duration: p.dur, useNativeDriver: true }),
      ])).start()
    );
  }, []);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {anims.map((p, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: p.x, top: p.y,
          width: p.size, height: p.size, borderRadius: p.size / 2,
          backgroundColor: i % 3 === 0 ? T.accent : i % 3 === 1 ? T.cyan : T.orange,
          opacity: p.op,
        }} />
      ))}
    </View>
  );
}

function GCard({ children, style }: any) {
  return (
    <View style={[{
      backgroundColor: 'rgba(19,19,26,0.95)', borderRadius: 16,
      borderWidth: 1, borderColor: 'rgba(139,92,246,0.14)', overflow: 'hidden',
    }, style]}>{children}</View>
  );
}

function GBtn({ label, onPress, style, loading, colors = [T.accent, T.cyan] }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.82}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 24, borderRadius: 12, flexDirection: 'row', gap: 8 }}>
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
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

// ── XP Ring ──────────────────────────────────────────────────────────────────
function XPRing({ xp, maxXp, level, size = 100 }: { xp: number; maxXp: number; level: number; size?: number }) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(widthAnim, { toValue: Math.min(xp / maxXp, 1), duration: 900, useNativeDriver: false }).start();
  }, [xp]);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 8, borderColor: T.border, position: 'absolute' }} />
      <View style={{ width: size - 16, height: size - 16, borderRadius: (size - 16) / 2, backgroundColor: T.card, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: T.accent, fontSize: size > 90 ? 20 : 14, fontWeight: '900' }}>Lv{level}</Text>
        <Text style={{ color: T.muted, fontSize: size > 90 ? 10 : 9 }}>{xp}/{maxXp}</Text>
      </View>
    </View>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'tech',       label: 'Technology',  emoji: '💻', color: T.cyan    },
  { id: 'business',   label: 'Business',    emoji: '📈', color: T.green   },
  { id: 'creative',   label: 'Creative',    emoji: '🎨', color: '#EC4899' },
  { id: 'language',   label: 'Language',    emoji: '🌍', color: T.accent  },
  { id: 'science',    label: 'Science',     emoji: '🔬', color: T.orange  },
  { id: 'leadership', label: 'Leadership',  emoji: '🏆', color: T.yellow  },
];

const QUESTIONS: Record<string, { q: string; options: string[]; answer: number }[]> = {
  tech: [
    { q: 'What does API stand for?', options: ['Application Programming Interface','Advanced Processing Input','Automated Protocol Interface','Adaptive Program Integration'], answer: 0 },
    { q: 'Which data structure uses LIFO order?', options: ['Queue','Stack','Heap','Tree'], answer: 1 },
    { q: 'Time complexity of binary search?', options: ['O(n)','O(n²)','O(log n)','O(1)'], answer: 2 },
    { q: 'What does HTTPS stand for?', options: ['Hyper Text Transfer Protocol Secure','High Transfer Text Proxy System','Hyper Terminal Text Protocol Service','Host Transfer TCP Protocol System'], answer: 0 },
    { q: 'Which React hook manages component state?', options: ['useEffect','useContext','useState','useRef'], answer: 2 },
    { q: 'What is a REST API constraint?', options: ['Stateless','Stateful sessions required','Always uses GraphQL','Requires WebSockets'], answer: 0 },
  ],
  business: [
    { q: 'What does ROI stand for?', options: ['Return on Investment','Rate of Inflation','Revenue over Income','Risk of Investment'], answer: 0 },
    { q: 'SWOT analysis stands for:', options: ['Strengths Weaknesses Operations Targets','Strengths Weaknesses Opportunities Threats','Strategy Workflow Objectives Timeline','Scale Workforce Output Technology'], answer: 1 },
    { q: 'What is the break-even point?', options: ['When revenue = cost','When profit is maximum','When sales exceed forecast','When expenses are zero'], answer: 0 },
    { q: 'A loss leader pricing strategy means:', options: ['Pricing above competitors','Selling at a loss to attract customers','Matching competitor prices','Bundling products together'], answer: 1 },
    { q: 'What does B2B stand for?', options: ['Business to Business','Brand to Brand','Back to Basics','Budget to Budget'], answer: 0 },
    { q: 'OKR stands for:', options: ['Objectives and Key Results','Operational Knowledge Reports','Output and Key Resources','Ordered Key Rankings'], answer: 0 },
  ],
  science: [
    { q: 'Approximate speed of light?', options: ['300,000 km/s','150,000 km/s','500,000 km/s','1,000,000 km/s'], answer: 0 },
    { q: 'DNA stands for:', options: ['Deoxyribonucleic Acid','Dinitrogen Acid','Double Nucleic Arrangement','Dynamic Nucleotide Assembly'], answer: 0 },
    { q: "Schrödinger's cat is about:", options: ['Quantum superposition','Evolution theory','Nuclear fission','Chaos theory'], answer: 0 },
    { q: 'Periodic table element Au is:', options: ['Silver','Aluminum','Gold','Argon'], answer: 2 },
    { q: 'Photosynthesis converts:', options: ['Water into hydrogen','CO₂ + water into glucose + oxygen','Sunlight into electricity','Glucose into ATP only'], answer: 1 },
    { q: 'What is absolute zero in Celsius?', options: ['-100°C','-200°C','-273.15°C','-300°C'], answer: 2 },
  ],
  creative: [
    { q: 'Rule of thirds in photography:', options: ['Divides image into 9 equal parts','Uses only 3 colors','Limits exposure to 3 seconds','Requires 3 light sources'], answer: 0 },
    { q: 'A serif font has:', options: ['No decorative strokes','Small strokes at letter ends','Only bold weight','Only digital uses'], answer: 1 },
    { q: 'RGB color model is used for:', options: ['Print design','Screen/digital displays','Painting','Architecture'], answer: 1 },
    { q: 'UX stands for:', options: ['Universal eXperiment','User eXperience','Unified eXchange','User eXecution'], answer: 1 },
    { q: 'Kerning in typography refers to:', options: ['Letter height','Space between characters','Font weight','Line spacing'], answer: 1 },
    { q: 'What is a mood board?', options: ['A bug tracking tool','A visual collection for design inspiration','A project timeline','A user persona template'], answer: 1 },
  ],
  language: [
    { q: 'How many official UN languages?', options: ['4','5','6','8'], answer: 2 },
    { q: '"Bonjour" is from:', options: ['Spanish','Italian','French','Portuguese'], answer: 2 },
    { q: 'The Rosetta Stone helped decipher:', options: ['Sanskrit','Hieroglyphics','Cuneiform','Linear B'], answer: 1 },
    { q: 'A language with no native speakers:', options: ['Dead language','Extinct language','Constructed language','Pidgin language'], answer: 0 },
    { q: '"Gracias" means thank you in:', options: ['Italian','French','Spanish','Portuguese'], answer: 2 },
    { q: 'Mandarin Chinese is written using:', options: ['An alphabet','Syllabic script','Logographic characters','Runic script'], answer: 2 },
  ],
  leadership: [
    { q: 'Servant leadership prioritises:', options: ["Leader's goals","Team members' needs",'Profit maximisation','Strict hierarchy'], answer: 1 },
    { q: 'Active listening involves:', options: ['Planning your response','Fully concentrating on the speaker','Taking detailed notes only','Interrupting to clarify'], answer: 1 },
    { q: 'Emotional intelligence includes:', options: ['IQ only','Self-awareness and empathy','Technical skills','Memorisation ability'], answer: 1 },
    { q: 'Transformational leadership focuses on:', options: ['Maintaining status quo','Inspiring change and vision','Task completion only','Micromanagement'], answer: 1 },
    { q: 'Delegation is most effective when:', options: ['Given to everyone equally','Matched to skill and authority','Done as rarely as possible','Only for simple tasks'], answer: 1 },
    { q: 'Psychological safety in teams means:', options: ['No deadlines','Freedom to speak up without fear','Working from home','Unlimited budget'], answer: 1 },
  ],
};

const BADGES = [
  { emoji: '🏆', label: 'First Assessment', earned: true, color: T.yellow },
  { emoji: '🔥', label: '5-Day Streak',     earned: true, color: T.orange },
  { emoji: '⚡', label: 'Speed Demon',       earned: true, color: T.cyan },
  { emoji: '🎯', label: 'Perfect Score',     earned: false, color: T.green },
  { emoji: '🧠', label: 'Master Mind',       earned: false, color: T.accent },
  { emoji: '🌟', label: '50 Assessments',    earned: false, color: T.yellow },
  { emoji: '🚀', label: 'Level 5',           earned: false, color: '#EC4899' },
  { emoji: '💎', label: 'All Categories',    earned: false, color: T.cyan },
];

const Tab = createBottomTabNavigator();
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
      Animated.timing(pulse, { toValue: 1.12, duration: 900, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
    ])).start();
    AsyncStorage.getItem('sianlk_t').then(t =>
      setTimeout(() => navigation.replace(t ? 'Main' : 'Onboarding'), 2400)
    );
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}>
      <LinearGradient colors={['#180B30', '#0A0A0F', '#0A1020']} style={StyleSheet.absoluteFill} />
      <Particles count={22} />
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity: op }}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <LinearGradient colors={[T.accent, T.cyan]}
            style={{ width: 112, height: 112, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 56 }}>🧠</Text>
          </LinearGradient>
        </Animated.View>
        <Text style={{ color: T.text, fontSize: 38, fontWeight: '900', marginTop: 22, letterSpacing: -0.5 }}>AIBLTY</Text>
        <Text style={{ color: T.muted, fontSize: 14, marginTop: 6, letterSpacing: 2.5 }}>MASTER YOUR SKILLS</Text>
      </Animated.View>
    </View>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
const SLIDES = [
  { emoji: '🧠', title: 'AI-Powered Assessments', desc: 'Quantum-scored assessments across Technology, Business, Science, Creative, Language and Leadership — know exactly where you stand.' },
  { emoji: '📈', title: 'Personalised Learning Paths', desc: 'AI analyses your performance and builds a laser-focused roadmap to close skill gaps and accelerate mastery.' },
  { emoji: '🏆', title: 'Level Up & Earn Badges', desc: 'XP, daily streaks and achievement badges make skill mastery addictive and rewarding.' },
];

function OnboardingScreen({ navigation }: any) {
  const [idx, setIdx] = useState(0);
  const op    = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;
  const advance = () => {
    Animated.parallel([
      Animated.timing(op, { toValue: 0, duration: 170, useNativeDriver: true }),
      Animated.timing(slideX, { toValue: -28, duration: 170, useNativeDriver: true }),
    ]).start(() => {
      if (idx < SLIDES.length - 1) {
        setIdx(i => i + 1);
        slideX.setValue(28);
        Animated.parallel([
          Animated.timing(op, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.timing(slideX, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start();
      } else navigation.replace('Auth');
    });
  };
  const s = SLIDES[idx];
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#180B30', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <Particles count={12} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Animated.View style={{ alignItems: 'center', opacity: op, transform: [{ translateX: slideX }] }}>
            <LinearGradient colors={[T.accent + '40', T.cyan + '25']}
              style={{ width: 130, height: 130, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 72 }}>{s.emoji}</Text>
            </LinearGradient>
            <Text style={{ color: T.text, fontSize: 27, fontWeight: '800', textAlign: 'center', marginTop: 22, marginBottom: 14, lineHeight: 34 }}>{s.title}</Text>
            <Text style={{ color: T.muted, fontSize: 16, textAlign: 'center', lineHeight: 27 }}>{s.desc}</Text>
          </Animated.View>
        </View>
        <View style={{ padding: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 22 }}>
            {SLIDES.map((_, i) => (
              <View key={i} style={{ width: i === idx ? 26 : 7, height: 7, borderRadius: 3.5, backgroundColor: i === idx ? T.accent : T.border }} />
            ))}
          </View>
          <GBtn label={idx < SLIDES.length - 1 ? 'Continue →' : 'Start for Free'} onPress={advance} />
          {idx === 0 && (
            <TouchableOpacity onPress={() => navigation.replace('Auth')} style={{ alignItems: 'center', marginTop: 14 }}>
              <Text style={{ color: T.muted, fontSize: 13 }}>Have an account? <Text style={{ color: T.cyan, fontWeight: '600' }}>Sign in</Text></Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function AuthScreen({ navigation }: any) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [pw, setPw]       = useState('');
  const [name, setName]   = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr]     = useState('');
  const submit = async () => {
    if (!email || !pw) return setErr('Please fill in all fields');
    setLoading(true); setErr('');
    try {
      let token: string;
      if (mode === 'register') {
        const r = await apiFetch('POST', '/api/auth/register', { email, password: pw, full_name: name || email.split('@')[0] });
        token = r.access_token;
      } else {
        const fd = new URLSearchParams();
        fd.append('username', email); fd.append('password', pw);
        const r = await fetch(`${API}/api/auth/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() });
        const d = await r.json(); if (!r.ok) throw new Error(d.detail || 'Login failed');
        token = d.access_token;
      }
      await AsyncStorage.setItem('sianlk_t', token);
      navigation.replace('Main');
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: T.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#180B30', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 28 }}>
        <Text style={{ color: T.text, fontSize: 30, fontWeight: '800', marginBottom: 6 }}>{mode === 'login' ? 'Welcome back 👋' : 'Join AIBLTY'}</Text>
        <Text style={{ color: T.muted, marginBottom: 28, fontSize: 14 }}>{mode === 'login' ? 'Sign in to continue your journey' : 'Free account — start assessing instantly'}</Text>
        <GCard style={{ padding: 18, marginBottom: 16 }}>
          {mode === 'register' && (
            <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 14, fontSize: 15, marginBottom: 12 }}
              placeholder="Full name" placeholderTextColor={T.muted} value={name} onChangeText={setName} autoCapitalize="words" />
          )}
          <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 14, fontSize: 15, marginBottom: 12 }}
            placeholder="Email address" placeholderTextColor={T.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 14, fontSize: 15 }}
            placeholder="Password" placeholderTextColor={T.muted} value={pw} onChangeText={setPw} secureTextEntry onSubmitEditing={submit} />
          {err ? <Text style={{ color: T.red, marginTop: 10, fontSize: 13 }}>{err}</Text> : null}
        </GCard>
        <GBtn label={mode === 'login' ? 'Sign In' : 'Create Free Account'} onPress={submit} loading={loading} style={{ marginBottom: 14 }} />
        <TouchableOpacity onPress={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErr(''); }} style={{ alignItems: 'center' }}>
          <Text style={{ color: T.muted, fontSize: 13 }}>
            {mode === 'login' ? 'No account? ' : 'Have an account? '}
            <Text style={{ color: T.cyan, fontWeight: '600' }}>{mode === 'login' ? 'Create one free' : 'Sign in'}</Text>
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ── Home Tab ──────────────────────────────────────────────────────────────────
function HomeTab({ navigation }: any) {
  const fade  = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(24)).current;
  const userData = { name: 'Learner', xp: 340, level: 2, streak: 5, assessments: 8 };
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#100828', '#0A0A0F', '#08080E']} style={StyleSheet.absoluteFill} />
      <Particles count={16} />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView style={{ opacity: fade, transform: [{ translateY: slideY }] }}
          contentContainerStyle={{ padding: 22, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <View>
              <Text style={{ color: T.muted, fontSize: 13 }}>Good day,</Text>
              <Text style={{ color: T.text, fontSize: 24, fontWeight: '800' }}>{userData.name} 👋</Text>
            </View>
            <GCard style={{ paddingHorizontal: 14, paddingVertical: 9 }}>
              <Text style={{ fontSize: 18 }}>🔥 <Text style={{ color: T.text, fontWeight: '700', fontSize: 16 }}>{userData.streak}</Text></Text>
            </GCard>
          </View>

          {/* XP card */}
          <GCard style={{ padding: 20, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
              <XPRing xp={userData.xp} maxXp={500} level={userData.level} size={92} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: T.text, fontSize: 18, fontWeight: '800', marginBottom: 4 }}>Level {userData.level}</Text>
                <Text style={{ color: T.muted, fontSize: 13, marginBottom: 10 }}>{500 - userData.xp} XP to Level {userData.level + 1}</Text>
                <View style={{ height: 6, backgroundColor: T.border, borderRadius: 3 }}>
                  <View style={{ height: 6, width: `${(userData.xp / 500) * 100}%` as any, backgroundColor: T.accent, borderRadius: 3 }} />
                </View>
                <Text style={{ color: T.muted, fontSize: 12, marginTop: 6 }}>{userData.assessments} assessments completed</Text>
              </View>
            </View>
          </GCard>

          {/* Daily challenge */}
          <TouchableOpacity onPress={() => navigation.navigate('Assess')} style={{ marginBottom: 20 }} activeOpacity={0.88}>
            <LinearGradient colors={[T.accent, '#4F46E5']} style={{ borderRadius: 20, padding: 22 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: '700', letterSpacing: 1.8, marginBottom: 4 }}>DAILY CHALLENGE</Text>
                  <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 5 }}>Take Today's Assessment</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <LinearGradient colors={['#F59E0B', '#F97316']} style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>2× XP Bonus</Text>
                    </LinearGradient>
                  </View>
                </View>
                <Text style={{ fontSize: 46 }}>⚡</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Categories */}
          <Text style={{ color: T.text, fontSize: 17, fontWeight: '700', marginBottom: 14 }}>Skill Categories</Text>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} onPress={() => navigation.navigate('Assess', { cat: cat.id })} style={{ marginBottom: 10 }} activeOpacity={0.8}>
              <GCard style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <LinearGradient colors={[cat.color + '35', cat.color + '12']}
                    style={{ width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.text, fontWeight: '700', fontSize: 15 }}>{cat.label}</Text>
                    <Text style={{ color: T.muted, fontSize: 12 }}>{QUESTIONS[cat.id].length} questions · ~3 min</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ color: cat.color, fontSize: 12, fontWeight: '700' }}>+50 XP</Text>
                    <Text style={{ color: T.muted, fontSize: 16 }}>›</Text>
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

// ── Assess Tab ────────────────────────────────────────────────────────────────
function AssessTab({ route }: any) {
  const preSelCat = (route?.params as any)?.cat ?? null;
  const [phase, setPhase]   = useState<'pick' | 'quiz' | 'result'>(preSelCat ? 'quiz' : 'pick');
  const [selCat, setSelCat] = useState<string>(preSelCat || '');
  const [qIdx,   setQIdx]   = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score,  setScore]  = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [aiResult, setAiResult]   = useState<any>(null);
  const [loading, setLoading]     = useState(false);
  const progressW = useRef(new Animated.Value(0)).current;
  const fadeQ     = useRef(new Animated.Value(0)).current;
  const slideQ    = useRef(new Animated.Value(30)).current;

  const animateQuestion = (nextIdx: number, total: number) => {
    slideQ.setValue(30); fadeQ.setValue(0);
    Animated.parallel([
      Animated.timing(fadeQ,  { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(slideQ, { toValue: 0, duration: 280, useNativeDriver: true }),
      Animated.timing(progressW, { toValue: (nextIdx + 1) / total, duration: 500, useNativeDriver: false }),
    ]).start();
  };

  const startQuiz = (catId: string) => {
    setSelCat(catId); setQIdx(0); setAnswers([]); setScore(0);
    setSelected(null); setConfirmed(false); setAiResult(null);
    progressW.setValue(0); setPhase('quiz');
    setTimeout(() => animateQuestion(0, QUESTIONS[catId].length), 50);
  };

  useEffect(() => {
    if (preSelCat && phase === 'quiz') startQuiz(preSelCat);
  }, []);

  const confirmAnswer = async () => {
    if (selected === null) return;
    const qs = QUESTIONS[selCat];
    const correct = selected === qs[qIdx].answer;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setConfirmed(true);
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    setTimeout(() => {
      if (qIdx < qs.length - 1) {
        const next = qIdx + 1;
        setQIdx(next); setSelected(null); setConfirmed(false);
        animateQuestion(next, qs.length);
      } else {
        finishQuiz(newAnswers, newScore);
      }
    }, 820);
  };

  const finishQuiz = async (ans: number[], finalScore: number) => {
    setPhase('result'); setLoading(true);
    const qs = QUESTIONS[selCat];
    try {
      const token = await AsyncStorage.getItem('sianlk_t');
      const data = await apiFetch('POST', '/api/apps/aiblty/assess', {
        skill: selCat, score: (finalScore / qs.length) * 100, time_taken: 180, answers: ans,
      }, token);
      setAiResult(data);
    } catch {
      setAiResult({
        feedback: `Good effort on ${selCat}! You scored ${finalScore}/${qs.length}. Focus on reviewing the questions you missed to improve.`,
        learning_path: [`Deep-dive into ${selCat} fundamentals`, 'Practice with real-world examples', 'Take the assessment again to track progress'],
        quantum_score: finalScore / qs.length,
      });
    } finally { setLoading(false); }
  };

  // ── Pick phase ──
  if (phase === 'pick') return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#100828', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
          <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 6 }}>Assessments 🧠</Text>
          <Text style={{ color: T.muted, fontSize: 14, marginBottom: 22 }}>Choose a category and get AI-scored instantly.</Text>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} onPress={() => startQuiz(cat.id)} style={{ marginBottom: 12 }} activeOpacity={0.82}>
              <View style={{ borderRadius: 16, padding: 18, borderWidth: 1, borderColor: cat.color + '35', backgroundColor: cat.color + '0C' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <Text style={{ fontSize: 32 }}>{cat.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.text, fontSize: 17, fontWeight: '700' }}>{cat.label}</Text>
                    <Text style={{ color: T.muted, fontSize: 13, marginTop: 3 }}>{QUESTIONS[cat.id].length} questions · Earn 50 XP · AI feedback</Text>
                  </View>
                  <LinearGradient colors={[cat.color, cat.color + 'AA']} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Start →</Text>
                  </LinearGradient>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );

  // ── Quiz phase ──
  if (phase === 'quiz') {
    const qs  = QUESTIONS[selCat];
    const q   = qs[qIdx];
    const cat = CATEGORIES.find(c => c.id === selCat)!;
    return (
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        <LinearGradient colors={['#100828', '#0A0A0F']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ padding: 22, flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ color: T.muted, fontSize: 13 }}>{cat.emoji} {cat.label}</Text>
              <Text style={{ color: T.muted, fontSize: 13 }}>{qIdx + 1} / {qs.length}</Text>
            </View>
            {/* Progress bar */}
            <View style={{ height: 5, backgroundColor: T.border, borderRadius: 3, marginBottom: 26 }}>
              <Animated.View style={{
                height: 5, borderRadius: 3, backgroundColor: cat.color,
                width: progressW.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              }} />
            </View>
            <Animated.View style={{ opacity: fadeQ, transform: [{ translateY: slideQ }] }}>
              <GCard style={{ padding: 22, marginBottom: 22 }}>
                <Text style={{ color: T.text, fontSize: 17, fontWeight: '700', lineHeight: 26 }}>{q.q}</Text>
              </GCard>
              {q.options.map((opt, i) => {
                let bg     = 'rgba(255,255,255,0.03)';
                let border = T.border;
                let txtC   = T.text;
                if (confirmed) {
                  if (i === q.answer)                        { bg = 'rgba(16,185,129,0.15)'; border = T.green; txtC = T.green; }
                  else if (i === selected && i !== q.answer) { bg = 'rgba(239,68,68,0.12)'; border = T.red;  txtC = T.red;  }
                } else if (i === selected) { bg = 'rgba(139,92,246,0.18)'; border = T.accent; txtC = T.accent; }
                return (
                  <TouchableOpacity key={i} onPress={() => !confirmed && setSelected(i)}
                    style={{ marginBottom: 10, borderRadius: 12, backgroundColor: bg, borderWidth: 1.5, borderColor: border, padding: 15 }}
                    activeOpacity={0.75} disabled={confirmed}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: txtC, fontWeight: '800', fontSize: 12 }}>{String.fromCharCode(65 + i)}</Text>
                      </View>
                      <Text style={{ color: txtC, fontSize: 14, flex: 1, lineHeight: 20 }}>{opt}</Text>
                      {confirmed && i === q.answer && <Text style={{ color: T.green, fontSize: 16 }}>✓</Text>}
                      {confirmed && i === selected && i !== q.answer && <Text style={{ color: T.red, fontSize: 16 }}>✗</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
              {!confirmed && selected !== null && (
                <GBtn label="Confirm Answer" onPress={confirmAnswer} style={{ marginTop: 8 }} colors={[cat.color, T.cyan]} />
              )}
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Result phase ──
  const qs     = QUESTIONS[selCat];
  const pct    = Math.round((score / qs.length) * 100);
  const cat    = CATEGORIES.find(c => c.id === selCat)!;
  const rating = pct >= 80 ? { label: 'Expert',     color: T.green,  emoji: '🏆' }
               : pct >= 60 ? { label: 'Proficient', color: T.cyan,   emoji: '⭐' }
               : pct >= 40 ? { label: 'Developing', color: T.yellow, emoji: '📈' }
               :             { label: 'Beginner',   color: T.orange, emoji: '🌱' };
  const xpEarned = pct >= 80 ? 100 : pct >= 60 ? 75 : 50;
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#100828', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
          <GCard style={{ padding: 28, alignItems: 'center', marginBottom: 18 }}>
            <Text style={{ fontSize: 58, marginBottom: 10 }}>{rating.emoji}</Text>
            <Text style={{ color: rating.color, fontSize: 22, fontWeight: '800', marginBottom: 4 }}>{rating.label}</Text>
            <Text style={{ color: T.text, fontSize: 54, fontWeight: '900', marginBottom: 6 }}>{pct}%</Text>
            <Text style={{ color: T.muted, fontSize: 14 }}>{score}/{qs.length} correct · {cat.label}</Text>
            <View style={{ flexDirection: 'row', gap: 28, marginTop: 18 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: T.accent, fontSize: 22, fontWeight: '800' }}>+{xpEarned} XP</Text>
                <Text style={{ color: T.muted, fontSize: 11 }}>Earned</Text>
              </View>
              {aiResult?.quantum_score != null && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: T.cyan, fontSize: 22, fontWeight: '800' }}>
                    {Math.round((aiResult.quantum_score ?? 0) * 100)}%
                  </Text>
                  <Text style={{ color: T.muted, fontSize: 11 }}>Q-Score</Text>
                </View>
              )}
            </View>
          </GCard>

          {loading ? (
            <GCard style={{ padding: 24, alignItems: 'center', gap: 12 }}>
              <ActivityIndicator color={T.accent} size="large" />
              <Text style={{ color: T.muted, fontSize: 14 }}>AI analysing your performance...</Text>
            </GCard>
          ) : aiResult && (
            <>
              <GCard style={{ padding: 18, marginBottom: 14 }}>
                <Text style={{ color: T.cyan, fontSize: 10, fontWeight: '700', marginBottom: 10, letterSpacing: 1.5 }}>AI FEEDBACK</Text>
                <Text style={{ color: T.text, fontSize: 14, lineHeight: 22 }}>{aiResult.feedback}</Text>
              </GCard>
              {Array.isArray(aiResult.learning_path) && aiResult.learning_path.length > 0 && (
                <GCard style={{ padding: 18, marginBottom: 18 }}>
                  <Text style={{ color: T.accent, fontSize: 10, fontWeight: '700', marginBottom: 14, letterSpacing: 1.5 }}>YOUR LEARNING PATH</Text>
                  {aiResult.learning_path.map((step: string, i: number) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                      <LinearGradient colors={[T.accent, T.cyan]}
                        style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{i + 1}</Text>
                      </LinearGradient>
                      <Text style={{ color: T.text, fontSize: 14, flex: 1, lineHeight: 21 }}>{step}</Text>
                    </View>
                  ))}
                </GCard>
              )}
            </>
          )}
          <GBtn label="Take Another Assessment" onPress={() => setPhase('pick')} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Progress Tab ──────────────────────────────────────────────────────────────
function ProgressTab() {
  const SKILL_SCORES = [
    { id: 'tech', score: 78 }, { id: 'business', score: 62 }, { id: 'creative', score: 55 },
    { id: 'language', score: 0 }, { id: 'science', score: 45 }, { id: 'leadership', score: 30 },
  ];
  const bars = useRef(SKILL_SCORES.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    SKILL_SCORES.forEach((s, i) =>
      Animated.timing(bars[i], { toValue: s.score / 100, duration: 900 + i * 80, useNativeDriver: false }).start()
    );
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#100828', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
          <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 20 }}>Your Progress 📈</Text>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
            {[{ emoji: '🔥', value: '5', label: 'Day Streak' }, { emoji: '⚡', value: '340', label: 'XP Total' }, { emoji: '📝', value: '8', label: 'Completed' }].map((s, i) => (
              <GCard key={i} style={{ flex: 1, padding: 14, alignItems: 'center' }}>
                <Text style={{ fontSize: 24, marginBottom: 4 }}>{s.emoji}</Text>
                <Text style={{ color: T.text, fontSize: 18, fontWeight: '800' }}>{s.value}</Text>
                <Text style={{ color: T.muted, fontSize: 11, textAlign: 'center' }}>{s.label}</Text>
              </GCard>
            ))}
          </View>

          {/* Skill bars */}
          <GCard style={{ padding: 18, marginBottom: 18 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', marginBottom: 14, letterSpacing: 1.5 }}>SKILL SCORES</Text>
            {SKILL_SCORES.map((s, i) => {
              const cat = CATEGORIES.find(c => c.id === s.id)!;
              return (
                <View key={s.id} style={{ marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: T.text, fontSize: 13, fontWeight: '600' }}>{cat.emoji} {cat.label}</Text>
                    <Text style={{ color: s.score >= 70 ? T.green : s.score >= 40 ? T.yellow : T.muted, fontWeight: '700', fontSize: 13 }}>
                      {s.score > 0 ? `${s.score}%` : 'Not tested'}
                    </Text>
                  </View>
                  <View style={{ height: 7, backgroundColor: T.border, borderRadius: 4 }}>
                    <Animated.View style={{
                      height: 7, borderRadius: 4, backgroundColor: cat.color,
                      width: bars[i].interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    }} />
                  </View>
                </View>
              );
            })}
          </GCard>

          {/* Badges */}
          <Text style={{ color: T.text, fontSize: 17, fontWeight: '700', marginBottom: 14 }}>Achievements</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {BADGES.map((b, i) => (
              <GCard key={i} style={{ width: (SW - 64) / 2, padding: 16, alignItems: 'center', opacity: b.earned ? 1 : 0.38 }}>
                <Text style={{ fontSize: 32, marginBottom: 6 }}>{b.emoji}</Text>
                <Text style={{ color: b.earned ? T.text : T.muted, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>{b.label}</Text>
                {b.earned && (
                  <View style={{ marginTop: 6, backgroundColor: b.color + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ color: b.color, fontSize: 10, fontWeight: '700' }}>EARNED</Text>
                  </View>
                )}
              </GCard>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ navigation }: any) {
  const logout = async () => {
    await AsyncStorage.removeItem('sianlk_t');
    navigation.getParent()?.replace('Auth');
  };
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#100828', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
          <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 22 }}>Profile</Text>
          <GCard style={{ padding: 22, alignItems: 'center', marginBottom: 22 }}>
            <LinearGradient colors={[T.accent, T.cyan]}
              style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 38 }}>🧠</Text>
            </LinearGradient>
            <Text style={{ color: T.text, fontSize: 18, fontWeight: '700' }}>Learner</Text>
            <Text style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>Level 2 · 340 XP · 5 🔥 streak</Text>
          </GCard>
          {[
            { emoji: '🔔', label: 'Notifications',   sub: 'Daily reminders' },
            { emoji: '🎯', label: 'Daily Goal',       sub: '1 assessment per day' },
            { emoji: '🌗', label: 'Appearance',       sub: 'Dark mode' },
            { emoji: '🔒', label: 'Privacy',          sub: 'Data & permissions' },
            { emoji: '❓', label: 'Help & Support',   sub: 'FAQs and tickets' },
            { emoji: '⭐', label: 'Rate AIBLTY',      sub: 'Love the app? Tell us!' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={{ marginBottom: 10 }}>
              <GCard style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: T.border, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.text, fontSize: 14, fontWeight: '600' }}>{item.label}</Text>
                    <Text style={{ color: T.muted, fontSize: 12 }}>{item.sub}</Text>
                  </View>
                  <Text style={{ color: T.muted, fontSize: 18 }}>›</Text>
                </View>
              </GCard>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={logout} style={{ marginTop: 16 }}>
            <GCard style={{ padding: 16, borderColor: T.red + '35' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <Text style={{ fontSize: 20 }}>🚪</Text>
                <Text style={{ color: T.red, fontSize: 15, fontWeight: '700' }}>Sign Out</Text>
              </View>
            </GCard>
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
      <Tab.Screen name="Home"     component={HomeTab}     options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>, tabBarLabel: 'Home' }} />
      <Tab.Screen name="Assess"   component={AssessTab}   options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🧠</Text>, tabBarLabel: 'Assess' }} />
      <Tab.Screen name="Progress" component={ProgressTab} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📈</Text>, tabBarLabel: 'Progress' }} />
      <Tab.Screen name="Profile"  component={ProfileTab}  options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>, tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: T.bg, card: T.card, border: T.border } }}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash"      component={SplashScreen}     />
        <Stack.Screen name="Onboarding"  component={OnboardingScreen} />
        <Stack.Screen name="Auth"        component={AuthScreen}       />
        <Stack.Screen name="Main"        component={MainTabs}         />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
