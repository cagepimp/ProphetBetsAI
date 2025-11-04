// ==========================================
// UPDATE-RESULTS EDGE FUNCTION
// ==========================================
// Grades predictions and updates accuracy metrics
//
// Usage:
// POST /functions/v1/update-results
// Body: { "sport": "NFL", "gameId": "401547404", "date": "2024-11-03" }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  getSupabaseClient,
  getGames,
  getPredictions,
  updatePredictionResult,
  logEvent,
} from '../_shared/supabase-client.ts';
import { fetchScoreboard } from '../_shared/espn-api.ts';
import { UpdateResultsInput, UpdateResultsOutput } from '../_shared/types.ts';

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
    const input: UpdateResultsInput = await req.json();

    await logEvent('update-results', 'info', 'Starting results update', input);

    let games = [];

    // Get games to grade
    if (input.gameId) {
      games = await getGames({ gameId: input.gameId });
    } else if (input.sport) {
      games = await getGames({ sport: input.sport, status: 'completed' });
    } else if (input.date) {
      // Get games from specific date
      games = await getGames({ date: input.date });
      games = games.filter((g) => g.status === 'completed');
    } else {
      // Get all recently completed games (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      games = await getGames({ date: yesterday.toISOString().split('T')[0] });
      games = games.filter((g) => g.status === 'completed');
    }

    console.log(`Grading ${games.length} completed games`);

    let gamesGraded = 0;
    let predictionsGraded = 0;
    let propsGraded = 0;
    const errors: string[] = [];

    for (const game of games) {
      try {
        // Ensure game has final scores
        if (game.home_score === null || game.away_score === null) {
          console.warn(`Game ${game.id} has no scores, skipping`);
          continue;
        }

        console.log(`Grading game: ${game.away_team} ${game.away_score} @ ${game.home_team} ${game.home_score}`);

        // Get all predictions for this game
        const predictions = await getPredictions({ gameId: game.id });

        for (const prediction of predictions) {
          try {
            // Skip if already graded
            if (prediction.result) {
              console.log(`Prediction ${prediction.id} already graded`);
              continue;
            }

            // Grade the prediction
            const grading = gradePrediction(prediction, game);

            // Update prediction with result
            await updatePredictionResult(prediction.id, {
              result: grading.result,
              actual_outcome: grading.actual_outcome,
              profit_loss: grading.profit_loss,
            });

            predictionsGraded++;

            console.log(`Graded prediction ${prediction.id}: ${grading.result}`);
          } catch (predErr) {
            console.error(`Failed to grade prediction ${prediction.id}:`, predErr);
            errors.push(`Prediction ${prediction.id}: ${predErr.message}`);
          }
        }

        // Grade player props for this game
        const supabase = getSupabaseClient();
        const { data: props } = await supabase
          .from('player_props')
          .select('*')
          .eq('game_id', game.id)
          .is('result', null);

        if (props) {
          for (const prop of props) {
            try {
              // TODO: Fetch actual player stats from game
              // For now, mark as void if we don't have stats
              const actualValue = await getPlayerGameStats(
                prop.player_id || prop.player_name,
                game.id,
                prop.prop_type
              );

              let result: 'win' | 'loss' | 'push' | 'void' = 'void';

              if (actualValue !== null) {
                if (prop.recommendation === 'over') {
                  if (actualValue > prop.line) result = 'win';
                  else if (actualValue === prop.line) result = 'push';
                  else result = 'loss';
                } else if (prop.recommendation === 'under') {
                  if (actualValue < prop.line) result = 'win';
                  else if (actualValue === prop.line) result = 'push';
                  else result = 'loss';
                }
              }

              // Update prop
              await supabase
                .from('player_props')
                .update({
                  result,
                  actual_value: actualValue,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', prop.id);

              propsGraded++;

              console.log(`Graded prop ${prop.id}: ${result}`);
            } catch (propErr) {
              console.error(`Failed to grade prop ${prop.id}:`, propErr);
              errors.push(`Prop ${prop.id}: ${propErr.message}`);
            }
          }
        }

        gamesGraded++;
      } catch (gameErr) {
        console.error(`Failed to grade game ${game.id}:`, gameErr);
        errors.push(`Game ${game.id}: ${gameErr.message}`);
      }
    }

    // Update accuracy metrics
    const accuracyUpdated = await updateAccuracyMetrics();

    // Log completion
    await logEvent('update-results', 'info', 'Completed results update', {
      gamesGraded,
      predictionsGraded,
      propsGraded,
      accuracyUpdated,
      errors: errors.length,
    });

    // Return response
    const output: UpdateResultsOutput = {
      success: true,
      gamesGraded,
      predictionsGraded,
      propsGraded,
      accuracyUpdated,
      errors: errors.length > 0 ? errors : undefined,
    };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in update-results:', error);

    await logEvent('update-results', 'error', error.message, {
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
 * Grade a single prediction
 */
function gradePrediction(
  prediction: any,
  game: any
): {
  result: 'win' | 'loss' | 'push' | 'void';
  actual_outcome: any;
  profit_loss: number;
} {
  const homeScore = game.home_score;
  const awayScore = game.away_score;

  const actual_outcome = {
    home_score: homeScore,
    away_score: awayScore,
    winner: homeScore > awayScore ? game.home_team : game.away_team,
    margin: Math.abs(homeScore - awayScore),
    total: homeScore + awayScore,
  };

  let result: 'win' | 'loss' | 'push' | 'void' = 'void';
  let profit_loss = 0;

  // Calculate stake amount (assume $100 unit)
  const stakeAmount = (prediction.stake_size || 5) * 10;

  if (prediction.prediction_type === 'moneyline') {
    // Moneyline: did we pick the correct winner?
    if (prediction.predicted_winner === actual_outcome.winner) {
      result = 'win';
      // Calculate profit based on odds
      if (prediction.recommended_odds) {
        profit_loss =
          prediction.recommended_odds > 0
            ? stakeAmount * (prediction.recommended_odds / 100)
            : stakeAmount / (Math.abs(prediction.recommended_odds) / 100);
      }
    } else {
      result = 'loss';
      profit_loss = -stakeAmount;
    }
  } else if (prediction.prediction_type === 'spread') {
    // Spread: adjust scores by spread
    const adjustedHomeScore = homeScore + (prediction.predicted_spread || 0);

    if (adjustedHomeScore > awayScore) {
      result = prediction.predicted_winner === game.home_team ? 'win' : 'loss';
    } else if (adjustedHomeScore < awayScore) {
      result = prediction.predicted_winner === game.away_team ? 'win' : 'loss';
    } else {
      result = 'push';
    }

    profit_loss = result === 'win' ? stakeAmount * 0.91 : result === 'loss' ? -stakeAmount : 0;
  } else if (prediction.prediction_type === 'total') {
    // Total: compare actual total to predicted
    const actualTotal = homeScore + awayScore;
    const predictedTotal = prediction.predicted_total;

    if (actualTotal === predictedTotal) {
      result = 'push';
    } else if (
      (prediction.recommended_bet === 'over' && actualTotal > predictedTotal) ||
      (prediction.recommended_bet === 'under' && actualTotal < predictedTotal)
    ) {
      result = 'win';
    } else {
      result = 'loss';
    }

    profit_loss = result === 'win' ? stakeAmount * 0.91 : result === 'loss' ? -stakeAmount : 0;
  }

  return {
    result,
    actual_outcome,
    profit_loss,
  };
}

/**
 * Update accuracy metrics in database
 */
async function updateAccuracyMetrics(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

    // Get all graded predictions
    const { data: predictions } = await supabase
      .from('predictions')
      .select('*')
      .not('result', 'is', null);

    if (!predictions || predictions.length === 0) {
      return false;
    }

    // Calculate metrics by sport and bet type
    const metrics: Record<string, any> = {};

    for (const pred of predictions) {
      const key = `${pred.sport}_${pred.prediction_type}`;

      if (!metrics[key]) {
        metrics[key] = {
          sport: pred.sport,
          bet_type: pred.prediction_type,
          total: 0,
          wins: 0,
          losses: 0,
          pushes: 0,
          total_profit: 0,
        };
      }

      metrics[key].total++;
      if (pred.result === 'win') metrics[key].wins++;
      else if (pred.result === 'loss') metrics[key].losses++;
      else if (pred.result === 'push') metrics[key].pushes++;

      metrics[key].total_profit += pred.profit_loss || 0;
    }

    // Store metrics
    for (const [key, metric] of Object.entries(metrics)) {
      const accuracy = metric.total > 0 ? (metric.wins / metric.total) * 100 : 0;
      const roi = metric.total > 0 ? (metric.total_profit / (metric.total * 50)) * 100 : 0;

      await supabase.from('accuracy_metrics').upsert({
        sport: metric.sport,
        bet_type: metric.bet_type,
        total_predictions: metric.total,
        correct_predictions: metric.wins,
        accuracy_percentage: accuracy,
        roi_percentage: roi,
        total_profit: metric.total_profit,
        last_updated: new Date().toISOString(),
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to update accuracy metrics:', error);
    return false;
  }
}

/**
 * Get player's actual stats from a completed game
 * Placeholder - implement actual stats fetching
 */
async function getPlayerGameStats(
  playerId: string,
  gameId: string,
  statType: string
): Promise<number | null> {
  // TODO: Implement actual player game stats fetching
  // Query game_stats table for player's performance in this game

  return null;
}
