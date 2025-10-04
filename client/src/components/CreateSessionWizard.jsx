// client/src/components/CreateSessionWizard.jsx
import React, { useState } from 'react';

const SUPPORTED_LANGUAGES = {
  javascript: {
    name: 'JavaScript',
    extension: '.js',
    icon: '🟨',
    starterCode: `function helloWorld() {\n  console.log("Hello, World!");\n  return "Welcome to CodeCollab!";\n}\n\nhelloWorld();`
  },
  python: {
    name: 'Python',
    extension: '.py',
    icon: '🐍',
    starterCode: `def hello_world():\n    print("Hello, World!")\n    return "Welcome to CodeCollab!"\n\nhello_world()`
  },
  java: {
    name: 'Java',
    extension: '.java',
    icon: '☕',
    starterCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`
  },
  cpp: {
    name: 'C++',
    extension: '.cpp',
    icon: '⚙️',
    starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`
  },
  html: {
    name: 'HTML',
    extension: '.html',
    icon: '🌐',
    starterCode: `<!DOCTYPE html>\n<html>\n<head>\n    <title>Welcome</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>`
  },
  css: {
    name: 'CSS',
    extension: '.css',
    icon: '🎨',
    starterCode: `body {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f0f0f0;\n}`
  }
};

const LANGUAGE_CATEGORIES = {
  all: Object.keys(SUPPORTED_LANGUAGES),
  web: ['javascript', 'html', 'css'],
  backend: ['python', 'java', 'cpp'],
  mobile: ['javascript', 'java'],
  data: ['python'],
  markup: ['html', 'css']
};

const CreateSessionWizard = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [sessionType, setSessionType] = useState('mentoring');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 🔥 ПОЛНОСТЬЮ КЛИЕНТСКАЯ ФУНКЦИЯ - БЕЗ API ВЫЗОВОВ
  const createSession = () => {
    setIsCreating(true);
    
    // Генерируем случайный ID сессии
    const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Сохраняем данные сессии в localStorage
    const sessionData = {
      id: sessionId,
      language: selectedLanguage,
      type: sessionType,
      createdAt: new Date().toISOString(),
      starterCode: SUPPORTED_LANGUAGES[selectedLanguage].starterCode
    };
    
    localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionData));
    
    // Имитируем загрузку для лучшего UX
    setTimeout(() => {
      console.log('✅ Session created locally:', sessionId);
      
      // Редирект на страницу сессии
      window.location.href = `/session/${sessionId}?language=${selectedLanguage}&type=${sessionType}&role=mentor`;
    }, 800);
  };

  return (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      maxWidth: '900px',
      margin: '20px auto',
      border: '1px solid #e1e5e9'
    }}>
      <h2 style={{ 
        color: '#1a1a1a', 
        marginBottom: '25px',
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: '600'
      }}>
        🚀 Создать новую сессию
      </h2>

      {/* Тип сессии */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ color: '#374151', marginBottom: '12px', fontSize: '16px', fontWeight: '500' }}>
          1. Тип сессии
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { id: 'mentoring', label: '👨‍🏫 Обучение', desc: 'Обучение программированию' },
            { id: 'interview', label: '💼 Собеседование', desc: 'Техническое интервью' },
            { id: 'collaboration', label: '👥 Парное программирование', desc: 'Совместная работа' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setSessionType(type.id)}
              style={{
                flex: '1',
                minWidth: '150px',
                padding: '15px',
                background: sessionType === type.id ? 
                  (type.id === 'mentoring' ? '#3b82f6' : 
                   type.id === 'interview' ? '#f59e0b' : '#10b981') : '#f8fafc',
                color: sessionType === type.id ? 'white' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: sessionType === type.id ? '600' : '400',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              <div>{type.label}</div>
              <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                {type.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Выбор языка */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '16px', fontWeight: '500' }}>
          2. Язык программирования
        </h3>
        
        {/* Категории */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            overflowX: 'auto',
            paddingBottom: '8px'
          }}>
            {Object.entries(LANGUAGE_CATEGORIES).map(([key]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                style={{
                  padding: '6px 12px',
                  background: selectedCategory === key ? '#3b82f6' : '#f8fafc',
                  color: selectedCategory === key ? 'white' : '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {key === 'all' ? '🌍 Все' : 
                 key === 'web' ? '🌐 Веб' :
                 key === 'backend' ? '⚙️ Бэкенд' :
                 key === 'mobile' ? '📱 Мобильные' :
                 key === 'data' ? '📊 Данные' : '📝 Разметка'}
              </button>
            ))}
          </div>
        </div>

        {/* Сетка языков */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '12px',
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '8px'
        }}>
          {Object.entries(SUPPORTED_LANGUAGES)
            .filter(([key]) => selectedCategory === 'all' || LANGUAGE_CATEGORIES[selectedCategory]?.includes(key))
            .map(([key, lang]) => (
              <button
                key={key}
                onClick={() => setSelectedLanguage(key)}
                style={{
                  padding: '16px',
                  background: selectedLanguage === key ? '#3b82f6' : 'white',
                  border: selectedLanguage === key ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: selectedLanguage === key ? 'white' : '#374151',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{lang.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{lang.name}</div>
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>{lang.extension}</div>
                  </div>
                </div>
              </button>
            ))
          }
        </div>
      </div>

      {/* Предпросмотр */}
      <div style={{
        background: '#f8fafc',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#374151', marginBottom: '12px', fontSize: '16px', fontWeight: '500' }}>
          3. Предпросмотр сессии
        </h3>
        
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Тип:</strong> 
            <span style={{ 
              background: '#e0e7ff',
              color: '#3730a3',
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '13px',
              display: 'inline-block',
              width: '100%'
            }}>
              {sessionType === 'mentoring' ? '👨‍🏫 Обучение' : 
               sessionType === 'interview' ? '💼 Собеседование' : '👥 Парное программирование'}
            </span>
          </div>
          
          <div style={{ flex: 1, minWidth: '120px' }}>
            <strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>Язык:</strong> 
            <span style={{ 
              background: '#e0e7ff',
              color: '#3730a3',
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              width: '100%'
            }}>
              {SUPPORTED_LANGUAGES[selectedLanguage]?.icon}
              {SUPPORTED_LANGUAGES[selectedLanguage]?.name}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <strong style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Стартовый код:</strong>
          <div style={{
            background: '#1f2937',
            color: '#e5e7eb',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'monospace',
            maxHeight: '60px',
            overflow: 'auto',
            lineHeight: '1.3'
          }}>
            {SUPPORTED_LANGUAGES[selectedLanguage]?.starterCode.split('\n').slice(0, 2).map((line, index) => (
              <div key={index}>{line}</div>
            ))}
            {SUPPORTED_LANGUAGES[selectedLanguage]?.starterCode.split('\n').length > 2 && (
              <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>...</div>
            )}
          </div>
        </div>
      </div>

      {/* Кнопка создания */}
      <button
        onClick={createSession}
        disabled={isCreating}
        style={{
          width: '100%',
          padding: '14px',
          background: isCreating ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: isCreating ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        {isCreating ? (
          <>
            <span style={{ 
              display: 'inline-block', 
              animation: 'spin 1s linear infinite',
              marginRight: '8px'
            }}>
              ⏳
            </span>
            Создание сессии...
          </>
        ) : (
          '🚀 Создать сессию'
        )}
      </button>

      <div style={{
        marginTop: '12px',
        padding: '10px',
        background: '#d1fae5',
        border: '1px solid #10b981',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#065f46',
        textAlign: 'center'
      }}>
        ✅ <strong>Готово!</strong> Сессия будет создана локально в вашем браузере
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

export default CreateSessionWizard;