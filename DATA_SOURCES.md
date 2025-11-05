# Sports Data Sources (2020-Present)

## Data Collection Strategy

This document outlines the data sources and APIs we'll use to populate historical data from 2020 to present for all sports.

## NFL (National Football League)

### Primary Source: ESPN API
- **Endpoint**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`
- **Data Available**:
  - Games and scores (2020-present)
  - Team information
  - Box scores and player stats
- **Rate Limit**: Free, no authentication required
- **Seasons to Import**: 2020, 2021, 2022, 2023, 2024

### Alternative: NFL API
- Can supplement with official NFL stats API if needed

## CFB (College Football)

### Primary Source: ESPN College Football API
- **Endpoint**: `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard`
- **Data Available**:
  - Games and scores (2020-present)
  - Team information (FBS teams)
  - Player stats
- **Seasons to Import**: 2020, 2021, 2022, 2023, 2024

### Secondary: CollegeFootballData.com API
- **Endpoint**: `https://api.collegefootballdata.com`
- **Note**: Requires API key (free tier available)
- More comprehensive stats if needed

## MLB (Major League Baseball)

### Primary Source: MLB Stats API
- **Endpoint**: `https://statsapi.mlb.com/api/v1/`
- **Data Available**:
  - Games and scores (2020-present)
  - Detailed player stats
  - Team information
  - Box scores
- **Rate Limit**: Free, no authentication required
- **Seasons to Import**: 2020, 2021, 2022, 2023, 2024

### Specific Endpoints:
- Schedule: `/api/v1/schedule?sportId=1&season={year}`
- Game data: `/api/v1/game/{gamePk}/feed/live`
- Box score: `/api/v1/game/{gamePk}/boxscore`

## NBA (National Basketball Association)

### Primary Source: NBA API
- **Endpoint**: `https://stats.nba.com/stats/`
- **Data Available**:
  - Games and scores (2020-present)
  - Player stats
  - Team information
- **Note**: Requires headers to mimic browser request

### Alternative: ESPN NBA API
- **Endpoint**: `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard`
- Easier to use, good for basic stats

### Seasons to Import:
- 2019-20 (completed in bubble)
- 2020-21
- 2021-22
- 2022-23
- 2023-24
- 2024-25 (current)

## UFC (Ultimate Fighting Championship)

### Primary Source: ESPN UFC API
- **Endpoint**: `https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard`
- **Data Available**:
  - Events and fight results
  - Fighter information
  - Fight stats

### Alternative: UFC Stats (web scraping if needed)
- **URL**: `http://ufcstats.com/`
- More detailed fight statistics
- May require web scraping

### Events to Import: All UFC events from 2020-present (~500+ fights)

## Golf

### Primary Source: ESPN Golf API
- **Endpoint**: `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard`
- **Tours Available**:
  - PGA Tour
  - LPGA Tour
  - European Tour
  - Champions Tour

### Alternative: PGA Tour API
- More detailed stats if needed
- May require authentication

### Data to Import:
- Major tournaments (Masters, US Open, The Open, PGA Championship)
- PGA Tour events
- Player scores and statistics
- 2020-present (~200+ tournaments per year)

## Import Strategy

### Phase 1: Current Season Data
1. Start with 2024 data to test pipelines
2. Verify data quality and schema compatibility

### Phase 2: Historical Backfill
1. Import 2023 data
2. Import 2022 data
3. Import 2021 data
4. Import 2020 data

### Phase 3: Continuous Updates
1. Set up daily/weekly cron jobs to fetch latest data
2. Monitor for new games/events
3. Update existing records as needed

## Rate Limiting & Best Practices

1. **Batch Processing**: Process seasons/months in batches
2. **Delay Between Requests**: 100-500ms between API calls
3. **Error Handling**: Retry failed requests with exponential backoff
4. **Caching**: Store raw API responses to avoid re-fetching
5. **Logging**: Track progress and errors for each import

## Estimated Data Volume

- **NFL**: ~4,000 games (256 games/season × 5 seasons)
- **CFB**: ~8,000+ games (1,600+ games/season × 5 seasons)
- **MLB**: ~8,000 games (1,600 games/season × 5 seasons)
- **NBA**: ~6,500 games (1,300 games/season × 5 seasons)
- **UFC**: ~500 events with ~5,000+ fights
- **Golf**: ~1,000+ tournaments

**Total Estimated Games/Events**: 25,000+
**Total Estimated Player Stat Records**: 500,000+
