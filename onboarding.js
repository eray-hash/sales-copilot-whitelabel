/**
 * ONBOARDING-ASSISTENT
 * ======================
 * Geführter Ersteinrichtungs-Flow für den Endkunden: entweder ein
 * bestehendes Sales-Dokument hochladen, einen kurzen Fragebogen ausfüllen,
 * eine Branchen-Vorlage wählen, oder manuell/leer starten. Die ersten
 * beiden Wege rufen Claude (mit dem bereits vorhandenen API-Key) auf, um
 * einen CONFIG-Entwurf zu generieren. Das Ergebnis landet danach immer im
 * bestehenden Settings-Wizard (wizard.js) zum Prüfen/Freigeben.
 */

let onboardingStep = 'choice';
let onboardingUpload = { fileName: null, base64: null, mediaType: null, pastedText: '' };
let onboardingError = '';

const CONFIG_SCHEMA_PROMPT = `Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt (kein Markdown, keine Erklärung, kein Codeblock-Fence) exakt in diesem Schema:

{
  "brand": { "companyName": string, "productName": string, "tagline": string },
  "ai": { "systemPrompt": string },
  "objections": [ { "key": string, "emoji": string, "title": string, "triggers": string[], "response": string, "powerMove": string } ],
  "closings": [ { "name": string, "when": string, "text": string } ],
  "closingsInfoBox": { "title": string, "color": "#e67e22", "lines": string[] },
  "discovery": string[],
  "discoveryInfoBox": { "title": string, "color": "#8b5cf6", "lines": string[] }
}

Regeln für den Inhalt:
- Alles auf Deutsch, außer die Quelle ist eindeutig in einer anderen Sprache.
- "ai.systemPrompt" folgt genau diesem Muster (mit den echten Produktdetails befüllt):
"Du bist der Elite-Sales-Copilot von <Firma>. Du unterstützt den Vertriebsmitarbeiter in Echtzeit im Verkaufsgespräch.\\n\\nREGELN:\\n- IMMER Deutsch\\n- EXTREM KURZ (2-4 Sätze max!)\\n- Starte mit Emoji für die Kategorie\\n- Ende IMMER mit \\"➜ SAG DAS:\\" + wörtlicher Satz\\n- \\"SKIP\\" falls irrelevant\\n- Verkaufsstark aber nie unseriös\\n\\nPRODUKT: <Produktbeschreibung, Preise/Pakete, USPs>"
- 6-10 realistische "objections" mit je 4-8 Trigger-Keywords (Kleinbuchstaben, wie sie im Gespräch fallen würden), einer kurzen Antwort (2-4 Sätze) und einem "powerMove" (ein wörtlicher, verkaufsstarker Satz).
- 4-6 "closings" (Closing-Techniken mit Name, Einsatz-Moment, wörtlichem Satz).
- 5-8 "discovery"-Fragen (offene Bedarfsanalyse-Fragen für den Kunden).
- Erfinde keine falschen Fakten (Preise, Firmennamen) wenn sie aus der Quelle nicht hervorgehen – benutze dann Platzhalter in eckigen Klammern wie [Preis eintragen].`;

function shouldShowOnboarding() {
  let done = false;
  try { done = localStorage.getItem('lc_onboarding_done') === '1'; } catch (e) {}
  let hasOverride = false;
  try { hasOverride = !!localStorage.getItem('lc_config_override'); } catch (e) {}
  return !done && !hasOverride;
}

function markOnboardingDone() {
  try { localStorage.setItem('lc_onboarding_done', '1'); } catch (e) {}
}

function openOnboarding() {
  onboardingStep = 'choice';
  onboardingUpload = { fileName: null, base64: null, mediaType: null, pastedText: '' };
  onboardingQA = {};
  onboardingError = '';
  renderOnboarding();
  document.getElementById('onboardingOverlay').style.display = 'flex';
}

function closeOnboarding(skip) {
  if (skip) markOnboardingDone();
  document.getElementById('onboardingOverlay').style.display = 'none';
}

function onboardingFinish() {
  markOnboardingDone();
  closeOnboarding(false);
  openWizard();
}

// ── Steps ────────────────────────────────────────────────────────────────

function stepChoice() {
  return `
    <div class="ob-header">
      <div class="ob-title">👋 Willkommen! Wie möchtest du starten?</div>
      <div class="ob-sub">Das dauert 2-5 Minuten und du kannst danach alles noch im Detail anpassen.</div>
    </div>
    <div class="choice-grid">
      <button class="choice-card" onclick="onboardingStep='upload'; renderOnboarding()">
        <div class="choice-icon">📄</div>
        <div class="choice-title">Sales-Material hochladen</div>
        <div class="choice-desc">Habt ihr schon ein Skript, Produktblatt oder eine Einwand-Liste? KI extrahiert daraus automatisch alles.</div>
      </button>
      <button class="choice-card" onclick="onboardingStep='questionnaire'; renderOnboarding()">
        <div class="choice-icon">📝</div>
        <div class="choice-title">Kurzer Fragebogen</div>
        <div class="choice-desc">Ein paar Fragen zu Produkt, Zielgruppe und Preisen – KI generiert daraus einen kompletten Entwurf.</div>
      </button>
      <button class="choice-card" onclick="onboardingStep='template'; renderOnboarding()">
        <div class="choice-icon">🏷️</div>
        <div class="choice-title">Branchen-Vorlage wählen</div>
        <div class="choice-desc">Fertige Beispiel-Einwände für eure Branche als Startpunkt – sofort nutzbar, kein KI-Call nötig.</div>
      </button>
      <button class="choice-card" onclick="onboardingFinish()">
        <div class="choice-icon">✏️</div>
        <div class="choice-title">Manuell / leer starten</div>
        <div class="choice-desc">Direkt in den Editor, alles selbst eintragen.</div>
      </button>
    </div>
  `;
}

function stepUpload() {
  return `
    <div class="ob-header">
      <div class="ob-title">📄 Sales-Material hochladen</div>
      <div class="ob-sub">PDF oder Text-Datei (.txt/.md) hochladen, oder Text direkt einfügen. Die KI liest daraus Produkt, Einwände, Closings und Fragen heraus.</div>
    </div>
    <div class="upload-zone" id="uploadZone" onclick="document.getElementById('obFileInput').click()">
      <div style="font-size:28px">${onboardingUpload.fileName ? '✅' : '⬆️'}</div>
      <div style="font-weight:700;margin-top:6px">${onboardingUpload.fileName ? esc(onboardingUpload.fileName) : 'Datei auswählen (PDF, .txt, .md)'}</div>
      <div class="wizard-hint" style="margin-top:4px">Klicken zum Auswählen</div>
    </div>
    <input type="file" id="obFileInput" class="wizard-file-input" accept="application/pdf,.txt,.md,text/plain" onchange="onboardingHandleFile(this)">
    <div class="wizard-hint" style="text-align:center">— oder —</div>
    <div class="wizard-field">
      <label>Text einfügen (z.B. bestehendes Skript, Produktbeschreibung)</label>
      <textarea id="obPastedText" style="min-height:160px" oninput="onboardingUpload.pastedText=this.value" placeholder="Hier Text einfügen...">${esc(onboardingUpload.pastedText)}</textarea>
    </div>
    ${onboardingError ? `<div class="error-msg">${esc(onboardingError)}</div>` : ''}
    <div class="ob-actions">
      <button class="wizard-btn" onclick="onboardingStep='choice'; renderOnboarding()">← Zurück</button>
      <button class="wizard-btn primary" onclick="onboardingGenerateFromUpload()">Weiter → KI generiert Entwurf</button>
    </div>
  `;
}

const QUESTIONNAIRE_FIELDS = [
  { id: 'company', label: 'Firmenname', placeholder: 'z.B. Acme AI' },
  { id: 'product', label: 'Was verkauft ihr? (Produkt/Dienstleistung)', textarea: true, placeholder: 'Kurze Beschreibung...' },
  { id: 'audience', label: 'Wer ist eure Zielgruppe?', placeholder: 'z.B. Mittelständische Handwerksbetriebe' },
  { id: 'pricing', label: 'Preise / Pakete', textarea: true, placeholder: 'z.B. Basis 499€/Monat, Premium 999€/Monat' },
  { id: 'usps', label: 'Eure wichtigsten USPs', textarea: true, placeholder: 'Was macht euch besser als die Konkurrenz?' },
  { id: 'objections', label: 'Häufigste Einwände (falls bekannt, sonst leer lassen)', textarea: true, placeholder: 'z.B. zu teuer, kein Bedarf, DSGVO...' },
  { id: 'tone', label: 'Tonalität', placeholder: 'z.B. seriös & bodenständig, oder locker & direkt' },
];

function stepQuestionnaire() {
  return `
    <div class="ob-header">
      <div class="ob-title">📝 Kurzer Fragebogen</div>
      <div class="ob-sub">Je mehr Details, desto besser der KI-Entwurf. Pflichtfeld: nur Firmenname & Produkt.</div>
    </div>
    ${QUESTIONNAIRE_FIELDS.map(f => `
      <div class="wizard-field">
        <label>${esc(f.label)}</label>
        ${f.textarea
          ? `<textarea id="qa_${f.id}" placeholder="${escAttr(f.placeholder)}" oninput="onboardingQA.${f.id}=this.value">${esc(onboardingQA[f.id] || '')}</textarea>`
          : `<input type="text" id="qa_${f.id}" value="${escAttr(onboardingQA[f.id] || '')}" placeholder="${escAttr(f.placeholder)}" oninput="onboardingQA.${f.id}=this.value">`}
      </div>
    `).join('')}
    ${onboardingError ? `<div class="error-msg">${esc(onboardingError)}</div>` : ''}
    <div class="ob-actions">
      <button class="wizard-btn" onclick="onboardingStep='choice'; renderOnboarding()">← Zurück</button>
      <button class="wizard-btn primary" onclick="onboardingGenerateFromQuestionnaire()">Weiter → KI generiert Entwurf</button>
    </div>
  `;
}
let onboardingQA = {};

function stepTemplate() {
  return `
    <div class="ob-header">
      <div class="ob-title">🏷️ Branchen-Vorlage wählen</div>
      <div class="ob-sub">Sofort einsetzbar, kein KI-Call. Preise/Details danach im Editor anpassen.</div>
    </div>
    <div class="choice-grid">
      ${INDUSTRY_TEMPLATES.map(t => `
        <button class="choice-card" onclick="onboardingApplyTemplate('${t.id}')">
          <div class="choice-icon">${t.icon}</div>
          <div class="choice-title">${esc(t.label)}</div>
        </button>
      `).join('')}
    </div>
    <div class="ob-actions">
      <button class="wizard-btn" onclick="onboardingStep='choice'; renderOnboarding()">← Zurück</button>
    </div>
  `;
}

function stepGenerating() {
  return `
    <div class="ob-header" style="text-align:center;padding:40px 0">
      <div class="dots" style="justify-content:center;margin-bottom:14px"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
      <div class="ob-title">KI generiert deinen Entwurf...</div>
      <div class="ob-sub">Das kann bis zu 30 Sekunden dauern.</div>
    </div>
  `;
}

function stepError() {
  return `
    <div class="ob-header">
      <div class="ob-title">⚠️ Da ist etwas schiefgelaufen</div>
    </div>
    <div class="error-msg">${esc(onboardingError)}</div>
    <div class="ob-actions">
      <button class="wizard-btn" onclick="onboardingStep='choice'; renderOnboarding()">← Zurück zur Auswahl</button>
    </div>
  `;
}

const ONBOARDING_STEPS = {
  choice: stepChoice,
  upload: stepUpload,
  questionnaire: stepQuestionnaire,
  template: stepTemplate,
  generating: stepGenerating,
  error: stepError,
};

function renderOnboarding() {
  const overlay = document.getElementById('onboardingOverlay');
  overlay.innerHTML = `
    <div class="onboarding-box">
      <div class="wizard-header">
        <div class="wizard-title">🚀 Setup-Assistent</div>
        <button class="wizard-close" onclick="closeOnboarding(true)" title="Überspringen, direkt zur App">✕</button>
      </div>
      <div class="onboarding-body">${ONBOARDING_STEPS[onboardingStep]()}</div>
    </div>
  `;
}

// ── File handling ────────────────────────────────────────────────────────

function onboardingHandleFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  onboardingError = '';
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  const reader = new FileReader();
  if (isPdf) {
    reader.onload = () => {
      const dataUrl = reader.result;
      onboardingUpload.base64 = dataUrl.split(',')[1] || '';
      onboardingUpload.mediaType = 'application/pdf';
      onboardingUpload.fileName = file.name;
      renderOnboarding();
    };
    reader.readAsDataURL(file);
  } else {
    reader.onload = () => {
      onboardingUpload.pastedText = reader.result;
      onboardingUpload.base64 = null;
      onboardingUpload.mediaType = null;
      onboardingUpload.fileName = file.name;
      renderOnboarding();
    };
    reader.readAsText(file);
  }
}

// ── AI generation ────────────────────────────────────────────────────────

function extractJson(raw) {
  let s = raw.trim();
  s = s.replace(/^```(json)?/i, '').replace(/```$/,'').trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Keine JSON-Antwort erhalten.');
  return JSON.parse(s.slice(start, end + 1));
}

function mergeDraftIntoConfig(draft) {
  if (draft.brand) {
    CONFIG.brand = CONFIG.brand || {};
    Object.assign(CONFIG.brand, draft.brand);
  }
  if (draft.ai && draft.ai.systemPrompt) {
    CONFIG.ai = CONFIG.ai || {};
    CONFIG.ai.systemPrompt = draft.ai.systemPrompt;
  }
  if (Array.isArray(draft.objections) && draft.objections.length) {
    const seen = new Set();
    CONFIG.objections = draft.objections.map((o, i) => {
      let key = (o.key || o.title || ('obj' + i)).toString().toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30) || ('obj' + i);
      while (seen.has(key)) key = key + '_' + i;
      seen.add(key);
      return {
        key,
        emoji: o.emoji || '❓',
        title: o.title || 'Einwand',
        triggers: Array.isArray(o.triggers) ? o.triggers : [],
        response: o.response || '',
        powerMove: o.powerMove || '',
      };
    });
  }
  if (Array.isArray(draft.closings) && draft.closings.length) CONFIG.closings = draft.closings;
  if (draft.closingsInfoBox) CONFIG.closingsInfoBox = draft.closingsInfoBox;
  if (Array.isArray(draft.discovery) && draft.discovery.length) CONFIG.discovery = draft.discovery;
  if (draft.discoveryInfoBox) CONFIG.discoveryInfoBox = draft.discoveryInfoBox;
}

async function callOnboardingAI(userContent) {
  const ai = CONFIG.ai || {};
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'anthropic-beta': 'pdfs-2024-09-25',
    },
    body: JSON.stringify({
      model: ai.model || 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      system: CONFIG_SCHEMA_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'API-Fehler');
  const text = (data.content && data.content[0] && data.content[0].text) || '';
  return extractJson(text);
}

async function onboardingGenerateFromUpload() {
  if (!onboardingUpload.base64 && !onboardingUpload.pastedText.trim()) {
    onboardingError = 'Bitte eine Datei hochladen oder Text einfügen.';
    renderOnboarding();
    return;
  }
  onboardingStep = 'generating';
  onboardingError = '';
  renderOnboarding();
  try {
    const content = [];
    if (onboardingUpload.base64) {
      content.push({ type: 'document', source: { type: 'base64', media_type: onboardingUpload.mediaType, data: onboardingUpload.base64 } });
    }
    content.push({ type: 'text', text: onboardingUpload.pastedText.trim()
      ? `Zusätzlicher Text/Kontext:\n${onboardingUpload.pastedText.trim()}\n\nErstelle daraus die Config gemäß Schema.`
      : 'Erstelle aus dem beigefügten Dokument die Config gemäß Schema.' });
    const draft = await callOnboardingAI(content);
    mergeDraftIntoConfig(draft);
    onboardingFinish();
  } catch (err) {
    onboardingError = err.message;
    onboardingStep = 'upload';
    renderOnboarding();
  }
}

async function onboardingGenerateFromQuestionnaire() {
  if (!(onboardingQA.company || '').trim() || !(onboardingQA.product || '').trim()) {
    onboardingError = 'Bitte mindestens Firmenname und Produkt ausfüllen.';
    renderOnboarding();
    return;
  }
  onboardingStep = 'generating';
  onboardingError = '';
  renderOnboarding();
  try {
    const lines = QUESTIONNAIRE_FIELDS.map(f => `${f.label}: ${(onboardingQA[f.id] || '(keine Angabe)').trim()}`).join('\n');
    const draft = await callOnboardingAI([{ type: 'text', text: `Erstelle die Config gemäß Schema auf Basis dieser Angaben:\n\n${lines}` }]);
    mergeDraftIntoConfig(draft);
    onboardingFinish();
  } catch (err) {
    onboardingError = err.message;
    onboardingStep = 'questionnaire';
    renderOnboarding();
  }
}

function onboardingApplyTemplate(id) {
  const t = INDUSTRY_TEMPLATES.find(x => x.id === id);
  if (!t) return;
  mergeDraftIntoConfig(t.config);
  onboardingFinish();
}
