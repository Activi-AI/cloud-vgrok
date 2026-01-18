/**
 * DevOps Agent - Infrastructure & Deployment Specialist
 * Triggered on deployments, health failures, and system alerts
 */

import type { AgentConfigWithTriggers } from "../types.js";

export const devopsConfig: AgentConfigWithTriggers = {
  id: "devops",
  name: "DevOps",
  role: "devops_engineer",
  model: "claude-sonnet-4-20250514",
  fallbackModel: "gpt-4o",

  systemPrompt: `Du bist der DevOps Agent, verantwortlich für Infrastruktur und Deployment.

AKTIVIERUNG: Automatisch bei Deployments, Health-Failures und System-Alerts.

FÄHIGKEITEN:
- Docker Container Management
- PM2 Process Management
- GitHub Actions CI/CD
- Server Health Monitoring
- Log Aggregation & Analysis
- Backup & Recovery

AUTOMATISCHE AUFGABEN:

1. BEI HEALTH CHECK FAILURE:
   - Logs analysieren
   - Root Cause identifizieren
   - Automatischer Restart wenn möglich
   - Bei kritischem Fehler: Alert an User

2. BEI HOHER ERROR RATE:
   - Letzte Deployments prüfen
   - Rollback vorbereiten
   - User informieren

3. BEI MEMORY CRITICAL:
   - Memory-intensive Prozesse identifizieren
   - Cache leeren wenn möglich
   - Skalierung vorschlagen

4. TÄGLICHE MAINTENANCE:
   - Log Rotation
   - Disk Space prüfen
   - Backup Verifizierung
   - SSL Cert Expiry Check

DEPLOYMENT WORKFLOW:
1. Pre-Deploy Checks (Tests grün, TypeScript OK, Lint OK)
2. Backup aktueller Version
3. Build erstellen
4. Deploy auf Server
5. Health Check (30s warten)
6. Bei Fehler: Automatischer Rollback
7. Bei Erfolg: Notify User

MONITORING THRESHOLDS:
- CPU > 80% für 5min → WARN
- Memory > 85% → CRITICAL
- Disk > 90% → CRITICAL
- Error Rate > 5% → ALERT
- Response Time > 2s → WARN`,

  capabilities: [
    "docker",
    "pm2",
    "github_actions",
    "server_monitoring",
    "log_analysis",
    "backup_restore",
    "deployment",
  ],

  tools: ["file_read", "file_write", "terminal_execute", "git_operations", "db_query"],

  priority: 90,
  canDelegate: false,
  maxConcurrentTasks: 2,
  criticality: "CRITICAL",

  activationType: "trigger",

  triggers: [
    {
      id: "health-failure",
      event: "health_check_failed",
      enabled: true,
      priority: 100, // Highest
      cooldownSeconds: 30,
    },
    {
      id: "error-rate-high",
      event: "error_rate_high",
      conditions: [{ field: "errorRate", operator: "greater_than", value: 5 }],
      enabled: true,
      priority: 95,
      cooldownSeconds: 60,
    },
    {
      id: "memory-critical",
      event: "memory_critical",
      conditions: [{ field: "memoryPercent", operator: "greater_than", value: 85 }],
      enabled: true,
      priority: 90,
      cooldownSeconds: 120,
    },
    {
      id: "daily-maintenance",
      event: "cron_expression",
      cronExpression: "0 4 * * *", // 4:00 AM daily
      enabled: true,
      priority: 30,
    },
    {
      id: "pr-merged-deploy",
      event: "pr_merged",
      conditions: [{ field: "targetBranch", operator: "equals", value: "main" }],
      enabled: true,
      priority: 85,
      cooldownSeconds: 0,
    },
  ],
};
