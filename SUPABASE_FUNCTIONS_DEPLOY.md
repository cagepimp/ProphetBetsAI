# ⚡ DEPLOY SUPABASE EDGE FUNCTIONS NOW

## ❌ Problem: Cannot Auto-Deploy

**Supabase CLI requires a personal access token (sbp_xxx) to deploy functions.**
- Service role keys don't work for CLI deployment
- I cannot automate this without your personal token

## ✅ FASTEST SOLUTION (5 Minutes)

### Get Your Personal Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click "Generate New Token"
3. Copy the token (starts with `sbp_`)

### Deploy Functions

Run these commands with your token:

```bash
# Set your token
export SUPABASE_ACCESS_TOKEN=sbp_YOUR_TOKEN_HERE

# Deploy all functions (run each line)
npx supabase functions deploy populate-games --project-ref abglcmahihbmglkbolir --no-verify-jwt
npx supabase functions deploy fetch-odds --project-ref abglcmahihbmglkbolir --no-verify-jwt
npx supabase functions deploy run-analyzer --project-ref abglcmahihbmglkbolir --no-verify-jwt
npx supabase functions deploy sync-rosters --project-ref abglcmahihbmglkbolir --no-verify-jwt
npx supabase functions deploy generate-props --project-ref abglcmahihbmglkbolir --no-verify-jwt
npx supabase functions deploy update-results --project-ref abglcmahihbmglkbolir --no-verify-jwt
npx supabase functions deploy fetch-injuries --project-ref abglcmahihbmglkbolir --no-verify-jwt
```

## Alternative: Manual Upload via Dashboard

1. Go to: https://supabase.com/dashboard/project/abglcmahihbmglkbolir/functions
2. Click "Create a new function"
3. For each function:
   - Name it (e.g., "populate-games")
   - Copy code from `supabase/functions/[name]/index.ts`
   - Paste and deploy

## 📋 Functions to Deploy

All 7 functions are ready in `./supabase/functions/`:

1. ✅ **populate-games** - Fetches game schedules from ESPN
2. ✅ **fetch-odds** - Gets live betting odds
3. ✅ **run-analyzer** - Runs AI predictions
4. ✅ **sync-rosters** - Updates team rosters
5. ✅ **generate-props** - Creates prop bet suggestions
6. ✅ **update-results** - Updates game results
7. ✅ **fetch-injuries** - Gets injury reports

## 🔑 Environment Secrets Needed

After deploying functions, set these secrets:

```bash
npx supabase secrets set ODDS_API_KEY=your_odds_api_key
npx supabase secrets set OPENAI_API_KEY=your_openai_key
npx supabase secrets set ESPN_API_KEY=your_espn_key
```

Or set them in the dashboard:
https://supabase.com/dashboard/project/abglcmahihbmglkbolir/settings/vault

## ⚡ Why This Matters

Without Edge Functions deployed, your app at https://prophetbetsai.onrender.com/ cannot:
- Fetch game schedules
- Get live odds
- Run predictions
- Update results

**Deploy these NOW to make your app functional.**

## Quick Test After Deployment

```bash
# Test populate-games function
curl -X POST https://abglcmahihbmglkbolir.supabase.co/functions/v1/populate-games \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sport": "nfl"}'
```

---

**I've prepared everything. You just need to provide your personal access token to deploy.**
