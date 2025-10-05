// client/src/components/TimeMachine.jsx
import React, { useState, useEffect } from 'react';
import { ExecutionVisualizer } from '../utils/codeAnalysis';

const TimeMachine = ({ codeHistory, currentCode, onRestoreCode, isVisible, onClose }) => {
  const [history] = useState(() => ExecutionVisualizer.createStepHistory());
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Добавляем текущий код в историю при изменении
    if (currentCode && codeHistory) {
      history.addStep(currentCode, '');
    }
  }, [currentCode, history, codeHistory]);

  const handleBack = () => {
    if (history.canGoBack()) {
      history.currentStep--;
      setCurrentStep(history.currentStep);
      const step = history.getStep(history.currentStep);
      if (step && onRestoreCode) {
        onRestoreCode(step.code);
      }
    }
  };

  const handleForward = () => {
    if (history.canGoForward()) {
      history.currentStep++;
      setCurrentStep(history.currentStep);
      const step = history.getStep(history.currentStep);
      if (step && onRestoreCode) {
        onRestoreCode(step.code);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#1e1e1e',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '15px',
      zIndex: 1000,
      minWidth: '300px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <h4 style={{ color: '#fff', margin: 0 }}>🕒 Time Machine</h4>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <button
          onClick={handleBack}
          disabled={!history.canGoBack()}
          style={{
            background: history.canGoBack() ? '#388bfd' : '#666',
            color: '#fff',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: history.canGoBack() ? 'pointer' : 'not-allowed'
          }}
        >
          ⬅️ Back
        </button>

        <span style={{ color: '#fff', fontSize: '12px' }}>
          Step {currentStep + 1} of {history.steps.length}
        </span>

        <button
          onClick={handleForward}
          disabled={!history.canGoForward()}
          style={{
            background: history.canGoForward() ? '#388bfd' : '#666',
            color: '#fff',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: history.canGoForward() ? 'pointer' : 'not-allowed'
          }}
        >
          ➡️ Forward
        </button>
      </div>

      {/* Мини-анализ текущего шага */}
      {history.steps[currentStep] && (
        <div style={{
          background: '#252526',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#8b949e'
        }}>
          <div>Complexity: {history.steps[currentStep].analysis.complexity.score}</div>
          <div>Warnings: {history.steps[currentStep].analysis.warnings.length}</div>
          <div>Optimizations: {history.steps[currentStep].analysis.optimizations.length}</div>
        </div>
      )}
    </div>
  );
};

export default TimeMachine;