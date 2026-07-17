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
- Worker 服务端密码校验与 HttpOnly 会话 Cookie
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

<details>
<summary>📸 截图预览（点击展开）</summary>
<img width=30% height=30% src="screenshot/ui1.png" alt="ui1">
</details>

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

复制本地变量模板并设置自己的密码。示例文件只有占位符，不包含可用密钥：

```bash
cp .dev.vars.example .dev.vars
```

编辑 `.dev.vars`：

```dotenv
GUANLAN_PASSWORD=你自己的访问密码
GUANLAN_SESSION_SECRET=至少32位的随机字符串
```

`.dev.vars` 已被 Git 忽略，不能提交。开发服务器启动后，访问终端显示的本地地址并输入你设置的密码。

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

首次调用阅读器 API 时会写入精选订阅目录，并在空文章库中加入少量界面示例。用户添加的订阅、未读状态与星标状态随后都以 D1 为准；语言和主题属于设备级偏好，保存在浏览器中。

### 预置 RSS 目录

当前内置 76 个 RSS 源，覆盖公开提供 RSS 的代表性中文科技媒体、国际科技媒体、开发者社区、公司技术博客、综合新闻与科学媒体。除少数派、Solidot、IT之家、爱范儿、开源中国、InfoQ 中文等中文来源外，也包括 Ars Technica、WIRED、The Verge、TechCrunch、MIT Technology Review、Hacker News、Stack Overflow、Cloudflare、GitHub、OpenAI、BBC、The Guardian、CNN、DW、France 24、NPR、Nature、Scientific American、Quanta、NASA 与 JPL 等来源。

这是一份可维护的精选目录，不声称覆盖互联网上“所有”媒体。RSS 地址可能被发布方调整；失效来源应在后续抓取任务中标记并更新。目录使用 D1 中的 `feed_catalog_version` 记录版本：部署包含新版目录的代码后，首次加载会按 10 个一组分批补齐新增源，成功后更新版本号；已存在的来源和用户自行添加的订阅不会被覆盖。

## API

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| `GET` | `/api/reader` | 获取订阅源和文章，空库时初始化示例数据 |
| `POST` | `/api/reader` | 保存新的 RSS / Atom 地址 |
| `PATCH` | `/api/reader/articles` | 更新未读、星标状态或全部标为已读 |
| `POST` | `/api/reader/refresh` | 刷新订阅；优先读取 RSS 全文，必要时回源提取文章正文 |
| `PATCH` | `/api/reader/feeds` | 修改订阅名称、RSS 地址和标识颜色 |
| `DELETE` | `/api/reader/feeds?id=...` | 删除订阅源及其文章 |
| `GET` | `/api/auth` | 检查密码会话状态 |
| `POST` | `/api/auth` | 在 Worker 端校验环境变量密码并设置 Cookie |
| `DELETE` | `/api/auth` | 清除会话 Cookie |

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

## 通过 Cloudflare 网页部署到 Workers

以下步骤适合他人 Fork 后使用，不需要在仓库中写入密码、令牌或数据库 ID。

### 1. Fork 仓库

在 GitHub 项目页面点击右上角 **Fork**，选择自己的账户。不要修改或提交 `.dev.vars`、`.env` 等本地秘密文件。

### 2. 连接 GitHub 仓库并直接部署

1. 打开 **Workers & Pages → Create application → Import a repository**。
2. 授权 GitHub，并选择刚才 Fork 的仓库。
3. 将 Build command 设置为：

   ```bash
   npm ci && npm run build
   ```

4. 将 Deploy command 设置为：

   ```bash
   npx wrangler deploy --config dist/server/wrangler.json
   ```

5. 不需要添加数据库 ID、密码或其他构建变量，直接保存并部署。

项目生成的 Wrangler 配置只声明名为 `DB` 的 D1 binding，不包含账户专属资源 ID。Wrangler 4.45 及以上版本会在第一次部署时自动创建 D1 数据库并绑定到 Worker。应用首次成功进入阅读器时，会自动创建表、索引并导入预置 RSS 目录，不需要在网页控制台粘贴 SQL。

### 3. 部署后设置登录密码

第一次部署完成后：

1. 打开新建的 Worker。
2. 进入 **Settings → Variables and Secrets**。
3. 添加以下两个变量，并选择加密的 **Secret** 类型：

   | 名称 | 建议 |
   | --- | --- |
   | `GUANLAN_PASSWORD` | 自己选择的强密码 |
   | `GUANLAN_SESSION_SECRET` | 至少 32 位、不可预测的随机字符串 |

4. 保存后重新访问 Worker 地址并输入刚设置的密码。密码只在 Worker 运行时读取，不会进入浏览器包、Git 历史或构建日志。

### 4. 确认自动创建的数据库

在 Worker 的 **Settings → Bindings** 中可以看到自动创建的 `DB` D1 binding。无需复制数据库 ID，也无需把 Cloudflare 账户信息提交回 Fork。

### 5. 日后更新

向 Fork 的默认分支推送代码后，Cloudflare 会自动重新构建并部署。当前基础 schema 会在运行时幂等初始化；未来涉及表结构变更时，仍应生成并应用新的 Drizzle 迁移。

顶部刷新按钮会主动抓取 RSS。RSS 提供 `content:encoded` 或 Atom `content` 时直接保存全文；仅提供摘要时，Worker 会访问原文并从 `article`、`main` 或常见正文容器提取文本。后续还可以为同一刷新端点增加 Cron Trigger；图片归档可按需增加 R2。

使用 OpenAI Sites 发布时，平台会根据 `.openai/hosting.json` 创建或复用 D1 资源，并在版本部署时处理迁移。

## 移动端规划

推荐将平台无关能力逐步抽离为共享包：

- RSS、Feed、Article 等领域类型
- Worker API 客户端
- 登录、同步和离线缓存策略
- 本地化文案与主题 token

网页界面可以优先通过 Capacitor 封装为 Android/iOS 应用；若需要更原生的交互，再使用 React Native 重写视图层并复用上述共享逻辑。

## 安全说明

登录密码从 `GUANLAN_PASSWORD` 环境变量读取，仅在 Worker 服务端校验。成功登录后，Worker 签发由 `GUANLAN_SESSION_SECRET` HMAC 签名的 HttpOnly、SameSite Cookie；HTTPS 部署还会自动加上 Secure 属性。会话默认有效期为 7 天。

不要提交 `.env`、`.dev.vars`、密码、会话密钥、访问令牌或其他敏感值。仓库仅提供 `.env.example` 与 `.dev.vars.example` 占位模板。若站点面向多人或公共互联网，建议额外启用 Cloudflare Access、速率限制与登录失败防护。

## 开发命令

```bash
npm run dev          # 启动本地开发
npm run build        # 生成 Worker 兼容构建
npm run lint         # 静态检查
npm run db:generate  # 生成 D1/Drizzle 迁移
```
## 捐助

如果这个项目对你有用的话，请我喝罐可乐吧。
<br>
<img width=30% height=30% src="请我喝可乐.jpg" alt="qrcode">
<br>

## 贡献

欢迎提交 Issue 和 Pull Request。建议在提交前运行构建与静态检查，并为 schema 变化一并提交生成的迁移文件。

## 开源协议

本项目采用 [MIT License](./LICENSE)。你可以自由使用、复制、修改和分发，但需保留原始版权与许可声明。
