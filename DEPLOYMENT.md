# HybridX Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Supabase project (free tier works)
- Railway account (or any Node.js hosting)

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials
3. Fill in your database URL

## Database Setup

```bash
# Install dependencies
npm ci

# Push schema to database
npx prisma db push

# (Optional) Seed demo data
npm run db:demo
```

## Build & Deploy

```bash
# Build
npm run build

# Start
npm start
```

## Railway Deployment

1. Connect your GitHub repo to Railway
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables:
   - `DATABASE_URL` (from Railway PostgreSQL plugin)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Supabase OAuth Setup

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add OAuth redirect URL: `https://your-domain.com/auth/callback`
