/**
 * Test ProphetBetsAI Edge Functions
 *
 * Usage: node test-functions.mjs
 */

import fs from 'fs';

// Read .env file manually
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env file!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('🚀 Testing ProphetBetsAI Edge Functions\n');
console.log(`📍 URL: ${SUPABASE_URL}`);
console.log(`🔑 Key: ${SUPABASE_ANON_KEY.substring(0, 30)}...\n`);

/**
 * Call an Edge Function
 */
async function callFunction(name, payload) {
  const url = `${SUPABASE_URL}/functions/v1/${name}`;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔵 Testing: ${name}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`📤 Payload:`, JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    console.log(`\n📥 Response (${response.status}):`);

    try {
      const data = JSON.parse(text);
      console.log(JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error(`❌ Error: ${data.error || 'Unknown error'}`);
        return { success: false, error: data };
      }

      console.log(`✅ Success!`);
      return { success: true, data };

    } catch (e) {
      console.log(text);
      return { success: false, error: text };
    }

  } catch (error) {
    console.error(`❌ Network error:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Run tests
 */
async function runTests() {
  const results = [];

  // Test 1: populate-games (NFL)
  const nflResult = await callFunction('populate-games', {
    sport: 'NFL',
    forceRefresh: true
  });
  results.push({ test: 'populate-games (NFL)', ...nflResult });

  await new Promise(r => setTimeout(r, 2000));

  // Test 2: populate-games (NBA)
  const nbaResult = await callFunction('populate-games', {
    sport: 'NBA'
  });
  results.push({ test: 'populate-games (NBA)', ...nbaResult });

  await new Promise(r => setTimeout(r, 2000));

  // Test 3: fetch-odds (NFL)
  const oddsResult = await callFunction('fetch-odds', {
    sport: 'NFL',
    markets: ['h2h', 'spreads', 'totals']
  });
  results.push({ test: 'fetch-odds (NFL)', ...oddsResult });

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.test}`);
  });

  console.log(`\n✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}\n`);

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED - Check logs above\n');
  }
}

// Run
runTests().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
