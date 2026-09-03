import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Flame, Users, Heart, Laugh } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function GameOverModal({
  winner,
  winReason,
  players = [],
  isHost,
  onRestartGame,
}) {
  useEffect(() => {
    soundFx.playVictory();
    // Bắn pháo hoa rực rỡ
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 500);
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }, []);

  const getWinnerInfo = () => {
    switch (winner) {
      case 'village':
        return {
          title: 'PHE DÂN LÀNG CHIẾN THẮNG!',
          color: 'from-blue-600 to-indigo-600',
          textColor: 'text-blue-400',
          icon: Users,
          badge: 'bg-blue-900/80 text-blue-300 border-blue-700',
        };
      case 'werewolf':
        return {
          title: 'PHE MA SÓI CHIẾN THẮNG!',
          color: 'from-red-600 to-rose-700',
          textColor: 'text-red-400',
          icon: Flame,
          badge: 'bg-red-900/80 text-red-300 border-red-700',
        };
      case 'lovers':
        return {
          title: 'CẶP ĐÔI TÌNH NHÂN CHIẾN THẮNG!',
          color: 'from-pink-600 to-rose-600',
          textColor: 'text-pink-400',
          icon: Heart,
          badge: 'bg-pink-900/80 text-pink-300 border-pink-700',
        };
      case 'solo':
        return {
          title: 'KẺ CHÁN ĐỜI CHIẾN THẮNG!',
          color: 'from-purple-600 to-violet-700',
          textColor: 'text-purple-400',
          icon: Laugh,
          badge: 'bg-purple-900/80 text-purple-300 border-purple-700',
        };
      default:
        return {
          title: 'HÒA! KHÔNG CÒN AI SỐNG SÓT!',
          color: 'from-slate-700 to-slate-800',
          textColor: 'text-slate-400',
          icon: Trophy,
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  };

  const winInfo = getWinnerInfo();
  const IconComp = winInfo.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Banner thắng */}
        <div className={`p-6 bg-gradient-to-r ${winInfo.color} text-center relative shadow-lg`}>
          <div className="inline-flex p-3.5 rounded-2xl bg-black/30 border border-white/20 mb-3 shadow-inner">
            <IconComp className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider">
            {winInfo.title}
          </h2>
          <p className="text-white/90 text-sm max-w-xl mx-auto mt-2 font-medium">
            {winReason}
          </p>
        </div>

        {/* Lật mở toàn bộ vai trò */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              LẬT MỞ DANH TÍNH TẤT CẢ NGƯỜI CHƠI
            </h3>
            <span className="text-xs text-slate-500">
              Tổng số {players.length} người chơi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {players.map((p) => {
              const roleDef = p.roleDetails || {};
              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                    p.isAlive
                      ? 'bg-slate-800/80 border-slate-600 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="w-12 h-16 shrink-0 rounded-xl overflow-hidden border border-amber-400/70 shadow-md bg-slate-950 relative">
                    <img
                      src={roleDef.cardImage || `/cards/${p.role}.jpg`}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm truncate">{p.name}</span>
                      {p.isBot && <span className="text-[10px] text-indigo-400">🤖</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className="text-xs font-bold"
                        style={{ color: roleDef.color || '#cbd5e1' }}
                      >
                        {roleDef.name || p.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {p.isAlive ? (
                        <span className="text-emerald-400 font-medium">Còn sống</span>
                      ) : (
                        <span className="text-rose-400">Chết: {p.deathReason}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {isHost ? 'Chủ phòng có thể bấm "Chơi Lại" để mở ván mới cùng nhóm.' : 'Đang chờ Chủ phòng bắt đầu ván mới...'}
          </span>

          {isHost && (
            <button
              onClick={() => {
                soundFx.playClick();
                onRestartGame();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/50 transition transform active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Chơi Lại (Về Phòng Chờ)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
