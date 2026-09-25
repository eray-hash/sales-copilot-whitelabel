# Sales Copilot — White-Label

Generischer Live-Sales-Assistent (Browser-App, kein Server nötig). Hört per
Web Speech API mit, erkennt Einwände und Kaufsignale per Keyword-Matching
für sofortige "Instant"-Antworten, und ruft für alles andere direkt aus dem
Browser die Anthropic API auf. Rebuild von [eray-hash/sales-copilot](https://github.com/eray-hash/sales-copilot),
aber mit allen kundenspezifischen Inhalten aus dem Code herausgelöst.

## Struktur

| Datei | Zweck | Pro Kunde ändern? |
|---|---|---|
| `index.html` | Markup | Nein |
| `styles.css` | Design | Nein (außer Corporate-Design weicht stark ab) |
| `app.js` | Engine: Speech Recognition, Sentiment-/Einwand-Erkennung, Claude-API-Calls, Feed | Nein |
| `wizard.js` | Settings-Wizard (⚙️) zum Bearbeiten der Config im Browser | Nein |
| `config.js` | **Alle Mandanten-Inhalte**: Branding, Farben, System-Prompt/Produkt, Einwände, Closings, Discovery-Fragen | **Ja — das ist die einzige Datei** |

## Neuen Kunden aufsetzen

Zwei Wege, die sich kombinieren lassen:

1. **`config.js` direkt editieren** (für euch als Agentur am schnellsten):
   Ordner kopieren, `config.js` mit den Kundendaten befüllen (Branding,
   Farben, System-Prompt inkl. Preise/Pakete/USPs, Einwände, Closings,
   Discovery-Fragen), deployen.

2. **Im Browser über den Settings-Wizard** (⚙️-Icon oben rechts, oder
   "Vor dem Start konfigurieren" auf dem Setup-Screen): Alle Felder aus
   `config.js` lassen sich live bearbeiten. Unter dem Tab "Erweitert" kann
   die fertige Config als JSON exportiert werden — dieser Inhalt kann direkt
   in eine neue `config.js` eingesetzt werden (`window.SALES_COPILOT_CONFIG = <JSON>`).
   So kann z.B. auch der Kunde selbst (oder der Vertrieb) Einwände/Closings
   nachjustieren, ohne Code anzufassen.

Änderungen über den Wizard werden zusätzlich in `localStorage` des jeweiligen
Browsers gespeichert und überschreiben `config.js` dort, bis "Auf
Werkseinstellung zurücksetzen" geklickt wird.

## Wichtigster Hebel für die KI-Qualität

`config.js → ai.systemPrompt`: Hier stehen Produktbeschreibung, Pakete/Preise
und Ton-Regeln für die KI. Alles, was nicht durch eine lokale Battle Card
abgedeckt ist, geht als Live-Transkript oder manuelle Eingabe an Claude,
zusammen mit diesem System-Prompt.

## API-Key-Handling (wichtig)

Der Anthropic API Key wird ausschließlich lokal im Browser gespeichert
(`localStorage`) und der Call geht **direkt vom Browser** an
`api.anthropic.com` (`anthropic-dangerous-direct-browser-access`). Das heißt:

- Kein eigener Server/Backend nötig — Deployment z.B. via GitHub Pages.
- Der Key ist im Browser-Network-Tab sichtbar. Das ist für den **internen
  Einsatz durch euer eigenes Vertriebsteam** (bzw. das des Kunden, mit
  eigenem Key) vertretbar, aber **nicht geeignet**, um die App an
  fremde Endkunden weiterzugeben, ohne dass diese ihren eigenen Key
  einsetzen — jeder Nutzer mit DevTools könnte den eingegebenen Key
  auslesen.
- Für ein Modell, bei dem der Key vor den Endnutzern verborgen bleiben soll,
  braucht es einen kleinen Backend-Proxy (z.B. Supabase Edge Function), der
  den Key serverseitig hält. Das ist in dieser Version bewusst nicht
  enthalten, lässt sich aber nachrüsten (nur `callAI()` in `app.js` müsste
  dann gegen den eigenen Proxy statt direkt gegen `api.anthropic.com` gehen).

## Lokal testen

Kein Build-Schritt nötig, aber `fetch` an die Anthropic API benötigt
`http(s)://`, nicht `file://`. Einfach ein statisches Fileserving starten:

```bash
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen.

## Deployment (GitHub Pages)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <neues-repo-url>
git push -u origin main
```

Danach in den Repo-Settings unter "Pages" den `main`-Branch (root) als Quelle
wählen.
