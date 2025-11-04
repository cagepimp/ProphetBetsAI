// =====================================================
// SUPABASE EDGE FUNCTION: autoGradeAndLearn
// Automatically grade predictions and learn from results
// Migrated from Base44 automation/autoGradeAndLearn
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", // Use service role for admin operations
    );

    console.log("[AutoGradeAndLearn] Starting auto grading process...");

    // 1. Find completed games that haven't been graded
    const { data: completedGames, error: gamesError } = await supabaseClient
      .from("games")
      .select("*")
      .eq("completed", true)
      .not("home_score", "is", null)
      .not("away_score", "is", null)
      .not("prediction", "is", null);

    if (gamesError) {
      throw new Error(`Error fetching games: ${gamesError.message}`);
    }

    console.log(`[AutoGradeAndLearn] Found ${completedGames?.length || 0} completed games`);

    if (!completedGames || completedGames.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No completed games to grade",
          gamesGraded: 0,
          patternsLearned: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    let gamesGraded = 0;
    let correctPredictions = 0;
    const learningData: any[] = [];

    // 2. Grade each game
    for (const game of completedGames) {
      // Check if prediction history already exists and is graded
      const { data: existingHistory } = await supabaseClient
        .from("prediction_history")
        .select("*")
        .eq("game_id", game.id)
        .eq("graded", true)
        .single();

      if (existingHistory) {
        console.log(`Game ${game.id} already graded, skipping...`);
        continue;
      }

      const grade = gradeGame(game);

      // 3. Update or insert prediction history
      const { data: historyData, error: historyError } = await supabaseClient
        .from("prediction_history")
        .upsert({
          game_id: game.id,
          sport: game.sport,
          home_team: game.home_team,
          away_team: game.away_team,
          game_date: game.game_date,
          prediction: game.prediction,
          analyzer_version: game.analyzer_version,
          confidence: game.analyzer_confidence,
          actual_result: {
            home_score: game.home_score,
            away_score: game.away_score,
            winner:
              game.home_score > game.away_score ? game.home_team : game.away_team,
          },
          graded: true,
          grade: grade,
          graded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (historyError) {
        console.error(`Error updating prediction history for game ${game.id}:`, historyError);
        continue;
      }

      // 4. Record prediction accuracy
      await supabaseClient.from("prediction_accuracy").insert({
        game_id: game.id,
        sport: game.sport,
        prediction_type: "game",
        predicted_outcome: game.prediction.winner,
        actual_outcome:
          game.home_score > game.away_score ? game.home_team : game.away_team,
        correct: grade.winner_correct,
        confidence: game.analyzer_confidence,
        score_diff_error: grade.score_diff_error,
        analyzer_version: game.analyzer_version,
      });

      gamesGraded++;
      if (grade.winner_correct) correctPredictions++;

      // 5. Collect learning data
      learningData.push({
        game,
        grade,
        features: extractFeatures(game),
      });

      console.log(
        `[AutoGradeAndLearn] Graded game ${game.id}: ${grade.winner_correct ? "✓" : "✗"} (Score: ${grade.score}/100)`
      );
    }

    // 6. Learn from graded games
    const patternsLearned = await learnFromGrades(supabaseClient, learningData);

    const accuracy = gamesGraded > 0 ? (correctPredictions / gamesGraded) * 100 : 0;

    console.log(
      `[AutoGradeAndLearn] Completed! Graded: ${gamesGraded}, Accuracy: ${accuracy.toFixed(1)}%, Patterns: ${patternsLearned}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        gamesGraded,
        correctPredictions,
        accuracy: accuracy.toFixed(1),
        patternsLearned,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[AutoGradeAndLearn] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

// ========== GRADING LOGIC ==========

function gradeGame(game: any): any {
  const prediction = game.prediction;
  const homeScore = game.home_score;
  const awayScore = game.away_score;

  const actualWinner = homeScore > awayScore ? game.home_team : game.away_team;
  const winnerCorrect = prediction.winner === actualWinner;

  // Grade spread prediction
  const actualSpread = homeScore - awayScore;
  const predictedSpread =
    prediction.predicted_score.home - prediction.predicted_score.away;
  const spreadDiff = Math.abs(actualSpread - predictedSpread);
  const spreadCorrect = spreadDiff <= 7; // Within 1 touchdown

  // Grade total prediction
  const actualTotal = homeScore + awayScore;
  const predictedTotal =
    prediction.predicted_score.home + prediction.predicted_score.away;
  const totalDiff = Math.abs(actualTotal - predictedTotal);
  const totalCorrect = totalDiff <= 7;

  // Calculate overall score
  let score = 0;
  if (winnerCorrect) score += 40;
  if (spreadCorrect) score += 30;
  if (totalCorrect) score += 30;

  // Bonus for close predictions
  const scoreDiffError = Math.abs(
    Math.abs(homeScore - awayScore) -
      Math.abs(prediction.predicted_score.home - prediction.predicted_score.away)
  );

  if (scoreDiffError <= 3) score += 10;

  return {
    winner_correct: winnerCorrect,
    spread_correct: spreadCorrect,
    total_correct: totalCorrect,
    score: Math.min(score, 100),
    score_diff_error: scoreDiffError,
    actual_spread: actualSpread,
    predicted_spread: predictedSpread,
    actual_total: actualTotal,
    predicted_total: predictedTotal,
  };
}

// ========== FEATURE EXTRACTION ==========

function extractFeatures(game: any): any {
  return {
    sport: game.sport,
    week: game.week,
    season: game.season,
    home_team: game.home_team,
    away_team: game.away_team,
    injury_impact: game.injury_impact_score,
    matchup_rating: game.matchup_rating,
    confidence: game.analyzer_confidence,
    weather_impact: game.weather_data ? 1 : 0,
  };
}

// ========== LEARNING ALGORITHM ==========

async function learnFromGrades(
  supabaseClient: any,
  learningData: any[]
): Promise<number> {
  if (learningData.length < 5) {
    console.log("[Learning] Not enough data to learn patterns (need at least 5 games)");
    return 0;
  }

  const correctGames = learningData.filter((d) => d.grade.winner_correct);
  const incorrectGames = learningData.filter((d) => !d.grade.winner_correct);

  let patternsDiscovered = 0;

  // Pattern 1: High confidence accuracy
  const highConfidenceGames = learningData.filter(
    (d) => d.features.confidence >= 80
  );
  if (highConfidenceGames.length >= 5) {
    const highConfAccuracy =
      highConfidenceGames.filter((d) => d.grade.winner_correct).length /
      highConfidenceGames.length;

    await supabaseClient.from("learning_patterns").upsert({
      pattern_type: "confidence_threshold",
      sport: learningData[0].features.sport,
      description: `High confidence (>=80%) predictions have ${(highConfAccuracy * 100).toFixed(1)}% accuracy`,
      pattern_data: {
        min_confidence: 80,
        accuracy: highConfAccuracy,
      },
      sample_size: highConfidenceGames.length,
      success_rate: highConfAccuracy,
      confidence: highConfAccuracy >= 0.7 ? 0.8 : 0.5,
      conditions: { min_confidence: 80 },
      active: highConfAccuracy >= 0.6,
    });

    patternsDiscovered++;
  }

  // Pattern 2: Injury impact correlation
  const highInjuryGames = learningData.filter(
    (d) => d.features.injury_impact >= 30
  );
  if (highInjuryGames.length >= 5) {
    const highInjuryAccuracy =
      highInjuryGames.filter((d) => d.grade.winner_correct).length /
      highInjuryGames.length;

    await supabaseClient.from("learning_patterns").upsert({
      pattern_type: "injury_impact",
      sport: learningData[0].features.sport,
      description: `High injury impact (>=30) correlates with ${(highInjuryAccuracy * 100).toFixed(1)}% accuracy`,
      pattern_data: {
        min_injury_impact: 30,
        accuracy: highInjuryAccuracy,
      },
      sample_size: highInjuryGames.length,
      success_rate: highInjuryAccuracy,
      confidence: 0.7,
      conditions: { min_injury_impact: 30 },
      active: true,
    });

    patternsDiscovered++;
  }

  // Pattern 3: Matchup rating effectiveness
  const strongMatchupGames = learningData.filter(
    (d) => d.features.matchup_rating >= 70 || d.features.matchup_rating <= 30
  );
  if (strongMatchupGames.length >= 5) {
    const matchupAccuracy =
      strongMatchupGames.filter((d) => d.grade.winner_correct).length /
      strongMatchupGames.length;

    await supabaseClient.from("learning_patterns").upsert({
      pattern_type: "matchup_advantage",
      sport: learningData[0].features.sport,
      description: `Strong matchup advantage (>=70 or <=30) shows ${(matchupAccuracy * 100).toFixed(1)}% accuracy`,
      pattern_data: {
        threshold: 70,
        accuracy: matchupAccuracy,
      },
      sample_size: strongMatchupGames.length,
      success_rate: matchupAccuracy,
      confidence: 0.75,
      conditions: { strong_matchup: true },
      active: matchupAccuracy >= 0.6,
    });

    patternsDiscovered++;
  }

  // Add patterns to training_data table for future ML training
  for (const data of learningData) {
    await supabaseClient.from("training_data").insert({
      sport: data.features.sport,
      data_type: "game",
      features: data.features,
      labels: {
        winner_correct: data.grade.winner_correct,
        spread_correct: data.grade.spread_correct,
        total_correct: data.grade.total_correct,
        grade_score: data.grade.score,
      },
      season: data.features.season,
      week: data.features.week,
      data_quality_score: data.grade.score,
      validated: true,
    });
  }

  console.log(`[Learning] Discovered ${patternsDiscovered} patterns from ${learningData.length} games`);

  return patternsDiscovered;
}
