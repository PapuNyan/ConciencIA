/**
 * Utility functions for formatting data
 */

/**
 * Format distance in meters to human-readable format
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format duration in seconds to human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
};

/**
 * Translate maneuver instructions from English to Spanish
 * @param {string} text - Instruction text in English
 * @returns {string} Translated text
 */
export const translateInstruction = (text) => {
  const translations = {
    'turn right': 'Gira a la derecha',
    'turn left': 'Gira a la izquierda',
    'sharp right': 'Gira bruscamente a la derecha',
    'sharp left': 'Gira bruscamente a la izquierda',
    'slight right': 'Gira ligeramente a la derecha',
    'slight left': 'Gira ligeramente a la izquierda',
    'straight': 'Continúa recto',
    'arrive': 'Has llegado',
    'depart': 'Comienza tu ruta',
    'roundabout': 'Toma la rotonda',
    'merge': 'Incorpórate',
    'fork': 'Toma el desvío',
    'end of road': 'Final de la calle',
    'continue': 'Continúa'
  };
  
  let translatedText = text.toLowerCase();
  
  Object.entries(translations).forEach(([english, spanish]) => {
    translatedText = translatedText.replace(english, spanish);
  });
  
  return translatedText.charAt(0).toUpperCase() + translatedText.slice(1);
};

/**
 * Get icon emoji for maneuver type
 * @param {string} type - Maneuver type
 * @returns {string} Icon emoji
 */
export const getManeuverIcon = (type) => {
  const icons = {
    'turn-right': '➡️',
    'turn-left': '⬅️',
    'sharp-right': '↗️',
    'sharp-left': '↖️',
    'slight-right': '↗️',
    'slight-left': '↖️',
    'straight': '⬆️',
    'uturn': '↩️',
    'arrive': '🎯',
    'depart': '🚀',
    'roundabout': '🔄',
    'merge': '🔀',
    'fork': '🔱',
    'end-of-road': '🛑',
    'continue': '⬆️'
  };
  
  return icons[type] || '➡️';
};

/**
 * Get safety badge class based on level
 * @param {string} level - Safety level (high, medium, low)
 * @returns {string} CSS class name
 */
export const getSafetyBadgeClass = (level) => {
  const classes = {
    high: 'safety-high',
    medium: 'safety-medium',
    low: 'safety-low'
  };
  
  return classes[level] || 'safety-medium';
};

/**
 * Get safety text in Spanish
 * @param {string} level - Safety level (high, medium, low)
 * @returns {string} Safety text
 */
export const getSafetyText = (level) => {
  const texts = {
    high: 'ALTA',
    medium: 'MEDIA',
    low: 'BAJA'
  };
  
  return texts[level] || 'MEDIA';
};

export default {
  formatDistance,
  formatDuration,
  translateInstruction,
  getManeuverIcon,
  getSafetyBadgeClass,
  getSafetyText
};

// Made with Bob
