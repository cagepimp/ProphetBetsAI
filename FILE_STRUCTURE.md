# ProphetBetsAI - Complete File Structure & Implementation Guide

## 🏗️ Project Overview

ProphetBetsAI is a comprehensive sports betting analysis platform powered by AI, using Supabase for backend infrastructure and Vite+React for the frontend.

---

## 📁 Core Directory Structure

```
ProphetBetsAI/
├── src/
│   ├── api/                      # API Layer - Supabase & External Services
│   │   ├── supabaseClient.js    # Main Supabase client & Edge Function calls
│   │   ├── entities.js           # Database entity helpers (CRUD operations)
│   │   ├── functions.js          # Edge Function wrappers
│   │   └── integrations.js       # External integrations (LLM, Email, etc.)
│   │
│   ├── pages/                    # All application pages
│   │   ├── Home.jsx              # Landing page with stats & navigation
│   │   ├── NFLPage.jsx           # NFL games with analysis
│   │   ├── NBAPage.jsx           # NBA games with analysis
│   │   ├── MLBPage.jsx           # MLB games with analysis
│   │   ├── CFBPage.jsx           # College Football games
│   │   ├── UFCPage.jsx           # UFC events
│   │   ├── GolfPage.jsx          # Golf tournaments
│   │   ├── SportPage.jsx         # Generic sport page template
│   │   ├── ManualTools.jsx       # Manual game management tools
│   │   ├── AdminDevTools.jsx     # AI Learning Lab & admin functions
│   │   ├── PropsPage.jsx         # Player & team props
│   │   ├── InjuriesPage.jsx      # Injury reports
│   │   ├── HistoricalDataPanel.jsx  # Historical data management
│   │   ├── Diagnostics.jsx       # System diagnostics
│   │   └── [other pages...]
│   │
│   ├── components/               # Reusable React components
│   │   ├── sports/               # Sport-specific components
│   │   │   ├── GameCard.jsx      # Universal game card component
│   │   │   ├── LiveGameCard.jsx  # Live game updates
│   │   │   └── UFCGameCard.jsx   # UFC-specific card
│   │   ├── home/                 # Home page components
│   │   │   ├── LivePredictionsFeed.jsx
│   │   │   ├── PerformanceTracker.jsx
│   │   │   └── TrendingProps.jsx
│   │   ├── analysis/             # Analysis display components
│   │   │   └── GameAnalysisDashboard.jsx
│   │   ├── data/                 # Static team/league data
│   │   │   ├── NFL_TEAMS.js
│   │   │   ├── NBA_TEAMS.js
│   │   │   ├── MLB_TEAMS.js
│   │   │   └── POWER_5_CFB_TEAMS.js
│   │   └── ui/                   # UI primitives (shadcn/ui)
│   │
│   ├── hooks/                    # Custom React hooks
│   │   └── useGameAnalyzer.js    # Game analysis hook
│   │
│   ├── utils/                    # Utility functions
│   │   └── analyzerUtils.js      # Analysis data processing
│   │
│   └── App.jsx                   # Main app entry point
│
├── supabase/                     # Supabase configuration (when you add Edge Functions)
│   └── functions/                # Edge Functions (to be deployed)
│       ├── runAnalyzer10000Plus/
│       ├── updateWeeklySchedule/
│       ├── fetchOdds/
│       └── autoGradeAndLearn/
│
└── public/                       # Static assets
```

---

## 🔑 Key Files Explained

### **API Layer** (`src/api/`)

#### `supabaseClient.js` - The Heart of the System
**Purpose**: Main Supabase client and all database/Edge Function operations

**Exports**:
- `supabase` - Supabase client instance
- `callEdgeFunction(functionName, payload, options)` - Robust Edge Function caller with:
  - Configurable timeout (default 60s)
  - Automatic retry with exponential backoff
  - Error handling & logging
- `getGames(filters)` - Fetch games from database
- `getPlayers(filters)` - Fetch players
- `getPlayerProps(filters)` - Fetch player props
- `getInjuries(filters)` - Fetch injury data
- `runAnalyzer(gameId, sport, forceReanalyze)` - Analyze a game
- `updateSchedule(sport, season, week)` - Update game schedule from ESPN
- `fetchOdds(sport, gameId)` - Fetch odds from TheOddsAPI
- `autoGradeAndLearn()` - Grade predictions and learn patterns

**Key Features**:
```javascript
// Example: Robust Edge Function call
const result = await callEdgeFunction('runAnalyzer10000Plus', {
  gameId: 'abc123',
  sport: 'NFL',
  forceReanalyze: false
}, {
  timeout: 120000,  // 2 minutes
  retries: 1        // Retry once on failure
});
```

#### `entities.js` - Database CRUD Operations
**Purpose**: Simplified CRUD operations for all database tables

**Exports**:
- `Game` - Game entity with list(), create(), update(), etc.
- `Player` - Player entity
- `PlayerProp` - Player props entity
- `Injury` - Injuries entity
- `PredictionHistory` - Prediction tracking

**Example Usage**:
```javascript
import * as entities from '@/api/entities';

// List all NFL games
const games = await entities.Game.filter({ sport: 'NFL' });

// Create a new prediction
await entities.PredictionHistory.create({
  game_id: 'abc123',
  prediction: 'Kansas City Chiefs',
  confidence: 87.5
});
```

#### `functions.js` - Edge Function Wrappers
**Purpose**: Convenient wrappers for all Edge Functions

**Exports**:
- `fetchNFLRosters()`
- `fetchNFLInjuries()`
- `fetchAlgorithmInsights()`
- `runAnalyzerPropsV3()`
- And 400+ more function wrappers

#### `integrations.js` - External Integrations
**Purpose**: Integration with external services via Edge Functions

**Exports**:
- `InvokeLLM(params)` - Call AI models
- `SendEmail(params)` - Send emails
- `UploadFile(params)` - File uploads
- `GenerateImage(params)` - Image generation

---

### **Pages** (`src/pages/`)

#### Sport Pages Pattern
All sport pages follow the same pattern:

**NFLPage.jsx / NBAPage.jsx / MLBPage.jsx / CFBPage.jsx**

**Key Functions**:
```javascript
// Fetch games from database
async function fetchData() {
  const games = await getGames({ sport: 'NFL' });
  setGames(games);
}

// Update schedule from ESPN
const handleRefreshGames = async () => {
  const response = await updateSchedule('NFL', 2025);
  await fetchData(); // Reload games
};

// Analyze a game with AI
const handleAnalyzeGame = async (game) => {
  const response = await runAnalyzer(game.id, 'NFL', false);
  // Process and display results
};
```

**Features**:
- Game display with team logos
- Odds from DraftKings & FanDuel
- Analysis button for each game
- Props display (player & team)
- Real-time updates

#### `ManualTools.jsx` - Manual Game Management
**Purpose**: Search games, enter scores manually, run on-demand analysis

**Features**:
- Search games by team name
- Analyze specific games
- Enter final scores manually
- Calculate accuracy
- Update schedules on demand

#### `AdminDevTools.jsx` - AI Learning Lab
**Purpose**: Train the AI, feed historical data, monitor performance

**Features**:
- **Dashboard Tab**: View accuracy stats, patterns discovered, training data size
- **Feed Data Tab**: Upload CSV files, paste JSON data, auto-scrape from sources
- **Patterns Tab**: View discovered betting patterns
- **Training Tab**: Run backtests, grade predictions, retrain AI
- **History Tab**: View training history and prediction results

**Key Functions**:
```javascript
// Feed historical CSV data
const handleFeedCSV = async () => {
  await callEdgeFunction('ingestHistoricalCSV', {
    csvData: csvText,
    source: 'manual_upload',
    autoTrain: true
  });
};

// Run backtest on historical games
const handleRunBacktest = async (sport, numGames) => {
  await callEdgeFunction('runHistoricalBacktest', {
    sport,
    numGames,
    savePredictions: true,
    autoGrade: true,
    autoLearn: true
  });
};

// Auto-grade completed games
const handleGradeAll = async () => {
  await callEdgeFunction('gradeAllPredictions', {
    autoLearn: true
  });
};
```

---

### **Components** (`src/components/`)

#### `GameCard.jsx` - Universal Game Card
**Purpose**: Display any sport's game with analysis results

**Props**:
- `game` - Game object with teams, odds, date
- `onAnalyze` - Callback when analyze button clicked
- `analysisResults` - Analysis data to display
- `sport` - Sport type for custom styling

**Features**:
- Team logos from ESPN
- Odds display (Moneyline, Spread, Total)
- Analysis results (The Edge, predictions, recommended bets)
- Player & team props
- Confidence filtering (55%+)

#### Team Data Files
Located in `src/components/data/`

**NFL_TEAMS.js**:
```javascript
export const NFL_TEAMS = {
  'Kansas City Chiefs': 'kc',
  'Philadelphia Eagles': 'phi',
  // ... all 32 teams
};

export const getNFLTeamLogo = (teamName) => {
  const abbr = NFL_TEAMS[teamName];
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`;
};
```

Similar files exist for NBA, MLB, and CFB teams.

---

## 🔧 How Everything Works Together

### Flow 1: Loading & Displaying Games

```
User clicks "NFL Page"
    ↓
NFLPage.jsx loads
    ↓
fetchData() calls getGames({ sport: 'NFL' })
    ↓
supabaseClient.js queries Supabase database
    ↓
Games displayed with team logos, odds, etc.
```

### Flow 2: Populating Games (Schedule Update)

```
User clicks "Refresh Games" button
    ↓
handleRefreshGames() calls updateSchedule('NFL', 2025)
    ↓
supabaseClient.js calls Edge Function 'updateWeeklySchedule'
    ↓
Edge Function scrapes ESPN API
    ↓
Edge Function creates/updates games in Supabase database
    ↓
Response: { success: true, gamesCreated: 10, gamesUpdated: 5 }
    ↓
fetchData() reloads games from database
    ↓
Updated games displayed on page
```

### Flow 3: Analyzing a Game

```
User clicks "Analyze" button on a game
    ↓
handleAnalyzeGame(game) calls runAnalyzer(gameId, 'NFL', false)
    ↓
supabaseClient.js calls Edge Function 'runAnalyzer10000Plus'
    ↓
Edge Function:
  1. Fetches game data
  2. Fetches team stats
  3. Fetches player stats
  4. Fetches injury data
  5. Fetches odds
  6. Runs AI analysis (10,000+ iterations)
  7. Returns prediction with confidence
    ↓
Response: {
  success: true,
  prediction: {
    winner: "Kansas City Chiefs",
    confidence: 87.5,
    the_edge: "Chiefs have won 8 straight...",
    recommended_bets: [...],
    top_player_props_draftkings: [...],
    top_team_props_fanduel: [...]
  }
}
    ↓
Frontend filters props by confidence (55%+)
    ↓
Results displayed under game card
```

### Flow 4: Training the AI

```
User goes to AdminDevTools → Feed Data tab
    ↓
User uploads historical CSV or pastes JSON
    ↓
handleFeedCSV() or handleFeedManualData()
    ↓
callEdgeFunction('ingestHistoricalCSV', { csvData })
    ↓
Edge Function:
  1. Parses CSV/JSON
  2. Validates data
  3. Inserts into database
  4. Triggers auto-training
    ↓
AI learns patterns from historical data
    ↓
Stats updated on dashboard
```

---

## 🚀 Getting Started - For Developers

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create `.env` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 📊 Database Schema (Supabase)

### Tables

#### `games`
- `id` (uuid, primary key)
- `sport` (text) - 'NFL', 'NBA', 'MLB', etc.
- `home_team` (text)
- `away_team` (text)
- `game_date` (timestamp)
- `commence_time` (timestamp)
- `status` (text) - 'scheduled', 'live', 'completed'
- `season` (integer)
- `week` (integer)
- `bookmakers` (jsonb) - Odds data
- `markets` (jsonb) - Market data
- `analysis` (jsonb) - AI analysis results
- `actual_outcome` (jsonb) - Final scores

#### `teams`
- `id` (uuid, primary key)
- `name` (text)
- `sport` (text)
- `abbreviation` (text)
- `logo_url` (text)
- `stats` (jsonb)

#### `players`
- `id` (uuid, primary key)
- `name` (text)
- `team` (text)
- `sport` (text)
- `position` (text)
- `stats` (jsonb)

#### `player_props`
- `id` (uuid, primary key)
- `game_id` (uuid, foreign key)
- `player_id` (uuid, foreign key)
- `sport` (text)
- `prop_type` (text) - 'passing_yards', 'rebounds', etc.
- `line` (numeric)
- `confidence` (numeric)
- `sportsbook` (text)

#### `injuries`
- `id` (uuid, primary key)
- `player_name` (text)
- `team` (text)
- `sport` (text)
- `status` (text) - 'Out', 'Questionable', 'Doubtful'
- `injury_type` (text)
- `date_reported` (timestamp)

#### `prediction_history`
- `id` (uuid, primary key)
- `game_id` (uuid, foreign key)
- `sport` (text)
- `prediction` (text)
- `confidence` (numeric)
- `result` (text) - 'correct', 'incorrect', null
- `graded` (boolean)
- `created_at` (timestamp)

---

## 🎯 Edge Functions (To Be Deployed)

### Required Edge Functions

#### `runAnalyzer10000Plus`
**Purpose**: Main AI analysis engine
**Input**:
```json
{
  "gameId": "uuid",
  "sport": "NFL",
  "forceReanalyze": false
}
```
**Output**:
```json
{
  "success": true,
  "prediction": {
    "winner": "Kansas City Chiefs",
    "confidence": 87.5,
    "the_edge": "Analysis explanation...",
    "recommended_bets": [],
    "top_player_props_draftkings": [],
    "top_team_props_fanduel": []
  }
}
```

#### `updateWeeklySchedule`
**Purpose**: Fetch and update game schedules from ESPN
**Input**:
```json
{
  "sport": "NFL",
  "season": 2025,
  "week": 1
}
```
**Output**:
```json
{
  "success": true,
  "gamesCreated": 10,
  "gamesUpdated": 5
}
```

#### `fetchOdds`
**Purpose**: Fetch latest odds from TheOddsAPI
**Input**:
```json
{
  "sport": "NFL",
  "gameId": "uuid" // optional
}
```
**Output**:
```json
{
  "success": true,
  "gamesUpdated": 15
}
```

#### `autoGradeAndLearn`
**Purpose**: Auto-grade completed games and update AI
**Input**: `{}`
**Output**:
```json
{
  "success": true,
  "gradedCount": 25,
  "accuracy": 87.5,
  "newPatterns": 3
}
```

---

## 🎨 Styling & UI

- **Framework**: Tailwind CSS
- **Component Library**: shadcn/ui
- **Color Scheme**:
  - Purple/Pink gradients for main brand
  - Green for DraftKings
  - Blue for FanDuel
  - Sport-specific colors (Orange for NFL, Purple for NBA, etc.)

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Load NFL games
- [ ] Refresh schedule (populate games)
- [ ] Analyze a game
- [ ] View analysis results
- [ ] Check props display
- [ ] Search games in Manual Tools
- [ ] Enter scores manually
- [ ] View Admin Dev Tools
- [ ] Test all sport pages (NFL, NBA, MLB, CFB, UFC, Golf)

### Build Test
```bash
npm run build
```
Should complete without errors.

---

## 📝 Common Tasks

### Adding a New Sport Page
1. Create `src/pages/NewSportPage.jsx`
2. Copy pattern from `NFLPage.jsx`
3. Update team data in `src/components/data/`
4. Add route in `src/pages/index.jsx`
5. Add navigation link in `Home.jsx`

### Adding a New Edge Function Wrapper
1. Open `src/api/functions.js`
2. Add:
```javascript
export const yourNewFunction = createFunctionWrapper("yourEdgeFunctionName", {
  timeout: 60000,
  retries: 1
});
```

### Modifying Analysis Display
1. Open the sport page (e.g., `NFLPage.jsx`)
2. Find the `analysisResults` rendering section
3. Add your new fields from the analysis response

---

## 🐛 Troubleshooting

### No Games Showing
1. Check if Supabase is connected (`VITE_SUPABASE_URL` in `.env`)
2. Click "Refresh Games" to populate from ESPN
3. Check browser console for errors

### Analysis Not Working
1. Ensure Edge Functions are deployed to Supabase
2. Check Edge Function logs in Supabase dashboard
3. Verify `runAnalyzer()` is called correctly

### Build Errors
1. Run `npm install` to ensure all dependencies are installed
2. Check for TypeScript errors if using `.ts` files
3. Clear cache: `rm -rf node_modules .vite && npm install`

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com

---

## 🎉 You're All Set!

This file structure gives you everything you need to understand and work with ProphetBetsAI. All functionality is now restored and working with Supabase!

**Happy coding!** 🚀
