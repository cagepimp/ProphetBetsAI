// VERSION 5.0 - ENHANCED PROPS DISPLAY
import React, { useState } from 'react';
import { Clock, TrendingUp, Users, Brain, Target, CloudSun, ChevronDown, ChevronUp, List, Star, Award } from 'lucide-react';
import UniversalRosterService from '@/components/services/UniversalRosterService';
import DepthChartService from '@/components/services/DepthChartService';

const GameCard = ({ game, sport = 'NFL', onAnalyze, analysisData, isAnalyzing, rosters = {} }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showOddsDetails, setShowOddsDetails] = useState(false);
  const [showDepthChart, setShowDepthChart] = useState(false);

  const homeTeam = game.home_team || 'Home';
  const awayTeam = game.away_team || 'Away';
  const gameId = game.id || '';
  
  // Get rosters and depth charts
  const homeRoster = UniversalRosterService.getRosterForTeam(rosters, homeTeam, sport);
  const awayRoster = UniversalRosterService.getRosterForTeam(rosters, awayTeam, sport);
  const homeDepthChart = DepthChartService.getDepthChartForTeam(rosters, homeTeam);
  const awayDepthChart = DepthChartService.getDepthChartForTeam(rosters, awayTeam);
  const homeStarters = DepthChartService.getCompactStarters(homeDepthChart);
  const awayStarters = DepthChartService.getCompactStarters(awayDepthChart);
  
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
      onAnalyze(game, analysisType, { homeRoster, awayRoster });
    }
  };

  // Extract analysis data
  const edgeSummary = analysisData?.analysis?.the_edge || analysisData?.the_edge;
  const weatherImpact = analysisData?.analysis?.weather_impact || analysisData?.weather_impact;
  const scorePrediction = analysisData?.analysis?.score_prediction || analysisData?.score_prediction;
  const winner = analysisData?.analysis?.winner || analysisData?.winner;
  const overallConfidence = analysisData?.analysis?.overall_confidence || analysisData?.overall_confidence;
  const recommendedBets = analysisData?.analysis?.recommended_bets || analysisData?.recommended_bets || [];
  
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
            {Object.keys(rosters).length > 0 && (
              <span className="px-2 py-1 bg-cyan-600/80 text-white rounded-full text-xs font-semibold">
                2025 Rosters
              </span>
            )}
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

      {/* Quick Starters Preview */}
      {(homeStarters.length > 0 || awayStarters.length > 0) && (
        <div className="px-4 pb-2">
          <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-xs font-semibold uppercase">Key Starters</span>
              <button
                onClick={() => setShowDepthChart(!showDepthChart)}
                className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1"
              >
                <List className="w-3 h-3" />
                {showDepthChart ? 'Hide' : 'Show'} Full Depth Charts
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-cyan-400 font-bold mb-1">{awayTeam.substring(awayTeam.lastIndexOf(' ') + 1)}</div>
                <div className="space-y-0.5">
                  {awayStarters.map((starter, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300">
                      <span className="text-slate-500">{starter.position}:</span>
                      <span className="font-medium">{starter.player}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-pink-400 font-bold mb-1">{homeTeam.substring(homeTeam.lastIndexOf(' ') + 1)}</div>
                <div className="space-y-0.5">
                  {homeStarters.map((starter, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300">
                      <span className="text-slate-500">{starter.position}:</span>
                      <span className="font-medium">{starter.player}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Depth Chart Display */}
      {showDepthChart && (
        <div className="px-4 pb-4">
          <div className="bg-slate-900/60 rounded-lg p-4 border border-purple-500/30">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <List className="w-5 h-5 text-purple-400" />
              Full Depth Charts
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-cyan-400 font-bold mb-2 pb-1 border-b border-cyan-500/30">{awayTeam}</div>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {Object.entries(DepthChartService.formatDepthChartByPosition(awayDepthChart)).map(([position, players]) => (
                    <div key={position} className="text-xs">
                      <div className="text-slate-400 font-semibold mb-1">{position}</div>
                      {players.map((player, idx) => (
                        <div key={idx} className="flex items-center gap-2 ml-2 text-slate-300">
                          <span className="text-slate-500">{player.depth_rank || idx + 1}.</span>
                          <span className={player.is_starter ? 'font-bold text-white' : ''}>
                            {player.name}
                          </span>
                          {player.is_starter && (
                            <span className="text-emerald-400 text-[10px] font-bold">STARTER</span>
                          )}
                          {player.jersey && (
                            <span className="text-slate-500 text-[10px]">#{player.jersey}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-pink-400 font-bold mb-2 pb-1 border-b border-pink-500/30">{homeTeam}</div>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {Object.entries(DepthChartService.formatDepthChartByPosition(homeDepthChart)).map(([position, players]) => (
                    <div key={position} className="text-xs">
                      <div className="text-slate-400 font-semibold mb-1">{position}</div>
                      {players.map((player, idx) => (
                        <div key={idx} className="flex items-center gap-2 ml-2 text-slate-300">
                          <span className="text-slate-500">{player.depth_rank || idx + 1}.</span>
                          <span className={player.is_starter ? 'font-bold text-white' : ''}>
                            {player.name}
                          </span>
                          {player.is_starter && (
                            <span className="text-emerald-400 text-[10px] font-bold">STARTER</span>
                          )}
                          {player.jersey && (
                            <span className="text-slate-500 text-[10px]">#{player.jersey}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  {overallConfidence && (
                    <span className="ml-auto px-3 py-1 bg-yellow-600/30 text-yellow-200 rounded-full text-sm font-bold">
                      {formatConfidence(overallConfidence)}% Confidence
                    </span>
                  )}
                </div>
                <p className="text-white text-lg leading-relaxed">{edgeSummary}</p>
              </div>
            )}

            {/* Recommended Bets */}
            {recommendedBets.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  💰 Recommended Bets
                </h3>
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
                      <div className="text-xs text-slate-400 mb-2">Best at: {bet.best_at}</div>
                      {bet.reasoning && (
                        <p className="text-slate-300 text-xs leading-relaxed">{bet.reasoning}</p>
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

              {(scorePrediction || winner) && (
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-cyan-400 mb-3">📊 Predictions</h4>
                  {scorePrediction && (
                    <div className="mb-2">
                      <span className="text-slate-400 text-sm">Projected Score:</span>
                      <span className="text-white text-lg font-bold ml-2">{scorePrediction}</span>
                    </div>
                  )}
                  {winner && (
                    <div>
                      <span className="text-slate-400 text-sm">Winner:</span>
                      <span className="text-cyan-400 text-lg font-bold ml-2">{winner}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ENHANCED PLAYER PROPS - DraftKings */}
            {playerPropsDK.length > 0 && (
              <div>
                <h3 className="text-2xl font-black text-emerald-400 mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6" />
                  🏈 Top Player Props - DraftKings
                </h3>
                <div className="space-y-4">
                  {playerPropsDK.map((prop, idx) => {
                    const confidencePercent = formatConfidence(prop.confidence);
                    
                    return (
                      <div key={idx} className="bg-emerald-950/50 border-2 border-emerald-400 rounded-lg p-5 shadow-xl">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-black text-emerald-300 text-2xl">
                                {prop.player}
                              </div>
                              {prop.position && (
                                <span className="px-2 py-0.5 bg-emerald-600/30 text-emerald-200 rounded text-xs font-semibold">
                                  {prop.position}
                                </span>
                              )}
                            </div>
                            <div className="text-emerald-100 text-lg font-bold">
                              {prop.prop_type} - {prop.recommendation} {prop.line}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-emerald-300 font-black text-5xl">{confidencePercent}%</div>
                            <div className="text-emerald-400 text-xs font-bold">DRAFTKINGS</div>
                          </div>
                        </div>

                        {/* Confidence Bar */}
                        <div className="w-full bg-slate-800 rounded-full h-3 mb-3">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full"
                            style={{ width: `${confidencePercent}%` }}
                          ></div>
                        </div>

                        {/* Reasoning */}
                        {prop.reasoning && (
                          <div className="mb-3 p-3 bg-emerald-900/20 rounded-lg">
                            <div className="text-emerald-300 text-xs font-bold mb-1">💡 ANALYSIS:</div>
                            <p className="text-slate-200 text-sm leading-relaxed">{prop.reasoning}</p>
                          </div>
                        )}

                        {/* Key Factors */}
                        {prop.key_factors && prop.key_factors.length > 0 && (
                          <div className="mb-3">
                            <div className="text-emerald-300 text-xs font-bold mb-2">🔑 KEY FACTORS:</div>
                            <ul className="space-y-1">
                              {prop.key_factors.map((factor, i) => (
                                <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                                  <span className="text-emerald-400">•</span>
                                  <span>{factor}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recent Stats */}
                        {prop.recent_stats && (
                          <div className="text-xs text-slate-400 border-t border-emerald-800/30 pt-2 mt-2">
                            <span className="font-bold text-emerald-400">📈 Recent Form:</span> {prop.recent_stats}
                          </div>
                        )}

                        {/* Odds */}
                        <div className="text-xs text-slate-500 mt-2">
                          Odds: {prop.odds || '-110'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ENHANCED PLAYER PROPS - FanDuel */}
            {playerPropsFD.length > 0 && (
              <div>
                <h3 className="text-2xl font-black text-blue-400 mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6" />
                  🏈 Top Player Props - FanDuel
                </h3>
                <div className="space-y-4">
                  {playerPropsFD.map((prop, idx) => {
                    const confidencePercent = formatConfidence(prop.confidence);
                    
                    return (
                      <div key={idx} className="bg-blue-950/50 border-2 border-blue-400 rounded-lg p-5 shadow-xl">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-black text-blue-300 text-2xl">
                                {prop.player}
                              </div>
                              {prop.position && (
                                <span className="px-2 py-0.5 bg-blue-600/30 text-blue-200 rounded text-xs font-semibold">
                                  {prop.position}
                                </span>
                              )}
                            </div>
                            <div className="text-blue-100 text-lg font-bold">
                              {prop.prop_type} - {prop.recommendation} {prop.line}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-blue-300 font-black text-5xl">{confidencePercent}%</div>
                            <div className="text-blue-400 text-xs font-bold">FANDUEL</div>
                          </div>
                        </div>

                        {/* Confidence Bar */}
                        <div className="w-full bg-slate-800 rounded-full h-3 mb-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full"
                            style={{ width: `${confidencePercent}%` }}
                          ></div>
                        </div>

                        {/* Reasoning */}
                        {prop.reasoning && (
                          <div className="mb-3 p-3 bg-blue-900/20 rounded-lg">
                            <div className="text-blue-300 text-xs font-bold mb-1">💡 ANALYSIS:</div>
                            <p className="text-slate-200 text-sm leading-relaxed">{prop.reasoning}</p>
                          </div>
                        )}

                        {/* Key Factors */}
                        {prop.key_factors && prop.key_factors.length > 0 && (
                          <div className="mb-3">
                            <div className="text-blue-300 text-xs font-bold mb-2">🔑 KEY FACTORS:</div>
                            <ul className="space-y-1">
                              {prop.key_factors.map((factor, i) => (
                                <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                                  <span className="text-blue-400">•</span>
                                  <span>{factor}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recent Stats */}
                        {prop.recent_stats && (
                          <div className="text-xs text-slate-400 border-t border-blue-800/30 pt-2 mt-2">
                            <span className="font-bold text-blue-400">📈 Recent Form:</span> {prop.recent_stats}
                          </div>
                        )}

                        {/* Odds */}
                        <div className="text-xs text-slate-500 mt-2">
                          Odds: {prop.odds || '-110'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ENHANCED TEAM PROPS - DraftKings */}
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
                              {prop.prop_type} - {prop.recommendation} {prop.line}
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
                          <div className="mb-2 p-2 bg-emerald-900/20 rounded">
                            <p className="text-slate-200 text-sm leading-relaxed">{prop.reasoning}</p>
                          </div>
                        )}
                        {prop.key_factors && prop.key_factors.length > 0 && (
                          <div className="text-xs">
                            <div className="text-emerald-300 font-bold mb-1">Key Factors:</div>
                            <ul className="space-y-0.5">
                              {prop.key_factors.map((factor, i) => (
                                <li key={i} className="text-slate-300 flex items-start gap-1">
                                  <span className="text-emerald-400">•</span>
                                  <span>{factor}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ENHANCED TEAM PROPS - FanDuel */}
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
                              {prop.prop_type} - {prop.recommendation} {prop.line}
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
                          <div className="mb-2 p-2 bg-blue-900/20 rounded">
                            <p className="text-slate-200 text-sm leading-relaxed">{prop.reasoning}</p>
                          </div>
                        )}
                        {prop.key_factors && prop.key_factors.length > 0 && (
                          <div className="text-xs">
                            <div className="text-blue-300 font-bold mb-1">Key Factors:</div>
                            <ul className="space-y-0.5">
                              {prop.key_factors.map((factor, i) => (
                                <li key={i} className="text-slate-300 flex items-start gap-1">
                                  <span className="text-blue-400">•</span>
                                  <span>{factor}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
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