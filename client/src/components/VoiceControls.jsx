import React, { useEffect } from 'react';
import { Mic, MicOff, Headphones, VolumeX, PhoneCall, PhoneOff, Radio, Moon, Skull, Users, Flame } from 'lucide-react';

export default function VoiceControls({ voiceChat, isAlive }) {
  const {
    inVoice,
    isMuted,
    isDeafened,
    hasMicPermission,
    activeChannel,
    joinVoice,
    leaveVoice,
    toggleMute,
    toggleDeafen,
  } = voiceChat;

  // Phím tắt bàn phím 'M' để toggle mute
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Tránh bắt phím khi đang gõ vào ô input chat
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'm' || e.key === 'M') {
        if (inVoice) {
          toggleMute();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inVoice, toggleMute]);

  // Thông tin hiển thị cho từng kênh âm thanh
  const getChannelInfo = () => {
    switch (activeChannel) {
      case 'WEREWOLF':
        return {
          title: 'Kênh Sói (Bí Mật)',
          color: 'bg-red-950/90 text-red-300 border-red-800',
          icon: Flame,
          desc: 'Chỉ các Sói còn sống mới nghe thấy bạn',
        };
      case 'GHOST':
        return {
          title: 'Kênh Linh Hồn',
          color: 'bg-purple-950/90 text-purple-300 border-purple-800',
          icon: Skull,
          desc: 'Nói chuyện cùng các hồn ma khác (người sống không nghe thấy)',
        };
      case 'SLEEP':
        return {
          title: 'Đang Ngủ (Đêm)',
          color: 'bg-indigo-950/90 text-indigo-300 border-indigo-800',
          icon: Moon,
          desc: 'Dân làng ngủ say, tạm khóa voice để giữ bí mật đêm',
        };
      case 'VILLAGE':
      default:
        return {
          title: 'Kênh Làng (Công Khai)',
          color: 'bg-emerald-950/90 text-emerald-300 border-emerald-800',
          icon: Users,
          desc: 'Tất cả người chơi còn sống đều nghe thấy bạn',
        };
    }
  };

  const channelInfo = getChannelInfo();
  const ChannelIcon = channelInfo.icon;

  if (!inVoice) {
    return (
      <div className="fixed bottom-20 left-4 z-40 animate-fadeIn">
        <button
          onClick={joinVoice}
          className="group px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xl shadow-emerald-950/50 flex items-center gap-2 cursor-pointer transition transform hover:scale-105 active:scale-95 border border-emerald-400/40"
        >
          <div className="p-1 rounded-lg bg-black/20 group-hover:scale-110 transition">
            <Radio className="w-4 h-4 text-emerald-200 animate-pulse" />
          </div>
          <div className="text-left">
            <span className="block leading-none">Bật Voice Chat</span>
            <span className="text-[10px] text-emerald-200 font-normal">Nói chuyện trực tiếp</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 z-40 flex flex-col gap-1.5 animate-fadeIn">
      {/* Channel Status Pill */}
      <div className={`px-3 py-1 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-lg ${channelInfo.color}`}>
        <ChannelIcon className="w-3.5 h-3.5 animate-pulse" />
        <span>{channelInfo.title}</span>
      </div>

      {/* Control Bar */}
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-1.5 backdrop-blur-xl shadow-2xl flex items-center gap-1.5">
        {/* Nút Mic */}
        <button
          onClick={toggleMute}
          className={`p-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
            isMuted
              ? 'bg-red-950/80 hover:bg-red-900/80 text-red-300 border border-red-800'
              : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700'
          }`}
          title={isMuted ? 'Bật Mic (Phím M)' : 'Tắt Mic (Phím M)'}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Mic Bật'}</span>
        </button>

        {/* Nút Loa (Deafen) */}
        <button
          onClick={toggleDeafen}
          className={`p-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
            isDeafened
              ? 'bg-red-950/80 hover:bg-red-900/80 text-red-300 border border-red-800'
              : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700'
          }`}
          title={isDeafened ? 'Bật lại âm thanh voice' : 'Tắt tiếng tất cả (Deafen)'}
        >
          {isDeafened ? <VolumeX className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
        </button>

        {/* Nút Rời Voice */}
        <button
          onClick={leaveVoice}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-900/80 text-slate-400 hover:text-red-200 border border-slate-700 hover:border-red-700 transition cursor-pointer"
          title="Rời khỏi phòng Voice"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>

      {hasMicPermission === false && (
        <div className="text-[10px] px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-800 rounded-lg max-w-[200px] text-center">
          ⚠️ Chế độ chỉ nghe (Chưa cấp quyền mic)
        </div>
      )}
    </div>
  );
}
