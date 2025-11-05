import pg from 'pg';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

// Construct the Supabase PostgreSQL connection string
// Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
const projectRef = process.env.VITE_SUPABASE_URL?.match(/https:\/\/(.+)\.supabase\.co/)?.[1];

console.log('🚀 Running Sports Tables Migration with PostgreSQL Client\n');

if (!projectRef) {
  console.error('❌ Could not extract project reference from SUPABASE_URL');
  process.exit(1);
}

console.log('📝 To run this migration, you need your database password.');
console.log('Get it from: Supabase Dashboard > Settings > Database > Connection String\n');
console.log('Set it in your .env file as: DATABASE_PASSWORD=your-password-here\n');

const dbPassword = process.env.DATABASE_PASSWORD;

if (!dbPassword) {
  console.log('⚠️  DATABASE_PASSWORD not found in .env');
  console.log('\n📋 Alternative: Run the migration manually in Supabase Dashboard:\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
  console.log('2. Open file: supabase/migrations/20250104000001_sports_tables.sql');
  console.log('3. Copy the entire SQL content');
  console.log('4. Paste into the SQL Editor');
  console.log('5. Click "Run" to execute\n');
  console.log('This will create all tables, indexes, and relationships.\n');
  process.exit(0);
}

const connectionString = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

async function runMigration() {
  const client = new Client({ connectionString });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read the migration file
    const sql = readFileSync('./supabase/migrations/20250104000001_sports_tables.sql', 'utf8');

    console.log('📄 Executing migration SQL...\n');

    await client.query(sql);

    console.log('✅ Migration completed successfully!\n');
    console.log('🎉 All tables, indexes, and relationships created!\n');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.log('\n💡 Tip: Run the SQL manually in Supabase Dashboard > SQL Editor\n');
  } finally {
    await client.end();
  }
}

runMigration();
