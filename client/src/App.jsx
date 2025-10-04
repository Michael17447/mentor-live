// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import EditorMirror from './EditorMirror.jsx';
import CreateSessionWizard from './components/CreateSessionWizard.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';
import { SUPPORTED_LANGUAGES, LANGUAGE_CATEGORIES } from './languages.js';

// Главная страница
function HomePage({ onCreateSession, onJoinSession, stats, recentSessions, onReconnectSession, onRemoveRecentSession }) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <header style={{
          textAlign: 'center',
          padding: '40px 0',
          color: 'white'
        }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span>💻</span>
            <h1 style={{ 
              margin: 0, 
              fontSize: '48px',
              background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontWeight: 'bold'
            }}>
              CodeMentor Live
            </h1>
            <span>🚀</span>
          </div>
          <p style={{ 
            fontSize: '20px', 
            color: 'rgba(255,255,255,0.8)',
            maxWidth: '600px',
            margin: '0 auto 30px',
            lineHeight: '1.5'
          }}>
            Real-time collaborative code editor with AI assistance. 
            Teach, interview, or code together in 16+ programming languages.
          </p>

          {/* Статистика сервера */}
          {stats && (
            <div style={{
              display: 'inline-flex',
              gap: '20px',
              background: 'rgba(255,255,255,0.1)',
              padding: '12px 24px',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#60a5fa' }}>
                  {stats.totalSessions || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Active Sessions</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#34d399' }}>
                  {stats.totalUsers || 0}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Connected Users</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {Object.keys(SUPPORTED_LANGUAGES).length}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Languages</div>
              </div>
            </div>
          )}
        </header>

        {/* Основные действия */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {/* Создание сессии */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🏫</div>
            <h2 style={{ color: '#1f2937', marginBottom: '12px' }}>Create Session</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
              Start a new coding session as a mentor. Choose from 16+ programming languages, 
              set up the environment, and invite students to join.
            </p>
            <button
              onClick={onCreateSession}
              style={{
                background: 'linear-gradient(45deg, #3b82f6, #6366f1)',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Create New Session
            </button>
          </div>

          {/* Присоединение к сессии */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <h2 style={{ color: '#1f2937', marginBottom: '12px' }}>Join Session</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
              Join an existing coding session as a student or co-mentor. 
              Enter the session ID provided by your mentor to start collaborating.
            </p>
            <button
              onClick={onJoinSession}
              style={{
                background: 'linear-gradient(45deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Join Existing Session
            </button>
          </div>
        </div>

        {/* Быстрый старт и недавние сессии */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '30px'
        }}>
          {/* Быстрый старт с языками */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ color: '#1f2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              ⚡ Quick Start
              <span style={{ 
                fontSize: '12px', 
                background: '#f3f4f6', 
                color: '#6b7280',
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                Popular Languages
              </span>
            </h2>
            
            {/* Категории языков */}
            {Object.entries(LANGUAGE_CATEGORIES).filter(([key]) => key !== 'all').map(([category, languages]) => (
              <div key={category} style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  color: '#374151', 
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>
                    {category === 'web' && '🌐'}
                    {category === 'backend' && '⚙️'}
                    {category === 'mobile' && '📱'}
                    {category === 'data' && '📊'}
                    {category === 'markup' && '📝'}
                  </span>
                  {category}
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '10px',
                  marginBottom: '15px'
                }}>
                  {languages.map(langKey => {
                    const lang = SUPPORTED_LANGUAGES[langKey];
                    return (
                      <button
                        key={langKey}
                        onClick={() => window.location.href = `/session/${Math.random().toString(36).substring(2, 10).toUpperCase()}?language=${langKey}&role=mentor`}
                        style={{
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          padding: '12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = '#f8fafc';
                          e.target.style.borderColor = '#3b82f6';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = 'white';
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>{lang.icon}</span>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{lang.name}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{langKey}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Недавние сессии и информация */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Недавние сессии */}
            {recentSessions.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.95)',
                padding: '25px',
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
              }}>
                <h3 style={{ color: '#1f2937', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📚 Recent Sessions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentSessions.map((session, index) => (
                    <div
                      key={session.id}
                      onClick={() => onReconnectSession(session)}
                      style={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = '#f8fafc';
                        e.target.style.borderColor = '#3b82f6';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.borderColor = '#e5e7eb';
                      }}
                    >
                      <button
                        onClick={(e) => onRemoveRecentSession(session.id, e)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'none',
                          border: 'none',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '4px'
                        }}
                        title="Remove from history"
                      >
                        ✕
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '16px' }}>
                          {SUPPORTED_LANGUAGES[session.language]?.icon}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{session.id}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {SUPPORTED_LANGUAGES[session.language]?.name} • {session.role}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                        {new Date(session.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Информация о функциях */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              padding: '25px',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ color: '#1f2937', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🌟 Features
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Real-time collaboration</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>16+ programming languages</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Voice communication</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>AI-powered insights</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Code snippets & templates</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          padding: '40px 0',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '14px',
          marginTop: '40px'
        }}>
          <p>CodeMentor Live • Real-time Collaborative Coding Platform</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>
            Support for {Object.keys(SUPPORTED_LANGUAGES).length} programming languages • 
            Built for education and technical interviews
          </p>
        </footer>
      </div>
    </div>
  );
}

// Страница создания сессии
function CreateSessionPage({ onBack }) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          padding: '20px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onBack}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ← Back to Home
            </button>
            <h1 style={{ color: 'white', margin: 0, fontSize: '28px' }}>
              Create New Session
            </h1>
          </div>
        </div>

        {/* Wizard */}
        <CreateSessionWizard />
      </div>
    </div>
  );
}

// Компонент сессии
function SessionPage() {
  const { sessionId } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const language = urlParams.get('language') || 'javascript';
  const role = urlParams.get('role') || 'student';
  
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  return (
    <EditorMirror 
      sessionId={sessionId} 
      isMentor={role === 'mentor'} 
      userId={'user_' + Math.random().toString(36).substr(2, 9)} 
      initialLanguage={language}
    />
  );
}

// Join Modal Component
function JoinModal({ isOpen, onClose, onJoin, sessionId, setSessionId, language, setLanguage, role, setRole }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Join Session</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
            Session ID
          </label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value.toUpperCase())}
            placeholder="Enter session ID (e.g., A1B2C3D4)"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px',
              textTransform: 'uppercase'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
            Programming Language
          </label>
          <LanguageSelector
            onLanguageSelect={setLanguage}
            selectedLanguage={language}
            compact={true}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
            Join As
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setRole('mentor')}
              style={{
                flex: 1,
                padding: '10px',
                background: role === 'mentor' ? '#3b82f6' : '#f3f4f6',
                color: role === 'mentor' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: role === 'mentor' ? 'bold' : 'normal'
              }}
            >
              👨‍🏫 Mentor
            </button>
            <button
              onClick={() => setRole('student')}
              style={{
                flex: 1,
                padding: '10px',
                background: role === 'student' ? '#10b981' : '#f3f4f6',
                color: role === 'student' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: role === 'student' ? 'bold' : 'normal'
              }}
            >
              👨‍🎓 Student
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onJoin}
            style={{
              flex: 1,
              padding: '12px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Join Session
          </button>
        </div>
      </div>
    </div>
  );
}

// Основной компонент App с маршрутизацией
function App() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinSessionId, setJoinSessionId] = useState('');
  const [joinLanguage, setJoinLanguage] = useState('javascript');
  const [joinRole, setJoinRole] = useState('student');
  const [recentSessions, setRecentSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  // Загрузка данных при монтировании
  useEffect(() => {
    // Загрузка недавних сессий из localStorage
    const savedSessions = localStorage.getItem('recentSessions');
    if (savedSessions) {
      setRecentSessions(JSON.parse(savedSessions));
    }

    // Загрузка статистики сервера
    fetchServerStats();
  }, []);

  const fetchServerStats = async () => {
    try {
      const response = await fetch('https://mentor-live-production.up.railway.app/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch server stats:', error);
    }
  };

  const createNewSession = () => {
    navigate('/create');
  };

  const joinExistingSession = () => {
    setShowJoinModal(true);
  };

  const handleJoinSession = () => {
    if (!joinSessionId.trim()) {
      alert('Please enter a session ID');
      return;
    }

    // Сохраняем сессию в историю
    const newSession = {
      id: joinSessionId,
      language: joinLanguage,
      role: joinRole,
      joinedAt: new Date().toISOString()
    };

    const updatedSessions = [newSession, ...recentSessions.filter(s => s.id !== joinSessionId)].slice(0, 5);
    setRecentSessions(updatedSessions);
    localStorage.setItem('recentSessions', JSON.stringify(updatedSessions));

    // Переходим в сессию
    navigate(`/session/${joinSessionId}?language=${joinLanguage}&role=${joinRole}`);
    setShowJoinModal(false);
  };

  const reconnectToSession = (session) => {
    navigate(`/session/${session.id}?language=${session.language}&role=${session.role}`);
  };

  const removeRecentSession = (sessionId, e) => {
    e.stopPropagation();
    const updatedSessions = recentSessions.filter(s => s.id !== sessionId);
    setRecentSessions(updatedSessions);
    localStorage.setItem('recentSessions', JSON.stringify(updatedSessions));
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <>
      <Routes>
        <Route path="/" element={
          <HomePage
            onCreateSession={createNewSession}
            onJoinSession={joinExistingSession}
            stats={stats}
            recentSessions={recentSessions}
            onReconnectSession={reconnectToSession}
            onRemoveRecentSession={removeRecentSession}
          />
        } />
        <Route path="/create" element={
          <CreateSessionPage onBack={goHome} />
        } />
        <Route path="/session/:sessionId" element={<SessionPage />} />
      </Routes>

      <JoinModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={handleJoinSession}
        sessionId={joinSessionId}
        setSessionId={setJoinSessionId}
        language={joinLanguage}
        setLanguage={setJoinLanguage}
        role={joinRole}
        setRole={setJoinRole}
      />
    </>
  );
}

// Обертка с Router
export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}