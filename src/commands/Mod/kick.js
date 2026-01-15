//src/commands/kick.js
import { EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";

export default {
    name: "kick",
    description: "Kick một thành viên khỏi server",
    category: "Mod",
    async execute(message, args) {
        if (!message.member.permissions.has("KickMembers")) {
            return message.reply("❌ Bạn không có quyền kick thành viên.");
        }

        let member = message.mentions.members.first();
        if (!member && args[0]) {
            try {
                member = await message.guild.members.fetch(args[0]);
            } catch {
                return message.reply("⚠️ Không tìm thấy thành viên với ID này.");
            }
        }

        if (!member) {
            return message.reply("⚠️ Vui lòng tag hoặc nhập ID thành viên cần kick.");
        }

        if (!member.kickable) {
            return message.reply("❌ Bot không thể kick thành viên này (có thể do quyền cao hơn).");
        }

        const reason = args.slice(1).join(" ") || "Không có lý do";

        try {
            await member.kick(reason);

            const resultEmbed = new EmbedBuilder()
                .setColor(0xff9900)
                .setTitle("👢 Thành viên bị kick")
                .setDescription(`**${member.user.tag}** đã bị kick khỏi server.`)
                .addFields(
                    { name: "👮 Người thực hiện", value: message.author.tag, inline: true },
                    { name: "📄 Lý do", value: reason, inline: true }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter({ text: `ID: ${member.user.id}` })
                .setTimestamp();

            await message.reply({ embeds: [resultEmbed] });

            // Đọc logChannelId từ file settings.json
            const settingsPath = path.join(process.cwd(), "src", "config", "settings.json");
            let settings = {};
            try {
                settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
            } catch {
                settings = {};
            }

            const logChannelId = settings.logChannelId || message.client.logChannelId;
            if (logChannelId) {
                const logChannel = message.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    logChannel.send({ embeds: [resultEmbed] });
                }
            }
        } catch (error) {
            console.error(error);
            message.reply("❌ Có lỗi xảy ra khi kick thành viên.");
        }
    },
};
