import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

export default function BankrollManager() {
  const [bankroll, setBankroll] = useState(() => {
    const saved = localStorage.getItem('bankroll');
    return saved ? JSON.parse(saved) : {
      starting: 1000,
      current: 1000,
      wagers: []
    };
  });

  const [newWager, setNewWager] = useState({
    amount: '',
    confidence: 70,
    type: 'spread',
    description: ''
  });

  useEffect(() => {
    localStorage.setItem('bankroll', JSON.stringify(bankroll));
  }, [bankroll]);

  const calculateUnitSize = () => {
    // Kelly Criterion inspired - base unit is 1% of bankroll
    return bankroll.current * 0.01;
  };

  const getRecommendedWagerSize = (confidence) => {
    const unit = calculateUnitSize();

    if (confidence >= 80) return unit * 3; // 3 units
    if (confidence >= 70) return unit * 2; // 2 units
    if (confidence >= 60) return unit * 1.5; // 1.5 units
    if (confidence >= 55) return unit; // 1 unit
    return unit * 0.5; // 0.5 units
  };

  const addWager = () => {
    const amount = parseFloat(newWager.amount);
    if (!amount || amount <= 0) return;

    const wager = {
      id: Date.now(),
      amount,
      confidence: newWager.confidence,
      type: newWager.type,
      description: newWager.description,
      date: new Date().toISOString(),
      status: 'pending'
    };

    setBankroll(prev => ({
      ...prev,
      current: prev.current - amount,
      wagers: [wager, ...prev.wagers]
    }));

    setNewWager({
      amount: '',
      confidence: 70,
      type: 'spread',
      description: ''
    });
  };

  const settleWager = (id, won, payout = 0) => {
    setBankroll(prev => {
      const wager = prev.wagers.find(w => w.id === id);
      if (!wager) return prev;

      const returnAmount = won ? wager.amount + payout : 0;

      return {
        ...prev,
        current: prev.current + returnAmount,
        wagers: prev.wagers.map(w =>
          w.id === id
            ? { ...w, status: won ? 'won' : 'lost', settledAt: new Date().toISOString(), payout }
            : w
        )
      };
    });
  };

  const resetBankroll = () => {
    if (confirm('Are you sure you want to reset your bankroll?')) {
      setBankroll({
        starting: bankroll.starting,
        current: bankroll.starting,
        wagers: []
      });
    }
  };

  const calculateStats = () => {
    const settledWagers = bankroll.wagers.filter(w => w.status !== 'pending');
    const wins = settledWagers.filter(w => w.status === 'won').length;
    const losses = settledWagers.filter(w => w.status === 'lost').length;
    const winRate = settledWagers.length > 0 ? (wins / settledWagers.length) * 100 : 0;

    const totalRisked = settledWagers.reduce((sum, w) => sum + w.amount, 0);
    const totalReturned = settledWagers
      .filter(w => w.status === 'won')
      .reduce((sum, w) => sum + w.amount + (w.payout || 0), 0);

    const roi = totalRisked > 0 ? ((totalReturned - totalRisked) / totalRisked) * 100 : 0;

    const profit = bankroll.current - bankroll.starting;
    const profitPercent = (profit / bankroll.starting) * 100;

    return {
      wins,
      losses,
      winRate,
      roi,
      profit,
      profitPercent,
      settledCount: settledWagers.length,
      pendingCount: bankroll.wagers.filter(w => w.status === 'pending').length
    };
  };

  const stats = calculateStats();
  const unit = calculateUnitSize();
  const recommendedSize = getRecommendedWagerSize(newWager.confidence);

  return (
    <div className="space-y-6">
      {/* Bankroll Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-slate-300 text-sm">Current Bankroll</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              ${bankroll.current.toFixed(2)}
            </div>
            <div className={`text-sm flex items-center gap-1 ${
              stats.profit >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {stats.profit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {stats.profit >= 0 ? '+' : ''}{stats.profitPercent.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              <span className="text-slate-300 text-sm">Unit Size</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              ${unit.toFixed(2)}
            </div>
            <div className="text-sm text-slate-400">
              1% of bankroll
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-slate-300 text-sm">Win Rate</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.winRate.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-400">
              {stats.wins}W - {stats.losses}L
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className={`text-2xl font-bold mb-1 ${
                stats.profit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${Math.abs(stats.profit).toFixed(2)}
              </div>
              <div className="text-xs text-slate-400">
                {stats.profit >= 0 ? 'Profit' : 'Loss'}
              </div>
            </div>

            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className={`text-2xl font-bold mb-1 ${
                stats.roi >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.roi.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400">ROI</div>
            </div>

            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white mb-1">
                {stats.settledCount}
              </div>
              <div className="text-xs text-slate-400">Settled Bets</div>
            </div>

            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {stats.pendingCount}
              </div>
              <div className="text-xs text-slate-400">Pending</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Bankroll Health</span>
              <span className="text-white font-semibold">
                {((bankroll.current / bankroll.starting) * 100).toFixed(0)}%
              </span>
            </div>
            <Progress value={(bankroll.current / bankroll.starting) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Place New Wager */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Place New Wager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Amount ($)</label>
              <Input
                type="number"
                value={newWager.amount}
                onChange={(e) => setNewWager({ ...newWager, amount: e.target.value })}
                placeholder="Enter amount"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Bet Type</label>
              <select
                value={newWager.type}
                onChange={(e) => setNewWager({ ...newWager, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="spread">Spread</option>
                <option value="moneyline">Moneyline</option>
                <option value="total">Total</option>
                <option value="prop">Player Prop</option>
                <option value="parlay">Parlay</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-400">Confidence: {newWager.confidence}%</label>
              <span className="text-sm text-green-400">
                Recommended: ${recommendedSize.toFixed(2)} ({(recommendedSize / unit).toFixed(1)}u)
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              value={newWager.confidence}
              onChange={(e) => setNewWager({ ...newWager, confidence: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Description</label>
            <Input
              type="text"
              value={newWager.description}
              onChange={(e) => setNewWager({ ...newWager, description: e.target.value })}
              placeholder="e.g., Chiefs -3.5 vs Bills"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-blue-300">
              Based on {newWager.confidence}% confidence, recommended wager is {(recommendedSize / unit).toFixed(1)} units (${recommendedSize.toFixed(2)})
            </p>
          </div>

          <button
            onClick={addWager}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all"
          >
            Place Wager
          </button>
        </CardContent>
      </Card>

      {/* Recent Wagers */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Recent Wagers</CardTitle>
            <button
              onClick={resetBankroll}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Reset Bankroll
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {bankroll.wagers.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No wagers yet</p>
          ) : (
            <div className="space-y-2">
              {bankroll.wagers.slice(0, 10).map((wager) => (
                <div key={wager.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold">${wager.amount.toFixed(2)}</span>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30" size="sm">
                          {wager.type}
                        </Badge>
                        <Badge className="bg-slate-700 text-slate-300" size="sm">
                          {wager.confidence}%
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300">{wager.description || 'No description'}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(wager.date).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {wager.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              const payout = parseFloat(prompt('Enter payout amount:', (wager.amount * 0.9).toFixed(2)));
                              if (!isNaN(payout)) settleWager(wager.id, true, payout);
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                          >
                            Win
                          </button>
                          <button
                            onClick={() => settleWager(wager.id, false)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                          >
                            Loss
                          </button>
                        </>
                      )}
                      {wager.status === 'won' && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Won +${wager.payout?.toFixed(2)}
                        </Badge>
                      )}
                      {wager.status === 'lost' && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          Lost
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
