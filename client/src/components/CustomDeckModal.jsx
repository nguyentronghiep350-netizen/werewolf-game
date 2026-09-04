import React, { useState } from 'react';
import { X, Sparkles, Shuffle, Crown, Bot, Check, AlertCircle, Plus, Minus, Layers } from 'lucide-react';
import { soundFx } from '../utils/audio';

// 14 Thẻ bài Tarot JoJo đầy đủ
export const ALL_CUSTOM_ROLES = [
  { id: 'werewolf', name: 'Ma Sói (The Werewolf 0)', cardImage: '/cards/werewolf.jpg', team: 'werewolf', defaultCount: 1 },
  { id: 'alpha_wolf', name: 'Sói Đầu Đàn (The Alpha Wolf IV)', cardImage: '/cards/alpha_wolf.jpg', team: 'werewolf', defaultCount: 0 },
  { id: 'white_wolf', name: 'Sói Trắng (The White Wolf XIII)', cardImage: '/cards/white_wolf.jpg', team: 'solo', defaultCount: 0 },
  { id: 'wolf_pup', name: 'Sói Con (The Wolf Pup XIX)', cardImage: '/cards/wolf_pup.jpg', team: 'werewolf', defaultCount: 0 },
  { id: 'traitor', name: 'Kẻ Phản Bội (The Traitor XV)', cardImage: '/cards/traitor.jpg', team: 'werewolf', defaultCount: 0 },
  { id: 'seer', name: 'Tiên Tri (The Seer II)', cardImage: '/cards/seer.jpg', team: 'village', defaultCount: 1 },
  { id: 'bodyguard', name: 'Bảo Vệ (The Guardian V)', cardImage: '/cards/bodyguard.jpg', team: 'village', defaultCount: 1 },
  { id: 'witch', name: 'Phù Thủy (The Witch XIV)', cardImage: '/cards/witch.jpg', team: 'village', defaultCount: 1 },
  { id: 'hunter', name: 'Thợ Săn (The Hunter XI)', cardImage: '/cards/hunter.jpg', team: 'village', defaultCount: 1 },
  { id: 'cupid', name: 'Thần Tình Yêu (The Cupid VI)', cardImage: '/cards/cupid.jpg', team: 'village', defaultCount: 0 },
  { id: 'jester', name: 'Kẻ Chán Đời (The Fool 0)', cardImage: '/cards/jester.jpg', team: 'solo', defaultCount: 0 },
  { id: 'reaper', name: 'Thần Chết (The Reaper XIII)', cardImage: '/cards/reaper.jpg', team: 'solo', defaultCount: 0 },
  { id: 'lovers', name: 'Cặp Đôi (The Lovers VI)', cardImage: '/cards/lovers.jpg', team: 'lovers', defaultCount: 0 },
  { id: 'villager', name: 'Dân Làng (The Villager I)', cardImage: '/cards/villager.jpg', team: 'village', defaultCount: 2 },
];

export default function CustomDeckModal({
  isOpen,
  onClose,
  playerCount = 6,
  currentConfig = {},
  onSaveConfig,
  onDealCards,
}) {
  const [deck, setDeck] = useState(() => {
    const initial = {};
    ALL_CUSTOM_ROLES.forEach((r) => {
      initial[r.id] = currentConfig.roleConfig?.[r.id] ?? r.defaultCount;
    });
    return initial;
  });

  const [moderatorMode, setModeratorMode] = useState(currentConfig.moderatorMode || 'ai'); // 'ai' | 'human'

  if (!isOpen) return null;

  const targetCount = moderatorMode === 'human' ? Math.max(1, playerCount - 1) : playerCount;
  const totalCards = Object.values(deck).reduce((a, b) => a + b, 0);
  const diff = totalCards - targetCount;

  const handleCountChange = (roleId, delta) => {
    soundFx.playClick();
    setDeck((prev) => {
      const current = prev[roleId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [roleId]: next };
    });
  };

  const handleAutoBalance = () => {
    soundFx.playClick();
    const updated = { ...deck };
    if (diff < 0) {
      // Thiếu bài -> Bổ sung dân làng
      updated.villager = (updated.villager || 0) + Math.abs(diff);
    } else if (diff > 0) {
      // Thừa bài -> Giảm dân làng trước
      const reduceVillager = Math.min(updated.villager || 0, diff);
      updated.villager -= reduceVillager;
    }
    setDeck(updated);
  };

  const handleSaveAndDeal = () => {
    soundFx.playClick();
    onSaveConfig({
      mode: 'custom_deck',
      moderatorMode,
      roleConfig: deck,
    });
    if (onDealCards) {
      onDealCards(deck);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                TÙY CHỌN BỘ BÀI TAROT & PHƯƠNG THỨC QUẢN TRÒ
              </h2>
              <p className="text-xs text-slate-400">
                Tự do chọn các thẻ bài theo ý thích, chia ngẫu nhiên cho tất cả người chơi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Controls: Deck Count & Moderator Mode Selector */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Deck Counter */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Tổng số thẻ:</span>
              <span
                className={`text-base font-black font-mono px-2.5 py-0.5 rounded-lg border ${
                  totalCards === targetCount
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                    : 'bg-amber-950 text-amber-400 border-amber-700'
                }`}
              >
                {totalCards} / {targetCount} thẻ {moderatorMode === 'human' ? `(${playerCount - 1} người + 1 Quản trò)` : `(${playerCount} người)`}
              </span>
            </div>

            {diff !== 0 && (
              <button
                onClick={handleAutoBalance}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition cursor-pointer"
              >
                {diff < 0 ? `+ Bù ${Math.abs(diff)} Dân` : `- Bớt ${diff} Thẻ`}
              </button>
            )}
          </div>

          {/* Mode Selector: AI Quản Trò vs Quản Trò Người Thật */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-2xl border border-slate-700 w-full sm:w-auto">
            <button
              onClick={() => {
                soundFx.playClick();
                setModeratorMode('ai');
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                moderatorMode === 'ai'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Quản Trò Gợi Ý</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setModeratorMode('human');
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                moderatorMode === 'human'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Quản Trò Người Thật (God Mode)</span>
            </button>
          </div>
        </div>

        {/* Card Grid Selector */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {ALL_CUSTOM_ROLES.map((role) => {
              const count = deck[role.id] || 0;
              const isSelected = count > 0;

              return (
                <div
                  key={role.id}
                  className={`rounded-2xl border p-2 flex flex-col items-center justify-between transition group relative ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/80 shadow-lg shadow-amber-950/30'
                      : 'bg-slate-900/50 border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-700'
                  }`}
                >
                  {/* Card Art Thumbnail */}
                  <div className="w-full aspect-[2/3] rounded-xl overflow-hidden border border-amber-400/40 bg-slate-950 mb-2 relative">
                    <img
                      src={role.cardImage}
                      alt={role.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    {count > 0 && (
                      <span className="absolute top-1 right-1 bg-amber-500 text-slate-950 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                        {count}
                      </span>
                    )}
                  </div>

                  <span className="font-bold text-white text-[11px] text-center leading-tight truncate w-full mb-1">
                    {role.name.split(' (')[0]}
                  </span>

                  {/* Counter Controls */}
                  <div className="flex items-center justify-between w-full bg-slate-950/80 rounded-xl p-1 border border-slate-800">
                    <button
                      onClick={() => handleCountChange(role.id, -1)}
                      disabled={count === 0}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold flex items-center justify-center cursor-pointer transition text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold font-mono text-white text-xs">{count}</span>
                    <button
                      onClick={() => handleCountChange(role.id, 1)}
                      className="w-6 h-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center cursor-pointer transition text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {moderatorMode === 'human' ? (
              <span className="text-amber-400">
                👑 <strong>Chế độ Quản Trò Người Thật:</strong> Bạn sẽ có giao diện Thần Nhìn Thấu mọi lá bài và kịch bản AI gợi ý từng lời thoại.
              </span>
            ) : (
              <span className="text-indigo-400">
                🤖 <strong>Chế độ AI Quản Trò:</strong> Hệ thống tự động phân tích kịch bản và dẫn dắt vòng lặp trận đấu mượt mà.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              Hủy
            </button>

            <button
              onClick={handleSaveAndDeal}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 cursor-pointer transition transform hover:scale-102 active:scale-98"
            >
              <Shuffle className="w-4 h-4" />
              <span>Xáo & Chia Bài Ngẫu Nhiên</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
