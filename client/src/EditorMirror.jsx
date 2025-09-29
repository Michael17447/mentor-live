// client/src/EditorMirror.jsx
import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const SOCKET_SERVER = 'http://localhost:4000';

// 🧠 Эмуляция AI-анализа (заменить на OpenAI API позже)
const mockGPTAnalysis = (code, hotSpots) => {
  if (hotSpots.some(h => h.line > 0 && code.includes('for'))) {
    return "Ученик часто возвращается к циклу for. Объясните, как работает итерация.";
  }
  if (code.includes('function')) {
    return "Обнаружена функция. Ученик может не понимать замыкания или область видимости.";
  }
  if (code.includes('console.log') && hotSpots.length > 2) {
    return "Ученик активно использует console.log. Покажите, как пользоваться точками останова в DevTools.";
  }
  return "Продолжайте — ученик внимателен!";
};

export default function EditorMirror({ sessionId, isMentor, userId }) {
  const { sessionId, isMentor, userId, embedMode = false } = props;
  const [code, setCode] = useState('// Начните писать код...\n');
  const [remoteCursors, setRemoteCursors] = useState({});
  const [isMicOn, setIsMicOn] = useState(false);
  const [remoteAudioActive, setRemoteAudioActive] = useState(false);
  const [aiHints, setAiHints] = useState([]);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const hotSpotsRef = useRef([]);

  // Логирование событий (для AI)
  const logEvent = (type, data) => {
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
  };

  // Подключение к сокету и WebRTC
  useEffect(() => {
    const socket = io(SOCKET_SERVER);
    socketRef.current = socket;
    socket.emit('join-session', sessionId);

    socket.on('signal', (data) => {
      if (peerRef.current) peerRef.current.signal(data.signal);
    });

    socket.on('user-audio-status', ({ userId: remoteId, active }) => {
      if (remoteId !== userId) setRemoteAudioActive(active);
      logEvent('audio-status', { userId: remoteId, active });
    });

    socket.on('code-update', (newCode) => {
      if (!isMentor) setCode(newCode);
    });

    socket.on('cursor-update', (data) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [data.userId]: data.position,
      }));
      logEvent('cursor-update', data);
    });

    // AI-аналитика каждые 15 сек (только для ментора)
    let aiInterval;
    if (isMentor) {
      aiInterval = setInterval(() => {
        if (hotSpotsRef.current.length > 0) {
          const hint = mockGPTAnalysis(code, hotSpotsRef.current);
          setAiHints((prev) => [
            ...prev,
            {
              id: Date.now(),
              text: hint,
              time: new Date().toLocaleTimeString(),
            },
          ]);
          setShowAIPanel(true);
        }
      }, 15000);
    }

    return () => {
      socket.disconnect();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (aiInterval) clearInterval(aiInterval);
    };
  }, [sessionId, isMentor, userId, code]);

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
            socketRef.current.emit('signal', { sessionId, signal: data });
          });

          peerRef.current.on('stream', (remoteStream) => {
            const audio = new Audio();
            audio.srcObject = remoteStream;
            audio.play().catch(console.error);
          });
        }

        setIsMicOn(true);
        socketRef.current.emit('user-audio-status', {
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
      socketRef.current.emit('user-audio-status', {
        sessionId,
        active: false,
        userId,
      });
    }
  };

  // Обработка изменений кода
  const handleEditorChange = (value) => {
    if (isMentor) {
      setCode(value);
      socketRef.current.emit('code-change', { sessionId, code: value });
    }
  };

  // Настройка редактора
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    if (!isMentor) {
      editor.updateOptions({ readOnly: true });
    }
    editor.onDidChangeCursorPosition((e) => {
      if (isMentor) {
        socketRef.current.emit('cursor-move', {
          sessionId,
          position: e.position,
          userId,
        });
        logEvent('cursor-move', { position: e.position, userId });
      }
    });
  };

  // Скачивание сессии
  const downloadSession = () => {
    const data = {
      sessionId,
      aiHints,
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
    <div style={{ height: 'calc(100vh - 60px)', position: 'relative' }}>
      {/* Панель AI (если открыта) */}
      {isMentor && showAIPanel && (
        <div
          style={{
            position: 'absolute',
            top: 50,
            left: 10,
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
            {aiHints.slice(-3).map((hint) => (
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
          </div>
        </div>
      )}

      {/* Основная панель кнопок */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 2000,
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <button
          onClick={toggleMicrophone}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: isMicOn ? 'var(--btn-danger)' : 'var(--btn-secondary)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.85rem',
          }}
        >
          🎙️ {isMicOn ? 'Выкл' : 'Вкл'}
        </button>

        {isMentor && (
          <>
            <button
              onClick={downloadSession}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: 'var(--btn-primary)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.85rem',
              }}
            >
              📥 Скачать
            </button>

            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: aiHints.length > 0 ? '#8b5cf6' : 'var(--btn-secondary)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.85rem',
              }}
            >
              🧠 AI ({aiHints.length})
            </button>
          </>
        )}

        {/* Кнопка "Выйти" — справа */}
        <button
          onClick={() => {
            /* Передаётся из App.jsx */
          }}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: 'var(--btn-danger)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.85rem',
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
            top: 10,
            left: 50,
            background: 'var(--btn-success)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '20px',
            zIndex: 2000,
          }}
        >
          🎧 Партнёр говорит
        </div>
      )}

      {/* Редактор кода */}
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
          👤 {id}
        </div>
      ))}
    </div>
  );
}