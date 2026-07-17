import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "观澜 · 沉浸式 RSS 阅读器",
  description: "观澜是一款安静、专注、由你掌控的 RSS 阅读器。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
