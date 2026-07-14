import React, { useState } from 'react';
import ItineraryMap from './ItineraryMap';
import GoogleItineraryMap from './GoogleItineraryMap';
import { ItineraryDay, Coordinates } from '../types';

interface MapViewProps {
  days: ItineraryDay[];
  center: Coordinates | null;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

// Google Maps is opt-in via VITE_GOOGLE_MAPS_API_KEY. Without a key, or if the
// Google Maps script fails to load, we fall back to the free Leaflet/OSM map
// (which itself degrades to a text-only notice when no coordinates resolve).
const MapView: React.FC<MapViewProps> = ({ days, center, selectedDay, onSelectDay }) => {
  const [googleUnavailable, setGoogleUnavailable] = useState(false);

  if (GOOGLE_MAPS_API_KEY && !googleUnavailable) {
    return (
      <GoogleItineraryMap
        days={days}
        center={center}
        selectedDay={selectedDay}
        onSelectDay={onSelectDay}
        apiKey={GOOGLE_MAPS_API_KEY}
        onUnavailable={() => setGoogleUnavailable(true)}
      />
    );
  }

  return <ItineraryMap days={days} center={center} selectedDay={selectedDay} onSelectDay={onSelectDay} />;
};

export default MapView;
