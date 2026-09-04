import assert from 'assert';
import { ROLES, TEAMS, ROLE_DEFINITIONS, assignRoles, getDefaultRoleConfig } from '../src/game/RoleManager.js';
import { GameState, PHASES } from '../src/game/GameState.js';
import { GameRoom } from '../src/game/GameRoom.js';
import { AIModerator } from '../src/game/AIModerator.js';

// ============================================================================
// 9 AI PERSONAS PROFILE
// ============================================================================
export const AI_TEAM = [
  { id: 'ai_1', name: 'Minh Trí', avatar: '👑', roleTrait: 'HOST_LEADER', bio: 'Chủ phòng lý tính, phân tích nhật ký và kêu gọi biểu quyết có trật tự' },
  { id: 'ai_2', name: 'Lan Anh', avatar: '🧙‍♀️', roleTrait: 'CAUTIOUS_WITCH', bio: 'Cẩn trọng, giữ bình cứu cho người quan trọng và cân nhắc độc dược' },
  { id: 'ai_3', name: 'Bảo Nam', avatar: '🛡️', roleTrait: 'STEADFAST_GUARD', bio: 'Kiên định, phán đoán mục tiêu sói để giương khiên che chắn' },
  { id: 'ai_4', name: 'Thùy Linh', avatar: '🔮', roleTrait: 'KEEN_SEER', bio: 'Nhạy bén, ưu tiên soi những đối tượng nói nhiều hoặc nghi vấn' },
  { id: 'ai_5', name: 'Tuấn Khang', avatar: '🦊', roleTrait: 'DECEPTIVE_WOLF', bio: 'Mưu mẹo, giả dân lương thiện hoặc kích động nghi ngờ' },
  { id: 'ai_6', name: 'Ngọc Diệp', avatar: '🧝‍♀️', roleTrait: 'ROMANTIC_CUPID', bio: 'Cảm xúc, ghép đôi định mệnh và hết lòng bảo vệ tình yêu' },
  { id: 'ai_7', name: 'Hoàng Bách', avatar: '🏹', roleTrait: 'VENGEFUL_HUNTER', bio: 'Quyết đoán, găm đạn vào kẻ khả nghi nhất trước khi ngã xuống' },
  { id: 'ai_8', name: 'Mỹ Duyên', avatar: '🎭', roleTrait: 'CHAOTIC_JESTER', bio: 'Hỗn loạn, thích gây chú ý và nói lấp lửng để bị treo cổ' },
  { id: 'ai_9', name: 'Gia Huy', avatar: '🐺', roleTrait: 'SILENT_ASSASSIN', bio: 'Lặng lẽ, ẩn mình hoàn hảo và ra đòn kết liễu trong bóng tối' },
];

// Mock Socket cho các AI Player
class MockSocket {
  constructor(id) {
    this.id = id;
    this.events = [];
  }
  emit(event, data) {
    this.events.push({ event, data });
  }
}

// Lớp giả lập trận đấu nhanh không phụ thuộc vào timer chờ (Fast-Forward Engine)
export class GameSimulator {
  constructor(roomCode, config = {}) {
    this.roomCode = roomCode;
    this.hostSocket = new MockSocket('ai_1');
    this.room = new GameRoom(roomCode, this.hostSocket, AI_TEAM[0].name, AI_TEAM[0].avatar);
    this.room.players[0].id = 'ai_1';
    this.room.players[0].persona = AI_TEAM[0];

    // Thêm 8 thành viên AI còn lại
    for (let i = 1; i < AI_TEAM.length; i++) {
      const persona = AI_TEAM[i];
      const socket = new MockSocket(persona.id);
      this.room.addPlayer(socket, persona.name, persona.avatar);
      const player = this.room.players[i];
      player.id = persona.id;
      player.isReady = true;
      player.persona = persona;
    }

    if (config.mode) {
      this.room.config.mode = config.mode;
      this.room.updateDefaultRoleConfig();
    }
    if (config.roleConfig) {
      this.room.config.roleConfig = { ...config.roleConfig };
    }
    if (config.moderatorMode) {
      this.room.config.moderatorMode = config.moderatorMode;
    }
  }

  // Khởi động trận đấu và chia vai trò
  startGame() {
    this.room.players = assignRoles(this.room.players, this.room.config.roleConfig);
    this.room.botAI.initSuspicions();
    const gameState = this.room.gameState;
    gameState.phase = PHASES.STARTING;
    gameState.nightNumber = 0;
    gameState.dayNumber = 0;
    gameState.logs = [];
    gameState.winner = null;
    gameState.winReason = '';
    return gameState;
  }

  // Chạy 1 đêm đầy đủ cho 9 AI
  stepNight(stats = {}) {
    const gameState = this.room.gameState;
    gameState.nightNumber++;
    gameState.phase = PHASES.NIGHT_ACTION;
    gameState.nightActions = {
      cupidTarget1: null,
      cupidTarget2: null,
      bodyguardTarget: null,
      werewolfVotes: {},
      seerTarget: null,
      seerResult: null,
      witchSave: false,
      witchKillTarget: null,
    };
    gameState.nightDeaths = [];

    const alivePlayers = gameState.getAlivePlayers();

    // 1. Thần Tình Yêu (Cupid) - chỉ đêm 1
    if (gameState.nightNumber === 1) {
      const cupid = alivePlayers.find((p) => p.role === ROLES.CUPID);
      if (cupid) {
        // Chọn ngẫu nhiên 2 người còn sống (không bao gồm chính mình nếu muốn đa dạng, hoặc có thể chọn bất kỳ ai)
        const candidates = alivePlayers.filter((p) => p.id !== cupid.id);
        const p1 = candidates[0] || alivePlayers[0];
        const p2 = candidates[1] || alivePlayers[1];
        if (p1 && p2 && p1.id !== p2.id) {
          gameState.handleNightAction(cupid, {
            action: 'cupid_pair',
            targetId: p1.id,
            target2Id: p2.id,
          });
          if (stats) stats.cupidPairings = (stats.cupidPairings || 0) + 1;
        }
      }
    }

    // 2. Bảo Vệ (Bodyguard)
    const guard = alivePlayers.find((p) => p.role === ROLES.BODYGUARD);
    if (guard) {
      // Ưu tiên bảo vệ người đã lộ diện tốt (như Tiên tri hoặc Host), tránh người vừa bảo vệ đêm trước
      const validTargets = alivePlayers.filter((p) => p.id !== guard.lastProtectedId);
      if (validTargets.length > 0) {
        const seer = validTargets.find((p) => p.role === ROLES.SEER);
        const target = seer && Math.random() < 0.6 ? seer : validTargets[Math.floor(Math.random() * validTargets.length)];
        gameState.handleNightAction(guard, {
          action: 'protect',
          targetId: target.id,
        });
      }
    }

    // 3. Ma Sói (Werewolves)
    const wolves = alivePlayers.filter((p) => p.role === ROLES.WEREWOLF);
    let wolfTarget = null;
    if (wolves.length > 0) {
      const nonWolves = alivePlayers.filter((p) => p.role !== ROLES.WEREWOLF);
      if (nonWolves.length > 0) {
        // Ưu tiên cắn Tiên tri hoặc Phù thủy nếu đã đoán ra, hoặc chọn ngẫu nhiên
        const priorityTarget = nonWolves.find((p) => p.role === ROLES.SEER || p.role === ROLES.WITCH);
        wolfTarget = priorityTarget && Math.random() < 0.5 ? priorityTarget : nonWolves[Math.floor(Math.random() * nonWolves.length)];
        for (const wolf of wolves) {
          gameState.handleNightAction(wolf, {
            action: 'werewolf_vote',
            targetId: wolfTarget.id,
          });
        }
      }
    }

    // 4. Tiên Tri (Seer)
    const seer = alivePlayers.find((p) => p.role === ROLES.SEER);
    if (seer) {
      // Soi người chưa soi
      if (!this.seerHistory) this.seerHistory = new Set();
      const uninspected = alivePlayers.filter((p) => p.id !== seer.id && !this.seerHistory.has(p.id));
      const target = uninspected.length > 0 ? uninspected[Math.floor(Math.random() * uninspected.length)] : alivePlayers.find((p) => p.id !== seer.id);
      if (target) {
        this.seerHistory.add(target.id);
        gameState.handleNightAction(seer, {
          action: 'seer_inspect',
          targetId: target.id,
        });
        if (target.role === ROLES.WEREWOLF) {
          this.seerDiscoveredWolf = target.id;
        }
      }
    }

    // 5. Phù Thủy (Witch)
    const witch = alivePlayers.find((p) => p.role === ROLES.WITCH);
    if (witch) {
      let save = false;
      let killTargetId = null;
      const targetVictimId = gameState.getWerewolfTarget();

      // Quyết định cứu
      if (!witch.witchSaveUsed && targetVictimId) {
        // Cứu nếu là đêm 1 hoặc 2, hoặc nếu nạn nhân là người vô tội
        if (gameState.nightNumber <= 2 || targetVictimId === seer?.id || targetVictimId === witch.id) {
          save = true;
          if (stats) stats.witchSaves = (stats.witchSaves || 0) + 1;
        }
      }

      // Quyết định độc dược: đêm 3 trở lên hoặc nếu biết chắc Sói
      if (!witch.witchKillUsed && gameState.nightNumber >= 2 && Math.random() < 0.35) {
        const poisonCandidates = alivePlayers.filter((p) => p.id !== witch.id && p.id !== targetVictimId && p.role !== ROLES.WITCH);
        if (poisonCandidates.length > 0) {
          // Nếu Tiên Tri đã phát hiện sói, Phù Thủy có thể độc
          const target = this.seerDiscoveredWolf && poisonCandidates.find((p) => p.id === this.seerDiscoveredWolf) 
            ? poisonCandidates.find((p) => p.id === this.seerDiscoveredWolf)
            : poisonCandidates[Math.floor(Math.random() * poisonCandidates.length)];
          killTargetId = target.id;
          if (stats) {
            stats.witchKills = (stats.witchKills || 0) + 1;
            if (target.role === ROLES.WEREWOLF) stats.witchKilledWolf = (stats.witchKilledWolf || 0) + 1;
          }
        }
      }

      gameState.handleNightAction(witch, {
        action: 'witch_act',
        save,
        killTargetId,
      });
    }

    // Kiểm tra xem Bảo vệ có cứu thành công không
    if (guard && wolfTarget && gameState.nightActions.bodyguardTarget === wolfTarget.id && !gameState.nightActions.witchSave) {
      if (stats) stats.guardSaves = (stats.guardSaves || 0) + 1;
    }

    // Giải quyết đêm
    gameState.resolveNight();

    // Xử lý Thợ Săn nếu chết trong đêm
    if (gameState.hunterPending) {
      this.resolveHunterShot(gameState.hunterPending, stats);
    }

    return gameState.checkWinCondition();
  }

  // Chạy 1 ngày đầy đủ (Thảo luận + Bỏ phiếu treo cổ)
  stepDay(stats = {}) {
    const gameState = this.room.gameState;
    gameState.dayNumber++;
    gameState.phase = PHASES.DAY_DISCUSSION;

    const alivePlayers = gameState.getAlivePlayers();
    if (alivePlayers.length === 0) {
      gameState.checkWinCondition();
      return true;
    }

    // Sang Bỏ Phiếu
    gameState.phase = PHASES.DAY_VOTING;
    gameState.dayVotes = {};

    // Mỗi AI bỏ phiếu theo vai trò và thông tin thu thập được
    for (const player of alivePlayers) {
      const aliveOthers = alivePlayers.filter((p) => p.id !== player.id);
      if (aliveOthers.length === 0) continue;

      let targetId = 'skip';

      if (player.role === ROLES.WEREWOLF) {
        // Sói tập trung vote dân thường, tránh vote đồng đội sói
        const nonWolves = aliveOthers.filter((p) => p.role !== ROLES.WEREWOLF);
        if (nonWolves.length > 0) {
          // Nếu có Tiên tri lộ diện, tập trung dồn vote Tiên tri
          const target = nonWolves.find((p) => p.role === ROLES.SEER) || nonWolves[Math.floor(Math.random() * nonWolves.length)];
          targetId = target.id;
        }
      } else if (player.role === ROLES.JESTER) {
        // Kẻ chán đời vote ngẫu nhiên hoặc skip
        targetId = Math.random() < 0.4 ? 'skip' : aliveOthers[Math.floor(Math.random() * aliveOthers.length)].id;
      } else if (player.role === ROLES.SEER && this.seerDiscoveredWolf) {
        // Tiên Tri vote người mình đã soi ra sói
        const wolfTarget = aliveOthers.find((p) => p.id === this.seerDiscoveredWolf);
        targetId = wolfTarget ? wolfTarget.id : aliveOthers[Math.floor(Math.random() * aliveOthers.length)].id;
      } else {
        // Dân làng theo đám đông hoặc theo Tiên tri
        if (this.seerDiscoveredWolf && Math.random() < 0.75) {
          targetId = this.seerDiscoveredWolf;
        } else {
          // 80% vote ai đó, 20% skip
          targetId = Math.random() < 0.8 ? aliveOthers[Math.floor(Math.random() * aliveOthers.length)].id : 'skip';
        }
      }

      gameState.handleDayVote(player, targetId);
    }

    // Giải quyết bỏ phiếu
    gameState.resolveDayVoting();

    // Xử lý Thợ Săn nếu bị treo cổ ban ngày
    if (gameState.hunterPending) {
      this.resolveHunterShot(gameState.hunterPending, stats);
    }

    return gameState.checkWinCondition();
  }

  // Xử lý phát súng báo thù của Thợ Săn
  resolveHunterShot(hunterId, stats = {}) {
    const gameState = this.room.gameState;
    const aliveTargets = gameState.getAlivePlayers().filter((p) => p.id !== hunterId);
    if (aliveTargets.length > 0) {
      // Thợ săn ưu tiên bắn Sói nếu đã bị chỉ điểm, hoặc bắn kẻ đáng ngờ nhất
      let target = null;
      if (this.seerDiscoveredWolf) {
        target = aliveTargets.find((p) => p.id === this.seerDiscoveredWolf);
      }
      if (!target) {
        target = aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
      }
      gameState.handleHunterShot(hunterId, target.id);
      if (stats) {
        stats.hunterShots = (stats.hunterShots || 0) + 1;
        if (target.role === ROLES.WEREWOLF) stats.hunterShotWolves = (stats.hunterShotWolves || 0) + 1;
      }
    } else {
      gameState.finishHunterTurn(null);
    }
  }

  // Chạy toàn bộ ván đấu cho đến khi kết thúc (tối đa 20 vòng để tránh lặp vô tận)
  playFullGame(stats = {}) {
    this.startGame();
    const gameState = this.room.gameState;
    let round = 0;
    const MAX_ROUNDS = 20;

    while (gameState.phase !== PHASES.GAME_OVER && round < MAX_ROUNDS) {
      round++;
      // Đêm
      const nightOver = this.stepNight(stats);
      if (nightOver) break;

      // Ngày
      const dayOver = this.stepDay(stats);
      if (dayOver) break;
    }

    return {
      winner: gameState.winner,
      winReason: gameState.winReason,
      rounds: round,
      aliveCount: gameState.getAlivePlayers().length,
      nightDeathsTotal: gameState.room.players.filter((p) => !p.isAlive).length,
      logsCount: gameState.logs.length,
    };
  }
}

// ============================================================================
// BỘ KIỂM THỬ TỔNG HỢP: 6 CHẾ ĐỘ X 10 LẦN = 60 TRẬN ĐẤU CỦA 9 AI
// ============================================================================
export async function runAllModeSimulations() {
  console.log('================================================================');
  console.log('🤖 BẮT ĐẦU MÔ PHỎNG 60 TRẬN ĐẤU CỦA TEAM 9 AI NGƯỜI CHƠI 🤖');
  console.log('================================================================');
  console.log('Danh sách 9 AI: ' + AI_TEAM.map((p) => `${p.name} (${p.avatar})`).join(', '));
  console.log('----------------------------------------------------------------\n');

  const benchmarkReport = {
    totalGames: 0,
    modes: {},
    overallWins: { [TEAMS.VILLAGE]: 0, [TEAMS.WEREWOLF]: 0, [TEAMS.LOVERS]: 0, [TEAMS.SOLO]: 0, DRAW: 0 },
    statsSummary: {
      guardSaves: 0,
      witchSaves: 0,
      witchKills: 0,
      witchKilledWolf: 0,
      hunterShots: 0,
      hunterShotWolves: 0,
      cupidPairings: 0,
    },
    anomalies: [],
  };

  const MODES_TO_TEST = [
    {
      id: 'classic',
      name: 'Chế độ Cổ Điển (Classic)',
      config: {
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
      },
    },
    {
      id: 'blood_moon',
      name: 'Chế độ Trăng Máu (Blood Moon - 3 Sói)',
      config: {
        mode: 'blood_moon',
        roleConfig: {
          [ROLES.WEREWOLF]: 3,
          [ROLES.SEER]: 1,
          [ROLES.BODYGUARD]: 1,
          [ROLES.WITCH]: 1,
          [ROLES.HUNTER]: 1,
          [ROLES.VILLAGER]: 2,
        },
      },
    },
    {
      id: 'lovers_chaos',
      name: 'Chế độ Tình Yêu & Hỗn Loạn (Lovers & Chaos)',
      config: {
        mode: 'lovers_chaos',
        roleConfig: {
          [ROLES.WEREWOLF]: 2,
          [ROLES.CUPID]: 1,
          [ROLES.JESTER]: 1,
          [ROLES.SEER]: 1,
          [ROLES.HUNTER]: 1,
          [ROLES.BODYGUARD]: 1,
          [ROLES.VILLAGER]: 2,
        },
      },
    },
    {
      id: 'blitz',
      name: 'Chế độ Chớp Nhoáng (Blitz Mode)',
      config: {
        mode: 'blitz',
        roleConfig: {
          [ROLES.WEREWOLF]: 2,
          [ROLES.SEER]: 1,
          [ROLES.BODYGUARD]: 1,
          [ROLES.WITCH]: 1,
          [ROLES.HUNTER]: 1,
          [ROLES.CUPID]: 1,
          [ROLES.VILLAGER]: 2,
        },
      },
    },
    {
      id: 'custom_edge_cases',
      name: 'Chế độ Tùy Chỉnh & Edge Cases (Custom Rules)',
      config: {
        mode: 'custom',
        roleConfig: {
          [ROLES.WEREWOLF]: 2,
          [ROLES.JESTER]: 1,
          [ROLES.WITCH]: 1,
          [ROLES.HUNTER]: 1,
          [ROLES.BODYGUARD]: 1,
          [ROLES.CUPID]: 1,
          [ROLES.SEER]: 1,
          [ROLES.VILLAGER]: 1,
        },
      },
    },
    {
      id: 'custom_deck_moderator',
      name: 'Chế độ Custom Deck & AI Quản Trò (AI Moderator / God Mode)',
      config: {
        mode: 'custom',
        moderatorMode: 'human',
        roleConfig: {
          [ROLES.WEREWOLF]: 2,
          [ROLES.SEER]: 1,
          [ROLES.BODYGUARD]: 1,
          [ROLES.WITCH]: 1,
          [ROLES.HUNTER]: 1,
          [ROLES.JESTER]: 1,
          [ROLES.VILLAGER]: 2,
        },
      },
    },
  ];

  const ITERATIONS_PER_MODE = 10;

  for (const modeDef of MODES_TO_TEST) {
    console.log(`▶▶ ĐANG CHẠY 10 TRẬN: [${modeDef.name}]...`);
    const modeStats = {
      name: modeDef.name,
      iterations: ITERATIONS_PER_MODE,
      wins: { [TEAMS.VILLAGE]: 0, [TEAMS.WEREWOLF]: 0, [TEAMS.LOVERS]: 0, [TEAMS.SOLO]: 0, DRAW: 0 },
      roundsTotal: 0,
      guardSaves: 0,
      witchSaves: 0,
      witchKills: 0,
      witchKilledWolf: 0,
      hunterShots: 0,
      hunterShotWolves: 0,
      cupidPairings: 0,
      gameResults: [],
    };

    for (let i = 1; i <= ITERATIONS_PER_MODE; i++) {
      const sim = new GameSimulator(`ROOM_${modeDef.id.toUpperCase()}_${i}`, modeDef.config);

      // Thử nghiệm thêm chức năng God Mode cho chế độ số 6
      if (modeDef.id === 'custom_deck_moderator') {
        const hostState = sim.room.gameState.getPublicState('ai_1');
        assert(hostState.isGodModerator, 'Host phải có cờ isGodModerator');
        assert(hostState.moderatorScript.length > 0, 'Phải có kịch bản AI Moderator ban đêm');
      }

      const matchStats = {
        guardSaves: 0,
        witchSaves: 0,
        witchKills: 0,
        witchKilledWolf: 0,
        hunterShots: 0,
        hunterShotWolves: 0,
        cupidPairings: 0,
      };

      const result = sim.playFullGame(matchStats);

      // Ghi nhận kết quả
      const winner = result.winner || 'DRAW';
      modeStats.wins[winner] = (modeStats.wins[winner] || 0) + 1;
      benchmarkReport.overallWins[winner] = (benchmarkReport.overallWins[winner] || 0) + 1;
      modeStats.roundsTotal += result.rounds;

      // Cộng dồn chỉ số kỹ năng
      for (const [key, val] of Object.entries(matchStats)) {
        modeStats[key] = (modeStats[key] || 0) + val;
        benchmarkReport.statsSummary[key] = (benchmarkReport.statsSummary[key] || 0) + val;
      }

      modeStats.gameResults.push({
        gameIndex: i,
        winner,
        rounds: result.rounds,
        aliveCount: result.aliveCount,
        reason: result.winReason,
      });

      benchmarkReport.totalGames++;
    }

    const avgRounds = (modeStats.roundsTotal / ITERATIONS_PER_MODE).toFixed(1);
    console.log(`   ✓ Hoàn tất 10/10 trận. Số vòng trung bình: ${avgRounds}`);
    console.log(`   🏆 Kết quả: Dân Làng ${modeStats.wins[TEAMS.VILLAGE]} | Ma Sói ${modeStats.wins[TEAMS.WEREWOLF]} | Cặp Đôi ${modeStats.wins[TEAMS.LOVERS]} | Kẻ Chán Đời ${modeStats.wins[TEAMS.SOLO]} | Hòa ${modeStats.wins.DRAW}`);
    console.log(`   🛡️ Bảo vệ đỡ: ${modeStats.guardSaves} | 🧪 Phù thủy cứu: ${modeStats.witchSaves}, độc: ${modeStats.witchKills} (trúng sói: ${modeStats.witchKilledWolf}) | 🏹 Thợ săn bắn: ${modeStats.hunterShots} (trúng sói: ${modeStats.hunterShotWolves})\n`);

    benchmarkReport.modes[modeDef.id] = modeStats;
  }

  // ============================================================================
  // KIỂM TRA ĐẶC BIỆT CÁC TÌNH HUỐNG BIÊN (EDGE CASES) ĐỂ TÌM BUG
  // ============================================================================
  console.log('----------------------------------------------------------------');
  console.log('🔍 KIỂM TRA CHUYÊN SÂU CÁC TÌNH HUỐNG BIÊN & PHÁT HIỆN LỖI LOGIC:');
  console.log('----------------------------------------------------------------');

  // Case 1: Thợ săn là người yêu (Hunter is Lover) tự sát khi người yêu bị treo cổ
  console.log('[Edge Case 1] Kiểm tra Thợ Săn là người yêu tự sát khi bạn tình bị treo cổ...');
  const simEdge1 = new GameSimulator('EDGE_01', {
    roleConfig: { [ROLES.WEREWOLF]: 1, [ROLES.HUNTER]: 1, [ROLES.VILLAGER]: 7 },
  });
  simEdge1.startGame();
  const state1 = simEdge1.room.gameState;
  const pVil = simEdge1.room.players[0]; // Dân
  const pHunter = simEdge1.room.players[1]; // Thợ săn
  pVil.role = ROLES.VILLAGER;
  pHunter.role = ROLES.HUNTER;
  pVil.loverId = pHunter.id;
  pHunter.loverId = pVil.id;

  // Treo cổ Dân làng pVil
  state1.phase = PHASES.DAY_VOTING;
  for (const p of simEdge1.room.players) {
    state1.handleDayVote(p, pVil.id);
  }
  state1.resolveDayVoting();

  // Kiểm tra xem pHunter có chết không và có được kích hoạt hunterPending không
  assert.strictEqual(pVil.isAlive, false, 'Dân làng bị treo cổ phải chết');
  assert.strictEqual(pHunter.isAlive, false, 'Thợ săn người tình phải tự sát');
  if (!state1.hunterPending) {
    const bugInfo = 'LỖI LOGIC PHÁT HIỆN: Khi người chơi bị treo cổ ban ngày khiến người yêu là Thợ Săn tự sát, engine không kích hoạt hunterPending cho Thợ Săn (chỉ kích hoạt nếu người bị trực tiếp bỏ phiếu là Thợ Săn).';
    console.log(`   ⚠️ [CẢNH BÁO BỌ]: ${bugInfo}`);
    benchmarkReport.anomalies.push({
      type: 'LOGIC_FLAW',
      code: 'HUNTER_LOVER_SUICIDE_MISSED',
      description: bugInfo,
    });
  } else {
    console.log('   ✓ Thợ săn kích hoạt phát súng trả thù thành công khi tự sát!');
  }

  // Case 2: Kiểm tra thẻ bài Mở rộng Tarot (Alpha Wolf, White Wolf) trong Game Engine
  console.log('\n[Edge Case 2] Kiểm tra vai trò Tarot Mở Rộng (Alpha Wolf & White Wolf) trong Engine...');
  const simEdge2 = new GameSimulator('EDGE_02', {
    roleConfig: { [ROLES.ALPHA_WOLF]: 1, [ROLES.WHITE_WOLF]: 1, [ROLES.VILLAGER]: 7 },
  });
  simEdge2.startGame();
  const state2 = simEdge2.room.gameState;
  // Kiểm tra getAliveWerewolves()
  const detectedWolves = state2.getAliveWerewolves();
  if (detectedWolves.length === 0) {
    const bugInfo = 'LỖI THIẾU TƯƠNG THÍCH VAI TRÒ MỞ RỘNG: getAliveWerewolves() trong GameState.js chỉ kiểm tra cứng p.role === ROLES.WEREWOLF. Sói Đầu Đàn (alpha_wolf) và Sói Con (wolf_pup) không được nhận diện là sói, dẫn đến phe Dân thắng ngay lập tức!';
    console.log(`   ⚠️ [CẢNH BÁO BỌ NGHIÊM TRỌNG]: ${bugInfo}`);
    benchmarkReport.anomalies.push({
      type: 'ENGINE_COMPATIBILITY_BUG',
      code: 'EXPANSION_WOLVES_UNRECOGNIZED',
      description: bugInfo,
    });
  } else {
    console.log('   ✓ Vai trò Sói mở rộng được hỗ trợ đầy đủ!');
  }

  // Case 3: Kẻ chán đời (Jester) bị treo cổ ban ngày
  console.log('\n[Edge Case 3] Kiểm tra Kẻ Chán Đời (Jester) thắng đơn độc khi bị treo cổ...');
  const simEdge3 = new GameSimulator('EDGE_03', {
    roleConfig: { [ROLES.JESTER]: 1, [ROLES.WEREWOLF]: 2, [ROLES.VILLAGER]: 6 },
  });
  simEdge3.startGame();
  const state3 = simEdge3.room.gameState;
  const pJester = simEdge3.room.players.find((p) => p.role === ROLES.JESTER);
  state3.phase = PHASES.DAY_VOTING;
  for (const p of simEdge3.room.players) {
    state3.handleDayVote(p, pJester.id);
  }
  state3.resolveDayVoting();
  assert.strictEqual(state3.winner, TEAMS.SOLO, 'Phe Solo phải thắng khi Jester bị treo cổ');
  console.log('   ✓ Jester thắng tuyệt đối khi bị treo cổ, game lập tức kết thúc chính xác!');

  console.log('\n================================================================');
  console.log('🎉 TỔNG KẾT MÔ PHỎNG 60 TRẬN VÀ KIỂM THỬ BIÊN HOÀN TẤT 🎉');
  console.log('================================================================');
  console.log(`Tổng số trận đã chạy: ${benchmarkReport.totalGames}`);
  console.log(`Tỉ lệ thắng toàn diện:`);
  console.log(`- Phe Dân Làng: ${benchmarkReport.overallWins[TEAMS.VILLAGE]} trận (${((benchmarkReport.overallWins[TEAMS.VILLAGE] / benchmarkReport.totalGames) * 100).toFixed(1)}%)`);
  console.log(`- Phe Ma Sói:   ${benchmarkReport.overallWins[TEAMS.WEREWOLF]} trận (${((benchmarkReport.overallWins[TEAMS.WEREWOLF] / benchmarkReport.totalGames) * 100).toFixed(1)}%)`);
  console.log(`- Cặp Đôi:      ${benchmarkReport.overallWins[TEAMS.LOVERS]} trận (${((benchmarkReport.overallWins[TEAMS.LOVERS] / benchmarkReport.totalGames) * 100).toFixed(1)}%)`);
  console.log(`- Kẻ Chán Đời:  ${benchmarkReport.overallWins[TEAMS.SOLO]} trận (${((benchmarkReport.overallWins[TEAMS.SOLO] / benchmarkReport.totalGames) * 100).toFixed(1)}%)`);
  console.log(`- Hòa:          ${benchmarkReport.overallWins.DRAW} trận (${((benchmarkReport.overallWins.DRAW / benchmarkReport.totalGames) * 100).toFixed(1)}%)`);
  console.log(`Số lỗi / bất thường phát hiện: ${benchmarkReport.anomalies.length}`);

  return benchmarkReport;
}

// Chạy trực tiếp nếu file được thực thi bằng node
if (process.argv[1]?.endsWith('ai_team_simulation.js')) {
  runAllModeSimulations()
    .then((report) => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('Lỗi mô phỏng AI Team:', err);
      process.exit(1);
    });
}
