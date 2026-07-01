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

function createProgressBar(currentTime, duration, length = 20) {
    // Check chống mù mắt, lỡ duration âm hoặc null luôn
    if (!duration || duration <= 0) return "🔴 Trực tiếp";

    // Ép kiểu an toàn: không bao giờ âm, không bao giờ vượt duration
    const safeCurrent = Math.max(0, Math.min(currentTime, duration));

    // Tính vị trí của cái nút (từ 0 đến length - 1)
    const progressIndex = Math.round((length - 1) * (safeCurrent / duration));

    // Lắp ráp: Gạch trước nút + Nút + Gạch rỗng sau nút
    return '▬'.repeat(progressIndex) + '🔘' + '▬'.repeat(length - 1 - progressIndex);
}

// Hàm tạo giao diện Embed cho bảng điều khiển
const generateMusicEmbed = (queue, currentSong, recentlyAddedText = null) => {
    const embed = new EmbedBuilder()
        .setColor('#e049a6')
        .setTitle('🎶 Đang phát nhạc')
        .setDescription(`**[${currentSong.name}](${currentSong.url})**`)
        .setThumbnail(currentSong.thumbnail || null);

    const progressBar = createProgressBar(queue.currentTime, currentSong.duration);

    embed.addFields(
        { name: '🫧 Phát nhạc', value: `\`${queue.formattedCurrentTime}\` ${progressBar} \`${currentSong.formattedDuration}\``, inline: false },
        { name: '🐧 Yêu cầu', value: `${currentSong.user}`, inline: true }
    );

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
        embed.setFooter({ text: 'Nghe nhạc cùng Mindy nào' });
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

        // Xoá đồng hồ cập nhật tiến độ cũ (nếu có)
        if (queue.progressInterval) {
            clearInterval(queue.progressInterval);
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

        // Bắt đầu đếm nhịp 15 giây để cập nhật thanh tiến độ
        queue.progressInterval = setInterval(async () => {
            if (!queue || !queue.panelMessage || queue.paused) return; // Nếu đang pause thì bỏ qua
            try {
                // Chỉ cập nhật nếu bài hát vẫn đang phát bình thường
                if (queue.songs.length > 0) {
                    const updatedEmbed = generateMusicEmbed(queue, queue.songs[0]);
                    await queue.panelMessage.edit({ embeds: [updatedEmbed] }).catch(() => { });
                }
            } catch (e) {
                clearInterval(queue.progressInterval);
            }
        }, 5000);
    })
    .on("addSong", async (queue, song) => {
        const position = queue.songs.length - 1;

        // Cập nhật lại Bảng Điều Khiển để hiện bài hát vừa thêm ở dòng chữ nhỏ (Footer)
        if (queue.panelMessage) {
            const addedText = `${song.name} (Vị trí #${position})`;
            const embed = generateMusicEmbed(queue, queue.songs[0], addedText);
            await queue.panelMessage.edit({ embeds: [embed] }).catch(() => { });
        }
    })
    .on("addList", async (queue, playlist) => {
        if (queue.panelMessage) {
            const addedText = `Playlist ${playlist.name} (${playlist.songs.length} bài)`;
            const embed = generateMusicEmbed(queue, queue.songs[0], addedText);
            await queue.panelMessage.edit({ embeds: [embed] }).catch(() => { });
        }
    })
    .on("finish", (queue) => {
        if (queue.progressInterval) clearInterval(queue.progressInterval);

        if (!queue.autoLeave) {
            queue.textChannel.send('🎶 Đã phát hết danh sách nhạc. (Chế độ Online 24/7 đang BẬT, bot sẽ ở lại phòng chờ lệnh)');
            return;
        }

        queue.textChannel.send('🎶 Đã phát hết danh sách nhạc, sẽ tự động rời đi sau 30 phút nữa nếu không có bài mới!');

        // Cài đặt đồng hồ đếm ngược 30 phút (30 * 60 * 1000 miligiây)
        const timeout = setTimeout(() => {
            let to = 30; // 30 phút = 1800000 ms
            distube.voices.leave(queue);
            queue.textChannel.send(`👋 Đã ${to} phút không có ai bật nhạc, tớ xin phép về nhà ngủ đây. Bye bye!`);
            leaveTimeouts.delete(queue.id);
        }, to * 60 * 1000); // to * 60 * 1000 miligiây

        // Lưu đồng hồ này lại để hủy nếu có bài mới được thêm vào
        leaveTimeouts.set(queue.id, timeout);
    })
    .on("error", (error, queue, song) => {
        if (queue && queue.progressInterval) clearInterval(queue.progressInterval);

        console.error("❌ DISTUBE ERROR LOG:", error);
        
        // Log webhook
        import('../utils/logger.js').then(module => {
            const Logger = module.default;
            Logger.music(error, queue);
        }).catch(() => {});

        if (queue && queue.textChannel) {
            queue.textChannel.send(`❌ Có lỗi: ${String(error.message).slice(0, 2000)}`).catch(console.error);
        }
    });

client.distube = distube;

export default distube;
