import { EmbedBuilder } from 'discord.js';
import { fetchFiveMPlayers, findPlayer, parseIdentifiers } from '../../utils/fivemHelper.js';

export default {
    name: 'checkfivem',
    description: 'Tra cứu người chơi đang online trên Haven RP (FiveM)',
    category: 'FiveM',
    async execute(message, args) {
        const query = args.join(' ').trim();
        if (!query) {
            return message.reply('⚠️ Nhập tên hoặc ID in-game nha! Ví dụ: `=checkfivem TenNguoi` hoặc `=checkfivem 12`');
        }

        const loading = await message.reply('📡 Đang soi Haven RP...');

        try {
            const players = await fetchFiveMPlayers();
            const player = findPlayer(players, query);

            if (!player) {
                const notFoundEmbed = new EmbedBuilder()
                    .setColor('#FF9900')
                    .setTitle('🔍 Không tìm thấy')
                    .setDescription(
                        `Không có ai tên/ID \`${query}\` đang online trên **Haven RP**.`
                    )
                    .setFooter({ text: `Hiện có ${players.length} người chơi online` })
                    .setTimestamp();

                return loading.edit({ content: null, embeds: [notFoundEmbed] });
            }

            const { discordId, steamId } = parseIdentifiers(player);

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(`👤 ${player.name}`)
                .addFields(
                    { name: 'Tên', value: player.name, inline: true },
                    { name: 'ID In-game', value: `\`${player.id}\``, inline: true },
                    {
                        name: 'Discord ID',
                        value: discordId ? `\`${discordId}\`` : 'Không liên kết',
                        inline: true,
                    },
                    {
                        name: 'Steam ID',
                        value: steamId ?? 'Không rõ',
                        inline: false,
                    }
                )
                .setFooter({ text: 'Haven RP (Singapore)' })
                .setTimestamp();

            await loading.edit({ content: null, embeds: [embed] });
        } catch (error) {
            console.error('[checkfivem]', error.message);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Không kết nối được server')
                .setDescription(
                    'Server FiveM đang **offline** hoặc **bật khiên chặn API** rồi nha 🥲'
                )
                .setTimestamp();

            await loading.edit({ content: null, embeds: [errorEmbed] });
        }
    },
};
