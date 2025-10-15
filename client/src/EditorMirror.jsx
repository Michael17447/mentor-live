// client/src/EditorMirror.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { SUPPORTED_LANGUAGES, LANGUAGE_CATEGORIES, LANGUAGE_SNIPPETS } from './languages.js';
import LanguageSelector from './components/LanguageSelector.jsx';

// 🔥 ИСПОЛЬЗУЕМ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ VITE
const SOCKET_SERVER = import.meta.env.VITE_SOCKET_SERVER || 'https://mentor-live-production.up.railway.app';
const API_BASE = import.meta.env.VITE_API_BASE || 'https://mentor-live-production.up.railway.app';

// 🔥 ОТЛАДОЧНАЯ ИНФОРМАЦИЯ
console.log('🚀 EditorMirror - Vite Configuration:');
console.log('📍 Socket Server:', SOCKET_SERVER);
console.log('📍 API Base:', API_BASE);
console.log('🌐 Environment:', import.meta.env.MODE);
console.log('=======================');

// 🧠 Эмуляция AI-анализа
const mockGPTAnalysis = (code, hotSpots, language = 'javascript') => {
  const recentHotSpots = hotSpots.filter(h => Date.now() - h.timestamp < 30000);
  
  if (recentHotSpots.length === 0) return null;

  const languageSpecificHints = {
    javascript: {
      for: "Ученик часто возвращается к циклу for. В JavaScript также есть forEach, map для массивов.",
      function: "Обнаружена функция. Обратите внимание на стрелочные функции и замыкания.",
      console: "Ученик активно использует console.log. Покажите отладку в браузере.",
      const: "Ученик использует const. Объясните разницу между const, let и var."
    },
    typescript: {
      interface: "Ученик создает интерфейсы. Объясните преимущества TypeScript для типизации.",
      type: "Обнаружены TypeScript типы. Покажите разницу между type и interface.",
      any: "Ученик использует any. Рекомендуйте избегать any для лучшей типизации."
    },
    python: {
      for: "Ученик использует циклы. В Python есть list comprehensions для упрощения.",
      def: "Обнаружена функция. Обратите внимание на отступы и docstrings.",
      print: "Ученик использует print для отладки. Можно показать логирование.",
      import: "Ученик импортирует модули. Объясните систему импортов в Python."
    },
    java: {
      for: "Ученик использует циклы. В Java также есть enhanced for-loop.",
      public: "Обнаружены модификаторы доступа. Объясните public/private.",
      System: "Ученик использует System.out.println. Можно показать логгеры.",
      class: "Ученик создает классы. Объясните ООП концепции в Java."
    },
    cpp: {
      include: "Ученик включает заголовки. Объясните систему заголовков в C++.",
      namespace: "Обнаружено использование namespace. Объясните их назначение.",
      cout: "Ученик использует cout для вывода. Покажите альтернативы.",
      pointer: "Обнаружены указатели. Убедитесь, что ученик понимает их безопасность."
    },
    html: {
      div: "Ученик использует много div. Рекомендуйте семантические теги.",
      style: "Обнаружены inline стили. Рекомендуйте внешние CSS файлы.",
      script: "Ученик добавляет скрипты. Объясните атрибуты async/defer."
    },
    css: {
      important: "Ученик использует !important. Рекомендуйте избегать его.",
      flex: "Обнаружено использование flexbox. Покажите grid как альтернативу.",
      position: "Ученик использует absolute позиционирование. Объясните контекст."
    }
  };

  const hints = languageSpecificHints[language] || languageSpecificHints.javascript;

  if (recentHotSpots.some(h => h.line > 0 && code.includes('for'))) {
    return hints.for || "Ученик часто возвращается к циклу for.";
  }
  if (code.includes('function') || code.includes('def ') || code.includes('public ')) {
    return hints.function || "Обнаружена функция.";
  }
  if ((code.includes('console.log') || code.includes('print') || code.includes('System.out')) && recentHotSpots.length > 2) {
    return hints.console || "Ученик активно использует вывод для отладки.";
  }
  if (code.includes('const') && language === 'javascript') {
    return hints.const || "Ученик использует const.";
  }
  if (code.includes('interface') && language === 'typescript') {
    return hints.interface || "Ученик создает интерфейсы TypeScript.";
  }
  if (recentHotSpots.length > 5) {
    return "Ученик активно перемещается по коду. Возможно, он ищет решение.";
  }
  return null;
};

// 🔥 УЛУЧШЕННЫЙ КОМПОНЕНТ ВЫВОДА КОДА С АНАЛИЗОМ ИМПОРТОВ
const SimpleCodeExecutor = ({ code, language, sessionId, isVisible, onClose }) => {
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [importAnalysis, setImportAnalysis] = useState(null);

  // 🔥 ФУНКЦИЯ ДЛЯ АНАЛИЗА ИМПОРТОВ НА КЛИЕНТЕ
  const analyzeCodeImports = (code, lang) => {
    const analysis = {
      imports: [],
      libraries: new Set(),
      features: []
    };

    switch (lang) {
      case 'javascript':
      case 'typescript':
        const jsPatterns = [
          /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
          /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
        ];
        
        jsPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(code)) !== null) {
            analysis.imports.push(match[0]);
            const libName = match[1].split('/')[0].replace(/^@/, '');
            analysis.libraries.add(libName);
          }
        });

        // TypeScript специфичные возможности
        if (lang === 'typescript') {
          if (code.includes('interface ')) analysis.features.push('🎯 Интерфейсы');
          if (code.includes('type ')) analysis.features.push('🎯 Типы');
          if (code.includes('enum ')) analysis.features.push('🎯 Перечисления');
          if (code.includes('abstract ')) analysis.features.push('🎯 Абстрактные классы');
          if (code.includes('private ') || code.includes('public ') || code.includes('protected ')) {
            analysis.features.push('🎯 Модификаторы доступа');
          }
        }
        break;

      case 'python':
        const pyImports = code.match(/^(import|from)\s+([^\s]+)/gm) || [];
        pyImports.forEach(imp => {
          analysis.imports.push(imp);
          const libName = imp.replace(/^(import|from)\s+/, '').split(/\s|\./)[0];
          analysis.libraries.add(libName);
        });
        break;

      case 'java':
        const javaImports = code.match(/^import\s+([^;]+);/gm) || [];
        javaImports.forEach(imp => {
          analysis.imports.push(imp);
          const libName = imp.replace(/^import\s+/, '').replace(/;/, '').split('.').slice(0, 2).join('.');
          analysis.libraries.add(libName);
        });
        break;

      case 'cpp':
        const cppIncludes = code.match(/^#include\s+[<"]([^>"]+)[>"]/gm) || [];
        cppIncludes.forEach(inc => {
          analysis.imports.push(inc);
          const libName = inc.replace(/^#include\s+[<"]/, '').replace(/[>"]/, '');
          analysis.libraries.add(libName);
        });
        break;

      case 'html':
        // Анализ HTML на внешние ресурсы
        const cssLinks = code.match(/<link[^>]*href=['"]([^'"]+\.css[^'"]*)['"][^>]*>/g) || [];
        const jsScripts = code.match(/<script[^>]*src=['"]([^'"]+\.js[^'"]*)['"][^>]*>/g) || [];
        
        cssLinks.forEach(link => {
          analysis.imports.push(link);
          const href = link.match(/href=['"]([^'"]+)['"]/)?.[1];
          if (href) {
            if (href.includes('bootstrap')) analysis.libraries.add('Bootstrap');
            if (href.includes('tailwind')) analysis.libraries.add('Tailwind CSS');
            if (href.includes('font-awesome')) analysis.libraries.add('Font Awesome');
          }
        });

        jsScripts.forEach(script => {
          analysis.imports.push(script);
          const src = script.match(/src=['"]([^'"]+)['"]/)?.[1];
          if (src) {
            if (src.includes('jquery')) analysis.libraries.add('jQuery');
            if (src.includes('react')) analysis.libraries.add('React');
            if (src.includes('vue')) analysis.libraries.add('Vue');
          }
        });
        break;

      case 'php':
        const includes = code.match(/(include|require)(_once)?\s*['"]([^'"]+)['"]/g) || [];
        includes.forEach(inc => {
          analysis.imports.push(inc);
          const file = inc.match(/['"]([^'"]+)['"]/)?.[1];
          if (file && file.includes('vendor/')) analysis.libraries.add('Composer Package');
        });
        break;

      case 'ruby':
        const requires = code.match(/require\s+['"]([^'"]+)['"]/g) || [];
        requires.forEach(req => {
          analysis.imports.push(req);
          const lib = req.match(/['"]([^'"]+)['"]/)?.[1];
          if (lib) analysis.libraries.add(lib);
        });
        break;
    }

    return analysis;
  };

  // 🔥 ПОПУЛЯРНЫЕ БИБЛИОТЕКИ С ИКОНКАМИ
  const getLibraryDisplayName = (libName) => {
    const popularLibraries = {
      'react': '⚛️ React',
      'vue': '🟢 Vue', 
      'angular': '🛡️ Angular',
      'jquery': '⚡ jQuery',
      'lodash': '📦 Lodash',
      'underscore': '📦 Underscore',
      'axios': '🌐 Axios',
      'moment': '📅 Moment.js',
      'date-fns': '📅 date-fns',
      'express': '🚀 Express',
      'koa': '🎋 Koa',
      'mongoose': '🍃 Mongoose',
      'sequelize': '🗄️ Sequelize',
      'redux': '📊 Redux',
      'mobx': '📊 MobX',
      'd3': '📊 D3.js',
      'chart.js': '📈 Chart.js',
      'three': '🎮 Three.js',
      'p5': '🎨 p5.js',
      'jest': '🃏 Jest',
      'mocha': '☕ Mocha',
      'chai': '✅ Chai',
      'webpack': '📦 Webpack',
      'babel': '🔄 Babel',
      'typescript': '🔷 TypeScript',
      // Python библиотеки
      'numpy': '🔢 NumPy',
      'pandas': '🐼 Pandas',
      'matplotlib': '📊 Matplotlib',
      'seaborn': '🎨 Seaborn',
      'scikit': '🤖 Scikit-learn',
      'tensorflow': '🧠 TensorFlow',
      'torch': '🔥 PyTorch',
      'keras': '🧠 Keras',
      'django': '🎸 Django',
      'flask': '🍶 Flask',
      'fastapi': '⚡ FastAPI',
      'requests': '🌐 Requests',
      'beautifulsoup': '🍲 BeautifulSoup',
      'selenium': '🤖 Selenium',
      'pytest': '🃏 pytest',
      'unittest': '✅ unittest',
      // HTML/CSS фреймворки
      'bootstrap': '🎨 Bootstrap',
      'tailwind': '🎨 Tailwind CSS',
      'font-awesome': '🔤 Font Awesome'
    };

    return popularLibraries[libName.toLowerCase()] || `📚 ${libName}`;
  };

  const executeCode = async () => {
    if (!code || !language) return;

    console.log(`🚀 Executing ${language} code...`);
    setIsExecuting(true);
    setOutput('');
    setError('');
    
    // 🔥 ПРЕДВАРИТЕЛЬНЫЙ АНАЛИЗ КОДА
    const analysis = analyzeCodeImports(code, language);
    setImportAnalysis(analysis);

    try {
      const response = await fetch(`${API_BASE}/api/execute`, {
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
  };

  const clearOutput = () => {
    setOutput('');
    setError('');
    setImportAnalysis(null);
  };

  // 🔥 ФУНКЦИЯ ДЛЯ ОТОБРАЖЕНИЯ АНАЛИЗА ИМПОРТОВ
  const renderImportAnalysis = () => {
    if (!importAnalysis) return null;

    const { imports, libraries, features } = importAnalysis;
    
    if (imports.length === 0 && libraries.size === 0 && features.length === 0) {
      return (
        <div style={{ 
          padding: '12px', 
          background: '#1a1a1a', 
          border: '1px solid #333',
          borderRadius: '6px',
          marginBottom: '12px',
          fontSize: '13px',
          color: '#888'
        }}>
          📝 Используются стандартные библиотеки {language}
        </div>
      );
    }

    return (
      <div style={{ 
        padding: '12px', 
        background: '#1a1a1a', 
        border: '1px solid #333',
        borderRadius: '6px',
        marginBottom: '12px'
      }}>
        <div style={{ color: '#60a5fa', marginBottom: '12px', fontWeight: '500', fontSize: '14px' }}>
          📚 Анализ зависимостей:
        </div>
        
        {libraries.size > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#f59e0b', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}>
              📦 Библиотеки и фреймворки:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {Array.from(libraries).map((lib, index) => (
                <span 
                  key={index}
                  style={{
                    background: '#2d3748',
                    color: '#e2e8f0',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    border: '1px solid #4a5568',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {getLibraryDisplayName(lib)}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {features.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ color: '#8b5cf6', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}>
              🔷 Особенности языка:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {features.map((feature, index) => (
                <span 
                  key={index}
                  style={{
                    background: '#4c1d95',
                    color: '#e9d5ff',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    border: '1px solid #7e22ce'
                  }}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {imports.length > 0 && (
          <div>
            <div style={{ color: '#10b981', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}>
              🔗 Импорты и подключения:
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: '#cbd5e0',
              fontFamily: '"Fira Code", monospace',
              maxHeight: '120px',
              overflowY: 'auto',
              background: '#111827',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #374151'
            }}>
              {imports.map((imp, index) => (
                <div key={index} style={{ 
                  marginBottom: '4px',
                  padding: '2px 0',
                  borderBottom: '1px solid #2d3748'
                }}>
                  {imp}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

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
            borderRadius: '4px',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.color = 'white'}
          onMouseOut={(e) => e.target.style.color = '#9ca3af'}
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
            padding: '10px 16px',
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
            flex: 1,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (!isExecuting && code) e.target.style.background = '#059669';
          }}
          onMouseOut={(e) => {
            if (!isExecuting && code) e.target.style.background = '#10b981';
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
            padding: '10px 12px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#4b5563'}
          onMouseOut={(e) => e.target.style.background = '#6b7280'}
        >
          🧹 Clear
        </button>
      </div>

      {/* Output Panel */}
      <div style={{
        flex: 1,
        padding: '16px',
        background: '#000000',
        color: '#00ff00',
        fontFamily: '"Fira Code", "Courier New", monospace',
        fontSize: '13px',
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.4',
        minHeight: '300px'
      }}>
        {isExecuting ? (
          <div style={{ 
            color: '#f59e0b', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '20px',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <span style={{ animation: 'spin 1s linear infinite', fontSize: '24px' }}>⏳</span>
            <div>Executing {language} code...</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
              🔍 Анализируем зависимости и выполняем код
            </div>
          </div>
        ) : error ? (
          <div style={{ color: '#ef4444' }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ❌ Error:
            </div>
            {error}
          </div>
        ) : output ? (
          <div>
            {/* 🔥 ОТОБРАЖАЕМ АНАЛИЗ ИМПОРТОВ */}
            {renderImportAnalysis()}
            <div style={{ 
              color: '#60a5fa', 
              marginBottom: '8px', 
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ✅ Output:
            </div>
            {output}
          </div>
        ) : (
          <div style={{ 
            color: '#6b7280', 
            fontStyle: 'italic',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '12px' }}>
              Нажмите "Run Code" чтобы выполнить ваш {language} код...
            </div>
            <div style={{ 
              fontSize: '12px', 
              background: '#1a1a1a',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #333'
            }}>
              🔍 Будут показаны:
              <div style={{ marginTop: '8px', textAlign: 'left', paddingLeft: '20px' }}>
                • Используемые библиотеки и импорты<br/>
                • TypeScript особенности (если применимо)<br/>
                • Результат выполнения кода<br/>
                • Возможные ошибки
              </div>
            </div>
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

export default function EditorMirror({ sessionId, isMentor, userId, embedMode = false, initialLanguage = 'javascript' }) {
  const [code, setCode] = useState(SUPPORTED_LANGUAGES[initialLanguage]?.starterCode || '// Начните писать код...\n');
  const [remoteCursors, setRemoteCursors] = useState({});
  const [isMicOn, setIsMicOn] = useState(false);
  const [remoteAudioActive, setRemoteAudioActive] = useState(false);
  const [aiHints, setAiHints] = useState([]);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [studentCanEdit, setStudentCanEdit] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showSnippetsPanel, setShowSnippetsPanel] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [showCodeExecutor, setShowCodeExecutor] = useState(false);

  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const hotSpotsRef = useRef([]);
  const cursorTimeoutRef = useRef(null);
  const lastCodeUpdateRef = useRef(Date.now());
  const reconnectAttemptsRef = useRef(0);
  const isInitialMountRef = useRef(true);
  const lastServerCodeRef = useRef('');

  // 🔥 Логирование событий (для AI)
  const logEvent = useCallback((type, data) => {
    if (type === 'cursor-move' && !isMentor && data.position) {
      hotSpotsRef.current.push({
        line: data.position.lineNumber,
        timestamp: Date.now(),
      });
      // Очищаем записи старше 30 сек
      hotSpotsRef.current = hotSpotsRef.current.filter(
        h => Date.now() - h.timestamp < 30000
      );
    }
  }, [isMentor]);

  // 🔥 ПЕРЕКЛЮЧЕНИЕ РАЗРЕШЕНИЯ РЕДАКТИРОВАНИЯ ДЛЯ УЧЕНИКА
  const toggleStudentEditPermission = useCallback(() => {
    const newPermission = !studentCanEdit;
    setStudentCanEdit(newPermission);
    if (socketRef.current?.connected) {
      socketRef.current.emit('toggle-student-edit', { 
        sessionId, 
        allowEdit: newPermission 
      });
      console.log(`✏️ Student edit permission ${newPermission ? 'enabled' : 'disabled'}`);
    }
  }, [studentCanEdit, sessionId]);

  // 🔥 ОБНОВЛЕННЫЙ ОБРАБОТЧИК ИЗМЕНЕНИЙ КОДА
  const handleEditorChange = useCallback((value) => {
    if (!value) return;
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastCodeUpdateRef.current;
    
    // 🔥 ЗАЩИТА ОТ СЛИШКОМ ЧАСТЫХ ОБНОВЛЕНИЙ
    if (timeSinceLastUpdate < 50) {
      return;
    }
    
    // 🔥 ПРОВЕРЯЕМ, ЧТО КОД ДЕЙСТВИТЕЛЬНО ИЗМЕНИЛСЯ
    if (value === lastServerCodeRef.current) {
      return;
    }
    
    console.log('📝 Local code change detected');
    
    // 🔥 ОБНОВЛЯЕМ КОД ЛОКАЛЬНО СРАЗУ
    setCode(value);
    lastCodeUpdateRef.current = now;
    
    // 🔥 МЕНТОР ВСЕГДА ОТПРАВЛЯЕТ ИЗМЕНЕНИЯ
    if (isMentor && socketRef.current?.connected) {
      console.log('📤 Sending code change to server (mentor)');
      socketRef.current.emit('code-change', { sessionId, code: value });
    } 
    // 🔥 УЧЕНИК ТОЛЬКО С РАЗРЕШЕНИЯ
    else if (studentCanEdit && socketRef.current?.connected) {
      console.log('📤 Sending code change to server (student)');
      socketRef.current.emit('student-code-change', { 
        sessionId, 
        code: value,
        studentId: userId 
      });
    }
  }, [isMentor, studentCanEdit, sessionId, userId]);

  // 🔥 ОБРАБОТЧИК ДВИЖЕНИЯ КУРСОРА С ДЕБАУНСОМ
  const handleCursorMove = useCallback((e) => {
    if (cursorTimeoutRef.current) {
      clearTimeout(cursorTimeoutRef.current);
    }
    
    cursorTimeoutRef.current = setTimeout(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('cursor-move', {
          sessionId,
          position: e.position,
          userId,
        });
        logEvent('cursor-move', { position: e.position, userId });
      }
    }, 100);
  }, [sessionId, userId, logEvent]);

  // 🔥 КНОПКА ПРИНУДИТЕЛЬНОЙ СИНХРОНИЗАЦИИ
  const handleForceSync = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('🔄 Ручная синхронизация запрошена');
      socketRef.current.emit('request-sync', { sessionId });
    }
  }, [sessionId]);

  // 🔥 СМЕНА ЯЗЫКА ПРОГРАММИРОВАНИЯ
  const changeLanguage = useCallback((newLanguage) => {
    if (!SUPPORTED_LANGUAGES[newLanguage]) {
      console.error('Неподдерживаемый язык:', newLanguage);
      return;
    }
    
    console.log(`🌍 Смена языка на: ${newLanguage}`);
    setCurrentLanguage(newLanguage);
    setShowLanguageSelector(false);
    setShowSnippetsPanel(false);
    
    // Обновляем код на стартовый для нового языка
    const newStarterCode = SUPPORTED_LANGUAGES[newLanguage].starterCode;
    setCode(newStarterCode);
    lastCodeUpdateRef.current = Date.now();
    lastServerCodeRef.current = newStarterCode;
    
    // Отправляем изменение языка на сервер
    if (socketRef.current?.connected) {
      socketRef.current.emit('change-language', {
        sessionId,
        language: newLanguage,
        code: newStarterCode
      });
    }
  }, [sessionId]);

  // 🔥 ВСТАВКА СНИППЕТА КОДА
  const insertSnippet = useCallback((snippet) => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const selection = editor.getSelection();
    
    if (selection.isEmpty()) {
      // Вставка в позицию курсора
      const position = editor.getPosition();
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      };
      
      editor.executeEdits('snippet-insert', [{
        range: range,
        text: snippet + '\n',
        forceMoveMarkers: true
      }]);
    } else {
      // Замена выделенного текста
      editor.executeEdits('snippet-insert', [{
        range: selection,
        text: snippet,
        forceMoveMarkers: true
      }]);
    }
    
    editor.focus();
  }, []);

  // 🔥 ГЛОБАЛЬНАЯ ФУНКЦИЯ ДЛЯ СНИППЕТОВ
  useEffect(() => {
    window.insertCodeSnippet = insertSnippet;
    return () => {
      delete window.insertCodeSnippet;
    };
  }, [insertSnippet]);

  // 🔥 УЛУЧШЕННАЯ ФУНКЦИЯ ПОДКЛЮЧЕНИЯ С ПОВТОРНЫМИ ПОПЫТКАМИ
  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('🔗 Сокет уже подключен');
      return;
    }

    console.log('🔗 Установка соединения сокета...');
    console.log('🎯 Session ID:', sessionId);
    console.log('👤 User ID:', userId);
    console.log('🎓 Role:', isMentor ? 'mentor' : 'student');
    console.log('📍 Connecting to:', SOCKET_SERVER);
    
    setConnectionStatus('connecting');
    
    const socket = io(SOCKET_SERVER, {
      timeout: 20000,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      transports: ['websocket', 'polling']
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Подключено к серверу, SID:', socket.id);
      setIsConnected(true);
      setConnectionStatus('connected');
      reconnectAttemptsRef.current = 0;
      
      // 🔥 ПРИСОЕДИНЯЕМСЯ К СЕССИИ ТОЛЬКО ПОСЛЕ УСПЕШНОГО ПОДКЛЮЧЕНИЯ
      if (sessionId) {
        console.log(`🎯 Joining session: ${sessionId} with language: ${currentLanguage}`);
        socket.emit('join-session', sessionId, currentLanguage);
      } else {
        console.error('❌ No sessionId provided for connection');
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Отключено от сервера, причина:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Переподключено к серверу после ${attemptNumber} попыток`);
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // 🔥 ПЕРЕПРИСОЕДИНЯЕМСЯ К СЕССИИ ПРИ ПЕРЕПОДКЛЮЧЕНИИ
      if (sessionId) {
        socket.emit('join-session', sessionId, currentLanguage);
      }
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Попытка переподключения ${attemptNumber}`);
      reconnectAttemptsRef.current = attemptNumber;
      setConnectionStatus(`reconnecting (${attemptNumber})`);
    });

    socket.on('reconnect_error', (error) => {
      console.log('❌ Ошибка переподключения:', error);
      setConnectionStatus('reconnection_error');
    });

    socket.on('reconnect_failed', () => {
      console.log('💥 Переподключение не удалось');
      setIsConnected(false);
      setConnectionStatus('failed');
    });

    socket.on('signal', (data) => {
      if (peerRef.current) peerRef.current.signal(data.signal);
    });

    socket.on('user-audio-status', ({ userId: remoteId, active }) => {
      if (remoteId !== userId) setRemoteAudioActive(active);
      logEvent('audio-status', { userId: remoteId, active });
    });

    // 🔥 УЛУЧШЕННЫЙ ОБРАБОТЧИК ОБНОВЛЕНИЯ КОДА
    socket.on('code-update', (newCode) => {
      console.log('📥 Получено обновление кода от сервера');
      
      // 🔥 СОХРАНЯЕМ ПОСЛЕДНИЙ КОД С СЕРВЕРА ДЛЯ ИЗБЕЖАНИЯ ЦИКЛОВ
      lastServerCodeRef.current = newCode;
      
      // 🔥 ПРОВЕРЯЕМ, ЧТО ЭТО НЕ НАШЕ СОБСТВЕННОЕ ИЗМЕНЕНИЕ
      const timeSinceLastUpdate = Date.now() - lastCodeUpdateRef.current;
      if (timeSinceLastUpdate > 100) { // Увеличили задержку для надежности
        console.log('🔄 Применение удаленного обновления кода');
        setCode(newCode);
      } else {
        console.log('⏸️ Пропуск обновления кода (слишком недавнее локальное изменение)');
      }
    });

    // 🔥 ОБРАБОТЧИК СМЕНЫ ЯЗЫКА ОТ СЕРВЕРА
    socket.on('language-changed', (data) => {
      console.log(`🌍 Язык изменен на: ${data.language}`);
      setCurrentLanguage(data.language);
      if (data.code) {
        setCode(data.code);
        lastServerCodeRef.current = data.code;
      }
    });

    socket.on('cursor-update', (data) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [data.userId]: data.position,
      }));
      logEvent('cursor-update', data);
    });

    // 🔥 ОБРАБОТЧИК РАЗРЕШЕНИЯ РЕДАКТИРОВАНИЯ
    socket.on('student-edit-permission', (canEdit) => {
      console.log('📝 Разрешение на редактирование для ученика:', canEdit);
      setStudentCanEdit(canEdit);
      
      // 🔥 ОБНОВЛЯЕМ РЕДАКТОР ДЛЯ УЧЕНИКА
      if (editorRef.current && !isMentor) {
        editorRef.current.updateOptions({ readOnly: !canEdit });
      }
    });

    // 🔥 ОБРАБОТЧИК ИЗМЕНЕНИЙ ОТ УЧЕНИКА (ДЛЯ МЕНТОРА)
    socket.on('student-code-change', ({ code: newCode, studentId }) => {
      if (isMentor) {
        console.log(`📝 Ученик ${studentId} изменил код, обновляем вид ментора`);
        // 🔥 МЕНТОР ВИДЕТ ИЗМЕНЕНИЯ УЧЕНИКА
        lastServerCodeRef.current = newCode;
        setCode(newCode);
        lastCodeUpdateRef.current = Date.now();
      }
    });

    // 🔥 ОБРАБОТЧИК СОСТОЯНИЯ СЕССИИ
    socket.on('session-state', (state) => {
      console.log('📊 Получено состояние сессии:', state);
      if (state) {
        lastServerCodeRef.current = state.code;
        setCode(state.code);
        setStudentCanEdit(state.studentCanEdit);
        setCurrentLanguage(state.language);
      }
    });

    // 🔥 ОБРАБОТЧИК ПРИСОЕДИНЕНИЯ/ВЫХОДА ПОЛЬЗОВАТЕЛЕЙ
    socket.on('user-joined', ({ userId: joinedUserId, userCount }) => {
      console.log(`👋 Пользователь ${joinedUserId} присоединился к сессии. Всего пользователей: ${userCount}`);
    });

    socket.on('user-left', ({ userId: leftUserId, userCount }) => {
      console.log(`👋 Пользователь ${leftUserId} покинул сессию. Осталось пользователей: ${userCount}`);
      setRemoteCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[leftUserId];
        return newCursors;
      });
    });

    // 🔥 ОБРАБОТЧИК AI-ПОДСКАЗОК
    socket.on('ai-hint', (hintData) => {
      console.log('🧠 Получена AI-подсказка:', hintData);
      const newHint = {
        id: Date.now(),
        text: hintData.hint,
        time: new Date().toLocaleTimeString(),
        language: hintData.language,
        confidence: hintData.confidence
      };
      
      setAiHints((prev) => [...prev, newHint]);
      setShowAIPanel(true);
    });

    return socket;
  }, [sessionId, userId, logEvent, isMentor, currentLanguage, SOCKET_SERVER]);

  // 🔥 ИСПРАВЛЕННЫЙ useEffect ДЛЯ ПОДКЛЮЧЕНИЯ
  useEffect(() => {
    // Подключаемся только при первоначальном монтировании или изменении sessionId
    if (isInitialMountRef.current || sessionId) {
      connectSocket();
      isInitialMountRef.current = false;
    }

    // AI-аналитика каждые 15 сек (только для ментора)
    let aiInterval;
    if (isMentor) {
      aiInterval = setInterval(() => {
        if (hotSpotsRef.current.length > 0 && socketRef.current?.connected) {
          const hint = mockGPTAnalysis(code, hotSpotsRef.current, currentLanguage);
          if (hint) {
            const newHint = {
              id: Date.now(),
              text: hint,
              time: new Date().toLocaleTimeString(),
              language: currentLanguage
            };
            
            setAiHints((prev) => [...prev, newHint]);
            setShowAIPanel(true);
            
            // Отправляем AI-подсказку на сервер
            socketRef.current.emit('ai-hint-generated', {
              sessionId,
              hint: hint,
              confidence: 0.8,
              language: currentLanguage
            });
          }
        }
      }, 15000);
    }

    return () => {
      console.log('🧹 Очистка компонента');
      if (aiInterval) clearInterval(aiInterval);
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
    };
  }, [sessionId, isMentor, code, connectSocket, currentLanguage]);

  // 🔥 ОТДЕЛЬНЫЙ useEffect ДЛЯ ОЧИСТКИ СОЕДИНЕНИЯ
  useEffect(() => {
    return () => {
      console.log('🧹 Очистка соединения сокета при размонтировании');
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  // Настройка редактора
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    
    // 🔥 ИСПРАВЛЕННАЯ ЛОГИКА: МЕНТОР ВСЕГДА МОЖЕТ РЕДАКТИРОВАТЬ
    if (isMentor) {
      editor.updateOptions({ readOnly: false });
    } else {
      // УЧЕНИК МОЖЕТ РЕДАКТИРОВАТЬ ТОЛЬКО С РАЗРЕШЕНИЯ
      editor.updateOptions({ readOnly: !studentCanEdit });
    }
    
    editor.onDidChangeCursorPosition(handleCursorMove);
    
    // Добавляем комбинации клавиш для сниппетов
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (isMentor) {
        setShowSnippetsPanel(!showSnippetsPanel);
      }
    });
  };

  // Переключение микрофона
  const toggleMicrophone = async () => {
    if (!isMicOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;

        if (!peerRef.current) {
          peerRef.current = new Peer({
            initiator: isMentor,
            stream,
            trickle: false,
          });

          peerRef.current.on('signal', (data) => {
            if (socketRef.current?.connected) {
              socketRef.current.emit('signal', { sessionId, signal: data });
            }
          });

          peerRef.current.on('stream', (remoteStream) => {
            const audio = new Audio();
            audio.srcObject = remoteStream;
            audio.play().catch(console.error);
          });
        }

        setIsMicOn(true);
        if (socketRef.current?.connected) {
          socketRef.current.emit('user-audio-status', {
            sessionId,
            active: true,
            userId,
          });
        }
      } catch (err) {
        console.error('Ошибка микрофона:', err);
        alert('Не удалось получить доступ к микрофону');
      }
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      setIsMicOn(false);
      if (socketRef.current?.connected) {
        socketRef.current.emit('user-audio-status', {
          sessionId,
          active: false,
          userId,
        });
      }
    }
  };

  // Скачивание сессии
  const downloadSession = () => {
    const languageInfo = SUPPORTED_LANGUAGES[currentLanguage];
    const data = {
      sessionId,
      code,
      aiHints,
      studentEditEnabled: studentCanEdit,
      language: currentLanguage,
      languageName: languageInfo?.name,
      extension: languageInfo?.extension,
      exportedAt: new Date().toISOString(),
      connectionStatus: connectionStatus,
      isMentor: isMentor,
      userId: userId
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codemirror-${currentLanguage}-session-${sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Экспорт кода в файл
  const exportCode = () => {
    const languageInfo = SUPPORTED_LANGUAGES[currentLanguage];
    const blob = new Blob([code], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code${languageInfo?.extension || '.txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 🔥 КНОПКА ПЕРЕПОДКЛЮЧЕНИЯ
  const handleReconnect = () => {
    console.log('🔄 Запрошено ручное переподключение');
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    connectSocket();
  };

  // 🔥 ЗАПРОС СОСТОЯНИЯ СЕССИИ
  const requestSessionState = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('get-session-state', { sessionId });
    }
  };

  // 🔥 ЗАВЕРШЕНИЕ СЕССИИ (ДЛЯ МЕНТОРА)
  const endSession = () => {
    if (socketRef.current?.connected && isMentor) {
      if (confirm('Вы уверены, что хотите завершить сессию для всех участников?')) {
        socketRef.current.emit('end-session', {
          sessionId,
          reason: 'ended_by_mentor'
        });
      }
    }
  };

  // 🔥 ФУНКЦИЯ ДЛЯ ПЕРЕКЛЮЧЕНИЯ ВЫВОДА КОДА
  const toggleCodeExecutor = () => {
    setShowCodeExecutor(!showCodeExecutor);
  };

  // Получение цвета статуса подключения
  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10b981';
      case 'connecting': return '#f59e0b';
      case 'reconnecting': return '#f59e0b';
      case 'disconnected': return '#ef4444';
      case 'failed': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '✅';
      case 'connecting': return '🔄';
      case 'reconnecting': return '🔄';
      case 'disconnected': return '❌';
      case 'failed': return '💥';
      default: return '❓';
    }
  };

  return (
    <div style={{ height: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Фиксированная панель кнопок */}
      <div
        style={{
          background: 'rgba(30, 30, 30, 0.95)',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}
      >
        {/* Левая группа кнопок */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Индикатор подключения */}
          <div 
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: getConnectionColor(),
              color: 'white',
              fontSize: '12px',
              fontWeight: '500',
              cursor: !isConnected ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              minWidth: '140px',
              transition: 'all 0.2s'
            }} 
            onClick={!isConnected ? handleReconnect : undefined}
            title={`Нажмите для ${!isConnected ? 'переподключения' : 'статуса соединения'}`}
            onMouseOver={!isConnected ? (e) => e.target.style.filter = 'brightness(1.1)' : undefined}
            onMouseOut={!isConnected ? (e) => e.target.style.filter = 'brightness(1)' : undefined}
          >
            <span>{getConnectionIcon()}</span>
            <span>
              {connectionStatus === 'connected' ? 'Подключено' : 
               connectionStatus === 'connecting' ? 'Подключение...' :
               connectionStatus === 'reconnecting' ? 'Переподключение...' :
               connectionStatus === 'disconnected' ? 'Отключено' :
               connectionStatus}
            </span>
            {!isConnected && <span>🔄</span>}
          </div>

          {/* Информация о сессии */}
          <div style={{
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>🎯</span>
            <span>ID: {sessionId}</span>
            <span style={{ opacity: 0.7 }}>|</span>
            <span>{isMentor ? '👨‍🏫 Ментор' : '👨‍🎓 Ученик'}</span>
          </div>

          {/* 🔥 СЕЛЕКТОР ЯЗЫКА ПРОГРАММИРОВАНИЯ */}
          <div style={{ position: 'relative' }}>
            <LanguageSelector
              onLanguageSelect={changeLanguage}
              selectedLanguage={currentLanguage}
              showSnippets={isMentor}
              compact={true}
            />
          </div>

          {/* 🔥 КНОПКА ВЫВОДА КОДА */}
          <button
            onClick={toggleCodeExecutor}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: showCodeExecutor ? '#10b981' : '#374151',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = showCodeExecutor ? '#059669' : '#4b5563'}
            onMouseOut={(e) => e.target.style.background = showCodeExecutor ? '#10b981' : '#374151'}
            title="Запустить код"
          >
            🚀 Run Code
          </button>

          {/* 🔥 КНОПКА СНИППЕТОВ ДЛЯ МЕНТОРА */}
          {isMentor && LANGUAGE_SNIPPETS[currentLanguage] && (
            <button
              onClick={() => setShowSnippetsPanel(!showSnippetsPanel)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: showSnippetsPanel ? '#8b5cf6' : '#374151',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = showSnippetsPanel ? '#7c3aed' : '#4b5563'}
              onMouseOut={(e) => e.target.style.background = showSnippetsPanel ? '#8b5cf6' : '#374151'}
              title="Фрагменты кода (Ctrl+S)"
            >
              📋 Сниппеты
            </button>
          )}

          <button
            onClick={toggleMicrophone}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: isMicOn ? '#ef4444' : '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '500',
              minWidth: '100px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = isMicOn ? '#dc2626' : '#2563eb'}
            onMouseOut={(e) => e.target.style.background = isMicOn ? '#ef4444' : '#3b82f6'}
          >
            🎙️ {isMicOn ? 'Выкл' : 'Вкл'}
          </button>

          {/* 🔥 КНОПКА ПЕРЕКЛЮЧЕНИЯ РЕДАКТИРОВАНИЯ ДЛЯ УЧЕНИКА */}
          {isMentor && (
            <>
              <button
                onClick={toggleStudentEditPermission}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: studentCanEdit ? '#f59e0b' : '#6b7280',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = studentCanEdit ? '#d97706' : '#4b5563'}
                onMouseOut={(e) => e.target.style.background = studentCanEdit ? '#f59e0b' : '#6b7280'}
                title={studentCanEdit ? "Заблокировать редактирование для ученика" : "Разрешить ученику редактирование"}
              >
                {studentCanEdit ? '🔒 Заблокировать' : '✏️ Разрешить'}
              </button>

              <button
                onClick={handleForceSync}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#6366f1',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#4f46e5'}
                onMouseOut={(e) => e.target.style.background = '#6366f1'}
                title="Принудительная синхронизация кода"
              >
                🔄 Синхр.
              </button>

              <button
                onClick={requestSessionState}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#6b7280',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#4b5563'}
                onMouseOut={(e) => e.target.style.background = '#6b7280'}
                title="Запросить состояние сессии"
              >
                📊 Статус
              </button>
            </>
          )}

          {/* 🔥 ИНДИКАТОР ДЛЯ УЧЕНИКА */}
          {!isMentor && (
            <div style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: studentCanEdit ? '#10b981' : '#ef4444',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {studentCanEdit ? '✏️ Редактирование' : '🔒 Только просмотр'}
            </div>
          )}
        </div>

        {/* Правая группа кнопок */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Кнопки экспорта */}
          <button
            onClick={exportCode}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#059669',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#047857'}
            onMouseOut={(e) => e.target.style.background = '#059669'}
            title="Экспорт кода в файл"
          >
            💾 Экспорт кода
          </button>

          <button
            onClick={downloadSession}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#10b981',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#059669'}
            onMouseOut={(e) => e.target.style.background = '#10b981'}
            title="Скачать данные сессии"
          >
            📥 Скачать сессию
          </button>

          {/* AI Panel Toggle */}
          {isMentor && (
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: aiHints.length > 0 ? '#8b5cf6' : '#6b7280',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = aiHints.length > 0 ? '#7c3aed' : '#4b5563'}
              onMouseOut={(e) => e.target.style.background = aiHints.length > 0 ? '#8b5cf6' : '#6b7280'}
            >
              🧠 ИИ ({aiHints.length})
            </button>
          )}

          {/* Кнопка завершения сессии для ментора */}
          {isMentor && (
            <button
              onClick={endSession}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: '#dc2626',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#b91c1c'}
              onMouseOut={(e) => e.target.style.background = '#dc2626'}
              title="Завершить сессию для всех участников"
            >
              🔚 Завершить
            </button>
          )}

          {/* Кнопка выхода */}
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#dc2626'}
            onMouseOut={(e) => e.target.style.background = '#ef4444'}
          >
            Выход
          </button>
        </div>
      </div>

      {/* Индикатор активности микрофона партнёра */}
      {remoteAudioActive && (
        <div
          style={{
            position: 'absolute',
            top: 70,
            left: 20,
            background: '#10b981',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            zIndex: 2000,
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'pulse 2s infinite'
          }}
        >
          🎧 Партнер говорит
        </div>
      )}

      {/* 🔥 КОМПОНЕНТ ВЫВОДА КОДА */}
      <SimpleCodeExecutor
        code={code}
        language={currentLanguage}
        sessionId={sessionId}
        isVisible={showCodeExecutor}
        onClose={() => setShowCodeExecutor(false)}
      />

      {/* Панель AI (если открыта) */}
      {isMentor && showAIPanel && (
        <div
          style={{
            position: 'absolute',
            top: 70,
            right: 20,
            width: 400,
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '16px',
            zIndex: 2000,
            maxHeight: '50vh',
            overflowY: 'auto',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h4 style={{ margin: 0, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🧠 ИИ Ассистент 
              <span style={{ 
                fontSize: '12px', 
                background: '#374151', 
                padding: '2px 8px', 
                borderRadius: '12px' 
              }}>
                {SUPPORTED_LANGUAGES[currentLanguage]?.icon} {currentLanguage}
              </span>
            </h4>
            <button
              onClick={() => setShowAIPanel(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '4px',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.color = 'white'}
              onMouseOut={(e) => e.target.style.color = '#9ca3af'}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {aiHints.slice(-8).reverse().map((hint) => (
              <div
                key={hint.id}
                style={{
                  padding: '12px',
                  background: '#374151',
                  borderRadius: '6px',
                  borderLeft: '4px solid #8b5cf6'
                }}
              >
                <div style={{ 
                  fontSize: '12px', 
                  color: '#9ca3af',
                  marginBottom: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>🕒 {hint.time}</span>
                  <span style={{ 
                    background: '#1f2937', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}>
                    {hint.language}
                  </span>
                </div>
                <div style={{ color: 'white', fontSize: '14px' }}>
                  {hint.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Панель сниппетов */}
      {showSnippetsPanel && LANGUAGE_SNIPPETS[currentLanguage] && (
        <div
          style={{
            position: 'absolute',
            top: 70,
            left: 20,
            width: 300,
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '16px',
            zIndex: 2000,
            maxHeight: '60vh',
            overflowY: 'auto',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h4 style={{ margin: 0, color: 'white' }}>
              📋 Сниппеты {SUPPORTED_LANGUAGES[currentLanguage]?.name}
            </h4>
            <button
              onClick={() => setShowSnippetsPanel(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '4px',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.color = 'white'}
              onMouseOut={(e) => e.target.style.color = '#9ca3af'}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(LANGUAGE_SNIPPETS[currentLanguage]).map(([name, snippet]) => (
              <button
                key={name}
                onClick={() => insertSnippet(snippet)}
                style={{
                  padding: '10px',
                  background: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#4b5563'}
                onMouseOut={(e) => e.target.style.background = '#374151'}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{name}</div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#9ca3af',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {snippet.split('\n')[0]}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Основной редактор */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Editor
          height="100%"
          language={SUPPORTED_LANGUAGES[currentLanguage]?.monacoLanguage || 'javascript'}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            readOnly: !isMentor && !studentCanEdit,
            theme: 'vs-dark',
          }}
        />
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}