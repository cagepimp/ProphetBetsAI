# ProphetBetsAI Database Schema Documentation

## Overview

Complete Supabase PostgreSQL database schema for a multi-sport betting prediction platform with AI-powered analysis.

**Supported Sports:** NFL, NBA, MLB, CFB, UFC, Golf

---

## Core Architecture

### 1. **Core Tables** (Foundation)
```
teams → players → games
           ↓
    player_props, team_props
```

### 2. **Analysis & Predictions**
```
games → prediction_history → accuracy_metrics
  ↓
analysis_cache → learning_patterns → training_data
```

### 3. **Historical Data**
```
games → player_game_stats, team_game_stats
  ↓
historical_odds, line_history
```

---

## Table Details

### **teams**
Stores all teams across all sports.

**Key Fields:**
- `name`, `abbreviation`, `sport`, `league`, `division`
- `logo_url`, `colors` (JSONB)
- `active` flag for current teams

**Example:**
```json
{
  "name": "Kansas City Chiefs",
  "abbreviation": "KC",
  "sport": "NFL",
  "league": "AFC",
  "division": "West",
  "colors": {"primary": "#E31837", "secondary": "#FFB612"}
}
```

---

### **players**
All players across all sports with current team and stats.

**Key Fields:**
- `name`, `team`, `sport`, `position`
- `status`: active, injured, inactive, retired
- `stats` (JSONB) - flexible sport-specific stats
- `team_id` foreign key to teams table

**Relationships:**
- `team_id` → `teams.id`
- One player to many `player_game_stats`
- One player to many `player_props`
- One player to many `injuries`

---

### **games**
Central table for all scheduled/completed games.

**Key Fields:**
- `home_team`, `away_team`, `game_date`, `status`
- `season`, `week` (for NFL/CFB)
- `markets` (JSONB) - odds from multiple sportsbooks
- `analysis` (JSONB) - AI analysis results
- `prediction` (JSONB) - predicted outcome
- `actual_outcome` (JSONB) - final result
- `prediction_accuracy` (JSONB) - grading results

**Markets Structure:**
```json
{
  "moneyline": {
    "draftkings": [{"name": "Chiefs", "odds": -150}, {"name": "Raiders", "odds": +130}],
    "fanduel": [{"name": "Chiefs", "odds": -145}, {"name": "Raiders", "odds": +125}]
  },
  "spread": {
    "draftkings": [{"name": "Chiefs", "point": -3.5, "odds": -110}]
  },
  "total": {
    "draftkings": [{"name": "Over", "point": 47.5, "odds": -110}]
  }
}
```

**Status Values:**
- `scheduled` - future game
- `live` - currently in progress
- `completed` - finished with final score
- `postponed`, `cancelled`

---

### **player_props**
Individual player prop bets (passing yards, touchdowns, etc.).

**Key Fields:**
- `player_name`, `team`, `sport`, `prop_type`
- `line` - the prop line (e.g., 250.5 yards)
- `over_odds`, `under_odds`
- `sportsbook` - draftkings, fanduel, betmgm
- `recommendation` - over, under, pass
- `confidence` - 0-100 confidence score
- `edge` - expected value percentage
- `actual_result`, `outcome` - for grading

**Prop Types:**
- **NFL/CFB:** passing_yards, rushing_yards, receiving_yards, touchdowns, receptions
- **NBA:** points, rebounds, assists, threes, steals
- **MLB:** strikeouts, hits, home_runs, RBIs
- **Golf:** winning_score, top_5_finish, head_to_head

---

### **injuries**
Real-time injury reports for all players.

**Key Fields:**
- `player_name`, `team`, `sport`
- `injury_status` - out, doubtful, questionable, probable, day-to-day, IR
- `injury_description`, `body_part`
- `severity` - 1-10 scale
- `estimated_return_date`
- `impact_analysis` (JSONB) - how this affects predictions

**Status Levels:**
1. **OUT** - Will not play
2. **Doubtful** - Unlikely to play (~25% chance)
3. **Questionable** - Uncertain (~50% chance)
4. **Probable** - Likely to play (~75% chance)
5. **Day-to-Day** - Being monitored daily

---

### **player_game_stats**
Historical performance data for ML training.

**Key Fields:**
- `player_id`, `game_id`, `game_date`
- `stats` (JSONB) - flexible stats storage

**Stats Structure (NFL QB example):**
```json
{
  "passing_yards": 312,
  "passing_touchdowns": 3,
  "interceptions": 1,
  "completions": 24,
  "attempts": 35,
  "completion_percentage": 68.6,
  "qb_rating": 104.2
}
```

---

### **prediction_history**
Tracks every prediction made by the AI analyzer.

**Key Fields:**
- `game_id`, `sport`, `prediction_type`
- `predicted_outcome` (JSONB) - what we predicted
- `actual_outcome` (JSONB) - what happened
- `result` - win, loss, push, pending
- `confidence` - prediction confidence
- `analyzer_version` - which model made this prediction

**Use Cases:**
- Calculate accuracy metrics
- Train ML models
- Track analyzer performance over time
- Generate ROI reports

---

### **accuracy_metrics**
Aggregated accuracy statistics.

**Key Fields:**
- `sport`, `metric_type`, `time_period`
- `total_predictions`, `correct_predictions`
- `accuracy_percentage`, `roi`
- `breakdown` (JSONB) - detailed stats

**Metric Types:**
- `overall` - all predictions
- `by_confidence` - grouped by confidence levels
- `by_market` - moneyline, spread, total, props
- `by_sport` - per sport performance

---

### **learning_patterns**
AI-discovered patterns that affect outcomes.

**Key Fields:**
- `pattern_name`, `pattern_type`
- `conditions` (JSONB) - when pattern applies
- `impact_factor` - how much it affects outcome
- `accuracy` - pattern's historical accuracy

**Example Patterns:**
```json
{
  "pattern_name": "Home Underdog After Loss",
  "pattern_type": "situational",
  "conditions": {
    "location": "home",
    "spread": {"$gt": 0},
    "previous_game_result": "loss"
  },
  "impact_factor": 0.15,
  "accuracy": 62.5
}
```

---

### **analysis_cache**
Cache expensive analysis results.

**Key Fields:**
- `cache_key` - unique identifier
- `cache_type` - game_analysis, props_analysis, odds_fetch
- `data` (JSONB) - cached result
- `expires_at` - TTL for cache invalidation

**Benefits:**
- Avoid redundant API calls
- Speed up page loads
- Reduce computation costs

---

### **historical_odds**
Track odds movements over time.

**Key Fields:**
- `game_id`, `sportsbook`, `market_type`
- `odds_data` (JSONB) - complete odds snapshot
- `timestamp` - when odds were captured

**Use Cases:**
- Detect sharp money movements
- Find value bets
- Analyze line shopping opportunities

---

### **line_history**
Track specific line movements.

**Key Fields:**
- `game_id`, `sportsbook`, `market_type`
- `previous_line`, `new_line`, `line_move`
- `previous_odds`, `new_odds`

**Example:**
```
Spread moved from Chiefs -3.5 (-110) to Chiefs -4.5 (-110)
line_move = -1.0 (indicating more money on Chiefs)
```

---

## Relationships Diagram

```
┌─────────────┐
│   teams     │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
┌──────▼──────┐    ┌──────▼──────────────┐
│   players   │    │   team_game_stats   │
└──────┬──────┘    └─────────────────────┘
       │
       ├────────────────────┐
       │                    │
┌──────▼──────────┐  ┌──────▼────────┐
│ player_game_    │  │   injuries    │
│   stats         │  │               │
└─────────────────┘  └───────────────┘

┌─────────────────────────────────────┐
│             games                   │
│  (central hub for all game data)    │
└──────┬─────────┬────────────┬───────┘
       │         │            │
   ┌───▼──┐  ┌───▼────┐  ┌────▼────────┐
   │props │  │ odds   │  │ predictions │
   └──────┘  └────────┘  └─────────────┘

┌──────────────────────────────────────┐
│   AI/ML Components                   │
├──────────────────────────────────────┤
│ • learning_patterns                  │
│ • training_data                      │
│ • accuracy_metrics                   │
│ • prediction_history                 │
└──────────────────────────────────────┘
```

---

## Indexes

All critical query paths are indexed:

**Games:**
- sport, game_date, status, season, week
- home_team, away_team
- external_id (for API lookups)

**Players:**
- team, sport, status
- team_id (foreign key)

**Props:**
- game_id, player_id, sport
- sportsbook, confidence (DESC), status

**Injuries:**
- player_id, team, sport
- injury_status, date_updated (DESC)

**Predictions:**
- game_id, sport, result
- predicted_at (DESC)

---

## Row Level Security (RLS)

**Public Read Access:**
- teams, players, games
- player_props, team_props
- injuries

**User-Specific Access:**
- user_profiles (users see only their profile)
- user_predictions (users see only their predictions)

**Admin/Service Role:**
- Full write access to all tables
- Bypasses RLS automatically

---

## Triggers

**auto-update `updated_at`:**
Applied to: teams, players, games, injuries, user_profiles

Automatically sets `updated_at = NOW()` on every UPDATE.

---

## Data Flow Example

### Adding a New Game with Analysis

1. **Insert Game**
```sql
INSERT INTO games (sport, home_team, away_team, game_date, season, week)
VALUES ('NFL', 'Kansas City Chiefs', 'Las Vegas Raiders', '2025-11-10', 2025, 11);
```

2. **Fetch & Store Odds**
```sql
UPDATE games SET markets = {
  "moneyline": {"draftkings": [...], "fanduel": [...]},
  "spread": {...},
  "total": {...}
}
WHERE id = 'game-uuid';
```

3. **Run AI Analysis**
```sql
UPDATE games SET
  analysis = {...analysis results...},
  prediction = {"winner": "Chiefs", "spread": -3.5, "confidence": 78},
  analyzer_confidence = 78,
  analyzed_at = NOW()
WHERE id = 'game-uuid';
```

4. **Insert Props**
```sql
INSERT INTO player_props (game_id, player_name, prop_type, line, confidence, edge)
VALUES ('game-uuid', 'Patrick Mahomes', 'passing_yards', 275.5, 72, 5.2);
```

5. **Track Prediction**
```sql
INSERT INTO prediction_history (game_id, sport, predicted_outcome, confidence)
VALUES ('game-uuid', 'NFL', {"winner": "Chiefs"}, 78);
```

6. **After Game Completes**
```sql
-- Update game result
UPDATE games SET
  status = 'completed',
  home_score = 31,
  away_score = 17,
  actual_outcome = {"winner": "Chiefs", "spread_cover": true}
WHERE id = 'game-uuid';

-- Grade prediction
UPDATE prediction_history SET
  actual_outcome = {"winner": "Chiefs"},
  result = 'win',
  graded_at = NOW()
WHERE game_id = 'game-uuid';

-- Update accuracy metrics
UPDATE accuracy_metrics SET
  total_predictions = total_predictions + 1,
  correct_predictions = correct_predictions + 1,
  accuracy_percentage = (correct_predictions::DECIMAL / total_predictions) * 100
WHERE sport = 'NFL' AND metric_type = 'overall';
```

---

## Next Steps

1. **Deploy Schema to Supabase**
   - Run `schema.sql` in Supabase SQL Editor

2. **Seed Initial Data**
   - Add NFL/NBA/MLB teams
   - Load current season rosters

3. **Create Edge Functions**
   - `fetchOdds` - Get odds from TheOddsAPI
   - `fetchInjuries` - Get injury reports from ESPN
   - `runAnalyzer` - AI game analysis
   - `updateSchedule` - Fetch game schedules

4. **Set up Cron Jobs**
   - Daily odds refresh
   - Injury report updates
   - Auto-grade completed games

---

## Performance Considerations

**Estimated Storage:**
- Games: ~10K rows/season (all sports) = ~1MB
- Player Stats: ~500K rows/season = ~50MB
- Props: ~100K rows/season = ~10MB
- Predictions: ~50K rows/season = ~5MB

**Query Optimization:**
- All foreign keys are indexed
- Composite indexes on frequently filtered combinations
- JSONB indexes can be added for specific fields if needed

**Scaling:**
- PostgreSQL handles millions of rows easily
- Supabase automatically manages connection pooling
- Consider partitioning games table by season for multi-year data

---

## Backup & Maintenance

**Supabase automatically handles:**
- Daily backups
- Point-in-time recovery
- High availability

**Recommended maintenance:**
- Monthly: Review and optimize slow queries
- Quarterly: Archive old seasons to separate tables
- Annually: Update patterns and retrain ML models

---

Ready to deploy! 🚀
