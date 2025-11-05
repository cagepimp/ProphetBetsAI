# ProphetBetsAI - Complete AI Learning System Schema

## Overview

This document describes the complete database schema for ProphetBetsAI's machine learning system. The system learns from 2020-2024 historical data to identify winning patterns, particularly focusing on defensive props, line movements, injury impacts, and team trends.

---

## Core Tables

### 1. `historical_games`
**Purpose:** Store complete game data from 2020-2024 for training

**Key Fields:**
- **Basic Info:** sport, season, week, game_date, teams, scores
- **Odds Data:** moneyline, spread, total (opening and closing)
- **Line Movements:** JSONB array tracking line changes over time
- **Team Stats:** Pre-game offensive/defensive ratings, pace
- **Injuries:** JSONB arrays of injured players with impact scores
- **Situational:** Days rest, travel distance, win streaks, rivalry flags
- **Weather:** JSONB object (for outdoor sports)
- **Quality:** data_quality_score, verified flag

**Use Cases:**
- Training data for ML models
- Historical analysis
- Pattern discovery
- Backtesting predictions

**Example Query:**
```sql
-- Get all NFL games from 2023 with complete data
SELECT * FROM historical_games
WHERE sport = 'NFL'
  AND season = 2023
  AND verified = true
  AND data_quality_score > 0.8
ORDER BY game_date;
```

---

### 2. `historical_predictions`
**Purpose:** Store all predictions made by the AI with results

**Key Fields:**
- **Prediction:** type (moneyline/spread/total/prop), prediction, confidence
- **Context:** key_factors, the_edge, reasoning
- **Odds:** odds_at_prediction, line_at_prediction
- **Result:** actual_result, was_correct, profit_loss
- **Analysis:** feature_weights (which features drove this prediction)

**Use Cases:**
- Accuracy tracking
- Model validation
- Learning what works
- ROI calculation

**Example Query:**
```sql
-- Calculate accuracy by confidence band
SELECT
  CASE
    WHEN confidence_score >= 80 THEN 'High (80+)'
    WHEN confidence_score >= 60 THEN 'Medium (60-79)'
    ELSE 'Low (<60)'
  END as confidence_band,
  COUNT(*) as total_predictions,
  SUM(CASE WHEN was_correct THEN 1 ELSE 0 END) as correct,
  ROUND(AVG(CASE WHEN was_correct THEN 100.0 ELSE 0 END), 2) as accuracy_pct,
  ROUND(SUM(profit_loss), 2) as total_profit
FROM historical_predictions
WHERE verified_at IS NOT NULL
GROUP BY confidence_band;
```

---

### 3. `model_versions`
**Purpose:** Track different iterations of the AI model

**Key Fields:**
- **Identity:** version_name, version_number
- **Architecture:** architecture type, hyperparameters
- **Training:** training data range, samples, duration
- **Performance:** accuracy by type (moneyline, spread, total, props), ROI
- **Specializations:** defensive_prop_accuracy, injury_impact_accuracy, line_movement_accuracy
- **Status:** training/testing/active/retired, is_production flag

**Use Cases:**
- Model versioning
- A/B testing
- Performance comparison
- Rollback capability

**Example Query:**
```sql
-- Compare top 3 models by ROI
SELECT
  version_name,
  overall_accuracy,
  roi,
  defensive_prop_accuracy,
  status
FROM model_versions
WHERE status IN ('active', 'testing')
ORDER BY roi DESC
LIMIT 3;
```

---

### 4. `model_weights`
**Purpose:** Store trained neural network weights

**Key Fields:**
- **Weights:** weights_format, weights_data (JSONB), weights_url (for large models)
- **Architecture:** layer_config, input_shape, output_shape
- **Size:** weights_size_bytes

**Storage Strategy:**
- Small models (<10MB): Store in `weights_data` JSONB
- Large models (>10MB): Store in Supabase Storage, reference with `weights_url`

**Use Cases:**
- Model persistence
- Reloading trained models
- Model deployment
- Version control

---

### 5. `training_sessions`
**Purpose:** Track individual training runs

**Key Fields:**
- **Configuration:** epochs, batch_size, learning_rate
- **Progress:** current_epoch, status, epoch_metrics (array)
- **Results:** final_loss, accuracy scores (train/val/test)
- **Time:** started_at, completed_at, duration_seconds
- **Logs:** training_log, error_message

**Use Cases:**
- Monitor active training
- Debug failed runs
- Optimize hyperparameters
- Training history

**Example Query:**
```sql
-- Recent training sessions with results
SELECT
  ts.id,
  mv.version_name,
  ts.status,
  ts.final_accuracy,
  ts.validation_accuracy,
  ts.duration_seconds,
  ts.completed_at
FROM training_sessions ts
JOIN model_versions mv ON ts.model_version_id = mv.id
WHERE ts.status = 'completed'
ORDER BY ts.completed_at DESC
LIMIT 10;
```

---

## Learning Tables

### 6. `feature_importance`
**Purpose:** Track which features matter most for predictions

**Key Fields:**
- **Feature:** feature_name, feature_category
- **Importance:** importance_score (0-1), importance_rank
- **Correlation:** positive_correlation, correlation_strength
- **Examples:** key_games JSONB array

**Categories:**
- `team_stats`: Offensive/defensive ratings, pace
- `injury`: Injury impact scores
- `line_movement`: Opening vs closing line
- `weather`: Temperature, wind, precipitation
- `situational`: Rest, travel, streaks

**Use Cases:**
- Feature selection
- Model interpretation
- Pattern discovery
- User insights

**Example Query:**
```sql
-- Top 10 most important features for NFL
SELECT
  feature_name,
  feature_category,
  importance_score,
  importance_rank
FROM feature_importance
WHERE sport = 'NFL'
ORDER BY importance_score DESC
LIMIT 10;
```

---

### 7. `learning_patterns`
**Purpose:** Discovered patterns that consistently win

**Key Fields:**
- **Identity:** pattern_name, pattern_type
- **Definition:** conditions (JSONB rules), description
- **Performance:** accuracy_rate, roi, total_profit
- **Validation:** validation_status, confidence_threshold
- **Examples:** example_games JSONB array

**Pattern Types:**
- `defensive_prop`: Strong defensive matchups
- `line_movement`: Sharp money indicators
- `injury_impact`: Key player out scenarios
- `team_trend`: Hot/cold streaks
- `situational`: Rest, travel, division games

**Use Cases:**
- Auto-generate predictions
- Alert on pattern matches
- Validate new patterns
- Pattern evolution tracking

**Example Pattern:**
```json
{
  "pattern_name": "Elite Defense vs Weak Offense Under",
  "pattern_type": "defensive_prop",
  "conditions": {
    "home_defensive_rating": {"$gte": 110},
    "away_offensive_rating": {"$lte": 95},
    "total": {"$gte": 215}
  },
  "accuracy_rate": 68.5,
  "roi": 12.3,
  "confidence_threshold": 65.0
}
```

---

### 8. `accuracy_metrics`
**Purpose:** Time-series tracking of model performance

**Key Fields:**
- **Period:** metric_date, metric_period (daily/weekly/monthly)
- **Volume:** total_predictions, predictions by type
- **Accuracy:** Correct/total for each bet type
- **Financial:** total_profit, roi
- **Confidence Bands:** High/medium/low confidence accuracy
- **Specializations:** defensive_props, injury_factor, line_movement accuracy

**Use Cases:**
- Performance dashboards
- Trend analysis
- Alert on declining performance
- Marketing/transparency

**Example Query:**
```sql
-- Weekly performance for last 12 weeks
SELECT
  metric_date,
  total_predictions,
  ROUND(AVG(
    calculate_accuracy(
      moneyline_correct + spread_correct + total_correct + prop_correct,
      moneyline_total + spread_total + total_total + prop_total
    )
  ), 2) as overall_accuracy,
  ROUND(SUM(total_profit), 2) as weekly_profit,
  ROUND(AVG(roi), 2) as avg_roi
FROM accuracy_metrics
WHERE metric_period = 'weekly'
  AND metric_date >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY metric_date
ORDER BY metric_date DESC;
```

---

## Analysis Tables

### 9. `line_movement_analysis`
**Purpose:** Learn from betting line movements

**Key Fields:**
- **Movement:** opening_line, closing_line, direction, magnitude
- **Sharp Money:** sharp_money_indicator, reverse_line_movement
- **Public vs Sharp:** public_percentage, money_percentage
- **Timeline:** movements JSONB array with timestamps
- **Pattern:** movement_pattern (steam, reverse, steady_drift)
- **Result:** covering_side, movement_predicted_correctly

**Movement Patterns:**
- **Steam Move:** Rapid 1-2 point movement in minutes
- **Reverse Line Movement:** Line moves against public betting %
- **Steady Drift:** Slow consistent movement over hours/days
- **Late Sharp:** Movement in final 1-2 hours before game

**Use Cases:**
- Identify sharp money
- Predict line movement
- Time bet placement
- Detect market inefficiencies

**Example Query:**
```sql
-- Find reverse line movements that won
SELECT
  lma.id,
  hg.home_team,
  hg.away_team,
  lma.opening_line,
  lma.closing_line,
  lma.public_percentage,
  lma.money_percentage,
  lma.covering_side
FROM line_movement_analysis lma
JOIN historical_games hg ON lma.game_id = hg.id
WHERE lma.reverse_line_movement = true
  AND lma.movement_predicted_correctly = true
ORDER BY hg.game_date DESC
LIMIT 20;
```

---

### 10. `injury_impact_analysis`
**Purpose:** Learn how injuries affect outcomes

**Key Fields:**
- **Player:** player_name, position, injury_type, injury_severity
- **Importance:** player_value_score, minutes/points per game
- **Impact:** predicted_impact, actual_point_differential
- **Market:** line_adjustment, odds_adjustment, market_overreaction
- **Result:** team_covered, injury_was_factor
- **Learning:** similar_scenarios JSONB array

**Use Cases:**
- Injury impact prediction
- Identify market overreactions
- Position-specific patterns
- Historical comparisons

**Example Query:**
```sql
-- Find games where market overreacted to injuries
SELECT
  iia.player_name,
  iia.position,
  iia.player_value_score,
  iia.line_adjustment,
  iia.predicted_impact,
  iia.actual_point_differential,
  hg.home_team,
  hg.away_team
FROM injury_impact_analysis iia
JOIN historical_games hg ON iia.game_id = hg.id
WHERE iia.market_overreaction = true
  AND iia.team_covered = true
ORDER BY hg.game_date DESC;
```

---

### 11. `team_trends`
**Purpose:** Long-term team performance patterns

**Key Fields:**
- **Record:** wins, losses, ties
- **ATS:** ats_wins, ats_losses, ats_percentage
- **Totals:** overs, unders, over_percentage
- **Situational:** home/away/division records
- **Form:** recent_form, momentum_score
- **Value:** closing_line_value, market over/undervalued

**Use Cases:**
- Team strength assessment
- Situational betting edges
- Market value identification
- Trend following/fading

**Example Query:**
```sql
-- Find undervalued teams (beat closing line consistently)
SELECT
  team_name,
  ats_percentage,
  closing_line_value,
  recent_form,
  momentum_score
FROM team_trends
WHERE season = 2024
  AND sport = 'NFL'
  AND market_undervalued = true
  AND ats_percentage >= 55
ORDER BY closing_line_value DESC;
```

---

### 12. `model_comparison`
**Purpose:** Compare different model versions head-to-head

**Key Fields:**
- **Models:** model_a_id, model_b_id
- **Test Period:** test_period_start, test_period_end, total_games
- **Results:** Accuracy and ROI for each model
- **Agreement:** both_correct, both_incorrect, agreement_rate
- **Disagreements:** only_a_correct, only_b_correct
- **Winner:** winner, recommendation

**Use Cases:**
- A/B testing
- Model selection
- Ensemble creation
- Production deployment decisions

**Example Query:**
```sql
-- Compare current production model vs new challenger
SELECT
  mc.comparison_name,
  mva.version_name as model_a,
  mvb.version_name as model_b,
  mc.model_a_accuracy,
  mc.model_b_accuracy,
  mc.model_a_roi,
  mc.model_b_roi,
  mc.winner,
  mc.recommendation
FROM model_comparison mc
JOIN model_versions mva ON mc.model_a_id = mva.id
JOIN model_versions mvb ON mc.model_b_id = mvb.id
ORDER BY mc.analyzed_at DESC
LIMIT 5;
```

---

## Helper Functions

### `calculate_accuracy(correct, total)`
Returns accuracy percentage (0-100)

```sql
SELECT calculate_accuracy(68, 100); -- Returns 68.00
```

### `calculate_roi(profit, wagered)`
Returns ROI percentage

```sql
SELECT calculate_roi(1250, 10000); -- Returns 12.50 (12.5% ROI)
```

---

## Data Flow

### Training Pipeline

1. **Data Collection** → `historical_games`
   - Import games from 2020-2024
   - Add odds, injuries, stats
   - Verify data quality

2. **Feature Engineering**
   - Calculate derived features
   - Normalize data
   - Create training features

3. **Model Training** → `training_sessions`
   - Train neural network
   - Track metrics per epoch
   - Save best model

4. **Save Model** → `model_weights`
   - Serialize model
   - Store weights
   - Link to version

5. **Analyze Features** → `feature_importance`
   - Calculate SHAP values
   - Rank features
   - Identify patterns

6. **Pattern Discovery** → `learning_patterns`
   - Find winning conditions
   - Validate patterns
   - Set confidence thresholds

### Prediction Pipeline

1. **New Game Data** → Fetch from APIs
2. **Feature Extraction** → Calculate same features as training
3. **Model Inference** → Load weights, predict
4. **Store Prediction** → `historical_predictions`
5. **Pattern Matching** → Check against `learning_patterns`
6. **Verify Result** → Update `was_correct`, `profit_loss`
7. **Update Metrics** → `accuracy_metrics`

### Learning Loop

1. **Daily:**
   - Verify yesterday's predictions
   - Update accuracy metrics
   - Check for declining performance

2. **Weekly:**
   - Retrain on new data
   - Discover new patterns
   - Update feature importance

3. **Monthly:**
   - Major model comparison
   - Deploy new version if better
   - Archive old models

---

## Security & Access

### Row Level Security (RLS)

- **Admin Full Access:** All tables
- **Public Read:** Active models, accuracy metrics, active learning patterns
- **No Public Write:** All learning system tables protected

### API Access Patterns

```javascript
// Admin: Train new model
const { data, error } = await supabase
  .from('training_sessions')
  .insert({
    model_version_id: modelId,
    session_type: 'incremental',
    training_samples: 5000
  });

// Public: Get active model accuracy
const { data, error } = await supabase
  .from('accuracy_metrics')
  .select('*')
  .eq('model_version_id', activeModelId)
  .order('metric_date', { ascending: false })
  .limit(30);
```

---

## Indexes for Performance

All tables have appropriate indexes:
- Foreign keys
- Date ranges
- Status flags
- Composite queries (sport + season + date)

**Most Important:**
```sql
-- Fast game lookups
idx_historical_games_composite (sport, season, game_date, verified)

-- Fast prediction queries
idx_historical_predictions_accuracy (was_correct, confidence_score)

-- Fast pattern searches
idx_learning_patterns_active (is_active, pattern_type, sport)
```

---

## Next Steps

1. **Run Migration:** Apply `20250104000000_ai_learning_system.sql`
2. **Import Historical Data:** Load 2020-2024 games
3. **Build ML Training System:** TensorFlow.js implementation
4. **Create Training Dashboard:** Monitor progress
5. **Set up Automated Verification:** Daily result checking

---

## Schema Statistics

- **12 Core Tables**
- **50+ Indexes** for performance
- **2 Helper Functions** for calculations
- **RLS Policies** for security
- **Supports 1M+ games** with efficient queries
- **Scales to 10M+ predictions**

---

## Questions?

This schema is designed to support:
- ✅ Historical game storage (2020-2024)
- ✅ ML model training & versioning
- ✅ Prediction tracking & verification
- ✅ Pattern discovery & learning
- ✅ Feature importance analysis
- ✅ Injury & line movement learning
- ✅ Team trend analysis
- ✅ Model comparison & A/B testing
- ✅ Performance monitoring
- ✅ Self-improving algorithms

Ready to build the ML training system next!
