/**
 * UniversalRosterService.jsx
 * 
 * FALLBACK rosters for 2025-26 season
 * Used ONLY when backend fetch fails
 */

const CURRENT_ROSTERS = {
  NFL: {
    "Kansas City Chiefs": {
      QB: "Patrick Mahomes", RB: "Kareem Hunt", WR1: "DeAndre Hopkins", 
      WR2: "Xavier Worthy", TE: "Travis Kelce"
    },
    "Buffalo Bills": {
      QB: "Josh Allen", RB: "James Cook", WR1: "Khalil Shakir", 
      WR2: "Keon Coleman", TE: "Dalton Kincaid"
    },
    "Detroit Lions": {
      QB: "Jared Goff", RB: "Jahmyr Gibbs", WR1: "Amon-Ra St. Brown", 
      WR2: "Jameson Williams", TE: "Sam LaPorta"
    },
    "Baltimore Ravens": {
      QB: "Lamar Jackson", RB: "Derrick Henry", WR1: "Zay Flowers", 
      WR2: "Rashod Bateman", TE: "Mark Andrews"
    },
    "Philadelphia Eagles": {
      QB: "Jalen Hurts", RB: "Saquon Barkley", WR1: "A.J. Brown", 
      WR2: "DeVonta Smith", TE: "Dallas Goedert"
    },
    "San Francisco 49ers": {
      QB: "Brock Purdy", RB: "Christian McCaffrey", WR1: "Deebo Samuel", 
      WR2: "Brandon Aiyuk", TE: "George Kittle"
    },
    "Green Bay Packers": {
      QB: "Jordan Love", RB: "Josh Jacobs", WR1: "Jayden Reed", 
      WR2: "Romeo Doubs", TE: "Tucker Kraft"
    },
    "Minnesota Vikings": {
      QB: "Sam Darnold", RB: "Aaron Jones", WR1: "Justin Jefferson", 
      WR2: "Jordan Addison", TE: "T.J. Hockenson"
    },
    "Tampa Bay Buccaneers": {
      QB: "Baker Mayfield", RB: "Bucky Irving", WR1: "Mike Evans", 
      WR2: "Jalen McMillan", TE: "Cade Otton"
    },
    "Washington Commanders": {
      QB: "Jayden Daniels", RB: "Brian Robinson Jr.", WR1: "Terry McLaurin", 
      WR2: "Olamide Zaccheaus", TE: "Zach Ertz"
    },
    "Los Angeles Rams": {
      QB: "Matthew Stafford", RB: "Kyren Williams", WR1: "Cooper Kupp", 
      WR2: "Puka Nacua", TE: "Tyler Higbee"
    },
    "Denver Broncos": {
      QB: "Bo Nix", RB: "Javonte Williams", WR1: "Courtland Sutton", 
      WR2: "Marvin Mims Jr.", TE: "Adam Trautman"
    },
    "Los Angeles Chargers": {
      QB: "Justin Herbert", RB: "Gus Edwards", WR1: "Ladd McConkey", 
      WR2: "Joshua Palmer", TE: "Will Dissly"
    },
    "Pittsburgh Steelers": {
      QB: "Russell Wilson", RB: "Najee Harris", WR1: "George Pickens", 
      WR2: "Calvin Austin III", TE: "Pat Freiermuth"
    },
    "Atlanta Falcons": {
      QB: "Michael Penix Jr.", RB: "Bijan Robinson", WR1: "Drake London", 
      WR2: "Darnell Mooney", TE: "Kyle Pitts"
    },
    "Seattle Seahawks": {
      QB: "Geno Smith", RB: "Kenneth Walker III", WR1: "DK Metcalf", 
      WR2: "Jaxon Smith-Njigba", TE: "Noah Fant"
    },
    "Houston Texans": {
      QB: "C.J. Stroud", RB: "Joe Mixon", WR1: "Nico Collins", 
      WR2: "Tank Dell", TE: "Dalton Schultz"
    },
    "Cincinnati Bengals": {
      QB: "Joe Burrow", RB: "Chase Brown", WR1: "Ja'Marr Chase", 
      WR2: "Tee Higgins", TE: "Mike Gesicki"
    },
    "Miami Dolphins": {
      QB: "Tua Tagovailoa", RB: "De'Von Achane", WR1: "Tyreek Hill", 
      WR2: "Jaylen Waddle", TE: "Jonnu Smith"
    },
    "Arizona Cardinals": {
      QB: "Kyler Murray", RB: "James Conner", WR1: "Marvin Harrison Jr.", 
      WR2: "Michael Wilson", TE: "Trey McBride"
    },
    "Indianapolis Colts": {
      QB: "Anthony Richardson", RB: "Jonathan Taylor", WR1: "Michael Pittman Jr.", 
      WR2: "Josh Downs", TE: "Kylen Granson"
    },
    "Dallas Cowboys": {
      QB: "Dak Prescott", RB: "Rico Dowdle", WR1: "CeeDee Lamb", 
      WR2: "Jalen Tolbert", TE: "Jake Ferguson"
    },
    "New Orleans Saints": {
      QB: "Spencer Rattler", RB: "Alvin Kamara", WR1: "Chris Olave", 
      WR2: "Rashid Shaheed", TE: "Juwan Johnson"
    },
    "Cleveland Browns": {
      QB: "Jameis Winston", RB: "Nick Chubb", WR1: "Jerry Jeudy", 
      WR2: "Elijah Moore", TE: "David Njoku"
    },
    "Carolina Panthers": {
      QB: "Bryce Young", RB: "Chuba Hubbard", WR1: "Adam Thielen", 
      WR2: "Xavier Legette", TE: "Ja'Tavion Sanders"
    },
    "Tennessee Titans": {
      QB: "Will Levis", RB: "Tony Pollard", WR1: "Calvin Ridley", 
      WR2: "Nick Westbrook-Ikhine", TE: "Chig Okonkwo"
    },
    "Chicago Bears": {
      QB: "Caleb Williams", RB: "D'Andre Swift", WR1: "DJ Moore", 
      WR2: "Rome Odunze", TE: "Cole Kmet"
    },
    "Las Vegas Raiders": {
      QB: "Aidan O'Connell", RB: "Alexander Mattison", WR1: "Jakobi Meyers", 
      WR2: "Tre Tucker", TE: "Brock Bowers"
    },
    "New York Jets": {
      QB: "Aaron Rodgers", RB: "Breece Hall", WR1: "Garrett Wilson", 
      WR2: "Davante Adams", TE: "Tyler Conklin"
    },
    "New York Giants": {
      QB: "Drew Lock", RB: "Tyrone Tracy Jr.", WR1: "Malik Nabers", 
      WR2: "Wan'Dale Robinson", TE: "Theo Johnson"
    },
    "New England Patriots": {
      QB: "Drake Maye", RB: "Rhamondre Stevenson", WR1: "DeMario Douglas", 
      WR2: "Kendrick Bourne", TE: "Hunter Henry"
    },
    "Jacksonville Jaguars": {
      QB: "Mac Jones", RB: "Travis Etienne Jr.", WR1: "Brian Thomas Jr.", 
      WR2: "Parker Washington", TE: "Evan Engram"
    }
  },
  
  NBA: {
    "Boston Celtics": { PG: "Jrue Holiday", SG: "Derrick White", SF: "Jaylen Brown", PF: "Jayson Tatum", C: "Kristaps Porzingis" },
    "Los Angeles Lakers": { PG: "D'Angelo Russell", SG: "Austin Reaves", SF: "LeBron James", PF: "Rui Hachimura", C: "Anthony Davis" },
    "Milwaukee Bucks": { PG: "Damian Lillard", SG: "Gary Trent Jr.", SF: "Khris Middleton", PF: "Giannis Antetokounmpo", C: "Brook Lopez" },
    "Denver Nuggets": { PG: "Jamal Murray", SG: "Christian Braun", SF: "Michael Porter Jr.", PF: "Aaron Gordon", C: "Nikola Jokic" }
  },
  
  MLB: {
    "Los Angeles Dodgers": { SP: "Tyler Glasnow", C: "Will Smith", "1B": "Freddie Freeman", SS: "Mookie Betts", OF: "Teoscar Hernandez" },
    "New York Yankees": { SP: "Gerrit Cole", C: "Jose Trevino", "1B": "Anthony Rizzo", SS: "Anthony Volpe", OF: "Aaron Judge" },
    "Atlanta Braves": { SP: "Chris Sale", C: "Sean Murphy", "1B": "Matt Olson", SS: "Orlando Arcia", OF: "Ronald Acuna Jr." },
    "Houston Astros": { SP: "Framber Valdez", C: "Yainer Diaz", "1B": "Jose Abreu", SS: "Jeremy Pena", OF: "Kyle Tucker" }
  }
};

const UniversalRosterService = {
  /**
   * Get roster for a specific team
   * @param {Object} dynamicRosters - Rosters fetched from backend
   * @param {string} teamName - Full team name
   * @param {string} sport - Sport (NFL, NBA, MLB, etc.)
   * @returns {Object} - Position to player name mapping
   */
  getRosterForTeam(dynamicRosters, teamName, sport) {
    // If dynamic rosters provided and team exists, use those
    if (dynamicRosters && Object.keys(dynamicRosters).length > 0) {
      if (dynamicRosters[teamName]) {
        console.log(`✅ [UniversalRosterService] Using dynamic roster for ${teamName}`);
        return dynamicRosters[teamName];
      }
    }
    
    // Fallback to hardcoded rosters
    const fallbackRoster = CURRENT_ROSTERS[sport]?.[teamName];
    if (fallbackRoster) {
      console.log(`⚠️ [UniversalRosterService] Using fallback roster for ${teamName}`);
      return fallbackRoster;
    }
    
    // No roster found
    console.warn(`⚠️ [UniversalRosterService] No roster found for ${teamName} (${sport})`);
    return {};
  },

  /**
   * Get all rosters for a sport
   * @param {string} sport - Sport (NFL, NBA, MLB, etc.)
   * @returns {Object} - All teams and their rosters
   */
  getAllRostersForSport(sport) {
    return CURRENT_ROSTERS[sport] || {};
  }
};

export default UniversalRosterService;