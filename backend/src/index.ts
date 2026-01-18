/**
 * Cloud Assistant Backend
 * Entry point for the Personal AI Assistant server
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "dotenv";

import { triggerManager } from "./services/trigger-manager.js";
import { ALL_AGENTS } from "./agents/configs/index.js";

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════════════════════════════
// HEALTH ENDPOINT
// ═══════════════════════════════════════════════════════════════

app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    agents: ALL_AGENTS.map((a) => ({
      id: a.id,
      name: a.name,
      activationType: a.activationType,
    })),
  });
});

// ═══════════════════════════════════════════════════════════════
// CHAT ENDPOINT
// ═══════════════════════════════════════════════════════════════

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // TODO: Implement chat with Cloud Assistant
    // For now, return a placeholder response
    res.json({
      content: `Nachricht empfangen: "${message}". Cloud Assistant wird implementiert.`,
      agentId: "cloud-assistant",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Chat] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ═══════════════════════════════════════════════════════════════
// TRIGGER ENDPOINT (for testing)
// ═══════════════════════════════════════════════════════════════

app.post("/api/trigger", async (req, res) => {
  try {
    const { event, data } = req.body;

    if (!event) {
      res.status(400).json({ error: "Event type is required" });
      return;
    }

    const activations = await triggerManager.fireTrigger(event, data || {});

    res.json({
      success: true,
      activations: activations.map((a) => ({
        id: a.id,
        agentId: a.agentId,
        status: a.status,
      })),
    });
  } catch (error) {
    console.error("[Trigger] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ═══════════════════════════════════════════════════════════════
// AGENTS ENDPOINT
// ═══════════════════════════════════════════════════════════════

app.get("/api/agents", (_req, res) => {
  res.json({
    agents: ALL_AGENTS.map((agent) => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      activationType: agent.activationType,
      capabilities: agent.capabilities,
      triggers: agent.triggers?.map((t) => ({
        id: t.id,
        event: t.event,
        enabled: t.enabled,
      })),
    })),
  });
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

async function start(): Promise<void> {
  // Initialize trigger manager
  await triggerManager.initialize();

  // Set up trigger handler
  triggerManager.setHandler(async (agent, payload) => {
    console.log(
      `[Agent Activated] ${agent.name} triggered by ${payload.event}`
    );
    // TODO: Execute agent logic
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                   CLOUD ASSISTANT                           ║
║                    Backend Server                           ║
╠════════════════════════════════════════════════════════════╣
║  Status:    Running                                         ║
║  Port:      ${PORT}                                            ║
║  Agents:    ${ALL_AGENTS.length} configured                                     ║
║  Always-On: ${ALL_AGENTS.filter((a) => a.activationType === "always_on").length} agents                                       ║
╚════════════════════════════════════════════════════════════╝
    `);

    console.log("\n[Agents]");
    ALL_AGENTS.forEach((agent) => {
      const icon =
        agent.activationType === "always_on"
          ? "🟢"
          : agent.activationType === "trigger"
            ? "⚡"
            : "⏰";
      console.log(`  ${icon} ${agent.name} (${agent.activationType})`);
    });
    console.log("");
  });
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Server] SIGTERM received, shutting down...");
  await triggerManager.shutdown();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[Server] SIGINT received, shutting down...");
  await triggerManager.shutdown();
  process.exit(0);
});

// Start the server
start().catch((error) => {
  console.error("[Server] Failed to start:", error);
  process.exit(1);
});
