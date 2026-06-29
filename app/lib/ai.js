// ============================================================
// Community Hero — Simulated AI Engine
// ============================================================
// Provides keyword-based categorization, priority scoring,
// predictive insights, and resolution time estimates.
// ============================================================

// ── Keyword Map for Auto-Categorization ────────────────────
const CATEGORY_KEYWORDS = {
  road: ['pothole', 'road', 'street', 'pavement', 'asphalt', 'crack', 'bump', 'speed breaker', 'highway', 'lane', 'footpath', 'sidewalk', 'divider', 'crossing'],
  water: ['water', 'pipe', 'pipeline', 'leak', 'leakage', 'drain', 'drainage', 'flood', 'waterlog', 'sewage', 'sewer', 'tap', 'supply', 'contamination', 'overflow'],
  electricity: ['electric', 'electricity', 'streetlight', 'light', 'pole', 'wire', 'transformer', 'power', 'outage', 'blackout', 'voltage', 'sparking', 'cable'],
  waste: ['garbage', 'waste', 'trash', 'dump', 'dumping', 'bin', 'litter', 'sanitation', 'sweeping', 'debris', 'rubbish', 'cleanliness'],
  safety: ['safety', 'dangerous', 'hazard', 'accident', 'manhole', 'fall', 'injury', 'crime', 'theft', 'dog', 'stray', 'fire', 'emergency', 'risk'],
  park: ['park', 'garden', 'playground', 'bench', 'swing', 'green', 'tree', 'plant', 'flower', 'recreation', 'sports'],
  traffic: ['traffic', 'signal', 'red light', 'jam', 'congestion', 'parking', 'zebra crossing', 'intersection', 'honking'],
  building: ['building', 'construction', 'wall', 'crack', 'collapse', 'structure', 'encroachment', 'illegal', 'footpath', 'unauthorized'],
  noise: ['noise', 'loud', 'honk', 'speaker', 'music', 'construction noise', 'disturbance', 'pollution', 'sound'],
};

// ── Urgency Indicators ─────────────────────────────────────
const CRITICAL_KEYWORDS = ['dangerous', 'hazard', 'accident', 'emergency', 'critical', 'urgent', 'life-threatening', 'electrocution', 'collapse', 'flood', 'contamination', 'fire', 'explosion'];
const HIGH_KEYWORDS = ['broken', 'damaged', 'overflowing', 'blocked', 'multiple', 'severe', 'major', 'worse', 'increasing', 'children', 'hospital', 'school'];

/**
 * Auto-categorize issue based on title and description text.
 * Returns { category, confidence } where confidence is 0-100.
 */
export function categorizeIssue(text) {
  if (!text) return { category: 'other', confidence: 0 };

  const lower = text.toLowerCase();
  const scores = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length; // Longer keywords = more specific = higher weight
      }
    }
    if (score > 0) scores[category] = score;
  }

  if (Object.keys(scores).length === 0) {
    return { category: 'other', confidence: 15 };
  }

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const topCategory = sorted[0][0];
  const topScore = sorted[0][1];
  const totalScore = sorted.reduce((sum, [, s]) => sum + s, 0);
  const confidence = Math.min(95, Math.round((topScore / totalScore) * 100));

  return {
    category: topCategory,
    confidence,
    alternatives: sorted.slice(1, 3).map(([cat, score]) => ({
      category: cat,
      confidence: Math.round((score / totalScore) * 100),
    })),
  };
}

/**
 * Suggest urgency level based on text content.
 */
export function suggestUrgency(text) {
  if (!text) return 'medium';
  const lower = text.toLowerCase();

  if (CRITICAL_KEYWORDS.some(k => lower.includes(k))) return 'critical';
  if (HIGH_KEYWORDS.some(k => lower.includes(k))) return 'high';
  return 'medium';
}

/**
 * Calculate priority score (0-100) for an issue.
 * Based on urgency, community engagement, age, and category severity.
 */
export function calculatePriority(issue) {
  let score = 0;

  // Urgency weight (0-30)
  const urgencyScores = { critical: 30, high: 22, medium: 15, low: 8 };
  score += urgencyScores[issue.urgency] || 15;

  // Community engagement (0-30)
  const engagementScore = Math.min(30, (issue.upvotes * 0.5) + (issue.verifications * 1));
  score += engagementScore;

  // Age factor — older unresolved issues get priority (0-20)
  if (issue.status !== 'resolved') {
    const daysSinceReport = (Date.now() - new Date(issue.reportedAt).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.min(20, daysSinceReport * 1.5);
  }

  // Category severity bonus (0-20)
  const categorySeverity = { safety: 20, water: 18, electricity: 17, traffic: 16, road: 14, waste: 12, building: 11, noise: 8, park: 7, other: 5 };
  score += categorySeverity[issue.category] || 5;

  return Math.min(100, Math.round(score));
}

/**
 * Estimate resolution time based on category and urgency.
 * Returns estimated days.
 */
export function estimateResolutionTime(category, urgency) {
  const baseTimes = {
    road: 14, water: 5, electricity: 3, waste: 4,
    safety: 2, park: 10, traffic: 3, building: 21,
    noise: 7, other: 10,
  };

  const urgencyMultiplier = { critical: 0.3, high: 0.6, medium: 1.0, low: 1.5 };

  const base = baseTimes[category] || 10;
  const multiplier = urgencyMultiplier[urgency] || 1.0;

  return Math.max(1, Math.round(base * multiplier));
}

/**
 * Generate predictive insights from issues data.
 * Returns an array of insight objects.
 */
export function generateInsights(issues) {
  const insights = [];

  // ── Hotspot detection ──
  const locationCounts = {};
  issues.forEach(issue => {
    const sector = issue.location?.address?.match(/Sector \d+/)?.[0] || 'Unknown';
    locationCounts[sector] = (locationCounts[sector] || 0) + 1;
  });
  const hotspot = Object.entries(locationCounts).sort(([, a], [, b]) => b - a)[0];
  if (hotspot) {
    insights.push({
      type: 'hotspot',
      icon: '🔥',
      title: 'Issue Hotspot Detected',
      description: `${hotspot[0]} has the highest concentration of issues with ${hotspot[1]} reports. Consider prioritizing infrastructure review in this area.`,
      severity: 'high',
    });
  }

  // ── Category trends ──
  const recentIssues = issues.filter(i => {
    const daysAgo = (Date.now() - new Date(i.reportedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7;
  });
  const categoryCounts = {};
  recentIssues.forEach(i => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });
  const topCategory = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0];
  if (topCategory) {
    const catLabels = { road: 'Road & Pothole', water: 'Water & Drainage', electricity: 'Electricity', waste: 'Waste Management', safety: 'Public Safety', park: 'Parks', traffic: 'Traffic', building: 'Building', noise: 'Noise' };
    insights.push({
      type: 'trend',
      icon: '📈',
      title: 'Trending Category This Week',
      description: `${catLabels[topCategory[0]] || topCategory[0]} issues have surged with ${topCategory[1]} new reports in the last 7 days. Proactive maintenance recommended.`,
      severity: 'medium',
    });
  }

  // ── Resolution performance ──
  const resolvedIssues = issues.filter(i => i.status === 'resolved');
  const unresolvedOld = issues.filter(i => {
    if (i.status === 'resolved') return false;
    const days = (Date.now() - new Date(i.reportedAt).getTime()) / (1000 * 60 * 60 * 24);
    return days > 14;
  });
  if (unresolvedOld.length > 0) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Overdue Issues Alert',
      description: `${unresolvedOld.length} issues have been unresolved for over 2 weeks. Immediate attention required to maintain community trust.`,
      severity: 'high',
    });
  }

  // ── Community engagement ──
  const highEngagement = issues.filter(i => i.upvotes > 30);
  if (highEngagement.length > 0) {
    insights.push({
      type: 'engagement',
      icon: '👥',
      title: 'High Community Engagement',
      description: `${highEngagement.length} issues have over 30 upvotes, indicating strong community concern. These should be prioritized for resolution.`,
      severity: 'medium',
    });
  }

  // ── Prediction ──
  const criticalUnresolved = issues.filter(i => i.urgency === 'critical' && i.status !== 'resolved');
  if (criticalUnresolved.length > 0) {
    insights.push({
      type: 'prediction',
      icon: '🔮',
      title: 'Critical Issues Forecast',
      description: `${criticalUnresolved.length} critical issues remain unresolved. Based on historical patterns, these may escalate further if not addressed within 48 hours.`,
      severity: 'critical',
    });
  }

  // ── Positive insight ──
  if (resolvedIssues.length > 0) {
    const resolutionRate = Math.round((resolvedIssues.length / issues.length) * 100);
    insights.push({
      type: 'positive',
      icon: '✅',
      title: 'Resolution Progress',
      description: `${resolutionRate}% of all reported issues have been resolved. Keep up the momentum! The community is making a real difference.`,
      severity: 'low',
    });
  }

  return insights;
}
