/**
 * Agent Configs Index
 * Central export for all agent configurations
 */

export { cloudAssistantConfig } from "./cloud-assistant.js";
export { coderConfig } from "./coder.js";
export { testerConfig } from "./tester.js";
export { securityConfig } from "./security.js";
export { docsConfig } from "./docs.js";
export { devopsConfig } from "./devops.js";
export { leadProcessorConfig } from "./lead-processor.js";

import { cloudAssistantConfig } from "./cloud-assistant.js";
import { coderConfig } from "./coder.js";
import { testerConfig } from "./tester.js";
import { securityConfig } from "./security.js";
import { docsConfig } from "./docs.js";
import { devopsConfig } from "./devops.js";
import { leadProcessorConfig } from "./lead-processor.js";
import type { AgentConfigWithTriggers } from "../types.js";

/**
 * All registered agent configurations
 */
export const ALL_AGENTS: AgentConfigWithTriggers[] = [
  cloudAssistantConfig,
  coderConfig,
  testerConfig,
  securityConfig,
  docsConfig,
  devopsConfig,
  leadProcessorConfig,
];

/**
 * Map of agent ID to configuration
 */
export const AGENT_MAP: Record<string, AgentConfigWithTriggers> = {
  "cloud-assistant": cloudAssistantConfig,
  coder: coderConfig,
  tester: testerConfig,
  security: securityConfig,
  docs: docsConfig,
  devops: devopsConfig,
  "lead-processor": leadProcessorConfig,
};

/**
 * Get always-on agents (should be started at boot)
 */
export function getAlwaysOnAgents(): AgentConfigWithTriggers[] {
  return ALL_AGENTS.filter((a) => a.activationType === "always_on");
}

/**
 * Get agents that respond to a specific trigger event
 */
export function getAgentsForTrigger(
  event: string
): AgentConfigWithTriggers[] {
  return ALL_AGENTS.filter(
    (agent) =>
      agent.activationType === "trigger" &&
      agent.triggers?.some((t) => t.event === event && t.enabled)
  ).sort((a, b) => b.priority - a.priority);
}
