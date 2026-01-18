/**
 * Security Agent - Security Analyst & Privacy Officer
 * Triggered on code changes, PR reviews, and security scans
 */

import type { AgentConfigWithTriggers } from "../types.js";

export const securityConfig: AgentConfigWithTriggers = {
  id: "security",
  name: "Security",
  role: "security_analyst",
  model: "claude-sonnet-4-20250514",
  fallbackModel: "gpt-4o",

  systemPrompt: `Du bist der Security Agent, ein erfahrener Security Analyst.

AKTIVIERUNG: Automatisch bei Code-Änderungen, PRs und periodischen Scans.

KERN-FÄHIGKEITEN:
- OWASP Top 10 Analyse
- Input Validation Prüfung
- SQL Injection Prevention
- XSS Prevention
- Dependency Vulnerability Scan

ERWEITERTE FÄHIGKEITEN (Personal Assistant):
- Email Privacy Scanning (PII Detection in Emails)
- Voice Data Security (Prüfen dass keine Aufnahmen gespeichert werden)
- Calendar Data Protection (Meeting-Inhalte verschlüsseln)
- Apple Keychain Integration (sichere Secret-Speicherung)
- OAuth2/PKCE Flows für Mail/Calendar APIs
- GDPR Compliance Check

AUTOMATISCHE SCANS:
1. Bei jedem Code-Commit: Quick Scan
2. Bei jedem PR: Full Scan
3. Täglich um 3:00: Deep Scan aller Dependencies
4. Bei Email mit Attachment: Attachment Scan

STOP-TRIGGER (sofort stoppen bei):
- API Keys in Code gefunden
- Unverschlüsselte Passwörter
- PII in Logs
- Fehlende Auth auf Endpoints
- SQL Injection möglich
- Dependency mit CVE Score > 7

REPORT FORMAT:
- Severity: CRITICAL / HIGH / MEDIUM / LOW
- Location: Datei:Zeile
- Issue: Beschreibung
- Fix: Empfohlene Lösung
- Evidence: Code-Snippet`,

  capabilities: [
    "security",
    "audit",
    "scan",
    "report",
    "pii_detection",
    "keychain_integration",
    "oauth_audit",
    "gdpr_compliance",
    "voice_data_protection",
  ],

  tools: [
    "file_read",
    "terminal_execute",
    "git_operations",
    "db_query",
    "web_search",
  ],

  priority: 95, // Very high - security first
  canDelegate: false,
  maxConcurrentTasks: 5,
  criticality: "CRITICAL",

  activationType: "trigger",

  triggers: [
    {
      id: "code-committed-security",
      event: "code_committed",
      enabled: true,
      priority: 85,
      cooldownSeconds: 5,
    },
    {
      id: "pr-security-review",
      event: "pr_created",
      enabled: true,
      priority: 95,
      cooldownSeconds: 0, // Always scan PRs
    },
    {
      id: "daily-deep-scan",
      event: "cron_expression",
      cronExpression: "0 3 * * *", // 3:00 AM daily
      enabled: true,
      priority: 60,
    },
    {
      id: "email-attachment-scan",
      event: "email_received",
      conditions: [{ field: "hasAttachment", operator: "equals", value: true }],
      enabled: true,
      priority: 80,
      cooldownSeconds: 0,
    },
  ],
};
