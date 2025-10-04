// client/src/components/SessionPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const SessionPage = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const [language, setLanguage] = useState('javascript');
  const [sessionType, setSessionType] = useState('mentoring');
  const [code, setCode] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  const LANGUAGES = {
    javascript: {
      name: 'JavaScript',
      icon: '🟨',
      starterCode: `function helloWorld() {\n  console.log("Hello, World!");\n  return "Welcome to CodeCollab!";\n}\n\nhelloWorld();`
    },
    python: {
      name: 'Python', 
      icon: '🐍',
      starterCode: `def hello_world():\n    print("Hello, World!")\n    return "Welcome to CodeCollab!"\n\nhello_world()`
    },
    java: {
      name: 'Java',
      icon: '☕', 
      starterCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`
    },
    html: {
      name: 'HTML',
      icon: '🌐',
      starterCode: `<!DOCTYPE html>\n<html>\n<head>\n    <title>Welcome</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>`
    }
  };

  useEffect(() => {
    // Получаем параметры из URL
    const urlLanguage = searchParams.get('language') || 'javascript';
    const urlType = searchParams.get('type') || 'mentoring';
    
    setLanguage(urlLanguage);
    setSessionType(urlType);
    setCode(LANGUAGES[urlLanguage]?.starterCode || LANGUAGES.javascript.starterCode);
    setIsLoaded(true);

    console.log('🎯 Session loaded:', {
      sessionId,
      language: urlLanguage,
      type: urlType,
      role: searchParams.get('role')
    });
  }, [sessionId, searchParams]);

  if (!isLoaded) {
    return (
      <div style={{ 
        padding: '50px', 
        textAlign: 'center',
        fontSize: '18px' 
      }}>
        ⏳ Загрузка сессии...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Хедер сессии */}
      <div style={{
        background: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1f2937' }}>
            🚀 Сессия кодинга
          </h1>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
            ID: {sessionId} | Роль: {searchParams.get('role') === 'mentor' ? '👨‍🏫 Ментор' : '👨‍🎓 Ученик'}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{
            padding: '8px 16px',
            background: '#e0e7ff',
            color: '#3730a3',
            borderRadius: '20px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {LANGUAGES[language]?.icon}
            {LANGUAGES[language]?.name}
          </div>
          
          <div style={{
            padding: '8px 16px',
            background: sessionType === 'mentoring' ? '#dbeafe' : 
                       sessionType === 'interview' ? '#fef3c7' : '#d1fae5',
            color: sessionType === 'mentoring' ? '#1e40af' : 
                   sessionType === 'interview' ? '#92400e' : '#065f46',
            borderRadius: '20px',
            fontSize: '14px'
          }}>
            {sessionType === 'mentoring' ? '👨‍🏫 Обучение' : 
             sessionType === 'interview' ? '💼 Собеседование' : '👥 Парное программирование'}
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Редактор кода */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#1f2937',
            color: 'white',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>📝 Редактор кода</span>
            <button style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}>
              Запустить код
            </button>
          </div>
          
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              width: '100%',
              height: '400px',
              background: '#1f2937',
              color: '#e5e7eb',
              border: 'none',
              padding: '20px',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.5',
              resize: 'none',
              outline: 'none'
            }}
            spellCheck="false"
          />
        </div>

        {/* Панель информации и чата */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Информация о сессии */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1f2937' }}>
              📋 Информация о сессии
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>ID сессии:</span>
                <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                  {sessionId}
                </code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Язык:</span>
                <span style={{ fontWeight: '500' }}>
                  {LANGUAGES[language]?.icon} {LANGUAGES[language]?.name}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Тип:</span>
                <span style={{ fontWeight: '500' }}>
                  {sessionType === 'mentoring' ? '👨‍🏫 Обучение' : 
                   sessionType === 'interview' ? '💼 Собеседование' : '👥 Парное программирование'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Ваша роль:</span>
                <span style={{ fontWeight: '500' }}>
                  {searchParams.get('role') === 'mentor' ? '👨‍🏫 Ментор' : '👨‍🎓 Ученик'}
                </span>
              </div>
            </div>
          </div>

          {/* Чат */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              background: '#3b82f6',
              color: 'white',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '500',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }}>
              💬 Чат сессии
            </div>
            
            <div style={{
              flex: 1,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>💬</div>
                <div>Чат будет доступен когда</div>
                <div>подключится второй участник</div>
              </div>
            </div>
            
            <div style={{ padding: '15px', borderTop: '1px solid #e5e7eb' }}>
              <input
                type="text"
                placeholder="Введите сообщение..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка возврата */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '10px 20px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Назад к созданию сессии
        </button>
      </div>
    </div>
  );
};

export default SessionPage;