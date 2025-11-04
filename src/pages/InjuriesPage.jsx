import React, { useState, useEffect } from 'react';
import { callEdgeFunction } from '@/api/supabaseClient';
import * as entities from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ShieldAlert, AlertCircle, RefreshCw, Zap } from 'lucide-react';

const sports = ["NFL", "NBA", "MLB", "CFB"];

const SportTabs = ({ active, onChange }) => (
  <div className="flex space-x-1 border-b border-slate-800 mb-6">
    {sports.map((sport) => (
      <button
        key={sport}
        onClick={() => onChange(sport)}
        className={`relative px-4 py-2 font-medium text-sm rounded-t-lg transition-colors focus:outline-none ${
          active === sport
            ? "border-b-2 border-cyan-400 text-white bg-slate-800/50"
            : "text-slate-400 hover:text-white hover:bg-slate-800/30"
        }`}
      >
        {sport}
      </button>
    ))}
  </div>
);

// Status abbreviation mapping
const getStatusAbbreviation = (status) => {
  if (!status) return 'UNK';
  const normalized = status.toLowerCase().trim();
  
  const map = {
    'out': 'OUT',
    'doubtful': 'D',
    'questionable': 'Q',
    'probable': 'P',
    'day to day': 'DTD',
    'day-to-day': 'DTD',
    'injured reserve': 'IR'
  };
  
  return map[normalized] || status.substring(0, 3).toUpperCase();
};

const getStatusColor = (status) => {
  const abbr = getStatusAbbreviation(status);
  
  switch (abbr) {
    case 'OUT':
    case 'IR':
      return 'text-red-400 bg-red-900/30 border border-red-500/50';
    case 'D':
      return 'text-orange-400 bg-orange-900/30 border border-orange-500/50';
    case 'Q':
      return 'text-yellow-400 bg-yellow-900/30 border border-yellow-500/50';
    case 'P':
      return 'text-green-400 bg-green-900/30 border border-green-500/50';
    case 'DTD':
      return 'text-blue-400 bg-blue-900/30 border border-blue-500/50';
    default:
      return 'text-slate-400 bg-slate-800/30 border border-slate-600/50';
  }
};

const StatusBadge = ({ status }) => {
  const abbr = getStatusAbbreviation(status);
  const colorClass = getStatusColor(status);
  
  return (
    <span 
      className={`px-2 py-1 rounded text-xs font-bold ${colorClass}`}
      title={status || 'Unknown'}
    >
      {abbr}
    </span>
  );
};

const StatusLegend = () => (
  <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
    <div className="text-xs text-slate-400 font-semibold mb-2">Status Legend:</div>
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="text-red-400">OUT = Out</span>
      <span className="text-orange-400">D = Doubtful</span>
      <span className="text-yellow-400">Q = Questionable</span>
      <span className="text-green-400">P = Probable</span>
      <span className="text-blue-400">DTD = Day to Day</span>
      <span className="text-red-400">IR = Injured Reserve</span>
    </div>
  </div>
);

export default function InjuriesPage() {
  const [activeSport, setActiveSport] = useState('NFL');
  const [injuries, setInjuries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load injuries for active sport
  const loadInjuries = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🏥 Loading ${activeSport} injuries...`);
      
      // Call fetchInjuries function via Base44
      const response = await callEdgeFunction('fetchInjuries', { 
        sport: activeSport 
      });
      
      console.log(`${activeSport} injury response:`, response);
      
      const data = response?.data || response;
      
      if (data?.injuries && Array.isArray(data.injuries)) {
        setInjuries(data.injuries);
        setLastUpdated(new Date());
        console.log(`✅ Loaded ${data.injuries.length} ${activeSport} injuries`);
      } else if (data?.data?.injuries && Array.isArray(data.data.injuries)) {
        setInjuries(data.data.injuries);
        setLastUpdated(new Date());
        console.log(`✅ Loaded ${data.data.injuries.length} ${activeSport} injuries`);
      } else {
        setInjuries([]);
        setError(`No injury data available for ${activeSport}`);
      }
    } catch (err) {
      console.error("❌ Error loading injuries:", err);
      setError(err.message || 'Failed to load injury data');
      setInjuries([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch ALL sports injuries
  const fetchAllSportsInjuries = async () => {
    setFetchingAll(true);
    setError(null);
    
    try {
      console.log(`🏥 Fetching injuries for ALL sports...`);
      
      let totalFetched = 0;
      
      for (const sport of sports) {
        try {
          console.log(`   Fetching ${sport}...`);
          const response = await callEdgeFunction('fetchInjuries', { 
            sport: sport 
          });
          
          const data = response?.data || response;
          const count = data?.injuries?.length || data?.data?.injuries?.length || 0;
          totalFetched += count;
          
          console.log(`   ✅ ${sport}: ${count} injuries`);
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (sportError) {
          console.error(`   ❌ ${sport} failed:`, sportError.message);
        }
      }
      
      alert(`✅ Fetched injuries for all sports!\nTotal: ${totalFetched} injuries across ${sports.length} sports`);
      
      // Reload current sport
      await loadInjuries();
      
    } catch (err) {
      console.error("❌ Error fetching all sports:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setFetchingAll(false);
    }
  };

  useEffect(() => {
    loadInjuries();
  }, [activeSport]);

  return (
    <div className="p-6 text-white bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold">Injury Reports</h1>
              <p className="text-slate-400 text-sm">
                Real-time injury updates from ESPN
                {lastUpdated && (
                  <span className="ml-2">
                    • Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={loadInjuries}
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh {activeSport}
            </button>
            
            <button
              onClick={fetchAllSportsInjuries}
              disabled={fetchingAll || loading}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className={`w-4 h-4 ${fetchingAll ? 'animate-spin' : ''}`} />
              {fetchingAll ? 'Fetching All...' : 'Fetch All Sports'}
            </button>
          </div>
        </div>
        
        {/* Sport Tabs */}
        <SportTabs active={activeSport} onChange={setActiveSport} />

        {/* Status Legend */}
        <StatusLegend />

        {/* Main Card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
              <span>{activeSport} Injury Report</span>
              {!loading && injuries.length > 0 && (
                <span className="text-sm font-normal text-slate-400">
                  {injuries.length} injured players
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              // Loading State
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="ml-4 text-slate-400">Loading {activeSport} injuries...</p>
              </div>
            ) : error ? (
              // Error State
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-red-400 font-semibold">{error}</p>
                <p className="text-slate-400 text-sm mt-2">Try refreshing or check back later</p>
                <button
                  onClick={loadInjuries}
                  className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : injuries.length > 0 ? (
              // Data Table
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="text-white font-semibold">Player</TableHead>
                      <TableHead className="text-white font-semibold">Team</TableHead>
                      <TableHead className="text-white font-semibold">Position</TableHead>
                      <TableHead className="text-white font-semibold">Status</TableHead>
                      <TableHead className="text-white font-semibold">Injury Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {injuries.map((injury, index) => (
                      <TableRow key={index} className="border-slate-800 hover:bg-slate-800/50">
                        <TableCell className="font-medium text-white">
                          {injury.player_name}
                        </TableCell>
                        <TableCell className="text-white">
                          {injury.team_abbr}
                        </TableCell>
                        <TableCell className="text-white">
                          {injury.position || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={injury.injury_status} />
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {injury.injury_description || 'No details available'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShieldAlert className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-slate-400">No injury data available for {activeSport}.</p>
                <p className="text-slate-500 text-sm mt-2">All players are healthy! 🎉</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}