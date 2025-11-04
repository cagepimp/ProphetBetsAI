// AI LEARNING LAB - Train Your Analyzer System
// View database stats, manage data, and prepare for ML training

import { useState, useEffect } from 'react';
import { getGames, getPredictions, getPlayerProps, getInjuries } from '@/api/supabaseClient';
import { Brain, Database, TrendingUp, Target, Zap, Upload, Download,
         BarChart3, Award, Clock, CheckCircle, XCircle, AlertCircle,
         PlayCircle, RefreshCw, Trash2, Eye, FileText, Activity } from 'lucide-react';

export default function AILearningLab() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState({});
  const [stats, setStats] = useState({
    totalGames: 0,
    totalProps: 0,
    totalInjuries: 0,
    totalPredictions: 0,
    gamesBySport: {},
    propsBySport: {},
    recentGames: []
  });

  // ============================================
  // LOAD DATABASE STATISTICS
  // ============================================
  const loadDatabaseStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));

      // Load all data in parallel
      const [allGames, allProps, allInjuries, allPredictions] = await Promise.all([
        getGames({}),
        getPlayerProps({}),
        getInjuries({}),
        getPredictions({})
      ]);

      // Calculate stats
      const gamesBySport = {};
      const propsBySport = {};

      allGames.forEach(game => {
        gamesBySport[game.sport] = (gamesBySport[game.sport] || 0) + 1;
      });

      allProps.forEach(prop => {
        propsBySport[prop.sport] = (propsBySport[prop.sport] || 0) + 1;
      });

      // Get recent games
      const recentGames = allGames
        .sort((a, b) => new Date(b.game_date) - new Date(a.game_date))
        .slice(0, 10);

      setStats({
        totalGames: allGames.length,
        totalProps: allProps.length,
        totalInjuries: allInjuries.length,
        totalPredictions: allPredictions.length,
        gamesBySport,
        propsBySport,
        recentGames
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  // ============================================
  // PLACEHOLDER FUNCTIONS (REQUIRE EDGE FUNCTIONS)
  // ============================================
  const showEdgeFunctionAlert = (feature) => {
    alert(`⚠️ ${feature} requires backend Edge Functions that are not yet implemented.\n\n` +
          `This feature will:\n` +
          `• Connect to external APIs\n` +
          `• Process and analyze data\n` +
          `• Train ML models\n\n` +
          `For now, you can view existing data in the dashboard.`);
  };

  const handleFeedManualData = () => showEdgeFunctionAlert('Manual Data Ingestion');
  const handleFeedCSV = () => showEdgeFunctionAlert('CSV Upload');
  const handleScrapeSportsReference = () => showEdgeFunctionAlert('Sports Reference Scraping');
  const handleImportOddsWarehouse = () => showEdgeFunctionAlert('Odds Warehouse Import');
  const handleRunBacktest = () => showEdgeFunctionAlert('Historical Backtest');
  const handleGradeAll = () => showEdgeFunctionAlert('Auto-Grading');
  const handleForceRetrain = () => showEdgeFunctionAlert('Model Retraining');
  const handleExportPatterns = () => showEdgeFunctionAlert('Pattern Export');
  const handleClearLearningData = () => {
    if (!confirm('⚠️ This will DELETE ALL data from the database!\n\nAre you ABSOLUTELY SURE?')) {
      return;
    }
    showEdgeFunctionAlert('Data Clearing');
  };

  // ============================================
  // RENDER: DASHBOARD TAB
  // ============================================
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 border-2 border-emerald-500 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-emerald-400" />
            <div className="text-emerald-100 text-sm">Total Games</div>
          </div>
          <div className="text-4xl font-black text-emerald-300">
            {stats.totalGames}
          </div>
          <div className="text-xs text-emerald-400 mt-1">
            In database
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-2 border-blue-500 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <div className="text-blue-100 text-sm">Player Props</div>
          </div>
          <div className="text-4xl font-black text-blue-300">
            {stats.totalProps}
          </div>
          <div className="text-xs text-blue-400 mt-1">
            Available props
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-purple-400" />
            <div className="text-purple-100 text-sm">Injuries</div>
          </div>
          <div className="text-4xl font-black text-purple-300">
            {stats.totalInjuries}
          </div>
          <div className="text-xs text-purple-400 mt-1">
            Injury reports
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-yellow-400" />
            <div className="text-yellow-100 text-sm">Predictions</div>
          </div>
          <div className="text-4xl font-black text-yellow-300">
            {stats.totalPredictions}
          </div>
          <div className="text-xs text-yellow-400 mt-1">
            Stored predictions
          </div>
        </div>
      </div>

      {/* Games by Sport */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          Games by Sport
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(stats.gamesBySport).map(([sport, count]) => (
            <div key={sport} className="bg-slate-900/60 rounded-lg p-4 text-center border border-slate-700">
              <div className="text-slate-400 text-sm font-semibold mb-2">{sport}</div>
              <div className="text-3xl font-black text-emerald-400">{count}</div>
              <div className="text-xs text-slate-500 mt-1">games</div>
            </div>
          ))}
          {Object.keys(stats.gamesBySport).length === 0 && (
            <div className="col-span-6 text-center text-slate-500 py-8">
              No games in database yet
            </div>
          )}
        </div>
      </div>

      {/* Props by Sport */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-400" />
          Props by Sport
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.propsBySport).map(([sport, count]) => (
            <div key={sport} className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-xs font-semibold mb-1">{sport}</div>
              <div className="text-2xl font-bold text-purple-400">{count}</div>
            </div>
          ))}
          {Object.keys(stats.propsBySport).length === 0 && (
            <div className="col-span-4 text-center text-slate-500 py-4">
              No props in database yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Games */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-green-400" />
          Recent Games
        </h3>
        <div className="space-y-2">
          {stats.recentGames.map((game, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-white font-bold mb-1">
                    {game.away_team} @ {game.home_team}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {game.sport} • {new Date(game.game_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold uppercase ${
                    game.status === 'scheduled' ? 'text-green-400' :
                    game.status === 'live' ? 'text-yellow-400' :
                    game.status === 'completed' ? 'text-slate-400' :
                    'text-blue-400'
                  }`}>
                    {game.status}
                  </div>
                  {game.home_score !== null && game.away_score !== null && (
                    <div className="text-white text-sm mt-1">
                      {game.away_score} - {game.home_score}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {stats.recentGames.length === 0 && (
            <div className="text-center text-slate-500 py-8">
              No games in database yet
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={loadDatabaseStats}
          disabled={loading.stats}
          className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-lg disabled:opacity-50 flex items-center gap-3 shadow-lg"
        >
          {loading.stats ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Refresh Stats
            </>
          )}
        </button>
      </div>
    </div>
  );

  // ============================================
  // RENDER: DATA INGESTION TAB
  // ============================================
  const renderDataIngestion = () => (
    <div className="space-y-6">
      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-yellow-300 font-bold text-lg mb-2">Backend Required</h3>
            <p className="text-yellow-100 text-sm">
              Data ingestion features require Supabase Edge Functions to be deployed. These functions will:
            </p>
            <ul className="mt-2 space-y-1 text-yellow-100 text-sm ml-4">
              <li>• Fetch data from external APIs (ESPN, TheOddsAPI, etc.)</li>
              <li>• Process and validate incoming data</li>
              <li>• Store structured data in the database</li>
              <li>• Trigger ML training pipelines</li>
            </ul>
            <p className="text-yellow-200 text-sm mt-3 font-semibold">
              For now, you can manually insert data using the SQL Editor in Supabase.
            </p>
          </div>
        </div>
      </div>

      {/* Manual JSON Input (Placeholder) */}
      <div className="bg-slate-800/60 border border-purple-500 rounded-xl p-6 opacity-50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-400" />
          Feed Manual JSON Data (Coming Soon)
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Will allow pasting JSON data from any source
        </p>
        <button
          onClick={handleFeedManualData}
          className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Coming Soon
        </button>
      </div>

      {/* CSV Upload (Placeholder) */}
      <div className="bg-slate-800/60 border border-blue-500 rounded-xl p-6 opacity-50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Upload className="w-6 h-6 text-blue-400" />
          Upload Historical CSV (Coming Soon)
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Will support CSV files from OddsWarehouse, SportsData.io, etc.
        </p>
        <button
          onClick={handleFeedCSV}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Coming Soon
        </button>
      </div>

      {/* Auto-Scrape (Placeholder) */}
      <div className="bg-slate-800/60 border border-emerald-500 rounded-xl p-6 opacity-50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Database className="w-6 h-6 text-emerald-400" />
          Auto-Scrape from Sources (Coming Soon)
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Will automatically fetch historical data from Sports-Reference, ESPN, etc.
        </p>
        <button
          onClick={handleScrapeSportsReference}
          className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Coming Soon
        </button>
      </div>
    </div>
  );

  // ============================================
  // RENDER: PATTERNS TAB
  // ============================================
  const renderPatterns = () => (
    <div className="space-y-6">
      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-yellow-300 font-bold text-lg mb-2">ML Models Coming Soon</h3>
            <p className="text-yellow-100 text-sm">
              Pattern discovery requires:
            </p>
            <ul className="mt-2 space-y-1 text-yellow-100 text-sm ml-4">
              <li>• Historical game data with outcomes</li>
              <li>• ML training pipeline in Edge Functions</li>
              <li>• Pattern recognition algorithms</li>
              <li>• Accuracy tracking and validation</li>
            </ul>
            <p className="text-yellow-200 text-sm mt-3 font-semibold">
              The database schema is ready - we just need to deploy the analysis functions.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center py-12">
        <Brain className="w-24 h-24 text-slate-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-400 mb-2">No Patterns Yet</h3>
        <p className="text-slate-500">
          Feed historical data and run training to discover patterns
        </p>
      </div>
    </div>
  );

  // ============================================
  // RENDER: TRAINING TAB
  // ============================================
  const renderTraining = () => (
    <div className="space-y-6">
      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-yellow-300 font-bold text-lg mb-2">Training Features Coming Soon</h3>
            <p className="text-yellow-100 text-sm">
              These features will be available once Edge Functions are deployed.
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleRunBacktest}
          className="px-6 py-8 bg-gradient-to-br from-yellow-600/50 to-orange-600/50 text-white rounded-xl border-2 border-yellow-500/50 opacity-50"
        >
          <PlayCircle className="w-12 h-12 mx-auto mb-3" />
          <div className="text-xl font-bold">Run Backtest</div>
          <div className="text-sm opacity-80">Coming Soon</div>
        </button>

        <button
          onClick={handleGradeAll}
          className="px-6 py-8 bg-gradient-to-br from-green-600/50 to-emerald-600/50 text-white rounded-xl border-2 border-green-500/50 opacity-50"
        >
          <CheckCircle className="w-12 h-12 mx-auto mb-3" />
          <div className="text-xl font-bold">Grade All</div>
          <div className="text-sm opacity-80">Coming Soon</div>
        </button>

        <button
          onClick={handleForceRetrain}
          className="px-6 py-8 bg-gradient-to-br from-purple-600/50 to-pink-600/50 text-white rounded-xl border-2 border-purple-500/50 opacity-50"
        >
          <Brain className="w-12 h-12 mx-auto mb-3" />
          <div className="text-xl font-bold">Force Retrain</div>
          <div className="text-sm opacity-80">Coming Soon</div>
        </button>
      </div>
    </div>
  );

  // ============================================
  // RENDER: HISTORY TAB
  // ============================================
  const renderHistory = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
        <Activity className="w-8 h-8 text-cyan-400" />
        Prediction History
      </h3>

      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <div className="text-center py-12">
          <Activity className="w-24 h-24 text-slate-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-400 mb-2">No Training History Yet</h3>
          <p className="text-slate-500">
            Predictions will appear here once the analyzer runs
          </p>
        </div>
      </div>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-400" />
            AI Learning Lab
          </h1>
          <p className="text-slate-400">
            View database stats and prepare for ML training (Edge Functions deployment required)
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'ingest', label: 'Feed Data', icon: Upload },
            { id: 'patterns', label: 'Patterns', icon: Brain },
            { id: 'training', label: 'Training', icon: Zap },
            { id: 'history', label: 'History', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'ingest' && renderDataIngestion()}
          {activeTab === 'patterns' && renderPatterns()}
          {activeTab === 'training' && renderTraining()}
          {activeTab === 'history' && renderHistory()}
        </div>
      </div>
    </div>
  );
}
