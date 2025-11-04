# 🚀 DEPLOY EDGE FUNCTIONS - STEP BY STEP

## Prerequisites

✅ Your functions are ready in `supabase/functions/`
✅ Database schema is deployed
✅ You have Supabase project credentials

---

## STEP 1: Login to Supabase

Open a **new Command Prompt or PowerShell** window and run:

```bash
cd C:\Users\esqla\Desktop\Propetbetsai2

npx supabase login
```

This will open a browser window. Login with your Supabase account.

---

## STEP 2: Link Your Project

```bash
npx supabase link --project-ref abglcmahihbmglkbolir
```

When prompted, paste your database password.

**Don't know your password?**
- Go to https://supabase.com/dashboard
- Select your project
- Go to Settings → Database
- Click "Reset database password" if needed

---

## STEP 3: Set API Secrets

```bash
# Set The Odds API key
npx supabase secrets set ODDS_API_KEY=your_odds_api_key_here

# Set OpenAI API key
npx supabase secrets set OPENAI_API_KEY=sk-your_openai_key_here
```

**Get API Keys:**
- **The Odds API**: https://the-odds-api.com (sign up for free tier)
- **OpenAI**: https://platform.openai.com/api-keys (create new key)

**Verify secrets were set:**
```bash
npx supabase secrets list
```

---

## STEP 4: Deploy All Functions

Copy and paste these commands one by one:

```bash
# Deploy populate-games
npx supabase functions deploy populate-games --no-verify-jwt

# Deploy fetch-odds
npx supabase functions deploy fetch-odds --no-verify-jwt

# Deploy run-analyzer
npx supabase functions deploy run-analyzer --no-verify-jwt

# Deploy sync-rosters
npx supabase functions deploy sync-rosters --no-verify-jwt

# Deploy generate-props
npx supabase functions deploy generate-props --no-verify-jwt

# Deploy update-results
npx supabase functions deploy update-results --no-verify-jwt

# Deploy fetch-injuries
npx supabase functions deploy fetch-injuries --no-verify-jwt
```

**Each command should output:**
```
Deploying Function (project-ref: abglcmahihbmglkbolir)
        Created new function [function-name] in region us-east-1
        version: 1.0.0
        ✓ Deployed Function [function-name]
```

---

## STEP 5: Verify Deployment

### Option A: Test with Script

```bash
node test-functions.mjs
```

### Option B: Test with curl

```bash
# Test populate-games
curl -X POST https://abglcmahihbmglkbolir.supabase.co/functions/v1/populate-games \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sport\":\"NFL\",\"forceRefresh\":true}"
```

Replace `YOUR_ANON_KEY` with your anon key from .env file.

### Option C: Test from UI

1. Open http://localhost:5173
2. Go to **NFL Page**
3. Click **"Refresh Games"** button
4. Check browser console (F12) for logs

---

## STEP 6: Check Function Logs

```bash
# View logs for a function
npx supabase functions logs populate-games --tail

# View errors only
npx supabase functions logs run-analyzer --level error
```

---

## 🎯 QUICK START (All in One)

If you just want to get everything deployed quickly:

```bash
cd C:\Users\esqla\Desktop\Propetbetsai2

npx supabase login
npx supabase link --project-ref abglcmahihbmglkbolir

npx supabase secrets set ODDS_API_KEY=your_key_here
npx supabase secrets set OPENAI_API_KEY=sk-your_key_here

npx supabase functions deploy populate-games --no-verify-jwt && \
npx supabase functions deploy fetch-odds --no-verify-jwt && \
npx supabase functions deploy run-analyzer --no-verify-jwt && \
npx supabase functions deploy sync-rosters --no-verify-jwt && \
npx supabase functions deploy generate-props --no-verify-jwt && \
npx supabase functions deploy update-results --no-verify-jwt && \
npx supabase functions deploy fetch-injuries --no-verify-jwt

node test-functions.mjs
```

---

## 🐛 Troubleshooting

### "Function not found"
- Functions not deployed yet. Run deploy commands above.

### "Missing environment variable"
- Set secrets: `npx supabase secrets set KEY=value`

### "ESPN API rate limit"
- Wait 1 minute between requests (already implemented)

### "The Odds API quota exceeded"
- Check usage at https://the-odds-api.com
- Free tier: 500 requests/month

### "OpenAI API error"
- Verify API key is valid
- Check you have credits: https://platform.openai.com/usage

---

## ✅ Success Checklist

After deployment, verify:

- [ ] All 7 functions deployed (check Supabase dashboard)
- [ ] Secrets set (run `npx supabase secrets list`)
- [ ] Test script passes (run `node test-functions.mjs`)
- [ ] UI "Refresh Games" button works
- [ ] Games appear in database (check Supabase Table Editor)
- [ ] Odds are populated in games.markets column
- [ ] System logs show function executions

---

## 📊 What Each Function Does

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| **populate-games** | Fetch schedules from ESPN | `{"sport":"NFL"}` | Games created/updated |
| **fetch-odds** | Get betting lines | `{"sport":"NFL"}` | Odds updated |
| **run-analyzer** | AI game analysis | `{"gameId":"123","sport":"NFL"}` | Prediction + analysis |
| **sync-rosters** | Player data | `{"sport":"NFL"}` | Players synced |
| **generate-props** | Player props | `{"gameId":"123"}` | Props generated |
| **update-results** | Grade predictions | `{}` or `{"sport":"NFL"}` | Results graded |
| **fetch-injuries** | Injury reports | `{"sport":"NFL"}` | Injuries updated |

---

## 🎉 After Deployment

Once deployed, your app will:

1. ✅ **Refresh Games** → Fetches NFL/NBA/NHL schedules from ESPN
2. ✅ **Update Odds** → Gets live betting lines from DraftKings, FanDuel
3. ✅ **Analyze Games** → GPT-4 generates predictions with confidence scores
4. ✅ **Track Injuries** → Shows player injury status
5. ✅ **Generate Props** → AI-powered player prop recommendations

---

## 🔄 Set Up Automation (Optional)

After functions are working, set up cron jobs:

1. Go to Supabase Dashboard → SQL Editor
2. Run the cron job SQL from `DEPLOYMENT.md`
3. Functions will run automatically:
   - Games populate daily at 3 AM
   - Odds update every 15 minutes
   - Results graded every 2 hours

---

## 📞 Need Help?

Check logs:
```bash
npx supabase functions logs [function-name] --tail
```

Check system logs in database:
```sql
SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 50;
```

**Good luck! 🚀**
