import { EmbedBuilder, version as djsVersion } from "discord.js";

export default {
    name: "info",
    description: "Hiển thị thông tin bot",
    category: "Bot",
    async execute(message) {
        const client = message.client;

        // Tên bot + ID
        const botName = client.user.username;
        const botId = client.user.id;

        // Uptime
        const uptimeMs = client.uptime;
        const totalSeconds = Math.floor(uptimeMs / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // Số server và user
        const serverCount = client.guilds.cache.size;
        const userCount = client.users.cache.size;

        // Ngày tạo bot
        const createdAt = client.user.createdAt.toLocaleDateString("vi-VN");

        // Prefix (cố định là "=" trong code của bạn)
        const prefix = "=";

        const embed = new EmbedBuilder()
            .setColor(0x00bfff)
            .setTitle("🤖 Thông tin bot")
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: "Tên bot", value: botName, inline: true },
                { name: "🆔 ID", value: botId, inline: true },
                { name: "⏱️ Uptime", value: uptimeString, inline: true },
                { name: "🌐 Server tham gia", value: `${serverCount}`, inline: true },
                { name: "👥 Người dùng cache", value: `${userCount}`, inline: true },
                { name: "📅 Ngày tạo bot", value: createdAt, inline: true },
                { name: "⚙️ Discord.js", value: `v${djsVersion}`, inline: true },
                { name: "🔑 Prefix", value: prefix, inline: true }
            )
            .setFooter({ text: `Yêu cầu bởi ${message.author.tag}` })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    },
};
