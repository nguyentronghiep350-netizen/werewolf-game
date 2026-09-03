export const ROLES = {
  VILLAGER: 'villager',
  WEREWOLF: 'werewolf',
  SEER: 'seer',
  BODYGUARD: 'bodyguard',
  WITCH: 'witch',
  HUNTER: 'hunter',
  CUPID: 'cupid',
  JESTER: 'jester',
  ALPHA_WOLF: 'alpha_wolf',
  WHITE_WOLF: 'white_wolf',
  WOLF_PUP: 'wolf_pup',
  TRAITOR: 'traitor',
  REAPER: 'reaper',
  LOVERS: 'lovers',
};

export const TEAMS = {
  VILLAGE: 'village',
  WEREWOLF: 'werewolf',
  SOLO: 'solo',
  LOVERS: 'lovers',
};

export const ROLE_DEFINITIONS = {
  [ROLES.VILLAGER]: {
    id: ROLES.VILLAGER,
    name: 'Dân Làng (The Villager I)',
    team: TEAMS.VILLAGE,
    icon: 'Users',
    cardImage: '/cards/villager.jpg',
    color: '#3b82f6', // blue
    description: 'Thảo luận và tìm ra Ma Sói để bỏ phiếu treo cổ vào ban ngày.',
    detailedLore: 'Một người dân lương thiện trong ngôi làng u ám. Vũ khí lớn nhất của bạn là suy luận và lá phiếu công lý.',
    hasNightAction: false,
  },
  [ROLES.WEREWOLF]: {
    id: ROLES.WEREWOLF,
    name: 'Ma Sói (The Werewolf 0)',
    team: TEAMS.WEREWOLF,
    icon: 'Flame',
    cardImage: '/cards/werewolf.jpg',
    color: '#ef4444', // red
    description: 'Thức dậy ban đêm cùng bầy sói, chat kín và chọn cắn chết 1 người.',
    detailedLore: 'Ẩn mình dưới hình dạng dân làng ban ngày, ban đêm hóa thành nanh vuốt khát máu săn lùng người vô tội.',
    hasNightAction: true,
  },
  [ROLES.SEER]: {
    id: ROLES.SEER,
    name: 'Tiên Tri (The Seer II)',
    team: TEAMS.VILLAGE,
    icon: 'Eye',
    cardImage: '/cards/seer.jpg',
    color: '#8b5cf6', // purple
    description: 'Mỗi đêm được soi danh tính và vai trò của 1 người chơi còn sống.',
    detailedLore: 'Nắm giữ nhãn quan thấu thị của bầu trời đêm, có thể nhìn thấu lớp vỏ bọc để biết ai là đồng minh hay sói độc.',
    hasNightAction: true,
  },
  [ROLES.BODYGUARD]: {
    id: ROLES.BODYGUARD,
    name: 'Bảo Vệ (The Guardian V)',
    team: TEAMS.VILLAGE,
    icon: 'Shield',
    cardImage: '/cards/bodyguard.jpg',
    color: '#10b981', // green
    description: 'Mỗi đêm chọn bảo vệ 1 người (không chọn 1 người 2 đêm liên tiếp).',
    detailedLore: 'Chiến binh quả cảm mang khiên thép, hy sinh thân mình canh giữ trước nanh vuốt của bầy sói hung tợn.',
    hasNightAction: true,
  },
  [ROLES.WITCH]: {
    id: ROLES.WITCH,
    name: 'Phù Thủy (The Witch XIV)',
    team: TEAMS.VILLAGE,
    icon: 'FlaskConical',
    cardImage: '/cards/witch.jpg',
    color: '#ec4899', // pink
    description: 'Có 1 bình Cứu (cứu nạn nhân sói cắn) và 1 bình Độc (đầu độc 1 người).',
    detailedLore: 'Bậc thầy thảo dược cổ xưa, nắm giữ hai lọ thuốc định đoạt ranh giới giữa sự sống và cái chết vĩnh hằng.',
    hasNightAction: true,
  },
  [ROLES.HUNTER]: {
    id: ROLES.HUNTER,
    name: 'Thợ Săn (The Hunter XI)',
    team: TEAMS.VILLAGE,
    icon: 'Crosshair',
    cardImage: '/cards/hunter.jpg',
    color: '#f59e0b', // amber
    description: 'Khi bị chết (sói cắn hoặc treo cổ), được quyền bắn chết 1 người khác.',
    detailedLore: 'Tay súng cự phách luôn nạp sẵn một viên đạn bạc cuối cùng để kéo kẻ thù xuống mồ cùng mình.',
    hasNightAction: false,
  },
  [ROLES.CUPID]: {
    id: ROLES.CUPID,
    name: 'Thần Tình Yêu (The Cupid VI)',
    team: TEAMS.VILLAGE,
    icon: 'Heart',
    cardImage: '/cards/cupid.jpg',
    color: '#f43f5e', // rose
    description: 'Đêm 1 ghép đôi 2 người chơi. Nếu 1 người chết, người kia chết theo!',
    detailedLore: 'Mang đôi cánh tình ái bắn mũi tên thiêng liêng gắn kết hai linh hồn thành định mệnh sống chết có nhau.',
    hasNightAction: true,
    night1Only: true,
  },
  [ROLES.JESTER]: {
    id: ROLES.JESTER,
    name: 'Kẻ Chán Đời (The Fool 0)',
    team: TEAMS.SOLO,
    icon: 'Laugh',
    cardImage: '/cards/jester.jpg',
    color: '#a855f7', // violet
    description: 'Mục tiêu là bị dân làng bỏ phiếu treo cổ ban ngày. Nếu bị treo cổ, bạn thắng!',
    detailedLore: 'Một gã hề điên loạn chán ghét trần gian, luôn tìm cách khiêu khích để dân làng đưa mình lên giàn treo cổ.',
    hasNightAction: false,
  },
  [ROLES.ALPHA_WOLF]: {
    id: ROLES.ALPHA_WOLF,
    name: 'Sói Đầu Đàn (The Alpha Wolf IV)',
    team: TEAMS.WEREWOLF,
    icon: 'Flame',
    cardImage: '/cards/alpha_wolf.jpg',
    color: '#b91c1c', // dark red
    description: 'Chúa tể bầy sói mang vương miện gãy, phiếu bầu cắn người có trọng số quyết định.',
    detailedLore: 'Kẻ thống lĩnh bầy đàn trong màn đêm, tiếng gầm thét thị uy chỉ huy toàn bộ nanh vuốt bóng đêm.',
    hasNightAction: true,
  },
  [ROLES.WHITE_WOLF]: {
    id: ROLES.WHITE_WOLF,
    name: 'Sói Trắng (The White Wolf XIII)',
    team: TEAMS.SOLO,
    icon: 'Flame',
    cardImage: '/cards/white_wolf.jpg',
    color: '#06b6d4', // cyan
    description: 'Bạch lang săn mồi cùng bầy sói nhưng có thể cắn cả sói khác để trở thành kẻ sống sót duy nhất.',
    detailedLore: 'Lạc loài trên vách đá tuyết, tâm địa tàn nhẫn không tin tưởng bất kỳ ai kể cả đồng loại.',
    hasNightAction: true,
  },
  [ROLES.WOLF_PUP]: {
    id: ROLES.WOLF_PUP,
    name: 'Sói Con (The Wolf Pup XIX)',
    team: TEAMS.WEREWOLF,
    icon: 'Flame',
    cardImage: '/cards/wolf_pup.jpg',
    color: '#ea580c', // orange
    description: 'Sói con hung dữ; khi Sói Con bị treo cổ, đêm hôm sau bầy sói nổi giận được cắn 2 người!',
    detailedLore: 'Được che chở bởi cả bầy đàn, cái chết của Sói Con sẽ châm ngòi cho cơn thịnh nộ hủy diệt.',
    hasNightAction: true,
  },
  [ROLES.TRAITOR]: {
    id: ROLES.TRAITOR,
    name: 'Kẻ Phản Bội (The Traitor XV)',
    team: TEAMS.WEREWOLF,
    icon: 'Flame',
    cardImage: '/cards/traitor.jpg',
    color: '#ca8a04', // dark yellow
    description: 'Ban ngày đóng vai học giả dân làng (tiên tri soi ra phe Dân), ban đêm phò tá bầy sói.',
    detailedLore: 'Tâm địa đen tối bán linh hồn cho loài sói để đổi lấy quyền lực và sự báo thù.',
    hasNightAction: false,
  },
  [ROLES.REAPER]: {
    id: ROLES.REAPER,
    name: 'Thần Chết (The Reaper XIII)',
    team: TEAMS.SOLO,
    icon: 'Skull',
    cardImage: '/cards/reaper.jpg',
    color: '#64748b', // slate
    description: 'Tử thần mang lưỡi hái và đồng hồ cát cạn, mỗi đêm có thể đoạt mạng kẻ xấu số.',
    detailedLore: 'Kẻ thu hoạch linh hồn lang thang qua màn sương mù, không thuộc về ánh sáng cũng chẳng thuộc về bóng đêm.',
    hasNightAction: true,
  },
  [ROLES.LOVERS]: {
    id: ROLES.LOVERS,
    name: 'Cặp Đôi (The Lovers VI)',
    team: TEAMS.LOVERS,
    icon: 'Heart',
    cardImage: '/cards/lovers.jpg',
    color: '#e11d48', // rose
    description: 'Hai linh hồn gắn kết định mệnh bằng sợi xích đỏ, sống cùng sống, chết cùng chết.',
    detailedLore: 'Được liên kết bởi thần tình ái, mục tiêu là bảo vệ tri kỷ sống sót đến giây phút cuối cùng.',
    hasNightAction: false,
  },
};

/**
 * Phân bổ vai trò ngẫu nhiên cho danh sách người chơi dựa trên cấu hình
 * @param {Array} players - Danh sách người chơi
 * @param {Object} roleConfig - Số lượng từng vai trò { werewolf: 1, seer: 1, ... }
 */
export function assignRoles(players, roleConfig) {
  const rolePool = [];

  // Đổ cấu hình vai trò vào pool
  for (const [roleId, count] of Object.entries(roleConfig)) {
    for (let i = 0; i < count; i++) {
      if (ROLE_DEFINITIONS[roleId]) {
        rolePool.push(roleId);
      }
    }
  }

  // Nếu số vai trò chưa đủ số người chơi, bổ sung Dân làng
  while (rolePool.length < players.length) {
    rolePool.push(ROLES.VILLAGER);
  }

  // Nếu thừa vai trò thì cắt bớt bằng số người chơi
  if (rolePool.length > players.length) {
    rolePool.length = players.length;
  }

  // Fisher-Yates Shuffle
  for (let i = rolePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rolePool[i], rolePool[j]] = [rolePool[j], rolePool[i]];
  }

  // Gán vai trò cho từng người chơi
  return players.map((player, index) => {
    const roleId = rolePool[index];
    return {
      ...player,
      role: roleId,
      isAlive: true,
      deathReason: null,
      deathNight: null,
      // Dành cho Phù thủy
      witchSaveUsed: false,
      witchKillUsed: false,
      // Dành cho Thợ săn
      hunterShotUsed: false,
      // Dành cho Bảo vệ
      lastProtectedId: null,
      // Dành cho Cupid
      loverId: null,
    };
  });
}

/**
 * Tạo cấu hình vai trò mặc định dựa trên số lượng người chơi
 * @param {number} count 
 */
export function getDefaultRoleConfig(count) {
  if (count <= 4) {
    return {
      [ROLES.WEREWOLF]: 1,
      [ROLES.SEER]: 1,
      [ROLES.BODYGUARD]: 1,
      [ROLES.VILLAGER]: 1,
    };
  }
  if (count <= 6) {
    return {
      [ROLES.WEREWOLF]: 1,
      [ROLES.SEER]: 1,
      [ROLES.BODYGUARD]: 1,
      [ROLES.WITCH]: 1,
      [ROLES.VILLAGER]: count - 4,
    };
  }
  if (count <= 8) {
    return {
      [ROLES.WEREWOLF]: 2,
      [ROLES.SEER]: 1,
      [ROLES.BODYGUARD]: 1,
      [ROLES.WITCH]: 1,
      [ROLES.HUNTER]: 1,
      [ROLES.VILLAGER]: count - 6,
    };
  }
  // 9+ players
  return {
    [ROLES.WEREWOLF]: Math.max(2, Math.floor(count / 3.5)),
    [ROLES.SEER]: 1,
    [ROLES.BODYGUARD]: 1,
    [ROLES.WITCH]: 1,
    [ROLES.HUNTER]: 1,
    [ROLES.CUPID]: 1,
    [ROLES.JESTER]: count >= 10 ? 1 : 0,
    [ROLES.VILLAGER]: Math.max(1, count - (Math.max(2, Math.floor(count / 3.5)) + 4 + (count >= 10 ? 1 : 0))),
  };
}
