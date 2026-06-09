import { EmbedBuilder } from 'discord.js';
import { fetchFiveMPlayers, buildListFiveMPayload } from '../../utils/fivemHelper.js';

const BUTTON_TIMEOUT_MS = 5 * 60 * 1000;

export default {
    name: 'listfivem',
    description: 'Xem toàn bộ người chơi đang online trên Haven RP (FiveM)',
    category: 'FiveM',
    async execute(message) {
        const loading = await message.reply('📡 Đang quét toàn bộ server Haven RP...');

        try {
            const players = await fetchFiveMPlayers();
            const payload = buildListFiveMPayload(players, 1, message.author.id);

            const sent = await loading.edit({
                content: payload.components.length
                    ? '👇 Bấm **Trước / Sau** để lướt trang · **Làm mới** để cập nhật danh sách'
                    : null,
                embeds: payload.embeds,
                components: payload.components,
            });

            if (payload.components.length) {
                setTimeout(() => {
                    sent.edit({ components: [] }).catch(() => {});
                }, BUTTON_TIMEOUT_MS);
            }
        } catch (error) {
            console.error('[listfivem]', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Không kết nối được server')
                .setDescription(
                    'Server FiveM đang **offline** hoặc **bật khiên chặn API** rồi nha 🥲'
                )
                .setTimestamp();

            await loading.edit({ content: null, embeds: [errorEmbed], components: [] });
        }
    },
};
