import { Events, EmbedBuilder } from 'discord.js';
import {
    FIVEM_LIST_PREFIX,
    fetchFiveMPlayers,
    buildListFiveMPayload,
    paginatePlayers,
} from '../utils/fivemHelper.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith(`${FIVEM_LIST_PREFIX}:`)) return;

        const [, action, pageStr, ownerId] = interaction.customId.split(':');

        if (interaction.user.id !== ownerId) {
            return interaction.reply({
                content: '🚫 Chỉ người gõ `=listfivem` mới bấm phân trang được nha!',
                ephemeral: true,
            });
        }

        await interaction.deferUpdate();

        let targetPage = parseInt(pageStr, 10);
        if (action === 'prev') targetPage -= 1;
        else if (action === 'next') targetPage += 1;

        try {
            const players = await fetchFiveMPlayers();
            const { totalPages } = paginatePlayers(players, targetPage);
            const safePage = Math.min(Math.max(1, targetPage), totalPages);
            const payload = buildListFiveMPayload(players, safePage, ownerId);

            await interaction.editReply({
                content: '👇 Bấm **Trước / Sau** để lướt trang · **Làm mới** để cập nhật danh sách',
                embeds: payload.embeds,
                components: payload.components,
            });
        } catch (error) {
            console.error('[fivemListHandler]', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Không kết nối được server')
                .setDescription(
                    'Server FiveM đang **offline** hoặc **bật khiên chặn API** rồi nha 🥲'
                )
                .setTimestamp();

            await interaction.editReply({
                content: null,
                embeds: [errorEmbed],
                components: [],
            });
        }
    },
};
