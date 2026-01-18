/**
 * Cloud Assistant - Personal AI Assistant Core
 * Always-on agent that orchestrates all modules
 */

import type { AgentConfigWithTriggers } from "../types.js";

export const cloudAssistantConfig: AgentConfigWithTriggers = {
  id: "cloud-assistant",
  name: "Cloud Assistant",
  role: "personal_assistant",
  model: "claude-sonnet-4-20250514",
  fallbackModel: "gpt-4o",

  systemPrompt: `Du bist der Cloud Assistant, der persönliche AI-Assistent.

AKTIVIERUNG: Du bist IMMER aktiv und reagierst auf Events.

KERN-AUFGABEN:

1. TASK MANAGEMENT
   - Tasks erfassen und priorisieren
   - Subtasks an spezialisierte Agents delegieren
   - Fortschritt tracken mit Evidence
   - STOP-Score berechnen bei Risiken

2. EMAIL MANAGEMENT (automatisch bei email_received)
   - Eingehende Emails analysieren
   - Priorität bestimmen: URGENT (sofort), NORMAL (heute), LOW (diese Woche)
   - Antwort-Entwürfe im gelernten Stil erstellen
   - User-Approval einholen vor dem Senden
   - NIEMALS ohne Bestätigung senden!

3. KALENDER MANAGEMENT (automatisch bei calendar_event_soon)
   - 15 Min vor Termin: Reminder mit Kontext
   - Meeting-Konflikte erkennen und melden
   - Meeting-Notizen nach Termin anfordern
   - Nächste Schritte vorschlagen

4. VOICE INTERFACE (automatisch bei wake_word_detected)
   - Sprachbefehle verstehen
   - Natürliche Antworten generieren
   - Hands-free Workflows ermöglichen

5. TÄGLICHE ROUTINE (automatisch bei daily_summary)
   - Morgens: Tagesplan, wichtige Emails, Termine
   - Abends: Zusammenfassung, offene Tasks, morgen wichtig

STIL-LERNEN:
- Aus gesendeten Emails lernen
- Schreibstil adaptieren (formal/informal basierend auf Empfänger)
- Signatur und Anrede merken

APPROVAL FLOW:
- Emails: IMMER User-Bestätigung vor Senden
- Termine erstellen: Bestätigung bei externen Teilnehmern
- Tasks delegieren: Automatisch bei STOP-Score <20

DELEGATION:
- Code-Aufgaben → Coder Agent
- Test-Aufgaben → Tester Agent
- Security-Fragen → Security Agent
- Doku-Aufgaben → Docs Agent
- Lead-Management → Lead Processor`,

  capabilities: [
    "task_orchestration",
    "evidence_collection",
    "email_drafting",
    "style_learning",
    "calendar_management",
    "voice_interaction",
    "approval_workflows",
    "stop_scoring",
  ],

  tools: [
    "file_read",
    "file_write",
    "db_query",
    "email_send",
    "calendar_api",
    "voice_transcribe",
    "voice_synthesize",
  ],

  priority: 100, // Highest priority
  canDelegate: true,
  maxConcurrentTasks: 10,
  criticality: "CRITICAL",

  // ALWAYS ON - like a real assistant
  activationType: "always_on",
  alwaysOn: true,

  triggers: [
    {
      id: "email-incoming",
      event: "email_received",
      enabled: true,
      priority: 90,
      cooldownSeconds: 0, // React to every email
    },
    {
      id: "calendar-reminder",
      event: "calendar_event_soon",
      conditions: [
        { field: "minutesUntil", operator: "less_than", value: 15 },
      ],
      enabled: true,
      priority: 95,
      cooldownSeconds: 0,
    },
    {
      id: "voice-wake",
      event: "wake_word_detected",
      enabled: true,
      priority: 100,
      cooldownSeconds: 1,
    },
    {
      id: "daily-morning",
      event: "daily_summary",
      cronExpression: "0 7 * * *", // 7:00 AM daily
      enabled: true,
      priority: 50,
    },
    {
      id: "daily-evening",
      event: "daily_summary",
      cronExpression: "0 18 * * *", // 6:00 PM daily
      enabled: true,
      priority: 50,
    },
  ],
};
