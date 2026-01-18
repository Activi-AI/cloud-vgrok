/**
 * Agent Configuration Types
 * Defines the structure for all AI agents in the system
 */

export type AgentCapability =
  // Engineering
  | "code"
  | "debug"
  | "implement"
  | "refactor"
  | "swift_development"
  | "voice_integration"
  | "email_templates"
  | "calendar_sync"
  | "native_macos_apps"
  // Testing
  | "test"
  | "qa"
  | "coverage"
  | "xctest"
  | "voice_accuracy_testing"
  | "email_delivery_testing"
  | "accessibility_audit"
  | "performance_profiling"
  // Security
  | "security"
  | "audit"
  | "scan"
  | "report"
  | "pii_detection"
  | "keychain_integration"
  | "oauth_audit"
  | "gdpr_compliance"
  | "voice_data_protection"
  // Documentation
  | "documentation"
  | "readme"
  | "api-docs"
  | "comments"
  | "voice_command_docs"
  | "style_guides"
  | "onboarding_flows"
  | "changelog"
  | "knowledge_base"
  // DevOps
  | "docker"
  | "pm2"
  | "github_actions"
  | "server_monitoring"
  | "log_analysis"
  | "backup_restore"
  | "deployment"
  // Personal Assistant
  | "task_orchestration"
  | "evidence_collection"
  | "email_drafting"
  | "style_learning"
  | "calendar_management"
  | "voice_interaction"
  | "approval_workflows"
  | "stop_scoring"
  // Business
  | "lead_import"
  | "lead_scoring"
  | "lead_qualification"
  | "voice_call_initiation"
  | "email_automation"
  | "crm_sync"
  | "pipeline_management";

export type AgentTool =
  | "file_read"
  | "file_write"
  | "file_edit"
  | "terminal_execute"
  | "git_operations"
  | "xcode_build"
  | "swift_compile"
  | "api_test"
  | "db_query"
  | "web_search"
  | "email_send"
  | "calendar_api"
  | "voice_transcribe"
  | "voice_synthesize";

export type AgentRole =
  | "orchestrator"
  | "developer"
  | "qa_engineer"
  | "security_analyst"
  | "technical_writer"
  | "devops_engineer"
  | "personal_assistant"
  | "lead_specialist";

export type CriticalityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AgentConfig {
  /** Unique identifier for the agent */
  id: string;
  /** Display name */
  name: string;
  /** Agent's role in the system */
  role: AgentRole;
  /** Primary AI model to use */
  model: string;
  /** Fallback AI model */
  fallbackModel: string;
  /** System prompt defining agent behavior */
  systemPrompt: string;
  /** List of capabilities this agent has */
  capabilities: AgentCapability[];
  /** Tools the agent can use */
  tools: AgentTool[];
  /** Priority level for task assignment */
  priority: number;
  /** Whether this agent can delegate to others */
  canDelegate: boolean;
  /** Maximum concurrent tasks */
  maxConcurrentTasks: number;
  /** Criticality level for STOP scoring */
  criticality: CriticalityLevel;
}

export interface AgentModule {
  name: string;
  description: string;
  agents: string[];
  enabled: boolean;
}

export interface ModuleConfig {
  engineering: AgentModule;
  personal: AgentModule;
  business: AgentModule;
}

// ═══════════════════════════════════════════════════════════════
// TRIGGER SYSTEM - Automatische Agent-Aktivierung
// ═══════════════════════════════════════════════════════════════

export type ActivationType = "manual" | "trigger" | "scheduled" | "always_on";

export type TriggerEvent =
  // Email Triggers
  | "email_received"
  | "email_sent"
  | "email_reply_needed"
  // Calendar Triggers
  | "calendar_event_soon"
  | "calendar_event_created"
  | "calendar_conflict_detected"
  // Code Triggers
  | "code_committed"
  | "code_pushed"
  | "pr_created"
  | "pr_merged"
  | "build_failed"
  | "test_failed"
  // Lead Triggers
  | "lead_created"
  | "lead_score_changed"
  | "lead_status_changed"
  // System Triggers
  | "health_check_failed"
  | "error_rate_high"
  | "memory_critical"
  // Voice Triggers
  | "voice_command_received"
  | "wake_word_detected"
  // Time Triggers
  | "daily_summary"
  | "weekly_report"
  | "cron_expression";

export interface TriggerCondition {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than" | "matches";
  value: string | number | boolean;
}

export interface TriggerConfig {
  /** Unique trigger ID */
  id: string;
  /** Event that activates this trigger */
  event: TriggerEvent;
  /** Optional conditions for activation */
  conditions?: TriggerCondition[];
  /** Cron expression for scheduled triggers */
  cronExpression?: string;
  /** Cooldown in seconds between activations */
  cooldownSeconds?: number;
  /** Whether trigger is currently enabled */
  enabled: boolean;
  /** Priority when multiple triggers fire */
  priority: number;
}

export interface AgentConfigWithTriggers extends AgentConfig {
  /** How this agent is activated */
  activationType: ActivationType;
  /** Triggers that activate this agent */
  triggers?: TriggerConfig[];
  /** Whether agent runs continuously in background */
  alwaysOn?: boolean;
}
