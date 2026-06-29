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

const TILE_LAYERS = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri',
  },
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
};

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
  const [mapStyle, setMapStyle] = useState('street');

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

  const currentTile = TILE_LAYERS[mapStyle];

  return (
    <div className={`map-container ${className}`} style={{ height, position: 'relative' }}>
      {/* Map Style Toggle */}
      <div style={{ 
        position: 'absolute', top: 12, right: 12, zIndex: 1000, 
        display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.92)', 
        backdropFilter: 'blur(8px)', padding: '4px', borderRadius: '8px', 
        border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMapStyle('street'); }} 
          style={{ 
            padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '6px',
            cursor: 'pointer', transition: 'all 0.2s', border: 'none',
            background: mapStyle === 'street' ? '#ef4444' : 'transparent',
            color: mapStyle === 'street' ? '#fff' : '#64748b'
          }}
        >
          Street
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMapStyle('satellite'); }} 
          style={{ 
            padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '6px',
            cursor: 'pointer', transition: 'all 0.2s', border: 'none',
            background: mapStyle === 'satellite' ? '#ef4444' : 'transparent',
            color: mapStyle === 'satellite' ? '#fff' : '#64748b'
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
        key={mapStyle}
      >
        <TileLayer
          attribution={currentTile.attribution}
          url={currentTile.url}
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
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#1e293b' }}>
                      {issue.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
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
