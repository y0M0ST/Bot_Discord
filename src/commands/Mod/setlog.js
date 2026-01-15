//src/commands/setlog.js
import fs from "fs";
import path from "path";
import { EmbedBuilder } from "discord.js";

export default {
    name: "setlog",
    description: "Chọn kênh log cho từng chức năng hoặc tất cả",
    category: "Mod",
    async execute(message, args) {
        if (!message.member.permissions.has("Administrator")) {
            return message.reply("❌ Bạn cần quyền Administrator để dùng lệnh này.");
        }

        const settingsPath = path.join(process.cwd(), "src", "config", "settings.json");
        let settings = {};
        try {
            settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
        } catch {
            settings = { logs: {} };
        }

        // Nếu không có tham số => cảnh báo + hướng dẫn
        if (args.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(0xffcc00)
                .setTitle("⚠️ Hướng dẫn sử dụng lệnh =setlog")
                .setDescription(
                    "Bạn cần nhập **loại log** và **kênh** để cấu hình.\n\n" +
                    "Các loại log hỗ trợ: `kick`, `ban`, `mute`, `warn`, hoặc `all`\n\n" +
                    "📌 Ví dụ:\n" +
                    "`=setlog kick #mod-log`\n" +
                    "`=setlog ban 123456789012345678`\n" +
                    "`=setlog mute mute-log`\n" +
                    "`=setlog all #mod-log` (áp dụng cho tất cả)\n\n" +
                    "👉 Nếu muốn xem cấu hình hiện tại, hãy gõ lại `=setlog view`"
                )
                .setFooter({ text: `Yêu cầu bởi ${message.author.tag}` })
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        // Nếu admin gõ =setlog view => hiển thị cấu hình hiện tại
        if (args[0].toLowerCase() === "view") {
            const logs = settings.logs || {};
            const types = ["kick", "ban", "mute", "warn"];

            const embed = new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle("📊 Cấu hình kênh log hiện tại")
                .setTimestamp()
                .setFooter({ text: `Yêu cầu bởi ${message.author.tag}` });

            for (const type of types) {
                const channelId = logs[type];
                let value;
                if (channelId) {
                    const channel = message.guild.channels.cache.get(channelId);
                    value = channel
                        ? `#${channel.name} (ID: ${channelId})`
                        : `ID: ${channelId} (❌ không tìm thấy trong server)`;
                } else {
                    value = "❌ Chưa cấu hình";
                }
                embed.addFields({ name: type.toUpperCase(), value, inline: false });
            }

            return message.reply({ embeds: [embed] });
        }

        // Nếu có tham số => tiến hành setlog
        const type = args[0].toLowerCase();
        const channel = message.mentions.channels.first()
            || (args[1] ? message.guild.channels.cache.get(args[1]) : null);

        if (!["kick", "ban", "mute", "warn", "all"].includes(type)) {
            return message.reply(
                "⚠️ Loại log không hợp lệ. Hãy chọn một trong: kick, ban, mute, warn, all.\n" +
                "Ví dụ: `=setlog kick #mod-log` hoặc `=setlog all #mod-log`"
            );
        }

        if (!channel) {
            return message.reply(
                "⚠️ Vui lòng tag một kênh hoặc nhập ID kênh.\n" +
                "Ví dụ: `=setlog kick #mod-log` hoặc `=setlog all 123456789012345678`"
            );
        }

        if (!settings.logs) settings.logs = {};

        if (type === "all") {
            // Áp dụng cho tất cả loại log
            ["kick", "ban", "mute", "warn"].forEach((t) => {
                settings.logs[t] = channel.id;
            });
        } else {
            settings.logs[type] = channel.id;
        }

        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        return message.reply(
            `✅ Đã đặt kênh log cho **${type === "all" ? "tất cả chức năng" : type}**:\n` +
            `📌 Tên kênh: **${channel.name}**\n` +
            `🆔 ID kênh: \`${channel.id}\``
        );
    },
};
