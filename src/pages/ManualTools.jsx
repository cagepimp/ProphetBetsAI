import { useState, useEffect } from 'react';
import { callEdgeFunction, updateSchedule, runAnalyzer, fetchOdds, autoGradeAndLearn } from '@/api/supabaseClient';
import * as entities from '@/api/entities';
import { FileText, RefreshCw, Brain, TrendingUp, Award } from 'lucide-react';

export default function ManualTools() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState({ home: '', away: '' });

  const handleSearch = async () => {
    if (!searchTerm || searchTerm.length < 2) {
      alert('Please enter at least 2 characters to search');
      return;
    }

    try {
      console.log('🔍 Searching for:', searchTerm);
      
      const allGames = await entities.Game.list();
      
      const filtered = allGames.filter(game => {
        const searchLower = searchTerm.toLowerCase();
        const homeTeam = (game.home_team || '').toLowerCase();
        const awayTeam = (game.away_team || '').toLowerCase();
        
        return homeTeam.includes(searchLower) || awayTeam.includes(searchLower);
      });

      console.log(`✅ Found ${filtered.length} games`);
      setSearchResults(filtered);
      
    } catch (error) {
      console.error('❌ Search failed:', error);
      alert(`Search error: ${error.message}`);
    }
  };

  const handleAnalyzeGame = async (game) => {
    setAnalyzing(true);

    try {
      console.log('🎯 Analyzing game:', game.id);

      const result = await runAnalyzer(game.id, game.sport, false);

      console.log('✅ Analysis complete:', result);

      if (result?.success) {
        alert(`✅ Analysis complete!\n\nConfidence: ${result.confidence || 'N/A'}%\nPrediction: ${result.prediction?.winner || 'N/A'}`);
      } else {
        alert(`Analysis completed but check console for details`);
      }

      await handleSearch();

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      alert(`❌ Analysis error: ${error.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleEnterScore = async () => {
    if (!selectedGame) {
      alert('Please select a game first');
      return;
    }

    if (!score.home || !score.away) {
      alert('Please enter both home and away scores');
      return;
    }

    try {
      console.log('📝 Entering score for:', selectedGame.id);
      
      await entities.Game.update(selectedGame.id, {
        actual_outcome: {
          home_score: parseInt(score.home),
          away_score: parseInt(score.away),
          winner: parseInt(score.home) > parseInt(score.away) ? selectedGame.home_team : selectedGame.away_team,
          final_spread: parseInt(score.home) - parseInt(score.away),
          total_points: parseInt(score.home) + parseInt(score.away)
        },
        status: 'completed'
      });

      console.log('✅ Score entered successfully');
      alert('Score entered successfully!');
      
      setScore({ home: '', away: '' });
      setSelectedGame(null);
      await handleSearch();
      
    } catch (error) {
      console.error('❌ Enter score failed:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleCalculateAccuracy = async () => {
    try {
      console.log('📊 Calculating accuracy...');
      
      const completedGames = await entities.Game.filter({
        status: 'completed'
      });

      let correct = 0;
      let total = 0;

      completedGames.forEach(game => {
        if (game.analysis && game.analysis.length > 0 && game.actual_outcome) {
          total++;
          const prediction = game.analysis[0].prediction;
          const actualWinner = game.actual_outcome.winner;
          
          if (prediction === actualWinner) {
            correct++;
          }
        }
      });

      const accuracy = total > 0 ? ((correct / total) * 100).toFixed(2) : 0;
      
      alert(`Accuracy: ${accuracy}% (${correct}/${total} correct predictions)`);
      
    } catch (error) {
      console.error('❌ Calculate accuracy failed:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-10 h-10 text-orange-400" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Manual Tools
            </h1>
            <p className="text-gray-400 mt-1">Search games, enter scores manually, and run on-demand analysis</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔍</span>
            <h2 className="text-2xl font-bold">Search Games</h2>
          </div>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter team name (e.g., 'Tennessee', 'Chiefs')"
              className="flex-1 bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-semibold transition-colors"
            >
              🔍 Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <p className="text-gray-400 mt-3">Found {searchResults.length} games</p>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4">Search Results</h3>
            
            <div className="space-y-3">
              {searchResults.map(game => (
                <div
                  key={game.id}
                  className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between border border-slate-600"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-lg">
                      {game.away_team} @ {game.home_team}
                    </div>
                    <div className="text-sm text-gray-400">
                      {game.sport} • {game.game_date || 'Date not set'}
                    </div>
                    {game.analysis && game.analysis.length > 0 && (
                      <div className="text-sm text-green-400 mt-1">
                        ✅ Analyzed: {game.analysis[0].prediction} ({game.analysis[0].confidence}% confidence)
                      </div>
                    )}
                    {game.actual_outcome && (
                      <div className="text-sm text-blue-400 mt-1">
                        📊 Final: {game.actual_outcome.home_score} - {game.actual_outcome.away_score}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAnalyzeGame(game)}
                      disabled={analyzing}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {analyzing ? '⏳ Analyzing...' : '🎯 Analyze'}
                    </button>
                    
                    <button
                      onClick={() => setSelectedGame(game)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      📝 Enter Score
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enter Score Section */}
        {selectedGame && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4">Enter Final Score</h3>
            
            <div className="bg-slate-700/50 rounded-lg p-4 mb-4 border border-slate-600">
              <div className="font-semibold">
                {selectedGame.away_team} @ {selectedGame.home_team}
              </div>
              <div className="text-sm text-gray-400">{selectedGame.sport}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {selectedGame.away_team} Score
                </label>
                <input
                  type="number"
                  value={score.away}
                  onChange={(e) => setScore({ ...score, away: e.target.value })}
                  className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {selectedGame.home_team} Score
                </label>
                <input
                  type="number"
                  value={score.home}
                  onChange={(e) => setScore({ ...score, home: e.target.value })}
                  className="w-full bg-slate-700 text-white p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleEnterScore}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                ✅ Submit Score
              </button>
              <button
                onClick={() => {
                  setSelectedGame(null);
                  setScore({ home: '', away: '' });
                }}
                className="bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          
          <button
            onClick={handleCalculateAccuracy}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            📊 Calculate Overall Accuracy
          </button>
        </div>
      </div>
    </div>
  );
}