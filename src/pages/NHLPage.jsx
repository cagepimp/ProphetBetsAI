import React, { useState, useEffect } from "react";
import { getGames } from "@/api/supabaseClient";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// NHL TEAM DATA - Official team abbreviations and colors
const NHL_TEAMS = {
  'Anaheim Ducks': 'ANA',
  'Arizona Coyotes': 'ARI',
  'Boston Bruins': 'BOS',
  'Buffalo Sabres': 'BUF',
  'Calgary Flames': 'CGY',
  'Carolina Hurricanes': 'CAR',
  'Chicago Blackhawks': 'CHI',
  'Colorado Avalanche': 'COL',
  'Columbus Blue Jackets': 'CBJ',
  'Dallas Stars': 'DAL',
  'Detroit Red Wings': 'DET',
  'Edmonton Oilers': 'EDM',
  'Florida Panthers': 'FLA',
  'Los Angeles Kings': 'LAK',
  'Minnesota Wild': 'MIN',
  'Montreal Canadiens': 'MTL',
  'Nashville Predators': 'NSH',
  'New Jersey Devils': 'NJD',
  'New York Islanders': 'NYI',
  'New York Rangers': 'NYR',
  'Ottawa Senators': 'OTT',
  'Philadelphia Flyers': 'PHI',
  'Pittsburgh Penguins': 'PIT',
  'San Jose Sharks': 'SJS',
  'Seattle Kraken': 'SEA',
  'St. Louis Blues': 'STL',
  'Tampa Bay Lightning': 'TBL',
  'Toronto Maple Leafs': 'TOR',
  'Vancouver Canucks': 'VAN',
  'Vegas Golden Knights': 'VGK',
  'Washington Capitals': 'WSH',
  'Winnipeg Jets': 'WPG'
};

const getTeamLogo = (teamName) => {
  const abbr = NHL_TEAMS[teamName];
  if (!abbr) return null;
  // ESPN NHL logos
  return `https://a.espncdn.com/i/teamlogos/nhl/500/${abbr.toLowerCase()}.png`;
};

const getTeamCode = (teamName) => {
  return NHL_TEAMS[teamName] || teamName?.substring(0, 3).toUpperCase() || 'UNK';
};

export default function NHLPage() {
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
      const nhlGames = await getGames({ sport: 'NHL' });
      setGames(nhlGames || []);
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
      alert('✅ NHL games reloaded from database!\n\nNote: Schedule updates require backend Edge Functions (coming soon)');
    } catch (err) {
      alert(`❌ Failed: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAnalyzeGame = async (game) => {
    alert('⚠️ Game analysis requires backend Edge Functions that are not yet implemented.\n\nFor now, you can view existing game data from the database.');
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-slate-900">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-900 to-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              🏒 NHL
            </h1>
            <p className="text-blue-300 text-sm mt-1">National Hockey League</p>
          </div>
          <Button
            onClick={handleRefreshGames}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh Games
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-200 font-semibold">Error loading NHL games</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Games List */}
        {games.length === 0 ? (
          <div className="bg-slate-800/50 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🏒</div>
            <h2 className="text-2xl font-bold text-white mb-2">No NHL Games Found</h2>
            <p className="text-slate-400 mb-6">
              No upcoming games in the database. Add games or check back later.
            </p>
            <Button onClick={handleRefreshGames} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-blue-500/30 shadow-2xl overflow-hidden hover:border-blue-500/50 transition-all"
              >
                {/* Game Header */}
                <div className="p-4 bg-gradient-to-r from-blue-900/30 via-slate-900/30 to-blue-900/30 border-b border-blue-500/20">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full text-xs font-bold border border-white/20">
                        NHL
                      </span>
                      {game.venue && (
                        <span className="px-2 py-1 bg-slate-700/80 text-slate-300 rounded-full text-xs">
                          {game.venue}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-white text-sm font-semibold">
                        {formatDate(game.game_date || game.commence_time)}
                      </div>
                      <div className="text-blue-300 text-xs">
                        {formatTime(game.game_date || game.commence_time)}
                      </div>
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getTeamLogo(game.away_team) && (
                        <img
                          src={getTeamLogo(game.away_team)}
                          alt={game.away_team}
                          className="w-12 h-12 object-contain"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div>
                        <div className="text-xl font-black text-blue-300">
                          {getTeamCode(game.away_team)}
                        </div>
                        <div className="text-xs text-slate-400">{game.away_team}</div>
                      </div>
                    </div>

                    <div className="text-2xl font-black text-blue-400 px-4">@</div>

                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <div className="text-right">
                        <div className="text-xl font-black text-cyan-300">
                          {getTeamCode(game.home_team)}
                        </div>
                        <div className="text-xs text-slate-400">{game.home_team}</div>
                      </div>
                      {getTeamLogo(game.home_team) && (
                        <img
                          src={getTeamLogo(game.home_team)}
                          alt={game.home_team}
                          className="w-12 h-12 object-contain"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Odds */}
                {game.markets && (
                  <div className="p-4 bg-slate-900/40">
                    <div className="grid grid-cols-3 gap-4">
                      {/* Moneyline */}
                      <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-slate-400 text-xs font-semibold mb-2 uppercase">Moneyline</div>
                        <div className="space-y-1">
                          {game.markets?.moneyline?.draftkings && (
                            <div className="flex justify-between text-sm">
                              <span className="text-emerald-400 font-bold">DK:</span>
                              <span className="text-white">
                                {formatOdds(game.markets.moneyline.draftkings.find(o => o.name === game.away_team)?.price)} /
                                {formatOdds(game.markets.moneyline.draftkings.find(o => o.name === game.home_team)?.price)}
                              </span>
                            </div>
                          )}
                          {game.markets?.moneyline?.fanduel && (
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-400 font-bold">FD:</span>
                              <span className="text-white">
                                {formatOdds(game.markets.moneyline.fanduel.find(o => o.name === game.away_team)?.price)} /
                                {formatOdds(game.markets.moneyline.fanduel.find(o => o.name === game.home_team)?.price)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Puck Line (Spread) */}
                      <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-slate-400 text-xs font-semibold mb-2 uppercase">Puck Line</div>
                        <div className="space-y-1">
                          {game.markets?.spread?.draftkings && (
                            <div className="flex justify-between text-sm">
                              <span className="text-emerald-400 font-bold">DK:</span>
                              <span className="text-white">
                                {game.markets.spread.draftkings.find(o => o.name === game.away_team)?.point || '-'}
                              </span>
                            </div>
                          )}
                          {game.markets?.spread?.fanduel && (
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-400 font-bold">FD:</span>
                              <span className="text-white">
                                {game.markets.spread.fanduel.find(o => o.name === game.away_team)?.point || '-'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-slate-400 text-xs font-semibold mb-2 uppercase">Total</div>
                        <div className="space-y-1">
                          {game.markets?.total?.draftkings && (
                            <div className="flex justify-between text-sm">
                              <span className="text-emerald-400 font-bold">DK:</span>
                              <span className="text-white">
                                O/U {game.markets.total.draftkings.find(o => o.name === 'Over')?.point || '-'}
                              </span>
                            </div>
                          )}
                          {game.markets?.total?.fanduel && (
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-400 font-bold">FD:</span>
                              <span className="text-white">
                                O/U {game.markets.total.fanduel.find(o => o.name === 'Over')?.point || '-'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 bg-slate-900/20">
                  <Button
                    onClick={() => handleAnalyzeGame(game)}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold"
                  >
                    🏒 Analyze Game
                  </Button>
                </div>

                {/* Footer */}
                {game.status && (
                  <div className="px-4 pb-3">
                    <div className="flex justify-between items-center text-xs">
                      <div className="text-slate-500 font-mono">Game ID: {game.id}</div>
                      <div className={`font-semibold uppercase ${
                        game.status === 'scheduled' ? 'text-green-400' :
                        game.status === 'live' ? 'text-blue-400 animate-pulse' :
                        game.status === 'completed' ? 'text-slate-400' :
                        'text-yellow-400'
                      }`}>
                        {game.status}
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
          <div className="mt-8 bg-slate-800/50 rounded-lg p-4 border border-blue-500/30">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-black text-blue-400">{games.length}</div>
                <div className="text-xs text-slate-400 uppercase">Total Games</div>
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
