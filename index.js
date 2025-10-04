import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

// 🔥 ДОБАВИТЬ ЭТИ ИМПОРТЫ ДЛЯ БАЗЫ ДАННЫХ
import { sequelize, Session, SessionEvent, AIHint } from './models/index.js';

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

// 🔥 КОНФИГУРАЦИЯ ПОДДЕРЖИВАЕМЫХ ЯЗЫКОВ
const SUPPORTED_LANGUAGES = {
  javascript: {
    name: "JavaScript",
    starterCode: "// Welcome to JavaScript\nconsole.log('Hello World!');\n\nfunction example() {\n  return 'This is JavaScript';\n}"
  },
  typescript: {
    name: "TypeScript", 
    starterCode: "// Welcome to TypeScript\nconst message: string = 'Hello World!';\nconsole.log(message);\n\ninterface Example {\n  name: string;\n  value: number;\n}"
  },
  python: {
    name: "Python",
    starterCode: "# Welcome to Python\nprint('Hello World!')\n\ndef example_function():\n    return \"This is Python\""
  },
  java: {
    name: "Java",
    starterCode: "// Welcome to Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World!\");\n    }\n    \n    public static String example() {\n        return \"This is Java\";\n    }\n}"
  },
  cpp: {
    name: "C++",
    starterCode: "// Welcome to C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello World!\" << endl;\n    return 0;\n}\n\nstring example() {\n    return \"This is C++\";\n}"
  },
  html: {
    name: "HTML",
    starterCode: "<!DOCTYPE html>\n<html>\n<head>\n    <title>Welcome to HTML</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            margin: 40px;\n        }\n    </style>\n</head>\n<body>\n    <h1>Hello World!</h1>\n    <p>This is HTML</p>\n</body>\n</html>"
  },
  css: {
    name: "CSS",
    starterCode: "/* Welcome to CSS */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f0f0f0;\n}\n\n.header {\n    color: #333;\n    font-size: 24px;\n}"
  }
};

// 🔥 ИСПРАВЛЕННАЯ СТРУКТУРА СЕССИЙ
const sessions = {};

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};

initializeDatabase();

// === API для интеграции с платформами ===
app.post('/api/sessions', (req, res) => {
  console.log('📝 Creating new session:', req.body);
  const { course_id, lesson_id, user_id, role = 'student', language = 'javascript' } = req.body;
  const sessionId = uuidv4().substring(0, 8).toUpperCase();
  
  // Проверяем поддержку языка
  if (!SUPPORTED_LANGUAGES[language]) {
    return res.status(400).json({ error: 'Unsupported language' });
  }
  
  const starterCode = SUPPORTED_LANGUAGES[language].starterCode;
  
  res.json({
    session_id: sessionId,
    language: language,
    join_url: `https://codemirror-client.vercel.app/embed/${sessionId}?role=${role}&language=${language}`,
    embed_iframe: `<iframe src="https://codemirror-client.vercel.app/embed/${sessionId}?role=${role}&language=${language}" width="100%" height="600" allow="microphone"></iframe>`,
    starter_code: starterCode
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
    supportedLanguages: Object.keys(SUPPORTED_LANGUAGES)
  });
});

app.get('/api/health', (req, res) => {
  console.log('❤️ GET /api/health request received');
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    sessions: Object.keys(sessions).length,
    supportedLanguages: Object.keys(SUPPORTED_LANGUAGES).length
  });
});

// 🔥 API ДЛЯ ПОЛУЧЕНИЯ ИНФОРМАЦИИ О ЯЗЫКАХ
app.get('/api/languages', (req, res) => {
  res.json(SUPPORTED_LANGUAGES);
});

app.get('/api/languages/:language', (req, res) => {
  const language = req.params.language;
  if (!SUPPORTED_LANGUAGES[language]) {
    return res.status(404).json({ error: 'Language not supported' });
  }
  res.json(SUPPORTED_LANGUAGES[language]);
});

// 🔥 ДОБАВИТЬ НОВЫЕ API ДЛЯ ИСТОРИИ
app.get('/api/sessions/:sessionId/history', async (req, res) => {
  try {
    const session = await Session.findOne({
      where: { sessionId: req.params.sessionId },
      include: [SessionEvent, AIHint],
      order: [[SessionEvent, 'timestamp', 'ASC']]
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('❌ Failed to get session history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/mentor/:mentorId/sessions', async (req, res) => {
  try {
    const mentorSessions = await Session.findAll({
      where: { mentorId: req.params.mentorId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(mentorSessions);
  } catch (error) {
    console.error('❌ Failed to get mentor sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🔥 ДОБАВИТЬ API ДЛЯ ДИАГНОСТИКИ
app.get('/api/debug/sessions', (req, res) => {
  const sessionInfo = Object.entries(sessions).map(([sessionId, sessionData]) => ({
    sessionId,
    userCount: sessionData.users.length,
    studentCanEdit: sessionData.studentCanEdit,
    language: sessionData.language,
    codeLength: sessionData.code?.length,
    users: sessionData.users
  }));
  
  res.json({
    totalSessions: Object.keys(sessions).length,
    supportedLanguages: Object.keys(SUPPORTED_LANGUAGES),
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
    codePreview: session.code ? session.code.substring(0, 200) + '...' : 'empty'
  });
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
        lastActivity: Date.now()
      };
      
      try {
        // 🔥 ПРОВЕРЯЕМ, ЧТО СЕССИИ ЕЩЁ НЕТ В БАЗЕ ДАННЫХ
        const existingSession = await Session.findOne({ where: { sessionId } });
        if (!existingSession) {
          const session = await Session.create({
            sessionId,
            mentorId: socket.id,
            language: normalizedLanguage,
            initialCode: starterCode,
            status: 'active'
          });
          
          await SessionEvent.create({
            type: 'session_start',
            userId: socket.id,
            data: { sessionId, language: normalizedLanguage },
            SessionId: session.id
          });
          
          console.log(`🆕 Created ${normalizedLanguage} session in database: ${sessionId}`);
        } else {
          console.log(`📁 Session already exists in database: ${sessionId}`);
        }
      } catch (error) {
        console.error('❌ Failed to create session:', error);
      }
    }
    
    sessions[sessionId].users.push(socket.id);
    socket.join(sessionId);
    
    // 🔥 ОТПРАВИТЬ ТЕКУЩЕЕ СОСТОЯНИЕ НОВОМУ ПОЛЬЗОВАТЕЛЮ
    socket.emit('code-update', sessions[sessionId].code);
    socket.emit('student-edit-permission', sessions[sessionId].studentCanEdit);
    socket.emit('language-changed', { 
      language: sessions[sessionId].language
    });
    
    socket.to(sessionId).emit('user-joined', { userId: socket.id });
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
    console.log(`📄 Code length: ${data.code?.length} chars`);
    
    // 🔥 ОБНОВИТЬ КОД В СЕССИИ
    if (sessions[data.sessionId]) {
      sessions[data.sessionId].code = data.code;
      sessions[data.sessionId].lastActivity = Date.now();
    }
    
    // 🔥 ПЕРЕСЛАТЬ ВСЕМ УЧАСТНИКАМ СЕССИИ (ВКЛЮЧАЯ МЕНТОРА)
    io.to(data.sessionId).emit('code-update', data.code);
    
    // Логируем для отладки
    const preview = data.code ? data.code.substring(0, 50) + '...' : 'empty';
    console.log(`📋 Student code preview: ${preview}`);
  });

  // 🔥 ИСПРАВЛЕННЫЙ ОБРАБОТЧИК code-change
  socket.on('code-change', async (data) => {
    console.log(`📝 Code change in ${data.sessionId} by ${socket.id}`);
    console.log(`📄 Code length: ${data.code?.length} chars`);
    
    // 🔥 ОБНОВИТЬ КОД В СЕССИИ
    if (sessions[data.sessionId]) {
      sessions[data.sessionId].code = data.code;
      sessions[data.sessionId].lastActivity = Date.now();
    }
    
    // 🔥 ПЕРЕСЛАТЬ ВСЕМ, КРОМЕ ОТПРАВИТЕЛЯ
    socket.to(data.sessionId).emit('code-update', data.code);
    
    // 🔥 СОХРАНЕНИЕ ИЗМЕНЕНИЙ КОДА В БАЗУ ДАННЫХ
    try {
      const session = await Session.findOne({ where: { sessionId: data.sessionId } });
      if (session) {
        await SessionEvent.create({
          type: 'code_change',
          userId: socket.id,
          data: { 
            codeLength: data.code?.length,
            lines: data.code?.split('\n').length,
            language: sessions[data.sessionId]?.language || 'javascript'
          },
          SessionId: session.id
        });
        
        // Обновляем финальный код в сессии
        await session.update({ finalCode: data.code });
        
        // Логируем для отладки (первые 100 символов)
        const preview = data.code ? data.code.substring(0, 100) + '...' : 'empty';
        console.log(`📋 Code preview: ${preview}`);
      }
    } catch (error) {
      console.error('❌ Failed to save code change:', error);
    }
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
        code: sessions[sessionId].code
      });
      
      // Обновляем в базе данных
      try {
        Session.findOne({ where: { sessionId } }).then(session => {
          if (session) {
            session.update({
              language: language,
              initialCode: sessions[sessionId].code
            });
          }
        });
      } catch (error) {
        console.error('❌ Failed to update session language:', error);
      }
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
        language: sessions[data.sessionId].language
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
      userCount: sessions[data.sessionId].users.length
    } : null;
    
    socket.emit('session-state', sessionState);
  });

  // 🔥 ДОБАВИТЬ НОВЫЙ ОБРАБОТЧИК ДЛЯ AI-ПОДСКАЗОК
  socket.on('ai-hint-generated', async (data) => {
    console.log(`🧠 AI hint in ${data.sessionId} for ${data.language || 'javascript'}`);
    
    try {
      const session = await Session.findOne({ where: { sessionId: data.sessionId } });
      if (session) {
        await AIHint.create({
          hintText: data.hint,
          confidence: data.confidence || 0.5,
          language: data.language || 'javascript',
          SessionId: session.id
        });
        
        await SessionEvent.create({
          type: 'ai_hint',
          userId: 'ai_system',
          data: { 
            hint: data.hint,
            language: data.language || 'javascript'
          },
          SessionId: session.id
        });
      }
    } catch (error) {
      console.error('❌ Failed to save AI hint:', error);
    }
  });

  // 🔥 ДОБАВИТЬ ОБРАБОТЧИК ЗАВЕРШЕНИЯ СЕССИИ
  socket.on('end-session', async (data) => {
    console.log(`🔚 Ending session: ${data.sessionId}`);
    
    try {
      const session = await Session.findOne({ where: { sessionId: data.sessionId } });
      if (session) {
        const duration = Math.floor((new Date() - session.createdAt) / 1000);
        await session.update({ 
          status: 'completed',
          duration: duration
        });
        
        await SessionEvent.create({
          type: 'session_end',
          userId: socket.id,
          data: { 
            reason: data.reason, 
            duration,
            language: sessions[data.sessionId]?.language || 'javascript'
          },
          SessionId: session.id
        });
        
        console.log(`✅ Session ${data.sessionId} completed, duration: ${duration}s, language: ${sessions[data.sessionId]?.language}`);
      }
    } catch (error) {
      console.error('❌ Failed to end session:', error);
    }
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
    console.log(`🖱️ Cursor move by ${data.userId} in ${data.sessionId}`);
    console.log(`📍 Position: line ${data.position?.lineNumber}, column ${data.position?.column}`);
    
    socket.to(data.sessionId).emit('cursor-update', { 
      position: data.position, 
      userId: data.userId 
    });
  });

  // 🔥 ИСПРАВЛЕННЫЙ ОБРАБОТЧИК DISCONNECT
  socket.on('disconnect', async (reason) => {
    console.log('🔴 Отключился:', socket.id, 'Reason:', reason);
    
    if (socket.sessionId && sessions[socket.sessionId]) {
      // 🔥 ПРАВИЛЬНОЕ УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ИЗ СЕССИИ
      sessions[socket.sessionId].users = sessions[socket.sessionId].users.filter(
        userId => userId !== socket.id
      );
      
      // Уведомить других участников
      socket.to(socket.sessionId).emit('user-left', { userId: socket.id });
      socket.to(socket.sessionId).emit('user-audio-status', { 
        userId: socket.id, 
        active: false 
      });
      
      console.log(`👥 Remaining users in ${socket.sessionId}:`, sessions[socket.sessionId].users.length);
      
      // 🔥 УДАЛЯЕМ СЕССИЮ ТОЛЬКО ЕСЛИ НЕТ ПОЛЬЗОВАТЕЛЕЙ
      if (sessions[socket.sessionId].users.length === 0) {
        // Сохраняем финальное состояние перед удалением
        try {
          const session = await Session.findOne({ 
            where: { sessionId: socket.sessionId } 
          });
          if (session) {
            await session.update({ 
              status: 'completed',
              duration: Math.floor((new Date() - session.createdAt) / 1000)
            });
          }
        } catch (error) {
          console.error('❌ Failed to complete session:', error);
        }
        
        delete sessions[socket.sessionId];
        console.log(`🗑️ Session ${socket.sessionId} deleted (no users)`);
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
  console.log('🔄 Active sessions:', Object.keys(sessions).length);
  Object.entries(sessions).forEach(([sessionId, sessionData]) => {
    console.log(`   📍 ${sessionId}: ${sessionData.users.length} users, language: ${sessionData.language}, code: ${sessionData.code?.length} chars, edit: ${sessionData.studentCanEdit}`);
  });
}, 30000);

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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SERVER STARTED on port ${PORT}`);
  console.log(`✅ Health check: http://0.0.0.0:${PORT}/`);
  console.log(`✅ WebSocket: ws://0.0.0.0:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Debug endpoints available:`);
  console.log(`   📊 Sessions: http://0.0.0.0:${PORT}/api/debug/sessions`);
  console.log(`   🌍 Languages: http://0.0.0.0:${PORT}/api/languages`);
}).on('error', (error) => {
  console.error('❌ FAILED to start server:', error);
  process.exit(1);
});

// Экспортируем для тестирования
export { app, io, sessions, SUPPORTED_LANGUAGES };