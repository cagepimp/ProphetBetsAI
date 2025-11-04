// =====================================================
// SUPABASE EDGE FUNCTION: fetchOdds
// Fetch odds from DraftKings, FanDuel, and other sportsbooks
// Migrated from Base44 automation/fetchOdds functions
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FetchOddsRequest {
  sport: string;
  gameId?: string;
  sportsbooks?: string[]; // ['draftkings', 'fanduel', 'betmgm']
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

    const { sport, gameId, sportsbooks = ["draftkings", "fanduel", "betmgm"] } =
      (await req.json()) as FetchOddsRequest;

    if (!sport) {
      throw new Error("sport is required");
    }

    console.log(`[FetchOdds] Fetching odds for ${sport}...`);

    // Get games to fetch odds for
    let gamesQuery = supabaseClient
      .from("games")
      .select("*")
      .eq("sport", sport)
      .eq("completed", false);

    if (gameId) {
      gamesQuery = gamesQuery.eq("id", gameId);
    }

    const { data: games, error: gamesError } = await gamesQuery;

    if (gamesError) {
      throw new Error(`Error fetching games: ${gamesError.message}`);
    }

    if (!games || games.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No games found to fetch odds for",
          gamesUpdated: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`[FetchOdds] Found ${games.length} games to fetch odds for`);

    let gamesUpdated = 0;
    let oddsRecordsCreated = 0;

    // Fetch odds from TheOddsAPI (aggregates multiple sportsbooks)
    const oddsApiKey = Deno.env.get("ODDS_API_KEY");

    if (!oddsApiKey) {
      throw new Error("ODDS_API_KEY environment variable not set");
    }

    const sportKey = mapSportToOddsAPI(sport);

    // Fetch from TheOddsAPI
    const oddsApiUrl = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/`;
    const oddsApiParams = new URLSearchParams({
      apiKey: oddsApiKey,
      regions: "us",
      markets: "h2h,spreads,totals",
      oddsFormat: "american",
      bookmakers: sportsbooks.join(","),
    });

    const oddsResponse = await fetch(`${oddsApiUrl}?${oddsApiParams}`);

    if (!oddsResponse.ok) {
      throw new Error(`TheOddsAPI error: ${oddsResponse.statusText}`);
    }

    const oddsData = await oddsResponse.json();

    console.log(`[FetchOdds] Fetched odds for ${oddsData.length} events from TheOddsAPI`);

    // Match odds to games and update
    for (const game of games) {
      const matchingOdds = findMatchingOdds(oddsData, game);

      if (!matchingOdds) {
        console.log(`[FetchOdds] No matching odds found for game ${game.id}`);
        continue;
      }

      // Extract odds from each sportsbook
      const bookmakerData: any = {};

      for (const bookmaker of matchingOdds.bookmakers) {
        const bookmakerName = bookmaker.key;

        // Extract spread, total, and moneyline
        const spreadMarket = bookmaker.markets.find((m: any) => m.key === "spreads");
        const totalMarket = bookmaker.markets.find((m: any) => m.key === "totals");
        const h2hMarket = bookmaker.markets.find((m: any) => m.key === "h2h");

        bookmakerData[bookmakerName] = {
          spread: spreadMarket?.outcomes || [],
          total: totalMarket?.outcomes || [],
          moneyline: h2hMarket?.outcomes || [],
        };

        // Save to historical_odds
        await supabaseClient.from("historical_odds").insert({
          game_id: game.id,
          sport: sport,
          sportsbook: bookmakerName,
          home_spread: spreadMarket?.outcomes.find((o: any) =>
            o.name === game.home_team
          )?.point,
          away_spread: spreadMarket?.outcomes.find((o: any) =>
            o.name === game.away_team
          )?.point,
          total: totalMarket?.outcomes[0]?.point,
          home_ml: h2hMarket?.outcomes.find((o: any) => o.name === game.home_team)
            ?.price,
          away_ml: h2hMarket?.outcomes.find((o: any) => o.name === game.away_team)
            ?.price,
          fetched_at: new Date().toISOString(),
        });

        oddsRecordsCreated++;
      }

      // Update game with latest odds (use DraftKings as primary)
      const dkSpread = bookmakerData.draftkings?.spread || [];
      const dkTotal = bookmakerData.draftkings?.total || [];
      const dkML = bookmakerData.draftkings?.moneyline || [];

      const homeSpreadOutcome = dkSpread.find((o: any) => o.name === game.home_team);
      const awaySpreadOutcome = dkSpread.find((o: any) => o.name === game.away_team);
      const totalOutcome = dkTotal[0];
      const homeMLOutcome = dkML.find((o: any) => o.name === game.home_team);
      const awayMLOutcome = dkML.find((o: any) => o.name === game.away_team);

      await supabaseClient
        .from("games")
        .update({
          home_spread: homeSpreadOutcome?.point,
          away_spread: awaySpreadOutcome?.point,
          total_over_under: totalOutcome?.point,
          home_ml: homeMLOutcome?.price,
          away_ml: awayMLOutcome?.price,
          odds_last_updated: new Date().toISOString(),
        })
        .eq("id", game.id);

      gamesUpdated++;

      console.log(
        `[FetchOdds] Updated odds for game ${game.id}: ${game.away_team} @ ${game.home_team}`
      );
    }

    console.log(
      `[FetchOdds] Completed! Updated ${gamesUpdated} games, created ${oddsRecordsCreated} odds records`
    );

    return new Response(
      JSON.stringify({
        success: true,
        gamesUpdated,
        oddsRecordsCreated,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[FetchOdds] Error:", error);
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

// ========== HELPER FUNCTIONS ==========

function mapSportToOddsAPI(sport: string): string {
  const mapping: { [key: string]: string } = {
    NFL: "americanfootball_nfl",
    CFB: "americanfootball_ncaaf",
    NBA: "basketball_nba",
    MLB: "baseball_mlb",
    UFC: "mma_mixed_martial_arts",
  };

  return mapping[sport] || sport.toLowerCase();
}

function findMatchingOdds(oddsData: any[], game: any): any {
  // Try to find matching event by team names
  return oddsData.find((event) => {
    const homeTeamMatch =
      event.home_team === game.home_team ||
      event.home_team.includes(game.home_team) ||
      game.home_team.includes(event.home_team);

    const awayTeamMatch =
      event.away_team === game.away_team ||
      event.away_team.includes(game.away_team) ||
      game.away_team.includes(event.away_team);

    return homeTeamMatch && awayTeamMatch;
  });
}
