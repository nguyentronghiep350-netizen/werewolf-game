import { GameState, PHASES } from './GameState.js';
import { BotAI, BOT_NAMES, BOT_AVATARS } from './BotAI.js';
import { assignRoles, getDefaultRoleConfig, ROLES, TEAMS, ROLE_DEFINITIONS, isWerewolfRole } from './RoleManager.js';

export const GAME_MODES = {
  classic: {
    id: 'classic',
    name: 'Cổ Điển',
    badge: 'Tiêu Chuẩn',
    desc: 'Luật Ma Sói truyền thống cân bằng, phù hợp cho mọi người chơi.',
  },
  blood_moon: {
    id: 'blood_moon',
    name: 'Đêm Trăng Máu',
    badge: 'Hardcore',
    desc: 'Bầy sói hung bạo cắn 2 người/đêm khi còn đủ bầy đàn, nhịp độ dồn dập!',
  },
  lovers_chaos: {
    id: 'lovers_chaos',
    name: 'Tình Yêu & Hỗn Loạn',
    badge: 'Drama',
    desc: 'Bắt buộc có Thần Tình Yêu (Cupid) và Kẻ Chán Đời (Jester), những cú lừa kinh điển!',
  },
  blitz: {
    id: 'blitz',
    name: 'Thần Tốc (Blitz)',
    badge: 'Siêu Nhanh',
    desc: 'Đêm 15s, Ngày 20s, Bỏ phiếu 15s. Tốc độ chớp nhoáng, không chờ đợi!',
  },
  custom: {
    id: 'custom',
    name: 'Tùy Biến (Custom)',
    badge: 'Tự Do',
    desc: 'Chủ phòng tự do chỉnh sửa từng vai trò và thời gian vòng chơi.',
  },
  custom_deck: {
    id: 'custom_deck',
    name: 'Tùy Biến Thẻ & Quản Trò',
    badge: 'Custom Deck',
    desc: 'Tự chọn thẻ bài Tarot, chia ngẫu nhiên và chơi theo Quản trò người thật hoặc AI gợi ý!',
  },
};

export class GameRoom {
  constructor(code, hostSocket, hostName = 'Chủ Phòng', hostAvatar = '👑') {
    this.code = code;
    this.hostId = hostSocket.id;
    this.players = [];
    this.chatMessages = [];
    this.config = {
      mode: 'classic',
      moderatorMode: 'ai', // 'ai' | 'human'
      roleConfig: getDefaultRoleConfig(6),
      nightDuration: 30,
      discussionDuration: 45,
      votingDuration: 30,
    };

    this.gameState = new GameState(this);
    this.botAI = new BotAI(this);

    // Thêm Host vào phòng
    this.addPlayer(hostSocket, hostName, hostAvatar, true);
  }

  // Thêm người chơi thật
  addPlayer(socket, name, avatar, isHost = false) {
    // Kiểm tra xem socket đã có trong phòng chưa
    const existing = this.players.find((p) => p.id === socket.id);
    if (existing) {
      existing.name = name || existing.name;
      existing.avatar = avatar || existing.avatar;
      return existing;
    }

    const player = {
      id: socket.id,
      name: name || `Người chơi ${this.players.length + 1}`,
      avatar: avatar || '🧑‍🌾',
      isHost: isHost || this.players.length === 0,
      isBot: false,
      isReady: isHost, // Host mặc định ready
      isAlive: true,
      role: null,
      deathReason: null,
      deathNight: null,
      socket,
    };

    if (player.isHost) {
      this.hostId = player.id;
    }

    this.players.push(player);
    this.updateDefaultRoleConfig();
    this.broadcastState();
    return player;
  }

  // Xóa người chơi
  removePlayer(playerId) {
    const index = this.players.findIndex((p) => p.id === playerId);
    if (index === -1) return;

    const removed = this.players[index];
    this.players.splice(index, 1);

    // Nếu host rời đi, chuyển host cho người thật tiếp theo
    if (removed.isHost && this.players.length > 0) {
      const nextHuman = this.players.find((p) => !p.isBot);
      if (nextHuman) {
        nextHuman.isHost = true;
        this.hostId = nextHuman.id;
      } else {
        this.players[0].isHost = true;
        this.hostId = this.players[0].id;
      }
    }

    // Nếu đang trong game mà người chơi thoát, coi như chết vì mất kết nối
    if (this.gameState.phase !== PHASES.LOBBY && this.gameState.phase !== PHASES.GAME_OVER && removed.isAlive) {
      this.gameState.killPlayer(removed, 'Rời khỏi phòng chơi (mất kết nối)');
      this.gameState.addLog('death', `${removed.name} đã rời khỏi làng (mất kết nối)!`);
      this.gameState.checkWinCondition();
    }

    this.updateDefaultRoleConfig();
    this.broadcastState();
  }

  // Thêm Bot AI
  addBot() {
    if (this.gameState.phase !== PHASES.LOBBY) return null;
    if (this.players.length >= 16) return null;

    const usedNames = new Set(this.players.map((p) => p.name));
    const availableNames = BOT_NAMES.filter((n) => !usedNames.has(n));
    const botName = availableNames.length > 0 ? availableNames[0] : `Bot ${this.players.length + 1}`;
    const botAvatar = BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)];

    const botPlayer = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: botName,
      avatar: botAvatar,
      isHost: false,
      isBot: true,
      isReady: true,
      isAlive: true,
      role: null,
      deathReason: null,
      deathNight: null,
      socket: null,
    };

    this.players.push(botPlayer);
    this.updateDefaultRoleConfig();
    this.broadcastState();
    return botPlayer;
  }

  // Xóa Bot AI
  removeBot(botId) {
    if (this.gameState.phase !== PHASES.LOBBY) return;
    const index = this.players.findIndex((p) => p.id === botId && p.isBot);
    if (index !== -1) {
      this.players.splice(index, 1);
      this.updateDefaultRoleConfig();
      this.broadcastState();
    }
  }

  // Cập nhật cấu hình vai trò mặc định theo số người và chế độ chơi
  updateDefaultRoleConfig() {
    if (this.gameState.phase !== PHASES.LOBBY) return;
    const count = this.players.length;
    const mode = this.config.mode || 'classic';

    if (mode === 'blood_moon') {
      const wolves = Math.max(2, Math.floor(count / 3));
      this.config.roleConfig = {
        [ROLES.WEREWOLF]: wolves,
        [ROLES.SEER]: 1,
        [ROLES.BODYGUARD]: 1,
        [ROLES.WITCH]: 1,
        [ROLES.HUNTER]: count >= 6 ? 1 : 0,
        [ROLES.VILLAGER]: Math.max(1, count - (wolves + 3 + (count >= 6 ? 1 : 0))),
      };
      this.config.nightDuration = 25;
      this.config.discussionDuration = 30;
      this.config.votingDuration = 20;
    } else if (mode === 'lovers_chaos') {
      const wolves = Math.max(1, Math.floor(count / 3.5));
      this.config.roleConfig = {
        [ROLES.WEREWOLF]: wolves,
        [ROLES.CUPID]: 1,
        [ROLES.JESTER]: 1,
        [ROLES.SEER]: 1,
        [ROLES.HUNTER]: count >= 6 ? 1 : 0,
        [ROLES.BODYGUARD]: count >= 8 ? 1 : 0,
        [ROLES.VILLAGER]: Math.max(1, count - (wolves + 3 + (count >= 6 ? 1 : 0) + (count >= 8 ? 1 : 0))),
      };
      this.config.nightDuration = 30;
      this.config.discussionDuration = 45;
      this.config.votingDuration = 30;
    } else if (mode === 'blitz') {
      this.config.roleConfig = getDefaultRoleConfig(count);
      this.config.nightDuration = 15;
      this.config.discussionDuration = 20;
      this.config.votingDuration = 15;
    } else if (mode === 'classic') {
      this.config.roleConfig = getDefaultRoleConfig(count);
      this.config.nightDuration = 30;
      this.config.discussionDuration = 45;
      this.config.votingDuration = 30;
    }
  }

  // Sẵn sàng / Hủy sẵn sàng
  toggleReady(playerId) {
    const player = this.players.find((p) => p.id === playerId);
    if (player && !player.isHost) {
      player.isReady = !player.isReady;
      this.broadcastState();
    }
  }

  // Cập nhật cài đặt phòng (chỉ Host)
  updateConfig(playerId, newConfig) {
    if (playerId !== this.hostId) return false;
    const modeChanged = newConfig.mode && newConfig.mode !== this.config.mode;
    this.config = { ...this.config, ...newConfig };
    if (modeChanged) {
      this.updateDefaultRoleConfig();
    }
    this.broadcastState();
    return true;
  }

  // Bắt đầu game
  startGame(playerId) {
    if (playerId !== this.hostId) return { success: false, message: 'Chỉ Chủ phòng mới có quyền bắt đầu!' };
    if (this.players.length < 4) return { success: false, message: 'Cần ít nhất 4 người chơi để bắt đầu!' };

    // Kiểm tra tất cả đã sẵn sàng chưa (trừ host)
    const notReady = this.players.filter((p) => !p.isHost && !p.isReady);
    if (notReady.length > 0) {
      return { success: false, message: `Còn ${notReady.length} người chơi chưa sẵn sàng!` };
    }

    // Phân vai
    const isHumanMod = this.config.moderatorMode === 'human';
    this.players = assignRoles(this.players, this.config.roleConfig, isHumanMod);
    this.botAI.initSuspicions();

    // Khởi động ván game
    this.gameState.startNewGame();
    this.broadcastState();

    return { success: true };
  }

  // Chơi lại (Restart to Lobby)
  restartGame(playerId) {
    if (playerId !== this.hostId) return false;

    this.gameState.clearTimer();
    this.gameState = new GameState(this);
    this.botAI = new BotAI(this);
    this.chatMessages = [];

    // Reset trạng thái từng người chơi
    for (const p of this.players) {
      p.isAlive = true;
      p.role = null;
      p.deathReason = null;
      p.deathNight = null;
      p.isReady = p.isHost || p.isBot;
      p.witchSaveUsed = false;
      p.witchKillUsed = false;
      p.hunterShotUsed = false;
      p.lastProtectedId = null;
      p.loverId = null;
    }

    this.broadcastState();
    return true;
  }

  // Chia bài ngẫu nhiên cho tất cả người chơi
  dealCards(playerId, roleConfig = null) {
    if (playerId !== this.hostId) return { success: false, message: 'Chỉ Chủ phòng mới có quyền chia bài!' };
    const configToUse = roleConfig || this.config.roleConfig;
    const isHumanMod = this.config.moderatorMode === 'human';
    this.players = assignRoles(this.players, configToUse, isHumanMod);
    const targetCount = isHumanMod ? this.players.length - 1 : this.players.length;
    this.gameState.addLog('system', isHumanMod 
      ? `Chủ phòng đóng vai trò Quản Trò và đã chia bài cho ${targetCount} người chơi!` 
      : `Chủ phòng đã xáo và chia bài ngẫu nhiên cho tất cả ${this.players.length} người chơi!`);
    this.broadcastState();
    return { success: true };
  }

  // Thao tác điều phối của Quản Trò (Game Master)
  moderatorAction(playerId, action, data = {}) {
    if (playerId !== this.hostId) return false;
    const { targetId, phase, stepIndex } = data;

    if (action === 'deal_cards') {
      this.dealCards(playerId, data.roleConfig);
    } else if (action === 'kill' && targetId) {
      const target = this.players.find((p) => p.id === targetId);
      if (target && target.isAlive) {
        this.gameState.killPlayer(target, 'Bị Quản Trò phán quyết xử tử');
        this.gameState.addLog('death', `⚖️ Quản Trò đã phán quyết xử tử ${target.name}!`);
        this.gameState.checkWinCondition();
      }
    } else if (action === 'revive' && targetId) {
      const target = this.players.find((p) => p.id === targetId);
      if (target && !target.isAlive) {
        target.isAlive = true;
        target.deathReason = null;
        this.gameState.addLog('system', `✨ Quản Trò đã ban phước hồi sinh cho ${target.name}!`);
      }
    } else if (action === 'set_phase' && phase) {
      this.gameState.clearTimer();
      this.gameState.phase = phase;
      this.gameState.addLog('system', `🔔 Quản Trò chuyển giai đoạn sang: ${phase}`);
    } else if (action === 'advance_night_step') {
      this.gameState.advanceNightStep();
    } else if (action === 'set_night_step' && typeof stepIndex === 'number') {
      this.gameState.startNightStep(stepIndex);
    } else if (action === 'advance_script') {
      this.gameState.currentScriptStep = stepIndex ?? (this.gameState.currentScriptStep + 1);
    }

    this.broadcastState();
    return true;
  }

  // Xử lý chat
  handleChatMessage(senderId, text, channel = 'public') {
    const sender = this.players.find((p) => p.id === senderId);
    if (!sender || !text || text.trim() === '') return;

    const trimmed = text.trim().slice(0, 300);

    // Kênh Sói: chỉ Sói còn sống mới được chat hoặc đọc
    if (channel === 'werewolf') {
      if (!isWerewolfRole(sender.role) || !sender.isAlive) return;
    }

    // Kênh Hồn Ma: chỉ người chết mới được chat
    if (channel === 'dead') {
      if (sender.isAlive) return;
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      senderRole: !sender.isAlive ? sender.role : null,
      channel, // 'public' | 'werewolf' | 'dead'
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    this.chatMessages.push(message);
    if (this.chatMessages.length > 200) {
      this.chatMessages.shift();
    }

    // Gửi tin nhắn đến đúng người nhận
    for (const p of this.players) {
      if (p.isBot || !p.socket) continue;

      if (channel === 'public') {
        p.socket.emit('chat:message', message);
      } else if (channel === 'werewolf') {
        if (isWerewolfRole(p.role)) {
          p.socket.emit('chat:message', message);
        }
      } else if (channel === 'dead') {
        if (!p.isAlive) {
          p.socket.emit('chat:message', message);
        }
      }
    }
  }

  // Kích hoạt Bot
  triggerBotNightActions() {
    this.botAI.triggerNightActions();
  }

  triggerBotNightActionForRole(activeRole) {
    this.botAI.triggerNightActionForRole(activeRole);
  }

  triggerBotDayChatter() {
    this.botAI.triggerDayChatter();
  }

  triggerBotDayVotes() {
    this.botAI.triggerDayVotes();
  }

  triggerBotHunterShot(hunter) {
    this.botAI.triggerHunterShot(hunter);
  }

  // Gửi sự kiện cho toàn bộ người chơi trong phòng
  broadcast(event, data) {
    for (const p of this.players) {
      if (p.socket) {
        p.socket.emit(event, data);
      }
    }
  }

  // Gửi sự kiện riêng cho 1 người
  sendToPlayer(playerId, event, data) {
    const p = this.players.find((item) => item.id === playerId);
    if (p && p.socket) {
      p.socket.emit(event, data);
    }
  }

  // Gửi trạng thái game được sanitize riêng cho từng socket (Bảo vệ bí mật vai trò!)
  broadcastState() {
    for (const p of this.players) {
      if (p.socket) {
        const state = this.gameState.getPublicState(p.id);
        p.socket.emit('game:state_update', {
          roomCode: this.code,
          config: this.config,
          myId: p.id,
          myRole: p.role,
          myRoleDetails: p.role ? ROLE_DEFINITIONS[p.role] : null,
          isHost: p.isHost,
          state,
        });
      }
    }
  }
}
