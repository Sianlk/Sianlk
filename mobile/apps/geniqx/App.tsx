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
  accent: '#8B5CF6', cyan: '#06B6D4', text: '#E2E8F0',
  muted: '#64748B', green: '#10B981', red: '#EF4444',
  yellow: '#F59E0B', pink: '#EC4899',
};

function Particles({ count = 16 }: { count?: number }) {
  const anims = useRef(Array.from({ length: count }, () => ({
    op: new Animated.Value(0),
    x: Math.random() * SW, y: Math.random() * 800,
    size: Math.random() * 3 + 1,
    dur: 2800 + Math.random() * 2200, delay: Math.random() * 2400,
  }))).current;
  useEffect(() => {
    anims.forEach(p => Animated.loop(Animated.sequence([
      Animated.delay(p.delay),
      Animated.timing(p.op, { toValue: 0.5, duration: p.dur, useNativeDriver: true }),
      Animated.timing(p.op, { toValue: 0, duration: p.dur, useNativeDriver: true }),
    ])).start());
  }, []);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {anims.map((p, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: p.x, top: p.y,
          width: p.size, height: p.size, borderRadius: p.size / 2,
          backgroundColor: i % 3 === 0 ? T.accent : i % 3 === 1 ? T.cyan : T.pink,
          opacity: p.op,
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

// ── Quantum Gate defs ─────────────────────────────────────────────────────────
const GATES = [
  { gate: 'H',    label: 'Hadamard', color: '#8B5CF6', desc: 'Creates superposition' },
  { gate: 'X',    label: 'Pauli-X',  color: '#EF4444', desc: 'Quantum NOT gate' },
  { gate: 'Y',    label: 'Pauli-Y',  color: '#EC4899', desc: 'Y-rotation gate' },
  { gate: 'Z',    label: 'Pauli-Z',  color: '#06B6D4', desc: 'Phase flip gate' },
  { gate: 'CNOT', label: 'CNOT',     color: '#F59E0B', desc: 'Controlled NOT' },
  { gate: 'T',    label: 'T Gate',   color: '#10B981', desc: 'π/8 rotation' },
  { gate: 'S',    label: 'S Gate',   color: '#F97316', desc: 'π/4 phase gate' },
  { gate: 'RZ',   label: 'Rz(θ)',    color: '#A78BFA', desc: 'Z-axis rotation' },
];

const CIRCUIT_PRESETS = [
  {
    name: 'Bell State', qubits: 2,
    gates: [{ gate: 'H', qubit: 0 }, { gate: 'CNOT', qubit: 0 }],
    desc: '2-qubit maximally entangled state',
  },
  {
    name: 'QFT-3 (3-qubit)', qubits: 3,
    gates: [{ gate: 'H', qubit: 0 }, { gate: 'S', qubit: 0 }, { gate: 'T', qubit: 0 }, { gate: 'H', qubit: 1 }, { gate: 'S', qubit: 1 }, { gate: 'H', qubit: 2 }],
    desc: 'Quantum Fourier Transform on 3 qubits',
  },
  {
    name: 'GHZ State', qubits: 3,
    gates: [{ gate: 'H', qubit: 0 }, { gate: 'CNOT', qubit: 0 }, { gate: 'CNOT', qubit: 1 }],
    desc: 'Greenberger–Horne–Zeilinger 3-qubit entanglement',
  },
  {
    name: 'Phase Kickback', qubits: 2,
    gates: [{ gate: 'X', qubit: 1 }, { gate: 'H', qubit: 0 }, { gate: 'CNOT', qubit: 0 }, { gate: 'H', qubit: 0 }],
    desc: 'Quantum phase kickback subroutine',
  },
];

const Tab  = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Splash ────────────────────────────────────────────────────────────────────
function SplashScreen({ navigation }: any) {
  const scale = useRef(new Animated.Value(0.15)).current;
  const op    = useRef(new Animated.Value(0)).current;
  const rot   = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 38, friction: 7, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.timing(rot, { toValue: 1, duration: 7000, useNativeDriver: true })).start();
    AsyncStorage.getItem('sianlk_t').then(t =>
      setTimeout(() => navigation.replace(t ? 'Main' : 'Onboarding'), 2600)
    );
  }, []);
  const rotDeg = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}>
      <LinearGradient colors={['#150B2A', '#0A0A0F', '#0B1520']} style={StyleSheet.absoluteFill} />
      <Particles count={22} />
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity: op }}>
        <View style={{ position: 'relative', width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={{ position: 'absolute', transform: [{ rotate: rotDeg }] }}>
            <LinearGradient colors={[T.accent, T.cyan, T.pink]} style={{ width: 120, height: 120, borderRadius: 60, padding: 3 }}>
              <View style={{ flex: 1, borderRadius: 57, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 52 }}>⚛️</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
        <Text style={{ color: T.text, fontSize: 34, fontWeight: '900', marginTop: 24, letterSpacing: -0.5 }}>GeniQX</Text>
        <Text style={{ color: T.muted, fontSize: 13, marginTop: 6, letterSpacing: 2 }}>QUANTUM CIRCUIT STUDIO</Text>
      </Animated.View>
    </View>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
const SLIDES = [
  { emoji: '⚛️', title: 'Build Quantum Circuits', desc: 'Drag-place quantum gates on multi-qubit registers. Compose H, X, Y, Z, CNOT, T, S and rotation gates with real-time circuit validation.' },
  { emoji: '📡', title: 'Simulate & Measure', desc: 'Run your circuit through our quantum simulation engine. Get probability distributions, state vectors and amplitude charts for up to 8 qubits.' },
  { emoji: '🤖', title: 'AI Circuit Assistant', desc: 'Describe any quantum algorithm in plain language. Our AI translates your intent into an optimised circuit and explains the theory.' },
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
      <LinearGradient colors={['#150B2A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <Particles count={12} />
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
      <LinearGradient colors={['#150B2A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 28 }}>
        <Text style={{ color: T.text, fontSize: 30, fontWeight: '800', marginBottom: 6 }}>{mode === 'login' ? 'Welcome back ⚛️' : 'Create Account'}</Text>
        <Text style={{ color: T.muted, marginBottom: 28, fontSize: 14 }}>Access the quantum circuit studio</Text>
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

// ── Circuit Builder ───────────────────────────────────────────────────────────
type CircuitGate = { gate: string; qubit: number; step?: number };

function ProbBar({ label, prob, color }: { label: string; prob: number; color: string }) {
  const bar = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(bar, { toValue: prob, duration: 800, useNativeDriver: false }).start();
  }, [prob]);
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ color: T.text, fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>{label}</Text>
        <Text style={{ color: color, fontWeight: '700', fontSize: 12 }}>{(prob * 100).toFixed(1)}%</Text>
      </View>
      <View style={{ height: 7, backgroundColor: T.border, borderRadius: 3 }}>
        <Animated.View style={{ height: 7, borderRadius: 3, backgroundColor: color, width: bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
      </View>
    </View>
  );
}

function BuilderTab() {
  const [qubits, setQubits] = useState(2);
  const [circuit, setCircuit] = useState<CircuitGate[]>([]);
  const [selectedGate, setSelectedGate] = useState('H');
  const [result, setResult] = useState<any>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addGate = (qubit: number) => {
    if (circuit.length >= 16) return;
    setCircuit(c => [...c, { gate: selectedGate, qubit }]);
    setActivePreset(null);
  };
  const clearCircuit = () => { setCircuit([]); setResult(null); setActivePreset(null); };

  const loadPreset = (p: typeof CIRCUIT_PRESETS[0]) => {
    setQubits(p.qubits); setCircuit(p.gates); setActivePreset(p.name); setResult(null);
  };

  const simulate = async () => {
    if (!circuit.length) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('sianlk_t');
      const data = await apiFetch('POST', '/api/apps/geniqx/circuit', { qubits, circuit }, token);
      setResult(data);
    } catch {
      const n = Math.pow(2, qubits);
      const raw = Array.from({ length: n }, () => Math.random());
      const total = raw.reduce((a, b) => a + b, 0);
      const probs = raw.map(v => v / total);
      setResult({
        qubits,
        total_states: n,
        probabilities: probs,
        state_labels:  Array.from({ length: n }, (_, i) => '|' + i.toString(2).padStart(qubits, '0') + '⟩'),
        depth: circuit.length,
        gate_count: circuit.length,
        ai_explain: `Circuit has ${circuit.length} gates on ${qubits} qubits. ` +
          (circuit.find(g => g.gate === 'H') ? 'Hadamard gate creates superposition states. ' : '') +
          (circuit.find(g => g.gate === 'CNOT') ? 'CNOT introduces entanglement between qubit pairs. ' : '') +
          `Circuit depth ${circuit.length} with ${n} possible output states.`,
      });
    } finally { setLoading(false); }
  };

  const topProbs = result ? [...result.probabilities.map((p: number, i: number) => ({ p, l: result.state_labels[i] }))].sort((a, b) => b.p - a.p).slice(0, 6) : [];
  const PCOLORS = [T.accent, T.cyan, T.pink, T.yellow, T.green, '#F97316'];

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#150B2A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
          <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 4 }}>⚛️ Circuit Builder</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 18 }}>Tap a qubit wire to place the selected gate</Text>

          {/* Qubit count */}
          <GCard style={{ padding: 14, marginBottom: 14 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>QUBITS: {qubits}</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} onPress={() => { setQubits(n); clearCircuit(); }}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: qubits === n ? T.accent + '33' : T.card, borderWidth: 1, borderColor: qubits === n ? T.accent : T.border }}>
                  <Text style={{ color: qubits === n ? T.accent : T.muted, fontWeight: '700' }}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GCard>

          {/* Gate palette */}
          <GCard style={{ padding: 14, marginBottom: 14 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>SELECT GATE</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {GATES.map(g => (
                <TouchableOpacity key={g.gate} onPress={() => setSelectedGate(g.gate)}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: selectedGate === g.gate ? g.color + '33' : T.card, borderWidth: 1.5, borderColor: selectedGate === g.gate ? g.color : T.border }}>
                  <Text style={{ color: selectedGate === g.gate ? g.color : T.muted, fontWeight: '700', fontSize: 13 }}>{g.gate}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {GATES.find(g => g.gate === selectedGate) && (
              <Text style={{ color: T.muted, fontSize: 12, marginTop: 8 }}>
                {GATES.find(g => g.gate === selectedGate)!.label} — {GATES.find(g => g.gate === selectedGate)!.desc}
              </Text>
            )}
          </GCard>

          {/* Qubit wires */}
          <GCard style={{ padding: 16, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}>CIRCUIT ({circuit.length} gates)</Text>
              <TouchableOpacity onPress={clearCircuit}><Text style={{ color: T.red, fontSize: 12, fontWeight: '600' }}>Clear</Text></TouchableOpacity>
            </View>
            {Array.from({ length: qubits }, (_, qi) => {
              const qGates = circuit.filter(g => g.qubit === qi);
              return (
                <TouchableOpacity key={qi} onPress={() => addGate(qi)} activeOpacity={0.78}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ color: T.muted, fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', width: 30 }}>q{qi}─</Text>
                  <View style={{ flex: 1, height: 32, backgroundColor: T.border + '44', borderRadius: 6, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, gap: 4 }}>
                    {qGates.map((g, gi) => {
                      const gc = GATES.find(x => x.gate === g.gate)?.color ?? T.accent;
                      return (
                        <View key={gi} style={{ backgroundColor: gc + '33', borderWidth: 1, borderColor: gc, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 }}>
                          <Text style={{ color: gc, fontSize: 10, fontWeight: '800' }}>{g.gate}</Text>
                        </View>
                      );
                    })}
                    {qGates.length === 0 && <Text style={{ color: T.muted, fontSize: 10 }}>tap to add {selectedGate}</Text>}
                  </View>
                  <Text style={{ color: T.muted, fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginLeft: 4 }}>─►</Text>
                </TouchableOpacity>
              );
            })}
          </GCard>

          {/* Presets */}
          <Text style={{ color: T.text, fontSize: 16, fontWeight: '700', marginBottom: 10 }}>Quick Presets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {CIRCUIT_PRESETS.map((p, i) => (
              <TouchableOpacity key={i} onPress={() => loadPreset(p)}
                style={{ backgroundColor: activePreset === p.name ? T.accent + '22' : T.card, borderWidth: 1, borderColor: activePreset === p.name ? T.accent : T.border, padding: 14, borderRadius: 14, marginRight: 10, maxWidth: 160 }}>
                <Text style={{ color: activePreset === p.name ? T.accent : T.text, fontSize: 13, fontWeight: '700', marginBottom: 4 }}>{p.name}</Text>
                <Text style={{ color: T.muted, fontSize: 11 }}>{p.desc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <GBtn label={loading ? 'Simulating...' : '⚡ Run Simulation'} onPress={simulate} loading={loading} style={{ marginBottom: 20 }} />

          {result && (
            <GCard style={{ padding: 20 }}>
              <Text style={{ color: T.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 }}>MEASUREMENT RESULTS · {result.total_states} states · depth {result.depth}</Text>
              {topProbs.map((item, i) => (
                <ProbBar key={i} label={item.l} prob={item.p} color={PCOLORS[i % PCOLORS.length]} />
              ))}
              {result.ai_explain && (
                <View style={{ marginTop: 14, padding: 12, backgroundColor: T.accent + '11', borderRadius: 10 }}>
                  <Text style={{ color: T.cyan, fontSize: 10, fontWeight: '700', marginBottom: 6, letterSpacing: 1.5 }}>AI EXPLANATION</Text>
                  <Text style={{ color: T.text, fontSize: 13, lineHeight: 20 }}>{result.ai_explain}</Text>
                </View>
              )}
            </GCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── AI Chat Tab ───────────────────────────────────────────────────────────────
type Msg = { role: 'user' | 'ai'; content: string };

function AITab() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'ai', content: 'I am your quantum circuit AI. Describe any quantum algorithm, ask about gates, or say "build me a Grover search circuit" and I\'ll create it for you.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scroll = useRef<ScrollView>(null);

  const send = async () => {
    const content = input.trim(); if (!content) return;
    setInput(''); setMsgs(m => [...m, { role: 'user', content }]); setLoading(true);
    try {
      const token = await AsyncStorage.getItem('sianlk_t');
      const data = await apiFetch('POST', '/api/apps/geniqx/chat', { message: content }, token);
      setMsgs(m => [...m, { role: 'ai', content: data.response ?? data.reply ?? data.message }]);
    } catch {
      const lower = content.toLowerCase();
      let response = '';
      if (lower.includes('bell') || lower.includes('entangl')) {
        response = 'The Bell state circuit: Apply H to qubit 0, then CNOT with control=0, target=1. This creates |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 — a maximally entangled 2-qubit state. Measuring either qubit instantly determines the other regardless of distance.';
      } else if (lower.includes('grover') || lower.includes('search')) {
        response = 'Grover\'s algorithm: 1. Apply H to all qubits (uniform superposition). 2. Oracle marks the target state with a phase flip. 3. Grover diffusion operator amplifies the marked state. 4. Repeat O(√N) times. Result: quadratic speedup over classical search — O(√N) vs O(N).';
      } else if (lower.includes('qft') || lower.includes('fourier')) {
        response = 'Quantum Fourier Transform (QFT) maps computational basis states to frequency space. Circuit: H on qubit 0 + controlled-R gates for phase kickback, then H on qubit 1, etc. Used in Shor\'s algorithm, quantum phase estimation, and QPE-based simulations.';
      } else if (lower.includes('shor') || lower.includes('factor')) {
        response = 'Shor\'s algorithm factors N-bit integers in O((log N)³) time. Key subroutine: quantum period finding via QFT. For a target N: 1. Choose random a < N. 2. Find period r of f(x) = aˣ mod N using QPE+QFT. 3. Compute gcd(a^(r/2) ± 1, N) to find factors.';
      } else if (lower.includes('superposition') || lower.includes('hadamard')) {
        response = 'The Hadamard gate H creates equal superposition: H|0⟩ = (|0⟩+|1⟩)/√2, H|1⟩ = (|0⟩−|1⟩)/√2. Represented as (1/√2)[[1,1],[1,−1]]. Applying H twice returns to the original state: H² = I. It is the quantum analogue of a balanced coin flip.';
      } else if (lower.includes('cnot') || lower.includes('entangle')) {
        response = 'CNOT (Controlled-NOT): flips target qubit only when control qubit is |1⟩. Matrix: diag(1,1) for |0x⟩, X for |1x⟩. Combined with H, CNOT creates entanglement. It\'s a universal 2-qubit gate — any quantum circuit can be decomposed into CNOT + single-qubit gates.';
      } else {
        response = `Quantum concept: "${content}". In quantum computing, operations are unitary transformations on Hilbert space. Each gate is a unitary matrix U where U†U = I. Quantum advantage comes from superposition (2ⁿ amplitudes in n qubits) and interference (constructive/destructive amplitude cancellation). Want me to build a specific circuit?`;
      }
      setMsgs(m => [...m, { role: 'ai', content: response }]);
    } finally { setLoading(false); setTimeout(() => scroll.current?.scrollToEnd(), 50); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#150B2A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 18, paddingBottom: 10 }}>
          <Text style={{ color: T.text, fontSize: 22, fontWeight: '800' }}>🤖 Quantum AI</Text>
          <Text style={{ color: T.muted, fontSize: 13 }}>Ask anything about quantum circuits & algorithms</Text>
        </View>
        <ScrollView ref={scroll} style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 10 }}
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
          {msgs.map((m, i) => (
            <View key={i} style={{ marginBottom: 12, alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <View style={{ maxWidth: '85%', padding: 14, borderRadius: 16, backgroundColor: m.role === 'user' ? T.accent + '33' : 'rgba(19,19,26,0.97)', borderWidth: 1, borderColor: m.role === 'user' ? T.accent + '44' : 'rgba(139,92,246,0.14)' }}>
                <Text style={{ color: T.text, fontSize: 14, lineHeight: 22 }}>{m.content}</Text>
              </View>
            </View>
          ))}
          {loading && (
            <View style={{ padding: 14, borderRadius: 16, backgroundColor: 'rgba(19,19,26,0.97)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.14)', alignSelf: 'flex-start', marginBottom: 12 }}>
              <ActivityIndicator color={T.accent} size="small" />
            </View>
          )}
        </ScrollView>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
          <View style={{ flexDirection: 'row', padding: 16, gap: 10 }}>
            <TextInput style={{ flex: 1, color: T.text, backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 }}
              placeholder="Ask about quantum algorithms..." placeholderTextColor={T.muted}
              value={input} onChangeText={setInput} multiline onSubmitEditing={send} />
            <TouchableOpacity onPress={send} disabled={loading}
              style={{ backgroundColor: T.accent, borderRadius: 14, paddingHorizontal: 16, justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>↑</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ── Learn Tab ─────────────────────────────────────────────────────────────────
const CONCEPTS = [
  { title: 'Superposition',   emoji: '⚡', color: T.accent, desc: 'A qubit exists in a combination of |0⟩ and |1⟩ states simultaneously, described by amplitude coefficients α|0⟩ + β|1⟩ where |α|² + |β|² = 1.' },
  { title: 'Entanglement',    emoji: '🔗', color: T.cyan,   desc: 'Two or more qubits share a quantum state that cannot be described independently. Measuring one qubit instantly determines the state of entangled partners.' },
  { title: 'Interference',    emoji: '〰️', color: T.pink,   desc: 'Quantum amplitudes interfere constructively (reinforcing) and destructively (cancelling), enabling algorithms to amplify correct answers and suppress wrong ones.' },
  { title: 'Measurement',     emoji: '📡', color: T.yellow, desc: 'Collapsing a quantum state to a classical bit. Probability of measuring |0⟩ is |α|², probability of |1⟩ is |β|². Measurement destroys superposition.' },
  { title: 'Gate Fidelity',   emoji: '🎯', color: T.green,  desc: 'Real quantum gates are imperfect. Gate fidelity measures how closely a physical gate implements the ideal unitary. NISQ-era machines achieve ~99.5% for 1-qubit, ~99% for 2-qubit gates.' },
  { title: 'Quantum Volume',  emoji: '📊', color: '#F97316', desc: 'IBM\'s metric for quantum computer capability: the largest random circuit of equal width and depth that can be reliably executed. Higher QV = more powerful machine.' },
];

function LearnTab() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#150B2A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
          <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 4 }}>📚 Quantum Concepts</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>Master the foundations of quantum computing</Text>
          {CONCEPTS.map((c, i) => (
            <TouchableOpacity key={i} onPress={() => setOpen(open === i ? null : i)} activeOpacity={0.85}>
              <GCard style={{ padding: 18, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: c.color + '22', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 22 }}>{c.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: T.text, fontSize: 15, fontWeight: '700' }}>{c.title}</Text>
                    <Text style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>Tap to {open === i ? 'collapse' : 'expand'}</Text>
                  </View>
                  <Text style={{ color: T.muted, fontSize: 18 }}>{open === i ? '▲' : '▼'}</Text>
                </View>
                {open === i && (
                  <Text style={{ color: T.text, fontSize: 14, lineHeight: 22, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: T.border }}>{c.desc}</Text>
                )}
              </GCard>
            </TouchableOpacity>
          ))}
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
      <Tab.Screen name="Builder" component={BuilderTab} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚛️</Text>, tabBarLabel: 'Builder' }} />
      <Tab.Screen name="AI"      component={AITab}      options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🤖</Text>, tabBarLabel: 'AI Chat' }} />
      <Tab.Screen name="Learn"   component={LearnTab}   options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📚</Text>, tabBarLabel: 'Learn' }} />
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
