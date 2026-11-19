import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { formatPrice } from '../utils/formatters';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Create custom icon with price label
const createCustomIcon = (price, isSelected) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="px-2 py-1 bg-white border-2 ${isSelected ? 'border-primary text-primary scale-110' : 'border-border text-text'} rounded-md shadow-md font-bold text-xs whitespace-nowrap transition-transform origin-bottom">
        ${formatPrice(price)}
      </div>
    `,
    iconSize: [60, 24],
    iconAnchor: [30, 24],
    popupAnchor: [0, -24]
  });
};

function MapUpdater({ properties, center, zoom }) {
  const map = useMap();
  useEffect(() => {
    const positions = properties
      .filter((property) => Number.isFinite(property.latitude) && Number.isFinite(property.longitude))
      .map((property) => [property.latitude, property.longitude]);

    if (positions.length > 1) {
      map.fitBounds(positions, { padding: [32, 32], maxZoom: 14 });
    } else if (positions.length === 1) {
      map.setView(positions[0], Math.max(zoom, 14));
    } else {
      map.setView(center, zoom);
    }
  }, [properties, center, zoom, map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(event) {
      onMapClick?.(event.latlng);
    },
  });
  return null;
}

export default function PropertyMap({ 
  properties = [], 
  center = [19.0760, 72.8777], // Default to Mumbai
  zoom = 12, 
  selectedId = null,
  selectedPosition = null,
  onMapClick,
  onMarkerClick
}) {
  return (
    <div className="w-full h-full min-h-[400px] z-0 relative rounded-lg overflow-hidden border border-border shadow-sm">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="w-full h-full absolute inset-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater properties={properties} center={center} zoom={zoom} />
        <MapClickHandler onMapClick={onMapClick} />
        {selectedPosition && (
          <Marker position={selectedPosition}>
            <Popup>Selected property location</Popup>
          </Marker>
        )}
        
        {properties.map((property) => {
          if (!property.latitude || !property.longitude) return null;
          
          const isSelected = selectedId === property.id;
          
          return (
            <Marker 
              key={property.id} 
              position={[property.latitude, property.longitude]}
              icon={createCustomIcon(property.price, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(property.id);
                }
              }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-text truncate w-48 mb-1">{property.title}</h3>
                  <p className="text-primary font-bold mb-1">{formatPrice(property.price)}</p>
                  <p className="text-xs text-text-secondary">{property.address}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
