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
 * Fetch teams with filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Teams array
 */
export async function getTeams(filters = {}) {
  let query = supabase.from('teams').select('*')

  if (filters.sport) query = query.eq('sport', filters.sport)
  if (filters.name) query = query.ilike('name', `%${filters.name}%`)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching teams:', error)
    return []
  }

  return data || []
}

// ============================================================================
// SUPABASE EDGE FUNCTIONS
// ============================================================================

/**
 * Call a Supabase Edge Function with robust error handling
 * @param {string} functionName - Name of the Edge Function to invoke
 * @param {Object} payload - Request payload to send to the function
 * @param {Object} options - Additional options (timeout, retries, etc.)
 * @returns {Promise<Object>} Function response data
 * @throws {Error} If the function call fails after retries
 */
export async function callEdgeFunction(functionName, payload = {}, options = {}) {
  const {
    timeout = 60000, // 60 second default timeout
    retries = 0, // No retries by default
    headers = {}
  } = options

  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Retrying Edge Function '${functionName}' (attempt ${attempt + 1}/${retries + 1})`)
      }

      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: payload,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        })

        clearTimeout(timeoutId)

        if (error) {
          console.error(`❌ Edge Function '${functionName}' error:`, error)
          throw new Error(error.message || `Edge Function ${functionName} failed`)
        }

        // Success
        console.log(`✅ Edge Function '${functionName}' completed successfully`)
        return data

      } catch (invokeError) {
        clearTimeout(timeoutId)
        throw invokeError
      }

    } catch (error) {
      lastError = error

      // Check if it's a timeout error
      if (error.name === 'AbortError') {
        console.error(`⏱️ Edge Function '${functionName}' timed out after ${timeout}ms`)
        lastError = new Error(`Edge Function ${functionName} timed out after ${timeout}ms`)
      }

      // If this is the last attempt, throw the error
      if (attempt === retries) {
        break
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // All retries failed
  console.error(`❌ Edge Function '${functionName}' failed after ${retries + 1} attempts:`, lastError)
  throw lastError
}

/**
 * Populate games - Fetch schedules from ESPN
 * @param {string} sport - Sport type (NFL, NBA, MLB, NHL, CFB, UFC, Golf)
 * @param {number} season - Season year (optional)
 * @param {number} week - Week number (optional, for NFL/CFB)
 * @param {boolean} forceRefresh - Force refresh even if games exist
 * @returns {Promise<Object>} Games created/updated result
 */
export async function populateGames(sport, season = null, week = null, forceRefresh = false) {
  if (!sport) {
    throw new Error('sport is required for populateGames')
  }

  return callEdgeFunction('populate-games', {
    sport,
    season,
    week,
    forceRefresh
  }, {
    timeout: 60000, // 1 minute
    retries: 1
  })
}

/**
 * Update schedule - Fetch latest schedules from ESPN (alias for populateGames with forceRefresh)
 * @param {string} sport - Sport type (NFL, NBA, MLB, NHL, CFB, UFC, Golf)
 * @param {number} season - Season year (optional)
 * @param {number} week - Week number (optional, for NFL/CFB)
 * @returns {Promise<Object>} Games created/updated result
 */
export async function updateSchedule(sport, season = null, week = null) {
  if (!sport) {
    throw new Error('sport is required for updateSchedule')
  }

  return populateGames(sport, season, week, true)
}

/**
 * Fetch betting odds from The Odds API
 * @param {string} sport - Sport type
 * @param {Array} markets - Markets to fetch (h2h, spreads, totals)
 * @param {Array} bookmakers - Specific bookmakers (optional)
 * @returns {Promise<Object>} Odds update result
 */
export async function fetchOdds(sport, markets = ['h2h', 'spreads', 'totals'], bookmakers = null) {
  if (!sport) {
    throw new Error('sport is required for fetchOdds')
  }

  return callEdgeFunction('fetch-odds', {
    sport,
    markets,
    bookmakers
  }, {
    timeout: 30000, // 30 seconds
    retries: 2
  })
}

/**
 * Run AI analyzer on a game
 * @param {string} gameId - Game ID (external_id from games table)
 * @param {string} sport - Sport type
 * @param {string} analysisDepth - Analysis depth (quick, standard, deep)
 * @returns {Promise<Object>} Analysis result with predictions
 */
export async function runAnalyzer(gameId, sport, analysisDepth = 'standard') {
  if (!gameId) {
    throw new Error('gameId is required for runAnalyzer')
  }
  if (!sport) {
    throw new Error('sport is required for runAnalyzer')
  }

  return callEdgeFunction('run-analyzer', {
    gameId,
    sport,
    analysisDepth
  }, {
    timeout: 120000, // 2 minutes for AI analysis
    retries: 1
  })
}

/**
 * Sync player rosters from ESPN
 * @param {string} sport - Sport type
 * @param {Array} teamIds - Specific team IDs (optional)
 * @param {boolean} forceRefresh - Force refresh even if players exist
 * @returns {Promise<Object>} Players created/updated result
 */
export async function syncRosters(sport, teamIds = null, forceRefresh = false) {
  if (!sport) {
    throw new Error('sport is required for syncRosters')
  }

  return callEdgeFunction('sync-rosters', {
    sport,
    teamIds,
    forceRefresh
  }, {
    timeout: 120000, // 2 minutes
    retries: 1
  })
}

/**
 * Generate AI player prop recommendations
 * @param {string} gameId - Game ID (optional)
 * @param {string} sport - Sport type (optional)
 * @param {Array} playerIds - Specific player IDs (optional)
 * @returns {Promise<Object>} Props generated result
 */
export async function generateProps(gameId = null, sport = null, playerIds = null) {
  return callEdgeFunction('generate-props', {
    gameId,
    sport,
    playerIds
  }, {
    timeout: 180000, // 3 minutes
    retries: 1
  })
}

/**
 * Update results and grade predictions
 * @param {string} sport - Sport type (optional)
 * @param {string} gameId - Specific game ID (optional)
 * @param {string} date - Specific date (optional)
 * @returns {Promise<Object>} Grading result
 */
export async function updateResults(sport = null, gameId = null, date = null) {
  return callEdgeFunction('update-results', {
    sport,
    gameId,
    date
  }, {
    timeout: 180000, // 3 minutes
    retries: 0 // Don't retry to avoid duplicate grading
  })
}

/**
 * Fetch injury reports from ESPN
 * @param {string} sport - Sport type
 * @returns {Promise<Object>} Injuries updated result
 */
export async function fetchInjuries(sport) {
  if (!sport) {
    throw new Error('sport is required for fetchInjuries')
  }

  return callEdgeFunction('fetch-injuries', {
    sport
  }, {
    timeout: 60000, // 1 minute
    retries: 1
  })
}

export default supabase