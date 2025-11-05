import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function upsertToSupabase(table, data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (err) {
    console.error(`Error upserting to ${table}:`, err.message);
    return false;
  }
}

async function importGolfPlayer(playerId, playerName, country = '') {
  const playerData = {
    player_id: playerId,
    name: playerName,
    country: country
  };

  await upsertToSupabase('golf_players', playerData);
}

async function importGolfTournamentDetails(tournamentId, season) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/golf/pga/summary?event=${tournamentId}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.competitions || !data.competitions[0]) {
      return;
    }

    const competition = data.competitions[0];
    const competitors = competition.competitors || [];

    for (const competitor of competitors) {
      const playerId = competitor.athlete?.id || competitor.id;
      const playerName = competitor.athlete?.displayName || competitor.displayName || 'Unknown';
      const country = competitor.athlete?.flag?.alt || '';

      // Import player
      await importGolfPlayer(playerId, playerName, country);

      // Import tournament result
      const resultData = {
        tournament_id: tournamentId,
        player_id: playerId,
        final_position: parseInt(competitor.rank) || 999,
        total_score: parseInt(competitor.score) || 0,
        score_to_par: parseInt(competitor.displayScore) || 0,
        prize_money: 0 // ESPN doesn't provide this easily
      };

      await upsertToSupabase('golf_tournament_results', resultData);

      // Import round scores if available
      if (competitor.linescores) {
        for (let roundNum = 0; roundNum < competitor.linescores.length; roundNum++) {
          const roundScore = competitor.linescores[roundNum];

          const scoreData = {
            tournament_id: tournamentId,
            player_id: playerId,
            round_number: roundNum + 1,
            round_score: parseInt(roundScore.displayValue) || 0,
            total_score: parseInt(competitor.score) || 0,
            position: parseInt(competitor.rank) || 999,
            strokes_gained_putting: 0,
            strokes_gained_total: 0,
            fairways_hit: 0,
            greens_in_regulation: 0
          };

          await upsertToSupabase('golf_scores', scoreData);
        }
      }
    }

    await delay(200);
  } catch (err) {
    console.error(`Error importing tournament details for ${tournamentId}:`, err.message);
  }
}

async function importGolfTournamentsForDate(date, season) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?dates=${date}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.events || data.events.length === 0) {
      return 0;
    }

    let count = 0;

    for (const event of data.events) {
      const tournamentData = {
        tournament_id: event.id,
        tournament_name: event.name,
        season: season,
        start_date: event.date.split('T')[0],
        end_date: event.date.split('T')[0], // Will be updated with actual end date if available
        course_name: event.competitions?.[0]?.venue?.fullName || '',
        location: event.competitions?.[0]?.venue?.address?.city || '',
        purse: 0, // ESPN doesn't provide this easily
        tour: 'PGA'
      };

      if (await upsertToSupabase('golf_tournaments', tournamentData)) {
        console.log(`✅ ${date}: ${event.name}`);
        count++;

        // Import tournament details if event is completed
        if (event.status?.type?.completed) {
          await importGolfTournamentDetails(event.id, season);
        }
      }

      await delay(300);
    }

    return count;
  } catch (err) {
    console.error(`Error importing tournaments for ${date}:`, err.message);
    return 0;
  }
}

async function importGolfYear(year) {
  console.log(`\n⛳ Importing Golf ${year}...`);
  let totalTournaments = 0;

  // PGA Tour season runs roughly January to September
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
    // Check weekly since tournaments typically last 4 days
    const dateStr = d.toISOString().split('T')[0].replace(/-/g, '');
    const count = await importGolfTournamentsForDate(dateStr, year);
    totalTournaments += count;
    await delay(200);
  }

  console.log(`\n✅ ${year} Complete: ${totalTournaments} tournaments imported`);
  return totalTournaments;
}

async function main() {
  console.log('⛳ GOLF DATA IMPORT SCRIPT\n');
  console.log('========================================\n');

  // Import years from 2020 to 2024
  let grandTotal = 0;
  for (let year = 2020; year <= 2024; year++) {
    const total = await importGolfYear(year);
    grandTotal += total;
    await delay(1000);
  }

  console.log('\n========================================');
  console.log(`🎉 COMPLETE! Total tournaments imported: ${grandTotal}`);
  console.log('========================================\n');
}

main().catch(console.error);
