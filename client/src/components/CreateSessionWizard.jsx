// client/src/components/CreateSessionWizard.jsx
import React, { useState, useEffect } from 'react';

const CreateSessionWizard = ({ onSessionCreated }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [sessionType, setSessionType] = useState('mentoring');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [generatedSessionId, setGeneratedSessionId] = useState('');
  const [showSessionCreated, setShowSessionCreated] = useState(false);

  // 🔥 ДОБАВЛЕНО: Динамическое добавление стилей
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .session-wizard button:focus,
      .session-wizard button:active,
      .session-wizard button:hover,
      .session-wizard button {
        outline: none !important;
        box-shadow: none !important;
      }
      
      .session-wizard *:focus {
        outline: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
    },
    typescript: {
      name: 'TypeScript',
      extension: '.ts',
      icon: '🔷',
      starterCode: `function helloWorld(): string {\n  console.log("Hello, World!");\n  return "Welcome to CodeCollab!";\n}\n\nhelloWorld();`
    },
    ruby: {
      name: 'Ruby',
      extension: '.rb',
      icon: '💎',
      starterCode: `def hello_world\n  puts "Hello, World!"\n  "Welcome to CodeCollab!"\nend\n\nhello_world`
    },
    php: {
      name: 'PHP',
      extension: '.php',
      icon: '🐘',
      starterCode: `<?php\nfunction helloWorld() {\n    echo "Hello, World!";\n    return "Welcome to CodeCollab!";\n}\n\nhelloWorld();\n?>`
    },
    go: {
      name: 'Go',
      extension: '.go',
      icon: '🐹',
      starterCode: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!");\n}`
    },
    rust: {
      name: 'Rust',
      extension: '.rs',
      icon: '🦀',
      starterCode: `fn main() {\n    println!("Hello, World!");\n}`
    },
    sql: {
      name: 'SQL',
      extension: '.sql',
      icon: '🗃️',
      starterCode: `-- Welcome to SQL session\nSELECT 'Hello, World!' AS greeting;\n\n-- Create example table\nCREATE TABLE users (\n    id INT PRIMARY KEY,\n    name VARCHAR(50)\n);`
    },
    csharp: {
      name: 'C#',
      extension: '.cs',
      icon: '🔶',
      starterCode: `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}`
    },
    swift: {
      name: 'Swift',
      extension: '.swift',
      icon: '🐦',
      starterCode: `import Foundation\n\nfunc helloWorld() {\n    print("Hello, World!")\n}\n\nhelloWorld()`
    },
    kotlin: {
      name: 'Kotlin',
      extension: '.kt',
      icon: '🔸',
      starterCode: `fun main() {\n    println("Hello, World!")\n}\n\nfun helloWorld(): String {\n    return "Welcome to CodeCollab!"\n}`
    },
    r: {
      name: 'R',
      extension: '.r',
      icon: '📊',
      starterCode: `# Welcome to R\nhello_world <- function() {\n  print("Hello, World!")\n  return("Welcome to CodeCollab!")\n}\n\nhello_world()`
    },
    scala: {
      name: 'Scala',
      extension: '.scala',
      icon: '⚡',
      starterCode: `object Main extends App {\n  def helloWorld(): String = {\n    println("Hello, World!")\n    "Welcome to CodeCollab!"\n  }\n  \n  helloWorld()\n}`
    }
  };

  const LANGUAGE_CATEGORIES = {
    all: Object.keys(SUPPORTED_LANGUAGES),
    web: ['javascript', 'typescript', 'html', 'css', 'php'],
    backend: ['python', 'java', 'cpp', 'go', 'rust', 'ruby', 'csharp', 'scala'],
    mobile: ['javascript', 'java', 'typescript', 'swift', 'kotlin'],
    data: ['python', 'sql', 'r'],
    markup: ['html', 'css']
  };

  const createSession = () => {
    console.log('🔄 Starting session creation...');
    setIsCreating(true);

    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
      setIsCreating(false);
      setShowSessionCreated(true);
    }, 1000);
  };

  const proceedToSession = () => {
    console.log('🎯 Proceeding to session:', generatedSessionId);
    
    if (onSessionCreated) {
      onSessionCreated(generatedSessionId, selectedLanguage, 'mentor');
    } else {
      window.location.href = `/session/${generatedSessionId}?language=${selectedLanguage}&type=${sessionType}&role=mentor`;
    }
  };

  const copySessionId = () => {
    if (generatedSessionId) {
      navigator.clipboard.writeText(generatedSessionId).then(() => {
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = '✅ Скопировано!';
          copyBtn.style.background = '#10b981';
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '#3b82f6';
          }, 2000);
        }
      }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = generatedSessionId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = '✅ Скопировано!';
          copyBtn.style.background = '#10b981';
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '#3b82f6';
          }, 2000);
        }
      });
    }
  };

  return (
    <div className="session-wizard" style={{
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
        {showSessionCreated ? '🎉 Сессия создана!' : '🚀 Создать новую сессию кодинга'}
      </h2>

      {showSessionCreated ? (
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          padding: '40px',
          borderRadius: '16px',
          border: '2px solid #0ea5e9',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎯</div>
          
          <h3 style={{ 
            color: '#0369a1', 
            marginBottom: '15px',
            fontSize: '24px',
            fontWeight: '700'
          }}>
            Сессия успешно создана!
          </h3>
          
          <p style={{ 
            color: '#475569',
            marginBottom: '30px',
            fontSize: '16px',
            lineHeight: '1.6'
          }}>
            Поделитесь ID сессии с учениками, чтобы они могли присоединиться
          </p>

          <div style={{ 
            marginBottom: '30px',
            padding: '20px',
            background: 'white',
            border: '2px solid #0ea5e9',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '16px', 
              color: '#0369a1',
              marginBottom: '12px',
              fontWeight: '600'
            }}>
              🆔 ID Вашей сессии:
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#0c4a6e',
              background: '#f8fafc',
              padding: '15px',
              borderRadius: '8px',
              border: '2px dashed #0ea5e9',
              fontFamily: 'monospace',
              letterSpacing: '1px',
              marginBottom: '15px'
            }}>
              {generatedSessionId}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                id="copy-btn"
                onClick={copySessionId}
                style={{
                  padding: '12px 24px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '160px',
                  justifyContent: 'center',
                  outline: 'none',
                  boxShadow: 'none'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.boxShadow = 'none';
                }}
              >
                📋 Скопировать ID
              </button>
              
              <button
                onClick={proceedToSession}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(45deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '160px',
                  justifyContent: 'center',
                  outline: 'none',
                  boxShadow: 'none'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.boxShadow = 'none';
                }}
              >
                🚀 Перейти в сессию
              </button>
            </div>
          </div>

          <div style={{
            padding: '15px',
            background: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#065f46',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            💡 <strong>Совет:</strong> Скопируйте ID и отправьте ученикам перед переходом в сессию
          </div>
        </div>
      ) : (
        <>
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
                    textAlign: 'left',
                    outline: 'none',
                    boxShadow: 'none'
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
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = 'none';
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
                {Object.entries(LANGUAGE_CATEGORIES).map(([key]) => (
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
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxShadow: 'none'
                    }}
                    onMouseOver={(e) => {
                      if (selectedCategory !== key) {
                        e.target.style.background = '#f1f5f9';
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedCategory !== key) {
                        e.target.style.background = '#f8fafc';
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.boxShadow = 'none';
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
                      overflow: 'hidden',
                      outline: 'none',
                      boxShadow: 'none'
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
                    onFocus={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.boxShadow = 'none';
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
                {SUPPORTED_LANGUAGES[selectedLanguage]?.starterCode.split('\n').map((line, index) => (
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
                overflow: 'hidden',
                outline: 'none',
                boxShadow: 'none'
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
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.boxShadow = 'none';
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
        </>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          /* Стили для скроллбара */
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
        `}
      </style>
    </div>
  );
};

export default CreateSessionWizard;