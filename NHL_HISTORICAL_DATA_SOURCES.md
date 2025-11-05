# NHL Historical Data Sources (2020-2024)
## Complete Guide for AI Training Data

---

## 🏒 Best Free Data Sources

### 1. **MoneyPuck.com** ⭐ RECOMMENDED
**URL:** https://moneypuck.com/data.htm
**Coverage:** 2008-2024 (includes all our target years)
**Format:** CSV downloads
**Cost:** FREE (non-commercial use with credit)

**Available Data:**
- ✅ Game-by-game results
- ✅ Team stats per game
- ✅ Player stats per game
- ✅ Shot locations and xG (expected goals)
- ✅ Line combinations
- ✅ Advanced metrics (Corsi, Fenwick, PDO)
- ✅ Power play / Penalty kill stats

**Download Links:**
- All Situations: http://moneypuck.com/moneypuck/playerData/careers/gameByGame/all_teams.csv
- Season-level: http://moneypuck.com/moneypuck/playerData/seasonSummary/
- Team data: http://moneypuck.com/moneypuck/teams/

---

### 2. **Official NHL API** ⭐ BEST FOR REAL-TIME
**Base URL:** https://api-web.nhle.com/v1/
**Coverage:** 1917-Present
**Format:** JSON
**Cost:** FREE (no auth required)

**Key Endpoints:**
```
Schedule: https://api-web.nhle.com/v1/schedule/{date}
Game Details: https://api-web.nhle.com/v1/gamecenter/{gameId}/boxscore
Standings: https://api-web.nhle.com/v1/standings/{date}
Team Stats: https://api-web.nhle.com/v1/club-stats/{team}/{season}/2
Player Stats: https://api-web.nhle.com/v1/player/{playerId}/landing
```

**Documentation:** https://github.com/Zmalski/NHL-API-Reference

---

### 3. **Hockey-Reference.com** ⭐ BEST FOR COMPREHENSIVE STATS
**URL:** https://www.hockey-reference.com/
**Coverage:** All NHL history
**Format:** HTML tables (exportable to CSV)
**Cost:** FREE

**Available Data:**
- ✅ Team schedules & results
- ✅ Player game logs
- ✅ Box scores
- ✅ Shot charts (2011-present)
- ✅ Advanced stats
- ✅ Injury reports

**How to Export:**
1. Navigate to stats page
2. Scroll to bottom of table
3. Click "Get table as CSV (for Excel)"

---

### 4. **Natural Stat Trick**
**URL:** https://www.naturalstattrick.com/
**Coverage:** 2007-Present
**Format:** CSV export
**Cost:** FREE

**Specializes In:**
- ✅ Advanced analytics
- ✅ Line matching data
- ✅ Zone starts
- ✅ Quality of competition
- ✅ Score effects

---

### 5. **Evolving Hockey**
**URL:** https://evolving-hockey.com/
**Coverage:** 2007-Present
**Format:** CSV downloads
**Cost:** FREE basic / Premium subscription

**Available Data:**
- ✅ GAR (Goals Above Replacement)
- ✅ xG models
- ✅ RAPM (Regularized Adjusted Plus-Minus)
- ✅ Contract projections

---

## 📊 Data Fields Mapping

### Core Game Data Structure

| Our DB Field | MoneyPuck | NHL API | Hockey-Ref | Description |
|--------------|-----------|---------|------------|-------------|
| **external_id** | gameId | id | game_id | Unique game identifier |
| **sport** | - | - | - | Always "NHL" |
| **season** | season | season | season | Year (2020-2024) |
| **game_date** | gameDate | gameDate | date_game | YYYY-MM-DD |
| **home_team** | home_team | homeTeam.abbrev | home_team | Team abbreviation |
| **away_team** | away_team | awayTeam.abbrev | away_team | Team abbreviation |
| **home_score** | home_goals | homeTeam.score | home_goals | Final score |
| **away_score** | away_goals | awayTeam.score | away_goals | Final score |
| **winner** | - | winningTeam | - | Calculate from scores |

### Advanced Stats

| Our DB Field | Data Source | Field Name | Description |
|--------------|-------------|------------|-------------|
| **home_offensive_rating** | MoneyPuck | xGoalsFor | Expected goals for |
| **away_offensive_rating** | MoneyPuck | xGoalsFor | Expected goals for |
| **home_defensive_rating** | MoneyPuck | xGoalsAgainst | Expected goals against |
| **away_defensive_rating** | MoneyPuck | xGoalsAgainst | Expected goals against |
| **pace_projection** | Natural Stat Trick | TOI, Shots | Time on ice / shots |

### Team Stats (JSONB)

```json
{
  "shots": 32,
  "hits": 18,
  "blocked_shots": 14,
  "giveaways": 7,
  "takeaways": 5,
  "faceoff_percentage": 52.3,
  "power_plays": "1/3",
  "penalty_kill": "2/2",
  "corsi_for": 58.2,
  "fenwick_for": 56.1,
  "expected_goals": 3.4
}
```

### Injuries (JSONB Array)

```json
[
  {
    "player": "Connor McDavid",
    "position": "C",
    "injury": "Lower Body",
    "status": "Out",
    "games_missed": 5,
    "value_score": 9.5
  }
]
```

---

## 🎯 Sample NHL Historical Data Table

### Example: 2023-24 Season Games

| game_id | date | away_team | home_team | away_score | home_score | away_xG | home_xG | away_corsi | home_corsi | winner |
|---------|------|-----------|-----------|------------|------------|---------|---------|------------|------------|--------|
| 2023020001 | 2023-10-10 | BUF | NYR | 3 | 5 | 2.8 | 4.1 | 48.2 | 61.8 | NYR |
| 2023020002 | 2023-10-10 | VAN | EDM | 3 | 4 | 3.2 | 3.6 | 52.1 | 47.9 | EDM |
| 2023020003 | 2023-10-10 | MTL | TOR | 1 | 4 | 1.9 | 3.8 | 42.3 | 57.7 | TOR |
| 2023020004 | 2023-10-11 | COL | VGK | 2 | 1 | 2.7 | 1.8 | 58.6 | 41.4 | COL |
| 2023020005 | 2023-10-11 | BOS | CHI | 4 | 2 | 3.5 | 2.1 | 63.2 | 36.8 | BOS |

### Example: Advanced Stats Table

| game_id | team | shots | hits | blocks | faceoff_pct | pp_goals | pp_opps | pk_success | corsi | fenwick | xG |
|---------|------|-------|------|--------|-------------|----------|---------|------------|-------|---------|-----|
| 2023020001 | NYR | 35 | 22 | 16 | 54.2 | 1 | 4 | 3/3 | 61.8 | 59.2 | 4.1 |
| 2023020001 | BUF | 28 | 19 | 12 | 45.8 | 0 | 3 | 3/4 | 48.2 | 40.8 | 2.8 |
| 2023020002 | EDM | 32 | 15 | 18 | 51.3 | 2 | 5 | 2/3 | 47.9 | 46.1 | 3.6 |
| 2023020002 | VAN | 30 | 20 | 14 | 48.7 | 1 | 3 | 3/5 | 52.1 | 53.9 | 3.2 |

### Example: Player Stats (For Injury Impact Analysis)

| game_id | player | team | position | toi | goals | assists | shots | hits | plus_minus | xG | injured |
|---------|--------|------|----------|-----|-------|---------|-------|------|------------|-----|---------|
| 2023020001 | Artemi Panarin | NYR | LW | 19:32 | 2 | 1 | 5 | 2 | +2 | 1.8 | false |
| 2023020001 | Igor Shesterkin | NYR | G | 60:00 | 0 | 0 | 0 | 0 | 0 | 0 | false |
| 2023020002 | Connor McDavid | EDM | C | 21:45 | 1 | 2 | 8 | 1 | +2 | 2.1 | false |
| 2023020003 | Auston Matthews | TOR | C | 0:00 | 0 | 0 | 0 | 0 | 0 | 0 | true |

---

## 📥 Data Import Strategy

### Phase 1: Bulk Historical Import (2020-2024)

**Step 1:** Download MoneyPuck CSV files
```bash
# Download all seasons
curl -O http://moneypuck.com/moneypuck/playerData/seasonSummary/2020/all_teams.csv
curl -O http://moneypuck.com/moneypuck/playerData/seasonSummary/2021/all_teams.csv
curl -O http://moneypuck.com/moneypuck/playerData/seasonSummary/2022/all_teams.csv
curl -O http://moneypuck.com/moneypuck/playerData/seasonSummary/2023/all_teams.csv
curl -O http://moneypuck.com/moneypuck/playerData/seasonSummary/2024/all_teams.csv
```

**Step 2:** Process CSV → JSON
```javascript
// Parse CSV and transform to our schema
const games = parseMoneyPuckCSV(csvData);
const transformedGames = games.map(game => ({
  external_id: game.gameId,
  sport: 'NHL',
  season: parseInt(game.season),
  game_date: game.gameDate,
  home_team: game.home_team,
  away_team: game.away_team,
  home_score: game.home_goals,
  away_score: game.away_goals,
  home_team_stats: {
    shots: game.home_shots,
    corsi: game.home_corsi,
    xG: game.home_xG,
    // ... more stats
  },
  away_team_stats: {
    shots: game.away_shots,
    corsi: game.away_corsi,
    xG: game.away_xG,
    // ... more stats
  },
  verified: true,
  data_quality_score: 1.0
}));
```

**Step 3:** Insert into Supabase
```javascript
const { data, error } = await supabase
  .from('historical_games')
  .insert(transformedGames);
```

### Phase 2: Add Betting Odds (Historical)

Use TheOddsAPI or Sports Odds History to backfill betting lines for 2020-2024:

```javascript
// For each game, fetch historical odds
const odds = await fetchHistoricalOdds(game.external_id, game.game_date);

await supabase
  .from('historical_games')
  .update({
    home_moneyline: odds.home_ml,
    away_moneyline: odds.away_ml,
    spread: odds.puck_line,
    total: odds.total,
    line_movements: odds.movements // JSONB array
  })
  .eq('external_id', game.external_id);
```

### Phase 3: Add Injury Data

Scrape or import injury reports:

```javascript
const injuries = await fetchInjuryReport(game.game_date);

await supabase
  .from('historical_games')
  .update({
    home_injuries: injuries.filter(i => i.team === game.home_team),
    away_injuries: injuries.filter(i => i.team === game.away_team),
    injury_impact_score: calculateInjuryImpact(injuries)
  })
  .eq('external_id', game.external_id);
```

---

## 📋 Data Coverage Summary

### Seasons Available

| Season | Regular Season Games | Playoff Games | Total Games | Data Sources |
|--------|---------------------|---------------|-------------|--------------|
| 2019-20 | 1,082 (COVID-shortened) | 130 | 1,212 | All sources ✅ |
| 2020-21 | 868 (56-game season) | 91 | 959 | All sources ✅ |
| 2021-22 | 1,312 | 92 | 1,404 | All sources ✅ |
| 2022-23 | 1,312 | 92 | 1,404 | All sources ✅ |
| 2023-24 | 1,312 | 92 | 1,404 | All sources ✅ |
| **TOTAL** | **5,886** | **497** | **6,383** | |

### Data Completeness

| Data Type | Coverage | Source | Notes |
|-----------|----------|--------|-------|
| **Game Scores** | 100% | NHL API, MoneyPuck | Complete |
| **Basic Stats** | 100% | NHL API, Hockey-Ref | Complete |
| **Advanced Stats** | 100% | MoneyPuck, Natural Stat Trick | xG, Corsi, Fenwick |
| **Shot Locations** | 100% | MoneyPuck | Coordinates available |
| **Player Stats** | 100% | NHL API, MoneyPuck | Per game |
| **Betting Odds** | ~80% | TheOddsAPI, Historical | Need to backfill |
| **Injuries** | ~70% | NHL.com, DailyFaceOff | Manual scraping needed |
| **Line Movements** | ~60% | Historical books | Limited historical data |
| **Weather** | N/A | - | Indoor sport |

---

## 🚀 Quick Start: Get First 100 Games

### Option A: Using NHL API (Real-time)

```javascript
// Fetch schedule for October 2023
const response = await fetch(
  'https://api-web.nhle.com/v1/schedule/2023-10-01'
);
const data = await response.json();

// Get detailed game data
for (const gameWeek of data.gameWeek) {
  for (const game of gameWeek.games) {
    const gameDetail = await fetch(
      `https://api-web.nhle.com/v1/gamecenter/${game.id}/boxscore`
    );
    // Process and store
  }
}
```

### Option B: Download MoneyPuck CSV

```python
import pandas as pd

# Load game data
url = "http://moneypuck.com/moneypuck/playerData/careers/gameByGame/all_teams.csv"
df = pd.read_csv(url)

# Filter for 2023-24 season
df_2024 = df[df['season'] == 2023]

# Group by game
games = df_2024.groupby('gameId').agg({
    'home_team': 'first',
    'away_team': 'first',
    'home_goals': 'first',
    'away_goals': 'first',
    'gameDate': 'first'
}).reset_index()

# Export first 100
games.head(100).to_csv('nhl_sample_100.csv', index=False)
```

---

## 🎓 For AI Training

### Minimum Required Fields

1. **Game Identity:** game_id, date, teams
2. **Results:** scores, winner
3. **Team Stats:** shots, possession metrics (Corsi, xG)
4. **Context:** home/away, rest days, injuries
5. **Betting Lines:** moneyline, puck line, total

### Nice-to-Have Fields

1. **Advanced Metrics:** Fenwick, PDO, RAPM
2. **Player Data:** Top line performance, goalie stats
3. **Line Movements:** Opening → closing line changes
4. **Situational:** Back-to-back games, division rivals
5. **Shot Data:** Location coordinates, shot types

### Data Quality Targets

- ✅ **2023-24 Season:** 100% complete (current)
- ✅ **2022-23 Season:** 100% complete
- ✅ **2021-22 Season:** 100% complete
- ✅ **2020-21 Season:** 100% complete (COVID season)
- ✅ **2019-20 Season:** 100% complete (COVID-shortened)

**Total Training Data:** ~6,000+ NHL games with comprehensive stats

---

## 📝 Attribution Required

When using free data sources, include:

```
Data provided by:
- MoneyPuck.com (advanced NHL analytics)
- NHL.com (official statistics)
- Hockey-Reference.com (historical data)
- Natural Stat Trick (advanced metrics)
```

---

## ✅ Next Steps

1. **Download sample data** from MoneyPuck
2. **Test import script** with 100 games
3. **Validate data quality**
4. **Bulk import** all 6,000+ games
5. **Begin AI training** on historical data

Ready to start importing NHL data!
