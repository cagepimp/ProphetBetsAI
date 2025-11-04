// ==========================================
// SYNC-ROSTERS EDGE FUNCTION
// ==========================================
// Syncs player rosters from ESPN to database
//
// Usage:
// POST /functions/v1/sync-rosters
// Body: { "sport": "NFL", "teamIds": ["1", "2"], "forceRefresh": false }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  getSupabaseClient,
  getTeams,
  upsertPlayer,
  logEvent,
} from '../_shared/supabase-client.ts';
import { fetchTeamRoster, fetchTeams } from '../_shared/espn-api.ts';
import { SyncRostersInput, SyncRostersOutput } from '../_shared/types.ts';

/**
 * CORS headers
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Main handler
 */
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse input
    const input: SyncRostersInput = await req.json();

    if (!input.sport) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: sport' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { sport, teamIds, forceRefresh } = input;

    await logEvent('sync-rosters', 'info', `Starting roster sync for ${sport}`, {
      sport,
      teamIds,
      forceRefresh,
    });

    // Get teams from database
    let teams = await getTeams({ sport });

    // Filter by teamIds if provided
    if (teamIds && teamIds.length > 0) {
      teams = teams.filter((t) => teamIds.includes(t.id));
    }

    console.log(`Syncing rosters for ${teams.length} teams`);

    let playersCreated = 0;
    let playersUpdated = 0;
    const errors: string[] = [];

    for (const team of teams) {
      try {
        console.log(`Fetching roster for ${team.name}...`);

        // Fetch roster from ESPN
        const espnRoster = await fetchTeamRoster(sport, team.metadata?.espn_id || team.id);

        console.log(`Fetched ${espnRoster.length} players for ${team.name}`);

        // Process each athlete
        for (const athlete of espnRoster) {
          try {
            // Parse athlete data
            const playerId = athlete.id || crypto.randomUUID();

            const player = {
              id: playerId,
              team_id: team.id,
              sport,
              name: athlete.fullName || athlete.displayName || 'Unknown',
              position: athlete.position?.abbreviation || athlete.position?.name,
              jersey_number: athlete.jersey,
              status: athlete.status?.type || 'active',
              height: athlete.displayHeight,
              weight: athlete.displayWeight ? parseInt(athlete.displayWeight) : undefined,
              date_of_birth: athlete.dateOfBirth,
              college: athlete.college?.name,
              metadata: {
                espn_id: athlete.id,
                headshot: athlete.headshot?.href,
                years_pro: athlete.experience?.years,
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            // Check if player exists
            const supabase = getSupabaseClient();
            const { data: existing } = await supabase
              .from('players')
              .select('id')
              .eq('id', playerId)
              .single();

            // Upsert player
            await upsertPlayer(player);

            if (existing) {
              playersUpdated++;
            } else {
              playersCreated++;
            }
          } catch (playerErr) {
            console.error(`Failed to process player:`, playerErr);
            errors.push(`Player processing error: ${playerErr.message}`);
          }
        }

        console.log(`Completed roster sync for ${team.name}`);

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (teamErr) {
        const errorMsg = `Failed to sync roster for ${team.name}: ${teamErr.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // Log completion
    await logEvent('sync-rosters', 'info', `Completed roster sync for ${sport}`, {
      playersCreated,
      playersUpdated,
      errors: errors.length,
    });

    // Return response
    const output: SyncRostersOutput = {
      success: true,
      playersCreated,
      playersUpdated,
      errors: errors.length > 0 ? errors : undefined,
    };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in sync-rosters:', error);

    await logEvent('sync-rosters', 'error', error.message, {
      stack: error.stack,
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
