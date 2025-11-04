import React, { useState, useEffect } from "react";
import { getGames } from "@/api/supabaseClient";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UFCPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const ufcGames = await getGames({ sport: 'UFC' });
      setGames(ufcGames || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleRefreshGames = async () => {
    setIsRefreshing(true);
    try {
      await fetchData();
      alert('✅ UFC fights reloaded from database!\n\nNote: Schedule updates require backend Edge Functions (coming soon)');
    } catch (err) {
      alert(`❌ Failed: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAnalyzeFight = async (fight) => {
    alert('⚠️ Fight analysis requires backend Edge Functions that are not yet implemented.\n\nFor now, you can view existing fight data from the database.');
  };

  const formatOdds = (odds) => {
    if (!odds || odds === 0) return '-';
    return odds > 0 ? `+${odds}` : odds;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 to-slate-900">
        <Loader2 className="w-12 h-12 text-red-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-red-900 to-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              🥊 UFC
            </h1>
            <p className="text-red-300 text-sm mt-1">Mixed Martial Arts Fights</p>
          </div>
          <Button
            onClick={handleRefreshGames}
            disabled={isRefreshing}
            className="bg-red-600 hover:bg-red-700"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh Fights
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-200 font-semibold">Error loading UFC fights</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Games List */}
        {games.length === 0 ? (
          <div className="bg-slate-800/50 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🥊</div>
            <h2 className="text-2xl font-bold text-white mb-2">No UFC Fights Found</h2>
            <p className="text-slate-400 mb-6">
              No upcoming fights in the database. Add fights or check back later.
            </p>
            <Button onClick={handleRefreshGames} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((fight) => (
              <div
                key={fight.id}
                className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-red-500/30 shadow-2xl overflow-hidden hover:border-red-500/50 transition-all"
              >
                {/* Fight Header */}
                <div className="p-4 bg-gradient-to-r from-red-900/30 via-slate-900/30 to-red-900/30 border-b border-red-500/20">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-xs font-bold border border-white/20">
                        UFC
                      </span>
                      {fight.venue && (
                        <span className="px-2 py-1 bg-slate-700/80 text-slate-300 rounded-full text-xs">
                          {fight.venue}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-white text-sm font-semibold">
                        {formatDate(fight.game_date || fight.commence_time)}
                      </div>
                      <div className="text-red-300 text-xs">
                        {formatTime(fight.game_date || fight.commence_time)}
                      </div>
                    </div>
                  </div>

                  {/* Fighters */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center flex-1">
                      <div className="text-2xl font-black text-red-300">
                        {fight.away_team}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Fighter 1</div>
                    </div>

                    <div className="text-4xl font-black text-red-500">VS</div>

                    <div className="text-center flex-1">
                      <div className="text-2xl font-black text-red-300">
                        {fight.home_team}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Fighter 2</div>
                    </div>
                  </div>
                </div>

                {/* Odds */}
                {fight.markets && (
                  <div className="p-4 bg-slate-900/40">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Moneyline */}
                      <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-slate-400 text-xs font-semibold mb-2 uppercase">Moneyline</div>
                        <div className="space-y-1">
                          {fight.markets?.moneyline?.draftkings && (
                            <div className="flex justify-between text-sm">
                              <span className="text-emerald-400 font-bold">DK:</span>
                              <span className="text-white">
                                {formatOdds(fight.markets.moneyline.draftkings.find(o => o.name === fight.away_team)?.price)} /
                                {formatOdds(fight.markets.moneyline.draftkings.find(o => o.name === fight.home_team)?.price)}
                              </span>
                            </div>
                          )}
                          {fight.markets?.moneyline?.fanduel && (
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-400 font-bold">FD:</span>
                              <span className="text-white">
                                {formatOdds(fight.markets.moneyline.fanduel.find(o => o.name === fight.away_team)?.price)} /
                                {formatOdds(fight.markets.moneyline.fanduel.find(o => o.name === fight.home_team)?.price)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Fight Props */}
                      <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-slate-400 text-xs font-semibold mb-2 uppercase">Fight Props</div>
                        <div className="text-slate-500 text-xs">
                          Method of Victory, Total Rounds, etc.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 bg-slate-900/20">
                  <Button
                    onClick={() => handleAnalyzeFight(fight)}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold"
                  >
                    🥊 Analyze Fight
                  </Button>
                </div>

                {/* Footer */}
                {fight.status && (
                  <div className="px-4 pb-3">
                    <div className="flex justify-between items-center text-xs">
                      <div className="text-slate-500 font-mono">Fight ID: {fight.id}</div>
                      <div className={`font-semibold uppercase ${
                        fight.status === 'scheduled' ? 'text-green-400' :
                        fight.status === 'live' ? 'text-red-400 animate-pulse' :
                        fight.status === 'completed' ? 'text-slate-400' :
                        'text-yellow-400'
                      }`}>
                        {fight.status}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {games.length > 0 && (
          <div className="mt-8 bg-slate-800/50 rounded-lg p-4 border border-red-500/30">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-black text-red-400">{games.length}</div>
                <div className="text-xs text-slate-400 uppercase">Total Fights</div>
              </div>
              <div>
                <div className="text-3xl font-black text-green-400">
                  {games.filter(g => g.status === 'scheduled').length}
                </div>
                <div className="text-xs text-slate-400 uppercase">Upcoming</div>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-400">
                  {games.filter(g => g.status === 'completed').length}
                </div>
                <div className="text-xs text-slate-400 uppercase">Completed</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
