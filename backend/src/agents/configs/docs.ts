/**
 * Docs Agent - Technical Writer & Knowledge Manager
 * Triggered after code changes, releases, and weekly summaries
 */

import type { AgentConfigWithTriggers } from "../types.js";

export const docsConfig: AgentConfigWithTriggers = {
  id: "docs",
  name: "Docs",
  role: "technical_writer",
  model: "claude-sonnet-4-20250514",
  fallbackModel: "gpt-4o",

  systemPrompt: `Du bist der Docs Agent, ein erfahrener Technical Writer.

AKTIVIERUNG: Automatisch nach Releases, größeren Code-Änderungen und wöchentlich.

KERN-FÄHIGKEITEN:
- README Erstellung und Pflege
- API Dokumentation (OpenAPI/Swagger)
- Code-Kommentare (auf Englisch)
- JSDoc/TSDoc

ERWEITERTE FÄHIGKEITEN:
- Voice Command Documentation (alle Sprachbefehle dokumentieren)
- Email Template Documentation (Stil-Guides)
- User Onboarding Guides (macOS App)
- Changelog Generation (automatisch aus Commits)
- Knowledge Base für Personal Assistant

AUTOMATISCHE AUFGABEN:
1. Nach PR Merge: Changelog aktualisieren
2. Wöchentlich: README prüfen, veraltete Docs finden
3. Nach API-Änderung: Swagger aktualisieren
4. Neue Voice Commands: Dokumentation erweitern

FORMAT-REGELN:
- Markdown für alle Docs
- Mermaid für Diagramme
- Screenshots für UI-Docs
- Beispiele für jeden Endpoint
- Code-Beispiele müssen lauffähig sein

CHANGELOG FORMAT:
## [Version] - YYYY-MM-DD
### Added
- Neue Features
### Changed
- Änderungen
### Fixed
- Bug Fixes
### Security
- Sicherheits-Updates`,

  capabilities: [
    "documentation",
    "readme",
    "api-docs",
    "comments",
    "voice_command_docs",
    "style_guides",
    "onboarding_flows",
    "changelog",
    "knowledge_base",
  ],

  tools: ["file_read", "file_write", "file_edit", "git_operations", "web_search"],

  priority: 50,
  canDelegate: false,
  maxConcurrentTasks: 3,
  criticality: "MEDIUM",

  activationType: "trigger",

  triggers: [
    {
      id: "pr-merged-docs",
      event: "pr_merged",
      enabled: true,
      priority: 70,
      cooldownSeconds: 60,
    },
    {
      id: "weekly-docs-review",
      event: "weekly_report",
      cronExpression: "0 10 * * 1", // Monday 10:00 AM
      enabled: true,
      priority: 40,
    },
  ],
};
