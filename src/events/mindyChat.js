import { Events, PermissionsBitField } from 'discord.js';
import 'dotenv/config';
import { askMindy } from '../utils/geminiHelper.js';
import { safeReply } from '../utils/discordHelper.js';

export default {
    name: Events.MessageCreate, // Vẫn lắng nghe sự kiện tin nhắn
    async execute(message) {
        if (message.author.bot) return;

        // Chỉ xử lý khi Tag Bot
        if (!message.mentions.has(message.client.user)) return;

        // ======================================================
        // 🔒 LOGIC CHỌN LỌC: CHỈ ĐƯỢC DÙNG Ở KÊNH MINDY
        // ======================================================
        const mindyChatId = process.env.MINDY_CHANNEL_ID; // Lấy ID Kênh Mindy
        const isAdmin = message.member?.permissions.has(PermissionsBitField.Flags.Administrator);

        // Nếu có quy định kênh Mindy VÀ đang chat sai chỗ VÀ không phải Admin
        if (mindyChatId && message.channel.id !== mindyChatId && !isAdmin) {
            const warning = await safeReply(message,
                `🚫 **Sai chỗ rùiii!**\nQua kênh <#${mindyChatId}> để tâm sự riêng với cô nhen! 😘`
            );
            if (warning) setTimeout(() => warning.delete().catch(() => { }), 5000);
            return; // DỪNG LẠI
        }

        // --- XỬ LÝ AI ---
        await message.channel.sendTyping();
        const question = message.content.replace(`<@${message.client.user.id}>`, '').trim();

        if (!question) {
            return safeReply(message, "Hửm? Tag cô chi dợ? Hỏi gì đi nè! 😘");
        }

        try {
            const answer = await askMindy(question);

            if (answer.length > 2000) {
                return safeReply(message, {
                    content: "Ui dài quá, cô gửi file nhen!",
                    files: [{ attachment: Buffer.from(answer), name: 'mindy-tra-loi.txt' }]
                });
            }
            await safeReply(message, answer);

        } catch (err) {
            console.error("Lỗi AI:", err);
            safeReply(message, "Cô đang bị lag não xíu, hỏi lại sau nha! 🤕");
        }
    }
};