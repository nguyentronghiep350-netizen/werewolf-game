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

console.log('\n>>> [5/6] CHẠY BỘ MÔ PHỎNG 60 TRẬN TEAM 9 AI (6 CHẾ ĐỘ X 10 LẦN)...');
const aiSim = spawnSync('node', ['server/test/ai_team_simulation.js'], { stdio: 'inherit' });
if (aiSim.status !== 0) {
  console.error('Mô phỏng Team AI thất bại!');
  process.exit(1);
}

console.log('\n>>> [6/6] CHẠY BỘ KIỂM THỬ E2E THỜI GIAN THỰC 9 SOCKETS KẾT NỐI ĐỒNG THỜI...');
const aiSockets = spawnSync('node', ['server/test/ai_team_e2e_9sockets.js'], { stdio: 'inherit' });
if (aiSockets.status !== 0) {
  console.error('Kiểm thử E2E 9 Sockets thất bại!');
  process.exit(1);
}

console.log('\n🌟 TOÀN BỘ 6 BỘ KIỂM THỬ VÀ MÔ PHỎNG ĐỀU VƯỢT QUA XUẤT SẮC 100%! 🌟');
process.exit(0);
