import React, { useState, useEffect } from 'react';
import { Crown, Bot, ChevronRight, ChevronLeft, Volume2, VolumeX, Skull, Heart, Shield, Sparkles, Moon, Sun, Gavel, Eye, X, Check, Pause, Play, UserCheck, ToggleLeft, ToggleRight, Radio } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function GameMasterPanel({
  isHost,
  gameState,
  onModeratorAction,
  myId,
}) {
  const [minimized, setMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('script'); // 'script' | 'god_roster'
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);

  if (!isHost || !gameState) return null;

  const script = gameState.moderatorScript || [];
  const currentStepIndex = gameState.currentScriptStep || 0;
  const currentStep = script[currentStepIndex] || script[0];
  const players = gameState.players || [];
  const isTimerPaused = !!gameState.isTimerPaused;
  const controlMode = gameState.moderatorControlMode || 'auto'; // 'auto' | 'manual'
  const nightDone = !!gameState.nightActionsDone;

  // Dừng phát âm thanh TTS khi component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Đọc lời thoại tự động bằng Web Speech API (Giọng tiếng Việt)
  const handleSpeakTTS = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Trình duyệt của bạn không hỗ trợ đọc giọng nói tự động!');
      return;
    }

    if (isSpeakingTTS) {
      window.speechSynthesis.cancel();
      setIsSpeakingTTS(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95; // Tốc độ vừa phải, truyền cảm
    utterance.pitch = 1.0;

    // Tìm giọng tiếng Việt nếu có
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VI'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onstart = () => setIsSpeakingTTS(true);
    utterance.onend = () => setIsSpeakingTTS(false);
    utterance.onerror = () => setIsSpeakingTTS(false);

    window.speechSynthesis.speak(utterance);
  };

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

  const handleTogglePauseTimer = () => {
    soundFx.playClick();
    onModeratorAction('toggle_pause_timer');
  };

  const handleToggleControlMode = () => {
    soundFx.playClick();
    onModeratorAction('toggle_control_mode');
  };

  const handleAdvanceNightStep = () => {
    soundFx.playClick();
    onModeratorAction('advance_night_step');
  };

  if (minimized) {
    return (
      <div className="fixed top-20 right-4 z-40 animate-fadeIn">
        <button
          onClick={() => setMinimized(false)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs shadow-xl shadow-orange-950/60 flex items-center gap-2 cursor-pointer border border-amber-400/50 hover:scale-105 transition"
        >
          <Crown className="w-4 h-4 text-amber-200 animate-pulse" />
          <span>Mở Bảng Quản Trò Toàn Năng</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-40 w-full max-w-md bg-slate-900/95 border-2 border-amber-500/70 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[88vh] animate-fadeIn">
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
            <p className="text-[10px] text-slate-400">Toàn quyền điều khiển ván đấu theo ý bạn</p>
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

      {/* Quick Master Bar: Pause Timer & Control Mode */}
      <div className="bg-slate-950/80 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
        {/* Nút Pause / Resume Timer */}
        <button
          onClick={handleTogglePauseTimer}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer text-xs ${
            isTimerPaused
              ? 'bg-amber-600 text-slate-950 animate-pulse shadow-md shadow-amber-950/60'
              : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
          }`}
          title={isTimerPaused ? 'Bấm để tiếp tục chạy giờ' : 'Bấm để tạm dừng đồng hồ (để tha hồ đọc thoại)'}
        >
          {isTimerPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          <span>{isTimerPaused ? 'Tiếp Tục Giờ' : 'Tạm Dừng Giờ'}</span>
        </button>

        {/* Chế độ Thủ Công / Tự Động */}
        <button
          onClick={handleToggleControlMode}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer text-xs ${
            controlMode === 'manual'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
          title="Chuyển chế độ Quản trò thủ công (không tự chuyển) hoặc Tự động (theo đồng hồ)"
        >
          {controlMode === 'manual' ? (
            <>
              <ToggleRight className="w-4 h-4 text-emerald-300" />
              <span>Thủ Công (Bấm Next)</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4 text-slate-400" />
              <span>Tự Động (Theo Giờ)</span>
            </>
          )}
        </button>
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
          <span>Kịch Bản Thoại AI</span>
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
            <div className="p-3.5 bg-gradient-to-b from-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-2xl space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Lời Thoại Dẫn Truyện:</span>
                </div>

                {/* Nút Đọc Giọng AI Tự Động (TTS) */}
                <button
                  type="button"
                  onClick={() => handleSpeakTTS(currentStep.voicePrompt)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition cursor-pointer shadow ${
                    isSpeakingTTS
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                  title="Máy tự đọc thoại tiếng Việt cho bạn nghe"
                >
                  {isSpeakingTTS ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeakingTTS ? 'Dừng Đọc' : '🔊 Đọc Hộ Tôi'}</span>
                </button>
              </div>

              <p className="text-white font-medium text-sm leading-relaxed italic bg-black/40 p-3 rounded-xl border border-white/10 select-all">
                "{currentStep.voicePrompt}"
              </p>
              <div className="text-[11px] text-amber-300/90 bg-amber-950/40 p-2 rounded-xl border border-amber-800/40">
                💡 <strong>Gợi ý Quản trò:</strong> {currentStep.guideForHost}
              </div>
            </div>

            {/* Night Step Advance Control (Dành riêng cho ban đêm) */}
            {gameState.phase?.startsWith('NIGHT') && (
              <div className="p-3 rounded-2xl bg-amber-950/50 border border-amber-500/50 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-amber-400" />
                    Đang gọi:
                  </span>
                  <span className="font-bold text-white bg-black/50 px-2.5 py-0.5 rounded-lg border border-amber-500/40">
                    {gameState.activeNightTitle || 'Màn Đêm'}
                  </span>
                </div>

                {/* Live Intel Grid */}
                <div className="p-2 bg-black/60 rounded-xl border border-amber-500/30 space-y-1.5 text-[11px]">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    👁️ Diễn Biến Đêm (Live God View):
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className={`p-1.5 rounded-lg border ${gameState.godNightActions?.werewolfTargetId ? 'bg-rose-950/80 border-rose-600 text-rose-200' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                      <span className="font-bold text-rose-400 block text-[9px]">🐺 SÓI ĐANG CẮN:</span>
                      <span className="font-black text-white truncate block text-[11px]">
                        {gameState.godNightActions?.werewolfTargetName ? `💀 ${gameState.godNightActions.werewolfTargetName}` : 'Đang chờ Sói vote...'}
                      </span>
                    </div>
                    <div className={`p-1.5 rounded-lg border ${gameState.godNightActions?.bodyguardTargetId ? 'bg-cyan-950/80 border-cyan-600 text-cyan-200' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                      <span className="font-bold text-cyan-400 block text-[9px]">🛡️ BẢO VỆ GIỮ:</span>
                      <span className="font-black text-white truncate block text-[11px]">
                        {gameState.godNightActions?.bodyguardTargetName ? `✨ ${gameState.godNightActions.bodyguardTargetName}` : 'Chưa chọn'}
                      </span>
                    </div>
                    <div className={`p-1.5 rounded-lg border ${gameState.godNightActions?.seerTargetId ? 'bg-purple-950/80 border-purple-600 text-purple-200' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                      <span className="font-bold text-purple-400 block text-[9px]">🔮 TIÊN TRI SOI:</span>
                      <span className="font-black text-white truncate block text-[11px]">
                        {gameState.godNightActions?.seerTargetName ? `${gameState.godNightActions.seerTargetName} (${gameState.godNightActions.seerResult?.isWerewolf ? 'SÓI 🐺' : 'DÂN 👤'})` : 'Chưa soi'}
                      </span>
                    </div>
                    <div className={`p-1.5 rounded-lg border ${(gameState.godNightActions?.witchSave || gameState.godNightActions?.witchKillTargetId) ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                      <span className="font-bold text-emerald-400 block text-[9px]">🧪 PHÙ THỦY:</span>
                      <span className="font-black text-white truncate block text-[11px]">
                        {gameState.godNightActions?.witchSave ? 'Cứu: ✅ ' : ''}
                        {gameState.godNightActions?.witchKillTargetName ? `Độc: ☠️ ${gameState.godNightActions.witchKillTargetName}` : (!gameState.godNightActions?.witchSave ? 'Chưa hành động' : '')}
                      </span>
                    </div>
                  </div>
                </div>

                {nightDone && (
                  <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Người chơi vai trò này đã thực hiện xong! Bạn có thể bấm Chuyển Lượt tiếp.</span>
                  </div>
                )}

                <button
                  onClick={handleAdvanceNightStep}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-950/60 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                  <span>CHUYỂN SANG VAI TRÒ TIẾP THEO (NEXT TURN)</span>
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

