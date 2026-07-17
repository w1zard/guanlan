export type ParsedFeedItem = {
  title: string;
  link: string;
  excerpt: string;
  content: string;
  published: string;
};

function decodeEntities(value: string) {
  const named: Record<string, string> = { amp:"&", lt:"<", gt:">", quot:'"', apos:"'", nbsp:" " };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => {
    if (entity[0] === "#") {
      const hex = entity[1]?.toLowerCase() === "x";
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    }
    return named[entity.toLowerCase()] ?? `&${entity};`;
  });
}

function unwrap(value: string) {
  return decodeEntities(value.replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g, "").trim());
}

export function htmlToReadableText(html: string) {
  return decodeEntities(html
    .replace(/<(script|style|noscript|svg|nav|footer|form|aside)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(br|hr)\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|div|section|article|h[1-6]|li|blockquote)>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " "))
    .replace(/[\t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function tag(block: string, names: string[]) {
  for (const name of names) {
    const escaped = name.replace(":", "\\:");
    const match = block.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, "i"));
    if (match?.[1]) return unwrap(match[1]);
  }
  return "";
}

function itemLink(block: string) {
  const regular = tag(block, ["link"]);
  if (regular && /^https?:\/\//i.test(regular)) return regular.trim();
  return block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1]?.trim() ?? "";
}

export function parseFeed(xml: string): ParsedFeedItem[] {
  const blocks = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
  if (!blocks.length) blocks.push(...[...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)].map((match) => match[1]));
  return blocks.slice(0, 8).map((block) => {
    const title = htmlToReadableText(tag(block, ["title"]));
    const rawSummary = tag(block, ["description", "summary"]);
    const rawContent = tag(block, ["content:encoded", "content"]);
    const excerpt = htmlToReadableText(rawSummary || rawContent).slice(0, 360);
    const fullText = htmlToReadableText(rawContent);
    return { title, link:itemLink(block), excerpt, content:fullText, published:tag(block, ["pubDate", "published", "updated"]) };
  }).filter((item) => item.title && item.link);
}

export async function fetchArticleText(url: string) {
  const response = await fetch(url, { headers:{ "user-agent":"Guanlan RSS Reader/0.1 (+https://github.com/)", accept:"text/html,application/xhtml+xml" }, redirect:"follow" });
  if (!response.ok) throw new Error(`article fetch ${response.status}`);
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("html")) return "";
  const html = await response.text();
  const candidates = [
    html.match(/<article(?:\s[^>]*)?>([\s\S]*?)<\/article>/i)?.[1],
    html.match(/<main(?:\s[^>]*)?>([\s\S]*?)<\/main>/i)?.[1],
    html.match(/<(?:div|section)[^>]+(?:class|id)=["'][^"']*(?:article-body|article-content|post-content|entry-content|story-body)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/i)?.[1],
  ].filter(Boolean) as string[];
  let best = "";
  for (const candidate of candidates) {
    const text = htmlToReadableText(candidate);
    if (text.length > best.length) best = text;
  }
  return best.slice(0, 100_000);
}

export function isSafeFeedUrl(value: string) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host === "0.0.0.0" || host === "::1" || host.endsWith(".local")) return false;
    if (/^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) return false;
    return true;
  } catch { return false; }
}
