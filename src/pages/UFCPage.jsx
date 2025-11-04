// VERSION 3.2 - FIXED FIELD NAMES TO MATCH ANALYZER OUTPUT
import React, { useState } from 'react';
import { Clock, TrendingUp, Users, Brain, Target, CloudSun, ChevronDown, ChevronUp } from 'lucide-react';

const TEAM_ABBREVIATIONS = {
  'Arizona Cardinals': 'ARI', 'Atlanta Falcons': 'ATL', 'Baltimore Ravens': 'BAL',
  'Buffalo Bills': 'BUF', 'Carolina Panthers': 'CAR', 'Chicago Bears': 'CHI',
  'Cincinnati Bengals': 'CIN', 'Cleveland Browns': 'CLE', 'Dallas Cowboys': 'DAL',
  'Denver Broncos': 'DEN', 'Detroit Lions': 'DET', 'Green Bay Packers': 'GB',
  'Houston Texans': 'HOU', 'Indianapolis Colts': 'IND', 'Jacksonville Jaguars': 'JAX',
  'Kansas City Chiefs': 'KC', 'Las Vegas Raiders': 'LV', 'Los Angeles Chargers': 'LAC',
  'Los Angeles Rams': 'LAR', 'Miami Dolphins': 'MIA', 'Minnesota Vikings': 'MIN',
  'New England Patriots': 'NE', 'New Orleans Saints': 'NO', 'New York Giants': 'NYG',
  'New York Jets': 'NYJ', 'Philadelphia Eagles': 'PHI', 'Pittsburgh Steelers': 'PIT',
  'San Francisco 49ers': 'SF', 'Seattle Seahawks': 'SEA', 'Tampa Bay Buccaneers': 'TB',
  'Tennessee Titans': 'TEN', 'Washington Commanders': 'WAS',
};

const getTeamAbbr = (teamName) => {
  return TEAM_ABBREVIATIONS[teamName] || teamName?.substring(0, 3).toUpperCase() || 'TBD';
};

const GameCard = ({ game, sport = 'NFL', onAnalyze, analysisData, isAnalyzing }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showOddsDetails, setShowOddsDetails] = useState(false);

  const homeTeam = game.home_team || 'Home';
  const awayTeam = game.away_team || 'Away';
  const gameId = game.id || '';
  
  const gameTime = game.commence_time || game.game_date;
  const targetTimeZone = 'America/New_York';

  const formattedDate = gameTime ? new Date(gameTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: targetTimeZone
  }) : 'TBD';

  const formattedTime = gameTime ? new Date(gameTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: targetTimeZone,
    hour12: true
  }) : 'TBD';

  const getOdds = (market, book) => game.markets?.[market]?.[book] || [];
  
  const dkMoneyline = getOdds('moneyline', 'draftkings');
  const fdMoneyline = getOdds('moneyline', 'fanduel');
  const dkSpread = getOdds('spread', 'draftkings');
  const fdSpread = getOdds('spread', 'fanduel');
  const dkTotal = getOdds('total', 'draftkings');
  const fdTotal = getOdds('total', 'fanduel');

  const formatOdds = (odds) => {
    if (!odds || odds === 0) return '-';
    return odds > 0 ? `+${odds}` : odds;
  };

  const getTeamOdds = (oddsArray, teamName) => {
    return oddsArray.find(o => o.name === teamName);
  };

  const awayML_DK = getTeamOdds(dkMoneyline, awayTeam);
  const homeML_DK = getTeamOdds(dkMoneyline, homeTeam);
  const awayML_FD = getTeamOdds(fdMoneyline, awayTeam);
  const homeML_FD = getTeamOdds(fdMoneyline, homeTeam);

  const awaySpread_DK = getTeamOdds(dkSpread, awayTeam);
  const homeSpread_DK = getTeamOdds(dkSpread, homeTeam);
  const awaySpread_FD = getTeamOdds(fdSpread, awayTeam);
  const homeSpread_FD = getTeamOdds(fdSpread, homeTeam);

  const over_DK = dkTotal.find(o => o.name === 'Over');
  const under_DK = dkTotal.find(o => o.name === 'Under');
  const over_FD = fdTotal.find(o => o.name === 'Over');
  const under_FD = fdTotal.find(o => o.name === 'Under');

  const formatConfidence = (confidence) => {
    if (!confidence) return 0;
    return Math.round(confidence);
  };

  const handleAnalyze = (analysisType) => {
    setShowAnalysis(true);
    if (onAnalyze) {
      onAnalyze(game, analysisType);
    }
  };

  // FIXED: Match the exact field names from runAnalyzer output
  const edgeSummary = analysisData?.analysis?.edge_summary || analysisData?.edge_summary;
  const weatherImpact = analysisData?.analysis?.weather_impact || analysisData?.weather_impact;
  const scorePrediction = analysisData?.analysis?.score_prediction || analysisData?.score_prediction;
  const predictions = analysisData?.analysis?.predictions || analysisData?.predictions;
  const recommendedBets = analysisData?.analysis?.recommended_bets || analysisData?.recommended_bets || [];
  const keyTrends = analysisData?.analysis?.key_trends || analysisData?.key_trends || [];
  
  const playerPropsDK = analysisData?.top_player_props_draftkings || [];
  const playerPropsFD = analysisData?.top_player_props_fanduel || [];
  const teamPropsDK = analysisData?.top_team_props_draftkings || [];
  const teamPropsFD = analysisData?.top_team_props_fanduel || [];

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-purple-500/30 shadow-2xl overflow-hidden mb-4">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-purple-900/30 border-b border-purple-500/20">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs font-bold border border-white/20">
              {sport}
            </span>
            <span className="px-2 py-1 bg-emerald-600/80 text-white rounded-full text-xs font-semibold">
              2 Books
            </span>
          </div>
          
          <div className="text-right">
            <div className="text-white text-sm font-semibold">{formattedDate}</div>
            <div className="text-cyan-300 text-xs flex items-center justify-end gap-1">
              <Clock className="w-3 h-3" />
              {formattedTime} EST
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 text-2xl font-bold">
          <span className="text-cyan-300">{awayTeam}</span>
          <span className="text-purple-400">@</span>
          <span className="text-pink-300">{homeTeam}</span>
        </div>
        <div className="text-center mt-1 text-xs text-slate-400">
          <span>Away</span>
          <span className="mx-6">vs</span>
          <span>Home</span>
        </div>
      </div>

      {/* Odds Summary */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/50">
          <div className="text-slate-400 text-xs font-semibold mb-2 uppercase">Moneyline</div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-emerald-400 font-bold">DK:</span>
              <span className="text-white">{formatOdds(awayML_DK?.price)} / {formatOdds(homeML_DK?.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-400 font-bold">FD:</span>
              <span className="text-white">{formatOdds(awayML_FD?.price)} / {formatOdds(homeML_FD?.price)}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/50">
          <div className="text-slate-400 text-xs font-semibold mb-2 uppercase">Spread</div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-emerald-400 font-bold">DK:</span>
              <span className="text-white">
                {awaySpread_DK?.point > 0 ? '+' : ''}{awaySpread_DK?.point || '-'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-400 font-bold">FD:</span>
              <span className="text-white">
                {awaySpread_FD?.point > 0 ? '+' : ''}{awaySpread_FD?.point || '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/50">
          <div className="text-slate-400 text-xs font-semibold mb-2 uppercase">Total</div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-emerald-400 font-bold">DK:</span>
              <span className="text-white">O/U {over_DK?.point || '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-400 font-bold">FD:</span>
              <span className="text-white">O/U {over_FD?.point || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleAnalyze('game')}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 border border-white/10"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-xs">Analyzing...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span className="text-xs">Game Analysis</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => handleAnalyze('player')}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 border border-white/10"
          >
            <Users className="w-4 h-4" />
            <span className="text-xs">Player Props</span>
          </button>
          
          <button
            onClick={() => handleAnalyze('team')}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 border border-white/10"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Team Props</span>
          </button>
        </div>
      </div>

      {/* Analysis Section */}
      {showAnalysis && analysisData && (
        <div className="border-t border-purple-500/20 bg-slate-900/40">
          <div className="p-6 space-y-6">
            
            {/* THE EDGE */}
            {edgeSummary && (
              <div className="bg-gradient-to-br from-yellow-900/40 via-amber-900/30 to-orange-900/40 border-2 border-yellow-600/50 rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-8 h-8 text-yellow-400" />
                  <h3 className="text-2xl font-bold text-yellow-400">THE EDGE</h3>
                </div>
                <p className="text-white text-lg leading-relaxed">{edgeSummary}</p>
              </div>
            )}

            {/* Recommended Bets */}
            {recommendedBets.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-emerald-400 mb-4">💰 Recommended Bets</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedBets.map((bet, idx) => (
                    <div key={idx} className="bg-teal-900/30 border border-teal-600/50 rounded-lg p-4">
                      <div className="text-emerald-300 text-lg font-bold mb-2">{bet.bet}</div>
                      <div className="text-white text-2xl font-black mb-2">{bet.units || '2'}u</div>
                      <div className="text-teal-300 text-xl font-bold mb-2">
                        {formatConfidence(bet.confidence)}%
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                          style={{ width: `${formatConfidence(bet.confidence)}%` }}
                        ></div>
                      </div>
                      {bet.reasoning && (
                        <p className="text-slate-300 text-xs leading-relaxed">{bet.reasoning}</p>
                      )}
                      {bet.best_at && (
                        <div className="mt-2 text-xs text-emerald-400 font-bold">
                          Best at: {bet.best_at}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weather & Predictions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weatherImpact && (
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CloudSun className="w-5 h-5 text-cyan-400" />
                    <h4 className="text-lg font-bold text-cyan-400">Weather Impact</h4>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{weatherImpact}</p>
                </div>
              )}

              {(scorePrediction || predictions) && (
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-cyan-400 mb-3">📊 Predictions</h4>
                  {scorePrediction && (
                    <div className="mb-2">
                      <span className="text-slate-400 text-sm">Score:</span>
                      <span className="text-white text-lg font-bold ml-2">{scorePrediction}</span>
                    </div>
                  )}
                  {predictions?.winner && (
                    <div className="mb-2">
                      <span className="text-slate-400 text-sm">Winner:</span>
                      <span className="text-cyan-400 text-lg font-bold ml-2">{predictions.winner}</span>
                    </div>
                  )}
                  {predictions?.spread_pick && (
                    <div className="mb-2">
                      <span className="text-slate-400 text-sm">Spread:</span>
                      <span className="text-purple-400 text-sm font-bold ml-2">
                        {predictions.spread_pick} ({predictions.spread_confidence}%)
                      </span>
                    </div>
                  )}
                  {predictions?.total_pick && (
                    <div>
                      <span className="text-slate-400 text-sm">Total:</span>
                      <span className="text-purple-400 text-sm font-bold ml-2">
                        {predictions.total_pick} ({predictions.total_confidence}%)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Key Trends */}
            {keyTrends.length > 0 && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4">
                <h4 className="text-lg font-bold text-cyan-400 mb-3">📈 Key Trends</h4>
                <ul className="space-y-2">
                  {keyTrends.map((trend, idx) => (
                    <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Player Props - DraftKings */}
            {playerPropsDK.length > 0 && (
              <div>
                <h3 className="text-2xl font-black text-emerald-400 mb-4">🏈 Top Player Props - DraftKings</h3>
                <div className="space-y-3">
                  {playerPropsDK.map((prop, idx) => {
                    const confidencePercent = formatConfidence(prop.confidence);
                    return (
                      <div key={idx} className="bg-emerald-950/50 border-2 border-emerald-400 rounded-lg p-4 shadow-xl">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-black text-emerald-300 text-xl">
                              {prop.player || prop.player_name || prop.playerName}
                            </div>
                            <div className="text-emerald-100 text-base font-bold mt-1">
                              {prop.prop_type}: {prop.line} ({formatOdds(prop.odds)})
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-emerald-300 font-black text-4xl">{confidencePercent}%</div>
                            <div className="text-emerald-400 text-xs font-bold">DRAFTKINGS</div>
                          </div>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3 mb-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full"
                            style={{ width: `${confidencePercent}%` }}
                          ></div>
                        </div>
                        {prop.reasoning && (
                          <p className="text-slate-200 text-sm leading-relaxed">{prop.reasoning}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Player Props - FanDuel */}
            {playerPropsFD.length > 0 && (
              <div>
                <h3 className="text-2xl font-black text-blue-400 mb-4">🏈 Top Player Props - FanDuel</h3>
                <div className="space-y-3">
                  {playerPropsFD.map((prop, idx) => {
                    const confidencePercent = formatConfidence(prop.confidence);
                    return (
                      <div key={idx} className="bg-blue-950/50 border-2 border-blue-400 rounded-lg p-4 shadow-xl">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-black text-blue-300 text-xl">
                              {prop.player || prop.player_name || prop.playerName}
                            </div>
                            <div className="text-blue-100 text-base font-bold mt-1">
                              {prop.prop_type}: {prop.line} ({formatOdds(prop.odds)})
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-blue-300 font-black text-4xl">{confidencePercent}%</div>
                            <div className="text-blue-400 text-xs font-bold">FANDUEL</div>
                          </div>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3 mb-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full"
                            style={{ width: `${confidencePercent}%` }}
                          ></div>
                        </div>
                        {prop.reasoning && (
                          <p className="text-slate-200 text-sm leading-relaxed">{prop.reasoning}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Team Props - DraftKings */}
            {teamPropsDK.length > 0 && (
              <div>
                <h3 className="text-2xl font-black text-emerald-400 mb-4">📈 Top Team Props - DraftKings</h3>
                <div className="space-y-3">
                  {teamPropsDK.map((prop, idx) => {
                    const confidencePercent = formatConfidence(prop.confidence);
                    return (
                      <div key={idx} className="bg-emerald-950/50 border-2 border-emerald-400 rounded-lg p-4 shadow-xl">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-black text-emerald-300 text-xl">{prop.team}</div>
                            <div className="text-emerald-100 text-base font-bold mt-1">
                              {prop.prop_type}: {prop.line} ({formatOdds(prop.odds)})
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-emerald-300 font-black text-4xl">{confidencePercent}%</div>
                            <div className="text-emerald-400 text-xs font-bold">DRAFTKINGS</div>
                          </div>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3 mb-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full"
                            style={{ width: `${confidencePercent}%` }}
                          ></div>
                        </div>
                        {prop.reasoning && (
                          <p className="text-slate-200 text-sm leading-relaxed">{prop.reasoning}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Team Props - FanDuel */}
            {teamPropsFD.length > 0 && (
              <div>
                <h3 className="text-2xl font-black text-blue-400 mb-4">📈 Top Team Props - FanDuel</h3>
                <div className="space-y-3">
                  {teamPropsFD.map((prop, idx) => {
                    const confidencePercent = formatConfidence(prop.confidence);
                    return (
                      <div key={idx} className="bg-blue-950/50 border-2 border-blue-400 rounded-lg p-4 shadow-xl">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-black text-blue-300 text-xl">{prop.team}</div>
                            <div className="text-blue-100 text-base font-bold mt-1">
                              {prop.prop_type}: {prop.line} ({formatOdds(prop.odds)})
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-blue-300 font-black text-4xl">{confidencePercent}%</div>
                            <div className="text-blue-400 text-xs font-bold">FANDUEL</div>
                          </div>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3 mb-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full"
                            style={{ width: `${confidencePercent}%` }}
                          ></div>
                        </div>
                        {prop.reasoning && (
                          <p className="text-slate-200 text-sm leading-relaxed">{prop.reasoning}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 pb-3">
        <div className="flex justify-between items-center text-xs">
          <div className="text-slate-500 font-mono">Game ID: {gameId}</div>
          <div className="text-emerald-400 font-semibold">Available at: fanduel, draftkings</div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;