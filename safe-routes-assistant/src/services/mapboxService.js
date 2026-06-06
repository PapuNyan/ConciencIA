/**
 * Mapbox Service
 * Handles all Mapbox API interactions with proper error handling
 */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

/**
 * Calculate route between two points
 * @param {Array} start - [longitude, latitude]
 * @param {Array} end - [longitude, latitude]
 * @param {string} profile - walking, cycling, driving
 * @returns {Promise<Object|null>} Route data or null if error
 */
export const calculateRoute = async (start, end, profile = 'walking') => {
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&language=es&access_token=${MAPBOX_TOKEN}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found');
    }
    
    return data.routes[0];
  } catch (error) {
    console.error('Error calculating route:', error);
    return null;
  }
};

/**
 * Get place information using reverse geocoding
 * @param {Array} coords - [longitude, latitude]
 * @returns {Promise<Object|null>} Place data or null if error
 */
export const getPlaceInfo = async (coords) => {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${MAPBOX_TOKEN}&language=es`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error('No place information found');
    }
    
    return data.features[0];
  } catch (error) {
    console.error('Error getting place info:', error);
    return null;
  }
};

/**
 * Analyze zone safety (placeholder for future backend integration)
 * @param {Array} coords - [longitude, latitude]
 * @returns {Promise<Object|null>} Safety analysis or null if error
 */
export const analyzeZoneSafety = async (coords) => {
  try {
    // Get place information first
    const place = await getPlaceInfo(coords);
    
    if (!place) {
      throw new Error('Could not get place information');
    }
    
    // TODO: Replace this simulation with real API call to your backend
    // Example: const response = await fetch(`${API_BASE_URL}/safety/analyze`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ coordinates: coords })
    // });
    
    // Simulated safety score (70-100 range)
    const safetyScore = Math.floor(Math.random() * 30) + 70;
    const safetyLevel = safetyScore >= 85 ? 'high' : safetyScore >= 70 ? 'medium' : 'low';
    
    const zoneInfo = {
      name: place.place_name,
      neighborhood: place.context?.find(c => c.id.includes('neighborhood'))?.text || 'Desconocido',
      district: place.context?.find(c => c.id.includes('district'))?.text || 'Desconocido',
      safetyScore,
      safetyLevel,
      coordinates: coords,
      recommendations: generateRecommendations(safetyLevel),
      nearbyServices: [
        'Policía a 500m',
        'Hospital a 1.2km',
        'Estación de bomberos a 800m'
      ]
    };
    
    return zoneInfo;
  } catch (error) {
    console.error('Error analyzing zone safety:', error);
    return null;
  }
};

/**
 * Generate safety recommendations based on level
 * @param {string} safetyLevel - high, medium, or low
 * @returns {Array<string>} List of recommendations
 */
const generateRecommendations = (safetyLevel) => {
  const recommendations = {
    high: [
      '✅ Zona segura para caminar de día y noche',
      '✅ Buena iluminación en calles principales',
      '✅ Presencia policial regular',
      '💡 Mantén siempre atención a tu entorno'
    ],
    medium: [
      '⚠️ Zona moderadamente segura',
      '⚠️ Evita caminar solo/a por la noche',
      '💡 Usa calles principales e iluminadas',
      '💡 Mantén tus pertenencias seguras',
      '📱 Comparte tu ubicación con alguien de confianza'
    ],
    low: [
      '🚨 Zona con precauciones necesarias',
      '🚨 Evita transitar solo/a, especialmente de noche',
      '💡 Usa transporte público o privado',
      '💡 No muestres objetos de valor',
      '📱 Ten el teléfono listo para emergencias (911)'
    ]
  };
  
  return recommendations[safetyLevel] || recommendations.medium;
};

export default {
  calculateRoute,
  getPlaceInfo,
  analyzeZoneSafety
};

// Made with Bob
