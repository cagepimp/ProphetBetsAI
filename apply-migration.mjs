import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function applyMigration() {
  console.log('🚀 Applying Sports Tables Migration...\n');

  try {
    // Read the migration file
    const sql = readFileSync('./supabase/migrations/20250104000001_sports_tables.sql', 'utf8');

    // Split SQL into individual statements (rough split by semicolon)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip pure comments
      if (statement.trim().replace(/[\n\r]/g, '').startsWith('--')) continue;

      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: statement })
        });

        if (res.ok) {
          successCount++;
          // Extract table/index name from statement for logging
          const match = statement.match(/CREATE\s+(?:TABLE|INDEX)[\s\w]*\s+([\w_]+)/i);
          const name = match ? match[1] : `Statement ${i + 1}`;
          console.log(`✅ ${name}`);
        } else {
          const error = await res.text();
          // Only log as error if it's not a "already exists" error
          if (!error.includes('already exists')) {
            console.error(`❌ Statement ${i + 1} failed:`, error);
            errorCount++;
          } else {
            console.log(`⏭️  Skipped (already exists): Statement ${i + 1}`);
          }
        }
      } catch (err) {
        console.error(`❌ Statement ${i + 1} error:`, err.message);
        errorCount++;
      }
    }

    console.log('\n========================================');
    console.log('Migration Complete!');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('========================================\n');

    if (errorCount === 0) {
      console.log('🎉 All tables created successfully! You can now run the import scripts.\n');
      return true;
    } else {
      console.log('⚠️  Some errors occurred. Please check the logs above.\n');
      console.log('💡 Tip: You can also manually run the SQL in Supabase Dashboard > SQL Editor\n');
      return false;
    }
  } catch (err) {
    console.error('Fatal error applying migration:', err.message);
    console.log('\n📝 Manual Migration Instructions:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Open the file: supabase/migrations/20250104000001_sports_tables.sql');
    console.log('4. Copy and paste the entire SQL content');
    console.log('5. Click "Run" to execute\n');
    return false;
  }
}

applyMigration();
