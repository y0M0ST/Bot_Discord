import { EmbedBuilder, version } from 'discord.js';
import os from 'os'; // Thư viện lấy thông tin máy chủ

export default {
    name: "info", // Hoặc "about", "info"
    description: "Xem thông tin chi tiết về Bot",
    category: "Info",
    execute(message) {
        const client = message.client;

        // Tính thời gian online (Uptime)
        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
        const uptime = `${days} ngày, ${hours} giờ, ${minutes} phút`;

        // Tạo Embed
        const embed = new EmbedBuilder()
            .setColor("#00FFFF") // Màu xanh neon
            .setTitle(`🤖 THÔNG TIN BÉ BOT: ${client.user.username}`)
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription("Bot quản lý kinh tế, đào khoáng, tài xỉu siêu cấp vip pro! và nhiều minigame hấp dẫn khác đang chờ bạn khám phá...!!")
            .addFields(
                { name: "👑 Chủ sở hữu", value: "Cô giáo Mindy (Mindy#xxxx)", inline: true },
                { name: "🏘️ Tổng Server", value: `${client.guilds.cache.size}`, inline: true },
                { name: "👥 Tổng User", value: `${client.users.cache.size}`, inline: true },
                { name: "⏳ Đã chạy được", value: uptime, inline: true },
                { name: "📡 Ping", value: `${client.ws.ping}ms`, inline: true },
                { name: "📚 Thư viện", value: `Discord.js v${version}`, inline: true },
                { name: "🧠 RAM Usage", value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
                { name: "💻 Platform", value: `${os.platform()} (${os.arch()})`, inline: true }
            )
            .setFooter({ text: "Code bởi y0M0ST" })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};