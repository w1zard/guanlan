import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB, { schema });
}

export async function ensureDbSchema() {
  if (!env.DB) throw new Error("Cloudflare D1 binding `DB` is unavailable");
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS feeds (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#174f3d',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      feed_id TEXT NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      time_label TEXT NOT NULL DEFAULT '',
      unread INTEGER NOT NULL DEFAULT 1,
      starred INTEGER NOT NULL DEFAULT 0,
      tag TEXT,
      accent TEXT NOT NULL DEFAULT 'RSS',
      en_source TEXT NOT NULL DEFAULT '',
      en_title TEXT NOT NULL DEFAULT '',
      en_excerpt TEXT NOT NULL DEFAULT '',
      en_content TEXT NOT NULL DEFAULT '',
      en_time TEXT NOT NULL DEFAULT '',
      en_tag TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS feeds_url_unique ON feeds (url)"),
  ]);
}
