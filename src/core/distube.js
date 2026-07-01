import { DisTube } from 'distube';
import { YtDlpPlugin } from '@distube/yt-dlp';
import { SoundCloudPlugin } from '@distube/soundcloud';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import client from './discord.js';

const distube = new DisTube(client, {
    plugins: [
        new SoundCloudPlugin(),
        new YtDlpPlugin()
    ]
});

const leaveTimeouts = new Map();

// Hàm tạo giao diện Embed cho bảng điều khiển
const generateMusicEmbed = (queue, currentSong, recentlyAddedText = null) => {
    const embed = new EmbedBuilder()
        .setColor('#ff0066')
        .setTitle('🎶 Đang phát nhạc')
        .setDescription(`**[${currentSong.name}](${currentSong.url})**`)
        .addFields(
            { name: '⏱️ Thời lượng', value: `\`${currentSong.formattedDuration}\``, inline: true },
            { name: '👤 Yêu cầu', value: `${currentSong.user}`, inline: true }
        )
        .setThumbnail(currentSong.thumbnail || null);

    // Hiển thị danh sách hàng đợi (tối đa 5 bài tiếp theo)
    if (queue.songs.length > 1) {
        const nextSongs = queue.songs.slice(1, 6);
        const queueList = nextSongs.map((s, i) => `**${i + 1}.** ${s.name} - \`${s.formattedDuration}\``).join('\n');
        
        embed.addFields({
            name: `📋 Hàng đợi (${queue.songs.length - 1} bài chờ)`,
            value: queueList + (queue.songs.length > 6 ? `\n*...và ${queue.songs.length - 6} bài khác*` : '')
        });
    }

    if (recentlyAddedText) {
        embed.setFooter({ text: `✅ Vừa thêm: ${recentlyAddedText}` });
    } else {
        embed.setFooter({ text: 'Bảng điều khiển âm nhạc' });
    }

    return embed;
};

distube
    .on("debug", (message) => {
        // Tắt log debug cho đỡ đầy console
    })
    .on("playSong", async (queue, song) => {
        // Nếu có bài hát mới phát, hủy lệnh đếm ngược 30 phút (nếu có)
        if (leaveTimeouts.has(queue.id)) {
            clearTimeout(leaveTimeouts.get(queue.id));
            leaveTimeouts.delete(queue.id);
        }

        const embed = generateMusicEmbed(queue, song);

        // Khởi tạo mặc định autoLeave là true nếu chưa có
        if (queue.autoLeave === undefined) queue.autoLeave = true;

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
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('music_autoleave')
                .setLabel(queue.autoLeave ? 'Tự Rời: BẬT' : 'Tự Rời: TẮT')
                .setStyle(queue.autoLeave ? ButtonStyle.Success : ButtonStyle.Secondary)
        );

        const msg = await queue.textChannel.send({ embeds: [embed], components: [row] });
        queue.panelMessage = msg;
    })
    .on("addSong", async (queue, song) => {
        const position = queue.songs.length - 1;
        
        // Cập nhật lại Bảng Điều Khiển để hiện bài hát vừa thêm ở dòng chữ nhỏ (Footer)
        if (queue.panelMessage) {
            const addedText = `${song.name} (Vị trí #${position})`;
            const embed = generateMusicEmbed(queue, queue.songs[0], addedText);
            await queue.panelMessage.edit({ embeds: [embed] }).catch(() => {});
        }
    })
    .on("addList", async (queue, playlist) => {
        if (queue.panelMessage) {
            const addedText = `Playlist ${playlist.name} (${playlist.songs.length} bài)`;
            const embed = generateMusicEmbed(queue, queue.songs[0], addedText);
            await queue.panelMessage.edit({ embeds: [embed] }).catch(() => {});
        }
    })
    .on("finish", (queue) => {
        if (!queue.autoLeave) {
            queue.textChannel.send('🎶 Đã phát hết danh sách nhạc. (Chế độ Cắm Trại 24/7 đang BẬT, bot sẽ ở lại phòng chờ lệnh)');
            return;
        }

        queue.textChannel.send('🎶 Đã phát hết danh sách nhạc. Tôi sẽ tự động rời đi sau 30 phút nữa nếu không có bài mới!');

        // Cài đặt đồng hồ đếm ngược 30 phút (30 * 60 * 1000 miligiây)
        const timeout = setTimeout(() => {
            distube.voices.leave(queue);
            queue.textChannel.send('👋 Đã 30 phút không có ai bật nhạc, tôi xin phép về nhà ngủ đây. Bye bye!');
            leaveTimeouts.delete(queue.id);
        }, 30 * 60 * 1000); // 30 phút = 1800000 ms

        // Lưu đồng hồ này lại để hủy nếu có bài mới được thêm vào
        leaveTimeouts.set(queue.id, timeout);
    })
    .on("error", (error, queue, song) => {
        console.error("❌ DISTUBE ERROR LOG:", error);
        if (queue && queue.textChannel) {
            queue.textChannel.send(`❌ Có lỗi: ${String(error.message).slice(0, 2000)}`).catch(console.error);
        }
    });

client.distube = distube;

export default distube;
