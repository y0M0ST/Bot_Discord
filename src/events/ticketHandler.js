import { Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import 'dotenv/config';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Chỉ xử lý nếu là Button
        if (!interaction.isButton()) return;

        // ====================================================
        // 🟢 TRƯỜNG HỢP 1: BẤM NÚT TẠO TICKET
        // ====================================================
        if (interaction.customId === 'btn_create_ticket') {

            // 1. Báo cho Discord biết là "Đang xử lý..." (để khỏi báo lỗi Interaction Failed)
            await interaction.deferReply({ ephemeral: true });

            // 2. Kiểm tra xem user này đã có ticket nào chưa (Chống spam tạo 100 cái)
            // Tìm kênh nào bắt đầu bằng "ticket-" và kết thúc bằng tên user
            // Lưu ý: Tên kênh discord luôn viết thường và không dấu cách
            // 2. CHECK TRÙNG LẶP (Dựa vào Topic thay vì Tên Kênh)
            const categoryId = process.env.TICKET_CATEGORY_ID;

            // Lấy tất cả kênh trong danh mục Ticket
            const existingChannel = interaction.guild.channels.cache.find(c =>
                c.parentId === categoryId &&
                c.topic &&
                c.topic.includes(interaction.user.id)
            );

            if (existingChannel) {
                return interaction.editReply(`🚫 **Bà có ticket rồi mà!** Vào đây nè: <#${existingChannel.id}>`);
            }

            // 3. Tạo kênh mới
            try {
                const channelName = `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

                const ticketChannel = await interaction.guild.channels.create({
                    name: channelName,
                    type: ChannelType.GuildText,
                    parent: categoryId,
                    topic: `Ticket Owner: ${interaction.user.id} | Name: ${interaction.user.tag}`, // 🔑 Đánh dấu chủ sở hữu vào đây
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id, // Role @everyone
                            deny: [PermissionFlagsBits.ViewChannel], // ❌ Người ngoài KHÔNG THẤY
                        },
                        {
                            id: interaction.user.id, // Người tạo ticket
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles], // ✅ Được thấy, chat, gửi ảnh
                        },
                        {
                            id: interaction.client.user.id, // Bot Mindy
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages], // ✅ Bot phải thấy để điều hành
                        }
                    ],
                });

                // 4. Gửi bảng điều khiển vào trong kênh ticket mới
                const controlEmbed = new EmbedBuilder()
                    .setTitle(`Xin chào ${interaction.user.username}! 👋`)
                    .setDescription(
                        'Cảm ơn bạn đã liên hệ! BQT sẽ phản hồi sớm nhất.\n' +
                        'Trong lúc chờ đợi, vui lòng trình bày rõ vấn đề của bạn.\n\n' +
                        '🔴 **Muốn đóng ticket?** Bấm nút bên dưới.'
                    )
                    .setColor('#FFD700'); // Màu vàng

                const closeBtn = new ButtonBuilder()
                    .setCustomId('btn_close_ticket')
                    .setLabel('Đóng Ticket')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger); // Màu đỏ

                const row = new ActionRowBuilder().addComponents(closeBtn);

                await ticketChannel.send({
                    content: `👋 Hế lô <@${interaction.user.id}>! <@&${process.env.SUPPORT_ROLE_ID}> ơi có khách nè!`,
                    embeds: [controlEmbed],
                    components: [row]
                });

                // 5. Báo lại cho người bấm nút ở ngoài kia biết
                await interaction.editReply(`✨ **Xong rồi!** Ticket của bạn đã được tạo tại: <#${ticketChannel.id}>`);

            } catch (error) {
                console.error("Lỗi tạo ticket:", error);
                await interaction.editReply("🚨 **Lỗi rồi!** Bảo Admin check lại bot đi!");
            }
        }

        // ====================================================
        // 🔴 TRƯỜNG HỢP 2: BẤM NÚT ĐÓNG TICKET
        // ====================================================
        if (interaction.customId === 'btn_close_ticket') {
            // 🔒 CHỈ ADMIN HOẶC SUPPORT MỚI ĐƯỢC ĐÓNG
            const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
            const isSupport = interaction.member.roles.cache.has(process.env.SUPPORT_ROLE_ID);

            if (!isAdmin && !isSupport) {
                return interaction.reply({
                    content: "🚫 **Chỉ Admin hoặc Support mới được đóng ticket nha!**",
                    ephemeral: true
                });
            }

            await interaction.reply("⏳ **Ticket sẽ bị xoá sau 3 giây...**");

            setTimeout(() => {
                if (interaction.channel) {
                    interaction.channel.delete().catch(err => console.error("Không xoá được kênh:", err));
                }
            }, 3000);
        }
    }
};