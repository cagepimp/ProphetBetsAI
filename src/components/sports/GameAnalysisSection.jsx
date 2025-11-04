99 results - 18 files

src\components\analyzer\AnalyzerPanel.jsx:
  60          <div className="pt-1">
  61:             <div className="text-emerald-400 font-bold text-sm">{p.edge}% edge</div>
  62              <div className="text-blue-400 text-xs">Conf: {p.confidence}%</div>

src\components\cards\GameCard.jsx:
  235            <div className="mt-4 p-4 bg-gray-800 rounded space-y-3">
  236:             {/* The Edge */}
  237:             {analysis.the_edge && (
  238                <div>
  239:                 <div className="text-cyan-400 font-semibold text-sm mb-1">⚡ THE EDGE</div>
  240:                 <p className="text-white text-sm">{analysis.the_edge}</p>
  241                </div>

src\components\dashboard\AdvancedAlgorithmDisplay.jsx:
   88      .sort(([,a], [,b]) => {
   89:       const aEdge = a.algorithm_analysis?.edge_percentage || 0;
   90:       const bEdge = b.algorithm_analysis?.edge_percentage || 0;
   91:       return bEdge - aEdge;
   92      });

  189                          <div className="text-green-400 font-bold">
  190:                           +{result.algorithm_analysis?.edge_percentage?.toFixed(1)}%
  191                          </div>
  192:                         <div className="text-slate-400 text-xs">Edge</div>
  193                        </div>

  331                      <div className="text-2xl font-bold text-blue-400">
  332:                       {(sortedResults.reduce((acc, [,r]) => acc + (r.algorithm_analysis?.edge_percentage || 0), 0) / sortedResults.length).toFixed(1)}%
  333                      </div>
  334:                     <div className="text-slate-400">Avg Edge</div>
  335                    </div>

src\components\dashboard\Algorithm10000Display.jsx:
   23  
   24:   const averageEdge = totalBetsAnalyzed > 0
   25:     ? (Object.values(algorithmData).reduce((acc, data) => acc + parseFloat(data.edge), 0) / totalBetsAnalyzed).toFixed(1)
   26      : 0;

   52            <div className="bg-white/10 rounded-lg p-4 text-center">
   53:             <div className="text-2xl font-bold text-green-400">+{averageEdge}%</div>
   54:             <div className="text-white/70 text-sm">Avg Edge</div>
   55            </div>

   98              <BarChart3 className="w-4 h-4 text-cyan-400" />
   99:             Top Algorithm Picks (Highest Edge)
  100            </h4>

  103                .filter(([_, data]) => data.recommendation === 'BET')
  104:               .sort((a, b) => parseFloat(b[1].edge) - parseFloat(a[1].edge))
  105                .slice(0, 5)

  118                      <div className="text-right">
  119:                       <div className="text-green-400 font-bold">+{data.edge}% Edge</div>
  120                        <div className="text-white text-sm">{data.winRate}% Win Rate</div>

src\components\dashboard\AlgorithmInsights.jsx:
  12        confidence: 89,
  13:       edge: "+12.3%",
  14        reasoning: "Strong defensive matchup, weather conditions"

  19        confidence: 76,
  20:       edge: "+8.7%",
  21        reasoning: "Home field advantage, injury report analysis"

  26        confidence: 82,
  27:       edge: "+15.1%",
  28        reasoning: "High-scoring offensive systems, dome environment"

  61                    </div>
  62:                   <div className="text-green-400 font-medium">{prediction.edge}</div>
  63                  </div>

src\components\dashboard\GameCard.jsx:
  48                    <TrendingUp className="w-4 h-4" />
  49:                   +{analysis.edge}% Edge
  50                  </p>

src\components\dashboard\RealTimeAnalytics.jsx:
  101                      <div>
  102:                       <span className="text-purple-200">Edge:</span>
  103:                       <p className="font-bold text-green-400">+{algorithmData[`game_${game.id}`].edge}%</p>
  104                      </div>

  218                      <div>
  219:                       <span className="text-cyan-200">Edge:</span>
  220:                       <p className="font-bold text-green-400">+{algorithmData[`player_prop_${prop.id}`].edge}%</p>
  221                      </div>

  279                      <div>
  280:                       <span className="text-orange-200">Edge:</span>
  281:                       <p className="font-bold text-green-400">+{algorithmData[`team_prop_${prop.id}`].edge}%</p>
  282                      </div>

src\components\props\AlgorithmRankings.jsx:
  53            </CardTitle>
  54:           <p className="text-slate-400">Props ranked by AI confidence and edge analysis</p>
  55          </CardHeader>

src\components\services\AdvancedAlgorithmService.jsx:
   43                  expected_value: { type: "number" },
   44:                 edge_percentage: { type: "number" },
   45                  confidence_score: { type: "number" },

  139                  confidence: { type: "number" },
  140:                 edge: { type: "number" },
  141                  recommendation: { type: "string" }

  198                    description: { type: "string" },
  199:                   edge_estimate: { type: "number" },
  200                    risk_level: { type: "string" }

  350          expected_value: (Math.random() * 10) - 2, // -2% to +8%
  351:         edge_percentage: Math.random() * 5 + 1, // 1-6%
  352          confidence_score: 60 + Math.random() * 30, // 60-90%

src\components\sports\GameAnalysisSection.jsx:
   32    const analysisData = analysis || game.analysis || {};
   33:   const edgeSummary = analysisData.edge_summary || 'No analysis available yet.';
   34    const weatherImpact = analysisData.weather_impact || 'Weather data unavailable';

  124  
  125:           {/* THE EDGE - Matching edge3.png */}
  126            <div className="bg-gradient-to-br from-amber-900/60 to-yellow-900/60 border-2 border-yellow-600/70 rounded-xl p-6 shadow-xl">

  128                <Target className="w-7 h-7 text-yellow-400" />
  129:               <h3 className="text-2xl font-bold text-yellow-400">THE EDGE</h3>
  130              </div>
  131:             <p className="text-white text-lg leading-relaxed">{edgeSummary}</p>
  132            </div>
  133  
  134:           {/* BETTING RECOMMENDATIONS - Matching edge2.png top section */}
  135            {(predictions.spread_pick || predictions.total_pick) && (

  202  
  203:           {/* TOP PLAYER PROPS - Matching edge2.png */}
  204            {(topPlayerPropsDK.length > 0 || topPlayerPropsFD.length > 0) && (

  292  
  293:           {/* TOP TEAM PROPS - Matching edge1.png */}
  294            {(topTeamPropsDK.length > 0 || topTeamPropsFD.length > 0) && (

src\components\sports\GameCard.jsx:
  341            
  342:           {/* THE EDGE */}
  343:           {analysisData.edge_summary && (
  344              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-lg p-4">
  345                <div className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
  346:                 🎯 THE EDGE
  347                </div>
  348:               <p className="text-white font-semibold">{analysisData.edge_summary}</p>
  349              </div>

src\components\sports\LiveGameCard.jsx:
  208        confidence: 89,
  209:       edge: "+12.4%",
  210        reasoning: "Advanced metrics show significant value. Key matchup advantages favor covering the spread.",

  220        confidence: 91,
  221:       edge: "+16.8%", 
  222        reasoning: "Comprehensive scoring analysis indicates favorable matchup conditions.",

  231        confidence: 84,
  232:       edge: "+9.7%",
  233        reasoning: "Moneyline value detected based on market inefficiency.",

src\pages\Debug.jsx:
  380                          <p className="text-sm text-slate-400 mb-4">
  381:                             Analyzes all cached props for a given sport, compares odds between DraftKings and FanDuel, and calculates edge and confidence.
  382                          </p>

src\pages\Home.jsx:
  146                <p className="text-purple-200">
  147:                 Line value, injuries, weather, sharp money, matchups, trends - every angle analyzed for edge detection
  148                </p>

  219            <p className="text-purple-300 text-center text-sm mt-8">
  220:             Join thousands of bettors using AI to gain an edge. Daily picks, analysis updates, and exclusive insights.
  221            </p>

src\pages\Props.jsx:
  134                              fd_odds: p.fd_odds || p.fanduel_odds || null,
  135:                             edge: parseFloat(p.edge || p.Edge || p.ev || p.expected_value || 0),
  136                              _original: p

  426                                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Odds</th>
  427:                                     <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Edge</th>
  428                                  </tr>

  432                                      const isDK = p.book === 'DraftKings';
  433:                                     const edge = parseFloat(p.edge) || 0;
  434  

  462                                              <td className="px-6 py-4 text-center">
  463:                                                 {edge > 0 ? (
  464                                                      <span className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
  465:                                                         edge >= 5 ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
  466:                                                         edge >= 3 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
  467                                                          'bg-gray-500/20 text-gray-400 border border-gray-500/50'
  468                                                      }`}>
  469:                                                         +{edge.toFixed(1)}%
  470                                                      </span>

  493                          <div>
  494:                             <div className="text-xs text-gray-400">Average Edge</div>
  495                              <div className="text-lg font-bold text-green-400">
  496:                                 +{(filtered.reduce((acc, p) => acc + (p.edge || 0), 0) / filtered.length).toFixed(1)}%
  497                              </div>

src\pages\PropsAnalyzer.jsx:
  126  **DEFENSIVE PLAYER PROPS:**
  127: - Sacks by defensive player/edge rusher (Over/Under)
  128  - Tackles + Assists Combined (Over/Under)

  179  
  180:   return `You are Props Analyzer V3, an elite AI that analyzes EVERY possible prop type to find the absolute best betting edges.
  181  

  196  4. **Diversify prop types** - Don't just pick 5 passing yards props. Spread across different categories (passing, rushing, receiving, defense, etc.)
  197: 5. **Consider line differences** - DraftKings and FanDuel may have different lines for the same prop, creating edges
  198  

  207  
  208: Then select the TOP 5 props with the highest confidence and best edges on DraftKings.
  209  

  260  ✅ Consider both DraftKings and FanDuel line differences
  261: ✅ Focus on ACTIONABLE props with clear edges
  262  
  263  **CONFIDENCE SCALE:**
  264: - 85-100% = Elite edge, maximum conviction play
  265: - 75-84% = Strong edge, highly recommended
  266: - 65-74% = Good edge, solid play
  267: - 55-64% = Moderate edge, worth considering
  268: - 50-54% = Slight edge, lower confidence
  269  

  303              type: "string", 
  304:             description: "2-3 sentences explaining the edge with specific stats, matchup data, or trends" 
  305            }

  332              type: "string", 
  333:             description: "2-3 sentences explaining the edge with specific data" 
  334            }

src\pages\PropsPage.jsx:
  135                              fd_odds: p.fd_odds || p.fanduel_odds || null,
  136:                             edge: parseFloat(p.edge || p.Edge || p.ev || p.expected_value || 0),
  137                              _original: p

  475                                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Odds</th>
  476:                                     <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Edge</th>
  477                                  </tr>

  481                                      const isDK = p.book === 'DraftKings';
  482:                                     const edge = parseFloat(p.edge) || 0;
  483  

  511                                              <td className="px-6 py-4 text-center">
  512:                                                 {edge > 0 ? (
  513                                                      <span className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
  514:                                                         edge >= 5 ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
  515:                                                         edge >= 3 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
  516                                                          'bg-gray-500/20 text-gray-400 border border-gray-500/50'
  517                                                      }`}>
  518:                                                         +{edge.toFixed(1)}%
  519                                                      </span>

  542                          <div>
  543:                             <div className="text-xs text-gray-400">Average Edge</div>
  544                              <div className="text-lg font-bold text-green-400">
  545:                                 +{(filtered.reduce((acc, p) => acc + (p.edge || 0), 0) / filtered.length).toFixed(1)}%
  546                              </div>

src\pages\Research.jsx:
  48          odds: dkHome,
  49:         edge: "+2.3%",
  50          confidence: "High"

  84                        <div className="text-right">
  85:                         <p className="text-sm font-semibold text-green-600">{opp.edge}</p>
  86                          <p className="text-xs text-gray-500">{opp.confidence}</p>
