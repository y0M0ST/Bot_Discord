import { getInventory, removeItem, updateMoney } from '../../utils/economyHandler.js';
import { ITEMS } from '../../utils/gameConfig.js';

export default {
    name: "sell",
    description: "Bán vật phẩm lấy tiền",
    category: "Economy",
    async execute(message, args) {
        const itemKey = args[0]?.toLowerCase();

        // Nếu gõ =sell all -> Bán hết sạch khoáng sản
        if (itemKey === 'all') {
            const inv = await getInventory(message.author.id);
            let totalMoney = 0;
            let report = "";

            for (const [key, amount] of Object.entries(inv)) {
                const item = ITEMS[key];
                // Chỉ bán khoáng sản (material), không bán Cúp (tool)
                if (item && item.type === 'material') {
                    const profit = item.price * amount;
                    await removeItem(message.author.id, key, amount);
                    totalMoney += profit;
                    report += `+ ${amount} ${item.name} (${profit} xu)\n`;
                }
            }

            if (totalMoney === 0) return message.reply("🎒 Trong túi không có gì để bán cả!");
            await updateMoney(message.author.id, totalMoney);
            return message.reply(`🤝 Đã bán hết khoáng sản:\n${report}**Tổng cộng: +${totalMoney} Xu**`);
        }

        // Bán lẻ: =sell diamond
        if (!itemKey || !ITEMS[itemKey]) return message.reply("⚠️ Bán cái gì? Gõ `=sell <tên món>` hoặc `=sell all` nha.");

        const item = ITEMS[itemKey];
        if (item.type === 'tool') return message.reply("⚠️ Đừng bán cần câu cơm (Cúp) em ơi! Để mà dùng.");

        const amount = 1; // Tạm thời bán mỗi lần 1 cái cho dễ
        const hasItem = await removeItem(message.author.id, itemKey, amount);

        if (!hasItem) return message.reply(`❌ Em làm gì có **${item.name}** mà bán?`);

        await updateMoney(message.author.id, item.price);
        message.reply(`🤝 Đã bán **1 ${item.name}** với giá **${item.price} Xu**.`);
    },
};