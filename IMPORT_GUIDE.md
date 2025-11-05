# Sports Data Import Guide

This guide explains how to import historical sports data (2020-present) into your Supabase database.

## Overview

We've created comprehensive import scripts for the following sports:
- **NFL** (National Football League)
- **CFB** (College Football)
- **MLB** (Major League Baseball)
- **NBA** (National Basketball Association)
- **UFC** (Ultimate Fighting Championship)
- **Golf** (PGA Tour)

## Prerequisites

1. **Node.js** installed (v18 or higher recommended)
2. **Supabase project** set up with credentials in `.env`
3. **Database migrations** applied

## Step 1: Apply Database Migrations

First, you need to create the tables in Supabase:

```bash
# If using Supabase CLI
supabase db push

# Or manually apply the migration file
# Go to Supabase Dashboard > SQL Editor
# Copy contents of supabase/migrations/20250104000001_sports_tables.sql
# Execute the SQL
```

## Step 2: Configure Environment Variables

Make sure your `.env` file contains:

```env
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The service role key you provided:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiZ2xjbWFoaWhibWdsa2JvbGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA3ODYyMSwiZXhwIjoyMDc3NjU0NjIxfQ.Ot1R50mLuVb-Byo0Rg83I4vMa3vMeTMbQmnWdWmfKBM
```

## Step 3: Install Dependencies

```bash
npm install
```

Make sure you have `node-fetch` and `dotenv` installed.

## Step 4: Run the Import Scripts

### Option A: Import All Sports (Recommended)

Run all sports imports sequentially:

```bash
node import-all-sports.mjs
```

This will import data for all sports one after another. **Expected time: 4-8 hours**

### Option B: Import Individual Sports

Run sports one at a time:

```bash
# NFL
node import-nfl.mjs

# College Football
node import-cfb.mjs

# MLB
node import-mlb.mjs

# NBA
node import-nba.mjs

# UFC
node import-ufc.mjs

# Golf
node import-golf.mjs
```

## What Gets Imported

### NFL
- **Teams**: All 32 NFL teams
- **Games**: ~1,300 games (2020-2024)
- **Player Stats**: Passing, rushing, receiving, defensive stats
- **Seasons**: 2020, 2021, 2022, 2023, 2024 (regular season + playoffs)

### CFB (College Football)
- **Teams**: 130+ FBS teams
- **Games**: ~8,000+ games (2020-2024)
- **Player Stats**: Passing, rushing, receiving, defensive stats
- **Seasons**: 2020, 2021, 2022, 2023, 2024 (regular season + bowl games)

### MLB
- **Teams**: All 30 MLB teams
- **Games**: ~8,000 games (2020-2024)
- **Player Stats**: Batting and pitching statistics
- **Seasons**: 2020, 2021, 2022, 2023, 2024 (regular season + playoffs)

### NBA
- **Teams**: All 30 NBA teams
- **Games**: ~6,500 games (2019-20 to 2024-25)
- **Player Stats**: Points, rebounds, assists, and all box score stats
- **Seasons**: 2019-20, 2020-21, 2021-22, 2022-23, 2023-24, 2024-25

### UFC
- **Fighters**: 500+ active fighters
- **Events**: ~250+ events (2020-2024)
- **Fights**: ~2,500+ fights
- **Fight Stats**: Strikes, takedowns, submissions, knockdowns

### Golf
- **Players**: 500+ PGA Tour players
- **Tournaments**: ~250+ tournaments (2020-2024)
- **Scores**: Round-by-round scores
- **Results**: Final standings and positions

## Expected Data Volume

| Sport | Games/Events | Player Stats | Est. Time |
|-------|-------------|--------------|-----------|
| NFL   | ~1,300      | ~50,000      | 45-60 min |
| CFB   | ~8,000      | ~100,000     | 2-3 hours |
| MLB   | ~8,000      | ~200,000     | 2-3 hours |
| NBA   | ~6,500      | ~150,000     | 1-2 hours |
| UFC   | ~250        | ~5,000       | 30-45 min |
| Golf  | ~250        | ~15,000      | 30-45 min |
| **TOTAL** | **~24,300** | **~520,000** | **6-10 hours** |

## Monitoring Progress

Each script provides real-time progress updates:

```
🏈 NFL DATA IMPORT SCRIPT
========================================

📋 Importing NFL Teams...
✅ KC - Kansas City Chiefs
✅ BUF - Buffalo Bills
...

🏈 Importing NFL 2020 Season...

📅 Week 1
✅ 2020-09-10: HOU@KC 20-34
✅ 2020-09-13: PHI@WAS 17-27
...
```

## Handling Errors

The scripts are designed to:
- Continue on error (won't stop the entire import)
- Avoid duplicates using `merge-duplicates` strategy
- Rate limit API requests to avoid being blocked
- Log errors for debugging

If a script fails:
1. Check your internet connection
2. Verify Supabase credentials in `.env`
3. Check Supabase dashboard for any database errors
4. Re-run the specific sport script - it will skip duplicates

## Resuming Imports

All scripts use `merge-duplicates`, so you can safely re-run them:
- Already imported data will be skipped or updated
- Only new data will be inserted
- No duplicate records will be created

## Post-Import Verification

After imports complete, verify the data:

```sql
-- Check game counts by sport
SELECT 'NFL' as sport, COUNT(*) FROM nfl_games
UNION ALL
SELECT 'CFB', COUNT(*) FROM cfb_games
UNION ALL
SELECT 'MLB', COUNT(*) FROM mlb_games
UNION ALL
SELECT 'NBA', COUNT(*) FROM nba_games
UNION ALL
SELECT 'UFC', COUNT(*) FROM ufc_fights
UNION ALL
SELECT 'Golf', COUNT(*) FROM golf_tournaments;

-- Check player stats counts
SELECT 'NFL' as sport, COUNT(*) FROM nfl_player_stats
UNION ALL
SELECT 'CFB', COUNT(*) FROM cfb_player_stats
UNION ALL
SELECT 'MLB', COUNT(*) FROM mlb_player_stats
UNION ALL
SELECT 'NBA', COUNT(*) FROM nba_player_stats
UNION ALL
SELECT 'UFC', COUNT(*) FROM ufc_fight_stats
UNION ALL
SELECT 'Golf', COUNT(*) FROM golf_scores;
```

## Troubleshooting

### "Connection refused" or "Network error"
- Check your internet connection
- Verify Supabase is not having an outage
- Try again in a few minutes

### "Too many requests" or rate limiting
- The scripts already include delays, but you can increase them
- Edit the `delay()` values in the scripts (currently 50-300ms)

### "Table does not exist"
- Run the migrations first (see Step 1)
- Verify table names match in Supabase dashboard

### Script hangs or stops responding
- Press Ctrl+C to stop
- Re-run the script - it will continue from where it left off

## Next Steps

Once data is imported:

1. **Verify data quality** using the SQL queries above
2. **Set up Edge Functions** to keep data updated
3. **Create indexes** for frequently queried fields (already included in migration)
4. **Build your AI models** using this historical data

## Maintenance

To keep data current:

1. Run imports weekly to get the latest games/results
2. Set up a cron job to automate imports:
   ```bash
   # Example cron: Run every Monday at 2 AM
   0 2 * * 1 cd /path/to/project && node import-all-sports.mjs
   ```

## Support

If you encounter issues:
1. Check the error messages in the console
2. Verify your Supabase credentials
3. Check API availability (ESPN, MLB Stats, etc.)
4. Review the data source documentation in `DATA_SOURCES.md`
