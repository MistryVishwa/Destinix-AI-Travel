import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { ItineraryDay, Coordinates } from '../types';

interface ItineraryMapProps {
  days: ItineraryDay[];
  center: Coordinates | null;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

const hasCoords = (d: ItineraryDay): d is ItineraryDay & { coordinates: Coordinates } =>
  !!d.coordinates && typeof d.coordinates.lat === 'number' && typeof d.coordinates.lng === 'number';

// Numbered pin rendered as an HTML div — sidesteps Leaflet's broken default
// marker-asset paths under bundlers and lets us highlight the active day.
const numberedIcon = (day: number, active: boolean) =>
  L.divIcon({
    className: 'destinix-day-marker',
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:${active ? 34 : 28}px;height:${active ? 34 : 28}px;
      border-radius:9999px;font-weight:700;font-size:13px;color:#fff;
      background:${active ? '#7c3aed' : '#4f46e5'};
      border:2px solid rgba(255,255,255,0.9);
      box-shadow:0 0 0 ${active ? 6 : 2}px ${active ? 'rgba(124,58,237,0.35)' : 'rgba(79,70,229,0.25)'};
    ">${day}</div>`,
    iconSize: [active ? 34 : 28, active ? 34 : 28],
    iconAnchor: [active ? 17 : 14, active ? 17 : 14],
  });

// Keeps the Leaflet view in sync with React state: fits all markers on load and
// flies to the selected day when it changes.
const MapController: React.FC<{
  points: Coordinates[];
  selected: Coordinates | null;
}> = ({ points, selected }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }, [map, points]);

  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 12), { duration: 0.8 });
    }
  }, [map, selected]);

  return null;
};

const ItineraryMap: React.FC<ItineraryMapProps> = ({ days, center, selectedDay, onSelectDay }) => {
  const locatedDays = useMemo(() => days.filter(hasCoords), [days]);
  const points = useMemo(() => locatedDays.map(d => d.coordinates), [locatedDays]);
  const routeLine = useMemo(
    () => points.map(p => [p.lat, p.lng] as [number, number]),
    [points]
  );

  const selectedCoords = useMemo(
    () => locatedDays.find(d => d.day === selectedDay)?.coordinates ?? null,
    [locatedDays, selectedDay]
  );

  // Graceful degradation: nothing could be placed on the map.
  if (locatedDays.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex flex-col items-center justify-center text-center h-[320px]">
        <MapPin className="w-10 h-10 text-purple-400 mb-3" />
        <p className="text-white font-bold mb-1">Map view unavailable</p>
        <p className="text-gray-400 text-sm max-w-xs">
          We couldn't resolve locations for this itinerary. The day-by-day plan below still has all the details.
        </p>
      </div>
    );
  }

  const initialCenter: [number, number] = center
    ? [center.lat, center.lng]
    : [points[0].lat, points[0].lng];

  return (
    <div className="rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
      <MapContainer
        center={initialCenter}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: '360px', width: '100%', background: '#0b0f19' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {routeLine.length > 1 && (
          <Polyline
            positions={routeLine}
            pathOptions={{ color: '#818cf8', weight: 3, opacity: 0.8, dashArray: '6 8' }}
          />
        )}

        {locatedDays.map(day => (
          <Marker
            key={day.day}
            position={[day.coordinates.lat, day.coordinates.lng]}
            icon={numberedIcon(day.day, day.day === selectedDay)}
            eventHandlers={{ click: () => onSelectDay(day.day) }}
          >
            <Popup>
              <div style={{ minWidth: 140 }}>
                <strong>Day {day.day}</strong>
                <div>{day.locationName || day.title}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapController points={points} selected={selectedCoords} />
      </MapContainer>
    </div>
  );
};

export default ItineraryMap;
