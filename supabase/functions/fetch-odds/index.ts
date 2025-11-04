// ==========================================
// FETCH-ODDS EDGE FUNCTION
// ==========================================
// Fetches betting odds from The Odds API and updates games
//
// Usage:
// POST /functions/v1/fetch-odds
// Body: { "sport": "NFL", "markets": ["h2h", "spreads", "totals"], "bookmakers": ["draftkings", "fanduel"] }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  getSupabaseClient,
  getGames,
  upsertGame,
  logEvent,
} from '../_shared/supabase-client.ts';
import {
  fetchOdds,
  parseOddsToMarkets,
  matchGameByTeams,
} from '../_shared/odds-api.ts';
import {
  FetchOddsInput,
  FetchOddsOutput,
} from '../_shared/types.ts';

/**
 * CORS headers
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Main handler
 */
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse input
    const input: FetchOddsInput = await req.json();

    if (!input.sport) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: sport' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      sport,
      markets = ['h2h', 'spreads', 'totals'],
      bookmakers,
      regions = ['us'],
    } = input;

    await logEvent('fetch-odds', 'info', `Starting odds fetch for ${sport}`, {
      sport,
      markets,
      bookmakers,
    });

    // Fetch odds from The Odds API
    console.log(`Fetching odds for ${sport}...`);
    const oddsGames = await fetchOdds(sport, markets, bookmakers, regions);

    console.log(`Fetched odds for ${oddsGames.length} games`);

    // Get existing games from database
    const dbGames = await getGames({
      sport,
      status: 'scheduled', // Only update scheduled games
    });

    console.log(`Found ${dbGames.length} scheduled games in database`);

    let oddsUpdated = 0;
    let gamesProcessed = 0;
    const errors: string[] = [];

    // Match odds to database games
    for (const dbGame of dbGames) {
      try {
        // Find matching odds game
        const oddsGame = matchGameByTeams(
          dbGame.home_team,
          dbGame.away_team,
          oddsGames
        );

        if (!oddsGame) {
          console.log(`No odds found for ${dbGame.away_team} @ ${dbGame.home_team}`);
          continue;
        }

        // Parse odds to our Markets format
        const markets = parseOddsToMarkets(oddsGame);

        // Update game with odds
        await upsertGame({
          ...dbGame,
          markets,
          last_updated: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        oddsUpdated++;
        gamesProcessed++;

        console.log(`Updated odds for ${dbGame.away_team} @ ${dbGame.home_team}`);

        // Store odds history (optional, for tracking line movement)
        try {
          const supabase = getSupabaseClient();
          await supabase.from('historical_odds').insert({
            game_id: dbGame.id,
            sport: dbGame.sport,
            odds_data: markets,
            bookmakers: Object.keys(markets.moneyline || {}),
            timestamp: new Date().toISOString(),
          });
        } catch (histErr) {
          console.warn('Failed to store historical odds:', histErr.message);
        }
      } catch (err) {
        const errorMsg = `Failed to process odds for game ${dbGame.id}: ${err.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // Log completion
    await logEvent('fetch-odds', 'info', `Completed odds fetch for ${sport}`, {
      oddsUpdated,
      gamesProcessed,
      errors: errors.length,
    });

    // Return response
    const output: FetchOddsOutput = {
      success: true,
      oddsUpdated,
      gamesProcessed,
      errors: errors.length > 0 ? errors : undefined,
    };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-odds:', error);

    await logEvent('fetch-odds', 'error', error.message, {
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
