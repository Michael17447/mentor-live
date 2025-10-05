// client/src/components/CodeAnalysisPanel.jsx
import React from 'react';
import { CodeAnalyzer } from '../utils/codeAnalysis';

const CodeAnalysisPanel = ({ code, language, isVisible, onClose }) => {
  if (!isVisible) return null;

  const analysis = CodeAnalyzer.analyzeCode(code, language);

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      right: '0',
      width: '400px',
      height: '100vh',
      background: '#1e1e1e',
      borderLeft: '1px solid #333',
      overflow: 'auto',
      zIndex: 1000
    }}>
      {/* Заголовок */}
      <div style={{
        padding: '15px',
        background: '#2d2d2d',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ color: '#fff', margin: 0 }}>🔍 Code Analysis</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: '15px' }}>
        {/* Метрики сложности */}
        <div style={{
          background: '#252526',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '15px'
        }}>
          <h4 style={{ color: '#fff', margin: '0 0 10px 0' }}>Complexity Metrics</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: analysis.complexity.level === 'low' ? '#3fb950' : 
                         analysis.complexity.level === 'medium' ? '#d29922' : '#f85149'
            }} />
            <span style={{ color: '#fff', fontSize: '14px' }}>
              Cyclomatic Complexity: {analysis.complexity.score} ({analysis.complexity.level})
            </span>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px',
            marginTop: '10px'
          }}>
            <div style={{ color: '#8b949e', fontSize: '12px' }}>
              Lines: {analysis.metrics.totalLines}
            </div>
            <div style={{ color: '#8b949e', fontSize: '12px' }}>
              Code: {analysis.metrics.codeLines}
            </div>
            <div style={{ color: '#8b949e', fontSize: '12px' }}>
              Comments: {analysis.metrics.commentLines}
            </div>
            <div style={{ color: '#8b949e', fontSize: '12px' }}>
              Ratio: {(analysis.metrics.commentRatio * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Предупреждения */}
        {analysis.warnings.length > 0 && (
          <div style={{
            background: '#252526',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '15px'
          }}>
            <h4 style={{ color: '#fff', margin: '0 0 10px 0' }}>
              ⚠️ Warnings ({analysis.warnings.length})
            </h4>
            {analysis.warnings.map((warning, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  background: warning.severity === 'high' ? 'rgba(248, 81, 73, 0.1)' : 'rgba(210, 153, 34, 0.1)',
                  border: `1px solid ${warning.severity === 'high' ? '#f85149' : '#d29922'}`,
                  borderRadius: '4px',
                  marginBottom: '8px'
                }}
              >
                <div style={{ 
                  color: warning.severity === 'high' ? '#f85149' : '#d29922',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  Line {warning.line}: {warning.type.toUpperCase()}
                </div>
                <div style={{ color: '#fff', fontSize: '12px' }}>
                  {warning.message}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Советы по оптимизации */}
        {analysis.optimizations.length > 0 && (
          <div style={{
            background: '#252526',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '15px'
          }}>
            <h4 style={{ color: '#fff', margin: '0 0 10px 0' }}>
              💡 Optimizations ({analysis.optimizations.length})
            </h4>
            {analysis.optimizations.map((optimization, index) => (
              <div
                key={index}
                style={{
                  padding: '10px',
                  background: 'rgba(56, 139, 253, 0.1)',
                  border: '1px solid #388bfd',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}
              >
                <div style={{ 
                  color: '#388bfd',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '6px'
                }}>
                  Line {optimization.line}
                </div>
                <div style={{ color: '#fff', fontSize: '12px', marginBottom: '6px' }}>
                  {optimization.suggestion}
                </div>
                <div style={{ fontSize: '11px', color: '#8b949e' }}>
                  <div>Before: <code style={{ background: '#1e1e1e', padding: '2px 4px' }}>{optimization.before}</code></div>
                  <div>After: <code style={{ background: '#1e1e1e', padding: '2px 4px' }}>{optimization.after}</code></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Нет проблем */}
        {analysis.warnings.length === 0 && analysis.optimizations.length === 0 && (
          <div style={{
            background: 'rgba(63, 185, 80, 0.1)',
            border: '1px solid #3fb950',
            borderRadius: '6px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>✅</div>
            <div style={{ color: '#3fb950', fontWeight: '600' }}>Great job!</div>
            <div style={{ color: '#8b949e', fontSize: '12px', marginTop: '5px' }}>
              No issues found in your code
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeAnalysisPanel;