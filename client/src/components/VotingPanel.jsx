import React, { useState } from 'react';
import { Gavel, FastForward, Check, Skull, Ban } from 'lucide-react';
import { soundFx } from '../utils/audio';

export default function VotingPanel({
  phase,
  players = [],
  myId,
  isAlive,
  dayVotes = {},
  discussionSkips = [],
  onDayVote,
  onSkipDiscussion,
}) {
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  const alivePlayers = players.filter((p) => p.isAlive);
  const me = players.find((p) => p.id === myId);

  // Tính số lượng phiếu cho từng ứng viên
  const voteCounts = {};
  let skipVoteCount = 0;
  for (const targetId of Object.values(dayVotes)) {
    if (targetId === 'skip') {
      skipVoteCount++;
    } else {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }
  }

  // 1. Pha thảo luận (DAY_DISCUSSION)
  if (phase === 'DAY_DISCUSSION') {
    const skipCount = discussionSkips.length;
    const neededSkips = Math.ceil(alivePlayers.length / 2);
    const hasSkipped = discussionSkips.includes(myId);

    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">☀️</span>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">
              Giai Đoạn Thảo Luận Ban Ngày
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hãy dùng Kênh Chung để trao đổi, suy luận và chất vấn những người đáng ngờ trước khi bỏ phiếu.
          </p>
        </div>

        {isAlive && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Bỏ qua thảo luận:</span>
              <span className="text-xs font-bold text-amber-400">
                {skipCount}/{neededSkips} phiếu đồng ý
              </span>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                onSkipDiscussion();
              }}
              disabled={hasSkipped}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow ${
                hasSkipped
                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40'
              }`}
            >
              <FastForward className="w-4 h-4" />
              {hasSkipped ? 'Đã Biểu Quyết Skip' : 'Bỏ Qua Thảo Luận'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. Pha bỏ phiếu treo cổ (DAY_VOTING)
  if (phase === 'DAY_VOTING') {
    const handleConfirmVote = () => {
      if (!selectedCandidate) return;
      soundFx.playVote();
      onDayVote(selectedCandidate);
      setHasVoted(true);
    };

    return (
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-red-400" />
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">
              BỎ PHIẾU TREO CỔ NGHI PHẠM
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Đã có {Object.keys(dayVotes).length}/{alivePlayers.length} người bỏ phiếu
          </span>
        </div>

        {!isAlive ? (
          <div className="p-4 bg-slate-800/40 rounded-2xl text-center text-xs text-slate-400">
            👻 Bạn đã chết nên không thể tham gia biểu quyết treo cổ.
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-300">
              Chọn một người mà bạn muốn đưa lên giàn treo cổ, hoặc chọn "Bỏ phiếu trắng" nếu không muốn treo ai hôm nay:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {/* Nút bỏ phiếu trắng */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCandidate('skip');
                }}
                className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  selectedCandidate === 'skip'
                    ? 'bg-slate-700 border-amber-400 text-amber-300 shadow-md'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60'
                }`}
              >
                <Ban className="w-5 h-5 text-slate-400" />
                <span>Bỏ Phiếu Trắng</span>
                {skipVoteCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-400 font-mono">
                    {skipVoteCount} phiếu
                  </span>
                )}
              </button>

              {/* Danh sách người chơi còn sống */}
              {alivePlayers.map((p) => {
                const votesForThis = voteCounts[p.id] || 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedCandidate(p.id);
                    }}
                    className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition cursor-pointer relative ${
                      selectedCandidate === p.id
                        ? 'bg-red-950/80 border-red-500 text-white shadow-md shadow-red-900/50'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60'
                    }`}
                  >
                    <span className="text-2xl">{p.avatar}</span>
                    <span className="truncate max-w-[90px]">{p.name}</span>
                    {votesForThis > 0 && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-red-600 text-white font-mono font-bold">
                        {votesForThis} phiếu
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleConfirmVote}
              disabled={!selectedCandidate || hasVoted}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-red-950/50"
            >
              <Gavel className="w-4 h-4" />
              {hasVoted ? 'Đã Gửi Lá Phiếu' : 'Xác Nhận Biểu Quyết'}
            </button>
          </>
        )}
      </div>
    );
  }

  return null;
}
