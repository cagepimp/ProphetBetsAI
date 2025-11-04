import React, { useState, useEffect } from 'react';
import { getPlayers } from '@/api/supabaseClient';
import { Users, Search, X, TrendingUp, Activity, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { NFL_TEAMS } from '@/components/data/NFL_TEAMS';
import { NBA_TEAMS } from '@/components/data/NBA_TEAMS';
import { MLB_TEAMS } from '@/components/data/MLB_TEAMS';
import { NHL_TEAMS } from '@/components/data/NHL_TEAMS';

export default function TeamRosterViewer({ sport = 'NFL', teamName }) {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [isOpen, setIsOpen] = useState(false);

  const getTeamData = (teamName, sport) => {
    const sportTeams = {
      'NFL': NFL_TEAMS,
      'NBA': NBA_TEAMS,
      'MLB': MLB_TEAMS,
      'NHL': NHL_TEAMS
    };

    const teams = sportTeams[sport?.toUpperCase()];
    return teams?.[teamName] || null;
  };

  const loadRoster = async () => {
    if (!teamName || !sport) return;

    try {
      setLoading(true);

      // Fetch roster from Supabase
      let players = await getPlayers({
        team: teamName,
        sport: sport.toUpperCase()
      });

      // Filter active players and sort by position and jersey number
      players = players
        .filter(p => p.status === 'active' || !p.status)
        .sort((a, b) => {
          if (a.position !== b.position) {
            return (a.position || '').localeCompare(b.position || '');
          }
          return (a.jersey_number || 0) - (b.jersey_number || 0);
        });

      setRoster(players || []);
    } catch (err) {
      console.error('Error loading roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && teamName) {
      loadRoster();
    }
  }, [isOpen, teamName, sport]);

  const getPositions = () => {
    const positions = [...new Set(roster.map(p => p.position).filter(Boolean))];
    return ['all', ...positions.sort()];
  };

  const filteredRoster = roster.filter(player => {
    const matchesSearch = !searchTerm ||
      player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.position?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;

    return matchesSearch && matchesPosition;
  });

  const getPositionColor = (position) => {
    const colors = {
      'QB': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'RB': 'bg-green-500/20 text-green-400 border-green-500/30',
      'WR': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'TE': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'K': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'DEF': 'bg-red-500/20 text-red-400 border-red-500/30',
      'PG': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'SG': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'SF': 'bg-green-500/20 text-green-400 border-green-500/30',
      'PF': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'C': 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[position] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const teamData = getTeamData(teamName, sport);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 hover:border-purple-400/50 rounded-lg text-sm text-purple-300 hover:text-purple-200 transition-all">
          <Users className="w-4 h-4" />
          View Roster
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-slate-900 border-purple-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {teamData?.logo && (
              <img
                src={teamData.logo}
                alt={teamName}
                className="w-10 h-10 object-contain"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {teamName}
              </h2>
              <p className="text-sm text-purple-300">{sport} Roster</p>
            </div>
            <Badge className="ml-auto bg-purple-600 text-white">
              {filteredRoster.length} Players
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-2">
          {/* Search and Filter */}
          <div className="flex gap-3 sticky top-0 bg-slate-900 pb-3 border-b border-purple-500/20 z-10">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-purple-500/30 text-white"
              />
            </div>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400"
            >
              {getPositions().map(pos => (
                <option key={pos} value={pos}>
                  {pos === 'all' ? 'All Positions' : pos}
                </option>
              ))}
            </select>
          </div>

          {/* Roster Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
            </div>
          ) : filteredRoster.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <p className="text-purple-300">
                {roster.length === 0 ? 'No roster data available' : 'No players match your search'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {filteredRoster.map((player, index) => (
                <Card
                  key={player.id || index}
                  className="bg-slate-800/50 border-purple-500/20 hover:border-purple-400/40 transition-all group cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">
                            #{player.jersey_number || '??'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            {player.name || 'Unknown Player'}
                          </h3>
                          <p className="text-purple-300 text-sm">
                            {player.position || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getPositionColor(player.position)} border`}>
                        {player.position || 'N/A'}
                      </Badge>
                    </div>

                    {/* Player Stats */}
                    <div className="flex items-center gap-4 text-xs text-purple-300">
                      {player.height && (
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {player.height}
                        </div>
                      )}
                      {player.weight && (
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {player.weight} lbs
                        </div>
                      )}
                      {player.experience && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {player.experience}
                        </div>
                      )}
                    </div>

                    {player.injury_status && (
                      <div className="mt-2 pt-2 border-t border-purple-500/20">
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          {player.injury_status}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
