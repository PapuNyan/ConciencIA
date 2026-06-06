import { useState, useMemo } from 'react';
import styles from './NavigationPanel.module.css';
import {
  formatDistance,
  formatDuration,
  translateInstruction,
  getManeuverIcon,
  getSafetyBadgeClass,
  getSafetyText
} from '../utils/formatters';

/**
 * NavigationPanel Component
 * Displays route information and turn-by-turn navigation
 */
const NavigationPanel = ({ 
  isOpen, 
  onClose, 
  route, 
  onStart, 
  onCancel 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Simulated safety level - replace with real data from route analysis
  const safetyLevel = useMemo(() => {
    // Use route distance as a simple heuristic for safety level
    // In production, this should come from actual safety data
    return route?.distance && route.distance < 5000 ? 'high' : 'medium';
  }, [route?.distance]);

  if (!route) return null;

  const steps = route.legs?.[0]?.steps || [];

  const handleStepClick = (index) => {
    setCurrentStep(index);
  };

  const handleStart = () => {
    setIsNavigating(true);
    setCurrentStep(0);
    if (onStart) {
      onStart();
    }
  };

  const handleCancel = () => {
    setIsNavigating(false);
    setCurrentStep(0);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className={`${styles.navigationPanel} ${isOpen ? styles.active : ''}`}>
      <div className={styles.navHeader}>
        <h3>🧭 Navegación Activa</h3>
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>
      </div>

      <div className={styles.navSummary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Distancia:</span>
          <span className={styles.summaryValue}>
            {formatDistance(route.distance)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Tiempo:</span>
          <span className={styles.summaryValue}>
            {formatDuration(route.duration)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Seguridad:</span>
          <span className={styles.summaryValue}>
            <span className={`${styles.safetyBadge} ${styles[getSafetyBadgeClass(safetyLevel)]}`}>
              {getSafetyText(safetyLevel)}
            </span>
          </span>
        </div>
      </div>

      <div className={styles.navSteps}>
        {steps.map((step, index) => (
          <NavigationStep
            key={index}
            step={step}
            index={index}
            isActive={index === currentStep}
            onClick={() => handleStepClick(index)}
          />
        ))}
      </div>

      <div className={styles.navFooter}>
        <button 
          className={`${styles.btnPrimary}`}
          onClick={handleStart}
          disabled={isNavigating}
        >
          ▶️ {isNavigating ? 'Navegando...' : 'Iniciar'}
        </button>
        <button 
          className={`${styles.btnDanger}`}
          onClick={handleCancel}
        >
          ✖️ Cancelar
        </button>
      </div>
    </div>
  );
};

/**
 * NavigationStep Component
 * Individual step in the navigation
 */
const NavigationStep = ({ step, isActive, onClick }) => {
  const icon = getManeuverIcon(step.maneuver.type);
  const instruction = translateInstruction(step.maneuver.instruction);
  const distance = formatDistance(step.distance);

  return (
    <div 
      className={`${styles.navStep} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.navStepIcon}>
        {icon}
      </div>
      <div className={styles.navStepContent}>
        <div className={styles.navStepInstruction}>
          {instruction}
        </div>
        <div className={styles.navStepDistance}>
          {distance}
        </div>
      </div>
    </div>
  );
};

export default NavigationPanel;

// Made with Bob
