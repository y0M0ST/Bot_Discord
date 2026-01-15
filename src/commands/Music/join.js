// src/commands/Music/join.js
import { Constants } from "discord.js";

export default {
    name: "join",
    description: "Mời bot vào kênh voice (DisTube)",
    category: "Music",
    async execute(message) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply("⚠️ Em phải vào phòng voice trước đã!");

        try {
            // DisTube tự quản lý voice connection
            message.client.distube.voices.join(voiceChannel);
            message.reply("👋 Cô đã vào rùi nè!");
        } catch (e) {
            message.reply("❌ Lỗi: " + e.message);
        }
    },
};