// client/src/components/CodeAnalysisPanel.jsx
import React from 'react';

const CodeAnalysisPanel = ({ analysis, isVisible, onClose }) => {
  if (!isVisible || !analysis) return null;

  const getComplexityColor = (level) => {
    switch (level) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '70px',
      right: '20px',
      width: '400px',
      background: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '8px',
      padding: '16px',
      zIndex: 2000,
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <h3 style={{ 
          margin: 0, 
          color: '#60a5fa',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📊 Code Analysis
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Complexity */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ 
          color: '#d1d5db', 
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          Complexity
        </h4>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px',
          background: '#374151',
          borderRadius: '6px',
          border: `2px solid ${getComplexityColor(analysis.complexity.level)}`
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: getComplexityColor(analysis.complexity.level)
          }} />
          <div>
            <div style={{ 
              color: 'white', 
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {analysis.complexity.level.toUpperCase()}
            </div>
            <div style={{ 
              color: '#9ca3af', 
              fontSize: '12px' 
            }}>
              Score: {analysis.complexity.score} • {analysis.complexity.description}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ 
          color: '#d1d5db', 
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          Metrics
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          background: '#374151',
          padding: '12px',
          borderRadius: '6px'
        }}>
          <div style={{ color: 'white', fontSize: '12px' }}>
            <div>Total Lines</div>
            <div style={{ fontWeight: 'bold' }}>{analysis.metrics.totalLines}</div>
          </div>
          <div style={{ color: 'white', fontSize: '12px' }}>
            <div>Code Lines</div>
            <div style={{ fontWeight: 'bold' }}>{analysis.metrics.codeLines}</div>
          </div>
          <div style={{ color: 'white', fontSize: '12px' }}>
            <div>Comments</div>
            <div style={{ fontWeight: 'bold' }}>{analysis.metrics.commentLines}</div>
          </div>
          <div style={{ color: 'white', fontSize: '12px' }}>
            <div>Blank</div>
            <div style={{ fontWeight: 'bold' }}>{analysis.metrics.blankLines}</div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ 
            color: '#d1d5db', 
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            ⚠️ Warnings ({analysis.warnings.length})
          </h4>
          <div style={{
            background: '#fef3f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '12px',
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            {analysis.warnings.map((warning, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '8px',
                fontSize: '12px',
                color: '#92400e'
              }}>
                <span style={{ color: '#dc2626' }}>•</span>
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div>
          <h4 style={{ 
            color: '#d1d5db', 
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            💡 Suggestions
          </h4>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '12px',
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            {analysis.suggestions.map((suggestion, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '8px',
                fontSize: '12px',
                color: '#166534'
              }}>
                <span style={{ color: '#16a34a' }}>•</span>
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Issues */}
      {analysis.warnings.length === 0 && analysis.suggestions.length === 0 && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ 
            color: '#166534',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            ✅ No issues found
          </div>
          <div style={{ 
            color: '#4d7c0f',
            fontSize: '12px',
            marginTop: '4px'
          }}>
            Your code looks good!
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeAnalysisPanel;