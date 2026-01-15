import { EmbedBuilder } from 'discord.js';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// 1. KẾT NỐI SUPABASE
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const TABLE_NAME = 'economy'; // Tên bảng trong Supabase lưu trữ ví tiền người chơi

// 2. CONFIG GAME
const ITEMS = [
    { id: 'bau', name: 'Bầu', icon: '🍐' },
    { id: 'cua', name: 'Cua', icon: '🦀' },
    { id: 'tom', name: 'Tôm', icon: '🦐' },
    { id: 'ca', name: 'Cá', icon: '🐟' },
    { id: 'ga', name: 'Gà', icon: '🐔' },
    { id: 'nai', name: 'Nai', icon: '🦌' }
];

// Hàm đợi (Sleep) để tạo hiệu ứng hồi hộp
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default {
    name: "baucua",
    aliases: ["bc", "baucuatomca"],
    description: "Chơi Bầu Cua Tôm Cá (Có hiệu ứng lắc bát)",
    category: "Games",

    async execute(message, args) {
        // --- CHECK KÊNH ---
        // 👇 Sửa lại chút để dùng chung 1 biến cho tiện (hoặc giữ nguyên tuỳ bà)
        const allowedChannel = process.env.BAUCUA_CHANNEL_ID;

        // 👇 THÊM DÒNG NÀY ĐỂ SOI:
        console.log(`[DEBUG] Config: "${allowedChannel}" | Kênh hiện tại: "${message.channel.id}"`);
        if (allowedChannel && message.channel.id !== allowedChannel) {
            setTimeout(() => message.delete().catch(() => { }), 3000);
            return message.reply(`🚫 **Sai sòng rồi!** Qua kênh <#${allowedChannel}> lắc bầu cua nha em!`)
                .then(msg => setTimeout(() => msg.delete().catch(() => { }), 5000));
        }

        // --- CHECK INPUT ---
        const choiceInput = args[0]?.toLowerCase();
        let betAmount = parseInt(args[1]);

        if (!isNaN(choiceInput) && isNaN(betAmount)) betAmount = parseInt(choiceInput);

        if (!choiceInput || isNaN(betAmount) || betAmount <= 0) {
            return message.reply("🎲 **Cách chơi:** `=baucua [Con vật] [Tiền cược]`\n👉 VD: `=baucua tom 5000`");
        }

        // --- CHUẨN HOÁ CON VẬT ---
        let selectedItem = ITEMS.find(item => item.id === choiceInput || item.name.toLowerCase() === choiceInput);
        if (!selectedItem) return message.reply("❌ Con gì lạ z? Chỉ có: Bầu, Cua, Tôm, Cá, Gà, Nai thôi!");

        // --- CHECK TIỀN TRONG DB ---
        const { data: user, error } = await supabase
            .from(TABLE_NAME)
            .select('money')
            .eq('user_id', message.author.id)
            .single();

        if (error || !user) return message.reply("⚠️ Bạn chưa đăng ký tài khoản! Gõ lệnh đăng ký trước nha.");
        if (user.money < betAmount) return message.reply(`💸 Ví còn có ${user.money.toLocaleString()} xu à, hong đủ cược rùi!`);

        // --- TRỪ TIỀN TRƯỚC ---
        await supabase.from(TABLE_NAME).update({ money: user.money - betAmount }).eq('user_id', message.author.id);

        // ====================================================
        // 🎭 PHẦN DIỄN SÂU: HIỆU ỨNG LẮC BÁT
        // ====================================================

        // Bước 1: Gửi tin nhắn "Đang lắc..."
        const shakingEmbed = new EmbedBuilder()
            .setColor("#FFA500")
            .setTitle(`🥣 CÔ GIÁO ĐANG LẮC...`)
            .setDescription(`**${message.author.displayName}** đã cược **${betAmount.toLocaleString()}** vào **${selectedItem.name}**\n\n🎲 *Lóc cóc... lóc cóc...*`)
            .setThumbnail("https://media.tenor.com/KEzW7Y_tM0MAAAAC/dice-roll.gif"); // Ảnh động lắc xúc xắc (hoặc để trống)

        const replyMsg = await message.reply({ embeds: [shakingEmbed] });

        // Bước 2: Đợi 3 giây cho hồi hộp (Bot đang tính toán ngầm)
        await wait(4000);

        // ====================================================
        // 🎲 TÍNH KẾT QUẢ
        // ====================================================
        const result = [];
        for (let i = 0; i < 3; i++) {
            result.push(ITEMS[Math.floor(Math.random() * ITEMS.length)]);
        }

        const matchCount = result.filter(item => item.id === selectedItem.id).length;
        let winnings = 0;
        let messageResult = "";
        let color = "#FF0000";

        if (matchCount > 0) {
            // Thắng
            const profit = betAmount * matchCount;
            winnings = betAmount + profit;

            // Cộng tiền thắng vào DB
            const { data: latestUser } = await supabase.from(TABLE_NAME).select('money').eq('user_id', message.author.id).single();
            await supabase.from(TABLE_NAME).update({ money: latestUser.money + winnings }).eq('user_id', message.author.id);

            messageResult = `🎉 **NỔ HŨ!** Về **x${matchCount}** ${selectedItem.name}!\n💰 Em húp trọn: **${winnings.toLocaleString()} xu**`;
            color = "#00FF00";
        } else {
            messageResult = `💸 **HUHUHUHU~~ XỊT RỒI!** Mất trắng **${betAmount.toLocaleString()} xu**.\nChúc em may mắn lần sau nhooo!`;
        }

        // ====================================================
        // 💥 BƯỚC 3: MỞ BÁT (EDIT LẠI TIN NHẮN CŨ)
        // ====================================================
        const resultEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`🎲 KẾT QUẢ MỞ BÁT`)
            .setDescription(`Người chơi: **${message.author.displayName}**\nCược: **${betAmount.toLocaleString()}** vào **${selectedItem.icon} ${selectedItem.name}**`)
            .addFields(
                { name: '🥣 TRONG BÁT CÓ:', value: `# **${result[0].icon}  |  ${result[1].icon}  |  ${result[2].icon}**`, inline: false },
                { name: '📊 TỔNG KẾT', value: messageResult, inline: false }
            )
            .setFooter({ text: "Hệ thống Casino Mindy • y0M0ST" })
            .setTimestamp();

        // Sửa lại tin nhắn "Đang lắc" thành kết quả
        await replyMsg.edit({ embeds: [resultEmbed] });
    },
};