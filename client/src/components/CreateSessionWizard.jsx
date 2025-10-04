// client/src/components/CreateSessionWizard.jsx
import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES, LANGUAGE_CATEGORIES } from '../languages.js';

const CreateSessionWizard = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [sessionType, setSessionType] = useState('mentoring');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 🔥 ИСПРАВЛЕННАЯ ФУНКЦИЯ СОЗДАНИЯ СЕССИИ
  const createSession = async () => {
    setIsCreating(true);
    try {
      console.log('🔄 Creating session with language:', selectedLanguage);
      
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: selectedLanguage,
          sessionType: sessionType
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Session created:', data);
      
      if (data.session_id) {
        // Редирект на сессию
        window.location.href = `/session/${data.session_id}?language=${selectedLanguage}&role=mentor`;
      } else {
        throw new Error('No session ID in response');
      }
    } catch (error) {
      console.error('❌ Session creation failed:', error);
      alert('Не удалось создать сессию через сервер. Используем локальное создание...');
      
      // 🔥 FALLBACK: создаем сессию локально
      const fallbackSessionId = Math.random().toString(36).substring(2, 10).toUpperCase();
      window.location.href = `/session/${fallbackSessionId}?language=${selectedLanguage}&role=mentor`;
    } finally {
      setIsCreating(false);
    }
  };

  // Функция для быстрого создания сессии (без сервера)
  const quickCreateSession = () => {
    const sessionId = Math.random().toString(36).substring(2, 10).toUpperCase();
    window.location.href = `/session/${sessionId}?language=${selectedLanguage}&role=mentor`;
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2 style={{ 
        color: '#1f2937', 
        marginBottom: '30px',
        textAlign: 'center',
        fontSize: '28px'
      }}>
        🚀 Create New Coding Session
      </h2>

      {/* Шаг 1: Выбор типа сессии */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '18px' }}>
          1. Session Type
        </h3>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={() => setSessionType('mentoring')}
            style={{
              flex: 1,
              padding: '20px',
              background: sessionType === 'mentoring' ? '#3b82f6' : '#f3f4f6',
              color: sessionType === 'mentoring' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: sessionType === 'mentoring' ? 'bold' : 'normal',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
          >
            👨‍🏫 Mentoring
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '8px' }}>
              Teach programming concepts
            </div>
          </button>
          <button
            onClick={() => setSessionType('interview')}
            style={{
              flex: 1,
              padding: '20px',
              background: sessionType === 'interview' ? '#f59e0b' : '#f3f4f6',
              color: sessionType === 'interview' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: sessionType === 'interview' ? 'bold' : 'normal',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
          >
            💼 Technical Interview
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '8px' }}>
              Code review and assessment
            </div>
          </button>
          <button
            onClick={() => setSessionType('collaboration')}
            style={{
              flex: 1,
              padding: '20px',
              background: sessionType === 'collaboration' ? '#10b981' : '#f3f4f6',
              color: sessionType === 'collaboration' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: sessionType === 'collaboration' ? 'bold' : 'normal',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
          >
            👥 Pair Programming
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '8px' }}>
              Collaborative coding
            </div>
          </button>
        </div>
      </div>

      {/* Шаг 2: Выбор языка программирования */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ color: '#374151', marginBottom: '20px', fontSize: '18px' }}>
          2. Programming Language
        </h3>
        
        {/* Категории языков */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            overflowX: 'auto',
            paddingBottom: '10px',
            marginBottom: '20px'
          }}>
            {Object.entries(LANGUAGE_CATEGORIES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                style={{
                  padding: '8px 16px',
                  background: selectedCategory === key ? '#3b82f6' : '#f3f4f6',
                  color: selectedCategory === key ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {key === 'all' ? '🌍 All Languages' : 
                 key === 'web' ? '🌐 Web Development' :
                 key === 'backend' ? '⚙️ Backend' :
                 key === 'mobile' ? '📱 Mobile' :
                 key === 'data' ? '📊 Data & Formats' : '📝 Markup'}
              </button>
            ))}
          </div>
        </div>

        {/* Сетка языков с фильтрацией */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '15px',
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '10px'
        }}>
          {Object.entries(SUPPORTED_LANGUAGES)
            .filter(([key]) => selectedCategory === 'all' || LANGUAGE_CATEGORIES[selectedCategory]?.includes(key))
            .map(([key, lang]) => (
              <button
                key={key}
                onClick={() => setSelectedLanguage(key)}
                style={{
                  padding: '20px',
                  background: selectedLanguage === key ? '#3b82f6' : 'white',
                  border: selectedLanguage === key ? '2px solid #2563eb' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  color: selectedLanguage === key ? 'white' : '#374151',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
                onMouseOver={(e) => {
                  if (selectedLanguage !== key) {
                    e.target.style.background = '#f8fafc';
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedLanguage !== key) {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{lang.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{lang.name}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>{lang.extension}</div>
                  </div>
                </div>
                
                {selectedLanguage === key && (
                  <div style={{
                    fontSize: '12px',
                    background: 'rgba(255,255,255,0.2)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    alignSelf: 'flex-start'
                  }}>
                    ✅ Selected
                  </div>
                )}
              </button>
            ))
          }
        </div>
      </div>

      {/* Шаг 3: Предпросмотр и создание */}
      <div style={{
        background: '#f8fafc',
        padding: '25px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '18px' }}>
          3. Session Preview
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <strong style={{ display: 'block', marginBottom: '5px' }}>Type:</strong> 
            <span style={{ 
              background: sessionType === 'mentoring' ? '#dbeafe' : 
                         sessionType === 'interview' ? '#fef3c7' : '#d1fae5',
              color: sessionType === 'mentoring' ? '#1e40af' : 
                    sessionType === 'interview' ? '#92400e' : '#065f46',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              display: 'inline-block',
              width: '100%',
              textAlign: 'center'
            }}>
              {sessionType === 'mentoring' ? '👨‍🏫 Mentoring' : 
               sessionType === 'interview' ? '💼 Technical Interview' : '👥 Pair Programming'}
            </span>
          </div>
          
          <div>
            <strong style={{ display: 'block', marginBottom: '5px' }}>Language:</strong> 
            <span style={{ 
              background: '#e0e7ff',
              color: '#3730a3',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center',
              width: '100%'
            }}>
              {SUPPORTED_LANGUAGES[selectedLanguage]?.icon}
              {SUPPORTED_LANGUAGES[selectedLanguage]?.name}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <strong style={{ display: 'block', marginBottom: '8px' }}>Default Code:</strong>
          <div style={{
            background: '#1f2937',
            color: '#e5e7eb',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'monospace',
            maxHeight: '80px',
            overflow: 'auto',
            lineHeight: '1.4'
          }}>
            {SUPPORTED_LANGUAGES[selectedLanguage]?.starterCode.split('\n').slice(0, 3).map((line, index) => (
              <div key={index}>{line}</div>
            ))}
            {SUPPORTED_LANGUAGES[selectedLanguage]?.starterCode.split('\n').length > 3 && (
              <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>...</div>
            )}
          </div>
        </div>

        {/* Кнопки создания */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={quickCreateSession}
            style={{
              flex: 1,
              padding: '16px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 5px 15px rgba(107, 114, 128, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            ⚡ Quick Create
          </button>
          
          <button
            onClick={createSession}
            disabled={isCreating}
            style={{
              flex: 2,
              padding: '16px',
              background: isCreating ? '#9ca3af' : 'linear-gradient(45deg, #3b82f6, #6366f1)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: isCreating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!isCreating) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 20px rgba(59, 130, 246, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (!isCreating) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {isCreating ? (
              <>
                <span style={{ 
                  display: 'inline-block', 
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}>
                  🔄
                </span>
                Creating Session...
              </>
            ) : (
              <>
                🚀 Create Session (with Server)
              </>
            )}
          </button>
        </div>

        <div style={{
          marginTop: '15px',
          padding: '12px',
          background: '#fef3cd',
          border: '1px solid #f59e0b',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#92400e',
          textAlign: 'center'
        }}>
          💡 <strong>Tip:</strong> "Quick Create" works offline, "Create Session" uses server features
        </div>
      </div>

      {/* Стили для анимации */}
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

export default CreateSessionWizard;