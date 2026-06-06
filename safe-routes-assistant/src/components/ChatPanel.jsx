import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './ChatPanel.module.css';
import { getChatResponse, isOpenAIConfigured } from '../services/openaiService';
import { geocodeAddress } from '../services/mapboxService';

/**
 * ChatPanel Component
 * Interactive chat interface for the safe routes assistant
 */
const ChatPanel = ({
  isOpen,
  onToggle,
  onZoneAnalysis,
  onRouteRequest,
  userLocation,
  destinationLocation,
  onAddressSelect
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useOpenAI] = useState(true); // Toggle between OpenAI and rule-based
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = useCallback((text, type, buttons = null) => {
    setMessages(prev => [...prev, { text, type, buttons, timestamp: Date.now() }]);
  }, []);

  const handleZoneAnalysis = useCallback(async () => {
    addMessage('📍 ¿Es segura mi zona?', 'user');
    setIsProcessing(true);

    try {
      if (onZoneAnalysis) {
        await onZoneAnalysis();
      }
    } catch {
      addMessage('❌ Error al analizar la zona. Por favor, intenta de nuevo.', 'bot');
    } finally {
      setIsProcessing(false);
    }
  }, [onZoneAnalysis, addMessage]);

  const processMessage = useCallback(async (msg) => {
    const m = msg.toLowerCase();

    // Check if OpenAI is configured and enabled
    const shouldUseOpenAI = useOpenAI && isOpenAIConfigured();

    // Zone analysis keywords
    const zoneKeywords = ['zona', 'zonas', 'área', 'lugar', 'ubicación', 'dónde estoy',
                          'donde estoy', 'aquí', 'seguro', 'segura', 'peligroso', 'peligrosa',
                          'mi ubicación', 'esta zona', 'este lugar', 'alrededor', 'cerca'];

    const isZoneQuery = zoneKeywords.some(keyword => m.includes(keyword));

    // If asking about zone and NOT requesting a route
    if (isZoneQuery && !m.includes('calcular') && !m.includes('navegar') && !m.includes('ruta') && !m.includes('ir a') && !m.includes('llegar a')) {
      handleZoneAnalysis();
      return;
    }

    // Route request with possible address
    const routeKeywords = ['ruta', 'calcular', 'navegar', 'ir a', 'llegar a', 'cómo llego', 'como llego', 'llevarme a'];
    const hasRouteKeyword = routeKeywords.some(keyword => m.includes(keyword));
    
    if (hasRouteKeyword) {
      // Try to extract address from message
      let addressQuery = msg;
      
      // Remove common route keywords to extract the address
      routeKeywords.forEach(keyword => {
        addressQuery = addressQuery.replace(new RegExp(keyword, 'gi'), '').trim();
      });
      
      // Clean up common words
      addressQuery = addressQuery.replace(/^(a|al|hacia|hasta|en)\s+/gi, '').trim();
      
      // If there's text after the route keyword, try to geocode it
      if (addressQuery.length > 3) {
        addMessage('🔍 Buscando la ubicación...', 'bot');
        
        try {
          const result = await geocodeAddress(addressQuery);
          
          if (result && result.coordinates) {
            addMessage(`📍 Encontré: ${result.placeName}`, 'bot');
            
            // Call the address select handler
            if (onAddressSelect) {
              onAddressSelect({
                geometry: { coordinates: result.coordinates },
                place_name: result.placeName
              });
            }
            
            // If user location exists, calculate route automatically
            if (userLocation) {
              addMessage('🗺️ Calculando la ruta más segura...', 'bot');
              setTimeout(() => {
                if (onRouteRequest) {
                  onRouteRequest();
                }
              }, 500);
            } else {
              const buttons = (
                <SuggestionButtons
                  onZoneClick={handleZoneAnalysis}
                  onManualClick={() => addMessage('✋ Haz clic en el mapa para marcar tu ubicación manualmente.', 'bot')}
                />
              );
              addMessage(
                '📍 Para calcular la ruta, primero necesito tu ubicación.',
                'bot',
                buttons
              );
            }
            return;
          } else {
            addMessage(`❌ No encontré "${addressQuery}". Intenta con un nombre más específico o usa el buscador en la parte superior.`, 'bot');
            return;
          }
        } catch (error) {
          console.error('Error geocoding:', error);
          addMessage('❌ Error al buscar la ubicación. Intenta usar el buscador en la parte superior.', 'bot');
          return;
        }
      }
      
      // No address provided, check if locations are set
      if (!userLocation) {
        const buttons = (
          <SuggestionButtons
            onZoneClick={handleZoneAnalysis}
            onManualClick={() => addMessage('✋ Haz clic en el mapa para marcar tu ubicación manualmente, o usa el buscador para encontrar un lugar.', 'bot')}
          />
        );
        addMessage(
          '📍 Para calcular una ruta, primero necesito tu ubicación.',
          'bot',
          buttons
        );
      } else if (!destinationLocation) {
        addMessage('🎯 ¿A dónde quieres ir? Escribe una dirección o usa el buscador en la parte superior.', 'bot');
      } else {
        if (onRouteRequest) {
          onRouteRequest();
        }
      }
      return;
    }

    // Manual location marking
    if (m.includes('manual')) {
      addMessage('✋ Haz clic en el mapa para marcar tu ubicación manualmente, o usa el buscador para encontrar un lugar.', 'bot');
      return;
    }

    // Use OpenAI for intelligent responses
    if (shouldUseOpenAI) {
      try {
        const response = await getChatResponse(msg, conversationHistory);
        
        // Update conversation history
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: msg },
          { role: 'assistant', content: response }
        ].slice(-10)); // Keep only last 10 messages (5 exchanges)
        
        addMessage(response, 'bot');
        return;
      } catch (error) {
        console.error('OpenAI error:', error);
        addMessage(error.message, 'bot');
        
        // Fall back to rule-based if OpenAI fails
        if (error.message.includes('API key')) {
          addMessage('💡 Tip: Configura tu API key de OpenAI en el archivo .env para respuestas más inteligentes.', 'bot');
        }
      }
    }

    // Fallback: Rule-based responses
    const responses = {
      'funciona': '🔍 Analizamos rutas basándonos en datos de seguridad, evitando zonas peligrosas y priorizando tu bienestar.',
      'transporte': '🚶 A pie: < 2km | 🚴 Bici: 2-10km | 🏍️ Moto: 5-20km | 🚗 Coche: > 10km',
      'pie': '🚶 Excelente para distancias cortas. Usa aceras y cruces peatonales.',
      'bici': '🚴 Ideal para distancias medias. Usa casco y prefiere ciclovías.',
      'moto': '🏍️ Rápido pero requiere precaución. Usa equipo de protección completo.',
      'coche': '🚗 Cómodo para distancias largas. Respeta límites de velocidad.',
      'información': '📊 Puedo analizar la seguridad de tu zona actual, calcular rutas seguras y darte recomendaciones personalizadas.'
    };

    for (const [key, response] of Object.entries(responses)) {
      if (m.includes(key)) {
        addMessage(response, 'bot');
        return;
      }
    }

    // Default response
    const buttons = (
      <SuggestionButtons
        onZoneClick={handleZoneAnalysis}
        onRouteClick={() => addMessage('🎯 Usa el buscador en la parte superior izquierda para seleccionar tu destino.', 'bot')}
      />
    );
    addMessage(
      'Puedo ayudarte con:<br>🗺️ Analizar seguridad de zonas<br>🛡️ Calcular rutas seguras<br>🚦 Información de transporte',
      'bot',
      buttons
    );
  }, [userLocation, destinationLocation, onRouteRequest, handleZoneAnalysis, addMessage, useOpenAI, conversationHistory, onAddressSelect]);

  const handleSendMessage = useCallback(async (msg) => {
    const text = msg || inputValue.trim();
    if (!text) return;

    addMessage(text, 'user');
    setInputValue('');
    setIsProcessing(true);

    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      await processMessage(text);
    } finally {
      setIsProcessing(false);
    }
  }, [inputValue, addMessage, processMessage]);

  // Show welcome message on first open
  const hasShownWelcome = useRef(false);
  
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasShownWelcome.current) {
      hasShownWelcome.current = true;
      const buttons = (
        <SuggestionButtons
          onZoneClick={handleZoneAnalysis}
          onRouteClick={() => handleSendMessage('Quiero una ruta segura')}
          onInfoClick={() => handleSendMessage('¿Cómo funciona?')}
        />
      );
      addMessage(
        '¡Hola! 👋 Soy tu asistente de rutas seguras. Puedo analizar la seguridad de tu zona actual o ayudarte a calcular rutas seguras.',
        'bot',
        buttons
      );
    }
  }, [isOpen, messages.length, addMessage, handleZoneAnalysis, handleSendMessage]);


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleSendMessage();
    }
  };

  return (
    <>
      <button 
        className={styles.chatButton} 
        onClick={onToggle}
        title="Asistente de Rutas Seguras"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
        </svg>
      </button>

      <div className={`${styles.chatPanel} ${isOpen ? styles.active : ''}`}>
        <div className={styles.chatHeader}>
          <span>🛡️ Asistente de Rutas Seguras</span>
          <button className={styles.closeBtn} onClick={onToggle}>
            &times;
          </button>
        </div>

        <div className={styles.chatMessages}>
          {messages.map((msg, index) => (
            <Message key={index} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.chatInputArea}>
          <input
            type="text"
            className={styles.chatInput}
            placeholder="Escribe tu mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessing}
          />
          <button 
            className={styles.chatSend}
            onClick={() => handleSendMessage()}
            disabled={isProcessing}
          >
            Enviar
          </button>
        </div>
      </div>
    </>
  );
};

/**
 * Message Component
 */
const Message = ({ message }) => {
  const { text, type, buttons } = message;

  return (
    <div className={`${styles.message} ${styles[type]}`}>
      <strong>{type === 'user' ? 'Tú' : 'Asistente'}</strong>
      <div dangerouslySetInnerHTML={{ __html: text }} />
      {buttons}
    </div>
  );
};

/**
 * SuggestionButtons Component
 */
const SuggestionButtons = ({ onZoneClick, onRouteClick, onInfoClick, onManualClick }) => {
  return (
    <div className={styles.suggestionButtons}>
      {onZoneClick && (
        <button className={styles.suggestionBtn} onClick={onZoneClick}>
          📍 ¿Es segura mi zona?
        </button>
      )}
      {onRouteClick && (
        <button className={styles.suggestionBtn} onClick={onRouteClick}>
          🗺️ Calcular ruta
        </button>
      )}
      {onInfoClick && (
        <button className={styles.suggestionBtn} onClick={onInfoClick}>
          ℹ️ ¿Cómo funciona?
        </button>
      )}
      {onManualClick && (
        <button className={styles.suggestionBtn} onClick={onManualClick}>
          ✋ Marcar manualmente
        </button>
      )}
    </div>
  );
};

export default ChatPanel;
