import { updateMoney } from '../../utils/economyHelper.js'; // Nhớ check tên file helper nha
import { safeReply } from '../../utils/discordHelper.js';

// 👇 ID CỦA BÀ (Người duy nhất được dùng lệnh này)
// Bà thay dãy số này bằng ID Discord của bà nha
const OWNER_ID = '208680432424845314';

export default {
    name: 'tang',
    description: 'Admin buff tiền cho member',
    aliases: ['addmoney', 'buff', 'inmoney'], // Tên gọi khác

    async execute(message, args) {
        // 1. 🔒 KIỂM TRA QUYỀN (Quan trọng nhất)
        if (message.author.id !== OWNER_ID) {
            return safeReply(message, "🚫 **Tuổi gì mà đòi in tiền?** Lệnh này chỉ dành cho Sếp tổng (Admin) thôi cưng ơi! 😎");
        }

        // 2. Kiểm tra người được nhận
        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return safeReply(message, "⚠️ **Buff cho ai?** Tag tên người may mắn vào đi! (VD: `=tang @User 50000`)");
        }

        if (targetUser.bot) {
            return safeReply(message, "🤖 Bot giàu lắm rồi, không cần tiền đâu!");
        }

        // 3. Lấy số tiền cần buff
        const amountStr = args.find(arg => !arg.startsWith('<@') && !isNaN(arg));
        const amount = parseInt(amountStr);

        if (!amount || isNaN(amount) || amount <= 0) {
            return safeReply(message, "⚠️ **Nhập số tiền đàng hoàng coi!** Phải là số dương nha.");
        }

        // 4. THỰC HIỆN "IN TIỀN" (Chỉ cần cộng, không cần trừ của ai cả)
        const isSuccess = await updateMoney(targetUser.id, amount);

        if (!isSuccess) {
            return safeReply(message, "❌ **Lỗi Supabase!** Không in được tiền rồi, check lại Database đi bà.");
        }

        // 5. Thông báo ngầu
        return safeReply(message,
            `💎 **THẦN TÀI ĐẾN!** 💎\n` +
            `Sếp y0M0ST **${message.author.username}** vừa vung tay ban phát **${amount.toLocaleString()} xu** cho **${targetUser.username}**!\n` +
            `*Sướng nhất em rồi nhé! Tiêu xài cho kỹ vào!* 🤑`
        );
    }
};