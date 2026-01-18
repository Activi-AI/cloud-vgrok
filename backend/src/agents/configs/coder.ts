/**
 * Coder Agent - Senior Full-Stack Developer
 * Triggered by code tasks or build failures
 */

import type { AgentConfigWithTriggers } from "../types.js";

export const coderConfig: AgentConfigWithTriggers = {
  id: "coder",
  name: "Coder",
  role: "developer",
  model: "claude-sonnet-4-20250514",
  fallbackModel: "gpt-4o",

  systemPrompt: `Du bist der Coder Agent, ein erfahrener Full-Stack Entwickler.

AKTIVIERUNG: Automatisch bei Code-Tasks oder Build-Fehlern.

KERN-FÄHIGKEITEN:
- TypeScript/JavaScript (Node.js, React, Vue, Next.js)
- Python (FastAPI, Django)
- Swift/SwiftUI (macOS/iOS Apps)
- SQL (PostgreSQL, SQLite)
- Shell/Bash Scripting

ERWEITERTE FÄHIGKEITEN:
- Native macOS App Entwicklung (Apple Silicon optimiert)
- Voice Integration (Whisper API, Apple Speech Framework)
- Email Template System (personalisierbarer Stil)
- Calendar API Integration (Apple Calendar, Google Calendar)

ARBEITSWEISE:
- Code in kleinen, testbaren Schritten
- Immer mit Test-IDs für UI-Elemente: screenName_elementType_beschreibung
- TypeScript strict mode, keine 'any' Types
- JSDoc für alle Funktionen
- Error-Handling für alle API-Aufrufe
- Nach jedem Code-Block: Tester Agent informieren

BEI BUILD FAILURE:
1. Error-Log analysieren
2. Root Cause identifizieren
3. Fix implementieren
4. Erneut builden
5. Bei Erfolg: Evidence dokumentieren

VERBOTEN:
- any Types
- console.log in Production
- Hardcoded Secrets
- Ungetesteter Code`,

  capabilities: [
    "code",
    "debug",
    "implement",
    "refactor",
    "swift_development",
    "voice_integration",
    "email_templates",
    "calendar_sync",
    "native_macos_apps",
  ],

  tools: [
    "file_read",
    "file_write",
    "file_edit",
    "terminal_execute",
    "git_operations",
    "xcode_build",
    "swift_compile",
    "api_test",
    "db_query",
  ],

  priority: 80,
  canDelegate: false,
  maxConcurrentTasks: 3,
  criticality: "HIGH",

  activationType: "trigger",

  triggers: [
    {
      id: "build-failed",
      event: "build_failed",
      enabled: true,
      priority: 95,
      cooldownSeconds: 30,
    },
    {
      id: "test-failed",
      event: "test_failed",
      enabled: true,
      priority: 90,
      cooldownSeconds: 30,
    },
    {
      id: "pr-created",
      event: "pr_created",
      enabled: true,
      priority: 70,
      cooldownSeconds: 60,
    },
  ],
};
