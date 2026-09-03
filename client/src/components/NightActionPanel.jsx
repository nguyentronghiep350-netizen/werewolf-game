import React, { useState } from 'react';
import { Moon, Eye, Shield, Flame, FlaskConical, Heart, Check, Sparkles } from 'lucide-react';
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
}) {
  const [selectedTarget, setSelectedTarget] = useState('');
  const [selectedTarget2, setSelectedTarget2] = useState('');
  const [useSave, setUseSave] = useState(false);
  const [poisonTarget, setPoisonTarget] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isAlive) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 text-center backdrop-blur-xl">
        <span className="text-3xl">👻</span>
        <h4 className="text-sm font-bold text-slate-300 mt-2">Bạn Đã Chết</h4>
        <p className="text-xs text-slate-500 mt-1">Linh hồn của bạn đang lang thang trong màn đêm.</p>
      </div>
    );
  }

  const alivePlayers = players.filter((p) => p.isAlive);
  const me = players.find((p) => p.id === myId);

  // 1. Ma Sói (Werewolf)
  if (myRole === 'werewolf') {
    const targets = alivePlayers.filter((p) => p.role !== 'werewolf');
    const handleWolfVote = () => {
      if (!selectedTarget) return;
      soundFx.playClick();
      onNightAction({ action: 'werewolf_vote', targetId: selectedTarget });
      setSubmitted(true);
    };

    return (
      <div className="bg-red-950/40 border border-red-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-xl wolf-glow">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-red-500" />
          <h4 className="text-sm font-bold text-red-300 uppercase tracking-wider">Hành Động Ma Sói</h4>
        </div>
        <p className="text-xs text-slate-300 mb-3">
          Thảo luận với đàn sói qua tab "Bầy Sói" và chọn 1 nạn nhân để cắn chết đêm nay:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {targets.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedTarget(t.id);
              }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                selectedTarget === t.id
                  ? 'bg-red-600 border-red-400 text-white shadow-md shadow-red-900/50'
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
          {submitted ? 'Đã Chốt Mục Tiêu' : 'Xác Nhận Cắn'}
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
      <div className="bg-purple-950/40 border border-purple-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-5 h-5 text-purple-400" />
          <h4 className="text-sm font-bold text-purple-300 uppercase tracking-wider">Hành Động Tiên Tri</h4>
        </div>
        <p className="text-xs text-slate-300 mb-3">
          Khai mở nhãn quan thần thánh, chọn 1 người để soi thấu danh tính:
        </p>

        {seerResult ? (
          <div className="p-3 bg-purple-900/60 border border-purple-600 rounded-2xl text-center mb-3">
            <div className="text-xs text-purple-200">Kết quả soi thị kiến:</div>
            <div className="text-base font-bold text-white mt-1">
              {seerResult.targetName} là{' '}
              <span className={seerResult.isWerewolf ? 'text-red-400' : 'text-emerald-400'}>
                {seerResult.roleName} ({seerResult.team === 'werewolf' ? 'Phe Ma Sói 🐺' : 'Phe Dân Làng 🧑‍🌾'})
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {targets.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedTarget(t.id);
                }}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                  selectedTarget === t.id
                    ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-900/50'
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
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            {submitted ? 'Đang Soi...' : 'Soi Danh Tính'}
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
      <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h4 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Hành Động Bảo Vệ</h4>
        </div>
        <p className="text-xs text-slate-300 mb-3">
          Chọn 1 người để che chắn khỏi nanh vuốt sói (không được chọn cùng người 2 đêm liên tiếp):
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {targets.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedTarget(t.id);
              }}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                selectedTarget === t.id
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-900/50'
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
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Shield className="w-4 h-4" />
          {submitted ? 'Đã Bảo Vệ' : 'Xác Nhận Bảo Vệ'}
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

    return (
      <div className="bg-pink-950/40 border border-pink-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="w-5 h-5 text-pink-400" />
          <h4 className="text-sm font-bold text-pink-300 uppercase tracking-wider">Hành Động Phù Thủy</h4>
        </div>

        {/* Thông tin nạn nhân bị sói cắn */}
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 mb-3 text-xs">
          <span className="text-slate-400 block mb-1">Nạn nhân của bầy sói:</span>
          {witchVictim?.victimName ? (
            <span className="text-rose-400 font-bold text-sm">
              🩸 {witchVictim.victimName} đang bị cắn!
            </span>
          ) : (
            <span className="text-slate-400 italic">Chưa phát hiện ai bị cắn hoặc sói chưa chốt.</span>
          )}
        </div>

        {/* Bình Cứu */}
        <div className="mb-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-emerald-400 block">Bình Cứu Sống</span>
            <span className="text-slate-400 text-[11px]">
              {me?.witchSaveUsed ? 'Đã sử dụng trong ván' : 'Còn 1 lần sử dụng'}
            </span>
          </div>
          {!me?.witchSaveUsed && (
            <button
              onClick={() => {
                soundFx.playClick();
                setUseSave(!useSave);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                useSave ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {useSave ? '✓ Sẽ Cứu' : 'Dùng Bình Cứu'}
            </button>
          )}
        </div>

        {/* Bình Độc */}
        <div className="mb-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-purple-400">Bình Độc Dược</span>
            <span className="text-slate-400 text-[11px]">
              {me?.witchKillUsed ? 'Đã sử dụng trong ván' : 'Còn 1 lần sử dụng'}
            </span>
          </div>
          {!me?.witchKillUsed && (
            <select
              value={poisonTarget}
              onChange={(e) => setPoisonTarget(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
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

        <button
          onClick={handleWitchSubmit}
          disabled={submitted}
          className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          {submitted ? 'Đã Hoàn Thành' : 'Xác Nhận Hành Động'}
        </button>
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
      <div className="bg-rose-950/40 border border-rose-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-5 h-5 text-rose-400 fill-rose-500" />
          <h4 className="text-sm font-bold text-rose-300 uppercase tracking-wider">Hành Động Thần Tình Yêu</h4>
        </div>
        <p className="text-xs text-slate-300 mb-3">
          Chọn 2 người chơi để kết nối thành cặp đôi định mệnh sống chết có nhau:
        </p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Người thứ 1:</label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
            >
              <option value="">-- Chọn người 1 --</option>
              {alivePlayers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Người thứ 2:</label>
            <select
              value={selectedTarget2}
              onChange={(e) => setSelectedTarget2(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
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
          className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Heart className="w-4 h-4 fill-white" />
          {submitted ? 'Đã Ghép Đôi' : 'Bắn Mũi Tên Tình Ái'}
        </button>
      </div>
    );
  }

  // Vai trò không có hành động ban đêm (Dân làng, Thợ săn, Jester,...)
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 text-center backdrop-blur-xl">
      <div className="inline-flex p-3 rounded-2xl bg-indigo-950/60 border border-indigo-900/60 text-3xl mb-3 moon-glow">
        🌙
      </div>
      <h4 className="text-sm font-bold text-slate-200">Đêm Tối Tĩnh Mịch</h4>
      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
        Bạn không có kỹ năng hành động trong đêm. Hãy giữ bình tĩnh và lắng nghe những âm thanh bí ẩn xung quanh ngôi làng...
      </p>
    </div>
  );
}
