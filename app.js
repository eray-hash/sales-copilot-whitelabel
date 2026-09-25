/**
 * SALES COPILOT — ENGINE
 * =======================
 * Generischer Kern, unabhängig vom Mandanten. Alle kundenspezifischen
 * Inhalte kommen aus config.js (window.SALES_COPILOT_CONFIG) bzw. aus
 * einem im Browser gespeicherten Override (Settings-Wizard, localStorage).
 * Diese Datei sollte normalerweise NICHT pro Kunde verändert werden müssen.
 */

const DEFAULT_SENTIMENT_KEYWORDS = {
  positive: ['gut','interessant','spannend','ja','genau','stimmt','okay','klingt gut','super','toll','gerne','einverstanden','perfekt','verstehe','logisch','macht sinn','auf jeden fall'],
  negative: ['nein','nicht','teuer','problem','schwierig','aber','leider','bedenken','angst','unsicher','skeptisch','schlecht','enttäuscht','egal','weiß nicht'],
  buying: ['wann','wie schnell','starten','anfangen','los','vertrag','bestellen','buchen','termin','nächste schritte','loslegen'],
};

const SENTIMENT_MAP = {
  buying:  { color:'#22c55e', bg:'#22c55e15', icon:'🔥', label:'KAUFSIGNAL' },
  positive:{ color:'#4ade80', bg:'#4ade8015', icon:'😊', label:'Positiv' },
  warm:    { color:'#a3e635', bg:'#a3e63515', icon:'🙂', label:'Warm' },
  neutral: { color:'#94a3b8', bg:'#94a3b815', icon:'😐', label:'Neutral' },
  cool:    { color:'#f59e0b', bg:'#f59e0b15', icon:'🤨', label:'Kühl' },
  negative:{ color:'#ef4444', bg:'#ef444415', icon:'😟', label:'Negativ' },
};

function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

function loadConfig() {
  const base = deepClone(window.SALES_COPILOT_CONFIG || {});
  let override = null;
  try {
    const raw = localStorage.getItem('lc_config_override');
    if (raw) override = JSON.parse(raw);
  } catch (e) {}
  return override || base;
}

let CONFIG = loadConfig();

function persistConfig() {
  try { localStorage.setItem('lc_config_override', JSON.stringify(CONFIG)); } catch (e) {}
}

function resetConfig() {
  try { localStorage.removeItem('lc_config_override'); } catch (e) {}
  CONFIG = deepClone(window.SALES_COPILOT_CONFIG || {});
}

// ── App state ────────────────────────────────────────────────────────────
let apiKey = '';
try { apiKey = localStorage.getItem('lc_api_key') || ''; } catch(e) {}
let isListening = false;
let autoMode = true;
let sensitivity = 3;
let currentPhase = null;
let activePanel = 'battlecards';
let responses = [];
let pinnedCards = [];
let objectionCount = 0;
let isProcessing = false;
let transcript = '';
let recognition = null;
let buffer = '';
let silenceTimer = null;
let processedSet = new Set();
let callStartTime = null;
let callTimer = null;

function esc(s) { const d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
function locale() { return (CONFIG.language && CONFIG.language.locale) || 'de-DE'; }
function nowTime() { return new Date().toLocaleTimeString(locale(), { hour:'2-digit', minute:'2-digit', second:'2-digit' }); }

// ── Branding ─────────────────────────────────────────────────────────────
function applyBranding() {
  const b = CONFIG.brand || {};
  const colors = b.colors || {};
  const root = document.documentElement.style;
  if (colors.primary) root.setProperty('--primary', colors.primary);
  if (colors.accent) root.setProperty('--accent', colors.accent);
  if (colors.cta) root.setProperty('--cta', colors.cta);

  document.title = (b.productName || 'Sales Copilot') + (b.companyName ? ' · ' + b.companyName : '');
  setText('headerProductName', (b.productName || 'Sales Copilot').toUpperCase());
  setText('headerTagline', (b.tagline || '').toUpperCase());
  setText('headerLogo', b.logoText || 'SC');
  setText('setupLogo', b.logoText || 'SC');
  setText('setupTitle', b.setupHeadline || b.productName || 'Sales Copilot');
  const sub = document.getElementById('setupSub');
  if (sub) sub.innerHTML = b.setupSubline || 'Dein KI-Assistent für Verkaufsgespräche.';
}
function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }

// ── Phases ───────────────────────────────────────────────────────────────
function phases() { return CONFIG.phases || []; }

function buildPhases() {
  const bar = document.getElementById('phasesBar');
  if (!currentPhase && phases().length) currentPhase = phases()[0].id;
  bar.innerHTML = phases().map((p,i) => `
    <button class="phase-btn ${p.id===currentPhase?'active':''}" style="--phase-color:${p.color}" onclick="setPhase('${p.id}')">
      <span>${p.icon}</span><span>${esc(p.label)}</span>${i<phases().length-1?'<span class="phase-arrow">→</span>':''}
    </button>`).join('');
}
function setPhase(id) { currentPhase = id; buildPhases(); }

// ── Sensitivity / Auto toggle ────────────────────────────────────────────
function buildSensitivity() {
  const g = document.getElementById('sensGroup');
  g.innerHTML = [1,2,3,4,5].map(n => `<button class="sens-btn ${n<=sensitivity?'active':'inactive'}" onclick="setSensitivity(${n})">${n}</button>`).join('');
}
function setSensitivity(n) { sensitivity = n; buildSensitivity(); }
function toggleAuto() {
  autoMode = !autoMode;
  const btn = document.getElementById('autoToggle');
  btn.className = `toggle-btn ${autoMode?'on':'off'}`;
  btn.textContent = autoMode ? '⚡AUTO' : '✋MAN';
}

// ── Right panel (Battle Cards / Closing / Discovery / Pinned) ───────────
function objections() { return CONFIG.objections || []; }
function closings() { return CONFIG.closings || []; }
function discovery() { return CONFIG.discovery || []; }

function buildPanelTabs() {
  const tabs = [
    { id:'battlecards', icon:'🛡️', label:'Battle Cards' },
    { id:'closing', icon:'🤝', label:'Closing' },
    { id:'discovery', icon:'🔍', label:'Fragen' },
    { id:'pinned', icon:'📌', label:pinnedCards.length.toString() },
  ];
  document.getElementById('panelTabs').innerHTML = tabs.map(t =>
    `<button class="panel-tab ${t.id===activePanel?'active':''}" onclick="setPanel('${t.id}')">${t.icon} ${t.label}</button>`
  ).join('');
}

function infoBoxHtml(box) {
  if (!box) return '';
  return `<div class="info-box" style="background:${box.color}08;border:1px solid ${box.color}22">
    <div class="info-box-title" style="color:${box.color}">${esc(box.title||'')}</div>
    <div class="info-box-text" style="color:#94a3b8">${(box.lines||[]).map(l=>`<div>• ${l}</div>`).join('')}</div>
  </div>`;
}

function buildPanelContent() {
  const el = document.getElementById('panelContent');
  if (activePanel === 'battlecards') {
    el.innerHTML = '<div class="panel-header">KLICKE AUF EINEN EINWAND FÜR DIE ANTWORT</div>' +
      objections().map((o) => `
        <button class="battle-card" onclick="fireBattleCard('${o.key}')">
          <span class="battle-emoji">${o.emoji||'🛡️'}</span>
          <div>
            <div class="battle-title">${esc(o.title)}</div>
            <div class="battle-triggers">${esc((o.triggers||[]).slice(0,4).join(', '))}...</div>
          </div>
        </button>`).join('');
  } else if (activePanel === 'closing') {
    el.innerHTML = '<div class="panel-header">CLOSING-TECHNIKEN</div>' +
      closings().map((c,i) => `
        <button class="closing-card" onclick="fireClosing(${i})">
          <div class="closing-name">🤝 ${esc(c.name)}</div>
          <div class="closing-when">${esc(c.when)}</div>
        </button>`).join('') +
      infoBoxHtml(CONFIG.closingsInfoBox);
  } else if (activePanel === 'discovery') {
    el.innerHTML = '<div class="panel-header">BEDARFSANALYSE – FRAGEN FÜR DEN KUNDEN</div>' +
      discovery().map((q,i) => `<button class="discovery-card" onclick="copyDiscovery(${i})"><span class="discovery-num">${i+1}.</span>${esc(q)}</button>`).join('') +
      infoBoxHtml(CONFIG.discoveryInfoBox);
  } else if (activePanel === 'pinned') {
    if (!pinnedCards.length) {
      el.innerHTML = '<div class="empty-pinned">📌 Noch keine Karten gepinnt<br><span style="font-size:10px">Klicke 📌 bei einer Antwort</span></div>';
    } else {
      el.innerHTML = pinnedCards.map((r,i) => `
        <div class="pinned-card">
          <div class="pinned-header">
            <span class="pinned-label">${esc(r.category||'📌 Gepinnt')}</span>
            <button class="pinned-remove" onclick="removePin(${i})">✕</button>
          </div>
          ${r.powerMove ? `<div style="color:var(--accent);font-weight:600">➜ ${esc(r.powerMove)}</div>` : `<div style="color:#94a3b8">${esc(r.response.slice(0,120))}...</div>`}
        </div>`).join('');
    }
  }
}
function setPanel(id) { activePanel = id; buildPanelTabs(); buildPanelContent(); }
function removePin(i) { pinnedCards.splice(i,1); buildPanelContent(); buildPanelTabs(); }
function copyDiscovery(i) { const q = discovery()[i]; if (q) navigator.clipboard.writeText(q); }

// ── Sentiment / Objection detection ──────────────────────────────────────
function sentimentKeywords() {
  const cfg = CONFIG.sentimentKeywords || {};
  return {
    positive: cfg.positive && cfg.positive.length ? cfg.positive : DEFAULT_SENTIMENT_KEYWORDS.positive,
    negative: cfg.negative && cfg.negative.length ? cfg.negative : DEFAULT_SENTIMENT_KEYWORDS.negative,
    buying: cfg.buying && cfg.buying.length ? cfg.buying : DEFAULT_SENTIMENT_KEYWORDS.buying,
  };
}

function detectSentiment(text) {
  const l = text.toLowerCase();
  const kw = sentimentKeywords();
  let score = 0;
  kw.positive.forEach(w => { if (l.includes(w)) score++; });
  kw.negative.forEach(w => { if (l.includes(w)) score--; });
  if (kw.buying.some(w => l.includes(w))) return 'buying';
  if (score >= 2) return 'positive';
  if (score <= -2) return 'negative';
  if (score === 1) return 'warm';
  if (score === -1) return 'cool';
  return 'neutral';
}

function detectLocalObjection(text) {
  const l = text.toLowerCase();
  for (const o of objections()) {
    for (const t of (o.triggers||[])) {
      if (t && l.includes(t.toLowerCase())) return o;
    }
  }
  return null;
}

function updateSentiment(s) {
  const c = SENTIMENT_MAP[s] || SENTIMENT_MAP.neutral;
  const el = document.getElementById('sentimentBadge');
  el.style.background = c.bg;
  el.style.borderColor = c.color+'33';
  el.style.color = c.color;
  el.innerHTML = `${c.icon} ${c.label}`;
}
function updateObjCount() { document.getElementById('objectionCount').textContent = objectionCount; }

// ── Feed ─────────────────────────────────────────────────────────────────
function addResponse(r) {
  responses.push(r);
  objectionCount++;
  updateObjCount();

  const empty = document.getElementById('emptyState');
  if (empty) empty.remove();

  const feed = document.getElementById('feed');
  const accentColor = r.source === 'instant' || r.source === 'battlecard' ? 'var(--cta)' : r.source === 'ai' ? 'var(--accent)' : 'var(--purple)';
  const sourceLabel = { instant:'INSTANT', ai:'AI', manual:'MANUELL', battlecard:'BATTLE CARD', closing:'CLOSING' }[r.source] || '';
  const sourceBg = { instant:'#e67e2222', ai:'#4a90d922', manual:'#8b5cf622', battlecard:'#e67e2222', closing:'#22c55e22' }[r.source] || '#4a90d922';
  const sourceColor = { instant:'var(--cta)', ai:'var(--accent)', manual:'var(--purple)', battlecard:'var(--cta)', closing:'#22c55e' }[r.source] || 'var(--accent)';
  const sentC = SENTIMENT_MAP[r.sentiment] || SENTIMENT_MAP.neutral;

  const card = document.createElement('div');
  card.className = 'response-card';
  card.style.setProperty('--card-accent', accentColor);

  card.innerHTML = `
    <div class="card-header">
      <div class="card-meta">
        ${r.category ? `<span class="card-category" style="color:${accentColor}">${esc(r.category)}</span>` : ''}
        <span class="card-badge" style="background:${sourceBg};color:${sourceColor}">${sourceLabel}</span>
        <span class="card-time">${r.time}</span>
        ${r.sentiment ? `<span style="font-size:12px">${sentC.icon}</span>` : ''}
      </div>
      <div class="card-actions">
        <button class="card-action-btn" onclick='pinCard(${responses.length-1})' title="Pinnen">📌</button>
        <button class="card-action-btn" onclick='copyCard(${responses.length-1})' title="Kopieren">📋</button>
      </div>
    </div>
    <div class="card-trigger">„${esc(r.trigger)}"</div>
    <div class="card-response">${esc(r.response)}</div>
    ${r.powerMove ? `
      <div class="power-move">
        <div class="power-move-label">➜ SAG DAS:</div>
        <div class="power-move-text">${esc(r.powerMove)}</div>
      </div>` : ''}
  `;
  feed.appendChild(card);
  card.scrollIntoView({ behavior: 'smooth' });
}

function pinCard(i) {
  if (responses[i]) { pinnedCards.push(responses[i]); buildPanelTabs(); if (activePanel==='pinned') buildPanelContent(); }
}
function copyCard(i) {
  if (!responses[i]) return;
  const r = responses[i];
  navigator.clipboard.writeText(r.response + (r.powerMove ? '\n\n➜ SAG DAS: '+r.powerMove : ''));
}

function showProcessing(show) {
  let el = document.getElementById('processingIndicator');
  if (show && !el) {
    el = document.createElement('div');
    el.id = 'processingIndicator';
    el.className = 'processing';
    el.innerHTML = '<div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div><span class="processing-text">Analysiere...</span>';
    document.getElementById('feed').appendChild(el);
    el.scrollIntoView({ behavior:'smooth' });
  } else if (!show && el) {
    el.remove();
  }
}

// ── Claude API ───────────────────────────────────────────────────────────
async function callAI(text, isManual) {
  if (isProcessing) return;
  isProcessing = true;
  showProcessing(true);

  try {
    const ai = CONFIG.ai || {};
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key': apiKey, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({
        model: ai.model || 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        system: ai.systemPrompt || '',
        messages: [{ role:'user', content: isManual
          ? `Der Vertriebsmitarbeiter braucht jetzt Hilfe:\n"${text}"\nPhase: ${currentPhase}`
          : `Live aus dem Call:\n"${text}"\nPhase: ${currentPhase}\n\nAntwort oder SKIP.`
        }],
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || 'API-Fehler');
    const answer = (data.content && data.content[0] && data.content[0].text) || '';

    if (answer.trim() !== 'SKIP' && answer.trim()) {
      const pmMatch = answer.match(/➜\s*SAG DAS:\s*(.*)/s);
      addResponse({
        trigger: text.slice(0,150),
        response: pmMatch ? answer.slice(0, pmMatch.index).trim() : answer,
        powerMove: pmMatch ? pmMatch[1].trim() : null,
        category: null,
        time: nowTime(),
        source: isManual ? 'manual' : 'ai',
        sentiment: detectSentiment(text),
      });
    }
  } catch (err) {
    const feed = document.getElementById('feed');
    const errEl = document.createElement('div');
    errEl.className = 'error-msg';
    errEl.textContent = 'API-Fehler: ' + err.message;
    feed.appendChild(errEl);
    errEl.scrollIntoView({ behavior:'smooth' });
  } finally {
    isProcessing = false;
    showProcessing(false);
  }
}

function processBuffer(text) {
  const sentiment = detectSentiment(text);
  updateSentiment(sentiment);

  const local = detectLocalObjection(text);
  if (local) {
    const objPhase = phases().find(p => p.id === 'objection');
    if (objPhase) { currentPhase = 'objection'; buildPhases(); }
    addResponse({
      trigger: text.slice(0,150),
      response: local.response,
      powerMove: local.powerMove,
      category: `${local.emoji||''} ${local.title}`.trim(),
      time: nowTime(),
      source: 'instant',
      sentiment,
    });
    return;
  }

  if (sentiment === 'buying') {
    const closePhase = phases().find(p => p.id === 'closing');
    if (closePhase) { currentPhase = 'closing'; buildPhases(); }
    addResponse({
      trigger: text.slice(0,150),
      response: '🚀 KAUFSIGNAL ERKANNT! Der Kunde zeigt Interesse. Jetzt den Sack zumachen!',
      powerMove: 'Sehr gut, lassen Sie uns den nächsten Schritt festlegen. Wann passt es Ihnen?',
      category: '🚀 Kaufsignal',
      time: nowTime(),
      source: 'instant',
      sentiment: 'buying',
    });
    return;
  }

  if (autoMode) callAI(text, false);
}

// ── Speech recognition ───────────────────────────────────────────────────
function toggleMic() { if (isListening) stopMic(); else startMic(); }

function startMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert('Spracherkennung nicht verfügbar – bitte Chrome oder Edge nutzen!'); return; }

  recognition = new SR();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = (CONFIG.language && CONFIG.language.speechLang) || 'de-DE';

  recognition.onresult = (event) => {
    let interim = '', final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) final += t + ' ';
      else interim += t;
    }
    if (interim) document.getElementById('interimText').textContent = interim;
    if (final.trim()) {
      document.getElementById('interimText').textContent = '';
      buffer += final;
      transcript += final;
      const tb = document.getElementById('transcriptBar');
      tb.style.display = 'block';
      document.getElementById('transcriptText').textContent = transcript.slice(-300);

      if (silenceTimer) clearTimeout(silenceTimer);
      const delay = [5000,4000,3000,2000,1500][sensitivity-1] || 3000;
      silenceTimer = setTimeout(() => {
        const buf = buffer.trim();
        if (buf && buf.split(' ').length >= 3 && !processedSet.has(buf)) {
          processedSet.add(buf);
          processBuffer(buf);
        }
        buffer = '';
      }, delay);
    }
  };

  recognition.onerror = (e) => { if (e.error!=='no-speech') console.error('Speech error:', e.error); };
  recognition.onend = () => { if (isListening) try { recognition.start(); } catch(e) {} };

  recognition.start();
  isListening = true;

  const btn = document.getElementById('micBtn');
  btn.className = 'mic-btn stop';
  btn.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#fff;animation:blink 1s infinite;display:inline-block"></span> STOP';
  document.getElementById('micBar').classList.add('listening');
  document.getElementById('liveIndicator').style.display = 'flex';

  if (!callStartTime) {
    callStartTime = Date.now();
    document.getElementById('timerBadge').style.display = 'flex';
    callTimer = setInterval(() => {
      const s = Math.floor((Date.now()-callStartTime)/1000);
      document.getElementById('timerBadge').innerHTML = `⏱ ${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
    }, 1000);
  }
}

function stopMic() {
  if (recognition) { recognition.onend = null; recognition.stop(); }
  if (silenceTimer) clearTimeout(silenceTimer);
  isListening = false;

  const btn = document.getElementById('micBtn');
  btn.className = 'mic-btn start';
  btn.innerHTML = '🎙️ MITHÖREN STARTEN';
  document.getElementById('micBar').classList.remove('listening');
  document.getElementById('liveIndicator').style.display = 'none';
  document.getElementById('interimText').textContent = '';
}

// ── Battle cards / Closing (manual trigger) ──────────────────────────────
function fireBattleCard(key) {
  const o = objections().find(x => x.key === key);
  if (!o) return;
  const objPhase = phases().find(p => p.id === 'objection');
  if (objPhase) { currentPhase = 'objection'; buildPhases(); }
  addResponse({
    trigger: `${o.emoji||''} ${o.title}`.trim(),
    response: o.response,
    powerMove: o.powerMove,
    category: `${o.emoji||''} ${o.title}`.trim(),
    time: nowTime(),
    source: 'battlecard',
    sentiment: 'neutral',
  });
}

function fireClosing(i) {
  const c = closings()[i];
  if (!c) return;
  const closePhase = phases().find(p => p.id === 'closing');
  if (closePhase) { currentPhase = 'closing'; buildPhases(); }
  addResponse({
    trigger: c.name,
    response: `🤝 ${c.name}\n\n${c.when}`,
    powerMove: c.text,
    category: '🤝 Closing',
    time: nowTime(),
    source: 'closing',
    sentiment: 'buying',
  });
}

// ── Manual input ─────────────────────────────────────────────────────────
function submitManual() {
  const inputField = document.getElementById('manualInput');
  const text = inputField.value.trim();
  if (!text || isProcessing) return;
  inputField.value = '';
  document.getElementById('sendBtn').className = 'send-btn disabled';
  callAI(text, true);
}

// ── Setup screen ─────────────────────────────────────────────────────────
function startApp() {
  try {
    const input = document.getElementById('apiKeyInput');
    const key = input ? input.value.trim() : '';
    if (!key) { if (input) input.style.borderColor = '#ef4444'; return; }
    apiKey = key;
    try { localStorage.setItem('lc_api_key', key); } catch(e) {}
    document.getElementById('setupOverlay').style.display = 'none';
    if (typeof shouldShowOnboarding === 'function' && shouldShowOnboarding()) openOnboarding();
  } catch(e) {
    alert('Fehler beim Starten: ' + e.message);
  }
}

// ── Boot ─────────────────────────────────────────────────────────────────
function renderAll() {
  applyBranding();
  buildPhases();
  buildSensitivity();
  buildPanelTabs();
  buildPanelContent();
}

try {
  renderAll();

  document.getElementById('startBtn').addEventListener('click', startApp);
  document.getElementById('micBtn').addEventListener('click', toggleMic);
  document.getElementById('sendBtn').addEventListener('click', submitManual);
  document.getElementById('autoToggle').addEventListener('click', toggleAuto);
  document.getElementById('settingsBtn').addEventListener('click', () => openWizard());
  document.getElementById('setupWizardLink').addEventListener('click', () => openWizard());

  const inputField = document.getElementById('manualInput');
  const sendBtn = document.getElementById('sendBtn');
  inputField.addEventListener('input', () => {
    const hasText = inputField.value.trim().length > 0;
    sendBtn.className = `send-btn ${hasText && !isProcessing ? 'active' : 'disabled'}`;
  });

  if (apiKey) {
    document.getElementById('setupOverlay').style.display = 'none';
    if (typeof shouldShowOnboarding === 'function' && shouldShowOnboarding()) openOnboarding();
  } else {
    const inp = document.getElementById('apiKeyInput'); if (inp) inp.focus();
  }
} catch(e) {
  console.error('Init error:', e);
}
