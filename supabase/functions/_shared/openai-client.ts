// ==========================================
// OPENAI CLIENT FOR AI ANALYSIS
// ==========================================

import { OpenAIAnalysis, RecommendedBet, Game, Player, Injury } from './types.ts';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Get OpenAI API key from environment
 */
function getApiKey(): string {
  const apiKey = Deno.env.get('OPENAI_API_KEY');

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  return apiKey;
}

/**
 * Make a request to OpenAI API
 */
async function callOpenAI(
  messages: any[],
  model: string = 'gpt-4-turbo-preview',
  temperature: number = 0.7
): Promise<string> {
  const apiKey = getApiKey();

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  return data.choices[0]?.message?.content || '';
}

/**
 * Analyze a game and generate predictions
 */
export async function analyzeGame(
  game: Game,
  homeTeamStats?: any,
  awayTeamStats?: any,
  injuries?: Injury[],
  weather?: any,
  analysisDepth: 'quick' | 'standard' | 'deep' = 'standard'
): Promise<OpenAIAnalysis> {
  // Build context for GPT
  const prompt = buildGameAnalysisPrompt(
    game,
    homeTeamStats,
    awayTeamStats,
    injuries,
    weather,
    analysisDepth
  );

  const messages = [
    {
      role: 'system',
      content: `You are an expert sports betting analyst for ProphetBetsAI. Your job is to analyze games and provide betting recommendations with high accuracy. You must:

1. Analyze all available data objectively
2. Identify the strongest betting opportunities
3. Provide confidence scores based on data quality
4. Explain your reasoning clearly
5. Consider injury reports, weather, and situational factors
6. Return analysis in valid JSON format

CRITICAL: Your response MUST be valid JSON matching this structure:
{
  "the_edge": "Clear explanation of the betting edge",
  "recommended_bets": [
    {
      "type": "moneyline",
      "selection": "Team Name",
      "odds": -110,
      "confidence": 75,
      "reasoning": "Why this bet has value",
      "stake_recommendation": "medium"
    }
  ],
  "predictions": {
    "winner": "Team Name",
    "spread": -3.5,
    "total": 225.5,
    "confidence": 75
  },
  "key_factors": ["Factor 1", "Factor 2", "Factor 3"],
  "risk_assessment": "Explanation of risks",
  "value_rating": 7.5
}`,
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  try {
    const response = await callOpenAI(messages, 'gpt-4-turbo-preview', 0.7);

    // Parse JSON response
    const analysis = JSON.parse(response);

    // Validate response structure
    if (!analysis.the_edge || !analysis.predictions) {
      throw new Error('Invalid analysis response format');
    }

    return analysis as OpenAIAnalysis;
  } catch (error) {
    console.error('Error analyzing game:', error);
    throw error;
  }
}

/**
 * Build the game analysis prompt
 */
function buildGameAnalysisPrompt(
  game: Game,
  homeTeamStats?: any,
  awayTeamStats?: any,
  injuries?: Injury[],
  weather?: any,
  analysisDepth: 'quick' | 'standard' | 'deep' = 'standard'
): string {
  let prompt = `Analyze this ${game.sport} game:\n\n`;

  // Game info
  prompt += `**Game:** ${game.away_team} @ ${game.home_team}\n`;
  prompt += `**Date:** ${new Date(game.game_date).toLocaleDateString()}\n`;
  prompt += `**Venue:** ${game.venue || 'TBD'}\n\n`;

  // Odds
  if (game.markets) {
    prompt += `**Current Betting Lines:**\n`;

    if (game.markets.moneyline) {
      prompt += `- Moneyline: `;
      const ml = game.markets.moneyline;
      if (ml.draftkings) {
        const awayOdds = ml.draftkings.find((o) => o.name === game.away_team)?.price;
        const homeOdds = ml.draftkings.find((o) => o.name === game.home_team)?.price;
        prompt += `${game.away_team} ${awayOdds > 0 ? '+' : ''}${awayOdds}, ${game.home_team} ${homeOdds > 0 ? '+' : ''}${homeOdds}\n`;
      }
    }

    if (game.markets.spread) {
      prompt += `- Spread: `;
      const spread = game.markets.spread;
      if (spread.draftkings) {
        const line = spread.draftkings.find((o) => o.name === game.away_team)?.point;
        prompt += `${game.away_team} ${line > 0 ? '+' : ''}${line}\n`;
      }
    }

    if (game.markets.total) {
      prompt += `- Total: `;
      const total = game.markets.total;
      if (total.draftkings) {
        const line = total.draftkings.find((o) => o.name === 'Over')?.point;
        prompt += `O/U ${line}\n`;
      }
    }

    prompt += '\n';
  }

  // Team stats
  if (homeTeamStats) {
    prompt += `**${game.home_team} Stats:**\n`;
    prompt += JSON.stringify(homeTeamStats, null, 2) + '\n\n';
  }

  if (awayTeamStats) {
    prompt += `**${game.away_team} Stats:**\n`;
    prompt += JSON.stringify(awayTeamStats, null, 2) + '\n\n';
  }

  // Injuries
  if (injuries && injuries.length > 0) {
    prompt += `**Injury Report:**\n`;
    for (const injury of injuries) {
      prompt += `- ${injury.player_name} (${injury.team}): ${injury.injury_status}`;
      if (injury.description) {
        prompt += ` - ${injury.description}`;
      }
      prompt += '\n';
    }
    prompt += '\n';
  }

  // Weather
  if (weather) {
    prompt += `**Weather:**\n`;
    prompt += JSON.stringify(weather, null, 2) + '\n\n';
  }

  // Analysis instructions
  if (analysisDepth === 'quick') {
    prompt += `Provide a QUICK analysis focusing on the single best betting opportunity.`;
  } else if (analysisDepth === 'deep') {
    prompt += `Provide a COMPREHENSIVE analysis covering all betting angles, situational factors, and historical trends.`;
  } else {
    prompt += `Provide a STANDARD analysis with 2-3 recommended bets and clear reasoning.`;
  }

  return prompt;
}

/**
 * Generate player prop recommendations
 */
export async function analyzePlayerProps(
  game: Game,
  player: Player,
  playerStats?: any,
  recentGames?: any[]
): Promise<{
  player_name: string;
  props: Array<{
    prop_type: string;
    line: number;
    recommendation: 'over' | 'under' | 'avoid';
    confidence: number;
    reasoning: string;
  }>;
}> {
  const prompt = buildPlayerPropsPrompt(game, player, playerStats, recentGames);

  const messages = [
    {
      role: 'system',
      content: `You are an expert at analyzing player props for sports betting. Analyze player statistics and game context to recommend over/under bets on player props (points, rebounds, assists, etc.).

Return valid JSON in this format:
{
  "player_name": "Player Name",
  "props": [
    {
      "prop_type": "points",
      "line": 25.5,
      "recommendation": "over",
      "confidence": 75,
      "reasoning": "Why this is a good bet"
    }
  ]
}`,
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  try {
    const response = await callOpenAI(messages, 'gpt-4-turbo-preview', 0.7);
    const analysis = JSON.parse(response);

    return analysis;
  } catch (error) {
    console.error('Error analyzing player props:', error);
    throw error;
  }
}

/**
 * Build player props analysis prompt
 */
function buildPlayerPropsPrompt(
  game: Game,
  player: Player,
  playerStats?: any,
  recentGames?: any[]
): string {
  let prompt = `Analyze player props for:\n\n`;

  prompt += `**Player:** ${player.name}\n`;
  prompt += `**Team:** ${game.home_team === player.team_id ? game.home_team : game.away_team}\n`;
  prompt += `**Position:** ${player.position || 'Unknown'}\n`;
  prompt += `**Opponent:** ${game.home_team === player.team_id ? game.away_team : game.home_team}\n\n`;

  if (playerStats) {
    prompt += `**Season Averages:**\n`;
    prompt += JSON.stringify(playerStats, null, 2) + '\n\n';
  }

  if (recentGames && recentGames.length > 0) {
    prompt += `**Last ${recentGames.length} Games:**\n`;
    for (const recentGame of recentGames) {
      prompt += JSON.stringify(recentGame, null, 2) + '\n';
    }
    prompt += '\n';
  }

  prompt += `Recommend over/under bets for common props (points, rebounds, assists, etc.) based on the data.`;

  return prompt;
}

/**
 * Learn from prediction results
 * Analyze what patterns led to correct/incorrect predictions
 */
export async function analyzePredictionPatterns(
  correctPredictions: any[],
  incorrectPredictions: any[]
): Promise<{
  winning_patterns: string[];
  losing_patterns: string[];
  recommendations: string[];
}> {
  const prompt = `Analyze these sports betting prediction results to identify patterns:

**Correct Predictions (${correctPredictions.length} wins):**
${JSON.stringify(correctPredictions.slice(0, 20), null, 2)}

**Incorrect Predictions (${incorrectPredictions.length} losses):**
${JSON.stringify(incorrectPredictions.slice(0, 20), null, 2)}

Identify:
1. Common factors in winning predictions
2. Common factors in losing predictions
3. Recommendations to improve future predictions

Return valid JSON:
{
  "winning_patterns": ["Pattern 1", "Pattern 2"],
  "losing_patterns": ["Pattern 1", "Pattern 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

  const messages = [
    {
      role: 'system',
      content:
        'You are a data analyst specializing in sports betting pattern recognition.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  try {
    const response = await callOpenAI(messages, 'gpt-4-turbo-preview', 0.5);
    const analysis = JSON.parse(response);

    return analysis;
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    throw error;
  }
}
