import React, { useRef, useEffect } from 'react';
import './MapModal.css'; // Import CSS for styling
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

export interface MapModalProps {
  isOpen: boolean; // Boolean flag to control visibility
  title: string; // Title for the map modal
  coordinates: { lat: number; lng: number }[];
  onClose: () => void; // Function to handle closing the modal
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, title, coordinates, onClose }) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && mapContainer.current && !mapContainer.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const hasCoordinates = Array.isArray(coordinates) && coordinates.length > 0;

  const BoundsUpdater: React.FC<{ coordinates: { lat: number; lng: number }[] }> = ({ coordinates }) => {
    const map = useMap();
    useEffect(() => {
      if (coordinates.length > 0) {
        const bounds = coordinates.map((coord) => [coord.lat, coord.lng]);
        map.fitBounds(bounds);
      }
    }, [coordinates, map]);

    return null;
  };

  return (
    <div className={`modal ${isOpen ? 'show' : ''}`}>
      <div className="modal-content" ref={mapContainer}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {hasCoordinates ? (
            <MapContainer center={[coordinates[0]?.lat, coordinates[0]?.lng]} zoom={10} style={{ height: '400px', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <BoundsUpdater coordinates={coordinates} />
              {coordinates.map((coord, index) => (
                <Marker key={index} position={[coord.lat, coord.lng]}>
                  <Popup>
                    {coord.lat}, {coord.lng}.
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <p>No coordinates provided</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapModal;
