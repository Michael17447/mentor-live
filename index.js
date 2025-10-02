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

const sessions = {};

// === API для интеграции с платформами ===
app.post('/api/sessions', (req, res) => {
  console.log('📝 Creating new session:', req.body);
  const { course_id, lesson_id, user_id, role = 'student' } = req.body;
  const sessionId = uuidv4().substring(0, 8).toUpperCase();
  
  res.json({
    session_id: sessionId,
    join_url: `https://codemirror-client.vercel.app/embed/${sessionId}?role=${role}`,
    embed_iframe: `<iframe src="https://codemirror-client.vercel.app/embed/${sessionId}?role=${role}" width="100%" height="600" allow="microphone"></iframe>`
  });
});

// Health check endpoints
app.get('/', (req, res) => {
  console.log('🏠 GET / request received');
  res.json({ 
    status: 'OK', 
    message: 'CodeMentor Server is running',
    timestamp: new Date().toISOString(),
    socketConnections: Object.keys(sessions).length
  });
});

app.get('/api/health', (req, res) => {
  console.log('❤️ GET /api/health request received');
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    sessions: Object.keys(sessions).length
  });
});

// === WebSocket для синхронизации ===
io.on('connection', (socket) => {
  console.log('🔌 Подключился:', socket.id);
  console.log('📍 Headers origin:', socket.handshake.headers.origin);
  console.log('📍 User agent:', socket.handshake.headers['user-agent']);

  socket.on('join-session', (sessionId) => {
    console.log(`📥 ${socket.id} joined session: ${sessionId}`);
    socket.sessionId = sessionId;
    
    if (!sessions[sessionId]) {
      sessions[sessionId] = [];
      console.log(`🆕 Created new session: ${sessionId}`);
    }
    
    sessions[sessionId].push(socket);
    socket.join(sessionId);
    
    // Уведомляем других участников сессии
    socket.to(sessionId).emit('user-joined', { userId: socket.id });
    console.log(`👥 Users in session ${sessionId}:`, sessions[sessionId].length);
  });

  // НОВЫЙ ОБРАБОТЧИК: переключение разрешения на редактирование для ученика
  socket.on('toggle-student-edit', (data) => {
    console.log(`✏️ Student edit permission: ${data.allowEdit} in ${data.sessionId}`);
    socket.to(data.sessionId).emit('student-edit-permission', data.allowEdit);
  });

  // НОВЫЙ ОБРАБОТЧИК: изменения кода от ученика
  socket.on('student-code-change', (data) => {
    console.log(`📝 Student ${data.studentId} changed code in ${data.sessionId}`);
    console.log(`📄 Code length: ${data.code?.length} chars`);
    
    // Пересылаем изменения ментору и другим ученикам
    socket.to(data.sessionId).emit('student-code-change', { 
      code: data.code, 
      studentId: data.studentId 
    });
    
    // Логируем для отладки
    const preview = data.code ? data.code.substring(0, 100) + '...' : 'empty';
    console.log(`📋 Student code preview: ${preview}`);
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

  socket.on('code-change', (data) => {
    console.log(`📝 Code change in ${data.sessionId} by ${socket.id}`);
    console.log(`📄 Code length: ${data.code?.length} chars`);
    
    socket.to(data.sessionId).emit('code-update', data.code);
    
    // Логируем для отладки (первые 100 символов)
    const preview = data.code ? data.code.substring(0, 100) + '...' : 'empty';
    console.log(`📋 Code preview: ${preview}`);
  });

  socket.on('cursor-move', (data) => {
    console.log(`🖱️ Cursor move by ${data.userId} in ${data.sessionId}`);
    console.log(`📍 Position: line ${data.position?.lineNumber}, column ${data.position?.column}`);
    
    socket.to(data.sessionId).emit('cursor-update', { 
      position: data.position, 
      userId: data.userId 
    });
  });

  socket.on('disconnect', (reason) => {
    console.log('🔴 Отключился:', socket.id, 'Reason:', reason);
    
    if (socket.sessionId) {
      sessions[socket.sessionId] = sessions[socket.sessionId].filter(s => s.id !== socket.id);
      
      // Удаляем пустые сессии
      if (sessions[socket.sessionId].length === 0) {
        delete sessions[socket.sessionId];
        console.log(`🗑️ Session ${socket.sessionId} deleted (no users)`);
      }
      
      socket.to(socket.sessionId).emit('user-left', { userId: socket.id });
      socket.to(socket.sessionId).emit('user-audio-status', { 
        userId: socket.id, 
        active: false 
      });
      
      console.log(`👥 Remaining users in ${socket.sessionId}:`, sessions[socket.sessionId]?.length || 0);
    }
  });

  // Обработка ошибок сокета
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SERVER STARTED on port ${PORT}`);
  console.log(`✅ Health check: http://0.0.0.0:${PORT}/`);
  console.log(`✅ WebSocket: ws://0.0.0.0:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
}).on('error', (error) => {
  console.error('❌ FAILED to start server:', error);
  process.exit(1);
});

// Экспортируем для тестирования
export { app, io, sessions };