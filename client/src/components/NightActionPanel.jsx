import React, { useState } from 'react';
import { Moon, Eye, Shield, Flame, FlaskConical, Heart, Check, Sparkles, X, Clock } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function NightActionPanel({
  myRole,
  isAlive,
  players,
  myId,
  nightNumber,
  onNightAction,
  seerResult,
  witchVictim,
  activeNightRole,
  activeNightStep,
  activeNightTitle,
  activeNightPrompt,
}) {
  const [selectedTarget, setSelectedTarget] = useState('');
  const [selectedTarget2, setSelectedTarget2] = useState('');
  const [useSave, setUseSave] = useState(false);
  const [poisonTarget, setPoisonTarget] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isAlive) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 text-center backdrop-blur-xl">
        <span className="text-2xl">👻</span>
        <h4 className="text-xs font-bold text-slate-300 mt-1">Bạn Đã Chết</h4>
        <p className="text-[11px] text-slate-500">Linh hồn của bạn đang quan sát ngôi làng trong bóng tối.</p>
      </div>
    );
  }

  const alivePlayers = players.filter((p) => p.isAlive && p.role !== 'moderator');
  const me = players.find((p) => p.id === myId);

  // Kiểm tra xem lượt ban đêm hiện tại có phải là lượt của mình không
  const isWolf = ['werewolf', 'alpha_wolf', 'white_wolf', 'wolf_pup'].includes(myRole);
  
  let isMyTurn = false;
  if (!activeNightRole) {
    isMyTurn = true;
  } else if (activeNightRole === 'werewolf') {
    isMyTurn = isWolf;
  } else if (activeNightRole === 'white_wolf') {
    isMyTurn = myRole === 'white_wolf';
  } else {
    isMyTurn = myRole === activeNightRole;
  }

  // Nếu không phải lượt của mình: Màn hình Làng Đang Ngủ Say (Tối giản & Đẹp mắt)
  if (!isMyTurn) {
    return (
      <div className="bg-slate-900/85 border border-slate-800/80 rounded-3xl p-5 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden animate-fadeIn">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-950/70 border border-indigo-500/30 text-2xl mb-2.5 shadow-inner moon-glow">
          🌙
        </div>
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold uppercase tracking-wider">
            Đêm Thứ {nightNumber}
          </span>
          {activeNightTitle && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Đang gọi: {activeNightTitle}
            </span>
          )}
        </div>
        <h4 className="text-sm font-black text-white tracking-wide uppercase">
          Cả Làng Đang Chìm Trong Giấc Ngủ Say...
        </h4>
        <p className="text-xs text-indigo-300/90 mt-1.5 max-w-md mx-auto italic bg-indigo-950/30 p-2 rounded-xl border border-indigo-900/40">
          "{activeNightPrompt || 'Quản trò đang điều phối trong bóng đêm. Vui lòng giữ im lặng và chờ đến lượt của bạn.'}"
        </p>
      </div>
    );
  }

  // 1. Ma Sói (Werewolf)
  if (isWolf && (activeNightRole === 'werewolf' || !activeNightRole)) {
    const targets = alivePlayers.filter((p) => !['werewolf', 'alpha_wolf', 'white_wolf', 'wolf_pup'].includes(p.role));
    const handleWolfVote = () => {
      if (!selectedTarget) return;
      soundFx.playClick();
      onNightAction({ action: 'werewolf_vote', targetId: selectedTarget });
      setSubmitted(true);
    };

    return (
      <div className="bg-red-950/30 border border-red-800/80 rounded-3xl p-4 md:p-5 shadow-xl backdrop-blur-xl wolf-glow animate-fadeIn">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500" />
            <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">Lượt Bầy Ma Sói</h4>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/80 text-red-200 border border-red-700 font-bold uppercase">
            Đến Lượt Bạn
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-3">
          Chọn 1 người dân làng để bầy sói cùng cắn chết đêm nay:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
          {targets.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedTarget(t.id);
              }}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                selectedTarget === t.id
                  ? 'bg-red-600 border-red-400 text-white shadow-md shadow-red-950/60 scale-102'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <span className="text-lg">{t.avatar}</span>
              <span className="truncate">{t.name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={handleWolfVote}
          disabled={!selectedTarget || submitted}
          className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/60"
        >
          <Check className="w-4 h-4" />
          {submitted ? 'Đã Chốt Mục Tiêu (Đang Chuyển Lượt...)' : 'Xác Nhận Cắn Nạn Nhân'}
        </button>
      </div>
    );
  }

  // 2. Tiên Tri (Seer)
  if (myRole === 'seer') {
    const targets = alivePlayers.filter((p) => p.id !== myId);
    const handleSeerInspect = () => {
      if (!selectedTarget) return;
      soundFx.playClick();
      onNightAction({ action: 'seer_inspect', targetId: selectedTarget });
      setSubmitted(true);
    };

    return (
      <div className="bg-purple-950/30 border border-purple-800/80 rounded-3xl p-4 md:p-5 shadow-xl backdrop-blur-xl animate-fadeIn">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Lượt Tiên Tri Soi</h4>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-200 border border-purple-700 font-bold uppercase">
            Đến Lượt Bạn
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-3">
          Chọn 1 người để soi thấu thân phận thật sự:
        </p>

        {seerResult ? (
          <div className="p-3 bg-purple-900/70 border border-purple-500 rounded-2xl text-center mb-3 shadow-inner animate-fadeIn">
            <div className="text-[11px] text-purple-200 uppercase font-bold tracking-wider">Kết quả thị kiến:</div>
            <div className="text-sm md:text-base font-black text-white mt-1">
              {seerResult.targetName} là{' '}
              <span className={seerResult.isWerewolf ? 'text-rose-400 underline font-black' : 'text-emerald-400 underline font-black'}>
                {seerResult.roleName} ({seerResult.team === 'werewolf' ? 'Phe Ma Sói 🐺' : 'Phe Dân Làng 🧑‍🌾'})
              </span>
            </div>
            <p className="text-[10px] text-purple-200 mt-1">Đang ghi nhớ và chuyển sang lượt tiếp theo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
            {targets.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedTarget(t.id);
                }}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  selectedTarget === t.id
                    ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-950/60 scale-102'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60'
                }`}
              >
                <span className="text-lg">{t.avatar}</span>
                <span className="truncate">{t.name}</span>
              </button>
            ))}
          </div>
        )}

        {!seerResult && (
          <button
            onClick={handleSeerInspect}
            disabled={!selectedTarget || submitted}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-purple-950/60"
          >
            <Eye className="w-4 h-4" />
            {submitted ? 'Đang Khai Mở Nhãn Quan...' : 'Soi Danh Tính Người Này'}
          </button>
        )}
      </div>
    );
  }

  // 3. Bảo Vệ (Bodyguard)
  if (myRole === 'bodyguard') {
    const targets = alivePlayers.filter((p) => p.id !== me?.lastProtectedId);
    const handleProtect = () => {
      if (!selectedTarget) return;
      soundFx.playClick();
      onNightAction({ action: 'protect', targetId: selectedTarget });
      setSubmitted(true);
    };

    return (
      <div className="bg-emerald-950/30 border border-emerald-800/80 rounded-3xl p-4 md:p-5 shadow-xl backdrop-blur-xl animate-fadeIn">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Lượt Bảo Vệ</h4>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-700 font-bold uppercase">
            Đến Lượt Bạn
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-3">
          Chọn 1 người để bảo vệ khỏi sói cắn đêm nay:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
          {targets.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedTarget(t.id);
              }}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                selectedTarget === t.id
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-950/60 scale-102'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <span className="text-lg">{t.avatar}</span>
              <span className="truncate">{t.name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={handleProtect}
          disabled={!selectedTarget || submitted}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/60"
        >
          <Shield className="w-4 h-4" />
          {submitted ? 'Đã Bảo Vệ (Đang Chuyển Lượt...)' : 'Xác Nhận Bảo Vệ'}
        </button>
      </div>
    );
  }

  // 4. Phù Thủy (Witch)
  if (myRole === 'witch') {
    const handleWitchSubmit = () => {
      soundFx.playClick();
      onNightAction({
        action: 'witch_act',
        save: useSave,
        killTargetId: poisonTarget || null,
      });
      setSubmitted(true);
    };

    const handleWitchPass = () => {
      soundFx.playClick();
      onNightAction({ action: 'witch_pass' });
      setSubmitted(true);
    };

    return (
      <div className="bg-pink-950/30 border border-pink-800/80 rounded-3xl p-4 md:p-5 shadow-xl backdrop-blur-xl animate-fadeIn space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-pink-400" />
            <h4 className="text-xs font-bold text-pink-300 uppercase tracking-wider">Lượt Phù Thủy</h4>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-900/80 text-pink-200 border border-pink-700 font-bold uppercase">
            Đến Lượt Bạn
          </span>
        </div>

        {/* Thông tin nạn nhân bị sói cắn */}
        <div className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs">
          <span className="text-slate-400 block text-[11px] mb-0.5">Nạn nhân vừa bị Sói chọn cắn:</span>
          {witchVictim?.victimName ? (
            <span className="text-rose-400 font-black text-xs flex items-center gap-1">
              🩸 {witchVictim.victimName} đang bị thương nặng!
            </span>
          ) : (
            <span className="text-emerald-400 text-xs font-medium">✨ Đêm nay không có ai bị thương.</span>
          )}
        </div>

        {/* Bình Cứu */}
        <div className="p-2.5 bg-slate-800/50 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-emerald-400 block text-xs">Bình Cứu Sống</span>
            <span className="text-slate-400 text-[10px]">
              {me?.witchSaveUsed ? 'Đã dùng trước đó' : 'Còn 1 lần dùng'}
            </span>
          </div>
          {!me?.witchSaveUsed && (
            <button
              onClick={() => {
                soundFx.playClick();
                setUseSave(!useSave);
              }}
              className={`px-3 py-1 rounded-xl font-bold text-xs transition cursor-pointer ${
                useSave ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {useSave ? '✓ Sẽ Cứu' : 'Dùng Bình Cứu'}
            </button>
          )}
        </div>

        {/* Bình Độc */}
        <div className="p-2.5 bg-slate-800/50 rounded-2xl border border-slate-700/60 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-400 text-xs">Bình Độc Dược</span>
            <span className="text-slate-400 text-[10px]">
              {me?.witchKillUsed ? 'Đã dùng trước đó' : 'Còn 1 lần dùng'}
            </span>
          </div>
          {!me?.witchKillUsed && (
            <select
              value={poisonTarget}
              onChange={(e) => setPoisonTarget(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
            >
              <option value="">-- Không đầu độc ai --</option>
              {alivePlayers
                .filter((p) => p.id !== myId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    Đầu độc {p.name}
                  </option>
                ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleWitchPass}
            disabled={submitted}
            className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold text-xs transition cursor-pointer border border-slate-700"
          >
            Bỏ Qua Đêm Nay
          </button>
          <button
            onClick={handleWitchSubmit}
            disabled={submitted}
            className="flex-2 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-pink-950/60"
          >
            <Check className="w-4 h-4" />
            {submitted ? 'Đã Xong' : 'Xác Nhận'}
          </button>
        </div>
      </div>
    );
  }

  // 5. Thần Tình Yêu (Cupid)
  if (myRole === 'cupid' && nightNumber === 1) {
    const handleCupidPair = () => {
      if (!selectedTarget || !selectedTarget2 || selectedTarget === selectedTarget2) return;
      soundFx.playClick();
      onNightAction({
        action: 'cupid_pair',
        targetId: selectedTarget,
        target2Id: selectedTarget2,
      });
      setSubmitted(true);
    };

    return (
      <div className="bg-rose-950/30 border border-rose-800/80 rounded-3xl p-4 md:p-5 shadow-xl backdrop-blur-xl animate-fadeIn space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-500" />
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Lượt Thần Tình Yêu</h4>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-900/80 text-rose-200 border border-rose-700 font-bold uppercase">
            Đến Lượt Bạn
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Chọn 2 người chơi để kết nối thành cặp đôi định mệnh:
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Người thứ 1:</label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
            >
              <option value="">-- Chọn người 1 --</option>
              {alivePlayers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Người thứ 2:</label>
            <select
              value={selectedTarget2}
              onChange={(e) => setSelectedTarget2(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white"
            >
              <option value="">-- Chọn người 2 --</option>
              {alivePlayers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCupidPair}
          disabled={!selectedTarget || !selectedTarget2 || selectedTarget === selectedTarget2 || submitted}
          className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/60"
        >
          <Heart className="w-4 h-4 fill-white" />
          {submitted ? 'Đã Ghép Đôi (Đang Chuyển Lượt...)' : 'Bắn Mũi Tên Tình Ái'}
        </button>
      </div>
    );
  }

  return null;
}


