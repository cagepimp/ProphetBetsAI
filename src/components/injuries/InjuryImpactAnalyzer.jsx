import React, { useState, useEffect } from 'react';
import { getInjuries } from '@/api/supabaseClient';
import { AlertTriangle, Activity, TrendingDown, Shield, Heart, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function InjuryImpactAnalyzer({ gameId, team, sport }) {
  const [injuries, setInjuries] = useState([]);
  const [impactAnalysis, setImpactAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (gameId || team) {
      loadInjuryData();
    }
  }, [gameId, team]);

  const loadInjuryData = async () => {
    try {
      setLoading(true);

      // Fetch injury data for the team
      const teamInjuries = await getInjuries({
        team: team,
        sport: sport,
        status: { $in: ['Out', 'Doubtful', 'Questionable'] }
      });

      setInjuries(teamInjuries || []);

      // Analyze impact
      const analysis = analyzeInjuryImpact(teamInjuries);
      setImpactAnalysis(analysis);

    } catch (err) {
      console.error('Error loading injury data:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeInjuryImpact = (injuries) => {
    if (!injuries || injuries.length === 0) {
      return {
        overallImpact: 'Low',
        impactScore: 10,
        keyInjuries: [],
        offensiveImpact: 10,
        defensiveImpact: 10,
        recommendations: ['No significant injury concerns']
      };
    }

    let impactScore = 0;
    let offensiveImpact = 0;
    let defensiveImpact = 0;
    const keyInjuries = [];

    injuries.forEach(injury => {
      let playerImpact = 0;

      // Status weight
      if (injury.status === 'Out') playerImpact += 30;
      else if (injury.status === 'Doubtful') playerImpact += 20;
      else if (injury.status === 'Questionable') playerImpact += 10;

      // Position importance (sport-specific)
      const positionImpact = getPositionImpact(injury.position, sport);
      playerImpact += positionImpact;

      // Starter vs backup
      if (injury.is_starter) playerImpact *= 1.5;

      impactScore += playerImpact;

      // Categorize impact
      if (isOffensivePosition(injury.position, sport)) {
        offensiveImpact += playerImpact;
      } else if (isDefensivePosition(injury.position, sport)) {
        defensiveImpact += playerImpact;
      }

      // Track key injuries (impact > 20)
      if (playerImpact > 20) {
        keyInjuries.push({
          ...injury,
          calculatedImpact: playerImpact
        });
      }
    });

    // Calculate overall impact level
    let overallImpact = 'Low';
    if (impactScore >= 100) overallImpact = 'Critical';
    else if (impactScore >= 60) overallImpact = 'High';
    else if (impactScore >= 30) overallImpact = 'Moderate';

    // Generate recommendations
    const recommendations = generateRecommendations(impactScore, offensiveImpact, defensiveImpact, keyInjuries);

    return {
      overallImpact,
      impactScore: Math.min(impactScore, 100),
      keyInjuries: keyInjuries.sort((a, b) => b.calculatedImpact - a.calculatedImpact),
      offensiveImpact: Math.min(offensiveImpact, 100),
      defensiveImpact: Math.min(defensiveImpact, 100),
      recommendations
    };
  };

  const getPositionImpact = (position, sport) => {
    const impactMap = {
      'NFL': {
        'QB': 40, 'RB': 20, 'WR': 15, 'TE': 10, 'OL': 10,
        'DE': 15, 'LB': 15, 'CB': 20, 'S': 10
      },
      'NBA': {
        'PG': 25, 'SG': 20, 'SF': 20, 'PF': 20, 'C': 25
      },
      'MLB': {
        'SP': 35, 'RP': 15, 'C': 20, '1B': 15, '2B': 15,
        '3B': 15, 'SS': 15, 'OF': 15
      }
    };

    return impactMap[sport?.toUpperCase()]?.[position] || 10;
  };

  const isOffensivePosition = (position, sport) => {
    const offensivePositions = {
      'NFL': ['QB', 'RB', 'WR', 'TE', 'OL'],
      'NBA': ['PG', 'SG', 'SF', 'PF', 'C'],
      'MLB': ['C', '1B', '2B', '3B', 'SS', 'OF', 'DH']
    };
    return offensivePositions[sport?.toUpperCase()]?.includes(position);
  };

  const isDefensivePosition = (position, sport) => {
    const defensivePositions = {
      'NFL': ['DE', 'DT', 'LB', 'CB', 'S'],
      'NBA': [],
      'MLB': ['SP', 'RP']
    };
    return defensivePositions[sport?.toUpperCase()]?.includes(position);
  };

  const generateRecommendations = (totalImpact, offensiveImpact, defensiveImpact, keyInjuries) => {
    const recommendations = [];

    if (totalImpact >= 100) {
      recommendations.push('Multiple critical injuries - significant betting adjustment warranted');
    } else if (totalImpact >= 60) {
      recommendations.push('Major injury concerns - exercise caution on team-based bets');
    } else if (totalImpact >= 30) {
      recommendations.push('Moderate injury impact - consider backup performance history');
    } else {
      recommendations.push('Minor injury concerns - minimal betting adjustment needed');
    }

    if (offensiveImpact >= 50) {
      recommendations.push('Offensive production likely impacted - consider unders on team totals');
    }

    if (defensiveImpact >= 50) {
      recommendations.push('Defensive vulnerabilities present - consider overs on opponent props');
    }

    if (keyInjuries.some(i => i.position === 'QB' && i.status === 'Out')) {
      recommendations.push('Backup QB starting - significant impact on passing props and spreads');
    }

    return recommendations;
  };

  const getImpactColor = (impact) => {
    if (impact === 'Critical') return 'text-red-500 bg-red-500/20 border-red-500/30';
    if (impact === 'High') return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
    if (impact === 'Moderate') return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
    return 'text-green-500 bg-green-500/20 border-green-500/30';
  };

  const getStatusColor = (status) => {
    if (status === 'Out') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (status === 'Doubtful') return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (status === 'Questionable') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
            <p className="text-slate-400">Analyzing injury impact...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!impactAnalysis) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="py-8">
          <p className="text-center text-slate-400">Unable to load injury data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Impact Header */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{team}</h3>
                <p className="text-slate-400 text-sm">Injury Impact Analysis</p>
              </div>
            </div>
            <Badge className={getImpactColor(impactAnalysis.overallImpact)} size="lg">
              {impactAnalysis.overallImpact} Impact
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white mb-1">
                {impactAnalysis.impactScore}
              </div>
              <div className="text-xs text-slate-400">Overall Score</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {injuries.length}
              </div>
              <div className="text-xs text-slate-400">Total Injuries</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-red-400 mb-1">
                {impactAnalysis.keyInjuries.length}
              </div>
              <div className="text-xs text-slate-400">Key Players</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-cyan-400" />
              Offensive Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Impact Score</span>
                <span className="text-2xl font-bold text-white">
                  {impactAnalysis.offensiveImpact}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all"
                  style={{ width: `${impactAnalysis.offensiveImpact}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-red-400" />
              Defensive Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Impact Score</span>
                <span className="text-2xl font-bold text-white">
                  {impactAnalysis.defensiveImpact}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-orange-600 transition-all"
                  style={{ width: `${impactAnalysis.defensiveImpact}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Injuries */}
      {impactAnalysis.keyInjuries.length > 0 && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              Key Player Injuries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {impactAnalysis.keyInjuries.map((injury, index) => (
                <div key={injury.id || index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold">{injury.player_name}</h4>
                      <p className="text-sm text-slate-400">{injury.position}</p>
                    </div>
                    <Badge className={getStatusColor(injury.status)}>
                      {injury.status}
                    </Badge>
                  </div>

                  {injury.injury_description && (
                    <p className="text-sm text-slate-300 mb-2">{injury.injury_description}</p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                    <span className="text-xs text-slate-400">Calculated Impact</span>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-semibold text-red-400">
                        {injury.calculatedImpact.toFixed(0)} pts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Injuries List */}
      {injuries.length > impactAnalysis.keyInjuries.length && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4 text-slate-400" />
              Other Injuries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {injuries
                .filter(inj => !impactAnalysis.keyInjuries.find(k => k.id === inj.id))
                .map((injury, index) => (
                  <div key={injury.id || index} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                    <span className="text-sm text-slate-300">{injury.player_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{injury.position}</span>
                      <Badge className={getStatusColor(injury.status)} size="sm">
                        {injury.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-400" />
            Betting Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {impactAnalysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-blue-300">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
