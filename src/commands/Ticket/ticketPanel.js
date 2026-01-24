import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } from 'discord.js';
import { safeReply } from '../../utils/discordHelper.js';

export default {
    name: 'ticketpanel', // Tên lệnh
    description: 'Tạo bảng ticket (Admin Only)',
    aliases: ['panel', 'setup-ticket'],

    async execute(message, args) {
        // 1. Chỉ Admin mới được dùng
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return safeReply(message, "🚫 **Chỉ Admin mới được setup cái này!**");
        }

        // 2. Xoá tin nhắn lệnh của bà cho sạch kênh
        message.delete().catch(() => { });

        // 3. Thiết kế cái bảng (Embed)
        const embed = new EmbedBuilder()
            .setTitle('🎫 HỆ THỐNG HỖ TRỢ BLASTMC')
            .setDescription(
                'Chào mừng bạn đến với kênh hỗ trợ!\n\n' +
                '📌 **Vấn đề tài khoản / Nạp thẻ**\n' +
                '📌 **Tố cáo Hack / Bug / Lỗi game**\n' +
                '📌 **Góp ý phát triển Server**\n\n' +
                '👉 Vui lòng bấm nút **"Tạo Ticket"** bên dưới để gặp Admin.'
            )
            .setColor('#2E8B57') // Màu xanh SeaGreen
            .setImage('https://cdn.discordapp.com/attachments/1105116090587164773/1464497713709187195/25a100b178fa9237d6085ce28472e844.jpg?ex=6975af48&is=69745dc8&hm=eef53a09924dc465e9793abdf6035d8cfc541cbeceaa26811697037643503d87&') // (Optional) Link ảnh banner nếu có
            .setFooter({ text: 'Cô giáo Mindy - Hỗ trợ 24/7', iconURL: message.client.user.displayAvatarURL() });

        // 4. Thiết kế cái nút (Button)
        const button = new ButtonBuilder()
            .setCustomId('btn_create_ticket') // 🔑 ID quan trọng để bắt sự kiện
            .setLabel('Tạo Ticket Hỗ Trợ')
            .setEmoji('💌')
            .setStyle(ButtonStyle.Success); // Nút màu xanh lá

        // 5. Gửi ra kênh
        const row = new ActionRowBuilder().addComponents(button);
        await message.channel.send({ embeds: [embed], components: [row] });
    }
};