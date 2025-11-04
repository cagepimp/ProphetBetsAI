// AI LEARNING LAB - Train Your 87.9% Accuracy System
// Feed it historical data, watch it learn patterns, monitor accuracy

import { useState, useEffect } from 'react';
import { callEdgeFunction } from '@/api/supabaseClient';
import * as entities from '@/api/entities';
import { Brain, Database, TrendingUp, Target, Zap, Upload, Download, 
         BarChart3, Award, Clock, CheckCircle, XCircle, AlertCircle,
         PlayCircle, RefreshCw, Trash2, Eye, FileText, Activity } from 'lucide-react';

export default function AILearningLab() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState({});
  const [learningStats, setLearningStats] = useState(null);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [manualData, setManualData] = useState('');
  const [csvFile, setCsvFile] = useState(null);

  // ============================================
  // LOAD LEARNING STATISTICS
  // ============================================
  const loadLearningStats = async () => {
    try {
      const response = await callEdgeFunction('getLearningSystemStats');
      const data = response?.data || response;
      
      setLearningStats({
        totalPredictions: data.totalPredictions || 0,
        gradedPredictions: data.gradedPredictions || 0,
        overallAccuracy: data.overallAccuracy || 0,
        last7DaysAccuracy: data.last7DaysAccuracy || 0,
        last30DaysAccuracy: data.last30DaysAccuracy || 0,
        patternsDiscovered: data.patternsDiscovered || 0,
        highConfidencePatterns: data.highConfidencePatterns || 0,
        trainingDataSize: data.trainingDataSize || 0,
        lastTraining: data.lastTraining || null,
        accuracyBySport: data.accuracyBySport || {},
        accuracyByBetType: data.accuracyByBetType || {},
        recentImprovements: data.recentImprovements || []
      });
    } catch (error) {
      console.error('Failed to load learning stats:', error);
    }
  };

  // ============================================
  // LOAD DISCOVERED PATTERNS
  // ============================================
  const loadPatterns = async () => {
    try {
      const response = await callEdgeFunction('getLearnedPatterns', {
        minAccuracy: 70,
        limit: 50
      });
      const data = response?.data || response;
      setPatterns(data.patterns || []);
    } catch (error) {
      console.error('Failed to load patterns:', error);
    }
  };

  // ============================================
  // LOAD TRAINING HISTORY
  // ============================================
  const loadTrainingHistory = async () => {
    try {
      const history = await entities.PredictionHistory.filter({
        graded: true
      }, '-created_at', 100);
      setTrainingHistory(history);
    } catch (error) {
      console.error('Failed to load training history:', error);
    }
  };

  useEffect(() => {
    loadLearningStats();
    loadPatterns();
    loadTrainingHistory();
  }, []);

  // ============================================
  // FEED HISTORICAL CSV DATA
  // ============================================
  const handleFeedCSV = async () => {
    if (!csvFile) {
      alert('Please select a CSV file first!');
      return;
    }

    const key = 'feed_csv';
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvText = e.target.result;
        
        const response = await callEdgeFunction('ingestHistoricalCSV', {
          csvData: csvText,
          source: 'manual_upload',
          autoTrain: true
        });

        const data = response?.data || response;
        alert(`✅ Ingested ${data.gamesAdded} games!\nThe AI will learn from this data.`);
        await loadLearningStats();
        await loadTrainingHistory();
      };
      reader.readAsText(csvFile);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // ============================================
  // FEED MANUAL JSON DATA
  // ============================================
  const handleFeedManualData = async () => {
    if (!manualData.trim()) {
      alert('Please enter some data first!');
      return;
    }

    const key = 'feed_manual';
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const jsonData = JSON.parse(manualData);
      
      const response = await callEdgeFunction('ingestManualData', {
        data: jsonData,
        dataType: 'historical_games',
        autoTrain: true
      });

      const data = response?.data || response;
      alert(`✅ Ingested data successfully!\n${data.itemsProcessed} items processed.`);
      setManualData('');
      await loadLearningStats();
      await loadTrainingHistory();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // ============================================
  // SCRAPE FROM SPORTS-REFERENCE
  // ============================================
  const handleScrapeSportsReference = async (sport, season) => {
    const key = 'scrape_sr';
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const response = await callEdgeFunction('scrapeSportsReference', {
        sport,
        season,
        includeStats: true,
        includeOdds: false // Odds come from separate source
      });

      const data = response?.data || response;
      alert(`✅ Scraped ${data.gamesScraped} ${sport} games from ${season}!`);
      await loadLearningStats();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // ============================================
  // IMPORT ODDS FROM ODDSWAREHOUSE
  // ============================================
  const handleImportOddsWarehouse = async () => {
    const key = 'import_odds';
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const response = await callEdgeFunction('importOddsWarehouseData', {
        sport: 'NFL',
        startYear: 2020,
        endYear: 2025
      });

      const data = response?.data || response;
      alert(`✅ Imported ${data.oddsImported} historical odds entries!`);
      await loadLearningStats();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // ============================================
  // RUN BACKTEST ON HISTORICAL DATA
  // ============================================
  const handleRunBacktest = async (sport, numGames) => {
    const key = 'backtest';
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const response = await callEdgeFunction('runHistoricalBacktest', {
        sport,
        numGames,
        savePredictions: true,
        autoGrade: true,
        autoLearn: true
      });

      const data = response?.data || response;
      alert(`✅ Backtest Complete!\n\nGames: ${data.gamesAnalyzed}\nAccuracy: ${data.accuracy}%\nPatterns Found: ${data.newPatterns}`);
      await loadLearningStats();
      await loadTrainingHistory();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // ============================================
  // GRADE ALL UNGRADED PREDICTIONS
  // ============================================
  const handleGradeAll = async () => {
    const key = 'grade_all';
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const response = await callEdgeFunction('gradeAllPredictions', {
        autoLearn: true
      });

      const data = response?.data || response;
      alert(`✅ Graded ${data.gradedCount} predictions!\nNew Accuracy: ${data.newAccuracy}%`);
      await loadLearningStats();
      await loadTrainingHistory();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // ============================================
  // FORCE RE-TRAIN ON ALL DATA
  // ============================================
  const handleForceRetrain = async () => {
    if (!confirm('This will re-analyze ALL historical data and rebuild patterns. Continue?')) {
      return;
    }

    const key = 'retrain';
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const response = await callEdgeFunction('forceRetrainAnalyzer', {
        clearExistingPatterns: false,
        minDataPoints: 100
      });

      const data = response?.data || response;
      alert(`✅ Retraining Complete!\n\nData Processed: ${data.dataPoints}\nPatterns: ${data.patternsFound}\nNew Accuracy: ${data.accuracy}%`);
      await loadLearningStats();
      await loadPatterns();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // ============================================
  // EXPORT LEARNED PATTERNS
  // ============================================
  const handleExportPatterns = async () => {
    try {
      const response = await callEdgeFunction('exportLearnedPatterns');
      const data = response?.data || response;
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analyzer_patterns_${new Date().toISOString()}.json`;
      a.click();
      
      alert('✅ Patterns exported!');
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  // ============================================
  // CLEAR ALL LEARNING DATA (DANGER!)
  // ============================================
  const handleClearLearningData = async () => {
    if (!confirm('⚠️ This will DELETE ALL learning data, patterns, and prediction history!\n\nAre you ABSOLUTELY SURE?')) {
      return;
    }

    if (!confirm('Final warning: This cannot be undone!')) {
      return;
    }

    const key = 'clear_data';
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      await callEdgeFunction('clearAllLearningData', {
        confirm: true
      });
      
      alert('🗑️ All learning data cleared. System reset to blank slate.');
      await loadLearningStats();
      await loadPatterns();
      await loadTrainingHistory();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
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
            <div className="text-emerald-100 text-sm">Overall Accuracy</div>
          </div>
          <div className="text-4xl font-black text-emerald-300">
            {learningStats?.overallAccuracy || 0}%
          </div>
          <div className="text-xs text-emerald-400 mt-1">
            {learningStats?.gradedPredictions || 0} graded predictions
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-2 border-blue-500 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <div className="text-blue-100 text-sm">Last 7 Days</div>
          </div>
          <div className="text-4xl font-black text-blue-300">
            {learningStats?.last7DaysAccuracy || 0}%
          </div>
          <div className="text-xs text-blue-400 mt-1">
            Recent performance
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-purple-400" />
            <div className="text-purple-100 text-sm">Patterns Found</div>
          </div>
          <div className="text-4xl font-black text-purple-300">
            {learningStats?.patternsDiscovered || 0}
          </div>
          <div className="text-xs text-purple-400 mt-1">
            {learningStats?.highConfidencePatterns || 0} high confidence
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-yellow-400" />
            <div className="text-yellow-100 text-sm">Training Data</div>
          </div>
          <div className="text-4xl font-black text-yellow-300">
            {learningStats?.trainingDataSize || 0}
          </div>
          <div className="text-xs text-yellow-400 mt-1">
            Historical games
          </div>
        </div>
      </div>

      {/* Accuracy by Sport */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          Accuracy by Sport
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(learningStats?.accuracyBySport || {}).map(([sport, accuracy]) => (
            <div key={sport} className="bg-slate-900/60 rounded-lg p-4 text-center border border-slate-700">
              <div className="text-slate-400 text-sm font-semibold mb-2">{sport}</div>
              <div className="text-3xl font-black text-emerald-400">{accuracy}%</div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full"
                  style={{ width: `${accuracy}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accuracy by Bet Type */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-400" />
          Accuracy by Bet Type
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(learningStats?.accuracyByBetType || {}).map(([betType, accuracy]) => (
            <div key={betType} className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-xs font-semibold mb-1">{betType}</div>
              <div className="text-2xl font-bold text-purple-400">{accuracy}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Improvements */}
      {learningStats?.recentImprovements && learningStats.recentImprovements.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Recent Improvements
          </h3>
          <div className="space-y-2">
            {learningStats.recentImprovements.map((improvement, idx) => (
              <div key={idx} className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-300 font-semibold">{improvement.pattern}</span>
                  <span className="text-green-400 font-bold">+{improvement.improvement}%</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">{improvement.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ============================================
  // RENDER: DATA INGESTION TAB
  // ============================================
  const renderDataIngestion = () => (
    <div className="space-y-6">
      {/* Manual JSON Input */}
      <div className="bg-slate-800/60 border border-purple-500 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-400" />
          Feed Manual JSON Data
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Paste JSON data from any source (Sports-Reference, your own scraping, etc.)
        </p>
        <textarea
          value={manualData}
          onChange={(e) => setManualData(e.target.value)}
          placeholder={`{\n  "games": [\n    {\n      "home_team": "Kansas City Chiefs",\n      "away_team": "Philadelphia Eagles",\n      "home_score": 38,\n      "away_score": 35,\n      "date": "2023-02-12",\n      ...\n    }\n  ]\n}`}
          className="w-full h-64 bg-slate-900 text-white font-mono text-sm p-4 rounded-lg border border-slate-700 focus:border-purple-500 focus:outline-none"
        />
        <button
          onClick={handleFeedManualData}
          disabled={loading.feed_manual}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading.feed_manual ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Feed Data & Train
            </>
          )}
        </button>
      </div>

      {/* CSV Upload */}
      <div className="bg-slate-800/60 border border-blue-500 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Upload className="w-6 h-6 text-blue-400" />
          Upload Historical CSV
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Upload CSV files from OddsWarehouse, SportsData.io, or your own historical database
        </p>
        <div className="flex gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files[0])}
            className="flex-1 bg-slate-900 text-white p-3 rounded-lg border border-slate-700"
          />
          <button
            onClick={handleFeedCSV}
            disabled={loading.feed_csv || !csvFile}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading.feed_csv ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload & Train
              </>
            )}
          </button>
        </div>
      </div>

      {/* Auto-Scrape Options */}
      <div className="bg-slate-800/60 border border-emerald-500 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Database className="w-6 h-6 text-emerald-400" />
          Auto-Scrape from Sources
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {['NFL', 'NBA', 'MLB', 'CFB'].map(sport => (
            <div key={sport} className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
              <div className="text-white font-bold mb-2">{sport} - Sports-Reference</div>
              <div className="flex gap-2">
                {[2024, 2023, 2022, 2021, 2020].map(year => (
                  <button
                    key={year}
                    onClick={() => handleScrapeSportsReference(sport, year)}
                    disabled={loading.scrape_sr}
                    className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded disabled:opacity-50"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleImportOddsWarehouse}
          disabled={loading.import_odds}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading.import_odds ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Importing Odds...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Import Historical Odds (2020-2025)
            </>
          )}
        </button>
      </div>
    </div>
  );

  // ============================================
  // RENDER: PATTERNS TAB
  // ============================================
  const renderPatterns = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="w-8 h-8 text-purple-400" />
          Discovered Patterns ({patterns.length})
        </h3>
        <button
          onClick={handleExportPatterns}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Patterns
        </button>
      </div>

      <div className="space-y-4">
        {patterns.map((pattern, idx) => (
          <div key={idx} className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white mb-1">{pattern.name}</h4>
                <p className="text-slate-300 text-sm">{pattern.description}</p>
              </div>
              <div className="text-right ml-4">
                <div className="text-3xl font-black text-emerald-400">{pattern.accuracy}%</div>
                <div className="text-xs text-slate-400">{pattern.sampleSize} games</div>
              </div>
            </div>

            {pattern.conditions && (
              <div className="bg-slate-900/60 rounded-lg p-3 mb-3">
                <div className="text-cyan-400 text-xs font-bold mb-2">CONDITIONS:</div>
                <ul className="space-y-1">
                  {pattern.conditions.map((condition, i) => (
                    <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4 text-xs">
              <span className="text-emerald-400">
                ✓ {pattern.wins} wins
              </span>
              <span className="text-red-400">
                ✗ {pattern.losses} losses
              </span>
              <span className="text-slate-400">
                First seen: {new Date(pattern.firstSeen).toLocaleDateString()}
              </span>
              <span className="text-slate-400">
                Last verified: {new Date(pattern.lastVerified).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================
  // RENDER: TRAINING TAB
  // ============================================
  const renderTraining = () => (
    <div className="space-y-6">
      {/* Backtest Controls */}
      <div className="bg-slate-800/60 border border-yellow-500 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <PlayCircle className="w-6 h-6 text-yellow-400" />
          Run Backtests
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Test the analyzer on historical games to see how it would have performed
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['NFL', 'NBA', 'MLB', 'CFB'].map(sport => (
            <div key={sport} className="space-y-2">
              <div className="text-white font-semibold text-center">{sport}</div>
              {[10, 50, 100, 500].map(num => (
                <button
                  key={num}
                  onClick={() => handleRunBacktest(sport, num)}
                  disabled={loading.backtest}
                  className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded disabled:opacity-50 text-sm"
                >
                  {num} Games
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Grading & Learning */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleGradeAll}
          disabled={loading.grade_all}
          className="px-6 py-8 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
        >
          <CheckCircle className="w-12 h-12 mx-auto mb-3" />
          <div className="text-xl font-bold">Grade All</div>
          <div className="text-sm opacity-80">Auto-grade finished games</div>
        </button>

        <button
          onClick={handleForceRetrain}
          disabled={loading.retrain}
          className="px-6 py-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
        >
          <Brain className="w-12 h-12 mx-auto mb-3" />
          <div className="text-xl font-bold">Force Retrain</div>
          <div className="text-sm opacity-80">Rebuild all patterns</div>
        </button>

        <button
          onClick={handleClearLearningData}
          disabled={loading.clear_data}
          className="px-6 py-8 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 disabled:opacity-50"
        >
          <Trash2 className="w-12 h-12 mx-auto mb-3" />
          <div className="text-xl font-bold">Reset System</div>
          <div className="text-sm opacity-80">Clear all data</div>
        </button>
      </div>
    </div>
  );

  // ============================================
  // RENDER: TRAINING HISTORY TAB
  // ============================================
  const renderHistory = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
        <Activity className="w-8 h-8 text-cyan-400" />
        Training History ({trainingHistory.length})
      </h3>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {trainingHistory.map((item, idx) => (
          <div 
            key={idx} 
            className={`bg-slate-800/60 border rounded-lg p-4 ${
              item.correct ? 'border-green-500/30' : 'border-red-500/30'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {item.correct ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-white font-bold">{item.game}</span>
                  <span className="text-slate-400 text-sm">({item.sport})</span>
                </div>
                <div className="text-slate-300 text-sm mb-2">
                  Predicted: {item.prediction} | Actual: {item.actual}
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-cyan-400">{item.confidence}%</div>
                <div className="text-xs text-slate-400">confidence</div>
              </div>
            </div>
          </div>
        ))}
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
            Train your analyzer, feed it data, watch it learn patterns and improve to 87.9%+
          </p>
          {learningStats?.lastTraining && (
            <p className="text-slate-500 text-sm mt-1">
              Last training: {new Date(learningStats.lastTraining).toLocaleString()}
            </p>
          )}
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