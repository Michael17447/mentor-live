// client/src/components/EnhancedCodeEditor.jsx
import React, { useState, useEffect } from 'react';
import CodeAnalysisPanel from './CodeAnalysisPanel';
import TimeMachine from './TimeMachine';
import { CodeAnalyzer, ExecutionVisualizer } from '../utils/codeAnalysis';

const EnhancedCodeEditor = ({ sessionId, language, initialCode, onCodeChange }) => {
  const [code, setCode] = useState(initialCode);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showTimeMachine, setShowTimeMachine] = useState(false);
  const [executionHistory] = useState(() => ExecutionVisualizer.createStepHistory());

  useEffect(() => {
    // Добавляем в историю при изменении кода
    const timeoutId = setTimeout(() => {
      executionHistory.addStep(code, '');
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [code, executionHistory]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  const handleRestoreCode = (restoredCode) => {
    setCode(restoredCode);
    if (onCodeChange) {
      onCodeChange(restoredCode);
    }
  };

  // Визуализация сложных участков
  const getLineComplexity = (line, index) => {
    const analysis = CodeAnalyzer.analyzeCode(line, language);
    if (analysis.complexity.level === 'high') {
      return 'high-complexity';
    } else if (analysis.warnings.length > 0) {
      return 'has-warning';
    }
    return '';
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Панель инструментов анализа */}
      <div style={{
        background: '#2d2d2d',
        padding: '10px 15px',
        borderBottom: '1px solid #3e3e3e',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          style={{
            background: showAnalysis ? '#388bfd' : '#444',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🔍 Analyze Code
        </button>

        <button
          onClick={() => setShowTimeMachine(!showTimeMachine)}
          style={{
            background: showTimeMachine ? '#388bfd' : '#444',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🕒 Time Machine
        </button>

        {/* Индикатор сложности в реальном времени */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '12px' }}>
            Complexity: {CodeAnalyzer.analyzeCode(code, language).complexity.score}
          </span>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: CodeAnalyzer.analyzeCode(code, language).complexity.level === 'low' ? '#3fb950' : 
                       CodeAnalyzer.analyzeCode(code, language).complexity.level === 'medium' ? '#d29922' : '#f85149'
          }} />
        </div>
      </div>

      {/* Основной редактор */}
      <div style={{
        background: '#1e1e1e',
        color: '#d4d4d4',
        fontFamily: '"Fira Code", monospace',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          style={{
            width: '100%',
            minHeight: '400px',
            background: 'transparent',
            color: 'transparent',
            caretColor: '#fff',
            border: 'none',
            padding: '15px',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            resize: 'vertical',
            outline: 'none'
          }}
          spellCheck="false"
        />
        
        {/* Подсветка с анализом */}
        <div style={{
          position: 'absolute',
          top: '50px',
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          padding: '15px',
          whiteSpace: 'pre',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit'
        }}>
          {code.split('\n').map((line, index) => (
            <div 
              key={index}
              className={getLineComplexity(line, index)}
              style={{
                color: '#d4d4d4',
                background: getLineComplexity(line, index) === 'high-complexity' 
                  ? 'rgba(248, 81, 73, 0.1)' 
                  : getLineComplexity(line, index) === 'has-warning'
                  ? 'rgba(210, 153, 34, 0.1)'
                  : 'transparent',
                borderLeft: getLineComplexity(line, index) === 'high-complexity' 
                  ? '3px solid #f85149' 
                  : getLineComplexity(line, index) === 'has-warning'
                  ? '3px solid #d29922'
                  : 'none',
                paddingLeft: getLineComplexity(line, index) ? '12px' : '0',
                marginLeft: getLineComplexity(line, index) ? '-15px' : '0'
              }}
            >
              {line || ' '}
            </div>
          ))}
        </div>
      </div>

      {/* Панели анализа */}
      <CodeAnalysisPanel
        code={code}
        language={language}
        isVisible={showAnalysis}
        onClose={() => setShowAnalysis(false)}
      />

      <TimeMachine
        codeHistory={executionHistory}
        currentCode={code}
        onRestoreCode={handleRestoreCode}
        isVisible={showTimeMachine}
        onClose={() => setShowTimeMachine(false)}
      />

      <style>
        {`
          .high-complexity {
            position: relative;
          }
          
          .high-complexity::after {
            content: '⚠️ High Complexity';
            position: absolute;
            right: 10px;
            top: 0;
            background: #f85149;
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 3px;
          }
        `}
      </style>
    </div>
  );
};

export default EnhancedCodeEditor;