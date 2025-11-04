-- =====================================================
-- PROPHETBET SUPABASE DATABASE SCHEMA
-- Migrated from Base44 - 19 Core Entities
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- =====================================================
-- AUTHENTICATION & USERS
-- =====================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'developer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CORE GAME & SCHEDULE ENTITIES
-- =====================================================

-- Main games table with matchups, scores, analysis results, predictions
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Game Identification
    sport TEXT NOT NULL CHECK (sport IN ('NFL', 'CFB', 'NBA', 'MLB', 'UFC', 'GOLF')),
    game_id TEXT, -- External API game ID
    event_id TEXT,

    -- Teams/Participants
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_team_abbreviation TEXT,
    away_team_abbreviation TEXT,

    -- Schedule Information
    game_date TIMESTAMPTZ NOT NULL,
    game_time TEXT,
    week INTEGER,
    season INTEGER,
    season_type TEXT, -- 'regular', 'playoff', 'preseason'
    venue TEXT,

    -- Scores
    home_score INTEGER,
    away_score INTEGER,
    final_score JSONB, -- {home: number, away: number, quarters: []}

    -- Game Status
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'final', 'postponed', 'cancelled')),
    completed BOOLEAN DEFAULT FALSE,

    -- Odds & Betting Lines
    home_spread NUMERIC,
    away_spread NUMERIC,
    total_over_under NUMERIC,
    home_ml INTEGER, -- Money line
    away_ml INTEGER,
    odds_last_updated TIMESTAMPTZ,

    -- Analysis Results
    analysis_data JSONB, -- Full analysis from analyzer 10000+
    prediction JSONB, -- {winner: string, confidence: number, predicted_score: {home: number, away: number}}
    analyzer_version TEXT, -- 'v10000plus', 'v10000', 'v3', etc.
    analyzer_confidence NUMERIC, -- 0-100
    analyzer_insights TEXT[],

    -- Advanced Analytics
    weather_data JSONB,
    injury_impact_score NUMERIC,
    matchup_rating NUMERIC,

    -- Props Analysis
    has_props BOOLEAN DEFAULT FALSE,
    props_analyzed BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    analyzed_at TIMESTAMPTZ,

    -- Indexes for common queries
    CONSTRAINT unique_game_per_sport UNIQUE(sport, game_id, game_date)
);

-- Historical games for training data
CREATE TABLE public.historical_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    sport TEXT NOT NULL,
    game_id TEXT,

    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,

    game_date TIMESTAMPTZ NOT NULL,
    season INTEGER,
    week INTEGER,

    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,

    -- Historical betting data
    opening_spread NUMERIC,
    closing_spread NUMERIC,
    opening_total NUMERIC,
    closing_total NUMERIC,

    -- Stats used for training
    team_stats JSONB,
    player_stats JSONB,

    -- Labels for ML training
    spread_result TEXT, -- 'home_covered', 'away_covered', 'push'
    total_result TEXT, -- 'over', 'under', 'push'

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historical odds data for training
CREATE TABLE public.historical_odds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    sport TEXT NOT NULL,

    sportsbook TEXT NOT NULL, -- 'draftkings', 'fanduel', 'betmgm', etc.

    -- Odds data
    home_spread NUMERIC,
    away_spread NUMERIC,
    total NUMERIC,
    home_ml INTEGER,
    away_ml INTEGER,

    -- Timestamp
    fetched_at TIMESTAMPTZ DEFAULT NOW(),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team season statistics
CREATE TABLE public.team_season_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    sport TEXT NOT NULL,
    team_name TEXT NOT NULL,
    season INTEGER NOT NULL,

    -- Record
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,

    -- Offensive stats (sport-specific, stored as JSONB for flexibility)
    offensive_stats JSONB,

    -- Defensive stats
    defensive_stats JSONB,

    -- Advanced metrics
    points_per_game NUMERIC,
    points_allowed_per_game NUMERIC,
    power_ranking INTEGER,
    elo_rating NUMERIC,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_team_season UNIQUE(sport, team_name, season)
);

-- =====================================================
-- PLAYER & ROSTER ENTITIES
-- =====================================================

-- Player roster information
CREATE TABLE public.players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Player Identity
    player_id TEXT, -- External API player ID
    name TEXT NOT NULL,
    sport TEXT NOT NULL,

    -- Team Info
    team TEXT NOT NULL,
    team_abbreviation TEXT,

    -- Position & Info
    position TEXT,
    jersey_number INTEGER,

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'injured', 'suspended')),

    -- Player Details (sport-specific)
    player_data JSONB, -- {height, weight, college, experience, etc.}

    -- Stats
    season_stats JSONB,
    career_stats JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_player UNIQUE(sport, player_id)
);

-- Injury reports and status
CREATE TABLE public.injuries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    sport TEXT NOT NULL,

    -- Player Info (denormalized for quick access)
    player_name TEXT NOT NULL,
    team TEXT NOT NULL,
    position TEXT,

    -- Injury Details
    injury_status TEXT CHECK (injury_status IN ('out', 'doubtful', 'questionable', 'probable')),
    injury_description TEXT,
    body_part TEXT, -- 'knee', 'ankle', 'shoulder', etc.

    -- Impact
    games_missed INTEGER DEFAULT 0,
    estimated_return_date TIMESTAMPTZ,

    -- Metadata
    reported_date TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_date TIMESTAMPTZ
);

-- =====================================================
-- PROPS & BETTING ENTITIES
-- =====================================================

-- Player proposition bets
CREATE TABLE public.player_props (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,

    -- Prop Details
    sport TEXT NOT NULL,
    player_name TEXT NOT NULL,
    team TEXT NOT NULL,

    -- Prop Type & Line
    prop_type TEXT NOT NULL, -- 'passing_yards', 'rushing_yards', 'receiving_yards', 'touchdowns', etc.
    line NUMERIC NOT NULL,

    -- Odds
    over_odds INTEGER,
    under_odds INTEGER,

    -- Sportsbook
    sportsbook TEXT, -- 'draftkings', 'fanduel', etc.

    -- Analysis
    recommendation TEXT CHECK (recommendation IN ('over', 'under', 'no_bet')),
    confidence NUMERIC, -- 0-100
    analysis JSONB, -- Full analysis data

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    analyzed_at TIMESTAMPTZ
);

-- Team proposition bets
CREATE TABLE public.team_props (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    game_id UUID REFERENCES games(id) ON DELETE CASCADE,

    -- Prop Details
    sport TEXT NOT NULL,
    team TEXT NOT NULL,

    -- Prop Type & Line
    prop_type TEXT NOT NULL, -- 'total_points', 'first_half_points', 'turnovers', etc.
    line NUMERIC NOT NULL,

    -- Odds
    over_odds INTEGER,
    under_odds INTEGER,

    -- Sportsbook
    sportsbook TEXT,

    -- Analysis
    recommendation TEXT CHECK (recommendation IN ('over', 'under', 'no_bet')),
    confidence NUMERIC,
    analysis JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    analyzed_at TIMESTAMPTZ
);

-- Game-level props
CREATE TABLE public.game_props (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    game_id UUID REFERENCES games(id) ON DELETE CASCADE,

    sport TEXT NOT NULL,

    -- Prop Type & Details
    prop_type TEXT NOT NULL, -- 'first_score', 'winning_margin', 'total_touchdowns', etc.
    description TEXT,

    -- Options & Odds (for multi-option props)
    options JSONB, -- [{option: "field_goal", odds: -110}, {option: "touchdown", odds: +150}]

    -- Sportsbook
    sportsbook TEXT,

    -- Analysis
    recommendation TEXT,
    confidence NUMERIC,
    analysis JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analyzed/scored props (output from analyzer)
CREATE TABLE public.analyzer_props (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    game_id UUID REFERENCES games(id) ON DELETE CASCADE,

    -- Prop Reference (can be player, team, or game prop)
    prop_type TEXT NOT NULL, -- 'player', 'team', 'game'
    prop_id UUID, -- Reference to specific prop

    sport TEXT NOT NULL,

    -- Prop Details
    description TEXT NOT NULL,
    line NUMERIC,

    -- Analysis Results
    score NUMERIC, -- Analyzer score (0-100)
    recommendation TEXT,
    confidence NUMERIC,
    edge NUMERIC, -- Expected value edge

    -- Supporting Data
    analysis_data JSONB,
    factors JSONB, -- Key factors influencing the recommendation

    -- Risk Assessment
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prop analysis engine results
CREATE TABLE public.prop_analyzer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    sport TEXT NOT NULL,
    date DATE NOT NULL,

    -- Analysis Run
    run_id TEXT, -- Unique ID for this analysis run
    analyzer_version TEXT,

    -- Top Props
    top_props JSONB, -- [{prop_id, score, recommendation}]

    -- Summary Stats
    total_props_analyzed INTEGER,
    high_confidence_props INTEGER,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- =====================================================
-- UFC SPECIFIC
-- =====================================================

-- UFC fight data and history
CREATE TABLE public.ufc_fights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    fight_id TEXT,
    event_name TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,

    -- Fighters
    fighter_1_name TEXT NOT NULL,
    fighter_2_name TEXT NOT NULL,

    -- Fight Details
    weight_class TEXT,
    title_fight BOOLEAN DEFAULT FALSE,
    main_event BOOLEAN DEFAULT FALSE,

    -- Odds
    fighter_1_ml INTEGER,
    fighter_2_ml INTEGER,

    -- Result
    winner TEXT,
    method TEXT, -- 'KO/TKO', 'Submission', 'Decision', etc.
    round INTEGER,
    time TEXT,

    -- Analysis
    analysis_data JSONB,
    prediction JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ALERTS & MONITORING
-- =====================================================

-- Market alerts, line movements, sharp action signals
CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Alert Type
    alert_type TEXT NOT NULL CHECK (alert_type IN ('line_movement', 'sharp_action', 'injury', 'value_bet', 'system')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    -- Alert Details
    sport TEXT,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,

    -- Alert Data
    alert_data JSONB, -- Full alert details

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'expired')),

    -- User Assignment (optional)
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ
);

-- =====================================================
-- AI/ML & PREDICTION TRACKING
-- =====================================================

-- Accuracy metrics per prediction
CREATE TABLE public.prediction_accuracy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    sport TEXT NOT NULL,

    -- Prediction Details
    prediction_type TEXT NOT NULL, -- 'spread', 'moneyline', 'total', 'prop'
    predicted_outcome TEXT,
    actual_outcome TEXT,

    -- Accuracy
    correct BOOLEAN,
    confidence NUMERIC,

    -- Error Metrics
    score_diff_error NUMERIC, -- For score predictions

    -- Analyzer Info
    analyzer_version TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historical prediction records with grading
CREATE TABLE public.prediction_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    sport TEXT NOT NULL,

    -- Game Info (denormalized)
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    game_date TIMESTAMPTZ NOT NULL,

    -- Prediction
    prediction JSONB NOT NULL,
    analyzer_version TEXT,
    confidence NUMERIC,

    -- Actual Result
    actual_result JSONB,

    -- Grading
    graded BOOLEAN DEFAULT FALSE,
    grade JSONB, -- {spread_correct: boolean, total_correct: boolean, ml_correct: boolean, score: number}

    -- Learning
    used_for_training BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    graded_at TIMESTAMPTZ
);

-- Discovered ML patterns
CREATE TABLE public.learning_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    sport TEXT NOT NULL,
    pattern_type TEXT NOT NULL, -- 'trend', 'correlation', 'situational', etc.

    -- Pattern Details
    description TEXT NOT NULL,
    pattern_data JSONB NOT NULL,

    -- Statistics
    sample_size INTEGER,
    success_rate NUMERIC,
    confidence NUMERIC,

    -- Applicability
    conditions JSONB, -- When this pattern applies

    -- Status
    active BOOLEAN DEFAULT TRUE,
    verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used TIMESTAMPTZ
);

-- Training datasets for AI
CREATE TABLE public.training_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    sport TEXT NOT NULL,
    data_type TEXT NOT NULL, -- 'game', 'player', 'team', 'prop', etc.

    -- Training Data
    features JSONB NOT NULL, -- Input features
    labels JSONB NOT NULL, -- Output labels

    -- Metadata
    season INTEGER,
    week INTEGER,

    -- Quality
    data_quality_score NUMERIC,
    validated BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ML model configurations
CREATE TABLE public.analyzer_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    model_name TEXT NOT NULL UNIQUE,
    model_version TEXT NOT NULL,
    sport TEXT,

    -- Model Config
    config JSONB NOT NULL,
    hyperparameters JSONB,

    -- Performance
    accuracy NUMERIC,
    f1_score NUMERIC,

    -- Status
    active BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    trained_at TIMESTAMPTZ,

    CONSTRAINT unique_model_version UNIQUE(model_name, model_version)
);

-- ML model weights and parameters
CREATE TABLE public.analyzer_weights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    model_id UUID REFERENCES analyzer_models(id) ON DELETE CASCADE,

    -- Weights
    weights JSONB NOT NULL,

    -- Version Control
    version INTEGER NOT NULL DEFAULT 1,

    -- Performance on Validation
    validation_accuracy NUMERIC,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Games indexes
CREATE INDEX idx_games_sport ON games(sport);
CREATE INDEX idx_games_date ON games(game_date);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_sport_date ON games(sport, game_date);
CREATE INDEX idx_games_week_season ON games(week, season);
CREATE INDEX idx_games_completed ON games(completed) WHERE completed = FALSE;

-- Historical games indexes
CREATE INDEX idx_historical_games_sport ON historical_games(sport);
CREATE INDEX idx_historical_games_date ON historical_games(game_date);
CREATE INDEX idx_historical_games_season ON historical_games(season);

-- Historical odds indexes
CREATE INDEX idx_historical_odds_game ON historical_odds(game_id);
CREATE INDEX idx_historical_odds_sportsbook ON historical_odds(sportsbook);

-- Players indexes
CREATE INDEX idx_players_sport ON players(sport);
CREATE INDEX idx_players_team ON players(team);
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_players_name ON players USING gin(name gin_trgm_ops);

-- Injuries indexes
CREATE INDEX idx_injuries_player ON injuries(player_id);
CREATE INDEX idx_injuries_team ON injuries(team);
CREATE INDEX idx_injuries_status ON injuries(injury_status);
CREATE INDEX idx_injuries_resolved ON injuries(resolved) WHERE resolved = FALSE;

-- Player props indexes
CREATE INDEX idx_player_props_game ON player_props(game_id);
CREATE INDEX idx_player_props_player ON player_props(player_id);
CREATE INDEX idx_player_props_type ON player_props(prop_type);
CREATE INDEX idx_player_props_sportsbook ON player_props(sportsbook);

-- Team props indexes
CREATE INDEX idx_team_props_game ON team_props(game_id);
CREATE INDEX idx_team_props_team ON team_props(team);
CREATE INDEX idx_team_props_type ON team_props(prop_type);

-- Analyzer props indexes
CREATE INDEX idx_analyzer_props_game ON analyzer_props(game_id);
CREATE INDEX idx_analyzer_props_score ON analyzer_props(score DESC);
CREATE INDEX idx_analyzer_props_confidence ON analyzer_props(confidence DESC);

-- Alerts indexes
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_game ON alerts(game_id);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

-- Prediction history indexes
CREATE INDEX idx_prediction_history_game ON prediction_history(game_id);
CREATE INDEX idx_prediction_history_sport ON prediction_history(sport);
CREATE INDEX idx_prediction_history_graded ON prediction_history(graded);
CREATE INDEX idx_prediction_history_date ON prediction_history(game_date DESC);

-- Learning patterns indexes
CREATE INDEX idx_learning_patterns_sport ON learning_patterns(sport);
CREATE INDEX idx_learning_patterns_type ON learning_patterns(pattern_type);
CREATE INDEX idx_learning_patterns_active ON learning_patterns(active) WHERE active = TRUE;

-- Training data indexes
CREATE INDEX idx_training_data_sport ON training_data(sport);
CREATE INDEX idx_training_data_type ON training_data(data_type);
CREATE INDEX idx_training_data_season ON training_data(season);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_odds ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_season_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE injuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_props ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_props ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_props ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyzer_props ENABLE ROW LEVEL SECURITY;
ALTER TABLE prop_analyzer ENABLE ROW LEVEL SECURITY;
ALTER TABLE ufc_fights ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_accuracy ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyzer_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyzer_weights ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Games Policies (Public Read, Admin Write)
CREATE POLICY "Anyone can view games"
    ON games FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert games"
    ON games FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'developer')
        )
    );

CREATE POLICY "Admins can update games"
    ON games FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'developer')
        )
    );

CREATE POLICY "Admins can delete games"
    ON games FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'developer')
        )
    );

-- Similar policies for other public read tables
CREATE POLICY "Anyone can view historical_games" ON historical_games FOR SELECT USING (true);
CREATE POLICY "Anyone can view historical_odds" ON historical_odds FOR SELECT USING (true);
CREATE POLICY "Anyone can view team_season_stats" ON team_season_stats FOR SELECT USING (true);
CREATE POLICY "Anyone can view players" ON players FOR SELECT USING (true);
CREATE POLICY "Anyone can view injuries" ON injuries FOR SELECT USING (true);
CREATE POLICY "Anyone can view player_props" ON player_props FOR SELECT USING (true);
CREATE POLICY "Anyone can view team_props" ON team_props FOR SELECT USING (true);
CREATE POLICY "Anyone can view game_props" ON game_props FOR SELECT USING (true);
CREATE POLICY "Anyone can view analyzer_props" ON analyzer_props FOR SELECT USING (true);
CREATE POLICY "Anyone can view prop_analyzer" ON prop_analyzer FOR SELECT USING (true);
CREATE POLICY "Anyone can view ufc_fights" ON ufc_fights FOR SELECT USING (true);
CREATE POLICY "Anyone can view prediction_history" ON prediction_history FOR SELECT USING (true);
CREATE POLICY "Anyone can view learning_patterns" ON learning_patterns FOR SELECT USING (true);

-- Alerts Policies (User-specific)
CREATE POLICY "Users can view their own alerts"
    ON alerts FOR SELECT
    USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Admins can create alerts"
    ON alerts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'developer')
        )
    );

-- Prediction Accuracy/History (Admin/Developer Only for Write)
CREATE POLICY "Admins can manage prediction_accuracy"
    ON prediction_accuracy FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'developer')
        )
    );

CREATE POLICY "Admins can manage prediction_history"
    ON prediction_history FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'developer')
        )
    );

-- Training Data & Models (Developer Only)
CREATE POLICY "Developers can manage training_data"
    ON training_data FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'developer'
        )
    );

CREATE POLICY "Anyone can view analyzer_models" ON analyzer_models FOR SELECT USING (true);
CREATE POLICY "Developers can manage analyzer_models"
    ON analyzer_models FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'developer'
        )
    );

CREATE POLICY "Developers can manage analyzer_weights"
    ON analyzer_weights FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'developer'
        )
    );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_season_stats_updated_at BEFORE UPDATE ON team_season_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_injuries_updated_at BEFORE UPDATE ON injuries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ufc_fights_updated_at BEFORE UPDATE ON ufc_fights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER VIEWS
-- =====================================================

-- View for active games with props
CREATE VIEW active_games_with_props AS
SELECT
    g.*,
    COUNT(DISTINCT pp.id) as player_props_count,
    COUNT(DISTINCT tp.id) as team_props_count
FROM games g
LEFT JOIN player_props pp ON g.id = pp.game_id
LEFT JOIN team_props tp ON g.id = tp.game_id
WHERE g.status IN ('scheduled', 'in_progress')
GROUP BY g.id;

-- View for top analyzer props
CREATE VIEW top_analyzer_props AS
SELECT
    ap.*,
    g.home_team,
    g.away_team,
    g.game_date
FROM analyzer_props ap
JOIN games g ON ap.game_id = g.id
WHERE ap.confidence >= 70
ORDER BY ap.score DESC, ap.confidence DESC;

-- View for prediction accuracy summary
CREATE VIEW prediction_accuracy_summary AS
SELECT
    sport,
    analyzer_version,
    COUNT(*) as total_predictions,
    COUNT(*) FILTER (WHERE correct = true) as correct_predictions,
    ROUND((COUNT(*) FILTER (WHERE correct = true)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2) as accuracy_percentage,
    AVG(confidence) as avg_confidence
FROM prediction_accuracy
GROUP BY sport, analyzer_version;
