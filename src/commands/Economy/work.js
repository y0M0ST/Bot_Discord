// src/commands/Economy/work.js
import { updateMoney, getUserData, updateWorkTime } from '../../utils/economyHandler.js';

export default {
    name: "work",
    description: "Đi làm kiếm tiền (15 phút/lần)",
    category: "Economy",
    async execute(message, args) {
        const userId = message.author.id;

        // 1. Lấy dữ liệu user
        const userData = await getUserData(userId);

        // 2. Check Cooldown (Thời gian chờ)
        const lastWorked = userData.lastWorked || 0;

        // ⚠️ LƯU Ý: Sửa số 15 thành số 1 nếu bà muốn test nhanh 1 phút/lần
        const cooldownTime = 15 * 60 * 1000; // 15 phút đổi ra mili giây

        const timePassed = Date.now() - lastWorked;

        // Nếu chưa hết thời gian chờ
        if (timePassed < cooldownTime) {
            const timeLeft = cooldownTime - timePassed;

            // Tính toán Phút và Giây
            const minutes = Math.floor(timeLeft / 60000); // Lấy phần nguyên của phút
            const seconds = Math.ceil((timeLeft % 60000) / 1000); // Lấy phần dư ra giây

            return message.reply(`⏳ Bà mới đi làm về mà! Nghỉ ngơi xíu đi.\nQuay lại sau **${minutes} phút ${seconds} giây** nữa nha!`);
        }

        // 3. // Tầm 50 - 300 xu thôi, để ép người ta phải đi đào mới giàu được.
        const earned = Math.floor(Math.random() * (300 - 50 + 1)) + 50;

        const jobs = [
            "đi đào đá", "chặt gỗ thuê", "bán vé số", "code dạo",
            "phụ hồ", "trông trẻ", "làm nail", "bán hàng online",
            "giao hàng", "làm bánh mì", "làm cửu vạn", "làm shipper"
        ];
        const randomJob = jobs[Math.floor(Math.random() * jobs.length)];

        // 4. Lưu vào Database
        await updateMoney(userId, earned);
        await updateWorkTime(userId);

        message.reply(`👷 **${message.author.username}** đã **${randomJob}** và kiếm được **${earned} Xu**! 💸`);
    },
};