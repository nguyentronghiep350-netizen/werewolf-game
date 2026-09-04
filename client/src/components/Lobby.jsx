import React, { useState, useEffect } from 'react';
import { Users, Plus, LogIn, Sparkles, Shield, Dices, Copy, Check } from 'lucide-react';
import { soundFx } from '../utils/audio';

const AVATARS = ['🧑‍🌾', '🧙‍♂️', '🧝‍♀️', '🧛‍♂️', '🐺', '🦊', '🦉', '🛡️', '🏹', '🔮', '🎭', '👑'];
const DEFAULT_NAMES = [
  'Thợ Săn Trăng', 'Bác Thợ Rèn', 'Cô Bé Quàng Khăn Đỏ', 'Phù Thủy Trẻ',
  'Hiệp Sĩ Rừng', 'Nhà Chiêm Tinh', 'Kỵ Sĩ Bóng Đêm', 'Lữ Khách Bí Ẩn',
  'Trinh Sát Đêm', 'Tiên Nữ Rừng', 'Ẩn Giả Núi Cao', 'Thợ Bẫy Sói'
];

export default function Lobby({ onCreateRoom, onJoinRoom }) {
  const [tab, setTab] = useState('create'); // 'create' | 'join'
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
      setTab('join');
    }

    // Tên ngẫu nhiên khởi tạo
    rollRandomName();
    setSelectedAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  }, []);

  const rollRandomName = () => {
    soundFx.playClick();
    const randomName = DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)];
    setName(randomName);
  };

  const handleCreate = (e) => {
    if (e) e.preventDefault();
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

  const handleJoin = (e) => {
    if (e) e.preventDefault();
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

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative z-10 space-y-5">
        {/* Header Logo */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-red-600 to-indigo-900 shadow-lg shadow-red-900/30 mb-2.5">
            <span className="text-3xl">🐺</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-wider">MA SÓI ONLINE</h2>
          <p className="text-xs text-slate-400 mt-0.5">Hồi hộp • Đấu trí • Tối giản & Dễ chơi</p>
        </div>

        {/* Lời mời vào phòng nếu có URL param */}
        {invitedRoom && (
          <div className="p-3 bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border border-amber-400/50 rounded-2xl text-center space-y-1 shadow-lg animate-fadeIn">
            <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 uppercase">
              <span>🎯</span> BẠN ĐÃ ĐƯỢC MỜI VÀO PHÒNG
            </div>
            <div className="text-lg font-mono font-black text-white tracking-widest bg-amber-500/20 py-1 rounded-lg border border-amber-400/40">
              {invitedRoom}
            </div>
          </div>
        )}

        {/* Thông báo lỗi */}
        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs text-center font-medium animate-shake">
            ⚠️ {error}
          </div>
        )}

        {/* Tab Selector: Tạo Phòng / Vào Phòng */}
        <div className="flex bg-slate-950/70 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setTab('create');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'create'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Phòng Mới</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setTab('join');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'join'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Vào Phòng Bằng Mã</span>
          </button>
        </div>

        {/* Form nhập thông tin */}
        <div className="space-y-4">
          {/* Nhập Biệt Danh + Dice Random */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Tên Của Bạn
              </label>
              <button
                type="button"
                onClick={rollRandomName}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition font-medium"
                title="Đổi tên ngẫu nhiên"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Đổi tên khác</span>
              </button>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập biệt danh..."
              maxLength={20}
              className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-medium placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition text-sm shadow-inner"
            />
          </div>

          {/* Chọn Avatar */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Chọn Avatar
            </label>
            <div className="grid grid-cols-6 gap-2 bg-slate-950/50 p-2.5 rounded-2xl border border-slate-800">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedAvatar(av);
                  }}
                  className={`text-2xl p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                    selectedAvatar === av
                      ? 'bg-red-600/30 border-2 border-red-500 scale-110 shadow-lg shadow-red-950/50'
                      : 'hover:bg-slate-800 hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Nếu ở Tab Join: Nhập mã phòng */}
          {tab === 'join' && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Mã Phòng (6 Ký Tự)
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="VD: WOLF88"
                maxLength={6}
                className="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-amber-400 font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-center font-black text-lg uppercase shadow-inner"
              />
            </div>
          )}
        </div>

        {/* Nút Action Chính (1-Click) */}
        <div>
          {tab === 'create' ? (
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-98 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Đang Khởi Tạo...' : 'Tạo Phòng Chơi Ngay'}</span>
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-indigo-950/60 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-98 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Đang Vào Phòng...' : 'Vào Phòng Ngay'}</span>
            </button>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-400 text-center">
          <div className="flex items-center justify-center gap-1.5 bg-slate-950/40 p-2 rounded-xl border border-slate-800/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Bot AI thông minh</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 bg-slate-950/40 p-2 rounded-xl border border-slate-800/60">
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Chống gian lận 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

