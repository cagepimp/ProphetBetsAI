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

async function importNBATeams() {
  console.log('\n📋 Importing NBA Teams...');

  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams');
    const data = await res.json();

    for (const team of data.sports[0].leagues[0].teams) {
      const t = team.team;
      const teamData = {
        team_id: t.id,
        name: t.displayName,
        abbreviation: t.abbreviation,
        city: t.location,
        conference: t.groups?.find(g => g.isConference)?.name,
        division: t.groups?.find(g => !g.isConference)?.name
      };

      await upsertToSupabase('nba_teams', teamData);
      console.log(`✅ ${t.abbreviation} - ${t.displayName}`);
    }

    console.log('✅ NBA teams imported successfully');
  } catch (err) {
    console.error('Error importing NBA teams:', err.message);
  }
}

async function importNBAGameStats(gameId, homeTeamId, awayTeamId) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.boxscore || !data.boxscore.players) {
      return;
    }

    for (const teamStats of data.boxscore.players) {
      const teamId = teamStats.team.id;

      for (const player of teamStats.statistics[0].athletes) {
        const stats = {};
        player.stats.forEach((val, idx) => {
          const label = teamStats.statistics[0].labels[idx];
          stats[label] = val;
        });

        const playerData = {
          game_id: gameId,
          player_id: player.athlete.id,
          player_name: player.athlete.displayName,
          team_id: teamId,
          position: player.athlete.position?.abbreviation,
          minutes_played: parseFloat(stats['MIN']) || 0,
          points: parseInt(stats['PTS']) || 0,
          field_goals_made: parseInt(stats['FG']?.split('-')[0]) || 0,
          field_goals_attempted: parseInt(stats['FG']?.split('-')[1]) || 0,
          three_pointers_made: parseInt(stats['3PT']?.split('-')[0]) || 0,
          three_pointers_attempted: parseInt(stats['3PT']?.split('-')[1]) || 0,
          free_throws_made: parseInt(stats['FT']?.split('-')[0]) || 0,
          free_throws_attempted: parseInt(stats['FT']?.split('-')[1]) || 0,
          offensive_rebounds: parseInt(stats['OREB']) || 0,
          defensive_rebounds: parseInt(stats['DREB']) || 0,
          total_rebounds: parseInt(stats['REB']) || 0,
          assists: parseInt(stats['AST']) || 0,
          steals: parseInt(stats['STL']) || 0,
          blocks: parseInt(stats['BLK']) || 0,
          turnovers: parseInt(stats['TO']) || 0,
          personal_fouls: parseInt(stats['PF']) || 0,
          plus_minus: parseInt(stats['+/-']) || 0
        };

        await upsertToSupabase('nba_player_stats', playerData);
      }
    }

    await delay(100);
  } catch (err) {
    console.error(`Error importing stats for game ${gameId}:`, err.message);
  }
}

async function importNBAGamesForDate(date) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.events || data.events.length === 0) {
      return 0;
    }

    let count = 0;

    for (const event of data.events) {
      const game = event.competitions[0];
      const homeTeam = game.competitors.find(c => c.homeAway === 'home');
      const awayTeam = game.competitors.find(c => c.homeAway === 'away');

      const gameData = {
        game_id: event.id,
        season: event.season?.year || parseInt(date.substring(0, 4)),
        game_date: event.date,
        home_team_id: homeTeam.team.id,
        away_team_id: awayTeam.team.id,
        home_score: parseInt(homeTeam.score) || 0,
        away_score: parseInt(awayTeam.score) || 0,
        status: event.status.type.name,
        venue: game.venue?.fullName,
        game_type: event.season?.type === 1 ? 'preseason' : event.season?.type === 2 ? 'regular' : event.season?.type === 3 ? 'playoff' : 'regular'
      };

      if (await upsertToSupabase('nba_games', gameData)) {
        console.log(`✅ ${date}: ${awayTeam.team.abbreviation}@${homeTeam.team.abbreviation} ${gameData.away_score}-${gameData.home_score}`);
        count++;

        // Import player stats if game is finished
        if (event.status.type.completed) {
          await importNBAGameStats(event.id, homeTeam.team.id, awayTeam.team.id);
        }
      }

      await delay(100);
    }

    return count;
  } catch (err) {
    console.error(`Error importing games for ${date}:`, err.message);
    return 0;
  }
}

async function importNBASeason(startYear) {
  // NBA season spans two years, e.g., 2019-20 season
  const endYear = startYear + 1;
  console.log(`\n🏀 Importing NBA ${startYear}-${endYear} Season...`);
  let totalGames = 0;

  // NBA season runs from October to June (next year)
  const startDate = new Date(`${startYear}-10-01`);
  const endDate = new Date(`${endYear}-06-30`);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0].replace(/-/g, '');
    const count = await importNBAGamesForDate(dateStr);
    totalGames += count;
    await delay(100);
  }

  console.log(`\n✅ ${startYear}-${endYear} Season Complete: ${totalGames} games imported`);
  return totalGames;
}

async function main() {
  console.log('🏀 NBA DATA IMPORT SCRIPT\n');
  console.log('========================================\n');

  // Import teams first
  await importNBATeams();
  await delay(1000);

  // Import seasons from 2019-20 to 2024-25
  let grandTotal = 0;
  for (let year = 2019; year <= 2024; year++) {
    const total = await importNBASeason(year);
    grandTotal += total;
    await delay(1000);
  }

  console.log('\n========================================');
  console.log(`🎉 COMPLETE! Total games imported: ${grandTotal}`);
  console.log('========================================\n');
}

main().catch(console.error);
