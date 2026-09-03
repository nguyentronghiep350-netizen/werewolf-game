# 🐺 Game Ma Sói Online (Werewolf Online Multiplayer)

Một ứng dụng game online chơi **Ma Sói** thời gian thực (realtime) hoàn chỉnh, mượt mà, hỗ trợ nhiều người chơi cùng lúc qua mạng nội bộ hoặc internet, tích hợp **Bot AI** tự chơi thông minh giúp bạn có thể trải nghiệm ngay cả khi chỉ có 1 mình!

---

## 🌟 Tính Năng Nổi Bật

1. **Đa người chơi thời gian thực (Real-time Multiplayer)**:
   - Sử dụng **Node.js + Socket.IO** xử lý phòng chơi cực nhanh, độ trễ thấp.
   - Tạo phòng với **Mã phòng (Room Code)** ngẫu nhiên hoặc sao chép **Link mời trực tiếp**.
   - Tự động đồng bộ trạng thái game, đồng hồ đếm ngược và kiểm soát chống gian lận (Authoritative Server).

2. **Tích hợp Bot AI (Người chơi ảo thông minh)**:
   - Chủ phòng có thể thêm hoặc bớt Bot chỉ bằng 1 cú click.
   - Bot có tên tiếng Việt gần gũi, tính cách riêng, tự trò chuyện thảo luận ban ngày, tự thực hiện năng lực ban đêm (Sói cắn, Tiên tri soi, Bảo vệ, Phù thủy cứu/độc, Thợ săn bắn) và tự bỏ phiếu.
   - **Chơi được ngay lập tức 1 mình với Bot** hoặc chơi cùng nhóm bạn bè và bù thêm Bot cho đủ số lượng mong muốn (4 đến 16 người).

3. **Hệ Thống 8 Vai Trò Kinh Điển & Phong Phú**:
   - 🧑‍🌾 **Dân Làng (Villager)**: Thảo luận, phán đoán và bỏ phiếu treo cổ Ma Sói vào ban ngày.
   - 🐺 **Ma Sói (Werewolf)**: Ban đêm họp bàn kín qua Kênh Sói và vote cắn chết 1 nạn nhân.
   - 🔮 **Tiên Tri (Seer)**: Mỗi đêm soi danh tính thực sự của 1 người chơi còn sống.
   - 🛡️ **Bảo Vệ (Bodyguard)**: Chọn bảo vệ 1 người mỗi đêm khỏi nanh vuốt Sói (không bảo vệ cùng 1 người 2 đêm liên tiếp).
   - 🧪 **Phù Thủy (Witch)**: Sở hữu 1 bình Cứu người bị Sói cắn và 1 bình Độc để trừ khử nghi phạm.
   - 🎯 **Thợ Săn (Hunter)**: Khi bị giết hoặc bị treo cổ, Thợ Săn được quyền bóp cò bắn chết thêm 1 người chơi khác trước khi nhắm mắt!
   - 💘 **Thần Tình Yêu (Cupid)**: Đêm 1 ghép đôi 2 người chơi thành cặp đôi định mệnh. Một người chết, người kia chết theo! Nếu 1 Sói 1 Dân thì trở thành Phe Thứ 3.
   - 🎭 **Kẻ Chán Đời (Jester / Tanner)**: Mục tiêu là bị dân làng bỏ phiếu treo cổ ban ngày. Nếu bị treo cổ, Jester **chiến thắng ngay lập tức**!

4. **Hiệu Ứng & Âm Thanh Chân Thực (Web Audio API)**:
   - Tiếng sói hú rùng rợn đêm trăng, gà gáy ban mai, tiếng chuông tử thần ngân vang, tiếng gõ búa biểu quyết và nhạc mừng chiến thắng.
   - Không phụ thuộc file mp3 bên ngoài, hoạt động 100% mượt mà, có nút Bật/Tắt âm thanh tiện lợi.

5. **Hệ Thống Chat Đa Kênh Bảo Mật**:
   - **Kênh Chung**: Dân làng thảo luận công khai ban ngày.
   - **Kênh Bầy Sói**: Kênh bí mật ban đêm chỉ Ma Sói còn sống mới đọc và nhắn được.
   - **Kênh Hồn Ma**: Nơi các linh hồn người chết trò chuyện với nhau mà người sống không nhìn thấy.

6. **Giao Diện Hiện Đại & Responsive**:
   - Dark Gothic Mystery theme với Tailwind CSS và biểu tượng Lucide đẹp mắt.
   - Tương thích hoàn hảo trên Máy tính (Desktop), Máy tính bảng (Tablet) và Điện thoại di động (Smartphone).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Game

### Yêu cầu hệ thống:
- Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 18 trở lên).

### Các bước khởi động:

1. Mở cửa sổ dòng lệnh (Terminal / PowerShell) tại thư mục dự án:
   ```bash
   cd werewolf-game
   ```

2. Cài đặt các gói phụ thuộc (nếu chưa cài):
   ```bash
   npm install
   npm --prefix client install
   ```

3. Khởi động Game Server (Chỉ cần 1 lệnh duy nhất):
   ```bash
   npm start
   ```

4. Mở trình duyệt và truy cập:
   - **Trên máy chủ**: [http://localhost:3001](http://localhost:3001)
   - **Cho bạn bè chơi cùng mạng LAN / Wi-Fi**: Mở bằng địa chỉ IP máy chủ của bạn, ví dụ: `http://192.168.1.x:3001` (dùng điện thoại truy cập cực tiện lợi!).

---

## 🧪 Chạy Kiểm Thử Tự Động (Automated Testing)

Dự án đi kèm bộ kiểm thử toàn diện kiểm tra cả logic game và truyền nhận Socket.IO thời gian thực:

```bash
npm test
```

Bộ test bao gồm:
- ✅ Phân bổ vai trò ngẫu nhiên theo cấu hình
- ✅ Quản lý phòng chơi và tính năng thêm Bot
- ✅ Cơ chế Bảo Vệ chặn đòn tấn công của Ma Sói
- ✅ Cơ chế Kẻ Chán Đời (Jester) chiến thắng khi bị treo cổ
- ✅ Kỹ năng phát súng trả thù của Thợ Săn
- ✅ Kiểm thử Socket.IO Realtime: kết nối đa client, chat, đồng bộ trạng thái và phân quyền vai trò bí mật.

---

## 🛠️ Cấu Trúc Dự Án

```
werewolf-game/
├── package.json              # Cấu hình scripts & dependencies
├── README.md                 # Hướng dẫn sử dụng chi tiết
├── server/                   # Backend Node.js Express & Socket.IO
│   ├── src/
│   │   ├── server.js         # Entry point, Express static server, WebSocket events
│   │   └── game/
│   │       ├── RoleManager.js    # Định nghĩa 8 vai trò, lore, phân vai ngẫu nhiên
│   │       ├── GameState.js      # Máy trạng thái vòng chơi (Night, Day, Vote, End)
│   │       ├── GameRoom.js       # Quản lý phòng chơi, chat 3 kênh, host controls
│   │       ├── RoomManager.js    # Quản lý danh sách phòng, sinh mã code, dọn phòng
│   │       └── BotAI.js          # Trí tuệ nhân tạo cho Bot (tự chat, tự chơi, tự vote)
│   └── test/
│       ├── game_simulation.test.js  # Kiểm thử logic game
│       ├── e2e_socket.test.js       # Kiểm thử Socket.IO realtime
│       └── run_all_tests.js         # Runner chạy toàn bộ test suites
└── client/                   # Frontend React + Tailwind CSS + Lucide
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx                  # Điều hướng chính và quản lý Socket
        ├── index.css                # Style chủ đề Gothic Dark
        ├── utils/
        │   ├── audio.js             # Bộ tổng hợp âm thanh Web Audio API
        │   └── socket.js            # Khởi tạo kết nối Socket.IO client
        └── components/
            ├── Header.jsx           # Thanh điều hướng, copy link, âm thanh
            ├── Lobby.jsx            # Tạo/vào phòng, chọn tên & avatar
            ├── WaitingRoom.jsx      # Phòng chờ, thêm/bớt bot, cấu hình vai trò
            ├── GameScreen.jsx       # Màn hình chơi chính với bàn tròn người chơi
            ├── NightActionPanel.jsx # Bảng hành động đêm theo vai trò
            ├── VotingPanel.jsx      # Biểu quyết bỏ qua & bỏ phiếu treo cổ
            ├── HunterActionModal.jsx# Phát súng trả thù của Thợ Săn
            ├── GameOverModal.jsx    # Màn hình vinh danh & lật mở toàn bộ vai trò
            ├── ChatBox.jsx          # Hộp chat 3 kênh (Chung, Sói, Hồn ma)
            ├── GameLogs.jsx         # Nhật ký diễn biến làng theo thời gian thực
            ├── RoleDrawer.jsx       # Thẻ bài vai trò bí mật ở đáy màn hình
            └── RoleGuideModal.jsx   # Cẩm nang tra cứu vai trò và mẹo chơi
```
