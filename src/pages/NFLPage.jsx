import React, { useState, useEffect } from "react";
import { supabase, getGames, updateSchedule, runAnalyzer } from "@/api/supabaseClient";
import { Loader2, RefreshCw, AlertCircle, Brain, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// NFL TEAM DATA - Official ESPN Logos
const NFL_TEAMS = {
  'Arizona Cardinals': 'ari',
  'Atlanta Falcons': 'atl',
  'Baltimore Ravens': 'bal',
  'Buffalo Bills': 'buf',
  'Carolina Panthers': 'car',
  'Chicago Bears': 'chi',
  'Cincinnati Bengals': 'cin',
  'Cleveland Browns': 'cle',
  'Dallas Cowboys': 'dal',
  'Denver Broncos': 'den',
  'Detroit Lions': 'det',
  'Green Bay Packers': 'gb',
  'Houston Texans': 'hou',
  'Indianapolis Colts': 'ind',
  'Jacksonville Jaguars': 'jax',
  'Kansas City Chiefs': 'kc',
  'Las Vegas Raiders': 'lv',
  'Los Angeles Chargers': 'lac',
  'Los Angeles Rams': 'lar',
  'Miami Dolphins': 'mia',
  'Minnesota Vikings': 'min',
  'New England Patriots': 'ne',
  'New Orleans Saints': 'no',
  'New York Giants': 'nyg',
  'New York Jets': 'nyj',
  'Philadelphia Eagles': 'phi',
  'Pittsburgh Steelers': 'pit',
  'San Francisco 49ers': 'sf',
  'Seattle Seahawks': 'sea',
  'Tampa Bay Buccaneers': 'tb',
  'Tennessee Titans': 'ten',
  'Washington Commanders': 'wsh',
};

const getTeamLogo = (teamName) => {
  const abbr = NFL_TEAMS[teamName] || 'nfl';
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`;
};

const getTeamCode = (teamName) => {
  const abbr = NFL_TEAMS[teamName];
  return abbr ? abbr.toUpperCase() : teamName?.substring(0, 3).toUpperCase() || 'UNK';
};

export default function NFLPage() {
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
      const nflGames = await getGames({ sport: 'NFL' });
      setGames(nflGames || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleRefreshGames = async () => {
    setIsRefreshing(true);
    try {
      const currentYear = new Date().getFullYear();
      const response = await updateSchedule('NFL', currentYear);
      if (response?.success) {
        alert(`✅ ${response.gamesCreated + response.gamesUpdated} NFL games loaded!`);
        await fetchData();
      }
    } catch (err) {
      alert(`❌ Failed: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAnalyzeGame = async (game) => {
    if (!game || !game.id) return;
    const gameId = game.id;
    setAnalyzingGames(prev => ({ ...prev, [gameId]: true }));

    try {
      const response = await runAnalyzer(gameId, 'NFL', false);

      if (response?.success) {
        const fullResult = response.prediction;

        // Filter props by confidence (55% - 100% only)
        const filterByConfidence = (props) => {
          if (!Array.isArray(props)) return [];
          return props.filter(prop => {
            const confidence = prop.confidence || prop.confidence_score || 0;
            // Handle both percentage (55-100) and decimal (0.55-1.0) formats
            const confidenceValue = confidence > 1 ? confidence : confidence * 100;
            return confidenceValue >= 55;
          });
        };

        const completeData = {
          // Analysis fields
          the_edge: fullResult.analysis?.the_edge,
          weather_impact: fullResult.analysis?.weather_impact,
          score_prediction: fullResult.analysis?.score_prediction,
          predictions: fullResult.analysis?.predictions,
          recommended_bets: fullResult.analysis?.recommended_bets || [],
          key_trends: fullResult.analysis?.key_trends || [],
          analyzed_at: fullResult.analysis?.analyzed_at || fullResult.analyzed_at,

          // Props from top level - FILTERED by 55%+ confidence
          top_player_props_draftkings: filterByConfidence(fullResult.top_player_props_draftkings || []),
          top_player_props_fanduel: filterByConfidence(fullResult.top_player_props_fanduel || []),
          top_team_props_draftkings: filterByConfidence(fullResult.top_team_props_draftkings || []),
          top_team_props_fanduel: filterByConfidence(fullResult.top_team_props_fanduel || [])
        };

        setAnalysisResults(prev => ({
          ...prev,
          [gameId]: { data: completeData }
        }));
      }
    } catch (err) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setAnalyzingGames(prev => ({ ...prev, [gameId]: false }));
    }
  };

  const formatOdds = (odds) => {
    if (!odds || odds === 0) return '-';
    return odds > 0 ? `+${odds}` : odds;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-white">🏈 NFL</h1>
          <Button onClick={handleRefreshGames} disabled={isRefreshing} className="bg-cyan-600 hover:bg-cyan-700">
            {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh Games
          </Button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : games.length > 0 ? (
          <div className="space-y-6">
            {games.map((game, idx) => {
              if (!game) return null;
              
              const awayTeam = game.away_team || 'AWAY';
              const homeTeam = game.home_team || 'HOME';
              const gameId = game.id || `game-${idx}`;
              
              const awayLogo = getTeamLogo(awayTeam);
              const homeLogo = getTeamLogo(homeTeam);
              const awayCode = getTeamCode(awayTeam);
              const homeCode = getTeamCode(homeTeam);
              
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
              
              return (
                <div key={gameId} className="bg-slate-900 rounded-2xl overflow-hidden border-2 border-purple-500/40 shadow-2xl">
                  
                  <div className="p-6 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
                    
                    <div className="flex items-center gap-4 mb-3">
                      <img src={awayLogo} alt={awayCode} className="w-16 h-16 object-contain drop-shadow-lg" />
                      <div className="flex-1">
                        <div className="text-4xl font-black tracking-tight text-white drop-shadow-lg">
                          {awayTeam}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">AWAY</div>
                      </div>
                    </div>
                    
                    <div className="text-center my-4">
                      <span className="text-cyan-400 text-3xl font-black drop-shadow-lg">@</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <img src={homeLogo} alt={homeCode} className="w-16 h-16 object-contain drop-shadow-lg" />
                      <div className="flex-1">
                        <div className="text-4xl font-black tracking-tight text-white drop-shadow-lg">
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

                  <div className="p-4 bg-slate-900/50">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      
                      <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 rounded-xl p-3 border-2 border-emerald-500/50 shadow-lg">
                        <div className="text-center mb-3">
                          <div className="text-emerald-400 font-black text-base tracking-wider">DRAFTKINGS</div>
                        </div>
                        
                        <div className="bg-slate-900/60 rounded-lg p-3 mb-2 border border-emerald-500/30">
                          <div className="text-slate-300 text-xs font-bold mb-2 text-center uppercase">MONEYLINE</div>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <img src={awayLogo} alt={awayCode} className="w-6 h-6 object-contain" />
                              <span className="text-white font-black text-base">{awayCode}</span>
                            </div>
                            <span className="text-emerald-400 font-black text-xl">{formatOdds(awayML_DK?.price)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <img src={homeLogo} alt={homeCode} className="w-6 h-6 object-contain" />
                              <span className="text-white font-black text-base">{homeCode}</span>
                            </div>
                            <span className="text-emerald-400 font-black text-xl">{formatOdds(homeML_DK?.price)}</span>
                          </div>
                        </div>
                        
                        <div className="bg-slate-900/60 rounded-lg p-3 mb-2 border border-emerald-500/30">
                          <div className="text-slate-300 text-xs font-bold mb-2 text-center uppercase">SPREAD</div>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <img src={awayLogo} alt={awayCode} className="w-6 h-6 object-contain" />
                              <span className="text-white font-black text-base">{awayCode}</span>
                            </div>
                            <span className="text-emerald-400 font-bold text-base">
                              {awaySpread_DK?.point ? `${awaySpread_DK.point > 0 ? '+' : ''}${awaySpread_DK.point}` : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <img src={homeLogo} alt={homeCode} className="w-6 h-6 object-contain" />
                              <span className="text-white font-black text-base">{homeCode}</span>
                            </div>
                            <span className="text-emerald-400 font-bold text-base">
                              {homeSpread_DK?.point ? `${homeSpread_DK.point > 0 ? '+' : ''}${homeSpread_DK.point}` : '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-slate-900/60 rounded-lg p-3 border border-emerald-500/30">
                          <div className="text-slate-300 text-xs font-bold mb-2 text-center uppercase">TOTAL</div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white font-black text-base">O {over_DK?.point || '-'}</span>
                            <span className="text-emerald-400 font-black text-xl">{formatOdds(over_DK?.price)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white font-black text-base">U {under_DK?.point || '-'}</span>
                            <span className="text-emerald-400 font-black text-xl">{formatOdds(under_DK?.price)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-xl p-3 border-2 border-blue-500/50 shadow-lg">
                        <div className="text-center mb-3">
                          <div className="text-blue-400 font-black text-base tracking-wider">FANDUEL</div>
                        </div>
                        
                        <div className="bg-slate-900/60 rounded-lg p-3 mb-2 border border-blue-500/30">
                          <div className="text-slate-300 text-xs font-bold mb-2 text-center uppercase">MONEYLINE</div>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <img src={awayLogo} alt={awayCode} className="w-6 h-6 object-contain" />
                              <span className="text-white font-black text-base">{awayCode}</span>
                            </div>
                            <span className="text-blue-400 font-black text-xl">{formatOdds(awayML_FD?.price)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <img src={homeLogo} alt={homeCode} className="w-6 h-6 object-contain" />
                              <span className="text-white font-black text-base">{homeCode}</span>
                            </div>
                            <span className="text-blue-400 font-black text-xl">{formatOdds(homeML_FD?.price)}</span>
                          </div>
                        </div>
                        
                        <div className="bg-slate-900/60 rounded-lg p-3 mb-2 border border-blue-500/30">
                          <div className="text-slate-300 text-xs font-bold mb-2 text-center uppercase">SPREAD</div>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <img src={awayLogo} alt={awayCode} className="w-6 h-6 object-contain" />
                              <span className="text-white font-black text-base">{awayCode}</span>
                            </div>
                            <span className="text-blue-400 font-bold text-base">
                              {awaySpread_FD?.point ? `${awaySpread_FD.point > 0 ? '+' : ''}${awaySpread_FD.point}` : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <img src={homeLogo} alt={homeCode} className="w-6 h-6 object-contain" />
                              <span className="text-white font-black text-base">{homeCode}</span>
                            </div>
                            <span className="text-blue-400 font-bold text-base">
                              {homeSpread_FD?.point ? `${homeSpread_FD.point > 0 ? '+' : ''}${homeSpread_FD.point}` : '-'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-slate-900/60 rounded-lg p-3 border border-blue-500/30">
                          <div className="text-slate-300 text-xs font-bold mb-2 text-center uppercase">TOTAL</div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white font-black text-base">O {over_FD?.point || '-'}</span>
                            <span className="text-blue-400 font-black text-xl">{formatOdds(over_FD?.price)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white font-black text-base">U {under_FD?.point || '-'}</span>
                            <span className="text-blue-400 font-black text-xl">{formatOdds(under_FD?.price)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

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

                    <div className="text-emerald-400 font-mono text-xs font-black">
                      ID: {gameId}
                    </div>
                  </div>

                  {analysisResults[gameId]?.data && (
                    <div className="border-t-2 border-slate-700/50 bg-slate-900/60 p-6">
                      <h3 className="text-2xl font-black text-purple-400 mb-4">🎯 Analysis</h3>
                      
                      {analysisResults[gameId].data.the_edge && (
                        <div className="mb-4 p-4 bg-yellow-900/30 rounded-xl border-2 border-yellow-600/40">
                          <div className="text-yellow-400 font-bold text-lg mb-2">⚡ THE EDGE</div>
                          <p className="text-white">{analysisResults[gameId].data.the_edge}</p>
                        </div>
                      )}
                      
                      {analysisResults[gameId].data.prediction && (
                        <div className="mb-4 p-4 bg-purple-900/30 rounded-xl border-2 border-purple-600/40">
                          <div className="text-purple-400 font-bold text-lg mb-2">🎯 PREDICTION</div>
                          <p className="text-white">Winner: <span className="text-cyan-400 font-black text-xl">{analysisResults[gameId].data.prediction.winner}</span></p>
                        </div>
                      )}
                      
                      {analysisResults[gameId].data.recommended_bets?.length > 0 && (
                        <div className="p-4 bg-emerald-900/30 rounded-xl border-2 border-emerald-600/40">
                          <div className="text-emerald-400 font-bold text-lg mb-3">💰 RECOMMENDED BETS</div>
                          {analysisResults[gameId].data.recommended_bets.map((bet, bidx) => (
                            <div key={bidx} className="bg-slate-900/50 p-4 rounded-lg mb-2 border border-emerald-500/30">
                              <div className="text-white font-bold">{bet.bet}</div>
                              <p className="text-sm text-slate-300 mt-1">{bet.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-800 rounded-xl border-2 border-slate-700">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <p className="text-cyan-400 text-xl font-bold mb-4">No NFL games available</p>
            <Button onClick={handleRefreshGames} disabled={isRefreshing} className="bg-cyan-600 hover:bg-cyan-700 px-8 py-6">
              {isRefreshing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Loading...</> : <><RefreshCw className="w-5 h-5 mr-2" />Load Games</>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}