import assert from 'assert';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as ClientIO } from 'socket.io-client';
import { RoomManager } from '../src/game/RoomManager.js';

console.log('--- BẮT ĐẦU KIỂM THỬ WEBRTC VOICE CHAT SIGNALING ---');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const roomManager = new RoomManager();

io.on('connection', (socket) => {
  socket.on('room:create', ({ name, avatar }, callback) => {
    const room = roomManager.createRoom(socket, name, avatar);
    if (callback) callback({ success: true, roomCode: room.code });
  });

  socket.on('room:join', ({ code, name, avatar }, callback) => {
    const res = roomManager.joinRoom(code, socket, name, avatar);
    if (callback) callback(res);
  });

  socket.on('voice:join', () => {
    const room = roomManager.getRoomByPlayerId(socket.id);
    if (room) {
      const player = room.players.find((p) => p.id === socket.id);
      if (player) {
        player.inVoice = true;
        player.isMuted = false;
        player.isSpeaking = false;
      }
      const peers = room.players
        .filter((p) => !p.isBot && p.id !== socket.id && p.inVoice)
        .map((p) => p.id);

      socket.emit('voice:all_peers', { peers });
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

  const cleanupPlayerVoice = (socketId) => {
    const room = roomManager.getRoomByPlayerId(socketId);
    if (room) {
      const player = room.players.find((p) => p.id === socketId);
      if (player) {
        player.inVoice = false;
        player.isSpeaking = false;
      }
      for (const p of room.players) {
        if (p.socket && p.id !== socketId) {
          p.socket.emit('voice:peer_left', { peerId: socketId });
          p.socket.emit('voice:player_state_changed', {
            playerId: socketId,
            inVoice: false,
            isSpeaking: false,
          });
        }
      }
    }
  };

  socket.on('room:leave', () => {
    cleanupPlayerVoice(socket.id);
    roomManager.leaveRoom(socket.id);
  });

  socket.on('voice:leave', () => {
    cleanupPlayerVoice(socket.id);
  });

  socket.on('disconnect', () => {
    cleanupPlayerVoice(socket.id);
    roomManager.leaveRoom(socket.id);
  });
});

server.listen(0, async () => {
  const PORT = server.address().port;
  console.log(`Voice Test Server đang chạy trên port ${PORT}`);

  try {
    const hostSocket = ClientIO(`http://localhost:${PORT}`, { reconnection: false, autoConnect: false });
    const player2Socket = ClientIO(`http://localhost:${PORT}`, { reconnection: false, autoConnect: false });

    const hostConnectPromise = new Promise((r) => hostSocket.on('connect', r));
    const player2ConnectPromise = new Promise((r) => player2Socket.on('connect', r));

    hostSocket.connect();
    player2Socket.connect();

    await Promise.all([hostConnectPromise, player2ConnectPromise]);
    console.log('✓ Cả 2 client kết nối thành công tới server');

    // 1. Tạo phòng & Tham gia phòng
    const createRes = await new Promise((resolve) => {
      hostSocket.emit('room:create', { name: 'Host', avatar: '👑' }, resolve);
    });
    assert(createRes.success, 'Host tạo phòng không thành công');
    const roomCode = createRes.roomCode;

    const joinRes = await new Promise((resolve) => {
      player2Socket.emit('room:join', { code: roomCode, name: 'Player2', avatar: '🐺' }, resolve);
    });
    assert(joinRes.success, 'Player 2 vào phòng không thành công');
    console.log(`✓ Tạo phòng ${roomCode} và Player 2 vào phòng thành công`);

    // 2. Host tham gia voice chat
    const allPeersPromise = new Promise((resolve) => {
      hostSocket.once('voice:all_peers', resolve);
    });
    hostSocket.emit('voice:join');
    const allPeers = await allPeersPromise;
    assert.deepStrictEqual(allPeers.peers, [], 'Lúc đầu chưa có peer nào khác');
    console.log('✓ Host join voice thành công, nhận danh sách peers rỗng');

    // 3. Player 2 tham gia voice chat -> Host nhận thông báo peer_joined
    const peerJoinedPromise = new Promise((resolve) => {
      hostSocket.once('voice:peer_joined', resolve);
    });
    player2Socket.emit('voice:join');
    const peerJoinedData = await peerJoinedPromise;
    assert.strictEqual(peerJoinedData.peerId, player2Socket.id, 'Host nhận sai peerId');
    console.log('✓ Player 2 join voice, Host nhận được thông báo peer_joined chuẩn xác');

    // 4. Kiểm tra truyền tín hiệu WebRTC (Signaling offer/candidate)
    const signalPromise = new Promise((resolve) => {
      player2Socket.once('voice:signal', resolve);
    });
    const mockOffer = { type: 'offer', sdp: 'v=0\r\no=...' };
    hostSocket.emit('voice:signal', { targetId: player2Socket.id, signal: mockOffer });
    const receivedSignal = await signalPromise;
    assert.strictEqual(receivedSignal.senderId, hostSocket.id, 'Sai senderId');
    assert.deepStrictEqual(receivedSignal.signal, mockOffer, 'Nội dung signal WebRTC bị sai lệch');
    console.log('✓ Tín hiệu WebRTC chuyển tiếp mượt mà giữa các peers');

    // 5. Kiểm tra thay đổi trạng thái Mute & Speaking
    const stateChangePromise = new Promise((resolve) => {
      player2Socket.once('voice:player_state_changed', resolve);
    });
    hostSocket.emit('voice:state_change', { isMuted: true, isSpeaking: false });
    const stateChangeData = await stateChangePromise;
    assert.strictEqual(stateChangeData.playerId, hostSocket.id);
    assert.strictEqual(stateChangeData.isMuted, true);
    console.log('✓ Đồng bộ trạng thái Mute / Speaking hoạt động hoàn hảo');

    // 6. Kiểm tra rời voice chat
    const peerLeftPromise = new Promise((resolve) => {
      player2Socket.once('voice:peer_left', resolve);
    });
    hostSocket.emit('voice:leave');
    const peerLeftData = await peerLeftPromise;
    assert.strictEqual(peerLeftData.peerId, hostSocket.id);
    console.log('✓ Rời Voice Chat và dọn dẹp kết nối thành công');

    // 7. Host join lại voice chat, sau đó Player 2 out khỏi phòng (room:leave)
    // Host phải lập tức nhận được voice:peer_left để ngắt kết nối WebRTC!
    hostSocket.emit('voice:join');
    await new Promise((r) => setTimeout(r, 50));

    const roomLeavePeerLeftPromise = new Promise((resolve) => {
      hostSocket.once('voice:peer_left', resolve);
    });
    player2Socket.emit('room:leave');
    const roomLeavePeerLeftData = await roomLeavePeerLeftPromise;
    assert.strictEqual(roomLeavePeerLeftData.peerId, player2Socket.id, 'Host không nhận được thông báo peer_left khi Player 2 rời phòng');
    console.log('✓ Player 2 out khỏi phòng (room:leave), Host lập tức nhận voice:peer_left để ngắt kết nối WebRTC audio!');

    console.log('=============================================');
    console.log('🎉 TẤT CẢ CÁC BÀI TEST WEBRTC SIGNALING ĐẠT 100%! 🎉');
    console.log('=============================================');

    hostSocket.close();
    player2Socket.close();
    server.close(() => {
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Test thất bại:', err);
    process.exit(1);
  }
});
