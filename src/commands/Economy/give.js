import { getUserData, updateMoney } from '../../utils/economyHandler.js'; // Import đúng hàm từ Supabase
import { safeReply } from '../../utils/discordHelper.js';

export default {
    name: 'give',
    description: 'Chuyển xu cho người khác',
    aliases: ['pay', 'chuyen', 'ck'],

    async execute(message, args) {
        // 1. Kiểm tra người nhận
        const targetUser = message.mentions.users.first();

        if (!targetUser) {
            return safeReply(message, "⚠️ **Chuyển cho ma hả?** Tag tên người nhận vào đi! (VD: `=give @Mindy 1000`)");
        }

        if (targetUser.id === message.author.id) {
            return safeReply(message, "🙄 **Rảnh ghê!** Tự chuyển tiền cho mình làm chi?");
        }

        if (targetUser.bot) {
            return safeReply(message, "🤖 **Bot không xài tiền!** Cảm ơn tấm lòng của em nha.");
        }

        // 2. Kiểm tra số tiền
        // Lấy số từ args (bỏ qua cái tag <@...>)
        const amountStr = args.find(arg => !arg.startsWith('<@') && !isNaN(arg));
        const amount = parseInt(amountStr);

        if (!amount || isNaN(amount) || amount <= 0) {
            return safeReply(message, "⚠️ **Số tiền ảo quá!** Nhập số dương (>0) nhen.");
        }

        // 3. Kiểm tra tiền của người chuyển (QUAN TRỌNG: Phải dùng await)
        // Vì getUserData là hàm async nên phải có await
        const senderData = await getUserData(message.author.id);

        if (senderData.money < amount) {
            return safeReply(message,
                `💸 **Nghèo mà sang!**\nEm có **${senderData.money.toLocaleString()} xu**, mà đòi chuyển **${amount.toLocaleString()} xu** hả? 🙄`
            );
        }

        // 4. THỰC HIỆN GIAO DỊCH (Trừ người này, cộng người kia)

        // Trừ tiền người gửi (Gửi số âm để hàm updateMoney nó cộng vào -> thành trừ)
        const isSent = await updateMoney(message.author.id, -amount);

        // Cộng tiền người nhận
        const isReceived = await updateMoney(targetUser.id, amount);

        // Kiểm tra xem database có lỗi gì không
        if (!isSent || !isReceived) {
            return safeReply(message, "❌ **Lỗi giao dịch!** Supabase đang bị lag, tiền đã được hoàn lại (hoặc chưa trừ). Thử lại sau nha!");
        }

        // 5. Thông báo thành công
        return safeReply(message,
            `✅ **GIAO DỊCH THÀNH CÔNG!**\n` +
            `📤 **${message.author.username}** đã chuyển: **${amount.toLocaleString()} xu**\n` +
            `📥 Người nhận: **${targetUser.username}**\n` +
            `🤝 *Tình nghĩa anh em chắc có bền lâu?*`
        );
    }
};