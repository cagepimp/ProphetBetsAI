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

async function importMLBTeams() {
  console.log('\n📋 Importing MLB Teams...');

  try {
    const res = await fetch('https://statsapi.mlb.com/api/v1/teams?sportId=1');
    const data = await res.json();

    for (const team of data.teams) {
      if (!team.active) continue;

      const teamData = {
        team_id: String(team.id),
        name: team.name,
        abbreviation: team.abbreviation,
        city: team.locationName,
        league: team.league?.name,
        division: team.division?.name
      };

      await upsertToSupabase('mlb_teams', teamData);
      console.log(`✅ ${team.abbreviation} - ${team.name}`);
    }

    console.log('✅ MLB teams imported successfully');
  } catch (err) {
    console.error('Error importing MLB teams:', err.message);
  }
}

async function importMLBGameStats(gamePk, homeTeamId, awayTeamId) {
  try {
    const url = `https://statsapi.mlb.com/api/v1/game/${gamePk}/boxscore`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.teams) return;

    // Process both home and away teams
    for (const side of ['home', 'away']) {
      const teamData = data.teams[side];
      const teamId = String(teamData.team.id);

      // Batting stats
      if (teamData.batters) {
        for (const playerId of teamData.batters) {
          const playerStats = teamData.players[`ID${playerId}`];
          if (!playerStats || !playerStats.stats.batting) continue;

          const batting = playerStats.stats.batting;
          const playerData = {
            game_id: String(gamePk),
            player_id: String(playerId),
            player_name: playerStats.person.fullName,
            team_id: teamId,
            position: playerStats.position?.abbreviation,
            at_bats: batting.atBats || 0,
            runs: batting.runs || 0,
            hits: batting.hits || 0,
            doubles: batting.doubles || 0,
            triples: batting.triples || 0,
            home_runs: batting.homeRuns || 0,
            rbi: batting.rbi || 0,
            walks: batting.baseOnBalls || 0,
            strikeouts: batting.strikeOuts || 0,
            stolen_bases: batting.stolenBases || 0,
            batting_average: parseFloat(batting.avg) || 0
          };

          await upsertToSupabase('mlb_player_stats', playerData);
        }
      }

      // Pitching stats
      if (teamData.pitchers) {
        for (const playerId of teamData.pitchers) {
          const playerStats = teamData.players[`ID${playerId}`];
          if (!playerStats || !playerStats.stats.pitching) continue;

          const pitching = playerStats.stats.pitching;
          const playerData = {
            game_id: String(gamePk),
            player_id: String(playerId),
            player_name: playerStats.person.fullName,
            team_id: teamId,
            position: 'P',
            innings_pitched: parseFloat(pitching.inningsPitched) || 0,
            pitches_thrown: pitching.numberOfPitches || 0,
            strikes: pitching.strikes || 0,
            hits_allowed: pitching.hits || 0,
            runs_allowed: pitching.runs || 0,
            earned_runs: pitching.earnedRuns || 0,
            walks_allowed: pitching.baseOnBalls || 0,
            strikeouts_pitched: pitching.strikeOuts || 0,
            home_runs_allowed: pitching.homeRuns || 0,
            era: parseFloat(pitching.era) || 0
          };

          await upsertToSupabase('mlb_player_stats', playerData);
        }
      }
    }

    await delay(100);
  } catch (err) {
    console.error(`Error importing stats for game ${gamePk}:`, err.message);
  }
}

async function importMLBGamesForDate(date) {
  try {
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.dates || data.dates.length === 0) {
      return 0;
    }

    let count = 0;

    for (const dateData of data.dates) {
      for (const game of dateData.games) {
        const homeTeam = game.teams.home;
        const awayTeam = game.teams.away;

        const gameData = {
          game_id: String(game.gamePk),
          season: game.season,
          game_date: game.gameDate,
          home_team_id: String(homeTeam.team.id),
          away_team_id: String(awayTeam.team.id),
          home_score: homeTeam.score || 0,
          away_score: awayTeam.score || 0,
          innings: game.scheduledInnings || 9,
          status: game.status.detailedState,
          venue: game.venue?.name,
          game_type: game.gameType === 'R' ? 'regular' : game.gameType === 'P' ? 'playoff' : game.gameType === 'W' ? 'world_series' : 'other'
        };

        if (await upsertToSupabase('mlb_games', gameData)) {
          console.log(`✅ ${date}: ${awayTeam.team.abbreviation}@${homeTeam.team.abbreviation} ${gameData.away_score}-${gameData.home_score}`);
          count++;

          // Import player stats if game is final
          if (game.status.codedGameState === 'F') {
            await importMLBGameStats(game.gamePk, homeTeam.team.id, awayTeam.team.id);
          }
        }

        await delay(100);
      }
    }

    return count;
  } catch (err) {
    console.error(`Error importing games for ${date}:`, err.message);
    return 0;
  }
}

async function importMLBSeason(year) {
  console.log(`\n⚾ Importing MLB ${year} Season...`);
  let totalGames = 0;

  // MLB season runs from April to October
  const startDate = new Date(`${year}-03-01`);
  const endDate = new Date(`${year}-11-30`);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const count = await importMLBGamesForDate(dateStr);
    totalGames += count;
    await delay(100);
  }

  console.log(`\n✅ ${year} Season Complete: ${totalGames} games imported`);
  return totalGames;
}

async function main() {
  console.log('⚾ MLB DATA IMPORT SCRIPT\n');
  console.log('========================================\n');

  // Import teams first
  await importMLBTeams();
  await delay(1000);

  // Import seasons from 2020 to 2024
  let grandTotal = 0;
  for (let year = 2020; year <= 2024; year++) {
    const total = await importMLBSeason(year);
    grandTotal += total;
    await delay(1000);
  }

  console.log('\n========================================');
  console.log(`🎉 COMPLETE! Total games imported: ${grandTotal}`);
  console.log('========================================\n');
}

main().catch(console.error);
