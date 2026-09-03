# 🐺 HƯỚNG DẪN SỬ DỤNG GAME MA SÓI ONLINE (JOJO TAROT EDITION)

Chào mừng bạn đến với **Ma Sói Online - JoJo's Bizarre Adventure Tarot Edition**!  
Trò chơi được thiết kế đầy đủ tính năng thời gian thực (Real-time Socket.IO), đồ họa thẻ bài JoJo Part 3 sắc nét, âm thanh kịch tính và tích hợp Bot AI thông minh.

---

## 🚀 1. CÁCH KHỞI CHẠY GAME

### Trên máy tính của bạn:
1. Mở Terminal (PowerShell hoặc Command Prompt) tại thư mục game:
   ```bash
   cd C:\Users\tbuild\.gemini\antigravity\scratch\werewolf-game
   npm start
   ```
2. Mở trình duyệt web truy cập:
   👉 **`http://localhost:3001`**

---

## 📱 2. CÁCH ĐỂ MỌI NGƯỜI VÀO GAME DỄ DÀNG NHẤT

Người chơi khác (dùng iPhone, Android, iPad, Laptop) **KHÔNG CẦN CÀI ĐẶT GÌ**, chỉ cần trình duyệt web (Safari/Chrome/Edge):

### 🌟 Cách Nhanh Nhất (Chỉ 1 Giây - Không Cần Nhập Gì):
1. **Quét Mã QR**: Chủ phòng bấm nút **"📱 Mã QR"** trong phòng chờ. Bạn bè ngồi cạnh chỉ việc bật Camera điện thoại quét mã là bay thẳng vào phòng!
2. **Sao Chép Link Mời (1 Click)**: Chủ phòng bấm nút **"📋 Chép link mời"** và gửi qua Zalo / Messenger. Bạn bè bấm vào link là mã phòng tự động điền sẵn, chỉ cần bấm **"VÀO PHÒNG NGAY"**!

---

### A. Chơi cùng mạng Wi-Fi (Ở cùng nhà, quán cà phê, phòng trọ, lớp học):
1. Khi máy tính của bạn chạy `npm start`, terminal sẽ hiển thị rõ ràng địa chỉ IP Wi-Fi của bạn (Ví dụ: `http://192.168.1.12:3001`).
2. Bạn bè kết nối cùng mạng Wi-Fi và mở trình duyệt gõ địa chỉ đó vào:
   👉 **`http://<IP-máy-chủ>:3001`** (VD: `http://192.168.1.12:3001`)

### B. Chơi qua Internet (Bạn bè ở xa, khác Wi-Fi, dùng 4G/5G):
1. Mở thêm 1 cửa sổ Terminal mới và chạy lệnh:
   ```bash
   npx localtunnel --port 3001
   ```
   *(Hoặc dùng Cloudflare Tunnel: `npx @cloudflare/cloudflared tunnel --url http://localhost:3001`)*
2. Hệ thống sẽ cấp một link HTTPS miễn phí (VD: `https://werewolf-room.loca.lt`).
3. Gửi link đó qua Zalo / Messenger cho bạn bè ở bất cứ đâu để vào chơi cùng!
   *(Lưu ý: Link HTTPS cũng giúp tính năng Voice Chat đàm thoại micro trên điện thoại hoạt động tốt nhất!)*

---

## 🎭 3. CÁC CHẾ ĐỘ CHƠI (GAME MODES)

Chủ phòng (Host) có thể chọn chế độ ngay tại màn hình phòng chờ:

1. 🌕 **Cổ Điển (Classic Mode - Tiêu Chuẩn)**:
   - Tỉ lệ cân bằng truyền thống chuẩn mực.
   - Thời gian: Đêm 30s, Thảo luận 45s, Bỏ phiếu 30s.
2. 🩸 **Đêm Trăng Máu (Blood Moon - Hardcore)**:
   - Tăng số lượng Ma Sói, bầy sói hung bạo cắn dồn dập.
   - Thời gian dồn dập: Đêm 25s, Thảo luận 30s, Bỏ phiếu 20s. Áp lực sinh tồn cực đại!
3. 💘 **Tình Yêu & Hỗn Loạn (Lovers & Chaos - Drama)**:
   - Bắt buộc có Thần Tình Yêu (**The Cupid**) ghép đôi 2 người và Kẻ Chán Đời (**The Fool - Jester**).
   - Xuất hiện phe thứ ba, những cú lừa kinh điển và màn lật kèo ngoạn mục!
4. ⚡ **Thần Tốc (Blitz Mode - Siêu Nhanh)**:
   - Đêm 15s, Thảo luận 20s, Bỏ phiếu 15s.
   - Tốc độ chớp nhoáng, đưa ra quyết định tức thì, không mất thời gian chờ đợi.
5. 🛠️ **Tùy Biến (Custom Mode - Tự Do)**:
   - Chủ phòng toàn quyền tăng giảm từng vai trò và chỉnh thời lượng theo ý muốn.

---

## 🃏 4. DANH SÁCH 14 THẺ BÀI TAROT JOJO VÀ NĂNG LỰC

Toàn bộ ảnh thẻ bài chất lượng cao nằm tại `G:\My Drive\ĐAO\cards_jojo_tarot\`:

| STT | Tên Thẻ Bài | Phe | Năng Lực & Kỹ Năng |
|:---:|:---|:---:|:---|
| 01 | **The Werewolf 0** | Phe Sói | Thức giấc ban đêm, chat kín cùng bầy đàn và chọn cắn chết dân làng. |
| 02 | **The White Wolf XIII** | Sói Đơn Độc | Sói trắng cô độc, có thể tiêu diệt cả bầy sói để thành người sống sót duy nhất. |
| 03 | **The Alpha Wolf IV** | Phe Sói | Sói đầu đàn mang vương miện gãy, tiếng hú uy lực chỉ huy đàn sói. |
| 04 | **The Wolf Pup XIX** | Phe Sói | Sói con quỷ quyệt; khi bị dân treo cổ, đêm sau đàn sói tức giận cắn 2 người! |
| 05 | **The Traitor XV** | Phe Sói | Hai mặt: ban ngày là học giả, ban đêm là quái thú phản bội dân làng. |
| 06 | **The Seer II** | Phe Dân | Mỗi đêm được soi danh tính và vai trò thực sự của 1 người sống. |
| 07 | **The Guardian V** | Phe Dân | Đêm chọn bảo vệ 1 người (không chọn 1 người 2 đêm liền). Chặn đứng đòn cắn của Sói. |
| 08 | **The Witch XIV** | Phe Dân | Sở hữu 1 bình Cứu (cứu nạn nhân sói cắn) và 1 bình Độc (đầu độc 1 người). |
| 09 | **The Hunter XI** | Phe Dân | Khi chết (bị cắn hoặc bị treo cổ), được bắn chết thêm 1 người khác trước khi chết. |
| 10 | **The Villager I** | Phe Dân | Dân thường lương thiện, vũ khí là suy luận và lá phiếu công lý ban ngày. |
| 11 | **The Cupid VI** | Đặc Biệt | Đêm 1 bắn tên ghép đôi 2 người. Nếu 1 người chết, người kia chết theo! |
| 12 | **The Fool 0 (Jester)** | Phe Thứ 3 | Kẻ chán đời muốn được treo cổ. Nếu bị dân làng vote treo cổ ban ngày, Jester thắng ngay! |
| 13 | **The Reaper XIII** | Thần Chết | Tử thần cầm lưỡi hái bạc và đồng hồ cát định đoạt số mệnh. |
| 14 | **The Lovers VI** | Cặp Đôi | Hai linh hồn gắn kết định mệnh bằng sợi xích đỏ sinh tử. |

---

## 🔄 5. QUY TRÌNH MỘT VÁN CHƠI

1. **Ban Đêm (Night)**:
   - Các vai trò thức giấc làm nhiệm vụ bí mật.
   - Sói chat riêng ở Kênh Sói và đồng thuận chọn mục tiêu.
2. **Rạng Sáng (Dawn)**:
   - Thông báo ai đã chết trong đêm.
   - Nếu Thợ Săn chết, giao diện giương súng bắn hạ kẻ thù sẽ xuất hiện ngay lập tức.
3. **Ban Ngày Thảo Luận (Day Discussion)**:
   - Mọi người chat công khai, tra khảo, biện hộ, đưa ra nghi vấn.
   - Có thể bấm nút *"Bỏ qua thảo luận"* để vào vote sớm.
4. **Bỏ Phiếu Treo Cổ (Voting)**:
   - Bầu chọn kẻ đáng ngờ nhất hoặc bỏ phiếu trắng.
   - Kẻ nhiều phiếu nhất sẽ bị xử tử.
5. **Điều Kiện Thắng**:
   - **Phe Dân thắng:** Diệt sạch toàn bộ Ma Sói.
   - **Phe Sói thắng:** Số lượng Sói bằng hoặc lớn hơn số Dân còn sống.
   - **Kẻ Chán Đời (Jester) thắng:** Bị dân làng treo cổ ban ngày.
   - **Cặp Đôi (Lovers) thắng:** Cặp đôi khác phe sống sót đến cuối cùng.

---

## 🤖 6. TÍNH NĂNG BOT AI TỰ ĐỘNG

- Không đủ người? Chỉ cần bấm **"+ Thêm Bot AI"**.
- Bot AI được lập trình tự động 100%:
  - Tự biết dùng kỹ năng ban đêm theo đúng vai trò.
  - Tự chat tiếng Việt tự nhiên ban ngày (biện hộ, nghi vấn, phân tích).
  - Tự động tham gia bỏ phiếu treo cổ.
- Có thể chơi thử 1 mình: Tạo phòng ➔ Thêm 4-5 Bot ➔ Bấm Bắt Đầu Game ngay!

---

## 🎙️ 7. TÍNH NĂNG VOICE CHAT REALTIME (WEBRTC)

Trò chơi hỗ trợ đàm thoại giọng nói trực tiếp qua giao thức WebRTC Mesh kết hợp Socket.IO Signaling độ trễ cực thấp:

- **Bật / Tắt Voice**: Bấm nút **"Bật Voice Chat"** ở góc dưới bên trái màn hình.
- **Phím tắt nhanh**: Nhấn phím **`M`** trên bàn phím để Bật/Tắt Mic nhanh như một game thủ chuyên nghiệp.
- **Chế độ Tắt Tiếng (Deafen)**: Bấm biểu tượng Tai Nghe để tắt toàn bộ âm thanh voice khi cần sự yên tĩnh.
- **Chế độ Chỉ Nghe (Listen Only)**: Nếu máy bạn không có micro hoặc không cấp quyền mic, bạn vẫn có thể nghe mọi người nói chuyện bình thường.
- **Quy tắc phân kênh âm thanh theo luật Ma Sói**:
  - ☀️ **Ban Ngày**: Toàn bộ người chơi còn sống nghe và nói chuyện trực tiếp với nhau.
  - 🌙 **Ban Đêm**: Dân làng đi ngủ (Mute âm thanh giữa dân). **Bầy Sói có kênh riêng thì thầm bí mật** để bàn mưu tính kế cắn ai!
  - 👻 **Người Chết**: Người chết có thể nghe người sống, và có thể thoải mái nói chuyện riêng với các hồn ma khác mà không sợ làm lộ bí mật cho người sống.
- **Đèn báo nói chuyện (Speaking Indicator)**: Khi một người chơi đang nói, avatar của họ sẽ có vòng tròn sóng âm màu xanh phát sáng nhấp nháy theo nhịp giọng nói.

---

## 🃏 8. CHẾ ĐỘ TÙY BIẾN THẺ BÀI (CUSTOM DECK) & QUẢN TRÒ (AI / GOD MODE)

Chế độ đặc biệt cho phép bạn biến game thành một bộ bài kỹ thuật số thông minh hoặc đấu trường tự do:

### 1. Tùy Chọn Bộ Bài (Deck Builder):
- Chủ phòng bấm vào chế độ **"Bộ Bài & Quản Trò"** hoặc bấm nút **"Mở Bảng Chọn Thẻ Bài"** trong phòng chờ.
- Tự do tăng giảm số lượng của bất kỳ thẻ bài nào trong 14 thẻ bài Tarot JoJo (Sói Đầu Đàn, Sói Trắng, Thần Chết, Cặp Đôi, Thần Tình Yêu, Kẻ Chán Đời, Phù Thủy, Bảo Vệ...).
- Có nút **Tự Động Cân Bằng**: Tự bù thêm Dân làng hoặc giảm bớt thẻ cho khớp chính xác với số người trong phòng.

### 2. Xáo & Chia Bài Ngẫu Nhiên (Random Deal):
- Bấm **"Xáo & Chia Bài Ngẫu Nhiên"**: Hệ thống ngay lập tức tráo bài và chia bí mật cho mỗi người chơi trong phòng.
- Mỗi người chơi sẽ nhận được lá bài Tarot tuyệt đẹp tương ứng với vai trò của mình.

### 3. Hai Phương Thức Quản Trò Đỉnh Cao:
- 🤖 **AI Quản Trò Gợi Ý (AI Moderator)**:
  - AI tự động phân tích danh sách các thẻ bài đang có trong ván và sinh ra kịch bản ban đêm chuẩn chỉnh từng bước.
  - Hiển thị lời thoại dẫn dắt kịch tính trên màn hình để điều phối cả làng.
- 👑 **Quản Trò Người Thật (Game Master / God Mode)**:
  - Thích hợp khi một người đứng ra làm Quản trò cho nhóm bạn bè ngồi chơi chung (Offiline Board Game) hoặc làm trọng tài Online.
  - Quản trò có **Bảng Thần Nhìn Thấu**: Thấy rõ danh tính thật và lá bài của tất cả mọi người.
  - Quản trò có **Kịch Bản AI Gợi Ý Từng Câu Thoại**: Từng bước đọc to cho cả phòng ("Bước 1: Mọi người nhắm mắt... Bước 2: Cupid thức dậy...").
  - Quản trò có **Quyền Năng Toàn Quyền**: Nút Xử tử, nút Ban phước hồi sinh, nút Chuyển nhanh Đêm/Ngày/Bỏ phiếu chỉ với 1 cú click!

---

Chúc bạn và bạn bè có những giờ phút đấu trí đỉnh cao và kịch tính cùng **Ma Sói JoJo Tarot**! 🐺🔥
