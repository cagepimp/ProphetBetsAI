import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getGames, runAnalyzer, updateSchedule } from "@/api/supabaseClient";
import { Loader2, RefreshCw } from "lucide-react";
import GameCard from "@/components/sports/GameCard";

// Power 5 conference teams (for CFB filtering)
const POWER_5_TEAMS = [
  // SEC
  'Alabama', 'Arkansas', 'Auburn', 'Florida', 'Georgia', 'Kentucky', 'LSU', 
  'Mississippi State', 'Missouri', 'Ole Miss', 'South Carolina', 'Tennessee', 
  'Texas A&M', 'Vanderbilt', 'Texas', 'Oklahoma',
  // Big Ten
  'Illinois', 'Indiana', 'Iowa', 'Maryland', 'Michigan', 'Michigan State', 
  'Minnesota', 'Nebraska', 'Northwestern', 'Ohio State', 'Penn State', 'Purdue', 
  'Rutgers', 'Wisconsin', 'UCLA', 'USC', 'Oregon', 'Washington',
  // ACC
  'Boston College', 'Clemson', 'Duke', 'Florida State', 'Georgia Tech', 
  'Louisville', 'Miami', 'NC State', 'North Carolina', 'Pittsburgh', 'Syracuse', 
  'Virginia', 'Virginia Tech', 'Wake Forest', 'SMU', 'California', 'Stanford',
  // Big 12
  'Baylor', 'BYU', 'UCF', 'Cincinnati', 'Houston', 'Iowa State', 'Kansas', 
  'Kansas State', 'Oklahoma State', 'TCU', 'Texas Tech', 'West Virginia', 
  'Arizona', 'Arizona State', 'Colorado', 'Utah'
];

function isPower5Game(game) {
  const homeTeam = game.home_team || game.home || '';
  const awayTeam = game.away_team || game.away || '';
  
  return POWER_5_TEAMS.some(team => 
    homeTeam.includes(team) || awayTeam.includes(team)
  );
}

export default function SportPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const sport = query.get("sport")?.toUpperCase() || "NFL";

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisResults, setAnalysisResults] = useState({});

  useEffect(() => {
    async function fetchGames() {
      try {
        setLoading(true);
        setError(null);

        const dateFrom = new Date().toISOString();
        const dateTo = new Date("2025-12-31T23:59:59Z").toISOString();

        console.log(`📊 Fetching ${sport} games...`);

        const allGames = await getGames({
          sport,
          game_date: { $gte: dateFrom, $lte: dateTo }
        });

        console.log(`✅ ${sport} response:`, allGames);

        if (Array.isArray(allGames)) {
          let filteredGames = allGames;

          // Apply Power 5 filter for CFB only
          if (sport === "CFB") {
            filteredGames = allGames.filter(isPower5Game);
            console.log(`🏈 Filtered ${allGames.length} CFB games to ${filteredGames.length} Power 5 games`);
          }

          setGames(filteredGames);
          console.log(`✅ Set ${filteredGames.length} ${sport} games`);
        } else {
          setGames([]);
          setError(`No ${sport} games available`);
        }
      } catch (err) {
        console.error(`❌ ${sport} fetch error:`, err);
        setError(err.message);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchGames();
  }, [sport]);

  const handleAnalyzeGame = async (game, analysisType = 'game') => {
    if (!game || !game.id) return;
    const gameId = game.id;
    const analysisKey = `${gameId}_${analysisType}`;

    setAnalysisResults(prev => ({ ...prev, [analysisKey]: { loading: true } }));

    try {
      console.log(`🧠 Analyzing ${analysisType} for game:`, gameId);
      const response = await runAnalyzer(gameId, sport, false);

      if (response?.success) {
        const fullResult = response.prediction || response.data || response;

        const filterByConfidence = (props) => {
          if (!Array.isArray(props)) return [];
          return props.filter(prop => {
            const confidence = prop.confidence || prop.confidence_score || 0;
            const confidenceValue = confidence > 1 ? confidence : confidence * 100;
            return confidenceValue >= 55;
          });
        };

        const completeData = {
          the_edge: fullResult.analysis?.the_edge || fullResult.the_edge,
          weather_impact: fullResult.analysis?.weather_impact,
          score_prediction: fullResult.analysis?.score_prediction,
          predictions: fullResult.analysis?.predictions || fullResult.predictions,
          recommended_bets: fullResult.analysis?.recommended_bets || fullResult.recommended_bets || [],
          key_trends: fullResult.analysis?.key_trends || [],
          analyzed_at: fullResult.analysis?.analyzed_at || fullResult.analyzed_at,
          top_player_props_draftkings: filterByConfidence(fullResult.top_player_props_draftkings || []),
          top_player_props_fanduel: filterByConfidence(fullResult.top_player_props_fanduel || []),
          top_team_props_draftkings: filterByConfidence(fullResult.top_team_props_draftkings || []),
          top_team_props_fanduel: filterByConfidence(fullResult.top_team_props_fanduel || [])
        };

        setAnalysisResults(prev => ({
          ...prev,
          [analysisKey]: {
            loading: false,
            data: completeData,
            type: analysisType
          }
        }));

        console.log('✅ Analysis saved:', analysisKey, completeData);
      } else {
        throw new Error(response?.error || 'Analysis failed - no results returned');
      }
    } catch (error) {
      console.error(`❌ ${analysisType} analysis error:`, error);
      setAnalysisResults(prev => ({
        ...prev,
        [analysisKey]: {
          loading: false,
          error: error.message
        }
      }));
      alert(`❌ Analysis failed: ${error.message}`);
    }
  };

  const handleRefreshGames = async () => {
    try {
      console.log(`🔄 Fetching latest ${sport} games...`);
      const currentYear = new Date().getFullYear();
      const response = await updateSchedule(sport, currentYear);

      if (response?.success || response?.gamesCreated || response?.gamesUpdated) {
        const created = response.gamesCreated || 0;
        const updated = response.gamesUpdated || 0;
        alert(`✅ ${sport} Schedule Updated!\n\nGames Created: ${created}\nGames Updated: ${updated}`);
      }

      // Reload games
      const allGames = await getGames({
        sport,
        game_date: { $gte: new Date().toISOString(), $lte: new Date("2025-12-31T23:59:59Z").toISOString() }
      });

      let filteredGames = allGames;
      if (sport === "CFB") {
        filteredGames = allGames.filter(isPower5Game);
      }
      setGames(filteredGames);
    } catch (err) {
      console.error(`❌ Schedule update failed:`, err);
      alert(`❌ Failed to update schedule: ${err.message}`);
    }
  };

  // Sport-specific display configurations
  const sportConfig = {
    NFL: { emoji: "🏈", title: "NFL", subtitle: "National Football League" },
    CFB: { emoji: "🏈", title: "College Football - Power 5", subtitle: "SEC, Big Ten, ACC, Big 12, and Pac-12 conferences" },
    NBA: { emoji: "🏀", title: "NBA", subtitle: "National Basketball Association" },
    MLB: { emoji: "⚾", title: "MLB", subtitle: "Major League Baseball" },
    UFC: { emoji: "🥊", title: "UFC", subtitle: "Ultimate Fighting Championship" },
    GOLF: { emoji: "⛳", title: "Golf", subtitle: "PGA Tour & Major Championships" }
  };

  const config = sportConfig[sport] || { emoji: "🏆", title: sport, subtitle: "" };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{config.emoji}</span>
          <h1 className="text-3xl font-bold text-white">{config.title}</h1>
        </div>
        {config.subtitle && (
          <p className="text-slate-400 text-sm mb-6 ml-14">{config.subtitle}</p>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="ml-4 text-white">Loading {sport} games...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-white">
            <p>⚠️ {error}</p>
          </div>
        ) : games.length > 0 ? (
          <div className="grid gap-6">
            {games.map((game, idx) => {
              const analysisKey = `${game.id}_game`;
              const gameAnalysis = analysisResults[analysisKey];
              
              return (
                <GameCard 
                  key={game.id || idx} 
                  game={game} 
                  sport={sport}
                  onAnalyze={handleAnalyzeGame}
                  analysisData={gameAnalysis?.data}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
            <span className="text-6xl mb-4 block">{config.emoji}</span>
            <p className="text-cyan-400 text-lg font-semibold">No {sport} games available</p>
            <p className="text-slate-400 text-sm mt-2">Check back later for upcoming games</p>
          </div>
        )}
      </div>
    </div>
  );
}