import React, { useState } from 'react';
import { Crown, Bot, ChevronRight, ChevronLeft, Volume2, Skull, Heart, Shield, Sparkles, Moon, Sun, Gavel, Eye, X, Check } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function GameMasterPanel({
  isHost,
  gameState,
  onModeratorAction,
  myId,
}) {
  const [minimized, setMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('script'); // 'script' | 'god_roster'

  if (!isHost || !gameState) return null;

  const script = gameState.moderatorScript || [];
  const currentStepIndex = gameState.currentScriptStep || 0;
  const currentStep = script[currentStepIndex] || script[0];
  const players = gameState.players || [];

  const handleNextStep = () => {
    soundFx.playClick();
    const nextIdx = Math.min(script.length - 1, currentStepIndex + 1);
    onModeratorAction('advance_script', { stepIndex: nextIdx });
  };

  const handlePrevStep = () => {
    soundFx.playClick();
    const prevIdx = Math.max(0, currentStepIndex - 1);
    onModeratorAction('advance_script', { stepIndex: prevIdx });
  };

  const handleSetPhase = (phase) => {
    soundFx.playClick();
    onModeratorAction('set_phase', { phase });
  };

  const handleKill = (targetId) => {
    soundFx.playClick();
    onModeratorAction('kill', { targetId });
  };

  const handleRevive = (targetId) => {
    soundFx.playClick();
    onModeratorAction('revive', { targetId });
  };

  if (minimized) {
    return (
      <div className="fixed top-20 right-4 z-40 animate-fadeIn">
        <button
          onClick={() => setMinimized(false)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs shadow-xl shadow-orange-950/60 flex items-center gap-2 cursor-pointer border border-amber-400/50 hover:scale-105 transition"
        >
          <Crown className="w-4 h-4 text-amber-200 animate-pulse" />
          <span>Mở Bảng Quản Trò & Kịch Bản AI</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-40 w-full max-w-md bg-slate-900/95 border-2 border-amber-500/70 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn">
      {/* Panel Header */}
      <div className="p-3.5 bg-gradient-to-r from-amber-950/90 to-slate-900 border-b border-amber-500/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500 text-slate-950">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-amber-300 text-xs uppercase tracking-wider">
              BẢNG ĐIỀU PHỐI QUẢN TRÒ (GOD MODE)
            </h3>
            <p className="text-[10px] text-slate-400">Kịch bản thoại AI & Toàn quyền điều khiển</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized(true)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer text-xs"
            title="Thu nhỏ bảng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs font-bold px-3 pt-2 gap-2">
        <button
          onClick={() => setActiveTab('script')}
          className={`pb-2 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'script'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Kịch Bản AI Thoại</span>
        </button>

        <button
          onClick={() => setActiveTab('god_roster')}
          className={`pb-2 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'god_roster'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Thần Nhìn Thấu ({players.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto flex-1 space-y-3.5 text-xs">
        {/* TAB 1: KỊCH BẢN AI GỢI Ý THOẠI */}
        {activeTab === 'script' && currentStep && (
          <div className="space-y-3">
            {/* Step Progress */}
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Bước {currentStepIndex + 1} / {script.length}</span>
              <span className="font-bold text-amber-400 uppercase tracking-wide">
                {currentStep.title}
              </span>
            </div>

            {/* Prompt Box */}
            <div className="p-3.5 bg-gradient-to-b from-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-2xl space-y-2 shadow-inner">
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lời Thoại AI Gợi Ý Đọc Cho Cả Làng Nghe:</span>
              </div>
              <p className="text-white font-medium text-sm leading-relaxed italic bg-black/30 p-2.5 rounded-xl border border-white/10">
                "{currentStep.voicePrompt}"
              </p>
              <div className="text-[11px] text-amber-300/90 bg-amber-950/40 p-2 rounded-xl border border-amber-800/40">
                💡 <strong>Mẹo Quản trò:</strong> {currentStep.guideForHost}
              </div>
            </div>

            {/* Night Step Advance Control (Dành riêng cho ban đêm) */}
            {gameState.phase?.startsWith('NIGHT') && (
              <div className="p-2.5 rounded-2xl bg-amber-950/60 border border-amber-500/50 space-y-2 shadow-md">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-amber-400" />
                    Lượt Gọi Ban Đêm:
                  </span>
                  <span className="font-mono text-white bg-black/40 px-2 py-0.5 rounded-lg border border-amber-500/30">
                    {gameState.activeNightTitle || 'Đêm Buông Xuống'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onModeratorAction('advance_night_step');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>Chuyển Sang Vai Trò Tiếp Theo (Next Turn)</span>
                </button>
              </div>
            )}

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 font-semibold flex items-center justify-center gap-1 cursor-pointer transition text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kịch Bản Trước</span>
              </button>

              <button
                onClick={handleNextStep}
                disabled={currentStepIndex === script.length - 1}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 font-bold flex items-center justify-center gap-1 cursor-pointer transition text-xs border border-slate-700"
              >
                <span>Kịch Bản Tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Phase Triggers */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                Chuyển Giai Đoạn Trực Tiếp:
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  onClick={() => handleSetPhase('NIGHT_ACTION')}
                  className="py-1.5 px-2 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Moon className="w-3 h-3" /> Sang Đêm
                </button>
                <button
                  onClick={() => handleSetPhase('DAY_DISCUSSION')}
                  className="py-1.5 px-2 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sun className="w-3 h-3" /> Sang Ngày
                </button>
                <button
                  onClick={() => handleSetPhase('DAY_VOTING')}
                  className="py-1.5 px-2 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Gavel className="w-3 h-3" /> Bỏ Phiếu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOD MODE ROSTER */}
        {activeTab === 'god_roster' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
              <span>Danh tính & Thẻ bài thật của tất cả người chơi</span>
              <span className="text-amber-400 font-bold">Chỉ Quản trò nhìn thấy</span>
            </div>

            <div className="space-y-2">
              {players.map((p) => {
                const roleDef = p.roleDetails || {};
                return (
                  <div
                    key={p.id}
                    className={`p-2 rounded-2xl border flex items-center justify-between gap-2.5 transition ${
                      p.isAlive
                        ? 'bg-slate-800/80 border-slate-700'
                        : 'bg-slate-950/60 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Mini Tarot Card Art */}
                      <div className="w-9 h-13 rounded-lg overflow-hidden border border-amber-400/60 bg-slate-950 shrink-0">
                        <img
                          src={roleDef.cardImage || `/cards/${p.role || 'villager'}.jpg`}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-white text-xs truncate">{p.name}</span>
                          {!p.isAlive && <span className="text-[10px] text-red-400">💀</span>}
                        </div>
                        <div className="text-[11px] font-semibold" style={{ color: roleDef.color || '#38bdf8' }}>
                          {roleDef.name || p.role || 'Chưa chia bài'}
                        </div>
                      </div>
                    </div>

                    {/* Quick Admin Actions */}
                    <div className="flex items-center gap-1">
                      {p.isAlive ? (
                        <button
                          onClick={() => handleKill(p.id)}
                          className="px-2 py-1 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-[10px] transition cursor-pointer"
                          title="Xử tử người này"
                        >
                          Xử Tử
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRevive(p.id)}
                          className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-[10px] transition cursor-pointer"
                          title="Hồi sinh người này"
                        >
                          Hồi Sinh
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
