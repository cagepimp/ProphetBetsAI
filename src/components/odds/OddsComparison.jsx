import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function OddsComparison({ game }) {
  const [selectedMarket, setSelectedMarket] = useState('spread');

  if (!game || !game.markets) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="py-8">
          <p className="text-center text-slate-400">No odds data available</p>
        </CardContent>
      </Card>
    );
  }

  const markets = game.markets || {};
  const sportsbooks = ['draftkings', 'fanduel', 'betmgm', 'caesars'];

  const formatOdds = (odds) => {
    if (!odds) return '-';
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const getBestOdds = (marketData, teamName, type = 'price') => {
    let bestValue = null;
    let bestBook = null;

    sportsbooks.forEach(book => {
      const bookOdds = marketData?.[book];
      if (!bookOdds || !Array.isArray(bookOdds)) return;

      const teamOutcome = bookOdds.find(o => o.name === teamName);
      if (teamOutcome && teamOutcome[type]) {
        const value = teamOutcome[type];
        if (bestValue === null || value > bestValue) {
          bestValue = value;
          bestBook = book;
        }
      }
    });

    return { value: bestValue, book: bestBook };
  };

  const getOddsMovement = (marketData, teamName) => {
    // Simplified line movement indicator
    // In production, you'd compare current vs opening lines
    const books = Object.keys(marketData || {}).length;
    if (books < 2) return null;

    // Mock movement for demonstration
    const movement = Math.random() > 0.5 ? 'up' : 'down';
    const amount = Math.floor(Math.random() * 3) + 1;

    return { direction: movement, amount };
  };

  const renderSpreadOdds = () => {
    const spread = markets.spread || {};
    const homeTeam = game.home_team || game.home;
    const awayTeam = game.away_team || game.away;

    const homeBest = getBestOdds(spread, homeTeam, 'point');
    const awayBest = getBestOdds(spread, awayTeam, 'point');

    return (
      <div className="space-y-4">
        {/* Away Team */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold">{awayTeam}</h4>
            {awayBest.book && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Best: {awayBest.book}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {sportsbooks.map(book => {
              const bookData = spread[book];
              const teamOutcome = bookData?.find(o => o.name === awayTeam);
              const isBest = awayBest.book === book;

              return (
                <div
                  key={book}
                  className={`p-3 rounded border ${
                    isBest
                      ? 'bg-green-500/10 border-green-500/50'
                      : 'bg-slate-900/50 border-slate-600'
                  }`}
                >
                  <div className="text-xs text-slate-400 mb-1 capitalize">{book}</div>
                  {teamOutcome ? (
                    <>
                      <div className="text-white font-bold">
                        {teamOutcome.point > 0 ? '+' : ''}{teamOutcome.point}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatOdds(teamOutcome.price)}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-600">-</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Home Team */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold">{homeTeam}</h4>
            {homeBest.book && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Best: {homeBest.book}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {sportsbooks.map(book => {
              const bookData = spread[book];
              const teamOutcome = bookData?.find(o => o.name === homeTeam);
              const isBest = homeBest.book === book;

              return (
                <div
                  key={book}
                  className={`p-3 rounded border ${
                    isBest
                      ? 'bg-green-500/10 border-green-500/50'
                      : 'bg-slate-900/50 border-slate-600'
                  }`}
                >
                  <div className="text-xs text-slate-400 mb-1 capitalize">{book}</div>
                  {teamOutcome ? (
                    <>
                      <div className="text-white font-bold">
                        {teamOutcome.point > 0 ? '+' : ''}{teamOutcome.point}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatOdds(teamOutcome.price)}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-600">-</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMoneylineOdds = () => {
    const moneyline = markets.moneyline || {};
    const homeTeam = game.home_team || game.home;
    const awayTeam = game.away_team || game.away;

    return (
      <div className="space-y-4">
        {[awayTeam, homeTeam].map(team => {
          const best = getBestOdds(moneyline, team);
          const movement = getOddsMovement(moneyline, team);

          return (
            <div key={team} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-semibold">{team}</h4>
                  {movement && (
                    <div className={`flex items-center gap-1 text-xs ${
                      movement.direction === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {movement.direction === 'up' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {movement.amount}
                    </div>
                  )}
                </div>
                {best.book && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Best: {best.book}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sportsbooks.map(book => {
                  const bookData = moneyline[book];
                  const teamOutcome = bookData?.find(o => o.name === team);
                  const isBest = best.book === book;

                  return (
                    <div
                      key={book}
                      className={`p-3 rounded border ${
                        isBest
                          ? 'bg-green-500/10 border-green-500/50'
                          : 'bg-slate-900/50 border-slate-600'
                      }`}
                    >
                      <div className="text-xs text-slate-400 mb-1 capitalize">{book}</div>
                      {teamOutcome ? (
                        <div className="text-white font-bold">
                          {formatOdds(teamOutcome.price)}
                        </div>
                      ) : (
                        <div className="text-slate-600">-</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTotalOdds = () => {
    const total = markets.total || {};

    return (
      <div className="space-y-4">
        {['Over', 'Under'].map(type => {
          const best = getBestOdds(total, type);

          return (
            <div key={type} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold">{type}</h4>
                {best.book && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Best: {best.book}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sportsbooks.map(book => {
                  const bookData = total[book];
                  const outcome = bookData?.find(o => o.name === type);
                  const isBest = best.book === book;

                  return (
                    <div
                      key={book}
                      className={`p-3 rounded border ${
                        isBest
                          ? 'bg-green-500/10 border-green-500/50'
                          : 'bg-slate-900/50 border-slate-600'
                      }`}
                    >
                      <div className="text-xs text-slate-400 mb-1 capitalize">{book}</div>
                      {outcome ? (
                        <>
                          <div className="text-white font-bold">
                            {outcome.point}
                          </div>
                          <div className="text-xs text-slate-400">
                            {formatOdds(outcome.price)}
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-600">-</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <DollarSign className="w-5 h-5 text-green-400" />
          Odds Comparison
          <Badge className="ml-auto bg-purple-600">
            {sportsbooks.length} Books
          </Badge>
        </CardTitle>
        <div className="flex gap-2 mt-4">
          {['spread', 'moneyline', 'total'].map(market => (
            <button
              key={market}
              onClick={() => setSelectedMarket(market)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                selectedMarket === market
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {market}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {selectedMarket === 'spread' && renderSpreadOdds()}
        {selectedMarket === 'moneyline' && renderMoneylineOdds()}
        {selectedMarket === 'total' && renderTotalOdds()}

        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-300">
            <p className="font-semibold mb-1">Line Shopping Tips</p>
            <p>Always compare odds across multiple sportsbooks to find the best value. Even small differences can significantly impact your long-term profitability.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
