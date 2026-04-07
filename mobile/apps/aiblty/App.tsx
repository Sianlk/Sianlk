import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Animated, ActivityIndicator, SafeAreaView, StatusBar, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const { width: SW } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
const T = { bg:'#08060F', card:'#110E1F', border:'#1E1A30', accent:'#8B5CF6', cyan:'#06B6D4', text:'#EDE9FE', muted:'#6B7280', green:'#10B981', red:'#EF4444', gold:'#F59E0B', pink:'#EC4899', orange:'#F97316' };

function GCard({children,style}:any){return(<View style={[{backgroundColor:T.card,borderRadius:16,borderWidth:0.5,borderColor:T.border},style]}>{children}</View>);}

const COURSES = [
  {id:'1',title:'Complete Python for AI & Machine Learning',instructor:'Dr Sarah Chen',level:'Beginner→Advanced',lessons:84,duration:'42h',rating:4.9,students:128400,emoji:'🐍',tags:['Python','ML','Data Science'],progress:0,color:T.accent},
  {id:'2',title:'Deep Learning with PyTorch: From Scratch',instructor:'James Rivera',level:'Intermediate',lessons:67,duration:'35h',rating:4.8,students:89200,emoji:'🧠',tags:['PyTorch','Neural Nets','CNN'],progress:0,color:T.cyan},
  {id:'3',title:'LLM Engineering: Build Production AI Apps',instructor:'Dr Aisha Okafor',level:'Advanced',lessons:52,duration:'28h',rating:4.9,students:47800,emoji:'🤖',tags:['LLMs','RAG','Agents'],progress:0,color:T.gold},
  {id:'4',title:'MLOps & AI Infrastructure at Scale',instructor:'Marcus Lin',level:'Advanced',lessons:44,duration:'22h',rating:4.7,students:31200,emoji:'⚙️',tags:['MLOps','Kubernetes','Monitoring'],progress:0,color:T.green},
  {id:'5',title:'Computer Vision: From OpenCV to Diffusion',instructor:'Dr Priya Nair',level:'Intermediate',lessons:58,duration:'30h',rating:4.8,students:62300,emoji:'👁️',tags:['Vision','CNNs','Stable Diffusion'],progress:0,color:T.pink},
];

const QUIZ_QUESTIONS = [
  {q:'What is the time complexity of gradient descent per iteration?',opts:['O(1)','O(n)','O(n²)','O(log n)'],ans:1,exp:'Each iteration requires computing gradients over all n training examples → O(n) per step.'},
  {q:'Which activation function is most common in hidden layers of deep networks?',opts:['Sigmoid','Tanh','ReLU','Softmax'],ans:2,exp:'ReLU (Rectified Linear Unit) avoids vanishing gradients and is computationally efficient, making it the default choice.'},
  {q:'What is the purpose of batch normalisation?',opts:['Reduce parameters','Normalise layer inputs','Increase learning rate','Add regularisation only'],ans:1,exp:'BatchNorm normalises layer inputs across the batch, stabilising training and allowing higher learning rates.'},
  {q:'In a transformer, what does the Q, K, V stand for?',opts:['Quantile Key Value','Query Key Value','Queue Kernel Vector','Quick Knowledge Vector'],ans:1,exp:'Q=Query, K=Key, V=Value. Attention = softmax(QK^T/√d)·V computes weighted value combinations.'},
  {q:'What is the "vanishing gradient" problem?',opts:['GPU memory overflow','Gradients shrink to near-zero in deep layers','Learning rate too high','Model weights become too large'],ans:1,exp:'In deep networks, gradients decreasexponentially through backpropagation, making early layers learn very slowly.'},
  {q:'Which optimiser adapts learning rates per parameter?',opts:['SGD','Momentum','Adam','Perceptron'],ans:2,exp:'Adam (Adaptive Moment Estimation) maintains per-parameter adaptive learning rates using first and second moment estimates.'},
  {q:'What does "overfitting" mean?',opts:['Model too simple for data','Model memorises training data, fails on new data','Learning rate too small','Batch size too large'],ans:1,exp:'Overfitting: model fits training data too closely including noise, leading to poor generalisation to unseen data.'},
  {q:'What is Principal Component Analysis (PCA)?',opts:['Classification algorithm','Clustering technique','Dimensionality reduction via orthogonal components','Neural network layer'],ans:2,exp:'PCA finds orthogonal directions (principal components) of maximum variance, projecting data to lower dimensions.'},
];

function CoursesTab() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [progress, setProgress] = useState<Record<string,number>>({});
  const filtered = COURSES.filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
  const startLesson = (id:string) => setProgress(p => ({...p, [id]:Math.min(100,(p[id]||0)+12)}));
  return (
    <View style={{flex:1,backgroundColor:T.bg}}>
      <LinearGradient colors={['#12083A','#08060F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{flex:1}}>
        <ScrollView contentContainerStyle={{padding:16,paddingBottom:40,gap:14}}>
          <LinearGradient colors={[T.accent+'CC',T.cyan+'AA']} start={{x:0,y:0}} end={{x:1,y:1}} style={{borderRadius:20,padding:20}}>
            <Text style={{color:'#fff',fontSize:22,fontWeight:'900'}}>🎓 AI Learning Platform</Text>
            <Text style={{color:'rgba(255,255,255,0.8)',fontSize:12,marginTop:4}}>{COURSES.length} expert courses • AI-adaptive learning • Certificate programs</Text>
          </LinearGradient>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search courses, skills, topics..." placeholderTextColor={T.muted}
            style={{backgroundColor:T.card,borderRadius:14,borderWidth:1,borderColor:T.border,padding:14,color:T.text,fontSize:13}} />
          {filtered.map(c => {
            const prog = progress[c.id]||0; const isSel = selected?.id===c.id;
            return (
              <TouchableOpacity key={c.id} onPress={()=>setSelected(isSel?null:c)}>
                <GCard style={{padding:16}}>
                  <View style={{flexDirection:'row',gap:12,alignItems:'flex-start'}}>
                    <LinearGradient colors={[c.color+'44',c.color+'22']} style={{width:56,height:56,borderRadius:16,alignItems:'center',justifyContent:'center'}}>
                      <Text style={{fontSize:28}}>{c.emoji}</Text>
                    </LinearGradient>
                    <View style={{flex:1}}>
                      <Text style={{color:T.text,fontSize:13,fontWeight:'800',lineHeight:18,marginBottom:4}}>{c.title}</Text>
                      <Text style={{color:T.muted,fontSize:11}}>by {c.instructor} • {c.level}</Text>
                      <View style={{flexDirection:'row',gap:12,marginTop:6}}>
                        <Text style={{color:T.gold,fontSize:11,fontWeight:'700'}}>⭐ {c.rating}</Text>
                        <Text style={{color:T.muted,fontSize:11}}>{c.students.toLocaleString()} students</Text>
                        <Text style={{color:T.muted,fontSize:11}}>📚 {c.lessons} lessons</Text>
                      </View>
                    </View>
                  </View>
                  {prog > 0 && (<View style={{marginTop:10}}><View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:4}}><Text style={{color:T.muted,fontSize:10}}>Progress</Text><Text style={{color:c.color,fontSize:10,fontWeight:'700'}}>{prog}%</Text></View><View style={{height:4,backgroundColor:T.border,borderRadius:2,overflow:'hidden'}}><View style={{height:'100%',width:prog+'%',backgroundColor:c.color,borderRadius:2}}/></View></View>)}
                  {isSel && (<View style={{marginTop:14,borderTopWidth:0.5,borderTopColor:T.border,paddingTop:14}}><View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:12}}>{c.tags.map(t=><View key={t} style={{backgroundColor:c.color+'22',borderRadius:8,paddingHorizontal:8,paddingVertical:4}}><Text style={{color:c.color,fontSize:10,fontWeight:'700'}}>{t}</Text></View>)}</View><View style={{flexDirection:'row',gap:10}}><View style={{flex:1,backgroundColor:c.color+'15',borderRadius:12,padding:12,alignItems:'center'}}><Text style={{color:c.color,fontSize:16,fontWeight:'900'}}>{c.duration}</Text><Text style={{color:T.muted,fontSize:10,marginTop:2}}>Total Duration</Text></View><View style={{flex:1,backgroundColor:c.color+'15',borderRadius:12,padding:12,alignItems:'center'}}><Text style={{color:c.color,fontSize:16,fontWeight:'900'}}>{c.lessons}</Text><Text style={{color:T.muted,fontSize:10,marginTop:2}}>Lessons</Text></View></View><TouchableOpacity onPress={()=>startLesson(c.id)} style={{marginTop:12}}><LinearGradient colors={[c.color,c.color+'AA']} style={{borderRadius:12,padding:14,alignItems:'center'}}><Text style={{color:'#fff',fontWeight:'800',fontSize:14}}>{prog===0?'▶ Start Course':prog>=100?'✅ Completed':'▶ Continue Learning'}</Text></LinearGradient></TouchableOpacity></View>)}
                </GCard>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function AssessTab() {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number|null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = QUIZ_QUESTIONS[idx];
  const submit = (opt:number) => {
    if(answered)return;
    setSelected(opt); setAnswered(true);
    if(opt===q.ans) setScore(s=>s+1);
  };
  const next = () => {
    if(idx+1>=QUIZ_QUESTIONS.length){setDone(true);return;}
    setIdx(i=>i+1); setSelected(null); setAnswered(false);
  };
  const restart = () => { setIdx(0);setSelected(null);setAnswered(false);setScore(0);setDone(false); };
  if(done) return (
    <View style={{flex:1,backgroundColor:T.bg}}>
      <LinearGradient colors={['#0E0630','#08060F']} style={StyleSheet.absoluteFill}/>
      <SafeAreaView style={{flex:1,alignItems:'center',justifyContent:'center',padding:24}}>
        <Text style={{fontSize:60,marginBottom:16}}>{score>=6?'🏆':score>=4?'🥈':'🎯'}</Text>
        <Text style={{color:T.text,fontSize:28,fontWeight:'900',textAlign:'center'}}>Assessment Complete!</Text>
        <Text style={{color:T.muted,fontSize:16,marginTop:8}}>{score}/{QUIZ_QUESTIONS.length} correct</Text>
        <LinearGradient colors={[score>=6?T.green:score>=4?T.gold:T.orange, score>=6?T.cyan:score>=4?T.orange:T.red]} style={{borderRadius:20,paddingHorizontal:40,paddingVertical:20,marginTop:24,alignItems:'center'}}>
          <Text style={{color:'#fff',fontSize:36,fontWeight:'900'}}>{Math.round((score/QUIZ_QUESTIONS.length)*100)}%</Text>
          <Text style={{color:'rgba(255,255,255,0.8)',fontSize:14}}>Score</Text>
        </LinearGradient>
        <Text style={{color:T.muted,fontSize:13,marginTop:16,textAlign:'center'}}>{score>=6?'Excellent! You have strong ML fundamentals.':score>=4?'Good understanding. Review the missed concepts.':'Keep studying! Review the explanations carefully.'}</Text>
        <TouchableOpacity onPress={restart} style={{backgroundColor:T.accent,borderRadius:14,paddingHorizontal:32,paddingVertical:14,marginTop:24}}><Text style={{color:'#fff',fontWeight:'800',fontSize:15}}>🔄 Try Again</Text></TouchableOpacity>
      </SafeAreaView>
    </View>
  );
  return (
    <View style={{flex:1,backgroundColor:T.bg}}>
      <LinearGradient colors={['#0E0630','#08060F']} style={StyleSheet.absoluteFill}/>
      <SafeAreaView style={{flex:1}}>
        <ScrollView contentContainerStyle={{padding:20,paddingBottom:40}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <Text style={{color:T.text,fontSize:18,fontWeight:'900'}}>🧠 AI Knowledge Quiz</Text>
            <View style={{backgroundColor:T.accent+'22',borderRadius:10,padding:8}}><Text style={{color:T.accent,fontSize:12,fontWeight:'700'}}>{idx+1}/{QUIZ_QUESTIONS.length}</Text></View>
          </View>
          <View style={{height:4,backgroundColor:T.border,borderRadius:2,overflow:'hidden',marginBottom:24}}><View style={{height:'100%',width:${((idx+1)/QUIZ_QUESTIONS.length)*100}%,backgroundColor:T.accent,borderRadius:2}}/></View>
          <GCard style={{padding:20,marginBottom:20}}>
            <Text style={{color:T.accent,fontSize:10,fontWeight:'700',marginBottom:8}}>QUESTION {idx+1}</Text>
            <Text style={{color:T.text,fontSize:16,fontWeight:'700',lineHeight:24}}>{q.q}</Text>
          </GCard>
          {q.opts.map((opt,i)=>{
            const isCorrect=i===q.ans; const isSelected=i===selected;
            const bg=!answered?T.card:isCorrect?T.green+'22':isSelected?T.red+'22':T.card;
            const bc=!answered?T.border:isCorrect?T.green+'66':isSelected?T.red+'66':T.border;
            return(<TouchableOpacity key={i} onPress={()=>submit(i)}><View style={{backgroundColor:bg,borderRadius:14,borderWidth:1.5,borderColor:bc,padding:16,marginBottom:10,flexDirection:'row',alignItems:'center',gap:12}}><View style={{width:28,height:28,borderRadius:14,backgroundColor:isSelected||(!answered&&false)?T.accent+'33':T.bg,borderWidth:1,borderColor:isSelected?T.accent:T.border,alignItems:'center',justifyContent:'center'}}><Text style={{color:isSelected?T.accent:T.muted,fontSize:12,fontWeight:'700'}}>{String.fromCharCode(65+i)}</Text></View><Text style={{color:answered&&isCorrect?T.green:answered&&isSelected&&!isCorrect?T.red:T.text,fontSize:13,flex:1,lineHeight:20,fontWeight:isSelected?'700':'400'}}>{opt}</Text>{answered&&isCorrect&&<Text style={{fontSize:18}}>✅</Text>}{answered&&isSelected&&!isCorrect&&<Text style={{fontSize:18}}>❌</Text>}</View></TouchableOpacity>);
          })}
          {answered && (<GCard style={{padding:16,marginTop:8,borderColor:T.accent+'33'}}><Text style={{color:T.accent,fontSize:10,fontWeight:'700',marginBottom:6}}>💡 EXPLANATION</Text><Text style={{color:T.dimText||T.muted,fontSize:12,lineHeight:20}}>{q.exp}</Text><TouchableOpacity onPress={next} style={{marginTop:14}}><LinearGradient colors={[T.accent,T.cyan]} style={{borderRadius:12,padding:14,alignItems:'center'}}><Text style={{color:'#fff',fontWeight:'800',fontSize:14}}>{idx+1>=QUIZ_QUESTIONS.length?'See Results →':'Next Question →'}</Text></LinearGradient></TouchableOpacity></GCard>)}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function TutorTab() {
  const [messages, setMessages] = useState([{role:'ai',text:'Hello! I am your AI learning tutor. Ask me anything about AI, ML, data science, programming, or any topic you are studying. I will explain concepts at your level and with examples.'}]);
  const [input, setInput] = useState(''); const [loading, setLoading] = useState(false);
  const AI_ANSWERS: Record<string,string> = {
    'neural': 'A neural network is a series of connected layers of nodes inspired by the brain. Input layer receives data → hidden layers transform it → output layer produces the prediction. Each connection has a weight that is learned via backpropagation. Key activation functions: ReLU (most common), Sigmoid (binary output), Softmax (multi-class).',
    'gradient': 'Gradient descent minimises the loss function by computing the gradient (direction of steepest descent) and updating weights: w = w - α·∇L. Learning rate α controls step size. Too small: slow. Too large: diverges. Variants: SGD, Mini-batch, Adam.',
    'overfitting': 'Overfitting = model memorises training data including noise, fails on new data. Solutions: dropout (randomly zero neurons), L1/L2 regularisation (penalise large weights), early stopping, more training data, data augmentation, simpler model.',
    'transformer': 'Transformers use self-attention to process sequences in parallel. Each token attends to all others: Attention = softmax(QKᵀ/√d)V. Multi-head attention captures different relationship types. Positional encoding adds sequence order info. Foundation of GPT, BERT, Claude, Gemini.',
    'cnn': 'CNNs (Convolutional Neural Networks) use filters that slide over input detecting features. Layers: Conv (feature detection) → BatchNorm → ReLU → Pool (downsample) → FC (classify). Key insight: weight sharing makes them translation-invariant and parameter-efficient for images.',
    'rnn': 'RNNs process sequences by maintaining hidden state: h_t = f(W_h·h_{t-1} + W_x·x_t). Problem: vanishing gradients over long sequences. Solution: LSTM with forget/input/output gates or GRU (simpler). Now largely replaced by Transformers for NLP.',
    'default': 'Great question! The concept you are asking about is fundamental to modern AI. Here is a structured explanation:

1. CORE IDEA: The underlying principle that makes it work
2. HOW IT WORKS: The step-by-step mechanism
3. WHY IT MATTERS: Real-world applications and importance
4. KEY INSIGHT: The intuition that makes it click

Could you be more specific? I can explain any ML concept from first principles with examples and intuition.',
  };
  const send = () => { if(!input.trim()||loading)return; const q=input; setInput(''); setMessages(m=>[...m,{role:'user',text:q}]); setLoading(true);
    setTimeout(()=>{ const lower=q.toLowerCase(); let ans=AI_ANSWERS.default; for(const [k,v] of Object.entries(AI_ANSWERS)){ if(lower.includes(k)){ans=v;break;}} setMessages(m=>[...m,{role:'ai',text:ans}]); setLoading(false); },1100); };
  return (
    <View style={{flex:1,backgroundColor:T.bg}}>
      <LinearGradient colors={['#0C0824','#08060F']} style={StyleSheet.absoluteFill}/>
      <SafeAreaView style={{flex:1}}>
        <View style={{flex:1}}>
          <View style={{padding:16}}><Text style={{color:T.text,fontSize:20,fontWeight:'900'}}>🎓 AI Tutor</Text><Text style={{color:T.muted,fontSize:11}}>Your personalised AI learning assistant</Text></View>
          <ScrollView style={{flex:1}} contentContainerStyle={{padding:16,gap:12}}>
            {messages.map((m,i)=>(<View key={i} style={{alignItems:m.role==='user'?'flex-end':'flex-start'}}><View style={{maxWidth:'85%',backgroundColor:m.role==='user'?T.accent:T.card,borderRadius:18,borderBottomRightRadius:m.role==='user'?4:18,borderBottomLeftRadius:m.role==='ai'?4:18,padding:14,borderWidth:m.role==='ai'?0.5:0,borderColor:T.border}}><Text style={{color:'#fff',fontSize:13,lineHeight:21}}>{m.text}</Text></View></View>))}
            {loading&&<View style={{alignItems:'flex-start'}}><GCard style={{padding:12,flexDirection:'row',gap:8,alignItems:'center'}}><ActivityIndicator color={T.accent} size="small"/><Text style={{color:T.muted,fontSize:12}}>Tutor is thinking...</Text></GCard></View>}
          </ScrollView>
          <View style={{padding:16,borderTopWidth:0.5,borderTopColor:T.border,flexDirection:'row',gap:10}}>
            <TextInput value={input} onChangeText={setInput} placeholder="Ask your AI tutor..." placeholderTextColor={T.muted} style={{flex:1,backgroundColor:T.card,borderRadius:14,borderWidth:1,borderColor:T.border,padding:13,color:T.text,fontSize:13}} onSubmitEditing={send}/>
            <TouchableOpacity onPress={send} disabled={!input.trim()||loading}><LinearGradient colors={[T.accent,T.cyan]} style={{width:46,height:46,borderRadius:23,alignItems:'center',justifyContent:'center',opacity:!input.trim()||loading?0.4:1}}><Text style={{fontSize:20}}>↑</Text></LinearGradient></TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function ProgressTab() {
  const stats = [{label:'Courses Active',val:'3',color:T.accent,emoji:'📚'},{label:'Lessons Done',val:'47',color:T.cyan,emoji:'✅'},{label:'Quiz Score',val:'84%',color:T.gold,emoji:'🎯'},{label:'Day Streak',val:'12',color:T.orange,emoji:'🔥'}];
  const skills = [{name:'Python',pct:78,color:T.accent},{name:'Deep Learning',pct:65,color:T.cyan},{name:'Data Science',pct:72,color:T.gold},{name:'NLP/LLMs',pct:45,color:T.green},{name:'MLOps',pct:38,color:T.pink}];
  return (
    <View style={{flex:1,backgroundColor:T.bg}}>
      <LinearGradient colors={['#0A0620','#08060F']} style={StyleSheet.absoluteFill}/>
      <SafeAreaView style={{flex:1}}>
        <ScrollView contentContainerStyle={{padding:16,paddingBottom:40,gap:14}}>
          <Text style={{color:T.text,fontSize:20,fontWeight:'900'}}>📈 My Progress</Text>
          <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
            {stats.map(s=>(<GCard key={s.label} style={{width:'47%',padding:14}}><Text style={{fontSize:24,marginBottom:6}}>{s.emoji}</Text><Text style={{color:s.color,fontSize:24,fontWeight:'900'}}>{s.val}</Text><Text style={{color:T.muted,fontSize:11,marginTop:2}}>{s.label}</Text></GCard>))}
          </View>
          <GCard style={{padding:16}}>
            <Text style={{color:T.text,fontSize:15,fontWeight:'800',marginBottom:16}}>Skill Proficiency</Text>
            {skills.map(s=>(<View key={s.name} style={{marginBottom:14}}><View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:5}}><Text style={{color:T.text,fontSize:13}}>{s.name}</Text><Text style={{color:s.color,fontSize:13,fontWeight:'700'}}>{s.pct}%</Text></View><View style={{height:8,backgroundColor:T.border,borderRadius:4,overflow:'hidden'}}><LinearGradient colors={[s.color,s.color+'88']} style={{height:'100%',width:s.pct+'%',borderRadius:4}} start={{x:0,y:0}} end={{x:1,y:0}}/></View></View>))}
          </GCard>
          <GCard style={{padding:16}}>
            <Text style={{color:T.text,fontSize:15,fontWeight:'800',marginBottom:14}}>Recent Activity</Text>
            {[{title:'Completed: Neural Network Fundamentals',time:'2h ago',emoji:'✅',color:T.green},{title:'Quiz: Deep Learning Basics — 88%',time:'Yesterday',emoji:'🎯',color:T.gold},{title:'Started: PyTorch from Scratch',time:'2 days ago',emoji:'📚',color:T.accent},{title:'Streak milestone: 10 days!',time:'3 days ago',emoji:'🔥',color:T.orange}].map((a,i)=>(<View key={i} style={{flexDirection:'row',gap:12,alignItems:'center',marginBottom:12}}><Text style={{fontSize:20}}>{a.emoji}</Text><View style={{flex:1}}><Text style={{color:T.text,fontSize:12,fontWeight:'600'}}>{a.title}</Text><Text style={{color:T.muted,fontSize:10,marginTop:2}}>{a.time}</Text></View></View>))}
          </GCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={{...DarkTheme,colors:{...DarkTheme.colors,background:T.bg,card:T.card,border:T.border,text:T.text}}}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg}/>
      <Tab.Navigator screenOptions={{headerShown:false,tabBarStyle:{backgroundColor:'#080415',borderTopColor:T.border,height:Platform.OS==='ios'?90:68,paddingBottom:Platform.OS==='ios'?28:12,paddingTop:10},tabBarActiveTintColor:T.accent,tabBarInactiveTintColor:T.muted,tabBarLabelStyle:{fontSize:8,fontWeight:'800'}}}>
        <Tab.Screen name="Courses" component={CoursesTab} options={{tabBarIcon:({color}:any)=><Text style={{fontSize:20,color}}>📚</Text>,tabBarLabel:'COURSES'}}/>
        <Tab.Screen name="Assess" component={AssessTab} options={{tabBarIcon:({color}:any)=><Text style={{fontSize:20,color}}>🧠</Text>,tabBarLabel:'QUIZ'}}/>
        <Tab.Screen name="Tutor" component={TutorTab} options={{tabBarIcon:({color}:any)=><Text style={{fontSize:20,color}}>🎓</Text>,tabBarLabel:'AI TUTOR'}}/>
        <Tab.Screen name="Progress" component={ProgressTab} options={{tabBarIcon:({color}:any)=><Text style={{fontSize:20,color}}>📈</Text>,tabBarLabel:'PROGRESS'}}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
