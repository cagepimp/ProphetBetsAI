# ProphetBets AI - Feature Documentation

## 🎯 Core Features

### 1. Enhanced Home Dashboard
**Location:** `src/pages/Home.jsx`

- **Live Predictions Feed** - Real-time top picks with 65%+ confidence
- **Performance Tracker** - 30-day and 7-day accuracy metrics
- **Trending Props** - High-confidence player prop highlights
- **Sports Navigation** - Quick access to all 6 sports (NFL, CFB, NBA, MLB, UFC, Golf)
- **Performance Stats** - Overall accuracy, recent form, and best performing sport

### 2. Game Analysis Dashboard
**Location:** `src/components/analysis/GameAnalysisDashboard.jsx`

**Features:**
- Overall confidence scoring (combines spread + total confidence)
- Tabbed interface with 4 analysis sections:
  - **Overview**: Spread and total picks with reasoning
  - **Key Factors**: Quantified analysis factors
  - **AI Insights**: Weather, injuries, trends, matchup analysis
  - **Recommendation**: Final betting recommendation with confidence levels

**Confidence Levels:**
- 70%+: Strong Play
- 60-69%: Moderate Play
- <60%: Proceed with Caution

### 3. Prop Bet Analyzer
**Location:** `src/components/props/PropBetAnalyzer.jsx`

**Advanced Statistical Analysis:**
- Hit rate calculation over last 10 games
- Average performance vs line comparison
- Recent trend analysis (last 3 vs older games)
- Consistency scoring (coefficient of variation)
- Performance visualization with bar charts
- Confidence scoring algorithm (0-100%)

**Recommendations:**
- STRONG OVER: 70%+ confidence, 70%+ hit rate
- LEAN OVER: 65%+ confidence, 60%+ hit rate
- STRONG UNDER: 70%+ confidence, ≤30% hit rate
- LEAN UNDER: 65%+ confidence, ≤40% hit rate

### 4. Injury Impact Analyzer
**Location:** `src/components/injuries/InjuryImpactAnalyzer.jsx`

**Comprehensive Injury Analysis:**
- Overall injury impact scoring (0-100)
- Position-based importance weighting
- Offensive vs defensive impact breakdown
- Key player injury highlights
- Automated betting recommendations based on injury severity

**Impact Categories:**
- **Critical**: 100+ impact score - Multiple key injuries
- **High**: 60-99 - Major injury concerns
- **Moderate**: 30-59 - Some impact expected
- **Low**: <30 - Minimal impact

**Position Impact Weights:**
- NFL QB: 40 pts, CB: 20 pts, RB: 20 pts, WR: 15 pts
- NBA C/PG: 25 pts, Other positions: 20 pts
- MLB SP: 35 pts, C: 20 pts, Position players: 15 pts

### 5. Bankroll Management Tool
**Location:** `src/components/strategy/BankrollManager.jsx`

**Money Management Features:**
- Starting bankroll tracking
- Current balance with profit/loss percentage
- Unit size calculation (1% of bankroll)
- Kelly Criterion-inspired bet sizing:
  - 80%+ confidence: 3 units
  - 70-79%: 2 units
  - 60-69%: 1.5 units
  - 55-59%: 1 unit
  - <55%: 0.5 units

**Performance Metrics:**
- Win/Loss record
- Win rate percentage
- ROI calculation
- Total profit/loss
- Bankroll health indicator
- Pending vs settled bet tracking

**Wager Management:**
- Place new wagers with confidence levels
- Track spread, moneyline, total, prop, and parlay bets
- Settle bets (win/loss) with payout tracking
- Recent wager history
- Local storage persistence

### 6. Odds Comparison Tool
**Location:** `src/components/odds/OddsComparison.jsx`

**Multi-Sportsbook Comparison:**
- Compares 4 major sportsbooks: DraftKings, FanDuel, BetMGM, Caesars
- Markets: Spread, Moneyline, Total
- Best odds highlighting
- Line shopping recommendations
- Visual indicators for value

### 7. Line Movement Tracker
**Location:** `src/components/odds/LineMovementTracker.jsx`

**Real-Time Line Analysis:**
- 24-hour line movement visualization
- Chart displays last 10 data points
- Movement indicators (up/down/stable)
- Percentage change calculations
- Sportsbook-specific tracking
- Opening vs current line comparison
- Update count tracking

### 8. Team Roster Viewer
**Location:** `src/components/rosters/TeamRosterViewer.jsx`

**Complete Player Database:**
- Full roster for all teams (NFL, NBA, MLB, NHL)
- Player search functionality
- Position filtering
- Player details: Jersey number, height, weight, experience
- Injury status indicators
- Team logos from ESPN
- Modal dialog interface

### 9. Live Predictions Feed
**Location:** `src/components/home/LivePredictionsFeed.jsx`

**Today's Top Picks:**
- Fetches games with 65%+ confidence
- Displays away @ home matchups
- Confidence badges (High/Medium/Low)
- Game time display
- Sport emojis
- Recommended bet preview
- Manual refresh button

### 10. Performance Tracker
**Location:** `src/components/home/PerformanceTracker.jsx`

**Statistical Tracking:**
- Overall accuracy (last 30 days)
- Recent form (last 7 days)
- Best performing sport
- Record display (W-L)
- Progress bar visualizations
- Trend indicators (up/down/stable)

### 11. Trending Props Widget
**Location:** `src/components/home/TrendingProps.jsx`

**Hot Props Display:**
- Shows props with 70%+ confidence
- Categorized by prop type with icons
- Player name, team, sport info
- Confidence ratings
- Over/Under recommendations
- Direct link to full props page

## 🏗️ Technical Architecture

### Data Layer
- **Base44 SDK** integration for backend API calls
- Real-time data fetching from entities:
  - Game
  - Player
  - PlayerProp
  - Injury
  - Prediction
  - LineHistory
  - PlayerGameStats

### Component Structure
```
src/
├── components/
│   ├── analysis/        # Game analysis components
│   ├── home/           # Home page widgets
│   ├── injuries/       # Injury analysis
│   ├── odds/           # Odds comparison & line movement
│   ├── props/          # Prop bet analysis
│   ├── rosters/        # Team roster viewers
│   ├── strategy/       # Bankroll management
│   ├── ui/             # Shadcn UI components
│   ├── cards/          # Game and prop cards
│   ├── dashboard/      # Dashboard widgets
│   └── data/           # Team data (NFL, NBA, MLB, NHL)
├── pages/              # 34 page components
└── api/                # Base44 client & functions
```

### Styling
- **Tailwind CSS** for utility-first styling
- **Shadcn UI** component library
- Gradient themes (purple, pink, cyan, green)
- Dark mode optimized
- Responsive design (mobile-first)

### State Management
- React hooks (useState, useEffect)
- Local storage for persistence (bankroll)
- Context API for auth (Base44Context)

## 📊 Sports Covered

1. **NFL** - Professional Football
2. **CFB** - College Football (Power 5)
3. **NBA** - Basketball
4. **MLB** - Baseball
5. **UFC** - Mixed Martial Arts
6. **Golf** - PGA Tour

## 🎨 UI/UX Features

### Design System
- **Color Palette:**
  - Purple/Pink gradients for primary actions
  - Green for positive metrics/wins
  - Red for negative metrics/losses
  - Yellow/Orange for warnings
  - Cyan/Blue for information

### Animations
- Pulse effects on live data
- Hover transitions
- Progress bar animations
- Loading spinners
- Card hover effects

### Accessibility
- Clear labels and descriptions
- Color-blind friendly indicators
- Keyboard navigation support
- Screen reader compatible

## 🔒 Security & Best Practices

- Input validation on all forms
- XSS protection (React escaping)
- HTTPS-only API calls
- Secure authentication via Base44
- No sensitive data in localStorage
- Error boundaries for graceful failures

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interfaces
- Optimized for tablets and phones

## 🚀 Performance

- Code splitting with dynamic imports
- Lazy loading for heavy components
- Optimized re-renders with React.memo
- Efficient data fetching with Base44
- Local caching where appropriate
- Build size: 744.95 kB (188.05 kB gzipped)

## 🔄 Real-Time Features

- Live odds updates
- Real-time line movement
- Current game status
- Injury report updates
- Performance stat tracking

## 📈 Analytics & Tracking

- Win/Loss records
- Accuracy percentages
- ROI calculations
- Bankroll progression
- Bet history
- Performance trends

## 🎓 Educational Features

- Betting strategy tips
- Line shopping guidance
- Bankroll management education
- Injury impact explanations
- Confidence level interpretations
- Risk management recommendations

## 🛠️ Developer Tools

### Admin Pages
- **AdminDevTools**: Main automation dashboard
- **ManualTools**: Search & manually grade games
- **MultiSportOdds**: Training data & grading
- **PredictionHistory**: Analyze past predictions
- **HistoricalDataPanel**: 5-year database manager
- **Diagnostics**: Advanced debugging

### Debug Features
- Real-time logging
- API response inspection
- Database status checks
- Cache debugging
- Performance monitoring

## 📦 Component Reusability

All components are designed to be:
- **Modular**: Can be used independently
- **Configurable**: Accept props for customization
- **Documented**: Clear prop types and usage
- **Tested**: Error handling built-in
- **Styled**: Consistent design system

## 🎯 Future Enhancement Opportunities

1. **Machine Learning Integration**
   - Advanced prediction models
   - Pattern recognition
   - Automated learning from results

2. **Social Features**
   - Share picks with community
   - Leaderboards
   - Expert following

3. **Advanced Analytics**
   - EV calculations
   - Market efficiency analysis
   - Sharp vs public money tracking
   - Steam moves detection

4. **More Markets**
   - International sports
   - Esports
   - Live betting
   - In-game props

5. **Mobile App**
   - React Native version
   - Push notifications
   - Offline mode

## 📝 Component Props Reference

### GameAnalysisDashboard
```jsx
<GameAnalysisDashboard
  game={gameObject}  // Game entity with analysis
  onClose={callback} // Close handler
/>
```

### PropBetAnalyzer
```jsx
<PropBetAnalyzer
  playerId="player_123"
  propType="passing_yards"
  line={250.5}
  sport="NFL"
/>
```

### InjuryImpactAnalyzer
```jsx
<InjuryImpactAnalyzer
  gameId="game_456"
  team="Kansas City Chiefs"
  sport="NFL"
/>
```

### BankrollManager
```jsx
<BankrollManager />  // No props - self-contained
```

### OddsComparison
```jsx
<OddsComparison
  game={gameObject}  // Game with markets data
/>
```

### LineMovementTracker
```jsx
<LineMovementTracker
  game={gameObject}  // Game entity
/>
```

### TeamRosterViewer
```jsx
<TeamRosterViewer
  sport="NFL"
  teamName="Kansas City Chiefs"
/>
```

## 🌟 Key Differentiators

1. **Multi-Factor Analysis**: Combines 7+ factors for each prediction
2. **10K+ Iterations**: Each prediction runs thousands of simulations
3. **Real-Time Data**: Live odds, injuries, and line movements
4. **Bankroll Management**: Built-in money management tools
5. **Injury Impact**: Automated injury analysis with betting adjustments
6. **Line Shopping**: Multi-sportsbook comparison for best value
7. **Performance Tracking**: Complete bet history and analytics
8. **Educational**: Built-in strategy tips and explanations
