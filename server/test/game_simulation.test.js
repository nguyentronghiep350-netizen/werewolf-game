import assert from 'assert';
import { ROLES, TEAMS, ROLE_DEFINITIONS, assignRoles, getDefaultRoleConfig } from '../src/game/RoleManager.js';
import { GameState, PHASES } from '../src/game/GameState.js';
import { GameRoom } from '../src/game/GameRoom.js';

console.log('--- BẮT ĐẦU KIỂM THỬ MÔ PHỎNG GAME MA SÓI ---');

// Mock socket
class MockSocket {
  constructor(id) {
    this.id = id;
    this.events = {};
  }
  emit(event, data) {
    this.events[event] = data;
  }
}

// 1. Kiểm tra phân bổ vai trò
console.log('[Test 1] Kiểm tra cấu hình và phân bổ vai trò...');
const mockPlayers = [
  { id: 'p1', name: 'Player 1' },
  { id: 'p2', name: 'Player 2' },
  { id: 'p3', name: 'Player 3' },
  { id: 'p4', name: 'Player 4' },
  { id: 'p5', name: 'Player 5' },
  { id: 'p6', name: 'Player 6' },
];

const config6 = getDefaultRoleConfig(6);
assert(config6[ROLES.WEREWOLF] === 1, '6 người phải có 1 sói');
assert(config6[ROLES.SEER] === 1, '6 người phải có 1 tiên tri');

const assigned = assignRoles(mockPlayers, config6);
assert.strictEqual(assigned.length, 6, 'Số người chơi sau phân vai phải đúng');
const rolesAssigned = assigned.map((p) => p.role);
assert(rolesAssigned.includes(ROLES.WEREWOLF), 'Phải có sói');
assert(rolesAssigned.includes(ROLES.SEER), 'Phải có tiên tri');
console.log('✓ Test 1 đạt: Phân bổ vai trò chính xác!');

// 2. Kiểm thử mô phỏng phòng chơi và Bot
console.log('[Test 2] Kiểm thử tạo phòng và thêm Bot...');
const hostSocket = new MockSocket('host_1');
const room = new GameRoom('TEST01', hostSocket, 'Chủ Nhà', '👑');
assert.strictEqual(room.players.length, 1, 'Ban đầu chỉ có Host');

// Thêm 5 bot
for (let i = 0; i < 5; i++) {
  room.addBot();
}
assert.strictEqual(room.players.length, 6, 'Phòng phải có đủ 6 người');
assert.strictEqual(room.players.filter((p) => p.isBot).length, 5, 'Phải có 5 bot');
console.log('✓ Test 2 đạt: Quản lý phòng và thêm Bot thành công!');

// 3. Kiểm thử Logic Bảo Vệ & Sói Cắn
console.log('[Test 3] Kiểm thử Bảo Vệ chặn đòn Ma Sói...');
const testRoom = new GameRoom('TEST02', new MockSocket('host_2'));
testRoom.players = [
  { id: 'wolf1', name: 'Sói 1', role: ROLES.WEREWOLF, isAlive: true, socket: new MockSocket('wolf1') },
  { id: 'seer1', name: 'Tiên Tri 1', role: ROLES.SEER, isAlive: true, socket: new MockSocket('seer1') },
  { id: 'guard1', name: 'Bảo Vệ 1', role: ROLES.BODYGUARD, isAlive: true, socket: new MockSocket('guard1') },
  { id: 'villager1', name: 'Dân 1', role: ROLES.VILLAGER, isAlive: true, socket: new MockSocket('villager1') },
];
const gameState = testRoom.gameState;
gameState.nightNumber = 1;
gameState.phase = PHASES.NIGHT_ACTION;

// Sói vote cắn Dân 1
gameState.handleNightAction(testRoom.players[0], {
  action: 'werewolf_vote',
  targetId: 'villager1',
});

// Bảo vệ bảo vệ Dân 1
gameState.handleNightAction(testRoom.players[2], {
  action: 'protect',
  targetId: 'villager1',
});

// Tiên tri soi Sói 1
gameState.handleNightAction(testRoom.players[1], {
  action: 'seer_inspect',
  targetId: 'wolf1',
});
assert.strictEqual(gameState.nightActions.seerResult.isWerewolf, true, 'Tiên tri phải nhận biết được Sói');

// Giải quyết đêm
gameState.resolveNight();
const villager = testRoom.players.find((p) => p.id === 'villager1');
assert.strictEqual(villager.isAlive, true, 'Dân 1 được bảo vệ nên không được chết');
console.log('✓ Test 3 đạt: Bảo vệ ngăn chặn sát thương sói thành công!');

// 4. Kiểm thử Bỏ phiếu treo cổ & Kẻ chán đời (Jester)
console.log('[Test 4] Kiểm thử Kẻ Chán Đời (Jester) thắng khi bị treo cổ...');
const jesterRoom = new GameRoom('TEST03', new MockSocket('host_3'));
jesterRoom.players = [
  { id: 'jester', name: 'Gã Hề', role: ROLES.JESTER, isAlive: true, socket: new MockSocket('jester') },
  { id: 'wolf', name: 'Sói', role: ROLES.WEREWOLF, isAlive: true, socket: new MockSocket('wolf') },
  { id: 'vil1', name: 'Dân 1', role: ROLES.VILLAGER, isAlive: true, socket: new MockSocket('vil1') },
  { id: 'vil2', name: 'Dân 2', role: ROLES.VILLAGER, isAlive: true, socket: new MockSocket('vil2') },
];
const jesterState = jesterRoom.gameState;
jesterState.phase = PHASES.DAY_VOTING;

// Tất cả cùng vote Jester
jesterState.handleDayVote(jesterRoom.players[1], 'jester');
jesterState.handleDayVote(jesterRoom.players[2], 'jester');
jesterState.handleDayVote(jesterRoom.players[3], 'jester');

jesterState.resolveDayVoting();
assert.strictEqual(jesterState.winner, TEAMS.SOLO, 'Jester bị treo cổ thì phe SOLO phải thắng');
assert.strictEqual(jesterState.phase, PHASES.GAME_OVER, 'Game phải kết thúc');
console.log('✓ Test 4 đạt: Kẻ chán đời (Jester) thắng chuẩn xác!');

// 5. Kiểm thử Thợ Săn bắn trả thù
console.log('[Test 5] Kiểm thử Thợ Săn trả thù khi bị loại...');
const hunterRoom = new GameRoom('TEST04', new MockSocket('host_4'));
hunterRoom.players = [
  { id: 'hunter', name: 'Thợ Săn', role: ROLES.HUNTER, isAlive: true, hunterShotUsed: false, socket: new MockSocket('hunter') },
  { id: 'wolf', name: 'Sói', role: ROLES.WEREWOLF, isAlive: true, socket: new MockSocket('wolf') },
  { id: 'vil', name: 'Dân', role: ROLES.VILLAGER, isAlive: true, socket: new MockSocket('vil') },
];
const hunterState = hunterRoom.gameState;
hunterState.phase = PHASES.DAY_VOTING;
hunterState.handleDayVote(hunterRoom.players[1], 'hunter');
hunterState.handleDayVote(hunterRoom.players[2], 'hunter');
hunterState.resolveDayVoting();

assert.strictEqual(hunterState.hunterPending, 'hunter', 'Thợ săn chết phải chờ bắn');
hunterState.handleHunterShot('hunter', 'wolf');
assert.strictEqual(hunterRoom.players.find((p) => p.id === 'wolf').isAlive, false, 'Sói bị thợ săn bắn phải chết');
assert.strictEqual(hunterState.winner, TEAMS.VILLAGE, 'Khi sói chết hết, dân làng thắng');
console.log('✓ Test 5 đạt: Thợ săn bắn hạ mục tiêu và phân định thắng thua hoàn hảo!');

console.log('=============================================');
console.log('🎉 TẤT CẢ 5 BÀI TEST MÔ PHỎNG ĐÃ VƯỢT QUA 100% 🎉');
console.log('=============================================');
process.exit(0);
