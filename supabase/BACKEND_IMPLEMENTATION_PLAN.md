# ProphetBetsAI Complete Backend Implementation Plan

## Executive Summary

Building a complete sports betting prediction platform with:
- **Multi-sport support:** NFL, NBA, MLB, CFB, NHL, UFC, Golf
- **Real-time odds** from multiple sportsbooks
- **AI-powered predictions** with confidence scores
- **Historical tracking** for accuracy measurement
- **Automated data pipelines** for schedules, rosters, and results

---

## Phase 1: Database Schema Review & Adjustments

### ✅ Already Created (from schema.sql)

We have a comprehensive schema with:

**Core Tables:**
- `teams` - All sports teams with logos, colors, metadata
- `players` - Player rosters with positions, stats, injuries
- `games` - Scheduled/completed games with scores and odds
- `player_props` - Individual player betting props
- `team_props` - Team-based props
- `injuries` - Real-time injury reports

**Analytics Tables:**
- `prediction_history` - Track all AI predictions
- `accuracy_metrics` - Aggregated performance stats
- `learning_patterns` - Discovered betting patterns
- `training_data` - ML training datasets

**Historical Tables:**
- `player_game_stats` - Historical player performance
- `team_game_stats` - Historical team performance
- `historical_odds` - Odds movement tracking
- `line_history` - Line movement history

**Support Tables:**
- `analysis_cache` - Cache expensive computations
- `user_profiles` - User accounts and preferences
- `user_predictions` - User's own predictions

### 🔧 Minor Adjustments Needed

1. **Add indexes for performance:**
   ```sql
   CREATE INDEX idx_games_commence_time ON games(commence_time) WHERE status = 'scheduled';
   CREATE INDEX idx_props_valid_until ON player_props(valid_until) WHERE status = 'active';
   ```

2. **Add helper functions:**
   ```sql
   -- Calculate ROI from predictions
   CREATE OR REPLACE FUNCTION calculate_roi(sport TEXT, date_start TIMESTAMPTZ, date_end TIMESTAMPTZ)
   RETURNS DECIMAL AS $$
   -- Implementation
   $$ LANGUAGE plpgsql;
   ```

---

## Phase 2: External API Integrations

### APIs We'll Use

| API | Purpose | Cost | Rate Limits |
|-----|---------|------|-------------|
| **ESPN API** | Game schedules, scores, rosters | Free | ~500 req/hour |
| **The Odds API** | Live betting odds | $50-200/mo | 500-10k req/mo |
| **SportsData.io** | Player stats, injuries | $10-100/mo | 1k-100k req/day |
| **OpenAI GPT-4** | AI analysis engine | ~$5-50/mo | Based on tokens |
| **Anthropic Claude** | Alternative AI engine | ~$5-50/mo | Based on tokens |

### API Keys Required

```env
# The Odds API
ODDS_API_KEY=your_key_here
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4

# SportsData.io (optional backup)
SPORTSDATA_API_KEY=your_key_here

# OpenAI for analysis
OPENAI_API_KEY=your_key_here

# Supabase (already configured)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

---

## Phase 3: Edge Functions Architecture

### Function Overview

```
┌─────────────────────────────────────────────────────┐
│                 EDGE FUNCTIONS                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  DATA INGESTION LAYER                              │
│  ├── populate-games      (ESPN schedules)          │
│  ├── fetch-odds          (The Odds API)            │
│  ├── sync-rosters        (Player rosters)          │
│  └── fetch-injuries      (Injury reports)          │
│                                                     │
│  ANALYSIS LAYER                                     │
│  ├── run-analyzer        (AI predictions)          │
│  ├── generate-props      (Prop recommendations)    │
│  └── analyze-trends      (Pattern discovery)       │
│                                                     │
│  VERIFICATION LAYER                                 │
│  ├── update-results      (Grade predictions)       │
│  ├── calculate-accuracy  (Performance metrics)     │
│  └── train-model         (ML learning)             │
│                                                     │
│  ADMIN LAYER                                        │
│  ├── admin-populate      (Manual data entry)       │
│  ├── admin-reset         (Clear database)          │
│  └── admin-export        (Export data)             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Phase 4: Detailed Edge Function Specifications

### 1. `populate-games` - Fetch Game Schedules

**Purpose:** Fetch upcoming game schedules from ESPN API and store in database

**Trigger:**
- Cron: Daily at 3 AM EST
- Manual: Admin button click
- HTTP: POST request

**Input:**
```typescript
{
  sport: 'NFL' | 'NBA' | 'MLB' | 'CFB' | 'NHL' | 'UFC' | 'GOLF',
  season?: number,        // Default: current season
  week?: number,          // NFL/CFB only
  startDate?: string,     // ISO date
  endDate?: string,       // ISO date
  forceRefresh?: boolean  // Override cache
}
```

**Output:**
```typescript
{
  success: boolean,
  gamesCreated: number,
  gamesUpdated: number,
  sport: string,
  dateRange: { start: string, end: string },
  errors?: string[]
}
```

**Logic Flow:**
1. Validate input parameters
2. Fetch from ESPN API (`https://site.api.espn.com/apis/site/v2/sports/{sport}/scoreboard`)
3. Parse game data (teams, date, venue, broadcast)
4. Check if game already exists (by external_id)
5. Insert new games or update existing
6. Log operation to audit table
7. Return summary

**Error Handling:**
- ESPN API timeout → Retry 3x with exponential backoff
- Invalid sport → Return 400 error
- Database write failure → Rollback and return error

**Example ESPN API Response:**
```json
{
  "events": [
    {
      "id": "401547409",
      "name": "Kansas City Chiefs at Las Vegas Raiders",
      "date": "2025-11-10T21:15Z",
      "competitions": [{
        "competitors": [
          {"team": {"displayName": "Kansas City Chiefs", "abbreviation": "KC"}},
          {"team": {"displayName": "Las Vegas Raiders", "abbreviation": "LV"}}
        ],
        "venue": {"fullName": "Allegiant Stadium"}
      }]
    }
  ]
}
```

---

### 2. `fetch-odds` - Get Live Betting Lines

**Purpose:** Fetch current betting odds from The Odds API

**Trigger:**
- Cron: Every 15 minutes during game days
- Manual: Admin "Refresh Odds" button
- HTTP: POST request

**Input:**
```typescript
{
  sport: 'NFL' | 'NBA' | 'MLB' | 'CFB' | 'NHL' | 'UFC',
  markets?: ('h2h' | 'spreads' | 'totals' | 'props')[],
  bookmakers?: ('draftkings' | 'fanduel' | 'betmgm' | 'caesars')[],
  gameIds?: string[]  // Specific games only
}
```

**Output:**
```typescript
{
  success: boolean,
  oddsUpdated: number,
  gamesProcessed: number,
  booksProcessed: string[],
  timestamp: string,
  errors?: string[]
}
```

**Logic Flow:**
1. Validate API key and rate limits
2. Build API request URL with filters
3. Fetch odds from The Odds API
4. Parse bookmaker odds into standard format
5. Match games by team names (fuzzy matching)
6. Update `games.markets` JSONB field
7. Store snapshot in `historical_odds` table
8. Track line movements in `line_history`
9. Invalidate `analysis_cache` for affected games
10. Return summary

**The Odds API Integration:**
```typescript
// API URL
const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/`;

// Query params
const params = {
  apiKey: ODDS_API_KEY,
  regions: 'us',
  markets: 'h2h,spreads,totals',
  bookmakers: 'draftkings,fanduel,betmgm',
  oddsFormat: 'american'
};

// Response structure
{
  "id": "game-id",
  "sport_key": "americanfootball_nfl",
  "commence_time": "2025-11-10T21:15:00Z",
  "home_team": "Las Vegas Raiders",
  "away_team": "Kansas City Chiefs",
  "bookmakers": [
    {
      "key": "draftkings",
      "title": "DraftKings",
      "markets": [
        {
          "key": "h2h",
          "outcomes": [
            {"name": "Kansas City Chiefs", "price": -150},
            {"name": "Las Vegas Raiders", "price": 130}
          ]
        }
      ]
    }
  ]
}
```

**Rate Limit Handling:**
- Track API calls per minute
- Queue requests if approaching limit
- Prioritize upcoming games (within 24 hours)

---

### 3. `sync-rosters` - Update Player Rosters

**Purpose:** Sync player rosters with latest data from ESPN/SportsData.io

**Trigger:**
- Cron: Weekly on Sundays at 2 AM
- Manual: Admin "Sync Rosters" button
- HTTP: POST request

**Input:**
```typescript
{
  sport: 'NFL' | 'NBA' | 'MLB' | 'CFB' | 'NHL',
  team?: string,          // Specific team only
  fullSync?: boolean      // Sync all teams
}
```

**Output:**
```typescript
{
  success: boolean,
  playersAdded: number,
  playersUpdated: number,
  playersDeactivated: number,
  teamsProcessed: string[],
  errors?: string[]
}
```

**Logic Flow:**
1. Fetch team list from database
2. For each team, fetch roster from ESPN API
3. Parse player data (name, position, jersey, photo)
4. Match existing players by name + team
5. Insert new players or update existing
6. Mark missing players as inactive
7. Update team logos and colors
8. Return summary

**ESPN Roster API:**
```
https://site.api.espn.com/apis/site/v2/sports/{sport}/teams/{teamId}/roster
```

**Player Matching Logic:**
```typescript
// Fuzzy match players by name similarity
function matchPlayer(newPlayer, existingPlayers) {
  // Levenshtein distance for name matching
  // Consider team + position for disambiguation
}
```

---

### 4. `generate-props` - Create Betting Props

**Purpose:** Generate player/team props with AI analysis and recommendations

**Trigger:**
- Cron: Daily at 9 AM for upcoming games
- Manual: "Analyze Props" button per game
- HTTP: POST request

**Input:**
```typescript
{
  gameId: string,
  sport: string,
  propTypes?: ('player' | 'team' | 'game')[],
  minConfidence?: number  // Filter by confidence threshold
}
```

**Output:**
```typescript
{
  success: boolean,
  propsGenerated: number,
  playerProps: Array<{
    player_name: string,
    prop_type: string,
    line: number,
    recommendation: 'over' | 'under' | 'pass',
    confidence: number,
    edge: number,
    analysis: string
  }>,
  teamProps: Array<{...}>,
  errors?: string[]
}
```

**Logic Flow:**
1. Fetch game details from database
2. Get player season averages
3. Get player last 5 games stats
4. Get player vs opponent history
5. Factor in injuries/rest days
6. Fetch current prop lines from odds data
7. Run AI analysis for each prop
8. Calculate value/edge
9. Store in `player_props` table
10. Return recommendations

**AI Analysis Prompt:**
```typescript
const prompt = `
Analyze this player prop bet:

Player: Patrick Mahomes (QB, Kansas City Chiefs)
Opponent: Las Vegas Raiders
Prop: Passing Yards Over/Under 275.5 yards (-110)

Context:
- Season Average: 285 yards/game
- Last 5 Games: 290, 245, 310, 265, 280 (avg: 278)
- vs Raiders Career: 3 games, avg 295 yards
- Weather: Clear, 65°F, wind 5mph
- Home/Away: Away
- Team Status: Full strength, no key injuries

Provide:
1. Recommendation: OVER or UNDER
2. Confidence: 1-100%
3. Edge: Expected value %
4. Reasoning: 2-3 sentences

Format as JSON.
`;
```

---

### 5. `run-analyzer` - AI Game Predictions

**Purpose:** Run comprehensive AI analysis on games and generate predictions

**Trigger:**
- Manual: "Analyze Game" button
- Cron: Daily at 6 PM for next day's games
- HTTP: POST request

**Input:**
```typescript
{
  gameId: string,
  sport: string,
  analysisDepth?: 'quick' | 'standard' | 'deep',
  includeProps?: boolean
}
```

**Output:**
```typescript
{
  success: boolean,
  gameId: string,
  analysis: {
    the_edge: string,              // Main betting angle
    winner_prediction: string,
    spread_prediction: string,
    total_prediction: string,
    confidence: number,
    recommended_bets: Array<{
      bet: string,
      units: number,
      confidence: number,
      reasoning: string
    }>,
    key_factors: string[],
    weather_impact?: string,
    injury_impact?: string,
    trends: string[]
  },
  props?: {...},
  timestamp: string
}
```

**Logic Flow:**
1. Load game data (teams, date, venue, odds)
2. Load team stats (season, recent form, head-to-head)
3. Load player stats (key players, injuries)
4. Load contextual data (weather, rest days, travel)
5. Build comprehensive analysis prompt
6. Call OpenAI GPT-4 API
7. Parse JSON response
8. Store in `games.analysis` field
9. Create `prediction_history` entry
10. Return analysis

**AI Analysis Structure:**
```typescript
const analysisPrompt = `
You are an expert sports analyst. Analyze this game:

GAME: Kansas City Chiefs @ Las Vegas Raiders
SPORT: NFL
DATE: 2025-11-10 9:15 PM EST
VENUE: Allegiant Stadium, Las Vegas, NV

ODDS:
- Moneyline: Chiefs -150, Raiders +130
- Spread: Chiefs -3.5 (-110)
- Total: Over/Under 47.5

TEAM STATS:
Chiefs (8-2):
- Points/Game: 28.5 (3rd in NFL)
- Points Allowed: 19.2 (5th)
- Last 5: W-W-L-W-W
- ATS: 6-4
- O/U: 5-5

Raiders (4-6):
- Points/Game: 21.3 (18th)
- Points Allowed: 25.8 (24th)
- Last 5: L-W-L-L-W
- ATS: 4-6
- O/U: 6-4

HEAD-TO-HEAD:
Last 5 meetings: Chiefs 4-1
Average score: Chiefs 31, Raiders 22

KEY INJURIES:
Chiefs: None
Raiders: RB Josh Jacobs (Questionable - ankle)

WEATHER: Clear, 65°F, wind 8 mph

ANALYSIS REQUIRED:
1. Pick winner with confidence (1-100%)
2. Spread pick with confidence
3. Total pick with confidence
4. Top 3 recommended bets
5. "The Edge" - main betting angle (2-3 sentences)
6. Key factors (3-5 bullet points)
7. Weather/injury impact

Return JSON format.
`;
```

---

### 6. `update-results` - Verify Predictions

**Purpose:** Update game results and grade all predictions

**Trigger:**
- Cron: Every hour to check for completed games
- Manual: "Grade Predictions" button
- HTTP: POST request

**Input:**
```typescript
{
  sport?: string,         // Specific sport
  gameIds?: string[],     // Specific games
  autoLearn?: boolean     // Trigger ML learning
}
```

**Output:**
```typescript
{
  success: boolean,
  gamesGraded: number,
  predictionsGraded: number,
  accuracyUpdate: {
    overall: number,
    by_sport: {...},
    by_bet_type: {...}
  },
  patternsDiscovered?: number
}
```

**Logic Flow:**
1. Find completed games without results
2. Fetch final scores from ESPN API
3. Update `games.actual_outcome`
4. Load all predictions for these games
5. Grade each prediction (correct/incorrect)
6. Calculate prediction accuracy
7. Update `prediction_history.result`
8. Update `accuracy_metrics` aggregate stats
9. If autoLearn = true, trigger pattern discovery
10. Return summary

**Grading Logic:**
```typescript
function gradePrediction(prediction, actualOutcome) {
  const accuracy = {
    winner_correct: prediction.winner === actualOutcome.winner,
    spread_correct: didSpreadHit(prediction.spread, actualOutcome),
    total_correct: didTotalHit(prediction.total, actualOutcome),
    overall_accuracy: 0
  };

  // Calculate overall accuracy as weighted average
  accuracy.overall_accuracy = (
    (accuracy.winner_correct ? 40 : 0) +
    (accuracy.spread_correct ? 35 : 0) +
    (accuracy.total_correct ? 25 : 0)
  );

  return accuracy;
}
```

---

### 7. `fetch-injuries` - Get Injury Reports

**Purpose:** Fetch and update injury reports from ESPN

**Trigger:**
- Cron: Every 6 hours during season
- Manual: "Refresh Injuries" button
- HTTP: POST request

**Input:**
```typescript
{
  sport: 'NFL' | 'NBA' | 'MLB' | 'CFB' | 'NHL'
}
```

**Output:**
```typescript
{
  success: boolean,
  injuriesUpdated: number,
  injuriesResolved: number,
  sport: string,
  timestamp: string
}
```

**Logic Flow:**
1. Fetch injury data from ESPN API
2. Parse injury status (out, doubtful, questionable, etc.)
3. Match players to database
4. Update existing injuries or create new
5. Resolve injuries (mark as resolved if player active)
6. Return summary

---

## Phase 5: Admin Tools Backend

### Admin Endpoints

**1. Manual Game Creation**
```typescript
POST /admin/create-game
{
  sport: string,
  home_team: string,
  away_team: string,
  game_date: string,
  venue?: string
}
```

**2. Force Data Refresh**
```typescript
POST /admin/force-refresh
{
  action: 'odds' | 'rosters' | 'injuries' | 'schedules',
  sport?: string
}
```

**3. Clear Cache**
```typescript
POST /admin/clear-cache
{
  cacheType: 'analysis' | 'odds' | 'all'
}
```

**4. Export Data**
```typescript
GET /admin/export
?type=predictions|games|accuracy
&sport=NFL
&dateStart=2025-01-01
&dateEnd=2025-12-31
```

**5. Import Historical Data**
```typescript
POST /admin/import-historical
{
  format: 'csv' | 'json',
  data: string | object,
  dataType: 'games' | 'odds' | 'stats'
}
```

---

## Phase 6: Cron Job Schedule

```typescript
// supabase/functions/_shared/cron-schedule.ts

export const CRON_JOBS = {
  // Daily schedules
  'populate-games-nfl': {
    schedule: '0 3 * * *',  // 3 AM EST daily
    sport: 'NFL'
  },
  'populate-games-nba': {
    schedule: '0 3 * * *',
    sport: 'NBA'
  },

  // Frequent odds updates
  'fetch-odds-all': {
    schedule: '*/15 * * * *',  // Every 15 minutes
    markets: ['h2h', 'spreads', 'totals']
  },

  // Daily analysis
  'generate-analysis': {
    schedule: '0 18 * * *',  // 6 PM EST - analyze next day's games
  },

  // Hourly result checks
  'update-results': {
    schedule: '0 * * * *',  // Every hour
    autoLearn: true
  },

  // Weekly roster sync
  'sync-rosters-all': {
    schedule: '0 2 * * 0',  // 2 AM Sunday
    fullSync: true
  },

  // Injury updates
  'fetch-injuries-all': {
    schedule: '0 */6 * * *',  // Every 6 hours
  }
};
```

---

## Phase 7: Implementation Order

### Week 1: Foundation
1. ✅ **Database schema deployed** (already done)
2. Create Edge Functions boilerplate
3. Set up environment variables
4. Create shared utilities (`supabase-client.ts`, `espn-api.ts`, `odds-api.ts`)

### Week 2: Data Ingestion
5. Build `populate-games` function
6. Build `fetch-odds` function
7. Build `sync-rosters` function
8. Build `fetch-injuries` function
9. Test data pipeline end-to-end

### Week 3: Analysis Engine
10. Build `generate-props` function
11. Build `run-analyzer` function with OpenAI
12. Build caching layer
13. Test analysis quality

### Week 4: Verification & Learning
14. Build `update-results` function
15. Build accuracy tracking
16. Build pattern discovery
17. Build admin endpoints

### Week 5: Polish & Deploy
18. Set up cron jobs
19. Add monitoring/logging
20. Performance optimization
21. Documentation
22. Production deployment

---

## Phase 8: Testing Strategy

### Unit Tests
```typescript
// Test each function independently
describe('populate-games', () => {
  it('should fetch NFL schedule', async () => {
    const result = await populateGames({ sport: 'NFL' });
    expect(result.success).toBe(true);
    expect(result.gamesCreated).toBeGreaterThan(0);
  });
});
```

### Integration Tests
```typescript
// Test full pipeline
describe('Data Pipeline', () => {
  it('should populate games, fetch odds, and analyze', async () => {
    await populateGames({ sport: 'NFL' });
    await fetchOdds({ sport: 'NFL' });
    const analysis = await runAnalyzer({ gameId: 'test-game-id' });
    expect(analysis.success).toBe(true);
  });
});
```

### Load Tests
- 1000 concurrent API calls
- Database query performance
- Cache hit rates

---

## Phase 9: Monitoring & Observability

### Metrics to Track
- API call success rates
- Database query times
- Analysis generation time
- Prediction accuracy over time
- Edge Function execution time
- Rate limit usage

### Logging
```typescript
// Structured logging
logger.info('populate-games-started', {
  sport: 'NFL',
  dateRange: { start: '2025-01-01', end: '2025-01-31' }
});

logger.error('fetch-odds-failed', {
  sport: 'NBA',
  error: err.message,
  bookmaker: 'draftkings'
});
```

### Alerts
- API failures > 10%
- Database connection errors
- Rate limit warnings (>80% usage)
- Analysis accuracy drops below 50%

---

## Phase 10: Cost Estimates

| Service | Monthly Cost | Usage |
|---------|--------------|-------|
| Supabase Pro | $25 | Database + Edge Functions |
| The Odds API | $50-200 | 5k-10k requests/month |
| OpenAI GPT-4 | $20-100 | ~500 analyses/day |
| SportsData.io | $10-50 | Backup/enrichment |
| **Total** | **$105-375/mo** | Production scale |

---

## Phase 11: Security Considerations

1. **API Key Protection**
   - Store in Supabase secrets
   - Never expose in client code
   - Rotate keys quarterly

2. **Rate Limiting**
   - Implement request queues
   - Track usage per endpoint
   - Fallback to cached data

3. **Data Validation**
   - Sanitize all inputs
   - Validate team names
   - Check date ranges

4. **Access Control**
   - Admin endpoints require auth
   - Row Level Security on tables
   - Audit log for admin actions

---

## Success Criteria

✅ **Week 1:** Database deployed, Edge Functions skeleton ready
✅ **Week 2:** Game schedules populating automatically, odds updating every 15 minutes
✅ **Week 3:** AI analysis generating predictions with 60%+ accuracy
✅ **Week 4:** Predictions being graded automatically, accuracy tracking working
✅ **Week 5:** Full system running autonomously, admin tools functional

---

## Next Steps

**Do you want me to:**

1. ✅ **Approve this plan** → Start building Edge Functions one by one
2. 🔄 **Modify the plan** → Adjust scope, priorities, or architecture
3. 📝 **Deep dive on specific function** → Show detailed implementation for one function first
4. 🚀 **Start building immediately** → Begin with Phase 1

**I recommend starting with:**
1. Create shared utilities
2. Build `populate-games` (simplest, validates pipeline)
3. Build `fetch-odds` (critical for betting data)
4. Test these two end-to-end before moving to analysis

**What would you like me to build first?**
