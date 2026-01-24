"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../../components/api";
import { Shell } from "../../../components/layout";
import { 
  Trophy, Calendar, MapPin, TrendingUp, Award, 
  Clock, Shield, ChevronRight, Flame, Target,
  Users, ArrowLeft, Star, Activity, Zap, TrendingDown
} from "lucide-react";
import Link from "next/link";

// TODO: Remove demo data when backend is ready
const DEMO_TEAM = {
  id: "1",
  name: "Manchester United",
  logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  league: {
    id: "1",
    name: "Premier League",
    country: "England",
    logo: null
  },
  founded: 1878,
  stadium: "Old Trafford",
  capacity: 74879,
  homeMatches: [
    {
      id: "1",
      homeTeam: { name: "Manchester United", logo: null },
      awayTeam: { name: "Liverpool", logo: null },
      kickoffTime: "2026-01-25T15:00:00Z",
      status: "UPCOMING",
      score: null,
      venue: "Old Trafford",
      league: { name: "Premier League" }
    },
    {
      id: "2",
      homeTeam: { name: "Manchester United", logo: null },
      awayTeam: { name: "Chelsea", logo: null },
      kickoffTime: "2026-01-18T20:00:00Z",
      status: "FINISHED",
      score: "2-1",
      venue: "Old Trafford",
      league: { name: "Premier League" }
    },
    {
      id: "5",
      homeTeam: { name: "Manchester United", logo: null },
      awayTeam: { name: "Tottenham", logo: null },
      kickoffTime: "2026-01-12T14:00:00Z",
      status: "FINISHED",
      score: "3-0",
      venue: "Old Trafford",
      league: { name: "Premier League" }
    }
  ],
  awayMatches: [
    {
      id: "3",
      homeTeam: { name: "Arsenal", logo: null },
      awayTeam: { name: "Manchester United", logo: null },
      kickoffTime: "2026-01-28T19:45:00Z",
      status: "UPCOMING",
      score: null,
      venue: "Emirates Stadium",
      league: { name: "Premier League" }
    },
    {
      id: "4",
      homeTeam: { name: "Manchester City", logo: null },
      awayTeam: { name: "Manchester United", logo: null },
      kickoffTime: "2026-01-15T16:30:00Z",
      status: "FINISHED",
      score: "1-2",
      venue: "Etihad Stadium",
      league: { name: "Premier League" }
    },
    {
      id: "6",
      homeTeam: { name: "Newcastle", logo: null },
      awayTeam: { name: "Manchester United", logo: null },
      kickoffTime: "2026-01-09T20:00:00Z",
      status: "FINISHED",
      score: "1-1",
      venue: "St James' Park",
      league: { name: "Premier League" }
    }
  ]
};

interface TeamDetailPageProps {
  params: {
    teamId: string;
  };
}

export default function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { teamId } = params;
  
  const [team, setTeam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadTeam() {
    setIsLoading(true);
    try {
      const data = await apiGet<any>(`/api/teams/${teamId}`);
      
      if (!data) {
        setTeam(DEMO_TEAM);
      } else {
        setTeam(data);
      }
    } catch (error) {
      console.log("Using demo team data");
      setTeam(DEMO_TEAM);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (teamId) loadTeam();
  }, [teamId]);

  if (isLoading) {
    return (
      <Shell>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-32 bg-slate-800/50 rounded-lg" />
          <div className="h-72 bg-slate-800/50 rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-36 bg-slate-800/50 rounded-xl" />
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  if (!team) {
    return (
      <Shell>
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-300 mb-2">Team not found</h2>
          <Link href="/teams" className="text-blue-400 hover:text-blue-300 text-sm">
            Back to Teams
          </Link>
        </div>
      </Shell>
    );
  }

  const allMatches = [...(team.homeMatches || []), ...(team.awayMatches || [])];
  const upcomingMatches = allMatches
    .filter(m => m.status === "UPCOMING")
    .sort((a, b) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime())
    .slice(0, 5);
  const recentMatches = allMatches
    .filter(m => m.status === "FINISHED")
    .sort((a, b) => new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime())
    .slice(0, 5);
  
  const wins = recentMatches.filter(m => {
    if (!m.score) return false;
    const [home, away] = m.score.split('-').map(Number);
    return (m.homeTeam.name === team.name && home > away) || 
           (m.awayTeam.name === team.name && away > home);
  }).length;

  const draws = recentMatches.filter(m => {
    if (!m.score) return false;
    const [home, away] = m.score.split('-').map(Number);
    return home === away;
  }).length;

  const losses = recentMatches.length - wins - draws;
  
  const winRate = recentMatches.length > 0 ? Math.round((wins / recentMatches.length) * 100) : 0;

  // Get last 5 match results for form
  const lastFiveResults = recentMatches.slice(0, 5).map(m => {
    if (!m.score) return null;
    const [home, away] = m.score.split('-').map(Number);
    if (home === away) return 'D';
    return (m.homeTeam.name === team.name && home > away) || 
           (m.awayTeam.name === team.name && away > home) ? 'W' : 'L';
  }).filter(Boolean).reverse();

  return (
    <Shell>
      <div className="space-y-8">
        {/* Back Button */}
        <Link 
          href="/teams"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to Teams</span>
        </Link>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50">
          {/* Animated background */}
          <div 
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse-slow"
            style={{ background: `radial-gradient(circle, ${team.primaryColor || '#3b82f6'}, transparent)` }}
          />
          <div 
            className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse-slow"
            style={{ background: `radial-gradient(circle, ${team.secondaryColor || team.primaryColor || '#06b6d4'}, transparent)`, animationDelay: '1s' }}
          />
          
          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              {/* Team Logo */}
              <div className="relative shrink-0">
                <div className="relative group">
                  {/* Logo Container with enhanced styling */}
                  <div className="relative w-40 h-40 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center p-6 shadow-2xl transform transition-transform duration-500 group-hover:scale-105 group-hover:border-blue-500/50">
                    {team.logo ? (
                      <img 
                        src={team.logo} 
                        alt={team.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full flex items-center justify-center font-bold text-6xl text-blue-400"
                      style={{ 
                        display: team.logo ? 'none' : 'flex',
                        textShadow: '0 4px 12px rgba(59, 130, 246, 0.5)'
                      }}
                    >
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                  </div>
                  
                  {/* Rank Badge */}
                  <div className="absolute -top-4 -right-4 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-slate-900 text-sm font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5 animate-bounce-subtle border-2 border-yellow-300/50">
                    <Star className="w-4 h-4 fill-slate-900" />
                    <span>#1</span>
                  </div>

                  {/* Form indicator */}
                  {lastFiveResults.length > 0 && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-slate-900/90 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-700/50 shadow-lg">
                      {lastFiveResults.map((result, i) => (
                        <div 
                          key={i}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            result === 'W' ? 'bg-green-500 text-white' :
                            result === 'D' ? 'bg-yellow-500 text-slate-900' :
                            'bg-red-500 text-white'
                          }`}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Team Info */}
              <div className="flex-1 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm font-medium text-blue-400">
                      <Shield className="w-4 h-4" />
                      {team.league?.name || "No League"}
                    </div>
                    {team.league?.country && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full text-sm text-slate-400">
                        <Award className="w-4 h-4" />
                        {team.league.country}
                      </div>
                    )}
                  </div>
                  
                  <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent leading-tight">
                    {team.name}
                  </h1>
                  
                  <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                    {team.founded && (
                      <div className="flex items-center gap-2 bg-slate-800/30 px-3 py-2 rounded-lg border border-slate-700/30">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span>Est. {team.founded}</span>
                      </div>
                    )}
                    {team.stadium && (
                      <div className="flex items-center gap-2 bg-slate-800/30 px-3 py-2 rounded-lg border border-slate-700/30">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span>{team.stadium}</span>
                      </div>
                    )}
                    {team.capacity && (
                      <div className="flex items-center gap-2 bg-slate-800/30 px-3 py-2 rounded-lg border border-slate-700/30">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span>{team.capacity.toLocaleString()} capacity</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-green-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400 opacity-50" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{wins}</div>
            <div className="text-sm text-slate-400">Wins</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/40 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{draws}</div>
            <div className="text-sm text-slate-400">Draws</div>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{losses}</div>
            <div className="text-sm text-slate-400">Losses</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{winRate}%</div>
            <div className="text-sm text-slate-400">Win Rate</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{allMatches.length}</div>
            <div className="text-sm text-slate-400">Played</div>
          </div>
        </div>

        {/* Matches Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Matches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                Upcoming Matches
              </h2>
              <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <span className="text-sm font-semibold text-blue-400">{upcomingMatches.length}</span>
              </div>
            </div>

            <div className="space-y-3">
              {upcomingMatches.length > 0 ? upcomingMatches.map((match, idx) => (
                <Link 
                  key={match.id} 
                  href={`/matches/${match.id}`}
                  className="block bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group"
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${idx * 0.1}s both`
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                      {match.league?.name || "League"}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(match.kickoffTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 text-right">
                      <span className="font-semibold text-base block truncate">{match.homeTeam.name}</span>
                    </div>
                    <div className="px-5 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700/50 group-hover:border-blue-500/30 transition-colors">
                      <span className="text-sm font-bold text-slate-400 group-hover:text-blue-400 transition-colors">VS</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-base block truncate">{match.awayTeam.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{match.venue || "TBD"}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              )) : (
                <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-700/50">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">No upcoming matches</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-green-400" />
                </div>
                Recent Results
              </h2>
              <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <span className="text-sm font-semibold text-green-400">{recentMatches.length}</span>
              </div>
            </div>

            <div className="space-y-3">
              {recentMatches.length > 0 ? recentMatches.map((match, idx) => {
                const [homeScore, awayScore] = (match.score || "0-0").split('-').map(Number);
                const isWin = (match.homeTeam.name === team.name && homeScore > awayScore) || 
                             (match.awayTeam.name === team.name && awayScore > homeScore);
                const isDraw = homeScore === awayScore;
                
                return (
                  <Link 
                    key={match.id}
                    href={`/matches/${match.id}`}
                    className="block bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 group"
                    style={{
                      animation: `fadeInUp 0.4s ease-out ${idx * 0.1}s both`
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20">
                        FINISHED
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(match.kickoffTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 text-right">
                        <span className="font-semibold text-base block truncate">{match.homeTeam.name}</span>
                      </div>
                      <div className="px-5 py-3 bg-slate-800/90 rounded-xl border border-slate-700/50 min-w-[100px] flex items-center justify-center gap-3">
                        <span className={`text-xl font-bold ${match.homeTeam.name === team.name && homeScore > awayScore ? 'text-green-400' : 'text-white'}`}>
                          {homeScore}
                        </span>
                        <span className="text-slate-600 font-bold">-</span>
                        <span className={`text-xl font-bold ${match.awayTeam.name === team.name && awayScore > homeScore ? 'text-green-400' : 'text-white'}`}>
                          {awayScore}
                        </span>
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-base block truncate">{match.awayTeam.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isWin ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
                          isDraw ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400' :
                          'bg-red-500/20 border border-red-500/30 text-red-400'
                        }`}>
                          {isWin ? 'W' : isDraw ? 'D' : 'L'}
                        </div>
                        <span className={`text-sm font-semibold ${
                          isWin ? 'text-green-400' : isDraw ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {isWin ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                );
              }) : (
                <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-700/50">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">No recent matches</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
        }
        
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </Shell>
  );
}