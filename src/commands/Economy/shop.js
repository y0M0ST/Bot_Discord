import { EmbedBuilder } from 'discord.js';
import { ITEMS } from '../../utils/gameConfig.js';

export default {
    name: "shop",
    description: "Xem cửa hàng & thông số item",
    category: "Economy",
    execute(message) {
        let toolList = "";
        let materialList = "";

        // Sắp xếp item theo giá tăng dần nhìn cho gọn
        const sortedItems = Object.entries(ITEMS).sort((a, b) => a[1].price - b[1].price);

        for (const [key, item] of sortedItems) {
            // Định dạng giá tiền đẹp (100,000)
            const price = item.price.toLocaleString();

            if (item.type === 'tool') {
                // Nếu là Cúp: Hiện thêm dòng "Đào tối đa X"
                toolList += `${item.emoji} **${item.name}** (\`${key}\`)\n└─ 💸 Giá: **${price}** | ⛏️ Max: **${item.limit}**\n\n`;
            } else {
                // Nếu là Khoáng sản: Chỉ hiện giá thu mua
                materialList += `${item.emoji} **${item.name}**: 💰 ${price} Xu\n`;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("🛒 CỬA HÀNG MINECRAFT")
            .setColor("#00AAFF")
            .setThumbnail("https://media.giphy.com/media/h1Hvk7Vp3KKk/giphy.gif") // Gif Steve đi shopping
            .addFields(
                { name: "🔨 Công cụ (Gõ =buy [tên_mã])", value: toolList || "Hết hàng", inline: true },
                { name: "💎 Giá thu mua khoáng sản", value: materialList || "Hết hàng", inline: true }
            )
            .setFooter({ text: "Ví dụ mua cúp sắt: =buy pickaxe_iron" });

        message.reply({ embeds: [embed] });
    },
};