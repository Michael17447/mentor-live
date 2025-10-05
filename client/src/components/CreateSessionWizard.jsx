// client/src/components/CreateSessionWizard.jsx
import React, { useState } from 'react';

const CreateSessionWizard = ({ onSessionCreated }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [sessionType, setSessionType] = useState('mentoring');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [generatedSessionId, setGeneratedSessionId] = useState('');

  const SUPPORTED_LANGUAGES = {
    javascript: {
      name: 'JavaScript',
      extension: '.js',
      icon: '🟨',
      starterCode: `// Welcome to JavaScript\nconsole.log('Hello World!');\n\nfunction example() {\n  return 'This is JavaScript';\n}`
    },
    typescript: {
      name: 'TypeScript', 
      extension: '.ts',
      icon: '🔷',
      starterCode: `// Welcome to TypeScript\nconst message: string = 'Hello World!';\nconsole.log(message);\n\ninterface Example {\n  name: string;\n  value: number;\n}`
    },
    python: {
      name: 'Python',
      extension: '.py', 
      icon: '🐍',
      starterCode: `# Welcome to Python\nprint('Hello World!')\n\ndef example_function():\n    return "This is Python"`
    },
    java: {
      name: 'Java',
      extension: '.java',
      icon: '☕',
      starterCode: `// Welcome to Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n    \n    public static String example() {\n        return "This is Java";\n    }\n}`
    },
    cpp: {
      name: 'C++',
      extension: '.cpp',
      icon: '⚡',
      starterCode: `// Welcome to C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World!" << endl;\n    return 0;\n}\n\nstring example() {\n    return "This is C++";\n}`
    },
    csharp: {
      name: 'C#',
      extension: '.cs',
      icon: '🔶',
      starterCode: `// Welcome to C#\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello World!");\n    }\n    \n    static string Example() {\n        return "This is C#";\n    }\n}`
    },
    php: {
      name: 'PHP',
      extension: '.php',
      icon: '🐘',
      starterCode: `<?php\n// Welcome to PHP\necho 'Hello World!';\n\nfunction example() {\n    return "This is PHP";\n}\n?>`
    },
    ruby: {
      name: 'Ruby', 
      extension: '.rb',
      icon: '💎',
      starterCode: `# Welcome to Ruby\nputs 'Hello World!'\n\ndef example\n  "This is Ruby"\nend`
    },
    go: {
      name: 'Go',
      extension: '.go',
      icon: '🔵',
      starterCode: `// Welcome to Go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World!")\n}\n\nfunc example() string {\n    return "This is Go"\n}`
    },
    rust: {
      name: 'Rust',
      extension: '.rs', 
      icon: '🦀',
      starterCode: `// Welcome to Rust\nfn main() {\n    println!("Hello World!");\n}\n\nfn example() -> &'static str {\n    "This is Rust"\n}`
    },
    swift: {
      name: 'Swift',
      extension: '.swift',
      icon: '🐦',
      starterCode: `// Welcome to Swift\nimport Foundation\nprint("Hello World!")\n\nfunc example() -> String {\n    return "This is Swift"\n}`
    },
    kotlin: {
      name: 'Kotlin',
      extension: '.kt',
      icon: '🔸',
      starterCode: `// Welcome to Kotlin\nfun main() {\n    println("Hello World!")\n}\n\nfun example(): String {\n    return "This is Kotlin"\n}`
    },
    html: {
      name: 'HTML',
      extension: '.html',
      icon: '🌐',
      starterCode: `<!DOCTYPE html>\n<html>\n<head>\n    <title>Welcome to HTML</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            margin: 40px;\n        }\n    </style>\n</head>\n<body>\n    <h1>Hello World!</h1>\n    <p>This is HTML</p>\n</body>\n</html>`
    },
    css: {
      name: 'CSS',
      extension: '.css', 
      icon: '🎨',
      starterCode: `/* Welcome to CSS */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f0f0f0;\n}\n\n.header {\n    color: #333;\n    font-size: 24px;\n}\n\n.container {\n    max-width: 1200px;\n    margin: 0 auto;\n}`
    },
    sql: {
      name: 'SQL',
      extension: '.sql',
      icon: '🗃️',
      starterCode: `-- Welcome to SQL\n-- Create a simple table\nCREATE TABLE users (\n    id INT PRIMARY KEY,\n    name VARCHAR(50),\n    email VARCHAR(100)\n);\n\n-- Insert sample data\nINSERT INTO users (id, name, email) VALUES \n(1, 'John Doe', 'john@example.com'),\n(2, 'Jane Smith', 'jane@example.com');\n\n-- Query data\nSELECT * FROM users;`
    },
    json: {
      name: 'JSON',
      extension: '.json',
      icon: '📄',
      starterCode: `{\n  "welcome": "Hello World!",\n  "language": "JSON",\n  "features": [\n    "Easy to read",\n    "Lightweight",\n    "Language independent"\n  ],\n  "example": {\n    "name": "CodeMentor",\n    "version": "1.0"\n  }\n}`
    },
    markdown: {
      name: 'Markdown', 
      extension: '.md',
      icon: '📝',
      starterCode: `# Welcome to Markdown\n\nHello World!\n\n## Features\n\n- **Easy** to write\n- **Readable** format\n- Supports *emphasis*\n\n## Code Example\n\n\`\`\`javascript\nconsole.log('Hello World!');\n\`\`\`\n\n## Lists\n\n1. First item\n2. Second item\n3. Third item`
    }
  };

  const LANGUAGE_CATEGORIES = {
    all: "All Languages",
    web: ["javascript", "typescript", "html", "css"],
    backend: ["python", "java", "cpp", "csharp", "php", "ruby", "go", "rust"],
    mobile: ["swift", "kotlin"],
    data: ["sql", "json"],
    markup: ["markdown"]
  };

  const createSession = () => {
    console.log('🔄 Starting session creation...');
    setIsCreating(true);

    const sessionId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setGeneratedSessionId(sessionId);
    
    const sessionData = {
      id: sessionId,
      language: selectedLanguage,
      type: sessionType,
      createdAt: new Date().toISOString(),
      starterCode: SUPPORTED_LANGUAGES[selectedLanguage].starterCode,
      role: 'mentor'
    };
    
    localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionData));
    console.log('✅ Session data saved to localStorage:', sessionId);
    
    setTimeout(() => {
      console.log('🎯 Calling onSessionCreated callback:', { sessionId, selectedLanguage, role: 'mentor' });
      
      if (onSessionCreated) {
        onSessionCreated(sessionId, selectedLanguage, 'mentor');
      } else {
        console.error('❌ onSessionCreated callback is not provided!');
        window.location.href = `/session/${sessionId}?language=${selectedLanguage}&type=${sessionType}&role=mentor`;
      }
      
      setIsCreating(false);
    }, 1500);
  };

  const copySessionId = () => {
    if (generatedSessionId) {
      navigator.clipboard.writeText(generatedSessionId).then(() => {
        alert('✅ ID сессии скопирован в буфер обмена!');
      }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = generatedSessionId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('✅ ID сессии скопирован!');
      });
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      maxWidth: '900px',
      margin: '20px auto',
      backdropFilter: 'blur(10px)'
    }}>
      <h2 style={{ 
        color: '#1f2937', 
        marginBottom: '30px',
        textAlign: 'center',
        fontSize: '28px',
        fontWeight: '700',
        background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        🚀 Создать новую сессию кодинга
      </h2>

      {/* Шаг 1: Выбор типа сессии */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ 
          color: '#374151', 
          marginBottom: '15px', 
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{
            background: '#3b82f6',
            color: 'white',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}>1</span>
          Тип сессии
        </h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {[
            { 
              id: 'mentoring', 
              label: '👨‍🏫 Обучение', 
              desc: 'Обучение программированию и концепциям',
              color: '#3b82f6'
            },
            { 
              id: 'interview', 
              label: '💼 Техническое собеседование', 
              desc: 'Проведение технических интервью',
              color: '#f59e0b'
            },
            { 
              id: 'collaboration', 
              label: '👥 Парное программирование', 
              desc: 'Совместная разработка кода',
              color: '#10b981'
            }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setSessionType(type.id)}
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '20px',
                background: sessionType === type.id ? type.color : '#f8fafc',
                color: sessionType === type.id ? 'white' : '#374151',
                border: sessionType === type.id ? '2px solid transparent' : '2px solid #e5e7eb',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: sessionType === type.id ? '600' : '400',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                if (sessionType !== type.id) {
                  e.target.style.background = '#f1f5f9';
                  e.target.style.borderColor = type.color;
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (sessionType !== type.id) {
                  e.target.style.background = '#f8fafc';
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>{type.label}</div>
              <div style={{ 
                fontSize: '14px', 
                opacity: sessionType === type.id ? 0.9 : 0.7,
                lineHeight: '1.4'
              }}>
                {type.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Шаг 2: Выбор языка программирования */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ 
          color: '#374151', 
          marginBottom: '20px', 
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{
            background: '#3b82f6',
            color: 'white',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}>2</span>
          Язык программирования
        </h3>
        
        {/* Категории языков */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            overflowX: 'auto',
            paddingBottom: '15px',
            marginBottom: '20px'
          }}>
            {Object.entries(LANGUAGE_CATEGORIES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                style={{
                  padding: '10px 20px',
                  background: selectedCategory === key ? '#3b82f6' : '#f8fafc',
                  color: selectedCategory === key ? 'white' : '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }}
              >
                {key === 'all' ? '🌍 Все языки' : 
                 key === 'web' ? '🌐 Веб-разработка' :
                 key === 'backend' ? '⚙️ Бэкенд' :
                 key === 'mobile' ? '📱 Мобильная разработка' :
                 key === 'data' ? '📊 Данные и SQL' : '📝 Разметка и стили'}
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
          padding: '10px',
          border: '1px solid #f1f5f9',
          borderRadius: '12px',
          background: '#fafafa'
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
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  if (selectedLanguage !== key) {
                    e.target.style.background = '#f8fafc';
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.15)';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedLanguage !== key) {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '28px' }}>{lang.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      fontSize: '16px',
                      textAlign: 'left'
                    }}>
                      {lang.name}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      opacity: selectedLanguage === key ? 0.8 : 0.6,
                      textAlign: 'left'
                    }}>
                      {lang.extension}
                    </div>
                  </div>
                </div>
                
                {selectedLanguage === key && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}>
                    ✅ ВЫБРАНО
                  </div>
                )}
              </button>
            ))
          }
        </div>
      </div>

      {/* Шаг 3: Предпросмотр и создание */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        padding: '25px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        position: 'relative'
      }}>
        <h3 style={{ 
          color: '#374151', 
          marginBottom: '20px', 
          fontSize: '18px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{
            background: '#3b82f6',
            color: 'white',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}>3</span>
          Предпросмотр сессии
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px', 
          marginBottom: '25px' 
        }}>
          <div>
            <strong style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Тип сессии:
            </strong> 
            <span style={{ 
              background: sessionType === 'mentoring' ? '#dbeafe' : 
                         sessionType === 'interview' ? '#fef3c7' : '#d1fae5',
              color: sessionType === 'mentoring' ? '#1e40af' : 
                    sessionType === 'interview' ? '#92400e' : '#065f46',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              textAlign: 'center',
              justifyContent: 'center'
            }}>
              {sessionType === 'mentoring' ? '👨‍🏫 Обучение' : 
               sessionType === 'interview' ? '💼 Техническое собеседование' : '👥 Парное программирование'}
            </span>
          </div>
          
          <div>
            <strong style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Язык программирования:
            </strong> 
            <span style={{ 
              background: '#e0e7ff',
              color: '#3730a3',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              justifyContent: 'center',
              width: '100%'
            }}>
              {SUPPORTED_LANGUAGES[selectedLanguage]?.icon}
              {SUPPORTED_LANGUAGES[selectedLanguage]?.name}
            </span>
          </div>
        </div>

        {/* 🔥 БЛОК ОТОБРАЖЕНИЯ ID СЕССИИ */}
        {generatedSessionId && (
          <div style={{ 
            marginBottom: '20px',
            padding: '15px',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            border: '2px solid #0ea5e9',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '14px', 
              color: '#0369a1',
              marginBottom: '8px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              🆔 <span>ID Вашей сессии:</span>
            </div>
            <div 
              onClick={copySessionId}
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#0c4a6e',
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                border: '2px dashed #0ea5e9',
                fontFamily: 'monospace',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '8px'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#f0f9ff';
                e.target.style.borderColor = '#0369a1';
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#0ea5e9';
                e.target.style.transform = 'scale(1)';
              }}
              title="Нажмите чтобы скопировать ID"
            >
              {generatedSessionId}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#0284c7',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              📋 <span>Нажмите на ID чтобы скопировать и поделиться с учениками</span>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '25px' }}>
          <strong style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Стартовый код:
          </strong>
          <div style={{
            background: '#1f2937',
            color: '#e5e7eb',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: '"Fira Code", "Courier New", monospace',
            maxHeight: '120px',
            overflow: 'auto',
            lineHeight: '1.5',
            border: '1px solid #374151'
          }}>
            {SUPPORTED_LANGUAGES[selectedLanguage]?.starterCode.split('\n').slice(0, 5).map((line, index) => (
              <div key={index} style={{ display: 'flex' }}>
                <span style={{ 
                  color: '#6b7280', 
                  marginRight: '15px',
                  minWidth: '20px',
                  textAlign: 'right'
                }}>
                  {index + 1}
                </span>
                <span style={{ flex: 1 }}>{line}</span>
              </div>
            ))}
            {SUPPORTED_LANGUAGES[selectedLanguage]?.starterCode.split('\n').length > 5 && (
              <div style={{ color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', marginTop: '8px' }}>
                ... и ещё {SUPPORTED_LANGUAGES[selectedLanguage]?.starterCode.split('\n').length - 5} строк
              </div>
            )}
          </div>
        </div>

        {/* Кнопка создания */}
        <button
          onClick={createSession}
          disabled={isCreating}
          style={{
            width: '100%',
            padding: '18px',
            background: isCreating ? '#9ca3af' : 'linear-gradient(45deg, #3b82f6, #6366f1)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: isCreating ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseOver={(e) => {
            if (!isCreating) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 25px rgba(59, 130, 246, 0.4)';
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
                marginRight: '10px',
                fontSize: '16px'
              }}>
                ⏳
              </span>
              Создание сессии...
            </>
          ) : (
            <>
              🚀 Создать сессию
            </>
          )}
        </button>

        <div style={{
          marginTop: '15px',
          padding: '12px 16px',
          background: '#d1fae5',
          border: '1px solid #10b981',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#065f46',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          ✅ <strong>Готово к созданию!</strong> Сессия будет создана локально в вашем браузере
        </div>
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