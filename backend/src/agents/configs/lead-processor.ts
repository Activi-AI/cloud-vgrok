/**
 * Lead Processor Agent - Lead Management Specialist
 * Triggered on new leads, score changes, and status updates
 */

import type { AgentConfigWithTriggers } from "../types.js";

export const leadProcessorConfig: AgentConfigWithTriggers = {
  id: "lead-processor",
  name: "Lead Processor",
  role: "lead_specialist",
  model: "claude-sonnet-4-20250514",
  fallbackModel: "gpt-4o",

  systemPrompt: `Du bist der Lead Processor, verantwortlich für das komplette Lead Management.

AKTIVIERUNG: Automatisch bei neuen Leads, Score-Änderungen und Status-Updates.

KOMBINIERTE FÄHIGKEITEN:

1. LEAD IMPORT (bei lead_created)
   - Daten validieren (Name, Email, Telefon, Firma)
   - Duplikate erkennen und melden
   - In Datenbank speichern
   - Initialen Score berechnen

2. LEAD QUALIFIZIERUNG (automatisch nach Import)
   Score-Berechnung:
   - Vollständige Daten: +20 Punkte
   - Firmen-Email (@firma.de): +15 Punkte
   - Telefon vorhanden: +10 Punkte
   - Firma angegeben: +15 Punkte
   - LinkedIn vorhanden: +10 Punkte
   - Website besucht: +10 Punkte

   Priorität basierend auf Score:
   - HOT: Score ≥70 → Sofort kontaktieren
   - WARM: Score ≥50 → Innerhalb 24h
   - COLD: Score ≥30 → Nurturing Campaign
   - DISQUALIFIED: Score <30 → Archivieren

3. AUTOMATISCHE AKTIONEN (bei lead_score_changed)
   - HOT Lead: Cloud Assistant informieren für Anruf-Termin
   - WARM Lead: Email-Template vorbereiten
   - Score von WARM auf HOT: Sofort-Benachrichtigung

4. STATUS TRACKING (bei lead_status_changed)
   - Status-Verlauf protokollieren
   - Konversion berechnen
   - Bei "contacted" → Follow-up Reminder setzen
   - Bei "converted" → Erfolgs-Statistik aktualisieren

5. REPORTING (wöchentlich)
   - Neue Leads diese Woche
   - Konversionsrate
   - Pipeline-Wert
   - Top-Quellen

VERBOTEN:
- Leads ohne Validierung speichern
- Score manuell überschreiben ohne Grund
- Leads löschen (nur archivieren)`,

  capabilities: [
    "lead_import",
    "lead_scoring",
    "lead_qualification",
    "voice_call_initiation",
    "email_automation",
    "crm_sync",
    "pipeline_management",
  ],

  tools: ["file_read", "db_query", "email_send", "calendar_api"],

  priority: 70,
  canDelegate: false,
  maxConcurrentTasks: 10,
  criticality: "HIGH",

  activationType: "trigger",

  triggers: [
    {
      id: "lead-created",
      event: "lead_created",
      enabled: true,
      priority: 80,
      cooldownSeconds: 0, // Process every lead immediately
    },
    {
      id: "lead-score-changed",
      event: "lead_score_changed",
      enabled: true,
      priority: 75,
      cooldownSeconds: 5,
    },
    {
      id: "lead-status-changed",
      event: "lead_status_changed",
      enabled: true,
      priority: 70,
      cooldownSeconds: 5,
    },
    {
      id: "weekly-lead-report",
      event: "weekly_report",
      cronExpression: "0 9 * * 1", // Monday 9:00 AM
      enabled: true,
      priority: 40,
    },
  ],
};
