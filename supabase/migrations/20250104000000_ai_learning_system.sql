-- =====================================================
-- AI LEARNING SYSTEM - COMPLETE DATABASE SCHEMA
-- ProphetBetsAI Machine Learning Infrastructure
-- =====================================================

-- 1. HISTORICAL GAMES (2020-2024)
-- Complete game data with all stats for training
CREATE TABLE IF NOT EXISTS historical_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  sport TEXT NOT NULL,
  season INTEGER NOT NULL,
  week INTEGER,
  game_date TIMESTAMPTZ NOT NULL,

  -- Teams
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  winner TEXT,

  -- Pre-game odds
  home_moneyline INTEGER,
  away_moneyline INTEGER,
  spread DECIMAL(4,1),
  spread_odds INTEGER,
  total DECIMAL(4,1),
  over_odds INTEGER,
  under_odds INTEGER,

  -- Line movements (stored as JSONB array)
  line_movements JSONB DEFAULT '[]'::jsonb,

  -- Team stats (pre-game)
  home_team_stats JSONB DEFAULT '{}'::jsonb,
  away_team_stats JSONB DEFAULT '{}'::jsonb,

  -- Advanced metrics
  home_offensive_rating DECIMAL(5,2),
  away_offensive_rating DECIMAL(5,2),
  home_defensive_rating DECIMAL(5,2),
  away_defensive_rating DECIMAL(5,2),
  pace_projection DECIMAL(5,2),

  -- Injuries
  home_injuries JSONB DEFAULT '[]'::jsonb,
  away_injuries JSONB DEFAULT '[]'::jsonb,
  injury_impact_score DECIMAL(5,2),

  -- Weather (for outdoor sports)
  weather JSONB DEFAULT '{}'::jsonb,

  -- Rest and travel
  home_days_rest INTEGER,
  away_days_rest INTEGER,
  away_travel_distance INTEGER,

  -- Situational factors
  home_win_streak INTEGER DEFAULT 0,
  away_win_streak INTEGER DEFAULT 0,
  rivalry_game BOOLEAN DEFAULT false,
  playoff_implications BOOLEAN DEFAULT false,

  -- Metadata
  data_quality_score DECIMAL(3,2) DEFAULT 1.0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_historical_games_sport_date ON historical_games(sport, game_date);
CREATE INDEX idx_historical_games_season ON historical_games(season, sport);
CREATE INDEX idx_historical_games_teams ON historical_games(home_team, away_team);
CREATE INDEX idx_historical_games_external_id ON historical_games(external_id);

-- 2. HISTORICAL PREDICTIONS
-- All predictions made by the system (for backtesting)
CREATE TABLE IF NOT EXISTS historical_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES historical_games(id) ON DELETE CASCADE,
  model_version_id UUID, -- References model_versions

  -- Prediction details
  prediction_type TEXT NOT NULL, -- 'moneyline', 'spread', 'total', 'player_prop'
  prediction TEXT NOT NULL, -- e.g., 'home', 'away', 'over', 'under'
  confidence_score DECIMAL(5,2) NOT NULL, -- 0-100
  predicted_value TEXT, -- For props/spreads

  -- Supporting data
  key_factors JSONB DEFAULT '[]'::jsonb,
  the_edge TEXT,
  reasoning TEXT,

  -- Odds at time of prediction
  odds_at_prediction INTEGER,
  line_at_prediction DECIMAL(4,1),

  -- Feature importance for this prediction
  feature_weights JSONB DEFAULT '{}'::jsonb,

  -- Result
  actual_result TEXT, -- Filled after game
  was_correct BOOLEAN, -- Filled after game
  profit_loss DECIMAL(8,2), -- Based on standard $100 bet

  -- Metadata
  predicted_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_historical_predictions_game ON historical_predictions(game_id);
CREATE INDEX idx_historical_predictions_model ON historical_predictions(model_version_id);
CREATE INDEX idx_historical_predictions_type ON historical_predictions(prediction_type);
CREATE INDEX idx_historical_predictions_date ON historical_predictions(predicted_at);

-- 3. MODEL VERSIONS
-- Track different iterations of the AI model
CREATE TABLE IF NOT EXISTS model_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_name TEXT UNIQUE NOT NULL, -- e.g., 'v1.0.0', 'defensive-focus-v2'
  version_number INTEGER NOT NULL,

  -- Model architecture
  architecture TEXT NOT NULL, -- 'neural_network', 'ensemble', 'gradient_boost'
  hyperparameters JSONB DEFAULT '{}'::jsonb,

  -- Training details
  training_data_start DATE,
  training_data_end DATE,
  total_training_samples INTEGER,
  training_duration_seconds INTEGER,

  -- Performance metrics
  overall_accuracy DECIMAL(5,2),
  moneyline_accuracy DECIMAL(5,2),
  spread_accuracy DECIMAL(5,2),
  total_accuracy DECIMAL(5,2),
  prop_accuracy DECIMAL(5,2),
  roi DECIMAL(6,2), -- Return on investment
  sharpe_ratio DECIMAL(6,3),

  -- Specialized strengths
  defensive_prop_accuracy DECIMAL(5,2),
  injury_impact_accuracy DECIMAL(5,2),
  line_movement_accuracy DECIMAL(5,2),

  -- Status
  status TEXT DEFAULT 'training', -- 'training', 'testing', 'active', 'retired'
  is_production BOOLEAN DEFAULT false,

  -- Metadata
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deployed_at TIMESTAMPTZ,
  retired_at TIMESTAMPTZ
);

CREATE INDEX idx_model_versions_status ON model_versions(status);
CREATE INDEX idx_model_versions_production ON model_versions(is_production);

-- 4. MODEL WEIGHTS
-- Store trained model parameters (can be large)
CREATE TABLE IF NOT EXISTS model_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id UUID REFERENCES model_versions(id) ON DELETE CASCADE,

  -- Weight storage
  weights_format TEXT NOT NULL, -- 'tensorflowjs', 'json', 'binary'
  weights_data JSONB, -- For smaller models
  weights_url TEXT, -- For larger models stored in cloud storage
  weights_size_bytes BIGINT,

  -- Layer information
  layer_config JSONB DEFAULT '{}'::jsonb,
  input_shape JSONB,
  output_shape JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_model_weights_version ON model_weights(model_version_id);

-- 5. TRAINING SESSIONS
-- Track individual training runs
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id UUID REFERENCES model_versions(id) ON DELETE CASCADE,

  -- Session details
  session_type TEXT NOT NULL, -- 'initial', 'incremental', 'retraining', 'fine_tuning'
  sport TEXT, -- If training sport-specific model

  -- Data used
  training_samples INTEGER,
  validation_samples INTEGER,
  test_samples INTEGER,
  data_date_range JSONB, -- {start: '2020-01-01', end: '2024-12-31'}

  -- Training configuration
  epochs INTEGER,
  batch_size INTEGER,
  learning_rate DECIMAL(10,8),
  early_stopping BOOLEAN,

  -- Progress tracking
  current_epoch INTEGER,
  status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed', 'stopped'

  -- Performance per epoch (stored as array)
  epoch_metrics JSONB DEFAULT '[]'::jsonb,

  -- Final results
  final_loss DECIMAL(10,6),
  final_accuracy DECIMAL(5,2),
  validation_accuracy DECIMAL(5,2),
  test_accuracy DECIMAL(5,2),

  -- Time tracking
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Logs
  training_log TEXT,
  error_message TEXT
);

CREATE INDEX idx_training_sessions_model ON training_sessions(model_version_id);
CREATE INDEX idx_training_sessions_status ON training_sessions(status);
CREATE INDEX idx_training_sessions_date ON training_sessions(started_at);

-- 6. FEATURE IMPORTANCE
-- Track which features matter most
CREATE TABLE IF NOT EXISTS feature_importance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id UUID REFERENCES model_versions(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,

  -- Feature details
  feature_name TEXT NOT NULL,
  feature_category TEXT, -- 'team_stats', 'injury', 'line_movement', 'weather', etc.
  importance_score DECIMAL(5,4) NOT NULL, -- 0-1
  importance_rank INTEGER,

  -- Correlation analysis
  positive_correlation BOOLEAN,
  correlation_strength DECIMAL(4,3),

  -- Examples where feature was decisive
  key_games JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  sample_size INTEGER
);

CREATE INDEX idx_feature_importance_model ON feature_importance(model_version_id);
CREATE INDEX idx_feature_importance_sport ON feature_importance(sport);
CREATE INDEX idx_feature_importance_score ON feature_importance(importance_score DESC);

-- 7. LEARNING PATTERNS
-- Discovered patterns that consistently win
CREATE TABLE IF NOT EXISTS learning_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Pattern identification
  pattern_name TEXT NOT NULL,
  pattern_type TEXT NOT NULL, -- 'defensive_prop', 'line_movement', 'injury_impact', 'team_trend'
  sport TEXT NOT NULL,

  -- Pattern definition
  conditions JSONB NOT NULL, -- Rules that define this pattern
  description TEXT,

  -- Performance
  times_detected INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2),
  avg_confidence DECIMAL(5,2),
  total_profit DECIMAL(10,2),
  roi DECIMAL(6,2),

  -- Sample games
  example_games JSONB DEFAULT '[]'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT true,
  confidence_threshold DECIMAL(5,2) DEFAULT 60.0,

  -- Discovery
  discovered_by_model UUID REFERENCES model_versions(id),
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ,

  -- Validation
  validation_status TEXT DEFAULT 'testing', -- 'testing', 'validated', 'rejected'
  validation_sample_size INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_patterns_type ON learning_patterns(pattern_type);
CREATE INDEX idx_learning_patterns_sport ON learning_patterns(sport);
CREATE INDEX idx_learning_patterns_accuracy ON learning_patterns(accuracy_rate DESC);
CREATE INDEX idx_learning_patterns_active ON learning_patterns(is_active);

-- 8. ACCURACY METRICS
-- Time-series tracking of model performance
CREATE TABLE IF NOT EXISTS accuracy_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id UUID REFERENCES model_versions(id) ON DELETE CASCADE,

  -- Time period
  metric_date DATE NOT NULL,
  metric_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  sport TEXT,

  -- Volume
  total_predictions INTEGER DEFAULT 0,

  -- Accuracy by prediction type
  moneyline_correct INTEGER DEFAULT 0,
  moneyline_total INTEGER DEFAULT 0,
  spread_correct INTEGER DEFAULT 0,
  spread_total INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_total INTEGER DEFAULT 0,
  prop_correct INTEGER DEFAULT 0,
  prop_total INTEGER DEFAULT 0,

  -- Financial metrics
  total_profit DECIMAL(10,2) DEFAULT 0,
  total_wagered DECIMAL(10,2) DEFAULT 0,
  roi DECIMAL(6,2),

  -- Confidence bands
  high_confidence_accuracy DECIMAL(5,2), -- 80%+ confidence
  medium_confidence_accuracy DECIMAL(5,2), -- 60-79% confidence
  low_confidence_accuracy DECIMAL(5,2), -- <60% confidence

  -- Specialized metrics
  defensive_props_accuracy DECIMAL(5,2),
  injury_factor_accuracy DECIMAL(5,2),
  line_movement_accuracy DECIMAL(5,2),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accuracy_metrics_model ON accuracy_metrics(model_version_id);
CREATE INDEX idx_accuracy_metrics_date ON accuracy_metrics(metric_date);
CREATE INDEX idx_accuracy_metrics_sport ON accuracy_metrics(sport);

-- 9. LINE MOVEMENT ANALYSIS
-- Track and learn from line movements
CREATE TABLE IF NOT EXISTS line_movement_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES historical_games(id) ON DELETE CASCADE,

  -- Movement details
  market_type TEXT NOT NULL, -- 'spread', 'total', 'moneyline'
  opening_line DECIMAL(6,2),
  closing_line DECIMAL(6,2),
  movement_direction TEXT, -- 'up', 'down', 'stable'
  movement_magnitude DECIMAL(6,2),

  -- Timeline
  movements JSONB DEFAULT '[]'::jsonb, -- Array of {timestamp, line, volume}
  key_moves JSONB DEFAULT '[]'::jsonb, -- Significant moves >1 point

  -- Volume and sharp action
  sharp_money_indicator BOOLEAN DEFAULT false,
  public_percentage INTEGER, -- % of bets on favorite
  money_percentage INTEGER, -- % of money on favorite
  reverse_line_movement BOOLEAN DEFAULT false,

  -- Result
  final_result TEXT,
  covering_side TEXT,
  movement_predicted_correctly BOOLEAN,

  -- Pattern matching
  movement_pattern TEXT, -- 'steam', 'reverse', 'steady_drift', etc.
  matched_patterns JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_line_movement_game ON line_movement_analysis(game_id);
CREATE INDEX idx_line_movement_pattern ON line_movement_analysis(movement_pattern);
CREATE INDEX idx_line_movement_sharp ON line_movement_analysis(sharp_money_indicator);

-- 10. INJURY IMPACT ANALYSIS
-- Learn how injuries affect outcomes
CREATE TABLE IF NOT EXISTS injury_impact_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES historical_games(id) ON DELETE CASCADE,

  -- Injury details
  team TEXT NOT NULL,
  player_name TEXT NOT NULL,
  position TEXT,
  injury_type TEXT,
  injury_severity TEXT, -- 'questionable', 'doubtful', 'out'

  -- Player importance
  player_value_score DECIMAL(5,2), -- 0-10 rating
  minutes_per_game DECIMAL(4,1),
  points_per_game DECIMAL(5,2),
  position_importance TEXT, -- 'starter', 'key_rotation', 'bench'

  -- Impact on game
  predicted_impact DECIMAL(5,2), -- Model prediction of point swing
  actual_point_differential DECIMAL(5,2), -- How team performed vs expectations
  impact_accuracy DECIMAL(5,2),

  -- Market reaction
  line_adjustment DECIMAL(4,1), -- How much line moved
  odds_adjustment INTEGER,
  market_overreaction BOOLEAN,

  -- Outcome
  team_covered BOOLEAN,
  total_covered TEXT, -- 'over', 'under', 'push'
  injury_was_factor BOOLEAN,

  -- Learning
  similar_scenarios JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  reported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_injury_impact_game ON injury_impact_analysis(game_id);
CREATE INDEX idx_injury_impact_team ON injury_impact_analysis(team);
CREATE INDEX idx_injury_impact_severity ON injury_impact_analysis(injury_severity);

-- 11. TEAM TRENDS
-- Long-term team performance patterns
CREATE TABLE IF NOT EXISTS team_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport TEXT NOT NULL,
  season INTEGER NOT NULL,
  team_name TEXT NOT NULL,

  -- Record and performance
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  ties INTEGER DEFAULT 0,

  -- Against the spread (ATS)
  ats_wins INTEGER DEFAULT 0,
  ats_losses INTEGER DEFAULT 0,
  ats_pushes INTEGER DEFAULT 0,
  ats_percentage DECIMAL(5,2),

  -- Totals
  overs INTEGER DEFAULT 0,
  unders INTEGER DEFAULT 0,
  over_percentage DECIMAL(5,2),

  -- Situational trends
  home_record TEXT,
  away_record TEXT,
  division_record TEXT,
  vs_winning_teams TEXT,
  as_favorite TEXT,
  as_underdog TEXT,

  -- Scoring trends
  avg_points_scored DECIMAL(5,2),
  avg_points_allowed DECIMAL(5,2),
  scoring_trend TEXT, -- 'improving', 'declining', 'stable'

  -- Recent form (last 10 games)
  recent_form TEXT, -- e.g., 'W-W-L-W-L'
  recent_ats_form TEXT,
  momentum_score DECIMAL(5,2), -- -10 to +10

  -- Advanced metrics
  offensive_efficiency DECIMAL(5,2),
  defensive_efficiency DECIMAL(5,2),
  pace DECIMAL(5,2),

  -- Betting value
  closing_line_value DECIMAL(5,2), -- How often beat closing line
  market_overvalued BOOLEAN,
  market_undervalued BOOLEAN,

  -- Updates
  last_game_date DATE,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_trends_sport_season ON team_trends(sport, season);
CREATE INDEX idx_team_trends_team ON team_trends(team_name);
CREATE INDEX idx_team_trends_ats ON team_trends(ats_percentage DESC);

-- 12. MODEL COMPARISON
-- Compare different model versions
CREATE TABLE IF NOT EXISTS model_comparison (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Comparison details
  comparison_name TEXT NOT NULL,
  model_a_id UUID REFERENCES model_versions(id),
  model_b_id UUID REFERENCES model_versions(id),

  -- Test parameters
  test_period_start DATE,
  test_period_end DATE,
  total_games INTEGER,

  -- Head-to-head results
  model_a_accuracy DECIMAL(5,2),
  model_b_accuracy DECIMAL(5,2),
  model_a_roi DECIMAL(6,2),
  model_b_roi DECIMAL(6,2),

  -- Agreement analysis
  both_correct INTEGER,
  both_incorrect INTEGER,
  only_a_correct INTEGER,
  only_b_correct INTEGER,
  agreement_rate DECIMAL(5,2),

  -- When they disagree, who wins more
  disagreement_cases INTEGER,
  model_a_wins_disagreements INTEGER,

  -- Recommendation
  winner TEXT, -- 'model_a', 'model_b', 'ensemble'
  recommendation TEXT,

  -- Metadata
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_model_comparison_models ON model_comparison(model_a_id, model_b_id);

-- =====================================================
-- FUNCTIONS FOR AUTOMATIC CALCULATIONS
-- =====================================================

-- Function to calculate accuracy rate
CREATE OR REPLACE FUNCTION calculate_accuracy(correct INTEGER, total INTEGER)
RETURNS DECIMAL(5,2) AS $$
BEGIN
  IF total = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND((correct::DECIMAL / total::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate ROI
CREATE OR REPLACE FUNCTION calculate_roi(profit DECIMAL, wagered DECIMAL)
RETURNS DECIMAL(6,2) AS $$
BEGIN
  IF wagered = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND((profit / wagered) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to update accuracy metrics
CREATE OR REPLACE FUNCTION update_accuracy_on_prediction_verify()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily accuracy metrics when a prediction is verified
  INSERT INTO accuracy_metrics (
    model_version_id,
    metric_date,
    metric_period,
    sport,
    total_predictions
  )
  SELECT
    NEW.model_version_id,
    DATE(NEW.verified_at),
    'daily',
    g.sport,
    1
  FROM historical_games g
  WHERE g.id = NEW.game_id
  ON CONFLICT (model_version_id, metric_date, metric_period, sport)
  DO UPDATE SET
    total_predictions = accuracy_metrics.total_predictions + 1,
    total_correct = accuracy_metrics.total_correct + (CASE WHEN NEW.was_correct THEN 1 ELSE 0 END),
    total_profit = accuracy_metrics.total_profit + COALESCE(NEW.profit_loss, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE historical_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_importance ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE accuracy_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_movement_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE injury_impact_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_comparison ENABLE ROW LEVEL SECURITY;

-- Admin-only write access for learning system tables
CREATE POLICY "Admin full access to learning system" ON historical_games
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to predictions" ON historical_predictions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access to models" ON model_versions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Public read access for active models and metrics
CREATE POLICY "Public read active models" ON model_versions
  FOR SELECT USING (status = 'active');

CREATE POLICY "Public read accuracy metrics" ON accuracy_metrics
  FOR SELECT USING (true);

CREATE POLICY "Public read learning patterns" ON learning_patterns
  FOR SELECT USING (is_active = true);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_historical_games_composite ON historical_games(sport, season, game_date, verified);
CREATE INDEX idx_historical_predictions_accuracy ON historical_predictions(was_correct, confidence_score);
CREATE INDEX idx_training_sessions_completed ON training_sessions(status, completed_at);

-- =====================================================
-- INITIAL DATA / SEED
-- =====================================================

-- Insert first model version
INSERT INTO model_versions (
  version_name,
  version_number,
  architecture,
  status,
  notes,
  created_by
) VALUES (
  'v1.0.0-baseline',
  1,
  'neural_network',
  'training',
  'Initial baseline model for ProphetBetsAI learning system',
  'system'
) ON CONFLICT (version_name) DO NOTHING;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE historical_games IS 'Complete historical game data from 2020-2024 for training';
COMMENT ON TABLE historical_predictions IS 'All predictions made by ML models with results';
COMMENT ON TABLE model_versions IS 'Different iterations and versions of the AI model';
COMMENT ON TABLE model_weights IS 'Trained neural network weights and parameters';
COMMENT ON TABLE training_sessions IS 'Individual training runs and their metrics';
COMMENT ON TABLE feature_importance IS 'Which features matter most for predictions';
COMMENT ON TABLE learning_patterns IS 'Discovered patterns that consistently win';
COMMENT ON TABLE accuracy_metrics IS 'Time-series performance tracking';
COMMENT ON TABLE line_movement_analysis IS 'Learning from betting line movements';
COMMENT ON TABLE injury_impact_analysis IS 'How injuries affect game outcomes';
COMMENT ON TABLE team_trends IS 'Long-term team performance patterns';
COMMENT ON TABLE model_comparison IS 'Head-to-head model performance comparison';
