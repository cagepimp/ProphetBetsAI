// ==========================================
// SHARED TYPES FOR PROPHETBETSAI BACKEND
// ==========================================

export type Sport = 'NFL' | 'NBA' | 'MLB' | 'NHL' | 'CFB' | 'UFC' | 'Golf';

export type GameStatus = 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';

export type BetType = 'moneyline' | 'spread' | 'total' | 'player_prop' | 'team_prop';

export type Bookmaker = 'draftkings' | 'fanduel' | 'betmgm' | 'caesars' | 'pointsbet';

// ==========================================
// DATABASE TYPES (matching schema.sql)
// ==========================================

export interface Team {
  id: string;
  sport: Sport;
  name: string;
  abbreviation: string;
  logo_url?: string;
  conference?: string;
  division?: string;
  venue?: string;
  city?: string;
  state?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  sport: Sport;
  name: string;
  position?: string;
  jersey_number?: string;
  status?: 'active' | 'injured' | 'inactive';
  height?: string;
  weight?: number;
  date_of_birth?: string;
  college?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  sport: Sport;
  home_team: string;
  away_team: string;
  home_team_id?: string;
  away_team_id?: string;
  game_date: string;
  commence_time: string;
  venue?: string;
  status: GameStatus;
  home_score?: number;
  away_score?: number;
  season?: string;
  week?: number;
  markets?: Markets;
  weather?: Record<string, any>;
  last_updated: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Markets {
  moneyline?: BookmakerOdds;
  spread?: BookmakerOdds;
  total?: BookmakerOdds;
  [key: string]: BookmakerOdds | undefined;
}

export interface BookmakerOdds {
  draftkings?: Outcome[];
  fanduel?: Outcome[];
  betmgm?: Outcome[];
  caesars?: Outcome[];
  [key: string]: Outcome[] | undefined;
}

export interface Outcome {
  name: string;
  price: number;
  point?: number;
}

export interface PlayerProp {
  id: string;
  game_id: string;
  player_id?: string;
  player_name: string;
  team: string;
  sport: Sport;
  prop_type: string;
  line: number;
  odds_over?: number;
  odds_under?: number;
  recommendation?: 'over' | 'under' | 'avoid';
  confidence?: number;
  analysis?: Record<string, any>;
  result?: 'win' | 'loss' | 'push' | 'void';
  actual_value?: number;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  game_id: string;
  sport: Sport;
  prediction_type: BetType;
  predicted_winner?: string;
  predicted_spread?: number;
  predicted_total?: number;
  confidence: number;
  recommended_bet?: string;
  recommended_odds?: number;
  stake_size?: number;
  analysis: PredictionAnalysis;
  result?: 'win' | 'loss' | 'push' | 'void';
  actual_outcome?: Record<string, any>;
  profit_loss?: number;
  created_at: string;
  updated_at: string;
}

export interface PredictionAnalysis {
  the_edge?: string;
  key_factors?: string[];
  home_advantages?: string[];
  away_advantages?: string[];
  injury_impact?: string;
  weather_impact?: string;
  situational_factors?: string[];
  value_rating?: number;
  risk_assessment?: string;
  [key: string]: any;
}

export interface Injury {
  id: string;
  player_id?: string;
  player_name: string;
  team_id?: string;
  team: string;
  sport: Sport;
  injury_status: 'out' | 'doubtful' | 'questionable' | 'probable' | 'day-to-day';
  injury_type?: string;
  description?: string;
  date_reported: string;
  expected_return?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ESPNGame {
  id: string;
  date: string;
  name: string;
  shortName: string;
  competitions: ESPNCompetition[];
  status: {
    type: {
      name: string;
      state: string;
      completed: boolean;
    };
  };
  venue?: {
    fullName: string;
  };
  weather?: {
    temperature: number;
    condition: string;
    wind: string;
  };
}

export interface ESPNCompetition {
  id: string;
  date: string;
  competitors: ESPNTeam[];
  odds?: any[];
  situation?: any;
  status: {
    type: {
      name: string;
      state: string;
      completed: boolean;
    };
  };
}

export interface ESPNTeam {
  id: string;
  homeAway: 'home' | 'away';
  team: {
    id: string;
    name: string;
    abbreviation: string;
    displayName: string;
    shortDisplayName: string;
    logo: string;
  };
  score?: string;
  records?: any[];
}

export interface OddsAPIGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsAPIBookmaker[];
}

export interface OddsAPIBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsAPIMarket[];
}

export interface OddsAPIMarket {
  key: string;
  last_update: string;
  outcomes: OddsAPIOutcome[];
}

export interface OddsAPIOutcome {
  name: string;
  price: number;
  point?: number;
}

export interface OpenAIAnalysis {
  the_edge: string;
  recommended_bets: RecommendedBet[];
  predictions: {
    winner?: string;
    spread?: number;
    total?: number;
    confidence: number;
  };
  key_factors: string[];
  risk_assessment: string;
  value_rating: number;
}

export interface RecommendedBet {
  type: BetType;
  selection: string;
  odds: number;
  confidence: number;
  reasoning: string;
  stake_recommendation: 'max' | 'medium' | 'small' | 'avoid';
}

// ==========================================
// FUNCTION INPUT/OUTPUT TYPES
// ==========================================

export interface PopulateGamesInput {
  sport: Sport;
  season?: number;
  week?: number;
  forceRefresh?: boolean;
}

export interface PopulateGamesOutput {
  success: boolean;
  gamesCreated: number;
  gamesUpdated: number;
  errors?: string[];
}

export interface FetchOddsInput {
  sport: Sport;
  markets?: string[];
  bookmakers?: string[];
  regions?: string[];
}

export interface FetchOddsOutput {
  success: boolean;
  oddsUpdated: number;
  gamesProcessed: number;
  errors?: string[];
}

export interface RunAnalyzerInput {
  gameId: string;
  sport: Sport;
  analysisDepth?: 'quick' | 'standard' | 'deep';
}

export interface RunAnalyzerOutput {
  success: boolean;
  predictionId: string;
  analysis: OpenAIAnalysis;
  error?: string;
}

export interface GeneratePropsInput {
  gameId?: string;
  sport?: Sport;
  playerIds?: string[];
}

export interface GeneratePropsOutput {
  success: boolean;
  propsGenerated: number;
  props: PlayerProp[];
  errors?: string[];
}

export interface SyncRostersInput {
  sport: Sport;
  teamIds?: string[];
  forceRefresh?: boolean;
}

export interface SyncRostersOutput {
  success: boolean;
  playersCreated: number;
  playersUpdated: number;
  errors?: string[];
}

export interface UpdateResultsInput {
  sport?: Sport;
  gameId?: string;
  date?: string;
}

export interface UpdateResultsOutput {
  success: boolean;
  gamesGraded: number;
  predictionsGraded: number;
  propsGraded: number;
  accuracyUpdated: boolean;
  errors?: string[];
}

// ==========================================
// UTILITY TYPES
// ==========================================

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: APIError | null;
}

export interface CronJobConfig {
  functionName: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}
