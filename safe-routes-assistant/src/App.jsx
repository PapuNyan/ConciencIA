import { useState, useCallback, useRef } from 'react';
import MapContainer from './components/MapContainer';
import ChatPanel from './components/ChatPanel';
import NavigationPanel from './components/NavigationPanel';
import { detectUserLocation } from './services/geolocationService';
import { analyzeZoneSafety, calculateRoute } from './services/mapboxService';
import mapboxgl from 'mapbox-gl';
import './App.css';

/**
 * Main App Component
 * Manages the state and coordination between all components
 */
function App() {
  // State management
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(null);

  // Refs for map and markers
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);

  /**
   * Handle map load event
   */
  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
    console.log('Map loaded successfully');
  }, []);

  /**
   * Handle route calculation request
   */
  const handleRouteRequest = useCallback(async () => {
    if (!userLocation || !destinationLocation) {
      return;
    }

    try {
      const route = await calculateRoute(userLocation, destinationLocation);

      if (!route) {
        return;
      }

      setCurrentRoute(route);

      // Display route on map
      if (mapRef.current) {
        // Remove existing route
        if (mapRef.current.getSource('route')) {
          mapRef.current.removeLayer('route');
          mapRef.current.removeSource('route');
        }

        // Add route source and layer
        mapRef.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });

        mapRef.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#4CAF50',
            'line-width': 6,
            'line-opacity': 0.8
          }
        });

        // Fit map to route bounds
        const coords = route.geometry.coordinates;
        const bounds = coords.reduce(
          (bounds, coord) => bounds.extend(coord),
          new mapboxgl.LngLatBounds(coords[0], coords[0])
        );
        mapRef.current.fitBounds(bounds, { padding: 50 });
      }

      // Open navigation panel
      setIsNavOpen(true);
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  }, [userLocation, destinationLocation]);

  /**
   * Handle geocoder result (destination selection)
   */
  const handleGeocoderResult = useCallback((result) => {
    const coords = result.geometry.coordinates;
    setDestinationLocation(coords);

    // Remove existing destination marker
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
    }

    // Add new destination marker
    if (mapRef.current) {
      destinationMarkerRef.current = new mapboxgl.Marker({ color: '#FF5722' })
        .setLngLat(coords)
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<strong>Destino</strong><br>${result.place_name}`
          )
        )
        .addTo(mapRef.current);
    }
  }, []);

  /**
   * Handle map click (manual location selection)
   */
  const handleMapClick = useCallback((lngLat) => {
    // Only set user location if destination is set but user location isn't
    if (destinationLocation && !userLocation) {
      const coords = [lngLat.lng, lngLat.lat];
      setUserLocation(coords);

      // Remove existing user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      // Add new user marker
      if (mapRef.current) {
        userMarkerRef.current = new mapboxgl.Marker({ color: '#4CAF50' })
          .setLngLat(coords)
          .setPopup(
            new mapboxgl.Popup().setHTML('<strong>Tu ubicación</strong>')
          )
          .addTo(mapRef.current);

        if (isChatOpen) {
          handleRouteRequest();
        }
      }
    }
  }, [destinationLocation, userLocation, isChatOpen, handleRouteRequest]);

  /**
   * Handle zone safety analysis
   */
  const handleZoneAnalysis = useCallback(async () => {
    try {
      const coords = await detectUserLocation();
      setUserLocation(coords);

      // Remove existing user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      // Add user marker
      if (mapRef.current) {
        userMarkerRef.current = new mapboxgl.Marker({ color: '#4CAF50' })
          .setLngLat(coords)
          .setPopup(
            new mapboxgl.Popup().setHTML('<strong>📍 Tu ubicación actual</strong>')
          )
          .addTo(mapRef.current);

        // Fly to user location
        mapRef.current.flyTo({
          center: coords,
          zoom: 15,
          duration: 1500
        });
      }

      // Analyze zone safety
      await analyzeZoneSafety(coords);
    } catch (error) {
      console.error('Error analyzing zone:', error);
    }
  }, []);

  /**
   * Handle navigation start
   */
  const handleNavigationStart = useCallback(() => {
    // Navigation started
  }, []);

  /**
   * Handle navigation cancel
   */
  const handleNavigationCancel = useCallback(() => {
    setIsNavOpen(false);
    setCurrentRoute(null);

    // Remove route from map
    if (mapRef.current && mapRef.current.getSource('route')) {
      mapRef.current.removeLayer('route');
      mapRef.current.removeSource('route');
    }
  }, []);

  return (
    <div className="app">
      <MapContainer
        onMapLoad={handleMapLoad}
        onGeocoderResult={handleGeocoderResult}
        onMapClick={handleMapClick}
      />

      <ChatPanel
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        onZoneAnalysis={handleZoneAnalysis}
        onRouteRequest={handleRouteRequest}
        userLocation={userLocation}
        destinationLocation={destinationLocation}
      />

      <NavigationPanel
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        route={currentRoute}
        onStart={handleNavigationStart}
        onCancel={handleNavigationCancel}
      />
    </div>
  );
}

export default App;

// Made with Bob
