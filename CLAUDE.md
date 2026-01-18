# Cloud Assistant (cloud-vgrok) - Regeln

## Sprache
- Antworte auf **Deutsch**
- Code-Kommentare auf **Englisch**

---

## Projekt-Übersicht

**Cloud Assistant** ist ein persönlicher AI-Assistent mit:
- **macOS App** (SwiftUI, Apple Silicon optimiert)
- **Backend** (Node.js/TypeScript)
- **Automatische Agents** (Trigger-basiert, always-on)

### Struktur

```
cloud-vgrok/
├── backend/                 # Node.js/TypeScript Backend
│   ├── src/
│   │   ├── agents/          # Agent Konfigurationen
│   │   │   └── configs/     # Einzelne Agent Configs
│   │   ├── services/        # Business Logic
│   │   └── index.ts         # Entry Point
│   └── tests/
├── macos-app/               # SwiftUI macOS App
│   └── CloudAssistant/
│       └── Sources/
│           ├── Views/       # SwiftUI Views
│           └── Services/    # VoiceManager, BackendClient
├── shared/                  # Geteilte Types
│   └── types/
└── docs/                    # Dokumentation
```

---

## Agents

| Agent | Aktivierung | Beschreibung |
|-------|-------------|--------------|
| **Cloud Assistant** | always_on | Persönlicher Assistent, Email, Kalender |
| **Coder** | trigger | Code-Entwicklung bei Build-Fehlern |
| **Tester** | trigger | Tests nach Code-Commits |
| **Security** | trigger | Security-Scans bei PRs |
| **Docs** | trigger | Dokumentation nach Releases |
| **DevOps** | trigger | Deployment, Health-Monitoring |
| **Lead Processor** | trigger | Lead-Management, Scoring |

### Trigger-Events

```typescript
// Automatische Aktivierung bei:
"email_received"        // → Cloud Assistant
"calendar_event_soon"   // → Cloud Assistant
"build_failed"          // → Coder
"code_committed"        // → Tester
"pr_created"            // → Security, Tester
"health_check_failed"   // → DevOps
"lead_created"          // → Lead Processor
```

---

## Coding Standards

### TypeScript (Backend)
- `strict: true` - Keine `any` Types
- ESM Module
- Zod für Validierung

### Swift (macOS App)
- SwiftUI für UI
- Combine für reaktive Patterns
- `accessibilityIdentifier` für alle UI-Elemente

### Test-IDs (PFLICHT)

```swift
// Swift
.accessibilityIdentifier("screenName_elementType_beschreibung")

// Beispiele:
"chat_button_send"
"emails_list_messages"
"calendar_picker_date"
```

---

## Befehle

```bash
# Backend
cd backend && npm install
npm run dev              # Entwicklung
npm test                 # Tests

# macOS App
cd macos-app/CloudAssistant
swift build              # Build
swift test               # Tests
```

---

## Wichtige Regeln

### 1. Approval Flow (PFLICHT)
Emails werden **NIEMALS** ohne User-Bestätigung gesendet:
```
Draft erstellen → User prüft → Bestätigung → Senden
```

### 2. Trigger-basierte Agents
Agents aktivieren sich automatisch - kein manuelles Starten nötig.

### 3. Voice Integration
- Input: Apple Speech Framework (on-device)
- Output: AVSpeechSynthesizer (kann durch ElevenLabs ersetzt werden)

### 4. Stil-Lernen
Cloud Assistant lernt Schreibstil aus gesendeten Emails.

---

## Git-Workflow

### Branch-Namen
```
feature/beschreibung
fix/beschreibung
hotfix/beschreibung
```

### Commit-Format
```
<type>: <kurze beschreibung>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Verboten
❌ Direkt auf `main` pushen
❌ Force push
❌ Code ohne Tests
❌ Secrets im Code

---

## Vor jedem Commit

- [ ] TypeScript: `npm run typecheck`
- [ ] Tests: `npm test`
- [ ] Alle UI-Elemente haben `accessibilityIdentifier`
- [ ] Keine `.env` oder Secrets
