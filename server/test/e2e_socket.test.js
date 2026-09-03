import assert from 'assert';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as ClientIO } from 'socket.io-client';
import { RoomManager } from '../src/game/RoomManager.js';

console.log('--- BẮT ĐẦU KIỂM THỬ TÍCH HỢP SOCKET.IO REALTIME ---');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const roomManager = new RoomManager();

// Setup socket handlers
io.on('connection', (socket) => {
  socket.on('room:create', ({ name, avatar }, callback) => {
    const room = roomManager.createRoom(socket, name, avatar);
    if (callback) callback({ success: true, roomCode: room.code });
  });

  socket.on('room:join', ({ code, name, avatar }, callback) => {
    const res = roomManager.joinRoom(code, socket, name, avatar);
    if (callback) callback(res);
  });

  socket.on('room:add_bot', () => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room && room.hostId === socket.id) room.addBot();
  });

  socket.on('room:toggle_ready', () => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) room.toggleReady(socket.id);
  });

  socket.on('game:start', (callback) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      const res = room.startGame(socket.id);
      if (callback) callback(res);
    }
  });

  socket.on('chat:send', ({ text, channel }) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) room.handleChatMessage(socket.id, text, channel);
  });

  socket.on('disconnect', () => {
    roomManager.leaveRoom(socket.id);
  });
});

server.listen(0, async () => {
  const TEST_PORT = server.address().port;
  console.log(`Test server running on port ${TEST_PORT}`);

  try {
    // 1. Client Host kết nối
    const client1 = ClientIO(`http://localhost:${TEST_PORT}`, { reconnection: false });

    await new Promise((resolve) => {
      client1.on('connect', () => {
        console.log('✓ Host socket đã kết nối thành công');
        resolve();
      });
    });

    // 2. Tạo phòng
    const roomCode = await new Promise((resolve) => {
      client1.emit('room:create', { name: 'Host Test', avatar: '👑' }, (res) => {
        assert.strictEqual(res.success, true);
        console.log(`✓ Tạo phòng thành công với mã: ${res.roomCode}`);
        resolve(res.roomCode);
      });
    });

    // 3. Client 2 tham gia phòng
    const client2 = ClientIO(`http://localhost:${TEST_PORT}`, { reconnection: false });
    await new Promise((resolve) => {
      client2.on('connect', () => {
        client2.emit('room:join', { code: roomCode, name: 'Player 2', avatar: '🧑‍🌾' }, (res) => {
          assert.strictEqual(res.success, true);
          console.log('✓ Player 2 vào phòng thành công');
          resolve();
        });
      });
    });

    // 4. Host thêm 2 Bot
    client1.emit('room:add_bot');
    client1.emit('room:add_bot');

    // Chờ state update có 4 người chơi
    await new Promise((resolve) => {
      const check = (data) => {
        if (data.state.players.length === 4) {
          console.log('✓ Phòng đã đủ 4 người chơi (2 người thật + 2 bot)');
          client1.off('game:state_update', check);
          resolve();
        }
      };
      client1.on('game:state_update', check);
    });

    // 5. Test Chat
    const chatReceived = new Promise((resolve) => {
      client2.on('chat:message', (msg) => {
        assert.strictEqual(msg.text, 'Xin chào ngôi làng!');
        console.log('✓ Player 2 nhận được tin nhắn chat realtime từ Host');
        resolve();
      });
    });
    client1.emit('chat:send', { text: 'Xin chào ngôi làng!', channel: 'public' });
    await chatReceived;

    // 5.5 Player 2 bấm Sẵn Sàng
    client2.emit('room:toggle_ready');
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 6. Host bắt đầu game & nhận vai trò
    const startingPromise = new Promise((resolve) => {
      client1.on('game:state_update', (data) => {
        if (data.state.phase === 'STARTING') {
          assert(data.myRole !== null, 'Người chơi phải được phân vai bí mật');
          console.log(`✓ Phân vai thành công! Vai trò của Host: ${data.myRole}`);
          resolve();
        }
      });
    });

    await new Promise((resolve) => {
      client1.emit('game:start', (res) => {
        assert.strictEqual(res.success, true);
        console.log('✓ Bắt đầu game thành công!');
        resolve();
      });
    });

    await startingPromise;

    console.log('=============================================');
    console.log('🎉 TEST E2E SOCKET.IO THỜI GIAN THỰC HOÀN TOÀN ĐẠT! 🎉');
    console.log('=============================================');

    client1.close();
    client2.close();
    io.close();
    server.close();
    setTimeout(() => process.exit(0), 100);
  } catch (err) {
    console.error('Test thất bại:', err);
    process.exit(1);
  }
});
