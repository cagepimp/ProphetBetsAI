import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, AlertCircle, CheckCircle, XCircle, Award, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import { callEdgeFunction } from '@/api/supabaseClient';
import * as entities from '@/api/entities';
import * as functions from '@/api/functions';

export default function PredictionHistory() {
  const [selectedSport, setSelectedSport] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [stats, setStats] = useState({
    total_predictions: 0,
    completed_games: 0,
    overall_accuracy: 0,
    winner_accuracy: 0,
    spread_accuracy: 0,
    total_accuracy: 0,
    roi: 0,
    profit: 0
  });

  useEffect(() => {
    fetchResults();
  }, [selectedSport]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      console.log('Fetching completed predictions...');

      const filter = selectedSport === 'all' 
        ? { status: 'completed', accuracy: { $exists: true } }
        : { sport: selectedSport, status: 'completed', accuracy: { $exists: true } };

      const completedGames = await entities.Game.filter(
        filter,
        '-verified_at',
        100
      );

      console.log(`Loaded ${completedGames.length} completed games`);
      setResults(completedGames);
      calculateStats(completedGames);
    } catch (error) {
      console.error('Error fetching results:', error);
      alert('Error loading prediction history');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (games) => {
    const completed = games.length;
    if (completed === 0) {
      setStats({ 
        total_predictions: 0, 
        completed_games: 0, 
        overall_accuracy: 0, 
        winner_accuracy: 0, 
        spread_accuracy: 0, 
        total_accuracy: 0,
        roi: 0,
        profit: 0
      });
      return;
    }

    const correctWinners = games.filter(g => g.accuracy?.winner_correct).length;
    const correctSpreads = games.filter(g => g.accuracy?.spread_correct).length;
    const correctTotals = games.filter(g => g.accuracy?.total_correct).length;
    const avgAccuracy = games.reduce((sum, g) => sum + (g.accuracy?.accuracy_percentage || 0), 0) / completed;

    // Calculate ROI (assuming $100 per bet at -110 odds)
    const totalBets = completed * 3; // winner, spread, total
    const totalWins = correctWinners + correctSpreads + correctTotals;
    const winnings = totalWins * 190.91; // Win back $100 stake + $90.91 profit
    const losses = (totalBets - totalWins) * 100;
    const profit = winnings - (totalBets * 100);
    const roi = ((profit / (totalBets * 100)) * 100).toFixed(1);

    setStats({
      total_predictions: completed,
      completed_games: completed,
      overall_accuracy: Math.round(avgAccuracy),
      winner_accuracy: Math.round((correctWinners / completed) * 100),
      spread_accuracy: Math.round((correctSpreads / completed) * 100),
      total_accuracy: Math.round((correctTotals / completed) * 100),
      roi: parseFloat(roi),
      profit: Math.round(profit)
    });
  };

  const handleDeleteGame = async (gameId) => {
    if (!confirm('Delete this prediction from history? This cannot be undone.')) return;

    try {
      await entities.Game.delete(gameId);
      await fetchResults();
      alert('Prediction deleted!');
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Error deleting prediction');
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'bg-green-600';
      case 'B': return 'bg-blue-600';
      case 'C': return 'bg-yellow-600';
      case 'D': return 'bg-orange-600';
      case 'F': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = result.away_team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.home_team?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || result.accuracy?.grade === gradeFilter;
    const matchesSport = selectedSport === 'all' || result.sport === selectedSport;
    return matchesSearch && matchesGrade && matchesSport;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-2xl font-bold">Loading Results...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          📊 Prediction History
        </h1>
        <p className="text-purple-200 mt-1">Complete record of Analyzer 10000+ predictions with accuracy tracking</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-blue-600 rounded-lg p-4">
          <div className="text-blue-100 text-xs mb-1">Total Games</div>
          <div className="text-3xl font-bold">{stats.total_predictions}</div>
        </div>
        <div className="bg-purple-600 rounded-lg p-4">
          <div className="text-purple-100 text-xs mb-1">Overall</div>
          <div className="text-3xl font-bold">{stats.overall_accuracy}%</div>
        </div>
        <div className="bg-cyan-600 rounded-lg p-4">
          <div className="text-cyan-100 text-xs mb-1">Winner</div>
          <div className="text-3xl font-bold">{stats.winner_accuracy}%</div>
        </div>
        <div className="bg-indigo-600 rounded-lg p-4">
          <div className="text-indigo-100 text-xs mb-1">Spread</div>
          <div className="text-3xl font-bold">{stats.spread_accuracy}%</div>
        </div>
        <div className="bg-pink-600 rounded-lg p-4">
          <div className="text-pink-100 text-xs mb-1">Total</div>
          <div className="text-3xl font-bold">{stats.total_accuracy}%</div>
        </div>
        <div className={`${stats.roi >= 0 ? 'bg-emerald-600' : 'bg-red-600'} rounded-lg p-4`}>
          <div className="text-xs mb-1 flex items-center gap-1">
            <DollarSign size={14} /> ROI
          </div>
          <div className="text-3xl font-bold">{stats.roi > 0 ? '+' : ''}{stats.roi}%</div>
        </div>
        <div className={`${stats.profit >= 0 ? 'bg-emerald-600' : 'bg-red-600'} rounded-lg p-4`}>
          <div className="text-xs mb-1 flex items-center gap-1">
            <TrendingUp size={14} /> Profit
          </div>
          <div className="text-2xl font-bold">${stats.profit > 0 ? '+' : ''}{stats.profit}</div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'NFL', 'CFB', 'NBA', 'MLB', 'NHL', 'UFC'].map(sport => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              selectedSport === sport ? 'bg-purple-600' : 'bg-purple-900/50 hover:bg-purple-800/50'
            }`}
          >
            {sport.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-purple-900/50 rounded-lg p-4 mb-6">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Search by team name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-purple-800/50 border border-purple-600 rounded-lg text-white placeholder-purple-300"
            />
          </div>
          
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-4 py-3 bg-purple-800/50 border border-purple-600 rounded-lg text-white"
          >
            <option value="all">All Grades</option>
            <option value="A">A Grade</option>
            <option value="B">B Grade</option>
            <option value="C">C Grade</option>
            <option value="D">D Grade</option>
            <option value="F">F Grade</option>
          </select>

          <button
            onClick={fetchResults}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <RefreshCw size={20} /> Refresh
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {filteredResults.length === 0 ? (
          <div className="text-center py-12 text-purple-300">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No completed predictions found</p>
            <p className="text-sm mt-2">Train the AI by entering scores on the Training Dashboard</p>
          </div>
        ) : (
          filteredResults.map(result => (
            <div key={result.id} className="bg-white/5 backdrop-blur-lg rounded-lg border-2 border-green-500 overflow-hidden hover:border-green-400 transition">
              <div className="bg-gradient-to-r from-purple-600/40 to-pink-600/40 p-6 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{result.away_team} @ {result.home_team}</h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-purple-200">
                      <span>{result.sport}</span>
                      <span>•</span>
                      <span>{result.game_date}</span>
                      <span>•</span>
                      <span className="font-bold">Final: {result.away_score} - {result.home_score}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {result.accuracy && (
                      <div className={`${getGradeColor(result.accuracy.grade)} px-6 py-3 rounded-lg`}>
                        <div className="text-white text-sm font-semibold">Grade</div>
                        <div className="text-white text-3xl font-bold">{result.accuracy.grade}</div>
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteGame(result.id)}
                      className="p-3 bg-red-600 hover:bg-red-500 rounded-lg transition"
                      title="Delete prediction"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="text-yellow-400" size={24} />
                  Prediction Results
                </h3>
                
                <div className="bg-purple-900/30 rounded-lg overflow-hidden border border-purple-700">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-purple-800/50 border-b border-purple-700">
                        <th className="text-left p-4 text-sm font-semibold">Metric</th>
                        <th className="text-left p-4 text-sm font-semibold">AI Prediction</th>
                        <th className="text-left p-4 text-sm font-semibold">Actual Result</th>
                        <th className="text-left p-4 text-sm font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-purple-700/50">
                        <td className="p-4 font-semibold">Winner</td>
                        <td className="p-4 text-cyan-400 font-bold">{result.analysis?.prediction?.winner}</td>
                        <td className="p-4 text-cyan-400 font-bold">
                          {result.away_score > result.home_score ? result.away_team : result.home_team}
                        </td>
                        <td className="p-4">
                          {result.accuracy?.winner_correct ? (
                            <span className="text-green-400 font-semibold flex items-center gap-1">
                              <CheckCircle size={16} /> Correct
                            </span>
                          ) : (
                            <span className="text-red-400 font-semibold flex items-center gap-1">
                              <XCircle size={16} /> Incorrect
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-purple-700/50">
                        <td className="p-4 font-semibold">Spread</td>
                        <td className="p-4 text-cyan-400">{result.analysis?.prediction?.predictedSpread}</td>
                        <td className="p-4 text-cyan-400">{Math.abs(result.away_score - result.home_score)}</td>
                        <td className="p-4">
                          {result.accuracy?.spread_correct ? (
                            <span className="text-green-400 font-semibold flex items-center gap-1">
                              <CheckCircle size={16} /> Correct
                            </span>
                          ) : (
                            <span className="text-red-400 font-semibold flex items-center gap-1">
                              <XCircle size={16} /> Incorrect
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-purple-700/50">
                        <td className="p-4 font-semibold">Total Points</td>
                        <td className="p-4 text-cyan-400">
                          {result.analysis?.prediction?.predictedTotal ? `${result.analysis.prediction.predictedTotal} pts` : 'N/A'}
                        </td>
                        <td className="p-4 text-cyan-400">{result.away_score + result.home_score} pts</td>
                        <td className="p-4">
                          {result.accuracy?.total_correct ? (
                            <span className="text-green-400 font-semibold flex items-center gap-1">
                              <CheckCircle size={16} /> Correct
                            </span>
                          ) : (
                            <span className="text-red-400 font-semibold flex items-center gap-1">
                              <XCircle size={16} /> Incorrect
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold">Final Score</td>
                        <td className="p-4 text-cyan-400">
                          {result.analysis?.prediction?.awayScore} - {result.analysis?.prediction?.homeScore}
                        </td>
                        <td className="p-4 text-cyan-400 font-bold">{result.away_score} - {result.home_score}</td>
                        <td className="p-4">
                          <span className="text-purple-300 text-sm">
                            {result.accuracy?.accuracy_percentage}% accurate
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-purple-300">
                    Verified: <span className="text-white">{new Date(result.verified_at).toLocaleString()}</span>
                  </div>
                  <div className="text-sm">
                    Overall Accuracy: <span className={`text-2xl font-bold ${
                      result.accuracy?.accuracy_percentage >= 75 ? 'text-green-400' : 
                      result.accuracy?.accuracy_percentage >= 50 ? 'text-yellow-400' : 
                      'text-red-400'
                    }`}>{result.accuracy?.accuracy_percentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}