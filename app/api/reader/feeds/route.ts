import { eq } from "drizzle-orm";
import { ensureDbSchema, getDb } from "../../../../db";
import { feeds } from "../../../../db/schema";
import { requirePasswordSession } from "../../../lib/password-auth";
import { isSafeFeedUrl } from "../../../lib/rss-content";

export async function PATCH(request: Request) {
  try {
    const unauthorized = await requirePasswordSession(request);
    if (unauthorized) return unauthorized;
    await ensureDbSchema();
    const body = await request.json() as { id?:string; name?:string; url?:string; color?:string };
    const id = body.id?.trim();
    const name = body.name?.trim();
    const url = body.url?.trim();
    const color = body.color?.trim();
    if (!id || !name || !url || !isSafeFeedUrl(url)) return Response.json({ error:"valid id, name and public feed url are required" }, { status:400 });
    if (color && !/^#[0-9a-f]{6}$/i.test(color)) return Response.json({ error:"color must be a hex value" }, { status:400 });
    const db = getDb();
    const [feed] = await db.update(feeds).set({ name, url, color:color || "#477b68" }).where(eq(feeds.id, id)).returning();
    if (!feed) return Response.json({ error:"feed not found" }, { status:404 });
    return Response.json({ feed });
  } catch (error) {
    return Response.json({ error:error instanceof Error ? error.message : "Unable to update feed" }, { status:500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const unauthorized = await requirePasswordSession(request);
    if (unauthorized) return unauthorized;
    await ensureDbSchema();
    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) return Response.json({ error:"id is required" }, { status:400 });
    const db = getDb();
    await db.delete(feeds).where(eq(feeds.id, id));
    return Response.json({ ok:true });
  } catch (error) {
    return Response.json({ error:error instanceof Error ? error.message : "Unable to delete feed" }, { status:500 });
  }
}
