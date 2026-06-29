'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

const DEFAULT_CENTER = [28.6139, 77.2090]; // Delhi
const DEFAULT_ZOOM = 13;

export default function MapView({
  issues = [],
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  height = '400px',
  className = '',
  onMarkerClick,
  showPopups = true,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Import leaflet CSS
    import('leaflet/dist/leaflet.css');
    
    // Fix default marker icons
    import('leaflet').then(L => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
      setLeafletLoaded(true);
    });
  }, []);

  if (!isMounted || !leafletLoaded) {
    return (
      <div
        className={`map-container ${className}`}
        style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)' }}
      >
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗺️</div>
          <div style={{ fontSize: '13px' }}>Loading map...</div>
        </div>
      </div>
    );
  }

  const [mapStyle, setMapStyle] = useState('dark');

  const tileUrl = mapStyle === 'dark' 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  
  const tileAttribution = mapStyle === 'dark'
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    : 'Tiles &copy; Esri';

  return (
    <div className={`map-container ${className}`} style={{ height, position: 'relative' }}>
      {/* Map Style Toggle */}
      <div style={{ 
        position: 'absolute', top: 12, right: 12, zIndex: 1000, 
        display: 'flex', gap: '4px', background: 'rgba(15, 23, 42, 0.85)', 
        backdropFilter: 'blur(8px)', padding: '4px', borderRadius: '8px', 
        border: '1px solid rgba(148, 163, 184, 0.15)' 
      }}>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMapStyle('dark'); }} 
          style={{ 
            padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '6px',
            cursor: 'pointer', transition: 'all 0.2s', border: 'none',
            background: mapStyle === 'dark' ? 'var(--accent-blue)' : 'transparent',
            color: mapStyle === 'dark' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          Dark Map
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMapStyle('satellite'); }} 
          style={{ 
            padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '6px',
            cursor: 'pointer', transition: 'all 0.2s', border: 'none',
            background: mapStyle === 'satellite' ? 'var(--accent-blue)' : 'transparent',
            color: mapStyle === 'satellite' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          Satellite
        </button>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution={tileAttribution}
          url={tileUrl}
        />
        {issues.map((issue) => (
          issue.location?.lat && issue.location?.lng ? (
            <Marker
              key={issue.id}
              position={[issue.location.lat, issue.location.lng]}
              eventHandlers={{
                click: () => onMarkerClick?.(issue),
              }}
            >
              {showPopups && (
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#f1f5f9' }}>
                      {issue.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                      {issue.location.address}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', fontSize: '11px' }}>
                      <span className={`chip chip-status ${issue.status}`} style={{ fontSize: '10px' }}>
                        {issue.status.replace('_', ' ')}
                      </span>
                      <span className={`chip chip-urgency ${issue.urgency}`} style={{ fontSize: '10px' }}>
                        {issue.urgency}
                      </span>
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}
