import React, { useState } from 'react';
import { Crosshair, AlertTriangle } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function HunterActionModal({
  hunterPendingName,
  isMyHunterTurn,
  players = [],
  myId,
  onHunterShot,
  timer,
}) {
  const [selectedTarget, setSelectedTarget] = useState('');

  if (!hunterPendingName) return null;

  const aliveTargets = players.filter((p) => p.isAlive && p.id !== myId);

  const handleShoot = () => {
    if (!selectedTarget) return;
    soundFx.playVote();
    onHunterShot(selectedTarget);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 w-full max-w-lg shadow-2xl shadow-amber-950/60 text-center">
        <div className="inline-flex p-3.5 rounded-2xl bg-amber-950/60 border border-amber-800 text-amber-400 mb-3 animate-pulse">
          <Crosshair className="w-10 h-10" />
        </div>

        <h3 className="text-xl font-black text-white tracking-wide uppercase">
          PHÁT SÚNG CỦA THỢ SĂN!
        </h3>

        {isMyHunterTurn ? (
          <div className="space-y-4 mt-3">
            <p className="text-xs text-amber-200">
              Bạn là Thợ Săn! Trước khi ngã xuống, hãy chọn 1 người chơi để kéo họ chết cùng bạn (Thời gian còn {timer}s):
            </p>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {aliveTargets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedTarget(t.id);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                    selectedTarget === t.id
                      ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60'
                  }`}
                >
                  <span className="text-xl">{t.avatar}</span>
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleShoot}
              disabled={!selectedTarget}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Crosshair className="w-4 h-4" />
              Bóp Cò Bắn Hạ Ngay
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-slate-300">
              Thợ Săn <strong className="text-amber-400">{hunterPendingName}</strong> đã ngã xuống nhưng đang nhắm khẩu súng bạc cuối cùng vào một kẻ đáng ngờ...
            </p>
            <div className="text-xs text-slate-500 font-mono">
              Đang chờ phát súng quyết định ({timer}s)...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
