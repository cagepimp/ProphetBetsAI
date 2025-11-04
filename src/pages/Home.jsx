import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Zap, TrendingUp, Target, BarChart3, Brain, Activity } from "lucide-react";
import LivePredictionsFeed from "@/components/home/LivePredictionsFeed";
import PerformanceTracker from "@/components/home/PerformanceTracker";
import TrendingProps from "@/components/home/TrendingProps";

export default function Home() {
  return (
    <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 min-h-screen">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-8 py-20">
        
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20">
          
          {/* Left side - Icon */}
          <div className="flex-shrink-0">
            <div className="w-40 h-40 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50">
              <Brain className="w-20 h-20 text-white" />
            </div>
          </div>
          
          {/* Right side - Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-full mb-6">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-purple-200 text-sm font-semibold">AI-Powered Sports Analytics</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                ProphetBets AI
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-2xl md:text-3xl text-purple-100 font-semibold mb-8">
              High-Confidence Predictions Across 6 Sports
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0">
              <div className="bg-purple-800/40 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">74.9%</div>
                <div className="text-sm text-purple-200 uppercase tracking-wide">Peak Accuracy</div>
              </div>
              
              <div className="bg-purple-800/40 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-cyan-400 mb-2">10K+</div>
                <div className="text-sm text-purple-200 uppercase tracking-wide">Iterations</div>
              </div>
              
              <div className="bg-purple-800/40 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-pink-400 mb-2">6</div>
                <div className="text-sm text-purple-200 uppercase tracking-wide">Sports</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Stats Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Live Performance Stats</h2>
          <PerformanceTracker />
        </div>

        {/* Today's Action Section */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-6">
            <LivePredictionsFeed />
            <TrendingProps />
          </div>
        </div>

        {/* Sports Navigation */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Choose Your Sport</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <Link 
              to={createPageUrl('NFLPage')}
              className="group bg-purple-800/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 text-center hover:bg-purple-700/40 hover:border-purple-400/50 transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
            >
              <div className="text-4xl mb-3">🏈</div>
              <div className="text-white font-bold text-lg">NFL</div>
              <div className="text-purple-300 text-sm">Pro Football</div>
            </Link>
            
            <Link 
              to={createPageUrl('CFBPage')}
              className="group bg-purple-800/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 text-center hover:bg-purple-700/40 hover:border-purple-400/50 transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
            >
              <div className="text-4xl mb-3">🎓</div>
              <div className="text-white font-bold text-lg">CFB</div>
              <div className="text-purple-300 text-sm">College Football</div>
            </Link>
            
            <Link 
              to={createPageUrl('NBAPage')}
              className="group bg-purple-800/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 text-center hover:bg-purple-700/40 hover:border-purple-400/50 transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
            >
              <div className="text-4xl mb-3">🏀</div>
              <div className="text-white font-bold text-lg">NBA</div>
              <div className="text-purple-300 text-sm">Basketball</div>
            </Link>
            
            <Link 
              to={createPageUrl('MLBPage')}
              className="group bg-purple-800/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 text-center hover:bg-purple-700/40 hover:border-purple-400/50 transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
            >
              <div className="text-4xl mb-3">⚾</div>
              <div className="text-white font-bold text-lg">MLB</div>
              <div className="text-purple-300 text-sm">Baseball</div>
            </Link>
            
            <Link 
              to={createPageUrl('UFCPage')}
              className="group bg-purple-800/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 text-center hover:bg-purple-700/40 hover:border-purple-400/50 transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
            >
              <div className="text-4xl mb-3">🥊</div>
              <div className="text-white font-bold text-lg">UFC</div>
              <div className="text-purple-300 text-sm">MMA</div>
            </Link>
            
            <Link 
              to={createPageUrl('GolfPage')}
              className="group bg-purple-800/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-6 text-center hover:bg-purple-700/40 hover:border-purple-400/50 transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
            >
              <div className="text-4xl mb-3">⛳</div>
              <div className="text-white font-bold text-lg">Golf</div>
              <div className="text-purple-300 text-sm">PGA</div>
            </Link>
            
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Powered By Advanced AI</h2>
          <div className="grid md:grid-cols-3 gap-6">
            
            <div className="bg-purple-800/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8 hover:bg-purple-700/40 hover:border-purple-400/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">10K+ Iterations</h3>
              <p className="text-purple-200">
                Each prediction runs thousands of simulations analyzing every possible outcome for maximum confidence
              </p>
            </div>
            
            <div className="bg-purple-800/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8 hover:bg-purple-700/40 hover:border-purple-400/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">7-Factor Analysis</h3>
              <p className="text-purple-200">
                Line value, injuries, weather, sharp money, matchups, trends - every angle analyzed for edge detection
              </p>
            </div>
            
            <div className="bg-purple-800/30 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8 hover:bg-purple-700/40 hover:border-purple-400/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-4">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Continuous Learning</h3>
              <p className="text-purple-200">
                System learns from every result, feeding historical data back to improve accuracy over time
              </p>
            </div>
            
          </div>
        </div>
        
        {/* Social Media Section */}
        <div className="border-t border-purple-500/30 pt-12">
          <h3 className="text-center text-2xl font-bold text-white mb-8">Join Our Community</h3>
          <div className="flex flex-wrap justify-center gap-4">
            
            <a
              href="https://www.patreon.com/c/ProphetBetsAI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003"/>
              </svg>
              Patreon
            </a>
            
            <a
              href="https://discord.gg/QARwcgEJ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Discord
            </a>
            
            <a
              href="https://x.com/prophetbetsai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X / Twitter
            </a>
            
            <a
              href="https://www.instagram.com/prophetbetsai/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>
            
          </div>
          
          <p className="text-purple-300 text-center text-sm mt-8">
            Join thousands of bettors using AI to gain an edge. Daily picks, analysis updates, and exclusive insights.
          </p>
        </div>
        
      </div>
    </main>
  );
}
