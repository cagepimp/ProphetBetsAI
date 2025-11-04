import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not set. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
})

// Helper functions to match Base44 API patterns

/**
 * Fetch games with filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Games array
 */
export async function getGames(filters = {}) {
  let query = supabase.from('games').select('*')

  // Apply filters
  if (filters.sport) query = query.eq('sport', filters.sport)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.game_date) {
    if (filters.game_date.$gte) query = query.gte('game_date', filters.game_date.$gte)
    if (filters.game_date.$lte) query = query.lte('game_date', filters.game_date.$lte)
  }
  if (filters.week) query = query.eq('week', filters.week)
  if (filters.season) query = query.eq('season', filters.season)

  // Apply confidence filter if exists
  if (filters['analysis.prediction.confidence']) {
    const confidence = filters['analysis.prediction.confidence']
    if (confidence.$gte) {
      query = query.gte('analyzer_confidence', confidence.$gte)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching games:', error)
    return []
  }

  return data || []
}

/**
 * Fetch players with filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Players array
 */
export async function getPlayers(filters = {}) {
  let query = supabase.from('players').select('*')

  if (filters.team) query = query.eq('team', filters.team)
  if (filters.sport) query = query.eq('sport', filters.sport)
  if (filters.position) query = query.eq('position', filters.position)
  if (filters.name) query = query.ilike('name', `%${filters.name}%`)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching players:', error)
    return []
  }

  return data || []
}

/**
 * Fetch a single game by ID
 * @param {string} gameId - Game ID
 * @returns {Promise<Object>} Game object
 */
export async function getGameById(gameId) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single()

  if (error) {
    console.error('Error fetching game:', error)
    return null
  }

  return data
}

/**
 * Fetch a single player by ID
 * @param {string} playerId - Player ID
 * @returns {Promise<Object>} Player object
 */
export async function getPlayerById(playerId) {
  const { data, error} = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single()

  if (error) {
    console.error('Error fetching player:', error)
    return null
  }

  return data
}

/**
 * Fetch player props with filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Props array
 */
export async function getPlayerProps(filters = {}) {
  let query = supabase.from('player_props').select('*')

  if (filters.sport) query = query.eq('sport', filters.sport)
  if (filters.player_id) query = query.eq('player_id', filters.player_id)
  if (filters.prop_type) query = query.eq('prop_type', filters.prop_type)
  if (filters.game_id) query = query.eq('game_id', filters.game_id)
  if (filters.confidence) {
    if (filters.confidence.$gte) query = query.gte('confidence', filters.confidence.$gte)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching props:', error)
    return []
  }

  return data || []
}

/**
 * Fetch injuries with filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Injuries array
 */
export async function getInjuries(filters = {}) {
  let query = supabase.from('injuries').select('*')

  if (filters.team) query = query.eq('team', filters.team)
  if (filters.sport) query = query.eq('sport', filters.sport)
  if (filters.status) {
    if (filters.status.$in) {
      query = query.in('status', filters.status.$in)
    } else {
      query = query.eq('status', filters.status)
    }
  }

  const { data, error } = await query.order('severity', { ascending: false })

  if (error) {
    console.error('Error fetching injuries:', error)
    return []
  }

  return data || []
}

/**
 * Fetch player game stats
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Stats array
 */
export async function getPlayerGameStats(filters = {}) {
  let query = supabase.from('player_game_stats').select('*')

  if (filters.player_id) query = query.eq('player_id', filters.player_id)
  if (filters.game_id) query = query.eq('game_id', filters.game_id)
  if (filters.sport) query = query.eq('sport', filters.sport)

  const { data, error } = await query.order('game_date', { ascending: false })

  if (error) {
    console.error('Error fetching stats:', error)
    return []
  }

  return data || []
}

/**
 * Fetch predictions with filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Predictions array
 */
export async function getPredictions(filters = {}) {
  let query = supabase.from('prediction_history').select('*')

  if (filters.sport) query = query.eq('sport', filters.sport)
  if (filters.created_at) {
    if (filters.created_at.$gte) query = query.gte('created_at', filters.created_at.$gte)
  }
  if (filters.result) {
    if (filters.result.$exists !== undefined) {
      query = query.not('result', 'is', null)
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching predictions:', error)
    return []
  }

  return data || []
}

/**
 * Fetch historical odds
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Odds array
 */
export async function getHistoricalOdds(filters = {}) {
  let query = supabase.from('historical_odds').select('*')

  if (filters.game_id) query = query.eq('game_id', filters.game_id)
  if (filters.sportsbook) query = query.eq('sportsbook', filters.sportsbook)

  const { data, error } = await query.order('timestamp', { ascending: true })

  if (error) {
    console.error('Error fetching historical odds:', error)
    return []
  }

  return data || []
}

/**
 * Fetch line history with filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Line history array
 */
export async function getLineHistory(filters = {}) {
  let query = supabase.from('line_history').select('*')

  if (filters.game_id) query = query.eq('game_id', filters.game_id)
  if (filters.sportsbook) query = query.eq('sportsbook', filters.sportsbook)
  if (filters.market_type) query = query.eq('market_type', filters.market_type)
  if (filters.timestamp) {
    if (filters.timestamp.$gte) query = query.gte('timestamp', filters.timestamp.$gte)
    if (filters.timestamp.$lte) query = query.lte('timestamp', filters.timestamp.$lte)
  }

  const { data, error } = await query.order('timestamp', { ascending: true })

  if (error) {
    console.error('Error fetching line history:', error)
    return []
  }

  return data || []
}

/**
 * Call Supabase Edge Function
 * @param {string} functionName - Name of the Edge Function
 * @param {Object} payload - Request payload
 * @returns {Promise<Object>} Function response
 */
export async function callEdgeFunction(functionName, payload = {}) {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    })

    if (error) {
      console.error(`Edge function ${functionName} error:`, error)
      throw error
    }

    return data
  } catch (err) {
    console.error(`Failed to call edge function ${functionName}:`, err)
    throw err
  }
}

/**
 * Run analyzer on a game
 * @param {string} gameId - Game ID
 * @param {string} sport - Sport type
 * @param {boolean} forceReanalyze - Force re-analysis
 * @returns {Promise<Object>} Analysis result
 */
export async function runAnalyzer(gameId, sport, forceReanalyze = false) {
  return callEdgeFunction('runAnalyzer10000Plus', {
    gameId,
    sport,
    forceReanalyze
  })
}

/**
 * Fetch latest odds from TheOddsAPI
 * @param {string} sport - Sport type
 * @param {string} gameId - Optional game ID
 * @returns {Promise<Object>} Odds update result
 */
export async function fetchOdds(sport, gameId = null) {
  return callEdgeFunction('fetchOdds', {
    sport,
    gameId
  })
}

/**
 * Update weekly schedule from ESPN
 * @param {string} sport - Sport type
 * @param {number} season - Season year
 * @param {number} week - Week number
 * @returns {Promise<Object>} Schedule update result
 */
export async function updateSchedule(sport, season, week = null) {
  return callEdgeFunction('updateWeeklySchedule', {
    sport,
    season,
    week
  })
}

/**
 * Auto-grade completed games and learn patterns
 * @returns {Promise<Object>} Grading result
 */
export async function autoGradeAndLearn() {
  return callEdgeFunction('autoGradeAndLearn', {})
}

export default supabase
