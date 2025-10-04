// client/src/EditorMirror.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const SOCKET_SERVER = 'https://mentor-live-production.up.railway.app';

// 🧠 Эмуляция AI-анализа
const mockGPTAnalysis = (code, hotSpots) => {
  const recentHotSpots = hotSpots.filter(h => Date.now() - h.timestamp < 30000);
  
  if (recentHotSpots.length === 0) return null;

  if (recentHotSpots.some(h => h.line > 0 && code.includes('for'))) {
    return "Ученик часто возвращается к циклу for. Объясните, как работает итерация.";
  }
  if (code.includes('function')) {
    return "Обнаружена функция. Ученик может не понимать замыкания или область видимости.";
  }
  if (code.includes('console.log') && recentHotSpots.length > 2) {
    return "Ученик активно использует console.log. Покажите, как пользоваться точками останова в DevTools.";
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
  
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const hotSpotsRef = useRef([]);
  const cursorTimeoutRef = useRef(null);

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
    if (socketRef.current) {
      socketRef.current.emit('toggle-student-edit', { 
        sessionId, 
        allowEdit: newPermission 
      });
    }
  }, [studentCanEdit, sessionId]);

  // 🔥 ОБНОВЛЕННЫЙ ОБРАБОТЧИК ИЗМЕНЕНИЙ КОДА
  const handleEditorChange = useCallback((value) => {
    if (!value) return;
    
    setCode(value);
    
    // 🔥 МЕНТОР ВСЕГДА ОТПРАВЛЯЕТ ИЗМЕНЕНИЯ
    if (isMentor) {
      socketRef.current?.emit('code-change', { sessionId, code: value });
    } 
    // 🔥 УЧЕНИК ТОЛЬКО С РАЗРЕШЕНИЯ
    else if (studentCanEdit) {
      socketRef.current?.emit('student-code-change', { 
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
      socketRef.current?.emit('cursor-move', {
        sessionId,
        position: e.position,
        userId,
      });
      logEvent('cursor-move', { position: e.position, userId });
    }, 100);
  }, [sessionId, userId, logEvent]);

  // 🔥 ЗАПРОС СИНХРОНИЗАЦИИ ПРИ ПОДКЛЮЧЕНИИ
  const requestSync = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('request-sync', { sessionId });
    }
  }, [sessionId]);

  // Подключение к сокету и WebRTC
  useEffect(() => {
    const socket = io(SOCKET_SERVER, {
      timeout: 10000,
      reconnectionAttempts: 5,
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
      socket.emit('join-session', sessionId);
      
      // Запрашиваем синхронизацию после подключения
      setTimeout(requestSync, 500);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    });

    socket.on('reconnect', () => {
      console.log('🔄 Reconnected to server');
      setIsConnected(true);
      socket.emit('join-session', sessionId);
      requestSync();
    });

    socket.on('signal', (data) => {
      if (peerRef.current) peerRef.current.signal(data.signal);
    });

    socket.on('user-audio-status', ({ userId: remoteId, active }) => {
      if (remoteId !== userId) setRemoteAudioActive(active);
      logEvent('audio-status', { userId: remoteId, active });
    });

    socket.on('code-update', (newCode) => {
      console.log('📥 Received code update');
      if (!isMentor) {
        setCode(newCode);
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
    });

    // 🔥 ОБРАБОТЧИК ИЗМЕНЕНИЙ ОТ УЧЕНИКА
    socket.on('student-code-change', ({ code: newCode, studentId }) => {
      if (isMentor) {
        console.log(`📝 Student ${studentId} changed code`);
        setCode(newCode);
      }
    });

    // AI-аналитика каждые 15 сек (только для ментора)
    let aiInterval;
    if (isMentor) {
      aiInterval = setInterval(() => {
        if (hotSpotsRef.current.length > 0) {
          const hint = mockGPTAnalysis(code, hotSpotsRef.current);
          if (hint) {
            setAiHints((prev) => [
              ...prev,
              {
                id: Date.now(),
                text: hint,
                time: new Date().toLocaleTimeString(),
              },
            ]);
            setShowAIPanel(true);
            
            // Отправляем AI-подсказку на сервер
            socket.emit('ai-hint-generated', {
              sessionId,
              hint: hint,
              confidence: 0.8
            });
          }
        }
      }, 15000);
    }

    return () => {
      console.log('🧹 Cleaning up socket connection');
      socket.disconnect();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (aiInterval) clearInterval(aiInterval);
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
    };
  }, [sessionId, isMentor, userId, logEvent, requestSync]);

  // 🔥 СИНХРОНИЗАЦИЯ РЕДАКТОРА ТОЛЬКО ДЛЯ УЧЕНИКА
  useEffect(() => {
    if (editorRef.current && !isMentor) {
      editorRef.current.updateOptions({ readOnly: !studentCanEdit });
    }
  }, [studentCanEdit, isMentor]);

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
            socketRef.current?.emit('signal', { sessionId, signal: data });
          });

          peerRef.current.on('stream', (remoteStream) => {
            const audio = new Audio();
            audio.srcObject = remoteStream;
            audio.play().catch(console.error);
          });
        }

        setIsMicOn(true);
        socketRef.current?.emit('user-audio-status', {
          sessionId,
          active: true,
          userId,
        });
      } catch (err) {
        console.error('Ошибка микрофона:', err);
        alert('Не удалось получить доступ к микрофону');
      }
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      setIsMicOn(false);
      socketRef.current?.emit('user-audio-status', {
        sessionId,
        active: false,
        userId,
      });
    }
  };

  // Настройка редактора
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    
    // 🔥 МЕНТОР ВСЕГДА МОЖЕТ РЕДАКТИРОВАТЬ, УЧЕНИК - ТОЛЬКО С РАЗРЕШЕНИЯ
    if (!isMentor) {
      editor.updateOptions({ readOnly: !studentCanEdit });
    }
    
    editor.onDidChangeCursorPosition(handleCursorMove);
  };

  // Скачивание сессии
  const downloadSession = () => {
    const data = {
      sessionId,
      code,
      aiHints,
      studentEditEnabled: studentCanEdit,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codemirror-session-${sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            fontWeight: '500'
          }}>
            {isConnected ? '✅ В сети' : '❌ Отключен'}
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
                title={studentCanEdit ? "Заблокировать редактирование для ученика" : "Разрешить редактирование для ученика"}
              >
                {studentCanEdit ? '🔒 Заблокировать ученика' : '✏️ Разрешить ученику'}
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
            width: 300,
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
            <h4 style={{ margin: 0, color: '#60a5fa' }}>🧠 AI Mentor</h4>
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
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '4px' }}>
                  {hint.time}
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
          defaultLanguage="javascript"
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme={document.body.classList.contains('dark') ? 'vs-dark' : 'vs-light'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            // 🔥 МЕНТОР ВСЕГДА МОЖЕТ РЕДАКТИРОВАТЬ, УЧЕНИК - ТОЛЬКО С РАЗРЕШЕНИЯ
            readOnly: !isMentor && !studentCanEdit,
            wordWrap: 'on',
            lineNumbers: 'on',
            folding: true,
            lineDecorationsWidth: 10,
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