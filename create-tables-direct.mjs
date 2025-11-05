import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSqlDirect(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    return { ok: response.ok, status: response.status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function createTablesOneByOne() {
  console.log('🚀 Creating sports tables in Supabase...\n');

  const tables = [
    {
      name: 'NFL Teams',
      sql: `CREATE TABLE IF NOT EXISTS nfl_teams (
        id SERIAL PRIMARY KEY,
        team_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        abbreviation VARCHAR(10),
        city VARCHAR(255),
        conference VARCHAR(50),
        division VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'NFL Games',
      sql: `CREATE TABLE IF NOT EXISTS nfl_games (
        id SERIAL PRIMARY KEY,
        game_id VARCHAR(100) UNIQUE NOT NULL,
        season INTEGER NOT NULL,
        week INTEGER,
        game_date TIMESTAMP NOT NULL,
        home_team_id VARCHAR(50),
        away_team_id VARCHAR(50),
        home_score INTEGER,
        away_score INTEGER,
        status VARCHAR(50),
        venue VARCHAR(255),
        game_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'NFL Player Stats',
      sql: `CREATE TABLE IF NOT EXISTS nfl_player_stats (
        id SERIAL PRIMARY KEY,
        game_id VARCHAR(100),
        player_id VARCHAR(100) NOT NULL,
        player_name VARCHAR(255),
        team_id VARCHAR(50),
        position VARCHAR(20),
        passing_completions INTEGER,
        passing_attempts INTEGER,
        passing_yards INTEGER,
        passing_touchdowns INTEGER,
        interceptions INTEGER,
        rushing_attempts INTEGER,
        rushing_yards INTEGER,
        rushing_touchdowns INTEGER,
        receptions INTEGER,
        receiving_yards INTEGER,
        receiving_touchdowns INTEGER,
        targets INTEGER,
        tackles INTEGER,
        sacks DECIMAL(4,1),
        fumbles_forced INTEGER,
        fumbles_recovered INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'MLB Teams',
      sql: `CREATE TABLE IF NOT EXISTS mlb_teams (
        id SERIAL PRIMARY KEY,
        team_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        abbreviation VARCHAR(10),
        city VARCHAR(255),
        league VARCHAR(50),
        division VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'MLB Games',
      sql: `CREATE TABLE IF NOT EXISTS mlb_games (
        id SERIAL PRIMARY KEY,
        game_id VARCHAR(100) UNIQUE NOT NULL,
        season INTEGER NOT NULL,
        game_date TIMESTAMP NOT NULL,
        home_team_id VARCHAR(50),
        away_team_id VARCHAR(50),
        home_score INTEGER,
        away_score INTEGER,
        innings INTEGER DEFAULT 9,
        status VARCHAR(50),
        venue VARCHAR(255),
        game_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`
    },
    {
      name: 'MLB Player Stats',
      sql: `CREATE TABLE IF NOT EXISTS mlb_player_stats (
        id SERIAL PRIMARY KEY,
        game_id VARCHAR(100),
        player_id VARCHAR(100) NOT NULL,
        player_name VARCHAR(255),
        team_id VARCHAR(50),
        position VARCHAR(20),
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
      );`
    }
  ];

  console.log('Creating core tables for NFL and MLB first...\n');

  for (const table of tables) {
    console.log(`Creating ${table.name}...`);
    const result = await executeSqlDirect(table.sql);
    if (result.ok) {
      console.log(`✅ ${table.name} created`);
    } else {
      console.log(`⚠️  ${table.name} - ${result.status || result.error}`);
    }
  }

  console.log('\n📝 For all tables, please run the full migration in Supabase Dashboard:');
  console.log('https://supabase.com/dashboard/project/abglcmahihbmglkbolir/sql/new\n');
}

createTablesOneByOne();
