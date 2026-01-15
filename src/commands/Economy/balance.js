import { EmbedBuilder } from 'discord.js';
// 👇 Đổi dòng này
import { getUserData } from '../../utils/economyHandler.js';

export default {
    name: "money",
    description: "Xem số dư tài khoản",
    category: "Economy",
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;

        // 👇 Đổi dòng này luôn
        const data = await getUserData(target.id);

        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setTitle(`💰 Ví tiền của ${target.username}`)
            .setDescription(`Hiện đang có: **${data.money.toLocaleString()} Xu**`)
            .setThumbnail(target.displayAvatarURL())
            .setFooter({ text: "Cày cuốc chăm chỉ lên nha!" });

        message.reply({ embeds: [embed] });
    },
};