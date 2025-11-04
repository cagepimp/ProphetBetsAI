import React, { useState, useEffect } from "react";
import { supabase, getGames } from "@/api/supabaseClient";
import { Loader2, RefreshCw, AlertCircle, Brain, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { POWER_5_CFB_TEAMS } from "@/components/data/POWER_5_CFB_TEAMS";

// Helper functions to get team data
const getCFBTeam = (teamName) => {
  if (!teamName) return null;
  
  // Try exact match first
  if (POWER_5_CFB_TEAMS[teamName]) {
    return POWER_5_CFB_TEAMS[teamName];
  }
  
  // Try to find by partial match (handles "Georgia" vs "Georgia Bulldogs")
  const teamKey = Object.keys(POWER_5_CFB_TEAMS).find(key => 
    key.toLowerCase().includes(teamName.toLowerCase()) ||
    teamName.toLowerCase().includes(key.toLowerCase())
  );
  
  return teamKey ? POWER_5_CFB_TEAMS[teamKey] : null;
};

const getCFBTeamLogo = (teamName) => {
  const team = getCFBTeam(teamName);
  return team?.logo || '';
};

const getCFBTeamCode = (teamName) => {
  const team = getCFBTeam(teamName);
  return team?.code || teamName?.substring(0, 4).toUpperCase() || 'TBD';
};

const getCFBTeamColors = (teamName) => {
  const team = getCFBTeam(teamName);
  return {
    primary: team?.primaryColor || '#FF6B35',
    secondary: team?.secondaryColor || '#F7931E'
  };
};

export default function CFBPage() {
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
      const cfbGames = await getGames({ sport: 'CFB' });
      setGames(cfbGames || []);
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
      alert('✅ CFB games reloaded from database!\n\nNote: Schedule updates require backend Edge Functions (coming soon)');
    } catch (err) {
      alert(`❌ Failed: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAnalyzeGame = async (game) => {
    if (!game || !game.id) return;
    alert('⚠️ Game analysis requires backend Edge Functions that are not yet implemented.\n\nFor now, you can view existing game data from the database.');
  };

  const formatOdds = (odds) => {
    if (!odds || odds === 0) return '-';
    return odds > 0 ? `+${odds}` : odds;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-orange-900 to-red-800 min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-white">🏈 CFB</h1>
          <Button onClick={handleRefreshGames} disabled={isRefreshing} className="bg-orange-600 hover:bg-orange-700">
            {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh Games
          </Button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        ) : games.length > 0 ? (
          <div className="space-y-6">
            {games.map((game, idx) => {
              if (!game) return null;
              
              const awayTeam = game.away_team || 'Away Team';
              const homeTeam = game.home_team || 'Home Team';
              const gameId = game.id || `game-${idx}`;
              
              const awayCode = getCFBTeamCode(awayTeam);
              const homeCode = getCFBTeamCode(homeTeam);
              const awayColors = getCFBTeamColors(awayTeam);
              const homeColors = getCFBTeamColors(homeTeam);
              const awayLogo = getCFBTeamLogo(awayTeam);
              const homeLogo = getCFBTeamLogo(homeTeam);
              
              // Get odds - handle both market formats
              const getOddsFromMarkets = (market, book) => game.markets?.[market]?.[book] || [];
              const dkBookmaker = game.bookmakers?.find(b => b.key === 'draftkings');
              const fdBookmaker = game.bookmakers?.find(b => b.key === 'fanduel');
              
              let dkML, fdML, dkSpread, fdSpread, dkTotal, fdTotal;
              
              if (game.markets) {
                dkML = getOddsFromMarkets('moneyline', 'draftkings');
                fdML = getOddsFromMarkets('moneyline', 'fanduel');
                dkSpread = getOddsFromMarkets('spread', 'draftkings');
                fdSpread = getOddsFromMarkets('spread', 'fanduel');
                dkTotal = getOddsFromMarkets('total', 'draftkings');
                fdTotal = getOddsFromMarkets('total', 'fanduel');
              } else if (game.bookmakers) {
                dkML = dkBookmaker?.markets?.find(m => m.key === 'h2h')?.outcomes || [];
                fdML = fdBookmaker?.markets?.find(m => m.key === 'h2h')?.outcomes || [];
                dkSpread = dkBookmaker?.markets?.find(m => m.key === 'spreads')?.outcomes || [];
                fdSpread = fdBookmaker?.markets?.find(m => m.key === 'spreads')?.outcomes || [];
                dkTotal = dkBookmaker?.markets?.find(m => m.key === 'totals')?.outcomes || [];
                fdTotal = fdBookmaker?.markets?.find(m => m.key === 'totals')?.outcomes || [];
              }
              
              const getTeamOdds = (oddsArray, teamName) => {
                if (!oddsArray || oddsArray.length === 0) return null;
                let odds = oddsArray.find(o => o.name === teamName);
                if (!odds && teamName === awayTeam) odds = oddsArray[0];
                if (!odds && teamName === homeTeam) odds = oddsArray[1];
                return odds;
              };
              
              const awayML_DK = getTeamOdds(dkML, awayTeam);
              const homeML_DK = getTeamOdds(dkML, homeTeam);
              const awayML_FD = getTeamOdds(fdML, awayTeam);
              const homeML_FD = getTeamOdds(fdML, homeTeam);
              const awaySpread_DK = getTeamOdds(dkSpread, awayTeam);
              const homeSpread_DK = getTeamOdds(dkSpread, homeTeam);
              const awaySpread_FD = getTeamOdds(fdSpread, awayTeam);
              const homeSpread_FD = getTeamOdds(fdSpread, homeTeam);
              const over_DK = dkTotal?.find?.(o => o.name === 'Over') || dkTotal?.[0];
              const under_DK = dkTotal?.find?.(o => o.name === 'Under') || dkTotal?.[1];
              const over_FD = fdTotal?.find?.(o => o.name === 'Over') || fdTotal?.[0];
              const under_FD = fdTotal?.find?.(o => o.name === 'Under') || fdTotal?.[1];
              
              const hasOdds = (dkML?.length > 0 || fdML?.length > 0);
              
              return (
                <div key={gameId} className="bg-slate-900 rounded-2xl overflow-hidden border-2 border-orange-500/40 shadow-2xl">
                  
                  {/* TEAM MATCHUP */}
                  <div className="p-6 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
                    
                    {/* AWAY TEAM */}
                    <div className="flex items-center gap-4 mb-3">
                      {awayLogo ? (
                        <img 
                          src={awayLogo} 
                          alt={`${awayTeam} logo`}
                          className="w-16 h-16 drop-shadow-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div className="text-6xl drop-shadow-lg" style={{ display: awayLogo ? 'none' : 'block' }}>🏈</div>
                      <div className="flex-1">
                        <div className="text-4xl font-black tracking-tight drop-shadow-lg" style={{
                          color: awayColors.primary,
                          textShadow: `0 0 20px ${awayColors.primary}40`
                        }}>
                          {awayTeam}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">AWAY</div>
                      </div>
                    </div>
                    
                    <div className="text-center my-4">
                      <span className="text-orange-400 text-3xl font-black drop-shadow-lg">@</span>
                    </div>
                    
                    {/* HOME TEAM */}
                    <div className="flex items-center gap-4 mb-4">
                      {homeLogo ? (
                        <img 
                          src={homeLogo} 
                          alt={`${homeTeam} logo`}
                          className="w-16 h-16 drop-shadow-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div className="text-6xl drop-shadow-lg" style={{ display: homeLogo ? 'none' : 'block' }}>🏈</div>
                      <div className="flex-1">
                        <div className="text-4xl font-black tracking-tight drop-shadow-lg" style={{
                          color: homeColors.primary,
                          textShadow: `0 0 20px ${homeColors.primary}40`
                        }}>
                          {homeTeam}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">HOME</div>
                      </div>
                    </div>

                    {game.commence_time && (
                      <div className="text-center mt-4 text-slate-300 text-sm font-semibold">
                        {new Date(game.commence_time).toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric'
                        })} • {new Date(game.commence_time).toLocaleTimeString('en-US', {
                          hour: 'numeric', minute: '2-digit', hour12: true
                        })} EST
                      </div>
                    )}
                  </div>

                  {/* ODDS SECTION */}
                  <div className="p-4 bg-slate-900/50">
                    {hasOdds ? (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        
                        {/* DRAFTKINGS */}
                        <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 rounded-xl p-3 border-2 border-emerald-500/50">
                          <div className="text-center mb-3">
                            <div className="text-emerald-400 font-black text-base tracking-wider">DRAFTKINGS</div>
                          </div>
                          
                          <div className="bg-slate-900/60 rounded-lg p-3 mb-2">
                            <div className="text-slate-300 text-xs font-bold mb-2 text-center">MONEYLINE</div>
                            <div className="flex justify-between mb-1">
                              <span className="text-white font-bold">{awayCode}</span>
                              <span className="text-emerald-400 font-black text-xl">{formatOdds(awayML_DK?.price)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white font-bold">{homeCode}</span>
                              <span className="text-emerald-400 font-black text-xl">{formatOdds(homeML_DK?.price)}</span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-900/60 rounded-lg p-3 mb-2">
                            <div className="text-slate-300 text-xs font-bold mb-2 text-center">SPREAD</div>
                            <div className="flex justify-between mb-1">
                              <span className="text-white font-bold">{awayCode}</span>
                              <span className="text-emerald-400 font-bold">
                                {awaySpread_DK?.point ? `${awaySpread_DK.point > 0 ? '+' : ''}${awaySpread_DK.point}` : '-'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white font-bold">{homeCode}</span>
                              <span className="text-emerald-400 font-bold">
                                {homeSpread_DK?.point ? `${homeSpread_DK.point > 0 ? '+' : ''}${homeSpread_DK.point}` : '-'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-900/60 rounded-lg p-3">
                            <div className="text-slate-300 text-xs font-bold mb-2 text-center">TOTAL</div>
                            <div className="flex justify-between mb-1">
                              <span className="text-white font-bold">O {over_DK?.point || '-'}</span>
                              <span className="text-emerald-400 font-black text-xl">{formatOdds(over_DK?.price)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white font-bold">U {under_DK?.point || '-'}</span>
                              <span className="text-emerald-400 font-black text-xl">{formatOdds(under_DK?.price)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* FANDUEL */}
                        <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-xl p-3 border-2 border-blue-500/50">
                          <div className="text-center mb-3">
                            <div className="text-blue-400 font-black text-base tracking-wider">FANDUEL</div>
                          </div>
                          
                          <div className="bg-slate-900/60 rounded-lg p-3 mb-2">
                            <div className="text-slate-300 text-xs font-bold mb-2 text-center">MONEYLINE</div>
                            <div className="flex justify-between mb-1">
                              <span className="text-white font-bold">{awayCode}</span>
                              <span className="text-blue-400 font-black text-xl">{formatOdds(awayML_FD?.price)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white font-bold">{homeCode}</span>
                              <span className="text-blue-400 font-black text-xl">{formatOdds(homeML_FD?.price)}</span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-900/60 rounded-lg p-3 mb-2">
                            <div className="text-slate-300 text-xs font-bold mb-2 text-center">SPREAD</div>
                            <div className="flex justify-between mb-1">
                              <span className="text-white font-bold">{awayCode}</span>
                              <span className="text-blue-400 font-bold">
                                {awaySpread_FD?.point ? `${awaySpread_FD.point > 0 ? '+' : ''}${awaySpread_FD.point}` : '-'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white font-bold">{homeCode}</span>
                              <span className="text-blue-400 font-bold">
                                {homeSpread_FD?.point ? `${homeSpread_FD.point > 0 ? '+' : ''}${homeSpread_FD.point}` : '-'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-900/60 rounded-lg p-3">
                            <div className="text-slate-300 text-xs font-bold mb-2 text-center">TOTAL</div>
                            <div className="flex justify-between mb-1">
                              <span className="text-white font-bold">O {over_FD?.point || '-'}</span>
                              <span className="text-blue-400 font-black text-xl">{formatOdds(over_FD?.price)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white font-bold">U {under_FD?.point || '-'}</span>
                              <span className="text-blue-400 font-black text-xl">{formatOdds(under_FD?.price)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-slate-400 mb-4">
                        📊 Odds coming soon - Game still analyzable!
                      </div>
                    )}

                    {/* BUTTONS */}
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

                    {/* GAME ID - GREEN */}
                    <div className="text-green-400 font-mono text-xs font-black drop-shadow-lg">
                      ID: {gameId}
                    </div>
                  </div>

                  {/* ANALYSIS RESULTS */}
                  {analysisResults[gameId]?.data && (
                    <div className="border-t-2 border-slate-700/50 bg-slate-900/60 p-6">
                      <h3 className="text-2xl font-black text-purple-400 mb-4 drop-shadow-lg">🎯 Analysis</h3>
                      
                      {analysisResults[gameId].data.the_edge && (
                        <div className="mb-4 p-4 bg-yellow-900/30 rounded-xl border-2 border-yellow-600/40">
                          <div className="text-yellow-400 font-bold text-lg mb-2">⚡ THE EDGE</div>
                          <p className="text-white">{analysisResults[gameId].data.the_edge}</p>
                        </div>
                      )}
                      
                      {analysisResults[gameId].data.prediction && (
                        <div className="mb-4 p-4 bg-purple-900/30 rounded-xl border-2 border-purple-600/40">
                          <div className="text-purple-400 font-bold text-lg mb-2">🎯 PREDICTION</div>
                          <p className="text-white">Winner: <span className="text-orange-400 font-black text-xl">{analysisResults[gameId].data.prediction.winner}</span></p>
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
            <p className="text-orange-400 text-xl font-bold mb-4">No CFB games available</p>
            <Button onClick={handleRefreshGames} disabled={isRefreshing} className="bg-orange-600 hover:bg-orange-700 px-8 py-6">
              {isRefreshing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Loading...</> : <><RefreshCw className="w-5 h-5 mr-2" />Load Games</>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}