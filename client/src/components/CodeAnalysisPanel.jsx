// client/src/components/CodeAnalysisPanel.jsx
import React from 'react';

const CodeAnalysisPanel = ({ analysis, isVisible, onClose }) => {
  if (!isVisible || !analysis) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      right: '0',
      width: '350px',
      height: '100vh',
      background: '#1e1e1e',
      borderLeft: '1px solid #333',
      overflow: 'auto',
      zIndex: 1000,
      boxShadow: '-5px 0 15px rgba(0,0,0,0.3)'
    }}>
      {/* Заголовок */}
      <div style={{
        padding: '15px 20px',
        background: '#2d2d2d',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ color: '#fff', margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔍 Live Analysis
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
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
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>Complexity</span>
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
            {analysis.complexity.score} control structures
          </div>
          {analysis.complexity.level === 'high' && (
            <div style={{ 
              color: '#f85149', 
              fontSize: '11px', 
              marginTop: '8px',
              padding: '6px',
              background: 'rgba(248, 81, 73, 0.1)',
              borderRadius: '4px'
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
          <h4 style={{ color: '#fff', margin: '0 0 12px 0', fontSize: '14px' }}>Metrics</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            fontSize: '12px'
          }}>
            <div>
              <div style={{ color: '#8b949e' }}>Total Lines</div>
              <div style={{ color: '#fff', fontWeight: '600' }}>{analysis.metrics.totalLines}</div>
            </div>
            <div>
              <div style={{ color: '#8b949e' }}>Code Lines</div>
              <div style={{ color: '#fff', fontWeight: '600' }}>{analysis.metrics.codeLines}</div>
            </div>
            <div>
              <div style={{ color: '#8b949e' }}>Comments</div>
              <div style={{ color: '#fff', fontWeight: '600' }}>{analysis.metrics.commentLines}</div>
            </div>
            <div>
              <div style={{ color: '#8b949e' }}>Blank</div>
              <div style={{ color: '#fff', fontWeight: '600' }}>{analysis.metrics.blankLines}</div>
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
              gap: '6px'
            }}>
              ⚠️ Warnings ({analysis.warnings.length})
            </h4>
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {analysis.warnings.map((warning, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px',
                    background: warning.severity === 'error' ? 'rgba(248, 81, 73, 0.1)' : 'rgba(210, 153, 34, 0.1)',
                    border: `1px solid ${warning.severity === 'error' ? '#f85149' : '#d29922'}`,
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ 
                    color: warning.severity === 'error' ? '#f85149' : '#d29922',
                    fontSize: '11px',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    Line {warning.line}
                  </div>
                  <div style={{ color: '#fff', fontSize: '12px' }}>
                    {warning.message}
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
            borderRadius: '8px'
          }}>
            <h4 style={{ 
              color: '#fff', 
              margin: '0 0 12px 0', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              💡 Suggestions ({analysis.suggestions.length})
            </h4>
            {analysis.suggestions.map((suggestion, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  background: 'rgba(56, 139, 253, 0.1)',
                  border: '1px solid #388bfd',
                  borderRadius: '4px',
                  marginBottom: '8px'
                }}
              >
                <div style={{ color: '#fff', fontSize: '12px' }}>
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
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
            <div style={{ color: '#3fb950', fontWeight: '600', fontSize: '14px' }}>Great job!</div>
            <div style={{ color: '#8b949e', fontSize: '12px', marginTop: '4px' }}>
              No issues found in your code
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeAnalysisPanel;