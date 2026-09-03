/**
 * AIModerator.js - Bộ Não Điều Phối & Gợi Ý Lời Thoại Quản Trò Cho Ma Sói
 * Tự động phân tích các thẻ bài có trong phòng và sinh kịch bản dẫn dắt từng bước
 */

export class AIModerator {
  /**
   * Sinh danh sách các bước kịch bản ban đêm theo đúng thứ tự logic của các vai trò đang có
   * @param {Array<string>} rolesPresent - Danh sách ID các vai trò có trong ván
   * @param {number} nightNumber - Số đêm hiện tại
   * @returns {Array<Object>}
   */
  static generateNightScript(rolesPresent, nightNumber = 1) {
    const steps = [];

    // Bước 0: Mở màn đêm
    steps.push({
      stepIndex: 0,
      id: 'night_fall',
      title: 'Bóng Tối Buông Xuống',
      roleId: null,
      voicePrompt: 'Đêm đã buông xuống, sương mù bao phủ ngôi làng. Mọi người hãy nhắm mắt và chìm vào giấc ngủ...',
      guideForHost: 'Yêu cầu tất cả người chơi nhắm mắt, cúi đầu hoặc giữ im lặng.',
    });

    // 1. Thần Tình Yêu (Đêm 1 duy nhất)
    if (nightNumber === 1 && rolesPresent.includes('cupid')) {
      steps.push({
        stepIndex: steps.length,
        id: 'cupid_turn',
        title: 'Thần Tình Yêu (The Cupid VI)',
        roleId: 'cupid',
        voicePrompt: 'Thần Tình Yêu hãy thức dậy! Hãy giương cung bắn tên kết đôi 2 người chơi định mệnh...',
        guideForHost: 'Cupid chỉ tay vào 2 người bất kỳ. Quản trò ghi nhận, cho Cupid ngủ, rồi vỗ vai 2 người đó để họ mở mắt nhận diện nhau.',
      });
    }

    // 2. Bảo Vệ (The Guardian)
    if (rolesPresent.includes('bodyguard')) {
      steps.push({
        stepIndex: steps.length,
        id: 'guard_turn',
        title: 'Bảo Vệ (The Guardian V)',
        roleId: 'bodyguard',
        voicePrompt: 'Hiệp Sĩ Bảo Vệ hãy thức dậy! Chọn 1 người bạn muốn dùng khiên thánh bảo hộ đêm nay...',
        guideForHost: 'Bảo vệ chỉ 1 người. Lưu ý: Không được bảo vệ cùng 1 người trong 2 đêm liên tiếp.',
      });
    }

    // 3. Bầy Ma Sói (Werewolves / Alpha Wolf / Wolf Pup)
    const hasWolves = rolesPresent.some((r) => ['werewolf', 'alpha_wolf', 'wolf_pup'].includes(r));
    if (hasWolves) {
      steps.push({
        stepIndex: steps.length,
        id: 'wolves_turn',
        title: 'Bầy Ma Sói (The Werewolves 0)',
        roleId: 'werewolf',
        voicePrompt: 'Bầy Ma Sói hãy thức giấc! Nhìn nhau, nhe nanh vuốt và thống nhất chọn 1 con mồi xấu số...',
        guideForHost: 'Tất cả các Sói mở mắt, cùng chỉ vào 1 người. Nếu có Sói Đầu Đàn, ý kiến Sói Đầu Đàn có trọng lượng cao nhất.',
      });
    }

    // 4. Sói Trắng (Đêm chẵn: Đêm 2, 4...)
    if (rolesPresent.includes('white_wolf') && nightNumber % 2 === 0) {
      steps.push({
        stepIndex: steps.length,
        id: 'white_wolf_turn',
        title: 'Sói Trắng Đơn Độc (The White Wolf XIII)',
        roleId: 'white_wolf',
        voicePrompt: 'Bạch Lang Sói Trắng hãy thức dậy! Bạn có muốn cắn chết 1 con Sói khác đêm nay không?',
        guideForHost: 'Sói trắng có quyền chỉ vào 1 con sói khác để tiêu diệt, hoặc lắc đầu để bỏ qua.',
      });
    }

    // 5. Tiên Tri (The Seer)
    if (rolesPresent.includes('seer')) {
      steps.push({
        stepIndex: steps.length,
        id: 'seer_turn',
        title: 'Tiên Tri (The Seer II)',
        roleId: 'seer',
        voicePrompt: 'Tiên Tri thông thái hãy thức dậy! Mở nhãn quan và chỉ vào 1 người bạn muốn soi danh tính...',
        guideForHost: 'Tiên tri chỉ 1 người. Quản trò ra dấu: Ngón tay cái CHỈ LÊN (Dân làng/Đồng minh) hoặc CHỈ XUỐNG (Phe Sói).',
      });
    }

    // 6. Phù Thủy (The Witch)
    if (rolesPresent.includes('witch')) {
      steps.push({
        stepIndex: steps.length,
        id: 'witch_turn',
        title: 'Phù Thủy (The Witch XIV)',
        roleId: 'witch',
        voicePrompt: 'Phù Thủy hãy thức dậy! Đây là nạn nhân bị Sói cắn... Bạn có dùng bình Cứu không? Có dùng bình Độc không?',
        guideForHost: 'Quản trò chỉ tay vào nạn nhân sói cắn. Phù thủy gật đầu để cứu (mất bình Cứu), hoặc lắc đầu và chỉ 1 người để giết (mất bình Độc).',
      });
    }

    // 7. Thần Chết (The Reaper)
    if (rolesPresent.includes('reaper')) {
      steps.push({
        stepIndex: steps.length,
        id: 'reaper_turn',
        title: 'Thần Chết (The Reaper XIII)',
        roleId: 'reaper',
        voicePrompt: 'Thần Chết hãy thức dậy! Vung lưỡi hái bạc và chỉ vào kẻ mà đồng hồ cát đã cạn...',
        guideForHost: 'Thần chết chọn 1 nạn nhân đoạt mạng.',
      });
    }

    // Bước cuối: Trời sáng
    steps.push({
      stepIndex: steps.length,
      id: 'daybreak',
      title: 'Bình Minh Lên (Trời Sáng)',
      roleId: null,
      voicePrompt: 'Gà đã gáy sáng, ánh mặt trời xua tan bóng đêm. Mọi người hãy cùng thức dậy đón tin tức!',
      guideForHost: 'Tuyên bố danh tính những ai đã tử trận trong đêm. Nếu Thợ Săn chết, cho Thợ Săn nổ súng trả thù ngay lập tức!',
    });

    return steps;
  }

  /**
   * Sinh lời gợi ý thảo luận ban ngày của AI Quản Trò
   */
  static generateDayDiscussionTips(dayNumber, deadCount, aliveCount) {
    const tips = [
      'Hãy chú ý đến những người thay đổi lời khai đột ngột hoặc hùa theo đám đông quá nhanh!',
      'Người giữ im lặng quá mức ban ngày thường là Ma Sói đang cố gắng ẩn mình an toàn.',
      'Tiên tri và Bảo vệ hãy phối hợp khéo léo để đưa ra manh mối mà không bị Sói tập trung cắn.',
      'Đừng quên Kẻ Chán Đời (Jester) có thể đang cố tình khiêu khích bạn để bị treo cổ!',
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }
}
