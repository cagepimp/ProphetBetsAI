// =====================================================
// SUPABASE EDGE FUNCTION: updateWeeklySchedule
// Update weekly schedules for all sports from ESPN API
// Migrated from Base44 automation/updateWeeklySchedule
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UpdateScheduleRequest {
  sport: string;
  week?: number;
  season?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const {
      sport,
      week,
      season = new Date().getFullYear(),
    } = (await req.json()) as UpdateScheduleRequest;

    if (!sport) {
      throw new Error("sport is required");
    }

    console.log(`[UpdateSchedule] Updating schedule for ${sport}...`);

    // Fetch schedule from ESPN API
    const scheduleData = await fetchESPNSchedule(sport, season, week);

    if (!scheduleData || scheduleData.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No schedule data found",
          gamesCreated: 0,
          gamesUpdated: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`[UpdateSchedule] Found ${scheduleData.length} games from ESPN`);

    let gamesCreated = 0;
    let gamesUpdated = 0;

    // Process each game
    for (const espnGame of scheduleData) {
      const gameData = parseESPNGame(espnGame, sport, season);

      // Check if game already exists
      const { data: existingGame } = await supabaseClient
        .from("games")
        .select("*")
        .eq("sport", sport)
        .eq("game_id", gameData.game_id)
        .single();

      if (existingGame) {
        // Update existing game
        await supabaseClient
          .from("games")
          .update({
            game_date: gameData.game_date,
            game_time: gameData.game_time,
            status: gameData.status,
            home_score: gameData.home_score,
            away_score: gameData.away_score,
            completed: gameData.completed,
            venue: gameData.venue,
          })
          .eq("id", existingGame.id);

        gamesUpdated++;
      } else {
        // Create new game
        await supabaseClient.from("games").insert(gameData);

        gamesCreated++;
      }
    }

    console.log(
      `[UpdateSchedule] Completed! Created ${gamesCreated} games, updated ${gamesUpdated} games`
    );

    return new Response(
      JSON.stringify({
        success: true,
        gamesCreated,
        gamesUpdated,
        totalGames: gamesCreated + gamesUpdated,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[UpdateSchedule] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

// ========== ESPN API FUNCTIONS ==========

async function fetchESPNSchedule(
  sport: string,
  season: number,
  week?: number
): Promise<any[]> {
  const sportKey = mapSportToESPN(sport);

  let url = `https://site.api.espn.com/apis/site/v2/sports/${sportKey}/scoreboard`;

  if (week) {
    url += `?week=${week}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.statusText}`);
  }

  const data = await response.json();

  return data.events || [];
}

function mapSportToESPN(sport: string): string {
  const mapping: { [key: string]: string } = {
    NFL: "football/nfl",
    CFB: "football/college-football",
    NBA: "basketball/nba",
    MLB: "baseball/mlb",
  };

  return mapping[sport] || sport.toLowerCase();
}

function parseESPNGame(espnGame: any, sport: string, season: number): any {
  const competition = espnGame.competitions[0];

  const homeTeam = competition.competitors.find((c: any) => c.homeAway === "home");
  const awayTeam = competition.competitors.find((c: any) => c.homeAway === "away");

  return {
    sport: sport,
    game_id: espnGame.id,
    event_id: espnGame.id,

    home_team: homeTeam.team.displayName,
    away_team: awayTeam.team.displayName,
    home_team_abbreviation: homeTeam.team.abbreviation,
    away_team_abbreviation: awayTeam.team.abbreviation,

    game_date: new Date(espnGame.date).toISOString(),
    game_time: new Date(espnGame.date).toTimeString().split(" ")[0],
    week: parseInt(competition.week?.number || "1"),
    season: season,
    season_type: competition.season?.type || "regular",
    venue: competition.venue?.fullName,

    home_score: parseInt(homeTeam.score) || null,
    away_score: parseInt(awayTeam.score) || null,

    status: mapESPNStatus(espnGame.status.type.state),
    completed: espnGame.status.type.completed,
  };
}

function mapESPNStatus(espnStatus: string): string {
  const mapping: { [key: string]: string } = {
    pre: "scheduled",
    in: "in_progress",
    post: "final",
  };

  return mapping[espnStatus] || "scheduled";
}
