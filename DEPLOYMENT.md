# TasteTrace - Cloudflare Deployment Guide

This guide explains how to deploy TasteTrace to Cloudflare Pages with D1 database and Workers AI.

## Prerequisites

1. A Cloudflare account (free tier works)
2. Node.js 18+ installed
3. Wrangler CLI installed (`npm install -g wrangler`)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser window to authenticate with Cloudflare.

## Step 3: Create D1 Database

```bash
# Create the database
npx wrangler d1 create tastetrace-db
```

This will output a database ID. Copy it and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "tastetrace-db"
database_id = "YOUR_DATABASE_ID_HERE"  # <-- Replace this
```

## Step 4: Initialize Database Schema

```bash
# Run the schema migration
npx wrangler d1 execute tastetrace-db --file=./schema.sql
```

## Step 5: Enable Workers AI

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** > **Overview**
3. Click on your project (after deployment)
4. Go to **Settings** > **Functions**
5. Under **AI Bindings**, add:
   - Variable name: `AI`
   - Model: `@cf/meta/llama-3.1-8b-instruct`

## Step 6: Build and Deploy

```bash
# Build the frontend
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist
```

## Step 7: Configure Custom Domain (Optional)

1. Go to your Cloudflare Pages project
2. Click **Custom domains**
3. Add `tastetrace.net` (or your preferred domain)
4. Update DNS records as instructed

## Environment Variables

Set these in Cloudflare Dashboard > Workers & Pages > Your Project > Settings > Environment Variables:

| Variable | Description | Required |
|----------|-------------|----------|
| None currently | - | - |

## Free Tier Limits

### Cloudflare Pages
- Unlimited requests
- Unlimited bandwidth
- 500 builds/month

### Workers AI (Free Tier)
- 10,000 requests/day
- Models: Llama 3.1 8B, and others

### D1 Database (Free Tier)
- 5 GB storage
- 5 million rows read/day
- 100,000 rows written/day

## Local Development

```bash
# Start Vite dev server
npm run dev

# Or test with Cloudflare locally (after build)
npm run build
npx wrangler pages dev dist
```

## Troubleshooting

### "AI binding not found"
Make sure Workers AI is enabled in your Cloudflare dashboard and the binding is correctly configured.

### "D1 database not found"
Verify the database ID in `wrangler.toml` matches the one created in your Cloudflare account.

### Build fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Cloudflare Pages                     │
│  ┌───────────────┐    ┌──────────────────────────┐  │
│  │   Frontend    │    │   Pages Functions        │  │
│  │  (React/Vite) │───▶│   /api/restaurants       │  │
│  │               │    │   /api/ai-summary        │  │
│  └───────────────┘    └───────────┬──────────────┘  │
│                                   │                  │
│                       ┌───────────┴───────────┐      │
│                       ▼                       ▼      │
│               ┌──────────────┐      ┌─────────────┐ │
│               │  D1 Database │      │  Workers AI │ │
│               │  (SQLite)    │      │  (LLM)      │ │
│               └──────────────┘      └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Support

For issues, please open a GitHub issue at:
https://github.com/bejranonda/Taste-Trace/issues
