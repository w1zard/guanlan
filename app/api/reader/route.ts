import { asc, count } from "drizzle-orm";
import { ensureDbSchema, getDb } from "../../../db";
import { articles, feeds } from "../../../db/schema";
import { requirePasswordSession } from "../../lib/password-auth";

const seedFeeds = [
  { id:"sspai", name:"少数派", url:"https://sspai.com/feed", color:"#d9534f" },
  { id:"solidot", name:"Solidot", url:"https://www.solidot.org/index.rss", color:"#2563a8" },
  { id:"36kr", name:"36氪", url:"https://36kr.com/feed", color:"#c6892f" },
  { id:"ruanyf", name:"阮一峰的网络日志", url:"https://www.ruanyifeng.com/blog/atom.xml", color:"#2f7d52" },
  { id:"ft", name:"FT中文网", url:"https://www.ftchinese.com/rss/feed", color:"#9b6448" },
  { id:"ithome", name:"IT之家", url:"https://www.ithome.com/rss/", color:"#cf3f36" },
  { id:"appinn", name:"小众软件", url:"https://www.appinn.com/feed/", color:"#3688c8" },
  { id:"v2ex", name:"V2EX", url:"https://www.v2ex.com/index.xml", color:"#334155" },
  { id:"ars", name:"Ars Technica", url:"https://feeds.arstechnica.com/arstechnica/index", color:"#f26c21" },
  { id:"wired", name:"WIRED", url:"https://www.wired.com/feed/rss", color:"#111111" },
  { id:"verge", name:"The Verge", url:"https://www.theverge.com/rss/index.xml", color:"#e22b8a" },
  { id:"techcrunch", name:"TechCrunch", url:"https://techcrunch.com/feed/", color:"#0a9e6e" },
  { id:"mit-tech", name:"MIT Technology Review", url:"https://www.technologyreview.com/feed/", color:"#d3262a" },
  { id:"engadget", name:"Engadget", url:"https://www.engadget.com/rss.xml", color:"#5b36f2" },
  { id:"hacker-news", name:"Hacker News", url:"https://hnrss.org/frontpage", color:"#ff6600" },
  { id:"slashdot", name:"Slashdot", url:"https://rss.slashdot.org/Slashdot/slashdotMain", color:"#14564c" },
  { id:"lwn", name:"LWN.net", url:"https://lwn.net/headlines/rss", color:"#8b4513" },
  { id:"daring-fireball", name:"Daring Fireball", url:"https://daringfireball.net/feeds/main", color:"#4b5563" },
  { id:"ieee", name:"IEEE Spectrum", url:"https://spectrum.ieee.org/feeds/feed.rss", color:"#00629b" },
  { id:"cloudflare", name:"Cloudflare Blog", url:"https://blog.cloudflare.com/rss/", color:"#f48120" },
  { id:"github", name:"The GitHub Blog", url:"https://github.blog/feed/", color:"#24292f" },
  { id:"mozilla", name:"Mozilla Hacks", url:"https://hacks.mozilla.org/feed/", color:"#7542e5" },
  { id:"google", name:"Google Blog", url:"https://blog.google/rss/", color:"#4285f4" },
  { id:"microsoft", name:"Microsoft Blog", url:"https://blogs.microsoft.com/feed/", color:"#00a4ef" },
  { id:"apple", name:"Apple Newsroom", url:"https://www.apple.com/newsroom/rss-feed.rss", color:"#555555" },
  { id:"openai", name:"OpenAI News", url:"https://openai.com/news/rss.xml", color:"#10a37f" },
  { id:"bbc-tech", name:"BBC Technology", url:"https://feeds.bbci.co.uk/news/technology/rss.xml", color:"#bb1919" },
  { id:"guardian-tech", name:"The Guardian Technology", url:"https://www.theguardian.com/uk/technology/rss", color:"#052962" },
  { id:"nyt-tech", name:"The New York Times Technology", url:"https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml", color:"#111111" },
  { id:"npr-tech", name:"NPR Technology", url:"https://feeds.npr.org/1019/rss.xml", color:"#d62021" },
  { id:"aljazeera", name:"Al Jazeera", url:"https://www.aljazeera.com/xml/rss/all.xml", color:"#d5a44b" },
  { id:"nasa", name:"NASA", url:"https://www.nasa.gov/feed/", color:"#0b3d91" },
  { id:"nature", name:"Nature", url:"https://www.nature.com/nature.rss", color:"#e21b22" },
  { id:"ifanr", name:"爱范儿", url:"https://www.ifanr.com/feed", color:"#e74c3c" },
  { id:"oschina", name:"开源中国", url:"https://www.oschina.net/news/rss", color:"#21b351" },
  { id:"infoq-cn", name:"InfoQ 中文", url:"https://www.infoq.cn/feed", color:"#e95f2b" },
  { id:"linux-cn", name:"Linux 中国", url:"https://linux.cn/rss.xml", color:"#2f76b7" },
  { id:"freebuf", name:"FreeBuf 网络安全行业门户", url:"https://www.freebuf.com/feed", color:"#164e8a" },
  { id:"meituan-tech", name:"美团技术团队", url:"https://tech.meituan.com/feed/", color:"#ffd100" },
  { id:"williamlong", name:"月光博客", url:"https://www.williamlong.info/rss.xml", color:"#52789f" },
  { id:"coolshell", name:"酷壳 CoolShell", url:"https://coolshell.cn/feed", color:"#3f6212" },
  { id:"leiphone", name:"雷峰网", url:"https://www.leiphone.com/feed", color:"#2563eb" },
  { id:"tmtpost", name:"钛媒体", url:"https://www.tmtpost.com/rss.xml", color:"#111827" },
  { id:"cnbeta", name:"cnBeta.COM 中文业界资讯", url:"https://www.cnbeta.com.tw/backend.php", color:"#1e73be" },
  { id:"stack-overflow", name:"Stack Overflow Blog", url:"https://stackoverflow.blog/feed/", color:"#f48024" },
  { id:"smashing", name:"Smashing Magazine", url:"https://www.smashingmagazine.com/feed/", color:"#d33a2c" },
  { id:"css-tricks", name:"CSS-Tricks", url:"https://css-tricks.com/feed/", color:"#e1b12c" },
  { id:"devto", name:"DEV Community", url:"https://dev.to/feed", color:"#0a0a0a" },
  { id:"lobsters", name:"Lobsters", url:"https://lobste.rs/rss", color:"#ac130d" },
  { id:"product-hunt", name:"Product Hunt", url:"https://www.producthunt.com/feed", color:"#da552f" },
  { id:"kubernetes", name:"Kubernetes Blog", url:"https://kubernetes.io/feed.xml", color:"#326ce5" },
  { id:"aws", name:"AWS News Blog", url:"https://aws.amazon.com/blogs/aws/feed/", color:"#ff9900" },
  { id:"google-ai", name:"Google AI", url:"https://blog.google/technology/ai/rss/", color:"#4285f4" },
  { id:"deepmind", name:"Google DeepMind", url:"https://deepmind.google/blog/rss.xml", color:"#1a73e8" },
  { id:"huggingface", name:"Hugging Face Blog", url:"https://huggingface.co/blog/feed.xml", color:"#f5c518" },
  { id:"android-dev", name:"Android Developers Blog", url:"https://android-developers.googleblog.com/feeds/posts/default", color:"#3ddc84" },
  { id:"9to5mac", name:"9to5Mac", url:"https://9to5mac.com/feed/", color:"#6b7280" },
  { id:"macrumors", name:"MacRumors", url:"https://feeds.macrumors.com/MacRumors-All", color:"#2563eb" },
  { id:"phoronix", name:"Phoronix", url:"https://www.phoronix.com/rss.php", color:"#e84c3d" },
  { id:"omgubuntu", name:"OMG! Ubuntu", url:"https://www.omgubuntu.co.uk/feed", color:"#e95420" },
  { id:"cnn-world", name:"CNN World", url:"https://rss.cnn.com/rss/edition_world.rss", color:"#cc0000" },
  { id:"dw", name:"DW News", url:"https://rss.dw.com/rdf/rss-en-all", color:"#0098d4" },
  { id:"france24", name:"France 24", url:"https://www.france24.com/en/rss", color:"#00a7e1" },
  { id:"cbc", name:"CBC News", url:"https://www.cbc.ca/cmlink/rss-topstories", color:"#d71920" },
  { id:"politico", name:"POLITICO", url:"https://www.politico.com/rss/politicopicks.xml", color:"#b31b1b" },
  { id:"vox", name:"Vox", url:"https://www.vox.com/rss/index.xml", color:"#f6c844" },
  { id:"atlantic", name:"The Atlantic", url:"https://www.theatlantic.com/feed/all/", color:"#c00" },
  { id:"new-yorker", name:"The New Yorker", url:"https://www.newyorker.com/feed/everything", color:"#111111" },
  { id:"lemonde-world", name:"Le Monde World", url:"https://www.lemonde.fr/en/international/rss_full.xml", color:"#026b9c" },
  { id:"scientific-american", name:"Scientific American", url:"https://rss.sciam.com/ScientificAmerican-Global", color:"#e13d2d" },
  { id:"quanta", name:"Quanta Magazine", url:"https://api.quantamagazine.org/feed/", color:"#8b2f97" },
  { id:"science-daily", name:"ScienceDaily", url:"https://www.sciencedaily.com/rss/top/science.xml", color:"#2469a0" },
  { id:"physorg", name:"Phys.org", url:"https://phys.org/rss-feed/", color:"#315e8a" },
  { id:"space", name:"Space.com", url:"https://www.space.com/feeds/all", color:"#172554" },
  { id:"nasa-jpl", name:"NASA Jet Propulsion Laboratory", url:"https://www.jpl.nasa.gov/feeds/news/", color:"#c81d25" },
  { id:"smithsonian", name:"Smithsonian Magazine", url:"https://www.smithsonianmag.com/rss/latest_articles/", color:"#f2b705" },
];

const seedArticles = [
  { feedId:"sspai",source:"少数派",title:"年度征文｜重建我的数字阅读秩序",excerpt:"信息从来不是越多越好。过去一年，我重新整理订阅、筛选与稍后读的完整流程。",content:"我们每天都在与信息流相处。真正有效的阅读系统，不是把所有文章收入囊中，而是建立一条可信、安静、能够持续运转的路径。\n\n我把订阅源分成“每日必读”“周末漫游”和“资料库”三层，让注意力重新回到内容本身。",time:"12 分钟前",unread:true,starred:true,tag:"效率",accent:"少",enSource:"Sspai",enTitle:"Rebuilding my digital reading system",enExcerpt:"More information is not always better. I rebuilt my subscription, filtering, and read-later workflow.",enContent:"Every day, we live alongside streams of information. A useful reading system is not about saving everything, but building a quiet and trustworthy path that keeps working.\n\nI divide feeds into Daily Essentials, Weekend Wandering, and Reference Library, bringing attention back to the content itself.",enTime:"12 min ago",enTag:"Productivity" },
  { feedId:"solidot",source:"Solidot",title:"Mozilla 发布新的本地优先同步方案",excerpt:"这套方案让应用在离线状态下仍然完整可用，并在网络恢复后合并数据。",content:"本地优先软件重新思考了数据的归属：设备上的副本不再只是缓存，而是用户可以完整控制的主要数据。新的同步方案重点解决冲突合并和端到端加密。",time:"38 分钟前",unread:true,starred:false,tag:"技术",accent:"S",enSource:"Solidot",enTitle:"Mozilla unveils a new local-first sync approach",enExcerpt:"Apps remain fully usable offline and merge data when the network returns.",enContent:"Local-first software rethinks data ownership: the device copy is no longer merely a cache, but the primary data users control.",enTime:"38 min ago",enTag:"Technology" },
  { feedId:"36kr",source:"36氪",title:"智能硬件正在迎来新的小型化浪潮",excerpt:"从可穿戴设备到环境计算，更轻的交互方式正在进入日常生活。",content:"这一轮硬件创新不再一味追求更大的屏幕。传感器、低功耗芯片和端侧模型的进步，让设备可以更自然地藏进日常物品中。",time:"1 小时前",unread:true,starred:false,tag:"商业",accent:"氪",enSource:"36Kr",enTitle:"Smart hardware enters a new wave of miniaturization",enExcerpt:"From wearables to ambient computing, lighter interactions are moving into daily life.",enContent:"Better sensors, low-power chips, and on-device models allow technology to disappear naturally into everyday objects.",enTime:"1 hour ago",enTag:"Business" },
];

async function ensureSeeded() {
  await ensureDbSchema();
  const db = getDb();
  await db.insert(feeds).values(seedFeeds).onConflictDoNothing();
  const [result] = await db.select({ value: count() }).from(articles);
  if (result.value === 0) {
    await db.insert(articles).values(seedArticles);
  }
  return db;
}

export async function GET(request: Request) {
  try {
    const unauthorized = await requirePasswordSession(request);
    if (unauthorized) return unauthorized;
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
    const unauthorized = await requirePasswordSession(request);
    if (unauthorized) return unauthorized;
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
