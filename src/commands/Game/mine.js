// 👇 Thêm getUserData và updateMiningTime vào import
import { getInventory, addItem, getUserData, updateMiningTime } from '../../utils/economyHandler.js';
import { MINE_RATES, ITEMS } from '../../utils/gameConfig.js';

export default {
    name: "mine",
    description: "Đi đào khoáng (Có thời gian chờ)",
    category: "Economy",
    async execute(message, args) {
        const userId = message.author.id;

        // --- 1. CHECK COOLDOWN (CHẶN SPAM) ---
        const userData = await getUserData(userId);
        const lastMined = userData.lastMined || 0;

        // ⏱️ Cấu hình thời gian chờ: 30 Giây (Bà muốn bao nhiêu thì sửa số 30)
        const cooldownTime = 10 * 1000;
        const timePassed = Date.now() - lastMined;

        if (timePassed < cooldownTime) {
            const timeLeft = cooldownTime - timePassed;
            const seconds = Math.ceil(timeLeft / 1000); // Đổi ra giây
            return message.reply(`⏳ **Thở đi bà ơi!** Đào hăng quá sập hầm giờ.\nQuay lại sau **${seconds} giây** nữa nha!`);
        }

        // --- 2. CHECK CÚP VÀ LOGIC ĐÀO (Giữ nguyên như cũ) ---
        const inventory = await getInventory(userId);

        const allPickaxes = Object.entries(ITEMS)
            .filter(([key, item]) => item.type === 'tool')
            .sort((a, b) => b[1].level - a[1].level);

        let bestPickaxe = null;
        for (const [key, item] of allPickaxes) {
            if (inventory[key]) {
                bestPickaxe = item;
                break;
            }
        }

        if (!bestPickaxe) {
            return message.reply("⛔ **Tay không bắt giặc?** Vào `=shop` mua cái **Cúp Gỗ** trước đi bà nội!");
        }

        // Xử lý số lượng
        const maxMine = bestPickaxe.limit;
        let amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1) amount = 1;

        if (amount > maxMine) {
            return message.reply(`⚠️ **Quá sức!** ${bestPickaxe.emoji} **${bestPickaxe.name}** chỉ đào được max **${maxMine} block/lần**.`);
        }

        // Vòng lặp đào
        const lootSummary = {};
        for (let i = 0; i < amount; i++) {
            const roll = Math.random() * 100;
            let currentRate = 0;
            let minedItem = "stone";

            for (const rate of MINE_RATES) {
                currentRate += rate.chance;
                if (roll <= currentRate) {
                    minedItem = rate.item;
                    break;
                }
            }
            if (!lootSummary[minedItem]) lootSummary[minedItem] = 0;
            lootSummary[minedItem]++;
        }

        // --- 3. LƯU & THÔNG BÁO ---
        // Quan trọng: Cập nhật thời gian đào vào Database
        await updateMiningTime(userId);

        let resultMsg = `⛏️ Dùng **${bestPickaxe.name}** đào **${amount} block**:\n\n`;
        let totalValue = 0;

        for (const [key, qty] of Object.entries(lootSummary)) {
            const itemConfig = ITEMS[key];
            await addItem(userId, key, qty);
            resultMsg += `${itemConfig.emoji} **${itemConfig.name}** x${qty}\n`;
            totalValue += itemConfig.price * qty;
        }

        resultMsg += `\n💰 Giá trị: **${totalValue} Xu**`;
        message.reply(resultMsg);
    },
};