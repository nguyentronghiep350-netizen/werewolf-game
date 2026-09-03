import { ROLES, TEAMS, ROLE_DEFINITIONS } from './RoleManager.js';

export const BOT_NAMES = [
  'An Nhiên',
  'Tuấn Khang',
  'Bảo Nam',
  'Thùy Linh',
  'Quốc Cường',
  'Lan Anh',
  'Minh Trí',
  'Ngọc Diệp',
  'Hoàng Bách',
  'Mỹ Duyên',
  'Gia Huy',
  'Phương Thảo',
  'Khánh Đăng',
  'Thanh Trúc',
  'Hữu Phước',
  'Bích Ngọc',
];

export const BOT_AVATARS = [
  '🧙‍♂️', '🧝‍♀️', '🧛‍♂️', '🐺', '🦊', '🦉', '🧑‍🌾', '🛡️', '🏹', '🔮', '🎭', '👑'
];

export class BotAI {
  constructor(room) {
    this.room = room;
    this.seerHistory = new Set(); // bot tiên tri đã soi những ai
    this.suspicions = {}; // điểm nghi ngờ { playerId: score }
  }

  // Khởi tạo điểm nghi ngờ ngẫu nhiên
  initSuspicions() {
    this.suspicions = {};
    for (const p of this.room.players) {
      this.suspicions[p.id] = Math.floor(Math.random() * 20) + 10;
    }
  }

  // Hành động ban đêm của các Bot
  triggerNightActions() {
    const gameState = this.room.gameState;
    const botPlayers = this.room.players.filter((p) => p.isAlive && p.isBot);

    // Xử lý có độ trễ nhẹ (1-3s) để tạo cảm giác tự nhiên như người chơi thật
    setTimeout(() => {
      // 1. Bot Cupid (chỉ đêm 1)
      const botCupid = botPlayers.find((p) => p.role === ROLES.CUPID && gameState.nightNumber === 1);
      if (botCupid) {
        const candidates = this.room.players.filter((p) => p.isAlive);
        if (candidates.length >= 2) {
          const shuffled = [...candidates].sort(() => 0.5 - Math.random());
          gameState.handleNightAction(botCupid, {
            action: 'cupid_pair',
            targetId: shuffled[0].id,
            target2Id: shuffled[1].id,
          });
        }
      }

      // 2. Bot Bảo Vệ
      const botBodyguard = botPlayers.find((p) => p.role === ROLES.BODYGUARD);
      if (botBodyguard) {
        const aliveOthers = this.room.players.filter(
          (p) => p.isAlive && p.id !== botBodyguard.lastProtectedId
        );
        if (aliveOthers.length > 0) {
          const target = aliveOthers[Math.floor(Math.random() * aliveOthers.length)];
          gameState.handleNightAction(botBodyguard, {
            action: 'protect',
            targetId: target.id,
          });
        }
      }

      // 3. Bot Tiên Tri
      const botSeer = botPlayers.find((p) => p.role === ROLES.SEER);
      if (botSeer) {
        const uninspected = this.room.players.filter(
          (p) => p.isAlive && p.id !== botSeer.id && !this.seerHistory.has(p.id)
        );
        const candidates = uninspected.length > 0 ? uninspected : this.room.players.filter((p) => p.isAlive && p.id !== botSeer.id);
        if (candidates.length > 0) {
          const target = candidates[Math.floor(Math.random() * candidates.length)];
          this.seerHistory.add(target.id);
          gameState.handleNightAction(botSeer, {
            action: 'seer_inspect',
            targetId: target.id,
          });
        }
      }

      // 4. Bot Ma Sói (Werewolves)
      const botWolves = botPlayers.filter((p) => p.role === ROLES.WEREWOLF);
      if (botWolves.length > 0) {
        // Tìm các nạn nhân không phải là sói
        const nonWolves = this.room.players.filter((p) => p.isAlive && p.role !== ROLES.WEREWOLF);
        if (nonWolves.length > 0) {
          // Ưu tiên cắn người chơi thật nếu có
          const humanTarget = nonWolves.find((p) => !p.isBot);
          const chosenTarget = (humanTarget && Math.random() < 0.65) ? humanTarget : nonWolves[Math.floor(Math.random() * nonWolves.length)];

          for (const wolf of botWolves) {
            gameState.handleNightAction(wolf, {
              action: 'werewolf_vote',
              targetId: chosenTarget.id,
            });
          }

          // Bot Sói thỉnh thoảng nhắn trong Kênh Sói
          if (Math.random() < 0.7) {
            const speaker = botWolves[0];
            const wolfChatMessages = [
              `Đêm nay thịt ${chosenTarget.name} đi anh em!`,
              `Nhắm vào ${chosenTarget.name} nhé, người này nguy hiểm lắm!`,
              `Cắn ${chosenTarget.name} là chuẩn bài luôn!`,
              `Cứ diệt ${chosenTarget.name} trước cho an toàn!`,
            ];
            const msg = wolfChatMessages[Math.floor(Math.random() * wolfChatMessages.length)];
            this.room.handleChatMessage(speaker.id, msg, 'werewolf');
          }
        }
      }

      // 5. Bot Phù Thủy
      const botWitch = botPlayers.find((p) => p.role === ROLES.WITCH);
      if (botWitch) {
        let save = false;
        let killTargetId = null;

        const victimId = gameState.getWerewolfTarget();
        // Cứu nếu còn bình cứu và đêm 1 hoặc 2
        if (victimId && !botWitch.witchSaveUsed && gameState.nightNumber <= 2) {
          save = true;
        }

        // Dùng độc nếu đêm 3 trở đi và còn bình độc
        if (!botWitch.witchKillUsed && gameState.nightNumber >= 3 && Math.random() < 0.4) {
          const targets = this.room.players.filter((p) => p.isAlive && p.id !== botWitch.id && p.id !== victimId);
          if (targets.length > 0) {
            killTargetId = targets[Math.floor(Math.random() * targets.length)].id;
          }
        }

        gameState.handleNightAction(botWitch, {
          action: 'witch_act',
          save,
          killTargetId,
        });
      }
    }, 1500);
  }

  // Bot Thợ Săn bắn trả thù
  triggerHunterShot(hunterPlayer) {
    setTimeout(() => {
      const candidates = this.room.players.filter((p) => p.isAlive && p.id !== hunterPlayer.id);
      if (candidates.length > 0) {
        // Bắn người đáng nghi nhất
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        this.room.gameState.handleHunterShot(hunterPlayer.id, target.id);
      }
    }, 2000);
  }

  // Bot chat thảo luận ban ngày
  triggerDayChatter() {
    const gameState = this.room.gameState;
    const aliveBots = this.room.players.filter((p) => p.isAlive && p.isBot);
    if (aliveBots.length === 0) return;

    // Chọn 1-3 bot phát biểu lần lượt
    const numSpeakers = Math.min(aliveBots.length, Math.floor(Math.random() * 3) + 1);
    const speakers = [...aliveBots].sort(() => 0.5 - Math.random()).slice(0, numSpeakers);

    speakers.forEach((bot, index) => {
      setTimeout(() => {
        if (gameState.phase !== 'DAY_DISCUSSION' || !bot.isAlive) return;

        let message = '';
        const aliveOthers = this.room.players.filter((p) => p.isAlive && p.id !== bot.id);
        const randomOther = aliveOthers.length > 0 ? aliveOthers[Math.floor(Math.random() * aliveOthers.length)] : null;

        if (bot.role === ROLES.WEREWOLF) {
          const wolfQuotes = [
            `Mọi người thấy đêm qua thế nào? Tôi là dân lương thiện nhé!`,
            randomOther ? `Tôi thấy ${randomOther.name} nãy giờ im hơi lặng tiếng rất khả nghi nha!` : `Hôm nay phải tìm đúng sói mới được!`,
            `Đêm qua đau lòng quá, đừng để sói dắt mũi anh em ơi!`,
            `Tôi tin tưởng mọi người, cùng tìm ra sói nào!`,
          ];
          message = wolfQuotes[Math.floor(Math.random() * wolfQuotes.length)];
        } else if (bot.role === ROLES.SEER) {
          const seerQuotes = [
            `Đêm qua tôi đã quan sát rất kỹ, mọi người cẩn thận người bên cạnh!`,
            randomOther ? `Tôi có linh cảm không lành về ${randomOther.name}...` : `Hôm nay phải cân nhắc phiếu bầu thật kỹ!`,
            `Đừng vội vàng vote bừa, hãy lắng nghe phân tích trước!`,
          ];
          message = seerQuotes[Math.floor(Math.random() * seerQuotes.length)];
        } else if (bot.role === ROLES.JESTER) {
          const jesterQuotes = [
            `Mấy người cứ vote tôi đi, tôi chính là SÓI đấy, sợ chưa? haha!`,
            `Treo cổ tôi đi xem nào, không dám đúng không?`,
            `Tôi nhận mình là Sói nè, ai dám vote tôi không?`,
          ];
          message = jesterQuotes[Math.floor(Math.random() * jesterQuotes.length)];
        } else {
          const villagerQuotes = [
            `Đêm qua căng thẳng thật đấy, mọi người nghi ngờ ai chưa?`,
            randomOther ? `Theo trực giác của tôi thì ${randomOther.name} có vẻ mờ ám.` : `Cố lên anh em dân làng!`,
            `Ai có manh mối gì cứ nói ra cho cả làng biết nhé!`,
            `Tôi là dân 100%, ai nghi ngờ tôi là sai lầm lớn đấy!`,
          ];
          message = villagerQuotes[Math.floor(Math.random() * villagerQuotes.length)];
        }

        this.room.handleChatMessage(bot.id, message, 'public');
      }, (index + 1) * 3500);
    });
  }

  // Bot bỏ phiếu ban ngày
  triggerDayVotes() {
    const gameState = this.room.gameState;
    const aliveBots = this.room.players.filter((p) => p.isAlive && p.isBot);

    aliveBots.forEach((bot) => {
      // Delay ngẫu nhiên từ 3-10 giây để vote như người thật
      const delay = Math.floor(Math.random() * 7000) + 2500;
      setTimeout(() => {
        if (gameState.phase !== 'DAY_VOTING' || !bot.isAlive) return;

        const aliveOthers = this.room.players.filter((p) => p.isAlive && p.id !== bot.id);
        if (aliveOthers.length === 0) return;

        let targetId = 'skip';

        if (bot.role === ROLES.WEREWOLF) {
          // Sói bot không bao giờ vote đồng đội sói
          const nonWolves = aliveOthers.filter((p) => p.role !== ROLES.WEREWOLF);
          if (nonWolves.length > 0) {
            targetId = nonWolves[Math.floor(Math.random() * nonWolves.length)].id;
          }
        } else if (bot.role === ROLES.JESTER) {
          // Jester có thể vote skip hoặc người bất kỳ
          targetId = Math.random() < 0.5 ? 'skip' : aliveOthers[Math.floor(Math.random() * aliveOthers.length)].id;
        } else {
          // Dân làng, Tiên tri, Bảo vệ: 85% vote người khác, 15% skip
          if (Math.random() < 0.85) {
            targetId = aliveOthers[Math.floor(Math.random() * aliveOthers.length)].id;
          } else {
            targetId = 'skip';
          }
        }

        gameState.handleDayVote(bot, targetId);
      }, delay);
    });
  }
}
