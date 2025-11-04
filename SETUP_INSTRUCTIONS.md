# ProphetBetAI - Setup Instructions

## 🚀 Quick Start

Your ProphetBetAI application has been migrated from Base44 to Supabase. Follow these steps to get your app running with data.

---

## 1️⃣ Configure Supabase Connection

### Get Your Supabase Keys

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `abglcmahihbmglkbolir`
3. Navigate to **Settings** → **API**
4. Copy the following:
   - **Project URL** (already configured): `https://abglcmahihbmglkbolir.supabase.co`
   - **anon/public key** (under "Project API keys")

### Update Your .env File

1. Open the `.env` file in the root directory
2. Replace `your-anon-key-here` with your actual Supabase anon key:

```bash
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. (Optional) Add your service role key for backend operations:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 2️⃣ Verify Your Database Schema

Your Supabase database should have the following tables:

### Core Tables
- ✅ `teams` - Your existing teams table
- `games` - Game schedules and results
- `players` - Player rosters
- `injuries` - Injury reports
- `player_props` - Player prop bets
- `player_game_stats` - Historical player statistics
- `prediction_history` - AI prediction tracking
- `historical_odds` - Historical odds data
- `line_history` - Line movement tracking

### Check Database Tables

Run this SQL in your Supabase SQL Editor to see all tables:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

### Create Missing Tables

If tables are missing, refer to `/supabase-migration/SUPABASE_SCHEMA.sql` for the complete schema.

---

## 3️⃣ Run the Application

### Install Dependencies (if needed)

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Your app will be available at: **http://localhost:5173**

### Build for Production

```bash
npm run build
```

---

## 4️⃣ Verify Data Connection

1. Open the app in your browser
2. Navigate to any sport page (NFL, NBA, etc.)
3. You should see data from your Supabase database
4. Check the browser console for any errors

### Troubleshooting "No Data" Issues

If you see "No data available":

1. **Check Supabase Key**: Verify your `VITE_SUPABASE_ANON_KEY` is correct
2. **Check Database**: Ensure your `games` table has data
3. **Check Console**: Look for error messages in browser console (F12)
4. **Check RLS Policies**: Supabase Row Level Security might be blocking queries

### Disable RLS for Testing (Optional)

In Supabase SQL Editor, run:

```sql
-- Temporarily disable RLS for testing
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
```

**⚠️ Warning**: Only do this for testing! Re-enable RLS for production.

---

## 5️⃣ API Integration (Optional)

### TheOddsAPI

For live odds data, add your TheOddsAPI key to `.env`:

```bash
ODDS_API_KEY=your-odds-api-key
```

Sign up at: https://the-odds-api.com/

### Other APIs

- **ESPN API**: For schedule data
- **RapidAPI**: For additional sports data

---

## 6️⃣ Deploy to Production

### Environment Variables

When deploying (Vercel, Netlify, etc.), add these environment variables:

```bash
VITE_SUPABASE_URL=https://abglcmahihbmglkbolir.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production
```

### Build Command

```bash
npm run build
```

### Output Directory

```
dist/
```

---

## 📋 Changes Made

### Removed ❌
- `@base44/sdk` dependency removed from package.json
- All Base44 API calls removed
- Base44 authentication replaced with Supabase Auth

### Added ✅
- Direct Supabase client integration
- Supabase helper functions for database queries
- Environment variable configuration
- `.env` file with your Supabase URL

### Files Modified
- `package.json` - Removed Base44 SDK
- `src/api/supabaseClient.js` - Configured for your Supabase instance
- `src/api/entities.js` - Uses Supabase queries
- `src/components/contexts/Base44Context.jsx` - Now uses Supabase Auth
- `.env` - Created with your Supabase URL

---

## 🆘 Need Help?

### Common Issues

**Issue**: "Supabase environment variables not set"
**Solution**: Add `VITE_SUPABASE_ANON_KEY` to your `.env` file

**Issue**: "No games found"
**Solution**:
1. Check if `games` table exists in Supabase
2. Verify table has data: `SELECT * FROM games LIMIT 5;`
3. Check RLS policies

**Issue**: "Unauthorized" or "403" errors
**Solution**: Check your Supabase anon key is correct and RLS policies allow read access

### Database Seeding

To populate your database with initial data, you can:

1. Use the Admin Dev Tools page in the app
2. Run Supabase Edge Functions to fetch from external APIs
3. Import CSV/JSON data via Supabase Dashboard

---

## 🎯 Next Steps

1. ✅ Add your Supabase anon key to `.env`
2. ✅ Start the development server
3. ✅ Verify data loads in the app
4. ✅ Populate your database with sports data
5. ✅ Deploy to production

---

## 📚 Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Schema**: `/supabase-migration/SUPABASE_SCHEMA.sql`
- **Migration Guide**: `/SUPABASE_MIGRATION_COMPLETE.md`
- **Features**: `/FEATURES.md`

---

**Built with ProphetBetAI** 🏆
