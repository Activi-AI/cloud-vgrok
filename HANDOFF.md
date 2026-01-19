# HANDOFF - Cloud Assistant (cloud-vgrok)

**Datum:** 2026-01-18
**Session:** MVP Grundgerüst

---

## Repository

**https://github.com/Activi-AI/cloud-vgrok**

| Branch | Status | Beschreibung |
|--------|--------|--------------|
| `staging` | ✅ Aktuell | MVP Code |
| `feature/cloud-assistant-mvp` | ✅ Gepusht | Feature Branch |
| `main` | Template | Nicht anfassen |

---

## Was wurde gemacht

### Backend (11 Dateien)
```
backend/
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript Config
└── src/
    ├── index.ts              # Express Server
    ├── agents/
    │   ├── types.ts          # Agent + Trigger Types
    │   └── configs/
    │       ├── index.ts
    │       ├── cloud-assistant.ts  # Always-on
    │       ├── coder.ts
    │       ├── tester.ts
    │       ├── security.ts
    │       ├── docs.ts
    │       ├── devops.ts
    │       └── lead-processor.ts
    └── services/
        └── trigger-manager.ts
```

### macOS App (10 Dateien)
```
macos-app/CloudAssistant/
├── Package.swift
└── Sources/
    ├── CloudAssistantApp.swift
    ├── Views/
    │   ├── ContentView.swift
    │   ├── ChatView.swift
    │   ├── EmailsView.swift
    │   ├── CalendarView.swift
    │   ├── SettingsView.swift
    │   └── MenuBarView.swift
    └── Services/
        ├── VoiceManager.swift
        └── BackendClient.swift
```

### Shared (1 Datei)
```
shared/types/api.ts
```

---

## 7 Agents mit Triggern

| Agent | Aktivierung | Trigger Events |
|-------|-------------|----------------|
| **Cloud Assistant** | always_on | email_received, calendar_event_soon, wake_word_detected |
| **Coder** | trigger | build_failed, test_failed |
| **Tester** | trigger | code_committed, pr_created |
| **Security** | trigger | pr_created, code_committed |
| **Docs** | trigger | pr_merged |
| **DevOps** | trigger | health_check_failed, memory_critical |
| **Lead Processor** | trigger | lead_created, lead_score_changed |

---

## Nächste Schritte

### Priorität 1: Backend starten
```bash
cd backend
npm install
npm run dev
```

### Priorität 2: Database (Step 3)
- SQLite für Development
- Schema: users, emails, calendar_events, leads, tasks

### Priorität 3: Security (Step 4)
- JWT Authentication
- Rate Limiting
- Input Validation (Zod)

### Priorität 4: Core Features (Step 6)
- Claude API Integration
- Email IMAP/SMTP
- Calendar API

---

## Wichtige Regeln

1. **Approval Flow:** Emails NIEMALS ohne User-Bestätigung senden
2. **Trigger-System:** Agents aktivieren sich automatisch
3. **Voice:** On-device (Apple Speech Framework)
4. **Secrets:** Keychain (macOS), ENV (Backend)

---

## GitHub Account für Push

```bash
# Für Activi-AI Organisation:
gh auth switch -u act-ivi
```

---

## Dokumentation

| Datei | Inhalt |
|-------|--------|
| `PROJECT_STATE.md` | Vollständige TODO-Liste + Status |
| `MASTER_RUNBOOK.md` | Step 0-10 Workflow |
| `CLAUDE.md` | Projekt-Regeln |
| `capabilities.yml` | Test-Anforderungen |

---

## Offene Fragen

1. Email-Provider: IMAP/SMTP oder Gmail API?
2. Calendar: Apple Calendar oder Google?
3. Deployment: VPS, Render, oder Fly.io?

---

**Übergabe abgeschlossen - 2026-01-18**
