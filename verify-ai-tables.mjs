import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const aiTables = [
  'historical_games',
  'historical_predictions',
  'model_versions',
  'model_weights',
  'training_sessions',
  'feature_importance',
  'learning_patterns',
  'accuracy_metrics',
  'line_movement_analysis',
  'injury_impact_analysis',
  'team_trends',
  'model_comparison'
];

async function checkTable(tableName) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    return { exists: res.ok, count: res.headers.get('content-range') };
  } catch {
    return { exists: false, count: null };
  }
}

async function verifyAITables() {
  console.log('🔍 Verifying AI Learning System tables...\n');

  const results = await Promise.all(
    aiTables.map(async (table) => {
      const { exists, count } = await checkTable(table);
      return { table, exists, count };
    })
  );

  let allExist = true;
  const missing = [];

  for (const { table, exists, count } of results) {
    if (exists) {
      const recordCount = count ? count.split('/')[1] : '0';
      console.log(`✅ ${table} (${recordCount} records)`);
    } else {
      console.log(`❌ ${table} - NOT FOUND`);
      missing.push(table);
      allExist = false;
    }
  }

  console.log('\n========================================');

  if (allExist) {
    console.log('✅ All AI Learning System tables exist!');
    console.log('========================================\n');
    console.log('You can now start importing data.\n');
    console.log('Quick import: node import-nhl-now.mjs');
    console.log('Full import: node import-all-sports.mjs\n');
    return true;
  } else {
    console.log('❌ Some AI Learning System tables are missing!');
    console.log('========================================\n');
    console.log('📝 To create these tables:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/abglcmahihbmglkbolir/sql/new');
    console.log('2. Copy contents of: supabase/migrations/20250104000000_ai_learning_system.sql');
    console.log('3. Paste into SQL Editor and click "Run"\n');
    console.log(`Missing tables: ${missing.join(', ')}\n`);
    return false;
  }
}

verifyAITables();
