'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Filter, MapPin, X } from 'lucide-react';
import { getIssues, CATEGORIES, STATUSES } from '@/app/lib/store';
import MapView from '@/app/components/MapView';
import CategoryChip from '@/app/components/CategoryChip';

export default function LiveMapPage() {
  const [issues, setIssues] = useState([]);
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [showFilters, setShowFilters] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIssues(getIssues(filters));
    setLoaded(true);
  }, [filters]);

  const clearFilters = () => {
    setFilters({ category: '', status: '' });
  };

  const hasActiveFilters = filters.category || filters.status;

  return (
    <>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">
              <span className="page-title-gradient">Live Issue Map</span>
            </h1>
            <p className="page-subtitle">
              {issues.length} issues mapped across your community
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={14} /> Filters
            </button>
            {hasActiveFilters && (
              <button className="btn btn-sm btn-ghost" onClick={clearFilters}>
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="map-page-layout">
        {/* Map */}
        <MapView
          issues={issues}
          height="calc(100vh - 200px)"
          className="map-full"
          onMarkerClick={(issue) => setSelectedIssue(issue)}
          showPopups={true}
        />

        {/* Filter Panel */}
        {showFilters && (
          <div className="map-filter-panel animate-slide-in-right">
            <div className="map-filter-title">
              <Filter size={14} /> Filter Issues
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '11px' }}>Category</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  className={`filter-chip ${!filters.category ? 'active' : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                  style={{ textAlign: 'left', fontSize: '12px' }}
                >
                  All Categories
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`filter-chip ${filters.category === cat.id ? 'active' : ''}`}
                    onClick={() => setFilters(prev => ({ ...prev, category: cat.id }))}
                    style={{ textAlign: 'left', fontSize: '12px' }}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '11px' }}>Status</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  className={`filter-chip ${!filters.status ? 'active' : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, status: '' }))}
                  style={{ textAlign: 'left', fontSize: '12px' }}
                >
                  All Statuses
                </button>
                {STATUSES.map(s => (
                  <button
                    key={s.id}
                    className={`filter-chip ${filters.status === s.id ? 'active' : ''}`}
                    onClick={() => setFilters(prev => ({ ...prev, status: s.id }))}
                    style={{ textAlign: 'left', fontSize: '12px' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Issue Sidebar */}
        {selectedIssue && (
          <div className="map-sidebar-list">
            <div className="map-issue-mini animate-slide-in-right" style={{ position: 'relative' }}>
              <button
                onClick={() => setSelectedIssue(null)}
                style={{
                  position: 'absolute', top: '8px', right: '8px',
                  background: 'none', border: 'none', color: 'var(--text-tertiary)',
                  cursor: 'pointer', padding: '4px'
                }}
              >
                <X size={14} />
              </button>
              <div className="map-issue-mini-title">{selectedIssue.title}</div>
              <div className="map-issue-mini-meta" style={{ marginBottom: '8px' }}>
                <CategoryChip category={selectedIssue.category} size="sm" />
                <span className={`chip chip-status ${selectedIssue.status}`} style={{ fontSize: '10px' }}>
                  {selectedIssue.status.replace('_', ' ')}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.5 }}>
                {selectedIssue.description.slice(0, 150)}...
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                <MapPin size={12} /> {selectedIssue.location?.address}
              </div>
              <Link href={`/issues/${selectedIssue.id}`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                View Details
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
