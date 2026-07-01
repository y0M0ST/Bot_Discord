import { Events } from 'discord.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const customId = interaction.customId;
        if (!customId.startsWith('music_')) return;

        const queue = interaction.client.distube.getQueue(interaction);

        if (!queue) {
            return interaction.reply({ content: '🚫 Không có bài nhạc nào đang phát!', ephemeral: true });
        }

        try {
            switch (customId) {
                case 'music_pause':
                    if (queue.paused) {
                        queue.resume();
                        await interaction.reply({ content: '▶️ Đã tiếp tục phát nhạc.', ephemeral: true });
                    } else {
                        queue.pause();
                        await interaction.reply({ content: '⏸️ Đã tạm dừng nhạc.', ephemeral: true });
                    }
                    break;
                case 'music_skip':
                    if (queue.songs.length <= 1 && !queue.autoplay) {
                        queue.stop();
                        await interaction.reply({ content: '⏭️ Đã bỏ qua bài cuối cùng và tắt nhạc.', ephemeral: true });
                    } else {
                        queue.skip();
                        await interaction.reply({ content: '⏭️ Đã bỏ qua bài hát.', ephemeral: true });
                    }
                    break;
                case 'music_loop':
                    // Repeat mode: 0 = Off, 1 = Song, 2 = Queue
                    let mode = queue.repeatMode;
                    if (mode === 0) {
                        mode = 1; // Loop song
                        queue.setRepeatMode(mode);
                        await interaction.reply({ content: '🔂 Đã bật chế độ lặp lại bài hiện tại.', ephemeral: true });
                    } else if (mode === 1) {
                        mode = 2; // Loop queue
                        queue.setRepeatMode(mode);
                        await interaction.reply({ content: '🔁 Đã bật chế độ lặp lại cả danh sách.', ephemeral: true });
                    } else {
                        mode = 0; // Off
                        queue.setRepeatMode(mode);
                        await interaction.reply({ content: '➡️ Đã tắt chế độ lặp lại.', ephemeral: true });
                    }
                    break;
                case 'music_autoleave':
                    queue.autoLeave = !queue.autoLeave; // Đảo ngược trạng thái

                    // Cập nhật lại giao diện của các nút bấm
                    const components = interaction.message.components.map(row => {
                        return {
                            type: 1, // ActionRow
                            components: row.components.map(btn => {
                                if (btn.customId === 'music_autoleave') {
                                    return {
                                        ...btn.data,
                                        label: queue.autoLeave ? 'Tự Rời: BẬT' : 'Tự Rời: TẮT',
                                        style: queue.autoLeave ? 3 : 2, // 3 = Success (Xanh lá), 2 = Secondary (Xám)
                                    };
                                }
                                return btn.data;
                            })
                        };
                    });

                    // Cập nhật thẳng vào tin nhắn có nút bấm
                    await interaction.update({ components });
                    // Đồng thời gửi 1 thông báo nhỏ
                    await interaction.followUp({ content: `✅ Đã ${queue.autoLeave ? 'BẬT' : 'TẮT'} chế độ tự động rời phòng (Online 24/7: ${queue.autoLeave ? 'Tắt' : 'Bật'})`, ephemeral: true });
                    break;
                case 'music_stop':
                    queue.stop();
                    await interaction.reply({ content: '⏹️ Đã tắt nhạc và rời phòng.', ephemeral: true });
                    break;
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `❌ Lỗi: ${error.message}`, ephemeral: true });
        }
    },
};
