# ProphetBetsAI Backend - Deployment Guide

## ✅ What's Been Built

The complete backend infrastructure for ProphetBetsAI has been implemented:

### Shared Utilities (`supabase/functions/_shared/`)
- ✅ **types.ts** - Complete TypeScript types for all operations
- ✅ **supabase-client.ts** - Database client with helper functions
- ✅ **espn-api.ts** - ESPN API integration (schedules, scores, rosters)
- ✅ **odds-api.ts** - The Odds API integration (betting lines)
- ✅ **openai-client.ts** - GPT-4 AI analysis engine

### Edge Functions (`supabase/functions/`)
- ✅ **populate-games/** - Fetch game schedules from ESPN
- ✅ **fetch-odds/** - Get betting odds from The Odds API
- ✅ **run-analyzer/** - AI-powered game analysis with GPT-4
- ✅ **sync-rosters/** - Player roster synchronization
- ✅ **generate-props/** - AI player prop recommendations
- ✅ **update-results/** - Automatic prediction grading
- ✅ **fetch-injuries/** - Injury report synchronization

---

## 🚀 Deployment Steps

### 1. Prerequisites

Ensure you have:
- ✅ Supabase project created
- ✅ Supabase CLI installed (`npm install -g supabase`)
- ✅ API keys ready:
  - Supabase URL and Keys
  - The Odds API key
  - OpenAI API key

### 2. Link to Supabase Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Set Environment Secrets

```bash
# Set The Odds API key
supabase secrets set ODDS_API_KEY=your_odds_api_key

# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=sk-your_openai_key

# Verify secrets are set
supabase secrets list
```

### 4. Deploy Edge Functions

Deploy all functions at once:

```bash
cd supabase/functions

# Deploy each function
supabase functions deploy populate-games --no-verify-jwt
supabase functions deploy fetch-odds --no-verify-jwt
supabase functions deploy run-analyzer --no-verify-jwt
supabase functions deploy sync-rosters --no-verify-jwt
supabase functions deploy generate-props --no-verify-jwt
supabase functions deploy update-results --no-verify-jwt
supabase functions deploy fetch-injuries --no-verify-jwt
```

### 5. Test Each Function

Test the functions using curl or your frontend:

```bash
# Test populate-games (NFL example)
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/populate-games \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sport":"NFL"}'

# Test fetch-odds
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/fetch-odds \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sport":"NFL"}'

# Test run-analyzer (use a real game ID from your database)
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/run-analyzer \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"gameId":"401547404","sport":"NFL"}'
```

---

## 🔧 Setting Up Cron Jobs

For automatic execution, set up cron jobs in Supabase:

### Recommended Schedule

| Function | Frequency | Cron Expression | Purpose |
|----------|-----------|----------------|---------|
| populate-games | Daily 3 AM | `0 3 * * *` | Fetch new game schedules |
| fetch-odds | Every 15 min | `*/15 * * * *` | Update betting lines |
| sync-rosters | Weekly Sunday | `0 4 * * 0` | Update player rosters |
| fetch-injuries | Daily 9 AM | `0 9 * * *` | Update injury reports |
| update-results | Every 2 hours | `0 */2 * * *` | Grade completed games |

### Set Up Cron in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Extensions**
3. Enable `pg_cron` extension
4. Go to **SQL Editor** and run:

```sql
-- Populate games daily at 3 AM
SELECT cron.schedule(
  'populate-nfl-games',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/populate-games',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body:='{"sport":"NFL"}'::jsonb
  );
  $$
);

-- Fetch odds every 15 minutes
SELECT cron.schedule(
  'fetch-nfl-odds',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/fetch-odds',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body:='{"sport":"NFL"}'::jsonb
  );
  $$
);

-- Update results every 2 hours
SELECT cron.schedule(
  'update-results',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/update-results',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);
```

**Important:** Replace `YOUR_PROJECT_REF` and `YOUR_SERVICE_ROLE_KEY` with your actual values.

---

## 🎯 Frontend Integration

### Update supabaseClient.js

Add a function to call Edge Functions:

```javascript
export async function callEdgeFunction(functionName, payload) {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });

  if (error) {
    throw error;
  }

  return data;
}
```

### Update Sport Pages

Replace direct database queries with Edge Function calls where appropriate:

**Example: NFLPage.jsx**

```javascript
// OLD: Direct database query
const nflGames = await getGames({ sport: 'NFL' });

// NEW: Use Edge Function for fresh data
const handleRefreshGames = async () => {
  // First, populate games from ESPN
  await callEdgeFunction('populate-games', { sport: 'NFL' });

  // Then fetch odds
  await callEdgeFunction('fetch-odds', { sport: 'NFL' });

  // Finally, reload from database
  const nflGames = await getGames({ sport: 'NFL' });
  setGames(nflGames);
};

const handleAnalyzeGame = async (game) => {
  const result = await callEdgeFunction('run-analyzer', {
    gameId: game.id,
    sport: 'NFL',
    analysisDepth: 'standard'
  });

  // Show analysis in UI
  console.log('Analysis:', result.analysis);
};
```

---

## 📊 Testing Checklist

### Manual Testing

- [ ] **populate-games**
  - [ ] NFL: Creates games for current week
  - [ ] NBA: Creates games for next 14 days
  - [ ] Games have correct teams, dates, venues

- [ ] **fetch-odds**
  - [ ] Updates games with markets (moneyline, spread, total)
  - [ ] Multiple bookmakers (DraftKings, FanDuel)
  - [ ] Odds are in correct format

- [ ] **run-analyzer**
  - [ ] Generates prediction with confidence score
  - [ ] Returns recommended bets
  - [ ] Stores prediction in database

- [ ] **sync-rosters**
  - [ ] Fetches player rosters for teams
  - [ ] Stores player data (name, position, etc.)
  - [ ] Updates existing players

- [ ] **generate-props**
  - [ ] Generates player props (points, rebounds, etc.)
  - [ ] Provides over/under recommendations
  - [ ] Confidence scores are reasonable

- [ ] **update-results**
  - [ ] Grades completed games correctly
  - [ ] Updates prediction.result field
  - [ ] Calculates profit/loss

- [ ] **fetch-injuries**
  - [ ] Fetches current injury reports
  - [ ] Stores with correct status
  - [ ] Updates existing injuries

### End-to-End Test

1. Deploy all functions
2. Run `populate-games` for NFL
3. Run `fetch-odds` for NFL
4. Pick a game and run `run-analyzer`
5. View prediction in database
6. After game completes, run `update-results`
7. Verify prediction was graded correctly

---

## 📈 Monitoring

### Check Function Logs

```bash
# View logs for a specific function
supabase functions logs populate-games --tail

# View errors only
supabase functions logs populate-games --level error
```

### Monitor System Logs

Query the `system_logs` table in your database:

```sql
SELECT * FROM system_logs
ORDER BY created_at DESC
LIMIT 50;
```

### Check Accuracy Metrics

```sql
SELECT * FROM accuracy_metrics
ORDER BY last_updated DESC;
```

---

## 🐛 Troubleshooting

### "Missing environment variable" error

**Solution:** Set secrets using `supabase secrets set KEY=value`

### "ESPN API rate limit" error

**Solution:** Add delays between requests in cron jobs

### "The Odds API quota exceeded"

**Solution:**
- Check usage at https://the-odds-api.com
- Reduce fetch frequency or limit sports
- Upgrade API plan if needed

### "OpenAI API error"

**Solution:**
- Verify API key is valid
- Check OpenAI account has credits
- Reduce analysis depth to save tokens

### Database connection errors

**Solution:**
- Verify Supabase URL and keys are correct
- Check if database is accessible
- Review RLS policies

---

## 💰 Cost Estimates

### The Odds API
- **Free tier:** 500 requests/month
- **Paid:** $50-200/month depending on usage
- **Our usage:** ~2,880 requests/day (fetching 7 sports every 15 min)

### OpenAI
- **GPT-4 Turbo:** $0.01/1K input tokens, $0.03/1K output tokens
- **Estimated:** $50-150/month for ~100 analyses/day

### Supabase
- **Free tier:** Good for development
- **Pro ($25/month):** Recommended for production
- **Includes:** 8GB database, 100GB bandwidth, 2 GB file storage

**Total estimated cost:** $125-375/month for full production

---

## ✅ Success Criteria

Your backend is successfully deployed when:

1. ✅ All 7 functions deploy without errors
2. ✅ `populate-games` creates games in database
3. ✅ `fetch-odds` updates game markets
4. ✅ `run-analyzer` generates predictions
5. ✅ Cron jobs run automatically
6. ✅ Frontend can call functions and display results
7. ✅ Accuracy metrics are calculated correctly

---

## 🎓 Next Steps

1. **Deploy to production**
   - Set up cron jobs
   - Configure monitoring alerts
   - Test with real data

2. **Optimize performance**
   - Add caching for frequently accessed data
   - Batch API requests where possible
   - Monitor and optimize slow queries

3. **Enhance features**
   - Add more sports
   - Implement historical data analysis
   - Build pattern recognition
   - Add user-specific predictions

4. **Scale up**
   - Increase API quotas as needed
   - Add more bookmakers for better odds
   - Implement advanced AI models

---

## 📞 Support

If you encounter issues:

1. Check function logs: `supabase functions logs [function-name]`
2. Review system_logs table in database
3. Test functions individually with curl
4. Verify all environment variables are set
5. Check API key quotas and limits

**The backend is ready to power ProphetBetsAI! 🚀**
