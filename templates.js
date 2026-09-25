/**
 * BRANCHEN-VORLAGEN
 * ===================
 * Startpunkte für den Onboarding-Assistenten (onboarding.js). Enthalten
 * KEINE KI-generierten Inhalte, sondern feste, sofort einsetzbare Beispiele
 * pro Branche. Der Kunde wählt eine Vorlage, sie wird in CONFIG gemergt und
 * landet danach im Settings-Wizard zum Feintunen (Preise, USPs etc. sind
 * als Platzhalter markiert).
 */

const INDUSTRY_TEMPLATES = [

  {
    id: 'immobilien',
    icon: '🏠',
    label: 'Immobilien',
    config: {
      ai: {
        systemPrompt: `Du bist der Elite-Sales-Copilot für eine Immobilienmaklerei. Du unterstützt den Makler in Echtzeit im Kundengespräch.

REGELN:
- IMMER Deutsch
- EXTREM KURZ (2-4 Sätze max!)
- Starte mit Emoji für die Kategorie
- Ende IMMER mit "➜ SAG DAS:" + wörtlicher Satz
- "SKIP" falls irrelevant
- Verkaufsstark aber nie unseriös

PRODUKT/LEISTUNG: [Maklerleistung, Courtage-Modell, Alleinauftrag vs. offener Auftrag, USPs eintragen]`,
      },
      objections: [
        { key: 'provision', emoji: '💰', title: 'Maklerprovision zu hoch', triggers: ['provision', 'courtage', 'zu teuer', 'prozent', 'kosten'], response: 'Verständlich – die Provision ist eine Investition in einen reibungslosen, sicheren Verkauf.\n\n[Hier euren USP zur Provision: Marketing, Käufer-Netzwerk, Preisoptimierung eintragen]', powerMove: 'Was wäre es Ihnen wert, den bestmöglichen Preis ohne monatelangen Leerstand zu erzielen?' },
        { key: 'selbstverkauf', emoji: '🤷', title: 'Will privat verkaufen', triggers: ['selbst verkaufen', 'ohne makler', 'privat', 'brauche keinen makler'], response: 'Kann ich nachvollziehen. Die meisten Privatverkäufer unterschätzen aber Aufwand und Risiko (Preisfindung, Besichtigungen, Vertragsrecht).\n\n[Hier Statistik/Erfahrungswert zu privatem vs. maklergestütztem Verkauf eintragen]', powerMove: 'Darf ich Ihnen unverbindlich zeigen, was eine professionelle Vermarktung für Ihren Verkaufspreis bedeuten würde?' },
        { key: 'alleinauftrag', emoji: '📝', title: 'Kein Alleinauftrag gewünscht', triggers: ['alleinauftrag', 'mehrere makler', 'exklusiv', 'bindung'], response: 'Verstehe die Zurückhaltung. Ein Alleinauftrag heißt aber: eine klare Strategie statt Preisverwässerung durch mehrere Makler gleichzeitig.\n\n[Hier euer Argument für den Alleinauftrag eintragen]', powerMove: 'Lassen Sie uns 8 Wochen mit voller Kraft testen – wenn Sie nicht überzeugt sind, gehen wir getrennte Wege.' },
        { key: 'timing', emoji: '⏳', title: 'Erstmal abwarten', triggers: ['später verkaufen', 'noch nicht', 'markt abwarten', 'preise steigen noch'], response: 'Das Timing ist wichtig – aber der Markt wartet nicht auf uns.\n\n[Hier aktuelle Marktlage/Zinsargument eintragen]', powerMove: 'Lassen Sie uns unverbindlich eine aktuelle Wertermittlung machen, dann haben Sie eine faktenbasierte Entscheidungsgrundlage.' },
      ],
      closings: [
        { name: 'Bewertungs-Close', when: 'Erstkontakt, Eigentümer unsicher', text: 'Lassen Sie uns mit einer kostenlosen, unverbindlichen Wertermittlung starten – dann wissen Sie, woran Sie sind.' },
        { name: 'Termin-Close', when: 'Interesse vorhanden', text: 'Wann passt Ihnen ein Besichtigungstermin vor Ort, damit ich mir ein genaues Bild machen kann?' },
        { name: 'Alleinauftrag-Close', when: 'Nach überzeugender Präsentation', text: 'Lassen Sie uns den Alleinauftrag für 8 Wochen aufsetzen – volle Vermarktungskraft, klare Strategie.' },
      ],
      closingsInfoBox: { title: '💡 EINSTIEG', color: '#e67e22', lines: ['<b>Wertermittlung:</b> kostenlos & unverbindlich', '<b>Alleinauftrag:</b> [Dauer/Konditionen eintragen]'] },
      discovery: [
        'Warum möchten Sie aktuell verkaufen?',
        'Bis wann soll der Verkauf abgeschlossen sein?',
        'Haben Sie bereits eine Preisvorstellung?',
        'Waren schon andere Makler bei Ihnen?',
        'Was ist Ihnen bei der Zusammenarbeit mit einem Makler am wichtigsten?',
      ],
      discoveryInfoBox: { title: '🎯 SPIN-Selling', color: '#8b5cf6', lines: ['<b>S</b>ituation → Warum verkaufen?', '<b>P</b>roblem → Was bremst aktuell?', '<b>I</b>mplication → Was kostet Verzögerung?', '<b>N</b>eed-Payoff → Idealer Ablauf?'] },
    },
  },

  {
    id: 'versicherung',
    icon: '💼',
    label: 'Versicherung / Finanzen',
    config: {
      ai: {
        systemPrompt: `Du bist der Elite-Sales-Copilot für eine Versicherungs-/Finanzberatung. Du unterstützt den Berater in Echtzeit im Kundengespräch.

REGELN:
- IMMER Deutsch
- EXTREM KURZ (2-4 Sätze max!)
- Starte mit Emoji für die Kategorie
- Ende IMMER mit "➜ SAG DAS:" + wörtlicher Satz
- "SKIP" falls irrelevant
- Verkaufsstark aber nie unseriös

PRODUKT/LEISTUNG: [Versicherungssparten, Beratungsansatz, Honorar-/Provisionsmodell eintragen]`,
      },
      objections: [
        { key: 'habe_schon', emoji: '📄', title: 'Habe schon eine Versicherung', triggers: ['habe schon', 'bin schon versichert', 'anderer anbieter', 'läuft doch'], response: 'Gut, dass Sie vorsorgen! Die Frage ist, ob der bestehende Schutz noch zu Ihrer heutigen Lebenssituation passt.\n\n[Hier Argument für kostenlosen Vertragscheck eintragen]', powerMove: 'Darf ich Ihre bestehenden Verträge einmal kostenlos gegenchecken? Oft liegt da ungenutztes Sparpotenzial.' },
        { key: 'zu_teuer', emoji: '💰', title: 'Zu teuer / kein Budget', triggers: ['zu teuer', 'kein geld', 'kann ich mir nicht leisten', 'budget'], response: 'Verstehe ich. Die eigentliche Frage ist aber, was ein fehlender Schutz im Ernstfall kostet.\n\n[Hier Risiko-/Kostenargument eintragen]', powerMove: 'Was würde es Sie finanziell kosten, wenn [Risikofall] eintritt und Sie nicht abgesichert sind?' },
        { key: 'vertrauen', emoji: '🤨', title: 'Vertraue Versicherungen nicht', triggers: ['zahlen eh nicht', 'kleingedruckte', 'abzocke', 'vertrau nicht'], response: 'Verständliche Sorge – es gibt leider schwarze Schafe in der Branche.\n\n[Hier Referenzen/Regulierung/Transparenz-Argument eintragen]', powerMove: 'Ich zeige Ihnen die Bedingungen schwarz auf weiß, bevor Sie irgendetwas unterschreiben.' },
        { key: 'bedenkzeit', emoji: '⏳', title: 'Muss noch überlegen', triggers: ['überlegen', 'nachdenken', 'mit partner besprechen', 'melde mich'], response: 'Klar, das ist eine wichtige Entscheidung. Womit genau tun Sie sich noch schwer?\n\n[Hier typische letzte Einwände adressieren]', powerMove: 'Welche konkrete Frage kann ich Ihnen jetzt noch beantworten, damit Sie sicher entscheiden können?' },
      ],
      closings: [
        { name: 'Vertragscheck-Close', when: 'Bestandskunde/Wechselwillig', text: 'Lassen Sie uns Ihre bestehenden Verträge kostenlos durchleuchten – Sie gehen kein Risiko ein.' },
        { name: 'Bedarfsanalyse-Close', when: 'Neukunde, noch unentschlossen', text: 'Lassen Sie uns in 20 Minuten Ihre konkrete Absicherungslücke ermitteln – ganz unverbindlich.' },
        { name: 'Next-Step-Close', when: 'Gespräch neigt sich dem Ende', text: 'Soll ich Ihnen ein konkretes, unverbindliches Angebot zusammenstellen?' },
      ],
      closingsInfoBox: { title: '💡 EINSTIEG', color: '#e67e22', lines: ['<b>Erstberatung:</b> kostenlos & unverbindlich', '<b>Vertragscheck:</b> [Dauer/Ablauf eintragen]'] },
      discovery: [
        'Welche Versicherungen haben Sie aktuell?',
        'Wann wurden diese zuletzt überprüft?',
        'Was beschäftigt Sie aktuell am meisten in Sachen Absicherung?',
        'Gibt es anstehende Lebensveränderungen (Familie, Job, Immobilie)?',
        'Was ist Ihnen wichtiger: Beitragshöhe oder Leistungsumfang?',
      ],
      discoveryInfoBox: { title: '🎯 SPIN-Selling', color: '#8b5cf6', lines: ['<b>S</b>ituation → Was ist aktuell abgesichert?', '<b>P</b>roblem → Wo gibt es Lücken?', '<b>I</b>mplication → Was passiert im Schadensfall?', '<b>N</b>eed-Payoff → Wie fühlt sich Sicherheit an?'] },
    },
  },

  {
    id: 'saas',
    icon: '💻',
    label: 'SaaS / Software',
    config: {
      ai: {
        systemPrompt: `Du bist der Elite-Sales-Copilot für ein SaaS-Unternehmen. Du unterstützt den Vertriebsmitarbeiter in Echtzeit im Demo-/Sales-Call.

REGELN:
- IMMER Deutsch
- EXTREM KURZ (2-4 Sätze max!)
- Starte mit Emoji für die Kategorie
- Ende IMMER mit "➜ SAG DAS:" + wörtlicher Satz
- "SKIP" falls irrelevant
- Verkaufsstark aber nie unseriös

PRODUKT: [Software-Beschreibung, Pricing-Tiers, Free-Trial/Demo-Bedingungen, USPs eintragen]`,
      },
      objections: [
        { key: 'price', emoji: '💰', title: 'Zu teuer', triggers: ['teuer', 'preis', 'kosten', 'budget', 'zu viel'], response: 'Verstehe ich – Software-Budgets sind eng. Rechnen wir kurz den ROI durch?\n\n[Hier ROI-Argumentation/Zeitersparnis eintragen]', powerMove: 'Was kostet Sie aktuell der Prozess, den unser Tool automatisiert – in Zeit und Geld?' },
        { key: 'alternative', emoji: '🏢', title: 'Nutzen schon Konkurrenzprodukt', triggers: ['nutzen schon', 'anderes tool', 'konkurrenz', 'wechsel zu aufwendig'], response: 'Gut, dass Sie das Problem bereits ernst nehmen! Der Unterschied liegt in [Kern-USP].\n\n[Hier Abgrenzung zur Konkurrenz eintragen]', powerMove: 'Wollen wir die zwei Tools 15 Minuten nebeneinander an Ihrem Use Case vergleichen?' },
        { key: 'integration', emoji: '⚙️', title: 'Technische/Integrations-Bedenken', triggers: ['integration', 'api', 'schnittstelle', 'kompatibel', 'it-abteilung'], response: 'Verständliche Frage. Unsere Lösung ist auf einfache Integration ausgelegt.\n\n[Hier Integrationsdetails/API/SSO eintragen]', powerMove: 'Soll ich unser technisches Team direkt mit Ihrer IT verbinden? Meist ist das in 15 Minuten geklärt.' },
        { key: 'timing', emoji: '⏳', title: 'Kein guter Zeitpunkt', triggers: ['nicht jetzt', 'nächstes quartal', 'gerade keine zeit', 'später'], response: 'Verstehe ich – aber jede Woche ohne Lösung kostet Sie [konkreter Nachteil].\n\n[Hier Dringlichkeitsargument eintragen]', powerMove: 'Lassen Sie uns jetzt zumindest den kostenlosen Trial starten – zeitlich unabhängig testbar.' },
      ],
      closings: [
        { name: 'Trial-Close', when: 'Kunde ist interessiert, aber unentschlossen', text: 'Starten wir mit dem kostenlosen Trial – Sie sehen den Mehrwert an Ihren eigenen Daten.' },
        { name: 'ROI-Close', when: 'Nach Demo, Preis war Thema', text: 'Zusammengefasst: ROI von [X]:1, Setup in [Y] Tagen. Sollen wir loslegen?' },
        { name: 'Next-Step-Close', when: 'Gespräch neigt sich dem Ende', text: 'Was ist der nächste Schritt – Vertrag vorbereiten oder erst intern abstimmen?' },
      ],
      closingsInfoBox: { title: '💡 PAKETE', color: '#e67e22', lines: ['<b>Starter:</b> [Preis/Umfang]', '<b>Pro:</b> [Preis/Umfang]', '<b>Free Trial:</b> [Dauer]'] },
      discovery: [
        'Welches Tool/welchen Prozess nutzt ihr aktuell dafür?',
        'Was funktioniert daran nicht gut?',
        'Wie viele Personen würden das Tool nutzen?',
        'Wer ist an der Kaufentscheidung beteiligt?',
        'Was wäre für euch der Erfolgsmaßstab nach 3 Monaten?',
      ],
      discoveryInfoBox: { title: '🎯 SPIN-Selling', color: '#8b5cf6', lines: ['<b>S</b>ituation → Aktueller Workflow?', '<b>P</b>roblem → Wo hakt es?', '<b>I</b>mplication → Was kostet das Problem?', '<b>N</b>eed-Payoff → Idealzustand?'] },
    },
  },

  {
    id: 'handwerk',
    icon: '🔧',
    label: 'Handwerk / Bau',
    config: {
      ai: {
        systemPrompt: `Du bist der Elite-Sales-Copilot für einen Handwerksbetrieb. Du unterstützt beim Angebots-/Beratungsgespräch mit Kunden.

REGELN:
- IMMER Deutsch
- EXTREM KURZ (2-4 Sätze max!)
- Starte mit Emoji für die Kategorie
- Ende IMMER mit "➜ SAG DAS:" + wörtlicher Satz
- "SKIP" falls irrelevant
- Verkaufsstark aber nie unseriös

LEISTUNG: [Gewerk, Leistungsspektrum, Festpreis vs. Aufmaß, Gewährleistung eintragen]`,
      },
      objections: [
        { key: 'price', emoji: '💰', title: 'Angebot zu teuer', triggers: ['teuer', 'zu viel', 'anderer anbieter billiger', 'günstiger'], response: 'Verstehe ich – bei einem so großen Vorhaben zählt jeder Euro.\n\n[Hier Qualitäts-/Material-/Gewährleistungsargument eintragen]', powerMove: 'Was ist Ihnen wichtiger: der günstigste Preis oder eine Arbeit, die 20 Jahre hält?' },
        { key: 'termin', emoji: '📅', title: 'Terminverfügbarkeit unklar', triggers: ['wann könnt ihr', 'termin', 'wie lange dauert', 'wartezeit'], response: 'Verständliche Frage – Planungssicherheit ist wichtig.\n\n[Hier aktuelle Kapazität/Vorlaufzeit eintragen]', powerMove: 'Ich kann Ihnen einen verbindlichen Starttermin nennen, wenn wir jetzt den Auftrag fixieren.' },
        { key: 'vertrauen', emoji: '🤨', title: 'Kennt den Betrieb nicht', triggers: ['kennen euch nicht', 'referenzen', 'bewertungen', 'seriös'], response: 'Zu Recht eine wichtige Frage bei einer solchen Investition.\n\n[Hier Referenzen/Meisterbetrieb/Bewertungen eintragen]', powerMove: 'Ich zeige Ihnen gerne Referenzprojekte aus Ihrer Nähe – wollen Sie mal vorbeischauen?' },
        { key: 'mehrere_angebote', emoji: '📝', title: 'Holt mehrere Angebote ein', triggers: ['vergleiche noch', 'weitere angebote', 'melde mich noch'], response: 'Absolut nachvollziehbar, das würde ich auch so machen.\n\n[Hier Alleinstellungsmerkmal gegenüber Wettbewerb eintragen]', powerMove: 'Worauf sollten Sie beim Vergleich besonders achten, damit es am Ende wirklich fair ist?' },
      ],
      closings: [
        { name: 'Vor-Ort-Close', when: 'Erstkontakt', text: 'Lassen Sie uns einen kostenlosen Vor-Ort-Termin vereinbaren, dann kann ich Ihnen ein genaues Angebot machen.' },
        { name: 'Termin-Fixier-Close', when: 'Angebot liegt vor, Kunde zögert', text: 'Wenn wir heute unterschreiben, kann ich Ihnen den Termin in [Zeitraum] fest zusagen.' },
        { name: 'Next-Step-Close', when: 'Gespräch neigt sich dem Ende', text: 'Soll ich Ihnen das Angebot schriftlich zusenden, oder unterschreiben wir gleich vor Ort?' },
      ],
      closingsInfoBox: { title: '💡 EINSTIEG', color: '#e67e22', lines: ['<b>Vor-Ort-Termin:</b> kostenlos & unverbindlich', '<b>Angebot:</b> [Gültigkeitsdauer eintragen]'] },
      discovery: [
        'Was genau soll gemacht werden?',
        'Gibt es einen Wunschtermin oder Zeitdruck?',
        'Haben Sie schon eine Vorstellung vom Budget?',
        'Wurden bereits andere Angebote eingeholt?',
        'Was ist Ihnen bei der Ausführung besonders wichtig?',
      ],
      discoveryInfoBox: { title: '🎯 SPIN-Selling', color: '#8b5cf6', lines: ['<b>S</b>ituation → Was liegt vor?', '<b>P</b>roblem → Was ist der Auslöser?', '<b>I</b>mplication → Was passiert ohne Handeln?', '<b>N</b>eed-Payoff → Wunschergebnis?'] },
    },
  },

  {
    id: 'beratung',
    icon: '📊',
    label: 'Beratung / Agentur',
    config: {
      ai: {
        systemPrompt: `Du bist der Elite-Sales-Copilot für eine Beratung/Agentur. Du unterstützt im Erstgespräch/Sales-Call mit potenziellen Kunden.

REGELN:
- IMMER Deutsch
- EXTREM KURZ (2-4 Sätze max!)
- Starte mit Emoji für die Kategorie
- Ende IMMER mit "➜ SAG DAS:" + wörtlicher Satz
- "SKIP" falls irrelevant
- Verkaufsstark aber nie unseriös

LEISTUNG: [Beratungsschwerpunkt, Paket-/Honorarmodell, typische Projektdauer, USPs eintragen]`,
      },
      objections: [
        { key: 'price', emoji: '💰', title: 'Honorar zu hoch', triggers: ['teuer', 'honorar', 'preis', 'budget', 'kosten'], response: 'Verstehe ich – Beratungsleistung wirkt erstmal abstrakt.\n\n[Hier ROI/Ergebnis-Argumentation eintragen]', powerMove: 'Was kostet es Sie, das Problem weitere 6 Monate ungelöst zu lassen?' },
        { key: 'inhouse', emoji: '🏢', title: 'Machen wir lieber inhouse', triggers: ['machen selbst', 'inhouse', 'eigenes team', 'brauchen keine beratung'], response: 'Verständlich – aber oft fehlt intern die Außensicht oder die Zeit dafür.\n\n[Hier Argument für externe Expertise/Geschwindigkeit eintragen]', powerMove: 'Was würde es kosten, ein internes Team für dieses eine Thema aufzubauen?' },
        { key: 'ergebnis_unsicher', emoji: '🤔', title: 'Unsicher über Ergebnis/ROI', triggers: ['bringt das was', 'ergebnis nicht sicher', 'funktioniert das'], response: 'Faire Frage – Sie wollen Planungssicherheit.\n\n[Hier Case Studies/Referenzergebnisse eintragen]', powerMove: 'Darf ich Ihnen 2-3 vergleichbare Projekte mit konkreten Ergebniszahlen zeigen?' },
        { key: 'timing', emoji: '⏳', title: 'Aktuell kein guter Zeitpunkt', triggers: ['später', 'nicht jetzt', 'nächstes quartal', 'keine kapazität'], response: 'Verstehe ich, aber Verzögerung hat auch einen Preis.\n\n[Hier Dringlichkeitsargument eintragen]', powerMove: 'Lassen Sie uns zumindest ein unverbindliches Erstgespräch führen, um die Lage einzuschätzen.' },
      ],
      closings: [
        { name: 'Erstgespräch-Close', when: 'Erstkontakt', text: 'Lassen Sie uns ein kostenloses, unverbindliches Erstgespräch führen, um Ihre Situation genau zu verstehen.' },
        { name: 'Proposal-Close', when: 'Nach Bedarfsanalyse', text: 'Ich erstelle Ihnen ein konkretes Angebot mit Meilensteinen – wann können wir das besprechen?' },
        { name: 'Next-Step-Close', when: 'Gespräch neigt sich dem Ende', text: 'Was ist der nächste logische Schritt? Soll ich Ihnen das Angebot zuschicken?' },
      ],
      closingsInfoBox: { title: '💡 EINSTIEG', color: '#e67e22', lines: ['<b>Erstgespräch:</b> kostenlos & unverbindlich', '<b>Pakete:</b> [Modelle eintragen]'] },
      discovery: [
        'Was ist die aktuelle Herausforderung, die Sie lösen wollen?',
        'Was habt ihr bereits versucht?',
        'Wer ist intern an der Entscheidung beteiligt?',
        'Bis wann soll eine Lösung stehen?',
        'Woran würden Sie den Erfolg des Projekts messen?',
      ],
      discoveryInfoBox: { title: '🎯 SPIN-Selling', color: '#8b5cf6', lines: ['<b>S</b>ituation → Aktuelle Lage?', '<b>P</b>roblem → Wo klemmt es?', '<b>I</b>mplication → Kosten des Status quo?', '<b>N</b>eed-Payoff → Zielbild?'] },
    },
  },

  {
    id: 'ecommerce',
    icon: '🛒',
    label: 'E-Commerce / Handel',
    config: {
      ai: {
        systemPrompt: `Du bist der Elite-Sales-Copilot für einen B2B-Vertrieb im Handel/E-Commerce-Umfeld. Du unterstützt im Verkaufsgespräch mit Geschäftskunden.

REGELN:
- IMMER Deutsch
- EXTREM KURZ (2-4 Sätze max!)
- Starte mit Emoji für die Kategorie
- Ende IMMER mit "➜ SAG DAS:" + wörtlicher Satz
- "SKIP" falls irrelevant
- Verkaufsstark aber nie unseriös

PRODUKT/SORTIMENT: [Produktkategorie, Mindestbestellmengen, Konditionen/Rabattstaffeln, USPs eintragen]`,
      },
      objections: [
        { key: 'price', emoji: '💰', title: 'Preis/Konditionen zu schlecht', triggers: ['zu teuer', 'konditionen', 'rabatt', 'preis', 'margen'], response: 'Verstehe ich – Marge ist entscheidend im Handel.\n\n[Hier Rabattstaffel/Value-Argument eintragen]', powerMove: 'Ab welcher Bestellmenge würde sich das für Sie richtig lohnen? Lassen Sie uns das durchrechnen.' },
        { key: 'lieferzeit', emoji: '📦', title: 'Lieferzeit zu lang', triggers: ['lieferzeit', 'wie schnell', 'lagerbestand', 'verfügbarkeit'], response: 'Verständliche Sorge, gerade bei Nachbestellungen.\n\n[Hier Lieferzeiten/Lagerbestand-Argument eintragen]', powerMove: 'Soll ich prüfen, ob wir Ihre erste Bestellung express liefern können?' },
        { key: 'anderer_lieferant', emoji: '🏢', title: 'Hat schon festen Lieferanten', triggers: ['haben schon lieferanten', 'zufrieden mit', 'wechsel zu aufwendig'], response: 'Gut, dass Sie eine stabile Lieferkette haben. Oft lohnt sich aber ein Zweitlieferant zur Risikostreuung.\n\n[Hier USP gegenüber Bestandslieferant eintragen]', powerMove: 'Wollen wir mit einer kleinen Testbestellung starten, ganz ohne Risiko?' },
        { key: 'mindestbestellmenge', emoji: '📝', title: 'Mindestbestellmenge zu hoch', triggers: ['mindestbestellmenge', 'zu viel auf einmal', 'kleinere menge'], response: 'Verstehe ich, Sie wollen nicht zu viel Kapital binden.\n\n[Hier Flexibilität/Staffelpreise eintragen]', powerMove: 'Lassen Sie uns eine kleinere Startmenge vereinbaren – bei Erfolg skalieren wir hoch.' },
      ],
      closings: [
        { name: 'Testbestellung-Close', when: 'Neukunde, unentschlossen', text: 'Starten wir mit einer kleinen Testbestellung – ohne Risiko, ohne lange Bindung.' },
        { name: 'Konditionen-Close', when: 'Preis war Thema', text: 'Bei einer Jahresabnahme von [X] biete ich Ihnen [Rabatt] – passt das für Sie?' },
        { name: 'Next-Step-Close', when: 'Gespräch neigt sich dem Ende', text: 'Soll ich Ihnen ein konkretes Angebot mit Preisstaffel zusammenstellen?' },
      ],
      closingsInfoBox: { title: '💡 KONDITIONEN', color: '#e67e22', lines: ['<b>Mindestbestellmenge:</b> [eintragen]', '<b>Staffelpreise:</b> [eintragen]'] },
      discovery: [
        'Was verkaufen Sie aktuell, und wo soll unser Sortiment ergänzen?',
        'Wie sieht Ihr aktueller Beschaffungsprozess aus?',
        'Welche Stückzahlen bewegen Sie üblicherweise?',
        'Was ist Ihnen bei einem Lieferanten am wichtigsten – Preis, Zuverlässigkeit, Service?',
        'Gibt es saisonale Spitzen, auf die wir uns einstellen sollten?',
      ],
      discoveryInfoBox: { title: '🎯 SPIN-Selling', color: '#8b5cf6', lines: ['<b>S</b>ituation → Aktuelle Beschaffung?', '<b>P</b>roblem → Wo hakt es?', '<b>I</b>mplication → Kosten von Engpässen?', '<b>N</b>eed-Payoff → Idealprozess?'] },
    },
  },

];
