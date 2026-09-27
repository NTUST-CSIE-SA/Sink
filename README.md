<div align="center">
  <img
    src="public/image.png"
    alt="Sink Banner"
    style="width: 100%; height: auto;"
  />
<br>

[![License](https://img.shields.io/github/license/xinshoutw/Sink?style=for-the-badge)](LICENSE)
[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?style=for-the-badge&logo=nuxtdotjs&logoColor=white)](https://nuxt.com)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)

**繁體中文** | [English](README-en.md)

</div>

## 總覽

<img align="right" width="420" alt="Sink 連結管理頁面" src="docs/images/sink.cool_dashboard_links.png" />

可直接在 Cloudflare Worker 部署，不需要自己的伺服器

本 repo 是 [miantiao-me/Sink](https://github.com/miantiao-me/Sink) 的修改版，加入資料夾、移除 Workers KV 並調整部署設定，完整改動見 commit 紀錄

### **功能**

- **短網址** — 自訂 slug、UTM 參數，可選擇是否區分大小寫
- **連結控制** — 到期時間、密碼保護、不安全連結警告頁
- **智慧導向** — 依裝置（iOS／Android）或國家導向不同網址
- **社群預覽** — 自訂分享時顯示的標題、描述與圖片
- **即時分析** — 圖表、地圖，以及每 10 秒更新的 3D 地球與事件紀錄
- **AI 輔助** — 以 Workers AI 產生 slug 與預覽資訊（可選）
- **匯入匯出** — JSON 匯入匯出連結、CSV 匯出點擊資料、自動 R2 備份
- **MCP** — 內建 `/api/mcp`，讓 AI 助理管理連結、查詢分析
- **多語系** — 儀表板與轉址頁支援 11 種語言

### **額外功能**

- **資料夾** — 最多三層，可拖放移動連結、依資料夾篩選，匯出、匯入與備份都會保留
- **不依賴 KV** — 移除 Workers KV，不相容舊版，無自動 Migration
- **單一來源的部署設定** — `DEPLOY_*` 變數產生部署用的 wrangler 設定
- **儀表板快取** — 切換資料夾或頁面時先顯示這個分頁已讀過的資料，每次載入 48 筆連結

<br/>

## 快速開始

### 需求

- Node.js 24 以上
- pnpm 11.11.0（`package.json` 的 `packageManager` 指定）
- Cloudflare 帳號：D1 必需，Analytics Engine 建議，R2 與 Workers AI 可選

### 本機開發

```bash
git clone https://github.com/xinshoutw/Sink.git
cd Sink

cp .env.example .env     # 填入 NUXT_SITE_TOKEN
pnpm install
pnpm db:migrate:local    # 將 D1 migrations 套用到本機 Wrangler D1
pnpm dev                 # 開發伺服器
```

開啟 <http://localhost:7465/dashboard>。

> [!IMPORTANT]
> `.env.example` 預設開啟示範模式。本機開發請清空 `NUXT_PUBLIC_PREVIEW_MODE`，否則新連結 5 分鐘後就會過期，也無法編輯或刪除

### 部署

建議部署到 Cloudflare Workers（Pages 已不建議使用）。在 Workers Builds 連結你的 fork：

- Production branch：`master`
- Build command：`pnpm build`
- Deploy command：`pnpm deploy:worker`
- 建置變數：`DEPLOY_D1_DATABASE_ID`（必需），以及可選的 `DEPLOY_WORKER_NAME`、`DEPLOY_R2_BUCKET_NAME`、`DEPLOY_ANALYTICS_DATASET`
- 執行期變數：`NUXT_SITE_TOKEN`（加密），要看點擊分析再加上 `NUXT_CF_ACCOUNT_ID`、`NUXT_CF_API_TOKEN`

`pnpm deploy:worker` 會用這些變數產生 `wrangler.deploy.jsonc`，套用遠端 D1 migrations 後再部署。完整步驟見[部署到 Workers](docs/zh-CN/deployment/workers.md)。

> [!IMPORTANT]
> `NUXT_SITE_TOKEN` 是儀表板登入密碼，也是 API 與 MCP 的 Bearer token。請設定至少 8 個字元、不含空白的隨機字串並保持不變；未設定時每次建置都會隨機產生，可能導致無法登入

### 驗證

```bash
pnpm lint
pnpm types:check
pnpm build          # Worker 測試執行的是 .output，改過伺服器程式要先 build
pnpm test --run
```

<br/>

## 技術棧

| 項目     | 選用                                      |
| -------- | ----------------------------------------- |
| 框架     | Nuxt 4（只在瀏覽器渲染的 SPA）＋ Nitro    |
| 執行環境 | Cloudflare Workers                        |
| 資料庫   | Cloudflare D1 ＋ Drizzle ORM              |
| 點擊分析 | Workers Analytics Engine                  |
| 物件儲存 | Cloudflare R2（備份與社群預覽圖片，可選） |
| AI       | Workers AI（可選）                        |
| 介面     | shadcn-vue ＋ Tailwind CSS 4              |
| 測試     | Vitest ＋ @cloudflare/vitest-pool-workers |
| 文件     | VitePress                                 |

### 專案結構

```
app/                      儀表板前端（Nuxt，只在瀏覽器渲染）
app/components/ui/        shadcn-vue 產生的元件，不要手動修改
server/middleware/        短網址轉址（1.redirect）與 API 驗證（2.auth）
server/api/               REST API 與 MCP 端點（/api/**）
server/services/          D1 連結與資料夾儲存、MCP 工具、反向代理
server/utils/             伺服器共用工具（自動匯入）
server/database/          Drizzle schema
shared/                   前後端共用的 zod schema 與型別
drizzle/                  D1 migrations（pnpm db:generate 產生）
i18n/locales/             11 種語言的介面文字
docs/                     VitePress 文件（英文、簡體中文）
tests/                    Vitest（Cloudflare Workers pool）
scripts/                  部署設定產生、地圖與 3D 地球資料建置
```

<br/>

## 文件

repo 內的 `docs/` 提供英文與簡體中文版本。

| 檔案                                               | 內容                                                  |
| -------------------------------------------------- | ----------------------------------------------------- |
| [部署到 Workers](docs/zh-CN/deployment/workers.md) | Workers Builds 設定、變數與首次使用                   |
| [設定參考](docs/zh-CN/configuration/index.md)      | 綁定、環境變數與預設值                                |
| [API](docs/zh-CN/api/index.md)                     | 端點總覽，部署後可在 `/_docs/scalar` 查看完整 OpenAPI |
| [整合](docs/zh-CN/integrations/index.md)           | MCP、AI Skills、App 與瀏覽器擴充功能                  |
| [疑難排解](docs/zh-CN/faqs.md)                     | 部署、登入、分析、備份的常見問題                      |
| [`AGENTS.md`](AGENTS.md)                           | 開發規範：架構、指令、測試注意事項                    |
| [`DESIGN.md`](DESIGN.md)                           | 設計系統摘要                                          |

> [!NOTE]
> 上游文件站 [docs.sink.cool](https://docs.sink.cool) 仍要求建立 KV，部署本 fork 請以 repo 內的文件為準

<br/>

## 貢獻

歡迎發 Pull Request。上游本來就有、與本 fork 改動無關的問題，請回報到 [miantiao-me/Sink](https://github.com/miantiao-me/Sink/issues)。

PR 送出前請確認

1. 程式碼註解與 commit 訊息一律英文
2. commit 遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hant/v1.0.0/)
3. 以 `feat/your-feature` 或 `fix/your-fix` 命名分支
4. 通過 `pnpm lint`、`pnpm types:check` 與 `pnpm test --run`
5. 更動 Drizzle schema 時，一併提交 `drizzle/` 產生的 migration
6. 更動介面文字時，11 種語系一起更新

<br/>

## 致謝

- [miantiao-me/Sink](https://github.com/miantiao-me/Sink) — 本專案的上游，可以透過 [GitHub Sponsors](https://github.com/sponsors/miantiao-me) 支持原作者
- [Cloudflare](https://www.cloudflare.com/)、[NuxtHub](https://hub.nuxt.com/)、[Astroship](https://astroship.web3templates.com/)、[Tailark](https://tailark.com/)

<br/>

## 授權

- 原始作品 © [miantiao-me](https://github.com/miantiao-me)
- 修改部分 © 2026 [xinshoutw](https://github.com/xinshoutw)

本專案採用 **GNU Affero General Public License v3.0（AGPL-3.0-only）** 授權，完整條款見 [LICENSE](LICENSE)。若部署修改後的版本對外提供服務，依第 13 條須讓使用者取得對應的原始碼
