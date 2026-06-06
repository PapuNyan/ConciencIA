import OpenAI from 'openai';

/**
 * OpenAI Service
 * Handles communication with OpenAI API for intelligent chat responses
 */

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from backend
});

/**
 * System prompt that defines the assistant's behavior and context
 */
const SYSTEM_PROMPT = `Eres un asistente virtual especializado en rutas seguras y navegación urbana en México.
Tu nombre es "Asistente de Rutas Seguras" y tu objetivo es ayudar a los usuarios a:

1. Analizar la seguridad de zonas específicas
2. Calcular rutas seguras entre dos puntos
3. Proporcionar recomendaciones sobre medios de transporte
4. Dar consejos de seguridad personal
5. Ayudar a encontrar lugares y direcciones en Ciudad de México y Estado de México

CONTEXTO DE LA APLICACIÓN:
- Los usuarios pueden ver su ubicación en un mapa interactivo
- Pueden buscar destinos escribiendo direcciones o nombres de lugares directamente en el chat
- Pueden hacer clic en el mapa para marcar ubicaciones
- El sistema analiza zonas de seguridad y calcula rutas automáticamente

CAPACIDADES ESPECIALES:
- Puedes entender direcciones y nombres de lugares cuando el usuario los escribe
- Cuando el usuario dice "ir a [lugar]" o "ruta a [dirección]", el sistema buscará automáticamente ese lugar
- El sistema puede trazar rutas automáticamente cuando se proporcionan origen y destino

DIRECTRICES DE RESPUESTA:
- Sé conciso y directo (máximo 2-3 oraciones por respuesta)
- Usa emojis relevantes para hacer las respuestas más amigables
- Prioriza la seguridad del usuario en todas tus recomendaciones
- Si el usuario menciona una dirección o lugar, anímalo a escribirla directamente (ej: "ir a Zócalo", "ruta a Polanco")
- Si pregunta sobre su zona actual, ofrece analizar la seguridad de su ubicación
- Mantén un tono amable pero profesional
- Menciona que puede escribir direcciones directamente en el chat o usar el buscador del mapa

EJEMPLOS DE USO:
- "¿Cómo llego al Zócalo?" → El sistema buscará y trazará la ruta automáticamente
- "Ir a Polanco" → Se buscará Polanco y se calculará la ruta
- "Ruta a Avenida Reforma 123" → Se geocodificará la dirección y se trazará la ruta

MEDIOS DE TRANSPORTE:
🚶 A pie: Ideal para distancias menores a 2km
🚴 Bicicleta: Recomendado para 2-10km, usa casco y ciclovías
🏍️ Motocicleta: Para 5-20km, requiere equipo de protección
🚗 Automóvil: Mejor para distancias mayores a 10km

Responde siempre en español y adapta tus respuestas al contexto mexicano.`;

/**
 * Send a message to OpenAI and get a response
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @returns {Promise<string>} - The assistant's response
 */
export async function getChatResponse(userMessage, conversationHistory = []) {
  try {
    // Validate API key
    if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured. Please add your API key to the .env file.');
    }

    // Build messages array with system prompt and conversation history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // You can change to 'gpt-4' for better responses
      messages: messages,
      max_tokens: 150, // Keep responses concise
      temperature: 0.7, // Balance between creativity and consistency
    });

    // Extract and return the response
    const assistantMessage = response.choices[0].message.content.trim();
    return assistantMessage;

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Handle specific error cases
    if (error.message.includes('API key')) {
      throw new Error('⚠️ API key de OpenAI no configurada. Por favor, agrega tu API key en el archivo .env', { cause: error });
    } else if (error.status === 401) {
      throw new Error('⚠️ API key de OpenAI inválida. Verifica tu clave en el archivo .env', { cause: error });
    } else if (error.status === 429) {
      throw new Error('⚠️ Límite de solicitudes alcanzado. Intenta de nuevo en unos momentos.', { cause: error });
    } else if (error.code === 'ENOTFOUND' || error.message.includes('network')) {
      throw new Error('⚠️ Error de conexión. Verifica tu conexión a internet.', { cause: error });
    }
    
    throw new Error('⚠️ Error al procesar tu mensaje. Intenta de nuevo.', { cause: error });
  }
}

/**
 * Check if OpenAI is properly configured
 * @returns {boolean} - True if API key is configured
 */
export function isOpenAIConfigured() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  return apiKey && apiKey !== 'your_openai_api_key_here' && apiKey.length > 0;
}

export default {
  getChatResponse,
  isOpenAIConfigured
};
