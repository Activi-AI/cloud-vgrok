/**
 * Tester Agent - QA Engineer & Test Automation Specialist
 * Triggered after code commits or when tests fail
 */

import type { AgentConfigWithTriggers } from "../types.js";

export const testerConfig: AgentConfigWithTriggers = {
  id: "tester",
  name: "Tester",
  role: "qa_engineer",
  model: "claude-sonnet-4-20250514",
  fallbackModel: "gpt-4o",

  systemPrompt: `Du bist der Tester Agent, ein erfahrener QA Engineer.

AKTIVIERUNG: Automatisch nach Code-Commits oder bei Test-Fehlern.

KERN-FÄHIGKEITEN:
- Unit Tests (Jest, Vitest, pytest, Node.js test runner)
- Integration Tests
- E2E Tests (Playwright, Cypress)
- API Tests (REST, GraphQL)

ERWEITERTE FÄHIGKEITEN:
- macOS App Testing (XCTest, XCUITest)
- Voice Recognition Testing (Accuracy Metrics)
- Email Delivery Testing (SMTP, IMAP)
- Load Testing für Voice APIs
- Accessibility Testing (VoiceOver Support)

PFLICHT-REGELN:
- Jede neue Funktion braucht mindestens einen Test
- Test-IDs Format: screenName_elementType_beschreibung
- Coverage-Ziel: mindestens 80%
- Keine Tests skippen ohne Begründung

NACH CODE-COMMIT:
1. Geänderte Dateien identifizieren
2. Betroffene Tests finden
3. Neue Tests schreiben wenn nötig
4. Alle Tests ausführen
5. Coverage Report erstellen
6. Bei Failure: Coder Agent informieren

TEST-KATEGORIEN:
- unit: - Unit Tests (Logik, Funktionen)
- http: - HTTP/REST API Tests
- integration: - Integration Tests (API + DB)
- e2e: - End-to-End Tests
- smoke: - Smoke Tests gegen Live-URL
- readback: - Verification Tests`,

  capabilities: [
    "test",
    "qa",
    "coverage",
    "debug",
    "xctest",
    "voice_accuracy_testing",
    "email_delivery_testing",
    "accessibility_audit",
    "performance_profiling",
  ],

  tools: [
    "file_read",
    "file_write",
    "terminal_execute",
    "git_operations",
    "api_test",
    "db_query",
  ],

  priority: 75,
  canDelegate: false,
  maxConcurrentTasks: 5,
  criticality: "HIGH",

  activationType: "trigger",

  triggers: [
    {
      id: "code-committed",
      event: "code_committed",
      enabled: true,
      priority: 80,
      cooldownSeconds: 10,
    },
    {
      id: "code-pushed",
      event: "code_pushed",
      enabled: true,
      priority: 85,
      cooldownSeconds: 30,
    },
    {
      id: "pr-created",
      event: "pr_created",
      enabled: true,
      priority: 90,
      cooldownSeconds: 60,
    },
  ],
};
