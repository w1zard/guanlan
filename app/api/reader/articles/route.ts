import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { articles } from "../../../../db/schema";

export async function PATCH(request: Request) {
  try {
    const payload = await request.json() as { id?: number; unread?: boolean; starred?: boolean; markAllRead?: boolean };
    const db = getDb();
    if (payload.markAllRead) {
      await db.update(articles).set({ unread:false });
      return Response.json({ ok:true });
    }
    if (!payload.id) return Response.json({ error:"id is required" }, { status:400 });
    const changes: { unread?: boolean; starred?: boolean } = {};
    if (typeof payload.unread === "boolean") changes.unread = payload.unread;
    if (typeof payload.starred === "boolean") changes.starred = payload.starred;
    await db.update(articles).set(changes).where(eq(articles.id, payload.id));
    return Response.json({ ok:true });
  } catch (error) {
    return Response.json({ error:error instanceof Error ? error.message : "Unable to update article" }, { status:500 });
  }
}
