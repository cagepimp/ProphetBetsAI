# ProphetBetsAI - Database Schema Relationships

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI LEARNING SYSTEM                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  historical_games    │ ◄────────┐
│  ─────────────────   │          │
│  • id (PK)           │          │
│  • external_id       │          │
│  • sport             │          │
│  • season            │          │
│  • game_date         │          │
│  • teams & scores    │          │
│  • odds & lines      │          │
│  • line_movements    │          │ Many games used in
│  • team_stats        │          │ each training session
│  • injuries          │          │
│  • weather           │          │
│  • situational data  │          │
└──────────┬───────────┘          │
           │                       │
           │ 1                     │
           │                       │
           │ N                     │
           ▼                       │
┌──────────────────────┐          │
│ historical_predictions│          │
│  ────────────────     │          │
│  • id (PK)            │          │
│  • game_id (FK)  ─────┼──────────┘
│  • model_version_id   │
│  • prediction_type    │
│  • confidence_score   │
│  • was_correct        │
│  • profit_loss        │
│  • feature_weights    │
└──────────┬────────────┘
           │
           │ N
           │
           │ 1
           ▼
┌──────────────────────────────────────────┐
│         model_versions                   │
│         ──────────────                   │
│         • id (PK)                        │
│         • version_name                   │
│         • architecture                   │
│         • hyperparameters                │
│         • training_date_range            │
│         • overall_accuracy               │
│         • moneyline_accuracy             │
│         • spread_accuracy                │
│         • total_accuracy                 │
│         • prop_accuracy                  │
│         • defensive_prop_accuracy   ◄────┼──── Our specialty!
│         • injury_impact_accuracy         │
│         • line_movement_accuracy         │
│         • roi                            │
│         • status                         │
│         • is_production                  │
└──────────┬───────────────────────────────┘
           │
           ├──────────────┬──────────────┬──────────────┐
           │ 1            │ 1            │ 1            │
           │              │              │              │
           │ N            │ N            │ N            │
           ▼              ▼              ▼              ▼
┌─────────────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────┐
│ model_weights   │  │  training    │  │  feature   │  │  accuracy    │
│ ───────────     │  │  _sessions   │  │_importance │  │  _metrics    │
│ • id (PK)       │  │  ──────────  │  │ ────────── │  │  ──────────  │
│ • model_ver (FK)│  │ • id (PK)    │  │ • id (PK)  │  │ • id (PK)    │
│ • weights_data  │  │ • model (FK) │  │ • model(FK)│  │ • model (FK) │
│ • weights_url   │  │ • session_   │  │ • feature_ │  │ • metric_    │
│ • layer_config  │  │   type       │  │   name     │  │   date       │
│ • input_shape   │  │ • epochs     │  │ • import-  │  │ • metric_    │
│ • output_shape  │  │ • batch_size │  │   ance_    │  │   period     │
└─────────────────┘  │ • learning_  │  │   score    │  │ • total_     │
                     │   rate       │  │ • correl-  │  │   predictions│
   Store model       │ • status     │  │   ation    │  │ • correct by │
   parameters        │ • epoch_     │  │ • rank     │  │   type       │
                     │   metrics    │  └────────────┘  │ • profit     │
                     │ • final_     │                  │ • roi        │
                     │   accuracy   │  Identifies top  │ • confidence │
                     └──────────────┘  features         │   bands      │
                                                        └──────────────┘
                     Track training
                     progress          Time-series
                                      performance


┌──────────────────────────────────────────────────────────────────────────┐
│                      LEARNING & ANALYSIS TABLES                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐        ┌──────────────────────────┐
│  learning_patterns      │        │  line_movement_analysis  │
│  ──────────────────     │        │  ───────────────────────│
│  • id (PK)              │        │  • id (PK)               │
│  • pattern_name         │        │  • game_id (FK) ─────────┼─┐
│  • pattern_type         │        │  • market_type           │ │
│  • conditions (JSONB)   │        │  • opening_line          │ │
│  • accuracy_rate        │        │  • closing_line          │ │
│  • times_detected       │        │  • movement_direction    │ │
│  • times_correct        │        │  • sharp_money_indicator │ │
│  • roi                  │        │  • reverse_line_movement │ │
│  • is_active            │        │  • public_percentage     │ │
│  • discovered_by_model  │        │  • money_percentage      │ │
└─────────────────────────┘        │  • movement_pattern      │ │
                                   │  • covering_side         │ │
 Patterns like:                    └──────────────────────────┘ │
 - "Elite D vs Weak O"                                          │
 - "Sharp reverse line move"        Learn from line movements  │
 - "Key player out scenario"                                    │
 - "Back-to-back road games"                                    │
                                                                │
┌─────────────────────────┐        ┌──────────────────────────┐│
│ injury_impact_analysis  │        │     team_trends          ││
│ ───────────────────     │        │     ───────────          ││
│ • id (PK)               │        │  • id (PK)               ││
│ • game_id (FK) ─────────┼────────┼──┘ sport                ││
│ • team                  │        │  • season                ││
│ • player_name           │        │  • team_name             ││
│ • position              │        │  • wins / losses         ││
│ • injury_severity       │        │  • ats_wins / losses     ││
│ • player_value_score    │        │  • ats_percentage        ││
│ • predicted_impact      │        │  • over / under record   ││
│ • actual_point_diff     │        │  • home_record           ││
│ • line_adjustment       │        │  • away_record           ││
│ • market_overreaction   │        │  • recent_form           ││
│ • team_covered          │        │  • momentum_score        ││
└─────────────────────────┘        │  • closing_line_value    ││
                                   │  • market_undervalued    ││
 Learn injury impact               └──────────────────────────┘│
 by position & severity                                        │
                                    Track team performance     │
                                    trends & value             │
                                                               │
                                                               │
┌──────────────────────────────────────────────────────────┐  │
│              model_comparison                            │  │
│              ────────────────                            │  │
│              • id (PK)                                   │  │
│              • model_a_id (FK) ─┐                        │  │
│              • model_b_id (FK) ─┤                        │  │
│              • test_period      │                        │  │
│              • model_a_accuracy │                        │  │
│              • model_b_accuracy │                        │  │
│              • model_a_roi      │                        │  │
│              • model_b_roi      │                        │  │
│              • agreement_rate   │                        │  │
│              • winner           │                        │  │
│              • recommendation   │                        │  │
└──────────────────────────────────┴──────────────────────┘  │
                                                              │
    Compare models head-to-head                              │
    for A/B testing                                          │
                                                             │
                                                             │
                    All analysis tables link ────────────────┘
                    back to historical_games


┌──────────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW DIAGRAM                                │
└──────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │   ESPN API   │
    │  TheOddsAPI  │
    │  InjuryAPI   │
    └──────┬───────┘
           │
           ▼
    ┌─────────────────────┐
    │  historical_games   │ ◄─── Import 2020-2024 data
    │  (Training Data)    │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │  Feature            │
    │  Engineering        │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │  training_sessions  │ ◄─── Train with TensorFlow.js
    └──────────┬──────────┘
               │
               ├──────────────┬──────────────┐
               ▼              ▼              ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ model_       │  │  feature_    │  │  learning_   │
    │ weights      │  │  importance  │  │  patterns    │
    └──────────────┘  └──────────────┘  └──────────────┘
               │              │              │
               └──────────────┴──────────────┘
                              │
                              ▼
                   ┌────────────────────┐
                   │  Make Predictions  │
                   └─────────┬──────────┘
                             │
                             ▼
                   ┌──────────────────────┐
                   │ historical_predictions│
                   └─────────┬─────────────┘
                             │
                             ▼
                   ┌──────────────────────┐
                   │ Verify Results       │
                   │ (After games finish) │
                   └─────────┬────────────┘
                             │
                             ▼
                   ┌──────────────────────┐
                   │  accuracy_metrics    │ ◄─── Dashboard
                   └──────────────────────┘


┌──────────────────────────────────────────────────────────────────────────┐
│                    KEY RELATIONSHIPS SUMMARY                              │
└──────────────────────────────────────────────────────────────────────────┘

1. historical_games (1) → (N) historical_predictions
   - Each game can have multiple predictions (moneyline, spread, total, props)

2. model_versions (1) → (N) historical_predictions
   - Track which model made each prediction

3. model_versions (1) → (1) model_weights
   - Each model version has one set of trained weights

4. model_versions (1) → (N) training_sessions
   - Track all training runs for each model

5. model_versions (1) → (N) feature_importance
   - Each model has ranked features

6. historical_games (1) → (1) line_movement_analysis
   - Optional: analyze line movements for each game

7. historical_games (1) → (N) injury_impact_analysis
   - Multiple injuries can be analyzed per game

8. model_versions (1) → (N) accuracy_metrics
   - Daily/weekly/monthly performance tracking

9. learning_patterns (N) → (1) model_versions (discovered_by)
   - Track which model discovered each pattern

10. model_comparison (N) → (2) model_versions
    - Compare any two models head-to-head


┌──────────────────────────────────────────────────────────────────────────┐
│                         QUERY PATTERNS                                   │
└──────────────────────────────────────────────────────────────────────────┘

Common Queries:

1. Get all training data for 2023 NFL season:
   SELECT * FROM historical_games
   WHERE sport = 'NFL' AND season = 2023 AND verified = true;

2. Calculate model accuracy:
   SELECT model_version_id,
          COUNT(*) as total,
          SUM(CASE WHEN was_correct THEN 1 ELSE 0 END) as correct,
          ROUND(AVG(CASE WHEN was_correct THEN 100.0 ELSE 0 END), 2) as accuracy
   FROM historical_predictions
   WHERE verified_at IS NOT NULL
   GROUP BY model_version_id;

3. Find best performing patterns:
   SELECT pattern_name, accuracy_rate, roi, times_detected
   FROM learning_patterns
   WHERE is_active = true AND times_detected >= 20
   ORDER BY roi DESC;

4. Track model improvement over time:
   SELECT metric_date, overall_accuracy, roi
   FROM accuracy_metrics
   WHERE model_version_id = 'xxx'
   ORDER BY metric_date;

5. Find undervalued teams:
   SELECT team_name, ats_percentage, closing_line_value
   FROM team_trends
   WHERE market_undervalued = true
   ORDER BY closing_line_value DESC;
```

## Table Sizes (Estimated)

For 5 years of data (2020-2024):

- `historical_games`: ~50,000 rows (10K games/year × 5 years)
- `historical_predictions`: ~200,000 rows (4 predictions/game average)
- `model_versions`: ~20 rows (new version every 3 months)
- `training_sessions`: ~100 rows (multiple training runs per version)
- `feature_importance`: ~1,000 rows (50 features × 20 models)
- `learning_patterns`: ~200 rows (patterns discovered over time)
- `accuracy_metrics`: ~10,000 rows (daily metrics for 5 years)
- `line_movement_analysis`: ~50,000 rows (1 per game)
- `injury_impact_analysis`: ~100,000 rows (2 per game average)
- `team_trends`: ~500 rows (32 teams × 5 seasons × 3 sports)

**Total estimated size: 500,000 - 1M rows across all tables**

## Performance Considerations

- All foreign keys are indexed
- Composite indexes for common query patterns
- JSONB columns for flexible data storage
- Partitioning strategy for `historical_games` by year (optional)
- Read replicas for dashboard queries
- Materialized views for aggregate statistics

## Backup Strategy

- Daily automated backups
- Point-in-time recovery (PITR)
- Archive old model versions to cold storage
- Keep last 2 years of detailed data hot
- Aggregate older data for trend analysis
