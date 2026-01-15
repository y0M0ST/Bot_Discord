//src/commands/pause.js
import { getVoiceConnection } from "@discordjs/voice";

export default {
    name: "pause",
    description: "Tạm dừng phát nhạc",
    category: "Music",
    async execute(message) {
        const connection = getVoiceConnection(message.guild.id);
        if (!connection) return message.reply("⚠️ Bot chưa vào voice channel.");

        const player = connection.state.subscription?.player;
        if (!player) return message.reply("⚠️ Không tìm thấy player.");
        player.pause();
        return message.reply("⏸️ Nhạc đã được tạm dừng.");
    },
};
