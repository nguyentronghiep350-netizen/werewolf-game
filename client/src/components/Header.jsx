import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, BookOpen, LogOut, Moon, Users } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function Header({
  roomCode,
  playerCount,
  onOpenRolesGuide,
  onOpenUserGuide,
  onLeaveRoom,
  inGame = false,
}) {
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(false);

  const handleCopyLink = () => {
    soundFx.playClick();
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSound = () => {
    const isMuted = soundFx.toggleMute();
    setMuted(isMuted);
    if (!isMuted) {
      soundFx.playClick();
    }
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-indigo-950 flex items-center justify-center text-2xl shadow-red-900/50 shadow-md">
          🐺
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wider flex items-center gap-2">
            MA SÓI ONLINE
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/50 text-red-300 border border-red-700/50">
              Live
            </span>
          </h1>
          {roomCode && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Phòng: <strong className="text-amber-400 font-mono tracking-widest">{roomCode}</strong></span>
              <button
                onClick={handleCopyLink}
                className="hover:text-amber-300 transition flex items-center gap-1 cursor-pointer bg-slate-800 px-1.5 py-0.5 rounded text-[11px]"
                title="Sao chép link mời"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Đã chép link' : 'Mời bạn'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {playerCount !== undefined && (
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs text-slate-300">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>{playerCount} người</span>
          </div>
        )}

        <button
          onClick={onOpenUserGuide}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700/60 text-xs flex items-center gap-1"
          title="Hướng dẫn sử dụng & Luật chơi"
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">Hướng Dẫn</span>
        </button>

        <button
          onClick={onOpenRolesGuide}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700/60 text-xs flex items-center gap-1"
          title="Tra cứu vai trò"
        >
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span className="hidden md:inline">Xem Vai Trò</span>
        </button>

        <button
          onClick={handleToggleSound}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700/60"
          title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {onLeaveRoom && (
          <button
            onClick={onLeaveRoom}
            className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 transition cursor-pointer border border-rose-800/60 text-xs flex items-center gap-1"
            title="Rời phòng"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Rời</span>
          </button>
        )}
      </div>
    </header>
  );
}
