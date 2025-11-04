import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/components/contexts/AuthContext";
import {
  Shield,
  GraduationCap,
  Trophy,
  Diamond,
  Flag,
  Wrench,
  Activity,
  Target,
  Brain,
  BarChart3,
  Database,
  Bug,
  FileText,
  TrendingUp,
} from "lucide-react";

const mainPages = [
  { path: "NFLPage", label: "NFL", icon: Shield },
  { path: "CFBPage", label: "CFB", icon: GraduationCap },
  { path: "NBAPage", label: "NBA", icon: Trophy },
  { path: "MLBPage", label: "MLB", icon: Diamond },
  { path: "UFCPage", label: "UFC", icon: Shield },
  { path: "GolfPage", label: "Golf", icon: Flag },
  { path: "PropsPage", label: "Top Props", icon: Target },
];

const analyticsPages = [
  { path: "InjuriesPage", label: "Injuries", icon: Activity },
];

const adminPages = [
  { path: "AdminDevTools", label: "Developer Tools", icon: Wrench, description: "Main automation dashboard" },
  { path: "ManualTools", label: "Manual Tools", icon: FileText, description: "Search & manually grade games" },
  { path: "MultiSportOdds", label: "Multi-Sport Odds", icon: TrendingUp, description: "Training data & grading" },
  { path: "PredictionHistory", label: "Prediction History", icon: BarChart3, description: "Analyze past predictions" },
  { path: "HistoricalDataPanel", label: "Historical Data", icon: Database, description: "5-year database manager" },
  { path: "Diagnostics", label: "Debug Tools", icon: Bug, description: "Advanced debugging" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useAuth();
  
  // More defensive admin check
  const isAdmin = React.useMemo(() => {
    if (loading || error || !user) return false;
    return user.role === "admin";
  }, [user, loading, error]);

  const goToPage = (pageName) => {
    navigate(createPageUrl(pageName));
  };

  const isActivePage = (pageName) => {
    return location.pathname.includes(pageName);
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-slate-900/50 backdrop-blur-xl border-r border-purple-500/20 flex flex-col shadow-2xl z-50">
      {/* Logo */}
      <div className="p-6 border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Prophet.AI
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Leagues */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Leagues
          </h3>
          <div className="space-y-1">
            {mainPages.map(({ path, label, icon: Icon }) => {
              const isActive = isActivePage(path);
              
              return (
                <button
                  key={label}
                  onClick={() => goToPage(path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Analytics */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Analytics
          </h3>
          <div className="space-y-1">
            {analyticsPages.map(({ path, label, icon: Icon }) => {
              const isActive = isActivePage(path);
              
              return (
                <button
                  key={label}
                  onClick={() => goToPage(path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/50'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Admin Tools - Always show when user is admin */}
        {isAdmin && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
              Admin Tools
            </h3>
            <div className="space-y-1">
              {adminPages.map(({ path, label, icon: Icon, description }) => {
                const isActive = isActivePage(path);
                
                return (
                  <button
                    key={path}
                    onClick={() => goToPage(path)}
                    title={description}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-purple-500/20">
        <div className="text-center">
          {loading ? (
            <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
          ) : error ? (
            <p className="text-sm text-red-400">Error loading user</p>
          ) : user ? (
            <>
              <p className="text-sm text-gray-400 truncate">{user.email}</p>
              {isAdmin && (
                <span className="inline-block mt-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded">
                  ADMIN
                </span>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">Guest</p>
          )}
        </div>
      </div>
    </div>
  );
}