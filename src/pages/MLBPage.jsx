
import React, { useState, useEffect } from "react";
import { supabase, getGames } from "@/api/supabaseClient";
import { Loader2, RefreshCw, AlertCircle, Brain, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMLBTeamLogo, getMLBTeamCode } from "@/components/data/MLB_TEAMS";

export default function MLBPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analyzingGames, setAnalyzingGames] = useState({});
  const [analysisResults, setAnalysisResults] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const mlbGames = await getGames({ sport: 'MLB' });
      setGames(mlbGames);
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
    } catch (err) {
      alert(`❌ Failed: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAnalyzeGame = async (game) => {
    // Edge Functions not implemented yet
    alert('⚠️ Analysis feature coming soon! Edge Functions are not yet deployed.');
  };

  const formatOdds = (odds) => {
    if (!odds || odds === 0) return '-';
    return odds > 0 ? `+${odds}` : odds;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-green-900 to-blue-800 min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-white"> MLB</h1>
          <Button onClick={handleRefreshGames} disabled={isRefreshing} className="bg-green-600 hover:bg-green-700">
            {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh Games
          </Button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
          </div>
        ) : games.length > 0 ? (
          <div className="space-y-6">
            {games.map((game, idx) => {
              if (!game) return null;
              
              const awayTeam = game.away_team || 'AWAY';
              const homeTeam = game.home_team || 'HOME';
              const gameId = game.id || `game-${idx}`;
              const awayCode = getMLBTeamCode(awayTeam);
              const homeCode = getMLBTeamCode(homeTeam);
              const awayLogo = getMLBTeamLogo(awayCode);
              const homeLogo = getMLBTeamLogo(homeCode);
              
              return (
                <div key={gameId} className="bg-slate-900 rounded-2xl overflow-hidden border-2 border-green-500/40 shadow-2xl">
                  {/* HEADER */}
                  <div className="p-6 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
                    <div className="flex items-center gap-4 mb-3">
                      <img src={awayLogo} alt={awayTeam} className="w-16 h-16 drop-shadow-lg" />
                      <div className="flex-1">
                        <div className="text-4xl font-black text-white drop-shadow-lg">{awayTeam}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">AWAY</div>
                      </div>
                    </div>
                    
                    <div className="text-center my-4">
                      <span className="text-green-400 text-3xl font-black drop-shadow-lg">@</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <img src={homeLogo} alt={homeTeam} className="w-16 h-16 drop-shadow-lg" />
                      <div className="flex-1">
                        <div className="text-4xl font-black text-white drop-shadow-lg">{homeTeam}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">HOME</div>
                      </div>
                    </div>

                    {game.commence_time && (
                      <div className="text-center mt-4 text-slate-300 text-sm font-semibold">
                        {new Date(game.commence_time).toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric'
                        })}  {new Date(game.commence_time).toLocaleTimeString('en-US', {
                          hour: 'numeric', minute: '2-digit', hour12: true
                        })} EST
                      </div>
                    )}
                  </div>

                  {/* BUTTONS */}
                  <div className="p-4 bg-slate-900/50">
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <button
                        onClick={() => handleAnalyzeGame(game)}
                        disabled={analyzingGames[gameId]}
                        className="bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 disabled:opacity-50 text-white font-bold py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg"
                      >
                        {analyzingGames[gameId] ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /><span>Analyzing...</span></>
                        ) : (
                          <><Brain className="w-4 h-4" /><span>Analyze</span></>
                        )}
                      </button>
                      
                      <button disabled className="bg-slate-700/30 opacity-40 text-slate-500 font-bold py-3 px-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                        <Users className="w-4 h-4" /><span>Player Props</span>
                      </button>
                      
                      <button disabled className="bg-slate-700/30 opacity-40 text-slate-500 font-bold py-3 px-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4" /><span>Team Props</span>
                      </button>
                    </div>

                    <div className="text-green-400 font-mono text-xs font-black drop-shadow-lg">
                      ID: {gameId}
                    </div>
                  </div>

                  {/* ANALYSIS */}
                  {analysisResults[gameId]?.data && (
                    <div className="border-t-2 border-slate-700/50 bg-slate-900/60 p-6">
                      <h3 className="text-2xl font-black text-green-400 mb-4 drop-shadow-lg"> Analysis</h3>
                      
                      {analysisResults[gameId].data.the_edge && (
                        <div className="mb-4 p-4 bg-yellow-900/30 rounded-xl border-2 border-yellow-600/40">
                          <div className="text-yellow-400 font-bold text-lg mb-2"> THE EDGE</div>
                          <p className="text-white">{analysisResults[gameId].data.the_edge}</p>
                        </div>
                      )}
                      
                      {analysisResults[gameId].data.prediction && (
                        <div className="mb-4 p-4 bg-green-900/30 rounded-xl border-2 border-green-600/40">
                          <div className="text-green-400 font-bold text-lg mb-2"> PREDICTION</div>
                          <p className="text-white">Winner: <span className="text-green-400 font-black text-xl">{analysisResults[gameId].data.prediction.winner}</span></p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-800 rounded-xl">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <p className="text-green-400 text-xl font-bold mb-4">No MLB games available</p>
            <Button onClick={handleRefreshGames} disabled={isRefreshing} className="bg-green-600 hover:bg-green-700 px-8 py-6">
              {isRefreshing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Loading...</> : <><RefreshCw className="w-5 h-5 mr-2" />Load Games</>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
