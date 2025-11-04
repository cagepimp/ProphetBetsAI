import React, { useState, useEffect } from 'react';
import { getPlayerById, getPlayerGameStats } from '@/api/supabaseClient';
import { Target, TrendingUp, Users, Activity, Award, BarChart3, Brain, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function PropBetAnalyzer({ playerId, propType, line, sport }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState(null);

  useEffect(() => {
    if (playerId) {
      analyzeProp();
    }
  }, [playerId, propType, line]);

  const analyzeProp = async () => {
    try {
      setLoading(true);

      // Fetch player data
      const player = await getPlayerById(playerId);
      setPlayerStats(player);

      // Fetch recent performance (limited to 10 games)
      let recentGames = await getPlayerGameStats({
        player_id: playerId,
        sport: sport
      });

      // Limit to 10 most recent games
      recentGames = recentGames.slice(0, 10);

      // Calculate analysis
      const propAnalysis = calculatePropAnalysis(player, recentGames, propType, line);
      setAnalysis(propAnalysis);

    } catch (err) {
      console.error('Error analyzing prop:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePropAnalysis = (player, recentGames, propType, line) => {
    if (!recentGames || recentGames.length === 0) {
      return {
        confidence: 50,
        recommendation: 'Insufficient data',
        hitRate: 0,
        avgPerformance: 0,
        trend: 'unknown',
        factors: []
      };
    }

    // Extract the stat based on prop type
    const statKey = getStatKeyFromPropType(propType);
    const performances = recentGames.map(g => g[statKey] || 0).filter(v => v > 0);

    if (performances.length === 0) {
      return {
        confidence: 50,
        recommendation: 'No relevant stats',
        hitRate: 0,
        avgPerformance: 0,
        trend: 'unknown',
        factors: []
      };
    }

    // Calculate metrics
    const avgPerformance = performances.reduce((a, b) => a + b, 0) / performances.length;
    const hitsOver = performances.filter(p => p > line).length;
    const hitRate = (hitsOver / performances.length) * 100;

    // Calculate trend (last 3 vs first 3 games)
    const recent3 = performances.slice(0, 3);
    const older3 = performances.slice(-3);
    const recentAvg = recent3.reduce((a, b) => a + b, 0) / recent3.length;
    const olderAvg = older3.reduce((a, b) => a + b, 0) / older3.length;
    const trendDirection = recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'stable';

    // Calculate confidence
    let confidence = 50;

    // Hit rate factor (max 30 points)
    if (hitRate >= 80) confidence += 30;
    else if (hitRate >= 70) confidence += 25;
    else if (hitRate >= 60) confidence += 20;
    else if (hitRate >= 50) confidence += 10;
    else if (hitRate >= 40) confidence += 5;
    else confidence -= 10;

    // Average vs line factor (max 15 points)
    const avgDiff = avgPerformance - line;
    const avgDiffPercent = (avgDiff / line) * 100;
    if (avgDiffPercent > 20) confidence += 15;
    else if (avgDiffPercent > 10) confidence += 10;
    else if (avgDiffPercent > 0) confidence += 5;
    else if (avgDiffPercent < -20) confidence -= 15;
    else if (avgDiffPercent < -10) confidence -= 10;

    // Trend factor (max 10 points)
    if (trendDirection === 'up' && avgPerformance > line) confidence += 10;
    else if (trendDirection === 'down' && avgPerformance < line) confidence += 5;
    else if (trendDirection === 'down' && avgPerformance > line) confidence -= 5;

    // Consistency factor (max 10 points)
    const stdDev = calculateStdDev(performances);
    const cv = stdDev / avgPerformance; // coefficient of variation
    if (cv < 0.2) confidence += 10;
    else if (cv < 0.3) confidence += 5;
    else if (cv > 0.5) confidence -= 5;

    confidence = Math.max(0, Math.min(100, confidence));

    // Generate recommendation
    let recommendation = 'PASS';
    if (confidence >= 70 && hitRate >= 70) recommendation = 'STRONG OVER';
    else if (confidence >= 65 && hitRate >= 60) recommendation = 'LEAN OVER';
    else if (confidence >= 70 && hitRate <= 30) recommendation = 'STRONG UNDER';
    else if (confidence >= 65 && hitRate <= 40) recommendation = 'LEAN UNDER';

    // Key factors
    const factors = [
      {
        name: 'Hit Rate',
        value: `${hitRate.toFixed(0)}%`,
        impact: hitRate >= 60 ? 'positive' : hitRate <= 40 ? 'negative' : 'neutral'
      },
      {
        name: 'Average',
        value: avgPerformance.toFixed(1),
        impact: avgPerformance > line ? 'positive' : 'negative'
      },
      {
        name: 'Recent Trend',
        value: trendDirection === 'up' ? '📈 Up' : trendDirection === 'down' ? '📉 Down' : '➡️ Stable',
        impact: trendDirection === 'up' ? 'positive' : trendDirection === 'down' ? 'negative' : 'neutral'
      },
      {
        name: 'Consistency',
        value: cv < 0.3 ? 'High' : cv < 0.5 ? 'Medium' : 'Low',
        impact: cv < 0.3 ? 'positive' : 'neutral'
      }
    ];

    return {
      confidence,
      recommendation,
      hitRate,
      avgPerformance,
      trend: trendDirection,
      recentPerformances: performances.slice(0, 5),
      factors,
      sampleSize: performances.length
    };
  };

  const getStatKeyFromPropType = (propType) => {
    const typeMap = {
      'passing_yards': 'passing_yards',
      'passing_tds': 'passing_touchdowns',
      'rushing_yards': 'rushing_yards',
      'rushing_tds': 'rushing_touchdowns',
      'receiving_yards': 'receiving_yards',
      'receiving_tds': 'receiving_touchdowns',
      'receptions': 'receptions',
      'points': 'points',
      'rebounds': 'rebounds',
      'assists': 'assists',
      'hits': 'hits',
      'strikeouts': 'strikeouts',
      'home_runs': 'home_runs'
    };
    return typeMap[propType?.toLowerCase()] || 'points';
  };

  const calculateStdDev = (values) => {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return 'from-green-500 to-emerald-500';
    if (confidence >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  const getRecommendationStyle = (recommendation) => {
    if (recommendation.includes('STRONG')) {
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
    if (recommendation.includes('LEAN')) {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
            <p className="text-slate-400">Analyzing prop bet...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="py-8">
          <p className="text-center text-slate-400">Unable to analyze prop</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Confidence Score */}
      <Card className={`bg-gradient-to-br ${getConfidenceColor(analysis.confidence)} bg-opacity-10 border-slate-700`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {playerStats?.name || 'Player'}
              </h3>
              <p className="text-slate-300">{propType} • {line}</p>
            </div>
            <Badge className={getRecommendationStyle(analysis.recommendation)} size="lg">
              {analysis.recommendation}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Confidence Level</span>
              <span className="text-2xl font-bold text-white">{analysis.confidence}%</span>
            </div>
            <Progress value={analysis.confidence} className="h-3" />
            <p className="text-xs text-slate-400">Based on {analysis.sampleSize} recent games</p>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-green-400" />
              Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {analysis.hitRate.toFixed(0)}%
            </div>
            <p className="text-xs text-slate-400">
              Hit over {line} in {Math.round(analysis.hitRate * analysis.sampleSize / 100)} of {analysis.sampleSize} games
            </p>
            <Progress value={analysis.hitRate} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Average Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {analysis.avgPerformance.toFixed(1)}
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Line: {line} • Diff: {(analysis.avgPerformance - line).toFixed(1)}
            </p>
            <div className={`text-sm ${
              analysis.avgPerformance > line ? 'text-green-400' : 'text-red-400'
            }`}>
              {analysis.avgPerformance > line ? '✓ Above line' : '✗ Below line'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Factors */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Key Analysis Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    factor.impact === 'positive' ? 'bg-green-500' :
                    factor.impact === 'negative' ? 'bg-red-500' : 'bg-slate-500'
                  }`}></div>
                  <span className="text-slate-300">{factor.name}</span>
                </div>
                <span className="text-white font-semibold">{factor.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Performance */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-400" />
            Last 5 Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.recentPerformances.map((perf, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-slate-400 text-sm w-12">Game {index + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-8 bg-slate-800 rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${
                          perf > line ? 'bg-gradient-to-r from-green-600 to-green-500' :
                          'bg-gradient-to-r from-red-600 to-red-500'
                        }`}
                        style={{ width: `${Math.min((perf / (line * 2)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold w-12 text-right ${
                      perf > line ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {perf.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Line</span>
              <span className="text-white font-semibold">{line}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Tip */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-white font-semibold mb-1">Betting Strategy Tip</h4>
              <p className="text-sm text-blue-300">
                {analysis.confidence >= 70 ?
                  'High confidence play. Consider standard unit sizing.' :
                analysis.confidence >= 60 ?
                  'Moderate confidence. Consider smaller unit or parlay inclusion.' :
                  'Low confidence. Proceed with caution or avoid.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
