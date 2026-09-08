import assert from 'assert';
import { GameRoom } from '../src/game/GameRoom.js';
import { ROLES } from '../src/game/RoleManager.js';

console.log('--- KIỂM THỬ MIỄN NHIỄM QUẢN TRÒ (GOD MODE) & THỜI GIAN KHUNG CHAT ---');

const createMockSocket = (id) => ({ id, emit: () => {} });

// 1. Tạo phòng với Quản Trò Người Thật (God Mode)
const hostSocket = createMockSocket('host_1');
const room = new GameRoom('TEST_MOD', hostSocket, 'Quản Trò Vĩ Đại', '👑');
room.config.moderatorMode = 'human';

room.addPlayer(createMockSocket('wolf_1'), 'Sói Chúa', '🐺', false);
room.addPlayer(createMockSocket('seer_1'), 'Tiên Tri', '🔮', false);
room.addPlayer(createMockSocket('guard_1'), 'Bảo Vệ', '🛡️', false);
room.addPlayer(createMockSocket('witch_1'), 'Phù Thủy', '🧪', false);
room.addPlayer(createMockSocket('hunter_1'), 'Thợ Săn', '🏹', false);

const host = room.players.find((p) => p.isHost);
const wolf = room.players.find((p) => p.name === 'Sói Chúa');
const seer = room.players.find((p) => p.name === 'Tiên Tri');
const guard = room.players.find((p) => p.name === 'Bảo Vệ');
const witch = room.players.find((p) => p.name === 'Phù Thủy');
const hunter = room.players.find((p) => p.name === 'Thợ Săn');

// Gán vai trò
host.role = ROLES.MODERATOR;
wolf.role = ROLES.WEREWOLF;
seer.role = ROLES.SEER;
guard.role = ROLES.BODYGUARD;
witch.role = ROLES.WITCH;
hunter.role = ROLES.HUNTER;

room.gameState.nightNumber = 1;
room.gameState.phase = 'NIGHT_ACTION';

// [Test 1] Sói KHÔNG THỂ vote cắn Quản Trò
console.log('[Test 1] Kiểm tra Sói không thể vote cắn Quản Trò...');
const wolfActionOnMod = room.gameState.handleNightAction(wolf, {
  action: 'werewolf_vote',
  targetId: host.id,
});
assert.strictEqual(wolfActionOnMod, false, 'Sói không được phép vote cắn Quản trò');
assert.strictEqual(room.gameState.nightActions.werewolfVotes[wolf.id], undefined, 'Vote cắn Quản trò không được ghi nhận');
console.log('✓ Sói hoàn toàn bị chặn khi cố gắng cắn Quản Trò!');

// [Test 2] Tiên Tri KHÔNG THỂ soi Quản Trò
console.log('[Test 2] Kiểm tra Tiên Tri không thể soi Quản Trò...');
const seerActionOnMod = room.gameState.handleNightAction(seer, {
  action: 'seer_inspect',
  targetId: host.id,
});
assert.strictEqual(seerActionOnMod, false, 'Tiên Tri không được phép soi Quản trò');
assert.strictEqual(room.gameState.nightActions.seerTarget, null, 'Mục tiêu soi Quản trò không được ghi nhận');
console.log('✓ Tiên Tri hoàn toàn bị chặn khi cố soi Quản Trò!');

// [Test 3] Phù Thủy KHÔNG THỂ độc Quản Trò
console.log('[Test 3] Kiểm tra Phù Thủy không thể ném bình độc vào Quản Trò...');
const witchActionOnMod = room.gameState.handleNightAction(witch, {
  action: 'witch_act',
  save: false,
  killTargetId: host.id,
});
assert.strictEqual(room.gameState.nightActions.witchKillTarget, null, 'Phù Thủy không thể đầu độc Quản trò');
console.log('✓ Phù Thủy hoàn toàn bị chặn khi ném độc vào Quản Trò!');

// [Test 4] Thợ Săn KHÔNG THỂ bắn Quản Trò
console.log('[Test 4] Kiểm tra Thợ Săn không thể bắn Quản Trò...');
room.gameState.phase = 'HUNTER_ACTION';
room.gameState.hunterPending = hunter.id;
const hunterActionOnMod = room.gameState.handleHunterShot(hunter.id, host.id);
assert.strictEqual(hunterActionOnMod, false, 'Thợ Săn không thể bắn Quản trò');
console.log('✓ Thợ Săn hoàn toàn bị chặn khi bắn Quản Trò!');

// [Test 5] Dân Làng KHÔNG THỂ vote treo cổ Quản Trò và Quản Trò không vote
console.log('[Test 5] Kiểm tra Bỏ phiếu ban ngày đối với Quản Trò...');
room.gameState.phase = 'DAY_VOTING';
const voteOnMod = room.gameState.handleDayVote(wolf, host.id);
assert.strictEqual(voteOnMod, false, 'Không thể vote treo cổ Quản trò');
const modVote = room.gameState.handleDayVote(host, wolf.id);
assert.strictEqual(modVote, false, 'Quản trò không tham gia bỏ phiếu');
console.log('✓ Hệ thống bỏ phiếu chặn tuyệt đối tương tác lên/từ Quản Trò!');

// [Test 6] Kiểm tra thời gian tin nhắn chat (createdAt và format 24h)
console.log('[Test 6] Kiểm tra tin nhắn chat có createdAt timestamp...');
const before = Date.now();
room.handleChatMessage(host.id, 'Thông báo từ Quản Trò!', 'public');
const lastMsg = room.chatMessages[room.chatMessages.length - 1];
assert(lastMsg, 'Phải có tin nhắn trong danh sách chat');
assert(typeof lastMsg.createdAt === 'number', 'Phải có trường createdAt là số ms');
assert(lastMsg.createdAt >= before, 'createdAt phải chính xác');
assert(lastMsg.timestamp && lastMsg.timestamp.includes(':'), 'timestamp phải có định dạng giờ phút');
console.log(`✓ Tin nhắn tạo thành công với createdAt: ${lastMsg.createdAt} (${lastMsg.timestamp})!`);

console.log('\n🎉 TẤT CẢ TEST MIỄN NHIỄM QUẢN TRÒ & CHAT TIMESTAMP ĐỀU ĐẠT 100%! 🎉\n');
