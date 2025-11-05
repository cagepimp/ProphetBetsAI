#!/usr/bin/env node

/**
 * Direct Edge Function Deployment Script
 * Deploys functions to Supabase using Management API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_REF = 'abglcmahihbmglkbolir';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiZ2xjbWFoaWhibWdsa2JvbGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA3ODYyMSwiZXhwIjoyMDc3NjU0NjIxfQ.Ot1R50mLuVb-Byo0Rg83I4vMa3vMeTMbQmnWdWmfKBM';

const functions = [
  'populate-games',
  'fetch-odds',
  'run-analyzer',
  'sync-rosters',
  'generate-props',
  'update-results',
  'fetch-injuries'
];

console.log('==============================================');
console.log('  SUPABASE EDGE FUNCTIONS DEPLOYMENT');
console.log('==============================================\n');

console.log('⚠️  IMPORTANT:');
console.log('Supabase Edge Functions require CLI deployment with personal access token.');
console.log('Service role key cannot be used for function deployment.\n');

console.log('📋 Functions found:');
functions.forEach((fn, i) => {
  const funcPath = path.join(__dirname, 'supabase', 'functions', fn, 'index.ts');
  const exists = fs.existsSync(funcPath);
  console.log(`  ${i + 1}. ${fn} ${exists ? '✓' : '✗'}`);
});

console.log('\n🔧 TO DEPLOY FUNCTIONS:\n');
console.log('OPTION 1: Manual Deployment (Recommended)');
console.log('------------------------------------------');
console.log('1. Go to: https://supabase.com/dashboard');
console.log('2. Select project: abglcmahihbmglkbolir');
console.log('3. Navigate to: Edge Functions');
console.log('4. For each function, copy the code from supabase/functions/[name]/index.ts');
console.log('5. Create new function and paste the code');
console.log('6. Click Deploy\n');

console.log('OPTION 2: CLI Deployment with Personal Access Token');
console.log('----------------------------------------------------');
console.log('1. Get your personal access token:');
console.log('   https://supabase.com/dashboard/account/tokens');
console.log('2. Set it: export SUPABASE_ACCESS_TOKEN=sbp_...');
console.log('3. Run: npx supabase functions deploy [function-name]');
console.log('   Example: npx supabase functions deploy populate-games --project-ref abglcmahihbmglkbolir --no-verify-jwt\n');

console.log('OPTION 3: Upload via Dashboard (Fastest)');
console.log('------------------------------------------');
console.log('1. Go to https://supabase.com/dashboard/project/abglcmahihbmglkbolir/functions');
console.log('2. Click "Create a new function"');
console.log('3. Upload the entire supabase/functions folder as a zip\n');

console.log('📂 Function Locations:');
functions.forEach(fn => {
  console.log(`  ./supabase/functions/${fn}/index.ts`);
});

console.log('\n==============================================');
console.log('Note: Functions are already coded and ready.');
console.log('They just need to be uploaded to Supabase.');
console.log('==============================================\n');
