// backend/index.js (CommonJS)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true, service: 'aivana-backend' }));

// simple assistant HTTP endpoint (demo)
app.post('/api/assistant', (req, res) => {
  const prompt = (req.body && req.body.prompt) || '';
  const reply = prompt ? `Aivana (demo): Here's an answer to "${prompt}"` : 'Aivana (demo): Hello!';
  return res.json({ reply });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', socket => {
  console.log('socket connected', socket.id);
  socket.on('message', msg => {
    // echo + demo reply
    socket.emit('reply', `Aivana (demo): I heard — "${msg}"`);
  });
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Aivana backend listening on ${PORT}`));
