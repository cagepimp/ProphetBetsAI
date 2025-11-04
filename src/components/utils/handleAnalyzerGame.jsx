import { runAnalyzer } from '@/api/supabaseClient';

/**
 * handleAnalyzeGame - Utility function to fetch game analysis
 * Properly extracts both analysis AND props from the backend response
 */
export const handleAnalyzeGame = async (game, analysisType = 'game') => {
  try {
    console.log(`🧠 [handleAnalyzeGame] Starting ${analysisType} analysis for game:`, game.id);

    // Call Supabase analyzer
    const result = await runAnalyzer(game.id, game.sport || 'NFL', false);

    console.log(`📦 [handleAnalyzeGame] Raw result:`, result);

    const responseData = result?.data || result;
    
    // Check for errors
    if (responseData?.error) {
      console.error(`❌ [handleAnalyzeGame] Backend error:`, responseData.error);
      throw new Error(responseData.error);
    }
    
    // Validate response structure
    if (!responseData?.success || !responseData?.results || responseData.results.length === 0) {
      throw new Error('No analysis data returned from backend');
    }
    
    // ✅ Extract the FULL result object (has both analysis AND props at top level)
    const fullResult = responseData.results[0];

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

    // ✅ Build complete data object with analysis + props
    const completeData = {
      // Analysis fields from fullResult.analysis
      the_edge: fullResult.analysis?.the_edge,
      weather_impact: fullResult.analysis?.weather_impact,
      score_prediction: fullResult.analysis?.score_prediction,
      predictions: fullResult.analysis?.predictions,
      recommended_bets: fullResult.analysis?.recommended_bets || [],
      key_trends: fullResult.analysis?.key_trends || [],
      analyzed_at: fullResult.analysis?.analyzed_at || fullResult.analyzed_at,

      // ✅ Props from TOP LEVEL - FILTERED by 55%+ confidence
      top_player_props_draftkings: filterByConfidence(fullResult.top_player_props_draftkings || []),
      top_player_props_fanduel: filterByConfidence(fullResult.top_player_props_fanduel || []),
      top_team_props_draftkings: filterByConfidence(fullResult.top_team_props_draftkings || []),
      top_team_props_fanduel: filterByConfidence(fullResult.top_team_props_fanduel || [])
    };
    
    console.log(`✅ [handleAnalyzeGame] Analysis retrieved successfully:`, {
      has_edge: !!completeData.the_edge,
      has_recommended_bets: !!completeData.recommended_bets?.length,
      dk_player_props: completeData.top_player_props_draftkings?.length || 0,
      fd_player_props: completeData.top_player_props_fanduel?.length || 0,
      dk_team_props: completeData.top_team_props_draftkings?.length || 0,
      fd_team_props: completeData.top_team_props_fanduel?.length || 0
    });
    
    // ✅ Return the COMPLETE data
    return {
      success: true,
      data: completeData,
      analysisType: analysisType
    };
    
  } catch (error) {
    console.error(`❌ [handleAnalyzeGame] Error:`, error.message);
    throw new Error(`Analysis failed: ${error.message}`);
  }
};

export default handleAnalyzeGame;