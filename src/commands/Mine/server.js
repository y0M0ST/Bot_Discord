// src/commands/Utility/server.js
import { status } from 'minecraft-server-util';
import { EmbedBuilder } from 'discord.js';

export default {
    name: "server",
    description: "Xem thông tin & danh sách người chơi Server Minecraft",
    category: "Minecraft",
    async execute(message, args) {
        // 1. Kiểm tra đầu vào
        if (!args[0]) {
            return message.reply("⚠️ Nhập IP server đi em! Ví dụ: `=server mc.hypixel.net`");
        }

        const ip = args[0];
        const port = parseInt(args[1]) || 25565;

        const msg = await message.reply("🔍 Đang rình mò server, đợi xíu...");

        try {
            // 2. Lấy thông tin server
            const result = await status(ip, port);

            // 3. Xử lý danh sách người chơi
            let playerList = "👻 Trống (Hoặc server ẩn danh sách)";
            if (result.players.sample && result.players.sample.length > 0) {
                const names = result.players.sample.map(p => `\`${p.name}\``).join(', ');
                playerList = names.length > 1000 ? names.substring(0, 950) + "..." : names;
            }

            // 4. Tạo bảng hiển thị
            const embed = new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle(`🌲 Server: ${ip}`)
                .setThumbnail(`https://api.mcsrvstat.us/icon/${ip}:${port}`)
                .addFields(
                    { name: "Trạng thái", value: "🟢 Online", inline: true },
                    { name: "Phiên bản", value: result.version.name || "?", inline: true },
                    { name: "Ping", value: `${result.roundTripLatency}ms`, inline: true },
                    { name: "Người chơi", value: `**${result.players.online}** / ${result.players.max}`, inline: true },
                    { name: "Địa chỉ", value: `\`${ip}:${port}\``, inline: true },
                )
                .setDescription(`**📜 Danh sách người chơi:**\n${playerList}`)
                .setFooter({ text: result.motd.clean || "Minecraft Server", iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            await msg.edit({ content: null, embeds: [embed] });

        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle(`❌ Không kết nối được: ${ip}`)
                .setDescription("Server đang **OFFLINE** hoặc em nhập sai IP/Port rùi.")
                .setTimestamp();

            await msg.edit({ content: null, embeds: [errorEmbed] });
        }
    },
};