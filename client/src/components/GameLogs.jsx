import React, { useEffect, useRef } from 'react';
import { Scroll, Skull, Moon, Sun, Gavel, Info } from 'lucide-react';

export default function GameLogs({ logs = [] }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'death':
        return <Skull className="w-3.5 h-3.5 text-red-400 shrink-0" />;
      case 'night':
        return <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
      case 'day':
        return <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'vote':
        return <Gavel className="w-3.5 h-3.5 text-orange-400 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col h-[280px] backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
        <Scroll className="w-4 h-4 text-amber-400" />
        <span>Nhật Ký Sự Kiện Làng</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic">
            Chưa có biến cố nào xảy ra...
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded-xl border flex items-start gap-2 ${
                log.type === 'death'
                  ? 'bg-red-950/40 border-red-900/60 text-red-200'
                  : log.type === 'vote'
                  ? 'bg-amber-950/40 border-amber-900/60 text-amber-200'
                  : 'bg-slate-800/40 border-slate-800 text-slate-300'
              }`}
            >
              <div className="mt-0.5">{getLogIcon(log.type)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                  <span className="font-mono">{log.time}</span>
                </div>
                <p className="leading-relaxed">{log.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>
    </div>
  );
}
