-- Migration: Create tables for NFL, CFB, MLB, NBA, UFC, and Golf
-- Date: 2025-01-04

-- =====================================================
-- NFL TABLES
-- =====================================================

-- NFL Teams
CREATE TABLE IF NOT EXISTS nfl_teams (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(10),
    city VARCHAR(255),
    conference VARCHAR(50),
    division VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- NFL Games
CREATE TABLE IF NOT EXISTS nfl_games (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(100) UNIQUE NOT NULL,
    season INTEGER NOT NULL,
    week INTEGER,
    game_date TIMESTAMP NOT NULL,
    home_team_id VARCHAR(50) REFERENCES nfl_teams(team_id),
    away_team_id VARCHAR(50) REFERENCES nfl_teams(team_id),
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(50),
    venue VARCHAR(255),
    game_type VARCHAR(50), -- regular, playoff, superbowl
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- NFL Player Stats
CREATE TABLE IF NOT EXISTS nfl_player_stats (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(100) REFERENCES nfl_games(game_id),
    player_id VARCHAR(100) NOT NULL,
    player_name VARCHAR(255),
    team_id VARCHAR(50) REFERENCES nfl_teams(team_id),
    position VARCHAR(20),
    -- Passing stats
    passing_completions INTEGER,
    passing_attempts INTEGER,
    passing_yards INTEGER,
    passing_touchdowns INTEGER,
    interceptions INTEGER,
    -- Rushing stats
    rushing_attempts INTEGER,
    rushing_yards INTEGER,
    rushing_touchdowns INTEGER,
    -- Receiving stats
    receptions INTEGER,
    receiving_yards INTEGER,
    receiving_touchdowns INTEGER,
    targets INTEGER,
    -- Defense stats
    tackles INTEGER,
    sacks DECIMAL(4,1),
    fumbles_forced INTEGER,
    fumbles_recovered INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- CFB (College Football) TABLES
-- =====================================================

-- CFB Teams
CREATE TABLE IF NOT EXISTS cfb_teams (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(10),
    conference VARCHAR(100),
    division VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CFB Games
CREATE TABLE IF NOT EXISTS cfb_games (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(100) UNIQUE NOT NULL,
    season INTEGER NOT NULL,
    week INTEGER,
    game_date TIMESTAMP NOT NULL,
    home_team_id VARCHAR(50) REFERENCES cfb_teams(team_id),
    away_team_id VARCHAR(50) REFERENCES cfb_teams(team_id),
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(50),
    venue VARCHAR(255),
    game_type VARCHAR(50), -- regular, conference_championship, bowl, playoff
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CFB Player Stats
CREATE TABLE IF NOT EXISTS cfb_player_stats (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(100) REFERENCES cfb_games(game_id),
    player_id VARCHAR(100) NOT NULL,
    player_name VARCHAR(255),
    team_id VARCHAR(50) REFERENCES cfb_teams(team_id),
    position VARCHAR(20),
    -- Passing stats
    passing_completions INTEGER,
    passing_attempts INTEGER,
    passing_yards INTEGER,
    passing_touchdowns INTEGER,
    interceptions INTEGER,
    -- Rushing stats
    rushing_attempts INTEGER,
    rushing_yards INTEGER,
    rushing_touchdowns INTEGER,
    -- Receiving stats
    receptions INTEGER,
    receiving_yards INTEGER,
    receiving_touchdowns INTEGER,
    targets INTEGER,
    -- Defense stats
    tackles INTEGER,
    sacks DECIMAL(4,1),
    fumbles_forced INTEGER,
    fumbles_recovered INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- MLB TABLES
-- =====================================================

-- MLB Teams
CREATE TABLE IF NOT EXISTS mlb_teams (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(10),
    city VARCHAR(255),
    league VARCHAR(50), -- AL or NL
    division VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- MLB Games
CREATE TABLE IF NOT EXISTS mlb_games (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(100) UNIQUE NOT NULL,
    season INTEGER NOT NULL,
    game_date TIMESTAMP NOT NULL,
    home_team_id VARCHAR(50) REFERENCES mlb_teams(team_id),
    away_team_id VARCHAR(50) REFERENCES mlb_teams(team_id),
    home_score INTEGER,
    away_score INTEGER,
    innings INTEGER DEFAULT 9,
    status VARCHAR(50),
    venue VARCHAR(255),
    game_type VARCHAR(50), -- regular, playoff, world_series
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- MLB Player Stats
CREATE TABLE IF NOT EXISTS mlb_player_stats (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(100) REFERENCES mlb_games(game_id),
    player_id VARCHAR(100) NOT NULL,
    player_name VARCHAR(255),
    team_id VARCHAR(50) REFERENCES mlb_teams(team_id),
    position VARCHAR(20),
    -- Batting stats
    at_bats INTEGER,
    runs INTEGER,
    hits INTEGER,
    doubles INTEGER,
    triples INTEGER,
    home_runs INTEGER,
    rbi INTEGER,
    walks INTEGER,
    strikeouts INTEGER,
    stolen_bases INTEGER,
    batting_average DECIMAL(5,3),
    -- Pitching stats (for pitchers)
    innings_pitched DECIMAL(5,2),
    pitches_thrown INTEGER,
    strikes INTEGER,
    hits_allowed INTEGER,
    runs_allowed INTEGER,
    earned_runs INTEGER,
    walks_allowed INTEGER,
    strikeouts_pitched INTEGER,
    home_runs_allowed INTEGER,
    era DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- NBA TABLES
-- =====================================================

-- NBA Teams
CREATE TABLE IF NOT EXISTS nba_teams (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(10),
    city VARCHAR(255),
    conference VARCHAR(50),
    division VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- NBA Games
CREATE TABLE IF NOT EXISTS nba_games (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(100) UNIQUE NOT NULL,
    season INTEGER NOT NULL,
    game_date TIMESTAMP NOT NULL,
    home_team_id VARCHAR(50) REFERENCES nba_teams(team_id),
    away_team_id VARCHAR(50) REFERENCES nba_teams(team_id),
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(50),
    venue VARCHAR(255),
    game_type VARCHAR(50), -- regular, playoff, finals
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- NBA Player Stats
CREATE TABLE IF NOT EXISTS nba_player_stats (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(100) REFERENCES nba_games(game_id),
    player_id VARCHAR(100) NOT NULL,
    player_name VARCHAR(255),
    team_id VARCHAR(50) REFERENCES nba_teams(team_id),
    position VARCHAR(20),
    minutes_played DECIMAL(5,2),
    points INTEGER,
    field_goals_made INTEGER,
    field_goals_attempted INTEGER,
    three_pointers_made INTEGER,
    three_pointers_attempted INTEGER,
    free_throws_made INTEGER,
    free_throws_attempted INTEGER,
    offensive_rebounds INTEGER,
    defensive_rebounds INTEGER,
    total_rebounds INTEGER,
    assists INTEGER,
    steals INTEGER,
    blocks INTEGER,
    turnovers INTEGER,
    personal_fouls INTEGER,
    plus_minus INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- UFC TABLES
-- =====================================================

-- UFC Fighters
CREATE TABLE IF NOT EXISTS ufc_fighters (
    id SERIAL PRIMARY KEY,
    fighter_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    nickname VARCHAR(255),
    weight_class VARCHAR(50),
    country VARCHAR(100),
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    no_contests INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- UFC Events
CREATE TABLE IF NOT EXISTS ufc_events (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) UNIQUE NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    venue VARCHAR(255),
    city VARCHAR(255),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- UFC Fights
CREATE TABLE IF NOT EXISTS ufc_fights (
    id SERIAL PRIMARY KEY,
    fight_id VARCHAR(100) UNIQUE NOT NULL,
    event_id VARCHAR(100) REFERENCES ufc_events(event_id),
    fighter1_id VARCHAR(50) REFERENCES ufc_fighters(fighter_id),
    fighter2_id VARCHAR(50) REFERENCES ufc_fighters(fighter_id),
    winner_id VARCHAR(50) REFERENCES ufc_fighters(fighter_id),
    weight_class VARCHAR(50),
    method VARCHAR(100), -- KO, TKO, Submission, Decision, etc.
    round_finished INTEGER,
    time_finished VARCHAR(20),
    is_title_fight BOOLEAN DEFAULT FALSE,
    fight_order INTEGER, -- main event, co-main, prelims, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- UFC Fight Stats
CREATE TABLE IF NOT EXISTS ufc_fight_stats (
    id SERIAL PRIMARY KEY,
    fight_id VARCHAR(100) REFERENCES ufc_fights(fight_id),
    fighter_id VARCHAR(50) REFERENCES ufc_fighters(fighter_id),
    significant_strikes_landed INTEGER,
    significant_strikes_attempted INTEGER,
    total_strikes_landed INTEGER,
    total_strikes_attempted INTEGER,
    takedowns_landed INTEGER,
    takedowns_attempted INTEGER,
    submission_attempts INTEGER,
    knockdowns INTEGER,
    control_time_seconds INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- GOLF TABLES
-- =====================================================

-- Golf Players
CREATE TABLE IF NOT EXISTS golf_players (
    id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Golf Tournaments
CREATE TABLE IF NOT EXISTS golf_tournaments (
    id SERIAL PRIMARY KEY,
    tournament_id VARCHAR(100) UNIQUE NOT NULL,
    tournament_name VARCHAR(255) NOT NULL,
    season INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    course_name VARCHAR(255),
    location VARCHAR(255),
    purse BIGINT, -- prize money
    tour VARCHAR(50), -- PGA, LPGA, European, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- Golf Scores
CREATE TABLE IF NOT EXISTS golf_scores (
    id SERIAL PRIMARY KEY,
    tournament_id VARCHAR(100) REFERENCES golf_tournaments(tournament_id),
    player_id VARCHAR(50) REFERENCES golf_players(player_id),
    round_number INTEGER,
    round_score INTEGER,
    total_score INTEGER,
    position INTEGER,
    strokes_gained_putting DECIMAL(6,3),
    strokes_gained_total DECIMAL(6,3),
    fairways_hit INTEGER,
    greens_in_regulation INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Golf Tournament Results
CREATE TABLE IF NOT EXISTS golf_tournament_results (
    id SERIAL PRIMARY KEY,
    tournament_id VARCHAR(100) REFERENCES golf_tournaments(tournament_id),
    player_id VARCHAR(50) REFERENCES golf_players(player_id),
    final_position INTEGER,
    total_score INTEGER,
    score_to_par INTEGER,
    prize_money BIGINT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- NFL Indexes
CREATE INDEX IF NOT EXISTS idx_nfl_games_season ON nfl_games(season);
CREATE INDEX IF NOT EXISTS idx_nfl_games_date ON nfl_games(game_date);
CREATE INDEX IF NOT EXISTS idx_nfl_games_teams ON nfl_games(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_nfl_player_stats_game ON nfl_player_stats(game_id);
CREATE INDEX IF NOT EXISTS idx_nfl_player_stats_player ON nfl_player_stats(player_id);

-- CFB Indexes
CREATE INDEX IF NOT EXISTS idx_cfb_games_season ON cfb_games(season);
CREATE INDEX IF NOT EXISTS idx_cfb_games_date ON cfb_games(game_date);
CREATE INDEX IF NOT EXISTS idx_cfb_games_teams ON cfb_games(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_cfb_player_stats_game ON cfb_player_stats(game_id);
CREATE INDEX IF NOT EXISTS idx_cfb_player_stats_player ON cfb_player_stats(player_id);

-- MLB Indexes
CREATE INDEX IF NOT EXISTS idx_mlb_games_season ON mlb_games(season);
CREATE INDEX IF NOT EXISTS idx_mlb_games_date ON mlb_games(game_date);
CREATE INDEX IF NOT EXISTS idx_mlb_games_teams ON mlb_games(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_mlb_player_stats_game ON mlb_player_stats(game_id);
CREATE INDEX IF NOT EXISTS idx_mlb_player_stats_player ON mlb_player_stats(player_id);

-- NBA Indexes
CREATE INDEX IF NOT EXISTS idx_nba_games_season ON nba_games(season);
CREATE INDEX IF NOT EXISTS idx_nba_games_date ON nba_games(game_date);
CREATE INDEX IF NOT EXISTS idx_nba_games_teams ON nba_games(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_nba_player_stats_game ON nba_player_stats(game_id);
CREATE INDEX IF NOT EXISTS idx_nba_player_stats_player ON nba_player_stats(player_id);

-- UFC Indexes
CREATE INDEX IF NOT EXISTS idx_ufc_events_date ON ufc_events(event_date);
CREATE INDEX IF NOT EXISTS idx_ufc_fights_event ON ufc_fights(event_id);
CREATE INDEX IF NOT EXISTS idx_ufc_fights_fighters ON ufc_fights(fighter1_id, fighter2_id);
CREATE INDEX IF NOT EXISTS idx_ufc_fight_stats_fight ON ufc_fight_stats(fight_id);

-- Golf Indexes
CREATE INDEX IF NOT EXISTS idx_golf_tournaments_season ON golf_tournaments(season);
CREATE INDEX IF NOT EXISTS idx_golf_tournaments_date ON golf_tournaments(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_golf_scores_tournament ON golf_scores(tournament_id);
CREATE INDEX IF NOT EXISTS idx_golf_scores_player ON golf_scores(player_id);
CREATE INDEX IF NOT EXISTS idx_golf_results_tournament ON golf_tournament_results(tournament_id);
