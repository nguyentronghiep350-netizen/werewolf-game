import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Moon, Skull } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function ChatBox({
  messages = [],
  onSendMessage,
  myRole,
  isAlive,
  phase,
}) {
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState('public');
  const messagesEndRef = useRef(null);

  const isWolf = myRole === 'werewolf';
  const isNight = phase?.startsWith('NIGHT');

  // Tự động chuyển tab sang Sói vào ban đêm nếu là Sói
  useEffect(() => {
    if (isNight && isWolf && isAlive) {
      setActiveTab('werewolf');
    }
  }, [isNight, isWolf, isAlive]);

  // Tự động chuyển tab sang Hồn ma nếu chết
  useEffect(() => {
    if (!isAlive) {
      setActiveTab('dead');
    }
  }, [isAlive]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    soundFx.playClick();
    onSendMessage(text.trim(), activeTab);
    setText('');
  };

  const filteredMessages = messages.filter((m) => {
    if (activeTab === 'public') return m.channel === 'public';
    if (activeTab === 'werewolf') return m.channel === 'werewolf';
    if (activeTab === 'dead') return m.channel === 'dead';
    return false;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl flex flex-col h-[380px] shadow-xl overflow-hidden backdrop-blur-xl">
      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('public');
          }}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'public'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
          <span>Kênh Chung</span>
        </button>

        {isWolf && isAlive && (
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('werewolf');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'werewolf'
                ? 'bg-red-950/80 text-red-300 border border-red-800/80 shadow-sm'
                : 'text-slate-400 hover:text-red-300'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-red-400" />
            <span>Bầy Sói</span>
          </button>
        )}

        {!isAlive && (
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('dead');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'dead'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-800/80 shadow-sm'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-purple-400" />
            <span>Hồn Ma</span>
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic text-center p-4">
            {activeTab === 'public' && 'Chưa có tin nhắn trong làng. Hãy cùng nhau thảo luận!'}
            {activeTab === 'werewolf' && 'Kênh bí mật dành riêng cho bầy Ma Sói họp bàn.'}
            {activeTab === 'dead' && 'Nơi các linh hồn người chết tâm sự mà người sống không nghe thấy.'}
          </div>
        ) : (
          filteredMessages.map((m) => (
            <div key={m.id} className="flex items-start gap-2">
              <span className="text-base p-0.5 rounded bg-slate-800 shrink-0">{m.senderAvatar}</span>
              <div className="min-w-0 bg-slate-800/60 rounded-xl p-2 border border-slate-700/50 flex-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="font-bold text-slate-200 truncate">{m.senderName}</span>
                  <span className="text-[10px] text-slate-500 shrink-0">{m.timestamp}</span>
                </div>
                <p className="text-slate-300 break-words leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-2 border-t border-slate-800 bg-slate-950/60 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            activeTab === 'public'
              ? 'Nhắn gì đó vào kênh chung...'
              : activeTab === 'werewolf'
              ? 'Thì thầm với bầy sói...'
              : 'Trò chuyện cõi âm...'
          }
          maxLength={250}
          className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
