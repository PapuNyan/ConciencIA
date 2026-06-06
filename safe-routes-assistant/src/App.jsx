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
  const [showResetButton, setShowResetButton] = useState(false);

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
    
    // If no user location, set the geocoder result as user location
    if (!userLocation) {
      setUserLocation(coords);
      setShowResetButton(true);

      // Remove existing user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      // Add new user marker
      if (mapRef.current) {
        userMarkerRef.current = new mapboxgl.Marker({ color: '#4CAF50' })
          .setLngLat(coords)
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<strong>📍 Tu ubicación</strong><br>${result.place_name}`
            )
          )
          .addTo(mapRef.current);
      }
    }
    // If user location exists, set as destination
    else {
      setDestinationLocation(coords);
      setShowResetButton(true);

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
              `<strong>🎯 Destino</strong><br>${result.place_name}`
            )
          )
          .addTo(mapRef.current);
      }

      // Auto-calculate route if both locations are set
      if (userLocation) {
        handleRouteRequest();
      }
    }
  }, [userLocation, handleRouteRequest]);

  /**
   * Handle map click (manual location selection)
   */
  const handleMapClick = useCallback((lngLat) => {
    const coords = [lngLat.lng, lngLat.lat];
    
    // If no user location, set it
    if (!userLocation) {
      setUserLocation(coords);
      setShowResetButton(true);

      // Remove existing user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      // Add new user marker
      if (mapRef.current) {
        userMarkerRef.current = new mapboxgl.Marker({ color: '#4CAF50' })
          .setLngLat(coords)
          .setPopup(
            new mapboxgl.Popup().setHTML('<strong>📍 Tu ubicación</strong>')
          )
          .addTo(mapRef.current);

        // Fly to location
        mapRef.current.flyTo({
          center: coords,
          zoom: 15,
          duration: 1000
        });
      }
    }
    // If user location exists but no destination, set destination
    else if (!destinationLocation) {
      setDestinationLocation(coords);
      setShowResetButton(true);

      // Remove existing destination marker
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.remove();
      }

      // Add new destination marker
      if (mapRef.current) {
        destinationMarkerRef.current = new mapboxgl.Marker({ color: '#FF5722' })
          .setLngLat(coords)
          .setPopup(
            new mapboxgl.Popup().setHTML('<strong>🎯 Destino</strong>')
          )
          .addTo(mapRef.current);
      }

      // Auto-calculate route if both locations are set
      if (userLocation) {
        handleRouteRequest();
      }
    }
  }, [userLocation, destinationLocation, handleRouteRequest]);

  /**
   * Handle zone safety analysis
   */
  const handleZoneAnalysis = useCallback(async () => {
    try {
      const coords = await detectUserLocation();
      setUserLocation(coords);
      setShowResetButton(true);

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

  /**
   * Handle reset/clear all markers and routes
   */
  const handleReset = useCallback(() => {
    // Clear state
    setUserLocation(null);
    setDestinationLocation(null);
    setCurrentRoute(null);
    setIsNavOpen(false);
    setShowResetButton(false);

    // Remove markers
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }

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

      {showResetButton && (
        <button
          className="reset-button"
          onClick={handleReset}
          title="Limpiar marcadores y rutas"
        >
          🔄 Nueva Ruta
        </button>
      )}

      <ChatPanel
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        onZoneAnalysis={handleZoneAnalysis}
        onRouteRequest={handleRouteRequest}
        userLocation={userLocation}
        destinationLocation={destinationLocation}
        onAddressSelect={handleGeocoderResult}
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
