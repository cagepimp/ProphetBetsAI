# ProphetBetsAI Backend - Quick Start Guide

## 🎯 What We're Building

A fully automated sports betting prediction platform that:
- ✅ Fetches schedules for 7 sports automatically
- ✅ Updates betting odds every 15 minutes
- ✅ Syncs player rosters weekly
- ✅ Generates AI predictions with confidence scores
- ✅ Tracks accuracy and learns from results
- ✅ Provides admin tools for manual control

---

## 📋 Prerequisites Checklist

Before building, you need:

### 1. API Keys (Get These First!)

| Service | Sign Up | Cost | Required |
|---------|---------|------|----------|
| [The Odds API](https://the-odds-api.com) | Sign up for key | $0-200/mo | ✅ YES |
| [OpenAI](https://platform.openai.com) | Create API key | ~$20-100/mo | ✅ YES |
| [Supabase](https://supabase.com) | Project created | $0-25/mo | ✅ YES |
| [SportsData.io](https://sportsdata.io) | Optional backup | $0-50/mo | ⚠️ Optional |

### 2. Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref
```

### 3. Environment Variables

Create `.env` in your project root:

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# The Odds API
ODDS_API_KEY=your-odds-api-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Optional
SPORTSDATA_API_KEY=your-sportsdata-key
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│  Sport Pages | Props | Admin Tools | Predictions           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📥 DATA INGESTION                                          │
│    • populate-games    → ESPN API → games table            │
│    • fetch-odds        → Odds API → games.markets          │
│    • sync-rosters      → ESPN API → players table          │
│    • fetch-injuries    → ESPN API → injuries table         │
│                                                             │
│  🤖 AI ANALYSIS                                             │
│    • run-analyzer      → GPT-4 → predictions               │
│    • generate-props    → GPT-4 → player_props              │
│                                                             │
│  ✅ VERIFICATION                                            │
│    • update-results    → Grade predictions                  │
│    • calculate-accuracy → Update metrics                    │
│                                                             │
│  🔧 ADMIN                                                   │
│    • admin-* functions → Manual overrides                   │
│                                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE POSTGRES DATABASE                     │
├─────────────────────────────────────────────────────────────┤
│  Core: teams, players, games, injuries                     │
│  Betting: player_props, team_props, odds, lines            │
│  Analytics: predictions, accuracy_metrics, patterns        │
│  Historical: game_stats, training_data                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 5-Week Implementation Plan

### Week 1: Foundation ✅
**Goal:** Set up infrastructure

- [x] Deploy database schema (DONE!)
- [ ] Create Edge Functions folder structure
- [ ] Set up shared utilities
- [ ] Configure environment variables
- [ ] Test database connection

**Deliverable:** Can connect to Supabase and run basic queries

---

### Week 2: Data Pipeline 📥
**Goal:** Automated data ingestion

**Build Order:**
1. **populate-games** (Monday-Tuesday)
   - Fetch NFL/NBA/MLB schedules from ESPN
   - Store in `games` table
   - Test with current season

2. **fetch-odds** (Wednesday-Thursday)
   - Get odds from The Odds API
   - Update `games.markets` JSONB
   - Track in `historical_odds`

3. **sync-rosters** (Friday)
   - Fetch player rosters
   - Store in `players` table
   - Link to teams

4. **fetch-injuries** (Friday)
   - Get injury reports
   - Store in `injuries` table

**Test:** Can I see games with odds in the frontend?

**Deliverable:** Games auto-populate, odds update every 15 mins

---

### Week 3: AI Analysis 🤖
**Goal:** Generate predictions

**Build Order:**
1. **generate-props** (Monday-Wednesday)
   - Load player stats
   - Calculate averages
   - Run GPT-4 analysis
   - Generate recommendations

2. **run-analyzer** (Thursday-Friday)
   - Comprehensive game analysis
   - Winner/spread/total predictions
   - Confidence scores
   - Store results

**Test:** Can I click "Analyze Game" and get predictions?

**Deliverable:** AI generates predictions with 60%+ accuracy goal

---

### Week 4: Learning Loop ✅
**Goal:** Self-improvement

**Build Order:**
1. **update-results** (Monday-Tuesday)
   - Fetch final scores
   - Grade all predictions
   - Calculate accuracy

2. **Accuracy tracking** (Wednesday)
   - Update `accuracy_metrics`
   - Track by sport/bet type
   - Show in Admin Dashboard

3. **Pattern discovery** (Thursday-Friday)
   - Find winning patterns
   - Store in `learning_patterns`
   - Apply to future predictions

**Test:** Do predictions improve over time?

**Deliverable:** System learns from results, accuracy tracked

---

### Week 5: Polish & Deploy 🎨
**Goal:** Production ready

**Build Order:**
1. **Admin tools** (Monday-Tuesday)
   - Manual game creation
   - Force refresh buttons
   - Export functionality

2. **Cron jobs** (Wednesday)
   - Set up automatic schedules
   - Configure timings
   - Test triggers

3. **Monitoring** (Thursday)
   - Add logging
   - Set up alerts
   - Track performance

4. **Documentation** (Friday)
   - API docs
   - Deployment guide
   - User manual

**Deliverable:** Fully autonomous system running in production

---

## 📁 File Structure

```
Propetbetsai2/
├── supabase/
│   ├── schema.sql                    ✅ Database schema (DONE)
│   ├── seed.sql                      📝 Seed data (NFL teams done)
│   │
│   ├── functions/                    👈 YOU ARE HERE
│   │   ├── _shared/                  Shared utilities
│   │   │   ├── supabase-client.ts
│   │   │   ├── espn-api.ts
│   │   │   ├── odds-api.ts
│   │   │   ├── openai-client.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── populate-games/           Week 2
│   │   │   └── index.ts
│   │   ├── fetch-odds/               Week 2
│   │   │   └── index.ts
│   │   ├── sync-rosters/             Week 2
│   │   │   └── index.ts
│   │   ├── fetch-injuries/           Week 2
│   │   │   └── index.ts
│   │   │
│   │   ├── generate-props/           Week 3
│   │   │   └── index.ts
│   │   ├── run-analyzer/             Week 3
│   │   │   └── index.ts
│   │   │
│   │   ├── update-results/           Week 4
│   │   │   └── index.ts
│   │   ├── calculate-accuracy/       Week 4
│   │   │   └── index.ts
│   │   │
│   │   └── admin-*/                  Week 5
│   │       └── index.ts
│   │
│   └── migrations/                   Future schema updates
│
└── src/                              Frontend (already done!)
    ├── api/supabaseClient.js         ✅ Database queries
    ├── pages/                        ✅ All sport pages
    └── components/                   ✅ UI components
```

---

## 🛠️ Development Workflow

### Creating a New Edge Function

```bash
# 1. Create function folder
mkdir supabase/functions/my-function

# 2. Create index.ts
cat > supabase/functions/my-function/index.ts << 'EOF'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { param } = await req.json()

    // Your logic here

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
})
EOF

# 3. Deploy function
supabase functions deploy my-function --no-verify-jwt

# 4. Test function
curl -X POST https://your-project.supabase.co/functions/v1/my-function \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"param": "value"}'
```

### Testing Locally

```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve my-function --env-file .env

# Test in another terminal
curl http://localhost:54321/functions/v1/my-function \
  -d '{"test": "data"}'
```

---

## 📊 Key Metrics to Track

| Metric | Target | Current |
|--------|--------|---------|
| Prediction Accuracy | 60%+ | TBD |
| Odds Update Frequency | Every 15 min | TBD |
| Game Coverage | 95%+ | TBD |
| API Response Time | <2s | TBD |
| Analysis Generation | <10s | TBD |
| Database Queries | <100ms | TBD |

---

## 🎓 Learning Resources

### Supabase Edge Functions
- [Official Docs](https://supabase.com/docs/guides/functions)
- [Deno Deploy](https://deno.com/deploy/docs)

### The Odds API
- [API Documentation](https://the-odds-api.com/liveapi/guides/v4/)
- [Sport Keys](https://the-odds-api.com/sports-odds-data/sports-apis.html)

### ESPN API (Unofficial)
- [API Explorer](https://site.api.espn.com/apis/site/v2/sports)
- [Community Guide](https://gist.github.com/nntrn/ee26cb2a0716de0947a0a4e9a157bc1c)

---

## ❓ FAQ

**Q: Do I need all API keys to start?**
A: No! Start with just Supabase. Add The Odds API for betting lines, OpenAI for analysis.

**Q: Can I use free tiers?**
A: Yes for development! Supabase free, The Odds API has 500 free requests/month, OpenAI has $5 free credit.

**Q: How long until it's profitable?**
A: If predictions hit 55%+ accuracy consistently, you can be profitable with proper bankroll management. Track this in the Admin Dashboard.

**Q: Can I add more sports?**
A: Yes! The architecture supports any sport ESPN covers. Just add the sport key to `populate-games`.

**Q: What if an API goes down?**
A: We have caching and fallback logic. Old data is better than no data.

---

## 🚦 Next Steps

**Choose your path:**

### 👨‍💻 I want to build this myself
→ Read `BACKEND_IMPLEMENTATION_PLAN.md` for detailed specs
→ Start with Week 1 tasks
→ Build functions one by one

### 🤖 I want Claude to build it
→ Say "Start building the backend"
→ I'll create all functions step-by-step
→ You review and test each one

### 📚 I want to learn first
→ Study the existing schema
→ Experiment with database queries
→ Read API documentation

**What would you like to do?**

1. **Start building immediately** → I'll create the first Edge Function
2. **Deep dive on one function** → Pick a function to understand in detail
3. **Test database first** → Make sure schema is working correctly

Let me know and we'll get started! 🚀
