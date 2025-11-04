import React, { useState, useEffect } from 'react';
import { getPredictions } from '@/api/supabaseClient';
import { TrendingUp, Award, Target, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PerformanceTracker() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceStats();
  }, []);

  const loadPerformanceStats = async () => {
    try {
      setLoading(true);

      // Get predictions from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const predictions = await getPredictions({
        created_at: { $gte: thirtyDaysAgo.toISOString() },
        result: { $exists: true }
      });

      // Calculate stats
      const total = predictions?.length || 0;
      const correct = predictions?.filter(p => p.result === 'correct' || p.result === 'win').length || 0;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

      // Last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentPredictions = predictions?.filter(
        p => new Date(p.created_at) >= sevenDaysAgo
      ) || [];
      const recentTotal = recentPredictions.length;
      const recentCorrect = recentPredictions.filter(
        p => p.result === 'correct' || p.result === 'win'
      ).length;
      const recentAccuracy = recentTotal > 0 ? Math.round((recentCorrect / recentTotal) * 100) : 0;

      // Find best sport
      const sportStats = {};
      predictions?.forEach(p => {
        const sport = p.sport || 'Unknown';
        if (!sportStats[sport]) {
          sportStats[sport] = { total: 0, correct: 0 };
        }
        sportStats[sport].total++;
        if (p.result === 'correct' || p.result === 'win') {
          sportStats[sport].correct++;
        }
      });

      let bestSport = 'N/A';
      let bestAccuracy = 0;
      Object.entries(sportStats).forEach(([sport, { total, correct }]) => {
        if (total >= 5) {  // At least 5 predictions
          const acc = (correct / total) * 100;
          if (acc > bestAccuracy) {
            bestAccuracy = acc;
            bestSport = sport;
          }
        }
      });

      setStats({
        overall: {
          total,
          correct,
          accuracy
        },
        recent: {
          total: recentTotal,
          correct: recentCorrect,
          accuracy: recentAccuracy
        },
        bestSport: {
          name: bestSport,
          accuracy: Math.round(bestAccuracy)
        }
      });
    } catch (err) {
      console.error('Error loading performance stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-purple-900/20 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-purple-700/30 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-purple-700/30 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-purple-300 py-8">
        <p>No performance data available yet</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Overall Accuracy */}
      <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30 hover:border-green-400/50 transition-all">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-purple-200 text-sm">Overall Accuracy</p>
              <p className="text-white text-xs text-purple-300">Last 30 Days</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-green-400">
              {stats.overall.accuracy}%
            </span>
            <span className="text-purple-300 text-sm">
              {stats.overall.correct}/{stats.overall.total}
            </span>
          </div>
          <div className="mt-3 h-2 bg-purple-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000"
              style={{ width: `${stats.overall.accuracy}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Form */}
      <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/30 hover:border-cyan-400/50 transition-all">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-purple-200 text-sm">Recent Form</p>
              <p className="text-white text-xs text-purple-300">Last 7 Days</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-cyan-400">
              {stats.recent.accuracy}%
            </span>
            <span className="text-purple-300 text-sm">
              {stats.recent.correct}/{stats.recent.total}
            </span>
          </div>
          <div className="mt-3">
            {stats.recent.accuracy >= stats.overall.accuracy ? (
              <div className="flex items-center gap-1 text-green-400 text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>Trending up</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-yellow-400 text-xs">
                <BarChart3 className="w-3 h-3" />
                <span>Recalibrating</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Best Sport */}
      <Card className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 border-pink-500/30 hover:border-pink-400/50 transition-all">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <p className="text-purple-200 text-sm">Top Performing</p>
              <p className="text-white text-xs text-purple-300">Best Sport</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-pink-400">
              {stats.bestSport.accuracy}%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-purple-200 text-sm font-semibold">
              {stats.bestSport.name}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
