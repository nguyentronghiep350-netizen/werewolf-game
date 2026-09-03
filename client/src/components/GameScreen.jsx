import React, { useEffect, useState } from 'react';
import { Moon, Sun, Clock, Skull, Heart, Shield, Flame, Eye, Gavel } from 'lucide-react';
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
}) {
  const {
    phase,
    nightNumber,
    dayNumber,
    timer,
    winner,
    winReason,
    logs = [],
    players = [],
    nightDeaths = [],
    hunterPending,
    dayVotes = {},
    discussionSkips = [],
  } = gameState || {};

  const me = players.find((p) => p.id === myId);
  const isAlive = me?.isAlive ?? true;
  const isNight = phase?.startsWith('NIGHT');
  const isHunterTurn = phase === 'HUNTER_ACTION';
  const isMyHunterTurn = isHunterTurn && hunterPending === me?.name;

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

  // Thông tin tiêu đề phase
  const getPhaseInfo = () => {
    switch (phase) {
      case 'STARTING':
        return { title: 'CHUẨN BỊ BẮT ĐẦU', icon: Clock, color: 'text-amber-400' };
      case 'NIGHT_START':
      case 'NIGHT_ACTION':
        return {
          title: `ĐÊM THỨ ${nightNumber}`,
          icon: Moon,
          color: 'text-indigo-400',
          desc: 'Ngôi làng chìm vào bóng tối. Các thế lực ngầm bắt đầu hành động.',
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

  return (
    <div className={`min-h-[calc(100vh-65px)] flex flex-col justify-between transition-colors duration-1000 ${
      isNight ? 'bg-[#060813]' : 'bg-[#0b0f19]'
    }`}>
      {/* Top Banner Thanh Trạng Thái */}
      <div className="max-w-6xl w-full mx-auto p-4 space-y-4">
        <div className={`p-4 rounded-3xl border backdrop-blur-xl shadow-xl flex items-center justify-between transition-all ${
          isNight
            ? 'bg-slate-900/80 border-indigo-950/80 moon-glow'
            : 'bg-slate-900/80 border-amber-950/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              isNight ? 'bg-indigo-950/80 text-indigo-400' : 'bg-amber-950/80 text-amber-400'
            }`}>
              <PhaseIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base md:text-lg font-black tracking-wider ${phaseInfo.color}`}>
                  {phaseInfo.title}
                </h2>
                {!isAlive && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-semibold">
                    Đã Chết 👻
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">{phaseInfo.desc}</p>
            </div>
          </div>

          {timer > 0 && (
            <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xl md:text-2xl font-black font-mono text-white">
                {timer}s
              </span>
            </div>
          )}
        </div>

        {/* Thông báo kết quả sáng (Morning Death announcement) */}
        {phase === 'MORNING' && (
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-amber-800/60 shadow-xl text-center animate-fadeIn">
            <div className="text-2xl mb-1">🌅</div>
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
              Kết Quả Đêm Thứ {nightNumber}
            </h3>
            {nightDeaths.length === 0 ? (
              <p className="text-xs text-emerald-400 mt-1 font-medium">
                Một đêm yên bình lạ kỳ trôi qua. Không có bất kỳ ai phải bỏ mạng!
              </p>
            ) : (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-rose-400 font-bold">
                  Bóng đêm đã cướp đi sinh mạng của:
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  {nightDeaths.map((d) => (
                    <span
                      key={d.id}
                      className="px-3 py-1 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Skull className="w-3.5 h-3.5" />
                      {d.name} ({d.roleName}) - {d.reason}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bàn Chơi Danh Sách Người Chơi */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 md:p-5 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              BÀN TRÒN DÂN LÀNG ({players.filter((p) => p.isAlive).length}/{players.length} CÒN SỐNG)
            </h3>
            <span className="text-xs text-slate-500">
              {players.filter((p) => !p.isAlive).length} Đã chết
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
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
                  className={`p-2.5 rounded-2xl border transition-all duration-200 relative flex flex-col items-center text-center ${
                    isSpeaking
                      ? 'ring-2 ring-emerald-400 bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/60 scale-102'
                      : !p.isAlive
                      ? 'bg-slate-950/70 border-slate-800 opacity-60'
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
                        <span className="text-[10px] bg-red-950/90 text-red-300 px-1 py-0.2 rounded border border-red-800 leading-none">
                          🔇
                        </span>
                      ) : isSpeaking ? (
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-950/90 text-emerald-300 px-1 py-0.2 rounded border border-emerald-800 leading-none">
                          🎙️
                        </span>
                      )}
                    </div>
                  )}

                  <div className="relative text-3xl mb-1">
                    {p.avatar}
                    {!p.isAlive && (
                      <span className="absolute -bottom-1 -right-1 text-sm bg-black/80 rounded-full p-0.5">
                        💀
                      </span>
                    )}
                  </div>

                  <span className="font-bold text-white text-xs truncate max-w-full">
                    {p.name}
                  </span>

                  {/* Hiển thị vai trò nếu đã chết hoặc được reveal */}
                  {p.role ? (
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

        {/* Panel Hành Động Ban Đêm */}
        {isNight && (
          <NightActionPanel
            myRole={myRole}
            isAlive={isAlive}
            players={players}
            myId={myId}
            nightNumber={nightNumber}
            onNightAction={onNightAction}
            seerResult={seerResult}
            witchVictim={witchVictim}
          />
        )}

        {/* Panel Bỏ Phiếu & Thảo Luận Ban Ngày */}
        {(phase === 'DAY_DISCUSSION' || phase === 'DAY_VOTING') && (
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

        {/* Lưới Hộp Chat & Nhật Ký Làng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
          <ChatBox
            messages={chatMessages}
            onSendMessage={onSendMessage}
            myRole={myRole}
            isAlive={isAlive}
            phase={phase}
          />
          <GameLogs logs={logs} />
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
