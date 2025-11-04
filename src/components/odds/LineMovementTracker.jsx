import React, { useState, useEffect } from 'react';
import { getLineHistory } from '@/api/supabaseClient';
import { TrendingUp, TrendingDown, Clock, Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LineMovementTracker({ game }) {
  const [lineHistory, setLineHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState('draftkings');
  const [selectedMarket, setSelectedMarket] = useState('spread');

  useEffect(() => {
    if (game?.id) {
      loadLineHistory();
    }
  }, [game?.id, selectedBook, selectedMarket]);

  const loadLineHistory = async () => {
    if (!game?.id) return;

    try {
      setLoading(true);

      // Fetch line history from the last 24 hours
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const history = await getLineHistory({
        game_id: game.id,
        sportsbook: selectedBook,
        market_type: selectedMarket,
        timestamp: { $gte: dayAgo.toISOString() }
      });

      setLineHistory(history || []);
    } catch (err) {
      console.error('Error loading line history:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMovement = () => {
    if (lineHistory.length < 2) return null;

    const first = lineHistory[0];
    const last = lineHistory[lineHistory.length - 1];

    let movement = {};

    if (selectedMarket === 'spread') {
      const firstLine = first.home_line || 0;
      const lastLine = last.home_line || 0;
      const diff = lastLine - firstLine;

      movement = {
        direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
        amount: Math.abs(diff),
        percentage: firstLine !== 0 ? (Math.abs(diff) / Math.abs(firstLine)) * 100 : 0
      };
    } else if (selectedMarket === 'total') {
      const firstLine = first.total_line || 0;
      const lastLine = last.total_line || 0;
      const diff = lastLine - firstLine;

      movement = {
        direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
        amount: Math.abs(diff),
        percentage: firstLine !== 0 ? (Math.abs(diff) / firstLine) * 100 : 0
      };
    } else {
      // moneyline
      const firstOdds = first.home_odds || 0;
      const lastOdds = last.home_odds || 0;
      const diff = lastOdds - firstOdds;

      movement = {
        direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
        amount: Math.abs(diff),
        percentage: firstOdds !== 0 ? (Math.abs(diff) / Math.abs(firstOdds)) * 100 : 0
      };
    }

    return movement;
  };

  const renderLineChart = () => {
    if (lineHistory.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-slate-400">
          <p>No line history available</p>
        </div>
      );
    }

    // Simple visual representation
    const dataPoints = lineHistory.slice(-10); // Last 10 data points
    const maxValue = Math.max(...dataPoints.map(d =>
      selectedMarket === 'spread' ? Math.abs(d.home_line || 0) :
      selectedMarket === 'total' ? (d.total_line || 0) :
      Math.abs(d.home_odds || 0)
    ));
    const minValue = Math.min(...dataPoints.map(d =>
      selectedMarket === 'spread' ? Math.abs(d.home_line || 0) :
      selectedMarket === 'total' ? (d.total_line || 0) :
      Math.abs(d.home_odds || 0)
    ));

    const range = maxValue - minValue || 1;

    return (
      <div className="relative h-48 pt-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-slate-400">
          <span>{maxValue.toFixed(1)}</span>
          <span>{((maxValue + minValue) / 2).toFixed(1)}</span>
          <span>{minValue.toFixed(1)}</span>
        </div>

        {/* Chart area */}
        <div className="ml-12 h-full flex items-end justify-between gap-2 border-l border-b border-slate-700">
          {dataPoints.map((point, index) => {
            const value = selectedMarket === 'spread' ? Math.abs(point.home_line || 0) :
                         selectedMarket === 'total' ? (point.total_line || 0) :
                         Math.abs(point.home_odds || 0);

            const height = ((value - minValue) / range) * 100;
            const isRecent = index >= dataPoints.length - 2;

            return (
              <div
                key={point.id || index}
                className="flex-1 flex flex-col items-center group relative"
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    isRecent ? 'bg-gradient-to-t from-purple-600 to-pink-600' : 'bg-slate-600'
                  } group-hover:opacity-80`}
                  style={{ height: `${height}%`, minHeight: '4px' }}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                  <div className="text-white font-semibold">{value.toFixed(1)}</div>
                  <div className="text-slate-400">
                    {new Date(point.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis */}
        <div className="ml-12 mt-2 flex justify-between text-xs text-slate-400">
          <span>
            {dataPoints.length > 0 && new Date(dataPoints[0].timestamp).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit'
            })}
          </span>
          <span>Now</span>
        </div>
      </div>
    );
  };

  const movement = calculateMovement();

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5 text-cyan-400" />
            Line Movement
            {movement && (
              <Badge className={`ml-2 ${
                movement.direction === 'up' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                movement.direction === 'down' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }`}>
                {movement.direction === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                {movement.direction === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                {movement.amount.toFixed(1)} ({movement.percentage.toFixed(1)}%)
              </Badge>
            )}
          </CardTitle>
          <button
            onClick={loadLineHistory}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          {/* Market selector */}
          <div className="flex gap-1">
            {['spread', 'total', 'moneyline'].map(market => (
              <button
                key={market}
                onClick={() => setSelectedMarket(market)}
                className={`px-3 py-1.5 rounded text-xs font-semibold capitalize transition-all ${
                  selectedMarket === market
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {market}
              </button>
            ))}
          </div>

          {/* Sportsbook selector */}
          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-slate-600"
          >
            <option value="draftkings">DraftKings</option>
            <option value="fanduel">FanDuel</option>
            <option value="betmgm">BetMGM</option>
            <option value="caesars">Caesars</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        {loading && lineHistory.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        ) : (
          <>
            {renderLineChart()}

            {/* Movement Summary */}
            {lineHistory.length > 0 && (
              <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Last 24 Hours</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-400">Opening</div>
                    <div className="text-white font-semibold">
                      {lineHistory[0] && (
                        selectedMarket === 'spread' ? lineHistory[0].home_line?.toFixed(1) :
                        selectedMarket === 'total' ? lineHistory[0].total_line?.toFixed(1) :
                        lineHistory[0].home_odds
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Current</div>
                    <div className="text-white font-semibold">
                      {lineHistory[lineHistory.length - 1] && (
                        selectedMarket === 'spread' ? lineHistory[lineHistory.length - 1].home_line?.toFixed(1) :
                        selectedMarket === 'total' ? lineHistory[lineHistory.length - 1].total_line?.toFixed(1) :
                        lineHistory[lineHistory.length - 1].home_odds
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Updates</div>
                    <div className="text-white font-semibold">
                      {lineHistory.length}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
