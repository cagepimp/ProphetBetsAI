import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createTables() {
  console.log('🚀 Creating sports tables in Supabase...\n');

  try {
    // Read the migration file
    const sql = readFileSync('./supabase/migrations/20250104000001_sports_tables.sql', 'utf8');

    console.log('📤 Executing SQL migration...\n');

    // Execute the entire SQL file
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('❌ Error executing migration:', error.message);
      console.log('\n📝 Please manually apply the migration:');
      console.log('1. Go to https://supabase.com/dashboard/project/abglcmahihbmglkbolir/sql/new');
      console.log('2. Copy the contents of: supabase/migrations/20250104000001_sports_tables.sql');
      console.log('3. Paste into the editor and click "Run"\n');
      return false;
    }

    console.log('✅ Migration executed successfully!\n');
    console.log('🔍 Verifying tables...\n');

    // Verify some key tables
    const { data: nflTeams, error: nflError } = await supabase.from('nfl_teams').select('*').limit(1);
    const { data: mlbTeams, error: mlbError } = await supabase.from('mlb_teams').select('*').limit(1);
    const { data: nbaTeams, error: nbaError } = await supabase.from('nba_teams').select('*').limit(1);

    if (!nflError && !mlbError && !nbaError) {
      console.log('✅ All tables created successfully!\n');
      console.log('You can now run: node import-all-sports.mjs\n');
      return true;
    } else {
      console.log('⚠️  Tables may not have been created properly.');
      console.log('Please verify manually in Supabase Dashboard.\n');
      return false;
    }
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    console.log('\n📝 Manual setup required:');
    console.log('1. Go to https://supabase.com/dashboard/project/abglcmahihbmglkbolir/sql/new');
    console.log('2. Copy the contents of: supabase/migrations/20250104000001_sports_tables.sql');
    console.log('3. Paste into the editor and click "Run"\n');
    return false;
  }
}

createTables();
