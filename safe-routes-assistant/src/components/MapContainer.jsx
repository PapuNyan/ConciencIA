import { useEffect } from 'react';
import useMapbox from '../hooks/useMapbox';
import styles from './MapContainer.module.css';

/**
 * MapContainer Component
 * Renders the Mapbox map with geocoder and geolocate controls
 */
const MapContainer = ({ onMapLoad, onGeocoderResult, onMapClick }) => {
  const {
    mapContainerRef,
    map,
    isMapLoaded,
    error
  } = useMapbox({
    enableGeocoder: true,
    enableGeolocate: true
  });

  // Handle map load event
  useEffect(() => {
    if (isMapLoaded && map && onMapLoad) {
      onMapLoad(map);
    }
  }, [isMapLoaded, map, onMapLoad]);

  // Handle geocoder result event
  useEffect(() => {
    if (!map || !map.geocoder) return;

    const handleResult = (e) => {
      if (onGeocoderResult) {
        onGeocoderResult(e.result);
      }
    };

    map.geocoder.on('result', handleResult);

    return () => {
      map.geocoder.off('result', handleResult);
    };
  }, [map, onGeocoderResult]);

  // Handle map click event
  useEffect(() => {
    if (!map) return;

    const handleClick = (e) => {
      if (onMapClick) {
        onMapClick(e.lngLat);
      }
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  if (error) {
    return (
      <div className={styles.mapContainer}>
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: 'red',
          backgroundColor: '#fff'
        }}>
          <h3>Error al cargar el mapa</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      <div ref={mapContainerRef} className={styles.mapWrapper} />
    </div>
  );
};

export default MapContainer;

// Made with Bob
