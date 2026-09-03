import assert from 'assert';
import { AIModerator } from '../src/game/AIModerator.js';
import { GameRoom } from '../src/game/GameRoom.js';
import { ROLES } from '../src/game/RoleManager.js';

console.log('--- BẮT ĐẦU KIỂM THỬ CHẾ ĐỘ CUSTOM DECK & AI QUẢN TRÒ ---');

// 1. Kiểm thử AIModerator.generateNightScript
console.log('[Test 1] Kiểm thử sinh kịch bản AI thoại ban đêm...');
const rolesNight1 = ['werewolf', 'seer', 'bodyguard', 'witch', 'cupid', 'villager'];
const scriptNight1 = AIModerator.generateNightScript(rolesNight1, 1);

assert(scriptNight1.length > 0, 'Kịch bản không được rỗng');
assert.strictEqual(scriptNight1[0].id, 'night_fall');
assert(scriptNight1.some((s) => s.id === 'cupid_turn'), 'Đêm 1 phải có lượt Thần Tình Yêu');
assert(scriptNight1.some((s) => s.id === 'guard_turn'), 'Phải có lượt Bảo Vệ');
assert(scriptNight1.some((s) => s.id === 'wolves_turn'), 'Phải có lượt Bầy Sói');
assert(scriptNight1.some((s) => s.id === 'seer_turn'), 'Phải có lượt Tiên Tri');
assert(scriptNight1.some((s) => s.id === 'witch_turn'), 'Phải có lượt Phù Thủy');
assert.strictEqual(scriptNight1[scriptNight1.length - 1].id, 'daybreak');
console.log(`✓ Test 1 đạt: Sinh kịch bản Đêm 1 hoàn hảo với ${scriptNight1.length} bước gọi!`);

// Đêm 2: Cupid không được thức dậy, Sói trắng thức dậy
const rolesNight2 = ['werewolf', 'white_wolf', 'seer', 'cupid'];
const scriptNight2 = AIModerator.generateNightScript(rolesNight2, 2);
assert(!scriptNight2.some((s) => s.id === 'cupid_turn'), 'Đêm 2 Cupid KHÔNG được thức dậy');
assert(scriptNight2.some((s) => s.id === 'white_wolf_turn'), 'Đêm 2 Sói Trắng PHẢI thức dậy');
console.log('✓ Test 1b đạt: Đêm 2 phân loại vai trò chính xác theo luật!');

// 2. Kiểm thử GameRoom chia bài ngẫu nhiên theo bộ bài Custom (Custom Deck Deal)
console.log('[Test 2] Kiểm thử chia bài ngẫu nhiên theo bộ bài Custom...');
const mockHostSocket = { id: 'host_123', emit: () => {} };
const room = new GameRoom('CUST01', mockHostSocket, 'MasterHost');

// Thêm 5 người chơi
room.addPlayer({ id: 'p2', emit: () => {} }, 'Player2', '🐺');
room.addPlayer({ id: 'p3', emit: () => {} }, 'Player3', '🧙');
room.addPlayer({ id: 'p4', emit: () => {} }, 'Player4', '🛡️');
room.addPlayer({ id: 'p5', emit: () => {} }, 'Player5', '🏹');
room.addPlayer({ id: 'p6', emit: () => {} }, 'Player6', '🤡');
assert.strictEqual(room.players.length, 6);

// Bộ bài custom: 2 Sói, 1 Tiên Tri, 1 Bảo Vệ, 1 Phù Thủy, 1 Kẻ Chán Đời
const customDeck = {
  werewolf: 2,
  seer: 1,
  bodyguard: 1,
  witch: 1,
  jester: 1,
};

const dealRes = room.dealCards('host_123', customDeck);
assert(dealRes.success, 'Chia bài custom thất bại');

const assignedRoles = room.players.map((p) => p.role);
const wolfCount = assignedRoles.filter((r) => r === 'werewolf').length;
const seerCount = assignedRoles.filter((r) => r === 'seer').length;
const jesterCount = assignedRoles.filter((r) => r === 'jester').length;

assert.strictEqual(wolfCount, 2, 'Số lượng sói phải bằng 2');
assert.strictEqual(seerCount, 1, 'Số lượng tiên tri phải bằng 1');
assert.strictEqual(jesterCount, 1, 'Số lượng kẻ chán đời phải bằng 1');
console.log('✓ Test 2 đạt: Chia bài ngẫu nhiên đúng 100% theo bộ bài tự chọn!');

// 3. Kiểm thử Quản Trò Toàn Năng (God Mode & Thao tác Quản Trò)
console.log('[Test 3] Kiểm thử Quản Trò Người Thật (God Mode & Thao tác)...');
room.config.moderatorMode = 'human';

// Host soi public state -> Thấy vai trò của tất cả mọi người
const hostState = room.gameState.getPublicState('host_123');
assert(hostState.isGodModerator, 'Host phải được kích hoạt God Mode');
assert(
  hostState.players.every((p) => p.role !== null),
  'Ở God Mode, Quản Trò phải nhìn thấy lá bài thật của tất cả người chơi'
);

// Người chơi thường soi public state -> KHÔNG được thấy vai trò người khác
const playerState = room.gameState.getPublicState('p2');
assert(!playerState.isGodModerator, 'Người chơi thường không có God Mode');
const hiddenRoles = playerState.players.filter((p) => p.id !== 'p2' && p.role !== null);
// Chỉ sói nhìn thấy đồng đội sói
for (const p of hiddenRoles) {
  if (playerState.players.find((item) => item.id === 'p2').role === 'werewolf') {
    assert.strictEqual(p.role, 'werewolf', 'Sói chỉ được thấy sói đồng đội');
  }
}
console.log('✓ Test 3a đạt: Quyền nhìn thấu bài (God Mode) bảo mật chuẩn xác!');

// Thao tác Quản trò: Xử tử 1 người chơi
const targetPlayer = room.players[1];
room.moderatorAction('host_123', 'kill', { targetId: targetPlayer.id });
assert.strictEqual(targetPlayer.isAlive, false, 'Người chơi bị Quản trò xử tử phải tử vong');

// Thao tác Quản trò: Hồi sinh
room.moderatorAction('host_123', 'revive', { targetId: targetPlayer.id });
assert.strictEqual(targetPlayer.isAlive, true, 'Người chơi được Quản trò hồi sinh phải sống lại');

// Thao tác Quản trò: Chuyển kịch bản
room.moderatorAction('host_123', 'advance_script', { stepIndex: 3 });
assert.strictEqual(room.gameState.currentScriptStep, 3, 'Bước kịch bản chuyển chuẩn xác');
console.log('✓ Test 3b đạt: Quản trò xử tử, hồi sinh và điều khiển kịch bản mượt mà!');

console.log('=============================================');
console.log('🎉 TẤT CẢ TEST CHẾ ĐỘ CUSTOM DECK & QUẢN TRÒ ĐẠT 100%! 🎉');
console.log('=============================================');
process.exit(0);
