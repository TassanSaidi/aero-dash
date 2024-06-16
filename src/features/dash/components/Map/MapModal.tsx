import React from 'react';
import Modal from 'react-modal';

interface MapModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  coordinates: { lat: number; lng: number }[];
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, onRequestClose, coordinates }) => {
  // Check if coordinates exist and have at least one entry
  const hasCoordinates = coordinates && coordinates.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="map-modal"
      overlayClassName="map-modal-overlay"
    >
      {hasCoordinates ? (
        <div>
          <h2>Map Modal</h2>
          <div>
            {/* Render map or display coordinates */}
            {coordinates.map((coord, index) => (
              <div key={index}>
                Latitude: {coord.lat}, Longitude: {coord.lng}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2>No Coordinates Available</h2>
          <p>Coordinates data is not available for this selection.</p>
        </div>
      )}
    </Modal>
  );
};

export default MapModal;
