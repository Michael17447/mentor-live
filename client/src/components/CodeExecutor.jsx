// client/src/components/CodeExecutor.jsx
import React, { useState, useCallback } from 'react';

const CodeExecutor = ({ code, language, sessionId, isVisible, onClose }) => {
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionHistory, setExecutionHistory] = useState([]);

  const executeCode = useCallback(async () => {
    if (!code || !language) return;

    console.log(`🚀 Executing ${language} code...`);
    setIsExecuting(true);
    setOutput('');
    setError('');

    try {
      const response = await fetch('https://mentor-live-production.up.railway.app/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          sessionId
        })
      });

      const result = await response.json();

      if (result.success) {
        setOutput(result.output);
        setError(result.error || '');
        
        // Добавляем в историю
        const executionRecord = {
          id: Date.now(),
          code: code.substring(0, 100) + (code.length > 100 ? '...' : ''),
          output: result.output,
          error: result.error,
          timestamp: new Date().toLocaleTimeString(),
          language
        };
        
        setExecutionHistory(prev => [executionRecord, ...prev.slice(0, 9)]); // Храним 10 последних
      } else {
        setError(result.error || 'Execution failed');
      }
    } catch (err) {
      console.error('❌ Execution request failed:', err);
      setError('Failed to execute code: ' + err.message);
    } finally {
      setIsExecuting(false);
    }
  }, [code, language, sessionId]);

  const clearOutput = () => {
    setOutput('');
    setError('');
  };

  const clearHistory = () => {
    setExecutionHistory([]);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '70px',
      right: '20px',
      width: '500px',
      background: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '8px',
      zIndex: 2000,
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #374151',
        background: '#111827'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: '#60a5fa',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🚀 Code Executor
          <span style={{ 
            fontSize: '12px', 
            background: '#374151', 
            padding: '2px 8px', 
            borderRadius: '12px',
            color: '#9ca3af'
          }}>
            {language}
          </span>
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
          onMouseOver={(e) => e.target.style.background = '#374151'}
          onMouseOut={(e) => e.target.style.background = 'none'}
        >
          ✕
        </button>
      </div>

      {/* Controls */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #374151',
        background: '#111827',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <button
          onClick={executeCode}
          disabled={isExecuting || !code}
          style={{
            padding: '8px 16px',
            background: isExecuting || !code ? '#6b7280' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isExecuting || !code ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flex: 1
          }}
        >
          {isExecuting ? (
            <>
              <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
              Executing...
            </>
          ) : (
            <>
              ▶️ Run Code
            </>
          )}
        </button>

        <button
          onClick={clearOutput}
          style={{
            padding: '8px 12px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🧹 Clear
        </button>
      </div>

      {/* Output Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '200px',
        maxHeight: '300px'
      }}>
        <div style={{
          padding: '12px 16px',
          background: '#111827',
          borderBottom: '1px solid #374151',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '500' }}>
            {isExecuting ? '🔄 Executing...' : '📤 Output'}
          </span>
          {executionHistory.length > 0 && (
            <button
              onClick={clearHistory}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '11px',
                padding: '4px 8px'
              }}
            >
              Clear History
            </button>
          )}
        </div>

        <div style={{
          flex: 1,
          padding: '16px',
          background: '#000000',
          color: '#00ff00',
          fontFamily: '"Fira Code", "Courier New", monospace',
          fontSize: '13px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.4'
        }}>
          {isExecuting ? (
            <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
              Executing {language} code...
            </div>
          ) : error ? (
            <div style={{ color: '#ef4444' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>❌ Error:</div>
              {error}
            </div>
          ) : output ? (
            <div>
              <div style={{ color: '#60a5fa', marginBottom: '8px', fontWeight: '500' }}>✅ Output:</div>
              {output}
            </div>
          ) : (
            <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
              Click "Run Code" to execute your {language} code...
            </div>
          )}
        </div>
      </div>

      {/* Execution History */}
      {executionHistory.length > 0 && (
        <div style={{
          borderTop: '1px solid #374151',
          maxHeight: '150px',
          overflow: 'auto'
        }}>
          <div style={{
            padding: '12px 16px',
            background: '#111827',
            borderBottom: '1px solid #374151',
            color: '#d1d5db',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            📚 Execution History
          </div>
          <div style={{ padding: '8px' }}>
            {executionHistory.map((record) => (
              <div
                key={record.id}
                style={{
                  padding: '8px',
                  marginBottom: '4px',
                  background: '#374151',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  border: '1px solid transparent'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#60a5fa'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                onClick={() => {
                  setOutput(record.output || '');
                  setError(record.error || '');
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '2px'
                }}>
                  <span style={{ color: '#9ca3af' }}>{record.language}</span>
                  <span style={{ color: '#6b7280' }}>{record.timestamp}</span>
                </div>
                <div style={{ 
                  color: '#d1d5db',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {record.code}
                </div>
                {record.error && (
                  <div style={{ color: '#ef4444', fontSize: '10px' }}>
                    ❌ {record.error.substring(0, 50)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CodeExecutor;