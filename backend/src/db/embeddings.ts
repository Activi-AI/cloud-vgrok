/**
 * Embeddings Database Schema
 *
 * Stores vector embeddings for semantic search
 */

import type Database from "better-sqlite3";

/**
 * Initialize embeddings table
 */
export function initEmbeddingsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS message_embeddings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT UNIQUE NOT NULL,
      embedding TEXT NOT NULL,
      model TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_embeddings_message_id ON message_embeddings(message_id);
    CREATE INDEX IF NOT EXISTS idx_embeddings_created_at ON message_embeddings(created_at);
  `);

  console.log("✅ Embeddings table initialized");
}
