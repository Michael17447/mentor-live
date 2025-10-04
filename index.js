import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

console.log('🚀 Starting CodeMentor server...');
console.log('Node version:', process.version);

const app = express();

// ⚠️ Разрешаем CORS для всех доменов (для тестирования)
const corsOptions = {
  origin: function (origin, callback) {
    // Разрешаем все origins в продакшене для тестирования
    console.log('📍 CORS request from origin:', origin);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { 
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// 🔥 КОНФИГУРАЦИЯ ПОДДЕРЖИВАЕМЫХ ЯЗЫКОВ (16+ языков)
const SUPPORTED_LANGUAGES = {
  javascript: {
    name: "JavaScript",
    extension: ".js",
    monacoLanguage: "javascript",
    starterCode: "// Welcome to JavaScript\nconsole.log('Hello World!');\n\nfunction example() {\n  return 'This is JavaScript';\n}",
    icon: "🟨",
    category: "web"
  },
  typescript: {
    name: "TypeScript", 
    extension: ".ts",
    monacoLanguage: "typescript",
    starterCode: "// Welcome to TypeScript\nconst message: string = 'Hello World!';\nconsole.log(message);\n\ninterface Example {\n  name: string;\n  value: number;\n}",
    icon: "🔷",
    category: "web"
  },
  python: {
    name: "Python",
    extension: ".py", 
    monacoLanguage: "python",
    starterCode: "# Welcome to Python\nprint('Hello World!')\n\ndef example_function():\n    return \"This is Python\"",
    icon: "🐍",
    category: "backend"
  },
  java: {
    name: "Java",
    extension: ".java",
    monacoLanguage: "java",
    starterCode: "// Welcome to Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World!\");\n    }\n    \n    public static String example() {\n        return \"This is Java\";\n    }\n}",
    icon: "☕",
    category: "backend"
  },
  cpp: {
    name: "C++",
    extension: ".cpp",
    monacoLanguage: "cpp", 
    starterCode: "// Welcome to C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello World!\" << endl;\n    return 0;\n}\n\nstring example() {\n    return \"This is C++\";\n}",
    icon: "⚡",
    category: "backend"
  },
  csharp: {
    name: "C#",
    extension: ".cs",
    monacoLanguage: "csharp",
    starterCode: "// Welcome to C#\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine(\"Hello World!\");\n    }\n    \n    static string Example() {\n        return \"This is C#\";\n    }\n}",
    icon: "🔶",
    category: "backend"
  },
  php: {
    name: "PHP",
    extension: ".php",
    monacoLanguage: "php",
    starterCode: "<?php\n// Welcome to PHP\necho 'Hello World!';\n\nfunction example() {\n    return \"This is PHP\";\n}\n?>",
    icon: "🐘",
    category: "backend"
  },
  ruby: {
    name: "Ruby", 
    extension: ".rb",
    monacoLanguage: "ruby",
    starterCode: "# Welcome to Ruby\nputs 'Hello World!'\n\ndef example\n  \"This is Ruby\"\nend",
    icon: "💎",
    category: "backend"
  },
  go: {
    name: "Go",
    extension: ".go",
    monacoLanguage: "go",
    starterCode: "// Welcome to Go\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello World!\")\n}\n\nfunc example() string {\n    return \"This is Go\"\n}",
    icon: "🔵",
    category: "backend"
  },
  rust: {
    name: "Rust",
    extension: ".rs", 
    monacoLanguage: "rust",
    starterCode: "// Welcome to Rust\nfn main() {\n    println!(\"Hello World!\");\n}\n\nfn example() -> &'static str {\n    \"This is Rust\"\n}",
    icon: "🦀",
    category: "backend"
  },
  swift: {
    name: "Swift",
    extension: ".swift",
    monacoLanguage: "swift", 
    starterCode: "// Welcome to Swift\nimport Foundation\nprint(\"Hello World!\")\n\nfunc example() -> String {\n    return \"This is Swift\"\n}",
    icon: "🐦",
    category: "mobile"
  },
  kotlin: {
    name: "Kotlin",
    extension: ".kt",
    monacoLanguage: "kotlin",
    starterCode: "// Welcome to Kotlin\nfun main() {\n    println(\"Hello World!\")\n}\n\nfun example(): String {\n    return \"This is Kotlin\"\n}",
    icon: "🔸",
    category: "mobile"
  },
  html: {
    name: "HTML",
    extension: ".html",
    monacoLanguage: "html",
    starterCode: "<!DOCTYPE html>\n<html>\n<head>\n    <title>Welcome to HTML</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            margin: 40px;\n        }\n    </style>\n</head>\n<body>\n    <h1>Hello World!</h1>\n    <p>This is HTML</p>\n</body>\n</html>",
    icon: "🌐",
    category: "web"
  },
  css: {
    name: "CSS",
    extension: ".css", 
    monacoLanguage: "css",
    starterCode: "/* Welcome to CSS */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f0f0f0;\n}\n\n.header {\n    color: #333;\n    font-size: 24px;\n}\n\n.container {\n    max-width: 1200px;\n    margin: 0 auto;\n}",
    icon: "🎨",
    category: "web"
  },
  sql: {
    name: "SQL",
    extension: ".sql",
    monacoLanguage: "sql",
    starterCode: "-- Welcome to SQL\n-- Create a simple table\nCREATE TABLE users (\n    id INT PRIMARY KEY,\n    name VARCHAR(50),\n    email VARCHAR(100)\n);\n\n-- Insert sample data\nINSERT INTO users (id, name, email) VALUES \n(1, 'John Doe', 'john@example.com'),\n(2, 'Jane Smith', 'jane@example.com');\n\n-- Query data\nSELECT * FROM users;",
    icon: "🗃️",
    category: "data"
  },
  json: {
    name: "JSON",
    extension: ".json",
    monacoLanguage: "json",
    starterCode: "{\n  \"welcome\": \"Hello World!\",\n  \"language\": \"JSON\",\n  \"features\": [\n    \"Easy to read\",\n    \"Lightweight\",\n    \"Language independent\"\n  ],\n  \"example\": {\n    \"name\": \"CodeMentor\",\n    \"version\": \"1.0\"\n  }\n}",
    icon: "📄",
    category: "data"
  },
  markdown: {
    name: "Markdown", 
    extension: ".md",
    monacoLanguage: "markdown",
    starterCode: "# Welcome to Markdown\n\nHello World!\n\n## Features\n\n- **Easy** to write\n- **Readable** format\n- Supports *emphasis*\n\n## Code Example\n\n```javascript\nconsole.log('Hello World!');\n```\n\n## Lists\n\n1. First item\n2. Second item\n3. Third item",
    icon: "📝",
    category: "markup"
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

const LANGUAGE_SNIPPETS = {
  javascript: {
    "For Loop": "for (let i = 0; i < array.length; i++) {\n  // Your code here\n}",
    "Function": "function functionName(parameters) {\n  // Your code here\n  return result;\n}",
    "Arrow Function": "const functionName = (parameters) => {\n  // Your code here\n  return result;\n};",
    "Class": "class ClassName {\n  constructor(parameters) {\n    // Initialize\n  }\n  \n  methodName() {\n    // Method logic\n  }\n}"
  },
  python: {
    "For Loop": "for item in collection:\n    # Your code here",
    "Function": "def function_name(parameters):\n    # Your code here\n    return result",
    "Class": "class ClassName:\n    def __init__(self, parameters):\n        # Initialize\n        \n    def method_name(self):\n        # Method logic"
  },
  java: {
    "Main Method": "public static void main(String[] args) {\n    // Your code here\n}",
    "Class": "public class ClassName {\n    // Class variables\n    \n    public ClassName() {\n        // Constructor\n    }\n    \n    public void methodName() {\n        // Method logic\n    }\n}",
    "For Loop": "for (int i = 0; i < array.length; i++) {\n    // Your code here\n}"
  },
  cpp: {
    "Main Function": "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}",
    "Class": "class ClassName {\n  public:\n    ClassName() {\n      // Constructor\n    }\n    \n    void methodName() {\n      // Method logic\n    }\n};",
    "For Loop": "for (int i = 0; i < count; i++) {\n    // Your code here\n}"
  }
};

// 🔥 ИСПРАВЛЕННАЯ СТРУКТУРА СЕССИЙ
const sessions = {};

// === API для интеграции с платформами ===
app.post('/api/sessions', (req, res) => {
  console.log('📝 Creating new session:', req.body);
  const { course_id, lesson_id, user_id, role = 'student', language = 'javascript', sessionType = 'mentoring' } = req.body;
  const sessionId = uuidv4().substring(0, 8).toUpperCase();
  
  // Проверяем поддержку языка
  if (!SUPPORTED_LANGUAGES[language]) {
    return res.status(400).json({ error: 'Unsupported language' });
  }
  
  const starterCode = SUPPORTED_LANGUAGES[language].starterCode;
  
  res.json({
    session_id: sessionId,
    language: language,
    language_name: SUPPORTED_LANGUAGES[language].name,
    session_type: sessionType,
    join_url: `https://codemirror-client.vercel.app/embed/${sessionId}?role=${role}&language=${language}`,
    embed_iframe: `<iframe src="https://codemirror-client.vercel.app/embed/${sessionId}?role=${role}&language=${language}" width="100%" height="600" allow="microphone"></iframe>`,
    starter_code: starterCode,
    created_at: new Date().toISOString()
  });
});

// Health check endpoints
app.get('/', (req, res) => {
  console.log('🏠 GET / request received');
  res.json({ 
    status: 'OK', 
    message: 'CodeMentor Server is running',
    timestamp: new Date().toISOString(),
    socketConnections: Object.keys(sessions).length,
    supportedLanguages: Object.keys(SUPPORTED_LANGUAGES).length,
    languageCategories: LANGUAGE_CATEGORIES
  });
});

app.get('/api/health', (req, res) => {
  console.log('❤️ GET /api/health request received');
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    sessions: Object.keys(sessions).length,
    supportedLanguages: Object.keys(SUPPORTED_LANGUAGES).length,
    uptime: process.uptime()
  });
});

// 🔥 API ДЛЯ ПОЛУЧЕНИЯ ИНФОРМАЦИИ О ЯЗЫКАХ
app.get('/api/languages', (req, res) => {
  const { category, include_snippets } = req.query;
  
  if (category && LANGUAGE_CATEGORIES[category]) {
    const languages = {};
    LANGUAGE_CATEGORIES[category].forEach(langKey => {
      languages[langKey] = SUPPORTED_LANGUAGES[langKey];
    });
    res.json(languages);
  } else {
    res.json(SUPPORTED_LANGUAGES);
  }
});

app.get('/api/languages/categories', (req, res) => {
  res.json(LANGUAGE_CATEGORIES);
});

app.get('/api/languages/:language', (req, res) => {
  const language = req.params.language;
  if (!SUPPORTED_LANGUAGES[language]) {
    return res.status(404).json({ error: 'Language not supported' });
  }
  res.json(SUPPORTED_LANGUAGES[language]);
});

app.get('/api/languages/:language/snippets', (req, res) => {
  const language = req.params.language;
  const snippets = LANGUAGE_SNIPPETS[language] || {};
  res.json(snippets);
});

// 🔥 API ДЛЯ СТАТИСТИКИ И АНАЛИТИКИ
app.get('/api/stats', (req, res) => {
  const stats = {
    totalSessions: Object.keys(sessions).length,
    totalUsers: Object.values(sessions).reduce((acc, session) => acc + session.users.length, 0),
    languagesInUse: [...new Set(Object.values(sessions).map(s => s.language))],
    sessionsByLanguage: {},
    activeSessions: Object.values(sessions).filter(s => s.lastActivity > Date.now() - 300000).length
  };

  // Подсчет сессий по языкам
  Object.values(sessions).forEach(session => {
    stats.sessionsByLanguage[session.language] = (stats.sessionsByLanguage[session.language] || 0) + 1;
  });

  res.json(stats);
});

// 🔥 ДОБАВИТЬ НОВЫЕ API ДЛЯ ИСТОРИИ (если есть база данных)
app.get('/api/sessions/:sessionId/info', (req, res) => {
  const session = sessions[req.params.sessionId];
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    sessionId: req.params.sessionId,
    userCount: session.users.length,
    studentCanEdit: session.studentCanEdit,
    language: session.language,
    languageInfo: SUPPORTED_LANGUAGES[session.language],
    codeLength: session.code?.length,
    lastActivity: new Date(session.lastActivity).toISOString(),
    sessionDuration: Date.now() - session.lastActivity
  });
});

// 🔥 ДОБАВИТЬ API ДЛЯ ДИАГНОСТИКИ
app.get('/api/debug/sessions', (req, res) => {
  const sessionInfo = Object.entries(sessions).map(([sessionId, sessionData]) => ({
    sessionId,
    userCount: sessionData.users.length,
    studentCanEdit: sessionData.studentCanEdit,
    language: sessionData.language,
    languageName: SUPPORTED_LANGUAGES[sessionData.language]?.name,
    codeLength: sessionData.code?.length,
    users: sessionData.users,
    lastActivity: new Date(sessionData.lastActivity).toISOString()
  }));
  
  res.json({
    totalSessions: Object.keys(sessions).length,
    supportedLanguages: Object.keys(SUPPORTED_LANGUAGES),
    languageCategories: LANGUAGE_CATEGORIES,
    sessions: sessionInfo
  });
});

app.get('/api/debug/session/:sessionId', (req, res) => {
  const session = sessions[req.params.sessionId];
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    sessionId: req.params.sessionId,
    ...session,
    codePreview: session.code ? session.code.substring(0, 200) + '...' : 'empty',
    languageInfo: SUPPORTED_LANGUAGES[session.language]
  });
});

// 🔥 API ДЛЯ УПРАВЛЕНИЯ СЕССИЯМИ
app.delete('/api/sessions/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  if (sessions[sessionId]) {
    delete sessions[sessionId];
    console.log(`🗑️ Session ${sessionId} deleted via API`);
    res.json({ message: 'Session deleted successfully' });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// === WebSocket для синхронизации ===
io.on('connection', (socket) => {
  console.log('🔌 Подключился:', socket.id);
  console.log('📍 Headers origin:', socket.handshake.headers.origin);
  console.log('📍 User agent:', socket.handshake.headers['user-agent']);

  // 🔥 ИСПРАВЛЕННЫЙ ОБРАБОТЧИК join-session С ПОДДЕРЖКОЙ ЯЗЫКОВ
  socket.on('join-session', async (sessionId, language = 'javascript') => {
    console.log(`📥 ${socket.id} joined session: ${sessionId} with language: ${language}`);
    socket.sessionId = sessionId;
    
    // Проверяем и нормализуем язык
    const normalizedLanguage = SUPPORTED_LANGUAGES[language] ? language : 'javascript';
    const starterCode = SUPPORTED_LANGUAGES[normalizedLanguage]?.starterCode || '// Start coding...\n';
    
    // 🔥 ИНИЦИАЛИЗАЦИЯ СЕССИИ ЕСЛИ НЕТУ
    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        users: [],
        code: starterCode,
        studentCanEdit: false,
        language: normalizedLanguage,
        lastActivity: Date.now(),
        createdAt: Date.now(),
        mentorId: socket.id
      };
      
      console.log(`🆕 Created ${normalizedLanguage} session: ${sessionId}`);
    }
    
    sessions[sessionId].users.push(socket.id);
    sessions[sessionId].lastActivity = Date.now();
    socket.join(sessionId);
    
    // 🔥 ОТПРАВИТЬ ТЕКУЩЕЕ СОСТОЯНИЕ НОВОМУ ПОЛЬЗОВАТЕЛЮ
    socket.emit('code-update', sessions[sessionId].code);
    socket.emit('student-edit-permission', sessions[sessionId].studentCanEdit);
    socket.emit('language-changed', { 
      language: sessions[sessionId].language,
      languageInfo: SUPPORTED_LANGUAGES[sessions[sessionId].language]
    });
    
    // 🔥 УВЕДОМИТЬ ДРУГИХ УЧАСТНИКОВ О ПРИСОЕДИНЕНИИ
    socket.to(sessionId).emit('user-joined', { 
      userId: socket.id,
      userCount: sessions[sessionId].users.length
    });
    
    console.log(`👥 Users in ${sessions[sessionId].language} session ${sessionId}:`, sessions[sessionId].users.length);
  });

  // 🔥 КРИТИЧЕСКИ ВАЖНО: Исправленный обработчик разрешения редактирования
  socket.on('toggle-student-edit', (data) => {
    console.log(`✏️ Student edit permission: ${data.allowEdit} in ${data.sessionId}`);
    
    // 🔥 СОХРАНИТЬ СОСТОЯНИЕ В СЕССИИ
    if (sessions[data.sessionId]) {
      sessions[data.sessionId].studentCanEdit = data.allowEdit;
      sessions[data.sessionId].lastActivity = Date.now();
    }
    
    // 🔥 ОТПРАВИТЬ ВСЕМ УЧАСТНИКАМ СЕССИИ
    io.to(data.sessionId).emit('student-edit-permission', data.allowEdit);
  });

  // 🔥 КРИТИЧЕСКИ ВАЖНО: ИСПРАВЛЕННЫЙ обработчик изменений кода от ученика
  socket.on('student-code-change', (data) => {
    console.log(`📝 Student ${data.studentId} changed code in ${data.sessionId}`);
    console.log(`📄 Code length: ${data.code?.length} chars, Language: ${sessions[data.sessionId]?.language}`);
    
    // 🔥 ОБНОВИТЬ КОД В СЕССИИ
    if (sessions[data.sessionId]) {
      sessions[data.sessionId].code = data.code;
      sessions[data.sessionId].lastActivity = Date.now();
    }
    
    // 🔥 ПЕРЕСЛАТЬ ВСЕМ УЧАСТНИКАМ СЕССИИ (ВКЛЮЧАЯ МЕНТОРА)
    socket.to(data.sessionId).emit('code-update', data.code);
    
    // Логируем для отладки
    const preview = data.code ? data.code.substring(0, 50) + '...' : 'empty';
    console.log(`📋 Student code preview: ${preview}`);
  });

  // 🔥 ИСПРАВЛЕННЫЙ ОБРАБОТЧИК code-change
  socket.on('code-change', async (data) => {
    console.log(`📝 Code change in ${data.sessionId} by ${socket.id}`);
    console.log(`📄 Code length: ${data.code?.length} chars, Language: ${sessions[data.sessionId]?.language}`);
    
    // 🔥 ОБНОВИТЬ КОД В СЕССИИ
    if (sessions[data.sessionId]) {
      sessions[data.sessionId].code = data.code;
      sessions[data.sessionId].lastActivity = Date.now();
    }
    
    // 🔥 ПЕРЕСЛАТЬ ВСЕМ, КРОМЕ ОТПРАВИТЕЛЯ
    socket.to(data.sessionId).emit('code-update', data.code);
    
    // Логируем для отладки (первые 100 символов)
    const preview = data.code ? data.code.substring(0, 100) + '...' : 'empty';
    console.log(`📋 Code preview: ${preview}`);
  });

  // 🔥 НОВЫЙ ОБРАБОТЧИК СМЕНЫ ЯЗЫКА ПРОГРАММИРОВАНИЯ
  socket.on('change-language', (data) => {
    const { sessionId, language, code } = data;
    
    if (!SUPPORTED_LANGUAGES[language]) {
      socket.emit('error', { message: 'Unsupported language' });
      return;
    }
    
    if (sessions[sessionId]) {
      const previousLanguage = sessions[sessionId].language;
      sessions[sessionId].language = language;
      
      // Если передан новый код, используем его, иначе используем стартовый код языка
      if (code) {
        sessions[sessionId].code = code;
      } else {
        sessions[sessionId].code = SUPPORTED_LANGUAGES[language].starterCode;
      }
      
      sessions[sessionId].lastActivity = Date.now();
      
      console.log(`🌍 Language changed from ${previousLanguage} to ${language} in session ${sessionId}`);
      
      // Уведомляем всех участников сессии о смене языка
      io.to(sessionId).emit('language-changed', {
        language: language,
        code: sessions[sessionId].code,
        languageInfo: SUPPORTED_LANGUAGES[language]
      });
    }
  });

  // 🔥 ДОБАВИТЬ НОВЫЙ ОБРАБОТЧИК ДЛЯ СИНХРОНИЗАЦИИ
  socket.on('request-sync', (data) => {
    console.log(`🔄 Sync requested for session: ${data.sessionId}`);
    
    if (sessions[data.sessionId]) {
      // Отправить текущее состояние запросившему пользователю
      socket.emit('code-update', sessions[data.sessionId].code);
      socket.emit('student-edit-permission', sessions[data.sessionId].studentCanEdit);
      socket.emit('language-changed', { 
        language: sessions[data.sessionId].language,
        languageInfo: SUPPORTED_LANGUAGES[sessions[data.sessionId].language]
      });
      console.log(`✅ Sync completed for ${socket.id}`);
    }
  });

  // 🔥 ДОБАВИТЬ ОБРАБОТЧИК ПРОВЕРКИ СОСТОЯНИЯ СЕССИИ
  socket.on('get-session-state', (data) => {
    console.log(`📊 Session state requested for: ${data.sessionId}`);
    
    const sessionState = sessions[data.sessionId] ? {
      code: sessions[data.sessionId].code,
      studentCanEdit: sessions[data.sessionId].studentCanEdit,
      language: sessions[data.sessionId].language,
      userCount: sessions[data.sessionId].users.length,
      languageInfo: SUPPORTED_LANGUAGES[sessions[data.sessionId].language]
    } : null;
    
    socket.emit('session-state', sessionState);
  });

  // 🔥 ДОБАВИТЬ НОВЫЙ ОБРАБОТЧИК ДЛЯ AI-ПОДСКАЗОК
  socket.on('ai-hint-generated', async (data) => {
    console.log(`🧠 AI hint in ${data.sessionId} for ${data.language || 'javascript'}`);
    console.log(`💡 Hint: ${data.hint}`);
    
    // Отправляем AI-подсказку всем участникам сессии
    if (sessions[data.sessionId]) {
      io.to(data.sessionId).emit('ai-hint', {
        hint: data.hint,
        confidence: data.confidence || 0.5,
        language: data.language || 'javascript',
        timestamp: new Date().toISOString()
      });
    }
  });

  // 🔥 ДОБАВИТЬ ОБРАБОТЧИК ЗАВЕРШЕНИЯ СЕССИИ
  socket.on('end-session', async (data) => {
    console.log(`🔚 Ending session: ${data.sessionId}`);
    
    if (sessions[data.sessionId]) {
      // Уведомляем всех участников о завершении сессии
      io.to(data.sessionId).emit('session-ended', {
        reason: data.reason,
        endedBy: socket.id,
        duration: Date.now() - sessions[data.sessionId].createdAt
      });
      
      // Закрываем сессию
      delete sessions[data.sessionId];
      console.log(`✅ Session ${data.sessionId} ended by ${socket.id}`);
    }
  });

  // 🔥 ОБРАБОТЧИК ДЛЯ СНИППЕТОВ КОДА
  socket.on('request-snippets', (data) => {
    const { sessionId, language } = data;
    const snippets = LANGUAGE_SNIPPETS[language] || {};
    
    console.log(`📋 Snippets requested for ${language} in session ${sessionId}`);
    socket.emit('snippets-data', {
      language: language,
      snippets: snippets
    });
  });

  socket.on('signal', (data) => {
    console.log(`📡 Signal from ${socket.id} in ${data.sessionId}`);
    socket.to(data.sessionId).emit('signal', { 
      signal: data.signal, 
      from: socket.id 
    });
  });

  socket.on('user-audio-status', (data) => {
    console.log(`🎤 Audio status: ${data.userId} -> ${data.active} in ${data.sessionId}`);
    socket.to(data.sessionId).emit('user-audio-status', { 
      userId: data.userId, 
      active: data.active 
    });
  });

  socket.on('cursor-move', (data) => {
    // Дебаунсим события движения курсора для производительности
    if (sessions[data.sessionId]) {
      socket.to(data.sessionId).emit('cursor-update', { 
        position: data.position, 
        userId: data.userId 
      });
    }
  });

  // 🔥 ОБРАБОТЧИК ДЛЯ СТАТИСТИКИ И АНАЛИТИКИ
  socket.on('get-session-stats', (data) => {
    const session = sessions[data.sessionId];
    if (session) {
      const stats = {
        sessionId: data.sessionId,
        userCount: session.users.length,
        language: session.language,
        codeLength: session.code?.length,
        studentCanEdit: session.studentCanEdit,
        sessionAge: Date.now() - session.createdAt,
        lastActivity: session.lastActivity
      };
      
      socket.emit('session-stats', stats);
    }
  });

  // 🔥 ИСПРАВЛЕННЫЙ ОБРАБОТЧИК DISCONNECT
  socket.on('disconnect', async (reason) => {
    console.log('🔴 Отключился:', socket.id, 'Reason:', reason);
    
    if (socket.sessionId && sessions[socket.sessionId]) {
      const session = sessions[socket.sessionId];
      
      // 🔥 ПРАВИЛЬНОЕ УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ИЗ СЕССИИ
      session.users = session.users.filter(userId => userId !== socket.id);
      session.lastActivity = Date.now();
      
      // Уведомить других участников
      socket.to(socket.sessionId).emit('user-left', { 
        userId: socket.id,
        userCount: session.users.length
      });
      
      socket.to(socket.sessionId).emit('user-audio-status', { 
        userId: socket.id, 
        active: false 
      });
      
      console.log(`👥 Remaining users in ${socket.sessionId}:`, session.users.length);
      
      // 🔥 УДАЛЯЕМ СЕССИЮ ТОЛЬКО ЕСЛИ НЕТ ПОЛЬЗОВАТЕЛЕЙ
      if (session.users.length === 0) {
        const sessionDuration = Date.now() - session.createdAt;
        console.log(`🗑️ Session ${socket.sessionId} deleted (no users). Duration: ${Math.floor(sessionDuration / 1000)}s, Language: ${session.language}`);
        delete sessions[socket.sessionId];
      }
    }
  });

  // Обработка ошибок сокета
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

// 🔥 ПЕРИОДИЧЕСКАЯ ПРОВЕРКА СЕССИЙ (каждые 30 секунд)
setInterval(() => {
  const now = Date.now();
  const inactiveSessions = [];
  
  Object.entries(sessions).forEach(([sessionId, sessionData]) => {
    // Помечаем сессии без активности более 30 минут как неактивные
    if (now - sessionData.lastActivity > 30 * 60 * 1000) {
      inactiveSessions.push(sessionId);
    }
  });
  
  // Удаляем неактивные сессии
  inactiveSessions.forEach(sessionId => {
    console.log(`🧹 Removing inactive session: ${sessionId}`);
    delete sessions[sessionId];
  });
  
  if (inactiveSessions.length > 0) {
    console.log(`🧹 Cleaned up ${inactiveSessions.length} inactive sessions`);
  }
  
  // Логируем активные сессии
  console.log('🔄 Active sessions:', Object.keys(sessions).length);
  Object.entries(sessions).forEach(([sessionId, sessionData]) => {
    console.log(`   📍 ${sessionId}: ${sessionData.users.length} users, ${sessionData.language}, code: ${sessionData.code?.length} chars, edit: ${sessionData.studentCanEdit}`);
  });
}, 30000);

// 🔥 ПЕРИОДИЧЕСКАЯ СТАТИСТИКА (каждые 5 минут)
setInterval(() => {
  const stats = {
    totalSessions: Object.keys(sessions).length,
    totalUsers: Object.values(sessions).reduce((acc, session) => acc + session.users.length, 0),
    languagesInUse: [...new Set(Object.values(sessions).map(s => s.language))],
    sessionsByLanguage: {}
  };

  Object.values(sessions).forEach(session => {
    stats.sessionsByLanguage[session.language] = (stats.sessionsByLanguage[session.language] || 0) + 1;
  });

  console.log('📊 Server Statistics:', stats);
}, 300000);

// Глобальная обработка ошибок
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Запуск сервера с диагностикой
const PORT = process.env.PORT || 8080;

console.log('🔧 Server configuration:');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CORS: enabled for all origins');
console.log('🌍 Supported languages:', Object.keys(SUPPORTED_LANGUAGES).join(', '));
console.log('📁 Language categories:', Object.keys(LANGUAGE_CATEGORIES).join(', '));
console.log('📋 Languages with snippets:', Object.keys(LANGUAGE_SNIPPETS).join(', '));

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SERVER STARTED on port ${PORT}`);
  console.log(`✅ Health check: http://0.0.0.0:${PORT}/`);
  console.log(`✅ WebSocket: ws://0.0.0.0:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Debug endpoints available:`);
  console.log(`   📊 Sessions: http://0.0.0.0:${PORT}/api/debug/sessions`);
  console.log(`   🌍 Languages: http://0.0.0.0:${PORT}/api/languages`);
  console.log(`   📈 Stats: http://0.0.0.0:${PORT}/api/stats`);
}).on('error', (error) => {
  console.error('❌ FAILED to start server:', error);
  process.exit(1);
});

// Экспортируем для тестирования
export { app, io, sessions, SUPPORTED_LANGUAGES, LANGUAGE_CATEGORIES, LANGUAGE_SNIPPETS };