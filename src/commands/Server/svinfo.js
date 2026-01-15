//src/commands/svinfo.js
import { EmbedBuilder } from "discord.js";
import logger from "../../utils/logger.js";

export default {
    name: "svinfo",
    description: "Hiển thị thông tin và thống kê server",
    category: "Server",
    async execute(message) {
        try {
            const guild = message.guild;

            // Tính số ngày tuổi server
            const createdAt = guild.createdAt; // ngày tạo server
            const now = new Date();
            const diffTime = Math.abs(now - createdAt);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            const embed = new EmbedBuilder()
                .setColor(0x9b59b6)
                .setTitle(`🏰 Thông tin & Thống kê server: ${guild.name}`)
                .setThumbnail(guild.iconURL())
                .addFields(
                    { name: "🆔 ID", value: guild.id, inline: true },
                    { name: "👑 Chủ server", value: `<@${guild.ownerId}>`, inline: true },
                    { name: "📅 Tạo server", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: "📆 Tuổi server", value: `${diffDays} ngày`, inline: true },
                    { name: "👥 Thành viên", value: guild.memberCount.toString(), inline: true },
                    { name: "📂 Kênh", value: guild.channels.cache.size.toString(), inline: true },
                    { name: "🏷️ Roles", value: guild.roles.cache.size.toString(), inline: true }
                )
                .setFooter({ text: `Yêu cầu bởi ${message.author.tag}` })
                .setTimestamp();

            logger.info(`Lệnh svinfo được gọi bởi ${message.author.tag}`);
            return message.reply({ embeds: [embed] });
        } catch (error) {
            logger.error("Lỗi khi chạy lệnh svinfo", error);
            return message.reply("⚠️ Có lỗi xảy ra, xem chi tiết trong console.");
        }
    },
};
