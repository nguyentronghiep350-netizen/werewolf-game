import React, { useEffect, useState } from 'react';
import { Moon, Sun, Clock, Skull, Heart, Shield, Flame, Eye, Gavel, MessageSquare, ScrollText, Volume2, VolumeX, Pause, Play, ChevronRight, ToggleLeft, ToggleRight, Sparkles, Crown, Check, Ban, FastForward } from 'lucide-react';
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
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [selectedTarget2Id, setSelectedTarget2Id] = useState('');
  const [submittedNightAction, setSubmittedNightAction] = useState(false);

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
    godNightActions,
    nightActionsDone,
    activeNightRole,
    activeNightTitle,
    activeNightPrompt,
  } = gameState || {};

  const me = players.find((p) => p.id === myId);
  const isAlive = me?.isAlive ?? true;
  const isNight = phase?.startsWith('NIGHT');
  const isHunterTurn = phase === 'HUNTER_ACTION';
  const isMyHunterTurn = isHunterTurn && hunterPending === me?.name;
  const isHumanMod = myRole === 'moderator' || (isHost && isGodModerator);

  const isWolf = ['werewolf', 'alpha_wolf', 'white_wolf', 'wolf_pup'].includes(myRole);

  // Xác định lượt ban đêm của bản thân
  const isWolfTurn = isWolf && (activeNightRole === 'werewolf' || !activeNightRole);
  const isWhiteWolfTurn = myRole === 'white_wolf' && (activeNightRole === 'white_wolf' || !activeNightRole);
  const isSeerTurn = myRole === 'seer' && (activeNightRole === 'seer' || !activeNightRole);
  const isGuardTurn = myRole === 'bodyguard' && (activeNightRole === 'bodyguard' || !activeNightRole);
  const isWitchTurn = myRole === 'witch' && (activeNightRole === 'witch' || !activeNightRole);
  const isCupidTurn = myRole === 'cupid' && (activeNightRole === 'cupid' || !activeNightRole);
  const isMyNightTurn = isAlive && isNight && phase === 'NIGHT_ACTION' && (isWolfTurn || isWhiteWolfTurn || isSeerTurn || isGuardTurn || isWitchTurn || isCupidTurn);

  // Reset target khi chuyển phase
  useEffect(() => {
    setSelectedTargetId('');
    setSelectedTarget2Id('');
    setSubmittedNightAction(false);
  }, [phase, activeNightRole]);

  // Âm thanh khi chuyển phase
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

  const [adminSelectedPlayer, setAdminSelectedPlayer] = useState(null);

  // Đếm số người sống
  const alivePlayers = players.filter((p) => p.isAlive && p.role !== 'moderator');
  const aliveCount = alivePlayers.length;
  const skipNeeded = Math.ceil(aliveCount / 2);
  const hasVotedSkip = discussionSkips.includes(myId);

  // Xử lý khi click vào 1 người chơi trên bàn cờ
  const handlePlayerClick = (p) => {
    // Nếu là Quản Trò, click để mở menu xem lá bài & xử lý nhanh
    if (isHumanMod) {
      if (p.role === 'moderator') return;
      soundFx.playClick();
      setAdminSelectedPlayer(p);
      return;
    }

    if (!p.isAlive || p.role === 'moderator') return;

    // Trong ban đêm
    if (isMyNightTurn && !submittedNightAction) {
      soundFx.playClick();
      if (isCupidTurn) {
        if (!selectedTargetId) {
          setSelectedTargetId(p.id);
        } else if (selectedTargetId === p.id) {
          setSelectedTargetId('');
        } else if (!selectedTarget2Id) {
          setSelectedTarget2Id(p.id);
        } else if (selectedTarget2Id === p.id) {
          setSelectedTarget2Id('');
        } else {
          setSelectedTargetId(p.id);
        }
      } else {
        setSelectedTargetId((prev) => (prev === p.id ? '' : p.id));
      }
      return;
    }

    // Trong pha bỏ phiếu ban ngày
    if (phase === 'DAY_VOTING' && isAlive && myRole !== 'moderator' && p.id !== myId) {
      soundFx.playClick();
      setSelectedTargetId(p.id);
      onDayVote(p.id);
    }
  };

  // Xác nhận hành động ban đêm 1-chạm
  const handleConfirmNightAction = () => {
    if (!selectedTargetId) return;
    soundFx.playClick();

    if (isWolfTurn) {
      onNightAction({ action: 'werewolf_vote', targetId: selectedTargetId });
    } else if (isWhiteWolfTurn) {
      onNightAction({ action: 'white_wolf_kill', targetId: selectedTargetId });
    } else if (isSeerTurn) {
      onNightAction({ action: 'seer_inspect', targetId: selectedTargetId });
    } else if (isGuardTurn) {
      onNightAction({ action: 'guard_protect', targetId: selectedTargetId });
    } else if (isCupidTurn && selectedTarget2Id) {
      onNightAction({ action: 'cupid_pair', target1Id: selectedTargetId, target2Id: selectedTarget2Id });
    }

    setSubmittedNightAction(true);
  };

  // Tính số phiếu vote cho từng người
  const voteCounts = {};
  let skipVoteCount = 0;
  Object.values(dayVotes).forEach((targetId) => {
    if (targetId === 'skip') {
      skipVoteCount++;
    } else {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }
  });

  const selectedTargetPlayer = players.find((p) => p.id === selectedTargetId);
  const selectedTarget2Player = players.find((p) => p.id === selectedTarget2Id);

  // Lời chỉ dẫn nhiệm vụ to rõ (Mission Directive)
  const getMissionDirective = () => {
    if (isHunterTurn) {
      return isMyHunterTurn
        ? { text: '🎯 BẠN ĐÃ BỊ LOẠI! Hãy bấm chọn 1 người để bắn phát đạn báo thù cuối cùng!', urgent: true }
        : { text: '🔫 Thợ săn đang giương súng chuẩn bị kéo theo kẻ tử thù...', urgent: false };
    }

    if (phase === 'NIGHT_START') {
      return { text: '🌙 Màn đêm buông xuống... Cả làng nhắm mắt đi ngủ!', urgent: false };
    }

    if (phase === 'NIGHT_ACTION') {
      if (isMyNightTurn) {
        if (isWolfTurn) return { text: '🐺 BẦY SÓI: Chạm vào 1 người trên bàn tròn rồi bấm Xác Nhận Cắn!', urgent: true };
        if (isSeerTurn) return { text: '🔮 TIÊN TRI: Chạm vào 1 người trên bàn tròn để khai mở thân phận!', urgent: true };
        if (isGuardTurn) return { text: '🛡️ BẢO VỆ: Chạm vào 1 người trên bàn tròn để che chở đêm nay!', urgent: true };
        if (isWitchTurn) return { text: '🧪 PHÙ THỦY: Xem nạn nhân bị cắn và chọn bình thuốc bên dưới!', urgent: true };
        if (isCupidTurn) return { text: '💘 CUPID: Chạm vào 2 người trên bàn tròn để se duyên định mệnh!', urgent: true };
        if (isWhiteWolfTurn) return { text: '🐺 SÓI TRẮNG: Bạn có muốn cắn thêm 1 người không?', urgent: true };
      }
      return { text: `💤 Cả làng đang chìm trong giấc ngủ say... (Đang gọi: ${activeNightTitle || 'Ẩn danh'})`, urgent: false };
    }

    if (phase === 'MORNING') {
      return { text: '🌅 Trời đã sáng! Quản trò đang công bố tin dữ đêm qua...', urgent: false };
    }

    if (phase === 'DAY_DISCUSSION') {
      return { text: '☀️ THẢO LUẬN: Tranh luận tìm kẻ tình nghi, hoặc bấm Bỏ qua để Vote ngay!', urgent: false };
    }

    if (phase === 'DAY_VOTING') {
      return isAlive
        ? { text: '🗳️ BỎ PHIẾU TREO CỔ: Chạm vào người bạn nghi ngờ nhất trên bàn tròn!', urgent: true }
        : { text: '👻 Bạn đã chết nên không thể tham gia bỏ phiếu.', urgent: false };
    }

    if (phase === 'DAY_EXECUTION') {
      return { text: '⚖️ Phán quyết của dân làng đang được thực thi trên giàn treo cổ!', urgent: false };
    }

    return { text: 'Ma Sói Online - Cuộc chiến giữa Ánh Sáng và Bóng Tối', urgent: false };
  };

  const directive = getMissionDirective();

  return (
    <div className={`min-h-[calc(100vh-65px)] flex flex-col justify-between transition-colors duration-700 ${
      isNight ? 'bg-[#060813]' : 'bg-[#0a0e1a]'
    }`}>
      <div className="max-w-6xl w-full mx-auto p-3 md:p-4 space-y-3">
        {/* ========================================================================= */}
        {/* TOP STATUS HUD: PHASE + TIMER + MISSION DIRECTIVE */}
        {/* ========================================================================= */}
        <div className={`p-3.5 md:p-4 rounded-3xl border backdrop-blur-xl shadow-xl transition-all ${
          isNight ? 'bg-slate-900/90 border-indigo-900/70 shadow-indigo-950/40' : 'bg-slate-900/90 border-amber-900/50 shadow-amber-950/30'
        }`}>
          <div className="flex items-center justify-between gap-3">
            {/* Phase Badge & Title */}
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-2xl ${isNight ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                {isNight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-wider uppercase text-slate-300">
                    {isNight ? `ĐÊM THỨ ${nightNumber}` : `NGÀY THỨ ${dayNumber || 1}`}
                  </span>
                  {!isAlive && myRole !== 'moderator' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                      Hồn Ma 👻
                    </span>
                  )}
                  {isTimerPaused && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black uppercase tracking-wider animate-pulse">
                      TẠM DỪNG
                    </span>
                  )}
                </div>
                <h2 className="text-sm md:text-base font-black text-white">
                  {phase === 'DAY_DISCUSSION' ? 'THẢO LUẬN TÌM MA SÓI' :
                   phase === 'DAY_VOTING' ? 'BỎ PHIẾU TREO CỔ' :
                   phase === 'MORNING' ? 'KẾT QUẢ ĐÊM QUA' :
                   activeNightTitle ? activeNightTitle.toUpperCase() : 'MÀN ĐÊM BUÔNG XUỐNG'}
                </h2>
              </div>
            </div>

            {/* Big Timer */}
            {timer > 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border font-mono font-black text-lg md:text-xl shadow-inner ${
                timer <= 5 ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse' :
                isTimerPaused ? 'bg-amber-950 border-amber-500 text-amber-300' :
                'bg-slate-950/90 border-slate-800 text-white'
              }`}>
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{timer}s</span>
              </div>
            )}
          </div>

          {/* MISSION DIRECTIVE CALLOUT (HƯỚNG DẪN 1-DÒNG RÕ RÀNG NHƯ GAMESHOW) */}
          <div className={`mt-2.5 p-2.5 rounded-2xl border flex items-center justify-between gap-2 text-xs md:text-sm font-bold transition-all ${
            directive.urgent
              ? 'bg-gradient-to-r from-red-950/90 via-rose-950/80 to-amber-950/90 border-rose-500/80 text-white shadow-lg shadow-rose-950/50 animate-pulse'
              : 'bg-black/40 border-slate-800 text-slate-300'
          }`}>
            <span className="truncate">{directive.text}</span>
            {hasVotedSkip && phase === 'DAY_DISCUSSION' && (
              <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded-lg shrink-0">
                Đã Vote Skip ✅
              </span>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* THÔNG BÁO RẠNG SÁNG (MORNING DEATH ANNOUNCEMENT) */}
        {/* ========================================================================= */}
        {phase === 'MORNING' && (
          <div className="p-3.5 rounded-3xl bg-slate-900/90 border border-amber-800/60 shadow-xl text-center animate-fadeIn">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Kết Quả Đêm Thứ {nightNumber}
            </h3>
            {nightDeaths.length === 0 ? (
              <p className="text-xs text-emerald-400 mt-1 font-medium">
                Một đêm yên bình! Không có ai bị sát hại đêm qua.
              </p>
            ) : (
              <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
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
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* BÀN TRÒN DÂN LÀNG - ĐẤU TRƯỜNG TƯƠNG TÁC 1-CHẠM (CLICK-ON-BOARD) */}
        {/* ========================================================================= */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-3 md:p-4 backdrop-blur-xl shadow-xl space-y-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">
              BÀN TRÒN DÂN LÀNG ({aliveCount}/{players.filter(p => p.role !== 'moderator').length} CÒN SỐNG)
            </span>
            <span className="text-[11px] text-slate-400">
              Chạm trực tiếp vào Avatar để tương tác
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {players.map((p) => {
              const isMe = p.id === myId;
              const isSelected = selectedTargetId === p.id || selectedTarget2Id === p.id;
              const isCupid1 = selectedTargetId === p.id && isCupidTurn;
              const isCupid2 = selectedTarget2Id === p.id && isCupidTurn;
              const votesForP = voteCounts[p.id] || 0;
              const hasVotedForThis = dayVotes[myId] === p.id;

              const isWolfTarget = isGodModerator && isNight && godNightActions?.werewolfTargetId === p.id;
              const isGuardTarget = isGodModerator && isNight && godNightActions?.bodyguardTargetId === p.id;

              const voice = voiceStates[p.id];
              const isSpeaking = voice?.isSpeaking;
              const isModeratorPlayer = p.role === 'moderator';

              // Cho phép click nếu còn sống, không phải Quản trò và đang trong lượt chọn
              const canClick = p.isAlive && !isModeratorPlayer && myRole !== 'moderator' && (isMyNightTurn || (phase === 'DAY_VOTING' && isAlive && !isMe));

              return (
                <button
                  type="button"
                  key={p.id}
                  disabled={!canClick && !isMe}
                  onClick={() => handlePlayerClick(p)}
                  className={`p-2.5 rounded-2xl border transition-all duration-200 relative flex flex-col items-center text-center select-none ${
                    isModeratorPlayer
                      ? 'bg-gradient-to-b from-amber-950/60 to-slate-900 border-amber-500/80 shadow-lg shadow-amber-950/50 cursor-default ring-1 ring-amber-400/40'
                      : isSelected
                      ? 'ring-4 ring-amber-400 bg-amber-950/60 border-amber-300 shadow-xl shadow-amber-950/80 scale-105 z-10'
                      : isSpeaking
                      ? 'ring-2 ring-emerald-400 bg-emerald-950/40 border-emerald-500 shadow-md'
                      : isWolfTarget
                      ? 'ring-2 ring-rose-500 bg-rose-950/60 border-rose-500'
                      : !p.isAlive
                      ? 'bg-slate-950/40 border-slate-800 opacity-40 grayscale cursor-not-allowed'
                      : canClick
                      ? 'bg-slate-800/80 border-slate-700 hover:border-amber-400 hover:bg-slate-800 hover:scale-102 cursor-pointer shadow-sm'
                      : isMe
                      ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-950/50'
                      : 'bg-slate-800/40 border-slate-700/60'
                  }`}
                >
                  {/* Badges Status */}
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5">
                    {p.isLover && <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />}
                    {isGodModerator && isGuardTarget && <Shield className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>

                  {/* Mic Status */}
                  {voice?.inVoice && (
                    <div className="absolute top-1.5 left-1.5 text-[10px]">
                      {voice.isMuted ? '🔇' : isSpeaking ? '🟢' : '🎙️'}
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="relative text-3xl md:text-4xl my-1">
                    {p.avatar}
                    {!p.isAlive && (
                      <span className="absolute -bottom-1 -right-1 text-sm bg-black/90 rounded-full p-0.5">
                        💀
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <span className="font-bold text-white text-xs truncate max-w-full">
                    {p.name} {isMe ? '(Bạn)' : ''}
                  </span>

                  {/* Role text if revealed */}
                  {isModeratorPlayer ? (
                    <span className="text-[10px] font-black text-amber-400 mt-0.5 flex items-center gap-0.5">
                      <Crown className="w-3 h-3 text-amber-400 inline" /> Quản Trò
                    </span>
                  ) : p.role ? (
                    <span className="text-[10px] font-semibold mt-0.5 truncate" style={{ color: p.roleDetails?.color || '#38bdf8' }}>
                      {p.roleDetails?.name || p.role}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {p.isAlive ? 'Bí ẩn' : 'Đã chết'}
                    </span>
                  )}

                  {/* Live Vote Count Badges */}
                  {phase === 'DAY_VOTING' && votesForP > 0 && (
                    <span className="mt-1 px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono font-bold text-[10px] animate-pulse">
                      🗳️ {votesForP} phiếu
                    </span>
                  )}

                  {/* Selected Indicator Label */}
                  {isSelected && (
                    <span className="mt-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                      {isCupid1 ? 'Người Yêu 1' : isCupid2 ? 'Người Yêu 2' : 'ĐÃ CHỌN'}
                    </span>
                  )}

                  {hasVotedForThis && (
                    <span className="mt-0.5 text-[9px] text-emerald-400 font-bold">
                      Phiếu của bạn ✅
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACTION DOCK 1-CHẠM: XÁC NHẬN HÀNH ĐỘNG BAN ĐÊM (CONFIRM BAR) */}
        {/* ========================================================================= */}
        {isMyNightTurn && (
          <div className="p-3 bg-gradient-to-r from-red-950/80 via-slate-900 to-indigo-950/80 border-2 border-amber-500/70 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <div>
                <span className="text-[11px] text-slate-400 block">Mục tiêu đã chọn:</span>
                <span className="text-sm font-black text-white">
                  {isCupidTurn ? (
                    selectedTargetPlayer && selectedTarget2Player ? `${selectedTargetPlayer.name} 💘 ${selectedTarget2Player.name}` : 'Chạm 2 người trên bàn'
                  ) : (
                    selectedTargetPlayer ? `${selectedTargetPlayer.avatar} ${selectedTargetPlayer.name}` : 'Chưa chọn (Chạm 1 người trên bàn)'
                  )}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmNightAction}
              disabled={isCupidTurn ? (!selectedTargetId || !selectedTarget2Id || submittedNightAction) : (!selectedTargetId || submittedNightAction)}
              className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg disabled:opacity-40 cursor-pointer transition transform active:scale-95"
            >
              {submittedNightAction ? '✓ Đã Xác Nhận' : 'XÁC NHẬN HÀNH ĐỘNG'}
            </button>
          </div>
        )}

        {/* Kết quả Tiên Tri soi */}
        {seerResult && isNight && myRole === 'seer' && (
          <div className="p-3.5 bg-purple-950/80 border border-purple-500 rounded-2xl text-center space-y-1 shadow-lg animate-fadeIn">
            <span className="text-2xl">🔮</span>
            <h4 className="text-xs font-bold text-purple-300 uppercase">KẾT QUẢ SOI THÂN PHẬN:</h4>
            <p className="text-sm font-black text-white">
              {seerResult.targetName} thuộc: <span className={seerResult.isWerewolf ? 'text-red-400' : 'text-emerald-400'}>{seerResult.roleName} ({seerResult.team === 'werewolf' ? 'PHE SÓI 🐺' : 'PHE DÂN 🧑‍🌾'})</span>
            </p>
          </div>
        )}

        {/* Panel Hành Động Phụ (Ví dụ Phù Thủy chọn bình thuốc) */}
        {isNight && myRole === 'witch' && isMyNightTurn && (
          <NightActionPanel
            myRole={myRole}
            isAlive={isAlive}
            players={players}
            myId={myId}
            nightNumber={nightNumber}
            onNightAction={onNightAction}
            witchVictim={witchVictim}
            activeNightRole={activeNightRole}
            activeNightTitle={activeNightTitle}
            activeNightPrompt={activeNightPrompt}
          />
        )}

        {/* ========================================================================= */}
        {/* ACTION DOCK BAN NGÀY: THẢO LUẬN & BỎ PHIẾU */}
        {/* ========================================================================= */}
        {phase === 'DAY_DISCUSSION' && isAlive && (
          <div className="p-3 bg-slate-900/90 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span>🗣️ Thảo luận cùng làng</span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">• Bấm Bỏ qua nếu đã rõ mục tiêu</span>
            </div>
            <button
              type="button"
              onClick={() => onSkipDiscussion()}
              disabled={hasVotedSkip}
              className={`py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow ${
                hasVotedSkip ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black hover:scale-102'
              }`}
            >
              <FastForward className="w-4 h-4" />
              <span>{hasVotedSkip ? `Đã Đồng Ý (${discussionSkips.length}/${skipNeeded})` : `Bỏ Qua Thảo Luận (${discussionSkips.length}/${skipNeeded})`}</span>
            </button>
          </div>
        )}

        {phase === 'DAY_VOTING' && isAlive && (
          <div className="p-3 bg-slate-900/90 border border-rose-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg">
            <div className="text-xs text-slate-300">
              <span>Chạm 1 người trên bàn tròn để vote. Hoặc:</span>
            </div>
            <button
              type="button"
              onClick={() => onDayVote('skip')}
              className={`py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                dayVotes[myId] === 'skip' ? 'bg-amber-600 text-slate-950 font-black' : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Ban className="w-4 h-4" />
              <span>Bỏ Phiếu Trắng ({skipVoteCount} phiếu)</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* KHU VỰC GIAO TIẾP (CHAT BOX & GAME LOGS) */}
        {/* ========================================================================= */}
        <div className="space-y-2 pb-24">
          <div className="flex bg-slate-950/70 p-1 rounded-2xl border border-slate-800 max-w-xs">
            <button
              type="button"
              onClick={() => setActiveBottomTab('chat')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeBottomTab === 'chat' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hộp Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveBottomTab('logs')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeBottomTab === 'logs' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
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

      {/* Hunter Shot Modal */}
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

      {/* Admin Quick Action Modal Khi Quản Trò Click Vào Người Chơi Trên Bàn */}
      {adminSelectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setAdminSelectedPlayer(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <span className="text-4xl p-2 rounded-2xl bg-slate-800 border border-slate-700">{adminSelectedPlayer.avatar}</span>
              <div className="min-w-0">
                <h4 className="text-base font-black text-white truncate">{adminSelectedPlayer.name}</h4>
                <div className="text-xs font-bold" style={{ color: adminSelectedPlayer.roleDetails?.color || '#38bdf8' }}>
                  {adminSelectedPlayer.roleDetails?.name || adminSelectedPlayer.role || 'Chưa rõ vai trò'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Trạng thái: {adminSelectedPlayer.isAlive ? <span className="text-emerald-400 font-bold">🟢 Còn sống</span> : <span className="text-rose-400 font-bold">💀 Đã chết</span>}
                </div>
              </div>
            </div>

            {/* Thao Tác Can Thiệp Quản Trò */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              {adminSelectedPlayer.isAlive ? (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onModeratorAction && onModeratorAction('kill', { targetId: adminSelectedPlayer.id });
                    setAdminSelectedPlayer(null);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/60 cursor-pointer col-span-2"
                >
                  <Skull className="w-4 h-4" />
                  <span>Xử Tử Ngay (Kill)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onModeratorAction && onModeratorAction('revive', { targetId: adminSelectedPlayer.id });
                    setAdminSelectedPlayer(null);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/60 cursor-pointer col-span-2"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Hồi Sinh (Revive)</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setAdminSelectedPlayer(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Thanh Vai Trò Ở Đáy Màn Hình (Chỉ hiện cho người chơi, ẩn với Quản trò) */}
      {myRole !== 'moderator' && (
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <RoleDrawer
            myRole={myRole}
            myRoleDetails={myRoleDetails}
            isAlive={isAlive}
            loverPartner={loverPartner}
          />
        </div>
      )}
    </div>
  );
}
