import { Events, PermissionsBitField } from 'discord.js';
import 'dotenv/config';
import { askMindy } from '../utils/geminiHelper.js';
import { safeReply } from '../utils/discordHelper.js';

export default {
    name: Events.MessageCreate,
    async execute(message) {
        // 1. Bỏ qua tin nhắn của bot khác
        if (message.author.bot) return;

        // ======================================================
        // 🛡️ PHẦN 1: XỬ LÝ LỆNH (Bắt đầu bằng dấu "=")
        // 👉 CHO PHÉP DÙNG Ở MỌI NƠI (Không chặn kênh nữa)
        // ======================================================
        if (message.content.startsWith('=')) {

            // Log nhẹ cái input để bà theo dõi
            console.log(`📩 [CMD] ${message.author.tag}: ${message.content}`);

            // Tách lệnh
            const args = message.content.slice(1).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            // Chặn lệnh rác (=)), =.=)
            if (!/^[a-zA-Z0-9]+$/.test(commandName)) return;

            // Tìm lệnh (Có hỗ trợ Alias)
            const client = message.client;
            const command = client.commands.get(commandName) ||
                [...client.commands.values()].find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) return; // Không có lệnh thì thôi, im lặng

            // --- ⚠️ TUI ĐÃ XOÁ ĐOẠN CHECK CHANNEL Ở ĐÂY ---
            // Giờ member đứng ở đâu gõ lệnh cũng được hết!

            // Chạy lệnh
            try {
                await command.execute(message, args);
                console.log(`✅ [SUCCESS] Lệnh [${command.name}] OK.`);
            } catch (error) {
                console.error(`❌ [ERROR] Lỗi lệnh [${command.name}]:`, error);
                safeReply(message, '❌ Có lỗi xảy ra khi thực hiện lệnh này!');
            }
            return; // Xong lệnh thì thoát
        }

        // ======================================================
        // 🧠 PHẦN 2: AI MINDY (Tag @Mindy là trả lời)
        // 👉 CHỈ CHO PHÉP DÙNG Ở KÊNH QUY ĐỊNH (ALLOWED_CHANNEL_ID)
        // ======================================================
        if (message.mentions.has(message.client.user)) {

            // --- 🚧 LOGIC CHẶN KÊNH CHỈ ÁP DỤNG CHO AI 🚧 ---
            const allowedChannelId = process.env.ALLOWED_CHANNEL_ID;
            const isAdmin = message.member?.permissions.has(PermissionsBitField.Flags.Administrator);

            // Nếu có cài kênh quy định VÀ sai kênh VÀ không phải Admin
            if (allowedChannelId && message.channel.id !== allowedChannelId && !isAdmin) {
                const warning = await safeReply(message,
                    `🚫 **Sai khu vực rồi!** Qua kênh <#${allowedChannelId}> tâm sự với cô nhen! 😘`
                );
                // Xoá cảnh báo sau 5s
                if (warning) setTimeout(() => warning.delete().catch(() => { }), 5000);

                return; // Chặn không cho AI trả lời
            }

            // --- NẾU ĐÚNG KÊNH THÌ TRẢ LỜI ---
            await message.channel.sendTyping();
            const question = message.content.replace(`<@${message.client.user.id}>`, '').trim();

            if (!question) {
                return safeReply(message, "Hửm? Gọi cô có việc gì dợ? Hỏi gì đi nè! 😘");
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
    },
};