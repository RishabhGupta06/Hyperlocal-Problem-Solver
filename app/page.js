'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, CheckCircle, Clock, TrendingUp,
  ArrowRight, Activity, Users, Zap
} from 'lucide-react';
import StatsCard from './components/StatsCard';
import IssueCard from './components/IssueCard';
import { IssueAreaChart, StatusPieChart } from './components/ChartWrapper';
import { getIssues, getStats, getIssueTrends, getUsers, getUserById } from './lib/store';
import { generateInsights } from './lib/ai';
import { getCommunityScore } from './lib/gamification';
import MapView from './components/MapView';

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [insights, setInsights] = useState([]);
  const [communityScore, setCommunityScore] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const allIssues = getIssues();
    setIssues(allIssues);
    setStats(getStats());
    setTrends(getIssueTrends());
    setInsights(generateInsights(allIssues));
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

  const recentIssues = issues.slice(0, 5);
  const recentActivity = getRecentActivity(issues);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">
          Welcome back, <span className="page-title-gradient">Rishabh</span> 👋
        </h1>
        <p className="page-subtitle">Here&apos;s what&apos;s happening in your community today</p>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <StatsCard
          icon="📋"
          value={stats?.total || 0}
          label="Total Issues"
          trend="up"
          trendValue="+12%"
          color="blue"
          delay={0}
        />
        <StatsCard
          icon="✅"
          value={stats?.resolved || 0}
          label="Resolved"
          trend="up"
          trendValue="+8%"
          color="green"
          delay={100}
        />
        <StatsCard
          icon="⚡"
          value={stats?.inProgress || 0}
          label="In Progress"
          color="orange"
          delay={200}
        />
        <StatsCard
          icon="🏆"
          value={communityScore?.score || 0}
          label="Community Score"
          trend="up"
          trendValue="+5%"
          color="purple"
          delay={300}
        />
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Issues Trend Chart */}
        <div className="chart-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="section-header">
            <h3 className="chart-card-title">Issue Trends — Last 30 Days</h3>
          </div>
          <IssueAreaChart data={trends} height={260} />
        </div>

        {/* Category Distribution */}
        <div className="chart-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="section-header">
            <h3 className="chart-card-title">Issues by Status</h3>
          </div>
          <StatusPieChart data={stats?.statusBreakdown} height={260} />
        </div>

        {/* Recent Issues */}
        <div className="glass-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="section-header">
            <h3 className="section-title">Recent Issues</h3>
            <Link href="/map" className="section-link">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="issues-list">
            {recentIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} compact />
            ))}
          </div>
        </div>

        {/* AI Insights + Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Insights */}
          <div className="glass-card animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="section-header">
              <h3 className="section-title">🤖 AI Insights</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {insights.slice(0, 3).map((insight, idx) => (
                <div key={idx} className="insight-card">
                  <div className={`insight-icon ${insight.severity}`}>
                    {insight.icon}
                  </div>
                  <div>
                    <div className="insight-title">{insight.title}</div>
                    <div className="insight-description">{insight.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="glass-card animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="section-header">
              <h3 className="section-title">Recent Activity</h3>
            </div>
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-avatar">{activity.avatar}</div>
                <div className="activity-info">
                  <div className="activity-text" dangerouslySetInnerHTML={{ __html: activity.text }} />
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Map */}
        <div className="dashboard-full glass-card animate-slide-up" style={{ animationDelay: '0.7s', padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px 0 24px' }}>
            <div className="section-header">
              <h3 className="section-title">📍 Issue Map Overview</h3>
              <Link href="/map" className="section-link">
                Open full map <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <MapView issues={issues} height="320px" />
        </div>
      </div>
    </>
  );
}

function getRecentActivity(issues) {
  const activities = [];
  const sortedIssues = [...issues].sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));

  sortedIssues.slice(0, 5).forEach(issue => {
    const user = getUserById(issue.reportedBy);
    const timeAgo = formatTimeAgo(issue.reportedAt);

    activities.push({
      avatar: user?.avatar || '👤',
      text: `<strong>${user?.name || 'Anonymous'}</strong> reported <strong>${issue.title}</strong>`,
      time: timeAgo,
    });
  });

  // Add some resolved activities
  const resolved = issues.filter(i => i.status === 'resolved');
  resolved.slice(0, 2).forEach(issue => {
    const lastStatus = issue.statusHistory[issue.statusHistory.length - 1];
    activities.push({
      avatar: '✅',
      text: `<strong>${issue.title}</strong> was <strong>resolved</strong>`,
      time: formatTimeAgo(lastStatus.date),
    });
  });

  return activities.sort((a, b) => 0).slice(0, 6);
}

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}
