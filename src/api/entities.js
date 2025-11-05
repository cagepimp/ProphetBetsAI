// Migrated to Supabase - use supabaseClient functions instead
import {
  getGames,
  getGameById,
  getPlayers,
  getPlayerById,
  getPlayerProps,
  getPlayerGameStats,
  getInjuries,
  getPredictions,
  getHistoricalOdds,
  getLineHistory,
  supabase
} from './supabaseClient';

// Export Supabase helper functions with Base44-style names for compatibility
export const Game = {
  filter: getGames,
  get: getGameById,
  list: async () => await getGames({}),
  update: async (id, data) => {
    const { data: result, error } = await supabase
      .from('games')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }
};

export const Player = {
  filter: getPlayers,
  get: getPlayerById
};

export const PlayerProp = {
  filter: getPlayerProps
};

export const PlayerGameStats = {
  filter: getPlayerGameStats
};

export const Injury = {
  filter: getInjuries
};

export const PredictionHistory = {
  filter: getPredictions
};

export const HistoricalOdds = {
  filter: getHistoricalOdds
};

export const LineHistory = {
  filter: getLineHistory
};

// Legacy exports for backward compatibility
export const Alert = { filter: async () => [] };
export const TeamProp = { filter: getPlayerProps };
export const UFCFight = { filter: async (filters) => await getGames(filters) };
export const PropAnalyzer = { filter: getPlayerProps };
export const AnalyzerProps = { filter: getPlayerProps };
export const GameProps = { filter: getPlayerProps };
export const PredictionAccuracy = { filter: getPredictions };
export const HistoricalGames = { filter: getGames };
export const LearningPatterns = { filter: async () => [] };
export const TeamSeasonStats = { filter: async () => [] };
export const TrainingData = { filter: async () => [] };
export const AnalyzerModels = { filter: async () => [] };
export const AnalyzerWeights = { filter: async () => [] };

// Auth - use Supabase auth
export const User = supabase.auth;