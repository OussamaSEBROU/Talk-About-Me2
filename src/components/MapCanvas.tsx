import { MapContainer, TileLayer, CircleMarker, useMap, Polyline, ZoomControl, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MemorialPerson } from '../types';
import { useEffect } from 'react';

function DroneEffect({ onEffectEnd }: { onEffectEnd: () => void }) {
  const map = useMap();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onEffectEnd();
      
      const gazaBounds = L.latLngBounds([
        [31.222, 34.218],
        [31.597, 34.544]
      ]);

      const isMobile = window.innerWidth < 768;

      map.flyToBounds(gazaBounds, {
        animate: true,
        duration: 4.5,     // 4 seconds flight representing drone zooming in
        easeLinearity: 0.1,
        padding: isMobile ? [10, 10] : [50, 50]
      });
    }, 4500); // Wait 4.5 seconds on the Sea to River map
    return () => clearTimeout(timer);
  }, [map, onEffectEnd]);

  return null;
}

export default function MapCanvas({ data, theme = 'light', onPersonSelect, onIntroEnd }: { data: MemorialPerson[], theme?: 'light' | 'dark', onPersonSelect: (p: MemorialPerson) => void, onIntroEnd: () => void }) {
  const palestineCenter: [number, number] = [31.95, 35.15];
  
  // Gaza Strip Border (Rough Approximation)
  const gazaBorder: [number, number][] = [
    [31.323, 34.218], // Rafah (Sea)
    [31.222, 34.260], // Kerem Shalom
    [31.332, 34.341], // Kissufim
    [31.424, 34.405], 
    [31.500, 34.484], // Karni
    [31.583, 34.544], // Erez
    [31.597, 34.502], // Sea North
  ];

  // Historical Palestine Border (Rough Approximation)
  const palestineBorder: [number, number][] = [
    [29.500, 34.919], // Umm Al-Rashrash (South)
    [31.222, 34.260], // Egyptian border meets Gaza
    [31.583, 34.544], // Gaza North 
    [32.650, 34.850], // Coast
    [33.090, 35.105], // Ras al-Naqura (North-West)
    [33.250, 35.600], // North-East
    [32.800, 35.650], // Sea of Galilee
    [32.300, 35.550], // Jordan River
    [31.750, 35.550], // Dead Sea
    [31.000, 35.300], // Arava Valley
    [29.500, 34.919]  // Close boundary
  ];

  // Restrict panning to roughly the historical Palestine region
  const maxBounds = L.latLngBounds(
    [29.0, 33.5], // South-West Limit
    [34.0, 36.5]  // North-East Limit
  );

  // Limit map points to speed up the app
  const displayData = data.slice(0, 2000);

  const isDark = theme === 'dark';

  const textIcon = new L.DivIcon({
    className: 'palestine-map-label w-full h-full flex items-center justify-center',
    html: `<div style="font-size: 2.2rem; font-family: sans-serif; font-weight: 800; color: ${isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'}; text-shadow: 0 0 10px ${isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'}; letter-spacing: 0.3em; pointer-events: none; transform: rotate(-75deg);">PALESTINE</div>`,
    iconSize: [300, 100],
    iconAnchor: [150, 50]
  });

  return (
    <div className={`absolute inset-0 z-0 ${isDark ? 'bg-[#0B0F19]' : 'bg-[#e5e7eb]'}`}>
      <MapContainer 
        center={palestineCenter} // Start at Palestine full layout
        zoom={8} 
        zoomControl={false}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}
        minZoom={7}
        className="h-full w-full opacity-100"
        preferCanvas={true}
      >
        <ZoomControl position="bottomleft" />
        <DroneEffect onEffectEnd={onIntroEnd} />
        
        <TileLayer
          url={isDark 
            ? "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution={isDark ? '&copy; <a href="https://carto.com/">CartoDB</a>' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
        />
        
        <Marker position={[31.0, 34.8]} icon={textIcon} interactive={false} />

        <Polyline positions={palestineBorder} color="#ef4444" weight={4} opacity={0.9} dashArray="10,8" lineCap="round" />
        <Polyline positions={gazaBorder} color="#ef4444" weight={6} opacity={1} lineCap="round" />

        {/* Outer glows for borders */}
        <Polyline positions={gazaBorder} color="#dc2626" weight={12} opacity={0.3} lineCap="round" />
        
        {displayData.map((p, i) => (
          p.lat && p.lng && (
            <CircleMarker 
                key={i} 
                center={[p.lat, p.lng]} 
                radius={2.5}
                pathOptions={{
                  fillColor: '#ef4444', 
                  fillOpacity: 0.6,
                  color: '#ef4444',
                  weight: 0.5,
                  opacity: 0.8
                }}
                eventHandlers={{ click: () => onPersonSelect(p) }}
            />
          )
        ))}
      </MapContainer>
    </div>
  );
}
