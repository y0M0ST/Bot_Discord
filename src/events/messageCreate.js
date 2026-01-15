import { Events, PermissionsBitField } from 'discord.js';
import 'dotenv/config';

export default {
    name: Events.MessageCreate,
    async execute(message) {
        // 1. Bỏ qua tin nhắn của bot khác hoặc không phải lệnh
        if (message.author.bot || !message.content.startsWith('=')) return;

        // 2. Tách lệnh và tham số
        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // 3. Tìm lệnh trong bộ nhớ
        const command = message.client.commands.get(commandName);
        if (!command) return;

        // --- 🚧 KHU VỰC CẤM ĐỊA (LOGIC MỚI) 🚧 ---
        const allowedChannelId = process.env.ALLOWED_CHANNEL_ID;

        // Kiểm tra xem người dùng có phải Admin không?
        const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);

        // Logic chặn:
        // - Nếu ĐÃ CẤU HÌNH kênh cho phép trong .env
        // - VÀ Kênh hiện tại KHÁC kênh cho phép
        // - VÀ Người dùng KHÔNG PHẢI Admin
        if (allowedChannelId && message.channel.id !== allowedChannelId && !isAdmin) {
            // Gửi cảnh báo nhẹ
            const warning = await message.reply(`🚫 **Sai chỗ rồi bà ơi!** Qua kênh <#${allowedChannelId}> mà chơi nha!`);

            // Xoá tin nhắn cảnh báo sau 5 giây cho đỡ rác
            setTimeout(() => {
                warning.delete().catch(() => { });
                message.delete().catch(() => { }); // Xoá luôn lệnh sai của người dùng nếu có quyền
            }, 5000);

            return; // DỪNG LẠI NGAY, KHÔNG CHẠY LỆNH
        }
        // ---------------------------------------------

        // 4. Chạy lệnh
        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('❌ Có lỗi xảy ra khi thực hiện lệnh này!');
        }
    },
};