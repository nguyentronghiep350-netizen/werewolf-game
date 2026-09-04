import assert from 'assert';
import { GameRoom } from '../src/game/GameRoom.js';
import { ROLES, TEAMS } from '../src/game/RoleManager.js';
import { PHASES } from '../src/game/GameState.js';

console.log('--- BẮT ĐẦU KIỂM THỬ GAMEPLAY BAN ĐÊM TUẦN TỰ (SEQUENTIAL NIGHT TURNS) ---');

const mockSocket = (id) => ({
  id,
  emit: () => {},
});

// Tạo phòng giả lập
const room = new GameRoom('TESTSQ', mockSocket('host_1'), 'Minh Trí (Host)', '👑');
const host = room.players[0];

// Thêm 6 người chơi nữa
const pCupid = room.addPlayer(mockSocket('p_cupid'), 'Lan Anh', '🧙‍♀️', false);
const pGuard = room.addPlayer(mockSocket('p_guard'), 'Bảo Nam', '🛡️', false);
const pWolf1 = room.addPlayer(mockSocket('p_wolf1'), 'Gia Huy', '🐺', false);
const pWolf2 = room.addPlayer(mockSocket('p_wolf2'), 'Tuấn Khang', '🦊', false);
const pSeer = room.addPlayer(mockSocket('p_seer'), 'Thùy Linh', '🔮', false);
const pWitch = room.addPlayer(mockSocket('p_witch'), 'Mỹ Duyên', '🎭', false);
const pVillager = room.addPlayer(mockSocket('p_vill'), 'Hoàng Bách', '🏹', false);

// Gán vai trò cố định
host.role = ROLES.VILLAGER;
pCupid.role = ROLES.CUPID;
pGuard.role = ROLES.BODYGUARD;
pWolf1.role = ROLES.WEREWOLF;
pWolf2.role = ROLES.WEREWOLF;
pSeer.role = ROLES.SEER;
pWitch.role = ROLES.WITCH;
pVillager.role = ROLES.VILLAGER;

const gs = room.gameState;
gs.nightNumber = 0;

console.log('[Test 1] Kiểm tra tạo hàng đợi gọi vai trò ban đêm theo thứ tự logic...');
gs.enterNight();
assert.strictEqual(gs.phase, PHASES.NIGHT_START, 'Phải bắt đầu ở NIGHT_START');
assert.strictEqual(gs.nightNumber, 1, 'Đêm thứ 1');

const queue = gs.nightQueue;
console.log('Hàng đợi các bước ban đêm:', queue.map((q) => q.title));

assert.strictEqual(queue.length, 5, 'Phải có 5 bước gọi: Cupid -> Bảo Vệ -> Ma Sói -> Tiên Tri -> Phù Thủy');
assert.strictEqual(queue[0].id, 'cupid', 'Bước 1 phải là Cupid');
assert.strictEqual(queue[1].id, 'bodyguard', 'Bước 2 phải là Bảo Vệ');
assert.strictEqual(queue[2].id, 'werewolf', 'Bước 3 phải là Bầy Ma Sói');
assert.strictEqual(queue[3].id, 'seer', 'Bước 4 phải là Tiên Tri');
assert.strictEqual(queue[4].id, 'witch', 'Bước 5 phải là Phù Thủy');
console.log('✓ Test 1 đạt: Hàng đợi các bước ban đêm được tạo chính xác 100% theo thứ tự chuẩn!');

console.log('[Test 2] Kiểm tra chuyển bước tuần tự và từng vai trò thực hiện kỹ năng...');
// Chuyển sang NIGHT_ACTION
gs.clearTimer();
gs.phase = PHASES.NIGHT_ACTION;
gs.advanceNightStep();

// Bước 1: Cupid
assert.strictEqual(gs.activeNightStep, 'cupid');
assert.strictEqual(gs.activeNightRole, ROLES.CUPID);
console.log(`✓ Bước 1: Quản trò gọi ${gs.activeNightTitle}`);

// Cupid kết đôi Dân làng và Thợ săn
const cupidSuccess = gs.handleNightAction(pCupid, {
  action: 'cupid_pair',
  targetId: pVillager.id,
  target2Id: host.id,
});
assert(cupidSuccess, 'Cupid kết đôi thất bại');
assert.strictEqual(pVillager.loverId, host.id, 'Người yêu pVillager phải là host');
assert.strictEqual(host.loverId, pVillager.id, 'Người yêu host phải là pVillager');

// Chuyển sang Bước 2: Bảo Vệ
gs.advanceNightStep();
assert.strictEqual(gs.activeNightStep, 'bodyguard');
assert.strictEqual(gs.activeNightRole, ROLES.BODYGUARD);
console.log(`✓ Bước 2: Quản trò gọi ${gs.activeNightTitle}`);

// Bảo vệ bảo hộ Tiên Tri
const guardSuccess = gs.handleNightAction(pGuard, {
  action: 'protect',
  targetId: pSeer.id,
});
assert(guardSuccess, 'Bảo vệ bảo hộ thất bại');
assert.strictEqual(gs.nightActions.bodyguardTarget, pSeer.id);

// Chuyển sang Bước 3: Bầy Ma Sói
gs.advanceNightStep();
assert.strictEqual(gs.activeNightStep, 'werewolf');
assert.strictEqual(gs.activeNightRole, 'werewolf');
console.log(`✓ Bước 3: Quản trò gọi ${gs.activeNightTitle}`);

// Cả 2 Sói cùng vote cắn Dân Làng (pVillager)
gs.handleNightAction(pWolf1, { action: 'werewolf_vote', targetId: pVillager.id });
gs.handleNightAction(pWolf2, { action: 'werewolf_vote', targetId: pVillager.id });
assert.strictEqual(gs.getWerewolfTarget(), pVillager.id, 'Nạn nhân bị Sói cắn phải là pVillager');

// Chuyển sang Bước 4: Tiên Tri
gs.advanceNightStep();
assert.strictEqual(gs.activeNightStep, 'seer');
assert.strictEqual(gs.activeNightRole, ROLES.SEER);
console.log(`✓ Bước 4: Quản trò gọi ${gs.activeNightTitle}`);

// Tiên tri soi pWolf1
const seerSuccess = gs.handleNightAction(pSeer, {
  action: 'seer_inspect',
  targetId: pWolf1.id,
});
assert(seerSuccess, 'Tiên tri soi thất bại');
assert.strictEqual(gs.nightActions.seerResult.isWerewolf, true, 'Tiên tri phải thấy pWolf1 là Ma Sói');

// Chuyển sang Bước 5: Phù Thủy
gs.advanceNightStep();
assert.strictEqual(gs.activeNightStep, 'witch');
assert.strictEqual(gs.activeNightRole, ROLES.WITCH);
console.log(`✓ Bước 5: Quản trò gọi ${gs.activeNightTitle}`);

// Phù thủy nhận được thông tin nạn nhân bị sói cắn (pVillager) và quyết định DÙNG BÌNH CỨU
assert.strictEqual(gs.getWerewolfTarget(), pVillager.id, 'Phù thủy phải biết chính xác nạn nhân bị Sói cắn là pVillager');
const witchSuccess = gs.handleNightAction(pWitch, {
  action: 'witch_act',
  save: true,
  killTargetId: null,
});
assert(witchSuccess, 'Phù thủy dùng thuốc thất bại');
assert.strictEqual(gs.nightActions.witchSave, true, 'Bình cứu phải được kích hoạt');

// Chuyển bước cuối -> Sang Rạng Sáng (MORNING)
gs.advanceNightStep();
assert.strictEqual(gs.phase, PHASES.MORNING, 'Sau bước cuối cùng của đêm phải chuyển sang MORNING');
console.log(`✓ Bước 6: Rạng sáng (Morning), công bố kết quả đêm`);

// Kiểm tra kết quả đêm: Nạn nhân pVillager được Phù Thủy cứu sống
assert.strictEqual(pVillager.isAlive, true, 'pVillager được Phù Thủy cứu nên phải còn sống');
assert.strictEqual(gs.nightDeaths.length, 0, 'Không ai chết đêm qua vì đã được cứu');

// Kiểm tra tính bảo mật: Người chơi bình thường không được thấy log bí mật của Phù Thủy/Bảo Vệ
const villagerState = gs.getPublicState(pVillager.id);
assert(villagerState.logs.every(l => !l.details?.secret), 'Dân làng không được thấy log bí mật của Phù thủy/Bảo vệ');
console.log('✓ Test 2 đạt: Vòng lặp các vai trò ban đêm tuần tự, cứu sống và bảo mật hành động Phù Thủy thành công 100%!');

console.log('[Test 3] Kiểm tra Quản Trò Người Thật bấm chuyển bước thủ công (advance_night_step)...');
gs.nightNumber = 0;
gs.enterNight();
assert.strictEqual(gs.phase, PHASES.NIGHT_START);
gs.clearTimer();
gs.phase = PHASES.NIGHT_ACTION;
gs.advanceNightStep(); // Bước 0: Cupid (Đêm 1)
assert.strictEqual(gs.activeNightStep, 'cupid', 'Bước 0 đêm 1 phải là Cupid');

// Quản trò người thật bấm advance_night_step qua moderatorAction
const modRes = room.moderatorAction(host.id, 'advance_night_step');
assert(modRes, 'Quản trò gọi advance_night_step thất bại');
assert.strictEqual(gs.activeNightStep, 'bodyguard', 'Quản trò bấm next turn phải nhảy sang Bảo Vệ');
console.log('✓ Test 3 đạt: Quản trò bấm Next Turn thủ công hoạt động mượt mà!');

console.log('================================================================');
console.log('🎉 TẤT CẢ TEST GAMEPLAY BAN ĐÊM TUẦN TỰ (SEQUENTIAL NIGHT) ĐẠT 100%! 🎉');
console.log('================================================================');
process.exit(0);
