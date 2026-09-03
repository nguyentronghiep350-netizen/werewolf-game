import React, { useState } from 'react';
import { X, HelpCircle, Wifi, Users, Bot, Flame, Shield, Moon, Sun, Gavel, Sparkles, Zap, Heart, Sliders, CheckCircle2 } from 'lucide-react';

export default function UserGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('flow');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">HƯỚNG DẪN SỬ DỤNG & LUẬT CHƠI</h2>
              <p className="text-xs text-slate-400">Tất tần tật những điều cần biết để làm chủ Ma Sói Online</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'flow', label: 'Quy Trình Trận Đấu', icon: Moon },
            { id: 'modes', label: 'Các Chế Độ Chơi', icon: Flame },
            { id: 'multiplayer', label: 'Chơi Cùng Bạn Bè (LAN / Web)', icon: Wifi },
            { id: 'bots', label: 'Tính Năng Bot AI', icon: Bot },
            { id: 'tips', label: 'Chiến Thuật & Mẹo', icon: Sparkles },
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-3.5 border-b-2 flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* TAB 1: FLOW */}
          {activeTab === 'flow' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-400" />
                Vòng Lặp 1 Ván Chơi (Game Cycle)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-indigo-300 mb-1">
                    <span>1. Ban Đêm (Night Phase)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Ngôi làng chìm vào bóng tối. Các vai trò đặc biệt thức dậy theo thứ tự: Cupid ghép đôi (đêm 1) ➔ Bảo vệ chọn người che chắn ➔ Bầy Sói chat kín và vote cắn ➔ Tiên tri soi danh tính ➔ Phù thủy quyết định cứu/độc.
                  </p>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-amber-300 mb-1">
                    <span>2. Rạng Sáng (Morning)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Mặt trời lên cùng tiếng gà gáy. Làng nhận tin tức về những ai đã tử trận trong đêm. Nếu Thợ Săn chết, họ sẽ kích hoạt lượt bắn trả thù trước khi sang ban ngày!
                  </p>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-blue-300 mb-1">
                    <span>3. Thảo Luận Ban Ngày (Day Discussion)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Mọi người sử dụng Kênh Chat Chung để chất vấn, chia sẻ manh mối và biện hộ. Có thể bấm "Bỏ qua thảo luận" nếu muốn tiến thẳng vào vòng bỏ phiếu sớm.
                  </p>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 font-bold text-rose-300 mb-1">
                    <span>4. Bỏ Phiếu Treo Cổ (Voting)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Mỗi người chọn 1 kẻ khả nghi nhất hoặc "Bỏ phiếu trắng". Người có số phiếu cao nhất sẽ bị đưa lên giàn treo cổ (nếu treo trúng Kẻ Chán Đời Jester, Jester sẽ thắng ngay!).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GAME MODES */}
          {activeTab === 'modes' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-400" />
                Các Chế Độ Chơi Đặc Sắc
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">🌕 Cổ Điển (Classic Mode)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">Tiêu Chuẩn</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Luật chơi Ma Sói truyền thống chuẩn mực. Thời gian thảo luận 45s, đêm 30s, bỏ phiếu 30s. Tỉ lệ vai trò cân bằng tuyệt đối.
                  </p>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-red-900/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-red-300 text-sm">🩸 Đêm Trăng Máu (Blood Moon)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800">Hardcore</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Thêm nhiều Sói hơn, thời gian thảo luận rút ngắn còn 30s, vote 20s. Áp lực thời gian dồn dập, bầy sói hung tợn tạo nên những đêm huyết chiến đẫm máu!
                  </p>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-pink-900/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-pink-300 text-sm">💘 Tình Yêu & Hỗn Loạn (Lovers & Chaos)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-800">Drama</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Bắt buộc có Thần Tình Yêu (Cupid) và Kẻ Chán Đời (Jester). Cặp đôi tình nhân và Phe thứ ba có cơ hội lật kèo thắng ngoạn mục, tràn ngập cú lừa tâm lý!
                  </p>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-amber-900/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-300 text-sm">⚡ Thần Tốc (Blitz Mode)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">Siêu Nhanh</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Đêm 15s, Thảo luận 20s, Bỏ phiếu 15s. Tốc độ chớp nhoáng, ra quyết định tức thì, cực kỳ thích hợp cho các trận đấu nhanh giải lao 5-10 phút.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MULTIPLAYER */}
          {activeTab === 'multiplayer' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wifi className="w-5 h-5 text-emerald-400" />
                Hướng Dẫn Chơi Cùng Bạn Bè
              </h3>

              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-3">
                <div className="font-bold text-white text-sm">Cách 1: Chơi qua cùng mạng Wi-Fi (LAN)</div>
                <p className="text-xs text-slate-400">
                  Chỉ cần 1 máy bật game bằng lệnh `npm start`, tất cả bạn bè dùng điện thoại hoặc laptop trong cùng Wi-Fi mở trình duyệt truy cập:
                </p>
                <div className="p-2.5 bg-slate-950 rounded-xl font-mono text-amber-400 text-center font-bold">
                  http://192.168.0.60:3001
                </div>
                <p className="text-xs text-slate-500 italic">
                  *Máy của bạn bè không cần cài đặt bất cứ thứ gì, chỉ cần trình duyệt web!
                </p>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-3">
                <div className="font-bold text-white text-sm">Cách 2: Chơi qua Internet (Bạn bè ở xa)</div>
                <p className="text-xs text-slate-400">
                  Mở một đường link web công khai bằng lệnh:
                </p>
                <div className="p-2 bg-slate-950 rounded-xl font-mono text-emerald-400 text-xs">
                  npx localtunnel --port 3001
                </div>
                <p className="text-xs text-slate-400">
                  Sao chép đường link hiển thị và gửi cho bạn bè ở bất kỳ đâu trên thế giới đều vào chơi được!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: BOTS */}
          {activeTab === 'bots' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                Hệ Thống Người Chơi Ảo Thông Minh (Bot AI)
              </h3>

              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tự Động Thao Tác 100% Theo Vai Trò</span>
                </div>
                <p className="text-xs text-slate-400">
                  - **Bot Sói:** Tự động thảo luận trong Kênh Sói và chọn cắn người phe dân.<br />
                  - **Bot Tiên Tri:** Tự soi người chơi còn sống và lưu lại manh mối.<br />
                  - **Bot Bảo Vệ & Phù Thủy:** Canh giữ và cứu nạn nhân bị sói tấn công.<br />
                  - **Bot Chat Thảo Luận:** Tự động nói chuyện, nghi vấn, biện hộ bằng tiếng Việt tự nhiên ban ngày.
                </p>
                <div className="p-3 bg-indigo-950/50 rounded-xl border border-indigo-900/60 text-xs text-indigo-300">
                  💡 Bạn có thể chơi thử ngay cả khi chỉ có 1 mình: Chỉ cần tạo phòng, bấm "+ Thêm Bot AI" 4-5 lần là có thể bấm BẮT ĐẦU GAME ngay!
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TIPS */}
          {activeTab === 'tips' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Bí Kíp & Chiến Thuật Leo Rank
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-red-900/60">
                  <span className="font-bold text-red-300 block mb-1">🐺 Dành Cho Phe Sói:</span>
                  <p className="text-xs text-slate-400">
                    Đừng im lặng quá mức, hãy chủ động đóng góp ý kiến nhưng tránh hùa vote quá lộ liễu. Đêm hãy ưu tiên cắn Tiên tri hoặc người có khả năng dẫn dắt dân làng!
                  </p>
                </div>

                <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-blue-900/60">
                  <span className="font-bold text-blue-300 block mb-1">🧑‍🌾 Dành Cho Tiên Tri & Dân:</span>
                  <p className="text-xs text-slate-400">
                    Tiên tri chớ vội lộ diện ở Đêm 1-2 kẻo bị Sói cắn trước khi Bảo vệ kịp can thiệp. Hãy để ý những người nói năng mâu thuẫn hoặc đổi hướng biểu quyết bất ngờ!
                  </p>
                </div>

                <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-purple-900/60">
                  <span className="font-bold text-purple-300 block mb-1">🎭 Dành Cho Kẻ Chán Đời (Jester):</span>
                  <p className="text-xs text-slate-400">
                    Hãy diễn như một tên Sói nghiệp dư, đôi lúc ấp úng, biện hộ lủng củng để dân làng gom phiếu treo cổ bạn ban ngày. Treo cổ thành công là bạn thắng cuộc!
                  </p>
                </div>

                <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-pink-900/60">
                  <span className="font-bold text-pink-300 block mb-1">💘 Dành Cho Cặp Đôi (Lovers):</span>
                  <p className="text-xs text-slate-400">
                    Nếu bạn và người yêu khác phe (1 Sói 1 Dân), hãy âm thầm phối hợp bảo vệ nhau và tiêu diệt tất cả những người còn lại để trở thành cặp đôi chiến thắng duy nhất!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Đã Hiểu Rõ
          </button>
        </div>
      </div>
    </div>
  );
}
