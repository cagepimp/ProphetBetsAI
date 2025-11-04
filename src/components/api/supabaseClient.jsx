/**
 * supabase-client.js - Supabase Connection & Helper Functions
 * 
 * PURPOSE: Connect to Supabase database and provide helper functions
 * to fetch 2025 roster data for all sports
 * 
 * TABLES IN SUPABASE:
 * - nfl_players_2025
 * - nba_players_2025
 * - mlb_players_2025
 * - cfb_players_2025
 * - ufc_fighters_2025
 * - golf_players_2025
 * - teams (shared across sports)
 */

import { createClient } from '@supabase/supabase-js';

// Get credentials from Base44 secrets
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY;

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Get all teams from database
 */
export async function getTeams(sport = null) {
  try {
    let query = supabase
      .from('teams')
      .select('*');
    
    if (sport) {
      query = query.eq('sport', sport.toUpperCase());
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
}

/**
 * Get all players for a specific sport
 */
export async function getAllPlayers(sport) {
  try {
    const tableName = `${sport.toLowerCase()}_players_2025`;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching ${sport} players:`, error);
    return [];
  }
}

/**
 * Get players for a specific team
 */
export async function getTeamPlayers(sport, teamId) {
  try {
    const tableName = `${sport.toLowerCase()}_players_2025`;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('team_id', teamId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching ${sport} team players:`, error);
    return [];
  }
}

/**
 * Get roster by team abbreviation (e.g., "KC", "LAL")
 */
export async function getRosterByTeamAbbr(sport, teamAbbr) {
  try {
    const tableName = `${sport.toLowerCase()}_players_2025`;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('team', teamAbbr);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching roster for ${teamAbbr}:`, error);
    return [];
  }
}

/**
 * Get a specific player by name
 */
export async function getPlayerByName(sport, playerName) {
  try {
    const tableName = `${sport.toLowerCase()}_players_2025`;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .ilike('name', `%${playerName}%`)
      .limit(1)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching player ${playerName}:`, error);
    return null;
  }
}

/**
 * Search players across a sport
 */
export async function searchPlayers(sport, searchTerm) {
  try {
    const tableName = `${sport.toLowerCase()}_players_2025`;
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .or(`name.ilike.%${searchTerm}%,team.ilike.%${searchTerm}%,position.ilike.%${searchTerm}%`);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error searching ${sport} players:`, error);
    return [];
  }
}

export default supabase;