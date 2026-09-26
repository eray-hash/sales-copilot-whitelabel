/**
 * SALES COPILOT — MANDANTEN-KONFIGURATION
 * ========================================
 * Das ist die EINZIGE Datei, die pro Kunde angepasst werden muss.
 * index.html, styles.css und app.js bleiben für alle Kunden identisch.
 *
 * Du kannst diese Datei entweder direkt editieren, oder die App öffnen,
 * im ⚙️-Menü alles einstellen und dort als JSON exportieren/importieren.
 *
 * Alle Felder sind Strings/Arrays — keine Logik hier, nur Inhalte.
 */
window.SALES_COPILOT_CONFIG = {

  // ── BRANDING ──────────────────────────────────────────────────────────
  brand: {
    companyName: "Fundament IT",          // Firmenname (Setup-Screen, Titel)
    productName: "Sales Copilot",         // Produktname (Header)
    logoText: "FI",                       // Fallback-Kürzel, falls logoImage nicht lädt
    logoImage: "assets/fundament-it-logo.svg", // echtes Logo (F-Monogramm, Violett→Türkis-Verlauf)
    tagline: "SALES ENGINE",              // kleine Zeile unter dem Produktnamen im Header
    setupHeadline: "Sales Copilot",
    setupSubline: "Dein KI-Assistent für Verkaufsgespräche.<br>Hört mit, erkennt Einwände, liefert Antworten in Echtzeit.",
    colors: {
      primary: "#7c3aed",   // Violett (Corporate-Farbe Fundament IT)
      accent: "#14b8a6",    // Türkis (Corporate-Farbe Fundament IT)
      cta: "#e2703f"        // Warmes Terracotta (Fundament-IT-Akzent für CTAs)
    }
  },

  // ── SPRACHE ───────────────────────────────────────────────────────────
  language: {
    speechLang: "de-DE",   // Sprache für die Live-Spracherkennung (Web Speech API)
    locale: "de-DE"        // Locale für Zeitstempel-Formatierung
  },

  // ── KI / PRODUKT ──────────────────────────────────────────────────────
  ai: {
    // Anthropic Model-ID für die direkten Browser-API-Calls.
    model: "claude-sonnet-4-5-20250929",
    // Alles, was die KI über euer Produkt/Angebot wissen soll (Preise,
    // Pakete, USPs, Regeln für den Ton). Das ist der wichtigste Hebel
    // für die Qualität der KI-Antworten.
    systemPrompt: `Du bist der Elite-Sales-Copilot von Acme AI. Du unterstützt den Vertriebsmitarbeiter in Echtzeit im Verkaufsgespräch.

REGELN:
- IMMER Deutsch
- EXTREM KURZ (2-4 Sätze max!)
- Starte mit Emoji für die Kategorie
- Ende IMMER mit "➜ SAG DAS:" + wörtlicher Satz
- "SKIP" falls irrelevant
- Verkaufsstark aber nie unseriös

PRODUKT: [Hier Produktbeschreibung, Pakete, Preise, USPs eintragen]`,
  },

  // ── GESPRÄCHSPHASEN ───────────────────────────────────────────────────
  phases: [
    { id: "opening", label: "Begrüßung", icon: "👋", color: "#4a90d9" },
    { id: "discovery", label: "Bedarfsanalyse", icon: "🔍", color: "#8b5cf6" },
    { id: "presentation", label: "Präsentation", icon: "🎯", color: "#e67e22" },
    { id: "objection", label: "Einwände", icon: "🛡️", color: "#ef4444" },
    { id: "closing", label: "Abschluss", icon: "🤝", color: "#22c55e" },
  ],

  // ── EINWÄNDE / BATTLE CARDS ───────────────────────────────────────────
  // Jeder Eintrag wird lokal per Keyword-Erkennung ausgelöst (kein KI-Call
  // nötig, daher "instant"). "triggers" sind Keywords, die im Live-Transkript
  // gesucht werden.
  objections: [
    {
      key: "price",
      emoji: "💰",
      title: "Preiseinwand",
      triggers: ["teuer", "preis", "kosten", "budget", "günstig", "zu viel"],
      response: "Das verstehe ich – Investitionen wollen gut überlegt sein.\n\n[Hier eure ROI-Argumentation eintragen]",
      powerMove: "Was wäre es Ihnen wert, wenn [konkreter Nutzen]?",
    },
    {
      key: "noNeed",
      emoji: "🤔",
      title: "Kein Bedarf",
      triggers: ["brauchen wir nicht", "kein bedarf", "kommen zurecht", "passt schon"],
      response: "Das respektiere ich. Darf ich eine ehrliche Frage stellen?\n\n[Hier eure Argumentation eintragen]",
      powerMove: "Welche Aufgabe frisst bei Ihnen die meiste Zeit?",
    },
    {
      key: "trust",
      emoji: "🤨",
      title: "Vertrauensbedenken",
      triggers: ["kennen wir nicht", "wer seid ihr", "referenz", "erfahrung", "seriös"],
      response: "Berechtigte Frage – Sie sollten wissen, mit wem Sie arbeiten.\n\n[Hier Referenzen/Credibility eintragen]",
      powerMove: "Soll ich Ihnen Referenzen aus Ihrer Branche schicken?",
    },
  ],

  // ── CLOSING-TECHNIKEN ─────────────────────────────────────────────────
  closings: [
    { name: "Alternativ-Close", when: "Kunde ist grundsätzlich interessiert", text: "Möchten Sie mit Paket A oder Paket B starten?" },
    { name: "Next-Step-Close", when: "Gespräch neigt sich dem Ende", text: "Was ist der nächste logische Schritt? Soll ich Ihnen ein Angebot schicken?" },
  ],
  // Optionale Info-Box unten im Closing-Panel (z.B. Preisanker/Pakete)
  closingsInfoBox: {
    title: "💡 PAKETE",
    color: "#e67e22",
    lines: [
      "<b>Paket A:</b> [Preis/Umfang]",
      "<b>Paket B:</b> [Preis/Umfang]",
    ],
  },

  // ── BEDARFSANALYSE-FRAGEN ─────────────────────────────────────────────
  discovery: [
    "Wie sieht Ihr aktueller Prozess dafür aus?",
    "Welche wiederkehrenden Aufgaben kosten Ihr Team die meiste Zeit?",
    "Wer entscheidet bei Ihnen über neue Investitionen?",
    "Was wäre für Sie messbarer Erfolg nach 3 Monaten?",
  ],
  // Optionale Info-Box unten im Discovery-Panel
  discoveryInfoBox: {
    title: "🎯 SPIN-Selling",
    color: "#8b5cf6",
    lines: [
      "<b>S</b>ituation → Wie arbeiten Sie aktuell?",
      "<b>P</b>roblem → Wo klemmt es?",
      "<b>I</b>mplication → Was kostet das Problem?",
      "<b>N</b>eed-Payoff → Idealer Zustand?",
    ],
  },

  // ── SENTIMENT-KEYWORDS (optional, hat sinnvolle Defaults in app.js) ───
  sentimentKeywords: {
    positive: ["gut", "interessant", "spannend", "ja", "genau", "stimmt", "super", "perfekt"],
    negative: ["nein", "nicht", "teuer", "problem", "schwierig", "leider", "bedenken", "skeptisch"],
    buying: ["wann", "wie schnell", "starten", "anfangen", "vertrag", "buchen", "termin", "loslegen"],
  },
};
