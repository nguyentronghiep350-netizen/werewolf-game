import assert from 'assert';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as ClientIO } from 'socket.io-client';
import { RoomManager } from '../src/game/RoomManager.js';
import { ROLES } from '../src/game/RoleManager.js';
import { AI_TEAM } from './ai_team_simulation.js';

console.log('================================================================');
console.log('🌐 KIỂM THỬ E2E THỜI GIAN THỰC: 9 SOCKET CLIENT KẾT NỐI ĐỒNG THỜI 🌐');
console.log('================================================================');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const roomManager = new RoomManager();

// Cấu hình Socket.IO server tương thích với client
io.on('connection', (socket) => {
  socket.on('room:create', ({ name, avatar }, callback) => {
    const room = roomManager.createRoom(socket, name, avatar);
    if (callback) callback({ success: true, roomCode: room.code });
  });

  socket.on('room:join', ({ code, name, avatar }, callback) => {
    const res = roomManager.joinRoom(code, socket, name, avatar);
    if (callback) callback(res);
  });

  socket.on('room:toggle_ready', () => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) room.toggleReady(socket.id);
  });

  socket.on('room:update_config', (newConfig) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) room.updateConfig(socket.id, newConfig);
  });

  socket.on('game:start', (callback) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      const res = room.startGame(socket.id);
      if (callback) callback(res);
    }
  });

  socket.on('night:action', (actionData) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      const player = room.players.find((p) => p.id === socket.id);
      if (player) {
        room.gameState.handleNightAction(player, actionData);
      }
    }
  });

  socket.on('day:vote', ({ targetId }) => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      const player = room.players.find((p) => p.id === socket.id);
      if (player) {
        room.gameState.handleDayVote(player, targetId);
      }
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
  console.log(`✓ Server Socket.IO E2E đang chạy tại cổng ảo: ${TEST_PORT}`);

  const clients = [];

  try {
    // 1. Kết nối Client 1 (Minh Trí - Host 👑)
    console.log('[Bước 1] Host Minh Trí (ai_1) kết nối và tạo phòng...');
    const hostClient = ClientIO(`http://localhost:${TEST_PORT}`, { reconnection: false });
    clients.push(hostClient);

    await new Promise((resolve) => hostClient.on('connect', resolve));
    console.log('   ✓ Host socket đã kết nối thành công');

    const roomCode = await new Promise((resolve) => {
      hostClient.emit('room:create', { name: AI_TEAM[0].name, avatar: AI_TEAM[0].avatar }, (res) => {
        assert.strictEqual(res.success, true);
        console.log(`   ✓ Phòng đã được tạo với mã: ${res.roomCode}`);
        resolve(res.roomCode);
      });
    });

    // 2. Lắng nghe cập nhật phòng từ Host trước khi các client khác tham gia
    let latestPlayerCount = 1;
    hostClient.on('game:state_update', (data) => {
      latestPlayerCount = data.state.players.length;
    });

    console.log('[Bước 2] 8 thành viên AI còn lại kết nối và tham gia phòng...');
    for (let i = 1; i < AI_TEAM.length; i++) {
      const persona = AI_TEAM[i];
      const client = ClientIO(`http://localhost:${TEST_PORT}`, { reconnection: false });
      clients.push(client);

      await new Promise((resolve) => client.on('connect', resolve));
      await new Promise((resolve) => {
        client.emit('room:join', { code: roomCode, name: persona.name, avatar: persona.avatar }, (res) => {
          assert.strictEqual(res.success, true);
          resolve();
        });
      });
      console.log(`   ✓ [${i + 1}/9] ${persona.name} (${persona.avatar}) đã vào phòng ${roomCode}`);
    }

    assert.strictEqual(clients.length, 9, 'Đủ 9 socket clients');
    console.log('✓ Đủ 9 client kết nối thành công!');

    // 3. Kiểm tra đồng bộ danh sách 9 người chơi
    console.log('[Bước 3] Kiểm tra đồng bộ danh sách 9 người chơi qua broadcast...');
    if (latestPlayerCount < 9) {
      await new Promise((resolve) => {
        const checkState = (data) => {
          if (data.state.players.length === 9) {
            hostClient.off('game:state_update', checkState);
            resolve();
          }
        };
        hostClient.on('game:state_update', checkState);
      });
    }
    console.log(`   ✓ Broadcast xác nhận: Phòng có đủ 9 người chơi!`);

    // 4. 8 Client thành viên bấm Sẵn Sàng (Toggle Ready)
    console.log('[Bước 4] 8 AI thành viên bấm Sẵn Sàng...');
    for (let i = 1; i < clients.length; i++) {
      clients[i].emit('room:toggle_ready');
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    // 5. Kiểm tra Chat Realtime công khai và kênh sói
    console.log('[Bước 5] Kiểm tra Chat công khai giữa 9 thành viên...');
    const publicChatPromise = new Promise((resolve) => {
      clients[1].on('chat:message', (msg) => {
        assert.strictEqual(msg.text, 'Chào cả làng, Minh Trí đây! Chúc mọi người chơi vui vẻ!');
        console.log(`   ✓ Client 2 nhận được chat công khai từ Host: "${msg.text}"`);
        resolve();
      });
    });
    hostClient.emit('chat:send', { text: 'Chào cả làng, Minh Trí đây! Chúc mọi người chơi vui vẻ!', channel: 'public' });
    await publicChatPromise;

    // 6. Host cấu hình chế độ Cổ điển (9 người: 2 sói, 1 tiên tri, 1 bảo vệ, 1 phù thủy, 1 thợ săn, 1 cupid, 2 dân)
    console.log('[Bước 6] Cấu hình phòng 9 người và Bắt đầu game...');
    hostClient.emit('room:update_config', {
      mode: 'classic',
      roleConfig: {
        [ROLES.WEREWOLF]: 2,
        [ROLES.SEER]: 1,
        [ROLES.BODYGUARD]: 1,
        [ROLES.WITCH]: 1,
        [ROLES.HUNTER]: 1,
        [ROLES.CUPID]: 1,
        [ROLES.VILLAGER]: 2,
      },
    });

    // Lắng nghe sự kiện bắt đầu game và phân vai bí mật cho từng socket
    const rolesReceived = new Map();
    const rolePromises = clients.map((client, idx) => {
      return new Promise((resolve) => {
        client.on('game:state_update', (data) => {
          if (data.state.phase === 'STARTING' && data.myRole) {
            rolesReceived.set(client.id, data.myRole);
            resolve({ id: client.id, role: data.myRole, index: idx });
          }
        });
      });
    });

    const startRes = await new Promise((resolve) => {
      hostClient.emit('game:start', (res) => {
        assert.strictEqual(res.success, true);
        console.log('   ✓ Host bắt đầu game thành công!');
        resolve(res);
      });
    });

    const assignedRoles = await Promise.all(rolePromises);
    assert.strictEqual(assignedRoles.length, 9, 'Tất cả 9 socket phải nhận được vai trò bí mật');

    const roleCounts = {};
    for (const item of assignedRoles) {
      roleCounts[item.role] = (roleCounts[item.role] || 0) + 1;
    }
    console.log('   ✓ Phân bổ vai trò chính xác cho 9 sockets:', roleCounts);
    assert.strictEqual(roleCounts[ROLES.WEREWOLF], 2, 'Phải có 2 Sói');
    assert.strictEqual(roleCounts[ROLES.SEER], 1, 'Phải có 1 Tiên Tri');
    assert.strictEqual(roleCounts[ROLES.BODYGUARD], 1, 'Phải có 1 Bảo Vệ');
    assert.strictEqual(roleCounts[ROLES.WITCH], 1, 'Phải có 1 Phù Thủy');

    // 7. Thử nghiệm gửi hành động qua socket khi vào ban đêm
    console.log('[Bước 7] Chuyển tiếp pha ban đêm và gửi Night Action qua Socket...');
    const room = roomManager.getRoom(roomCode);
    assert(room, 'Phòng phải tồn tại');

    // Fast-forward sang ban đêm
    room.gameState.clearTimer();
    room.gameState.enterNight();
    room.gameState.clearTimer();
    room.gameState.phase = 'NIGHT_ACTION';
    room.broadcastState();

    // Tìm socket của Tiên Tri và Sói để gửi hành động socket
    const seerPlayer = room.players.find((p) => p.role === ROLES.SEER);
    const wolfPlayer = room.players.find((p) => p.role === ROLES.WEREWOLF);
    const villagerPlayer = room.players.find((p) => p.role === ROLES.VILLAGER);

    const seerClient = clients.find((c) => c.id === seerPlayer.id);
    const wolfClient = clients.find((c) => c.id === wolfPlayer.id);

    // Tiên tri soi qua socket
    seerClient.emit('night:action', {
      action: 'seer_inspect',
      targetId: villagerPlayer.id,
    });

    // Sói vote qua socket
    wolfClient.emit('night:action', {
      action: 'werewolf_vote',
      targetId: villagerPlayer.id,
    });

    await new Promise((resolve) => setTimeout(resolve, 300));

    assert.strictEqual(room.gameState.nightActions.seerTarget, villagerPlayer.id, 'Hành động Tiên Tri qua socket đã được xử lý chuẩn xác');
    assert.strictEqual(room.gameState.nightActions.werewolfVotes[wolfPlayer.id], villagerPlayer.id, 'Hành động Sói vote qua socket đã được xử lý chuẩn xác');
    console.log('   ✓ Cả Tiên Tri và Ma Sói gửi lệnh qua Socket.IO thành công 100%!');

    console.log('\n================================================================');
    console.log('🎉 KIỂM THỬ 9 SOCKET CLIENT E2E HOÀN TOÀN THÀNH CÔNG RỰC RỠ! 🎉');
    console.log('================================================================');

    // Đóng toàn bộ socket và server
    for (const client of clients) {
      client.close();
    }
    io.close();
    server.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi kiểm thử E2E 9 Sockets:', error);
    for (const client of clients) {
      client.close();
    }
    io.close();
    server.close();
    process.exit(1);
  }
});
