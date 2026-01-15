//src/commands/leave.js
import { getVoiceConnection } from "@discordjs/voice";

export default {
    name: "leave",
    description: "Bot rời khỏi voice channel",
        category: "Music",
    async execute(message) {
        const connection = getVoiceConnection(message.guild.id);
        if (!connection) return message.reply("⚠️ Bot chưa ở trong voice channel.");

        connection.destroy();
        return message.reply("👋 Bot đã rời khỏi voice channel.");
    },
};
