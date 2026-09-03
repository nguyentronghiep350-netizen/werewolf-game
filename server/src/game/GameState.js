import { ROLES, TEAMS, ROLE_DEFINITIONS } from './RoleManager.js';
import { AIModerator } from './AIModerator.js';

export const PHASES = {
  LOBBY: 'LOBBY',
  STARTING: 'STARTING',
  NIGHT_START: 'NIGHT_START',
  NIGHT_ACTION: 'NIGHT_ACTION',
  MORNING: 'MORNING',
  HUNTER_ACTION: 'HUNTER_ACTION',
  DAY_DISCUSSION: 'DAY_DISCUSSION',
  DAY_VOTING: 'DAY_VOTING',
  DAY_EXECUTION: 'DAY_EXECUTION',
  GAME_OVER: 'GAME_OVER',
};

export class GameState {
  constructor(room) {
    this.room = room;
    this.phase = PHASES.LOBBY;
    this.nightNumber = 0;
    this.dayNumber = 0;
    this.timer = 0;
    this.timerInterval = null;
    this.currentScriptStep = 0;
    this.logs = []; // Nhật ký sự kiện toàn trận
    this.winner = null; // TEAMS.VILLAGE | TEAMS.WEREWOLF | TEAMS.LOVERS | TEAMS.SOLO | 'DRAW'
    this.winReason = '';

    // Hành động ban đêm tạm thời trong đêm hiện tại
    this.nightActions = {
      cupidTarget1: null,
      cupidTarget2: null,
      bodyguardTarget: null,
      werewolfVotes: {}, // { playerId: targetId }
      seerTarget: null,
      seerResult: null, // { targetId, role, team }
      witchSave: false,
      witchKillTarget: null,
    };

    // Bỏ phiếu ban ngày
    this.dayVotes = {}; // { playerId: targetId | 'skip' }
    this.discussionSkipVotes = new Set(); // những người muốn skip thảo luận

    // Trạng thái thợ săn bắn trả thù
    this.hunterPending = null; // playerId của thợ săn đang phải bắn
    this.hunterPendingReason = null; // 'night' | 'day'

    // Danh sách người chết đêm qua để hiển thị ở Morning
    this.nightDeaths = [];
  }

  addLog(type, message, details = {}) {
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type, // 'system' | 'night' | 'day' | 'death' | 'vote' | 'seer'
      message,
      details,
    };
    this.logs.push(logEntry);
    this.room.broadcast('game:log', logEntry);
  }

  startTimer(seconds, onTick, onComplete) {
    this.clearTimer();
    this.timer = seconds;
    this.room.broadcast('game:timer', { timer: this.timer });

    this.timerInterval = setInterval(() => {
      this.timer--;
      if (onTick) onTick(this.timer);
      this.room.broadcast('game:timer', { timer: this.timer });

      if (this.timer <= 0) {
        this.clearTimer();
        if (onComplete) onComplete();
      }
    }, 1000);
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getAlivePlayers() {
    return this.room.players.filter((p) => p.isAlive);
  }

  getAliveWerewolves() {
    return this.room.players.filter((p) => p.isAlive && p.role === ROLES.WEREWOLF);
  }

  getPlayer(playerId) {
    return this.room.players.find((p) => p.id === playerId);
  }

  // Khởi động ván game mới
  startNewGame() {
    this.phase = PHASES.STARTING;
    this.nightNumber = 0;
    this.dayNumber = 0;
    this.logs = [];
    this.winner = null;
    this.winReason = '';
    this.discussionSkipVotes.clear();

    this.addLog('system', 'Ván game đã chính thức bắt đầu! Hãy ghi nhớ vai trò bí mật của mình.');

    this.startTimer(4, null, () => {
      this.enterNight();
    });
  }

  // Vào Ban Đêm
  enterNight() {
    this.nightNumber++;
    this.phase = PHASES.NIGHT_START;
    this.nightActions = {
      cupidTarget1: null,
      cupidTarget2: null,
      bodyguardTarget: null,
      werewolfVotes: {},
      seerTarget: null,
      seerResult: null,
      witchSave: false,
      witchKillTarget: null,
    };
    this.nightDeaths = [];

    this.addLog('night', `Đêm thứ ${this.nightNumber} buông xuống... Tiếng sói hú xé toạc màn đêm tĩnh mịch.`);
    this.room.broadcastState();

    // 3 giây mở màn ban đêm với âm thanh trăng sao rùng rợn, sau đó sang NIGHT_ACTION
    this.startTimer(3, null, () => {
      this.phase = PHASES.NIGHT_ACTION;
      this.room.broadcastState();

      // Bot AI thực hiện hành vi ban đêm
      this.room.triggerBotNightActions();

      // Thời gian ban đêm theo cấu hình phòng (mặc định 30s)
      const duration = this.room.config.nightDuration || 30;
      this.startTimer(duration, null, () => {
        this.resolveNight();
      });
    });
  }

  // Xử lý các hành động ban đêm của người chơi
  handleNightAction(player, actionData) {
    if (this.phase !== PHASES.NIGHT_ACTION || !player.isAlive) return false;

    const { action, targetId, target2Id, save, killTargetId } = actionData;

    // 1. Thần Tình Yêu (Cupid) - chỉ đêm 1
    if (player.role === ROLES.CUPID && this.nightNumber === 1 && action === 'cupid_pair') {
      const p1 = this.getPlayer(targetId);
      const p2 = this.getPlayer(target2Id);
      if (p1 && p2 && p1.id !== p2.id && p1.isAlive && p2.isAlive) {
        this.nightActions.cupidTarget1 = p1.id;
        this.nightActions.cupidTarget2 = p2.id;
        p1.loverId = p2.id;
        p2.loverId = p1.id;

        // Báo cho 2 người yêu nhau
        this.room.sendToPlayer(p1.id, 'game:lover_paired', {
          partnerId: p2.id,
          partnerName: p2.name,
          partnerRole: p2.role,
        });
        this.room.sendToPlayer(p2.id, 'game:lover_paired', {
          partnerId: p1.id,
          partnerName: p1.name,
          partnerRole: p1.role,
        });

        this.addLog('night', `Thần Tình Yêu đã bắn mũi tên kết đôi 2 tâm hồn!`, { secret: true });
        this.checkAllNightActionsComplete();
        return true;
      }
    }

    // 2. Bảo Vệ (Bodyguard)
    if (player.role === ROLES.BODYGUARD && action === 'protect') {
      const target = this.getPlayer(targetId);
      if (target && target.isAlive && target.id !== player.lastProtectedId) {
        this.nightActions.bodyguardTarget = target.id;
        player.lastProtectedId = target.id;
        this.checkAllNightActionsComplete();
        return true;
      }
    }

    // 3. Ma Sói (Werewolf) vote cắn
    if (player.role === ROLES.WEREWOLF && action === 'werewolf_vote') {
      const target = this.getPlayer(targetId);
      if (target && target.isAlive) {
        this.nightActions.werewolfVotes[player.id] = target.id;

        // Báo cho toàn bộ đàn sói cập nhật phiếu bầu của nhau
        this.getAliveWerewolves().forEach((wolf) => {
          this.room.sendToPlayer(wolf.id, 'werewolf:votes_update', {
            votes: this.nightActions.werewolfVotes,
          });
        });

        // Cập nhật cho phù thủy biết ai đang bị cắn nhiều nhất
        this.notifyWitchCurrentVictim();
        this.checkAllNightActionsComplete();
        return true;
      }
    }

    // 4. Tiên Tri (Seer) soi
    if (player.role === ROLES.SEER && action === 'seer_inspect') {
      const target = this.getPlayer(targetId);
      if (target && target.isAlive && target.id !== player.id) {
        this.nightActions.seerTarget = target.id;
        const targetRoleDef = ROLE_DEFINITIONS[target.role];
        const result = {
          targetId: target.id,
          targetName: target.name,
          role: target.role,
          roleName: targetRoleDef.name,
          team: targetRoleDef.team,
          isWerewolf: target.role === ROLES.WEREWOLF,
        };
        this.nightActions.seerResult = result;

        this.room.sendToPlayer(player.id, 'seer:inspection_result', result);
        this.checkAllNightActionsComplete();
        return true;
      }
    }

    // 5. Phù Thủy (Witch)
    if (player.role === ROLES.WITCH && action === 'witch_act') {
      if (save && !player.witchSaveUsed) {
        this.nightActions.witchSave = true;
        player.witchSaveUsed = true;
      }
      if (killTargetId && !player.witchKillUsed) {
        const killTarget = this.getPlayer(killTargetId);
        if (killTarget && killTarget.isAlive) {
          this.nightActions.witchKillTarget = killTarget.id;
          player.witchKillUsed = true;
        }
      }
      this.checkAllNightActionsComplete();
      return true;
    }

    return false;
  }

  // Tính xem ai bị Sói cắn nhiều nhất
  getWerewolfTarget() {
    const voteCounts = {};
    for (const targetId of Object.values(this.nightActions.werewolfVotes)) {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }
    let maxVotes = 0;
    let chosenTarget = null;
    for (const [targetId, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        chosenTarget = targetId;
      }
    }
    return chosenTarget;
  }

  notifyWitchCurrentVictim() {
    const targetId = this.getWerewolfTarget();
    const witch = this.room.players.find((p) => p.isAlive && p.role === ROLES.WITCH);
    if (witch && !witch.isBot) {
      const victim = targetId ? this.getPlayer(targetId) : null;
      this.room.sendToPlayer(witch.id, 'witch:victim_info', {
        victimId: victim ? victim.id : null,
        victimName: victim ? victim.name : null,
      });
    }
  }

  // Tự động kiểm tra xem các vai trò còn sống đã submit hết chưa để kết thúc đêm sớm
  checkAllNightActionsComplete() {
    const aliveCupid = this.room.players.find((p) => p.isAlive && p.role === ROLES.CUPID);
    if (this.nightNumber === 1 && aliveCupid && (!this.nightActions.cupidTarget1 || !this.nightActions.cupidTarget2)) {
      return;
    }

    const aliveBodyguard = this.room.players.find((p) => p.isAlive && p.role === ROLES.BODYGUARD);
    if (aliveBodyguard && !this.nightActions.bodyguardTarget) {
      return;
    }

    const aliveWolves = this.getAliveWerewolves();
    if (aliveWolves.length > 0 && Object.keys(this.nightActions.werewolfVotes).length < aliveWolves.length) {
      return;
    }

    const aliveSeer = this.room.players.find((p) => p.isAlive && p.role === ROLES.SEER);
    if (aliveSeer && !this.nightActions.seerTarget) {
      return;
    }

    // Nếu tất cả đã hoàn thành, có thể rút ngắn timer còn 2 giây để chuyển phase
    if (this.timer > 2) {
      this.timer = 2;
    }
  }

  // Giải quyết đêm (Resolve Night)
  resolveNight() {
    this.clearTimer();

    const deadThisNight = new Set();
    const wolfTargetId = this.getWerewolfTarget();
    const protectedId = this.nightActions.bodyguardTarget;
    const witchSaved = this.nightActions.witchSave;
    const witchKillId = this.nightActions.witchKillTarget;

    // 1. Sói cắn
    if (wolfTargetId) {
      const wolfTarget = this.getPlayer(wolfTargetId);
      if (wolfTarget && wolfTarget.isAlive) {
        if (wolfTargetId === protectedId) {
          this.addLog('night', `Đêm qua Bảo vệ đã che chở thành công cho mục tiêu bị sói tấn công!`, { secret: true });
        } else if (witchSaved) {
          this.addLog('night', `Phù thủy đã sử dụng bình thuốc thần kỳ cứu sống nạn nhân của bầy sói!`, { secret: true });
        } else {
          deadThisNight.add({ player: wolfTarget, reason: 'Bị Ma Sói cắn chết' });
        }
      }
    }

    // 2. Phù thủy đầu độc
    if (witchKillId) {
      const poisonTarget = this.getPlayer(witchKillId);
      if (poisonTarget && poisonTarget.isAlive) {
        deadThisNight.add({ player: poisonTarget, reason: 'Bị Phù Thủy đầu độc chết' });
      }
    }

    // 3. Xử lý cái chết và Cặp đôi đau buồn chết theo
    this.nightDeaths = [];
    const pendingLovers = [];

    for (const death of deadThisNight) {
      this.killPlayer(death.player, death.reason);
      this.nightDeaths.push({
        id: death.player.id,
        name: death.player.name,
        role: death.player.role,
        roleName: ROLE_DEFINITIONS[death.player.role].name,
        reason: death.reason,
      });

      // Nếu có người yêu còn sống
      if (death.player.loverId) {
        const lover = this.getPlayer(death.player.loverId);
        if (lover && lover.isAlive) {
          pendingLovers.push(lover);
        }
      }
    }

    // Xử lý người yêu tự sát
    for (const lover of pendingLovers) {
      if (lover.isAlive) {
        this.killPlayer(lover, 'Tự sát vì quá đau buồn khi người yêu qua đời');
        this.nightDeaths.push({
          id: lover.id,
          name: lover.name,
          role: lover.role,
          roleName: ROLE_DEFINITIONS[lover.role].name,
          reason: 'Tự sát vì quá đau buồn khi người yêu qua đời',
        });
      }
    }

    // 4. Kiểm tra xem có Thợ Săn chết không
    const deadHunter = this.nightDeaths.find((d) => d.role === ROLES.HUNTER);
    if (deadHunter) {
      const hunterPlayer = this.getPlayer(deadHunter.id);
      if (hunterPlayer && !hunterPlayer.hunterShotUsed) {
        this.hunterPending = hunterPlayer.id;
        this.hunterPendingReason = 'night';
      }
    }

    // Chuyển sang MORNING
    this.enterMorning();
  }

  // Đánh dấu người chơi đã chết
  killPlayer(player, reason) {
    player.isAlive = false;
    player.deathReason = reason;
    player.deathNight = this.nightNumber;
  }

  // Vào Rạng Sáng (Morning)
  enterMorning() {
    this.phase = PHASES.MORNING;

    if (this.nightDeaths.length === 0) {
      this.addLog('day', `Mặt trời đã lên trên ngôi làng. Đêm qua trôi qua trong bình yên, không có ai thiệt mạng!`);
    } else {
      const deathNames = this.nightDeaths.map((d) => `${d.name} (${d.roleName})`).join(', ');
      this.addLog('death', `Mặt trời mọc rọi sáng bi kịch. Đêm qua đã có người ra đi vĩnh viễn: ${deathNames}.`);
    }

    this.room.broadcastState();

    // Nếu có Thợ Săn kích hoạt bắn trả thù
    if (this.hunterPending) {
      this.enterHunterTurn();
      return;
    }

    // Kiểm tra kết thúc game ngay
    if (this.checkWinCondition()) {
      return;
    }

    // Hiển thị kết quả sáng trong 6 giây rồi sang thảo luận
    this.startTimer(6, null, () => {
      this.enterDayDiscussion();
    });
  }

  // Lượt Thợ Săn bắn trả thù
  enterHunterTurn() {
    this.phase = PHASES.HUNTER_ACTION;
    const hunter = this.getPlayer(this.hunterPending);
    this.addLog('system', `Thợ Săn ${hunter ? hunter.name : ''} đang giương súng trả thù trước khi ngã xuống!`);
    this.room.broadcastState();

    if (hunter && hunter.isBot) {
      // Bot Thợ săn chọn bắn
      this.room.triggerBotHunterShot(hunter);
    }

    // 15 giây cho Thợ săn chọn mục tiêu
    this.startTimer(15, null, () => {
      // Nếu hết giờ mà thợ săn chưa bắn thì tự động bỏ lỡ phát bắn
      this.finishHunterTurn(null);
    });
  }

  handleHunterShot(playerId, targetId) {
    if (this.phase !== PHASES.HUNTER_ACTION || this.hunterPending !== playerId) return false;

    const hunter = this.getPlayer(playerId);
    const target = this.getPlayer(targetId);

    if (hunter && target && target.isAlive && target.id !== hunter.id) {
      hunter.hunterShotUsed = true;
      this.finishHunterTurn(target);
      return true;
    }
    return false;
  }

  finishHunterTurn(target) {
    this.clearTimer();
    const hunter = this.getPlayer(this.hunterPending);
    this.hunterPending = null;

    if (target && target.isAlive) {
      this.killPlayer(target, `Bị Thợ Săn ${hunter.name} bắn hạ trước khi chết`);
      this.addLog('death', `Đoàng! Phát súng bạc oan nghiệt của Thợ Săn ${hunter.name} đã kết liễu ${target.name} (${ROLE_DEFINITIONS[target.role].name})!`);

      // Nếu target có người yêu
      if (target.loverId) {
        const lover = this.getPlayer(target.loverId);
        if (lover && lover.isAlive) {
          this.killPlayer(lover, 'Tự sát vì quá đau buồn khi người yêu qua đời');
          this.addLog('death', `${lover.name} (${ROLE_DEFINITIONS[lover.role].name}) đã tự sát theo người yêu!`);
        }
      }
    } else {
      this.addLog('system', `Thợ Săn đã không kịp nhả đạn trước khi trút hơi thở cuối cùng.`);
    }

    this.room.broadcastState();

    if (this.checkWinCondition()) return;

    if (this.hunterPendingReason === 'night') {
      this.enterDayDiscussion();
    } else {
      // Thợ săn chết lúc bị treo cổ ban ngày -> kết thúc ngày vào đêm
      this.enterNight();
    }
  }

  // Vào Thảo Luận Ban Ngày (Day Discussion)
  enterDayDiscussion() {
    this.dayNumber++;
    this.phase = PHASES.DAY_DISCUSSION;
    this.discussionSkipVotes.clear();
    this.dayVotes = {};

    this.addLog('day', `Ngày thứ ${this.dayNumber}: Dân làng tập trung tại quảng trường để thảo luận tìm ra Ma Sói!`);
    this.room.broadcastState();

    // Kích hoạt Bot chat thảo luận
    this.room.triggerBotDayChatter();

    const duration = this.room.config.discussionDuration || 45;
    this.startTimer(duration, null, () => {
      this.enterDayVoting();
    });
  }

  // Người chơi bấm Skip thảo luận
  handleSkipDiscussion(player) {
    if (this.phase !== PHASES.DAY_DISCUSSION || !player.isAlive) return;

    this.discussionSkipVotes.add(player.id);
    const aliveCount = this.getAlivePlayers().length;

    this.room.broadcast('game:skip_update', {
      skips: Array.from(this.discussionSkipVotes),
      needed: Math.ceil(aliveCount / 2),
    });

    if (this.discussionSkipVotes.size >= Math.ceil(aliveCount / 2)) {
      this.addLog('day', `Đa số dân làng đã đồng ý kết thúc thảo luận sớm để tiến hành bỏ phiếu!`);
      this.clearTimer();
      this.enterDayVoting();
    }
  }

  // Vào Bỏ Phiếu Treo Cổ (Day Voting)
  enterDayVoting() {
    this.phase = PHASES.DAY_VOTING;
    this.dayVotes = {};

    this.addLog('vote', `Thời khắc phán xét! Hãy bỏ phiếu người bạn nghi ngờ là Ma Sói để đưa lên giàn treo cổ.`);
    this.room.broadcastState();

    // Kích hoạt Bot bỏ phiếu
    this.room.triggerBotDayVotes();

    const duration = this.room.config.votingDuration || 30;
    this.startTimer(duration, null, () => {
      this.resolveDayVoting();
    });
  }

  handleDayVote(player, targetId) {
    if (this.phase !== PHASES.DAY_VOTING || !player.isAlive) return false;

    // targetId có thể là playerId hoặc 'skip'
    this.dayVotes[player.id] = targetId;

    this.room.broadcast('game:day_votes_update', {
      votes: this.dayVotes,
    });

    // Nếu tất cả người sống đã vote
    const alivePlayers = this.getAlivePlayers();
    if (Object.keys(this.dayVotes).length >= alivePlayers.length) {
      if (this.timer > 2) {
        this.timer = 2; // Rút ngắn còn 2s
      }
    }
    return true;
  }

  // Giải quyết Bỏ Phiếu Treo Cổ
  resolveDayVoting() {
    this.clearTimer();
    this.phase = PHASES.DAY_EXECUTION;

    const voteCounts = {};
    let skipCount = 0;

    for (const targetId of Object.values(this.dayVotes)) {
      if (targetId === 'skip') {
        skipCount++;
      } else {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
      }
    }

    let highestVote = 0;
    let candidates = [];

    for (const [targetId, count] of Object.entries(voteCounts)) {
      if (count > highestVote) {
        highestVote = count;
        candidates = [targetId];
      } else if (count === highestVote) {
        candidates.push(targetId);
      }
    }

    let executedPlayer = null;

    if (highestVote === 0 || highestVote <= skipCount || candidates.length > 1) {
      if (candidates.length > 1) {
        this.addLog('vote', `Hòa phiếu giữa các ứng viên! Không ai bị treo cổ trong hôm nay.`);
      } else {
        this.addLog('vote', `Đa số dân làng chọn bỏ phiếu trắng. Không ai bị treo cổ.`);
      }
    } else {
      executedPlayer = this.getPlayer(candidates[0]);
    }

    if (executedPlayer && executedPlayer.isAlive) {
      // Kiểm tra Kẻ Chán Đời (Jester)
      if (executedPlayer.role === ROLES.JESTER) {
        this.killPlayer(executedPlayer, 'Bị dân làng treo cổ');
        this.addLog('vote', `Dân làng đã treo cổ ${executedPlayer.name}! Nhưng họ bàng hoàng nhận ra đó là Kẻ Chán Đời!`);
        this.room.broadcastState();

        this.winner = TEAMS.SOLO;
        this.winReason = `Kẻ Chán Đời ${executedPlayer.name} đã lừa được cả làng treo cổ mình và giành chiến thắng rực rỡ!`;
        this.endGame();
        return;
      }

      this.killPlayer(executedPlayer, 'Bị dân làng bỏ phiếu treo cổ');
      this.addLog('death', `Với ${highestVote} phiếu thuận, ${executedPlayer.name} (${ROLE_DEFINITIONS[executedPlayer.role].name}) đã bị đưa lên giàn treo cổ!`);

      // Nếu có người yêu
      if (executedPlayer.loverId) {
        const lover = this.getPlayer(executedPlayer.loverId);
        if (lover && lover.isAlive) {
          this.killPlayer(lover, 'Tự sát vì quá đau buồn khi người yêu qua đời');
          this.addLog('death', `${lover.name} (${ROLE_DEFINITIONS[lover.role].name}) đã tự sát theo người tình chung số phận!`);
        }
      }

      // Nếu là Thợ Săn
      if (executedPlayer.role === ROLES.HUNTER && !executedPlayer.hunterShotUsed) {
        this.hunterPending = executedPlayer.id;
        this.hunterPendingReason = 'day';
      }
    }

    this.room.broadcastState();

    if (this.hunterPending) {
      this.enterHunterTurn();
      return;
    }

    if (this.checkWinCondition()) return;

    // Chờ 5 giây hiển thị kết quả rồi vào đêm tiếp theo
    this.startTimer(5, null, () => {
      this.enterNight();
    });
  }

  // Kiểm tra điều kiện thắng (Win Conditions)
  checkWinCondition() {
    const alivePlayers = this.getAlivePlayers();
    const aliveWolves = this.getAliveWerewolves();
    const aliveNonWolves = alivePlayers.filter((p) => p.role !== ROLES.WEREWOLF);

    // 1. Cặp đôi Lovers thắng đặc biệt
    // Nếu còn đúng 2 người sống sót và họ là Cặp đôi Lovers khác phe (1 Sói 1 Dân)
    if (alivePlayers.length === 2 && alivePlayers[0].loverId === alivePlayers[1].id) {
      const p1 = alivePlayers[0];
      const p2 = alivePlayers[1];
      const p1IsWolf = p1.role === ROLES.WEREWOLF;
      const p2IsWolf = p2.role === ROLES.WEREWOLF;

      if ((p1IsWolf && !p2IsWolf) || (!p1IsWolf && p2IsWolf)) {
        this.winner = TEAMS.LOVERS;
        this.winReason = `Tình yêu vượt qua mọi rào cản! Cặp đôi Romeo & Juliet (${p1.name} & ${p2.name}) là những người sống sót duy nhất và chiến thắng!`;
        this.endGame();
        return true;
      }
    }

    // 2. Phe Dân Làng thắng: Toàn bộ Sói đã chết
    if (aliveWolves.length === 0) {
      this.winner = TEAMS.VILLAGE;
      this.winReason = `Tất cả Ma Sói đã bị tiêu diệt! Ánh sáng công lý đã trở lại với ngôi làng!`;
      this.endGame();
      return true;
    }

    // 3. Phe Ma Sói thắng: Số Sói >= Số người còn lại (và không có tình huống đặc biệt)
    if (aliveWolves.length >= aliveNonWolves.length) {
      this.winner = TEAMS.WEREWOLF;
      this.winReason = `Ma Sói đã áp đảo hoàn toàn dân làng! Màn đêm vĩnh cửu bao trùm ngôi làng!`;
      this.endGame();
      return true;
    }

    // 4. Hòa (Tất cả đều chết)
    if (alivePlayers.length === 0) {
      this.winner = 'DRAW';
      this.winReason = `Tất cả mọi người đều đã gục ngã trong trận huyết chiến! Không có ai sống sót!`;
      this.endGame();
      return true;
    }

    return false;
  }

  // Kết thúc ván game
  endGame() {
    this.clearTimer();
    this.phase = PHASES.GAME_OVER;
    this.addLog('system', `Trận đấu kết thúc! ${this.winReason}`);
    this.room.broadcastState();
  }

  // Xuất dữ liệu game công khai (loại bỏ thông tin bí mật)
  getPublicState(forPlayerId = null) {
    const requestingPlayer = forPlayerId ? this.getPlayer(forPlayerId) : null;
    const isWolf = requestingPlayer && requestingPlayer.role === ROLES.WEREWOLF;
    const isGodModerator = this.room.config.moderatorMode === 'human' && requestingPlayer && requestingPlayer.isHost;

    // Sinh kịch bản gọi ban đêm dựa trên các lá bài thực tế có trong phòng
    const rolesPresent = this.room.players.map((p) => p.role).filter(Boolean);
    const moderatorScript = AIModerator.generateNightScript(rolesPresent, this.nightNumber || 1);
    const aliveCount = this.getAlivePlayers().length;
    const deadCount = this.room.players.length - aliveCount;
    const aiTip = AIModerator.generateDayDiscussionTips(this.dayNumber || 1, deadCount, aliveCount);

    return {
      phase: this.phase,
      nightNumber: this.nightNumber,
      dayNumber: this.dayNumber,
      timer: this.timer,
      winner: this.winner,
      winReason: this.winReason,
      logs: this.logs,
      nightDeaths: this.nightDeaths,
      hunterPending: this.hunterPending ? this.getPlayer(this.hunterPending)?.name : null,
      dayVotes: this.phase === PHASES.DAY_VOTING || this.phase === PHASES.DAY_EXECUTION ? this.dayVotes : {},
      discussionSkips: Array.from(this.discussionSkipVotes),
      // Dành cho AI Quản Trò & Quản Trò Người Thật
      moderatorScript,
      currentScriptStep: this.currentScriptStep || 0,
      aiTip,
      isGodModerator: !!isGodModerator,
      players: this.room.players.map((p) => {
        // Chỉ hiện vai trò nếu game over, hoặc là Quản trò người thật (God mode), hoặc là chính mình, hoặc là sói nhìn thấy đồng bọn
        const showRole =
          isGodModerator ||
          this.phase === PHASES.GAME_OVER ||
          p.id === forPlayerId ||
          (!p.isAlive && this.phase !== PHASES.NIGHT_ACTION) ||
          (isWolf && p.role === ROLES.WEREWOLF);

        return {
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          isHost: p.isHost,
          isReady: p.isReady,
          isBot: p.isBot,
          isAlive: p.isAlive,
          deathReason: p.deathReason,
          deathNight: p.deathNight,
          role: showRole ? p.role : null,
          roleDetails: showRole ? ROLE_DEFINITIONS[p.role] : null,
          // Dữ liệu riêng
          isLover: requestingPlayer && requestingPlayer.loverId === p.id,
          lastProtectedId: requestingPlayer && requestingPlayer.id === p.id ? p.lastProtectedId : null,
          witchSaveUsed: requestingPlayer && requestingPlayer.id === p.id ? p.witchSaveUsed : null,
          witchKillUsed: requestingPlayer && requestingPlayer.id === p.id ? p.witchKillUsed : null,
        };
      }),
    };
  }
}
