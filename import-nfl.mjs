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

async function importNFLTeams() {
  console.log('\n📋 Importing NFL Teams...');

  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams');
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

      await upsertToSupabase('nfl_teams', teamData);
      console.log(`✅ ${t.abbreviation} - ${t.displayName}`);
    }

    console.log('✅ NFL teams imported successfully');
  } catch (err) {
    console.error('Error importing NFL teams:', err.message);
  }
}

async function importNFLGamesForWeek(season, seasonType, week) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${season}&seasontype=${seasonType}&week=${week}`;
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
        season: season,
        week: week,
        game_date: event.date,
        home_team_id: homeTeam.team.id,
        away_team_id: awayTeam.team.id,
        home_score: parseInt(homeTeam.score) || 0,
        away_score: parseInt(awayTeam.score) || 0,
        status: event.status.type.name,
        venue: game.venue?.fullName,
        game_type: seasonType === 1 ? 'preseason' : seasonType === 2 ? 'regular' : 'playoff'
      };

      if (await upsertToSupabase('nfl_games', gameData)) {
        console.log(`✅ Week ${week}: ${awayTeam.team.abbreviation}@${homeTeam.team.abbreviation} ${gameData.away_score}-${gameData.home_score}`);
        count++;

        // Import player stats if game is finished
        if (event.status.type.completed) {
          await importNFLGameStats(event.id, homeTeam.team.id, awayTeam.team.id);
        }
      }

      await delay(100);
    }

    return count;
  } catch (err) {
    console.error(`Error importing week ${week}:`, err.message);
    return 0;
  }
}

async function importNFLGameStats(gameId, homeTeamId, awayTeamId) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${gameId}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.boxscore || !data.boxscore.players) {
      return;
    }

    for (const teamStats of data.boxscore.players) {
      const teamId = teamStats.team.id;

      for (const statCategory of teamStats.statistics) {
        const categoryName = statCategory.name; // passing, rushing, receiving, defense

        for (const player of statCategory.athletes) {
          const stats = {};
          player.stats.forEach((val, idx) => {
            const label = statCategory.labels[idx];
            stats[label] = val;
          });

          const playerData = {
            game_id: gameId,
            player_id: player.athlete.id,
            player_name: player.athlete.displayName,
            team_id: teamId,
            position: player.athlete.position?.abbreviation
          };

          // Map stats based on category
          if (categoryName === 'passing') {
            playerData.passing_completions = parseInt(stats['C/ATT']?.split('/')[0]) || 0;
            playerData.passing_attempts = parseInt(stats['C/ATT']?.split('/')[1]) || 0;
            playerData.passing_yards = parseInt(stats['YDS']) || 0;
            playerData.passing_touchdowns = parseInt(stats['TD']) || 0;
            playerData.interceptions = parseInt(stats['INT']) || 0;
          } else if (categoryName === 'rushing') {
            playerData.rushing_attempts = parseInt(stats['CAR']) || 0;
            playerData.rushing_yards = parseInt(stats['YDS']) || 0;
            playerData.rushing_touchdowns = parseInt(stats['TD']) || 0;
          } else if (categoryName === 'receiving') {
            playerData.receptions = parseInt(stats['REC']) || 0;
            playerData.receiving_yards = parseInt(stats['YDS']) || 0;
            playerData.receiving_touchdowns = parseInt(stats['TD']) || 0;
            playerData.targets = parseInt(stats['TAR']) || 0;
          } else if (categoryName === 'defensive') {
            playerData.tackles = parseInt(stats['TOT']) || 0;
            playerData.sacks = parseFloat(stats['SACK']) || 0;
          }

          await upsertToSupabase('nfl_player_stats', playerData);
        }
      }
    }

    await delay(100);
  } catch (err) {
    console.error(`Error importing stats for game ${gameId}:`, err.message);
  }
}

async function importNFLSeason(year) {
  console.log(`\n🏈 Importing NFL ${year} Season...`);
  let totalGames = 0;

  // Regular season (18 weeks)
  for (let week = 1; week <= 18; week++) {
    console.log(`\n📅 Week ${week}`);
    const count = await importNFLGamesForWeek(year, 2, week);
    totalGames += count;
    await delay(200);
  }

  // Playoffs
  console.log('\n🏆 Importing Playoffs...');
  for (let week = 1; week <= 5; week++) {
    const count = await importNFLGamesForWeek(year, 3, week);
    totalGames += count;
    await delay(200);
  }

  console.log(`\n✅ ${year} Season Complete: ${totalGames} games imported`);
  return totalGames;
}

async function main() {
  console.log('🏈 NFL DATA IMPORT SCRIPT\n');
  console.log('========================================\n');

  // Import teams first
  await importNFLTeams();
  await delay(1000);

  // Import seasons from 2020 to 2024
  let grandTotal = 0;
  for (let year = 2020; year <= 2024; year++) {
    const total = await importNFLSeason(year);
    grandTotal += total;
    await delay(1000);
  }

  console.log('\n========================================');
  console.log(`🎉 COMPLETE! Total games imported: ${grandTotal}`);
  console.log('========================================\n');
}

main().catch(console.error);
