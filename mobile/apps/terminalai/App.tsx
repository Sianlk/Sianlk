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
  bg: '#050A05', card: '#0C150C', border: '#162016',
  accent: '#34D399', cyan: '#06B6D4', text: '#D1FAE5',
  muted: '#4B7A5C', purple: '#8B5CF6', red: '#EF4444',
  yellow: '#F59E0B', dimText: '#86EFAC',
};

function Particles({ count = 12 }: { count?: number }) {
  const anims = useRef(Array.from({ length: count }, () => ({
    op: new Animated.Value(0),
    x: Math.random() * SW, y: Math.random() * 800,
    size: Math.random() * 2.5 + 1,
    dur: 3000 + Math.random() * 2000, delay: Math.random() * 2600,
  }))).current;
  useEffect(() => {
    anims.forEach(p => Animated.loop(Animated.sequence([
      Animated.delay(p.delay),
      Animated.timing(p.op, { toValue: 0.45, duration: p.dur, useNativeDriver: true }),
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

const MONO = Platform.OS === 'ios' ? 'Courier' : 'monospace';

function TermCard({ children, style }: any) {
  return (
    <View style={[{
      backgroundColor: 'rgba(12,21,12,0.98)', borderRadius: 14,
      borderWidth: 1, borderColor: 'rgba(52,211,153,0.18)',
    }, style]}>{children}</View>
  );
}

function GBtn({ label, onPress, style, loading }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.82}>
      <LinearGradient colors={[T.accent, '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 }}>
        {loading ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={{ color: '#052010', fontWeight: '800', fontSize: 15, fontFamily: MONO }}>{label}</Text>}
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

// ── Command knowledge base ────────────────────────────────────────────────────
const CMD_KNOWLEDGE: Record<string, { title: string; desc: string; flags: { flag: string; desc: string }[]; examples: string[]; risk?: string }> = {
  'rm -rf': {
    title: 'Remove Recursively Force', risk: 'DESTRUCTIVE',
    desc: 'Permanently deletes files and directories recursively without prompting. Cannot be undone! Use with extreme caution.',
    flags: [{ flag: '-r', desc: 'Recursive — remove directories and contents' }, { flag: '-f', desc: 'Force — no prompts, ignore nonexistent files' }],
    examples: ['rm -rf /tmp/cache', 'rm -rf node_modules', 'rm -rf ./dist'],
  },
  'git': {
    title: 'Git Version Control',
    desc: 'Distributed version control system for tracking changes in source code.',
    flags: [{ flag: 'status', desc: 'Show working tree status' }, { flag: 'log --oneline', desc: 'Compact commit history' }, { flag: 'diff HEAD~1', desc: 'Diff vs previous commit' }],
    examples: ['git log --oneline -10', 'git stash list', 'git bisect start'],
  },
  'docker': {
    title: 'Docker Container Engine',
    desc: 'Build, ship and run containerised applications.',
    flags: [{ flag: 'ps -a', desc: 'List all containers (including stopped)' }, { flag: 'images', desc: 'List all local images' }, { flag: 'system prune', desc: 'Remove unused data' }],
    examples: ['docker ps -a --format "table {{.Names}}\t{{.Status}}"', 'docker stats --no-stream', 'docker exec -it <id> bash'],
  },
  'kubectl': {
    title: 'Kubernetes CLI',
    desc: 'Command-line tool for controlling Kubernetes clusters.',
    flags: [{ flag: 'get pods -A', desc: 'All pods across all namespaces' }, { flag: 'describe pod <name>', desc: 'Detailed pod info' }, { flag: 'logs -f <pod>', desc: 'Follow pod logs' }],
    examples: ['kubectl get svc --all-namespaces', 'kubectl apply -f manifest.yaml', 'kubectl rollout restart deploy/<name>'],
  },
  'curl': {
    title: 'cURL Data Transfer',
    desc: 'Transfer data using various protocols. Essential for API testing.',
    flags: [{ flag: '-X POST', desc: 'HTTP method (GET, POST, PUT, DELETE)' }, { flag: '-H', desc: 'Set request header' }, { flag: '-d', desc: 'Request body data' }, { flag: '-o', desc: 'Output to file' }],
    examples: ['curl -s https://api.example.com/health | jq', 'curl -X POST -H "Content-Type: application/json" -d \'{"key":"val"}\' https://api/endpoint'],
  },
  'grep': {
    title: 'Global Regular Expression Print',
    desc: 'Search for patterns in files using regular expressions.',
    flags: [{ flag: '-r', desc: 'Recursive search in directories' }, { flag: '-i', desc: 'Case-insensitive' }, { flag: '-n', desc: 'Show line numbers' }, { flag: '-E', desc: 'Extended regex' }],
    examples: ['grep -rn "TODO" ./src', 'grep -E "ERROR|WARN" app.log | tail -50', 'grep -v "^#" config.txt'],
  },
  'ssh': {
    title: 'Secure Shell',
    desc: 'Cryptographic network protocol for secure remote access and tunnelling.',
    flags: [{ flag: '-i', desc: 'Identity file (private key)' }, { flag: '-p', desc: 'Port number' }, { flag: '-L', desc: 'Local port forwarding' }, { flag: '-N', desc: 'No remote command (tunnel only)' }],
    examples: ['ssh -i ~/.ssh/id_rsa user@host', 'ssh -L 5432:localhost:5432 db-host', 'ssh -N -f -L 8080:internal:80 jump-host'],
  },
  'awk': {
    title: 'AWK Text Processor',
    desc: 'Powerful text processing language for pattern scanning and data extraction.',
    flags: [{ flag: '-F', desc: 'Field separator' }, { flag: '{print $2}', desc: 'Print second column' }, { flag: 'NR==2', desc: 'Match line number' }],
    examples: ['awk -F: \'{print $1}\' /etc/passwd', 'ps aux | awk \'{print $11}\' | sort -u', 'awk \'NR==5,NR==10\' file.txt'],
  },
};

const SUGGEST_COMMANDS = [
  { cmd: 'git log --oneline --graph --all', desc: 'Visual branch graph' },
  { cmd: 'docker ps --format "{{.Names}}: {{.Status}}"', desc: 'Clean container list' },
  { cmd: 'find . -name "*.log" -mtime +7 -delete', desc: 'Delete old log files' },
  { cmd: 'lsof -i :3000', desc: 'What is on port 3000?' },
  { cmd: 'du -sh */ | sort -h', desc: 'Folder sizes sorted' },
  { cmd: 'history | awk \'{$1="";print}\' | sort | uniq -c | sort -rn | head -20', desc: 'Your most-used commands' },
  { cmd: 'openssl rand -hex 32', desc: 'Generate a secret key' },
  { cmd: 'curl -s ifconfig.me', desc: 'Get your public IP' },
  { cmd: 'ps aux --sort=-%cpu | head -10', desc: 'Top CPU processes' },
  { cmd: 'tar -czvf backup.tar.gz ./folder', desc: 'Compress a folder' },
];

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Splash ────────────────────────────────────────────────────────────────────
function SplashScreen({ navigation }: any) {
  const scale = useRef(new Animated.Value(0.15)).current;
  const op    = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(blink, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(blink, { toValue: 1, duration: 500, useNativeDriver: true }),
    ])).start();
    AsyncStorage.getItem('sianlk_t').then(t =>
      setTimeout(() => navigation.replace(t ? 'Main' : 'Onboarding'), 2600)
    );
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }}>
      <LinearGradient colors={['#020A02', '#050A05', '#021002']} style={StyleSheet.absoluteFill} />
      <Particles count={18} />
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity: op }}>
        <View style={{ backgroundColor: '#0C150C', borderRadius: 28, borderWidth: 1.5, borderColor: T.accent + '60', padding: 24, marginBottom: 22 }}>
          <Text style={{ color: T.accent, fontFamily: MONO, fontSize: 14 }}>$ ./terminalai --init</Text>
          <Text style={{ color: T.dimText, fontFamily: MONO, fontSize: 13, marginTop: 4 }}>AI command intelligence...</Text>
          <View style={{ flexDirection: 'row', marginTop: 6 }}>
            <Text style={{ color: T.accent, fontFamily: MONO, fontSize: 14 }}>❯ </Text>
            <Animated.View style={{ width: 10, height: 18, backgroundColor: T.accent, opacity: blink, marginTop: 1 }} />
          </View>
        </View>
        <Text style={{ color: T.text, fontSize: 32, fontWeight: '900', letterSpacing: -0.5 }}>TerminalAI</Text>
        <Text style={{ color: T.muted, fontSize: 13, marginTop: 6, letterSpacing: 2 }}>COMMAND INTELLIGENCE SUITE</Text>
      </Animated.View>
    </View>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
const SLIDES = [
  { emoji: '🔍', title: 'Explain Any Command', desc: 'Paste any terminal command — even complex pipes and flags — and get a clear, expert explanation with risk warnings and safer alternatives.' },
  { emoji: '⚡', title: 'Smart Suggestions', desc: 'Browse curated power-user commands for git, docker, kubectl, grep and more. Copy with one tap.' },
  { emoji: '🤖', title: 'AI Terminal Chat', desc: 'Describe what you want to do in plain English. TerminalAI generates the exact command, explains each part and warns about destructive operations.' },
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
      <LinearGradient colors={['#020A02', '#050A05']} style={StyleSheet.absoluteFill} />
      <Particles count={10} />
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
          <GBtn label={idx < SLIDES.length - 1 ? '$ continue →' : '$ start --free'} onPress={advance} />
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
      <LinearGradient colors={['#020A02', '#050A05']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 28 }}>
        <Text style={{ color: T.text, fontSize: 28, fontWeight: '800', marginBottom: 4, fontFamily: MONO }}>
          {mode === 'login' ? '$ ssh terminalai' : '$ register --free'}
        </Text>
        <Text style={{ color: T.muted, marginBottom: 28, fontSize: 13, fontFamily: MONO }}>AI command intelligence platform</Text>
        <TermCard style={{ padding: 18, marginBottom: 16 }}>
          {mode === 'register' && <TextInput style={{ color: T.text, backgroundColor: 'rgba(52,211,153,0.05)', borderRadius: 8, borderWidth: 1, borderColor: T.border, padding: 12, fontSize: 14, marginBottom: 12, fontFamily: MONO }} placeholder="# full name" placeholderTextColor={T.muted} value={name} onChangeText={setName} autoCapitalize="words" />}
          <TextInput style={{ color: T.accent, backgroundColor: 'rgba(52,211,153,0.05)', borderRadius: 8, borderWidth: 1, borderColor: T.border, padding: 12, fontSize: 14, marginBottom: 12, fontFamily: MONO }} placeholder="# email" placeholderTextColor={T.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={{ color: T.accent, backgroundColor: 'rgba(52,211,153,0.05)', borderRadius: 8, borderWidth: 1, borderColor: T.border, padding: 12, fontSize: 14, fontFamily: MONO }} placeholder="# password" placeholderTextColor={T.muted} value={pw} onChangeText={setPw} secureTextEntry onSubmitEditing={submit} />
          {err ? <Text style={{ color: T.red, marginTop: 10, fontSize: 12, fontFamily: MONO }}>Error: {err}</Text> : null}
        </TermCard>
        <GBtn label={mode === 'login' ? '$ login' : '$ register'} onPress={submit} loading={loading} style={{ marginBottom: 14 }} />
        <TouchableOpacity onPress={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErr(''); }} style={{ alignItems: 'center' }}>
          <Text style={{ color: T.muted, fontSize: 12, fontFamily: MONO }}>{mode === 'login' ? '# no account? ' : '# have account? '}<Text style={{ color: T.cyan }}>{mode === 'login' ? 'register --free' : 'login'}</Text></Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ── Explain Tab ───────────────────────────────────────────────────────────────
function ExplainTab() {
  const [cmd, setCmd] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const explain = async () => {
    const trimmed = cmd.trim(); if (!trimmed) return;
    setLoading(true); setResult(null);
    try {
      const token = await AsyncStorage.getItem('sianlk_t');
      const data = await apiFetch('POST', '/api/apps/terminalai/explain', { command: trimmed }, token);
      setResult(data); Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } catch {
      // Local knowledge fallback
      const known = Object.entries(CMD_KNOWLEDGE).find(([k]) => trimmed.startsWith(k));
      if (known) {
        setResult({ ...known[1], command: trimmed });
      } else {
        const parts = trimmed.split(' ');
        const flags = parts.filter(p => p.startsWith('-'));
        setResult({
          title: `${parts[0]} — Shell Command`,
          desc: `${parts[0]} is a shell utility. ${flags.length > 0 ? `Flags used: ${flags.join(', ')}. ` : ''}The command operates on ${parts.slice(1).filter(p => !p.startsWith('-')).join(', ') || 'input/output'}.`,
          flags: flags.map(f => ({ flag: f, desc: `Option flag for ${parts[0]}` })),
          examples: [trimmed + ' # as entered'],
          risk: trimmed.includes('-f') || trimmed.includes('rm') ? 'CAUTION' : undefined,
          command: trimmed,
        });
      }
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      setLoading(false); return;
    }
    setLoading(false);
  };

  const quickCmds = ['git log --oneline', 'docker ps -a', 'kubectl get pods', 'grep -rn "TODO" .', 'rm -rf'];

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#020A02', '#050A05']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '800', marginBottom: 4, fontFamily: MONO }}>$ explain &lt;command&gt;</Text>
          <Text style={{ color: T.muted, fontSize: 13, marginBottom: 18 }}>Paste any shell command to decode it</Text>

          {/* Input */}
          <TermCard style={{ padding: 14, marginBottom: 12 }}>
            <Text style={{ color: T.accent, fontSize: 11, fontFamily: MONO, marginBottom: 6 }}>❯ enter command</Text>
            <TextInput style={{ color: T.accent, backgroundColor: 'rgba(52,211,153,0.06)', borderRadius: 8, borderWidth: 1, borderColor: T.border, padding: 12, fontSize: 14, fontFamily: MONO, minHeight: 52 }}
              placeholder="e.g. grep -rn --include='*.py' 'import os'"
              placeholderTextColor={T.muted} value={cmd} onChangeText={setCmd}
              autoCapitalize="none" autoCorrect={false} multiline onSubmitEditing={explain} />
          </TermCard>

          {/* Quick picks */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {quickCmds.map((qc, i) => (
              <TouchableOpacity key={i} onPress={() => setCmd(qc)}
                style={{ backgroundColor: T.accent + '18', borderWidth: 1, borderColor: T.accent + '44', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, marginRight: 8 }}>
                <Text style={{ color: T.accent, fontSize: 11, fontFamily: MONO }}>{qc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <GBtn label="$ --explain" onPress={explain} loading={loading} style={{ marginBottom: 20 }} />

          {result && (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Header */}
              <TermCard style={{ padding: 18, marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <Text style={{ color: T.text, fontSize: 16, fontWeight: '800', flex: 1, lineHeight: 22 }}>{result.title}</Text>
                  {result.risk && (
                    <View style={{ backgroundColor: T.red + '22', borderWidth: 1, borderColor: T.red + '44', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 10 }}>
                      <Text style={{ color: T.red, fontSize: 10, fontWeight: '800', fontFamily: MONO }}>⚠ {result.risk}</Text>
                    </View>
                  )}
                </View>
                <Text style={{ color: T.dimText, fontSize: 14, lineHeight: 21 }}>{result.desc}</Text>
              </TermCard>

              {/* Flags */}
              {result.flags?.length > 0 && (
                <TermCard style={{ padding: 18, marginBottom: 12 }}>
                  <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12, fontFamily: MONO }}>FLAGS & OPTIONS</Text>
                  {result.flags.map((f: any, i: number) => (
                    <View key={i} style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
                      <Text style={{ color: T.accent, fontSize: 12, fontFamily: MONO, minWidth: 80 }}>{f.flag}</Text>
                      <Text style={{ flex: 1, color: T.dimText, fontSize: 13, lineHeight: 18 }}>{f.desc}</Text>
                    </View>
                  ))}
                </TermCard>
              )}

              {/* Examples */}
              {result.examples?.length > 0 && (
                <TermCard style={{ padding: 18 }}>
                  <Text style={{ color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12, fontFamily: MONO }}>EXAMPLES</Text>
                  {result.examples.map((ex: string, i: number) => (
                    <View key={i} style={{ backgroundColor: 'rgba(52,211,153,0.07)', borderRadius: 8, padding: 10, marginBottom: 7, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ color: T.accent, fontFamily: MONO, fontSize: 11 }}>❯</Text>
                      <Text style={{ color: T.accent, fontFamily: MONO, fontSize: 11, flex: 1 }}>{ex}</Text>
                    </View>
                  ))}
                </TermCard>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Suggest Tab ───────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Git', 'Docker', 'Kubernetes', 'Files', 'Network', 'Process', 'Security', 'Productivity'];
const CMDS_BY_CAT: Record<string, { cmd: string; desc: string; risk?: boolean }[]> = {
  Git:        [{ cmd: 'git log --oneline --graph --all', desc: 'Visual branch history' }, { cmd: 'git stash list', desc: 'View stashed changes' }, { cmd: 'git reflog | head -20', desc: 'Recovery history' }, { cmd: 'git diff --stat HEAD~5', desc: 'Changes in last 5 commits' }],
  Docker:     [{ cmd: 'docker ps --format "{{.Names}}: {{.Status}}"', desc: 'Clean container list' }, { cmd: 'docker stats --no-stream', desc: 'Resource usage snapshot' }, { cmd: 'docker system df', desc: 'Disk usage by Docker' }, { cmd: 'docker exec -it <id> sh', desc: 'Shell into container' }],
  Kubernetes: [{ cmd: 'kubectl get pods -A --field-selector=status.phase!=Running', desc: 'Non-running pods' }, { cmd: 'kubectl top nodes', desc: 'Node resource usage' }, { cmd: 'kubectl describe pod <name> -n <ns>', desc: 'Pod diagnostics' }],
  Files:      [{ cmd: 'find . -name "*.log" -mtime +7 -delete', desc: 'Delete logs older than 7 days', risk: true }, { cmd: 'du -sh */ | sort -h', desc: 'Folder sizes (sorted)' }, { cmd: 'lsof +D /path | awk \'NR>1{print $2}\' | sort -u', desc: 'PIDs using a folder' }],
  Network:    [{ cmd: 'lsof -i :3000', desc: 'What is on port 3000?' }, { cmd: 'ss -tulnp', desc: 'All listening ports' }, { cmd: 'curl -s ifconfig.me', desc: 'Your public IP' }, { cmd: 'traceroute -m 15 google.com', desc: 'Network path trace' }],
  Process:    [{ cmd: 'ps aux --sort=-%cpu | head -10', desc: 'Top CPU processes' }, { cmd: 'ps aux --sort=-%mem | head -10', desc: 'Top memory processes' }, { cmd: "watch -n 1 'ps aux --sort=-%cpu | head -6'", desc: 'Live CPU watcher' }],
  Security:   [{ cmd: 'openssl rand -hex 32', desc: 'Generate a 256-bit secret' }, { cmd: 'openssl x509 -in cert.pem -noout -dates', desc: 'Check cert expiry' }, { cmd: "sudo auditctl -l", desc: 'List audit rules' }],
  Productivity: [{ cmd: 'history | awk \'{$1="";print}\' | sort | uniq -c | sort -rn | head -20', desc: 'Most used commands' }, { cmd: 'fc -l -20', desc: 'Last 20 commands' }, { cmd: "alias | sort", desc: 'All your shell aliases' }],
};

function SuggestTab() {
  const [filter, setFilter] = useState('All');
  const [copied, setCopied] = useState<string | null>(null);
  const allCmds = Object.values(CMDS_BY_CAT).flat();
  const shown   = filter === 'All' ? SUGGEST_COMMANDS : (CMDS_BY_CAT[filter] ?? []);
  const copy = (cmd: string) => { setCopied(cmd); setTimeout(() => setCopied(null), 1800); };
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#020A02', '#050A05']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 18, paddingBottom: 10 }}>
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '800', fontFamily: MONO, marginBottom: 16 }}>$ suggest --category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat} onPress={() => setFilter(cat)}
                style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, marginRight: 7, backgroundColor: filter === cat ? T.accent + '28' : T.card, borderWidth: 1, borderColor: filter === cat ? T.accent : T.border }}>
                <Text style={{ color: filter === cat ? T.accent : T.muted, fontWeight: '700', fontSize: 11, fontFamily: MONO }}>{cat.toLowerCase()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 4, paddingBottom: 40, gap: 8 }}>
          {shown.map((item, i) => (
            <TouchableOpacity key={i} onPress={() => copy(item.cmd)} activeOpacity={0.8}>
              <TermCard style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Text style={{ color: T.accent, fontFamily: MONO, fontSize: 12 }}>❯</Text>
                  <Text style={{ color: T.accent, fontFamily: MONO, fontSize: 12, flex: 1 }}>{item.cmd}</Text>
                  {'risk' in item && item.risk && <View style={{ backgroundColor: T.red + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 }}><Text style={{ color: T.red, fontSize: 9, fontFamily: MONO }}>RISK</Text></View>}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: T.muted, fontSize: 12 }}>{item.desc}</Text>
                  <View style={{ backgroundColor: copied === item.cmd ? T.accent + '28' : 'rgba(52,211,153,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: copied === item.cmd ? T.accent : T.border }}>
                    <Text style={{ color: copied === item.cmd ? T.accent : T.muted, fontSize: 10, fontFamily: MONO }}>{copied === item.cmd ? '✓ copied' : 'copy'}</Text>
                  </View>
                </View>
              </TermCard>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── AI Chat Tab ───────────────────────────────────────────────────────────────
type Msg = { role: 'user' | 'ai'; content: string; cmd?: string };

function AITab() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'ai', content: '$ terminalai --interactive\n\nDescribe what you want to do and I\'ll suggest the exact command. e.g. "list all docker containers that are stopped", "find files modified in last 24h", "kill the process on port 8080"' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scroll = useRef<ScrollView>(null);

  const send = async () => {
    const content = input.trim(); if (!content) return;
    setInput(''); setMsgs(m => [...m, { role: 'user', content }]); setLoading(true);
    try {
      const token = await AsyncStorage.getItem('sianlk_t');
      const data = await apiFetch('POST', '/api/apps/terminalai/suggest', { query: content }, token);
      setMsgs(m => [...m, { role: 'ai', content: data.explanation ?? data.response, cmd: data.command }]);
    } catch {
      const lower = content.toLowerCase();
      let cmd = ''; let explanation = '';
      if (lower.includes('docker') && lower.includes('stop')) {
        cmd = 'docker ps -a --filter "status=exited" --format "{{.Names}}"'; explanation = 'Lists all stopped Docker containers by name. Use `docker start <name>` to restart any of them.';
      } else if (lower.includes('port') && (lower.includes('kill') || lower.includes('stop') || lower.includes('8080') || lower.includes('3000'))) {
        const port = lower.match(/\d{4}/)?.[0] ?? '8080';
        cmd = `lsof -ti :${port} | xargs kill -9`; explanation = `Finds the PID on port ${port} and kills it. Pipe to xargs kill -9 for force kill. Use sudo if permission denied.`;
      } else if (lower.includes('find') && lower.includes('24h')) {
        cmd = 'find . -mtime -1 -type f'; explanation = 'Finds all files (-type f) modified in the last 24 hours (-mtime -1) starting from current directory.';
      } else if (lower.includes('largest') || (lower.includes('big') && lower.includes('file'))) {
        cmd = 'find . -type f -exec du -sh {} \\; | sort -h | tail -20'; explanation = 'Finds and sorts all files by size, showing the 20 largest. Warning: can be slow on big filesystems.';
      } else if (lower.includes('process') && (lower.includes('cpu') || lower.includes('memory'))) {
        cmd = 'ps aux --sort=-%cpu | head -10'; explanation = 'Shows top 10 processes by CPU usage. Replace -%cpu with -%mem to sort by memory instead.';
      } else if (lower.includes('git') && lower.includes('undo')) {
        cmd = 'git reset --soft HEAD~1'; explanation = 'Undoes the last commit but keeps your changes staged. Use --hard instead of --soft to discard changes entirely (destructive!).';
      } else {
        cmd = `# AI command for: "${content}"`; explanation = `Based on your request, I would suggest looking at commands related to "${lower.split(' ').slice(0, 3).join(' ')}". Try being more specific — e.g. "kill process on port 3000", "list all running containers", "find .env files in repo".`;
      }
      setMsgs(m => [...m, { role: 'ai', content: explanation, cmd: cmd.startsWith('#') ? undefined : cmd }]);
    } finally { setLoading(false); setTimeout(() => scroll.current?.scrollToEnd(), 50); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <LinearGradient colors={['#020A02', '#050A05']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 18, paddingBottom: 8 }}>
          <Text style={{ color: T.text, fontSize: 20, fontWeight: '800', fontFamily: MONO }}>$ ai --chat</Text>
          <Text style={{ color: T.muted, fontSize: 12 }}>Natural language → shell command</Text>
        </View>
        <ScrollView ref={scroll} style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 10 }}
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
          {msgs.map((m, i) => (
            <View key={i} style={{ marginBottom: 12, alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'ai' && <Text style={{ color: T.accent, fontSize: 10, fontFamily: MONO, marginBottom: 4 }}>❯ terminalai</Text>}
              <TermCard style={{ maxWidth: '90%', padding: 14 }}>
                <Text style={{ color: m.role === 'user' ? T.cyan : T.dimText, fontSize: 13, lineHeight: 20, fontFamily: m.role === 'user' ? undefined : MONO }}>{m.content}</Text>
                {m.cmd && (
                  <View style={{ backgroundColor: 'rgba(52,211,153,0.12)', borderRadius: 8, padding: 10, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ color: T.accent, fontFamily: MONO, fontSize: 11 }}>❯</Text>
                    <Text style={{ color: T.accent, fontFamily: MONO, fontSize: 11, flex: 1 }}>{m.cmd}</Text>
                  </View>
                )}
              </TermCard>
            </View>
          ))}
          {loading && (
            <TermCard style={{ alignSelf: 'flex-start', padding: 14, marginBottom: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <ActivityIndicator color={T.accent} size="small" />
              <Text style={{ color: T.muted, fontFamily: MONO, fontSize: 12 }}>thinking...</Text>
            </TermCard>
          )}
        </ScrollView>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
          <View style={{ flexDirection: 'row', padding: 16, gap: 10 }}>
            <TextInput style={{ flex: 1, color: T.accent, backgroundColor: T.card, borderRadius: 12, borderWidth: 1, borderColor: T.border, paddingHorizontal: 13, paddingVertical: 11, fontSize: 13, fontFamily: MONO }}
              placeholder="describe what you need..." placeholderTextColor={T.muted}
              value={input} onChangeText={setInput} multiline onSubmitEditing={send} />
            <TouchableOpacity onPress={send} disabled={loading}
              style={{ backgroundColor: T.accent, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}>
              <Text style={{ color: '#052010', fontWeight: '800', fontSize: 16, fontFamily: MONO }}>↑</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ── Main Tabs ─────────────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#080E08', borderTopColor: T.border, height: Platform.OS === 'ios' ? 90 : 68, paddingBottom: Platform.OS === 'ios' ? 28 : 12, paddingTop: 10 },
      tabBarActiveTintColor: T.accent, tabBarInactiveTintColor: T.muted,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3, fontFamily: MONO },
    }}>
      <Tab.Screen name="Explain" component={ExplainTab} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🔍</Text>, tabBarLabel: 'explain' }} />
      <Tab.Screen name="Suggest" component={SuggestTab} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚡</Text>, tabBarLabel: 'suggest' }} />
      <Tab.Screen name="AI"      component={AITab}      options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🤖</Text>, tabBarLabel: 'ai chat' }} />
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
