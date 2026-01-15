import { EmbedBuilder } from 'discord.js';
import { getInventory } from '../../utils/economyHandler.js';
import { ITEMS } from '../../utils/gameConfig.js';

export default {
    name: "inv", // Tên lệnh chính
    description: "Xem túi đồ cá nhân",
    category: "Economy",
    async execute(message, args) {
        // Nếu tag người khác thì soi túi họ, không thì soi túi mình
        const target = message.mentions.users.first() || message.author;

        // Lấy dữ liệu từ Database
        const inventory = await getInventory(target.id);

        // Kiểm tra xem túi có trống không
        if (!inventory || Object.keys(inventory).length === 0) {
            return message.reply(`🎒 Túi đồ của **${target.username}** trống trơn. Đi \`=buy\` hoặc \`=mine\` kiếm đồ đi!`);
        }

        // Phân loại đồ đạc để hiển thị cho đẹp
        let toolsList = "";
        let materialsList = "";

        for (const [key, amount] of Object.entries(inventory)) {
            const itemConfig = ITEMS[key];

            // Nếu item có trong config (tránh lỗi item rác)
            if (itemConfig) {
                const line = `${itemConfig.emoji} **${itemConfig.name}**: ${amount}\n`;

                if (itemConfig.type === 'tool') {
                    toolsList += line;
                } else {
                    materialsList += line;
                }
            }
        }

        // Tạo bảng hiển thị
        const embed = new EmbedBuilder()
            .setColor("#FF9900") // Màu cam
            .setTitle(`🎒 TÚI ĐỒ CỦA ${target.username.toUpperCase()}`)
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                { name: "🔨 Công Cụ", value: toolsList || "_Trống_", inline: true },
                { name: "💎 Khoáng Sản", value: materialsList || "_Trống_", inline: true }
            )
            .setFooter({ text: "Gõ =sell all để bán hết khoáng sản lấy tiền" });

        message.reply({ embeds: [embed] });
    },
};