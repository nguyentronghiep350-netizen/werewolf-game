import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Heart, Sparkles, BookOpen } from 'lucide-react';
import { ROLE_ICONS } from './RoleGuideModal';

export default function RoleDrawer({ myRole, myRoleDetails, isAlive, loverPartner }) {
  const [expanded, setExpanded] = useState(false);

  if (!myRoleDetails) return null;

  const IconComp = ROLE_ICONS[myRole];
  const cardSrc = myRoleDetails.cardImage || `/cards/${myRole}.jpg`;

  return (
    <div className="bg-slate-900/95 border-t border-slate-800 backdrop-blur-2xl shadow-2xl transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mini Card Preview */}
          <div
            onClick={() => setExpanded(!expanded)}
            className="w-11 h-14 rounded-lg overflow-hidden border border-amber-500/60 shadow-md cursor-pointer hover:scale-105 transition transform shrink-0 relative bg-slate-800"
          >
            <img
              src={cardSrc}
              alt={myRoleDetails.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Lá bài của bạn:</span>
              <span
                className="text-sm font-black tracking-wide"
                style={{ color: myRoleDetails.color || '#fff' }}
              >
                {myRoleDetails.name}
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {myRoleDetails.team === 'werewolf' ? 'Phe Sói 🐺' : myRoleDetails.team === 'village' ? 'Phe Dân 🧑‍🌾' : myRoleDetails.team === 'moderator' ? 'Quản Trò 👑' : 'Phe Thứ 3 🎭'}
              </span>
            </div>

            {loverPartner && (
              <div className="flex items-center gap-1.5 text-xs text-rose-300 mt-0.5 font-medium">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>Bạn đang yêu <strong className="text-white">{loverPartner.partnerName}</strong>! Hãy bảo vệ nhau đến cùng.</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs cursor-pointer border border-slate-700 font-semibold"
        >
          <span>{expanded ? 'Thu gọn thẻ bài' : 'Xem Thẻ Bài Tarot'}</span>
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-5xl mx-auto px-4 pb-6 pt-3 border-t border-slate-800/80 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Full Tarot Card Art */}
            <div className="w-44 sm:w-52 shrink-0 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl shadow-amber-950/60 transition hover:scale-102">
              <img
                src={cardSrc}
                alt={myRoleDetails.name}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Role Lore & Details */}
            <div className="flex-1 space-y-3 text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-base font-bold text-white tracking-wide">
                  THẺ BÀI TAROT: {myRoleDetails.name.toUpperCase()}
                </h4>
                <span className="text-xs text-amber-400 font-mono">JoJo Part 3 Style</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Nhiệm vụ & Năng lực:
                </span>
                <p className="text-slate-200 text-sm leading-relaxed bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                  {myRoleDetails.description}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Truyền thuyết Stand / Linh hồn:
                </span>
                <p className="text-slate-400 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  📖 {myRoleDetails.detailedLore}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
