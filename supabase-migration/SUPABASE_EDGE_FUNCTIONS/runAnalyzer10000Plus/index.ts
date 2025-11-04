// =====================================================
// SUPABASE EDGE FUNCTION: runAnalyzer10000Plus
// Main AI-powered game analysis engine
// Migrated from Base44 automation/runAnalyzer10000Plus
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnalyzerRequest {
  gameId: string;
  sport: string;
  forceReanalyze?: boolean;
}

interface AnalyzerResult {
  prediction: {
    winner: string;
    confidence: number;
    predicted_score: {
      home: number;
      away: number;
    };
    spread_recommendation: string;
    total_recommendation: string;
  };
  analysis_data: {
    factors: any[];
    matchup_rating: number;
    injury_impact: number;
    weather_impact?: number;
    trends: any[];
  };
  analyzer_version: string;
  insights: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Parse request body
    const { gameId, sport, forceReanalyze = false } =
      (await req.json()) as AnalyzerRequest;

    if (!gameId || !sport) {
      throw new Error("gameId and sport are required");
    }

    console.log(
      `[Analyzer 10000+] Analyzing game ${gameId} for sport ${sport}`
    );

    // Fetch game data
    const { data: game, error: gameError } = await supabaseClient
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (gameError || !game) {
      throw new Error(`Game not found: ${gameId}`);
    }

    // Check if already analyzed (unless force reanalyze)
    if (
      game.analysis_data &&
      game.analyzed_at &&
      !forceReanalyze
    ) {
      console.log(`Game ${gameId} already analyzed, returning cached results`);
      return new Response(
        JSON.stringify({
          success: true,
          cached: true,
          analysis: game.analysis_data,
          prediction: game.prediction,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // ========== ANALYZER 10000+ CORE LOGIC ==========

    // 1. Fetch supporting data
    const [playersResult, injuriesResult, statsResult, oddsResult] =
      await Promise.all([
        // Fetch rosters
        supabaseClient
          .from("players")
          .select("*")
          .eq("sport", sport)
          .in("team", [game.home_team, game.away_team]),

        // Fetch injuries
        supabaseClient
          .from("injuries")
          .select("*")
          .eq("sport", sport)
          .in("team", [game.home_team, game.away_team])
          .eq("resolved", false),

        // Fetch team stats
        supabaseClient
          .from("team_season_stats")
          .select("*")
          .eq("sport", sport)
          .in("team_name", [game.home_team, game.away_team])
          .eq("season", game.season || new Date().getFullYear()),

        // Fetch historical odds
        supabaseClient
          .from("historical_odds")
          .select("*")
          .eq("game_id", gameId)
          .order("fetched_at", { ascending: false })
          .limit(10),
      ]);

    const players = playersResult.data || [];
    const injuries = injuriesResult.data || [];
    const teamStats = statsResult.data || [];
    const historicalOdds = oddsResult.data || [];

    // 2. Calculate injury impact
    const injuryImpact = calculateInjuryImpact(injuries, players);

    // 3. Analyze team matchup
    const matchupAnalysis = analyzeMatchup(teamStats, game);

    // 4. Analyze trends (fetch historical games)
    const { data: historicalGames } = await supabaseClient
      .from("historical_games")
      .select("*")
      .eq("sport", sport)
      .or(
        `home_team.eq.${game.home_team},away_team.eq.${game.home_team},home_team.eq.${game.away_team},away_team.eq.${game.away_team}`
      )
      .order("game_date", { ascending: false })
      .limit(20);

    const trends = analyzeTrends(historicalGames || [], game);

    // 5. Weather analysis (if applicable for outdoor sports)
    let weatherImpact = 0;
    if (["NFL", "CFB", "MLB"].includes(sport) && game.weather_data) {
      weatherImpact = analyzeWeather(game.weather_data);
    }

    // 6. Fetch learning patterns
    const { data: patterns } = await supabaseClient
      .from("learning_patterns")
      .select("*")
      .eq("sport", sport)
      .eq("active", true)
      .gte("success_rate", 0.6);

    const applicablePatterns = applyPatterns(
      patterns || [],
      game,
      teamStats,
      injuries
    );

    // 7. Generate prediction using ML model
    const prediction = generatePrediction(
      game,
      teamStats,
      injuryImpact,
      matchupAnalysis,
      trends,
      weatherImpact,
      applicablePatterns
    );

    // 8. Generate insights
    const insights = generateInsights(
      prediction,
      injuryImpact,
      matchupAnalysis,
      trends,
      applicablePatterns
    );

    // 9. Compile analysis data
    const analysisData = {
      factors: [
        { name: "Team Matchup", score: matchupAnalysis.score },
        { name: "Injury Impact", score: 100 - injuryImpact },
        { name: "Historical Trends", score: trends.score },
        { name: "Weather Impact", score: 100 - weatherImpact },
        { name: "Pattern Matching", score: applicablePatterns.score },
      ],
      matchup_rating: matchupAnalysis.score,
      injury_impact: injuryImpact,
      weather_impact: weatherImpact,
      trends: trends.details,
      patterns: applicablePatterns.details,
    };

    const analyzerResult: AnalyzerResult = {
      prediction,
      analysis_data: analysisData,
      analyzer_version: "v10000plus",
      insights,
    };

    // 10. Update game with analysis results
    const { error: updateError } = await supabaseClient
      .from("games")
      .update({
        analysis_data: analysisData,
        prediction: prediction,
        analyzer_version: "v10000plus",
        analyzer_confidence: prediction.confidence,
        analyzer_insights: insights,
        analyzed_at: new Date().toISOString(),
        injury_impact_score: injuryImpact,
        matchup_rating: matchupAnalysis.score,
      })
      .eq("id", gameId);

    if (updateError) {
      console.error("Error updating game:", updateError);
    }

    // 11. Record prediction history
    await supabaseClient.from("prediction_history").insert({
      game_id: gameId,
      sport: sport,
      home_team: game.home_team,
      away_team: game.away_team,
      game_date: game.game_date,
      prediction: prediction,
      analyzer_version: "v10000plus",
      confidence: prediction.confidence,
    });

    console.log(
      `[Analyzer 10000+] Successfully analyzed game ${gameId} - Confidence: ${prediction.confidence}%`
    );

    return new Response(
      JSON.stringify({
        success: true,
        cached: false,
        ...analyzerResult,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in runAnalyzer10000Plus:", error);
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

// ========== HELPER FUNCTIONS ==========

function calculateInjuryImpact(injuries: any[], players: any[]): number {
  if (injuries.length === 0) return 0;

  let impact = 0;
  const keyPositions = ["QB", "RB", "WR", "TE", "DE", "LB", "CB", "S"];

  injuries.forEach((injury) => {
    if (injury.injury_status === "out") {
      const player = players.find((p) => p.id === injury.player_id);
      if (player && keyPositions.includes(player.position)) {
        impact += injury.injury_status === "out" ? 20 : 10;
      } else {
        impact += injury.injury_status === "out" ? 10 : 5;
      }
    } else if (injury.injury_status === "doubtful") {
      impact += 7;
    } else if (injury.injury_status === "questionable") {
      impact += 3;
    }
  });

  return Math.min(impact, 100);
}

function analyzeMatchup(teamStats: any[], game: any): any {
  const homeStats = teamStats.find((s) => s.team_name === game.home_team);
  const awayStats = teamStats.find((s) => s.team_name === game.away_team);

  if (!homeStats || !awayStats) {
    return { score: 50, details: "Insufficient stats" };
  }

  // Calculate matchup score based on offensive vs defensive stats
  const homeOffenseScore =
    homeStats.points_per_game || homeStats.offensive_stats?.ppg || 0;
  const awayDefenseScore =
    awayStats.points_allowed_per_game || awayStats.defensive_stats?.papg || 0;

  const awayOffenseScore =
    awayStats.points_per_game || awayStats.offensive_stats?.ppg || 0;
  const homeDefenseScore =
    homeStats.points_allowed_per_game || homeStats.defensive_stats?.papg || 0;

  // Simple matchup rating (can be enhanced with more sophisticated ML)
  const homeAdvantage = homeOffenseScore - awayDefenseScore + 3; // +3 for home field
  const awayAdvantage = awayOffenseScore - homeDefenseScore;

  const score = ((homeAdvantage / (homeAdvantage + awayAdvantage)) * 100) || 50;

  return {
    score: Math.max(0, Math.min(100, score)),
    details: {
      homeOffenseVsAwayDefense: homeAdvantage,
      awayOffenseVsHomeDefense: awayAdvantage,
    },
  };
}

function analyzeTrends(historicalGames: any[], game: any): any {
  if (historicalGames.length === 0) {
    return { score: 50, details: [] };
  }

  const homeTeamGames = historicalGames.filter(
    (g) => g.home_team === game.home_team || g.away_team === game.home_team
  );

  const awayTeamGames = historicalGames.filter(
    (g) => g.home_team === game.away_team || g.away_team === game.away_team
  );

  // Calculate recent form (last 5 games)
  const homeWins = homeTeamGames
    .slice(0, 5)
    .filter((g) =>
      g.home_team === game.home_team
        ? g.home_score > g.away_score
        : g.away_score > g.home_score
    ).length;

  const awayWins = awayTeamGames
    .slice(0, 5)
    .filter((g) =>
      g.home_team === game.away_team
        ? g.home_score > g.away_score
        : g.away_score > g.home_score
    ).length;

  const score = ((homeWins / (homeWins + awayWins)) * 100) || 50;

  return {
    score: Math.max(0, Math.min(100, score)),
    details: [
      { team: game.home_team, recentRecord: `${homeWins}-${5 - homeWins}` },
      { team: game.away_team, recentRecord: `${awayWins}-${5 - awayWins}` },
    ],
  };
}

function analyzeWeather(weatherData: any): number {
  // Weather impact score (0 = no impact, 100 = severe impact)
  let impact = 0;

  if (weatherData.precipitation > 50) impact += 20;
  if (weatherData.windSpeed > 20) impact += 15;
  if (weatherData.temperature < 20 || weatherData.temperature > 95) impact += 10;

  return Math.min(impact, 100);
}

function applyPatterns(patterns: any[], game: any, stats: any[], injuries: any[]): any {
  if (patterns.length === 0) {
    return { score: 50, details: [] };
  }

  const applicablePatterns = patterns.filter((pattern) => {
    // Check if pattern conditions match current game
    const conditions = pattern.conditions || {};
    return (
      (!conditions.sport || conditions.sport === game.sport) &&
      (!conditions.min_week || game.week >= conditions.min_week)
    );
  });

  const avgSuccessRate =
    applicablePatterns.reduce((sum, p) => sum + (p.success_rate || 0), 0) /
      (applicablePatterns.length || 1) || 0.5;

  return {
    score: avgSuccessRate * 100,
    details: applicablePatterns.map((p) => ({
      description: p.description,
      successRate: p.success_rate,
    })),
  };
}

function generatePrediction(
  game: any,
  teamStats: any[],
  injuryImpact: number,
  matchupAnalysis: any,
  trends: any,
  weatherImpact: number,
  patterns: any
): any {
  // Weighted scoring system
  const weights = {
    matchup: 0.35,
    trends: 0.25,
    injuries: 0.20,
    patterns: 0.15,
    weather: 0.05,
  };

  const homeStats = teamStats.find((s) => s.team_name === game.home_team);
  const awayStats = teamStats.find((s) => s.team_name === game.away_team);

  // Calculate base scores
  const homePPG = homeStats?.points_per_game || 20;
  const awayPPG = awayStats?.points_per_game || 20;

  // Adjust for injuries and matchup
  const homeAdjustment =
    (matchupAnalysis.score / 100) * 1.1 - (injuryImpact / 100) * 0.8;
  const awayAdjustment =
    ((100 - matchupAnalysis.score) / 100) * 1.1 - (injuryImpact / 100) * 0.8;

  const predictedHomeScore = Math.round(homePPG * homeAdjustment);
  const predictedAwayScore = Math.round(awayPPG * awayAdjustment);

  // Overall confidence calculation
  const confidence =
    matchupAnalysis.score * weights.matchup +
    trends.score * weights.trends +
    (100 - injuryImpact) * weights.injuries +
    patterns.score * weights.patterns +
    (100 - weatherImpact) * weights.weather;

  const winner =
    predictedHomeScore > predictedAwayScore ? game.home_team : game.away_team;

  // Spread recommendation
  const predictedSpreadDiff = Math.abs(predictedHomeScore - predictedAwayScore);
  const actualSpread = Math.abs(game.home_spread || 0);
  const spreadRecommendation =
    predictedSpreadDiff > actualSpread ? "Cover" : "No Cover";

  // Total recommendation
  const predictedTotal = predictedHomeScore + predictedAwayScore;
  const actualTotal = game.total_over_under || 0;
  const totalRecommendation = predictedTotal > actualTotal ? "Over" : "Under";

  return {
    winner,
    confidence: Math.round(confidence),
    predicted_score: {
      home: predictedHomeScore,
      away: predictedAwayScore,
    },
    spread_recommendation: spreadRecommendation,
    total_recommendation: totalRecommendation,
  };
}

function generateInsights(
  prediction: any,
  injuryImpact: number,
  matchupAnalysis: any,
  trends: any,
  patterns: any
): string[] {
  const insights: string[] = [];

  insights.push(
    `Predicted winner: ${prediction.winner} with ${prediction.confidence}% confidence`
  );
  insights.push(
    `Projected final score: ${prediction.predicted_score.home}-${prediction.predicted_score.away}`
  );

  if (injuryImpact > 30) {
    insights.push(
      `High injury impact (${injuryImpact}/100) may significantly affect outcome`
    );
  }

  if (matchupAnalysis.score > 70) {
    insights.push("Strong matchup advantage for home team");
  } else if (matchupAnalysis.score < 30) {
    insights.push("Strong matchup advantage for away team");
  }

  if (trends.score > 70) {
    insights.push("Home team showing strong recent form");
  } else if (trends.score < 30) {
    insights.push("Away team showing strong recent form");
  }

  if (patterns.details.length > 0) {
    insights.push(
      `${patterns.details.length} historical patterns detected and applied`
    );
  }

  return insights;
}
