/**
 * SETTINGS WIZARD
 * ================
 * Lässt CONFIG (aus app.js) im Browser bearbeiten, live anwenden,
 * als JSON exportieren/importieren und in localStorage persistieren.
 * Das exportierte JSON kann 1:1 als config.js-Inhalt für einen neuen
 * Mandanten verwendet werden (Objekt in `window.SALES_COPILOT_CONFIG = ...`).
 */

let wizardTab = 'branding';

const WIZARD_TABS = [
  { id: 'branding', label: 'Branding' },
  { id: 'ai', label: 'KI / Produkt' },
  { id: 'objections', label: 'Einwände' },
  { id: 'closings', label: 'Closing' },
  { id: 'discovery', label: 'Fragen' },
  { id: 'advanced', label: 'Erweitert' },
];

function openWizard() {
  wizardTab = 'branding';
  renderWizard();
  document.getElementById('wizardOverlay').style.display = 'flex';
}
function closeWizard() {
  document.getElementById('wizardOverlay').style.display = 'none';
}
function setWizardTab(id) {
  wizardTab = id;
  renderWizard();
}

function wizardToast(msg) {
  let el = document.getElementById('wizardToast');
  const box = document.querySelector('.wizard-footer');
  if (!box) return;
  if (!el) {
    el = document.createElement('span');
    el.id = 'wizardToast';
    el.style.cssText = 'font-size:11px;color:var(--success);align-self:center;';
    box.appendChild(el);
  }
  el.textContent = msg;
  setTimeout(() => { if (el) el.textContent = ''; }, 2000);
}

function wizardSave() {
  persistConfig();
  renderAll();
  wizardToast('✓ Gespeichert & angewendet');
}

function wizardExport() {
  const name = (CONFIG.brand && CONFIG.brand.companyName || 'sales-copilot').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const blob = new Blob([JSON.stringify(CONFIG, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}-config.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function wizardImportFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      CONFIG = parsed;
      persistConfig();
      renderAll();
      renderWizard();
      wizardToast('✓ Config importiert');
    } catch (e) {
      alert('Ungültige JSON-Datei: ' + e.message);
    }
  };
  reader.readAsText(file);
  input.value = '';
}

function wizardResetDefaults() {
  if (!confirm('Alle Anpassungen verwerfen und auf die Werkseinstellung aus config.js zurücksetzen?')) return;
  resetConfig();
  renderAll();
  renderWizard();
  wizardToast('✓ Zurückgesetzt');
}

function wizardResetApiKey() {
  try { localStorage.removeItem('lc_api_key'); } catch (e) {}
  location.reload();
}

function liveUpdate() { renderAll(); }

// ── Tab renderers ─────────────────────────────────────────────────────────

function tabBranding() {
  const b = CONFIG.brand = CONFIG.brand || {};
  b.colors = b.colors || {};
  return `
    <div class="wizard-row">
      <div class="wizard-field">
        <label>Firmenname</label>
        <input type="text" value="${escAttr(b.companyName)}" oninput="CONFIG.brand.companyName=this.value; liveUpdate()">
      </div>
      <div class="wizard-field">
        <label>Produktname</label>
        <input type="text" value="${escAttr(b.productName)}" oninput="CONFIG.brand.productName=this.value; liveUpdate()">
      </div>
    </div>
    <div class="wizard-row">
      <div class="wizard-field">
        <label>Logo-Kürzel (2-3 Zeichen)</label>
        <input type="text" maxlength="3" value="${escAttr(b.logoText)}" oninput="CONFIG.brand.logoText=this.value; liveUpdate()">
      </div>
      <div class="wizard-field">
        <label>Tagline (Header, klein)</label>
        <input type="text" value="${escAttr(b.tagline)}" oninput="CONFIG.brand.tagline=this.value; liveUpdate()">
      </div>
    </div>
    <div class="wizard-field">
      <label>Setup-Screen Überschrift</label>
      <input type="text" value="${escAttr(b.setupHeadline)}" oninput="CONFIG.brand.setupHeadline=this.value; liveUpdate()">
    </div>
    <div class="wizard-field">
      <label>Setup-Screen Untertext (HTML erlaubt, z.B. &lt;br&gt;)</label>
      <textarea oninput="CONFIG.brand.setupSubline=this.value; liveUpdate()">${esc(b.setupSubline)}</textarea>
    </div>
    <div class="wizard-row">
      <div class="wizard-field">
        <label>Primärfarbe</label>
        <input type="color" value="${b.colors.primary||'#1e3a5f'}" oninput="CONFIG.brand.colors.primary=this.value; liveUpdate()">
      </div>
      <div class="wizard-field">
        <label>Akzentfarbe</label>
        <input type="color" value="${b.colors.accent||'#4a90d9'}" oninput="CONFIG.brand.colors.accent=this.value; liveUpdate()">
      </div>
      <div class="wizard-field">
        <label>CTA-Farbe</label>
        <input type="color" value="${b.colors.cta||'#e67e22'}" oninput="CONFIG.brand.colors.cta=this.value; liveUpdate()">
      </div>
    </div>
  `;
}

function tabAI() {
  const ai = CONFIG.ai = CONFIG.ai || {};
  const lang = CONFIG.language = CONFIG.language || {};
  return `
    <div class="wizard-row">
      <div class="wizard-field">
        <label>Anthropic Model-ID</label>
        <input type="text" value="${escAttr(ai.model)}" oninput="CONFIG.ai.model=this.value">
      </div>
      <div class="wizard-field">
        <label>Sprache Spracherkennung (BCP-47)</label>
        <input type="text" value="${escAttr(lang.speechLang)}" oninput="CONFIG.language.speechLang=this.value">
      </div>
    </div>
    <div class="wizard-field">
      <label>System-Prompt (Produkt, Preise, USPs, Ton-Regeln)</label>
      <textarea style="min-height:280px" oninput="CONFIG.ai.systemPrompt=this.value">${esc(ai.systemPrompt)}</textarea>
    </div>
    <div class="wizard-hint">Das ist der wichtigste Hebel für die Qualität der KI-Antworten. Trage hier Produktbeschreibung, Pakete/Preise und USPs ein.</div>
  `;
}

function tabObjections() {
  const items = CONFIG.objections = CONFIG.objections || [];
  return `
    <div class="wizard-hint">Werden lokal per Keyword-Erkennung ausgelöst (sofort, ohne KI-Call).</div>
    ${items.map((o, i) => `
      <div class="wizard-item">
        <div class="wizard-item-head">
          <span class="wizard-item-title">Einwand ${i+1}</span>
          <button class="wizard-remove" onclick="removeObjection(${i})">✕ entfernen</button>
        </div>
        <div class="wizard-row">
          <div class="wizard-field" style="flex:0 0 70px">
            <label>Emoji</label>
            <input type="text" value="${escAttr(o.emoji)}" oninput="CONFIG.objections[${i}].emoji=this.value; wizardRenderTabOnly()">
          </div>
          <div class="wizard-field">
            <label>Titel</label>
            <input type="text" value="${escAttr(o.title)}" oninput="CONFIG.objections[${i}].title=this.value">
          </div>
          <div class="wizard-field" style="flex:0 0 110px">
            <label>Key (eindeutig)</label>
            <input type="text" value="${escAttr(o.key)}" oninput="CONFIG.objections[${i}].key=this.value">
          </div>
        </div>
        <div class="wizard-field">
          <label>Trigger-Keywords (komma-getrennt)</label>
          <input type="text" value="${escAttr((o.triggers||[]).join(', '))}" oninput="CONFIG.objections[${i}].triggers=this.value.split(',').map(s=>s.trim()).filter(Boolean)">
        </div>
        <div class="wizard-field">
          <label>Antwort</label>
          <textarea oninput="CONFIG.objections[${i}].response=this.value">${esc(o.response)}</textarea>
        </div>
        <div class="wizard-field">
          <label>Power Move (➜ SAG DAS)</label>
          <input type="text" value="${escAttr(o.powerMove)}" oninput="CONFIG.objections[${i}].powerMove=this.value">
        </div>
      </div>
    `).join('')}
    <button class="wizard-btn" onclick="addObjection()">+ Einwand hinzufügen</button>
  `;
}
function addObjection() {
  CONFIG.objections = CONFIG.objections || [];
  CONFIG.objections.push({ key: 'neu_' + Date.now(), emoji: '❓', title: 'Neuer Einwand', triggers: [], response: '', powerMove: '' });
  renderWizard();
}
function removeObjection(i) { CONFIG.objections.splice(i, 1); renderWizard(); }

function tabClosings() {
  const items = CONFIG.closings = CONFIG.closings || [];
  const box = CONFIG.closingsInfoBox = CONFIG.closingsInfoBox || { title: '', color: '#e67e22', lines: [] };
  return `
    ${items.map((c, i) => `
      <div class="wizard-item">
        <div class="wizard-item-head">
          <span class="wizard-item-title">Closing ${i+1}</span>
          <button class="wizard-remove" onclick="removeClosing(${i})">✕ entfernen</button>
        </div>
        <div class="wizard-row">
          <div class="wizard-field">
            <label>Name</label>
            <input type="text" value="${escAttr(c.name)}" oninput="CONFIG.closings[${i}].name=this.value">
          </div>
          <div class="wizard-field">
            <label>Wann einsetzen?</label>
            <input type="text" value="${escAttr(c.when)}" oninput="CONFIG.closings[${i}].when=this.value">
          </div>
        </div>
        <div class="wizard-field">
          <label>Wörtlicher Satz</label>
          <textarea oninput="CONFIG.closings[${i}].text=this.value">${esc(c.text)}</textarea>
        </div>
      </div>
    `).join('')}
    <button class="wizard-btn" onclick="addClosing()">+ Closing hinzufügen</button>
    <div class="wizard-item">
      <div class="wizard-item-title" style="margin-bottom:4px">Info-Box (unten im Closing-Panel, z.B. Preisübersicht)</div>
      <div class="wizard-field">
        <label>Titel</label>
        <input type="text" value="${escAttr(box.title)}" oninput="CONFIG.closingsInfoBox.title=this.value">
      </div>
      <div class="wizard-field">
        <label>Zeilen (eine pro Zeile, HTML erlaubt für &lt;b&gt;)</label>
        <textarea oninput="CONFIG.closingsInfoBox.lines=this.value.split('\\n').filter(Boolean)">${esc((box.lines||[]).join('\n'))}</textarea>
      </div>
    </div>
  `;
}
function addClosing() {
  CONFIG.closings = CONFIG.closings || [];
  CONFIG.closings.push({ name: 'Neues Closing', when: '', text: '' });
  renderWizard();
}
function removeClosing(i) { CONFIG.closings.splice(i, 1); renderWizard(); }

function tabDiscovery() {
  const items = CONFIG.discovery = CONFIG.discovery || [];
  const box = CONFIG.discoveryInfoBox = CONFIG.discoveryInfoBox || { title: '', color: '#8b5cf6', lines: [] };
  return `
    <div class="wizard-field">
      <label>Fragen (eine pro Zeile)</label>
      <textarea style="min-height:180px" oninput="CONFIG.discovery=this.value.split('\\n').filter(Boolean)">${esc(items.join('\n'))}</textarea>
    </div>
    <div class="wizard-item">
      <div class="wizard-item-title" style="margin-bottom:4px">Info-Box (unten im Fragen-Panel, z.B. Gesprächsmethodik)</div>
      <div class="wizard-field">
        <label>Titel</label>
        <input type="text" value="${escAttr(box.title)}" oninput="CONFIG.discoveryInfoBox.title=this.value">
      </div>
      <div class="wizard-field">
        <label>Zeilen (eine pro Zeile, HTML erlaubt für &lt;b&gt;)</label>
        <textarea oninput="CONFIG.discoveryInfoBox.lines=this.value.split('\\n').filter(Boolean)">${esc((box.lines||[]).join('\n'))}</textarea>
      </div>
    </div>
  `;
}

function tabAdvanced() {
  return `
    <div class="wizard-hint">
      Exportiere die aktuelle Konfiguration als JSON, um sie als <code>config.js</code> für einen neuen
      Mandanten zu verwenden (Inhalt in <code>window.SALES_COPILOT_CONFIG = &lt;JSON&gt;</code> einsetzen),
      oder importiere eine zuvor exportierte Datei.
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="wizard-btn primary" onclick="wizardExport()">⬇️ Als JSON exportieren</button>
      <button class="wizard-btn" onclick="document.getElementById('wizardImportInput').click()">⬆️ JSON importieren</button>
      <input type="file" id="wizardImportInput" class="wizard-file-input" accept="application/json" onchange="wizardImportFile(this)">
    </div>
    <div class="wizard-item">
      <div class="wizard-item-title" style="margin-bottom:6px">Zurücksetzen</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="wizard-btn danger" onclick="wizardResetDefaults()">Config auf Werkseinstellung zurücksetzen</button>
        <button class="wizard-btn danger" onclick="wizardResetApiKey()">Gespeicherten API-Key löschen</button>
      </div>
    </div>
  `;
}

const WIZARD_RENDERERS = {
  branding: tabBranding,
  ai: tabAI,
  objections: tabObjections,
  closings: tabClosings,
  discovery: tabDiscovery,
  advanced: tabAdvanced,
};

function wizardRenderTabOnly() {
  const body = document.getElementById('wizardBody');
  if (body) body.innerHTML = WIZARD_RENDERERS[wizardTab]();
}

function renderWizard() {
  const overlay = document.getElementById('wizardOverlay');
  overlay.innerHTML = `
    <div class="wizard-box">
      <div class="wizard-header">
        <div class="wizard-title">⚙️ Sales Copilot konfigurieren</div>
        <button class="wizard-close" onclick="closeWizard()">✕</button>
      </div>
      <div class="wizard-tabs">
        ${WIZARD_TABS.map(t => `<button class="wizard-tab ${t.id===wizardTab?'active':''}" onclick="setWizardTab('${t.id}')">${t.label}</button>`).join('')}
      </div>
      <div class="wizard-body" id="wizardBody">${WIZARD_RENDERERS[wizardTab]()}</div>
      <div class="wizard-footer">
        <button class="wizard-btn" onclick="closeWizard()">Schließen</button>
        <button class="wizard-btn primary" onclick="wizardSave()">💾 Speichern & übernehmen</button>
      </div>
    </div>
  `;
}

function escAttr(s) { return esc(s).replace(/"/g, '&quot;'); }
