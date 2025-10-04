// client/src/EditorMirror.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { SUPPORTED_LANGUAGES, LANGUAGE_CATEGORIES } from './languages.js';

const SOCKET_SERVER = 'https://mentor-live-production.up.railway.app';

// 🧠 Эмуляция AI-анализа (обновляем для multi-language)
const mockGPTAnalysis = (code, hotSpots, language = 'javascript') => {
  const recentHotSpots = hotSpots.filter(h => Date.now() - h.timestamp < 30000);
  
  if (recentHotSpots.length === 0) return null;

  const languageSpecificHints = {
    javascript: {
      for: "Ученик часто возвращается к циклу for. В JavaScript также есть forEach, map для массивов.",
      function: "Обнаружена функция. Обратите внимание на стрелочные функции и замыкания.",
      console: "Ученик активно использует console.log. Покажите отладку в браузере."
    },
    python: {
      for: "Ученик использует циклы. В Python есть list comprehensions для упрощения.",
      def: "Обнаружена функция. Обратите внимание на отступы и docstrings.",
      print: "Ученик использует print для отладки. Можно показать логирование."
    },
    java: {
      for: "Ученик использует циклы. В Java также есть enhanced for-loop.",
      public: "Обнаружены модификаторы доступа. Объясните public/private.",
      System: "Ученик использует System.out.println. Можно показать логгеры."
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
  if (recentHotSpots.length > 5) {
    return "Ученик активно перемещается по коду. Возможно, он ищет решение.";
  }
  return null;
};

export default function EditorMirror({ sessionId, isMentor, userId, embedMode = false }) {
  const [code, setCode] = useState('// Начните писать код...\n');
  const [remoteCursors, setRemoteCursors] = useState({});
  const [isMicOn, setIsMicOn] = useState(false);
  const [remoteAudioActive, setRemoteAudioActive] = useState(false);
  const [aiHints, setAiHints] = useState([]);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [studentCanEdit, setStudentCanEdit] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('javascript');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const hotSpotsRef = useRef([]);
  const cursorTimeoutRef = useRef(null);
  const lastCodeUpdateRef = useRef(Date.now());
  const reconnectAttemptsRef = useRef(0);
  const isInitialMountRef = useRef(true);

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
    }
  }, [studentCanEdit, sessionId]);

  // 🔥 ОБНОВЛЕННЫЙ ОБРАБОТЧИК ИЗМЕНЕНИЙ КОДА
  const handleEditorChange = useCallback((value) => {
    if (!value) return;
    
    // 🔥 ОБНОВЛЯЕМ КОД ЛОКАЛЬНО СРАЗУ
    setCode(value);
    lastCodeUpdateRef.current = Date.now();
    
    // 🔥 МЕНТОР ВСЕГДА ОТПРАВЛЯЕТ ИЗМЕНЕНИЯ
    if (isMentor && socketRef.current?.connected) {
      socketRef.current.emit('code-change', { sessionId, code: value });
    } 
    // 🔥 УЧЕНИК ТОЛЬКО С РАЗРЕШЕНИЯ
    else if (studentCanEdit && socketRef.current?.connected) {
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
      console.log('🔄 Manual sync requested');
      socketRef.current.emit('request-sync', { sessionId });
    }
  }, [sessionId]);

  // 🔥 СМЕНА ЯЗЫКА ПРОГРАММИРОВАНИЯ
  const changeLanguage = useCallback((newLanguage) => {
    if (!SUPPORTED_LANGUAGES[newLanguage]) {
      console.error('Unsupported language:', newLanguage);
      return;
    }
    
    console.log(`🌍 Changing language to: ${newLanguage}`);
    setCurrentLanguage(newLanguage);
    setShowLanguageSelector(false);
    
    // Обновляем код на стартовый для нового языка
    const newStarterCode = SUPPORTED_LANGUAGES[newLanguage].starterCode;
    setCode(newStarterCode);
    lastCodeUpdateRef.current = Date.now();
    
    // Отправляем изменение языка на сервер
    if (socketRef.current?.connected) {
      socketRef.current.emit('change-language', {
        sessionId,
        language: newLanguage,
        code: newStarterCode
      });
    }
  }, [sessionId]);

  // 🔥 УЛУЧШЕННАЯ ФУНКЦИЯ ПОДКЛЮЧЕНИЯ
  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('🔗 Socket already connected');
      return;
    }

    console.log('🔗 Establishing socket connection...');
    
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
      console.log('✅ Connected to server, SID:', socket.id);
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      
      // Присоединяемся к сессии только после успешного подключения
      socket.emit('join-session', sessionId);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server, reason:', reason);
      setIsConnected(false);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected to server after ${attemptNumber} attempts`);
      setIsConnected(true);
      socket.emit('join-session', sessionId);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
      reconnectAttemptsRef.current = attemptNumber;
    });

    socket.on('reconnect_error', (error) => {
      console.log('❌ Reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.log('💥 Reconnection failed');
      setIsConnected(false);
    });

    socket.on('signal', (data) => {
      if (peerRef.current) peerRef.current.signal(data.signal);
    });

    socket.on('user-audio-status', ({ userId: remoteId, active }) => {
      if (remoteId !== userId) setRemoteAudioActive(active);
      logEvent('audio-status', { userId: remoteId, active });
    });

    // 🔥 ОБРАБОТЧИК ОБНОВЛЕНИЯ КОДА
    socket.on('code-update', (newCode) => {
      console.log('📥 Received code update from server');
      
      // 🔥 ПРОВЕРЯЕМ, ЧТО ЭТО НЕ НАШЕ СОБСТВЕННОЕ ИЗМЕНЕНИЕ
      const timeSinceLastUpdate = Date.now() - lastCodeUpdateRef.current;
      if (timeSinceLastUpdate > 50) {
        console.log('🔄 Applying remote code update');
        setCode(newCode);
      } else {
        console.log('⏸️ Skipping code update (too recent local change)');
      }
    });

    // 🔥 ОБРАБОТЧИК СМЕНЫ ЯЗЫКА ОТ СЕРВЕРА
    socket.on('language-changed', (data) => {
      console.log(`🌍 Language changed to: ${data.language}`);
      setCurrentLanguage(data.language);
      if (data.code) {
        setCode(data.code);
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
      console.log('📝 Student edit permission:', canEdit);
      setStudentCanEdit(canEdit);
      
      // 🔥 ОБНОВЛЯЕМ РЕДАКТОР ДЛЯ УЧЕНИКА
      if (editorRef.current && !isMentor) {
        editorRef.current.updateOptions({ readOnly: !canEdit });
      }
    });

    // 🔥 ОБРАБОТЧИК ИЗМЕНЕНИЙ ОТ УЧЕНИКА (ДЛЯ МЕНТОРА)
    socket.on('student-code-change', ({ code: newCode, studentId }) => {
      if (isMentor) {
        console.log(`📝 Student ${studentId} changed code, updating mentor view`);
        // 🔥 МЕНТОР ВИДЕТ ИЗМЕНЕНИЯ УЧЕНИКА
        setCode(newCode);
        lastCodeUpdateRef.current = Date.now();
      }
    });

    return socket;
  }, [sessionId, userId, logEvent, isMentor]);

  // 🔥 ИСПРАВЛЕННЫЙ useEffect ДЛЯ ПОДКЛЮЧЕНИЯ
  useEffect(() => {
    // Подключаемся только при первоначальном монтировании
    if (isInitialMountRef.current) {
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
            setAiHints((prev) => [
              ...prev,
              {
                id: Date.now(),
                text: hint,
                time: new Date().toLocaleTimeString(),
                language: currentLanguage
              },
            ]);
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
      console.log('🧹 Cleaning up component');
      if (aiInterval) clearInterval(aiInterval);
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
    };
  }, [sessionId, isMentor, code, connectSocket, currentLanguage]);

  // 🔥 ОТДЕЛЬНЫЙ useEffect ДЛЯ ОЧИСТКИ СОЕДИНЕНИЯ
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up socket connection on unmount');
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
    const data = {
      sessionId,
      code,
      aiHints,
      studentEditEnabled: studentCanEdit,
      language: currentLanguage,
      exportedAt: new Date().toISOString(),
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

  // 🔥 КНОПКА ПЕРЕПОДКЛЮЧЕНИЯ
  const handleReconnect = () => {
    console.log('🔄 Manual reconnection requested');
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    connectSocket();
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
          <div style={{
            padding: '4px 8px',
            borderRadius: '4px',
            background: isConnected ? '#10b981' : '#ef4444',
            color: 'white',
            fontSize: '12px',
            fontWeight: '500',
            cursor: !isConnected ? 'pointer' : 'default'
          }} onClick={!isConnected ? handleReconnect : undefined}>
            {isConnected ? '✅ В сети' : '🔄 Переподключиться'}
          </div>

          {/* 🔥 СЕЛЕКТОР ЯЗЫКА ПРОГРАММИРОВАНИЯ */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: '#374151',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                minWidth: '160px',
                justifyContent: 'space-between'
              }}
              title="Change programming language"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>
                  {SUPPORTED_LANGUAGES[currentLanguage]?.icon}
                </span>
                <span>
                  {SUPPORTED_LANGUAGES[currentLanguage]?.name}
                </span>
              </span>
              <span style={{ fontSize: '12px', opacity: 0.7 }}>▼</span>
            </button>

            {/* Выпадающий список языков */}
            {showLanguageSelector && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '6px',
                marginTop: '4px',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 3000,
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
              }}>
                {Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => (
                  <button
                    key={key}
                    onClick={() => changeLanguage(key)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: currentLanguage === key ? '#3b82f6' : 'transparent',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                      textAlign: 'left',
                      transition: 'background 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{lang.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>{lang.name}</div>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>{key}</div>
                    </div>
                    {currentLanguage === key && (
                      <span style={{ 
                        fontSize: '12px',
                        background: 'rgba(255,255,255,0.2)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

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
              minWidth: '80px'
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
                {studentCanEdit ? '🔒 Заблокировать ученика' : '✏️ Разрешить ученику'}
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
                🔄 Синхронизировать
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
              >
                📥 Скачать
              </button>

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
                🧠 AI ({aiHints.length})
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
              fontWeight: '500'
            }}>
              {studentCanEdit ? '✏️ Редактирование разрешено' : '🔒 Только просмотр'}
            </div>
          )}
        </div>

        {/* Правая кнопка "Выйти" */}
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
          Выйти
        </button>
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
            fontWeight: '500'
          }}
        >
          🎧 Партнёр говорит
        </div>
      )}

      {/* Панель AI (если открыта) */}
      {isMentor && showAIPanel && (
        <div
          style={{
            position: 'absolute',
            top: 70,
            right: 20,
            width: 350,
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '12px',
            zIndex: 2000,
            maxHeight: '40vh',
            overflowY: 'auto',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <h4 style={{ margin: 0, color: '#60a5fa' }}>
              🧠 AI Assistant ({SUPPORTED_LANGUAGES[currentLanguage]?.icon})
            </h4>
            <button
              onClick={() => setShowAIPanel(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {aiHints.slice(-5).map((hint) => (
              <div
                key={hint.id}
                style={{
                  padding: '8px',
                  background: '#374151',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#e5e7eb',
                }}
              >
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#9ca3af', 
                  marginBottom: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{hint.time}</span>
                  <span style={{
                    padding: '2px 6px',
                    background: '#1f2937',
                    borderRadius: '4px',
                    fontSize: '0.7rem'
                  }}>
                    {SUPPORTED_LANGUAGES[hint.language]?.icon} {hint.language}
                  </span>
                </div>
                {hint.text}
              </div>
            ))}
            {aiHints.length === 0 && (
              <div style={{ padding: '8px', color: '#9ca3af', textAlign: 'center' }}>
                Пока нет подсказок от AI
              </div>
            )}
          </div>
        </div>
      )}

      {/* Редактор кода */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Editor
          height="100%"
          language={SUPPORTED_LANGUAGES[currentLanguage]?.monacoLanguage || 'javascript'}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme={document.body.classList.contains('dark') ? 'vs-dark' : 'vs-light'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            // 🔥 ИСПРАВЛЕННАЯ ЛОГИКА: МЕНТОР ВСЕГДА МОЖЕТ РЕДАКТИРОВАТЬ
            readOnly: !isMentor && !studentCanEdit,
            wordWrap: 'on',
            lineNumbers: 'on',
            folding: true,
            lineDecorationsWidth: 10,
            automaticLayout: true
          }}
        />

        {/* Курсоры партнёров */}
        {Object.entries(remoteCursors).map(([id, pos]) => (
          <div
            key={id}
            style={{
              position: 'absolute',
              left: 20,
              top: (pos.lineNumber * 20) + 80,
              background: '#ef4444',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '12px',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          >
            👤 {id.substring(0, 6)}
          </div>
        ))}
      </div>
    </div>
  );
}