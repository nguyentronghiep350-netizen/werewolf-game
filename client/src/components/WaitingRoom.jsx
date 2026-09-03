import React, { useState } from 'react';
import { Users, Bot, Crown, Check, Play, UserPlus, Trash2, Settings, Sliders, Shield, Flame, Eye, FlaskConical, Crosshair, Heart, Laugh, Layers, Copy, QrCode, X, Share2, Radio, Volume2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { soundFx } from '../utils/audio';
import { ROLE_ICONS } from './RoleGuideModal';
import CustomDeckModal from './CustomDeckModal';
import ChatBox from './ChatBox';

export default function WaitingRoom({
  roomCode,
  players = [],
  myId,
  isHost,
  config = {},
  onToggleReady,
  onAddBot,
  onRemoveBot,
  onUpdateConfig,
  onStartGame,
  onModeratorAction,
  voiceStates = {},
  chatMessages = [],
  onSendMessage,
  inVoice = false,
  onJoinVoice,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomDeckModal, setShowCustomDeckModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [startError, setStartError] = useState('');

  const me = players.find((p) => p.id === myId);
  const isReady = me?.isReady || false;
  const canStart = players.length >= 4 && players.every((p) => p.isHost || p.isReady);

  const handleStart = () => {
    soundFx.playClick();
    if (players.length < 4) {
      setStartError('Cần ít nhất 4 người chơi để bắt đầu! Bạn có thể bấm "+ Thêm Bot AI" để thêm bot chơi thử.');
      return;
    }
    const notReady = players.filter((p) => !p.isHost && !p.isReady);
    if (notReady.length > 0) {
      setStartError(`Còn ${notReady.length} người chưa bấm Sẵn Sàng!`);
      return;
    }

    setStartError('');
    onStartGame((res) => {
      if (res && !res.success) {
        setStartError(res.message);
      }
    });
  };

  const handleRoleCountChange = (roleId, delta) => {
    soundFx.playClick();
    const currentRoles = { ...config.roleConfig };
    const currentVal = currentRoles[roleId] || 0;
    const newVal = Math.max(0, currentVal + delta);
    currentRoles[roleId] = newVal;
    onUpdateConfig({ roleConfig: currentRoles });
  };

  const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/?room=${roomCode}` : '';

  const handleCopyLink = () => {
    soundFx.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mã phòng</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono">
              Đang Chờ
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 mt-1">
            <span className="text-3xl font-black text-amber-400 font-mono tracking-widest">
              {roomCode}
            </span>

            <button
              type="button"
              onClick={handleCopyLink}
              title="Sao chép link mời phòng này"
              className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{copied ? 'Đã sao chép!' : 'Chép link mời'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowQrModal(true);
              }}
              title="Mở mã QR quét bằng điện thoại"
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Mã QR</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            Quét mã QR hoặc gửi link cho bạn bè để vào phòng tức thì mà không cần gõ mã!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isHost && (
            <>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onAddBot();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 border border-slate-700 font-medium text-sm flex items-center gap-2 cursor-pointer transition shadow"
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>+ Thêm Bot AI</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowSettings(!showSettings);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-medium text-sm flex items-center gap-2 cursor-pointer transition shadow"
              >
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Cài Đặt Vai Trò</span>
              </button>
            </>
          )}

          {!isHost ? (
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleReady();
              }}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer flex items-center gap-2 shadow-lg ${
                isReady
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40'
              }`}
            >
              <Check className="w-4 h-4" />
              {isReady ? 'Đã Sẵn Sàng' : 'Bấm Sẵn Sàng'}
            </button>
          ) : (
            <button
              onClick={handleStart}
              className={`px-7 py-3 rounded-xl font-bold text-base transition cursor-pointer flex items-center gap-2 shadow-xl active:scale-95 ${
                canStart
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950/60 wolf-glow'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              BẮT ĐẦU GAME
            </button>
          )}
        </div>
      </div>

      {/* Chế độ chơi (Game Modes) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              CHẾ ĐỘ CHƠI: <span className="text-amber-400 font-bold">
                {config.mode === 'blood_moon'
                  ? 'Đêm Trăng Máu (Hardcore)'
                  : config.mode === 'lovers_chaos'
                  ? 'Tình Yêu & Hỗn Loạn (Drama)'
                  : config.mode === 'blitz'
                  ? 'Thần Tốc (Siêu Nhanh)'
                  : config.mode === 'custom_deck'
                  ? 'Tùy Biến Thẻ & Quản Trò (Custom Deck)'
                  : config.mode === 'custom'
                  ? 'Tùy Biến (Custom)'
                  : 'Cổ Điển (Tiêu Chuẩn)'}
              </span>
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            {isHost ? 'Chủ phòng có thể bấm để đổi chế độ' : 'Do Chủ phòng thiết lập'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {[
            { id: 'classic', name: 'Cổ Điển', badge: 'Standard', desc: 'Cân bằng, chuẩn mực', icon: '🌕' },
            { id: 'blood_moon', name: 'Trăng Máu', badge: 'Hardcore', desc: 'Nhiều Sói, cắn dồn dập', icon: '🩸' },
            { id: 'lovers_chaos', name: 'Tình Yêu', badge: 'Drama', desc: 'Cupid & Jester lật kèo', icon: '💘' },
            { id: 'blitz', name: 'Thần Tốc', badge: '15s/20s', desc: 'Chớp nhoáng, siêu nhanh', icon: '⚡' },
            { id: 'custom_deck', name: 'Bộ Bài & Quản Trò', badge: 'Hot', desc: 'Chọn thẻ & chia ngẫu nhiên', icon: '🃏' },
          ].map((m) => {
            const isSelected = (config.mode || 'classic') === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  if (isHost) {
                    soundFx.playClick();
                    onUpdateConfig({ mode: m.id });
                    if (m.id === 'custom_deck') {
                      setShowCustomDeckModal(true);
                    }
                  }
                }}
                disabled={!isHost}
                className={`p-3 rounded-2xl border text-left transition relative cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-950/80 to-slate-800/90 border-indigo-400 shadow-md shadow-indigo-950/50 scale-102'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                } ${!isHost ? 'cursor-default' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{m.icon}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {m.badge}
                  </span>
                </div>
                <div className="font-bold text-white text-xs">{m.name}</div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner Tùy Biến Thẻ Bài & Chia Ngẫu Nhiên */}
      {isHost && (
        <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/50 border border-amber-500/50 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-amber-500/20 rounded-2xl border border-amber-500/40">🃏</span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm tracking-wide">
                  TÙY CHỌN 14 THẺ BÀI TAROT & CHIA BÀI RANDOM
                </h4>
                <span className="text-[10px] px-2 py-0.2 bg-amber-500 text-slate-950 font-black rounded-full uppercase">
                  Mới
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Tự do chọn các thẻ bài theo ý bạn, chia ngẫu nhiên và chơi theo Quản Trò AI hoặc Quản Trò Người Thật.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setShowCustomDeckModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition transform hover:scale-102 shadow-lg shadow-orange-950/50 shrink-0"
          >
            <Layers className="w-4 h-4" />
            <span>Mở Bảng Chọn Thẻ Bài</span>
          </button>
        </div>
      )}

      {/* Modal Tùy Chọn Bộ Bài */}
      <CustomDeckModal
        isOpen={showCustomDeckModal}
        onClose={() => setShowCustomDeckModal(false)}
        playerCount={players.length}
        currentConfig={config}
        onSaveConfig={onUpdateConfig}
        onDealCards={(deck) => {
          if (onModeratorAction) {
            onModeratorAction('deal_cards', { roleConfig: deck });
          }
        }}
      />

      {startError && (
        <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs text-center animate-shake">
          ⚠️ {startError}
        </div>
      )}

      {/* Banner Khuyến Khích Bật Voice Chat */}
      {!inVoice && (
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/40 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">🎙️</span>
            <div>
              <h4 className="font-bold text-white text-sm">BẠN ĐANG TẮT VOICE CHAT (ĐÀM THOẠI TRỰC TIẾP)</h4>
              <p className="text-xs text-slate-300">
                Để nghe thấy bạn bè và nói chuyện trực tiếp, hãy bấm nút bật mic bên cạnh!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              if (onJoinVoice) onJoinVoice();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-950/50 shrink-0"
          >
            <Radio className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>BẬT MIC PHÒNG CHỜ</span>
          </button>
        </div>
      )}

      {/* Main Content Layout: Cột Trái (Người Chơi & Cài Đặt) + Cột Phải (Ô Chat Phòng Chờ) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột trái (7/12): Cài đặt + Danh sách người chơi */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cài đặt phòng (Dành cho Host) */}
          {showSettings && isHost && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  CẤU HÌNH VAI TRÒ & THỜI GIAN
                </h3>
                <span className="text-xs text-slate-400">
                  Tổng số người chơi: <strong className="text-white">{players.length}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'werewolf', name: 'Ma Sói', color: 'text-red-400', min: 1 },
                  { id: 'seer', name: 'Tiên Tri', color: 'text-purple-400', min: 0 },
                  { id: 'bodyguard', name: 'Bảo Vệ', color: 'text-emerald-400', min: 0 },
                  { id: 'witch', name: 'Phù Thủy', color: 'text-pink-400', min: 0 },
                  { id: 'hunter', name: 'Thợ Săn', color: 'text-amber-400', min: 0 },
                  { id: 'cupid', name: 'Thần Tình Yêu', color: 'text-rose-400', min: 0 },
                  { id: 'jester', name: 'Kẻ Chán Đời', color: 'text-violet-400', min: 0 },
                ].map((r) => {
                  const count = config.roleConfig?.[r.id] || 0;
                  return (
                    <div key={r.id} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
                      <div>
                        <span className={`text-xs font-bold ${r.color}`}>{r.name}</span>
                        <div className="text-lg font-mono font-bold text-white">{count}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRoleCountChange(r.id, -1)}
                          disabled={count <= r.min}
                          className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white font-bold flex items-center justify-center cursor-pointer text-sm"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleRoleCountChange(r.id, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center cursor-pointer text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tùy chỉnh thời gian */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                  <label className="text-slate-400 block mb-1">Thời gian Ban Đêm</label>
                  <select
                    value={config.nightDuration || 30}
                    onChange={(e) => onUpdateConfig({ nightDuration: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white"
                  >
                    <option value={20}>20 giây (Rất nhanh)</option>
                    <option value={30}>30 giây (Chuẩn)</option>
                    <option value={45}>45 giây (Thong thả)</option>
                  </select>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                  <label className="text-slate-400 block mb-1">Thời gian Thảo Luận Ban Ngày</label>
                  <select
                    value={config.discussionDuration || 45}
                    onChange={(e) => onUpdateConfig({ discussionDuration: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white"
                  >
                    <option value={30}>30 giây (Nhanh)</option>
                    <option value={45}>45 giây (Chuẩn)</option>
                    <option value={60}>60 giây (Kỹ lưỡng)</option>
                    <option value={90}>90 giây (Tranh luận dài)</option>
                  </select>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                  <label className="text-slate-400 block mb-1">Thời gian Bỏ Phiếu Treo Cổ</label>
                  <select
                    value={config.votingDuration || 30}
                    onChange={(e) => onUpdateConfig({ votingDuration: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-white"
                  >
                    <option value={20}>20 giây</option>
                    <option value={30}>30 giây</option>
                    <option value={45}>45 giây</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Danh sách người chơi trong phòng */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">
                  DANH SÁCH NGƯỜI CHƠI ({players.length}/16)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {players.filter((p) => p.isReady || p.isHost).length}/{players.length} Đã sẵn sàng
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {players.map((p) => {
                const isMe = p.id === myId;
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border transition relative flex items-center justify-between ${
                      isMe
                        ? 'bg-slate-800/90 border-indigo-500/80 shadow-md shadow-indigo-950/50'
                        : 'bg-slate-800/40 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative text-3xl p-1 bg-slate-900/80 rounded-xl border border-slate-700/60">
                        {p.avatar}
                        {p.isHost && (
                          <Crown className="w-4 h-4 text-amber-400 absolute -top-1.5 -right-1.5 fill-current" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm truncate">{p.name}</span>
                          {isMe && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-900 text-indigo-300 font-semibold">
                              Bạn
                            </span>
                          )}
                          {voiceStates[p.id]?.inVoice ? (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${
                                voiceStates[p.id]?.isSpeaking
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500 animate-pulse font-bold'
                                  : voiceStates[p.id]?.isMuted
                                  ? 'bg-red-950 text-red-300 border-red-800'
                                  : 'bg-slate-800 text-emerald-400 border-slate-700'
                              }`}
                              title={voiceStates[p.id]?.isMuted ? 'Tắt mic' : voiceStates[p.id]?.isSpeaking ? 'Đang nói' : 'Đang trong voice'}
                            >
                              {voiceStates[p.id]?.isMuted ? '🔇 Tắt mic' : voiceStates[p.id]?.isSpeaking ? '🗣️ Đang nói' : '🎙️ Đang nghe'}
                            </span>
                          ) : !p.isBot ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900/80 text-slate-500 border border-slate-800" title="Người này chưa bấm Bật Voice Chat">
                              Chưa vào mic
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-1 mt-0.5">
                          {p.isBot ? (
                            <span className="text-[11px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-0.5">
                              <Bot className="w-2.5 h-2.5" /> Bot AI
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Người chơi</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {p.isHost ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 font-medium">
                          Chủ phòng
                        </span>
                      ) : p.isReady ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Sẵn sàng
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Chưa sẵn sàng
                        </span>
                      )}

                      {/* Nút xóa Bot dành cho Host */}
                      {isHost && p.isBot && (
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onRemoveBot(p.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          title="Xóa Bot này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cột phải (5/12): Ô Chat Phòng Chờ */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-base">💬</span>
              <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                CHAT PHÒNG CHỜ
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Trò chuyện cùng bạn bè
            </span>
          </div>

          <ChatBox
            messages={chatMessages}
            onSendMessage={onSendMessage}
            myRole={null}
            isAlive={true}
            phase="LOBBY"
          />
        </div>
      </div>

      {/* Modal Mã QR Quét Nhanh */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center space-y-4">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-base">
              <QrCode className="w-5 h-5" />
              <span>QUÉT MÃ VÀO PHÒNG</span>
            </div>

            <p className="text-xs text-slate-300">
              Bạn bè mở <strong>Camera điện thoại</strong> quét mã này để vào thẳng phòng <span className="font-mono text-amber-400 font-bold">[{roomCode}]</span>!
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl mx-auto border-4 border-slate-700">
              <QRCodeSVG
                value={inviteUrl}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-[11px] text-slate-400 font-mono break-all select-all">
              {inviteUrl}
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow-lg active:scale-98"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép liên kết!' : 'Sao chép link mời'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

