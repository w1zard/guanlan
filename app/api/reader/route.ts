import { asc, count } from "drizzle-orm";
import { getDb } from "../../../db";
import { articles, feeds } from "../../../db/schema";

const seedFeeds = [
  { id:"sspai", name:"少数派", url:"https://sspai.com/feed", color:"#d9534f" },
  { id:"solidot", name:"Solidot", url:"https://www.solidot.org/index.rss", color:"#2563a8" },
  { id:"36kr", name:"36氪", url:"https://36kr.com/feed", color:"#c6892f" },
  { id:"ruanyf", name:"阮一峰的网络日志", url:"https://www.ruanyifeng.com/blog/atom.xml", color:"#2f7d52" },
  { id:"ft", name:"FT中文网", url:"https://www.ftchinese.com/rss/feed", color:"#9b6448" },
];

const seedArticles = [
  { feedId:"sspai",source:"少数派",title:"年度征文｜重建我的数字阅读秩序",excerpt:"信息从来不是越多越好。过去一年，我重新整理订阅、筛选与稍后读的完整流程。",content:"我们每天都在与信息流相处。真正有效的阅读系统，不是把所有文章收入囊中，而是建立一条可信、安静、能够持续运转的路径。\n\n我把订阅源分成“每日必读”“周末漫游”和“资料库”三层，让注意力重新回到内容本身。",time:"12 分钟前",unread:true,starred:true,tag:"效率",accent:"少",enSource:"Sspai",enTitle:"Rebuilding my digital reading system",enExcerpt:"More information is not always better. I rebuilt my subscription, filtering, and read-later workflow.",enContent:"Every day, we live alongside streams of information. A useful reading system is not about saving everything, but building a quiet and trustworthy path that keeps working.\n\nI divide feeds into Daily Essentials, Weekend Wandering, and Reference Library, bringing attention back to the content itself.",enTime:"12 min ago",enTag:"Productivity" },
  { feedId:"solidot",source:"Solidot",title:"Mozilla 发布新的本地优先同步方案",excerpt:"这套方案让应用在离线状态下仍然完整可用，并在网络恢复后合并数据。",content:"本地优先软件重新思考了数据的归属：设备上的副本不再只是缓存，而是用户可以完整控制的主要数据。新的同步方案重点解决冲突合并和端到端加密。",time:"38 分钟前",unread:true,starred:false,tag:"技术",accent:"S",enSource:"Solidot",enTitle:"Mozilla unveils a new local-first sync approach",enExcerpt:"Apps remain fully usable offline and merge data when the network returns.",enContent:"Local-first software rethinks data ownership: the device copy is no longer merely a cache, but the primary data users control.",enTime:"38 min ago",enTag:"Technology" },
  { feedId:"36kr",source:"36氪",title:"智能硬件正在迎来新的小型化浪潮",excerpt:"从可穿戴设备到环境计算，更轻的交互方式正在进入日常生活。",content:"这一轮硬件创新不再一味追求更大的屏幕。传感器、低功耗芯片和端侧模型的进步，让设备可以更自然地藏进日常物品中。",time:"1 小时前",unread:true,starred:false,tag:"商业",accent:"氪",enSource:"36Kr",enTitle:"Smart hardware enters a new wave of miniaturization",enExcerpt:"From wearables to ambient computing, lighter interactions are moving into daily life.",enContent:"Better sensors, low-power chips, and on-device models allow technology to disappear naturally into everyday objects.",enTime:"1 hour ago",enTag:"Business" },
];

async function ensureSeeded() {
  const db = getDb();
  const [result] = await db.select({ value: count() }).from(feeds);
  if (result.value === 0) {
    await db.insert(feeds).values(seedFeeds);
    await db.insert(articles).values(seedArticles);
  }
  return db;
}

export async function GET() {
  try {
    const db = await ensureSeeded();
    const [feedRows, articleRows] = await Promise.all([
      db.select().from(feeds).orderBy(asc(feeds.createdAt)),
      db.select().from(articles).orderBy(asc(articles.id)),
    ]);
    return Response.json({
      feeds: feedRows,
      articles: articleRows.map((row) => ({
        id:row.id, feedId:row.feedId, source:row.source, title:row.title, excerpt:row.excerpt, content:row.content,
        time:row.time, unread:row.unread, starred:row.starred, tag:row.tag ?? undefined, accent:row.accent,
        en:{ source:row.enSource || row.source, title:row.enTitle || row.title, excerpt:row.enExcerpt || row.excerpt, content:row.enContent || row.content, time:row.enTime || row.time, tag:row.enTag ?? undefined },
      })),
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Database unavailable" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { url?: string };
    const url = payload.url?.trim();
    if (!url) return Response.json({ error:"url is required" }, { status:400 });
    const parsed = new URL(url);
    const db = getDb();
    const id = `feed-${crypto.randomUUID()}`;
    const [feed] = await db.insert(feeds).values({ id, name:parsed.hostname.replace(/^www\./, ""), url, color:"#477b68" }).returning();
    return Response.json({ feed }, { status:201 });
  } catch (error) {
    return Response.json({ error:error instanceof Error ? error.message : "Unable to add feed" }, { status:400 });
  }
}
