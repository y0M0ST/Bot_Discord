import { Events, PermissionsBitField } from 'discord.js';
import 'dotenv/config';
import { safeReply } from '../utils/discordHelper.js';

export default {
    name: Events.MessageCreate,
    async execute(message) {
        // 1. Bỏ qua Bot
        if (message.author.bot) return;

        // 2. Chỉ xử lý lệnh bắt đầu bằng "="
        if (!message.content.startsWith('=')) return;

        // --- 📢 LOG ---
        console.log(`📩 [CMD] ${message.author.tag}: ${message.content}`);

        // 3. Tách lệnh
        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Chặn lệnh rác
        if (!/^[a-zA-Z0-9]+$/.test(commandName)) return;

        // Tìm lệnh
        const client = message.client;
        const command = client.commands.get(commandName) ||
            [...client.commands.values()].find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        // ======================================================
        // 🚫 LOGIC CẤM: KHÔNG ĐƯỢC DÙNG Ở CHAT CHUNG
        // ======================================================
        const generalChatId = process.env.ALLOWED_CHANNEL_ID; // Lấy ID Chat Chung
        const isAdmin = message.member?.permissions.has(PermissionsBitField.Flags.Administrator);

        // Nếu đang ở Chat Chung VÀ không phải Admin -> CẤM
        if (generalChatId && message.channel.id === generalChatId && !isAdmin) {
            const warning = await safeReply(message,
                `🚫 **Không dùng lệnh ở đây nha em!**\nQua kênh Bot để Chat Chung đỡ bị trôi tin nhắn nhen! 🧹`
            );

            // Xoá cảnh báo và tin nhắn gốc sau 5s
            if (warning) {
                setTimeout(() => {
                    warning.delete().catch(() => { });
                    message.delete().catch(() => { });
                }, 5000);
            }
            return; // DỪNG LẠI
        }

        // 4. Chạy lệnh (Nếu không bị cấm)
        try {
            await command.execute(message, args);
            console.log(`✅ [SUCCESS] Lệnh [${command.name}] OK.`);
        } catch (error) {
            console.error(`❌ [ERROR] Lỗi lệnh:`, error);
            safeReply(message, '❌ Có lỗi xảy ra!');
        }
    }
};