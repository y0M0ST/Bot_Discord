import { Events, EmbedBuilder } from 'discord.js';

export default {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const channelId = process.env.GOODBYE_CHANNEL_ID;
        if (!channelId) return;

        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;

        const joinedAt = member.joinedTimestamp
            ? Math.floor(member.joinedTimestamp / 1000)
            : Math.floor(Date.now() / 1000);

        const embed = new EmbedBuilder()
            .setColor("#FF0000") // Màu đỏ chia ly
            .setAuthor({
                name: `${member.user.username} đã rời server`,
                iconURL: member.user.displayAvatarURL()
            })
            .setDescription(`Hẹn gặp lại bạn vào một ngày không xa! 👋`)
            .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: "👤 Tên tài khoản", value: `\`${member.user.username}\``, inline: true },
                { name: "🆔 User ID", value: `\`${member.id}\``, inline: true },
                { name: "⏱️ Đã tham gia lúc", value: `<t:${joinedAt}:F>`, inline: false },
                { name: "📊 Quân số hiện tại", value: `${member.guild.memberCount} thành viên`, inline: true }
            )
            .setFooter({ text: "Bot của bà Mindy", iconURL: member.guild.iconURL() })
            .setTimestamp();

        try {
            await channel.send({ embeds: [embed] });
        } catch (err) {
            console.error("Lỗi gửi Goodbye:", err);
        }
    },
};