import { Events, PermissionsBitField } from 'discord.js';
import { config } from '../config/env.js';
import { safeReply } from '../utils/discordHelper.js';
import logger from '../utils/logger.js'; // Nhập Logger

export default {
    name: Events.MessageCreate,
    async execute(message) {
        // 1. Bỏ qua Bot
        if (message.author.bot) return;

        // 2. Chỉ xử lý lệnh bắt đầu bằng "="
        if (!message.content.startsWith('=')) return;

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
        const generalChatId = config.ALLOWED_CHANNEL_ID; // Lấy ID Chat Chung
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
            // 🔥 LOG LỆNH TRƯỚC KHI CHẠY
            logger.command(message.author, commandName, message.channel);

            await command.execute(message, args);
            // console.log(`✅ [SUCCESS] Lệnh [${command.name}] OK.`); -> Logger lo rồi
        } catch (error) {
            logger.error(`Lỗi khi chạy lệnh [${commandName}]`, error); // Logger bắt lỗi này luôn
            safeReply(message, '❌ Có lỗi xảy ra!');
        }
    }
};