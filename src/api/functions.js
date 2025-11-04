// Migrated to Supabase - use callEdgeFunction instead
import { callEdgeFunction, runAnalyzer, updateSchedule, fetchOdds, autoGradeAndLearn } from './supabaseClient';

// Wrapper to maintain Base44-style function calls
const createFunctionWrapper = (functionName) => {
  return async (params) => {
    return await callEdgeFunction(functionName, params);
  };
};


export const fetchNFLRosters = createFunctionWrapper("fetchNFLRosters");

export const fetchNFLInjuries = createFunctionWrapper("fetchNFLInjuries");

export const fetchAlgorithmInsights = createFunctionWrapper("fetchAlgorithmInsights");

export const fetchInjuries = createFunctionWrapper("fetchInjuries");

export const fetchLiveScoring = createFunctionWrapper("fetchLiveScoring");

export const logEventToExternalApp = createFunctionWrapper("logEventToExternalApp");

export const fetchAllSportRosters = createFunctionWrapper("fetchAllSportRosters");

export const predictGameScore = createFunctionWrapper("predictGameScore");

export const fetchESPNSchedule = createFunctionWrapper("fetchESPNSchedule");

export const advanceSportWeek = createFunctionWrapper("advanceSportWeek");

export const fetchNCAASchedule = createFunctionWrapper("fetchNCAASchedule");

export const fetchRealSportsbookProps = createFunctionWrapper("fetchRealSportsbookProps");

export const fetchUFCProps = createFunctionWrapper("fetchUFCProps");

export const fetchMarketOdds = createFunctionWrapper("fetchMarketOdds");

export const fetchDraftKingsSport = createFunctionWrapper("fetchDraftKingsSport");

export const testDraftKingsNFL = createFunctionWrapper("testDraftKingsNFL");

export const fetchMarketOddsLLM = createFunctionWrapper("fetchMarketOddsLLM");

export const updateMarketCache = createFunctionWrapper("updateMarketCache");

export const getCachedMarketData = createFunctionWrapper("getCachedMarketData");

export const weeklyCacheRefresh = createFunctionWrapper("weeklyCacheRefresh");

export const debugCache = createFunctionWrapper("debugCache");

export const liveOdds = createFunctionWrapper("liveOdds");

export const _schemas = createFunctionWrapper("_schemas");

export const fetchSportsbooks = createFunctionWrapper("fetchSportsbooks");

export const sportsbooks = createFunctionWrapper("sportsbooks");

export const populateGamesFromSportsbooks = createFunctionWrapper("populateGamesFromSportsbooks");

export const testDraftKingsAPI = createFunctionWrapper("testDraftKingsAPI");

export const fetchDraftKings = createFunctionWrapper("fetchDraftKings");

export const fetchFanDuel = createFunctionWrapper("fetchFanDuel");

export const fetchBetMGM = createFunctionWrapper("fetchBetMGM");

export const fetchDraftKingsOdds = createFunctionWrapper("fetchDraftKingsOdds");

export const fetchCFBSchedule = createFunctionWrapper("fetchCFBSchedule");

export const updateCFBPower5 = createFunctionWrapper("updateCFBPower5");

export const updateCFBPower5WithOdds = createFunctionWrapper("updateCFBPower5WithOdds");

export const updateCFBPower5Schedule = createFunctionWrapper("updateCFBPower5Schedule");

export const analyzeGame = createFunctionWrapper("analyzeGame");

export const analyzer10000plus = createFunctionWrapper("analyzer10000plus");

export const analyzerInsights = createFunctionWrapper("analyzerInsights");

export const analyzer10000Engine = createFunctionWrapper("analyzer10000Engine");

export const fetchFullProps = createFunctionWrapper("fetchFullProps");

export const updateWeeklySchedule = createFunctionWrapper("updateWeeklySchedule");

export const utilsDateRange = createFunctionWrapper("utilsDateRange");

export const updateNFLWeeklySchedule = createFunctionWrapper("updateNFLWeeklySchedule");

export const updateNFLWeekSlate = createFunctionWrapper("updateNFLWeekSlate");

export const testSportsbooks = createFunctionWrapper("testSportsbooks");

export const testRapidAPI = createFunctionWrapper("testRapidAPI");

export const testSportsGameOdds = createFunctionWrapper("testSportsGameOdds");

export const fetchAnalyzerProps = createFunctionWrapper("fetchAnalyzerProps");

export const updateSportsbookOdds = createFunctionWrapper("updateSportsbookOdds");

export const updateSportsbookProps = createFunctionWrapper("updateSportsbookProps");

export const fetchSportsOdds = createFunctionWrapper("fetchSportsOdds");

export const checkActiveSports = createFunctionWrapper("checkActiveSports");

export const updateOddsFromTheOddsAPI = createFunctionWrapper("updateOddsFromTheOddsAPI");

export const analyzer10000 = createFunctionWrapper("analyzer10000");

export const fetchTopProps = createFunctionWrapper("fetchTopProps");

export const fetchTopTeamProps = createFunctionWrapper("fetchTopTeamProps");

export const fetchAnalyzerData = createFunctionWrapper("fetchAnalyzerData");

export const fetchGameProps = createFunctionWrapper("fetchGameProps");

export const fetchPlayerProps = createFunctionWrapper("fetchPlayerProps");

export const analyzeProps = createFunctionWrapper("analyzeProps");

export const fetchWeather = createFunctionWrapper("fetchWeather");

export const analyzer = createFunctionWrapper("analyzer");

export const analyzeGameProps = createFunctionWrapper("analyzeGameProps");

export const dailySlateRefresh = createFunctionWrapper("dailySlateRefresh");

export const testOddsAPI = createFunctionWrapper("testOddsAPI");

export const runAnalyzerProps = createFunctionWrapper("runAnalyzerProps");

export const runAnalyzerPropsV3 = createFunctionWrapper("runAnalyzerPropsV3");

export const clearCacheIteratively = createFunctionWrapper("clearCacheIteratively");

export const getSlatesForSport = createFunctionWrapper("getSlatesForSport");

export const refreshOddsForSport = createFunctionWrapper("refreshOddsForSport");

export const fetchOddsDirect = createFunctionWrapper("fetchOddsDirect");

export const getAllSlates = createFunctionWrapper("getAllSlates");

export const reformatOddsData = createFunctionWrapper("reformatOddsData");

export const runAnalyzer10000Plus = createFunctionWrapper("runAnalyzer10000Plus");

export const getTopProps = createFunctionWrapper("getTopProps");

export const updateAllRosters = createFunctionWrapper("updateAllRosters");

export const setUserRole = createFunctionWrapper("setUserRole");

export const PredictionTracker = createFunctionWrapper("PredictionTracker");

export const autoVerifyFinishedGames = createFunctionWrapper("autoVerifyFinishedGames");

export const debugGamesDatabase = createFunctionWrapper("debugGamesDatabase");

export const autoAnalyzeAndVerify = createFunctionWrapper("autoAnalyzeAndVerify");

export const calculateDetailedAccuracy = createFunctionWrapper("calculateDetailedAccuracy");

export const getPerformanceStats = createFunctionWrapper("getPerformanceStats");

export const verifyAnalyzer10000Plus = createFunctionWrapper("verifyAnalyzer10000Plus");

export const analyzerV1 = createFunctionWrapper("analyzerV1");

export const analyzerV2 = createFunctionWrapper("analyzerV2");

export const analyzerV3 = createFunctionWrapper("analyzerV3");

export const analyzerEngine = createFunctionWrapper("analyzerEngine");

export const analysisAnalyzerV1 = createFunctionWrapper('analysis/analyzerV1');

export const analysisAnalyzerV2 = createFunctionWrapper('analysis/analyzerV2');

export const analysisAnalyzerV3 = createFunctionWrapper('analysis/analyzerV3');

export const analysisAnalyzerEngine = createFunctionWrapper('analysis/analyzerEngine');

export const analysisAnalyzer10000 = createFunctionWrapper('analysis/analyzer10000');

export const analysisAnalyzer10000Engine = createFunctionWrapper('analysis/analyzer10000Engine');

export const analysisAnalyzer10000plus = createFunctionWrapper('analysis/analyzer10000plus');

export const analysisAnalyzerInsights = createFunctionWrapper('analysis/analyzerInsights');

export const analysisAnalyzeGame = createFunctionWrapper('analysis/analyzeGame');

export const analysisAnalyzeGameProps = createFunctionWrapper('analysis/analyzeGameProps');

export const analysisAnalyzeProps = createFunctionWrapper('analysis/analyzeProps');

export const datafetchREADME = createFunctionWrapper('data-fetch/README');

export const datafetchFetchInjuries = createFunctionWrapper('data-fetch/fetchInjuries');

export const datafetchFetchLiveScoring = createFunctionWrapper('data-fetch/fetchLiveScoring');

export const datafetchFetchNCAASchedule = createFunctionWrapper('data-fetch/fetchNCAASchedule');

export const datafetchFetchESPNSchedule = createFunctionWrapper('data-fetch/fetchESPNSchedule');

export const datafetchFetchAlgorithmInsights = createFunctionWrapper('data-fetch/fetchAlgorithmInsights');

export const datafetchFetchNFLInjuries = createFunctionWrapper('data-fetch/fetchNFLInjuries');

export const datafetchFetchNFLRosters = createFunctionWrapper('data-fetch/fetchNFLRosters');

export const datafetchFetchWeather = createFunctionWrapper('data-fetch/fetchWeather');

export const oddsREADME = createFunctionWrapper('odds/README');

export const oddsFetchMarketOdds = createFunctionWrapper('odds/fetchMarketOdds');

export const oddsFetchMarketOddsLLM = createFunctionWrapper('odds/fetchMarketOddsLLM');

export const oddsFetchOdds = createFunctionWrapper('odds/fetchOdds');

export const oddsFetchOddsDirect = createFunctionWrapper('odds/fetchOddsDirect');

export const oddsFetchDraftKings = createFunctionWrapper('odds/fetchDraftKings');

export const oddsFetchDraftKingsOdds = createFunctionWrapper('odds/fetchDraftKingsOdds');

export const oddsFetchDraftKingsSport = createFunctionWrapper('odds/fetchDraftKingsSport');

export const oddsFetchFanDuel = createFunctionWrapper('odds/fetchFanDuel');

export const oddsFetchBetMGM = createFunctionWrapper('odds/fetchBetMGM');

export const oddsFetchSportsbooks = createFunctionWrapper('odds/fetchSportsbooks');

export const oddsFetchRealSportsbookProps = createFunctionWrapper('odds/fetchRealSportsbookProps');

export const oddsLiveOdds = createFunctionWrapper('odds/liveOdds');

export const oddsSportsbooks = createFunctionWrapper('odds/sportsbooks');

export const oddsUpdateSportsbookOdds = createFunctionWrapper('odds/updateSportsbookOdds');

export const oddsUpdateSportsbookProps = createFunctionWrapper('odds/updateSportsbookProps');

export const oddsUpdateOddsFromTheOddsAPI = createFunctionWrapper('odds/updateOddsFromTheOddsAPI');

export const propsREADME = createFunctionWrapper('props/README');

export const propsFetchTopProps = createFunctionWrapper('props/fetchTopProps');

export const propsFetchTopTeamProps = createFunctionWrapper('props/fetchTopTeamProps');

export const propsFetchFullProps = createFunctionWrapper('props/fetchFullProps');

export const propsFetchGameProps = createFunctionWrapper('props/fetchGameProps');

export const propsFetchPlayerProps = createFunctionWrapper('props/fetchPlayerProps');

export const propsFetchAnalyzerProps = createFunctionWrapper('props/fetchAnalyzerProps');

export const propsFetchUFCProps = createFunctionWrapper('props/fetchUFCProps');

export const propsGetTopProps = createFunctionWrapper('props/getTopProps');

export const cacheREADME = createFunctionWrapper('cache/README');

export const cacheGetCachedMarketData = createFunctionWrapper('cache/getCachedMarketData');

export const cacheUpdateMarketCache = createFunctionWrapper('cache/updateMarketCache');

export const cacheClearCacheIteratively = createFunctionWrapper('cache/clearCacheIteratively');

export const cacheDebugCache = createFunctionWrapper('cache/debugCache');

export const cacheDailySlateRefresh = createFunctionWrapper('cache/dailySlateRefresh');

export const cacheWeeklyCacheRefresh = createFunctionWrapper('cache/weeklyCacheRefresh');

export const cacheRefreshOddsForSport = createFunctionWrapper('cache/refreshOddsForSport');

export const scheduleREADME = createFunctionWrapper('schedule/README');

export const scheduleAdvanceSportWeek = createFunctionWrapper('schedule/advanceSportWeek');

export const scheduleUpdateWeeklySchedule = createFunctionWrapper('schedule/updateWeeklySchedule');

export const scheduleUpdateNFLWeeklySchedule = createFunctionWrapper('schedule/updateNFLWeeklySchedule');

export const scheduleUpdateNFLWeekSlate = createFunctionWrapper('schedule/updateNFLWeekSlate');

export const scheduleUpdateCFBPower5 = createFunctionWrapper('schedule/updateCFBPower5');

export const scheduleUpdateCFBPower5Schedule = createFunctionWrapper('schedule/updateCFBPower5Schedule');

export const scheduleUpdateCFBPower5WithOdds = createFunctionWrapper('schedule/updateCFBPower5WithOdds');

export const scheduleFetchCFBSchedule = createFunctionWrapper('schedule/fetchCFBSchedule');

export const scheduleGetAllSlates = createFunctionWrapper('schedule/getAllSlates');

export const scheduleGetSlatesForSport = createFunctionWrapper('schedule/getSlatesForSport');

export const rostersREADME = createFunctionWrapper('rosters/README');

export const rostersUpdateAllRosters = createFunctionWrapper('rosters/updateAllRosters');

export const rostersFetchAllSportRosters = createFunctionWrapper('rosters/fetchAllSportRosters');

export const accuracyREADME = createFunctionWrapper('accuracy/README');

export const accuracyCalculateDetailedAccuracy = createFunctionWrapper('accuracy/calculateDetailedAccuracy');

export const accuracyGetPerformanceStats = createFunctionWrapper('accuracy/getPerformanceStats');

export const accuracyVerifyAnalyzer10000Plus = createFunctionWrapper('accuracy/verifyAnalyzer10000Plus');

export const accuracyAutoAnalyzeAndVerify = createFunctionWrapper('accuracy/autoAnalyzeAndVerify');

export const accuracyAutoVerifyFinishedGames = createFunctionWrapper('accuracy/autoVerifyFinishedGames');

export const testingREADME = createFunctionWrapper('testing/README');

export const testingTestOddsAPI = createFunctionWrapper('testing/testOddsAPI');

export const testingTestSportsbooks = createFunctionWrapper('testing/testSportsbooks');

export const testingTestDraftKingsAPI = createFunctionWrapper('testing/testDraftKingsAPI');

export const testingTestDraftKingsNFL = createFunctionWrapper('testing/testDraftKingsNFL');

export const testingTestRapidAPI = createFunctionWrapper('testing/testRapidAPI');

export const testingTestSportsGameOdds = createFunctionWrapper('testing/testSportsGameOdds');

export const testingDebugGamesDatabase = createFunctionWrapper('testing/debugGamesDatabase');

export const automationREADME = createFunctionWrapper('automation/README');

export const automationRunAnalyzer10000Plus = createFunctionWrapper('automation/runAnalyzer10000Plus');

export const automationPopulateGamesFromSportsbooks = createFunctionWrapper('automation/populateGamesFromSportsbooks');

export const automationCheckActiveSports = createFunctionWrapper('automation/checkActiveSports');

export const utilsREADME = createFunctionWrapper('utils/README');

export const utilsPredictGameScore = createFunctionWrapper('utils/predictGameScore');

export const utilsReformatOddsData = createFunctionWrapper('utils/reformatOddsData');

export const utilsSetUserRole = createFunctionWrapper('utils/setUserRole');

export const utilsLogEventToExternalApp = createFunctionWrapper('utils/logEventToExternalApp');

export const utilsFetchSportsOdds = createFunctionWrapper('utils/fetchSportsOdds');

export const utils_schemas = createFunctionWrapper('utils/_schemas');

export const README = createFunctionWrapper("README");

export const fetchGameResults = createFunctionWrapper("fetchGameResults");

export const autoScoreMonitor = createFunctionWrapper("autoScoreMonitor");

export const PredictionHistory = createFunctionWrapper("PredictionHistory");

export const learningAlgorithm = createFunctionWrapper("learningAlgorithm");

export const applyLearningToAnalyzer = createFunctionWrapper("applyLearningToAnalyzer");

export const exportPredictions = createFunctionWrapper("exportPredictions");

export const refreshFullSlateAllSports = createFunctionWrapper("refreshFullSlateAllSports");

export const rostersUpdateNFLRoster = createFunctionWrapper('rosters/updateNFLRoster');

export const runBulkPropsAnalyzer = createFunctionWrapper("runBulkPropsAnalyzer");

export const autoGradeGame = createFunctionWrapper("autoGradeGame");

export const fetchSportsData = createFunctionWrapper("fetchSportsData");

export const populateNFLHistory = createFunctionWrapper("populateNFLHistory");

export const populateDraftKingsOdds = createFunctionWrapper("populateDraftKingsOdds");

export const populateFanDuelOdds = createFunctionWrapper("populateFanDuelOdds");

export const weeklyHistoricalUpdate = createFunctionWrapper("weeklyHistoricalUpdate");

export const analyzePlayerProps = createFunctionWrapper("analyzePlayerProps");

export const analyzeTeamProps = createFunctionWrapper("analyzeTeamProps");

export const selectBestProps = createFunctionWrapper("selectBestProps");

export const debug_props = createFunctionWrapper("debug_props");

export const fixed_selectBestProps = createFunctionWrapper("fixed_selectBestProps");

export const fixed_refreshFullSlateAllSports = createFunctionWrapper("fixed_refreshFullSlateAllSports");

export const run_this_first = createFunctionWrapper("run_this_first");

export const verify_game_data = createFunctionWrapper("verify_game_data");

export const simpleRefreshGames = createFunctionWrapper("simpleRefreshGames");

export const testingDiagnoseOddsAPI = createFunctionWrapper('testing/diagnoseOddsAPI');

export const analyzeGameOnly = createFunctionWrapper("analyzeGameOnly");

export const autoLearnAfterGrading = createFunctionWrapper("autoLearnAfterGrading");

export const testingTestPropsHaveLines = createFunctionWrapper('testing/testPropsHaveLines');

export const EMERGENCY_FIX_EVERYTHING = createFunctionWrapper("EMERGENCY_FIX_EVERYTHING");

export const DIAGNOSE_EVERYTHING = createFunctionWrapper("DIAGNOSE_EVERYTHING");

export const repopulateFullSlate = createFunctionWrapper("repopulateFullSlate");

export const scrapeRotowireProps = createFunctionWrapper("scrapeRotowireProps");

export const rostersUpdateNFLRosterOnly = createFunctionWrapper('rosters/updateNFLRosterOnly');

export const gradeAllGames = createFunctionWrapper("gradeAllGames");

export const fetchCompleteSchedule = createFunctionWrapper("fetchCompleteSchedule");

export const DiagnoseGameData = createFunctionWrapper("DiagnoseGameData");

export const refreshSportSlate = createFunctionWrapper("refreshSportSlate");

export const testRefreshSportSlate = createFunctionWrapper("testRefreshSportSlate");

export const diagnosticPopulate = createFunctionWrapper("diagnosticPopulate");

export const populateGamesOnly = createFunctionWrapper("populateGamesOnly");

export const updateRosters = createFunctionWrapper("updateRosters");

export const getDatabaseStatus = createFunctionWrapper("getDatabaseStatus");

export const getDashboardStats = createFunctionWrapper("getDashboardStats");

export const getGradingStats = createFunctionWrapper("getGradingStats");

export const markPastGamesCompleted = createFunctionWrapper("markPastGamesCompleted");

export const trainAnalyzer = createFunctionWrapper("trainAnalyzer");

export const trainFromHistoricalData = createFunctionWrapper("trainFromHistoricalData");

export const getLearningProgress = createFunctionWrapper("getLearningProgress");

export const migrateRosters = createFunctionWrapper("migrateRosters");

export const getLearningSystemStats = createFunctionWrapper("getLearningSystemStats");

export const getLearnedPatterns = createFunctionWrapper("getLearnedPatterns");

export const cronScheduler = createFunctionWrapper("cronScheduler");

