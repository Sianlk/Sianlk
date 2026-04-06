"""
Sianlk Unified SaaS Backend
============================
Single FastAPI instance serving all 11 apps.
"""
import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from contextlib import asynccontextmanager
from backend.config import get_settings
from backend.database import init_db
from backend.routers import auth, ai, payments, analytics

settings = get_settings()

if settings.sentry_dsn:
    sentry_sdk.init(dsn=settings.sentry_dsn, traces_sample_rate=0.1)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="Sianlk Unified SaaS API",
    description="Single backend serving all Sianlk apps.",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(payments.router)
app.include_router(analytics.router)

@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "version": "1.1.0", "service": "sianlk-unified"}

DASHBOARD_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Sianlk — AI-Powered SaaS Platform</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{--bg:#0a0a0f;--card:#13131a;--border:#1e1e2e;--accent:#7c3aed;--accent2:#06b6d4;--text:#e2e8f0;--muted:#64748b;--green:#10b981;--red:#ef4444}
  body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh}
  a{color:var(--accent2);text-decoration:none}
  nav{background:var(--card);border-bottom:1px solid var(--border);padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:60px;position:sticky;top:0;z-index:100}
  .logo{font-size:1.3rem;font-weight:700;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .nav-actions{display:flex;gap:10px;align-items:center}
  .btn{padding:8px 18px;border-radius:8px;border:none;font-size:.875rem;font-weight:600;cursor:pointer;transition:.2s}
  .btn-ghost{background:transparent;color:var(--text);border:1px solid var(--border)}
  .btn-ghost:hover{background:var(--border)}
  .btn-primary{background:var(--accent);color:#fff}
  .btn-primary:hover{background:#6d28d9}
  .btn-sm{padding:6px 14px;font-size:.8rem}
  .hero{text-align:center;padding:80px 24px 60px;max-width:800px;margin:0 auto}
  .hero h1{font-size:3rem;font-weight:800;line-height:1.2;margin-bottom:16px;background:linear-gradient(135deg,#fff 30%,var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .hero p{font-size:1.1rem;color:var(--muted);margin-bottom:32px;line-height:1.6}
  .hero-cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  .status-bar{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px 20px;margin:0 auto 40px;display:flex;align-items:center;gap:10px;max-width:900px}
  .status-dot{width:8px;height:8px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .section{padding:0 24px 60px;max-width:1100px;margin:0 auto}
  .section-title{font-size:1.4rem;font-weight:700;margin-bottom:24px}
  .apps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
  .app-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;transition:.2s;position:relative;overflow:hidden}
  .app-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--accent),var(--accent2));opacity:0;transition:.2s}
  .app-card:hover{border-color:var(--accent);transform:translateY(-2px)}
  .app-card:hover::before{opacity:1}
  .app-icon{font-size:2rem;margin-bottom:12px}
  .app-name{font-size:1rem;font-weight:700;margin-bottom:6px}
  .app-desc{font-size:.825rem;color:var(--muted);line-height:1.5}
  .app-badge{display:inline-block;margin-top:10px;padding:3px 10px;border-radius:20px;font-size:.72rem;font-weight:600;background:rgba(124,58,237,.15);color:var(--accent)}
  .plans-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
  .plan-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;text-align:center;position:relative}
  .plan-card.featured{border-color:var(--accent);box-shadow:0 0 30px rgba(124,58,237,.2)}
  .plan-featured-badge{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;padding:3px 14px;border-radius:20px;font-size:.72rem;font-weight:700}
  .plan-name{font-size:1rem;font-weight:700;margin-bottom:8px}
  .plan-price{font-size:2rem;font-weight:800;margin-bottom:4px}
  .plan-price span{font-size:.9rem;color:var(--muted)}
  .plan-ai{font-size:.8rem;color:var(--muted);margin:12px 0}
  .plan-card .btn{width:100%;margin-top:16px}
  #ai-section{padding:0 24px 60px;max-width:900px;margin:0 auto}
  .chat-box{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden}
  .chat-header{padding:16px 20px;border-bottom:1px solid var(--border);font-weight:700;display:flex;align-items:center;gap:8px}
  .chat-messages{height:280px;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
  .msg{max-width:80%;padding:10px 14px;border-radius:12px;font-size:.875rem;line-height:1.5}
  .msg-user{background:var(--accent);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
  .msg-ai{background:var(--border);color:var(--text);align-self:flex-start;border-bottom-left-radius:4px}
  .msg-sys{color:var(--muted);font-size:.8rem;text-align:center;width:100%;font-style:italic}
  .chat-input-row{display:flex;gap:10px;padding:14px 16px;border-top:1px solid var(--border)}
  .chat-input{flex:1;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 14px;color:var(--text);font-size:.875rem;outline:none}
  .chat-input:focus{border-color:var(--accent)}
  .modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:200;align-items:center;justify-content:center}
  .modal-overlay.open{display:flex}
  .modal{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:32px;width:100%;max-width:420px;animation:slideUp .2s ease}
  @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:none;opacity:1}}
  .modal h2{font-size:1.4rem;font-weight:700;margin-bottom:24px}
  .form-group{margin-bottom:16px}
  .form-group label{display:block;font-size:.82rem;color:var(--muted);margin-bottom:6px;font-weight:500}
  .form-group input{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 14px;color:var(--text);font-size:.875rem;outline:none;transition:.15s}
  .form-group input:focus{border-color:var(--accent)}
  .modal-msg{font-size:.82rem;margin-top:12px;padding:8px 12px;border-radius:6px;display:none}
  .modal-msg.error{background:rgba(239,68,68,.15);color:var(--red);display:block}
  .modal-msg.success{background:rgba(16,185,129,.15);color:var(--green);display:block}
  .modal-switch{text-align:center;margin-top:16px;font-size:.83rem;color:var(--muted)}
  .modal-switch a{color:var(--accent2);cursor:pointer}
  .user-pill{background:var(--border);padding:6px 14px;border-radius:20px;font-size:.8rem;font-weight:600;display:flex;align-items:center;gap:6px}
  .user-avatar{width:22px;height:22px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#fff;font-weight:700}
  footer{text-align:center;padding:32px 24px;color:var(--muted);font-size:.8rem;border-top:1px solid var(--border)}
  .spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  @media(max-width:600px){.hero h1{font-size:2rem}}
</style>
</head>
<body>
<nav>
  <span class="logo">&#x26A1; Sianlk</span>
  <div class="nav-actions" id="nav-actions">
    <button class="btn btn-ghost btn-sm" onclick="openModal('login')">Sign In</button>
    <button class="btn btn-primary btn-sm" onclick="openModal('register')">Get Started</button>
  </div>
</nav>
<div class="hero">
  <h1>11 AI-Powered Apps.<br/>One Platform.</h1>
  <p>Aesthetics, code, real estate, trading, medical AI and more &mdash; all unified under one subscription.</p>
  <div class="hero-cta">
    <button class="btn btn-primary" onclick="openModal('register')">Start Free &mdash; No Credit Card</button>
    <a href="/docs" class="btn btn-ghost">API Docs</a>
  </div>
</div>
<div class="status-bar">
  <span class="status-dot"></span>
  <span style="font-size:.85rem;font-weight:600">All systems operational</span>
  <span style="color:var(--muted);font-size:.8rem;margin-left:auto" id="api-version">v1.1.0</span>
</div>
<div class="section">
  <div class="section-title">&#x1F680; All 11 Apps Included</div>
  <div class="apps-grid">
    <div class="app-card"><div class="app-icon">&#x1F484;</div><div class="app-name">AI Aesthetics</div><div class="app-desc">AI-driven beauty recommendations, skin analysis and personalised treatment plans.</div><span class="app-badge">AI + Vision</span></div>
    <div class="app-card"><div class="app-icon">&#x1F916;</div><div class="app-name">AIBLTY</div><div class="app-desc">Intelligent ability assessment and skill-matching platform powered by machine learning.</div><span class="app-badge">ML</span></div>
    <div class="app-card"><div class="app-icon">&#x1F4BB;</div><div class="app-name">AIBLTYCode</div><div class="app-desc">AI code assistant &mdash; generate, explain, debug and optimise code across all languages.</div><span class="app-badge">Code AI</span></div>
    <div class="app-card"><div class="app-icon">&#x1F3D7;</div><div class="app-name">BuildQuote</div><div class="app-desc">Instant construction quote generation with material costs, labour and AI cost prediction.</div><span class="app-badge">Estimating</span></div>
    <div class="app-card"><div class="app-icon">&#x1F3D8;</div><div class="app-name">CompPropData</div><div class="app-desc">Commercial property data analytics &mdash; valuations, comparables and investment scoring.</div><span class="app-badge">PropTech</span></div>
    <div class="app-card"><div class="app-icon">&#x2728;</div><div class="app-name">GeniAI</div><div class="app-desc">General-purpose AI assistant with memory, personas and multi-modal capabilities.</div><span class="app-badge">GPT-4o</span></div>
    <div class="app-card"><div class="app-icon">&#x1F52C;</div><div class="app-name">GeniQX</div><div class="app-desc">Quantum-enhanced AI experimentation platform for next-generation model research.</div><span class="app-badge">Quantum</span></div>
    <div class="app-card"><div class="app-icon">&#x1F419;</div><div class="app-name">GitGit</div><div class="app-desc">AI-powered Git workflow &mdash; automated PRs, code reviews, branch management and CI insight.</div><span class="app-badge">DevOps AI</span></div>
    <div class="app-card"><div class="app-icon">&#x1F310;</div><div class="app-name">Sianlk</div><div class="app-desc">Central hub &mdash; unified dashboard, billing, identity and cross-app orchestration.</div><span class="app-badge">Platform</span></div>
    <div class="app-card"><div class="app-icon">&#x1F5A5;</div><div class="app-name">TerminalAI</div><div class="app-desc">Intelligent terminal &mdash; AI command suggestions, error explanation and shell automation.</div><span class="app-badge">CLI AI</span></div>
    <div class="app-card"><div class="app-icon">&#x1F9E0;</div><div class="app-name">AIB</div><div class="app-desc">AI brain infrastructure &mdash; shared embeddings, vector search and model orchestration layer.</div><span class="app-badge">Infrastructure</span></div>
  </div>
</div>
<div class="section">
  <div class="section-title">&#x1F4B3; Simple Pricing</div>
  <div class="plans-grid" id="plans-grid"><div style="color:var(--muted);font-size:.85rem">Loading plans&hellip;</div></div>
</div>
<div id="ai-section">
  <div class="section-title" style="padding:0 0 16px">&#x1F916; Try the AI (live)</div>
  <div class="chat-box">
    <div class="chat-header"><span style="width:8px;height:8px;border-radius:50%;background:var(--green);display:inline-block"></span>GeniAI &mdash; GPT-4o-mini</div>
    <div class="chat-messages" id="chat-messages"><div class="msg msg-sys">Sign in to chat with the AI above</div></div>
    <div class="chat-input-row">
      <input class="chat-input" id="chat-input" placeholder="Ask anything&hellip; (sign in first)" disabled/>
      <button class="btn btn-primary btn-sm" id="chat-send" onclick="sendChat()">Send</button>
    </div>
  </div>
</div>
<footer>&copy; 2026 Sianlk Ltd &middot; <a href="/docs">API Docs</a> &middot; <a href="/redoc">ReDoc</a></footer>
<div class="modal-overlay" id="auth-modal">
  <div class="modal">
    <h2 id="modal-title">Sign In</h2>
    <div class="form-group" id="name-group" style="display:none"><label>Full Name</label><input type="text" id="inp-name" placeholder="Your name"/></div>
    <div class="form-group"><label>Email</label><input type="email" id="inp-email" placeholder="you@example.com"/></div>
    <div class="form-group"><label>Password</label><input type="password" id="inp-password" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"/></div>
    <button class="btn btn-primary" style="width:100%" id="modal-btn" onclick="submitAuth()">Sign In</button>
    <div class="modal-msg" id="modal-msg"></div>
    <div class="modal-switch" id="modal-switch">No account? <a onclick="switchModal('register')">Create one free</a></div>
    <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:12px" onclick="closeModal()">Cancel</button>
  </div>
</div>
<script>
var API='',token=localStorage.getItem('token'),userEmail=localStorage.getItem('userEmail'),mode='login';
window.addEventListener('DOMContentLoaded',function(){
  loadPlans();
  if(token)showLoggedIn(userEmail);
  fetch(API+'/health').then(function(r){return r.json()}).then(function(d){document.getElementById('api-version').textContent='v'+d.version+' · online'}).catch(function(){});
});
function loadPlans(){
  fetch(API+'/api/payments/plans').then(function(r){return r.json()}).then(function(data){
    var plans=data.plans||[],featured=['starter','pro'];
    document.getElementById('plans-grid').innerHTML=plans.map(function(p){
      return'<div class="plan-card'+(featured.includes(p.id)?' featured':'')+'">'+(featured[1]===p.id?'<span class="plan-featured-badge">Most Popular</span>':'')+'<div class="plan-name">'+p.name+'</div><div class="plan-price">'+(p.price===0?'Free':'$'+p.price)+'<span>/mo</span></div><div class="plan-ai">'+p.ai_per_day+' AI requests/day</div><button class="btn '+(featured.includes(p.id)?'btn-primary':'btn-ghost')+' btn-sm" onclick="openModal(\'register\')">'+( p.price===0?'Start Free':'Get '+p.name)+'</button></div>';
    }).join('');
  }).catch(function(){});
}
function openModal(m){mode=m;switchModal(m);document.getElementById('auth-modal').classList.add('open');}
function closeModal(){document.getElementById('auth-modal').classList.remove('open');clearModalMsg();}
function switchModal(m){
  mode=m;
  document.getElementById('modal-title').textContent=m==='login'?'Sign In':'Create Account';
  document.getElementById('name-group').style.display=m==='register'?'block':'none';
  document.getElementById('modal-btn').textContent=m==='login'?'Sign In':'Create Account';
  document.getElementById('modal-switch').innerHTML=m==='login'?'No account? <a onclick="switchModal(\'register\')">Create one free</a>':'Have an account? <a onclick="switchModal(\'login\')">Sign in</a>';
  clearModalMsg();
}
function clearModalMsg(){var m=document.getElementById('modal-msg');m.className='modal-msg';m.textContent='';}
function showModalMsg(msg,type){var m=document.getElementById('modal-msg');m.className='modal-msg '+type;m.textContent=msg;}
function submitAuth(){
  var email=document.getElementById('inp-email').value.trim(),password=document.getElementById('inp-password').value,name=document.getElementById('inp-name').value.trim();
  if(!email||!password){showModalMsg('Please fill in all fields','error');return;}
  var btn=document.getElementById('modal-btn');
  btn.innerHTML='<span class="spinner"></span>';btn.disabled=true;
  if(mode==='register'){
    fetch(API+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,password:password,full_name:name||email.split('@')[0]})})
    .then(function(r){return r.json().then(function(d){return{ok:r.ok,d:d}})})
    .then(function(res){
      if(res.ok){token=res.d.access_token;userEmail=email;localStorage.setItem('token',token);localStorage.setItem('userEmail',email);closeModal();showLoggedIn(email);}
      else{showModalMsg(res.d.detail||'Registration failed','error');}
    }).catch(function(){showModalMsg('Connection error','error');})
    .finally(function(){btn.textContent='Create Account';btn.disabled=false;});
  }else{
    var fd=new URLSearchParams();fd.append('username',email);fd.append('password',password);
    fetch(API+'/api/auth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:fd.toString()})
    .then(function(r){return r.json().then(function(d){return{ok:r.ok,d:d}})})
    .then(function(res){
      if(res.ok){token=res.d.access_token;userEmail=email;localStorage.setItem('token',token);localStorage.setItem('userEmail',email);closeModal();showLoggedIn(email);}
      else{showModalMsg(res.d.detail||'Invalid email or password','error');}
    }).catch(function(){showModalMsg('Connection error','error');})
    .finally(function(){btn.textContent='Sign In';btn.disabled=false;});
  }
}
function showLoggedIn(email){
  document.getElementById('nav-actions').innerHTML='<div class="user-pill"><div class="user-avatar">'+email.charAt(0).toUpperCase()+'</div>'+email+'</div><button class="btn btn-ghost btn-sm" onclick="logout()">Sign Out</button>';
  document.getElementById('chat-input').disabled=false;
  document.getElementById('chat-input').placeholder='Ask GeniAI anything…';
  document.getElementById('chat-messages').innerHTML='<div class="msg msg-sys">Welcome! Ask me anything.</div>';
}
function logout(){
  localStorage.removeItem('token');localStorage.removeItem('userEmail');token=null;userEmail=null;
  document.getElementById('nav-actions').innerHTML='<button class="btn btn-ghost btn-sm" onclick="openModal(\'login\')">Sign In</button><button class="btn btn-primary btn-sm" onclick="openModal(\'register\')">Get Started</button>';
  document.getElementById('chat-input').disabled=true;
  document.getElementById('chat-input').placeholder='Ask anything… (sign in first)';
  document.getElementById('chat-messages').innerHTML='<div class="msg msg-sys">Sign in to chat with the AI above</div>';
}
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&!document.getElementById('chat-input').disabled)sendChat();});
function sendChat(){
  if(!token){openModal('login');return;}
  var input=document.getElementById('chat-input'),msg=input.value.trim();
  if(!msg)return;
  input.value='';
  addMsg(msg,'user');
  var thinking=addMsg('…','ai');
  document.getElementById('chat-send').disabled=true;
  fetch(API+'/api/ai/complete',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({message:msg,max_tokens:300})})
  .then(function(r){return r.json()})
  .then(function(d){thinking.textContent=d.content||d.detail||'No response';})
  .catch(function(){thinking.textContent='Connection error';})
  .finally(function(){document.getElementById('chat-send').disabled=false;});
}
function addMsg(text,who){
  var el=document.createElement('div');el.className='msg msg-'+who;el.textContent=text;
  var box=document.getElementById('chat-messages');box.appendChild(el);box.scrollTop=box.scrollHeight;return el;
}
</script>
</body>
</html>"""

@app.get("/", response_class=HTMLResponse, tags=["system"])
async def root():
    return HTMLResponse(content=DASHBOARD_HTML, status_code=200)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "path": str(request.url.path)},
    )
