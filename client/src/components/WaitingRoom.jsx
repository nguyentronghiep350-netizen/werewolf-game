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
  const readyCount = players.filter((p) => p.isHost || p.isReady).length;
  const canStart = players.length >= 4 && players.every((p) => p.isHost || p.isReady);

  const handleStart = () => {
    soundFx.playClick();
    if (players.length < 4) {
      setStartError('Cần ít nhất 4 người chơi để bắt đầu! Bạn có thể bấm "+ Thêm Bot AI" để đủ số lượng.');
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
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-5">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Room Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="p-3.5 bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/40 rounded-2xl">
            <span className="text-3xl">🐺</span>
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">MÃ PHÒNG</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                ĐANG CHỜ ({readyCount}/{players.length} Sẵn Sàng)
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <span className="text-3xl font-black text-amber-400 font-mono tracking-wider">
                {roomCode}
              </span>

              <button
                type="button"
                onClick={handleCopyLink}
                title="Sao chép link mời phòng này"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowQrModal(true);
                }}
                title="Mở mã QR quét bằng điện thoại"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 transition cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {isHost && (
            <>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onAddBot();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-sm"
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>+ Thêm Bot</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowSettings(!showSettings);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-sm"
              >
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Tùy Chỉnh</span>
              </button>
            </>
          )}

          {!isHost ? (
            <button
              onClick={() => {
                soundFx.playClick();
                onToggleReady();
              }}
              className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-lg ${
                isReady
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isReady ? 'Đã Sẵn Sàng' : 'Bấm Sẵn Sàng'}</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className={`px-7 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-xl active:scale-95 ${
                canStart
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950/60 wolf-glow'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>BẮT ĐẦU GAME</span>
            </button>
          )}
        </div>
      </div>

      {startError && (
        <div className="p-3 bg-red-950/80 border border-red-800 rounded-2xl text-red-200 text-xs text-center font-medium animate-shake">
          ⚠️ {startError}
        </div>
      )}

      {/* Game Mode Pills */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 backdrop-blur-xl shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              CHẾ ĐỘ CHƠI
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            {isHost ? 'Bấm để đổi chế độ' : 'Do Chủ phòng chọn'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {[
            { id: 'classic', name: 'Cổ Điển', desc: 'Tiêu chuẩn', icon: '🌕' },
            { id: 'blood_moon', name: 'Trăng Máu', desc: 'Nhiều Sói', icon: '🩸' },
            { id: 'lovers_chaos', name: 'Tình Yêu', desc: 'Cupid Drama', icon: '💘' },
            { id: 'blitz', name: 'Thần Tốc', desc: '15s Siêu nhanh', icon: '⚡' },
            { id: 'custom_deck', name: 'Bộ Bài Tarot', desc: 'Tùy chọn thẻ bài', icon: '🃏' },
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
                className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-indigo-950/80 border-indigo-400 shadow-md shadow-indigo-950/60'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80'
                } ${!isHost ? 'cursor-default' : ''}`}
              >
                <span className="text-2xl shrink-0">{m.icon}</span>
                <div className="min-w-0">
                  <div className="font-bold text-white text-xs truncate">{m.name}</div>
                  <p className="text-[10px] text-slate-400 truncate">{m.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal Tùy Chọn Bộ Bài Custom Deck */}
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

      {/* Main Grid: Cột Trái (Danh Sách Người Chơi) + Cột Phải (Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Cột trái (7/12): Người chơi & Cài đặt */}
        <div className="lg:col-span-7 space-y-4">
          {/* Cài đặt chi tiết số lượng vai trò */}
          {showSettings && isHost && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Cấu Hình Vai Trò & Thời Gian
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                    <div key={r.id} className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
                      <div>
                        <span className={`text-xs font-bold ${r.color}`}>{r.name}</span>
                        <div className="text-base font-mono font-bold text-white">{count}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRoleCountChange(r.id, -1)}
                          disabled={count <= r.min}
                          className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white font-bold flex items-center justify-center cursor-pointer text-xs"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleRoleCountChange(r.id, 1)}
                          className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center cursor-pointer text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tùy chỉnh thời gian */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                  <label className="text-slate-400 block mb-1">Thời gian Ban Đêm</label>
                  <select
                    value={config.nightDuration || 30}
                    onChange={(e) => onUpdateConfig({ nightDuration: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1 text-white text-xs"
                  >
                    <option value={20}>20s (Nhanh)</option>
                    <option value={30}>30s (Chuẩn)</option>
                    <option value={45}>45s (Thong thả)</option>
                  </select>
                </div>
                <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                  <label className="text-slate-400 block mb-1">Thảo Luận Ban Ngày</label>
                  <select
                    value={config.discussionDuration || 45}
                    onChange={(e) => onUpdateConfig({ discussionDuration: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1 text-white text-xs"
                  >
                    <option value={30}>30s (Nhanh)</option>
                    <option value={45}>45s (Chuẩn)</option>
                    <option value={60}>60s (Kỹ lưỡng)</option>
                  </select>
                </div>
                <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                  <label className="text-slate-400 block mb-1">Bỏ Phiếu Treo Cổ</label>
                  <select
                    value={config.votingDuration || 30}
                    onChange={(e) => onUpdateConfig({ votingDuration: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1 text-white text-xs"
                  >
                    <option value={20}>20s</option>
                    <option value={30}>30s</option>
                    <option value={45}>45s</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Danh sách người chơi trong phòng */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  NGƯỜI CHƠI ({players.length}/16)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {readyCount}/{players.length} Sẵn Sàng
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {players.map((p) => {
                const isMe = p.id === myId;
                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-2xl border transition relative flex items-center justify-between ${
                      isMe
                        ? 'bg-slate-800/90 border-indigo-500/80 shadow-md shadow-indigo-950/50'
                        : 'bg-slate-800/40 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative text-2xl p-1 bg-slate-900/80 rounded-xl border border-slate-700/60">
                        {p.avatar}
                        {p.isHost && (
                          <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-1.5 -right-1.5 fill-current" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-white text-xs truncate">{p.name}</span>
                          {isMe && (
                            <span className="text-[9px] px-1 rounded bg-indigo-900 text-indigo-300 font-semibold">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.isBot ? '🤖 Bot AI' : '👤 Người chơi'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.isHost ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 font-semibold">
                          Chủ phòng
                        </span>
                      ) : p.isReady ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-semibold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Sẵn sàng
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Chờ
                        </span>
                      )}

                      {isHost && p.isBot && (
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onRemoveBot(p.id);
                          }}
                          className="p-1 rounded-lg hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          title="Xóa Bot"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cột phải (5/12): Chat Phòng Chờ */}
        <div className="lg:col-span-5 space-y-2">
          <ChatBox
            messages={chatMessages}
            onSendMessage={onSendMessage}
            myRole={null}
            isAlive={true}
            phase="LOBBY"
          />
        </div>
      </div>

      {/* Modal QR Code */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
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
              Quét camera để vào phòng <span className="font-mono text-amber-400 font-bold">[{roomCode}]</span>:
            </p>

            <div className="bg-white p-3.5 rounded-2xl inline-block shadow-2xl mx-auto border-4 border-slate-700">
              <QRCodeSVG
                value={inviteUrl}
                size={190}
                level="M"
                includeMargin={false}
              />
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition shadow-lg active:scale-98"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép link!' : 'Sao chép link mời'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


