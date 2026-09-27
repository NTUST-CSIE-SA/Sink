---
title: Upgrading Sink
description: Upgrade Sink by syncing your GitHub fork and redeploying.
---

# Upgrading Sink

## Before you upgrade

1. Skim the upstream release notes
2. Do not delete your Cloudflare bindings, secrets, or env vars
3. If R2 is set up, consider a manual [backup](/features/backups)

## Normal upgrade

1. On GitHub, open your fork → click **Sync fork** to pull the latest `master`. If you changed files yourself, resolve conflicts first
2. In Cloudflare (Workers Builds or Pages), redeploy the updated `master` branch
3. Wait for the deploy to finish (database updates run as part of deploy)

## After upgrade — quick check

- Sign in to the dashboard
- Create, open, edit, and delete a test link
- Check analytics if you use it
