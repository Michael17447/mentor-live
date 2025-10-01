import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

console.log('🚀 Starting CodeMentor server...');
console.log('Node version:', process.version);

const app = express();

// ⚠️ Разрешаем CORS для образовательных платформ
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://stepik.org',
    'https://*.stepik.org',
    'https://*.vercel.app',
    'https://*.railway.app',
    '*' // Добавляем все домены для тестирования
  ],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });

const sessions = {};

// === API для интеграции с платформами ===
app.post('/api/sessions', (req, res) => {
  const { course_id, lesson_id, user_id, role = 'student' } = req.body;
  const sessionId = uuidv4().substring(0, 8).toUpperCase();
  // Опционально: сохрани в БД
  res.json({
    session_id: sessionId,
    join_url: `https://codemirror-client.vercel.app/embed/${sessionId}?role=${role}`,
    embed_iframe: `<iframe src="https://codemirror-client.vercel.app/embed/${sessionId}?role=${role}" width="100%" height="600" allow="microphone"></iframe>`
  });
});

// Health check endpoints (ДОБАВЛЕНО)
app.get('/', (req, res) => {
  console.log('GET / request received');
  res.json({ 
    status: 'OK', 
    message: 'CodeMentor Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  console.log('GET /api/health request received');
  res.json({ status: 'healthy' });
});

// === WebSocket для синхронизации ===
io.on('connection', (socket) => {
  console.log('🔌 Подключился:', socket.id);

  socket.on('join-session', (sessionId) => {
    socket.sessionId = sessionId;
    if (!sessions[sessionId]) sessions[sessionId] = [];
    sessions[sessionId].push(socket);
    socket.join(sessionId);
    socket.to(sessionId).emit('user-joined', socket.id);
  });

  socket.on('signal', ({ sessionId, signal }) => {
    socket.to(sessionId).emit('signal', { signal, from: socket.id });
  });

  socket.on('user-audio-status', ({ sessionId, active, userId }) => {
    socket.to(sessionId).emit('user-audio-status', { userId, active });
  });

  socket.on('code-change', ({ sessionId, code }) => {
    socket.to(sessionId).emit('code-update', code);
  });

  socket.on('cursor-move', ({ sessionId, position, userId }) => {
    socket.to(sessionId).emit('cursor-update', { position, userId });
  });

  socket.on('disconnect', () => {
    if (!socket.sessionId) return;
    sessions[socket.sessionId] = sessions[socket.sessionId].filter(s => s.id !== socket.id);
    socket.to(socket.sessionId).emit('user-left', socket.id);
    socket.to(socket.sessionId).emit('user-audio-status', { userId: socket.id, active: false });
  });
});

// Обработка ошибок
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Запуск сервера с диагностикой
const PORT = process.env.PORT || 4000;

console.log('🔧 Server configuration:');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SERVER STARTED on port ${PORT}`);
  console.log(`✅ Health check available at: http://0.0.0.0:${PORT}/`);
}).on('error', (error) => {
  console.error('❌ FAILED to start server:', error);
  process.exit(1);
});