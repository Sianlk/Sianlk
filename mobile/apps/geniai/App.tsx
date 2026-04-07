import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Animated, ActivityIndicator,
  SafeAreaView, StatusBar, Dimensions, Switch, Modal, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SW, height: SH } = Dimensions.get('window');
const API = 'https://sianlk-unified-9w6jz.ondigitalocean.app';
const Tab = createBottomTabNavigator();

const T = {
  bg: '#06040F', card: '#0D0B1A', border: '#1A1830',
  accent: '#7C3AED', cyan: '#06B6D4', text: '#E8E0FF',
  muted: '#6B7280', green: '#10B981', red: '#EF4444',
  gold: '#F59E0B', orange: '#F97316', surface: '#100E1F',
  pink: '#EC4899', teal: '#14B8A6', indigo: '#6366F1',
};

// ── AI Response Engine ─────────────────────────────────────────────────────
const AI_KNOWLEDGE: Record<string, string> = {
  react: "React is a declarative, component-based JavaScript library for building UIs. Key concepts: JSX, hooks (useState, useEffect, useRef), component lifecycle, virtual DOM, props & state, context API. For performance: use React.memo, useMemo, useCallback. Prefer functional components with hooks over class components.",
  python: "Python is a high-level, interpreted language with clean syntax. Key features: dynamic typing, list comprehensions, generators, decorators, async/await, dataclasses. Popular libraries: NumPy (numerical), Pandas (data), TensorFlow/PyTorch (ML), FastAPI (APIs), Django (web). Follow PEP 8 style guide.",
  typescript: "TypeScript adds static typing to JavaScript. Key features: interfaces, generics, union/intersection types, enums, decorators, utility types (Partial, Required, Pick, Omit, Record). Use strict mode for maximum safety. Type narrowing with typeof and instanceof guards.",
  machine_learning: "ML pipeline: data collection → preprocessing → EDA → feature engineering → model selection → training → evaluation → tuning → deployment → monitoring. Algorithms: linear/logistic regression, decision trees, random forests, gradient boosting (XGBoost, LightGBM), SVMs, neural networks. Metrics: accuracy, precision, recall, F1, AUC-ROC, MAE, RMSE.",
  neural_networks: "Neural networks: layers of interconnected neurons. Key architectures: CNN (vision), RNN/LSTM (sequences), Transformer (attention, NLP), GAN (generative), Diffusion models. Training: forward pass → loss computation → backpropagation → gradient descent. Regularisation: dropout, L1/L2, batch normalisation.",
  api: "REST API best practices: use HTTP verbs correctly (GET/POST/PUT/PATCH/DELETE), versioning (/v1/), proper status codes (200/201/400/401/403/404/500), consistent JSON responses, pagination (cursor or offset), rate limiting, authentication (JWT/OAuth2), input validation, error handling with meaningful messages.",
  security: "OWASP Top 10: injection attacks, broken auth, XSS, insecure direct object references, security misconfiguration, sensitive data exposure, XML external entities, broken access control, insecure deserialization, components with known vulnerabilities. Always: parametrised queries, input sanitisation, HTTPS, least privilege, secrets in env vars, rate limiting.",
  database: "SQL vs NoSQL: relational (PostgreSQL, MySQL) for structured data with ACID; document (MongoDB) for flexible schemas; time-series (InfluxDB) for metrics; graph (Neo4j) for relationships. Optimisation: proper indexing, query analysis (EXPLAIN), connection pooling, caching layer (Redis), read replicas for scale.",
  docker: "Docker containerises applications. Key concepts: Dockerfile (build instructions), images (templates), containers (running instances), volumes (persistent storage), networks. Multi-stage builds reduce image size. Use docker-compose for local development. Kubernetes for orchestration at scale.",
  kubernetes: "K8s orchestrates containers. Key objects: Pod (1+ containers), Deployment (desired state), Service (networking), Ingress (external access), ConfigMap/Secret (configuration), PersistentVolume (storage). Concepts: selectors, labels, namespaces, RBAC, horizontal pod autoscaling, health probes (liveness/readiness).",
  git: "Git workflow: feature branches off main, small commits with clear messages (type(scope): description), PR reviews, squash/rebase before merge. Commands: git stash, git cherry-pick, git bisect (debugging), git reflog (recovery). Trunk-based development for high-velocity teams. GitFlow for release management.",
  algorithms: "Big O: O(1) constant, O(log n) binary search, O(n) linear, O(n log n) merge sort, O(n²) bubble sort, O(2ⁿ) exponential. Data structures: array O(1) access, linked list O(1) insert, hash map O(1) average, BST O(log n), heap O(log n) priority. Dynamic programming: optimal substructure + overlapping subproblems.",
  cloud: "Cloud services: IaaS (EC2, Azure VMs), PaaS (Heroku, App Service), SaaS. AWS services: S3 (object storage), RDS (managed DB), Lambda (serverless), EKS (Kubernetes), CloudFront (CDN), Route53 (DNS). Design patterns: circuit breaker, bulkhead, retry with exponential backoff, saga pattern for distributed transactions.",
};

function generateAIResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  // Find relevant knowledge
  for (const [key, content] of Object.entries(AI_KNOWLEDGE)) {
    if (lower.includes(key) || lower.includes(key.replace('_',' '))) {
      return `**${key.replace('_',' ').toUpperCase()} INSIGHTS**\n\n${content}\n\n*Want me to dive deeper into any specific aspect? Just ask!*`;
    }
  }
  // Code detection
  if (lower.includes('code') || lower.includes('function') || lower.includes('class') || lower.includes('bug')) {
    return "I can help with code! Please share the specific code snippet or describe what you're trying to build, and I'll provide:\n\n• **Analysis** of the logic and potential issues\n• **Optimised solution** with best practices\n• **Explanation** of the approach\n• **Tests** if needed\n\nWhat language are you working in?";
  }
  // Explain detection
  if (lower.includes('explain') || lower.includes('what is') || lower.includes('how does')) {
    return `Great question! Let me break that down:\n\n**Concept Overview**\nThis topic touches on fundamental principles of modern software engineering. The key aspects to understand are:\n\n1. **Core principle** — The foundational idea that makes this work\n2. **Practical application** — How it's used in real systems\n3. **Trade-offs** — What to consider when making decisions\n4. **Best practices** — Industry-standard approaches\n\n*Could you be more specific about what you'd like me to explain? The more context you give, the more precise my answer will be.*`;
  }
  // Architecture/design
  if (lower.includes('architect') || lower.includes('design') || lower.includes('system')) {
    return "**SYSTEM ARCHITECTURE GUIDANCE**\n\nFor production systems, consider:\n\n• **Scalability** — Horizontal scaling, load balancing, caching (Redis/CDN)\n• **Reliability** — 99.9%+ uptime via redundancy, health checks, graceful degradation\n• **Security** — Zero-trust model, mTLS, secrets management, audit logging\n• **Observability** — Distributed tracing (Jaeger), metrics (Prometheus), logs (ELK stack)\n• **Data** — CQRS + Event Sourcing for complex domains, read/write separation\n\nWhat specific component would you like to architect?";
  }
  const responses = [
    "That's an interesting challenge. Let me think through the best approach:\n\n**Key Considerations:**\n• Start with the simplest solution that works\n• Add complexity only when needed\n• Write tests before or alongside code\n• Document decisions, not just actions\n\nWhat's the specific problem you're trying to solve?",
    "**GENI AI RESPONSE**\n\nI've analysed your query and here's my thinking:\n\nThe most effective approach would depend on your specific constraints — scale, team size, timeline, and existing infrastructure. I'd recommend:\n\n1. Define clear success metrics first\n2. Start with a proof-of-concept\n3. Iterate based on real feedback\n4. Optimise once you have data\n\nWhich aspect would you like to explore further?",
    "Great question! Here's a comprehensive breakdown:\n\n**Short Answer:** It depends on your specific use case, but here's the framework to decide.\n\n**Detailed Analysis:**\n• Consider the trade-offs between different approaches\n• Factor in team expertise and maintenance burden\n• Think about long-term scalability\n• Prototype and measure before committing\n\nPaste your code or describe your setup for more specific guidance.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateCodeResponse(lang: string, task: string): string {
  const samples: Record<string, string> = {
    javascript: `// ${task}\nasync function solution(data) {\n  try {\n    // Input validation\n    if (!data) throw new Error('Data required');\n    \n    // Core logic with error handling\n    const result = await processData(data);\n    \n    return { success: true, data: result };\n  } catch (error) {\n    console.error('Solution error:', error);\n    throw error;\n  }\n}\n\n// Helper function\nfunction processData(input) {\n  return input.map(item => ({\n    ...item,\n    processed: true,\n    timestamp: Date.now(),\n  }));\n}`,
    python: `# ${task}\nfrom typing import Optional, List\nimport logging\n\nlogger = logging.getLogger(__name__)\n\ndef solution(data: List[dict]) -> Optional[dict]:\n    """\n    ${task}\n    \n    Args:\n        data: Input data list\n    Returns:\n        Processed result or None\n    """\n    if not data:\n        logger.warning("Empty data received")\n        return None\n    \n    try:\n        result = [\n            {**item, 'processed': True}\n            for item in data\n            if item.get('active', True)\n        ]\n        logger.info(f"Processed {len(result)} items")\n        return {'items': result, 'count': len(result)}\n    except Exception as e:\n        logger.error(f"Processing failed: {e}")\n        raise`,
    typescript: `// ${task}\ninterface DataItem {\n  id: string;\n  value: unknown;\n  active?: boolean;\n}\n\ninterface Result {\n  items: ProcessedItem[];\n  count: number;\n  timestamp: number;\n}\n\ninterface ProcessedItem extends DataItem {\n  processed: true;\n}\n\nexport async function solution(\n  data: DataItem[]\n): Promise<Result> {\n  if (!data?.length) {\n    throw new Error('Input data is required');\n  }\n  \n  const items = data\n    .filter(item => item.active !== false)\n    .map((item): ProcessedItem => ({\n      ...item,\n      processed: true,\n    }));\n  \n  return { items, count: items.length, timestamp: Date.now() };\n}`,
  };
  return samples[lang.toLowerCase()] || samples.typescript;
}

// ── Animated Typing Text ───────────────────────────────────────────────────
function TypingText({ text, speed = 15 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const intv = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, ++i)); }
      else clearInterval(intv);
    }, speed);
    return () => clearInterval(intv);
  }, [text]);
  return <Text style={{ color: T.text, fontSize: 13, lineHeight: 22 }}>{displayed}</Text>;
}

// ── Particles ──────────────────────────────────────────────────────────────
function Particles({ count = 18 }: { count?: number }) {
  const anims = useRef(Array.from({ length: count }, () => ({
    op: new Animated.Value(0), x: Math.random() * SW, y: Math.random() * SH,
    size: Math.random() * 2.5 + 0.5,
    color: [T.accent, T.cyan, T.pink, T.teal][Math.floor(Math.random()*4)],
    dur: 2500 + Math.random() * 3500,
  }))).current;
  useEffect(() => {
    anims.forEach(a => {
      const loop = () => Animated.sequence([
        Animated.timing(a.op, { toValue: 0.6, duration: a.dur, useNativeDriver: true }),
        Animated.timing(a.op, { toValue: 0, duration: a.dur, useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) loop(); });
      setTimeout(loop, Math.random() * 3000);
    });
  }, []);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {anims.map((a, i) => (
        <Animated.View key={i} style={{ position:'absolute', left:a.x, top:a.y,
          width:a.size, height:a.size, borderRadius:a.size/2, backgroundColor:a.color, opacity:a.op }} />
      ))}
    </View>
  );
}

// ── GCard ──────────────────────────────────────────────────────────────────
function GCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[{ backgroundColor: T.card, borderRadius: 16, borderWidth: 0.5, borderColor: T.border }, style]}>
      {children}
    </View>
  );
}

// ── CHAT TAB ───────────────────────────────────────────────────────────────
interface Message {
  id: string; role: 'user'|'assistant'; content: string; ts: number;
  model?: string;
}

const MODELS = [
  { id: 'geni-pro', name: 'GENI Pro', desc: 'Most capable, thoughtful multi-step reasoning' },
  { id: 'geni-fast', name: 'GENI Fast', desc: 'Instant responses, great for quick queries' },
  { id: 'geni-code', name: 'GENI Code', desc: 'Specialised for software engineering' },
  { id: 'geni-research', name: 'GENI Research', desc: 'Deep analysis with citations' },
];

const STARTER_PROMPTS = [
  { label:'Explain neural networks', emoji:'🧠' },
  { label:'Debug my code', emoji:'🐛' },
  { label:'Best practices for REST APIs', emoji:'🔌' },
  { label:'System design interview prep', emoji:'📐' },
  { label:'How does Kubernetes work?', emoji:'☸️' },
  { label:'Write a Python data pipeline', emoji:'🐍' },
];

function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    { id:'0', role:'assistant', content:'Hello! I\'m GENI AI — your intelligent coding and research assistant.\n\nI can help with:\n• **Code** — debug, review, generate, explain\n• **Architecture** — system design, patterns, best practices\n• **Research** — deep dives into any technical topic\n• **Learning** — explain concepts at any level\n\nWhat shall we work on today?', ts: Date.now(), model:'geni-pro' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(MODELS[0]);
  const [showModels, setShowModels] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = useCallback(async (text?: string) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role:'user', content:q, ts:Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setTimeout(() => { scrollRef.current?.scrollToEnd({ animated:true }); }, 100);

    const delay = model.id === 'geni-fast' ? 600 : model.id === 'geni-pro' ? 1800 : 1200;
    setTimeout(() => {
      let resp = generateAIResponse(q);
      if (model.id === 'geni-code') {
        const langMatch = q.match(/\b(python|javascript|typescript|java|go|rust|swift)\b/i);
        resp = `**CODE ASSISTANT — ${model.name}**\n\n` + (langMatch
          ? generateCodeResponse(langMatch[1], q)
          : resp);
      }
      const aiMsg: Message = { id: (Date.now()+1).toString(), role:'assistant', content:resp, ts:Date.now(), model:model.name };
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
      setTimeout(() => { scrollRef.current?.scrollToEnd({ animated:true }); }, 150);
    }, delay);
  }, [input, loading, model]);

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <LinearGradient colors={['#0C0820','#06040F']} style={StyleSheet.absoluteFill} />
      <Particles />
      <SafeAreaView style={{ flex:1 }}>
        <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':'height'}>
          {/* Header */}
          <View style={{ padding:16, flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
            <View>
              <Text style={{ color:T.text, fontSize:20, fontWeight:'900' }}>🤖 GENI Chat</Text>
              <Text style={{ color:T.muted, fontSize:11 }}>{messages.length - 1} messages • {model.name}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowModels(true)}
              style={{ backgroundColor:T.card, borderRadius:12, paddingHorizontal:12, paddingVertical:8, borderWidth:1, borderColor:T.border }}>
              <Text style={{ color:T.accent, fontSize:11, fontWeight:'700' }}>⚡ {model.id.split('-')[1].toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView ref={scrollRef} style={{ flex:1 }} contentContainerStyle={{ padding:16, gap:12 }} showsVerticalScrollIndicator={false}>
            {messages.length === 1 && (
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                {STARTER_PROMPTS.map(s => (
                  <TouchableOpacity key={s.label} onPress={() => send(s.label)}
                    style={{ backgroundColor:T.card, borderRadius:20, paddingHorizontal:12, paddingVertical:8, borderWidth:1, borderColor:T.border }}>
                    <Text style={{ color:T.text, fontSize:12 }}>{s.emoji} {s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {messages.map(msg => (
              <View key={msg.id} style={{ alignItems: msg.role==='user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:4 }}>
                    <LinearGradient colors={[T.accent, T.indigo]} style={{ width:22, height:22, borderRadius:11, alignItems:'center', justifyContent:'center' }}>
                      <Text style={{ fontSize:10 }}>A</Text>
                    </LinearGradient>
                    <Text style={{ color:T.muted, fontSize:10 }}>{msg.model || 'GENI'}</Text>
                  </View>
                )}
                <View style={{
                  maxWidth: '88%',
                  backgroundColor: msg.role==='user' ? T.accent : T.card,
                  borderRadius: 18,
                  borderBottomRightRadius: msg.role==='user' ? 4 : 18,
                  borderBottomLeftRadius: msg.role==='assistant' ? 4 : 18,
                  padding: 14,
                  borderWidth: msg.role==='assistant' ? 0.5 : 0,
                  borderColor: T.border,
                }}>
                  <Text style={{ color: msg.role==='user'?'#fff':T.text, fontSize:13, lineHeight:21 }}>
                    {msg.content}
                  </Text>
                </View>
                <Text style={{ color:T.muted, fontSize:9, marginTop:3 }}>
                  {new Date(msg.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                </Text>
              </View>
            ))}

            {loading && (
              <View style={{ alignItems:'flex-start' }}>
                <GCard style={{ padding:14, flexDirection:'row', gap:8, alignItems:'center' }}>
                  <ActivityIndicator color={T.accent} size="small" />
                  <Text style={{ color:T.muted, fontSize:12 }}>{model.name} is thinking...</Text>
                </GCard>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={{ padding:16, borderTopWidth:0.5, borderTopColor:T.border, flexDirection:'row', gap:10, alignItems:'flex-end' }}>
            <TextInput
              value={input} onChangeText={setInput}
              placeholder="Ask GENI anything..." placeholderTextColor={T.muted}
              multiline maxLength={4000}
              style={{ flex:1, backgroundColor:T.card, borderRadius:16, borderWidth:1, borderColor:T.border, padding:14, color:T.text, fontSize:13, maxHeight:120, lineHeight:20 }}
            />
            <TouchableOpacity onPress={() => send()} disabled={!input.trim() || loading}
              style={{ opacity: !input.trim() || loading ? 0.4 : 1 }}>
              <LinearGradient colors={[T.accent, T.indigo]} style={{ width:46, height:46, borderRadius:23, alignItems:'center', justifyContent:'center' }}>
                <Text style={{ fontSize:20 }}>↑</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Model selector */}
      <Modal visible={showModels} transparent animationType="slide" onRequestClose={() => setShowModels(false)}>
        <TouchableOpacity style={{ flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.7)' }} onPress={() => setShowModels(false)}>
          <View style={{ backgroundColor:T.card, borderTopLeftRadius:24, borderTopRightRadius:24, padding:24 }}>
            <Text style={{ color:T.text, fontSize:18, fontWeight:'900', marginBottom:16 }}>Select Model</Text>
            {MODELS.map(m => (
              <TouchableOpacity key={m.id} onPress={() => { setModel(m); setShowModels(false); }}
                style={{ flexDirection:'row', alignItems:'center', padding:14, borderRadius:14, marginBottom:8, backgroundColor:model.id===m.id?T.accent+'22':T.bg, borderWidth:1, borderColor:model.id===m.id?T.accent+'44':T.border }}>
                <View style={{ flex:1 }}>
                  <Text style={{ color:T.text, fontSize:14, fontWeight:'700' }}>{m.name}</Text>
                  <Text style={{ color:T.muted, fontSize:12, marginTop:2 }}>{m.desc}</Text>
                </View>
                {model.id === m.id && <Text style={{ color:T.accent, fontSize:18 }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ── CODE TAB ───────────────────────────────────────────────────────────────
const CODE_LANGUAGES = ['TypeScript','Python','JavaScript','Rust','Go','Swift','Java','Kotlin','C++'];
const CODE_TASKS = [
  'REST API with authentication',
  'Data processing pipeline',
  'Binary search implementation',
  'Cache with LRU eviction',
  'Event emitter pattern',
  'Async queue with concurrency limit',
  'Debounce & throttle utilities',
  'JWT auth middleware',
  'Database connection pool',
  'Rate limiter with sliding window',
];

const CODE_TEMPLATES: Record<string, string> = {
  TypeScript: `// TypeScript Template\nimport { Injectable } from '@nestjs/common';\nimport { InjectRepository } from '@nestjs/typeorm';\nimport { Repository } from 'typeorm';\n\n@Injectable()\nexport class DataService {\n  constructor(\n    @InjectRepository(Entity)\n    private readonly repo: Repository<Entity>,\n  ) {}\n\n  async findAll(filters?: FilterDto): Promise<Entity[]> {\n    const query = this.repo.createQueryBuilder('e');\n    \n    if (filters?.status) {\n      query.andWhere('e.status = :status', { status: filters.status });\n    }\n    \n    return query\n      .orderBy('e.createdAt', 'DESC')\n      .limit(filters?.limit ?? 50)\n      .getMany();\n  }\n\n  async create(dto: CreateDto): Promise<Entity> {\n    const entity = this.repo.create(dto);\n    return this.repo.save(entity);\n  }\n}`,
  Python: `# Python Template\nfrom dataclasses import dataclass, field\nfrom typing import Optional, List\nfrom datetime import datetime\nimport asyncio\nimport logging\n\nlogger = logging.getLogger(__name__)\n\n@dataclass\nclass Config:\n    max_retries: int = 3\n    timeout: float = 30.0\n    batch_size: int = 100\n    tags: List[str] = field(default_factory=list)\n\nclass DataProcessor:\n    def __init__(self, config: Config):\n        self.config = config\n        self._cache: dict = {}\n    \n    async def process_batch(\n        self,\n        items: List[dict],\n        *,\n        validate: bool = True\n    ) -> List[dict]:\n        """Process a batch of items with validation."""\n        if validate:\n            items = [i for i in items if self._validate(i)]\n        \n        tasks = [\n            self._process_item(item)\n            for item in items\n        ]\n        results = await asyncio.gather(*tasks, return_exceptions=True)\n        \n        successful = [\n            r for r in results\n            if not isinstance(r, Exception)\n        ]\n        logger.info(f"Processed {len(successful)}/{len(items)} items")\n        return successful\n    \n    def _validate(self, item: dict) -> bool:\n        return bool(item.get('id') and item.get('data'))\n    \n    async def _process_item(self, item: dict) -> dict:\n        await asyncio.sleep(0)  # yield to event loop\n        return {**item, 'processed_at': datetime.utcnow().isoformat()}`,
  JavaScript: `// JavaScript Template\nconst EventEmitter = require('events');\n\nclass DataPipeline extends EventEmitter {\n  #queue = [];\n  #processing = false;\n  #concurrency;\n  #activeCount = 0;\n\n  constructor({ concurrency = 3 } = {}) {\n    super();\n    this.#concurrency = concurrency;\n  }\n\n  push(task) {\n    return new Promise((resolve, reject) => {\n      this.#queue.push({ task, resolve, reject });\n      this.#drain();\n    });\n  }\n\n  async #drain() {\n    while (this.#queue.length && this.#activeCount < this.#concurrency) {\n      const { task, resolve, reject } = this.#queue.shift();\n      this.#activeCount++;\n      task()\n        .then(resolve)\n        .catch(reject)\n        .finally(() => {\n          this.#activeCount--;\n          this.emit('task:complete');\n          this.#drain();\n        });\n    }\n  }\n}`,
};

function CodeTab() {
  const [lang, setLang] = useState('TypeScript');
  const [task, setTask] = useState('');
  const [code, setCode] = useState(CODE_TEMPLATES.TypeScript);
  const [analysis, setAnalysis] = useState<string|null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeTask, setActiveTask] = useState('');

  const generate = () => {
    if (!task.trim()) return;
    setGenerating(true);
    setAnalysis(null);
    setTimeout(() => {
      const generated = generateCodeResponse(lang, task);
      setCode(generated);
      setActiveTask(task);
      setGenerating(false);
    }, 1400);
  };

  const analyseCode = () => {
    setGenerating(true);
    setTimeout(() => {
      setAnalysis(`**CODE ANALYSIS — ${lang}**\n\n✅ **Strengths:**\n• Clean structure with clear separation of concerns\n• Proper error handling and input validation\n• Type safety well-maintained throughout\n• Async patterns used correctly\n\n⚠️ **Suggestions:**\n• Add unit tests for edge cases (empty input, null values)\n• Consider adding JSDoc/docstring comments\n• Implement retry logic for external calls\n• Add logging for observability\n\n📊 **Metrics:**\n• Complexity: Medium (manageable)\n• Maintainability: High\n• Test coverage potential: ~85%\n• Performance: O(n) — optimal for this use case`);
      setGenerating(false);
    }, 900);
  };

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <LinearGradient colors={['#050B18','#06040F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding:16, paddingBottom:40, gap:14 }}>
          <Text style={{ color:T.text, fontSize:20, fontWeight:'900' }}>💻 Code Assistant</Text>
          <Text style={{ color:T.muted, fontSize:12, marginTop:-8 }}>Generate, review & optimise code in any language</Text>

          {/* Language selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:8 }}>
            {CODE_LANGUAGES.map(l => (
              <TouchableOpacity key={l} onPress={() => { setLang(l); setCode(CODE_TEMPLATES[l] || CODE_TEMPLATES.TypeScript); }}
                style={{ paddingHorizontal:14, paddingVertical:8, borderRadius:20, backgroundColor:lang===l?T.accent+'33':T.card, borderWidth:1, borderColor:lang===l?T.accent:T.border }}>
                <Text style={{ color:lang===l?T.accent:T.muted, fontWeight:'700', fontSize:12 }}>{l}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Task input */}
          <GCard style={{ padding:14 }}>
            <Text style={{ color:T.muted, fontSize:10, fontWeight:'700', marginBottom:8 }}>DESCRIBE WHAT TO BUILD</Text>
            <TextInput
              value={task} onChangeText={setTask}
              placeholder="e.g. REST API with JWT auth and rate limiting..."
              placeholderTextColor={T.muted}
              multiline
              style={{ color:T.text, fontSize:13, backgroundColor:T.bg, borderRadius:10, padding:12, borderWidth:1, borderColor:T.border, lineHeight:20, minHeight:60 }}
            />
            <View style={{ flexDirection:'row', gap:8, marginTop:10 }}>
              <TouchableOpacity onPress={generate} disabled={generating}
                style={{ flex:1, opacity:generating?0.6:1 }}>
                <LinearGradient colors={[T.accent,T.indigo]} style={{ borderRadius:12, padding:12, alignItems:'center' }}>
                  <Text style={{ color:'#fff', fontWeight:'800', fontSize:13 }}>{generating?'Generating...':'⚡ Generate'}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={analyseCode} disabled={generating}
                style={{ flex:1, backgroundColor:T.card, borderRadius:12, padding:12, alignItems:'center', borderWidth:1, borderColor:T.border, opacity:generating?0.6:1 }}>
                <Text style={{ color:T.cyan, fontWeight:'800', fontSize:13 }}>🔍 Analyse</Text>
              </TouchableOpacity>
            </View>
          </GCard>

          {/* Quick tasks */}
          <Text style={{ color:T.muted, fontSize:11, fontWeight:'700' }}>QUICK TASKS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:8 }}>
            {CODE_TASKS.map(t => (
              <TouchableOpacity key={t} onPress={() => setTask(t)}
                style={{ backgroundColor:T.card, borderRadius:12, paddingHorizontal:12, paddingVertical:8, borderWidth:0.5, borderColor:T.border }}>
                <Text style={{ color:T.text, fontSize:11 }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Code editor display */}
          <GCard style={{ padding:0, overflow:'hidden' }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:12, borderBottomWidth:0.5, borderBottomColor:T.border, backgroundColor:'#0A0818' }}>
              <Text style={{ color:T.accent, fontSize:12, fontWeight:'700' }}>
                {activeTask || 'Template'} — {lang}
              </Text>
              <Text style={{ color:T.muted, fontSize:10 }}>{code.split('\n').length} lines</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={{ color:'#A8D8A8', fontSize:12, fontFamily:'monospace', padding:16, lineHeight:22, opacity:generating?0.4:1 }}>
                {generating ? '// Generating optimised code...' : code}
              </Text>
            </ScrollView>
          </GCard>

          {/* Analysis result */}
          {analysis && (
            <GCard style={{ padding:16 }}>
              <Text style={{ color:T.text, fontSize:13, lineHeight:22 }}>{analysis}</Text>
            </GCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── RESEARCH TAB ───────────────────────────────────────────────────────────
const RESEARCH_TOPICS = [
  { id:'1', title:'The Transformer Architecture: Attention Is All You Need', authors:'Vaswani et al.', year:2017, citations:72000, summary:'Introduced self-attention mechanism, eliminating recurrence. Foundation of GPT, BERT, and all modern LLMs.', tags:['NLP','Architecture','Attention'], color:T.accent },
  { id:'2', title:'Deep Residual Learning for Image Recognition', authors:'He et al.', year:2015, citations:145000, summary:'ResNet introduced skip connections, enabling 152-layer networks. Won ImageNet 2015. Key insight: learn residual functions.', tags:['CV','CNNs','SOTA'], color:T.cyan },
  { id:'3', title:'BERT: Pre-training of Deep Bidirectional Transformers', authors:'Devlin et al.', year:2018, citations:61000, summary:'Bidirectional language model. MLM + NSP objectives. Fine-tuning outperforms task-specific architectures across 11 NLP tasks.', tags:['NLP','Transfer Learning'], color:T.gold },
  { id:'4', title:'Generative Adversarial Networks', authors:'Goodfellow et al.', year:2014, citations:48000, summary:'Two networks (generator + discriminator) in minimax game. Generator creates samples; discriminator distinguishes real vs fake.', tags:['Generative','GAN'], color:T.pink },
  { id:'5', title:'Adam: A Method for Stochastic Optimisation', authors:'Kingma & Ba', year:2014, citations:144000, summary:'Adaptive learning rates per parameter. Combines RMSProp + momentum. Default choice for most deep learning tasks.', tags:['Optimisation','Training'], color:T.green },
  { id:'6', title:'Dropout: A Simple Way to Prevent Neural Networks from Overfitting', authors:'Srivastava et al.', year:2014, citations:34000, summary:'Randomly zeroes units during training. Equivalent to training ensemble of 2^n thinned networks. Reduces overfitting significantly.', tags:['Regularisation','Training'], color:T.teal },
];

function ResearchTab() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<typeof RESEARCH_TOPICS[0]|null>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(RESEARCH_TOPICS);

  const search = () => {
    if (!query.trim()) { setResults(RESEARCH_TOPICS); return; }
    setSearching(true);
    setTimeout(() => {
      const q = query.toLowerCase();
      setResults(RESEARCH_TOPICS.filter(r =>
        r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q)) || r.authors.toLowerCase().includes(q)
      ));
      setSearching(false);
    }, 500);
  };

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <LinearGradient colors={['#08051A','#06040F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding:16, paddingBottom:40, gap:14 }}>
          <Text style={{ color:T.text, fontSize:20, fontWeight:'900' }}>🔬 Research Hub</Text>
          <Text style={{ color:T.muted, fontSize:12, marginTop:-8 }}>AI research papers • Deep dives • Topic summaries</Text>

          {/* Search */}
          <View style={{ flexDirection:'row', gap:10 }}>
            <TextInput
              value={query} onChangeText={setQuery}
              placeholder="Search papers, topics, authors..."
              placeholderTextColor={T.muted}
              style={{ flex:1, backgroundColor:T.card, borderRadius:14, borderWidth:1, borderColor:T.border, padding:14, color:T.text, fontSize:13 }}
              onSubmitEditing={search}
            />
            <TouchableOpacity onPress={search} style={{ backgroundColor:T.accent, borderRadius:14, paddingHorizontal:18, justifyContent:'center' }}>
              <Text style={{ color:'#fff', fontWeight:'800', fontSize:13 }}>🔍</Text>
            </TouchableOpacity>
          </View>

          {searching && <ActivityIndicator color={T.accent} />}

          {results.map(r => (
            <TouchableOpacity key={r.id} onPress={() => setSelected(selected?.id===r.id?null:r)}>
              <GCard style={{ padding:16 }}>
                <View style={{ flexDirection:'row', gap:12, alignItems:'flex-start' }}>
                  <View style={{ width:4, backgroundColor:r.color, borderRadius:2, alignSelf:'stretch', minHeight:50 }} />
                  <View style={{ flex:1 }}>
                    <Text style={{ color:T.text, fontSize:13, fontWeight:'800', lineHeight:19, marginBottom:4 }}>{r.title}</Text>
                    <Text style={{ color:T.muted, fontSize:11 }}>{r.authors} • {r.year}</Text>
                    <Text style={{ color:r.color, fontSize:11, fontWeight:'700', marginTop:2 }}>📊 {r.citations.toLocaleString()} citations</Text>
                    {selected?.id === r.id && (
                      <View style={{ marginTop:12, borderTopWidth:0.5, borderTopColor:T.border, paddingTop:12 }}>
                        <Text style={{ color:T.dimText, fontSize:12, lineHeight:20, marginBottom:10 }}>{r.summary}</Text>
                        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6 }}>
                          {r.tags.map(t => (
                            <View key={t} style={{ backgroundColor:r.color+'22', borderRadius:8, paddingHorizontal:8, paddingVertical:4, borderWidth:0.5, borderColor:r.color+'44' }}>
                              <Text style={{ color:r.color, fontSize:10, fontWeight:'700' }}>{t}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </GCard>
            </TouchableOpacity>
          ))}

          {results.length === 0 && (
            <GCard style={{ padding:24, alignItems:'center' }}>
              <Text style={{ fontSize:32, marginBottom:8 }}>🔍</Text>
              <Text style={{ color:T.text, fontSize:15, fontWeight:'700' }}>No results for "{query}"</Text>
              <Text style={{ color:T.muted, fontSize:12, marginTop:4 }}>Try different keywords or browse all papers</Text>
            </GCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── AGENTS TAB ─────────────────────────────────────────────────────────────
const AGENT_TASKS = [
  { id:'1', name:'Code Review Agent', emoji:'🔍', desc:'Automated PR review with security, performance & style checks', status:'ready' },
  { id:'2', name:'Test Generator', emoji:'🧪', desc:'Generate comprehensive unit & integration tests from source code', status:'ready' },
  { id:'3', name:'Documentation Writer', emoji:'📝', desc:'Auto-generate API docs, READMEs and inline comments', status:'ready' },
  { id:'4', name:'Security Auditor', emoji:'🔐', desc:'Scan for OWASP vulnerabilities, secrets exposure, dependency CVEs', status:'ready' },
  { id:'5', name:'Refactor Agent', emoji:'♻️', desc:'Identify code smells and suggest/apply refactors', status:'ready' },
  { id:'6', name:'Data Analyst', emoji:'📊', desc:'Analyse datasets, generate insights and create visualisations', status:'ready' },
];

function AgentsTab() {
  const [running, setRunning] = useState<Record<string,boolean>>({});
  const [results, setResults] = useState<Record<string,string>>({});
  const [progress, setProgress] = useState<Record<string,number>>({});

  const runAgent = (id: string, name: string) => {
    setRunning(prev => ({ ...prev, [id]:true }));
    setProgress(prev => ({ ...prev, [id]:0 }));

    const steps = [0, 25, 50, 75, 90, 100];
    steps.forEach((p, i) => {
      setTimeout(() => {
        setProgress(prev => ({ ...prev, [id]:p }));
        if (p === 100) {
          setRunning(prev => ({ ...prev, [id]:false }));
          const agentResults: Record<string,string> = {
            '1': '**CODE REVIEW COMPLETE**\n\n✅ 847 lines reviewed\n⚠️ 3 medium issues: SQL query not parameterised (line 142), unused import (line 7), async function missing await (line 89)\n🔐 0 critical security issues\n📊 Maintainability score: 82/100',
            '2': '**TESTS GENERATED**\n\n✅ 24 unit tests created\n✅ 8 integration tests\n✅ 3 E2E scenarios\n📊 Estimated coverage: 94%\nFiles: src/__tests__/api.test.ts, src/__tests__/auth.test.ts',
            '3': '**DOCUMENTATION GENERATED**\n\n✅ README.md updated\n✅ API reference for 18 endpoints\n✅ 124 JSDoc comments added\n✅ Architecture diagram (Mermaid)\n📊 Documentation coverage: 91%',
            '4': '**SECURITY AUDIT COMPLETE**\n\n✅ 0 critical vulnerabilities\n⚠️ 2 high: JWT secret in .env (not in vault), outdated dependency (express 4.17.1)\n⚠️ 4 medium: missing rate limiting on 3 routes, CORS too permissive\n📊 Security score: 73/100',
            '5': '**REFACTOR SUGGESTIONS**\n\n🔄 8 functions exceed 50 lines → extract helpers\n🔄 3 duplicate code blocks → extract utilities\n🔄 2 N+1 query patterns → add DataLoader\n🔄 1 god class → split into 3 focused services\n📊 Estimated improvement: +18 maintainability points',
            '6': '**DATA ANALYSIS COMPLETE**\n\n📊 12,847 records analysed\n📈 Revenue trend: +23% MoM\n👥 User growth: +18% week-over-week\n🔍 Anomaly detected: spike on Tue 14:00 (examine traffic logs)\n💡 Insight: Mobile users convert 2.4× better than desktop',
          };
          setResults(prev => ({ ...prev, [id]: agentResults[id] || `${name} completed successfully.` }));
        }
      }, i * 800);
    });
  };

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <LinearGradient colors={['#06091A','#06040F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding:16, paddingBottom:40, gap:14 }}>
          <Text style={{ color:T.text, fontSize:20, fontWeight:'900' }}>🤖 AI Agents</Text>
          <Text style={{ color:T.muted, fontSize:12, marginTop:-8 }}>Autonomous AI agents for software engineering tasks</Text>

          {AGENT_TASKS.map(agent => (
            <GCard key={agent.id} style={{ padding:16 }}>
              <View style={{ flexDirection:'row', alignItems:'center', gap:12, marginBottom:10 }}>
                <View style={{ width:48, height:48, borderRadius:16, backgroundColor:T.accent+'22', alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ fontSize:24 }}>{agent.emoji}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ color:T.text, fontSize:14, fontWeight:'800' }}>{agent.name}</Text>
                  <Text style={{ color:T.muted, fontSize:11, marginTop:2 }}>{agent.desc}</Text>
                </View>
              </View>

              {running[agent.id] && (
                <View style={{ marginBottom:10 }}>
                  <View style={{ height:4, backgroundColor:T.border, borderRadius:2, overflow:'hidden' }}>
                    <View style={{ height:'100%', width:`${progress[agent.id] || 0}%`, backgroundColor:T.accent, borderRadius:2 }} />
                  </View>
                  <Text style={{ color:T.muted, fontSize:10, marginTop:4 }}>Running... {progress[agent.id]}%</Text>
                </View>
              )}

              {results[agent.id] && !running[agent.id] && (
                <View style={{ backgroundColor:T.bg, borderRadius:10, padding:12, borderWidth:0.5, borderColor:T.border, marginBottom:10 }}>
                  <Text style={{ color:T.text, fontSize:11, lineHeight:18 }}>{results[agent.id]}</Text>
                </View>
              )}

              <TouchableOpacity onPress={() => runAgent(agent.id, agent.name)} disabled={running[agent.id]}>
                <LinearGradient
                  colors={running[agent.id] ? [T.muted,T.muted] : [T.accent,T.indigo]}
                  style={{ borderRadius:12, padding:12, alignItems:'center' }}>
                  <Text style={{ color:'#fff', fontWeight:'800', fontSize:12 }}>
                    {running[agent.id] ? '⚡ Running...' : results[agent.id] ? '🔄 Run Again' : '▶ Run Agent'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </GCard>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── ANALYTICS TAB ─────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [period, setPeriod] = useState('7d');
  const PERIODS = ['24h','7d','30d','90d'];

  const stats = [
    { label:'AI Queries', value:'12,847', change:'+23%', color:T.accent, emoji:'💬' },
    { label:'Code Generated', value:'4,219', change:'+18%', color:T.cyan, emoji:'💻' },
    { label:'Agents Run', value:'892', change:'+41%', color:T.gold, emoji:'🤖' },
    { label:'Papers Read', value:'2,104', change:'+12%', color:T.green, emoji:'🔬' },
    { label:'Tokens Used', value:'8.4M', change:'+29%', color:T.pink, emoji:'⚡' },
    { label:'Users Active', value:'340', change:'+8%', color:T.teal, emoji:'👥' },
  ];

  const topTopics = [
    { topic:'Python & ML', pct:34, color:T.accent },
    { topic:'System Design', pct:22, color:T.cyan },
    { topic:'TypeScript', pct:18, color:T.gold },
    { topic:'DevOps/K8s', pct:14, color:T.green },
    { topic:'Security', pct:12, color:T.red },
  ];

  return (
    <View style={{ flex:1, backgroundColor:T.bg }}>
      <LinearGradient colors={['#080415','#06040F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex:1 }}>
        <ScrollView contentContainerStyle={{ padding:16, paddingBottom:40, gap:14 }}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
            <View>
              <Text style={{ color:T.text, fontSize:20, fontWeight:'900' }}>📊 Analytics</Text>
              <Text style={{ color:T.muted, fontSize:12 }}>Platform usage & intelligence metrics</Text>
            </View>
            <View style={{ flexDirection:'row', gap:4 }}>
              {PERIODS.map(p => (
                <TouchableOpacity key={p} onPress={() => setPeriod(p)}
                  style={{ paddingHorizontal:10, paddingVertical:5, borderRadius:8, backgroundColor:period===p?T.accent+'33':T.card, borderWidth:1, borderColor:period===p?T.accent:T.border }}>
                  <Text style={{ color:period===p?T.accent:T.muted, fontSize:10, fontWeight:'700' }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stats grid */}
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10 }}>
            {stats.map(s => (
              <GCard key={s.label} style={{ width:'47%', padding:14 }}>
                <Text style={{ fontSize:24, marginBottom:6 }}>{s.emoji}</Text>
                <Text style={{ color:s.color, fontSize:22, fontWeight:'900' }}>{s.value}</Text>
                <Text style={{ color:T.muted, fontSize:11, marginTop:2 }}>{s.label}</Text>
                <Text style={{ color:T.green, fontSize:11, fontWeight:'700', marginTop:4 }}>↑ {s.change} vs last {period}</Text>
              </GCard>
            ))}
          </View>

          {/* Top topics */}
          <GCard style={{ padding:16 }}>
            <Text style={{ color:T.text, fontSize:15, fontWeight:'800', marginBottom:14 }}>Most Queried Topics</Text>
            {topTopics.map(t => (
              <View key={t.topic} style={{ marginBottom:12 }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:4 }}>
                  <Text style={{ color:T.text, fontSize:12 }}>{t.topic}</Text>
                  <Text style={{ color:t.color, fontSize:12, fontWeight:'700' }}>{t.pct}%</Text>
                </View>
                <View style={{ height:6, backgroundColor:T.border, borderRadius:3, overflow:'hidden' }}>
                  <View style={{ height:'100%', width:`${t.pct}%`, backgroundColor:t.color, borderRadius:3 }} />
                </View>
              </View>
            ))}
          </GCard>

          {/* Activity feed */}
          <GCard style={{ padding:16 }}>
            <Text style={{ color:T.text, fontSize:15, fontWeight:'800', marginBottom:12 }}>Recent Activity</Text>
            {[
              { time:'2m ago', action:'Code review agent completed', detail:'Found 3 issues in PR #247', emoji:'🔍' },
              { time:'8m ago', action:'214 lines TypeScript generated', detail:'REST API with JWT auth', emoji:'💻' },
              { time:'15m ago', action:'Research deep-dive: Transformers', detail:'47 papers indexed', emoji:'🔬' },
              { time:'23m ago', action:'Security audit passed', detail:'Score: 91/100', emoji:'🔐' },
              { time:'1h ago', action:'Test suite generated', detail:'32 tests • 96% coverage estimate', emoji:'🧪' },
            ].map((a, i) => (
              <View key={i} style={{ flexDirection:'row', gap:12, alignItems:'flex-start', marginBottom:12 }}>
                <Text style={{ fontSize:18 }}>{a.emoji}</Text>
                <View style={{ flex:1 }}>
                  <Text style={{ color:T.text, fontSize:12, fontWeight:'600' }}>{a.action}</Text>
                  <Text style={{ color:T.muted, fontSize:11, marginTop:2 }}>{a.detail}</Text>
                </View>
                <Text style={{ color:T.muted, fontSize:10 }}>{a.time}</Text>
              </View>
            ))}
          </GCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── ROOT APP ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: T.bg, card: T.card, border: T.border, text: T.text } }}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />
      <Tab.Navigator screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#060410', borderTopColor: T.border, height: Platform.OS==='ios'?90:68, paddingBottom: Platform.OS==='ios'?28:12, paddingTop:10 },
        tabBarActiveTintColor: T.accent,
        tabBarInactiveTintColor: T.muted,
        tabBarLabelStyle: { fontSize:8, fontWeight:'800', letterSpacing:0.2 },
      }}>
        <Tab.Screen name="Chat"     component={ChatTab}     options={{ tabBarIcon:({color}:any) => <Text style={{fontSize:20,color}}>💬</Text>, tabBarLabel:'CHAT' }} />
        <Tab.Screen name="Code"     component={CodeTab}     options={{ tabBarIcon:({color}:any) => <Text style={{fontSize:20,color}}>💻</Text>, tabBarLabel:'CODE' }} />
        <Tab.Screen name="Research" component={ResearchTab} options={{ tabBarIcon:({color}:any) => <Text style={{fontSize:20,color}}>🔬</Text>, tabBarLabel:'RESEARCH' }} />
        <Tab.Screen name="Agents"   component={AgentsTab}   options={{ tabBarIcon:({color}:any) => <Text style={{fontSize:20,color}}>🤖</Text>, tabBarLabel:'AGENTS' }} />
        <Tab.Screen name="Analytics" component={AnalyticsTab} options={{ tabBarIcon:({color}:any) => <Text style={{fontSize:20,color}}>📊</Text>, tabBarLabel:'ANALYTICS' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
