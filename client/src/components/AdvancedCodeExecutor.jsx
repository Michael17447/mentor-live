// client/src/components/AdvancedCodeExecutor.jsx
import React, { useState, useCallback, useRef } from 'react';

const AdvancedCodeExecutor = ({ code, language, sessionId, isVisible, onClose }) => {
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('output');
  const iframeRef = useRef(null);

  const executeCode = useCallback(async () => {
    if (!code || !language) return;

    console.log(`🚀 Executing ${language} code...`);
    setIsExecuting(true);
    setOutput('');
    setError('');
    setActiveTab('output');

    try {
      // Специальная обработка для HTML/CSS
      if (language === 'html') {
        setActiveTab('preview');
        return;
      }

      if (language === 'css') {
        setActiveTab('preview');
        // Можно добавить применение CSS к iframe
        return;
      }

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

  // Функция для обновления HTML preview
  const updatePreview = useCallback(() => {
    if (iframeRef.current && (language === 'html' || language === 'css')) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      if (language === 'html') {
        iframeDoc.open();
        iframeDoc.write(code);
        iframeDoc.close();
      } else if (language === 'css') {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <style>${code}</style>
          </head>
          <body>
            <div class="preview-content">
              <h1>CSS Preview</h1>
              <p>This is a preview of your CSS styles</p>
              <button class="styled-button">Styled Button</button>
              <div class="styled-box">Styled Box</div>
            </div>
          </body>
          </html>
        `);
        iframeDoc.close();
      }
    }
  }, [code, language]);

  React.useEffect(() => {
    if (activeTab === 'preview' && (language === 'html' || language === 'css')) {
      updatePreview();
    }
  }, [activeTab, language, updatePreview]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '70px',
      right: '20px',
      width: '600px',
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
              {language === 'html' || language === 'css' ? '👁️ Preview' : '▶️ Run Code'}
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

      {/* Tabs */}
      {(language === 'html' || language === 'css' || output || error) && (
        <div style={{
          display: 'flex',
          background: '#111827',
          borderBottom: '1px solid #374151'
        }}>
          {(language === 'html' || language === 'css') && (
            <button
              onClick={() => setActiveTab('preview')}
              style={{
                padding: '10px 16px',
                background: activeTab === 'preview' ? '#374151' : 'transparent',
                color: activeTab === 'preview' ? '#60a5fa' : '#9ca3af',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                borderBottom: activeTab === 'preview' ? '2px solid #60a5fa' : 'none'
              }}
            >
              👁️ Preview
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('output')}
            style={{
              padding: '10px 16px',
              background: activeTab === 'output' ? '#374151' : 'transparent',
              color: activeTab === 'output' ? '#60a5fa' : '#9ca3af',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              borderBottom: activeTab === 'output' ? '2px solid #60a5fa' : 'none'
            }}
          >
            📤 Output
          </button>
        </div>
      )}

      {/* Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '300px'
      }}>
        {activeTab === 'preview' && (language === 'html' || language === 'css') ? (
          <iframe
            ref={iframeRef}
            style={{
              flex: 1,
              border: 'none',
              background: 'white'
            }}
            title="code-preview"
            sandbox="allow-scripts"
          />
        ) : (
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
                {language === 'html' || language === 'css' 
                  ? 'Click "Preview" to see your code in action...'
                  : 'Click "Run Code" to execute your code...'
                }
              </div>
            )}
          </div>
        )}
      </div>

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

export default AdvancedCodeExecutor;