import React, { useState, useEffect } from 'react';
import { Users, Plus, LogIn, Sparkles, Shield, Moon, Flame } from 'lucide-react';
import { soundFx } from '../utils/audio';

const AVATARS = ['🧑‍🌾', '🧙‍♂️', '🧝‍♀️', '🧛‍♂️', '🐺', '🦊', '🦉', '🛡️', '🏹', '🔮', '🎭', '👑'];

export default function Lobby({ onCreateRoom, onJoinRoom }) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🧑‍🌾');
  const [roomCode, setRoomCode] = useState('');
  const [invitedRoom, setInvitedRoom] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Đọc mã phòng từ URL query parameter nếu có
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('room');
    if (codeParam) {
      const code = codeParam.trim().toUpperCase();
      setRoomCode(code);
      setInvitedRoom(code);
    }

    // Tên ngẫu nhiên nếu chưa có
    const defaultNames = ['Thợ Săn Trăng', 'Bác Thợ Rèn', 'Cô Bé Quàng Khăn Đỏ', 'Phù Thủy Trẻ', 'Hiệp Sĩ Rừng', 'Nhà Chiêm Tinh', 'Kỵ Sĩ Bóng Đêm'];
    setName(defaultNames[Math.floor(Math.random() * defaultNames.length)]);
    setSelectedAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  }, []);

  const handleCreate = () => {
    soundFx.playClick();
    if (!name.trim()) {
      setError('Vui lòng nhập tên của bạn!');
      return;
    }
    setError('');
    setLoading(true);
    onCreateRoom(name.trim(), selectedAvatar, (err) => {
      setLoading(false);
      if (err) setError(err);
    });
  };

  const handleJoin = () => {
    soundFx.playClick();
    if (!name.trim()) {
      setError('Vui lòng nhập tên của bạn!');
      return;
    }
    if (!roomCode.trim()) {
      setError('Vui lòng nhập mã phòng gồm 6 ký tự!');
      return;
    }
    setError('');
    setLoading(true);
    onJoinRoom(roomCode.trim().toUpperCase(), name.trim(), selectedAvatar, (err) => {
      setLoading(false);
      if (err) setError(err);
    });
  };

  return (
    <div className="min-w-full min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-4 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-80 h-80 bg-indigo-950/25 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-b from-red-600 to-indigo-900 shadow-lg shadow-red-900/40 mb-3">
            <span className="text-4xl">🐺</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">MA SÓI ONLINE</h2>
          <p className="text-sm text-slate-400 mt-1">Đêm nay, ai sẽ là kẻ săn mồi?</p>
        </div>

        {invitedRoom && (
          <div className="mb-5 p-3.5 bg-gradient-to-r from-amber-950/90 via-slate-900 to-indigo-950/90 border-2 border-amber-400/60 rounded-2xl text-center space-y-1 shadow-lg shadow-amber-950/40 animate-fade-in">
            <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 uppercase tracking-wide">
              <span>🎯</span> BẠN ĐÃ ĐƯỢC MỜI VÀO PHÒNG:
              <span className="font-mono text-white text-sm bg-amber-500/30 px-2 py-0.5 rounded border border-amber-400/50 font-black">
                {invitedRoom}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Chọn tên đại diện và bấm <strong>"VÀO PHÒNG NGAY"</strong> bên dưới để chiến cùng bạn bè!
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-950/70 border border-red-800 rounded-xl text-red-300 text-xs text-center animate-shake">
            ⚠️ {error}
          </div>
        )}

        {/* Nhập Tên & Avatar */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Tên hiển thị
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập biệt danh của bạn..."
              maxLength={20}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Chọn Avatar
            </label>
            <div className="grid grid-cols-6 gap-2 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedAvatar(av);
                  }}
                  className={`text-2xl p-2 rounded-lg transition-transform cursor-pointer ${
                    selectedAvatar === av
                      ? 'bg-red-600/40 border-2 border-red-500 scale-110 shadow-md shadow-red-900/40'
                      : 'hover:bg-slate-700/60 hover:scale-105'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons thao tác */}
        <div className="space-y-3">
          {invitedRoom ? (
            <>
              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black shadow-xl shadow-orange-950/60 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-98 disabled:opacity-50 text-base"
              >
                <LogIn className="w-5 h-5" />
                VÀO PHÒNG NGAY ({invitedRoom})
              </button>

              <div className="flex items-center my-2">
                <div className="flex-1 border-t border-slate-800"></div>
                <span className="px-3 text-xs text-slate-500 font-medium uppercase">Hoặc</span>
                <div className="flex-1 border-t border-slate-800"></div>
              </div>

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition text-sm"
              >
                <Plus className="w-4 h-4" />
                Tự Tạo Phòng Mới Khác
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-98 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                Tạo Phòng Mới
              </button>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-slate-800"></div>
                <span className="px-3 text-xs text-slate-500 font-medium uppercase">Hoặc vào phòng</span>
                <div className="flex-1 border-t border-slate-800"></div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="MÃ PHÒNG (VD: WOLF88)"
                  maxLength={6}
                  className="flex-1 px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-amber-400 font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-center font-bold text-sm"
                />
                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-950/40 flex items-center gap-1.5 cursor-pointer transition transform active:scale-98 disabled:opacity-50 text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Vào
                </button>
              </div>
            </>
          )}
        </div>

        {/* Banner tiện ích */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400 text-center">
          <div className="flex items-center justify-center gap-1.5 bg-slate-800/40 p-2 rounded-lg border border-slate-700/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tích hợp Bot AI thông minh</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 bg-slate-800/40 p-2 rounded-lg border border-slate-700/40">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Phân vai tự động & chống gian lận</span>
          </div>
        </div>
      </div>
    </div>
  );
}
