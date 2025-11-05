import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function importAllNHL() {
  console.log('🏒 IMPORTING 5 YEARS OF NHL DATA...\n');

  const seasons = [2019, 2020, 2021, 2022, 2023];
  let totalGames = 0;
  let inserted = 0;
  let skipped = 0;

  for (const season of seasons) {
    console.log(`\n📅 Season ${season}-${season + 1}`);

    const startDate = new Date(`${season}-10-01`);
    const endDate = new Date(`${season + 1}-06-30`);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const date = d.toISOString().split('T')[0];

      try {
        const res = await fetch(`https://api-web.nhle.com/v1/schedule/${date}`);
        const data = await res.json();

        if (data.gameWeek) {
          for (const week of data.gameWeek) {
            for (const game of (week.games || [])) {
              totalGames++;

              const homeTeam = game.homeTeam.abbrev || game.homeTeam.commonName?.en || 'HOME';
              const awayTeam = game.awayTeam.abbrev || game.awayTeam.commonName?.en || 'AWAY';
              const homeScore = game.homeTeam.score || 0;
              const awayScore = game.awayTeam.score || 0;

              // Check if already exists
              const { data: existing } = await supabase
                .from('games')
                .select('id')
                .eq('external_id', String(game.id))
                .single();

              if (existing) {
                skipped++;
                continue;
              }

              // Insert game
              const { error } = await supabase.from('games').insert({
                external_id: String(game.id),
                sport: 'NHL',
                home_team: homeTeam,
                away_team: awayTeam,
                home_score: homeScore,
                away_score: awayScore,
                game_date: game.startTimeUTC || game.gameDate,
                status: game.gameState === 'OFF' || game.gameState === 'FINAL' ? 'completed' :
                        game.gameState === 'LIVE' ? 'live' : 'scheduled',
                venue: game.venue?.default || '',
                season: season,
                week: null
              });

              if (!error) {
                console.log(`✅ ${date}: ${awayTeam} @ ${homeTeam} (${awayScore}-${homeScore})`);
                inserted++;
              } else if (!error.message.includes('duplicate')) {
                console.log(`⚠️  Error: ${error.message}`);
              } else {
                skipped++;
              }
            }
          }
        }
      } catch (err) {
        // Silent skip
      }

      // Small delay for rate limiting
      await new Promise(r => setTimeout(r, 50));
    }

    console.log(`   ${season}: ${inserted - (totalGames - skipped - inserted)} new games added`);
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎉 IMPORT COMPLETE!`);
  console.log(`   Total found: ${totalGames}`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped (duplicates): ${skipped}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

importAllNHL().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
