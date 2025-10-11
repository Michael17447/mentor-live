// client/src/EditorMirror.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { SUPPORTED_LANGUAGES, LANGUAGE_CATEGORIES, LANGUAGE_SNIPPETS } from './languages.js';
import LanguageSelector from './components/LanguageSelector.jsx';
import { SimpleCodeAnalyzer } from '../utils/simpleAnalysis';
import CodeAnalysisPanel from './components/CodeAnalysisPanel';

// 🔥 ИСПОЛЬЗУЕМ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ VITE
const SOCKET_SERVER = import.meta.env.VITE_SOCKET_SERVER || 'https://mentor-live-production.up.railway.app';
const API_BASE = import.meta.env.VITE_API_BASE || 'https://mentor-live-production.up.railway.app';

// 🔥 ОТЛАДОЧНАЯ ИНФОРМАЦИЯ
console.log('🚀 Vite Configuration:');
console.log('📍 Socket Server:', SOCKET_SERVER);
console.log('📍 API Base:', API_BASE);
console.log('🌐 Environment:', import.meta.env.MODE);
console.log('=======================');

// 🧠 Эмуляция AI-анализа (обновляем для multi-language)
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

// 🔥 ПРОСТОЙ КОМПОНЕНТ ВЫВОДА КОДА
const SimpleCodeExecutor = ({ code, language, sessionId, isVisible, onClose }) => {
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const executeCode = async () => {
    if (!code || !language) return;

    console.log(`🚀 Executing ${language} code...`);
    setIsExecuting(true);
    setOutput('');
    setError('');

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
        padding: '16px',
        background: '#000000',
        color: '#00ff00',
        fontFamily: '"Fira Code", "Courier New", monospace',
        fontSize: '13px',
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.4',
        minHeight: '200px'
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
  
  // 🔥 НОВЫЕ СОСТОЯНИЯ ДЛЯ LIVE CODE ANALYSIS
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [codeAnalysis, setCodeAnalysis] = useState(null);
  
  // 🔥 ДОБАВЛЕНО СОСТОЯНИЕ ДЛЯ ВЫВОДА КОДА
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
  const analysisTimeoutRef = useRef(null);
  const lastServerCodeRef = useRef('');

  // 🔥 ФУНКЦИЯ ДЛЯ АНАЛИЗА КОДА (ИСПРАВЛЕННАЯ)
  const analyzeCode = useCallback((codeToAnalyze) => {
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }
    
    analysisTimeoutRef.current = setTimeout(() => {
      try {
        const analysis = SimpleCodeAnalyzer.analyze(codeToAnalyze, currentLanguage);
        setCodeAnalysis(analysis);
      } catch (error) {
        console.error('Code analysis error:', error);
        setCodeAnalysis({
          complexity: { score: 0, level: 'low' },
          warnings: [],
          metrics: { totalLines: 0, codeLines: 0, commentLines: 0, blankLines: 0, commentRatio: 0 },
          suggestions: [],
          timestamp: new Date().toISOString()
        });
      }
    }, 1000);
  }, [currentLanguage]);

  // 🔥 АНАЛИЗ ПРИ ПЕРВОНАЧАЛЬНОЙ ЗАГРУЗКЕ
  useEffect(() => {
    if (code) {
      analyzeCode(code);
    }
  }, [code, analyzeCode]);

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

  // 🔥 ОБНОВЛЕННЫЙ ОБРАБОТЧИК ИЗМЕНЕНИЙ КОДА С ЗАЩИТОЙ ОТ ЦИКЛИЧЕСКИХ ОБНОВЛЕНИЙ
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
    
    // 🔥 ЗАПУСКАЕМ АНАЛИЗ КОДА
    analyzeCode(value);
    
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
  }, [isMentor, studentCanEdit, sessionId, userId, analyzeCode]);

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
    
    // 🔥 ЗАПУСКАЕМ АНАЛИЗ ДЛЯ НОВОГО КОДА
    analyzeCode(newStarterCode);
    
    // Отправляем изменение языка на сервер
    if (socketRef.current?.connected) {
      socketRef.current.emit('change-language', {
        sessionId,
        language: newLanguage,
        code: newStarterCode
      });
    }
  }, [sessionId, analyzeCode]);

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
        // 🔥 ЗАПУСКАЕМ АНАЛИЗ ПРИ ПОЛУЧЕНИИ КОДА ОТ СЕРВЕРА
        analyzeCode(newCode);
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
        // 🔥 ЗАПУСКАЕМ АНАЛИЗ ПРИ СМЕНЕ ЯЗЫКА
        analyzeCode(data.code);
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
        // 🔥 ЗАПУСКАЕМ АНАЛИЗ КОДА УЧЕНИКА
        analyzeCode(newCode);
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
        // 🔥 ЗАПУСКАЕМ АНАЛИЗ ПРИ ПОЛУЧЕНИИ СОСТОЯНИЯ СЕССИИ
        analyzeCode(state.code);
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
  }, [sessionId, userId, logEvent, isMentor, currentLanguage, analyzeCode, SOCKET_SERVER]);

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
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
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
      codeAnalysis: codeAnalysis,
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
              minWidth: '140px'
            }} 
            onClick={!isConnected ? handleReconnect : undefined}
            title={`Нажмите для ${!isConnected ? 'переподключения' : 'статуса соединения'}`}
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

          {/* 🔥 КНОПКА АНАЛИЗА КОДА */}
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: showAnalysis ? '#8b5cf6' : '#374151',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}
            title="Live Code Analysis"
          >
            🔍 Analysis
            {codeAnalysis && codeAnalysis.warnings && codeAnalysis.warnings.length > 0 && (
              <span style={{
                background: '#ef4444',
                color: 'white',
                borderRadius: '8px',
                padding: '2px 6px',
                fontSize: '10px',
                minWidth: '16px'
              }}>
                {codeAnalysis.warnings.length}
              </span>
            )}
          </button>

          {/* 🔥 ИНДИКАТОР СЛОЖНОСТИ */}
          {codeAnalysis && codeAnalysis.complexity && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '6px',
              border: `1px solid ${
                codeAnalysis.complexity.level === 'high' ? '#ef4444' : 
                codeAnalysis.complexity.level === 'medium' ? '#f59e0b' : '#10b981'
              }`
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: codeAnalysis.complexity.level === 'high' ? '#ef4444' : 
                           codeAnalysis.complexity.level === 'medium' ? '#f59e0b' : '#10b981'
              }} />
              <span style={{ 
                color: 'white', 
                fontSize: '11px',
                fontWeight: '500'
              }}>
                Complexity: {codeAnalysis.complexity.level}
              </span>
            </div>
          )}

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
              fontWeight: '500'
            }}
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
                fontWeight: '500'
              }}
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
              minWidth: '100px'
            }}
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
                  fontWeight: '500'
                }}
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
                  fontWeight: '500'
                }}
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
                  fontWeight: '500'
                }}
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
              fontWeight: '500'
            }}
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
              fontWeight: '500'
            }}
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
                fontWeight: '500'
              }}
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
                fontWeight: '500'
              }}
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
              fontWeight: '500'
            }}
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
            gap: '6px'
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
                padding: '4px'
              }}
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
                padding: '4px'
              }}
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

      {/* 🔥 ПАНЕЛЬ LIVE CODE ANALYSIS */}
      <CodeAnalysisPanel
        analysis={codeAnalysis}
        isVisible={showAnalysis}
        onClose={() => setShowAnalysis(false)}
      />
    </div>
  );
}