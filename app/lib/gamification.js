// ============================================================
// Community Hero — Gamification System
// ============================================================
// XP, levels, badges, streaks, and achievements.
// ============================================================

import { getUserById, updateUser, getUsers } from './store';

// ── Level Definitions ──────────────────────────────────────
export const LEVELS = [
  { name: 'Citizen', minXP: 0, icon: '🏠', color: '#64748b' },
  { name: 'Contributor', minXP: 200, icon: '⭐', color: '#3b82f6' },
  { name: 'Guardian', minXP: 800, icon: '🛡️', color: '#8b5cf6' },
  { name: 'Hero', minXP: 2000, icon: '🦸', color: '#f59e0b' },
  { name: 'Legend', minXP: 3000, icon: '👑', color: '#ef4444' },
];

// ── Badge Definitions ──────────────────────────────────────
export const BADGES = [
  { id: 'first_report', name: 'First Report', description: 'Reported your first community issue', icon: '📝', xpRequired: 0 },
  { id: 'verified_10', name: 'Trusted Eye', description: 'Verified 10 community issues', icon: '👁️', xpRequired: 200 },
  { id: 'verified_50', name: 'Watchdog', description: 'Verified 50 community issues', icon: '🐕', xpRequired: 1000 },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintained a 7-day activity streak', icon: '🔥', xpRequired: 350 },
  { id: 'streak_14', name: 'Fortnight Force', description: 'Maintained a 14-day activity streak', icon: '💪', xpRequired: 700 },
  { id: 'community_champion', name: 'Community Champion', description: 'Received 100+ total upvotes on your reports', icon: '🏅', xpRequired: 1500 },
  { id: 'resolver', name: 'Problem Solver', description: 'Helped resolve 5 community issues', icon: '🔧', xpRequired: 1000 },
  { id: 'legend', name: 'Living Legend', description: 'Reached Legend status', icon: '👑', xpRequired: 3000 },
  { id: 'first_comment', name: 'Voice Heard', description: 'Left your first comment on an issue', icon: '💬', xpRequired: 0 },
  { id: 'reporter_10', name: 'Active Reporter', description: 'Reported 10 community issues', icon: '📢', xpRequired: 500 },
];

// ── XP Actions ─────────────────────────────────────────────
export const XP_ACTIONS = {
  REPORT_ISSUE: { xp: 50, label: 'Report an issue' },
  VERIFY_ISSUE: { xp: 20, label: 'Verify an issue' },
  COMMENT: { xp: 10, label: 'Comment on an issue' },
  ISSUE_UPVOTED: { xp: 5, label: 'Your issue got upvoted' },
  ISSUE_RESOLVED: { xp: 100, label: 'Your reported issue was resolved' },
  DAILY_LOGIN: { xp: 15, label: 'Daily activity bonus' },
};

/**
 * Get level info for a given XP amount.
 */
export function getLevelForXP(xp) {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
      break;
    }
  }

  const progress = nextLevel
    ? ((xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100
    : 100;

  return {
    current: currentLevel,
    next: nextLevel,
    progress: Math.min(100, Math.round(progress)),
    xpToNext: nextLevel ? nextLevel.minXP - xp : 0,
  };
}

/**
 * Add XP to a user and update their level.
 */
export function addXP(userId, amount, reason) {
  const user = getUserById(userId);
  if (!user) return null;

  const newXP = user.xp + amount;
  const levelInfo = getLevelForXP(newXP);

  updateUser(userId, {
    xp: newXP,
    level: levelInfo.current.name,
  });

  return { xp: newXP, level: levelInfo.current.name, gained: amount, reason };
}

/**
 * Get badge info for a user — which they've earned and which are locked.
 */
export function getUserBadges(userId) {
  const user = getUserById(userId);
  if (!user) return [];

  return BADGES.map(badge => ({
    ...badge,
    earned: user.badges?.includes(badge.id) || false,
  }));
}

/**
 * Get leaderboard — all users sorted by XP.
 */
export function getLeaderboard() {
  const users = getUsers();
  return users
    .sort((a, b) => b.xp - a.xp)
    .map((user, index) => ({
      rank: index + 1,
      ...user,
      levelInfo: getLevelForXP(user.xp),
      badgeCount: user.badges?.length || 0,
    }));
}

/**
 * Calculate community score — aggregate metric.
 */
export function getCommunityScore() {
  const users = getUsers();
  const totalXP = users.reduce((sum, u) => sum + u.xp, 0);
  const totalBadges = users.reduce((sum, u) => sum + (u.badges?.length || 0), 0);
  const avgStreak = users.reduce((sum, u) => sum + u.streak, 0) / users.length;

  // Score out of 1000
  const score = Math.min(1000, Math.round(
    (totalXP / 100) + (totalBadges * 10) + (avgStreak * 20)
  ));

  return {
    score,
    totalXP,
    totalBadges,
    avgStreak: Math.round(avgStreak),
    activeUsers: users.filter(u => u.streak > 0).length,
    totalUsers: users.length,
  };
}
