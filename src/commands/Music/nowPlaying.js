import { EmbedBuilder } from "discord.js";

export default {
    name: "nowplaying",
    description: "Xem bài đang phát",
    category: "Music",
    async execute(message) {
        const queue = message.client.distube.getQueue(message);
        if (!queue) return message.reply("📭 Không có gì đang phát.");

        const song = queue.songs[0];

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("🎶 Đang phát")
            .setDescription(`**[${song.name}](${song.url})**`)
            .addFields(
                { name: "Thời lượng", value: `\`${queue.formattedCurrentTime} / ${song.formattedDuration}\``, inline: true },
                { name: "Yêu cầu bởi", value: `${song.user}`, inline: true },
            )
            .setThumbnail(song.thumbnail)
            .setFooter({ text: `Âm lượng: ${queue.volume}% | Filter: ${queue.filters.names.join(", ") || "Off"}` });

        message.reply({ embeds: [embed] });
    },
};