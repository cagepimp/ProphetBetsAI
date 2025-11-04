// ==========================================
// GENERATE-PROPS EDGE FUNCTION
// ==========================================
// Generates player prop recommendations using AI
//
// Usage:
// POST /functions/v1/generate-props
// Body: { "gameId": "401547404", "sport": "NBA", "playerIds": ["2544"] }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  getSupabaseClient,
  getGames,
  getPlayers,
  logEvent,
} from '../_shared/supabase-client.ts';
import { analyzePlayerProps } from '../_shared/openai-client.ts';
import { GeneratePropsInput, GeneratePropsOutput, PlayerProp } from '../_shared/types.ts';

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
    const input: GeneratePropsInput = await req.json();

    await logEvent('generate-props', 'info', 'Starting prop generation', input);

    let games = [];
    let players = [];

    // Get game(s)
    if (input.gameId) {
      games = await getGames({ gameId: input.gameId });
    } else if (input.sport) {
      games = await getGames({ sport: input.sport, status: 'scheduled' });
      // Limit to next 10 games to avoid overwhelming the system
      games = games.slice(0, 10);
    }

    if (games.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No games found matching criteria' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating props for ${games.length} games`);

    const generatedProps: PlayerProp[] = [];
    const errors: string[] = [];

    for (const game of games) {
      try {
        // Get players for both teams
        let gamePlayers = [];

        if (input.playerIds && input.playerIds.length > 0) {
          // Use specified players
          for (const playerId of input.playerIds) {
            const playerData = await getPlayers({ playerId });
            if (playerData.length > 0) {
              gamePlayers.push(playerData[0]);
            }
          }
        } else {
          // Get key players from both teams
          const homeTeamPlayers = await getPlayers({
            teamId: game.home_team_id,
            status: 'active',
          });
          const awayTeamPlayers = await getPlayers({
            teamId: game.away_team_id,
            status: 'active',
          });

          // For now, limit to 5 players per team to manage AI costs
          gamePlayers = [
            ...homeTeamPlayers.slice(0, 5),
            ...awayTeamPlayers.slice(0, 5),
          ];
        }

        console.log(`Analyzing ${gamePlayers.length} players for ${game.away_team} @ ${game.home_team}`);

        // Generate props for each player
        for (const player of gamePlayers) {
          try {
            // Get player stats (placeholder - implement actual stats fetching)
            const playerStats = await getPlayerStats(player.id, game.sport);
            const recentGames = await getPlayerRecentGames(player.id, 5);

            // Run AI analysis
            console.log(`Analyzing props for ${player.name}...`);
            const analysis = await analyzePlayerProps(
              game,
              player,
              playerStats,
              recentGames
            );

            // Store each prop recommendation
            for (const prop of analysis.props) {
              const propId = crypto.randomUUID();

              const playerProp: PlayerProp = {
                id: propId,
                game_id: game.id,
                player_id: player.id,
                player_name: player.name,
                team: game.home_team_id === player.team_id ? game.home_team : game.away_team,
                sport: game.sport,
                prop_type: prop.prop_type,
                line: prop.line,
                odds_over: -110, // Default odds, should be fetched from odds API
                odds_under: -110,
                recommendation: prop.recommendation,
                confidence: prop.confidence,
                analysis: {
                  reasoning: prop.reasoning,
                  player_stats: playerStats,
                  recent_performance: recentGames,
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };

              // Insert into database
              const supabase = getSupabaseClient();
              await supabase.from('player_props').insert(playerProp);

              generatedProps.push(playerProp);

              console.log(`Generated ${prop.prop_type} prop for ${player.name}: ${prop.recommendation} ${prop.line}`);
            }

            // Rate limiting for OpenAI API
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } catch (playerErr) {
            console.error(`Failed to generate props for ${player.name}:`, playerErr);
            errors.push(`${player.name}: ${playerErr.message}`);
          }
        }
      } catch (gameErr) {
        console.error(`Failed to process game ${game.id}:`, gameErr);
        errors.push(`Game ${game.id}: ${gameErr.message}`);
      }
    }

    // Log completion
    await logEvent('generate-props', 'info', 'Completed prop generation', {
      propsGenerated: generatedProps.length,
      gamesProcessed: games.length,
      errors: errors.length,
    });

    // Return response
    const output: GeneratePropsOutput = {
      success: true,
      propsGenerated: generatedProps.length,
      props: generatedProps,
      errors: errors.length > 0 ? errors : undefined,
    };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-props:', error);

    await logEvent('generate-props', 'error', error.message, {
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
 * Get player stats from database
 * Placeholder - implement actual stats fetching
 */
async function getPlayerStats(playerId: string, sport: string): Promise<any> {
  // TODO: Implement actual player stats aggregation
  // Query game_stats table and calculate averages

  return {
    player_id: playerId,
    sport,
    games_played: 0,
    // Add actual stats here
  };
}

/**
 * Get player's recent game performances
 * Placeholder - implement actual game history fetching
 */
async function getPlayerRecentGames(playerId: string, limit: number = 5): Promise<any[]> {
  // TODO: Implement actual recent games fetching
  // Query game_stats table for player's last N games

  return [];
}
