//src/commands/viewlog.js
import fs from "fs";
import path from "path";

export default {
    name: "viewlog",
    description: "Xem cấu hình kênh log hiện tại",
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

        const logs = settings.logs || {};

        // Tạo nội dung hiển thị
        let replyText = "📊 Cấu hình kênh log hiện tại:\n";
        const types = ["kick", "ban", "mute", "warn"];

        for (const type of types) {
            const channelId = logs[type];
            if (channelId) {
                const channel = message.guild.channels.cache.get(channelId);
                replyText += `• **${type}** → ${channel ? `#${channel.name} (ID: ${channelId})` : `ID: ${channelId} (không tìm thấy trong server)`
                    }\n`;
            } else {
                replyText += `• **${type}** → ❌ Chưa cấu hình\n`;
            }
        }

        return message.reply(replyText);
    },
};
