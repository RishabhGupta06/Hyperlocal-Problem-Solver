'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Flame, Star, Crown } from 'lucide-react';
import { getLeaderboard, getLevelForXP, getUserBadges, getCommunityScore, LEVELS, BADGES } from '@/app/lib/gamification';
import { getCurrentUser } from '@/app/lib/store';
import BadgeDisplay from '@/app/components/BadgeDisplay';
import StatsCard from '@/app/components/StatsCard';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [communityScore, setCommunityScore] = useState(null);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const lb = getLeaderboard();
    setLeaderboard(lb);
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
      setUserBadges(getUserBadges(user.id));
    }
    setCommunityScore(getCommunityScore());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="page-content">
        <div className="stats-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: '120px' }} />
          ))}
        </div>
      </div>
    );
  }

  const currentLevelInfo = currentUser ? getLevelForXP(currentUser.xp) : null;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-title-gradient">Leaderboard & Achievements</span>
        </h1>
        <p className="page-subtitle">
          Celebrate community heroes and track your progress
        </p>
      </div>

      {/* Community Stats */}
      <div className="stats-grid">
        <StatsCard
          icon="🏆"
          value={communityScore?.score || 0}
          label="Community Score"
          trend="up"
          trendValue="+5%"
          color="purple"
          delay={0}
        />
        <StatsCard
          icon="👥"
          value={communityScore?.activeUsers || 0}
          label="Active Citizens"
          color="blue"
          delay={100}
        />
        <StatsCard
          icon="⭐"
          value={communityScore?.totalXP || 0}
          label="Total XP Earned"
          trend="up"
          trendValue="+230"
          color="orange"
          delay={200}
        />
        <StatsCard
          icon="🔥"
          value={communityScore?.avgStreak || 0}
          label="Avg Streak (days)"
          color="green"
          delay={300}
        />
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Leaderboard
        </button>
        <button
          className={`tab ${activeTab === 'my-progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-progress')}
        >
          📊 My Progress
        </button>
        <button
          className={`tab ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          🏅 Badges
        </button>
      </div>

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="animate-fade-in">
          {leaderboard.map((user, idx) => {
            const rankClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'default';
            const isCurrentUser = user.id === currentUser?.id;

            return (
              <div
                key={user.id}
                className="leaderboard-item animate-slide-up"
                style={{
                  animationDelay: `${idx * 60}ms`,
                  border: isCurrentUser ? '1px solid var(--accent-blue)' : undefined,
                  background: isCurrentUser ? 'rgba(59, 130, 246, 0.05)' : undefined,
                }}
              >
                <div className={`leaderboard-rank ${rankClass}`}>
                  {idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : user.rank}
                </div>

                <div className="leaderboard-avatar">{user.avatar}</div>

                <div className="leaderboard-info">
                  <div className="leaderboard-name">
                    {user.name}
                    {isCurrentUser && (
                      <span style={{ fontSize: '11px', color: 'var(--accent-blue)', marginLeft: '8px' }}>
                        (You)
                      </span>
                    )}
                  </div>
                  <div className="leaderboard-level">
                    {user.levelInfo?.current?.icon} {user.level}
                    <span style={{ margin: '0 4px' }}>·</span>
                    🔥 {user.streak} day streak
                  </div>
                </div>

                <div className="leaderboard-stats">
                  <div>
                    <div className="leaderboard-stat-value">{user.reports}</div>
                    <div>Reports</div>
                  </div>
                  <div>
                    <div className="leaderboard-stat-value">{user.verifications}</div>
                    <div>Verified</div>
                  </div>
                  <div>
                    <div className="leaderboard-stat-value">{user.badgeCount}</div>
                    <div>Badges</div>
                  </div>
                </div>

                <div className="leaderboard-xp">{user.xp} XP</div>
              </div>
            );
          })}
        </div>
      )}

      {/* My Progress Tab */}
      {activeTab === 'my-progress' && currentUser && currentLevelInfo && (
        <div className="animate-fade-in">
          <div className="grid-2">
            {/* Level Card */}
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {currentLevelInfo.current.icon}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>
                {currentLevelInfo.current.name}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                {currentUser.xp} XP
              </p>

              {/* XP Progress Bar */}
              <div className="xp-bar-container">
                <div className="xp-bar-header">
                  <span>{currentLevelInfo.current.name}</span>
                  <span>{currentLevelInfo.next ? currentLevelInfo.next.name : 'Max Level!'}</span>
                </div>
                <div className="xp-bar" style={{ height: '12px' }}>
                  <div
                    className="xp-bar-fill"
                    style={{ width: `${currentLevelInfo.progress}%` }}
                  />
                </div>
                <div className="xp-bar-header" style={{ marginTop: '6px' }}>
                  <span>{currentLevelInfo.progress}%</span>
                  {currentLevelInfo.next && (
                    <span>{currentLevelInfo.xpToNext} XP to next level</span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="glass-card">
              <h3 className="section-title" style={{ marginBottom: '20px' }}>Your Stats</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    📝 Issues Reported
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 700 }}>{currentUser.reports}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    ✅ Issues Verified
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 700 }}>{currentUser.verifications}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    🔥 Current Streak
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b' }}>{currentUser.streak} days</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    🏅 Badges Earned
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-purple)' }}>
                    {currentUser.badges?.length || 0}/{BADGES.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progression */}
          <div className="glass-card" style={{ marginTop: '24px' }}>
            <h3 className="section-title" style={{ marginBottom: '20px' }}>Level Progression</h3>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {LEVELS.map((level, idx) => {
                const isActive = currentLevelInfo.current.name === level.name;
                const isPast = currentUser.xp >= level.minXP;
                return (
                  <div
                    key={level.name}
                    style={{
                      flex: '0 0 auto',
                      padding: '16px 24px',
                      borderRadius: 'var(--radius-lg)',
                      border: isActive ? '2px solid var(--accent-blue)' : '1px solid var(--border-default)',
                      background: isActive ? 'rgba(59,130,246,0.08)' : isPast ? 'var(--bg-card)' : 'var(--bg-input)',
                      opacity: isPast ? 1 : 0.4,
                      textAlign: 'center',
                      minWidth: '120px',
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '4px' }}>{level.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: isActive ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                      {level.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {level.minXP} XP
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="glass-card animate-fade-in">
          <h3 className="section-title" style={{ marginBottom: '4px' }}>All Achievements</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Earn badges by actively participating in your community
          </p>
          <BadgeDisplay userBadges={userBadges} />
        </div>
      )}
    </>
  );
}
