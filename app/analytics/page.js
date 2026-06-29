'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, Clock, CheckCircle, AlertTriangle,
  BarChart3, Activity, Target, Zap
} from 'lucide-react';
import StatsCard from '@/app/components/StatsCard';
import {
  IssueAreaChart, CategoryBarChart, StatusPieChart, ResolutionLineChart
} from '@/app/components/ChartWrapper';
import { getStats, getIssueTrends, getIssues, CATEGORIES } from '@/app/lib/store';
import { generateInsights } from '@/app/lib/ai';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const allIssues = getIssues();
    setStats(getStats());
    setTrends(getIssueTrends());
    setInsights(generateInsights(allIssues));
    setLoaded(true);
  }, []);

  if (!loaded || !stats) {
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

  // Ward comparison data
  const wardData = [
    { ward: 'Sector 20', total: 4, resolved: 1, pending: 3, rate: '25%' },
    { ward: 'Sector 14', total: 3, resolved: 1, pending: 2, rate: '33%' },
    { ward: 'Sector 22', total: 3, resolved: 1, pending: 2, rate: '33%' },
    { ward: 'Sector 9-12', total: 4, resolved: 2, pending: 2, rate: '50%' },
    { ward: 'Sector 15-18', total: 4, resolved: 1, pending: 3, rate: '25%' },
    { ward: 'Central', total: 4, resolved: 1, pending: 3, rate: '25%' },
  ];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-title-gradient">Impact Analytics</span>
        </h1>
        <p className="page-subtitle">
          Data-driven insights into your community&apos;s issues and resolution performance
        </p>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatsCard
          icon="📊"
          value={stats.total}
          label="Total Issues"
          trend="up"
          trendValue="+12%"
          color="blue"
          delay={0}
        />
        <StatsCard
          icon="✅"
          value={`${stats.resolutionRate}%`}
          label="Resolution Rate"
          trend={stats.resolutionRate > 15 ? 'up' : 'down'}
          trendValue={stats.resolutionRate > 15 ? '+3%' : '-2%'}
          color="green"
          delay={100}
        />
        <StatsCard
          icon="⏱️"
          value={stats.avgResolutionDays}
          label="Avg Resolution (days)"
          trend="down"
          trendValue="-1.2d"
          color="orange"
          delay={200}
        />
        <StatsCard
          icon="🔴"
          value={stats.critical}
          label="Critical Issues"
          color="purple"
          delay={300}
        />
      </div>

      {/* Charts Grid */}
      <div className="dashboard-grid">
        {/* Issues Over Time */}
        <div className="chart-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="chart-card-title">
            <Activity size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            Issues Over Time
          </h3>
          <IssueAreaChart data={trends} height={280} />
        </div>

        {/* Resolution Trend */}
        <div className="chart-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="chart-card-title">
            <TrendingUp size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            Resolution Trend
          </h3>
          <ResolutionLineChart data={trends} height={280} />
        </div>

        {/* Category Distribution */}
        <div className="chart-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h3 className="chart-card-title">
            <BarChart3 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            Issues by Category
          </h3>
          <CategoryBarChart data={stats.categoryBreakdown} height={280} />
        </div>

        {/* Status Distribution */}
        <div className="chart-card animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h3 className="chart-card-title">
            <Target size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            Status Distribution
          </h3>
          <StatusPieChart data={stats.statusBreakdown} height={280} />
        </div>

        {/* Ward Comparison Table */}
        <div className="glass-card dashboard-full animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <h3 className="section-title" style={{ marginBottom: '20px' }}>
            📍 Area-wise Comparison
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Area</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolved</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolution Rate</th>
                </tr>
              </thead>
              <tbody>
                {wardData.map((ward, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{ward.ward}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>{ward.total}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: '#10b981' }}>{ward.resolved}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: '#f59e0b' }}>{ward.pending}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: parseInt(ward.rate) >= 50 ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                        color: parseInt(ward.rate) >= 50 ? '#10b981' : '#f59e0b',
                      }}>
                        {ward.rate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Predictive Insights */}
        <div className="glass-card dashboard-full animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <div className="section-header">
            <h3 className="section-title">
              🤖 Predictive Insights
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
            {insights.map((insight, idx) => (
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
      </div>
    </>
  );
}
