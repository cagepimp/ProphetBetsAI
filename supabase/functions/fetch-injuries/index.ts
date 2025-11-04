// ==========================================
// FETCH-INJURIES EDGE FUNCTION
// ==========================================
// Fetches injury reports from ESPN and stores them in database
//
// Usage:
// POST /functions/v1/fetch-injuries
// Body: { "sport": "NFL" }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  getSupabaseClient,
  upsertInjury,
  logEvent,
} from '../_shared/supabase-client.ts';
import { fetchInjuries } from '../_shared/espn-api.ts';
import { Sport } from '../_shared/types.ts';

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
    const input = await req.json();

    if (!input.sport) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: sport' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sport: Sport = input.sport;

    await logEvent('fetch-injuries', 'info', `Starting injury fetch for ${sport}`, {
      sport,
    });

    // Fetch injuries from ESPN
    console.log(`Fetching injuries for ${sport}...`);
    const espnInjuries = await fetchInjuries(sport);

    console.log(`Fetched ${espnInjuries.length} injury reports`);

    let injuriesCreated = 0;
    let injuriesUpdated = 0;
    const errors: string[] = [];

    for (const espnInjury of espnInjuries) {
      try {
        // Parse injury data
        const injuryId = espnInjury.id || crypto.randomUUID();

        const injury = {
          id: injuryId,
          player_id: espnInjury.athlete?.id,
          player_name: espnInjury.athlete?.displayName || 'Unknown',
          team_id: espnInjury.team?.id,
          team: espnInjury.team?.displayName || espnInjury.team?.name || 'Unknown',
          sport,
          injury_status: mapInjuryStatus(espnInjury.status),
          injury_type: espnInjury.type,
          description: espnInjury.longComment || espnInjury.shortComment,
          date_reported: espnInjury.date || new Date().toISOString(),
          expected_return: espnInjury.details?.returnDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Check if injury exists
        const supabase = getSupabaseClient();
        const { data: existing } = await supabase
          .from('injuries')
          .select('id')
          .eq('id', injuryId)
          .single();

        // Upsert injury
        await upsertInjury(injury);

        if (existing) {
          injuriesUpdated++;
        } else {
          injuriesCreated++;
        }

        console.log(`${existing ? 'Updated' : 'Created'} injury: ${injury.player_name} - ${injury.injury_status}`);
      } catch (injErr) {
        const errorMsg = `Failed to process injury: ${injErr.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // Log completion
    await logEvent('fetch-injuries', 'info', `Completed injury fetch for ${sport}`, {
      injuriesCreated,
      injuriesUpdated,
      errors: errors.length,
    });

    // Return response
    const output = {
      success: true,
      injuriesCreated,
      injuriesUpdated,
      errors: errors.length > 0 ? errors : undefined,
    };

    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-injuries:', error);

    await logEvent('fetch-injuries', 'error', error.message, {
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

/**
 * Map ESPN injury status to our format
 */
function mapInjuryStatus(
  status: string
): 'out' | 'doubtful' | 'questionable' | 'probable' | 'day-to-day' {
  const statusMap: Record<string, any> = {
    Out: 'out',
    'Out For Season': 'out',
    'Out Indefinitely': 'out',
    Doubtful: 'doubtful',
    Questionable: 'questionable',
    Probable: 'probable',
    'Day-To-Day': 'day-to-day',
  };

  return statusMap[status] || 'questionable';
}
