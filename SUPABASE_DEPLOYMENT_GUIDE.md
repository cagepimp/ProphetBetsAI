# 🚀 SUPABASE DEPLOYMENT GUIDE - ProphetBets AI

## 📋 EDGE FUNCTIONS OVERVIEW

You have **4 Edge Functions** ready to deploy:

### 1. **runAnalyzer10000Plus** (15.6KB)
**Purpose:** Main AI prediction engine with 10K+ iterations
**Features:**
- Multi-factor analysis (7+ factors)
- Injury impact calculation
- Team matchup analysis
- Historical trends analysis
- Weather impact (NFL, CFB, MLB)
- Learning pattern application
- Confidence scoring (0-100%)
- Spread & total recommendations

**Input:**
```json
{
  "gameId": "uuid-here",
  "sport": "NFL",
  "forceReanalyze": false
}
```

**Output:**
```json
{
  "success": true,
  "prediction": {
    "winner": "Kansas City Chiefs",
    "confidence": 78,
    "predicted_score": { "home": 28, "away": 21 },
    "spread_recommendation": "Cover",
    "total_recommendation": "Over"
  },
  "analysis_data": { ...factors... },
  "insights": ["...", "..."]
}
```

---

### 2. **fetchOdds** (7.5KB)
**Purpose:** Fetch live odds from TheOddsAPI
**Features:**
- Multi-sportsbook integration (DK, FD, BetMGM)
- Historical odds tracking
- Line movement recording
- Automatic game updates

**Input:**
```json
{
  "sport": "NFL",
  "gameId": "optional-uuid",
  "sportsbooks": ["draftkings", "fanduel", "betmgm"]
}
```

**Output:**
```json
{
  "success": true,
  "gamesUpdated": 12,
  "oddsRecordsCreated": 36
}
```

---

### 3. **updateWeeklySchedule** (5.6KB)
**Purpose:** Update game schedules from ESPN API
**Features:**
- ESPN API integration
- Create new games
- Update existing games
- Status tracking (scheduled/in_progress/final)

**Input:**
```json
{
  "sport": "NFL",
  "week": 10,
  "season": 2025
}
```

**Output:**
```json
{
  "success": true,
  "gamesCreated": 5,
  "gamesUpdated": 11,
  "totalGames": 16
}
```

---

### 4. **autoGradeAndLearn** (11.3KB)
**Purpose:** Auto-grade predictions and learn from results
**Features:**
- Automatic prediction grading
- Accuracy tracking
- Pattern discovery
- ML training data collection
- Performance metrics

**Input:** None (runs automatically)

**Output:**
```json
{
  "success": true,
  "gamesGraded": 25,
  "correctPredictions": 19,
  "accuracy": "76.0",
  "patternsLearned": 3
}
```

---

## 🛠️ STEP-BY-STEP DEPLOYMENT

### **STEP 1: Install Supabase CLI**

```bash
# Install globally
npm install -g supabase

# Verify installation
supabase --version
```

### **STEP 2: Create Supabase Project**

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in details:
   - Name: `prophetbets-ai`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Wait for project to provision (~2 minutes)

### **STEP 3: Initialize Supabase Locally**

```bash
# Navigate to your project
cd C:\Users\esqla\Desktop\Propetbetsai2

# Login to Supabase
supabase login

# Initialize Supabase in project
supabase init

# Link to your project
# Get project ref from: Dashboard > Settings > General
supabase link --project-ref your-project-ref-here
```

### **STEP 4: Deploy Database Schema**

```bash
# Option 1: Using Supabase CLI
supabase db push supabase-migration/SUPABASE_SCHEMA.sql

# Option 2: Using Dashboard
# Go to: Dashboard > SQL Editor
# Copy-paste entire SUPABASE_SCHEMA.sql
# Click "Run"
```

**Verify Tables Created:**
```bash
supabase db diff
```

You should see 19 tables:
- user_profiles
- games
- historical_games
- players
- player_game_stats
- team_season_stats
- injuries
- player_props
- team_props
- prediction_history
- prediction_accuracy
- learning_patterns
- training_data
- historical_odds
- slates
- alerts
- user_alerts
- schedules
- rosters

### **STEP 5: Set Environment Variables**

```bash
# Set secrets for Edge Functions
supabase secrets set ODDS_API_KEY=your-odds-api-key-here
supabase secrets set ESPN_API_KEY=your-espn-key-here
supabase secrets set RAPIDAPI_KEY=your-rapidapi-key-here

# Verify secrets
supabase secrets list
```

**Get API Keys:**
- **TheOddsAPI** (REQUIRED): https://the-odds-api.com/
  - Sign up for free tier (500 requests/month)
  - Get API key from dashboard
- **ESPN API**: Public (no key needed for basic usage)
- **RapidAPI** (Optional): https://rapidapi.com/

### **STEP 6: Deploy Edge Functions**

```bash
# Navigate to edge functions directory
cd supabase-migration/SUPABASE_EDGE_FUNCTIONS

# Deploy each function
supabase functions deploy runAnalyzer10000Plus
supabase functions deploy fetchOdds
supabase functions deploy updateWeeklySchedule
supabase functions deploy autoGradeAndLearn

# Verify deployments
supabase functions list
```

**Expected Output:**
```
┌──────────────────────────┬─────────┬──────────┬────────────────┐
│ NAME                     │ STATUS  │ VERSION  │ CREATED AT     │
├──────────────────────────┼─────────┼──────────┼────────────────┤
│ runAnalyzer10000Plus     │ ACTIVE  │ v1       │ 2 minutes ago  │
│ fetchOdds                │ ACTIVE  │ v1       │ 1 minute ago   │
│ updateWeeklySchedule     │ ACTIVE  │ v1       │ 1 minute ago   │
│ autoGradeAndLearn        │ ACTIVE  │ v1       │ 30 seconds ago │
└──────────────────────────┴─────────┴──────────┴────────────────┘
```

### **STEP 7: Test Edge Functions**

#### Test 1: Update Schedule
```bash
curl -X POST \
  https://your-project-ref.supabase.co/functions/v1/updateWeeklySchedule \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sport": "NFL", "season": 2025}'
```

**Expected Response:**
```json
{
  "success": true,
  "gamesCreated": 16,
  "gamesUpdated": 0,
  "totalGames": 16
}
```

#### Test 2: Fetch Odds
```bash
curl -X POST \
  https://your-project-ref.supabase.co/functions/v1/fetchOdds \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sport": "NFL"}'
```

#### Test 3: Run Analyzer (need gameId from DB)
```bash
curl -X POST \
  https://your-project-ref.supabase.co/functions/v1/runAnalyzer10000Plus \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"gameId": "game-uuid-here", "sport": "NFL"}'
```

#### Test 4: Auto Grade
```bash
curl -X POST \
  https://your-project-ref.supabase.co/functions/v1/autoGradeAndLearn \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### **STEP 8: Set Up Cron Jobs (Automation)**

Go to: **Dashboard > Database > Extensions**
Enable: `pg_cron`

Then go to: **Dashboard > SQL Editor**

```sql
-- Fetch odds every hour
SELECT cron.schedule(
  'fetch-odds-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/fetchOdds',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}',
    body := '{"sport": "NFL"}'
  );
  $$
);

-- Update schedules daily at 6 AM
SELECT cron.schedule(
  'update-schedules-daily',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/updateWeeklySchedule',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}',
    body := '{"sport": "NFL", "season": 2025}'
  );
  $$
);

-- Run analyzer every 2 hours
SELECT cron.schedule(
  'run-analyzer-2hours',
  '0 */2 * * *',
  $$
  -- This would need to loop through games, or trigger from app
  SELECT 1;
  $$
);

-- Auto-grade games daily at 2 AM
SELECT cron.schedule(
  'auto-grade-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/autoGradeAndLearn',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'
  );
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job;
```

### **STEP 9: Configure Frontend Environment**

Create `.env` file in project root:

```bash
cp supabase-migration/ENV_TEMPLATE.txt .env
```

Edit `.env` with your values:

```env
# Get these from: Dashboard > Settings > API
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# DO NOT expose this in frontend! Only use in Edge Functions
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Get from TheOddsAPI
ODDS_API_KEY=your-odds-api-key-here

# Optional
ESPN_API_KEY=your-espn-key-here
RAPIDAPI_KEY=your-rapidapi-key-here
```

### **STEP 10: Update Frontend Code**

I'll create a new Supabase client file:

```bash
# This will be done in the next step
```

---

## 📊 MONITORING & DEBUGGING

### View Edge Function Logs

```bash
# Real-time logs
supabase functions logs runAnalyzer10000Plus --tail

# Last 100 logs
supabase functions logs fetchOdds --limit 100
```

### Check Database Tables

```bash
# Open database CLI
supabase db remote --db-url YOUR_DATABASE_URL

# List tables
\dt

# Query games
SELECT * FROM games LIMIT 5;
```

### Dashboard Monitoring

Go to: **Dashboard > Functions**
- View invocations
- Check error rates
- Monitor performance
- View logs

---

## 🧪 TESTING CHECKLIST

- [ ] Database schema deployed (19 tables)
- [ ] All 4 Edge Functions deployed
- [ ] Environment variables set
- [ ] `updateWeeklySchedule` tested successfully
- [ ] `fetchOdds` tested successfully
- [ ] `runAnalyzer10000Plus` tested successfully
- [ ] `autoGradeAndLearn` tested successfully
- [ ] Cron jobs configured
- [ ] Frontend .env configured
- [ ] RLS policies enabled

---

## 🚨 TROUBLESHOOTING

### Issue: "ODDS_API_KEY not set"

**Solution:**
```bash
supabase secrets set ODDS_API_KEY=your-key-here
supabase functions deploy fetchOdds
```

### Issue: "Game not found"

**Solution:**
First run `updateWeeklySchedule` to populate games, then run analyzer.

### Issue: "TheOddsAPI error: 401"

**Solution:**
Check your API key at https://the-odds-api.com/account
Make sure you have remaining requests (free tier = 500/month)

### Issue: Edge Function timeout

**Solution:**
Edge Functions have 60-second timeout. Break large operations into smaller batches.

### Issue: CORS errors in frontend

**Solution:**
Check `corsHeaders` in Edge Functions include your frontend URL.

---

## 💰 COST BREAKDOWN

### Supabase (Free Tier)
- **Database:** 500MB (enough for 100K+ games)
- **Edge Functions:** 500K invocations/month
- **Storage:** 1GB
- **Bandwidth:** 5GB
- **Auth users:** 50K
- **Realtime:** Unlimited

### TheOddsAPI (Free Tier)
- **Requests:** 500/month
- **Sports:** All major sports
- **Sportsbooks:** 15+
- **Upgrade:** $10/month = 10K requests

### Total Monthly Cost
- **Free:** $0/month (perfect for development/testing)
- **Recommended:** $25/month (Supabase Pro + TheOddsAPI Basic)

---

## 🎯 NEXT STEPS

After deployment:

1. **Test all Edge Functions** ✅
2. **Update frontend to use Supabase** (next section)
3. **Populate initial data** (rosters, schedules)
4. **Run first analysis batch**
5. **Set up monitoring alerts**
6. **Deploy frontend to Vercel/Netlify**

---

## 📞 SUPPORT

**Supabase Docs:** https://supabase.com/docs
**TheOddsAPI Docs:** https://the-odds-api.com/liveapi/guides/v4
**Edge Functions:** https://supabase.com/docs/guides/functions

**Common Commands:**
```bash
# View project status
supabase status

# Reset local database
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > src/types/supabase.ts

# Deploy everything
supabase db push && supabase functions deploy --all
```

---

**🎉 Deployment Complete! Ready to predict winners!**
