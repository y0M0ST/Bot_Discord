import { EmbedBuilder } from 'discord.js';
import { getUserData, updateMoney } from '../../utils/economyHandler.js';

export default {
    name: "taixiu",
    description: "Chơi Tài Xỉu kiếm cơm (hoặc ra đê)",
    category: "Mini-Games",
    // Cú pháp: =taixiu <tiền cược> <tài/xỉu>
    async execute(message, args) {
        // --- 1. KIỂM TRA CÚ PHÁP ---
        if (!args[0] || !args[1]) {
            return message.reply("⚠️ Sai rùiiii! Gõ vầy nè: `=taixiu <tien> tai/xiu`\n Ví dụ nho: `=taixiu 100 xiu`");
        }

        // Xử lý số tiền cược
        let betAmount = parseInt(args[0]);
        const userChoice = args[1].toLowerCase(); // tai hoặc xiu

        // Xử lý lệnh 'all' (Cược tất tay)
        const userData = await getUserData(message.author.id);
        if (args[0] === 'all') {
            betAmount = userData.money;
        }

        // --- 2. VALIDATE (Kiểm tra hợp lệ) ---
        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply("⚠️ Tiền cược phải là số dương nha má!");
        }
        if (betAmount > userData.money) {
            return message.reply(`💸 **Nghèo mà sang!** Bà có **${userData.money} xu** à, cược ít thôi!`);
        }
        if (!['tai', 'tài', 'xiu', 'xỉu'].includes(userChoice)) {
            return message.reply("❌ Chỉ được chọn **Tài** hoặc **Xỉu** thôi!");
        }

        // --- 3. LOGIC GAME (Lắc xí ngầu) ---
        // Random 3 con xúc xắc từ 1 đến 6
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const d3 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2 + d3;

        // Tính kết quả: 3-10 là Xỉu, 11-18 là Tài
        const resultName = (total >= 11) ? "Tài" : "Xỉu";

        // Chuẩn hoá lựa chọn của user để so sánh
        const isBettingTai = (userChoice === 'tai' || userChoice === 'tài');
        const isResultTai = (total >= 11);

        // --- 4. XỬ LÝ THẮNG/THUA ---
        let isWin = false;
        if (isBettingTai === isResultTai) isWin = true;

        // --- 5. TÍNH TIỀN & HIỂN THỊ ---
        const embed = new EmbedBuilder()
            .setTitle(`🎲 Sòng Bài: TÀI XỈU`)
            .setTimestamp();

        // Icon xúc xắc cho đẹp (dùng mảng icon)
        const diceIcons = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣"];
        const diceDisplay = `${diceIcons[d1 - 1]} ${diceIcons[d2 - 1]} ${diceIcons[d3 - 1]}`;

        if (isWin) {
            // Thắng: Cộng tiền
            await updateMoney(message.author.id, betAmount);
            embed.setColor("#00FF00") // Xanh lá
                .setDescription(`**${message.author.username}** chọn **${userChoice.toUpperCase()}** cược **${betAmount}**`)
                .addFields(
                    { name: "Kết quả", value: `${diceDisplay} (Tổng: **${total}**)` },
                    { name: "Chiến thắng!", value: `🎉 **${resultName.toUpperCase()}!** Bà ăn được **${betAmount} xu**! 🤑` }
                );
        } else {
            // Thua: Trừ tiền (Truyền số âm vào hàm updateMoney)
            await updateMoney(message.author.id, -betAmount);
            embed.setColor("#FF0000") // Đỏ
                .setDescription(`**${message.author.username}** chọn **${userChoice.toUpperCase()}** cược **${betAmount}**`)
                .addFields(
                    { name: "Kết quả", value: `${diceDisplay} (Tổng: **${total}**)` },
                    { name: "Thua rồi!", value: `💀 **${resultName.toUpperCase()}!** Mất trắng **${betAmount} xu**. Ra đê ở đi cưng! 😭` }
                );
        }

        message.reply({ embeds: [embed] });
    },
};