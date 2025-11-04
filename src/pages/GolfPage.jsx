import React, { useEffect, useState } from "react";
import { getGames } from "@/api/supabaseClient";
import { runAnalyzerPropsV3 } from "@/api/functions";
import GameCard from "@/components/sports/GameCard";
import { Loader2 } from "lucide-react";

export default function GolfPage() {
  const sport = "GOLF";
  
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisResults, setAnalysisResults] = useState({});

  useEffect(() => {
    const dateFrom = new Date().toISOString();
    const dateTo = new Date("2025-12-31T23:59:59Z").toISOString();
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setGames([]);

      try {
        console.log(`[GolfPage] Fetching tournaments for ${sport}`);

        const gamesList = await getGames({
          sport,
          game_date: { $gte: dateFrom, $lte: dateTo }
        });

        if (cancelled) return;

        if (Array.isArray(gamesList)) {
          setGames(gamesList);
          console.log(`✅ Loaded ${gamesList.length} ${sport} tournaments`);

          if (gamesList.length === 0) {
            setError(`No ${sport} tournaments found`);
          }
        } else {
          setGames([]);
          setError("Failed to load tournaments");
        }

      } catch (err) {
        if (err.message === 'Request aborted' || cancelled) return;

        console.error(`[GolfPage] Error:`, err);
        setGames([]);
        setError(err?.message || String(err));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAnalyzeGame = async (game, analysisType = 'game') => {
    try {
      console.log(`🧠 Analyzing tournament:`, game.id);
      const analysisKey = `${game.id}_${analysisType}`;
      setAnalysisResults(prev => ({ ...prev, [analysisKey]: { loading: true } }));

      let response;

      if (analysisType === 'player_props') {
        response = await runAnalyzerPropsV3({
          sport: sport,
          gameId: game.id,
          analysisType: 'player'
        });
      } else if (analysisType === 'team_props') {
        response = await runAnalyzerPropsV3({
          sport: sport,
          gameId: game.id,
          analysisType: 'team'
        });
      } else {
        response = await runAnalyzer(game.id, sport, false);
      }

      const data = response?.data || response;
      console.log(`✅ ${analysisType} analysis result:`, data);

      if (data?.success && data?.results && data.results.length > 0) {
        const fullResult = data.results[0];

        // Filter props by confidence (55% - 100% only)
        const filterByConfidence = (props) => {
          if (!Array.isArray(props)) return [];
          return props.filter(prop => {
            const confidence = prop.confidence || prop.confidence_score || 0;
            // Handle both percentage (55-100) and decimal (0.55-1.0) formats
            const confidenceValue = confidence > 1 ? confidence : confidence * 100;
            return confidenceValue >= 55;
          });
        };

        const completeData = {
          ...fullResult.analysis,
          // Props from top level - FILTERED by 55%+ confidence
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
        throw new Error(data?.error || data?.message || 'Analysis failed');
      }
    } catch (err) {
      console.error(`❌ ${analysisType} analysis error:`, err);
      const analysisKey = `${game.id}_${analysisType}`;
      setAnalysisResults(prev => ({
        ...prev,
        [analysisKey]: {
          loading: false,
          error: err.message
        }
      }));
      alert(`❌ Analysis failed: ${err.message}`);
    }
  };

  return (
    <main className="flex-1 p-6 bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 text-green-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">
          Today's Tournaments — {sport}
        </h1>

        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="inline-block w-12 h-12 animate-spin text-white mb-4" />
            <p className="text-green-400">Loading tournaments...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-white mb-6">
            <p className="font-semibold mb-2">⚠️ {error}</p>
            <p className="text-sm text-red-300">
              Try running "Populate Games" from Developer Tools
            </p>
          </div>
        ) : games.length === 0 ? (
          <div className="py-24 text-center">
            <div className="text-6xl mb-4">⛳</div>
            <p className="text-xl text-green-300 mb-2">No tournaments found</p>
            <p className="text-sm text-green-500 mb-4">
              Try running "Populate Games" from Developer Tools
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {games.map((g) => {
              const analysisKey = `${g.id}_game`;
              const gameAnalysis = analysisResults[analysisKey];
              
              return (
                <GameCard 
                  key={g.id || `${g.away_team}@${g.home_team}-${g.commence_time}`} 
                  game={g}
                  sport={sport}
                  onAnalyze={handleAnalyzeGame}
                  analysisData={gameAnalysis?.data}
                  isAnalyzing={gameAnalysis?.loading}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}