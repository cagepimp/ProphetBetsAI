import React, { useState, useEffect } from 'react';
import { getGameById } from '@/api/supabaseClient';
import { Brain, Target, TrendingUp, Shield, Zap, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function GameAnalysisDashboard({ game, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (game?.id || game?.analysis) {
      loadAnalysis();
    }
  }, [game]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);

      // Check if analysis already exists on the game object
      if (game.analysis) {
        setAnalysis(game.analysis);
        setLoading(false);
        return;
      }

      // Otherwise fetch it
      if (game.id) {
        const gameData = await getGameById(game.id);
        setAnalysis(gameData?.analysis || null);
      }
    } catch (err) {
      console.error('Error loading analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 75) return 'bg-green-500';
    if (confidence >= 65) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getRecommendationStyle = (recommendation) => {
    const rec = recommendation?.toLowerCase() || '';
    if (rec.includes('strong') || rec.includes('bet')) {
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
    if (rec.includes('lean') || rec.includes('consider')) {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
            <p className="text-slate-400">Analyzing game...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis || !analysis.prediction) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="py-12">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-slate-400">No analysis available for this game</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const prediction = analysis.prediction;
  const insights = analysis.insights || {};
  const factors = analysis.factors || {};

  // Calculate overall confidence
  const overallConfidence = Math.round(
    ((prediction.spread_confidence || 0) + (prediction.total_confidence || 0)) / 2
  );

  return (
    <div className="space-y-6">
      {/* Header with Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-300 text-sm">Overall Confidence</p>
                <p className="text-2xl font-bold text-white">{overallConfidence}%</p>
              </div>
            </div>
            <Progress value={overallConfidence} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-300 text-sm">Spread Pick</p>
                <p className="text-xl font-bold text-white">{prediction.spread_pick || 'N/A'}</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {prediction.spread_confidence}% confidence
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border-cyan-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-slate-300 text-sm">Total Pick</p>
                <p className="text-xl font-bold text-white">{prediction.total_pick || 'N/A'}</p>
              </div>
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              {prediction.total_confidence}% confidence
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="factors">Key Factors</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Spread Analysis */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">Spread Analysis</h4>
                  <Badge className={getRecommendationStyle(prediction.spread_recommendation)}>
                    {prediction.spread_recommendation || 'No recommendation'}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pick:</span>
                    <span className="text-white font-semibold">{prediction.spread_pick}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="text-white font-semibold">{prediction.spread_confidence}%</span>
                  </div>
                  {prediction.spread_reasoning && (
                    <p className="text-slate-300 mt-2 pt-2 border-t border-slate-700">
                      {prediction.spread_reasoning}
                    </p>
                  )}
                </div>
              </div>

              {/* Total Analysis */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">Total Analysis</h4>
                  <Badge className={getRecommendationStyle(prediction.total_recommendation)}>
                    {prediction.total_recommendation || 'No recommendation'}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pick:</span>
                    <span className="text-white font-semibold">{prediction.total_pick}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="text-white font-semibold">{prediction.total_confidence}%</span>
                  </div>
                  {prediction.total_reasoning && (
                    <p className="text-slate-300 mt-2 pt-2 border-t border-slate-700">
                      {prediction.total_reasoning}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Key Factors Tab */}
        <TabsContent value="factors" className="space-y-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Key Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(factors).length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No factor data available</p>
                ) : (
                  Object.entries(factors).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-white font-semibold">
                        {typeof value === 'number' ? value.toFixed(1) : value}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.weather && (
                <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Weather Impact</h4>
                      <p className="text-slate-300 text-sm">{insights.weather}</p>
                    </div>
                  </div>
                </div>
              )}

              {insights.injuries && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Injury Report</h4>
                      <p className="text-slate-300 text-sm">{insights.injuries}</p>
                    </div>
                  </div>
                </div>
              )}

              {insights.trends && (
                <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Trends</h4>
                      <p className="text-slate-300 text-sm">{insights.trends}</p>
                    </div>
                  </div>
                </div>
              )}

              {insights.matchup && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Matchup Analysis</h4>
                      <p className="text-slate-300 text-sm">{insights.matchup}</p>
                    </div>
                  </div>
                </div>
              )}

              {Object.keys(insights).length === 0 && (
                <p className="text-slate-400 text-center py-4">No insights available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendation Tab */}
        <TabsContent value="recommendation" className="space-y-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Final Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${getConfidenceColor(overallConfidence)}`}></div>
                  <h3 className="text-xl font-bold text-white">
                    {overallConfidence >= 70 ? 'Strong Play' : overallConfidence >= 60 ? 'Moderate Play' : 'Proceed with Caution'}
                  </h3>
                </div>

                {prediction.recommended_bet && (
                  <div className="mb-4">
                    <p className="text-slate-300 text-sm mb-2">Recommended Bet:</p>
                    <p className="text-white font-semibold text-lg">{prediction.recommended_bet}</p>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Analyzed {analysis.algorithm || 'Advanced'} algorithm</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Considered multiple market factors</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Real-time data integration</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <div className="text-xs text-yellow-300">
                    <p className="font-semibold mb-1">Important Disclaimer</p>
                    <p>This analysis is for informational purposes only. Always do your own research and gamble responsibly.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
