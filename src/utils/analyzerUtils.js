/**
 * Analyzer Utility Functions
 * Shared utilities for handling analyzer responses and filtering props
 */

/**
 * Filter props by confidence threshold (55% - 100%)
 * Handles both percentage (55-100) and decimal (0.55-1.0) formats
 * @param {Array} props - Array of prop objects with confidence scores
 * @param {number} minConfidence - Minimum confidence threshold (default: 55)
 * @returns {Array} - Filtered array of props meeting confidence threshold
 */
export const filterByConfidence = (props, minConfidence = 55) => {
  if (!Array.isArray(props)) return [];

  return props.filter(prop => {
    const confidence = prop.confidence || prop.confidence_score || 0;
    // Handle both percentage (55-100) and decimal (0.55-1.0) formats
    const confidenceValue = confidence > 1 ? confidence : confidence * 100;
    return confidenceValue >= minConfidence;
  });
};

/**
 * Extract and format complete analyzer data with confidence filtering
 * @param {Object} responseData - Raw response from analyzer
 * @param {number} minConfidence - Minimum confidence threshold (default: 55)
 * @returns {Object} - Complete data object with analysis and filtered props
 */
export const extractAnalyzerData = (responseData, minConfidence = 55) => {
  if (!responseData?.success || !responseData?.results || responseData.results.length === 0) {
    throw new Error('No analysis data returned from backend');
  }

  const fullResult = responseData.results[0];

  return {
    // Analysis fields
    the_edge: fullResult.analysis?.the_edge,
    weather_impact: fullResult.analysis?.weather_impact,
    score_prediction: fullResult.analysis?.score_prediction,
    predictions: fullResult.analysis?.predictions,
    recommended_bets: fullResult.analysis?.recommended_bets || [],
    key_trends: fullResult.analysis?.key_trends || [],
    analyzed_at: fullResult.analysis?.analyzed_at || fullResult.analyzed_at,

    // Props from top level - FILTERED by confidence threshold
    top_player_props_draftkings: filterByConfidence(fullResult.top_player_props_draftkings || [], minConfidence),
    top_player_props_fanduel: filterByConfidence(fullResult.top_player_props_fanduel || [], minConfidence),
    top_team_props_draftkings: filterByConfidence(fullResult.top_team_props_draftkings || [], minConfidence),
    top_team_props_fanduel: filterByConfidence(fullResult.top_team_props_fanduel || [], minConfidence)
  };
};

/**
 * Get confidence level badge color based on confidence score
 * @param {number} confidence - Confidence score (0-100 or 0-1)
 * @returns {Object} - Color classes for badge
 */
export const getConfidenceBadgeColor = (confidence) => {
  const confidenceValue = confidence > 1 ? confidence : confidence * 100;

  if (confidenceValue >= 85) {
    return {
      bg: 'bg-green-600',
      text: 'text-green-100',
      border: 'border-green-500',
      label: 'Excellent'
    };
  } else if (confidenceValue >= 75) {
    return {
      bg: 'bg-blue-600',
      text: 'text-blue-100',
      border: 'border-blue-500',
      label: 'Very Good'
    };
  } else if (confidenceValue >= 65) {
    return {
      bg: 'bg-yellow-600',
      text: 'text-yellow-100',
      border: 'border-yellow-500',
      label: 'Good'
    };
  } else {
    return {
      bg: 'bg-orange-600',
      text: 'text-orange-100',
      border: 'border-orange-500',
      label: 'Fair'
    };
  }
};

/**
 * Format confidence score for display
 * @param {number} confidence - Confidence score (0-100 or 0-1)
 * @returns {string} - Formatted confidence string
 */
export const formatConfidence = (confidence) => {
  const confidenceValue = confidence > 1 ? confidence : confidence * 100;
  return `${confidenceValue.toFixed(1)}%`;
};

/**
 * Sort props by confidence (highest first)
 * @param {Array} props - Array of prop objects
 * @returns {Array} - Sorted array of props
 */
export const sortByConfidence = (props) => {
  if (!Array.isArray(props)) return [];

  return [...props].sort((a, b) => {
    const confA = a.confidence || a.confidence_score || 0;
    const confB = b.confidence || b.confidence_score || 0;
    const valueA = confA > 1 ? confA : confA * 100;
    const valueB = confB > 1 ? confB : confB * 100;
    return valueB - valueA;
  });
};

/**
 * Group props by confidence tiers
 * @param {Array} props - Array of prop objects
 * @returns {Object} - Props grouped by tier (excellent, veryGood, good, fair)
 */
export const groupByConfidenceTier = (props) => {
  if (!Array.isArray(props)) return { excellent: [], veryGood: [], good: [], fair: [] };

  const tiers = { excellent: [], veryGood: [], good: [], fair: [] };

  props.forEach(prop => {
    const confidence = prop.confidence || prop.confidence_score || 0;
    const confidenceValue = confidence > 1 ? confidence : confidence * 100;

    if (confidenceValue >= 85) {
      tiers.excellent.push(prop);
    } else if (confidenceValue >= 75) {
      tiers.veryGood.push(prop);
    } else if (confidenceValue >= 65) {
      tiers.good.push(prop);
    } else if (confidenceValue >= 55) {
      tiers.fair.push(prop);
    }
  });

  return tiers;
};
