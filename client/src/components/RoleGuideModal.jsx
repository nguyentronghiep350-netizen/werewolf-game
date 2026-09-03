import React from 'react';
import { X, Shield, Eye, Flame, Users, FlaskConical, Crosshair, Heart, Laugh } from 'lucide-react';

export const ROLE_ICONS = {
  villager: Users,
  werewolf: Flame,
  seer: Eye,
  bodyguard: Shield,
  witch: FlaskConical,
  hunter: Crosshair,
  cupid: Heart,
  jester: Laugh,
  white_wolf: Flame,
  alpha_wolf: Flame,
  wolf_pup: Flame,
  traitor: Flame,
  reaper: SkullIcon,
};

function SkullIcon(props) {
  return <span {...props}>💀</span>;
}

export const ROLE_DATA = [
  {
    id: 'villager',
    name: 'Dân Làng (The Villager I)',
    team: 'Phe Dân',
    badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-700',
    cardImage: '/cards/villager.jpg',
    icon: Users,
    desc: 'Người dân lương thiện không có kỹ năng đặc biệt ban đêm. Vũ khí lớn nhất là khả năng suy luận, tranh luận và bỏ phiếu tìm ra Sói ban ngày.',
    tips: 'Hãy quan sát cử chỉ, sự mâu thuẫn trong lời khai của những người khác để tìm ra Ma Sói!',
  },
  {
    id: 'werewolf',
    name: 'Ma Sói (The Werewolf 0)',
    team: 'Phe Sói',
    badgeColor: 'bg-red-900/60 text-red-300 border-red-700',
    cardImage: '/cards/werewolf.jpg',
    icon: Flame,
    desc: 'Ban đêm thức dậy họp cùng đồng bọn qua Kênh Sói bí mật để thống nhất cắn chết 1 người. Ban ngày ngụy trang như dân lương thiện.',
    tips: 'Tránh hùa vote quá lộ liễu, cố gắng tạo lòng tin hoặc đổ tội cho người chơi khác!',
  },
  {
    id: 'seer',
    name: 'Tiên Tri (The Seer II)',
    team: 'Phe Dân',
    badgeColor: 'bg-purple-900/60 text-purple-300 border-purple-700',
    cardImage: '/cards/seer.jpg',
    icon: Eye,
    desc: 'Mỗi đêm được soi danh tính thực sự của 1 người chơi còn sống để biết người đó thuộc phe nào / vai trò gì.',
    tips: 'Đừng vội lộ danh tính quá sớm ở đêm 1-2 kẻo bị Sói cắn trước khi kịp soi ra manh mối quan trọng!',
  },
  {
    id: 'bodyguard',
    name: 'Bảo Vệ (The Guardian V)',
    team: 'Phe Dân',
    badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
    cardImage: '/cards/bodyguard.jpg',
    icon: Shield,
    desc: 'Mỗi đêm chọn bảo vệ 1 người khỏi đòn cắn của Ma Sói. Không được bảo vệ cùng 1 người 2 đêm liên tiếp. Nạn nhân được bảo vệ sẽ sống sót!',
    tips: 'Hãy suy đoán xem Sói muốn cắn ai nhất đêm nay (thường là Tiên tri hoặc người dẫn dắt thảo luận)!',
  },
  {
    id: 'witch',
    name: 'Phù Thủy (The Witch XIV)',
    team: 'Phe Dân',
    badgeColor: 'bg-pink-900/60 text-pink-300 border-pink-700',
    cardImage: '/cards/witch.jpg',
    icon: FlaskConical,
    desc: 'Sở hữu 2 bình thuốc thần kỳ: 1 bình Cứu người bị Sói cắn và 1 bình Độc để đầu độc bất kỳ ai. Mỗi bình dùng 1 lần duy nhất cả ván.',
    tips: 'Nên dùng bình cứu sớm để giữ quân số cho phe Dân, dùng bình độc khi đã chắc chắn 80-90% mục tiêu là Sói!',
  },
  {
    id: 'hunter',
    name: 'Thợ Săn (The Hunter XI)',
    team: 'Phe Dân',
    badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700',
    cardImage: '/cards/hunter.jpg',
    icon: Crosshair,
    desc: 'Khi bị chết (do Sói cắn hoặc bị treo cổ), Thợ Săn được quyền giương súng bắn chết thêm 1 người chơi khác trước khi nhắm mắt.',
    tips: 'Nếu bị đưa lên giàn treo cổ, hãy đe dọa phe Sói hoặc bắn kẻ bạn nghi ngờ nhất trước khi chết!',
  },
  {
    id: 'cupid',
    name: 'Thần Tình Yêu (The Cupid VI)',
    team: 'Đặc Biệt',
    badgeColor: 'bg-rose-900/60 text-rose-300 border-rose-700',
    cardImage: '/cards/cupid.jpg',
    icon: Heart,
    desc: 'Trong đêm 1, bắn tên kết đôi 2 người chơi. Nếu 1 người chết, người kia chết theo. Nếu cặp đôi 1 Sói 1 Dân, họ biến thành Phe Thứ 3!',
    tips: 'Có thể ghép đôi bất kỳ ai, thậm chí ghép đôi chính mình để tìm tri kỷ sinh tử!',
  },
  {
    id: 'jester',
    name: 'Kẻ Chán Đời (The Fool 0)',
    team: 'Phe Thứ 3',
    badgeColor: 'bg-violet-900/60 text-violet-300 border-violet-700',
    cardImage: '/cards/jester.jpg',
    icon: Laugh,
    desc: 'Kẻ lập dị chán ghét cuộc sống. Mục tiêu duy nhất là bị dân làng bỏ phiếu treo cổ ban ngày. Nếu bị treo cổ, Jester thắng ngay lập tức!',
    tips: 'Hãy diễn như một tên Sói nghiệp dư, nói năng mâu thuẫn để dân làng nghi ngờ và dồn phiếu treo cổ bạn!',
  },
  {
    id: 'alpha_wolf',
    name: 'Sói Đầu Đàn (The Alpha Wolf IV)',
    team: 'Phe Sói',
    badgeColor: 'bg-red-950 text-red-300 border-red-800',
    cardImage: '/cards/alpha_wolf.jpg',
    icon: Flame,
    desc: 'Chúa tể bầy sói mang vương miện gãy, tiếng hú uy lực chỉ huy toàn bộ đàn sói trong đêm.',
    tips: 'Là thủ lĩnh bóng đêm, phiếu bầu cắn người có thể mang tính quyết định.',
  },
  {
    id: 'white_wolf',
    name: 'Sói Trắng (The White Wolf XIII)',
    team: 'Sói Đơn Độc',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    cardImage: '/cards/white_wolf.jpg',
    icon: Flame,
    desc: 'Bạch lang cô độc trên đỉnh núi tuyết, ban đêm săn cùng bầy sói nhưng có thể cắn chết cả đồng đội sói để trở thành kẻ sống sót duy nhất.',
    tips: 'Giấu mình thật kỹ cho đến những vòng cuối để kết liễu cả sói lẫn dân!',
  },
  {
    id: 'wolf_pup',
    name: 'Sói Con (The Wolf Pup XIX)',
    team: 'Phe Sói',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    cardImage: '/cards/wolf_pup.jpg',
    icon: Flame,
    desc: 'Sói con đáng yêu mang vuốt quỷ. Khi Sói Con bị dân làng treo cổ, bầy sói tức giận sẽ được cắn 2 người vào đêm tiếp theo!',
    tips: 'Hi sinh đúng lúc có thể đem lại lợi thế hủy diệt cho bầy sói.',
  },
  {
    id: 'traitor',
    name: 'Kẻ Phản Bội (The Traitor XV)',
    team: 'Phe Sói',
    badgeColor: 'bg-yellow-950 text-yellow-300 border-yellow-800',
    cardImage: '/cards/traitor.jpg',
    icon: Flame,
    desc: 'Mang hai bộ mặt: ban ngày là học giả thông thái, ban đêm là quái thú lăm lăm dao độc phản bội lại ngôi làng.',
    tips: 'Tiên tri soi Kẻ Phản Bội lúc đầu vẫn thấy là Dân làng cho đến khi thức tỉnh!',
  },
];

export default function RoleGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🃏</span>
            <h2 className="text-xl font-bold text-white tracking-wide">
              BỘ BÀI TAROT MA SÓI (JOJO STARDUST CRUSADERS)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROLE_DATA.map((role) => {
              return (
                <div
                  key={role.id}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex gap-4 hover:border-amber-500/60 transition group"
                >
                  {/* Card Art Thumbnail */}
                  <div className="w-24 h-36 shrink-0 rounded-xl overflow-hidden border border-amber-400/60 shadow-lg bg-slate-900">
                    <img
                      src={role.cardImage}
                      alt={role.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h3 className="font-bold text-white text-sm truncate">{role.name}</h3>
                        <span className={`text-[10px] px-2 py-0.2 rounded-full border font-medium shrink-0 ${role.badgeColor}`}>
                          {role.team}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-2 line-clamp-3">
                        {role.desc}
                      </p>
                    </div>
                    <div className="text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-700/50 text-amber-300/90 italic">
                      💡 Mẹo: {role.tips}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition cursor-pointer"
          >
            Đóng Cẩm Nang
          </button>
        </div>
      </div>
    </div>
  );
}
