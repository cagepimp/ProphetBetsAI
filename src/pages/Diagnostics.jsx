import { useState } from 'react';
import { callEdgeFunction } from '@/api/supabaseClient';
import { Loader2, CheckCircle, XCircle, Bug, Database, Zap, Target, Wifi, Server, Search, Brain, AlertTriangle } from 'lucide-react';

export default function DebugTools() {
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});

  const runDiagnostic = async (name, functionName, params = {}) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    setResults(prev => ({ ...prev, [name]: null }));
    
    try {
      console.log(`🔍 Running ${name}...`, params);
      
      const result = await callEdgeFunction(functionName, params);
      
      console.log(`✅ ${name} complete:`, result);
      
      setResults(prev => ({ 
        ...prev, 
        [name]: { 
          success: true, 
          data: result,
          timestamp: new Date().toISOString()
        }
      }));
      
    } catch (error) {
      console.error(`❌ ${name} failed:`, error);
      
      setResults(prev => ({ 
        ...prev, 
        [name]: { 
          success: false, 
          error: error.message || 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  const DiagnosticButton = ({ name, icon: Icon, description, functionName, params = {}, variant = 'blue', size = 'normal' }) => {
    const isLoading = loading[name];
    const result = results[name];
    
    const variants = {
      blue: 'bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
      purple: 'bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
      green: 'bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
      orange: 'bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700',
      yellow: 'bg-gradient-to-br from-yellow-600 to-orange-500 hover:from-yellow-700 hover:to-orange-600'
    };

    const sizes = {
      small: 'p-3',
      normal: 'p-4',
      large: 'p-6'
    };
    
    return (
      <div className="w-full">
        <button
          onClick={() => runDiagnostic(name, functionName, params)}
          disabled={isLoading}
          className={`w-full ${variants[variant]} ${sizes[size]} text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-start gap-3`}
        >
          <div className="flex-shrink-0 mt-1">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Icon className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            <div className="font-bold text-base mb-1">{name}</div>
            <div className="text-sm opacity-90">{description}</div>
          </div>
        </button>
        
        {result && (
          <div className={`mt-3 rounded-lg border-2 ${
            result.success 
              ? 'bg-green-900/20 border-green-500' 
              : 'bg-red-900/20 border-red-500'
          }`}>
            <div className={`p-3 flex items-center gap-2 ${
              result.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {result.success ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <span className="font-semibold">
                  {result.success ? 'Diagnostic Complete' : 'Diagnostic Failed'}
                </span>
                <div className="text-xs opacity-75 mt-1">
                  {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            
            <details className="group">
              <summary className="px-3 pb-2 cursor-pointer text-sm opacity-75 hover:opacity-100 list-none flex items-center gap-2">
                <span className="group-open:rotate-90 transition-transform">▶</span>
                <span>View Full Output</span>
              </summary>
              <div className="px-3 pb-3">
                <pre className="text-xs bg-black/40 p-3 rounded overflow-auto max-h-96 font-mono">
                  {JSON.stringify(result.data || result.error, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Bug className="w-10 h-10 text-red-400" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Debug Tools
            </h1>
            <p className="text-gray-400 mt-1">System Diagnostics, Testing & Troubleshooting</p>
          </div>
        </div>

        {/* Instructions Box */}
        <div className="mb-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border-2 border-blue-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-blue-400 mb-2">How to Use Debug Tools</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex gap-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span><strong>Start with Quick System Check</strong> - This will tell you immediately if props are working or what's missing</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span><strong>If issues found,</strong> use the specific diagnostic sections below to pinpoint the problem</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span><strong>Click "View Full Output"</strong> on any result to see detailed JSON data</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: QUICK START */}
        <div className="mb-8 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-lg p-6 border-2 border-yellow-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-yellow-400" />
            <div>
              <h2 className="text-2xl font-bold">⚡ Quick Start</h2>
              <p className="text-sm text-gray-400">Run this first - 30 second overview of system health</p>
            </div>
          </div>

          <DiagnosticButton
            name="Quick System Check"
            icon={Zap}
            description="Checks if games exist, markets populated, props exist, and core functions work"
            functionName="run_this_first"
            params={{ sport: 'NFL' }}
            variant="yellow"
            size="large"
          />
        </div>

        {/* SECTION 2: PROPS DIAGNOSTICS */}
        <div className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold">Props Diagnostics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DiagnosticButton
              name="Debug Sports Props"
              icon={Search}
              description="See props health for ALL sports - games, raw props, analyzed props"
              functionName="debugSportsProps"
              params={{}}
              variant="purple"
            />
            
            <DiagnosticButton
              name="Props Pipeline Test"
              icon={Target}
              description="Tests entire flow: Game data → selectBestProps → analyzer"
              functionName="debug_props"
              params={{ sport: 'NFL' }}
              variant="purple"
            />
            
            <DiagnosticButton
              name="Verify Game Data Structure"
              icon={Database}
              description="Deep inspection of Game entity - markets, playerProps, teamProps"
              functionName="verify_game_data"
              params={{ sport: 'NFL' }}
              variant="purple"
            />
          </div>
        </div>

        {/* SECTION 3: ANALYZER DIAGNOSTICS */}
        <div className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold">Analyzer Diagnostics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DiagnosticButton
              name="Test Single Game Analysis"
              icon={Target}
              description="Run full analysis on one game to test analyzer function"
              functionName="automation/runAnalyzer10000Plus"
              params={{ sport: 'NFL' }}
              variant="green"
            />
            
            <DiagnosticButton
              name="Verify Analyzer Accuracy"
              icon={CheckCircle}
              description="Checks if analyzer predictions are valid and properly structured"
              functionName="verifyAnalyzer10000Plus"
              params={{}}
              variant="green"
            />
            
            <DiagnosticButton
              name="DIAGNOSE EVERYTHING"
              icon={Zap}
              description="Nuclear option - full system diagnostic check"
              functionName="DIAGNOSE_EVERYTHING"
              params={{}}
              variant="orange"
            />
          </div>
        </div>

        {/* SECTION 4: API & INTEGRATION TESTS */}
        <div className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Wifi className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">API & Integration Tests</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <DiagnosticButton
              name="Test Odds API"
              icon={Wifi}
              description="Verify The Odds API is responding and returning data"
              functionName="testOddsAPI"
              params={{}}
              variant="blue"
            />
            
            <DiagnosticButton
              name="Test DraftKings API"
              icon={Wifi}
              description="Check DraftKings API connection and response"
              functionName="testDraftKingsAPI"
              params={{}}
              variant="blue"
            />
            
            <DiagnosticButton
              name="Test NFL Data Fetch"
              icon={Database}
              description="Actually fetch NFL data and show what comes back"
              functionName="testDraftKingsNFL"
              params={{}}
              variant="blue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DiagnosticButton
              name="Diagnose Odds API"
              icon={Search}
              description="Deep dive into The Odds API response structure"
              functionName="testing/diagnoseOddsAPI"
              params={{}}
              variant="blue"
            />
            
            <DiagnosticButton
              name="Test All Sportsbooks"
              icon={Server}
              description="Test all sportsbook integrations at once"
              functionName="testSportsbooks"
              params={{}}
              variant="blue"
            />
            
            <DiagnosticButton
              name="Test RapidAPI"
              icon={Wifi}
              description="Legacy RapidAPI integration test"
              functionName="testRapidAPI"
              params={{}}
              variant="blue"
            />
          </div>
        </div>

        {/* SECTION 5: DATABASE DIAGNOSTICS */}
        <div className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold">Database Diagnostics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DiagnosticButton
              name="Debug Games Database"
              icon={Database}
              description="Total games by sport, games with/without props, sample structures"
              functionName="debugGamesDatabase"
              params={{}}
              variant="purple"
            />
            
            <DiagnosticButton
              name="Debug Cache"
              icon={Server}
              description="Check cache status and what's currently cached"
              functionName="debugCache"
              params={{}}
              variant="purple"
            />
            
            <DiagnosticButton
              name="Check Active Sports"
              icon={CheckCircle}
              description="Which sports currently have active games in the system"
              functionName="checkActiveSports"
              params={{}}
              variant="purple"
            />
          </div>
        </div>

        {/* SECTION 6: SPORT-SPECIFIC TESTS */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold">Sport-Specific Tests</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {['NFL', 'CFB', 'NBA', 'MLB', 'UFC', 'GOLF'].map(sport => (
              <DiagnosticButton
                key={sport}
                name={`Test ${sport}`}
                icon={Target}
                description={`Run diagnostics for ${sport}`}
                functionName="run_this_first"
                params={{ sport }}
                variant="orange"
                size="small"
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}