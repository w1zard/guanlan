# 观澜 Guanlan

一款以 Google Reader 为灵感的现代 RSS 阅读器。观澜强调安静、清晰和用户对数据的掌控，采用 React、TypeScript 与 Vite/Vinext 构建，可运行在 Cloudflare Workers，并使用 Cloudflare D1 持久化结构化数据。

> 观水有术，阅世有度。

## 功能

- 三栏式订阅、文章列表与沉浸阅读界面
- 全部、未读、星标和单个订阅源筛选
- 文章搜索、列表密度切换和一键全部已读
- RSS / Atom 地址添加
- 中文与英文界面及示例文章内容
- 亮色、暗色主题与偏好记忆
- 密码访问页面和会话内登录状态
- 响应式桌面、平板和移动端布局
- D1 持久化订阅源、文章、未读和星标状态
- Cloudflare Worker 兼容的 ESM 构建产物

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 界面 | React 19、TypeScript、CSS、Tailwind CSS 4 |
| 构建 | Vite 8、Vinext |
| 服务端 | Cloudflare Workers、Next.js 风格 Route Handlers |
| 数据库 | Cloudflare D1（SQLite）、Drizzle ORM |
| 部署 | Cloudflare Workers / OpenAI Sites |

Vinext 为项目提供基于 Vite 的 React Server Components 和 Worker 构建能力。业务界面保持为标准 React 组件，便于后续通过 Capacitor 或 React Native 共享类型、API 客户端和领域逻辑。

## 快速开始

### 环境要求

- Node.js 22.13 或更高版本
- npm
- 如需真实云端数据：Cloudflare 账户和 D1 数据库

### 安装与运行

```bash
npm install
npm run dev
```

开发服务器启动后，访问终端显示的本地地址。当前演示密码为：

```text
guanlan
```

### 构建

```bash
npm run build
```

构建产物位于 `dist/`，其中包含 Cloudflare Worker 服务端入口、浏览器静态资源、托管配置和数据库迁移。

## 数据库

项目在 `.openai/hosting.json` 中声明逻辑绑定 `DB`。本地开发由 Cloudflare Vite 插件模拟绑定，生产环境由托管平台连接真实 D1 数据库。

主要数据表：

- `feeds`：订阅源名称、地址、颜色及创建时间
- `articles`：中英文文章内容、来源、未读状态、星标状态及所属订阅源

修改 `db/schema.ts` 后生成迁移：

```bash
npm run db:generate
```

迁移文件会写入 `drizzle/`。请将 schema、迁移和应用代码放在同一次提交中。

首次调用阅读器 API 时，如果数据库为空，会自动写入演示订阅源和文章。用户添加的订阅、未读状态与星标状态随后都以 D1 为准；语言和主题属于设备级偏好，保存在浏览器中。

## API

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| `GET` | `/api/reader` | 获取订阅源和文章，空库时初始化示例数据 |
| `POST` | `/api/reader` | 保存新的 RSS / Atom 地址 |
| `PATCH` | `/api/reader/articles` | 更新未读、星标状态或全部标为已读 |

## 项目结构

```text
app/
  api/reader/             D1 阅读器 API
  globals.css             全局样式、双主题和响应式布局
  layout.tsx              页面元数据与根布局
  page.tsx                登录页和阅读器界面
db/
  index.ts                D1/Drizzle 访问入口
  schema.ts               数据模型
drizzle/                  D1 SQL 迁移
worker/index.ts           Cloudflare Worker 入口
.openai/hosting.json      D1 与托管声明
vite.config.ts            Vite、Vinext 和 Cloudflare 配置
```

## Cloudflare 部署

项目不依赖传统常驻服务器，可以整体运行在 Cloudflare 平台：

1. 创建 D1 数据库并将 Worker 的 `DB` 绑定指向它。
2. 应用 `drizzle/` 中的 SQL 迁移。
3. 构建并部署 `dist/` 中的 Worker 产物。
4. 如需自动抓取 RSS，可为 Worker 增加 Cron Trigger；图片归档可按需增加 R2。

使用 OpenAI Sites 发布时，平台会根据 `.openai/hosting.json` 创建或复用 D1 资源，并在版本部署时处理迁移。

## 移动端规划

推荐将平台无关能力逐步抽离为共享包：

- RSS、Feed、Article 等领域类型
- Worker API 客户端
- 登录、同步和离线缓存策略
- 本地化文案与主题 token

网页界面可以优先通过 Capacitor 封装为 Android/iOS 应用；若需要更原生的交互，再使用 React Native 重写视图层并复用上述共享逻辑。

## 安全说明

当前密码页面用于私有演示，默认密码存在于前端代码中，不能作为公开互联网环境的强认证方案。正式公开部署前，应至少完成以下之一：

- 使用 Cloudflare Access 限制访问者
- 在 Worker 端验证密码哈希并签发 HttpOnly、Secure Cookie
- 接入平台提供的身份认证

不要提交 `.env`、`.dev.vars`、密码、访问令牌、D1 数据库 ID 或其他密钥。仓库提供的 `.gitignore` 已排除常见敏感文件。

## 开发命令

```bash
npm run dev          # 启动本地开发
npm run build        # 生成 Worker 兼容构建
npm run lint         # 静态检查
npm run db:generate  # 生成 D1/Drizzle 迁移
```

## 贡献

欢迎提交 Issue 和 Pull Request。建议在提交前运行构建与静态检查，并为 schema 变化一并提交生成的迁移文件。

## 开源协议

本项目采用 [MIT License](./LICENSE)。你可以自由使用、复制、修改和分发，但需保留原始版权与许可声明。
