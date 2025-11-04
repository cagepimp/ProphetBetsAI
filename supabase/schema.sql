-- ============================================================================
-- PROPHETBETSAI COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Multi-sport betting prediction platform with AI analysis
-- Supports: NFL, NBA, MLB, CFB, UFC, Golf
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Teams table - All sports teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  abbreviation TEXT,
  sport TEXT NOT NULL, -- NFL, NBA, MLB, CFB, UFC, GOLF
  league TEXT, -- e.g., AFC, NFC, American League, etc.
  division TEXT,
  conference TEXT,
  city TEXT,
  logo_url TEXT,
  colors JSONB, -- {primary: "#hex", secondary: "#hex"}
  stadium TEXT,
  coach TEXT,
  metadata JSONB, -- Additional sport-specific data
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table - All sports players
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team TEXT, -- Team name for quick access
  sport TEXT NOT NULL,
  position TEXT,
  jersey_number INTEGER,
  height TEXT,
  weight INTEGER,
  age INTEGER,
  birth_date DATE,
  college TEXT,
  experience_years INTEGER,
  status TEXT DEFAULT 'active', -- active, injured, inactive, retired
  photo_url TEXT,
  stats JSONB, -- Sport-specific stats
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table - All scheduled games/matches
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT UNIQUE, -- External API ID (ESPN, Odds API, etc.)
  sport TEXT NOT NULL,
  league TEXT,

  -- Teams
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  away_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Schedule
  game_date TIMESTAMPTZ NOT NULL,
  commence_time TIMESTAMPTZ,
  week INTEGER, -- For NFL/CFB
  season INTEGER NOT NULL,
  season_type TEXT DEFAULT 'regular', -- preseason, regular, postseason

  -- Venue
  venue TEXT,
  location TEXT,
  weather JSONB, -- {temp, conditions, wind, etc.}

  -- Game Status
  status TEXT DEFAULT 'scheduled', -- scheduled, live, completed, postponed, cancelled
  quarter TEXT, -- Current quarter/period
  time_remaining TEXT,

  -- Scores
  home_score INTEGER,
  away_score INTEGER,
  actual_outcome JSONB, -- {home_score, away_score, winner, spread_cover, total_over}

  -- Odds (from multiple books)
  markets JSONB, -- {moneyline: {draftkings: [], fanduel: []}, spread: {}, total: {}}

  -- Analysis
  analysis JSONB, -- AI analysis results
  analyzer_confidence DECIMAL(5,2), -- 0-100
  prediction JSONB, -- {winner, spread, total, confidence}
  prediction_accuracy JSONB, -- {overall, winner_correct, spread_correct, etc.}

  -- Metadata
  broadcast TEXT,
  importance_score DECIMAL(3,2), -- 0-10 rating
  tags TEXT[], -- ['prime_time', 'rivalry', 'playoff_implications']
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ
);

-- ============================================================================
-- PROPS TABLES
-- ============================================================================

-- Player Props
CREATE TABLE IF NOT EXISTS player_props (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT,

  -- References
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  player_name TEXT NOT NULL,
  team TEXT,

  -- Prop Details
  sport TEXT NOT NULL,
  prop_type TEXT NOT NULL, -- passing_yards, rushing_yards, points, rebounds, etc.
  market TEXT, -- Full market description
  category TEXT, -- passing, rushing, receiving, scoring, defense, etc.

  -- Line
  line DECIMAL(10,2), -- The line value (e.g., 250.5 yards)
  over_odds INTEGER, -- American odds
  under_odds INTEGER,

  -- Sportsbook
  sportsbook TEXT, -- draftkings, fanduel, betmgm, etc.

  -- Analysis
  recommendation TEXT, -- over, under, pass
  confidence DECIMAL(5,2), -- 0-100
  edge DECIMAL(5,2), -- Expected value percentage
  analysis JSONB, -- Detailed analysis reasoning

  -- Historical Context
  player_avg DECIMAL(10,2),
  last_5_games_avg DECIMAL(10,2),
  vs_opponent_avg DECIMAL(10,2),

  -- Result
  actual_result DECIMAL(10,2),
  outcome TEXT, -- won, lost, push, pending

  -- Status
  status TEXT DEFAULT 'active', -- active, settled, void
  valid_until TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Props (alternative totals, etc.)
CREATE TABLE IF NOT EXISTS team_props (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT,

  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  team TEXT NOT NULL,
  sport TEXT NOT NULL,

  prop_type TEXT NOT NULL, -- team_total, alt_spread, alt_total, etc.
  market TEXT,

  line DECIMAL(10,2),
  odds INTEGER,

  sportsbook TEXT,

  recommendation TEXT,
  confidence DECIMAL(5,2),
  edge DECIMAL(5,2),
  analysis JSONB,

  actual_result DECIMAL(10,2),
  outcome TEXT,
  status TEXT DEFAULT 'active',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INJURIES & HEALTH
-- ============================================================================

CREATE TABLE IF NOT EXISTS injuries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  team TEXT NOT NULL,
  sport TEXT NOT NULL,

  position TEXT,
  injury_status TEXT NOT NULL, -- out, doubtful, questionable, probable, day-to-day, IR
  injury_description TEXT,
  body_part TEXT, -- knee, ankle, shoulder, etc.

  severity INTEGER, -- 1-10 scale
  estimated_return_date DATE,

  date_reported TIMESTAMPTZ DEFAULT NOW(),
  date_updated TIMESTAMPTZ DEFAULT NOW(),
  date_resolved TIMESTAMPTZ,

  impact_analysis JSONB, -- How this affects team/props

  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HISTORICAL DATA & STATS
-- ============================================================================

-- Player Game Stats - Historical performance
CREATE TABLE IF NOT EXISTS player_game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,

  player_name TEXT NOT NULL,
  team TEXT NOT NULL,
  opponent TEXT,
  sport TEXT NOT NULL,

  game_date TIMESTAMPTZ NOT NULL,
  season INTEGER,
  week INTEGER,

  -- Generic Stats (stored as JSONB for flexibility)
  stats JSONB NOT NULL, -- {passing_yards: 300, touchdowns: 3, etc.}

  -- Key Metrics
  minutes_played INTEGER,
  started BOOLEAN,

  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Game Stats - Historical team performance
CREATE TABLE IF NOT EXISTS team_game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,

  team_name TEXT NOT NULL,
  opponent TEXT NOT NULL,
  sport TEXT NOT NULL,

  game_date TIMESTAMPTZ NOT NULL,
  season INTEGER,
  week INTEGER,

  home_away TEXT, -- home, away
  won BOOLEAN,
  score INTEGER,
  opponent_score INTEGER,

  stats JSONB, -- Team stats (total yards, turnovers, etc.)

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ODDS & LINES TRACKING
-- ============================================================================

-- Historical Odds - Track odds changes over time
CREATE TABLE IF NOT EXISTS historical_odds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  game_id UUID REFERENCES games(id) ON DELETE CASCADE,

  sportsbook TEXT NOT NULL,
  market_type TEXT NOT NULL, -- moneyline, spread, total

  odds_data JSONB NOT NULL, -- Complete odds snapshot

  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Line History - Track line movements
CREATE TABLE IF NOT EXISTS line_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  game_id UUID REFERENCES games(id) ON DELETE CASCADE,

  sportsbook TEXT NOT NULL,
  market_type TEXT NOT NULL, -- spread, total, moneyline

  previous_line DECIMAL(10,2),
  new_line DECIMAL(10,2),
  line_move DECIMAL(10,2), -- Change amount

  previous_odds INTEGER,
  new_odds INTEGER,

  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PREDICTIONS & ACCURACY TRACKING
-- ============================================================================

-- Prediction History - Track all predictions
CREATE TABLE IF NOT EXISTS prediction_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  game_id UUID REFERENCES games(id) ON DELETE CASCADE,

  sport TEXT NOT NULL,
  game_date TIMESTAMPTZ,
  home_team TEXT,
  away_team TEXT,

  -- Prediction
  prediction_type TEXT NOT NULL, -- game_winner, spread, total, prop
  predicted_outcome JSONB NOT NULL, -- What we predicted
  confidence DECIMAL(5,2),

  -- Actual Result
  actual_outcome JSONB, -- What actually happened
  result TEXT, -- win, loss, push, pending

  -- Analysis
  analyzer_version TEXT, -- Which analyzer made this prediction
  analysis_data JSONB, -- Full analysis context

  -- Metadata
  predicted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accuracy Metrics - Aggregated accuracy stats
CREATE TABLE IF NOT EXISTS accuracy_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  sport TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- overall, by_confidence, by_market, etc.
  time_period TEXT NOT NULL, -- daily, weekly, monthly, season, all_time

  date_start TIMESTAMPTZ,
  date_end TIMESTAMPTZ,

  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5,2),

  roi DECIMAL(10,2), -- Return on investment
  units_won DECIMAL(10,2),

  breakdown JSONB, -- Detailed breakdown by various factors

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AI LEARNING & PATTERNS
-- ============================================================================

-- Learning Patterns - Store discovered patterns for ML
CREATE TABLE IF NOT EXISTS learning_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  sport TEXT NOT NULL,
  pattern_type TEXT NOT NULL, -- weather_impact, home_advantage, rest_days, etc.

  pattern_name TEXT NOT NULL,
  description TEXT,

  -- Pattern Data
  conditions JSONB NOT NULL, -- Conditions when pattern applies
  impact_factor DECIMAL(5,2), -- How much this affects outcome
  confidence DECIMAL(5,2),

  -- Performance
  times_observed INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2),

  -- Status
  active BOOLEAN DEFAULT true,

  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Data - Store outcomes for ML training
CREATE TABLE IF NOT EXISTS training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  game_id UUID REFERENCES games(id) ON DELETE CASCADE,

  sport TEXT NOT NULL,

  -- Features
  features JSONB NOT NULL, -- All input features for ML model

  -- Labels
  outcome JSONB NOT NULL, -- Actual outcome (what we're training on)

  -- Metadata
  season INTEGER,
  week INTEGER,
  game_date TIMESTAMPTZ,

  used_in_training BOOLEAN DEFAULT false,
  training_set TEXT, -- train, validation, test

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CACHE & PERFORMANCE
-- ============================================================================

-- Analysis Cache - Cache expensive analysis results
CREATE TABLE IF NOT EXISTS analysis_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  cache_key TEXT UNIQUE NOT NULL,
  cache_type TEXT NOT NULL, -- game_analysis, props_analysis, odds_fetch

  sport TEXT,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,

  data JSONB NOT NULL,

  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

-- User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,

  role TEXT DEFAULT 'user', -- user, premium, admin, dev

  -- Preferences
  favorite_sports TEXT[],
  favorite_teams TEXT[],
  notification_settings JSONB,

  -- Stats
  predictions_made INTEGER DEFAULT 0,
  predictions_correct INTEGER DEFAULT 0,

  -- Subscription
  subscription_tier TEXT DEFAULT 'free', -- free, premium, pro
  subscription_expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Predictions - Track user's own predictions
CREATE TABLE IF NOT EXISTS user_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,

  prediction JSONB NOT NULL,
  confidence DECIMAL(5,2),

  result TEXT, -- win, loss, push, pending

  created_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Teams indexes
CREATE INDEX idx_teams_sport ON teams(sport);
CREATE INDEX idx_teams_active ON teams(active);

-- Players indexes
CREATE INDEX idx_players_team ON players(team);
CREATE INDEX idx_players_sport ON players(sport);
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_players_team_id ON players(team_id);

-- Games indexes
CREATE INDEX idx_games_sport ON games(sport);
CREATE INDEX idx_games_date ON games(game_date);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_season ON games(season);
CREATE INDEX idx_games_week ON games(week);
CREATE INDEX idx_games_home_team ON games(home_team);
CREATE INDEX idx_games_away_team ON games(away_team);
CREATE INDEX idx_games_external_id ON games(external_id);

-- Player Props indexes
CREATE INDEX idx_player_props_game_id ON player_props(game_id);
CREATE INDEX idx_player_props_player_id ON player_props(player_id);
CREATE INDEX idx_player_props_sport ON player_props(sport);
CREATE INDEX idx_player_props_sportsbook ON player_props(sportsbook);
CREATE INDEX idx_player_props_confidence ON player_props(confidence DESC);
CREATE INDEX idx_player_props_status ON player_props(status);

-- Team Props indexes
CREATE INDEX idx_team_props_game_id ON team_props(game_id);
CREATE INDEX idx_team_props_sport ON team_props(sport);
CREATE INDEX idx_team_props_sportsbook ON team_props(sportsbook);

-- Injuries indexes
CREATE INDEX idx_injuries_player_id ON injuries(player_id);
CREATE INDEX idx_injuries_team ON injuries(team);
CREATE INDEX idx_injuries_sport ON injuries(sport);
CREATE INDEX idx_injuries_status ON injuries(injury_status);
CREATE INDEX idx_injuries_updated ON injuries(date_updated DESC);

-- Player Game Stats indexes
CREATE INDEX idx_player_stats_player_id ON player_game_stats(player_id);
CREATE INDEX idx_player_stats_game_id ON player_game_stats(game_id);
CREATE INDEX idx_player_stats_date ON player_game_stats(game_date DESC);
CREATE INDEX idx_player_stats_sport ON player_game_stats(sport);

-- Historical Odds indexes
CREATE INDEX idx_historical_odds_game_id ON historical_odds(game_id);
CREATE INDEX idx_historical_odds_timestamp ON historical_odds(timestamp DESC);
CREATE INDEX idx_historical_odds_sportsbook ON historical_odds(sportsbook);

-- Prediction History indexes
CREATE INDEX idx_prediction_history_game_id ON prediction_history(game_id);
CREATE INDEX idx_prediction_history_sport ON prediction_history(sport);
CREATE INDEX idx_prediction_history_result ON prediction_history(result);
CREATE INDEX idx_prediction_history_predicted_at ON prediction_history(predicted_at DESC);

-- Analysis Cache indexes
CREATE INDEX idx_analysis_cache_key ON analysis_cache(cache_key);
CREATE INDEX idx_analysis_cache_expires ON analysis_cache(expires_at);
CREATE INDEX idx_analysis_cache_game_id ON analysis_cache(game_id);

-- Learning Patterns indexes
CREATE INDEX idx_learning_patterns_sport ON learning_patterns(sport);
CREATE INDEX idx_learning_patterns_active ON learning_patterns(active);
CREATE INDEX idx_learning_patterns_accuracy ON learning_patterns(accuracy DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on user tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_predictions ENABLE ROW LEVEL SECURITY;

-- User profiles: users can only read/update their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- User predictions: users can only manage their own predictions
CREATE POLICY "Users can view their own predictions"
  ON user_predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions"
  ON user_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public read access for core tables (games, teams, players, props, injuries)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_props ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_props ENABLE ROW LEVEL SECURITY;
ALTER TABLE injuries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Anyone can view players" ON players FOR SELECT USING (true);
CREATE POLICY "Anyone can view games" ON games FOR SELECT USING (true);
CREATE POLICY "Anyone can view player props" ON player_props FOR SELECT USING (true);
CREATE POLICY "Anyone can view team props" ON team_props FOR SELECT USING (true);
CREATE POLICY "Anyone can view injuries" ON injuries FOR SELECT USING (true);

-- Admin/service role can write to all tables
-- (Service role bypasses RLS automatically)

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_injuries_updated_at BEFORE UPDATE ON injuries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA / SEED
-- ============================================================================

-- You can add seed data here for teams, etc.
-- We'll create separate seed files for this

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
