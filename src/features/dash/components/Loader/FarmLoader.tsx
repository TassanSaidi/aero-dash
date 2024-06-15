import React from 'react';
import './FarmLoader.css';

const FarmLoader: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-bar">
        <div className="loading-progress"></div>
      </div>
      <div className="loading-message">Loading data...</div>
    </div>
  );
};
export default FarmLoader;
