// ==========================================
// RUN-ANALYZER EDGE FUNCTION
// ==========================================
// Analyzes games using AI and generates betting predictions
//
// Usage:
// POST /functions/v1/run-analyzer
// Body: { "gameId": "401547404", "sport": "NFL", "analysisDepth": "standard" }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  getSupabaseClient,
  getGames,
  insertPrediction,
  getInjuries,
  logEvent,
} from '../_shared/supabase-client.ts';
import { analyzeGame } from '../_shared/openai-client.ts';
import {
  RunAnalyzerInput,
  RunAnalyzerOutput,
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
    const input: RunAnalyzerInput = await req.json();

    if (!input.gameId || !input.sport) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: gameId, sport' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { gameId, sport, analysisDepth = 'standard' } = input;

    await logEvent('run-analyzer', 'info', `Starting analysis for game ${gameId}`, {
      gameId,
      sport,
      analysisDepth,
    });

    // Get game from database
    const games = await getGames({ gameId });

    if (games.length === 0) {
      return new Response(
        JSON.stringify({ error: `Game ${gameId} not found in database` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const game = games[0];

    console.log(`Analyzing game: ${game.away_team} @ ${game.home_team}`);

    // Check if game has odds
    if (!game.markets || Object.keys(game.markets).length === 0) {
      console.warn('Game has no odds data, analysis may be limited');
    }

    // Get injury reports for both teams
    const injuries = await getInjuries({
      sport,
    });

    const relevantInjuries = injuries.filter(
      (inj) => inj.team === game.home_team || inj.team === game.away_team
    );

    console.log(`Found ${relevantInjuries.length} injury reports`);

    // Get team stats (you can expand this with actual stats from the database)
    const homeTeamStats = await getTeamStats(game.home_team_id || game.home_team, sport);
    const awayTeamStats = await getTeamStats(game.away_team_id || game.away_team, sport);

    // Run AI analysis
    console.log('Running GPT-4 analysis...');
    const analysis = await analyzeGame(
      game,
      homeTeamStats,
      awayTeamStats,
      relevantInjuries,
      game.weather,
      analysisDepth
    );

    console.log('Analysis complete');

    // Determine primary bet type and prediction
    let predictionType: 'moneyline' | 'spread' | 'total' = 'moneyline';
    let predictedWinner: string | undefined;
    let predictedSpread: number | undefined;
    let predictedTotal: number | undefined;
    let recommendedBet: string | undefined;
    let recommendedOdds: number | undefined;
    let stakeSize: number | undefined;

    // Extract primary recommendation
    if (analysis.recommended_bets && analysis.recommended_bets.length > 0) {
      const primaryBet = analysis.recommended_bets[0];

      predictionType = primaryBet.type as any;
      recommendedBet = primaryBet.selection;
      recommendedOdds = primaryBet.odds;

      // Map stake recommendation to size (1-10 scale)
      const stakeMap: Record<string, number> = {
        max: 10,
        medium: 5,
        small: 2,
        avoid: 0,
      };

      stakeSize = stakeMap[primaryBet.stake_recommendation] || 5;
    }

    // Extract predictions
    if (analysis.predictions) {
      predictedWinner = analysis.predictions.winner;
      predictedSpread = analysis.predictions.spread;
      predictedTotal = analysis.predictions.total;
    }

    // Store prediction in database
    const predictionId = crypto.randomUUID();

    const prediction = {
      id: predictionId,
      game_id: gameId,
      sport,
      prediction_type: predictionType,
      predicted_winner: predictedWinner,
      predicted_spread: predictedSpread,
      predicted_total: predictedTotal,
      confidence: analysis.predictions?.confidence || 50,
      recommended_bet: recommendedBet,
      recommended_odds: recommendedOdds,
      stake_size: stakeSize,
      analysis: {
        the_edge: analysis.the_edge,
        key_factors: analysis.key_factors,
        recommended_bets: analysis.recommended_bets,
        risk_assessment: analysis.risk_assessment,
        value_rating: analysis.value_rating,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await insertPrediction(prediction);

    console.log(`Prediction ${predictionId} stored successfully`);

    // Log completion
    await logEvent('run-analyzer', 'info', `Completed analysis for game ${gameId}`, {
      predictionId,
      confidence: prediction.confidence,
      recommendedBet: recommendedBet,
    });

    // Return response
    const output: RunAnalyzerOutput = {
      success: true,
      predictionId,
      analysis,
    };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in run-analyzer:', error);

    await logEvent('run-analyzer', 'error', error.message, {
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
 * Get team stats from database
 * This is a placeholder - you can expand this to fetch actual stats
 */
async function getTeamStats(teamId: string, sport: string): Promise<any> {
  // TODO: Implement actual team stats fetching
  // For now, return basic placeholder data

  return {
    team_id: teamId,
    sport,
    // Add actual stats from your database here
    record: null,
    points_per_game: null,
    points_allowed_per_game: null,
    // etc...
  };
}
