import { eq, inArray } from "drizzle-orm";
import { ensureDbSchema, getDb } from "../../../../db";
import { articles, feeds } from "../../../../db/schema";
import { requirePasswordSession } from "../../../lib/password-auth";
import { fetchArticleText, isSafeFeedUrl, parseFeed } from "../../../lib/rss-content";

const MAX_FEEDS_PER_REFRESH = 8;
const MAX_ITEMS_PER_FEED = 4;

export async function POST(request: Request) {
  try {
    const unauthorized = await requirePasswordSession(request);
    if (unauthorized) return unauthorized;
    await ensureDbSchema();
    const payload = await request.json().catch(() => ({})) as { feedId?: string };
    const db = getDb();
    const selectedFeeds = payload.feedId
      ? await db.select().from(feeds).where(eq(feeds.id, payload.feedId)).limit(1)
      : await db.select().from(feeds).limit(MAX_FEEDS_PER_REFRESH);
    const safeFeeds = selectedFeeds.filter((feed) => isSafeFeedUrl(feed.url));
    let inserted = 0;
    let refreshed = 0;

    for (const feed of safeFeeds) {
      try {
        const response = await fetch(feed.url, { headers:{ "user-agent":"Guanlan RSS Reader/0.1", accept:"application/rss+xml,application/atom+xml,application/xml,text/xml" }, redirect:"follow" });
        if (!response.ok) continue;
        const parsed = parseFeed(await response.text()).slice(0, MAX_ITEMS_PER_FEED);
        if (!parsed.length) continue;
        refreshed += 1;
        const titles = parsed.map((item) => item.title);
        const existing = await db.select({ title:articles.title }).from(articles).where(inArray(articles.title, titles));
        const known = new Set(existing.map((item) => item.title));
        for (const item of parsed) {
          if (known.has(item.title)) continue;
          let content = item.content;
          if (content.length < Math.max(600, item.excerpt.length * 2) && isSafeFeedUrl(item.link)) {
            try {
              const extracted = await fetchArticleText(item.link);
              if (extracted.length > content.length) content = extracted;
            } catch { /* Some publishers block article fetching; keep feed content. */ }
          }
          await db.insert(articles).values({
            feedId:feed.id, source:feed.name, title:item.title, excerpt:item.excerpt,
            content:content || item.excerpt, time:item.published || new Date().toISOString(), unread:true, starred:false,
            accent:feed.name.slice(0, 2), enSource:feed.name, enTitle:item.title, enExcerpt:item.excerpt,
            enContent:content || item.excerpt, enTime:item.published || new Date().toISOString(),
          });
          inserted += 1;
        }
      } catch { /* Continue refreshing other feeds. */ }
    }
    return Response.json({ refreshed, inserted });
  } catch (error) {
    return Response.json({ error:error instanceof Error ? error.message : "Refresh failed" }, { status:500 });
  }
}
