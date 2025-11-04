// ==========================================
// SUPABASE CLIENT FOR EDGE FUNCTIONS
// ==========================================

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create a Supabase client instance
 * Uses service role key for backend operations (bypasses RLS)
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseClient;
}

/**
 * Create a Supabase client with anon key (respects RLS)
 * Use this for user-facing operations
 */
export function getAnonClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Helper: Get games from database
 */
export async function getGames(filters: {
  sport?: string;
  status?: string;
  gameId?: string;
  date?: string;
}) {
  const supabase = getSupabaseClient();
  let query = supabase.from('games').select('*');

  if (filters.sport) {
    query = query.eq('sport', filters.sport);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.gameId) {
    query = query.eq('id', filters.gameId);
  }
  if (filters.date) {
    query = query.gte('game_date', filters.date);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch games: ${error.message}`);
  }

  return data || [];
}

/**
 * Helper: Upsert a game (insert or update)
 */
export async function upsertGame(game: any) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('games')
    .upsert(game, {
      onConflict: 'id',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert game: ${error.message}`);
  }

  return data;
}

/**
 * Helper: Get teams from database
 */
export async function getTeams(filters: {
  sport?: string;
  teamId?: string;
  name?: string;
}) {
  const supabase = getSupabaseClient();
  let query = supabase.from('teams').select('*');

  if (filters.sport) {
    query = query.eq('sport', filters.sport);
  }
  if (filters.teamId) {
    query = query.eq('id', filters.teamId);
  }
  if (filters.name) {
    query = query.eq('name', filters.name);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch teams: ${error.message}`);
  }

  return data || [];
}

/**
 * Helper: Get players from database
 */
export async function getPlayers(filters: {
  sport?: string;
  teamId?: string;
  playerId?: string;
  status?: string;
}) {
  const supabase = getSupabaseClient();
  let query = supabase.from('players').select('*');

  if (filters.sport) {
    query = query.eq('sport', filters.sport);
  }
  if (filters.teamId) {
    query = query.eq('team_id', filters.teamId);
  }
  if (filters.playerId) {
    query = query.eq('id', filters.playerId);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch players: ${error.message}`);
  }

  return data || [];
}

/**
 * Helper: Upsert a player (insert or update)
 */
export async function upsertPlayer(player: any) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('players')
    .upsert(player, {
      onConflict: 'id',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert player: ${error.message}`);
  }

  return data;
}

/**
 * Helper: Insert a prediction
 */
export async function insertPrediction(prediction: any) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('predictions')
    .insert(prediction)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert prediction: ${error.message}`);
  }

  return data;
}

/**
 * Helper: Update a prediction result
 */
export async function updatePredictionResult(
  predictionId: string,
  result: {
    result: 'win' | 'loss' | 'push' | 'void';
    actual_outcome?: any;
    profit_loss?: number;
  }
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('predictions')
    .update({
      ...result,
      updated_at: new Date().toISOString(),
    })
    .eq('id', predictionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update prediction: ${error.message}`);
  }

  return data;
}

/**
 * Helper: Get predictions
 */
export async function getPredictions(filters: {
  sport?: string;
  gameId?: string;
  result?: string;
}) {
  const supabase = getSupabaseClient();
  let query = supabase.from('predictions').select('*');

  if (filters.sport) {
    query = query.eq('sport', filters.sport);
  }
  if (filters.gameId) {
    query = query.eq('game_id', filters.gameId);
  }
  if (filters.result) {
    query = query.eq('result', filters.result);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch predictions: ${error.message}`);
  }

  return data || [];
}

/**
 * Helper: Insert or update injuries
 */
export async function upsertInjury(injury: any) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('injuries')
    .upsert(injury, {
      onConflict: 'id',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert injury: ${error.message}`);
  }

  return data;
}

/**
 * Helper: Get injuries
 */
export async function getInjuries(filters: {
  sport?: string;
  teamId?: string;
  status?: string;
}) {
  const supabase = getSupabaseClient();
  let query = supabase.from('injuries').select('*');

  if (filters.sport) {
    query = query.eq('sport', filters.sport);
  }
  if (filters.teamId) {
    query = query.eq('team_id', filters.teamId);
  }
  if (filters.status) {
    query = query.eq('injury_status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch injuries: ${error.message}`);
  }

  return data || [];
}

/**
 * Helper: Log to system_logs table
 */
export async function logEvent(
  functionName: string,
  eventType: 'info' | 'error' | 'warning',
  message: string,
  metadata?: any
) {
  const supabase = getSupabaseClient();

  try {
    await supabase.from('system_logs').insert({
      function_name: functionName,
      event_type: eventType,
      message,
      metadata,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to log event:', err);
  }
}
