// NBAPage.jsx - BEAUTIFUL NBA PAGE
// Matches NFL layout exactly with team logos

import React, { useState, useEffect } from 'react';
import { getGames, updateSchedule, runAnalyzer } from '@/api/supabaseClient';
import { Trophy, RefreshCw } from 'lucide-react';
import { NBA_TEAMS, getNBATeamLogo, getNBATeamCode } from '@/components/data/NBA_TEAMS';

export default function NBAPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const response = await getGames({ sport: 'NBA' });
      // Filter out any undefined or null games
      const validGames = (response || []).filter(game => game && game.id && game.home_team && game.away_team);
      setGames(validGames);
    } catch (error) {
      console.error('Failed to load NBA games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGames();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-900 to-slate-900">
        <div className="text-white text-xl">Loading NBA games...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Trophy className="w-10 h-10 text-orange-500" />
            <h1 className="text-4xl font-black text-white">NBA</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Games
          </button>
        </div>

        {/* Games Grid */}
        <div className="space-y-6">
          {games.map((game) => (
            <NBAGameCard key={game.id} game={game} />
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center text-slate-400 text-xl mt-20">
            No NBA games available
          </div>
        )}
      </div>
    </div>
  );
}

function NBAGameCard({ game }) {
  const [analyzingGames, setAnalyzingGames] = useState({});
  const [analysisResults, setAnalysisResults] = useState({});

  // Defensive checks
  if (!game) {
    console.warn('NBAGameCard received undefined game');
    return null;
  }

  const awayTeam = game.away_team || 'Away Team';
  const homeTeam = game.home_team || 'Home Team';
  
  const awayLogo = getNBATeamLogo(awayTeam);
  const homeLogo = getNBATeamLogo(homeTeam);
  const awayCode = getNBATeamCode(awayTeam);
  const homeCode = getNBATeamCode(homeTeam);

  const dkMoneyline = game.markets?.moneyline?.draftkings || [];
  const fdMoneyline = game.markets?.moneyline?.fanduel || [];
  const dkSpread = game.markets?.spread?.draftkings || [];
  const fdSpread = game.markets?.spread?.fanduel || [];
  const dkTotal = game.markets?.total?.draftkings || [];
  const fdTotal = game.markets?.total?.fanduel || [];

  const getTeamOdds = (oddsArray, teamName) => oddsArray.find(o => o.name === teamName);

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

  const formatOdds = (odds) => {
    if (!odds || odds === 0) return '-';
    return odds > 0 ? `+${odds}` : odds;
  };

  const gameTime = game.commence_time || game.game_date;
  const formattedDate = gameTime ? new Date(gameTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York'
  }) : 'TBD';

  const formattedTime = gameTime ? new Date(gameTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    hour12: true
  }) : 'TBD';

  const handleAnalyzeGame = async (game) => {
    if (!game || !game.id) return;
    const gameId = game.id;
    setAnalyzingGames(prev => ({ ...prev, [gameId]: true }));

    try {
      const response = await runAnalyzer(gameId, 'NBA', false);

      const data = response?.data || response;
      if (data?.success && data?.results?.[0]) {
        const fullResult = data.results[0];

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

  const gameId = game.id;
  const isAnalyzing = analyzingGames[gameId];
  const analysisData = analysisResults[gameId]?.data;

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-orange-500/30 shadow-2xl overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-orange-900/30 via-slate-800 to-orange-900/30 border-b border-orange-500/20">
        <div className="flex items-center gap-4 mb-4">
          <img src={awayLogo} alt={awayTeam} className="w-12 h-12" />
          <div>
            <div className="text-2xl font-bold text-orange-300">{awayTeam}</div>
            <div className="text-sm text-slate-400">AWAY</div>
          </div>
        </div>

        <div className="text-center text-purple-400 text-2xl font-bold my-2">@</div>

        <div className="flex items-center gap-4 mb-4">
          <img src={homeLogo} alt={homeTeam} className="w-12 h-12" />
          <div>
            <div className="text-2xl font-bold text-cyan-300">{homeTeam}</div>
            <div className="text-sm text-slate-400">HOME</div>
          </div>
        </div>

        <div className="text-center mt-4 text-white text-sm">
          {formattedDate} • {formattedTime} EST
        </div>
      </div>

      <div className="p-6 grid grid-cols-2 gap-4">
        {/* DRAFTKINGS */}
        <div className="bg-emerald-900/30 border-2 border-emerald-500 rounded-xl p-4">
          <div className="text-center mb-4">
            <div className="text-emerald-400 text-xl font-black">DRAFTKINGS</div>
          </div>

          <div className="mb-4">
            <div className="text-slate-400 text-xs font-semibold mb-2 uppercase">Moneyline</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-900/60 rounded p-2">
                <div className="flex items-center gap-2">
                  <img src={awayLogo} alt="" className="w-6 h-6" />
                  <span className="text-white font-bold">{awayCode}</span>
                </div>
                <span className="text-emerald-400 font-bold text-lg">{formatOdds(awayML_DK?.price)}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 rounded p-2">
                <div className="flex items-center gap-2">
                  <img src={homeLogo} alt="" className="w-6 h-6" />
                  <span className="text-white font-bold">{homeCode}</span>
                </div>
                <span className="text-emerald-400 font-bold text-lg">{formatOdds(homeML_DK?.price)}</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-slate-400 text-xs font-semibold mb-2 uppercase">Spread</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-900/60 rounded p-2">
                <div className="flex items-center gap-2">
                  <img src={awayLogo} alt="" className="w-6 h-6" />
                  <span className="text-white font-bold">{awayCode}</span>
                </div>
                <span className="text-emerald-400 font-bold">
                  {awaySpread_DK?.point > 0 ? '+' : ''}{awaySpread_DK?.point || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 rounded p-2">
                <div className="flex items-center gap-2">
                  <img src={homeLogo} alt="" className="w-6 h-6" />
                  <span className="text-white font-bold">{homeCode}</span>
                </div>
                <span className="text-emerald-400 font-bold">
                  {homeSpread_DK?.point > 0 ? '+' : ''}{homeSpread_DK?.point || '-'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-xs font-semibold mb-2 uppercase">Total</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-900/60 rounded p-2">
                <span className="text-white font-bold">O {over_DK?.point || '-'}</span>
                <span className="text-emerald-400 font-bold">{formatOdds(over_DK?.price)}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 rounded p-2">
                <span className="text-white font-bold">U {under_DK?.point || '-'}</span>
                <span className="text-emerald-400 font-bold">{formatOdds(under_DK?.price)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FANDUEL */}
        <div className="bg-blue-900/30 border-2 border-blue-500 rounded-xl p-4">
          <div className="text-center mb-4">
            <div className="text-blue-400 text-xl font-black">FANDUEL</div>
          </div>

          <div className="mb-4">
            <div className="text-slate-400 text-xs font-semibold mb-2 uppercase">Moneyline</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-900/60 rounded p-2">
                <div className="flex items-center gap-2">
                  <img src={awayLogo} alt="" className="w-6 h-6" />
                  <span className="text-white font-bold">{awayCode}</span>
                </div>
                <span className="text-blue-400 font-bold text-lg">{formatOdds(awayML_FD?.price)}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 rounded p-2">
                <div className="flex items-center gap-2">
                  <img src={homeLogo} alt="" className="w-6 h-6" />
                  <span className="text-white font-bold">{homeCode}</span>
                </div>
                <span className="text-blue-400 font-bold text-lg">{formatOdds(homeML_FD?.price)}</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-slate-400 text-xs font-semibold mb-2 uppercase">Spread</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-900/60 rounded p-2">
                <div className="flex items-center gap-2">
                  <img src={awayLogo} alt="" className="w-6 h-6" />
                  <span className="text-white font-bold">{awayCode}</span>
                </div>
                <span className="text-blue-400 font-bold">
                  {awaySpread_FD?.point > 0 ? '+' : ''}{awaySpread_FD?.point || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 rounded p-2">
                <div className="flex items-center gap-2">
                  <img src={homeLogo} alt="" className="w-6 h-6" />
                  <span className="text-white font-bold">{homeCode}</span>
                </div>
                <span className="text-blue-400 font-bold">
                  {homeSpread_FD?.point > 0 ? '+' : ''}{homeSpread_FD?.point || '-'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-xs font-semibold mb-2 uppercase">Total</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-900/60 rounded p-2">
                <span className="text-white font-bold">O {over_FD?.point || '-'}</span>
                <span className="text-blue-400 font-bold">{formatOdds(over_FD?.price)}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 rounded p-2">
                <span className="text-white font-bold">U {under_FD?.point || '-'}</span>
                <span className="text-blue-400 font-bold">{formatOdds(under_FD?.price)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-700 grid grid-cols-3 gap-3">
        <button
          onClick={() => handleAnalyzeGame(game)}
          disabled={isAnalyzing}
          className="px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Analyzing...' : 'Game Analysis'}
        </button>
        <button
          onClick={() => handleAnalyzeGame(game)}
          disabled={isAnalyzing}
          className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Analyzing...' : 'Player Props'}
        </button>
        <button
          onClick={() => handleAnalyzeGame(game)}
          disabled={isAnalyzing}
          className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Analyzing...' : 'Team Props'}
        </button>
      </div>

      {/* Analysis Results Display */}
      {analysisData && (
        <div className="p-6 border-t border-slate-700 bg-slate-900/50 space-y-4">
          <div className="text-orange-400 font-bold text-lg mb-3">📊 Analysis Results</div>

          {analysisData.the_edge && (
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-4 rounded-lg border border-purple-500/30">
              <div className="text-purple-300 font-bold mb-2">🎯 The Edge</div>
              <div className="text-white">{analysisData.the_edge}</div>
            </div>
          )}

          {analysisData.score_prediction && (
            <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 p-4 rounded-lg border border-blue-500/30">
              <div className="text-cyan-300 font-bold mb-2">🏀 Score Prediction</div>
              <div className="text-white">{analysisData.score_prediction}</div>
            </div>
          )}

          {analysisData.recommended_bets && analysisData.recommended_bets.length > 0 && (
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-4 rounded-lg border border-green-500/30">
              <div className="text-emerald-300 font-bold mb-2">💰 Recommended Bets ({analysisData.recommended_bets.length})</div>
              <ul className="space-y-1">
                {analysisData.recommended_bets.map((bet, i) => (
                  <li key={i} className="text-white text-sm">✓ {bet}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Player Props - DraftKings */}
          {analysisData.top_player_props_draftkings && analysisData.top_player_props_draftkings.length > 0 && (
            <div className="bg-gradient-to-r from-green-900/30 to-lime-900/30 p-4 rounded-lg border border-green-500/30">
              <div className="text-lime-300 font-bold mb-2">
                🎰 Top Player Props - DraftKings ({analysisData.top_player_props_draftkings.length})
              </div>
              <div className="space-y-2">
                {analysisData.top_player_props_draftkings.slice(0, 5).map((prop, i) => (
                  <div key={i} className="text-white text-sm bg-black/30 p-2 rounded">
                    {JSON.stringify(prop)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Player Props - FanDuel */}
          {analysisData.top_player_props_fanduel && analysisData.top_player_props_fanduel.length > 0 && (
            <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-4 rounded-lg border border-blue-500/30">
              <div className="text-indigo-300 font-bold mb-2">
                🎰 Top Player Props - FanDuel ({analysisData.top_player_props_fanduel.length})
              </div>
              <div className="space-y-2">
                {analysisData.top_player_props_fanduel.slice(0, 5).map((prop, i) => (
                  <div key={i} className="text-white text-sm bg-black/30 p-2 rounded">
                    {JSON.stringify(prop)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="px-6 pb-3 text-xs text-slate-500 font-mono">
        Game ID: {game.id}
      </div>
    </div>
  );
}