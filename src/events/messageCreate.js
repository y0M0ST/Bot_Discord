import { Events, PermissionsBitField } from 'discord.js';
import 'dotenv/config';

export default {
    name: Events.MessageCreate,
    async execute(message) {
        // 1. Bỏ qua tin nhắn của bot khác
        if (message.author.bot) return;

        // --- 📢 LOG INPUT: In ra Terminal để biết ai đang nhắn gì ---
        if (message.content.startsWith('=')) {
            console.log("-------------------------------------------------");
            console.log(`📩 [INPUT] ${message.author.tag} (Channel: #${message.channel.name})`);
            console.log(`   👉 Nội dung: "${message.content}"`);
        }
        // ------------------------------------------------------------

        // 2. Bỏ qua nếu không bắt đầu bằng dấu "="
        if (!message.content.startsWith('=')) return;

        // 3. Tách lệnh và tham số
        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        console.log(`🔎 [DEBUG] Đang tìm lệnh tên là: "${commandName}"`); // 👈 THÊM DÒNG NÀY

        // 4. Tìm lệnh trong bộ nhớ (Code đã fix nãy)
        const client = message.client;
        const command = client.commands.get(commandName) ||
            [...client.commands.values()].find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) {
            console.log(`⚠️ [WARNING] Không tìm thấy lệnh nào tên là "${commandName}" trong kho lệnh!`); // 👈 THÊM DÒNG NÀY
            return;
        }

        // --- 🚧 KHU VỰC CẤM ĐỊA (LOGIC CHẶN KÊNH CỦA BÀ) 🚧 ---
        const allowedChannelId = process.env.ALLOWED_CHANNEL_ID;

        // Kiểm tra Admin (Thêm dấu ? để tránh lỗi nếu check trong tin nhắn riêng)
        const isAdmin = message.member?.permissions.has(PermissionsBitField.Flags.Administrator);

        if (allowedChannelId && message.channel.id !== allowedChannelId && !isAdmin) {
            // Gửi cảnh báo nhẹ
            const warning = await message.reply(`🚫 **Sai chỗ rùiii em ơi!** Qua kênh <#${allowedChannelId}> mà chơi nhaaaa~~!`);

            // Xoá tin nhắn cảnh báo sau 5 giây cho đỡ rác
            setTimeout(() => {
                warning.delete().catch(() => { });
                message.delete().catch(() => { }); // Xoá luôn lệnh sai
            }, 5000);

            console.log(`🚫 [BLOCK] Đã chặn ${message.author.tag} dùng lệnh [${commandName}] sai kênh.`);
            return; // DỪNG LẠI NGAY
        }
        // ---------------------------------------------

        // 5. Chạy lệnh & Log kết quả
        console.log(`⚙️ [EXECUTE] Đang chạy lệnh: [${command.name}]...`);

        try {
            await command.execute(message, args);
            console.log(`✅ [SUCCESS] Lệnh [${command.name}] đã chạy xong!`);
        } catch (error) {
            console.error(`❌ [ERROR] Lỗi khi chạy lệnh [${command.name}]:`, error);
            message.reply('❌ Có lỗi xảy ra khi thực hiện lệnh này!');
        }
    },
};