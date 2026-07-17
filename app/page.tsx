"use client";

import { useEffect, useMemo, useState } from "react";

type Feed = { id: string; name: string; unread: number; color: string };
type Article = {
  id: number;
  feedId: string;
  source: string;
  title: string;
  excerpt: string;
  content: string;
  time: string;
  unread: boolean;
  starred: boolean;
  tag?: string;
  accent: string;
  en: { source: string; title: string; excerpt: string; content: string; time: string; tag?: string };
};

type Language = "zh" | "en";
type Theme = "light" | "dark";

const demoFeeds: Feed[] = [
  { id: "sspai", name: "少数派", unread: 12, color: "#d9534f" },
  { id: "solidot", name: "Solidot", unread: 8, color: "#2563a8" },
  { id: "36kr", name: "36氪", unread: 5, color: "#c6892f" },
  { id: "ruanyf", name: "阮一峰的网络日志", unread: 3, color: "#2f7d52" },
  { id: "ft", name: "FT中文网", unread: 9, color: "#9b6448" },
];

const initialArticles: Article[] = [
  { id: 1, feedId: "sspai", source: "少数派", title: "年度征文｜重建我的数字阅读秩序", excerpt: "信息从来不是越多越好。过去一年，我重新整理订阅、筛选与稍后读的完整流程。", content: "我们每天都在与信息流相处。真正有效的阅读系统，不是把所有文章收入囊中，而是建立一条可信、安静、能够持续运转的路径。\n\n我把订阅源分成“每日必读”“周末漫游”和“资料库”三层，让注意力重新回到内容本身。", time: "12 分钟前", unread: true, starred: true, tag: "效率", accent: "少", en:{source:"Sspai",title:"Rebuilding my digital reading system",excerpt:"More information is not always better. I rebuilt my subscription, filtering, and read-later workflow.",content:"Every day, we live alongside streams of information. A useful reading system is not about saving everything, but building a quiet and trustworthy path that keeps working.\n\nI divide feeds into Daily Essentials, Weekend Wandering, and Reference Library, bringing attention back to the content itself.",time:"12 min ago",tag:"Productivity"} },
  { id: 2, feedId: "solidot", source: "Solidot", title: "Mozilla 发布新的本地优先同步方案", excerpt: "这套方案让应用在离线状态下仍然完整可用，并在网络恢复后合并数据。", content: "本地优先软件重新思考了数据的归属：设备上的副本不再只是缓存，而是用户可以完整控制的主要数据。新的同步方案重点解决冲突合并和端到端加密。", time: "38 分钟前", unread: true, starred: false, tag: "技术", accent: "S", en:{source:"Solidot",title:"Mozilla unveils a new local-first sync approach",excerpt:"Apps remain fully usable offline and merge data when the network returns.",content:"Local-first software rethinks data ownership: the device copy is no longer merely a cache, but the primary data users control. The new approach focuses on conflict resolution and end-to-end encryption.",time:"38 min ago",tag:"Technology"} },
  { id: 3, feedId: "36kr", source: "36氪", title: "智能硬件正在迎来新的小型化浪潮", excerpt: "从可穿戴设备到环境计算，更轻的交互方式正在进入日常生活。", content: "这一轮硬件创新不再一味追求更大的屏幕。传感器、低功耗芯片和端侧模型的进步，让设备可以更自然地藏进日常物品中。", time: "1 小时前", unread: true, starred: false, tag: "商业", accent: "氪", en:{source:"36Kr",title:"Smart hardware enters a new wave of miniaturization",excerpt:"From wearables to ambient computing, lighter interactions are moving into daily life.",content:"This wave of hardware innovation is no longer chasing larger screens. Better sensors, low-power chips, and on-device models allow technology to disappear naturally into everyday objects.",time:"1 hour ago",tag:"Business"} },
  { id: 4, feedId: "ruanyf", source: "阮一峰的网络日志", title: "科技爱好者周刊（第 362 期）：个人软件的回归", excerpt: "本周讨论轻量工具、个人数据与那些不依赖大型平台的软件。", content: "个人软件的魅力，在于它可以准确匹配一个人的工作方式。现在浏览器能力和边缘计算平台逐渐成熟，小而美的工具再次拥有了生长空间。", time: "2 小时前", unread: false, starred: true, tag: "周刊", accent: "阮", en:{source:"Ruan YiFeng's Blog",title:"Tech Weekly 362: The return of personal software",excerpt:"This week: lightweight tools, personal data, and software independent of large platforms.",content:"Personal software is compelling because it can precisely fit one person's way of working. As browsers and edge platforms mature, small and focused tools have room to grow again.",time:"2 hours ago",tag:"Weekly"} },
  { id: 5, feedId: "ft", source: "FT中文网", title: "城市公共空间如何重新连接人们", excerpt: "从口袋公园到步行街，新的城市设计开始回应日常生活的真实尺度。", content: "好的公共空间并不需要宏大的纪念性。树荫、一把长椅和一段安全的步行路径，往往更能改变人们对一座城市的感受。", time: "昨天", unread: false, starred: false, tag: "城市", accent: "FT", en:{source:"FT Chinese",title:"How public spaces reconnect city residents",excerpt:"From pocket parks to pedestrian streets, urban design is responding to everyday life.",content:"Good public space does not require grand monuments. Shade, a bench, and a safe walking path often do more to transform how people experience a city.",time:"Yesterday",tag:"Cities"} },
];

const copy = {
  zh: { brand:"观澜", tagline:"观水有术，阅世有度", loginTitle:"欢迎回来", loginLead:"输入访问密码，继续你的安静阅读。", password:"访问密码", passwordPlaceholder:"请输入密码", enter:"进入观澜", wrong:"密码不正确或服务尚未配置", demo:"密码由站点部署者通过环境变量设置", search:"搜索文章、作者或订阅源", add:"添加订阅", all:"全部文章", unread:"未读文章", starred:"已加星标", feeds:"订阅源", todayRead:"今日阅读", pieces:"篇", space:"你的阅读空间", markAll:"全部标为已读", today:"今天", unreadSuffix:"篇未读", noArticles:"这里暂时没有文章", noArticlesLead:"试试切换分类或清空搜索条件。", readTime:"约 6 分钟阅读", subscribed:"已订阅", quote:"取一瓢清水，也要看见江河的方向。", end:"观澜而知源", select:"选择一篇文章开始阅读", articles:"文章", star:"星标", subscribe:"订阅", modalLead:"扩展你的阅读边界", modalTitle:"添加新的订阅", feedAddress:"RSS / Atom 地址", addTo:"添加到观澜", modalNote:"订阅地址将保存到 Cloudflare D1。", saved:"订阅地址已保存到 D1", logout:"退出登录", light:"切换亮色主题", dark:"切换暗色主题", language:"Switch to English" },
  en: { brand:"GUANLAN", tagline:"Read deeply. See clearly.", loginTitle:"Welcome back", loginLead:"Enter your access password to return to quiet reading.", password:"Access password", passwordPlaceholder:"Enter password", enter:"Enter Guanlan", wrong:"Incorrect password or the service is not configured", demo:"The password is set by the site owner through an environment variable", search:"Search articles, authors, or feeds", add:"Add subscription", all:"All articles", unread:"Unread", starred:"Starred", feeds:"Feeds", todayRead:"Read today", pieces:"items", space:"Your reading space", markAll:"Mark all as read", today:"Today", unreadSuffix:"unread", noArticles:"Nothing here yet", noArticlesLead:"Try another section or clear your search.", readTime:"6 min read", subscribed:"Subscribed", quote:"Take a cup of clear water, and still see where the river flows.", end:"Trace every current to its source", select:"Select an article to start reading", articles:"Articles", star:"Starred", subscribe:"Subscribe", modalLead:"Expand your reading horizon", modalTitle:"Add a new subscription", feedAddress:"RSS / Atom URL", addTo:"Add to Guanlan", modalNote:"The feed URL will be stored in Cloudflare D1.", saved:"Feed address saved to D1", logout:"Sign out", light:"Switch to light theme", dark:"Switch to dark theme", language:"切换至中文" },
};

function Logo() {
  return <div className="brand-mark" aria-hidden="true"><span>观</span><i /></div>;
}

export default function Home() {
  const [articles, setArticles] = useState(initialArticles);
  const [feeds, setFeeds] = useState<Feed[]>(demoFeeds);
  const [section, setSection] = useState("inbox");
  const [activeId, setActiveId] = useState(1);
  const [query, setQuery] = useState("");
  const [compact, setCompact] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [feedUrl, setFeedUrl] = useState("");
  const [notice, setNotice] = useState("");
  const [language, setLanguage] = useState<Language>("zh");
  const [theme, setTheme] = useState<Theme>("light");
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const t = copy[language];

  useEffect(() => {
    const savedLanguage = localStorage.getItem("guanlan-language") as Language | null;
    const savedTheme = localStorage.getItem("guanlan-theme") as Theme | null;
    if (savedLanguage === "zh" || savedLanguage === "en") setLanguage(savedLanguage);
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    fetch("/api/auth", { cache:"no-store" }).then((response) => response.json()).then((data: { authenticated?: boolean }) => setAuthenticated(Boolean(data.authenticated))).catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetch("/api/reader").then(async (response) => {
      if (!response.ok) return;
      const data = await response.json() as { feeds: Array<Feed & { url?: string }>; articles: Article[] };
      if (data.feeds?.length) setFeeds(data.feeds.map((feed) => ({ ...feed, unread:0 })));
      if (data.articles?.length) setArticles(data.articles);
    }).catch(() => { /* keep the in-memory offline demo */ });
  }, [authenticated]);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("guanlan-theme", theme); }, [theme]);
  useEffect(() => { document.documentElement.lang = language === "zh" ? "zh-CN" : "en"; localStorage.setItem("guanlan-language", language); }, [language]);

  const visible = useMemo(() => articles.filter((article) => {
    const inSection = section === "inbox" ? true : section === "starred" ? article.starred : section === "unread" ? article.unread : article.feedId === section;
    const text = language === "en" ? `${article.en.title}${article.en.source}${article.en.excerpt}` : `${article.title}${article.source}${article.excerpt}`;
    return inSection && text.toLowerCase().includes(query.toLowerCase());
  }), [articles, section, query, language]);

  const active = visible.find((article) => article.id === activeId) ?? visible[0];
  const unreadCount = articles.filter((article) => article.unread).length;

  const selectArticle = (id: number) => {
    setActiveId(id);
    setArticles((items) => items.map((item) => item.id === id ? { ...item, unread: false } : item));
    void fetch("/api/reader/articles", { method:"PATCH", headers:{ "content-type":"application/json" }, body:JSON.stringify({ id, unread:false }) });
  };

  const toggleStar = (id: number) => {
    const starred = !articles.find((item) => item.id === id)?.starred;
    setArticles((items) => items.map((item) => item.id === id ? { ...item, starred } : item));
    void fetch("/api/reader/articles", { method:"PATCH", headers:{ "content-type":"application/json" }, body:JSON.stringify({ id, starred }) });
  };

  const markAllRead = () => {
    setArticles((items) => items.map((item) => ({ ...item, unread:false })));
    void fetch("/api/reader/articles", { method:"PATCH", headers:{ "content-type":"application/json" }, body:JSON.stringify({ markAllRead:true }) });
  };

  const addFeed = (event: React.FormEvent) => {
    event.preventDefault();
    if (!feedUrl.trim()) return;
    void fetch("/api/reader", { method:"POST", headers:{ "content-type":"application/json" }, body:JSON.stringify({ url:feedUrl }) }).then(async (response) => {
      if (!response.ok) throw new Error("save failed");
      const data = await response.json() as { feed: Feed };
      setFeeds((items) => [...items, { ...data.feed, unread:0 }]);
      setAddOpen(false); setNotice(t.saved); setFeedUrl("");
      window.setTimeout(() => setNotice(""), 3200);
    }).catch(() => setNotice(language === "zh" ? "保存失败，请稍后重试" : "Could not save. Please try again."));
  };

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/auth", { method:"POST", headers:{ "content-type":"application/json" }, body:JSON.stringify({ password }) });
      if (response.ok) {
      setAuthenticated(true);
      setLoginError(false);
      setPassword("");
      } else setLoginError(true);
    } catch {
      setLoginError(true);
    }
  };

  const signOut = async () => {
    await fetch("/api/auth", { method:"DELETE" }).catch(() => undefined);
    setAuthenticated(false);
  };

  const localized = (article: Article) => language === "en" ? article.en : article;
  const feedName = (feed: Feed) => language === "en" ? ({ sspai:"Sspai", solidot:"Solidot", "36kr":"36Kr", ruanyf:"Ruan YiFeng's Blog", ft:"FT Chinese" }[feed.id] ?? feed.name) : feed.name;

  if (!authenticated) return (
    <main className="login-page">
      <div className="login-tools">
        <button onClick={() => setLanguage(language === "zh" ? "en" : "zh")}>{language === "zh" ? "EN" : "中"}</button>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={theme === "light" ? t.dark : t.light}>{theme === "light" ? "☾" : "☀"}</button>
      </div>
      <section className="login-panel">
        <div className="login-brand"><Logo /><div><strong>{t.brand}</strong><span>{t.tagline}</span></div></div>
        <div className="login-wave"><i /><i /><i /></div>
        <p className="login-kicker">PRIVATE READING SPACE</p>
        <h1>{t.loginTitle}</h1>
        <p className="login-lead">{t.loginLead}</p>
        <form onSubmit={signIn}>
          <label>{t.password}<div className={loginError ? "password-field error" : "password-field"}><span>⌾</span><input autoFocus type="password" value={password} onChange={(event) => { setPassword(event.target.value); setLoginError(false); }} placeholder={t.passwordPlaceholder} aria-invalid={loginError} /></div></label>
          {loginError && <p className="login-error">{t.wrong}</p>}
          <button className="login-submit">{t.enter}<span>→</span></button>
        </form>
        <small>{t.demo}</small>
      </section>
      <footer>GUANLAN · {language === "zh" ? "观澜" : "RSS READER"}</footer>
    </main>
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setSection("inbox")} aria-label={t.all}><Logo /><span>{t.brand}</span></button>
        <label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} /><kbd>⌘ K</kbd></label>
        <div className="top-actions"><button className="text-control" onClick={() => setLanguage(language === "zh" ? "en" : "zh")} title={t.language}>{language === "zh" ? "EN" : "中"}</button><button onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={theme === "light" ? t.dark : t.light}>{theme === "light" ? "☾" : "☀"}</button><button className="avatar" onClick={signOut} title={t.logout} aria-label={t.logout}>澜</button></div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <button className="add-feed" onClick={() => setAddOpen(true)}><span>＋</span> {t.add}</button>
          <nav aria-label="阅读分类">
            <button className={section === "inbox" ? "active" : ""} onClick={() => setSection("inbox")}><span>▣</span> {t.all} <b>{unreadCount}</b></button>
            <button className={section === "unread" ? "active" : ""} onClick={() => setSection("unread")}><span>◉</span> {t.unread} <b>{unreadCount}</b></button>
            <button className={section === "starred" ? "active" : ""} onClick={() => setSection("starred")}><span>☆</span> {t.starred}</button>
          </nav>
          <div className="feed-heading"><span>{t.feeds}</span><button aria-label={t.feeds}>•••</button></div>
          <nav className="feed-list" aria-label="订阅源">
            {feeds.map((feed) => <button key={feed.id} title={feedName(feed)} className={section === feed.id ? "active" : ""} onClick={() => setSection(feed.id)}><i style={{ background: feed.color }}>{feed.name.slice(0, 1)}</i><span>{feedName(feed)}</span><b>{articles.filter((a) => a.feedId === feed.id && a.unread).length || ""}</b></button>)}
          </nav>
          <div className="sidebar-footer"><span>{t.todayRead}</span><strong>24 <small>{t.pieces}</small></strong><div><i style={{ width: "68%" }} /></div></div>
        </aside>

        <section className={`article-list ${compact ? "compact" : ""}`}>
          <div className="list-header">
            <div><p>{t.space}</p><h1>{section === "starred" ? t.starred : section === "unread" ? t.unread : feeds.find((f) => f.id === section) ? feedName(feeds.find((f) => f.id === section)!) : t.all}</h1></div>
            <div className="list-tools"><button onClick={() => setCompact((value) => !value)} aria-label="Density">{compact ? "☷" : "☰"}</button><button onClick={markAllRead}>{t.markAll}</button></div>
          </div>
          <div className="date-row"><span>{t.today}</span><i /><b>{visible.filter((a) => a.unread).length} {t.unreadSuffix}</b></div>
          <div className="cards">
            {visible.length ? visible.map((article) => (
              <article key={article.id} className={`${active?.id === article.id ? "selected" : ""} ${article.unread ? "unread" : ""}`} onClick={() => selectArticle(article.id)}>
                <div className="source-icon">{article.accent}</div>
                <div className="card-body"><div className="meta"><span>{localized(article).source}</span><time>{localized(article).time}</time></div><h2>{localized(article).title}</h2><p>{localized(article).excerpt}</p><div className="card-bottom"><span>{localized(article).tag}</span><button className={article.starred ? "starred" : ""} onClick={(event) => { event.stopPropagation(); toggleStar(article.id); }} aria-label={t.star}>{article.starred ? "★" : "☆"}</button></div></div>
              </article>
            )) : <div className="empty"><span>◌</span><h2>{t.noArticles}</h2><p>{t.noArticlesLead}</p></div>}
          </div>
        </section>

        <section className="reader">
          {active ? <>
            <div className="reader-actions"><button aria-label="返回列表">‹</button><div><button onClick={() => toggleStar(active.id)} className={active.starred ? "starred" : ""} aria-label="星标">{active.starred ? "★" : "☆"}</button><button aria-label="稍后读">♧</button><button aria-label="分享">↗</button><button aria-label="更多">•••</button></div></div>
            <article className="reading-pane">
              <div className="reading-source"><div className="source-icon">{active.accent}</div><div><strong>{localized(active).source}</strong><span>{localized(active).time} · {t.readTime}</span></div><button>{t.subscribed}</button></div>
              <h1>{localized(active).title}</h1>
              <p className="dek">{localized(active).excerpt}</p>
              <div className="hero-quote"><span>“</span><p>{t.quote}</p><small>GUANLAN · 观澜</small></div>
              <div className="article-copy">{localized(active).content.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
              <div className="reader-end"><i /><span>{t.end}</span><i /></div>
            </article>
          </> : <div className="reader-empty"><Logo /><p>{t.select}</p></div>}
        </section>
      </div>

      <nav className="mobile-nav"><button onClick={() => setSection("inbox")}><span>▣</span>{t.articles}</button><button onClick={() => setSection("unread")}><span>◉</span>{t.unread}</button><button onClick={() => setSection("starred")}><span>☆</span>{t.star}</button><button onClick={() => setAddOpen(true)}><span>＋</span>{t.subscribe}</button></nav>

      {addOpen && <div className="modal-backdrop" onMouseDown={() => setAddOpen(false)}><form className="modal" onSubmit={addFeed} onMouseDown={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setAddOpen(false)}>×</button><div className="modal-mark"><Logo /></div><p>{t.modalLead}</p><h2>{t.modalTitle}</h2><label>{t.feedAddress}<input autoFocus value={feedUrl} onChange={(event) => setFeedUrl(event.target.value)} placeholder="https://example.com/feed.xml" type="url" required /></label><button className="modal-submit">{t.addTo}</button><small>{t.modalNote}</small></form></div>}
      {notice && <div className="toast">✓ {notice}</div>}
    </main>
  );
}
