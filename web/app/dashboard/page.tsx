"use client";

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Trophy, Users, Settings, TrendingUp, Gamepad2, Bell, Crown, Zap, Star } from 'lucide-react';

export default function FlacronDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    rank: 0,
    winRate: 0
  });

  useEffect(() => {
    // Animate stats on load
    const timer = setTimeout(() => {
      setStats({
        gamesPlayed: 247,
        wins: 156,
        rank: 1247,
        winRate: 63.2
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const StatCard = ({ icon: Icon, label, value, suffix = '', color, delay }: any) => (
    <div 
      className="relative group"
      style={{ animation: `slideUp 0.6s ease-out ${delay}s both` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <p className="text-3xl font-bold text-white">{value}</p>
          {suffix && <span className="text-lg text-slate-400">{suffix}</span>}
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ icon: Icon, label, badge, color }: any) => (
    <button className="relative group w-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:-translate-y-0.5 text-left">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-medium flex-1">{label}</span>
        {badge && (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
            {badge}
          </span>
        )}
      </div>
    </button>
  );

  const RecentMatch = ({ game, result, score, time }: any) => (
    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 hover:border-blue-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-semibold">{game}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          result === 'WIN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {result}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">{score}</span>
        <span className="text-slate-500">{time}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Gamepad2 className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Flacron Gamezone
                </h1>
                <p className="text-slate-400 text-sm">Welcome back, Champion!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={Gamepad2}
            label="Games Played"
            value={stats.gamesPlayed}
            color="from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard 
            icon={Trophy}
            label="Total Wins"
            value={stats.wins}
            color="from-yellow-500 to-orange-500"
            delay={0.1}
          />
          <StatCard 
            icon={TrendingUp}
            label="Win Rate"
            value={stats.winRate}
            suffix="%"
            color="from-green-500 to-emerald-600"
            delay={0.2}
          />
          <StatCard 
            icon={Crown}
            label="Global Rank"
            value={`#${stats.rank}`}
            color="from-purple-500 to-pink-500"
            delay={0.3}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6" style={{ animation: 'slideUp 0.6s ease-out 0.4s both' }}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <QuickAction icon={Gamepad2} label="Find Match" color="from-blue-500 to-blue-600" />
                <QuickAction icon={Users} label="Join Lobby" badge="12" color="from-green-500 to-emerald-600" />
                <QuickAction icon={Trophy} label="Tournaments" badge="NEW" color="from-yellow-500 to-orange-500" />
                <QuickAction icon={Star} label="Challenges" color="from-purple-500 to-pink-500" />
              </div>
            </div>

            {/* Recent Matches */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6" style={{ animation: 'slideUp 0.6s ease-out 0.5s both' }}>
              <h2 className="text-xl font-bold text-white mb-4">Recent Matches</h2>
              <div className="space-y-3">
                <RecentMatch game="Battle Arena" result="WIN" score="24-18" time="2h ago" />
                <RecentMatch game="Speed Racer" result="WIN" score="1st Place" time="4h ago" />
                <RecentMatch game="Tower Defense" result="LOSS" score="Wave 47" time="6h ago" />
                <RecentMatch game="Battle Arena" result="WIN" score="32-21" time="8h ago" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player Card */}
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 overflow-hidden" style={{ animation: 'slideUp 0.6s ease-out 0.6s both' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
              <div className="relative">                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-3xl font-bold text-white">P</span>
                </div>
                <h3 className="text-xl font-bold text-center text-white mb-1">Player</h3>
                <p className="text-center text-slate-400 text-sm mb-4">Level 42 • Elite Gamer</p>
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">XP Progress</span>
                    <span className="text-white text-sm font-semibold">2,450 / 3,000</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000" style={{ width: '82%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6" style={{ animation: 'slideUp 0.6s ease-out 0.7s both' }}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top Players
              </h2>
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'DragonSlayer', score: '9,847', color: 'from-yellow-500 to-yellow-600' },
                  { rank: 2, name: 'NinjaKnight', score: '9,521', color: 'from-slate-400 to-slate-500' },
                  { rank: 3, name: 'PhoenixRise', score: '9,203', color: 'from-orange-600 to-orange-700' },
                  { rank: 4, name: 'You', score: '8,942', color: 'from-blue-500 to-blue-600' }
                ].map((player, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-3 hover:bg-slate-800/50 transition-all">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${player.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold text-sm">{player.rank}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{player.name}</p>
                    </div>
                    <span className="text-slate-400 text-sm font-semibold">{player.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}