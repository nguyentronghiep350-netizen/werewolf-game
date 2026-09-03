import { spawnSync } from 'child_process';

console.log('>>> [1/4] CHẠY BỘ KIỂM THỬ MÔ PHỎNG GAME LOGIC...');
const sim = spawnSync('node', ['server/test/game_simulation.test.js'], { stdio: 'inherit' });
if (sim.status !== 0) {
  console.error('Kiểm thử mô phỏng thất bại!');
  process.exit(1);
}

console.log('\n>>> [2/4] CHẠY BỘ KIỂM THỬ TÍCH HỢP E2E SOCKET.IO...');
const e2e = spawnSync('node', ['server/test/e2e_socket.test.js'], { stdio: 'inherit' });
if (e2e.status !== 0) {
  console.error('Kiểm thử E2E thất bại!');
  process.exit(1);
}

console.log('\n>>> [3/4] CHẠY BỘ KIỂM THỬ WEBRTC VOICE CHAT SIGNALING...');
const voice = spawnSync('node', ['server/test/voice_chat.test.js'], { stdio: 'inherit' });
if (voice.status !== 0) {
  console.error('Kiểm thử Voice Chat WebRTC thất bại!');
  process.exit(1);
}

console.log('\n>>> [4/4] CHẠY BỘ KIỂM THỬ CUSTOM DECK & AI QUẢN TRÒ...');
const deck = spawnSync('node', ['server/test/custom_deck_moderator.test.js'], { stdio: 'inherit' });
if (deck.status !== 0) {
  console.error('Kiểm thử Custom Deck & Quản Trò thất bại!');
  process.exit(1);
}

console.log('\n🌟 TOÀN BỘ 4 BỘ KIỂM THỬ ĐỀU VƯỢT QUA XUẤT SẮC! 🌟');
process.exit(0);
