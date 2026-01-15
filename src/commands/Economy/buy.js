import { ITEMS } from '../../utils/gameConfig.js';
import { updateMoney, addItem } from '../../utils/economyHandler.js';

export default {
    name: "buy",
    description: "Mua vật phẩm",
    category: "Economy",
    async execute(message, args) {
        const itemKey = args[0]?.toLowerCase();
        const item = ITEMS[itemKey];

        if (!item) return message.reply("❌ Không bán món này! Gõ `=shop` xem lại tên đi em.");
        if (item.type !== 'tool') return message.reply("⚠️ Mấy cục đá lượm ngoài đường chứ mua làm gì? Chỉ mua được **Công cụ** thôi!");

        // Trừ tiền
        const success = await updateMoney(message.author.id, -item.price);
        if (!success) return message.reply(`💸 **Không đủ tiền!** Món này giá **${item.price} Xu** lận.`);

        // Thêm vào túi
        await addItem(message.author.id, itemKey, 1);

        // 👇 ĐÃ SỬA DÒNG NÀY (Thêm dấu \ trước dấu `)
        message.reply(`✅ Đã mua thành công **${item.name}** ${item.emoji}! Mang đi \`=mine\` ngay nào!`);
    },
};