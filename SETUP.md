# TasteTrace Setup Guide

## Quick Setup (5 minutes)

### 1. Create Cloudflare API Token

1. Go to: **https://dash.cloudflare.com/profile/api-tokens**
2. Click **"Create Token"**
3. Select **"Edit Cloudflare Workers"** template
4. Click **"Continue to summary"** → **"Create Token"**
5. **Copy the token** (you won't see it again!)

### 2. Configure Local Environment

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your token
# VITE_CLOUDFLARE_API_TOKEN=your_token_here
# VITE_CLOUDFLARE_ACCOUNT_ID=your_account_id_here
```

### 3. Get Your Account ID

1. Go to: **https://dash.cloudflare.com**
2. Select any domain (or go to Workers & Pages)
3. Your Account ID is in the right sidebar

### 4. Create D1 Database

```bash
# Login to Cloudflare
npx wrangler login

# Create database
npx wrangler d1 create tastetrace-db

# Copy the database_id from output and update wrangler.toml
```

### 5. Initialize Database

```bash
npx wrangler d1 execute tastetrace-db --file=./schema.sql
```

### 6. Run Locally

```bash
# Development server
npm run dev

# Or with Cloudflare services
npm run build
npx wrangler pages dev dist
```

## Deploy to Cloudflare Pages

### Option 1: GitHub Integration (Recommended)

1. Push to GitHub
2. Go to **Cloudflare Dashboard** → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Select your repository
4. Configure:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy!

### Option 2: Manual Deploy

```bash
npm run build
npx wrangler pages deploy dist
```

## Enable Workers AI

After deployment:

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **tastetrace**
2. Click **Settings** → **Functions**
3. Scroll to **AI Bindings**
4. Add binding:
   - Variable name: `AI`
5. Save and redeploy

## Security Notes

- `.env` files are gitignored - your tokens won't be committed
- API tokens should only be used server-side (in Pages Functions)
- For client-side AI, use the `/api/ai-summary` endpoint

## Troubleshooting

### "AI binding not found"
Make sure Workers AI is enabled in your Cloudflare dashboard.

### "D1 database not found"
Verify the database ID in `wrangler.toml` matches your actual database.

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
```
