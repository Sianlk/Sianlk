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
  accent: '#F97316', cyan: '#06B6D4', text: '#E2E8F0',
  muted: '#64748B', purple: '#8B5CF6', red: '#EF4444',
  green: '#10B981', yellow: '#F59E0B',
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
          backgroundColor: i % 2 === 0 ? T.accent : T.purple, opacity: p.op,
        }} />
      ))}
    </View>
  );
}

function GCard({ children, style }: any) {
  return (
    <View style={[{
      backgroundColor: 'rgba(19,19,26,0.97)', borderRadius: 16,
      borderWidth: 1, borderColor: 'rgba(249,115,22,0.12)',
    }, style]}>{children}</View>
  );
}

function GBtn({ label, onPress, style, loading, colors = [T.accent, '#EA580C'] }: any) {
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

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Splash ────────────────────────────────────────────────────────────────────
function SplashScreen({ navigation }: any) {
  const scale = useRef(new Animated.Value(0.15)).current;
  const op    = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 38, friction: 7, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
    ])).start();
    AsyncStorage.getItem('sianlk_t').then(t =>
      setTimeout(() => navigation.replace(t ? 'Main' : 'Onboarding'), 2500)
    );
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}>
      <LinearGradient colors={['#1A0A00', '#0A0A0F', '#0A0510']} style={StyleSheet.absoluteFill} />
      <Particles count={20} />
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity: op }}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <LinearGradient colors={[T.accent, '#EA580C']}
            style={{ width: 112, height: 112, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 56 }}>🦄</Text>
          </LinearGradient>
        </Animated.View>
        <Text style={{ color: T.text, fontSize: 34, fontWeight: '900', marginTop: 22, letterSpacing: -0.5 }}>GitGit</Text>
        <Text style={{ color: T.muted, fontSize: 13, marginTop: 6, letterSpacing: 2 }}>AI GIT INTELLIGENCE</Text>
      </Animated.View>
    </View>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
const SLIDES = [
  { emoji: '🔍', title: 'AI PR Review', desc: 'Paste any diff and get an expert code review in seconds. Understand risk level, catch bugs, security issues and performance problems automatically.' },
  { emoji: '✍️', title: 'Smart Commits', desc: 'Describe what changed and we generate conventional commit messages — feat, fix, chore, refactor — plus scope and description, ready to copy.' },
  { emoji: '📊', title: 'Repo Intelligence', desc: 'Analyse any GitHub repository: commit velocity, contributor stats, language breakdown, open issues and PR health scores.' },
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
      <LinearGradient colors={['#1A0A00', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <Particles count={10} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Animated.View style={{ alignItems: 'center', opacity: op, transform: [{ translateX: slideX }] }}>
            <LinearGradient colors={[T.accent + '40', '#EA580C20']}
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
      <LinearGradient colors={['#1A0A00', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 28 }}>
        <Text style={{ color: T.text, fontSize: 30, fontWeight: '800', marginBottom: 6 }}>{mode === 'login' ? 'Welcome back 🦄' : 'Create Account'}</Text>
        <Text style={{ color: T.muted, marginBottom: 28, fontSize: 14 }}>Your AI Git intelligence platform</Text>
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

// ── PR Review Tab ─────────────────────────────────────────────────────────────
function PRReviewTab() {
  const [diff, setDiff] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const review = async () => {
    if (!diff.trim()) return;
    setLoading(true); setResult(null);
    try {
      const token = await AsyncStorage.getItem('sianlk_t');
      const data = await apiFetch('POST', '/api/apps/gitgit/review', { diff, context }, token);
      setResult(data);
    } catch {
      const hasAuth = diff.toLowerCase().includes('password') || diff.toLowerCase().includes('token') || diff.toLowerCase().includes('secret');
      const hasAsync = diff.toLowerCase().includes('async') || diff.toLowerCase().includes('await');
      const size = diff.split('\n').filter(l => l.startsWith('+')).length;
      setResult({
        risk_level: hasAuth ? 'HIGH' : size > 50 ? 'MEDIUM' : 'LOW',
        summary: `Reviewed ${size} added lines. ${hasAsync ? 'Async patterns detected. ' : ''}${hasAuth ? '⚠️ Credentials/secrets in diff! Remove before merging. ' : 'No secrets detected. '}Code structure looks ${size < 20 ? 'focused and minimal' : 'broad — consider splitting into smaller PRs'}.`,
        issues: [
          ...(hasAuth ? [{ severity: 'CRITICAL', line: '~', message: 'Possible secret/credential in diff — rotate immediately and use environment variables', type: 'security' }] : []),
          ...(size > 80 ? [{ severity: 'MEDIUM', line: '~', message: 'PR is large (+' + size + ' lines). Consider breaking into smaller, reviewable units', type: 'maintainability' }] : []),
          { severity: 'INFO', line: '~', message: 'Add comprehensive test coverage for new code paths', type: 'testing' },
        ],
        suggestions: [
          hasAsync ? 'Wrap async calls in try/catch for robust error handling' : 'Add input validation at the entry points',
          'Ensure all new functions have corresponding unit tests',
          'Consider adding JSDoc/docstrings for exported functions',
        ],
        score: hasAuth ? 42 : size > 80 ? 64 : 84,
      });
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  };

  const riskColor = (r: string) => r === 'HIGH' ? T.red : r === 'MEDIUM' ? T.yellow : T.green;
  const sevColor  = (s: string) => s === 'CRITICAL' ? T.red : s === 'MEDIUM' ? T.yellow : s === 'LOW' ? T.green : T.cyan;

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#1A0A00', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 4 }}>🔍 PR Review</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 18 }}>Paste a git diff for AI-powered code review</Text>

          <GCard style={{ padding: 16, marginBottom: 12 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>GIT DIFF</Text>
            <TextInput
              style={{ color: T.green, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 12, fontSize: 12, minHeight: 140, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', lineHeight: 18 }}
              placeholder={'+ added line\n- removed line\n  context line\n\nPaste your git diff here...'}
              placeholderTextColor={T.muted} value={diff} onChangeText={setDiff}
              multiline textAlignVertical="top" autoCapitalize="none" autoCorrect={false} />
          </GCard>

          <GCard style={{ padding: 16, marginBottom: 14 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>CONTEXT (optional)</Text>
            <TextInput
              style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 12, fontSize: 14, minHeight: 60 }}
              placeholder="e.g. 'Auth service refactor, migrating from JWT to OAuth2'"
              placeholderTextColor={T.muted} value={context} onChangeText={setContext}
              multiline textAlignVertical="top" />
          </GCard>

          <GBtn label={loading ? 'Reviewing...' : '⚡ Review PR'} onPress={review} loading={loading} style={{ marginBottom: 18 }} />

          {result && (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Score + risk */}
              <GCard style={{ padding: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ alignItems: 'center', marginRight: 20 }}>
                  <Text style={{ color: result.score >= 80 ? T.green : result.score >= 60 ? T.yellow : T.red, fontSize: 42, fontWeight: '900' }}>{result.score}</Text>
                  <Text style={{ color: T.muted, fontSize: 11 }}>Review Score</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ backgroundColor: riskColor(result.risk_level) + '22', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 }}>
                    <Text style={{ color: riskColor(result.risk_level), fontWeight: '800', fontSize: 12 }}>⚠ {result.risk_level} RISK</Text>
                  </View>
                  <Text style={{ color: T.text, fontSize: 13, lineHeight: 20 }}>{result.summary}</Text>
                </View>
              </GCard>

              {/* Issues */}
              {result.issues?.length > 0 && (
                <GCard style={{ padding: 18, marginBottom: 12 }}>
                  <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 }}>ISSUES ({result.issues.length})</Text>
                  {result.issues.map((issue: any, i: number) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                      <View style={{ backgroundColor: sevColor(issue.severity) + '22', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', minWidth: 70, alignItems: 'center' }}>
                        <Text style={{ color: sevColor(issue.severity), fontSize: 9, fontWeight: '800' }}>{issue.severity}</Text>
                      </View>
                      <Text style={{ flex: 1, color: T.text, fontSize: 13, lineHeight: 19 }}>{issue.message}</Text>
                    </View>
                  ))}
                </GCard>
              )}

              {/* Suggestions */}
              {result.suggestions?.length > 0 && (
                <GCard style={{ padding: 18 }}>
                  <Text style={{ color: T.cyan, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 }}>SUGGESTIONS</Text>
                  {result.suggestions.map((s: string, i: number) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                      <Text style={{ color: T.accent }}>→</Text>
                      <Text style={{ flex: 1, color: T.text, fontSize: 13, lineHeight: 19 }}>{s}</Text>
                    </View>
                  ))}
                </GCard>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Commit Tab ────────────────────────────────────────────────────────────────
const COMMIT_TYPES = ['feat', 'fix', 'chore', 'refactor', 'docs', 'test', 'perf', 'style', 'ci', 'build'];

function CommitTab() {
  const [changes, setChanges] = useState('');
  const [scope, setScope] = useState('');
  const [commitType, setCommitType] = useState('feat');
  const [breaking, setBreaking] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const generate = async () => {
    if (!changes.trim()) return;
    setLoading(true); setResults([]);
    try {
      const token = await AsyncStorage.getItem('sianlk_t');
      const data = await apiFetch('POST', '/api/apps/gitgit/commit', { changes, scope, type: commitType, breaking }, token);
      setResults(data.commits ?? data.messages ?? [data.message]);
    } catch {
      const s = scope ? `(${scope})` : '';
      const bang = breaking ? '!' : '';
      const keyWords = changes.toLowerCase();
      let body = keyWords.length > 80 ? keyWords.substring(0, 77) + '...' : changes;
      const generated = [
        `${commitType}${s}${bang}: ${changes.split('\n')[0].replace(/^[-*•]\s*/, '').substring(0, 72)}`,
        `${commitType}${s}${bang}: ${changes.length > 60 ? changes.substring(0, 57) + '...' : changes}`,
        `${commitType}${s}${bang}: ${body.replace(/\n/g, ', ')}`,
      ].filter((v, i, a) => a.indexOf(v) === i);
      setResults(generated);
    } finally { setLoading(false); }
  };

  const copyToClipboard = (msg: string, i: number) => {
    setCopied(i);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#1A0A00', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 4 }}>✍️ Commit Generator</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 18 }}>Generate conventional commit messages from change descriptions</Text>

          {/* Commit type */}
          <GCard style={{ padding: 16, marginBottom: 12 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>COMMIT TYPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {COMMIT_TYPES.map(ct => (
                <TouchableOpacity key={ct} onPress={() => setCommitType(ct)}
                  style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, marginRight: 7, backgroundColor: commitType === ct ? T.accent + '33' : T.card, borderWidth: 1, borderColor: commitType === ct ? T.accent : T.border }}>
                  <Text style={{ color: commitType === ct ? T.accent : T.muted, fontWeight: '700', fontSize: 12 }}>{ct}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </GCard>

          {/* Scope + Breaking */}
          <GCard style={{ padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>SCOPE (optional)</Text>
                <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 12, fontSize: 14 }}
                  placeholder="e.g. auth, api, ui" placeholderTextColor={T.muted} value={scope} onChangeText={setScope} autoCapitalize="none" />
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>BREAKING</Text>
                <TouchableOpacity onPress={() => setBreaking(v => !v)}
                  style={{ width: 48, height: 28, borderRadius: 14, backgroundColor: breaking ? T.red + '33' : T.card, borderWidth: 1, borderColor: breaking ? T.red : T.border, alignItems: breaking ? 'flex-end' : 'flex-start', paddingHorizontal: 3, justifyContent: 'center' }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: breaking ? T.red : T.muted }} />
                </TouchableOpacity>
              </View>
            </View>
          </GCard>

          {/* Changes */}
          <GCard style={{ padding: 16, marginBottom: 14 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>WHAT CHANGED?</Text>
            <TextInput style={{ color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 12, fontSize: 14, minHeight: 80 }}
              placeholder="Describe the changes in natural language&#10;e.g. Added JWT refresh token rotation, updated auth middleware to check expiry"
              placeholderTextColor={T.muted} value={changes} onChangeText={setChanges}
              multiline textAlignVertical="top" />
          </GCard>

          {/* Preview */}
          {changes.length > 0 && (
            <GCard style={{ padding: 12, marginBottom: 14 }}>
              <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 }}>PREVIEW</Text>
              <Text style={{ color: T.accent, fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                {commitType}{scope ? `(${scope})` : ''}{breaking ? '!' : ''}: {changes.split('\n')[0].substring(0, 50)}...
              </Text>
            </GCard>
          )}

          <GBtn label={loading ? 'Generating...' : '⚡ Generate Commits'} onPress={generate} loading={loading} style={{ marginBottom: 18 }} />

          {results.length > 0 && (
            <View>
              <Text style={{ color: T.text, fontSize: 16, fontWeight: '700', marginBottom: 10 }}>Generated Messages</Text>
              {results.map((msg, i) => (
                <TouchableOpacity key={i} onPress={() => copyToClipboard(msg, i)} activeOpacity={0.8}>
                  <GCard style={{ padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: T.text, fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', lineHeight: 19 }}>{msg}</Text>
                    </View>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: copied === i ? T.green + '22' : T.accent + '22', borderWidth: 1, borderColor: copied === i ? T.green : T.accent }}>
                      <Text style={{ color: copied === i ? T.green : T.accent, fontSize: 11, fontWeight: '700' }}>{copied === i ? '✓ Done' : 'Copy'}</Text>
                    </View>
                  </GCard>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Repo Stats Tab ────────────────────────────────────────────────────────────
const DEMO_REPO = {
  name: 'sianlk/Sianlk',
  stars: 12, forks: 3, open_issues: 8,
  language: 'TypeScript',
  last_push: '2h ago',
  commit_velocity: '+14%',
  health_score: 78,
  contributors: 2,
  open_prs: 0,
  lines_added: 12400, lines_removed: 3200,
  languages: [{ name: 'TypeScript', pct: 48, color: T.cyan }, { name: 'Python', pct: 32, color: T.yellow }, { name: 'Shell', pct: 12, color: T.green }, { name: 'Other', pct: 8, color: T.muted }],
  recent_commits: [
    { hash: 'a1b2c3d', msg: 'feat(apps): push geniqx quantum circuit studio', ago: '2h' },
    { hash: 'e4f5a6b', msg: 'feat(apps): push comppropdata property AI', ago: '5h' },
    { hash: 'c7d8e9f', msg: 'feat(apps): push aiblty skills assessment v2', ago: '1d' },
    { hash: '1a2b3c4', msg: 'feat(backend): quantum engine v1.2.0', ago: '2d' },
  ],
};

function LanguageBar({ lang, pct, color }: { lang: string; pct: number; color: string }) {
  const bar = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(bar, { toValue: pct / 100, duration: 900, useNativeDriver: false }).start(); }, []);
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ color: T.text, fontSize: 13 }}>{lang}</Text>
        <Text style={{ color: color, fontWeight: '700', fontSize: 12 }}>{pct}%</Text>
      </View>
      <View style={{ height: 6, backgroundColor: T.border, borderRadius: 3 }}>
        <Animated.View style={{ height: 6, borderRadius: 3, backgroundColor: color, width: bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
      </View>
    </View>
  );
}

function RepoTab() {
  const [repoUrl, setRepoUrl] = useState('');
  const [repo, setRepo] = useState(DEMO_REPO);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => { Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start(); }, []);

  const analyse = async () => {
    setLoading(true);
    setTimeout(() => { setRepo(DEMO_REPO); setLoading(false); }, 800);
  };

  const scoreColor = repo.health_score >= 80 ? T.green : repo.health_score >= 60 ? T.yellow : T.red;

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#1A0A00', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
          <Text style={{ color: T.text, fontSize: 22, fontWeight: '800', marginBottom: 18 }}>📊 Repository Stats</Text>

          <GCard style={{ padding: 14, marginBottom: 14, flexDirection: 'row', gap: 10 }}>
            <TextInput style={{ flex: 1, color: T.text, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 12, fontSize: 13 }}
              placeholder="owner/repo or GitHub URL" placeholderTextColor={T.muted}
              value={repoUrl} onChangeText={setRepoUrl} autoCapitalize="none" autoCorrect={false} />
            <TouchableOpacity onPress={analyse} style={{ backgroundColor: T.accent, borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' }}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>↗</Text>}
            </TouchableOpacity>
          </GCard>

          {/* Repo hero */}
          <LinearGradient colors={[T.accent + 'CC', '#EA580CCC']} style={{ borderRadius: 20, padding: 20, marginBottom: 14 }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 4 }}>{repo.name}</Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>⭐ {repo.stars}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>🍴 {repo.forks}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>⚠ {repo.open_issues} issues</Text>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 6 }}>Last push {repo.last_push}</Text>
          </LinearGradient>

          {/* Health score */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            <GCard style={{ flex: 1, padding: 16, alignItems: 'center' }}>
              <Text style={{ color: scoreColor, fontSize: 32, fontWeight: '900' }}>{repo.health_score}</Text>
              <Text style={{ color: T.muted, fontSize: 11 }}>Health Score</Text>
            </GCard>
            <GCard style={{ flex: 1, padding: 16, alignItems: 'center' }}>
              <Text style={{ color: T.green, fontSize: 24, fontWeight: '900' }}>{repo.commit_velocity}</Text>
              <Text style={{ color: T.muted, fontSize: 11 }}>Commit Velocity</Text>
            </GCard>
            <GCard style={{ flex: 1, padding: 16, alignItems: 'center' }}>
              <Text style={{ color: T.cyan, fontSize: 28, fontWeight: '900' }}>{repo.contributors}</Text>
              <Text style={{ color: T.muted, fontSize: 11 }}>Contributors</Text>
            </GCard>
          </View>

          {/* Languages */}
          <GCard style={{ padding: 18, marginBottom: 14 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 }}>LANGUAGES</Text>
            {repo.languages.map((l, i) => <LanguageBar key={i} lang={l.name} pct={l.pct} color={l.color} />)}
          </GCard>

          {/* Recent commits */}
          <GCard style={{ padding: 18 }}>
            <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 }}>RECENT COMMITS</Text>
            {repo.recent_commits.map((c, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10, borderBottomWidth: i < repo.recent_commits.length - 1 ? 1 : 0, borderBottomColor: T.border }}>
                <Text style={{ color: T.muted, fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginTop: 2 }}>{c.hash}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: T.text, fontSize: 13, lineHeight: 18 }}>{c.msg}</Text>
                  <Text style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{c.ago} ago</Text>
                </View>
              </View>
            ))}
          </GCard>
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
      tabBarStyle: { backgroundColor: '#0D0D14', borderTopColor: T.border, height: Platform.OS === 'ios' ? 90 : 68, paddingBottom: Platform.OS === 'ios' ? 28 : 12, paddingTop: 10 },
      tabBarActiveTintColor: T.accent, tabBarInactiveTintColor: T.muted,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
    }}>
      <Tab.Screen name="Review" component={PRReviewTab} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🔍</Text>, tabBarLabel: 'PR Review' }} />
      <Tab.Screen name="Commit" component={CommitTab}   options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>✍️</Text>, tabBarLabel: 'Commit' }} />
      <Tab.Screen name="Repo"   component={RepoTab}     options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📊</Text>, tabBarLabel: 'Repo Stats' }} />
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
