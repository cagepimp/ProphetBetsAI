import { useState, useEffect } from 'react';
import { callEdgeFunction } from '@/api/supabaseClient';
import * as entities from '@/api/entities';
import { Loader2, Brain, CheckCircle, TrendingUp, DollarSign, Target, Award } from 'lucide-react';

export default function AITrainingDashboard() {
  const [loading, setLoading] = useState({});
  const [stats, setStats] = useState({
    totalGames: 0,
    graded: 0,
    pending: 0,
    overallAccuracy: 0,
    winnerAccuracy: 0,
    spreadAccuracy: 0,
    roi: 0
  });
  const [selectedSport, setSelectedSport] = useState('NFL');
  const [games, setGames] = useState([]);
  
  const sports = ['NFL', 'CFB', 'NBA', 'MLB', 'UFC', 'Golf'];

  // Load stats on mount and when sport changes
  useEffect(() => {
    loadStats();
    loadGames();
  }, [selectedSport]);

  const loadStats = async () => {
    try {
      const response = await callEdgeFunction('getGradingStats', { sport: selectedSport });
      const data = response?.data || response;
      
      setStats({
        totalGames: data.totalGames || 0,
        graded: data.graded || 0,
        pending: data.pending || 0,
        overallAccuracy: data.overallAccuracy || 0,
        winnerAccuracy: data.winnerAccuracy || 0,
        spreadAccuracy: data.spreadAccuracy || 0,
        roi: data.roi || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadGames = async () => {
    try {
      const response = await entities.Game.list();
      const allGames = response?.data || response || [];
      
      // Filter by sport and completed status
      const filteredGames = allGames
        .filter(g => g.sport === selectedSport && g.status === 'completed')
        .slice(0, 50); // Show last 50 completed games
      
      setGames(filteredGames);
    } catch (error) {
      console.error('Failed to load games:', error);
    }
  };

  // ========================================
  // MARK PAST GAMES AS COMPLETED
  // ========================================
  const handleUpdatePastGames = async () => {
    const key = 'update_past';
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const response = await callEdgeFunction('markPastGamesCompleted', { 
        sport: selectedSport 
      });
      const data = response?.data || response;
      
      alert(`✅ Updated ${data.updated || 0} games to completed status`);
      await loadStats();
      await loadGames();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // ========================================
  // AUTO-GRADE GAMES
  // ========================================
  const handleAutoGrade = async () => {
    const key = 'auto_grade';
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      // Step 1: Fetch real scores from ESPN/CBS
      const scoresResponse = await callEdgeFunction('fetchGameResults', { 
        sport: selectedSport 
      });
      
      // Step 2: Grade predictions against actual results
      const gradeResponse = await callEdgeFunction('autoVerifyFinishedGames', { 
        sport: selectedSport 
      });
      const data = gradeResponse?.data || gradeResponse;
      
      // Step 3: Feed results to AI learning system
      const learnResponse = await callEdgeFunction('trainAnalyzer', {
        sport: selectedSport,
        gradedGames: data.gradedGames
      });
      
      alert(`✅ Auto-Graded ${data.gamesGraded || 0} games\n🧠 AI trained with results\n📈 New accuracy: ${learnResponse?.data?.newAccuracy || 0}%`);
      
      await loadStats();
      await loadGames();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // ========================================
  // SCHEDULED ANALYSIS (9AM & 6PM)
  // ========================================
  const handleScheduledAnalysis = async () => {
    const key = 'scheduled_analysis';
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      // This runs the deep analysis that pre-populates database
      const response = await callEdgeFunction('autoAnalyzeAndVerify');
      const data = response?.data || response;
      
      alert(`✅ Scheduled Analysis Complete\n📊 Analyzed ${data.gamesAnalyzed || 0} games\n💾 Results saved to database`);
      
      await loadStats();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // ========================================
  // TRAIN AI WITH HISTORICAL DATA
  // ========================================
  const handleTrainWithHistory = async () => {
    const key = 'train_history';
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const response = await callEdgeFunction('trainFromHistoricalData', { 
        sport: selectedSport 
      });
      const data = response?.data || response;
      
      alert(`🧠 AI Training Complete\n📚 Processed ${data.gamesProcessed || 0} historical games\n🎯 New patterns discovered: ${data.patternsDiscovered || 0}\n📈 Accuracy improved by ${data.accuracyImprovement || 0}%`);
      
      await loadStats();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // ========================================
  // VIEW LEARNING PROGRESS
  // ========================================
  const handleViewProgress = async () => {
    const key = 'view_progress';
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const response = await callEdgeFunction('getLearningProgress', { 
        sport: selectedSport 
      });
      const data = response?.data || response;
      
      let message = `📊 ${selectedSport} Learning Progress\n\n`;
      message += `Total Predictions: ${data.totalPredictions || 0}\n`;
      message += `Correct Predictions: ${data.correctPredictions || 0}\n`;
      message += `Overall Accuracy: ${data.accuracy || 0}%\n\n`;
      message += `Patterns Discovered: ${data.patterns || 0}\n`;
      message += `ROI: ${data.roi || 0}%\n`;
      message += `Best Pattern: ${data.bestPattern || 'None yet'}`;
      
      alert(message);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-12 h-12 text-green-400" />
          <div>
            <h1 className="text-4xl font-bold text-white">AI Training Dashboard - Automated Grading</h1>
            <p className="text-purple-200 mt-1">
              Automatically grades predictions against real game results from ESPN/CBS Sports APIs
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {/* Total Games */}
          <div className="bg-blue-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90 mb-1">Total Games</div>
            <div className="text-4xl font-bold">{stats.totalGames}</div>
          </div>

          {/* Graded */}
          <div className="bg-green-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90 mb-1">Graded</div>
            <div className="text-4xl font-bold">{stats.graded}</div>
          </div>

          {/* Pending */}
          <div className="bg-orange-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90 mb-1">Pending</div>
            <div className="text-4xl font-bold">{stats.pending}</div>
          </div>

          {/* Overall Accuracy */}
          <div className="bg-purple-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90 mb-1">Overall</div>
            <div className="text-4xl font-bold">{stats.overallAccuracy}%</div>
          </div>

          {/* Winner Accuracy */}
          <div className="bg-cyan-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90 mb-1">Winner</div>
            <div className="text-4xl font-bold">{stats.winnerAccuracy}%</div>
          </div>

          {/* Spread Accuracy */}
          <div className="bg-red-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90 mb-1">Spread</div>
            <div className="text-4xl font-bold">{stats.spreadAccuracy}%</div>
          </div>

          {/* ROI */}
          <div className="bg-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center gap-1 text-sm opacity-90 mb-1">
              <DollarSign className="w-4 h-4" />
              <span>ROI</span>
            </div>
            <div className="text-4xl font-bold">{stats.roi}%</div>
          </div>
        </div>

        {/* Sport Selector */}
        <div className="flex gap-2 mb-6">
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedSport === sport
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>

        {/* Mark Past Games Section */}
        <div className="bg-blue-600 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Mark Past Games as Completed</h2>
          <p className="text-blue-100 mb-4">
            Click to automatically update all games that have already happened to completed status
          </p>
          <button
            onClick={handleUpdatePastGames}
            disabled={loading.update_past}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading.update_past ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Update Past Games
              </>
            )}
          </button>
        </div>

        {/* Automated Grading Section */}
        <div className="bg-green-600 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Automated Grading System</h2>
          <p className="text-green-100 mb-4">
            {stats.pending} games ready to be auto-graded with real scores from sports APIs
          </p>
          <button
            onClick={handleAutoGrade}
            disabled={loading.auto_grade}
            className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading.auto_grade ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Grading & Training AI...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Auto-Grade {stats.pending} Games
              </>
            )}
          </button>
        </div>

        {/* AI Learning Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Scheduled Analysis */}
          <div className="bg-purple-800/50 border border-purple-600 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-6 h-6 text-purple-300" />
              <h3 className="text-lg font-bold text-white">Scheduled Analysis</h3>
            </div>
            <p className="text-purple-200 text-sm mb-4">
              Runs at 9am & 6pm daily. Pre-analyzes all games and saves to database.
            </p>
            <button
              onClick={handleScheduledAnalysis}
              disabled={loading.scheduled_analysis}
              className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading.scheduled_analysis ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Run Now (Manual)
                </>
              )}
            </button>
          </div>

          {/* Train with History */}
          <div className="bg-purple-800/50 border border-purple-600 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-6 h-6 text-purple-300" />
              <h3 className="text-lg font-bold text-white">Train with History</h3>
            </div>
            <p className="text-purple-200 text-sm mb-4">
              Feed 5+ years of historical data to improve AI accuracy.
            </p>
            <button
              onClick={handleTrainWithHistory}
              disabled={loading.train_history}
              className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading.train_history ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Training...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Train AI
                </>
              )}
            </button>
          </div>

          {/* View Progress */}
          <div className="bg-purple-800/50 border border-purple-600 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-6 h-6 text-purple-300" />
              <h3 className="text-lg font-bold text-white">Learning Progress</h3>
            </div>
            <p className="text-purple-200 text-sm mb-4">
              View patterns discovered and accuracy improvements.
            </p>
            <button
              onClick={handleViewProgress}
              disabled={loading.view_progress}
              className="w-full bg-cyan-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading.view_progress ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  View Stats
                </>
              )}
            </button>
          </div>
        </div>

        {/* Games List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white">All {selectedSport} Games</h3>
            <button
              onClick={loadGames}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {games.length === 0 ? (
            <div className="text-center text-purple-200 py-8">
              No completed games found for {selectedSport}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="bg-white/5 rounded-lg p-4 border border-purple-500/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-semibold">
                        {game.away_team} @ {game.home_team}
                      </div>
                      <div className="text-purple-200 text-sm">
                        {new Date(game.game_date).toLocaleDateString()}
                      </div>
                      {game.actual_outcome && (
                        <div className="text-green-400 text-sm mt-1">
                          Final: {game.actual_outcome.away_score} - {game.actual_outcome.home_score}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {game.prediction_accuracy ? (
                        <div className="text-green-400 font-semibold">
                          ✅ {game.prediction_accuracy.overall_accuracy}% Accurate
                        </div>
                      ) : (
                        <div className="text-orange-400 font-semibold">
                          ⏳ Pending Grade
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}