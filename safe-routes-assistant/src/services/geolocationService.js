/**
 * Geolocation Service
 * Handles user location detection with proper error handling
 */

/**
 * Detect user's current location
 * @returns {Promise<Array>} [longitude, latitude]
 * @throws {Error} If geolocation is not supported or permission denied
 */
export const detectUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada por este navegador'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.longitude, position.coords.latitude];
        resolve(coords);
      },
      (error) => {
        let errorMessage;
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener ubicación.';
            break;
          default:
            errorMessage = 'Error desconocido al obtener ubicación.';
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Watch user's location for continuous tracking
 * @param {Function} onSuccess - Callback when location updates
 * @param {Function} onError - Callback when error occurs
 * @returns {number} Watch ID to clear later
 */
export const watchUserLocation = (onSuccess, onError) => {
  if (!navigator.geolocation) {
    onError(new Error('Geolocalización no soportada'));
    return null;
  }
  
  return navigator.geolocation.watchPosition(
    (position) => {
      const coords = [position.coords.longitude, position.coords.latitude];
      onSuccess(coords, position.coords.heading);
    },
    (error) => {
      onError(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
};

/**
 * Clear location watch
 * @param {number} watchId - Watch ID returned from watchUserLocation
 */
export const clearLocationWatch = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

export default {
  detectUserLocation,
  watchUserLocation,
  clearLocationWatch
};

// Made with Bob
