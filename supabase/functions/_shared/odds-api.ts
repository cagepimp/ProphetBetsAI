// ==========================================
// THE ODDS API WRAPPER
// ==========================================
// API for fetching live betting odds from multiple sportsbooks
// Documentation: https://the-odds-api.com/liveapi/guides/v4/

import { Sport, OddsAPIGame, Markets, BookmakerOdds, Outcome } from './types.ts';

const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4/sports';

/**
 * Map our Sport type to The Odds API sport key
 */
function getSportKey(sport: Sport): string {
  const sportKeys: Record<Sport, string> = {
    NFL: 'americanfootball_nfl',
    NBA: 'basketball_nba',
    MLB: 'baseball_mlb',
    NHL: 'icehockey_nhl',
    CFB: 'americanfootball_ncaaf',
    UFC: 'mma_mixed_martial_arts',
    Golf: 'golf_pga_championship',
  };

  return sportKeys[sport] || sportKeys.NFL;
}

/**
 * Get API key from environment
 */
function getApiKey(): string {
  const apiKey = Deno.env.get('ODDS_API_KEY');

  if (!apiKey) {
    throw new Error('ODDS_API_KEY environment variable is not set');
  }

  return apiKey;
}

/**
 * Fetch odds for a specific sport
 * @param sport - Sport type
 * @param markets - Markets to fetch (e.g., ['h2h', 'spreads', 'totals'])
 * @param bookmakers - Specific bookmakers (optional, fetches all if not specified)
 * @param regions - Regions (us, uk, au, eu)
 */
export async function fetchOdds(
  sport: Sport,
  markets: string[] = ['h2h', 'spreads', 'totals'],
  bookmakers?: string[],
  regions: string[] = ['us']
): Promise<OddsAPIGame[]> {
  const sportKey = getSportKey(sport);
  const apiKey = getApiKey();

  // Build URL with query parameters
  const params = new URLSearchParams({
    apiKey,
    regions: regions.join(','),
    markets: markets.join(','),
  });

  if (bookmakers && bookmakers.length > 0) {
    params.append('bookmakers', bookmakers.join(','));
  }

  const url = `${ODDS_API_BASE_URL}/${sportKey}/odds?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Odds API error: ${response.status} ${errorText}`);
    }

    // Check remaining requests in header
    const remaining = response.headers.get('x-requests-remaining');
    if (remaining) {
      console.log(`Odds API requests remaining: ${remaining}`);
    }

    const data = await response.json();

    return data || [];
  } catch (error) {
    console.error('Error fetching odds:', error);
    throw error;
  }
}

/**
 * Fetch odds for a specific game by ID
 * @param sport - Sport type
 * @param gameId - The Odds API game ID
 */
export async function fetchGameOdds(
  sport: Sport,
  gameId: string,
  markets: string[] = ['h2h', 'spreads', 'totals']
): Promise<OddsAPIGame | null> {
  const sportKey = getSportKey(sport);
  const apiKey = getApiKey();

  const params = new URLSearchParams({
    apiKey,
    regions: 'us',
    markets: markets.join(','),
  });

  const url = `${ODDS_API_BASE_URL}/${sportKey}/odds/${gameId}?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Odds API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error fetching game odds:', error);
    return null;
  }
}

/**
 * Parse odds from The Odds API into our Markets format
 */
export function parseOddsToMarkets(oddsGame: OddsAPIGame): Markets {
  const markets: Markets = {};

  for (const bookmaker of oddsGame.bookmakers) {
    const bookmakerKey = normalizeBookmakerKey(bookmaker.key);

    for (const market of bookmaker.markets) {
      const marketKey = normalizeMarketKey(market.key);

      if (!markets[marketKey]) {
        markets[marketKey] = {};
      }

      const outcomes: Outcome[] = market.outcomes.map((outcome) => ({
        name: outcome.name,
        price: outcome.price,
        point: outcome.point,
      }));

      markets[marketKey]![bookmakerKey] = outcomes;
    }
  }

  return markets;
}

/**
 * Normalize bookmaker key to our format
 */
function normalizeBookmakerKey(key: string): string {
  const bookmakerMap: Record<string, string> = {
    draftkings: 'draftkings',
    fanduel: 'fanduel',
    betmgm: 'betmgm',
    caesars: 'caesars',
    pointsbet: 'pointsbet',
    williamhill_us: 'williamhill',
    barstool: 'barstool',
    betrivers: 'betrivers',
    unibet_us: 'unibet',
    wynnbet: 'wynnbet',
  };

  return bookmakerMap[key] || key;
}

/**
 * Normalize market key to our format
 */
function normalizeMarketKey(key: string): string {
  const marketMap: Record<string, string> = {
    h2h: 'moneyline',
    spreads: 'spread',
    totals: 'total',
  };

  return marketMap[key] || key;
}

/**
 * Match ESPN game to Odds API game by team names
 * Returns the matching Odds API game or null
 */
export function matchGameByTeams(
  espnHomeTeam: string,
  espnAwayTeam: string,
  oddsGames: OddsAPIGame[]
): OddsAPIGame | null {
  // Clean team names for comparison
  const cleanHome = cleanTeamName(espnHomeTeam);
  const cleanAway = cleanTeamName(espnAwayTeam);

  for (const oddsGame of oddsGames) {
    const oddsHome = cleanTeamName(oddsGame.home_team);
    const oddsAway = cleanTeamName(oddsGame.away_team);

    // Check if teams match (either home/away or away/home)
    if (
      (cleanHome === oddsHome && cleanAway === oddsAway) ||
      (cleanHome === oddsAway && cleanAway === oddsHome)
    ) {
      return oddsGame;
    }
  }

  return null;
}

/**
 * Clean team name for matching
 * Removes common prefixes, suffixes, and normalizes spelling
 */
function cleanTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+(fc|sc|united|city|athletic|club)$/i, '')
    .replace(/^(los angeles|new york|san francisco|san diego|washington|new england)/i, '')
    .trim();
}

/**
 * Get best odds for a specific bet type across all bookmakers
 */
export function getBestOdds(
  markets: Markets,
  marketType: 'moneyline' | 'spread' | 'total',
  selection: string
): { bookmaker: string; odds: number; point?: number } | null {
  const market = markets[marketType];

  if (!market) {
    return null;
  }

  let bestOdds: number | null = null;
  let bestBookmaker: string | null = null;
  let bestPoint: number | undefined;

  for (const [bookmaker, outcomes] of Object.entries(market)) {
    if (!outcomes) continue;

    const outcome = outcomes.find((o) => o.name === selection);

    if (outcome && (bestOdds === null || outcome.price > bestOdds)) {
      bestOdds = outcome.price;
      bestBookmaker = bookmaker;
      bestPoint = outcome.point;
    }
  }

  if (bestOdds !== null && bestBookmaker !== null) {
    return {
      bookmaker: bestBookmaker,
      odds: bestOdds,
      point: bestPoint,
    };
  }

  return null;
}

/**
 * Calculate implied probability from American odds
 */
export function calculateImpliedProbability(americanOdds: number): number {
  if (americanOdds > 0) {
    return 100 / (americanOdds + 100);
  } else {
    return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100);
  }
}

/**
 * Convert American odds to decimal odds
 */
export function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return americanOdds / 100 + 1;
  } else {
    return 100 / Math.abs(americanOdds) + 1;
  }
}

/**
 * Calculate margin (bookmaker's edge) for a market
 */
export function calculateMargin(outcomes: Outcome[]): number {
  const totalImpliedProb = outcomes.reduce((sum, outcome) => {
    return sum + calculateImpliedProbability(outcome.price);
  }, 0);

  return totalImpliedProb - 1;
}

/**
 * Find arbitrage opportunities in a market
 * Returns the potential profit percentage or null if no arbitrage
 */
export function findArbitrage(
  markets: Markets,
  marketType: 'moneyline' | 'spread' | 'total'
): { profit: number; bets: any[] } | null {
  const market = markets[marketType];

  if (!market) {
    return null;
  }

  // Get all unique selections
  const selections = new Set<string>();
  for (const outcomes of Object.values(market)) {
    if (outcomes) {
      outcomes.forEach((o) => selections.add(o.name));
    }
  }

  // Find best odds for each selection
  const bestOdds: Record<string, { bookmaker: string; odds: number }> = {};

  for (const selection of selections) {
    const best = getBestOdds(markets, marketType, selection);
    if (best) {
      bestOdds[selection] = {
        bookmaker: best.bookmaker,
        odds: best.odds,
      };
    }
  }

  // Calculate total implied probability
  let totalImpliedProb = 0;
  const bets = [];

  for (const [selection, { bookmaker, odds }] of Object.entries(bestOdds)) {
    const impliedProb = calculateImpliedProbability(odds);
    totalImpliedProb += impliedProb;

    bets.push({
      selection,
      bookmaker,
      odds,
      stake: impliedProb, // Proportional stake
    });
  }

  // If total implied probability < 1, there's an arbitrage opportunity
  if (totalImpliedProb < 1) {
    const profit = (1 - totalImpliedProb) * 100; // Profit percentage

    return {
      profit,
      bets,
    };
  }

  return null;
}

/**
 * Check if odds are stale (older than threshold)
 * @param lastUpdate - ISO timestamp of last update
 * @param thresholdMinutes - Minutes before considering stale
 */
export function areOddsStale(lastUpdate: string, thresholdMinutes: number = 30): boolean {
  const lastUpdateTime = new Date(lastUpdate).getTime();
  const now = Date.now();
  const diffMinutes = (now - lastUpdateTime) / (1000 * 60);

  return diffMinutes > thresholdMinutes;
}
