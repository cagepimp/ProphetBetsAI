import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_KEY ? '***' + SUPABASE_KEY.slice(-10) : 'NOT SET');
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    // Try to query an existing table
    const { data, error } = await supabase
      .from('historical_games')
      .select('*')
      .limit(1);

    if (error) {
      console.log('⚠️  historical_games table:', error.message);
    } else {
      console.log('✅ Connection successful! Found historical_games table');
      console.log('   Sample count:', data?.length || 0);
    }

    // Try creating a test table
    console.log('\n🧪 Testing table creation ability...');
    const { error: createError } = await supabase.rpc('exec', {
      sql: 'SELECT 1 as test'
    });

    if (createError) {
      console.log('⚠️  Direct SQL execution not available:', createError.message);
      console.log('\n📝 You will need to manually run the migration SQL in Supabase Dashboard.');
    } else {
      console.log('✅ Direct SQL execution available');
    }

  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('NEXT STEPS:');
  console.log('='.repeat(60));
  console.log('\n1. Open Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/abglcmahihbmglkbolir/sql/new');
  console.log('\n2. Copy the file: supabase/migrations/20250104000001_sports_tables.sql');
  console.log('\n3. Paste into SQL Editor and click "Run"');
  console.log('\n4. Then run: node verify-tables.mjs');
  console.log('\n5. Finally run: node import-all-sports.mjs\n');
}

testConnection();
