
import React, { useState, useEffect } from 'react';
import { callEdgeFunction } from '@/api/supabaseClient';
import * as entities from '@/api/entities';
import * as functions from '@/api/functions';
import { Search, Filter, TrendingUp, Calendar, Trophy, Users } from 'lucide-react';

export default function HistoricalGamesView() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [weekFilter, setWeekFilter] = useState('all'); // Renamed from setWeek
  const [teamFilter, setTeamFilter] = useState('all'); // Renamed from setTeam
  const [stats, setStats] = useState({
    totalGames: 0,
    seasons: [],
    teams: [],
    avgScore: 0,
    homeWinRate: 0
  });

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const allGames = await entities.HistoricalGames.list('-game_date');
      
      // Calculate statistics
      const uniqueSeasons = [...new Set(allGames.map(g => g.season))].sort();
      const uniqueTeams = [...new Set([
        ...allGames.map(g => g.home_team),
        ...allGames.map(g => g.away_team)
      ])].sort();
      
      const totalPoints = allGames.reduce((sum, g) => sum + (g.total_points || 0), 0);
      const homeWins = allGames.filter(g => g.home_won).length;
      
      setStats({
        totalGames: allGames.length,
        seasons: uniqueSeasons,
        teams: uniqueTeams,
        avgScore: allGames.length > 0 ? (totalPoints / allGames.length).toFixed(1) : 0,
        homeWinRate: allGames.length > 0 ? ((homeWins / allGames.length) * 100).toFixed(1) : 0
      });
      
      setGames(allGames);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter games
  const filteredGames = games.filter(game => {
    const matchesSearch = searchTerm === '' || 
      game.home_team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.away_team?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeason = seasonFilter === 'all' || game.season === seasonFilter;
    const matchesWeek = weekFilter === 'all' || game.week === parseInt(weekFilter);
    const matchesTeam = teamFilter === 'all' || 
      game.home_team === teamFilter || 
      game.away_team === teamFilter;
    
    return matchesSearch && matchesSeason && matchesWeek && matchesTeam;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Trophy className="text-yellow-400" size={40} />
            Historical Games Database
          </h1>
          <p className="text-purple-200">
            Browse and analyze {stats.totalGames.toLocaleString()} historical NFL games
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-purple-800 bg-opacity-40 rounded-lg border border-purple-600 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="text-yellow-400" size={20} />
              <p className="text-purple-300 text-sm">Total Games</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalGames.toLocaleString()}</p>
          </div>

          <div className="bg-purple-800 bg-opacity-40 rounded-lg border border-purple-600 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-blue-400" size={20} />
              <p className="text-purple-300 text-sm">Seasons</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.seasons.length}</p>
            <p className="text-purple-300 text-xs mt-1">
              {stats.seasons.length > 0 ? `${stats.seasons[0]} - ${stats.seasons[stats.seasons.length - 1]}` : 'N/A'}
            </p>
          </div>

          <div className="bg-purple-800 bg-opacity-40 rounded-lg border border-purple-600 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-400" size={20} />
              <p className="text-purple-300 text-sm">Avg Total Score</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.avgScore}</p>
          </div>

          <div className="bg-purple-800 bg-opacity-40 rounded-lg border border-purple-600 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-pink-400" size={20} />
              <p className="text-purple-300 text-sm">Home Win Rate</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.homeWinRate}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-purple-800 bg-opacity-40 rounded-lg border border-purple-600 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="text-purple-300" size={24} />
            <h2 className="text-xl font-semibold text-white">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="text-purple-200 text-sm font-semibold mb-2 block">Search Teams</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by team name..."
                  className="w-full bg-purple-900 bg-opacity-50 text-white pl-10 pr-4 py-2 rounded-lg border border-purple-700 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Season Filter */}
            <div>
              <label className="text-purple-200 text-sm font-semibold mb-2 block">Season</label>
              <select
                value={seasonFilter}
                onChange={(e) => setSeasonFilter(e.target.value)}
                className="w-full bg-purple-900 bg-opacity-50 text-white px-4 py-2 rounded-lg border border-purple-700 focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Seasons</option>
                {stats.seasons.map(season => (
                  <option key={season} value={season}>{season}</option>
                ))}
              </select>
            </div>

            {/* Week Filter */}
            <div>
              <label className="text-purple-200 text-sm font-semibold mb-2 block">Week</label>
              <select
                value={weekFilter}
                onChange={(e) => setWeekFilter(e.target.value)} // Updated setter
                className="w-full bg-purple-900 bg-opacity-50 text-white px-4 py-2 rounded-lg border border-purple-700 focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Weeks</option>
                {[...Array(18)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                ))}
              </select>
            </div>

            {/* Team Filter */}
            <div>
              <label className="text-purple-200 text-sm font-semibold mb-2 block">Team</label>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)} // Updated setter
                className="w-full bg-purple-900 bg-opacity-50 text-white px-4 py-2 rounded-lg border border-purple-700 focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Teams</option>
                {stats.teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchTerm('');
                setSeasonFilter('all'); // Updated setter
                setWeekFilter('all');   // Updated setter
                setTeamFilter('all');   // Updated setter
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
            <span className="ml-4 text-purple-300 text-sm">
              Showing {filteredGames.length} of {stats.totalGames} games
            </span>
          </div>
        </div>

        {/* Games Table */}
        <div className="bg-purple-800 bg-opacity-40 rounded-lg border border-purple-600 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
                <p className="text-purple-300 mt-4">Loading games...</p>
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="p-12 text-center text-purple-300">
                No games found matching your filters
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-purple-900 bg-opacity-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-purple-200 font-semibold text-sm">Date</th>
                    <th className="px-4 py-3 text-left text-purple-200 font-semibold text-sm">Season</th>
                    <th className="px-4 py-3 text-left text-purple-200 font-semibold text-sm">Week</th>
                    <th className="px-4 py-3 text-left text-purple-200 font-semibold text-sm">Away Team</th>
                    <th className="px-4 py-3 text-center text-purple-200 font-semibold text-sm">Score</th>
                    <th className="px-4 py-3 text-left text-purple-200 font-semibold text-sm">Home Team</th>
                    <th className="px-4 py-3 text-left text-purple-200 font-semibold text-sm">Venue</th>
                    <th className="px-4 py-3 text-left text-purple-200 font-semibold text-sm">Weather</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGames.map((game, index) => (
                    <tr 
                      key={game.id} 
                      className={`border-t border-purple-700 hover:bg-purple-900 hover:bg-opacity-30 transition-colors ${
                        index % 2 === 0 ? 'bg-purple-900 bg-opacity-10' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-purple-100 text-sm">
                        {new Date(game.game_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3 text-purple-100 text-sm">{game.season}</td>
                      <td className="px-4 py-3 text-purple-100 text-sm">Week {game.week}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={game.home_won ? 'text-red-300' : 'text-green-300 font-semibold'}>
                          {game.away_team}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-white font-bold">
                          {game.away_score} - {game.home_score}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={game.home_won ? 'text-green-300 font-semibold' : 'text-red-300'}>
                          {game.home_team}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-purple-200 text-sm">{game.venue || 'N/A'}</td>
                      <td className="px-4 py-3 text-purple-200 text-sm">{game.weather || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
