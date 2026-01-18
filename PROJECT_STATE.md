# PROJECT_STATE.md - Cloud Assistant

> **Single Source of Truth** - Diese Datei definiert den aktuellen Stand des Projekts.

**Letzte Aktualisierung:** 2026-01-18
**Version:** 0.1.0 (MVP)

---

## 1. Projekt-Ziel

**Cloud Assistant** ist ein persönlicher AI-Assistent mit nativer macOS App, der automatisch auf Events reagiert (Emails, Kalender, Code-Änderungen) und spezialisierte Agents für verschiedene Aufgaben koordiniert. Der Assistent lernt den Schreibstil des Users und erfordert Bestätigung vor dem Senden von Emails.

---

## 2. Scope

### MVP (Phase 1) ✅ GRUNDGERÜST FERTIG
- [x] Backend Grundstruktur mit Express/TypeScript
- [x] 7 Agent-Konfigurationen mit Trigger-System
- [x] macOS App Grundgerüst (SwiftUI)
- [x] Voice Integration (Apple Speech Framework)
- [x] Email View mit Approval-Flow UI
- [x] Shared Types zwischen Backend/Frontend

### Phase 2 (Backend Completion)
- [ ] Database Schema + Migrations
- [ ] Authentication (JWT)
- [ ] Email Integration (IMAP/SMTP)
- [ ] Calendar Integration
- [ ] AI Chat Integration (Claude API)
- [ ] Swagger Documentation

### Phase 3 (Feature Completion)
- [ ] Email Style Learning
- [ ] Real-time WebSocket Updates
- [ ] Lead Management vollständig
- [ ] macOS App Notifications

### Out of Scope
- iOS App (später)
- Windows/Linux App
- Multi-User Support
- Enterprise Features

---

## 3. Tech-Stack Entscheidungen

| Bereich | Entscheidung | Begründung |
|---------|--------------|------------|
| **Backend** | Node.js + TypeScript | Schnelle Entwicklung, Type Safety |
| **Framework** | Express | Lightweight, flexibel |
| **Database** | SQLite (Dev) → PostgreSQL (Prod) | Einfach für Dev, skalierbar für Prod |
| **AI Primary** | Claude API (Anthropic) | Beste Qualität für Assistenz |
| **AI Fallback** | OpenAI GPT-4o | Backup bei Ausfall |
| **macOS App** | SwiftUI | Native Performance, Apple Silicon |
| **Voice** | Apple Speech Framework | On-device, Privacy |
| **Auth** | JWT | Stateless, skalierbar |
| **Validation** | Zod | Runtime Type Safety |

---

## 4. Freeze (NICHT ändern ohne Genehmigung)

Diese Entscheidungen sind eingefroren:

- **Agent-Struktur:** 7 Agents (Cloud Assistant, Coder, Tester, Security, Docs, DevOps, Lead Processor)
- **Trigger-System:** Event-basierte automatische Aktivierung
- **Approval-Flow:** Emails NIEMALS ohne User-Bestätigung senden
- **Voice:** Apple Speech Framework (on-device)

---

## 5. Aktueller Stand

| Komponente | Status | Notizen |
|------------|--------|---------|
| **Repo** | ✅ erstellt | https://github.com/Activi-AI/cloud-vgrok |
| **Backend** | 🟡 skeleton | Grundstruktur fertig, DB fehlt |
| **macOS App** | 🟡 skeleton | UI fertig, Backend-Verbindung fehlt |
| **Database** | ❌ – | Schema muss erstellt werden |
| **Auth** | ❌ – | JWT muss implementiert werden |
| **Tests** | ❌ – | Keine Tests bisher |
| **Docs** | ❌ – | Swagger fehlt |
| **Deployment** | ❌ – | Nicht deployed |

---

## 6. Erledigte Arbeiten (Detail)

### Backend (11 Dateien)
```
backend/
├── package.json              ✅ Dependencies definiert
├── tsconfig.json             ✅ Strict TypeScript
└── src/
    ├── index.ts              ✅ Express Server mit Endpoints
    ├── agents/
    │   ├── types.ts          ✅ Agent + Trigger Types
    │   └── configs/
    │       ├── index.ts      ✅ Registry + Helper Functions
    │       ├── cloud-assistant.ts  ✅ Always-on Personal Assistant
    │       ├── coder.ts      ✅ Code bei Build-Fehlern
    │       ├── tester.ts     ✅ Tests bei Commits
    │       ├── security.ts   ✅ Security bei PRs
    │       ├── docs.ts       ✅ Docs bei Releases
    │       ├── devops.ts     ✅ DevOps bei Health-Failures
    │       └── lead-processor.ts  ✅ Leads bei Erstellung
    └── services/
        └── trigger-manager.ts  ✅ Automatische Aktivierung
```

### macOS App (10 Dateien)
```
macos-app/CloudAssistant/
├── Package.swift             ✅ Swift Package
└── Sources/
    ├── CloudAssistantApp.swift  ✅ App Entry + AppState
    ├── Views/
    │   ├── ContentView.swift    ✅ Sidebar Navigation
    │   ├── ChatView.swift       ✅ Chat mit Voice
    │   ├── EmailsView.swift     ✅ Email + Approval Flow
    │   ├── CalendarView.swift   ✅ Kalender
    │   ├── SettingsView.swift   ✅ Einstellungen
    │   └── MenuBarView.swift    ✅ Menu Bar Widget
    └── Services/
        ├── VoiceManager.swift   ✅ Speech Recognition + TTS
        └── BackendClient.swift  ✅ API Client
```

### Shared (1 Datei)
```
shared/types/api.ts           ✅ Alle API Types
```

---

## 7. TODO - Nächste Schritte

### Priorität 1: Backend lauffähig machen
- [ ] `cd backend && npm install`
- [ ] `npm run dev` → Server startet
- [ ] `/health` Endpoint testen

### Priorität 2: Database (Step 3)
- [ ] SQLite Setup für Development
- [ ] Schema erstellen:
  ```sql
  users, emails, calendar_events, leads,
  tasks, agent_activations, email_style_training
  ```
- [ ] Migration Scripts

### Priorität 3: Security (Step 4)
- [ ] JWT Authentication
- [ ] Auth Middleware
- [ ] Rate Limiting
- [ ] Input Validation mit Zod

### Priorität 4: API Documentation (Step 5)
- [ ] Swagger/OpenAPI Spec
- [ ] `/api-docs` Endpoint

### Priorität 5: Core Features (Step 6)
- [ ] Claude API Integration
- [ ] Email IMAP/SMTP
- [ ] Calendar API

### Priorität 6: macOS App verbinden
- [ ] Backend URL konfigurieren
- [ ] Login implementieren
- [ ] Real-time Updates (WebSocket)

---

## 8. Offene Fragen

| # | Frage | Status | Antwort |
|---|-------|--------|---------|
| 1 | Welcher Email-Provider? | offen | IMAP/SMTP generisch oder Gmail API? |
| 2 | Welcher Calendar-Provider? | offen | Apple Calendar oder Google? |
| 3 | Wo deployen? | offen | VPS, Render, Fly.io? |

---

## 9. Risiken

| Risiko | Severity | Mitigation |
|--------|----------|------------|
| Email ohne Approval gesendet | critical | Approval-Flow ist Pflicht, keine Bypass-Option |
| Voice-Daten gespeichert | high | On-device Processing, keine Cloud-Speicherung |
| API Keys geleakt | high | Keychain für macOS, ENV für Backend |

---

## 10. Links

| Was | URL |
|-----|-----|
| Repository | https://github.com/Activi-AI/cloud-vgrok |
| Pull Request | https://github.com/Activi-AI/cloud-vgrok/pull/1 |
| Branch | feature/cloud-assistant-mvp |

---

## Changelog

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2026-01-18 | MVP Grundgerüst erstellt (Backend + macOS App + Agents) | Claude Opus 4.5 |
| 2026-01-18 | 7 Agents mit Trigger-System konfiguriert | Claude Opus 4.5 |
| 2026-01-18 | PR #1 erstellt | Claude Opus 4.5 |
