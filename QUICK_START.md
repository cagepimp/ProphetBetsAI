# Quick Start Guide - Sports Data Import

## Current Status

I've created:
- ✅ Database migration with all sports tables (NFL, CFB, MLB, NBA, UFC, Golf)
- ✅ Import scripts for all 6 sports
- ✅ Master script to run all imports
- ✅ Comprehensive documentation

## Step 1: Create Database Tables (5 minutes)

**IMPORTANT:** You need to manually create the tables in Supabase first.

### Instructions:

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/abglcmahihbmglkbolir/sql/new

2. **Copy the Migration SQL**
   - Open file: `supabase/migrations/20250104000001_sports_tables.sql`
   - Copy ALL the contents (Ctrl+A, Ctrl+C)

3. **Execute in Supabase**
   - Paste into the SQL Editor
   - Click "Run" button
   - Wait for "Success" message

4. **Verify Tables Created**
   ```bash
   node verify-tables.mjs
   ```
   - You should see ✅ for all 20 tables

## Step 2: Run Data Imports (6-10 hours)

Once all tables show ✅, you can start importing:

### Option A: Import All Sports (Recommended)

```bash
node import-all-sports.mjs
```

This will import ALL sports sequentially. Go grab some coffee (or sleep) - it takes 6-10 hours!

### Option B: Import One Sport at a Time

```bash
# Import individually (faster to test)
node import-nfl.mjs    # ~45-60 min
node import-cfb.mjs    # ~2-3 hours
node import-mlb.mjs    # ~2-3 hours
node import-nba.mjs    # ~1-2 hours
node import-ufc.mjs    # ~30-45 min
node import-golf.mjs   # ~30-45 min
```

### Option C: Run in Background

```bash
# Windows
start /B node import-all-sports.mjs > import-log.txt 2>&1

# Or just minimize the terminal and let it run
```

## What Gets Imported

| Sport | Games/Events | Player Stats | Time     |
|-------|-------------|--------------|----------|
| NFL   | ~1,300      | ~50,000      | 45-60m   |
| CFB   | ~8,000      | ~100,000     | 2-3h     |
| MLB   | ~8,000      | ~200,000     | 2-3h     |
| NBA   | ~6,500      | ~150,000     | 1-2h     |
| UFC   | ~250        | ~5,000       | 30-45m   |
| Golf  | ~250        | ~15,000      | 30-45m   |
| **TOTAL** | **~24,300** | **~520,000** | **6-10h** |

## Monitoring Progress

Each script shows real-time progress:

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
...
```

## After Import Completes

Verify data was imported:

```sql
-- In Supabase SQL Editor, run:
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
```

Expected counts:
- NFL: ~1,300 games
- CFB: ~8,000 games
- MLB: ~8,000 games
- NBA: ~6,500 games
- UFC: ~250 fights
- Golf: ~250 tournaments

## Troubleshooting

### Tables Not Found
- Make sure you ran the SQL migration in Supabase (Step 1)
- Run `node verify-tables.mjs` to check

### Import Stops/Hangs
- Press Ctrl+C and restart the script
- Scripts handle duplicates automatically
- You won't lose progress

### Rate Limiting
- Scripts already include delays
- If you hit rate limits, wait 10 minutes and restart

### No Data Showing
- Check Supabase logs for errors
- Verify service role key is correct in .env
- Make sure tables were created successfully

## Files Created

```
supabase/migrations/
  └── 20250104000001_sports_tables.sql   # Database schema

Import Scripts:
  ├── import-nfl.mjs           # NFL data import
  ├── import-cfb.mjs           # College Football import
  ├── import-mlb.mjs           # MLB data import
  ├── import-nba.mjs           # NBA data import
  ├── import-ufc.mjs           # UFC data import
  ├── import-golf.mjs          # Golf data import
  └── import-all-sports.mjs    # Master script

Utilities:
  ├── verify-tables.mjs        # Check if tables exist
  ├── create-tables.mjs        # Auto-create tables (may not work)
  └── apply-migration.mjs      # Auto-apply migration (may not work)

Documentation:
  ├── IMPORT_GUIDE.md          # Detailed import guide
  ├── DATA_SOURCES.md          # API sources and data info
  └── QUICK_START.md           # This file
```

## Next Steps After Import

1. **Verify Data Quality**
   - Check game counts match expectations
   - Spot-check some games for accuracy
   - Look for any null/missing data

2. **Set Up Continuous Updates**
   - Schedule weekly imports for new games
   - Use cron jobs or GitHub Actions

3. **Build Your AI Models**
   - Use the historical data for training
   - Implement prop bet analysis
   - Create predictive models

4. **Optimize Queries**
   - Add additional indexes if needed
   - Create views for common queries
   - Monitor Supabase performance

## Support

If you encounter issues:
1. Check the error messages
2. Review IMPORT_GUIDE.md for detailed troubleshooting
3. Verify Supabase credentials
4. Check API availability

---

**Ready to start?**

1. ✅ Apply the migration (Step 1)
2. ✅ Run `node import-all-sports.mjs`
3. ✅ Wait 6-10 hours
4. ✅ Verify data imported successfully

Let's go! 🚀
