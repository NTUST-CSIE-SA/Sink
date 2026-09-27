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

[繁體中文](README.md) | **English**

</div>

## Overview

<img align="right" width="420" alt="Sink links dashboard" src="docs/images/sink.cool_dashboard_links.png" />

Deploys straight to Cloudflare Workers, with no server of your own

This repository is a modified fork of [miantiao-me/Sink](https://github.com/miantiao-me/Sink): it adds folders, drops Workers KV, and reworks the deploy configuration. See the commit history for every change

### **Features**

- **Short links** — custom slugs, UTM parameters, optional case-sensitive matching
- **Link control** — expiration, password protection, unsafe-link warning pages
- **Smart routing** — send visitors to different URLs by device (iOS/Android) or country
- **Social previews** — custom title, description, and image shown when a link is shared
- **Real-time analytics** — charts, maps, and a 3D globe with an event log refreshed every 10 seconds
- **AI assistance** — Workers AI suggests slugs and preview metadata (optional)
- **Import and export** — JSON import and export for links, CSV export for clicks, automatic R2 backups
- **MCP** — a built-in `/api/mcp` endpoint lets AI assistants manage links and query analytics
- **Multi-language** — the dashboard and redirect pages support 11 languages

### **Extra features**

- **Folders** — up to three levels deep, with drag-and-drop moves and folder filters; export, import, and backups keep them
- **No KV dependency** — Workers KV is removed; not compatible with older versions, with no automatic migration
- **Single-source deploy configuration** — `DEPLOY_*` variables generate the deploy-time wrangler config
- **Dashboard cache** — switching folders or pages first shows what this tab already loaded; each page loads 48 links

<br/>

## Quick start

### Requirements

- Node.js 24 or newer
- pnpm 11.11.0 (pinned by `packageManager` in `package.json`)
- A Cloudflare account: D1 is required, Analytics Engine is recommended, R2 and Workers AI are optional

### Running locally

```bash
git clone https://github.com/xinshoutw/Sink.git
cd Sink

cp .env.example .env     # fill in NUXT_SITE_TOKEN
pnpm install
pnpm db:migrate:local    # apply the D1 migrations to local Wrangler D1
pnpm dev                 # dev server
```

Open <http://localhost:7465/dashboard>.

> [!IMPORTANT]
> `.env.example` turns preview mode on. For local development, clear `NUXT_PUBLIC_PREVIEW_MODE`, or new links expire after 5 minutes and cannot be edited or deleted

### Deploying

Cloudflare Workers is the recommended target (Pages is deprecated). Connect your fork in Workers Builds:

- Production branch: `master`
- Build command: `pnpm build`
- Deploy command: `pnpm deploy:worker`
- Build variables: `DEPLOY_D1_DATABASE_ID` (required), plus the optional `DEPLOY_WORKER_NAME`, `DEPLOY_R2_BUCKET_NAME`, and `DEPLOY_ANALYTICS_DATASET`
- Runtime variables: `NUXT_SITE_TOKEN` (encrypted), plus `NUXT_CF_ACCOUNT_ID` and `NUXT_CF_API_TOKEN` for analytics

`pnpm deploy:worker` generates `wrangler.deploy.jsonc` from those variables, applies the remote D1 migrations, then deploys. See [Deploy to Workers](docs/deployment/workers.md) for every step.

> [!IMPORTANT]
> `NUXT_SITE_TOKEN` is the dashboard login password and the Bearer token for the API and MCP. Set a random string of at least 8 characters with no whitespace and keep it stable; without it, every build generates a new one and you may not be able to sign in

### Checks

```bash
pnpm lint
pnpm types:check
pnpm build          # Worker tests run .output, so build after server changes
pnpm test --run
```

<br/>

## Tech stack

| Area           | Choice                                                      |
| -------------- | ----------------------------------------------------------- |
| Framework      | Nuxt 4 (client-rendered SPA) + Nitro                        |
| Runtime        | Cloudflare Workers                                          |
| Database       | Cloudflare D1 + Drizzle ORM                                 |
| Analytics      | Workers Analytics Engine                                    |
| Object storage | Cloudflare R2 (backups and social preview images, optional) |
| AI             | Workers AI (optional)                                       |
| UI             | shadcn-vue + Tailwind CSS 4                                 |
| Tests          | Vitest + @cloudflare/vitest-pool-workers                    |
| Docs           | VitePress                                                   |

### Project layout

```
app/                      dashboard front end (Nuxt, client-rendered)
app/components/ui/        shadcn-vue generated components; do not edit by hand
server/middleware/        short-link redirects (1.redirect) and API auth (2.auth)
server/api/               REST API and the MCP endpoint (/api/**)
server/services/          D1 link and folder stores, MCP tools, reverse proxy
server/utils/             shared server utilities (auto-imported)
server/database/          Drizzle schema
shared/                   zod schemas and types shared by client and server
drizzle/                  D1 migrations (generated by pnpm db:generate)
i18n/locales/             UI strings for 11 languages
docs/                     VitePress docs (English and Simplified Chinese)
tests/                    Vitest (Cloudflare Workers pool)
scripts/                  deploy config generation, map and globe data builds
```

<br/>

## Documentation

The `docs/` folder in this repository has English and Simplified Chinese versions.

| File                                            | Contents                                                                                |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| [Deploy to Workers](docs/deployment/workers.md) | Workers Builds setup, variables, and first use                                          |
| [Configuration](docs/configuration/index.md)    | Bindings, environment variables, and defaults                                           |
| [API](docs/api/index.md)                        | Endpoint overview; each deployment serves the full OpenAPI reference at `/_docs/scalar` |
| [Integrations](docs/integrations/index.md)      | MCP, AI Skills, apps, and browser extensions                                            |
| [Troubleshooting](docs/faqs.md)                 | Common deploy, login, analytics, and backup problems                                    |
| [`AGENTS.md`](AGENTS.md)                        | Development rules: architecture, commands, testing caveats                              |
| [`DESIGN.md`](DESIGN.md)                        | Design system summary                                                                   |

> [!NOTE]
> The upstream docs site [docs.sink.cool](https://docs.sink.cool) still asks for a KV namespace; follow the docs in this repository when deploying this fork

<br/>

## Contributing

Pull requests are welcome. Issues that upstream already has, unrelated to this fork's changes, belong in [miantiao-me/Sink](https://github.com/miantiao-me/Sink/issues).

Before opening a PR, make sure that

1. Code comments and commit messages are in English
2. Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
3. The branch is named `feat/your-feature` or `fix/your-fix`
4. `pnpm lint`, `pnpm types:check`, and `pnpm test --run` pass
5. Drizzle schema changes ship with the migration generated in `drizzle/`
6. UI text changes update all 11 locales

<br/>

## Credits

- [miantiao-me/Sink](https://github.com/miantiao-me/Sink) — the upstream project; you can support its author through [GitHub Sponsors](https://github.com/sponsors/miantiao-me)
- [Cloudflare](https://www.cloudflare.com/), [NuxtHub](https://hub.nuxt.com/), [Astroship](https://astroship.web3templates.com/), [Tailark](https://tailark.com/)

<br/>

## License

- Original work © [miantiao-me](https://github.com/miantiao-me)
- Modifications © 2026 [xinshoutw](https://github.com/xinshoutw)

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0-only)**; see [LICENSE](LICENSE) for the full terms. If you run a modified version as a network service, section 13 requires offering its users the corresponding source
