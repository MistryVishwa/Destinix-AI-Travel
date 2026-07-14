import React, { useMemo, useRef, useState } from 'react';
import { GoogleMap, Marker, Polyline, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { ItineraryDay, Coordinates } from '../types';

interface GoogleItineraryMapProps {
  days: ItineraryDay[];
  center: Coordinates | null;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  apiKey: string;
  onUnavailable: () => void;
}

const hasCoords = (d: ItineraryDay): d is ItineraryDay & { coordinates: Coordinates } =>
  !!d.coordinates && typeof d.coordinates.lat === 'number' && typeof d.coordinates.lng === 'number';

const mapContainerStyle = { height: '360px', width: '100%' };

// Muted dark theme so the embedded map matches the rest of the AI Planner UI.
const mapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0b0f19' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b0f19' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b93a7' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1f2434' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

const GoogleItineraryMap: React.FC<GoogleItineraryMapProps> = ({
  days,
  center,
  selectedDay,
  onSelectDay,
  apiKey,
  onUnavailable,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'destinix-google-maps',
    googleMapsApiKey: apiKey,
  });
  const mapRef = useRef<google.maps.Map | null>(null);
  const [infoDay, setInfoDay] = useState<number | null>(null);

  const locatedDays = useMemo(() => days.filter(hasCoords), [days]);
  const points = useMemo(() => locatedDays.map(d => d.coordinates), [locatedDays]);

  // Google Maps failed to load (bad key, network, billing not enabled, etc.) —
  // bubble up so the caller can fall back to the OSM map.
  if (loadError) {
    onUnavailable();
    return null;
  }

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

  if (!isLoaded) {
    return (
      <div className="rounded-[32px] overflow-hidden border border-white/10 h-[360px] bg-white/5 animate-pulse" />
    );
  }

  const initialCenter = center ?? points[0];

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    if (points.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      points.forEach(p => bounds.extend(p));
      map.fitBounds(bounds, 40);
    }
  };

  const handleMarkerClick = (day: number) => {
    setInfoDay(day);
    onSelectDay(day);
  };

  return (
    <div className="rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={initialCenter}
        zoom={11}
        onLoad={onLoad}
        options={{
          styles: mapStyles,
          scrollwheel: false,
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {points.length > 1 && (
          <Polyline
            path={points}
            options={{ strokeColor: '#818cf8', strokeOpacity: 0.8, strokeWeight: 3 }}
          />
        )}

        {locatedDays.map(day => (
          <Marker
            key={day.day}
            position={day.coordinates}
            label={{ text: String(day.day), color: '#fff', fontWeight: '700', fontSize: '13px' }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: day.day === selectedDay ? 17 : 14,
              fillColor: day.day === selectedDay ? '#7c3aed' : '#4f46e5',
              fillOpacity: 1,
              strokeColor: 'rgba(255,255,255,0.9)',
              strokeWeight: 2,
            }}
            onClick={() => handleMarkerClick(day.day)}
          >
            {infoDay === day.day && (
              <InfoWindow onCloseClick={() => setInfoDay(null)} position={day.coordinates}>
                <div style={{ minWidth: 140, color: '#111' }}>
                  <strong>Day {day.day}</strong>
                  <div>{day.locationName || day.title}</div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  );
};

export default GoogleItineraryMap;
