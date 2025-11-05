import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const requiredTables = [
  'nfl_teams', 'nfl_games', 'nfl_player_stats',
  'cfb_teams', 'cfb_games', 'cfb_player_stats',
  'mlb_teams', 'mlb_games', 'mlb_player_stats',
  'nba_teams', 'nba_games', 'nba_player_stats',
  'ufc_fighters', 'ufc_events', 'ufc_fights', 'ufc_fight_stats',
  'golf_players', 'golf_tournaments', 'golf_scores', 'golf_tournament_results'
];

async function checkTable(tableName) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function verifyTables() {
  console.log('🔍 Verifying database tables...\n');

  const results = await Promise.all(
    requiredTables.map(async (table) => {
      const exists = await checkTable(table);
      return { table, exists };
    })
  );

  let allExist = true;
  const missing = [];

  for (const { table, exists } of results) {
    if (exists) {
      console.log(`✅ ${table}`);
    } else {
      console.log(`❌ ${table} - NOT FOUND`);
      missing.push(table);
      allExist = false;
    }
  }

  console.log('\n========================================');

  if (allExist) {
    console.log('✅ All tables exist! You can proceed with imports.');
    console.log('========================================\n');
    console.log('Run: node import-all-sports.mjs\n');
    return true;
  } else {
    console.log('❌ Some tables are missing!');
    console.log('========================================\n');
    console.log('📝 To create the tables:\n');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to: SQL Editor');
    console.log('3. Click "New Query"');
    console.log('4. Copy the contents of: supabase/migrations/20250104000001_sports_tables.sql');
    console.log('5. Paste into the editor and click "Run"\n');
    console.log(`Missing tables: ${missing.join(', ')}\n`);
    return false;
  }
}

verifyTables();
