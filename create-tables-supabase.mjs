import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🚀 Creating Sports Tables in Supabase\n');

// Read the migration SQL
const migrationSQL = readFileSync('./supabase/migrations/20250104000001_sports_tables.sql', 'utf8');

console.log('📝 Migration SQL loaded');
console.log('📄 Total characters:', migrationSQL.length);
console.log('\n🔧 Note: Supabase JS client doesn\'t support direct SQL execution.');
console.log('You need to run this SQL in the Supabase Dashboard.\n');

const projectRef = SUPABASE_URL?.match(/https:\/\/(.+)\.supabase\.co/)?.[1];

console.log('============================================');
console.log('📋 INSTRUCTIONS TO CREATE TABLES:');
console.log('============================================\n');
console.log('1. Go to your Supabase Dashboard SQL Editor:');
console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
console.log('2. Copy ALL the SQL from this file:');
console.log('   supabase/migrations/20250104000001_sports_tables.sql\n');
console.log('3. Paste it into the SQL Editor\n');
console.log('4. Click the "Run" button (or press Cmd/Ctrl + Enter)\n');
console.log('5. Wait for confirmation that all statements executed\n');
console.log('6. Then come back and run: node verify-tables.mjs\n');
console.log('============================================\n');

// Let's try to at least test the connection
async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n');

  try {
    const { data, error } = await supabase.from('nfl_teams').select('count', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('relation "public.nfl_teams" does not exist') ||
          error.message.includes('does not exist')) {
        console.log('⚠️  Tables do not exist yet. Please run the SQL migration above.\n');
        return false;
      }
      console.log('❌ Error:', error.message, '\n');
      return false;
    }

    console.log('✅ Connection successful!');
    console.log('✅ Tables appear to exist!\n');
    console.log('Run: node verify-tables.mjs to check all tables\n');
    return true;
  } catch (err) {
    console.log('❌ Connection error:', err.message, '\n');
    return false;
  }
}

testConnection();
