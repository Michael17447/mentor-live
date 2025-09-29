// client/src/App.jsx
import React, { useState } from 'react';
import EditorMirror from './EditorMirror.jsx';
import { useTheme } from './ThemeContext.jsx';

export default function App() {
  const [sessionId, setSessionId] = useState('');
  const [isMentor, setIsMentor] = useState(false);
  const [joined, setJoined] = useState(false);
  const [userId] = useState(Math.random().toString(36).substring(2, 8));
  const { theme, toggleTheme } = useTheme();

  const createSession = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSessionId(id);
    setIsMentor(true);
    setJoined(true);
  };

  const joinSession = () => {
    if (sessionId.trim()) {
      setIsMentor(false);
      setJoined(true);
    }
  };

  if (!joined) {
    return (
      <div className="App" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <h1>🪞 CodeMirror</h1>
        <button onClick={createSession} style={{ margin: '10px', padding: '10px 20px', background: 'var(--btn)', color: 'white' }}>
          Создать сессию (ментор)
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            value={sessionId}
            onChange={e => setSessionId(e.target.value.toUpperCase())}
            placeholder="Код сессии"
            style={{ padding: '10px', minWidth: '200px' }}
          />
          <button onClick={joinSession} style={{ padding: '10px 20px', background: 'var(--btn-success)', color: 'white' }}>
            Присоединиться
          </button>
        </div>
        <button onClick={toggleTheme} style={{ marginTop: '20px', background: 'var(--border)', color: 'var(--text)' }}>
          {theme === 'dark' ? '🌙 Тёмная' : '☀️ Светлая'}
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <span>Сессия: {sessionId} | {isMentor ? 'ментор' : 'ученик'}</span>
        <div>
          <button onClick={toggleTheme} style={{ marginRight: '10px', background: 'var(--border)', color: 'var(--text)' }}>
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button onClick={() => setJoined(false)} style={{ background: 'var(--btn-danger)', color: 'white' }}>
            Выйти
          </button>
        </div>
      </div>
      <EditorMirror sessionId={sessionId} isMentor={isMentor} userId={userId} />
    </div>
  );
}