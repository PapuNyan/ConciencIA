import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

/**
 * Custom hook for Mapbox map initialization and management
 * @param {Object} config - Map configuration
 * @returns {Object} Map instance and utilities
 */
const useMapbox = (config = {}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);

  const {
    accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
    style = 'mapbox://styles/mapbox/streets-v12',
    center = [
      parseFloat(import.meta.env.VITE_MAP_DEFAULT_CENTER_LNG),
      parseFloat(import.meta.env.VITE_MAP_DEFAULT_CENTER_LAT)
    ],
    zoom = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM),
    enableGeocoder = true,
    enableGeolocate = true
  } = config;

  useEffect(() => {
    if (!accessToken) {
      console.error('Mapbox access token is required');
      return;
    }

    if (!mapContainerRef.current) return;

    // Set access token
    mapboxgl.accessToken = accessToken;

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style,
      center,
      zoom
    });

    // Add geocoder control
    if (enableGeocoder) {
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: true,
        placeholder: 'Buscar lugares, calles, direcciones...',
        language: 'es',
        countries: 'mx',
        bbox: [-99.3667, 19.0489, -98.9414, 19.5926],
        proximity: { longitude: center[0], latitude: center[1] },
        types: 'country,region,postcode,district,place,locality,neighborhood,address,poi'
      });

      map.addControl(geocoder, 'top-left');
      
      // Store geocoder reference for external access
      map.geocoder = geocoder;
    }

    // Add geolocate control
    if (enableGeolocate) {
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      });

      map.addControl(geolocateControl);
      
      // Store geolocate control reference
      map.geolocateControl = geolocateControl;
    }

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Map load event
    map.on('load', () => {
      setIsMapLoaded(true);
      setMap(map);
    });

    // Error handling
    map.on('error', (e) => {
      console.error('Map error:', e);
      setError(e.error?.message || 'Map error occurred');
    });

    mapRef.current = map;
    setMap(map);

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMap(null);
      }
    };
  }, [accessToken, style, center, zoom, enableGeocoder, enableGeolocate]);

  /**
   * Add a marker to the map
   */
  const addMarker = (coords, options = {}) => {
    if (!mapRef.current) return null;

    const marker = new mapboxgl.Marker(options)
      .setLngLat(coords)
      .addTo(mapRef.current);

    if (options.popup) {
      marker.setPopup(
        new mapboxgl.Popup().setHTML(options.popup)
      );
    }

    return marker;
  };

  /**
   * Remove a marker from the map
   */
  const removeMarker = (marker) => {
    if (marker) {
      marker.remove();
    }
  };

  /**
   * Display a route on the map
   */
  const displayRoute = (routeGeometry, options = {}) => {
    if (!mapRef.current || !isMapLoaded) return;

    const {
      id = 'route',
      color = '#4CAF50',
      width = 6,
      opacity = 0.8
    } = options;

    // Remove existing route if present
    if (mapRef.current.getSource(id)) {
      mapRef.current.removeLayer(id);
      mapRef.current.removeSource(id);
    }

    // Add route source
    mapRef.current.addSource(id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: routeGeometry
      }
    });

    // Add route layer
    mapRef.current.addLayer({
      id,
      type: 'line',
      source: id,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': color,
        'line-width': width,
        'line-opacity': opacity
      }
    });

    // Fit map to route bounds
    const coords = routeGeometry.coordinates;
    const bounds = coords.reduce(
      (bounds, coord) => bounds.extend(coord),
      new mapboxgl.LngLatBounds(coords[0], coords[0])
    );

    mapRef.current.fitBounds(bounds, { padding: 50 });
  };

  /**
   * Remove route from the map
   */
  const removeRoute = (id = 'route') => {
    if (!mapRef.current) return;

    if (mapRef.current.getSource(id)) {
      mapRef.current.removeLayer(id);
      mapRef.current.removeSource(id);
    }
  };

  /**
   * Fly to a specific location
   */
  const flyTo = (coords, zoom = 15, duration = 1500) => {
    if (!mapRef.current) return;

    mapRef.current.flyTo({
      center: coords,
      zoom,
      duration
    });
  };

  return {
    mapContainerRef,
    map,
    isMapLoaded,
    error,
    addMarker,
    removeMarker,
    displayRoute,
    removeRoute,
    flyTo
  };
};

export default useMapbox;

// Made with Bob
