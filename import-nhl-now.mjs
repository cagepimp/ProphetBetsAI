import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

async function go() {
  console.log('🏒 IMPORTING NHL DATA TO SUPABASE...\n');

  const seasons = [2019, 2020, 2021, 2022, 2023];
  let total = 0;

  for (const season of seasons) {
    console.log(`\n📅 Season ${season}-${season+1}`);

    const start = new Date(`${season}-10-01`);
    const end = new Date(`${season+1}-06-30`);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const date = d.toISOString().split('T')[0];

      try {
        const res = await fetch(`https://api-web.nhle.com/v1/schedule/${date}`);
        const data = await res.json();

        if (data.gameWeek) {
          for (const week of data.gameWeek) {
            for (const game of week.games || []) {
              const homeTeam = game.homeTeam.abbrev;
              const awayTeam = game.awayTeam.abbrev;
              const homeScore = game.homeTeam.score || 0;
              const awayScore = game.awayTeam.score || 0;

              const gameData = {
                external_id: String(game.id),
                sport: 'NHL',
                season: season,
                game_date: game.startTimeUTC,
                home_team: homeTeam,
                away_team: awayTeam,
                home_score: homeScore,
                away_score: awayScore,
                winner: homeScore > awayScore ? homeTeam : awayScore > homeScore ? awayTeam : 'TIE',
                verified: game.gameState === 'OFF' || game.gameState === 'FINAL'
              };

              const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/historical_games`, {
                method: 'POST',
                headers: {
                  'apikey': SUPABASE_KEY,
                  'Authorization': `Bearer ${SUPABASE_KEY}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'resolution=ignore-duplicates'
                },
                body: JSON.stringify(gameData)
              });

              if (insertRes.ok) {
                console.log(`✅ ${date}: ${awayTeam}@${homeTeam} ${awayScore}-${homeScore}`);
                total++;
              }
            }
          }
        }
      } catch (err) {
        // Skip errors
      }

      await new Promise(r => setTimeout(r, 50));
    }
  }

  console.log(`\n🎉 DONE! Imported ${total} games`);
}

go();
