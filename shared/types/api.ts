/**
 * Shared API Types
 * Used by both Backend (TypeScript) and can be referenced by macOS App
 */

// ═══════════════════════════════════════════════════════════════
// CHAT
// ═══════════════════════════════════════════════════════════════

export interface ChatRequest {
  message: string;
  context?: Record<string, unknown>;
}

export interface ChatResponse {
  content: string;
  agentId?: string;
  taskId?: string;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════
// EMAIL
// ═══════════════════════════════════════════════════════════════

export type EmailPriority = "urgent" | "normal" | "low";
export type EmailFolder = "inbox" | "drafts" | "sent" | "archive" | "trash";

export interface Email {
  id: string;
  from: string;
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  timestamp: string;
  isRead: boolean;
  isDraft: boolean;
  isSent: boolean;
  priority: EmailPriority;
  folder: EmailFolder;
  threadId?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface EmailDraftRequest {
  to: string;
  cc?: string[];
  subject: string;
  body: string;
  replyToId?: string;
}

export interface EmailSendResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SuggestedReplyRequest {
  emailId: string;
}

export interface SuggestedReplyResponse {
  suggestedReply: string;
  confidence: number;
  styleMatch: number;
}

// ═══════════════════════════════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════════════════════════════

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  isAllDay: boolean;
  attendees: CalendarAttendee[];
  reminders: CalendarReminder[];
}

export interface CalendarAttendee {
  email: string;
  name?: string;
  status: "accepted" | "declined" | "tentative" | "pending";
}

export interface CalendarReminder {
  minutesBefore: number;
  method: "popup" | "email" | "voice";
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
}

// ═══════════════════════════════════════════════════════════════
// APPROVALS
// ═══════════════════════════════════════════════════════════════

export type ApprovalType = "email" | "calendar_event" | "task_delegation";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "edited";

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  status: ApprovalStatus;
  expiresAt?: string;
}

export interface ApprovalDecision {
  requestId: string;
  decision: "approve" | "reject" | "edit";
  editedContent?: string;
}

// ═══════════════════════════════════════════════════════════════
// TRIGGERS & EVENTS
// ═══════════════════════════════════════════════════════════════

export type TriggerEventType =
  | "email_received"
  | "email_sent"
  | "calendar_event_soon"
  | "calendar_event_created"
  | "lead_created"
  | "lead_score_changed"
  | "voice_command_received"
  | "daily_summary"
  | "weekly_report"
  | "health_check_failed"
  | "error_rate_high";

export interface TriggerEvent {
  type: TriggerEventType;
  data: Record<string, unknown>;
  timestamp: string;
  source: string;
}

// ═══════════════════════════════════════════════════════════════
// LEADS
// ═══════════════════════════════════════════════════════════════

export type LeadPriority = "hot" | "warm" | "cold" | "disqualified";
export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  score: number;
  priority: LeadPriority;
  status: LeadStatus;
  source: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface CreateLeadRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source?: string;
}

// ═══════════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════════

export type TaskStatus = "pending" | "in_progress" | "completed" | "failed" | "blocked";

export interface Task {
  id: string;
  description: string;
  status: TaskStatus;
  assignedAgent?: string;
  parentTaskId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  evidence: TaskEvidence[];
  stopScore?: number;
}

export interface TaskEvidence {
  type: "file" | "command_output" | "screenshot" | "log";
  path?: string;
  content?: string;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════
// HEALTH & STATUS
// ═══════════════════════════════════════════════════════════════

export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  uptime: number;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: "up" | "down" | "degraded";
  latency?: number;
  lastCheck: string;
}
