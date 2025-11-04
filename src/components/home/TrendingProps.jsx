import React, { useState, useEffect } from 'react';
import { getPlayerProps } from '@/api/supabaseClient';
import { Flame, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TrendingProps() {
  const [props, setProps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingProps();
  }, []);

  const loadTrendingProps = async () => {
    try {
      setLoading(true);

      // Fetch player props with high confidence
      const playerProps = await getPlayerProps({
        confidence: { $gte: 70 }
      });

      // Sort by confidence and limit to 8
      const sortedProps = playerProps
        .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
        .slice(0, 8);

      setProps(sortedProps || []);
    } catch (err) {
      console.error('Error loading trending props:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPropIcon = (propType) => {
    const icons = {
      'passing': '🎯',
      'rushing': '🏃',
      'receiving': '🙌',
      'points': '⭐',
      'rebounds': '🏀',
      'assists': '🤝',
      'hits': '⚾',
      'strikeouts': 'K',
      'default': '🎲'
    };

    const type = propType?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(icons)) {
      if (type.includes(key)) return icon;
    }
    return icons.default;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 75) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (confidence >= 70) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
  };

  if (loading) {
    return (
      <Card className="bg-purple-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Trending Props
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (props.length === 0) {
    return (
      <Card className="bg-purple-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Trending Props
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-300 text-center py-4">
            No trending props available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-purple-900/20 border-purple-500/30 hover:border-purple-400/50 transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
            Trending Props
          </CardTitle>
          <Link
            to={createPageUrl('PropsPage')}
            className="text-purple-400 hover:text-purple-300 text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-3">
          {props.map((prop, index) => {
            const confidence = prop.confidence || 0;

            return (
              <div
                key={prop.id || index}
                className="bg-purple-800/30 rounded-lg p-3 border border-purple-500/20 hover:border-purple-400/40 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getPropIcon(prop.prop_type)}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {prop.player_name || 'Unknown Player'}
                      </p>
                      <p className="text-purple-300 text-xs">
                        {prop.team || ''} • {prop.sport || ''}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getConfidenceColor(confidence)} border text-xs`}>
                    {confidence}%
                  </Badge>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-500/20">
                  <div className="text-xs">
                    <span className="text-purple-400">{prop.prop_type || 'Prop'}</span>
                    <span className="text-purple-200 mx-1">•</span>
                    <span className="text-white font-semibold">
                      {prop.line || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-purple-300">
                    <TrendingUp className="w-3 h-3" />
                    {prop.recommendation || 'Over'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Link
          to={createPageUrl('PropsPage')}
          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4" />
          Explore All Props
        </Link>
      </CardContent>
    </Card>
  );
}
