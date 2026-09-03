import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import { RoomManager } from './game/RoomManager.js';
import { ROLE_DEFINITIONS } from './game/RoleManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const roomManager = new RoomManager();

// API lấy thông tin vai trò
app.get('/api/roles', (req, res) => {
  res.json(ROLE_DEFINITIONS);
});

// API kiểm tra thông tin phòng
app.get('/api/room/:code', (req, res) => {
  const room = roomManager.getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ exists: false, message: 'Phòng không tồn tại' });
  }
  res.json({
    exists: true,
    code: room.code,
    playerCount: room.players.length,
    phase: room.gameState.phase,
  });
});

// Phục vụ frontend nếu đã build
const serverPublic = path.join(__dirname, '../public');
const clientDist = path.join(__dirname, '../../client/dist');
const staticDir = fs.existsSync(serverPublic) ? serverPublic : clientDist;

if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

// Xử lý WebSocket
io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // 1. Tạo phòng
  socket.on('room:create', ({ name, avatar }, callback) => {
    try {
      const room = roomManager.createRoom(socket, name, avatar);
      console.log(`[Room Created] Code: ${room.code} by ${name}`);
      if (callback) callback({ success: true, roomCode: room.code });
    } catch (err) {
      console.error('Error creating room:', err);
      if (callback) callback({ success: false, message: 'Không thể tạo phòng' });
    }
  });

  // 2. Tham gia phòng
  socket.on('room:join', ({ code, name, avatar }, callback) => {
    try {
      const result = roomManager.joinRoom(code, socket, name, avatar);
      if (callback) callback(result);
    } catch (err) {
      console.error('Error joining room:', err);
      if (callback) callback({ success: false, message: 'Lỗi khi vào phòng' });
    }
  });

  // 3. Rời phòng
  socket.on('room:leave', () => {
    roomManager.leaveRoom(socket.id);
  });

  // 4. Thêm Bot
  socket.on('room:add_bot', () => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room && room.hostId === socket.id) {
      room.addBot();
    }
  });

  // 5. Xóa Bot
  socket.on('room:remove_bot', ({ botId }) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room && room.hostId === socket.id) {
      room.removeBot(botId);
    }
  });

  // 6. Sẵn sàng / Hủy sẵn sàng
  socket.on('room:toggle_ready', () => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      room.toggleReady(socket.id);
    }
  });

  // 7. Cập nhật cấu hình phòng
  socket.on('room:update_config', (newConfig) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      room.updateConfig(socket.id, newConfig);
    }
  });

  // 8. Bắt đầu game
  socket.on('game:start', (callback) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (!room) {
      if (callback) callback({ success: false, message: 'Không tìm thấy phòng' });
      return;
    }
    const result = room.startGame(socket.id);
    if (callback) callback(result);
  });

  // 9. Chơi lại (Restart to Lobby)
  socket.on('game:restart', (callback) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      const success = room.restartGame(socket.id);
      if (callback) callback({ success });
    }
  });

  // 10. Hành động ban đêm
  socket.on('game:night_action', (actionData, callback) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      const player = room.players.find((p) => p.id === socket.id);
      if (player) {
        const success = room.gameState.handleNightAction(player, actionData);
        if (callback) callback({ success });
      }
    }
  });

  // 11. Bỏ qua thảo luận ban ngày (Skip Discussion)
  socket.on('game:skip_discussion', () => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      const player = room.players.find((p) => p.id === socket.id);
      if (player) {
        room.gameState.handleSkipDiscussion(player);
      }
    }
  });

  // 12. Bỏ phiếu ban ngày (Vote hanging)
  socket.on('game:day_vote', ({ targetId }, callback) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      const player = room.players.find((p) => p.id === socket.id);
      if (player) {
        const success = room.gameState.handleDayVote(player, targetId);
        if (callback) callback({ success });
      }
    }
  });

  // 13. Thợ săn bắn trả thù
  socket.on('game:hunter_shot', ({ targetId }, callback) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      const success = room.gameState.handleHunterShot(socket.id, targetId);
      if (callback) callback({ success });
    }
  });

  // 14. Gửi tin nhắn chat
  socket.on('chat:send', ({ text, channel }) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      room.handleChatMessage(socket.id, text, channel || 'public');
    }
  });

  // 14b. Thao tác Quản Trò (Game Master Action)
  socket.on('moderator:action', ({ action, data }, callback) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room && room.hostId === socket.id) {
      const success = room.moderatorAction(socket.id, action, data);
      if (callback) callback({ success });
    } else {
      if (callback) callback({ success: false, message: 'Chỉ Chủ phòng mới có quyền thao tác!' });
    }
  });

  // 15. WebRTC Voice Chat Signaling
  socket.on('voice:join', () => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      const player = room.players.find((p) => p.id === socket.id);
      if (player) {
        player.inVoice = true;
        player.isMuted = false;
        player.isSpeaking = false;
      }
      // Danh sách các peer khác đang trong voice (trừ bản thân và trừ bot)
      const peers = room.players
        .filter((p) => !p.isBot && p.id !== socket.id && p.inVoice)
        .map((p) => p.id);

      socket.emit('voice:all_peers', { peers });

      // Thông báo cho các peer khác trong phòng
      for (const p of room.players) {
        if (p.socket && p.id !== socket.id) {
          p.socket.emit('voice:peer_joined', { peerId: socket.id });
        }
        if (p.socket) {
          p.socket.emit('voice:state_sync', {
            voiceStates: room.players.filter((item) => !item.isBot).map((item) => ({
              id: item.id,
              inVoice: !!item.inVoice,
              isMuted: !!item.isMuted,
              isSpeaking: !!item.isSpeaking,
            })),
          });
        }
      }
    }
  });

  socket.on('voice:signal', ({ targetId, signal }) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      const target = room.players.find((p) => p.id === targetId);
      if (target && target.socket) {
        target.socket.emit('voice:signal', {
          senderId: socket.id,
          signal,
        });
      }
    }
  });

  socket.on('voice:state_change', ({ isMuted, isSpeaking }) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      const player = room.players.find((p) => p.id === socket.id);
      if (player) {
        if (typeof isMuted === 'boolean') player.isMuted = isMuted;
        if (typeof isSpeaking === 'boolean') player.isSpeaking = isSpeaking;
      }
      for (const p of room.players) {
        if (p.socket) {
          p.socket.emit('voice:player_state_changed', {
            playerId: socket.id,
            isMuted: player ? player.isMuted : false,
            isSpeaking: player ? player.isSpeaking : false,
            inVoice: player ? player.inVoice : false,
          });
        }
      }
    }
  });

  socket.on('voice:leave', () => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      const player = room.players.find((p) => p.id === socket.id);
      if (player) {
        player.inVoice = false;
        player.isSpeaking = false;
      }
      for (const p of room.players) {
        if (p.socket && p.id !== socket.id) {
          p.socket.emit('voice:peer_left', { peerId: socket.id });
        }
        if (p.socket) {
          p.socket.emit('voice:player_state_changed', {
            playerId: socket.id,
            inVoice: false,
            isSpeaking: false,
          });
        }
      }
    }
  });

  // Ngắt kết nối
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      for (const p of room.players) {
        if (p.socket && p.id !== socket.id) {
          p.socket.emit('voice:peer_left', { peerId: socket.id });
        }
      }
    }
    roomManager.leaveRoom(socket.id);
  });
});

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`=============================================================`);
  console.log(`🐺 MA SÓI ONLINE (JOJO TAROT EDITION) ĐÃ SẴN SÀNG!`);
  console.log(`=============================================================`);
  console.log(`💻 MÁY TÍNH CỦA BẠN:   http://localhost:${PORT}`);
  console.log(`📱 BẠN BÈ CÙNG WI-FI:   http://${localIp}:${PORT}`);
  console.log(`🌐 BẠN BÈ Ở XA (INTERNET):`);
  console.log(`   👉 Mở thêm 1 cửa sổ Terminal mới và chạy:`);
  console.log(`      npx localtunnel --port ${PORT}`);
  console.log(`=============================================================`);
});

