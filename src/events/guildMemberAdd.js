import { Events, EmbedBuilder } from 'discord.js';

export default {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const channelId = process.env.WELCOME_CHANNEL_ID;
        if (!channelId) return;

        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;

        // Tính toán thời gian
        const joinedAt = Math.floor(Date.now() / 1000);
        const createdAt = Math.floor(member.user.createdTimestamp / 1000);

        // Tạo Embed (Khung thông tin)
        const embed = new EmbedBuilder()
            .setColor("#00FF00") // Màu xanh lá chào mừng
            .setAuthor({
                name: `Chào mừng ${member.user.username} gia nhập!`,
                iconURL: member.user.displayAvatarURL()
            })
            .setDescription(`Xin chào ${member}! Chúc bạn chơi vui vẻ tại **${member.guild.name}** 🎉`)
            .setThumbnail(member.user.displayAvatarURL({ size: 256 })) // Avatar to bên phải
            .addFields(
                { name: "👤 Tên tài khoản", value: `\`${member.user.username}\``, inline: true },
                { name: "🆔 User ID", value: `\`${member.id}\``, inline: true },
                { name: "📅 Ngày tạo nick", value: `<t:${createdAt}:F>\n(<t:${createdAt}:R>)`, inline: false }, // Dòng này giúp soi Clone cực mạnh
                { name: "📊 Thành viên thứ", value: `#${member.guild.memberCount}`, inline: true }
            )
            .setFooter({ text: "Bot của bà Mindy", iconURL: member.guild.iconURL() })
            .setTimestamp();

        try {
            await channel.send({ content: `Hế lô ${member} ơi! 👋`, embeds: [embed] });
        } catch (err) {
            console.error("Lỗi gửi Welcome:", err);
        }
    },
};