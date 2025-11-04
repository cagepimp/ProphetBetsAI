/**
 * useGameAnalyzer Hook
 * Custom React hook for handling game analysis with confidence filtering
 */

import { useState, useCallback } from 'react';
import { runAnalyzer } from '@/api/supabaseClient';
import { extractAnalyzerData } from '@/utils/analyzerUtils';

/**
 * Custom hook for analyzing games with built-in state management
 * @param {number} minConfidence - Minimum confidence threshold (default: 55)
 * @returns {Object} - Hook state and functions
 */
export const useGameAnalyzer = (minConfidence = 55) => {
  const [analyzingGames, setAnalyzingGames] = useState({});
  const [analysisResults, setAnalysisResults] = useState({});
  const [errors, setErrors] = useState({});

  /**
   * Analyze a game and store results
   * @param {Object} game - Game object with id and sport
   * @param {string} analysisType - Type of analysis (optional)
   * @returns {Promise<Object>} - Analysis data
   */
  const analyzeGame = useCallback(async (game, analysisType = 'game') => {
    if (!game || !game.id) {
      throw new Error('Invalid game object');
    }

    const gameId = game.id;
    const sport = game.sport || 'NFL';

    setAnalyzingGames(prev => ({ ...prev, [gameId]: true }));
    setErrors(prev => ({ ...prev, [gameId]: null }));

    try {
      console.log(`🧠 [useGameAnalyzer] Starting ${analysisType} analysis for game:`, gameId);

      const response = await runAnalyzer(gameId, sport, false);

      const data = response?.data || response;
      const completeData = extractAnalyzerData(data, minConfidence);

      setAnalysisResults(prev => ({
        ...prev,
        [gameId]: {
          data: completeData,
          type: analysisType,
          timestamp: new Date().toISOString()
        }
      }));

      console.log(`✅ [useGameAnalyzer] Analysis complete:`, {
        gameId,
        hasEdge: !!completeData.the_edge,
        propsCount: {
          dk_player: completeData.top_player_props_draftkings?.length || 0,
          fd_player: completeData.top_player_props_fanduel?.length || 0,
          dk_team: completeData.top_team_props_draftkings?.length || 0,
          fd_team: completeData.top_team_props_fanduel?.length || 0
        }
      });

      return completeData;
    } catch (error) {
      console.error(`❌ [useGameAnalyzer] Analysis failed:`, error);

      setErrors(prev => ({
        ...prev,
        [gameId]: error.message || 'Analysis failed'
      }));

      throw error;
    } finally {
      setAnalyzingGames(prev => ({ ...prev, [gameId]: false }));
    }
  }, [minConfidence]);

  /**
   * Clear analysis results for a specific game
   * @param {string} gameId - Game ID
   */
  const clearAnalysis = useCallback((gameId) => {
    setAnalysisResults(prev => {
      const newResults = { ...prev };
      delete newResults[gameId];
      return newResults;
    });
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[gameId];
      return newErrors;
    });
  }, []);

  /**
   * Clear all analysis results
   */
  const clearAllAnalyses = useCallback(() => {
    setAnalysisResults({});
    setErrors({});
  }, []);

  /**
   * Check if a game is currently being analyzed
   * @param {string} gameId - Game ID
   * @returns {boolean}
   */
  const isAnalyzing = useCallback((gameId) => {
    return !!analyzingGames[gameId];
  }, [analyzingGames]);

  /**
   * Get analysis data for a specific game
   * @param {string} gameId - Game ID
   * @returns {Object|null}
   */
  const getAnalysis = useCallback((gameId) => {
    return analysisResults[gameId]?.data || null;
  }, [analysisResults]);

  /**
   * Get error for a specific game
   * @param {string} gameId - Game ID
   * @returns {string|null}
   */
  const getError = useCallback((gameId) => {
    return errors[gameId] || null;
  }, [errors]);

  /**
   * Check if analysis exists for a game
   * @param {string} gameId - Game ID
   * @returns {boolean}
   */
  const hasAnalysis = useCallback((gameId) => {
    return !!analysisResults[gameId];
  }, [analysisResults]);

  return {
    // State
    analyzingGames,
    analysisResults,
    errors,

    // Functions
    analyzeGame,
    clearAnalysis,
    clearAllAnalyses,

    // Helper functions
    isAnalyzing,
    getAnalysis,
    getError,
    hasAnalysis
  };
};

export default useGameAnalyzer;
