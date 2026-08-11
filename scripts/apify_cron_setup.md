# Apify Job Scraper & Scheduled Cron Integration Guide

This guide details how to set up an automated, zero-cost web scraping cron pipeline using **Apify Free Tier** and **GitHub Actions** or **Supabase Scheduled Functions (pg_cron)** to automatically ingest job postings from Greenhouse, Lever, and LinkedIn into your **Passive Candidate Job Board**.

---

## Architecture Overview

```
 ┌────────────────┐       ┌──────────────────────┐       ┌────────────────────────────────┐
 │  Apify Actor   │ ────> │  GitHub Actions Cron │ ────> │  Next.js /api/jobs/ingest API  │
 │ (Greenhouse/   │       │  (or Supabase Cron)  │       │ (Gemini Transferable Matcher)  │
 │  Lever Scraper)│       └──────────────────────┘       └────────────────────────────────┘
 └────────────────┘                                                      │
                                                                         ▼
                                                          ┌──────────────────────────────┐
                                                          │ Alerting (Telegram / Resend) │
                                                          │   Triggers for Score >= 80%  │
                                                          └──────────────────────────────┘
```

---

## Step 1: Apify Actor Setup (Free Tier)

1. Sign up for a free account at [Apify](https://apify.com/).
2. Select one of the pre-built free job scrapers:
   - **Greenhouse Scraper**: `apify/greenhouse-scraper`
   - **Lever Scraper**: `apify/lever-scraper`
   - **LinkedIn Jobs Scraper**: `curious_coder/linkedin-jobs-scraper`
3. Generate an **Apify API Token**:
   - Go to **Settings -> Integrations -> API Tokens** in Apify Console.
   - Copy your `APIFY_API_TOKEN`.

---

## Step 2: Configure Webhook / GitHub Actions Workflow

We provide a production-ready GitHub Action workflow located at `.github/workflows/apify_job_scraper.yml`.

### Setting GitHub Repository Secrets

In your GitHub repository, navigate to **Settings -> Secrets and variables -> Actions**, and add the following repository secrets:

| Secret Name | Description | Example / Value |
|---|---|---|
| `APIFY_TOKEN` | Your Apify API key | `apify_api_...` |
| `INGEST_WEBHOOK_URL` | Deployed Vercel / Next.js API route URL | `https://your-app.vercel.app/api/jobs/ingest` |
| `INGEST_SECRET_TOKEN` | Secret header for authorization | `my-super-secret-ingest-token-123` |

---

## Step 3: Trigger Payload Format (`/api/jobs/ingest`)

Your Apify Actor or custom scraper script should post a JSON payload formatted as either a single job object or an array of job objects:

```json
[
  {
    "title": "Chief of Staff to CEO",
    "company": "Nexus AI Systems",
    "location": "San Francisco, CA (Hybrid / Remote)",
    "salary_range": "$180,000 - $230,000 + Equity",
    "job_type": "Full-time",
    "description": "We are seeking an exceptional Chief of Staff to partner closely with our CEO and executive team. In this role, you will act as a force multiplier for executive decision-making, lead strategic cross-functional initiatives, oversee company-wide OKR cadence, and drive key operational transformations.",
    "raw_url": "https://example.com/careers/nexus-chief-of-staff",
    "source": "apify_greenhouse",
    "external_id": "gh-882109"
  }
]
```

### Curl Test Command

You can test your live endpoint using `curl`:

```bash
curl -X POST https://your-app.vercel.app/api/jobs/ingest \
  -H "Content-Type: application/json" \
  -H "x-ingest-secret: my-super-secret-ingest-token-123" \
  -d '[
    {
      "title": "Director of Business Operations",
      "company": "Apex Cloud",
      "location": "Remote",
      "salary_range": "$190,000 - $240,000",
      "description": "Lead cross-functional operations, budget management, and vendor SLAs.",
      "raw_url": "https://example.com/jobs/apex-123",
      "source": "apify_lever",
      "external_id": "lev-9901"
    }
  ]'
```

---

## Step 4: Alternative Setup with Supabase `pg_cron` & Edge Functions

If you prefer running cron jobs directly inside Supabase without GitHub Actions:

1. Enable `pg_cron` and `pg_net` extensions in Supabase SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   CREATE EXTENSION IF NOT EXISTS pg_net;
   ```
2. Schedule a daily cron job calling your Next.js webhook endpoint:
   ```sql
   SELECT cron.schedule(
     'daily-apify-job-ingest',
     '0 6 * * *', -- Every day at 06:00 UTC
     $$
     SELECT net.http_post(
       url:='https://your-app.vercel.app/api/jobs/ingest',
       headers:='{"Content-Type": "application/json", "x-ingest-secret": "my-super-secret-ingest-token-123"}'::jsonb,
       body:='[{"title":"Chief of Staff","company":"Nexus AI","description":"Strategic operations...","external_id":"cron-101"}]'::jsonb
     );
     $$
   );
   ```

---

## Step 5: High Match Alert Workflow ($\ge 80\%$)

When jobs are ingested via the webhook, the engine automatically:
1. Calculates transferable skill match scores with **Google Gemini 2.5 Flash**.
2. Saves job and match record to **Supabase pgvector**.
3. If `match_score >= 80%`, dispatches instant notifications to **Telegram Bot** (`TELEGRAM_CHAT_ID`) and/or **Resend Email API** (`ALERT_EMAIL_TO`) with a 1-click trigger link to review and tailor your resume!
