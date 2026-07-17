import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const feeds = sqliteTable("feeds", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  color: text("color").notNull().default("#174f3d"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  feedId: text("feed_id").notNull().references(() => feeds.id, { onDelete: "cascade" }),
  source: text("source").notNull(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""),
  time: text("time_label").notNull().default(""),
  unread: integer("unread", { mode: "boolean" }).notNull().default(true),
  starred: integer("starred", { mode: "boolean" }).notNull().default(false),
  tag: text("tag"),
  accent: text("accent").notNull().default("RSS"),
  enSource: text("en_source").notNull().default(""),
  enTitle: text("en_title").notNull().default(""),
  enExcerpt: text("en_excerpt").notNull().default(""),
  enContent: text("en_content").notNull().default(""),
  enTime: text("en_time").notNull().default(""),
  enTag: text("en_tag"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type StoredArticle = typeof articles.$inferSelect;
