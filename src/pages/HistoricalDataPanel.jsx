import React, { useState, useEffect } from 'react';
import { callEdgeFunction } from '@/api/supabaseClient';
import * as entities from '@/api/entities';
import * as functions from '@/api/functions';
import { Database, TrendingUp, FileText, Loader, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function HistoricalDataPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState('NFL');
  const [stats, setStats] = useState({
    historicalGames: 0,
    historicalOdds: 0,
    teamStats: 0,
    learningPatterns: 0,
    predictions: 0
  });

  // Function to invoke Base44 functions
  const invokeFunction = async (functionName, params) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`🚀 Invoking ${functionName}...`, params);
      
      const response = await functions.invoke(functionName, params);
      
      console.log(`✅ ${functionName} response:`, response);
      
      setResult({
        function: functionName,
        success: true,
        data: response.data || response
      });

      // Refresh stats after successful operation
      await loadStats();
      
    } catch (err) {
      console.error(`❌ ${functionName} error:`, err);
      setError(err.message || 'Function execution failed');
    } finally {
      setLoading(false);
    }
  };

  // Load database statistics
  const loadStats = async () => {
    try {
      const [games, odds, teamStats, patterns, predictions] = await Promise.all([
        entities.HistoricalGames.list(),
        entities.HistoricalOdds.list(),
        entities.TeamSeasonStats.list(),
        entities.LearningPatterns.list(),
        entities.PredictionHistory.list()
      ]);

      setStats({
        historicalGames: games.length || 0,
        historicalOdds: odds.length || 0,
        teamStats: teamStats.length || 0,
        learningPatterns: patterns.length || 0,
        predictions: predictions.length || 0
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Button handlers
  const handleTestNFL = () => {
    if (confirm(`This will import up to 10 ${selectedSport} games from Week 1 of 2024. Continue?`)) {
      invokeFunction('populateNFLHistory', {
        season: 2024,
        startWeek: 1,
        endWeek: 1,
        seasonType: 2
      });
    }
  };

  const handleFullNFL = () => {
    // Calculate current NFL week
    const now = new Date();
    const seasonStart = new Date('2024-09-05'); // NFL 2024 kickoff
    const weeksSinceStart = Math.floor((now - seasonStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
    const currentWeek = Math.min(Math.max(weeksSinceStart, 1), 18);
    
    if (confirm(`⚠️ This will populate 2024 NFL season from Week 1 to Week ${currentWeek} (current week). This will take ${currentWeek * 2}-${currentWeek * 3} minutes. Continue?`)) {
      invokeFunction('populateNFLHistory', {
        season: 2024,
        startWeek: 1,
        endWeek: currentWeek,
        seasonType: 2,
        clearExisting: false
      });
    }
  };

  const handleTestFetch = () => {
    invokeFunction('fetchSportsData', {
      homeTeam: 'Kansas City Chiefs',
      awayTeam: 'Baltimore Ravens',
      sport: 'NFL',
      includeHistorical: true,
      yearsBack: 5
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Database className="text-blue-400" size={40} />
            Historical Data Control Panel
          </h1>
          <p className="text-purple-200">
            Populate and manage your analyzer's 5-year historical database
          </p>
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-4 mb-6 flex items-center">
            <Loader className="animate-spin mr-3 text-blue-300" size={24} />
            <div className="flex-1">
              <p className="text-blue-100 font-semibold">Processing...</p>
              <p className="text-blue-200 text-sm">Check browser console for detailed progress</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="mr-3 text-red-300" size={24} />
            <div className="flex-1">
              <p className="text-red-100 font-semibold">Error</p>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {result && result.success && (
          <div className={`border rounded-lg p-4 mb-6 ${
            result.data?.games_saved === 0 && result.data?.games_failed > 0
              ? 'bg-yellow-500 bg-opacity-20 border-yellow-400'
              : 'bg-green-500 bg-opacity-20 border-green-400'
          }`}>
            <div className="flex items-start">
              {result.data?.games_saved === 0 && result.data?.games_failed > 0 ? (
                <AlertCircle className="mr-3 text-yellow-300 mt-1" size={24} />
              ) : (
                <CheckCircle className="mr-3 text-green-300 mt-1" size={24} />
              )}
              <div className="flex-1">
                <p className={`font-semibold mb-2 ${
                  result.data?.games_saved === 0 && result.data?.games_failed > 0
                    ? 'text-yellow-100'
                    : 'text-green-100'
                }`}>
                  {result.data?.games_saved === 0 && result.data?.games_failed > 0
                    ? '⚠️ Function Ran But No Games Saved!'
                    : 'Success!'
                  }
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="bg-purple-950 border border-purple-700 p-3 rounded">
                    <p className="text-xs text-purple-300">Games Found</p>
                    <p className="text-2xl font-bold text-blue-400">{result.data?.total_games_found || 0}</p>
                  </div>
                  <div className="bg-purple-950 border border-purple-700 p-3 rounded">
                    <p className="text-xs text-purple-300">Games Saved</p>
                    <p className={`text-2xl font-bold ${
                      result.data?.games_saved > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>{result.data?.games_saved || 0}</p>
                  </div>
                  <div className="bg-purple-950 border border-purple-700 p-3 rounded">
                    <p className="text-xs text-purple-300">Games Failed</p>
                    <p className={`text-2xl font-bold ${
                      result.data?.games_failed > 0 ? 'text-red-400' : 'text-green-400'
                    }`}>{result.data?.games_failed || 0}</p>
                  </div>
                  <div className="bg-purple-950 border border-purple-700 p-3 rounded">
                    <p className="text-xs text-purple-300">Weeks Processed</p>
                    <p className="text-2xl font-bold text-purple-400">{result.data?.weeks_processed || 0}</p>
                  </div>
                </div>

                {result.data?.games_saved === 0 && result.data?.games_failed > 0 && (
                  <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded p-3 mb-3">
                    <p className="text-red-200 text-sm font-semibold mb-1">⚠️ Database Insert Issue</p>
                    <p className="text-red-300 text-xs">
                      The function fetched {result.data.total_games_found} games but couldn't save them to the database.
                      This usually means the HistoricalGames entity schema doesn't match the data structure.
                    </p>
                  </div>
                )}

                <details className="mt-3">
                  <summary className="text-purple-200 text-sm cursor-pointer hover:text-purple-100">
                    📋 View Full Response JSON
                  </summary>
                  <pre className="bg-black bg-opacity-30 text-purple-100 text-xs p-3 rounded overflow-x-auto max-h-40 mt-2">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        )}

        {/* Database Stats */}
        <div className="bg-purple-800 bg-opacity-40 rounded-lg border border-purple-600 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <TrendingUp className="text-purple-300" size={28} />
              Database Statistics
            </h2>
            <div className="flex gap-2">
              <button
                onClick={loadStats}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                onClick={() => window.open('/HistoricalGamesView', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Database size={16} />
                View All Games
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-purple-900 bg-opacity-50 rounded-lg p-4 text-center">
              <p className="text-purple-300 text-sm mb-1">Historical Games</p>
              <p className="text-3xl font-bold text-blue-400">{stats.historicalGames}</p>
            </div>
            <div className="bg-purple-900 bg-opacity-50 rounded-lg p-4 text-center">
              <p className="text-purple-300 text-sm mb-1">Historical Odds</p>
              <p className="text-3xl font-bold text-green-400">{stats.historicalOdds}</p>
            </div>
            <div className="bg-purple-900 bg-opacity-50 rounded-lg p-4 text-center">
              <p className="text-purple-300 text-sm mb-1">Team Stats</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.teamStats}</p>
            </div>
            <div className="bg-purple-900 bg-opacity-50 rounded-lg p-4 text-center">
              <p className="text-purple-300 text-sm mb-1">Learning Patterns</p>
              <p className="text-3xl font-bold text-pink-400">{stats.learningPatterns}</p>
            </div>
            <div className="bg-purple-900 bg-opacity-50 rounded-lg p-4 text-center">
              <p className="text-purple-300 text-sm mb-1">Predictions</p>
              <p className="text-3xl font-bold text-indigo-400">{stats.predictions}</p>
            </div>
          </div>
        </div>

        {/* Control Sections */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Sports History Population */}
          <div className="bg-purple-800 bg-opacity-40 rounded-lg border border-purple-600 p-6 md:col-span-2">
            <div className="flex items-center mb-4">
              <Database className="text-blue-400 mr-3" size={28} />
              <h2 className="text-2xl font-semibold text-white">Sports Game History</h2>
            </div>
            
            <p className="text-purple-200 text-sm mb-4">
              Populate your database with historical games from multiple sports
            </p>

            {/* Sport Selection */}
            <div className="mb-4">
              <label className="text-purple-200 text-sm font-semibold mb-2 block">Select Sport:</label>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {['NFL', 'CFB', 'NBA', 'MLB', 'NHL', 'UFC', 'Golf'].map(sport => (
                  <button
                    key={sport}
                    onClick={() => setSelectedSport(sport)}
                    className={`py-2 px-3 rounded-lg font-semibold transition-colors ${
                      selectedSport === sport
                        ? 'bg-blue-600 text-white'
                        : 'bg-purple-700 bg-opacity-50 text-purple-200 hover:bg-purple-600'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={handleTestNFL}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                🧪 Test Mode (10 games)
              </button>

              <button
                onClick={handleFullNFL}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                🚀 Smart Full Population (Season → Current Week)
              </button>
            </div>

            <div className="mt-4 p-3 bg-purple-900 bg-opacity-50 rounded border border-purple-700">
              <p className="text-purple-200 text-xs">
                <strong className="text-purple-100">Currently selected:</strong> {selectedSport}<br />
                <strong className="text-purple-100">Test Mode:</strong> Loads 10 games from Week 1 (~30 seconds)<br />
                <strong className="text-purple-100">Smart Full Mode:</strong> Auto-calculates current week and loads Season Start → Current Week<br />
                <strong className="text-purple-100">Auto-Update:</strong> Runs every Tuesday at 1:01 AM EST to get the latest week automatically
              </p>
            </div>
          </div>

          {/* Historical Data Fetch Test */}
          <div className="bg-purple-800 bg-opacity-40 rounded-lg border border-purple-600 p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="text-purple-400 mr-3" size={28} />
              <h2 className="text-2xl font-semibold text-white">Test Data Engine</h2>
            </div>
            
            <p className="text-purple-200 text-sm mb-4">
              Test the historical data analysis engine with Chiefs vs Ravens
            </p>

            <button
              onClick={handleTestFetch}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 w-full"
            >
              🔍 Fetch Historical Analysis
            </button>

            <div className="mt-4 p-3 bg-purple-900 bg-opacity-50 rounded border border-purple-700">
              <p className="text-purple-200 text-xs">
                <strong className="text-purple-100">Tests:</strong> 5 years history • H2H records • Home/away splits • Recent momentum
              </p>
            </div>
          </div>

          {/* Odds Import Instructions */}
          <div className="bg-purple-800 bg-opacity-40 rounded-lg border border-purple-600 p-6">
            <div className="flex items-center mb-4">
              <FileText className="text-yellow-400 mr-3" size={28} />
              <h2 className="text-2xl font-semibold text-white">Import Historical Odds (Manual)</h2>
            </div>
            
            <p className="text-purple-200 text-sm mb-4">
              Historical odds require CSV data. Use the Base44 Functions tab to import:
            </p>

            <div className="bg-purple-900 bg-opacity-50 p-4 rounded border border-purple-700">
              <div className="mb-4">
                <p className="text-purple-100 font-semibold mb-2">📍 Steps:</p>
                <ol className="text-purple-200 text-sm space-y-2 ml-4 list-decimal">
                  <li>Go to Functions → <code className="bg-purple-950 px-2 py-1 rounded">populateDraftKingsOdds</code></li>
                  <li>Click "Test" or "Invoke"</li>
                  <li>Paste CSV data in parameters (see format below)</li>
                  <li>Repeat for <code className="bg-purple-950 px-2 py-1 rounded">populateFanDuelOdds</code></li>
                </ol>
              </div>

              <div className="mb-4">
                <p className="text-purple-100 font-semibold mb-2">📋 Required CSV Format:</p>
                <pre className="bg-purple-950 p-3 rounded text-xs text-green-300 overflow-x-auto">
{`game_date,home_team,away_team,opening_spread,closing_spread,opening_total,closing_total,opening_ml_home,opening_ml_away,closing_ml_home,closing_ml_away
2024-09-05,Kansas City Chiefs,Baltimore Ravens,-3.0,-2.5,46.5,47.0,-150,+130,-140,+120
2024-09-08,Los Angeles Rams,Detroit Lions,-3.5,-3.0,51.5,52.0,-160,+140,-150,+130`}
                </pre>
              </div>

              <div className="pt-3 border-t border-purple-700">
                <p className="text-yellow-300 text-sm mb-2">
                  ⚠️ <strong>Data Sources:</strong>
                </p>
                <ul className="text-purple-200 text-sm ml-4 space-y-1">
                  <li>• <strong>OddsPortal.com</strong> - Free, manual export</li>
                  <li>• <strong>SportsDataIO.com</strong> - $50/mo, has API</li>
                  <li>• <strong>The Odds API</strong> - 100 requests/day free</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg p-6">
          <h3 className="text-blue-200 font-semibold mb-3 text-lg">📘 Quick Start Guide</h3>
          <ol className="text-blue-100 text-sm space-y-2 ml-4 list-decimal">
            <li><strong>Test the system:</strong> Click "Test Mode" to import 10 games (30 seconds)</li>
            <li><strong>Verify it works:</strong> Check stats above show 10+ games</li>
            <li><strong>Smart full import:</strong> Click "Smart Full Population" to auto-load Season Start → Current Week</li>
            <li><strong>Test analysis:</strong> Click "Fetch Historical Analysis" to verify engine works</li>
            <li><strong>Add odds data:</strong> Manually import via Functions tab (optional but recommended)</li>
            <li><strong>Automated updates:</strong> System auto-updates every Tuesday at 1:01 AM EST with latest week!</li>
          </ol>
        </div>

      </div>
    </div>
  );
}