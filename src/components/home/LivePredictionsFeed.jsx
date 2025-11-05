import React, { useState, useEffect } from 'react';
import { getGames } from '@/api/supabaseClient';
import { TrendingUp, Target, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LivePredictionsFeed() {
  const [topPicks, setTopPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTopPicks();
  }, []);

  const loadTopPicks = async () => {
    try {
      setLoading(true);

      // Fetch today's analyzed games with high confidence
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // Get games from today with high confidence (65%+)
      const games = await getGames({
        game_date: { $gte: today },
        'analysis.prediction.confidence': { $gte: 65 }
      });

      // Sort by confidence and limit to 6
      const sortedGames = games
        .sort((a, b) => (b.analyzer_confidence || 0) - (a.analyzer_confidence || 0))
        .slice(0, 6);

      setTopPicks(sortedGames || []);
    } catch (err) {
      console.error('Error loading top picks:', err);
      // Don't set error state for auth errors - just show empty state
      setTopPicks([]);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 75) return { color: 'bg-green-500', label: 'High' };
    if (confidence >= 65) return { color: 'bg-yellow-500', label: 'Medium' };
    return { color: 'bg-orange-500', label: 'Low' };
  };

  const getSportEmoji = (sport) => {
    const sportMap = {
      'NFL': '🏈',
      'CFB': '🎓',
      'NBA': '🏀',
      'MLB': '⚾',
      'UFC': '🥊',
      'GOLF': '⛳'
    };
    return sportMap[sport?.toUpperCase()] || '🏆';
  };

  if (loading) {
    return (
      <Card className="bg-purple-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Today's Top Picks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || topPicks.length === 0) {
    return (
      <Card className="bg-purple-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Today's Top Picks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-300 text-center py-4">
            {error ? 'Unable to load predictions' : 'No high-confidence picks available yet'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-purple-900/20 border-purple-500/30 hover:border-purple-400/50 transition-all">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
          Today's Top Picks
          <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
            {topPicks.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topPicks.map((game, index) => {
          const analysis = game.analysis?.prediction || {};
          const confidence = Math.round((analysis.spread_confidence + analysis.total_confidence) / 2) || 0;
          const badge = getConfidenceBadge(confidence);

          return (
            <div
              key={game.id || index}
              className="bg-purple-800/30 rounded-lg p-4 border border-purple-500/20 hover:border-purple-400/40 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getSportEmoji(game.sport)}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {game.away_team} @ {game.home_team}
                    </p>
                    <p className="text-purple-300 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(game.game_date || game.commence_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <Badge className={`${badge.color} text-white border-0`}>
                  {confidence}%
                </Badge>
              </div>

              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-purple-500/20">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-purple-200 text-xs">
                  {analysis.recommended_bet || 'Analysis available'}
                </span>
                <TrendingUp className="w-3 h-3 text-green-400 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}

        <button
          onClick={loadTopPicks}
          className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Refresh Picks
        </button>
      </CardContent>
    </Card>
  );
}
