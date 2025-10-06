// client/src/components/CodeAnalysisPanel.jsx
import React from 'react';

const CodeAnalysisPanel = ({ analysis, isVisible, onClose }) => {
  if (!isVisible || !analysis) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return '#f85149';
      case 'warning': return '#d29922';
      case 'info': return '#2f81f7';
      default: return '#8b949e';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      right: '0',
      width: '380px',
      height: '100vh',
      background: '#1e1e1e',
      borderLeft: '1px solid #333',
      overflow: 'auto',
      zIndex: 2000,
      boxShadow: '-5px 0 15px rgba(0,0,0,0.3)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Заголовок */}
      <div style={{
        padding: '15px 20px',
        background: '#2d2d2d',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <h3 style={{ 
          color: '#fff', 
          margin: 0, 
          fontSize: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontWeight: '600'
        }}>
          🔍 Live Code Analysis
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => e.target.style.background = '#404040'}
          onMouseOut={(e) => e.target.style.background = 'none'}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Индикатор сложности */}
        <div style={{
          background: '#252526',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '15px',
          border: `1px solid ${
            analysis.complexity.level === 'high' ? '#f85149' : 
            analysis.complexity.level === 'medium' ? '#d29922' : '#3fb950'
          }`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>Code Complexity</span>
            <div style={{
              padding: '4px 8px',
              background: analysis.complexity.level === 'high' ? '#f85149' : 
                         analysis.complexity.level === 'medium' ? '#d29922' : '#3fb950',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              {analysis.complexity.level.toUpperCase()}
            </div>
          </div>
          <div style={{ color: '#8b949e', fontSize: '12px' }}>
            {analysis.complexity.score} control structures detected
          </div>
          {analysis.complexity.level === 'high' && (
            <div style={{ 
              color: '#f85149', 
              fontSize: '11px', 
              marginTop: '8px',
              padding: '6px',
              background: 'rgba(248, 81, 73, 0.1)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ⚠️ Consider simplifying complex logic
            </div>
          )}
        </div>

        {/* Метрики кода */}
        <div style={{
          background: '#252526',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <h4 style={{ 
            color: '#fff', 
            margin: '0 0 12px 0', 
            fontSize: '14px',
            fontWeight: '600'
          }}>
            📊 Code Metrics
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontSize: '12px'
          }}>
            <div>
              <div style={{ color: '#8b949e' }}>Total Lines</div>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>{analysis.metrics.totalLines}</div>
            </div>
            <div>
              <div style={{ color: '#8b949e' }}>Code Lines</div>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>{analysis.metrics.codeLines}</div>
            </div>
            <div>
              <div style={{ color: '#8b949e' }}>Comments</div>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>{analysis.metrics.commentLines}</div>
            </div>
            <div>
              <div style={{ color: '#8b949e' }}>Blank Lines</div>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>{analysis.metrics.blankLines}</div>
            </div>
          </div>
          <div style={{
            marginTop: '10px',
            padding: '8px',
            background: 'rgba(56, 139, 253, 0.1)',
            border: '1px solid #388bfd',
            borderRadius: '4px'
          }}>
            <div style={{ color: '#388bfd', fontSize: '11px', fontWeight: '500' }}>
              Comment ratio: {(analysis.metrics.commentRatio * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Предупреждения */}
        {analysis.warnings.length > 0 && (
          <div style={{
            background: '#252526',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            <h4 style={{ 
              color: '#fff', 
              margin: '0 0 12px 0', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600'
            }}>
              ⚠️ Warnings & Issues ({analysis.warnings.length})
            </h4>
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {analysis.warnings.map((warning, index) => (
                <div
                  key={index}
                  style={{
                    padding: '10px',
                    background: `rgba(${
                      warning.severity === 'error' ? '248, 81, 73' : 
                      warning.severity === 'warning' ? '210, 153, 34' : '47, 129, 247'
                    }, 0.1)`,
                    border: `1px solid ${getSeverityColor(warning.severity)}`,
                    borderRadius: '6px',
                    marginBottom: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontSize: '12px', flexShrink: 0 }}>
                      {getSeverityIcon(warning.severity)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        color: getSeverityColor(warning.severity),
                        fontSize: '11px',
                        fontWeight: '600',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        Line {warning.line}
                        <span style={{
                          padding: '1px 6px',
                          background: getSeverityColor(warning.severity),
                          color: '#fff',
                          borderRadius: '8px',
                          fontSize: '9px',
                          fontWeight: 'bold'
                        }}>
                          {warning.severity.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ color: '#fff', fontSize: '12px', lineHeight: '1.4' }}>
                        {warning.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Предложения */}
        {analysis.suggestions.length > 0 && (
          <div style={{
            background: '#252526',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            <h4 style={{ 
              color: '#fff', 
              margin: '0 0 12px 0', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600'
            }}>
              💡 Suggestions ({analysis.suggestions.length})
            </h4>
            {analysis.suggestions.map((suggestion, index) => (
              <div
                key={index}
                style={{
                  padding: '10px',
                  background: 'rgba(63, 185, 80, 0.1)',
                  border: '1px solid #3fb950',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '12px', flexShrink: 0 }}>💡</span>
                <div style={{ color: '#fff', fontSize: '12px', lineHeight: '1.4', flex: 1 }}>
                  {suggestion}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Нет проблем */}
        {analysis.warnings.length === 0 && analysis.suggestions.length === 0 && (
          <div style={{
            background: 'rgba(63, 185, 80, 0.1)',
            border: '1px solid #3fb950',
            borderRadius: '8px',
            padding: '30px 20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
            <div style={{ color: '#3fb950', fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
              Excellent Code Quality!
            </div>
            <div style={{ color: '#8b949e', fontSize: '13px', lineHeight: '1.4' }}>
              No issues found in your code. Keep up the good work!
            </div>
          </div>
        )}

        {/* Время анализа */}
        <div style={{
          textAlign: 'center',
          padding: '10px',
          color: '#8b949e',
          fontSize: '11px',
          borderTop: '1px solid #333',
          marginTop: '15px'
        }}>
          Analyzed at {new Date(analysis.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default CodeAnalysisPanel;