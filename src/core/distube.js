import { DisTube } from 'distube';
import { YtDlpPlugin } from '@distube/yt-dlp';
import { SoundCloudPlugin } from '@distube/soundcloud';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import client from './discord.js';

const distube = new DisTube(client, {
    plugins: [
        new SoundCloudPlugin(),
        new YtDlpPlugin()
    ],
});

distube
    .on("debug", (message) => {
        // Tắt log debug cho đỡ đầy console
    })
    .on("playSong", async (queue, song) => {
        const embed = new EmbedBuilder()
            .setColor('#ff0066')
            .setTitle('🎶 Đang phát nhạc')
            .setDescription(`**[${song.name}](${song.url})**`)
            .addFields(
                { name: '⏱️ Thời lượng', value: `\`${song.formattedDuration}\``, inline: true },
                { name: '👤 Yêu cầu bởi', value: `${song.user}`, inline: true }
            )
            .setThumbnail(song.thumbnail || null)
            .setFooter({ text: 'Bảng điều khiển âm nhạc' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('music_pause')
                .setEmoji('⏯️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('music_skip')
                .setEmoji('⏭️')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_loop')
                .setEmoji('🔁')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('music_stop')
                .setEmoji('⏹️')
                .setStyle(ButtonStyle.Danger)
        );

        const msg = await queue.textChannel.send({ embeds: [embed], components: [row] });
        queue.panelMessage = msg;
    })
    .on("addSong", (queue, song) => {
        queue.textChannel.send(`✅ Đã thêm: **${song.name}** - \`[${song.formattedDuration}]\``);
    })
    .on("addList", (queue, playlist) => {
        queue.textChannel.send(`✅ Đã thêm playlist: **${playlist.name}** (${playlist.songs.length} bài)`);
    })
    .on("error", (error, queue, song) => {
        console.error("❌ DISTUBE ERROR LOG:", error);
        if (queue && queue.textChannel) {
            queue.textChannel.send(`❌ Có lỗi: ${String(error.message).slice(0, 2000)}`).catch(console.error);
        }
    });

client.distube = distube;

export default distube;
