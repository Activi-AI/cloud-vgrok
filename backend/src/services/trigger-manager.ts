/**
 * Trigger Manager
 * Handles automatic agent activation based on events
 */

import { EventEmitter } from "events";
import cron from "node-cron";
import { v4 as uuidv4 } from "uuid";
import {
  ALL_AGENTS,
  getAgentsForTrigger,
  getAlwaysOnAgents,
} from "../agents/configs/index.js";
import type {
  AgentConfigWithTriggers,
  TriggerConfig,
  TriggerEvent,
  TriggerCondition,
} from "../agents/types.js";

export interface TriggerEventPayload {
  event: TriggerEvent;
  data: Record<string, unknown>;
  timestamp: Date;
  source: string;
}

export interface AgentActivation {
  id: string;
  agentId: string;
  triggerId: string;
  event: TriggerEvent;
  payload: TriggerEventPayload;
  activatedAt: Date;
  status: "pending" | "running" | "completed" | "failed";
}

type TriggerHandler = (
  agent: AgentConfigWithTriggers,
  payload: TriggerEventPayload
) => Promise<void>;

export class TriggerManager extends EventEmitter {
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();
  private cooldowns: Map<string, Date> = new Map();
  private activations: AgentActivation[] = [];
  private handler: TriggerHandler | null = null;

  /**
   * Initialize the trigger manager
   */
  async initialize(): Promise<void> {
    console.log("[TriggerManager] Initializing...");

    // Start always-on agents
    const alwaysOnAgents = getAlwaysOnAgents();
    for (const agent of alwaysOnAgents) {
      console.log(`[TriggerManager] Starting always-on agent: ${agent.name}`);
      this.emit("agent:start", agent);
    }

    // Setup cron jobs for scheduled triggers
    this.setupCronJobs();

    console.log("[TriggerManager] Initialized successfully");
  }

  /**
   * Set the handler that will be called when an agent is activated
   */
  setHandler(handler: TriggerHandler): void {
    this.handler = handler;
  }

  /**
   * Setup cron jobs for all scheduled triggers
   */
  private setupCronJobs(): void {
    for (const agent of ALL_AGENTS) {
      if (!agent.triggers) continue;

      for (const trigger of agent.triggers) {
        if (trigger.cronExpression && trigger.enabled) {
          const jobId = `${agent.id}:${trigger.id}`;

          const job = cron.schedule(trigger.cronExpression, () => {
            this.fireTrigger(trigger.event, {
              source: "cron",
              cronJobId: jobId,
            });
          });

          this.cronJobs.set(jobId, job);
          console.log(
            `[TriggerManager] Scheduled cron job: ${jobId} (${trigger.cronExpression})`
          );
        }
      }
    }
  }

  /**
   * Fire a trigger event - will activate all matching agents
   */
  async fireTrigger(
    event: TriggerEvent,
    data: Record<string, unknown> = {}
  ): Promise<AgentActivation[]> {
    const payload: TriggerEventPayload = {
      event,
      data,
      timestamp: new Date(),
      source: (data.source as string) || "system",
    };

    console.log(`[TriggerManager] Trigger fired: ${event}`);

    const matchingAgents = getAgentsForTrigger(event);
    const activations: AgentActivation[] = [];

    for (const agent of matchingAgents) {
      const trigger = agent.triggers?.find(
        (t) => t.event === event && t.enabled
      );
      if (!trigger) continue;

      // Check cooldown
      if (this.isOnCooldown(agent.id, trigger.id)) {
        console.log(
          `[TriggerManager] Agent ${agent.id} is on cooldown for trigger ${trigger.id}`
        );
        continue;
      }

      // Check conditions
      if (!this.checkConditions(trigger.conditions, data)) {
        console.log(
          `[TriggerManager] Conditions not met for ${agent.id}:${trigger.id}`
        );
        continue;
      }

      // Create activation
      const activation: AgentActivation = {
        id: uuidv4(),
        agentId: agent.id,
        triggerId: trigger.id,
        event,
        payload,
        activatedAt: new Date(),
        status: "pending",
      };

      this.activations.push(activation);
      activations.push(activation);

      // Set cooldown
      if (trigger.cooldownSeconds && trigger.cooldownSeconds > 0) {
        this.setCooldown(agent.id, trigger.id, trigger.cooldownSeconds);
      }

      // Execute handler
      if (this.handler) {
        activation.status = "running";
        try {
          await this.handler(agent, payload);
          activation.status = "completed";
        } catch (error) {
          activation.status = "failed";
          console.error(
            `[TriggerManager] Error activating agent ${agent.id}:`,
            error
          );
        }
      }

      this.emit("agent:activated", activation);
    }

    return activations;
  }

  /**
   * Check if an agent trigger is on cooldown
   */
  private isOnCooldown(agentId: string, triggerId: string): boolean {
    const key = `${agentId}:${triggerId}`;
    const cooldownEnd = this.cooldowns.get(key);

    if (!cooldownEnd) return false;
    return new Date() < cooldownEnd;
  }

  /**
   * Set cooldown for an agent trigger
   */
  private setCooldown(
    agentId: string,
    triggerId: string,
    seconds: number
  ): void {
    const key = `${agentId}:${triggerId}`;
    const cooldownEnd = new Date(Date.now() + seconds * 1000);
    this.cooldowns.set(key, cooldownEnd);
  }

  /**
   * Check if trigger conditions are met
   */
  private checkConditions(
    conditions: TriggerCondition[] | undefined,
    data: Record<string, unknown>
  ): boolean {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every((condition) => {
      const value = data[condition.field];

      switch (condition.operator) {
        case "equals":
          return value === condition.value;
        case "contains":
          return String(value).includes(String(condition.value));
        case "greater_than":
          return Number(value) > Number(condition.value);
        case "less_than":
          return Number(value) < Number(condition.value);
        case "matches":
          return new RegExp(String(condition.value)).test(String(value));
        default:
          return false;
      }
    });
  }

  /**
   * Get recent activations
   */
  getActivations(limit = 100): AgentActivation[] {
    return this.activations.slice(-limit);
  }

  /**
   * Shutdown the trigger manager
   */
  async shutdown(): Promise<void> {
    console.log("[TriggerManager] Shutting down...");

    // Stop all cron jobs
    for (const [jobId, job] of this.cronJobs) {
      job.stop();
      console.log(`[TriggerManager] Stopped cron job: ${jobId}`);
    }
    this.cronJobs.clear();

    this.emit("shutdown");
  }
}

// Singleton instance
export const triggerManager = new TriggerManager();
