# Supabase Deployment Guide for ProphetBetsAI

Complete step-by-step guide to deploy the ProphetBetsAI backend to Supabase.

---

## Prerequisites

1. **Supabase Account**
   - Go to https://supabase.com
   - Sign up or log in

2. **Project Setup**
   - Create a new Supabase project
   - Note down:
     - Project URL: `https://xxxxx.supabase.co`
     - Anon Key: `eyJhbGc...`
     - Service Role Key: `eyJhbGc...` (KEEP SECRET!)

3. **Local Environment**
   - Node.js installed (v18+)
   - Supabase CLI (optional): `npm install -g supabase`

---

## Step 1: Deploy Database Schema

### Option A: Via Supabase Dashboard (Recommended)

1. Open your Supabase project
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase/schema.sql`
5. Paste into the SQL editor
6. Click **Run** (bottom right)

**Expected Output:**
```
Success. No rows returned
```

**Verify Tables Created:**
- Go to **Table Editor** in Supabase dashboard
- You should see 20+ tables: teams, players, games, player_props, injuries, etc.

### Option B: Via Supabase CLI

```bash
cd Propetbetsai2
supabase link --project-ref your-project-ref
supabase db push
```

---

## Step 2: Verify Database

Run these queries in SQL Editor to check:

```sql
-- Count tables
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';
-- Should return 20+

-- Check teams table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'teams';

-- Verify indexes
SELECT indexname FROM pg_indexes
WHERE tablename = 'games';
-- Should show idx_games_sport, idx_games_date, etc.

-- Check RLS policies
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

---

## Step 3: Set Up Environment Variables

Create `.env.local` in your project root:

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...

# Service Role (for Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-key...

# External APIs (for Edge Functions)
ODDS_API_KEY=your-odds-api-key
ESPN_API_KEY=your-espn-key (if needed)
OPENAI_API_KEY=your-openai-key (for AI analysis)
```

**Get API Keys:**
- **TheOddsAPI**: https://the-odds-api.com (free tier: 500 requests/month)
- **OpenAI**: https://platform.openai.com (for GPT-4 analysis)

---

## Step 4: Seed Initial Data

### A. Seed NFL Teams

```sql
-- Run in SQL Editor
INSERT INTO teams (name, abbreviation, sport, league, division, logo_url, colors) VALUES
('Arizona Cardinals', 'ARI', 'NFL', 'NFC', 'West', 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png', '{"primary": "#97233F", "secondary": "#000000"}'),
('Atlanta Falcons', 'ATL', 'NFL', 'NFC', 'South', 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png', '{"primary": "#A71930", "secondary": "#000000"}'),
('Baltimore Ravens', 'BAL', 'NFL', 'AFC', 'North', 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png', '{"primary": "#241773", "secondary": "#000000"}'),
('Buffalo Bills', 'BUF', 'NFL', 'AFC', 'East', 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png', '{"primary": "#00338D", "secondary": "#C60C30"}'),
('Carolina Panthers', 'CAR', 'NFL', 'NFC', 'South', 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png', '{"primary": "#0085CA", "secondary": "#101820"}'),
('Chicago Bears', 'CHI', 'NFL', 'NFC', 'North', 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png', '{"primary": "#0B162A", "secondary": "#C83803"}'),
('Cincinnati Bengals', 'CIN', 'NFL', 'AFC', 'North', 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png', '{"primary": "#FB4F14", "secondary": "#000000"}'),
('Cleveland Browns', 'CLE', 'NFL', 'AFC', 'North', 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png', '{"primary": "#311D00", "secondary": "#FF3C00"}'),
('Dallas Cowboys', 'DAL', 'NFL', 'NFC', 'East', 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png', '{"primary": "#003594", "secondary": "#041E42"}'),
('Denver Broncos', 'DEN', 'NFL', 'AFC', 'West', 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png', '{"primary": "#FB4F14", "secondary": "#002244"}'),
('Detroit Lions', 'DET', 'NFL', 'NFC', 'North', 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png', '{"primary": "#0076B6", "secondary": "#B0B7BC"}'),
('Green Bay Packers', 'GB', 'NFL', 'NFC', 'North', 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png', '{"primary": "#203731", "secondary": "#FFB612"}'),
('Houston Texans', 'HOU', 'NFL', 'AFC', 'South', 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png', '{"primary": "#03202F", "secondary": "#A71930"}'),
('Indianapolis Colts', 'IND', 'NFL', 'AFC', 'South', 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png', '{"primary": "#002C5F", "secondary": "#A2AAAD"}'),
('Jacksonville Jaguars', 'JAX', 'NFL', 'AFC', 'South', 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png', '{"primary": "#006778", "secondary": "#D7A22A"}'),
('Kansas City Chiefs', 'KC', 'NFL', 'AFC', 'West', 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png', '{"primary": "#E31837", "secondary": "#FFB612"}'),
('Las Vegas Raiders', 'LV', 'NFL', 'AFC', 'West', 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png', '{"primary": "#000000", "secondary": "#A5ACAF"}'),
('Los Angeles Chargers', 'LAC', 'NFL', 'AFC', 'West', 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png', '{"primary": "#0080C6", "secondary": "#FFC20E"}'),
('Los Angeles Rams', 'LAR', 'NFL', 'NFC', 'West', 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png', '{"primary": "#003594", "secondary": "#FFA300"}'),
('Miami Dolphins', 'MIA', 'NFL', 'AFC', 'East', 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png', '{"primary": "#008E97", "secondary": "#FC4C02"}'),
('Minnesota Vikings', 'MIN', 'NFL', 'NFC', 'North', 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png', '{"primary": "#4F2683", "secondary": "#FFC62F"}'),
('New England Patriots', 'NE', 'NFL', 'AFC', 'East', 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png', '{"primary": "#002244", "secondary": "#C60C30"}'),
('New Orleans Saints', 'NO', 'NFL', 'NFC', 'South', 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png', '{"primary": "#D3BC8D", "secondary": "#101820"}'),
('New York Giants', 'NYG', 'NFL', 'NFC', 'East', 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png', '{"primary": "#0B2265", "secondary": "#A71930"}'),
('New York Jets', 'NYJ', 'NFL', 'AFC', 'East', 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png', '{"primary": "#125740", "secondary": "#000000"}'),
('Philadelphia Eagles', 'PHI', 'NFL', 'NFC', 'East', 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png', '{"primary": "#004C54", "secondary": "#A5ACAF"}'),
('Pittsburgh Steelers', 'PIT', 'NFL', 'AFC', 'North', 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png', '{"primary": "#FFB612", "secondary": "#101820"}'),
('San Francisco 49ers', 'SF', 'NFL', 'NFC', 'West', 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png', '{"primary": "#AA0000", "secondary": "#B3995D"}'),
('Seattle Seahawks', 'SEA', 'NFL', 'NFC', 'West', 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png', '{"primary": "#002244", "secondary": "#69BE28"}'),
('Tampa Bay Buccaneers', 'TB', 'NFL', 'NFC', 'South', 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png', '{"primary": "#D50A0A", "secondary": "#FF7900"}'),
('Tennessee Titans', 'TEN', 'NFL', 'AFC', 'South', 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png', '{"primary": "#0C2340", "secondary": "#4B92DB"}'),
('Washington Commanders', 'WSH', 'NFL', 'NFC', 'East', 'https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png', '{"primary": "#5A1414", "secondary": "#FFB612"}');

-- Verify
SELECT COUNT(*) FROM teams WHERE sport = 'NFL';
-- Should return 32
```

### B. Create Seed Script for Other Sports

You'll need similar INSERT statements for NBA (30 teams), MLB (30 teams), etc. I can provide those separately.

---

## Step 5: Test Database Queries

Run these in SQL Editor to verify everything works:

```sql
-- Test: Get all NFL teams
SELECT name, abbreviation FROM teams WHERE sport = 'NFL' ORDER BY name;

-- Test: Create a sample game
INSERT INTO games (sport, home_team, away_team, game_date, season, week, status)
VALUES ('NFL', 'Kansas City Chiefs', 'Las Vegas Raiders', NOW() + INTERVAL '7 days', 2025, 11, 'scheduled')
RETURNING id, home_team, away_team, game_date;

-- Test: Get upcoming games
SELECT home_team, away_team, game_date, status
FROM games
WHERE sport = 'NFL' AND game_date > NOW()
ORDER BY game_date;

-- Test: Add a player
INSERT INTO players (name, team, sport, position, jersey_number, status)
VALUES ('Patrick Mahomes', 'Kansas City Chiefs', 'NFL', 'QB', 15, 'active')
RETURNING id, name, team;

-- Test: Query with relationships
SELECT p.name, p.position, t.abbreviation, t.colors
FROM players p
LEFT JOIN teams t ON p.team_id = t.id
WHERE p.sport = 'NFL'
LIMIT 5;
```

---

## Step 6: Deploy Edge Functions

Edge Functions will be in the next phase. For now, verify these endpoints:

### A. Set Up Edge Functions Directory

```bash
mkdir -p supabase/functions
cd supabase/functions
```

### B. Create First Edge Function (Example)

```typescript
// supabase/functions/fetchOdds/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { sport, gameId } = await req.json()

    // Fetch odds from TheOddsAPI
    const oddsApiKey = Deno.env.get('ODDS_API_KEY')
    const response = await fetch(`https://api.the-odds-api.com/v4/sports/${sport}/odds`, {
      headers: { 'Authorization': oddsApiKey }
    })

    const data = await response.json()

    // Store in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    // Update games table with odds
    for (const game of data) {
      await supabase.from('games').upsert({
        external_id: game.id,
        sport: sport,
        home_team: game.home_team,
        away_team: game.away_team,
        markets: game.bookmakers
      })
    }

    return new Response(JSON.stringify({ success: true, gamesUpdated: data.length }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

### C. Deploy Edge Function

```bash
supabase functions deploy fetchOdds --no-verify-jwt
```

**Note:** We'll create all Edge Functions in the next phase.

---

## Step 7: Connect Frontend to Supabase

Your frontend is already configured! Just verify `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Test the connection:

```bash
npm run dev
```

Visit http://localhost:5173 and check:
- Teams should load (if you seeded them)
- No console errors about Supabase connection

---

## Step 8: Enable Realtime (Optional)

For live game updates:

1. Go to Supabase Dashboard → **Database** → **Replication**
2. Enable replication for tables: `games`, `player_props`, `injuries`
3. In your frontend, subscribe to changes:

```javascript
// Example: Subscribe to game updates
const subscription = supabase
  .channel('games')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'games' },
    (payload) => {
      console.log('Game updated!', payload.new)
      // Update UI
    }
  )
  .subscribe()
```

---

## Step 9: Set Up Storage (Optional)

For storing images, reports, etc.:

1. Go to **Storage** in Supabase dashboard
2. Create bucket: `player-photos`
3. Set permissions: Public read, authenticated write
4. Upload player headshots

---

## Step 10: Configure Cron Jobs

For automated tasks (in Supabase dashboard):

1. Go to **Database** → **Functions**
2. Create these functions:

```sql
-- Auto-refresh odds every hour
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule('refresh-odds', '0 * * * *',
  'SELECT net.http_post(
    url:=''YOUR_EDGE_FUNCTION_URL/fetchOdds'',
    headers:=''{"Content-Type": "application/json"}'',
    body:=''{"sport": "NFL"}''
  )'
);

-- Auto-grade games daily at 3am
SELECT cron.schedule('grade-games', '0 3 * * *',
  'UPDATE games SET status = ''completed''
   WHERE game_date < NOW() - INTERVAL ''4 hours''
   AND status = ''live'''
);
```

---

## Troubleshooting

### Issue: "relation does not exist"
**Solution:** Re-run `schema.sql` in SQL Editor

### Issue: "permission denied for table"
**Solution:** Check RLS policies, make sure anon key can read public tables

### Issue: "function not found"
**Solution:** Verify triggers were created: `SELECT * FROM pg_trigger`

### Issue: Cannot connect from frontend
**Solution:**
- Verify `.env.local` has correct URL and anon key
- Check browser console for CORS errors
- Ensure Supabase project is not paused

---

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Public read policies set for teams, games, props
- [ ] Service role key stored securely (not in frontend)
- [ ] API keys in environment variables only
- [ ] HTTPS enforced (Supabase does this automatically)

---

## Next Steps

1. ✅ **Schema deployed and verified**
2. ⏭️ **Seed data for all sports** (I can provide scripts)
3. ⏭️ **Create Edge Functions** (fetchOdds, fetchInjuries, runAnalyzer, etc.)
4. ⏭️ **Set up cron jobs** for automated data refresh
5. ⏭️ **Deploy frontend** to Vercel/Netlify

---

## Monitoring & Maintenance

**Supabase Dashboard:**
- Monitor query performance in **Logs**
- Check database size in **Settings** → **Usage**
- View API requests in **Logs** → **API**

**Recommended:**
- Set up alerts for slow queries (>1s)
- Monitor storage usage (free tier: 500MB)
- Archive old data quarterly

---

You're ready to go! 🎉

**Need help with:**
- Edge Functions creation? → Ask me next
- Seeding NBA/MLB data? → I'll provide scripts
- Frontend integration? → Already done ✅

