// ==========================================
// ESPN API WRAPPER
// ==========================================
// Unofficial ESPN API for fetching game schedules, scores, and stats
// Documentation: https://gist.github.com/nntrn/ee26cb2a0716de0947a0a4e9a157bc1c

import { Sport, ESPNGame, ESPNCompetition, GameStatus } from './types.ts';

const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports';

/**
 * Map our Sport type to ESPN's sport path
 */
function getSportPath(sport: Sport): string {
  const sportPaths: Record<Sport, string> = {
    NFL: 'football/nfl',
    NBA: 'basketball/nba',
    MLB: 'baseball/mlb',
    NHL: 'hockey/nhl',
    CFB: 'football/college-football',
    UFC: 'mma/ufc',
    Golf: 'golf/pga',
  };

  return sportPaths[sport] || sportPaths.NFL;
}

/**
 * Fetch scoreboard for a specific date
 * @param sport - Sport type
 * @param date - Date in YYYYMMDD format (optional, defaults to today)
 */
export async function fetchScoreboard(
  sport: Sport,
  date?: string
): Promise<ESPNGame[]> {
  const sportPath = getSportPath(sport);
  let url = `${ESPN_BASE_URL}/${sportPath}/scoreboard`;

  if (date) {
    // ESPN expects dates in YYYYMMDD format
    url += `?dates=${date}`;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data.events || [];
  } catch (error) {
    console.error('Error fetching ESPN scoreboard:', error);
    throw error;
  }
}

/**
 * Fetch schedule for a specific season/week
 * @param sport - Sport type
 * @param season - Season year (e.g., 2024)
 * @param week - Week number (NFL/CFB only)
 */
export async function fetchSchedule(
  sport: Sport,
  season?: number,
  week?: number
): Promise<ESPNGame[]> {
  const sportPath = getSportPath(sport);
  let url = `${ESPN_BASE_URL}/${sportPath}/scoreboard`;

  const params = new URLSearchParams();

  if (season) {
    params.append('season', season.toString());
  }

  if (week && (sport === 'NFL' || sport === 'CFB')) {
    params.append('week', week.toString());
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data.events || [];
  } catch (error) {
    console.error('Error fetching ESPN schedule:', error);
    throw error;
  }
}

/**
 * Fetch team roster
 * @param sport - Sport type
 * @param teamId - ESPN team ID
 */
export async function fetchTeamRoster(
  sport: Sport,
  teamId: string
): Promise<any[]> {
  const sportPath = getSportPath(sport);
  const url = `${ESPN_BASE_URL}/${sportPath}/teams/${teamId}/roster`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data.athletes || [];
  } catch (error) {
    console.error('Error fetching ESPN roster:', error);
    throw error;
  }
}

/**
 * Fetch all teams for a sport
 * @param sport - Sport type
 */
export async function fetchTeams(sport: Sport): Promise<any[]> {
  const sportPath = getSportPath(sport);
  const url = `${ESPN_BASE_URL}/${sportPath}/teams`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // ESPN returns teams in a nested structure
    if (data.sports && data.sports[0] && data.sports[0].leagues) {
      const league = data.sports[0].leagues[0];
      return league.teams || [];
    }

    return [];
  } catch (error) {
    console.error('Error fetching ESPN teams:', error);
    throw error;
  }
}

/**
 * Fetch injuries for a sport
 * @param sport - Sport type
 */
export async function fetchInjuries(sport: Sport): Promise<any[]> {
  const sportPath = getSportPath(sport);
  const url = `${ESPN_BASE_URL}/${sportPath}/injuries`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // Some sports may not have injury endpoints
      console.warn(`ESPN injuries not available for ${sport}`);
      return [];
    }

    const data = await response.json();

    return data.injuries || [];
  } catch (error) {
    console.error('Error fetching ESPN injuries:', error);
    return [];
  }
}

/**
 * Convert ESPN game status to our GameStatus type
 */
export function convertESPNStatus(espnStatus: string): GameStatus {
  const statusMap: Record<string, GameStatus> = {
    STATUS_SCHEDULED: 'scheduled',
    STATUS_IN_PROGRESS: 'live',
    STATUS_HALFTIME: 'live',
    STATUS_END_PERIOD: 'live',
    STATUS_FINAL: 'completed',
    STATUS_POSTPONED: 'postponed',
    STATUS_CANCELED: 'cancelled',
    STATUS_CANCELLED: 'cancelled',
  };

  return statusMap[espnStatus] || 'scheduled';
}

/**
 * Extract home and away teams from ESPN competition
 */
export function extractTeams(competition: ESPNCompetition): {
  homeTeam: string;
  awayTeam: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
} {
  const competitors = competition.competitors || [];

  const homeCompetitor = competitors.find((c) => c.homeAway === 'home');
  const awayCompetitor = competitors.find((c) => c.homeAway === 'away');

  return {
    homeTeam: homeCompetitor?.team?.displayName || 'Unknown',
    awayTeam: awayCompetitor?.team?.displayName || 'Unknown',
    homeTeamId: homeCompetitor?.team?.id || '',
    awayTeamId: awayCompetitor?.team?.id || '',
    homeScore: homeCompetitor?.score ? parseInt(homeCompetitor.score) : undefined,
    awayScore: awayCompetitor?.score ? parseInt(awayCompetitor.score) : undefined,
  };
}

/**
 * Parse ESPN game into our database format
 */
export function parseESPNGame(espnGame: ESPNGame, sport: Sport): any {
  const competition = espnGame.competitions?.[0];

  if (!competition) {
    throw new Error('Invalid ESPN game format: missing competition');
  }

  const teams = extractTeams(competition);
  const status = convertESPNStatus(competition.status?.type?.name || 'STATUS_SCHEDULED');

  return {
    id: espnGame.id,
    sport,
    home_team: teams.homeTeam,
    away_team: teams.awayTeam,
    home_team_id: teams.homeTeamId,
    away_team_id: teams.awayTeamId,
    game_date: espnGame.date,
    commence_time: espnGame.date,
    venue: espnGame.venue?.fullName,
    status,
    home_score: teams.homeScore,
    away_score: teams.awayScore,
    weather: espnGame.weather,
    last_updated: new Date().toISOString(),
    metadata: {
      espn_id: espnGame.id,
      espn_name: espnGame.name,
      espn_short_name: espnGame.shortName,
    },
  };
}

/**
 * Fetch and parse games for a date range
 * @param sport - Sport type
 * @param startDate - Start date (YYYYMMDD)
 * @param endDate - End date (YYYYMMDD)
 */
export async function fetchGamesInRange(
  sport: Sport,
  startDate: string,
  endDate: string
): Promise<any[]> {
  const games: any[] = [];

  // Parse dates
  const start = new Date(
    parseInt(startDate.slice(0, 4)),
    parseInt(startDate.slice(4, 6)) - 1,
    parseInt(startDate.slice(6, 8))
  );
  const end = new Date(
    parseInt(endDate.slice(0, 4)),
    parseInt(endDate.slice(4, 6)) - 1,
    parseInt(endDate.slice(6, 8))
  );

  // Fetch games for each day
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');

    try {
      const espnGames = await fetchScoreboard(sport, dateStr);

      for (const espnGame of espnGames) {
        try {
          const parsedGame = parseESPNGame(espnGame, sport);
          games.push(parsedGame);
        } catch (err) {
          console.error(`Failed to parse game ${espnGame.id}:`, err);
        }
      }
    } catch (err) {
      console.error(`Failed to fetch games for ${dateStr}:`, err);
    }

    // Rate limiting: wait 1 second between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return games;
}

/**
 * Fetch current week's games (convenient for NFL/CFB)
 */
export async function fetchCurrentWeek(sport: 'NFL' | 'CFB'): Promise<any[]> {
  const currentYear = new Date().getFullYear();

  // Try to fetch current week's games
  try {
    const espnGames = await fetchSchedule(sport, currentYear);

    return espnGames.map((espnGame) => parseESPNGame(espnGame, sport));
  } catch (err) {
    console.error(`Failed to fetch current week for ${sport}:`, err);
    return [];
  }
}
