// ==========================================
// POPULATE-GAMES EDGE FUNCTION
// ==========================================
// Fetches game schedules from ESPN and stores them in the database
//
// Usage:
// POST /functions/v1/populate-games
// Body: { "sport": "NFL", "season": 2024, "week": 10, "forceRefresh": false }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  getSupabaseClient,
  upsertGame,
  getGames,
  logEvent,
} from '../_shared/supabase-client.ts';
import {
  fetchSchedule,
  fetchScoreboard,
  fetchCurrentWeek,
  parseESPNGame,
  fetchGamesInRange,
} from '../_shared/espn-api.ts';
import {
  Sport,
  PopulateGamesInput,
  PopulateGamesOutput,
} from '../_shared/types.ts';

/**
 * CORS headers for the response
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Main handler for populate-games function
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const input: PopulateGamesInput = await req.json();

    // Validate input
    if (!input.sport) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: sport' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { sport, season, week, forceRefresh } = input;

    await logEvent('populate-games', 'info', `Starting population for ${sport}`, {
      sport,
      season,
      week,
      forceRefresh,
    });

    // Fetch games from ESPN
    console.log(`Fetching ${sport} games...`);
    let espnGames = [];

    if (sport === 'NFL' || sport === 'CFB') {
      // For NFL and CFB, use week-based fetching
      if (season && week) {
        espnGames = await fetchSchedule(sport, season, week);
      } else {
        // Fetch current week
        espnGames = await fetchCurrentWeek(sport);
      }
    } else {
      // For other sports, fetch by date range
      const today = new Date();
      const startDate = formatDateForESPN(today);

      // Fetch next 14 days
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 14);
      const endDateStr = formatDateForESPN(endDate);

      espnGames = await fetchGamesInRange(sport, startDate, endDateStr);
    }

    console.log(`Fetched ${espnGames.length} games from ESPN`);

    // Process and store games
    let gamesCreated = 0;
    let gamesUpdated = 0;
    const errors: string[] = [];

    for (const espnGame of espnGames) {
      try {
        // Parse ESPN game to our format
        const parsedGame = parseESPNGame(espnGame, sport);

        // Check if game already exists
        const existingGames = await getGames({ gameId: parsedGame.id });
        const exists = existingGames.length > 0;

        // Skip if exists and not forcing refresh
        if (exists && !forceRefresh) {
          console.log(`Game ${parsedGame.id} already exists, skipping`);
          continue;
        }

        // Upsert game to database
        await upsertGame({
          ...parsedGame,
          updated_at: new Date().toISOString(),
        });

        if (exists) {
          gamesUpdated++;
        } else {
          gamesCreated++;
        }

        console.log(
          `${exists ? 'Updated' : 'Created'} game: ${parsedGame.away_team} @ ${parsedGame.home_team}`
        );
      } catch (err) {
        const errorMsg = `Failed to process game ${espnGame.id}: ${err.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // Log completion
    await logEvent('populate-games', 'info', `Completed ${sport} population`, {
      gamesCreated,
      gamesUpdated,
      errors: errors.length,
    });

    // Return response
    const output: PopulateGamesOutput = {
      success: true,
      gamesCreated,
      gamesUpdated,
      errors: errors.length > 0 ? errors : undefined,
    };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in populate-games:', error);

    await logEvent('populate-games', 'error', error.message, {
      stack: error.stack,
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Format date for ESPN API (YYYYMMDD)
 */
function formatDateForESPN(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
