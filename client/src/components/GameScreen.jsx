import React, { useEffect, useState } from 'react';
import { Moon, Sun, Clock, Skull, Heart, Shield, Flame, Eye, Gavel, MessageSquare, ScrollText, Volume2, VolumeX, Pause, Play, ChevronRight, ToggleLeft, ToggleRight, Sparkles, Crown } from 'lucide-react';
import { soundFx } from '../utils/audio';
import NightActionPanel from './NightActionPanel';
import VotingPanel from './VotingPanel';
import HunterActionModal from './HunterActionModal';
import GameOverModal from './GameOverModal';
import ChatBox from './ChatBox';
import GameLogs from './GameLogs';
import RoleDrawer from './RoleDrawer';

export default function GameScreen({
  roomCode,
  gameState,
  myId,
  myRole,
  myRoleDetails,
  isHost,
  chatMessages = [],
  onSendMessage,
  onNightAction,
  onSkipDiscussion,
  onDayVote,
  onHunterShot,
  onRestartGame,
  seerResult,
  witchVictim,
  loverPartner,
  voiceStates = {},
  onModeratorAction,
}) {
  const [activeBottomTab, setActiveBottomTab] = useState('chat'); // 'chat' | 'logs'
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);

  const {
    phase,
    nightNumber,
    dayNumber,
    timer,
    isTimerPaused,
    moderatorControlMode = 'auto',
    winner,
    winReason,
    logs = [],
    players = [],
    nightDeaths = [],
    hunterPending,
    dayVotes = {},
    discussionSkips = [],
    moderatorScript = [],
    currentScriptStep = 0,
    isGodModerator,
    nightActionsDone,
  } = gameState || {};

  const me = players.find((p) => p.id === myId);
  const isAlive = me?.isAlive ?? true;
  const isNight = phase?.startsWith('NIGHT');
  const isHunterTurn = phase === 'HUNTER_ACTION';
  const isMyHunterTurn = isHunterTurn && hunterPending === me?.name;
  const isModeratorUser = myRole === 'moderator' || (isHost && isGodModerator);

  // Dừng phát TTS khi chuyển phase hoặc unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [phase]);

  // Kích hoạt âm thanh khi đổi phase
  useEffect(() => {
    if (phase === 'NIGHT_START') {
      soundFx.playHowl();
    } else if (phase === 'MORNING') {
      soundFx.playRooster();
      if (nightDeaths && nightDeaths.length > 0) {
        setTimeout(() => soundFx.playDeathBell(), 1500);
      }
    } else if (phase === 'DAY_EXECUTION') {
      soundFx.playDeathBell();
    }
  }, [phase]);

  // Phát âm thanh giọng đọc tiếng Việt Web Speech API
  const handleSpeakTTS = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Trình duyệt của bạn không hỗ trợ phát giọng đọc tự động!');
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

  // Thông tin tiêu đề phase
  const getPhaseInfo = () => {
    switch (phase) {
      case 'STARTING':
        return { title: 'CHUẨN BỊ BẮT ĐẦU', icon: Clock, color: 'text-amber-400', desc: 'Ván đấu đang được khởi tạo...' };
      case 'NIGHT_START':
        return {
          title: `ĐÊM THỨ ${nightNumber}`,
          icon: Moon,
          color: 'text-indigo-400',
          desc: 'Ngôi làng chìm vào bóng tối. Mọi người hãy nhắm mắt đi ngủ...',
        };
      case 'NIGHT_ACTION':
        return {
          title: gameState?.activeNightTitle ? `ĐÊM ${nightNumber} - ${gameState.activeNightTitle.toUpperCase()}` : `ĐÊM THỨ ${nightNumber}`,
          icon: Moon,
          color: 'text-indigo-400',
          desc: gameState?.activeNightPrompt || 'Quản trò đang gọi các vai trò ban đêm theo thứ tự logic.',
        };
      case 'MORNING':
        return {
          title: `RẠNG SÁNG NGÀY ${dayNumber || 1}`,
          icon: Sun,
          color: 'text-amber-400',
          desc: 'Mặt trời lên rọi sáng kết quả sau một đêm đẫm máu.',
        };
      case 'HUNTER_ACTION':
        return {
          title: 'THỢ SĂN TRẢ THÙ',
          icon: Skull,
          color: 'text-red-400',
          desc: 'Thợ săn chuẩn bị bóp cò phát đạn oan nghiệt.',
        };
      case 'DAY_DISCUSSION':
        return {
          title: `NGÀY THỨ ${dayNumber} - THẢO LUẬN`,
          icon: Sun,
          color: 'text-amber-300',
          desc: 'Dân làng tranh luận để tìm ra kẻ tình nghi.',
        };
      case 'DAY_VOTING':
        return {
          title: 'BỎ PHIẾU TREO CỔ',
          icon: Gavel,
          color: 'text-red-400',
          desc: 'Hãy bỏ phiếu người bạn nghi ngờ là Ma Sói.',
        };
      case 'DAY_EXECUTION':
        return {
          title: 'THỰC THI PHÁN QUYẾT',
          icon: Skull,
          color: 'text-rose-500',
          desc: 'Công bố kẻ bị dân làng đưa lên giàn treo cổ.',
        };
      case 'GAME_OVER':
        return { title: 'KẾT THÚC TRẬN ĐẤU', icon: Clock, color: 'text-emerald-400' };
      default:
        return { title: 'ĐANG DIỄN RA', icon: Clock, color: 'text-white' };
    }
  };

  const phaseInfo = getPhaseInfo();
  const PhaseIcon = phaseInfo.icon;

  const aliveNonModCount = players.filter((p) => p.isAlive && p.role !== 'moderator').length;
  const totalNonModCount = players.filter((p) => p.role !== 'moderator').length;

  // Lời thoại hiện tại của Quản Trò
  const currentVoiceLine = gameState?.activeNightPrompt || (moderatorScript[currentScriptStep]?.voicePrompt) || phaseInfo.desc;

  return (
    <div className={`min-h-[calc(100vh-65px)] flex flex-col justify-between transition-colors duration-700 ${
      isNight ? 'bg-[#060813]' : 'bg-[#0a0e1a]'
    }`}>
      {/* Top Banner Thanh Trạng Thái */}
      <div className="max-w-6xl w-full mx-auto p-3 md:p-4 space-y-3.5">
        <div className={`p-3.5 md:p-4 rounded-3xl border backdrop-blur-xl shadow-xl flex items-center justify-between transition-all ${
          isNight
            ? 'bg-slate-900/90 border-indigo-900/60 moon-glow'
            : 'bg-slate-900/90 border-amber-900/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-2xl ${
              isNight ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/60' : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
            }`}>
              <PhaseIcon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-sm md:text-base font-black tracking-wider ${phaseInfo.color}`}>
                  {phaseInfo.title}
                </h2>
                {!isAlive && myRole !== 'moderator' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-semibold">
                    Đã Chết 👻
                  </span>
                )}
                {isTimerPaused && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black uppercase tracking-wide animate-pulse">
                    ⏸️ ĐANG TẠM DỪNG GIỜ
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">{phaseInfo.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {timer > 0 && (
              <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border ${
                isTimerPaused
                  ? 'bg-amber-950 border-amber-500 text-amber-300'
                  : 'bg-slate-950/90 border-slate-800 text-white'
              }`}>
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-lg md:text-xl font-black font-mono">
                  {timer}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BÀN ĐIỀU KHIỂN QUẢN TRÒ TRỰC TIẾP (GAME MASTER COMMAND DECK) */}
        {/* ========================================================================= */}
        {isModeratorUser && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-indigo-950/90 border-2 border-amber-500/70 shadow-2xl space-y-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/30 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl p-1 bg-amber-500 text-slate-950 rounded-xl">👑</span>
                <div>
                  <h3 className="font-black text-amber-300 text-xs md:text-sm uppercase tracking-wider">
                    BÀN ĐIỀU KHIỂN QUẢN TRÒ (GOD DECK)
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Bạn toàn quyền làm chủ nhịp độ trận đấu, không sợ bị trôi giờ!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Nút Pause / Resume Timer */}
                <button
                  type="button"
                  onClick={() => onModeratorAction && onModeratorAction('toggle_pause_timer')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow ${
                    isTimerPaused
                      ? 'bg-amber-500 text-slate-950 animate-pulse font-black'
                      : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                  title="Tạm dừng hoặc tiếp tục đồng hồ đếm ngược"
                >
                  {isTimerPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isTimerPaused ? 'Tiếp Tục Giờ' : 'Tạm Dừng Giờ'}</span>
                </button>

                {/* Chế độ Thủ Công / Tự Động */}
                <button
                  type="button"
                  onClick={() => onModeratorAction && onModeratorAction('toggle_control_mode')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow ${
                    moderatorControlMode === 'manual'
                      ? 'bg-indigo-600 text-white border border-indigo-400'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                  title="Chuyển giữa chế độ Thủ công (chỉ chuyển khi Quản trò bấm Next) và Tự động (theo đồng hồ)"
                >
                  {moderatorControlMode === 'manual' ? (
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
            </div>

            {/* Khung Lời Thoại Cần Đọc Ngay */}
            <div className="p-3 bg-black/40 border border-amber-500/40 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  Lời Thoại Cần Đọc Lúc Này:
                </span>

                {/* Nút Đọc Giọng AI Web Speech API */}
                <button
                  type="button"
                  onClick={() => handleSpeakTTS(currentVoiceLine)}
                  className={`px-3 py-1 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow ${
                    isSpeakingTTS
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black'
                  }`}
                  title="Máy tự đọc thoại tiếng Việt tự động cho làng nghe"
                >
                  {isSpeakingTTS ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeakingTTS ? 'Dừng Đọc' : '🔊 Đọc Giọng AI Hộ Tôi'}</span>
                </button>
              </div>

              <p className="text-white font-medium text-xs sm:text-sm leading-relaxed italic bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 select-all">
                "{currentVoiceLine}"
              </p>
            </div>

            {/* Nút Hành Động Chuyển Lượt / Chuyển Pha */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {isNight ? (
                <button
                  type="button"
                  onClick={() => onModeratorAction && onModeratorAction('advance_night_step')}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-orange-950/60 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-98"
                >
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                  <span>
                    {nightActionsDone ? '✓ ĐÃ XONG KỸ NĂNG - BẤM CHUYỂN LƯỢT TIẾP' : 'CHUYỂN SANG VAI TRÒ TIẾP THEO (NEXT TURN)'}
                  </span>
                </button>
              ) : (
                <div className="grid grid-cols-3 gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => onModeratorAction && onModeratorAction('set_phase', { phase: 'NIGHT_ACTION' })}
                    className="py-2.5 px-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Sang Đêm 🌙</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onModeratorAction && onModeratorAction('set_phase', { phase: 'DAY_DISCUSSION' })}
                    className="py-2.5 px-2 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-700 text-amber-200 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Thảo Luận ☀️</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onModeratorAction && onModeratorAction('set_phase', { phase: 'DAY_VOTING' })}
                    className="py-2.5 px-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Gavel className="w-3.5 h-3.5 text-rose-400" />
                    <span>Bỏ Phiếu 🗳️</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Thông báo kết quả sáng (Morning Death announcement) */}
        {phase === 'MORNING' && (
          <div className="p-3.5 rounded-3xl bg-slate-900/90 border border-amber-800/60 shadow-xl text-center animate-fadeIn">
            <div className="text-xl mb-0.5">🌅</div>
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Kết Quả Đêm Thứ {nightNumber}
            </h3>
            {nightDeaths.length === 0 ? (
              <p className="text-xs text-emerald-400 mt-1 font-medium">
                Một đêm yên bình lạ kỳ! Không có ai phải bỏ mạng đêm qua.
              </p>
            ) : (
              <div className="mt-1.5 space-y-1">
                <p className="text-[11px] text-rose-400 font-bold">
                  Bóng đêm đã cướp đi sinh mạng của:
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                  {nightDeaths.map((d) => (
                    <span
                      key={d.id}
                      className="px-2.5 py-0.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-1"
                    >
                      <Skull className="w-3 h-3" />
                      {d.name} ({d.roleName}) - {d.reason}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bàn Chơi Danh Sách Người Chơi */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-3.5 md:p-4 backdrop-blur-xl shadow-xl space-y-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              BÀN TRÒN DÂN LÀNG ({aliveNonModCount}/{totalNonModCount} CÒN SỐNG)
            </h3>
            <span className="text-[11px] text-slate-400">
              {totalNonModCount - aliveNonModCount} Đã chết
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {players.map((p) => {
              const isMe = p.id === myId;
              const hasVote = dayVotes[p.id];
              const isProtected = isAlive && myRole === 'bodyguard' && me?.lastProtectedId === p.id;
              const isMyLover = p.isLover;

              const voice = voiceStates[p.id];
              const isSpeaking = voice?.isSpeaking;
              const inVoice = voice?.inVoice;
              const isMuted = voice?.isMuted;

              return (
                <div
                  key={p.id}
                  className={`p-2 rounded-2xl border transition-all duration-200 relative flex flex-col items-center text-center ${
                    isSpeaking
                      ? 'ring-2 ring-emerald-400 bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/60 scale-102'
                      : !p.isAlive
                      ? 'bg-slate-950/60 border-slate-800 opacity-50 grayscale'
                      : isMe
                      ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-950/50'
                      : 'bg-slate-800/40 border-slate-700/60'
                  }`}
                >
                  {/* Status Badges */}
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5">
                    {isMyLover && (
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" title="Người yêu của bạn" />
                    )}
                    {isProtected && (
                      <Shield className="w-3.5 h-3.5 text-emerald-400" title="Bạn đã bảo vệ" />
                    )}
                  </div>

                  {/* Voice Status Badge */}
                  {inVoice && (
                    <div
                      className="absolute top-1.5 left-1.5 flex items-center"
                      title={isMuted ? 'Đang tắt mic' : isSpeaking ? 'Đang nói' : 'Đang trong voice'}
                    >
                      {isMuted ? (
                        <span className="text-[10px] bg-red-950 text-red-300 px-1 py-0.2 rounded border border-red-800 leading-none">
                          🔇
                        </span>
                      ) : isSpeaking ? (
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1 py-0.2 rounded border border-emerald-800 leading-none">
                          🎙️
                        </span>
                      )}
                    </div>
                  )}

                  <div className="relative text-2xl md:text-3xl my-0.5">
                    {p.avatar}
                    {!p.isAlive && (
                      <span className="absolute -bottom-1 -right-1 text-xs bg-black/90 rounded-full p-0.5">
                        💀
                      </span>
                    )}
                  </div>

                  <span className="font-bold text-white text-xs truncate max-w-full">
                    {p.name}
                  </span>

                  {/* Hiển thị vai trò nếu đã chết, được reveal, hoặc bản thân là Quản Trò */}
                  {p.role === 'moderator' ? (
                    <span className="text-[10px] font-bold text-amber-400 mt-0.5 truncate flex items-center justify-center gap-0.5">
                      👑 Quản Trò
                    </span>
                  ) : p.role ? (
                    <span
                      className="text-[10px] font-semibold mt-0.5 truncate"
                      style={{ color: p.roleDetails?.color || '#38bdf8' }}
                    >
                      {p.roleDetails?.name || p.role}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {p.isAlive ? 'Bí ẩn' : 'Đã chết'}
                    </span>
                  )}

                  {/* Quick God Actions dành cho Quản Trò trên từng ô người chơi */}
                  {isModeratorUser && p.role !== 'moderator' && (
                    <div className="flex items-center gap-1 mt-1">
                      {p.isAlive ? (
                        <button
                          type="button"
                          onClick={() => onModeratorAction && onModeratorAction('kill', { targetId: p.id })}
                          className="px-1.5 py-0.5 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-[9px] font-bold cursor-pointer transition"
                          title="Xử tử người này"
                        >
                          Xử tử 💀
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onModeratorAction && onModeratorAction('revive', { targetId: p.id })}
                          className="px-1.5 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[9px] font-bold cursor-pointer transition"
                          title="Hồi sinh người này"
                        >
                          Hồi sinh ✨
                        </button>
                      )}
                    </div>
                  )}

                  {/* Hiển thị vote nếu có */}
                  {hasVote && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-red-950 text-red-300 border border-red-800 mt-1 font-mono">
                      Đã Vote
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Hành Động Ban Đêm (Chỉ hiện cho người chơi thường) */}
        {isNight && myRole !== 'moderator' && (
          <NightActionPanel
            myRole={myRole}
            isAlive={isAlive}
            players={players}
            myId={myId}
            nightNumber={nightNumber}
            onNightAction={onNightAction}
            seerResult={seerResult}
            witchVictim={witchVictim}
            activeNightRole={gameState?.activeNightRole}
            activeNightStep={gameState?.activeNightStep}
            activeNightTitle={gameState?.activeNightTitle}
            activeNightPrompt={gameState?.activeNightPrompt}
          />
        )}

        {/* Panel Bỏ Phiếu & Thảo Luận Ban Ngày */}
        {(phase === 'DAY_DISCUSSION' || phase === 'DAY_VOTING') && myRole !== 'moderator' && (
          <VotingPanel
            phase={phase}
            players={players}
            myId={myId}
            isAlive={isAlive}
            dayVotes={dayVotes}
            discussionSkips={discussionSkips}
            onDayVote={onDayVote}
            onSkipDiscussion={onSkipDiscussion}
          />
        )}

        {/* Khu vực Giao Tiếp & Nhật Ký (Tabbed View for Mobile & Compact Desktop) */}
        <div className="space-y-2 pb-24">
          <div className="flex bg-slate-950/70 p-1 rounded-2xl border border-slate-800 max-w-xs">
            <button
              onClick={() => setActiveBottomTab('chat')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeBottomTab === 'chat'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hộp Chat</span>
            </button>
            <button
              onClick={() => setActiveBottomTab('logs')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeBottomTab === 'logs'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5 text-amber-400" />
              <span>Nhật Ký ({logs.length})</span>
            </button>
          </div>

          {activeBottomTab === 'chat' ? (
            <ChatBox
              messages={chatMessages}
              onSendMessage={onSendMessage}
              myRole={myRole}
              isAlive={isAlive}
              phase={phase}
            />
          ) : (
            <GameLogs logs={logs} />
          )}
        </div>
      </div>

      {/* Hunter Revenge Modal */}
      {isHunterTurn && (
        <HunterActionModal
          hunterPendingName={hunterPending}
          isMyHunterTurn={isMyHunterTurn}
          players={players}
          myId={myId}
          onHunterShot={onHunterShot}
          timer={timer}
        />
      )}

      {/* Game Over Modal */}
      {phase === 'GAME_OVER' && (
        <GameOverModal
          winner={winner}
          winReason={winReason}
          players={players}
          isHost={isHost}
          onRestartGame={onRestartGame}
        />
      )}

      {/* Thanh Vai Trò Ở Đáy Màn Hình */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <RoleDrawer
          myRole={myRole}
          myRoleDetails={myRoleDetails}
          isAlive={isAlive}
          loverPartner={loverPartner}
        />
      </div>
    </div>
  );
}

