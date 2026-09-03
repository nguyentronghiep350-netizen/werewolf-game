import { GameRoom } from './GameRoom.js';

export class RoomManager {
  constructor() {
    this.rooms = new Map(); // code -> GameRoom
    this.playerRoomMap = new Map(); // socketId -> roomCode
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostSocket, hostName, hostAvatar) {
    const code = this.generateRoomCode();
    const room = new GameRoom(code, hostSocket, hostName, hostAvatar);
    this.rooms.set(code, room);
    this.playerRoomMap.set(hostSocket.id, code);
    return room;
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toUpperCase()) || null;
  }

  getRoomByPlayerId(socketId) {
    const code = this.playerRoomMap.get(socketId);
    if (!code) return null;
    return this.rooms.get(code) || null;
  }

  joinRoom(code, socket, name, avatar) {
    const room = this.getRoom(code);
    if (!room) {
      return { success: false, message: 'Phòng không tồn tại hoặc mã phòng không chính xác!' };
    }

    if (room.gameState.phase !== 'LOBBY') {
      return { success: false, message: 'Ván game trong phòng này đã bắt đầu!' };
    }

    if (room.players.length >= 16) {
      return { success: false, message: 'Phòng đã đủ số lượng người chơi tối đa (16 người)!' };
    }

    const player = room.addPlayer(socket, name, avatar, false);
    this.playerRoomMap.set(socket.id, room.code);
    return { success: true, roomCode: room.code, playerId: player.id };
  }

  leaveRoom(socketId) {
    const code = this.playerRoomMap.get(socketId);
    if (!code) return;

    this.playerRoomMap.delete(socketId);
    const room = this.rooms.get(code);
    if (!room) return;

    room.removePlayer(socketId);

    // Nếu không còn người thật nào trong phòng thì dọn dẹp phòng
    const hasHumans = room.players.some((p) => !p.isBot);
    if (!hasHumans) {
      room.gameState.clearTimer();
      this.rooms.delete(code);
      console.log(`[RoomManager] Phòng ${code} đã được dọn dẹp vì không còn người chơi.`);
    }
  }
}
