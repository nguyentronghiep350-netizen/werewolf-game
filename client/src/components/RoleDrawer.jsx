import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Heart, Sparkles, BookOpen, X } from 'lucide-react';
import { ROLE_ICONS } from './RoleGuideModal';
import { soundFx } from '../utils/audio';

export default function RoleDrawer({ myRole, myRoleDetails, isAlive, loverPartner }) {
  const [showModal, setShowModal] = useState(false);

  if (!myRoleDetails) return null;

  const cardSrc = myRoleDetails.cardImage || `/cards/${myRole}.jpg`;

  return (
    <>
      {/* Floating Bottom Bar */}
      <div className="bg-slate-900/95 border-t border-slate-800 backdrop-blur-2xl shadow-2xl px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mini Card Preview */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowModal(true);
              }}
              className="w-9 h-11 rounded-lg overflow-hidden border border-amber-400/60 shadow-md cursor-pointer hover:scale-105 transition transform shrink-0 relative bg-slate-800"
              title="Bấm để xem chi tiết lá bài"
            >
              <img
                src={cardSrc}
                alt={myRoleDetails.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400">Vai trò:</span>
                <span
                  className="text-xs md:text-sm font-black tracking-wide truncate"
                  style={{ color: myRoleDetails.color || '#fff' }}
                >
                  {myRoleDetails.name}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {myRoleDetails.team === 'werewolf' ? 'Phe Sói 🐺' : myRoleDetails.team === 'village' ? 'Phe Dân 🧑‍🌾' : myRoleDetails.team === 'moderator' ? 'Quản Trò 👑' : 'Phe Thứ 3 🎭'}
                </span>
              </div>

              {loverPartner && (
                <div className="flex items-center gap-1 text-[11px] text-rose-300 truncate">
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
                  <span className="truncate">Yêu <strong className="text-white">{loverPartner.partnerName}</strong></span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setShowModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white transition flex items-center gap-1 text-xs cursor-pointer border border-slate-700 font-bold shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Xem Thẻ Bài</span>
          </button>
        </div>
      </div>

      {/* Modal Chi Tiết Thẻ Bài Tarot */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 md:p-6 max-w-lg w-full shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Full Tarot Card Art */}
              <div className="w-40 sm:w-48 shrink-0 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl shadow-amber-950/60 transition hover:scale-102">
                <img
                  src={cardSrc}
                  alt={myRoleDetails.name}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Role Details */}
              <div className="flex-1 space-y-3 text-xs text-slate-300 text-left">
                <div className="border-b border-slate-800 pb-2">
                  <h4 className="text-base font-bold text-white tracking-wide">
                    {myRoleDetails.name.toUpperCase()}
                  </h4>
                  <span className="text-[11px] text-amber-400 font-mono">Thẻ Bài Tarot JoJo Part 3</span>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1 text-[10px]">
                    Năng Lực & Nhiệm Vụ:
                  </span>
                  <p className="text-slate-200 text-xs leading-relaxed bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                    {myRoleDetails.description}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1 text-[10px]">
                    Truyền Thuyết Stand:
                  </span>
                  <p className="text-slate-400 text-xs leading-relaxed italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    📖 {myRoleDetails.detailedLore}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-slate-700"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}

