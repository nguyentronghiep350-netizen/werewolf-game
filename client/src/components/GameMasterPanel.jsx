import React, { useState, useEffect } from 'react';
import { Crown, Volume2, VolumeX, Skull, Heart, Shield, Moon, Sun, Gavel, Eye, X, Check, Pause, Play, ChevronRight, Settings, Sparkles, UserCheck } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function GameMasterPanel({
  isHost,
  gameState,
  onModeratorAction,
  myId,
}) {
  const [minimized, setMinimized] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [selectedPlayerForAdmin, setSelectedPlayerForAdmin] = useState(null);

  if (!isHost || !gameState) return null;

  const script = gameState.moderatorScript || [];
  const currentStepIndex = gameState.currentScriptStep || 0;
  const currentStep = script[currentStepIndex] || script[0];
  const players = gameState.players || [];
  const isTimerPaused = !!gameState.isTimerPaused;
  const isNight = gameState.phase?.startsWith('NIGHT');
  const nightDone = !!gameState.nightActionsDone;
  const godNight = gameState.godNightActions || {};

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
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

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

  const handleNextAction = () => {
    soundFx.playClick();
    if (isNight) {
      onModeratorAction('advance_night_step');
    } else if (gameState.phase === 'DAY_DISCUSSION') {
      onModeratorAction('set_phase', { phase: 'DAY_VOTING' });
    } else if (gameState.phase === 'DAY_VOTING') {
      onModeratorAction('set_phase', { phase: 'NIGHT_ACTION' });
    } else {
      onModeratorAction('set_phase', { phase: 'NIGHT_ACTION' });
    }
  };

  const handleTogglePauseTimer = () => {
    soundFx.playClick();
    onModeratorAction('toggle_pause_timer');
  };

  const handleSetPhase = (phase) => {
    soundFx.playClick();
    onModeratorAction('set_phase', { phase });
    setShowAdvanced(false);
  };

  const handleKill = (targetId) => {
    soundFx.playClick();
    onModeratorAction('kill', { targetId });
    setSelectedPlayerForAdmin(null);
  };

  const handleRevive = (targetId) => {
    soundFx.playClick();
    onModeratorAction('revive', { targetId });
    setSelectedPlayerForAdmin(null);
  };

  // Nút thu nhỏ nổi góc phải nếu người dùng muốn ẩn
  if (minimized) {
    return (
      <div className="fixed top-20 right-4 z-40 animate-fadeIn">
        <button
          onClick={() => setMinimized(false)}
          className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 font-black text-xs shadow-xl shadow-amber-950/60 flex items-center gap-1.5 cursor-pointer border border-amber-300 hover:scale-105 transition"
        >
          <Crown className="w-4 h-4 text-slate-950" />
          <span>Bảng Quản Trò</span>
        </button>
      </div>
    );
  }

  // Lời thoại ngắn gọn
  const currentVoiceText = currentStep?.voicePrompt || (
    isNight
      ? 'Màn đêm buông xuống... Cả làng hãy nhắm mắt đi ngủ!'
      : 'Trời đã sáng! Dân làng hãy thảo luận tìm ra Ma Sói.'
  );

  return (
    <>
      {/* ========================================================================= */}
      {/* THANH ĐIỀU PHỐI QUẢN TRÒ TINH GỌN (SMART GOD BAR) */}
      {/* ========================================================================= */}
      <div className="fixed top-18 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-3 animate-fadeIn">
        <div className="bg-slate-900/95 border-2 border-amber-500/80 rounded-3xl shadow-2xl backdrop-blur-2xl p-3 md:p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* CỘT TRÁI: LỜI THOẠI DẪN TRUYỆN 1-DÒNG */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md shrink-0">
              <Crown className="w-4 h-4 stroke-[2.5]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  {isNight ? (gameState.activeNightTitle || 'MÀN ĐÊM') : 'BAN NGÀY'}
                </span>
                {isNight && (
                  <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold uppercase ${
                    nightDone ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 animate-pulse' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {nightDone ? '✓ Đã Chọn Xong' : 'Đang Chờ...'}
                  </span>
                )}
              </div>
              <p className="text-white text-xs font-semibold truncate italic">
                "{currentVoiceText}"
              </p>
            </div>
          </div>

          {/* CỘT PHẢI: CÁC NÚT THAO TÁC 1-CHẠM */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
            {/* Nút Đọc Thoại AI */}
            <button
              type="button"
              onClick={() => handleSpeakTTS(currentVoiceText)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow ${
                isSpeakingTTS
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
              title="Máy tự phát giọng đọc dẫn chuyện tiếng Việt"
            >
              {isSpeakingTTS ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeakingTTS ? 'Dừng' : 'Đọc Hộ'}</span>
            </button>

            {/* Nút Tạm Dừng Đồng Hồ */}
            <button
              type="button"
              onClick={handleTogglePauseTimer}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 border ${
                isTimerPaused
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title={isTimerPaused ? 'Tiếp tục chạy giờ' : 'Tạm dừng đồng hồ để tha hồ đọc thoại'}
            >
              {isTimerPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isTimerPaused ? 'Chạy Giờ' : 'Dừng Giờ'}</span>
            </button>

            {/* NÚT CHÍNH TO NHẤT: CHUYỂN BƯỚC / NEXT TURN */}
            <button
              type="button"
              onClick={handleNextAction}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-lg active:scale-95 shrink-0 ${
                nightDone
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-950/60 ring-2 ring-emerald-300 animate-bounce'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-950/60'
              }`}
            >
              <span>
                {isNight ? (nightDone ? 'Chuyển Lượt Tiếp ⏩' : 'Chuyển Lượt ⏩') :
                 gameState.phase === 'DAY_DISCUSSION' ? 'Vào Bỏ Phiếu 🗳️' :
                 gameState.phase === 'DAY_VOTING' ? 'Xử Treo Cổ & Sang Đêm 🌙' : 'Chuyển Tiếp ⏩'}
              </span>
            </button>

            {/* Nút Xem Quyền Năng Mở Rộng */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-2 rounded-xl border transition cursor-pointer text-xs shrink-0 ${
                showAdvanced ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Quyền năng nâng cao (Xử tử, Hồi sinh, Đổi giai đoạn)"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Nút Thu Nhỏ */}
            <button
              type="button"
              onClick={() => setMinimized(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer text-xs shrink-0"
              title="Thu nhỏ thanh điều khiển"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* THÔNG BÁO TÌNH BÁO LIVE GOD VIEW BAN ĐÊM (MINI INTEL) */}
        {isNight && (
          <div className="mt-1.5 px-3 py-1.5 bg-black/80 border border-amber-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-[11px] shadow-lg backdrop-blur-md">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>Diễn biến Đêm:</span>
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {godNight.werewolfTargetName ? (
                <span className="px-2 py-0.5 rounded-lg bg-rose-950 border border-rose-700 text-rose-300 font-bold">
                  🐺 Sói cắn: {godNight.werewolfTargetName}
                </span>
              ) : (
                <span className="text-slate-400 italic">🐺 Sói đang chọn...</span>
              )}

              {godNight.bodyguardTargetName && (
                <span className="px-2 py-0.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">
                  🛡️ Bảo vệ: {godNight.bodyguardTargetName}
                </span>
              )}

              {godNight.seerTargetName && (
                <span className="px-2 py-0.5 rounded-lg bg-purple-950 border border-purple-700 text-purple-300 font-bold">
                  🔮 Tiên tri soi: {godNight.seerTargetName} ({godNight.seerResult?.isWerewolf ? 'Sói 🐺' : 'Dân 👤'})
                </span>
              )}

              {godNight.witchSave && (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                  🧪 Phù thủy: Cứu ✅
                </span>
              )}
              {godNight.witchKillTargetName && (
                <span className="px-2 py-0.5 rounded-lg bg-purple-950 border border-purple-700 text-purple-300 font-bold">
                  ☠️ Phù thủy độc: {godNight.witchKillTargetName}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL QUYỀN NĂNG NÂNG CAO (CHỈ MỞ KHI BẤM NÚT CÀI ĐẶT ⚙️) */}
      {/* ========================================================================= */}
      {showAdvanced && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border-2 border-amber-500/70 rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-amber-300 text-sm uppercase tracking-wider">
                  QUYỀN NĂNG QUẢN TRÒ TỐI THƯỢNG
                </h3>
              </div>
              <button
                onClick={() => setShowAdvanced(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Nhảy Giai Đoạn Trực Tiếp */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Chuyển Giai Đoạn Trực Tiếp:
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => handleSetPhase('NIGHT_ACTION')}
                  className="p-2.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Moon className="w-4 h-4" /> Sang Đêm
                </button>
                <button
                  onClick={() => handleSetPhase('DAY_DISCUSSION')}
                  className="p-2.5 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sun className="w-4 h-4" /> Thảo Luận
                </button>
                <button
                  onClick={() => handleSetPhase('DAY_VOTING')}
                  className="p-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Gavel className="w-4 h-4" /> Bỏ Phiếu
                </button>
              </div>
            </div>

            {/* 2. Danh Sách & Can Thiệp Xử Tử / Hồi Sinh */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Danh Sách Người Chơi ({players.filter(p => p.role !== 'moderator').length}):
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {players.filter(p => p.role !== 'moderator').map((p) => {
                  const roleDef = p.roleDetails || {};
                  return (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{p.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-white">{p.name}</span>
                            {!p.isAlive && <span className="text-[10px] text-rose-400 font-bold">💀 (Đã chết)</span>}
                          </div>
                          <span className="text-[10px] font-semibold" style={{ color: roleDef.color || '#38bdf8' }}>
                            {roleDef.name || p.role || 'Dân làng'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {p.isAlive ? (
                          <button
                            onClick={() => handleKill(p.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-[11px] cursor-pointer"
                          >
                            Xử Tử
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRevive(p.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-[11px] cursor-pointer"
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

            <button
              onClick={() => setShowAdvanced(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-slate-700"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}
