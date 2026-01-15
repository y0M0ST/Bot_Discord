import { EmbedBuilder } from 'discord.js';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// 1. KẾT NỐI SUPABASE
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const TABLE_NAME = 'economy'; // Tên bảng user của bà

// 2. CONFIG GAME
// Danh sách các biểu tượng trong guồng quay
const SYMBOLS = ['🍒', '🍊', '🍋', '🍇', '🍉', '💎', '7️⃣'];

// Tỷ lệ trả thưởng
const MULTIPLIERS = {
    JACKPOT: 15, // 3 hình giống nhau: Nhân 15
    PAIR: 3,     // 2 hình giống nhau: Nhân 3
};

// Hàm đợi tạo hiệu ứng
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default {
    name: "spin",
    aliases: ["slot", "quayhu"],
    description: "Quay Hũ Slot Machine (Nổ hũ x15)",
    category: "Games",

    async execute(message, args) {
        // --- CHECK KÊNH ---
        // 👇 Sửa lại chút để dùng chung 1 biến cho tiện (hoặc giữ nguyên tuỳ bà)
        const allowedChannel = process.env.SPIN_CHANNEL_ID;

        // 👇 THÊM DÒNG NÀY ĐỂ SOI:
        console.log(`[DEBUG] Config: "${allowedChannel}" | Kênh hiện tại: "${message.channel.id}"`);
        if (allowedChannel && message.channel.id !== allowedChannel) {
            setTimeout(() => message.delete().catch(() => { }), 3000);
            return message.reply(`🚫 **Sai sòng rồi!** Qua kênh <#${allowedChannel}> quay hũ nha!`)
                .then(msg => setTimeout(() => msg.delete().catch(() => { }), 5000));
        }

        // --- CHECK INPUT ---
        let betAmount = parseInt(args[0]);

        // Hỗ trợ gõ tắt: 10k, 50k...
        if (args[0] && args[0].toLowerCase().endsWith('k')) {
            betAmount = parseInt(args[0]) * 1000;
        }

        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply("🎰 **Cách chơi:** `=spin [Tiền cược]`\n👉 VD: `=spin 10000` hoặc `=spin 10k`");
        }

        // --- CHECK TIỀN TRONG DB ---
        const { data: user, error } = await supabase
            .from(TABLE_NAME)
            .select('money')
            .eq('user_id', message.author.id)
            .single();

        if (error || !user) return message.reply("⚠️ Bạn chưa đăng ký tài khoản! Gõ lệnh đăng ký trước nha.");
        if (user.money < betAmount) return message.reply(`💸 Ví còn có ${user.money.toLocaleString()} xu à, không đủ quay!`);

        // --- TRỪ TIỀN CƯỢC TRƯỚC ---
        await supabase.from(TABLE_NAME).update({ money: user.money - betAmount }).eq('user_id', message.author.id);

        // ====================================================
        // 🎰 PHẦN 1: HIỆU ỨNG ĐANG QUAY...
        // ====================================================
        const spinningEmbed = new EmbedBuilder()
            .setColor("#FFFF00") // Màu vàng
            .setTitle(`🎰 SLOT MACHINE - ĐANG QUAY...`)
            .setDescription(`Người chơi: **${message.author.displayName}**\nCược: **${betAmount.toLocaleString()} xu**`)
            .addFields({
                name: '🔻 KẾT QUẢ 🔻',
                value: `# **🔄  |  🔄  |  🔄**`, // Hiệu ứng đang quay
                inline: false
            })
            .setFooter({ text: "Hệ thống Casino Mindy... Chúc may mắn!" });

        const replyMsg = await message.reply({ embeds: [spinningEmbed] });

        // Đợi 2.5 giây cho hồi hộp
        await wait(3000);

        // ====================================================
        // 🎲 PHẦN 2: TÍNH KẾT QUẢ & TRẢ THƯỞNG
        // ====================================================
        const result = [];
        // Random 3 biểu tượng
        for (let i = 0; i < 3; i++) {
            result.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
        }

        const [s1, s2, s3] = result; // Lấy ra 3 biểu tượng để so sánh

        let winnings = 0;
        let messageResult = "";
        let color = "#FF0000"; // Mặc định màu đỏ (Thua)
        let winType = "LOSE";

        // --- Logic check thắng thua ---
        if (s1 === s2 && s2 === s3) {
            // --- TRƯỜNG HỢP 1: JACKPOT (3 hình giống nhau) ---
            winType = "JACKPOT";
            winnings = betAmount * MULTIPLIERS.JACKPOT;
            messageResult = `🔥 **NỔ HŨ SIÊU TO KHỔNG LỒ!** 🔥\nEm quay trúng 3 **${s1}**\n💰 Húp trọn: **${winnings.toLocaleString()} xu** (x${MULTIPLIERS.JACKPOT})`;
            color = "#FFD700"; // Màu vàng kim

        } else if (s1 === s2 || s1 === s3 || s2 === s3) {
            // --- TRƯỜNG HỢP 2: PAIR (2 hình giống nhau) ---
            winType = "PAIR";
            winnings = betAmount * MULTIPLIERS.PAIR;
            // Tìm ra cặp hình giống nhau để thông báo cho chuyên nghiệp
            const pairSymbol = (s1 === s2 || s1 === s3) ? s1 : s2;
            messageResult = `🎉 **Chúc mừng!** Em quay trúng đôi **${pairSymbol}**\n💰 Nhận được: **${winnings.toLocaleString()} xu** (x${MULTIPLIERS.PAIR})`;
            color = "#00FF00"; // Màu xanh lá

        } else {
            // --- TRƯỜNG HỢP 3: THUA TRẮNG ---
            messageResult = `💸 **Chúc em may mắn lần sau!**\nBay màu **${betAmount.toLocaleString()} xu** rồi.`;
        }

        // --- CỘNG TIỀN NẾU THẮNG ---
        if (winnings > 0) {
            // Lấy lại tiền mới nhất để cộng
            const { data: latestUser } = await supabase.from(TABLE_NAME).select('money').eq('user_id', message.author.id).single();
            await supabase.from(TABLE_NAME).update({ money: latestUser.money + winnings }).eq('user_id', message.author.id);
            console.log(`✅ [SPIN WIN] ${message.author.tag} | Loại: ${winType} | Ăn: +${winnings}`);
        } else {
            console.log(`❌ [SPIN LOSE] ${message.author.tag} | Thua: -${betAmount}`);
        }

        // ====================================================
        // 💥 PHẦN 3: HIỆN KẾT QUẢ CUỐI CÙNG
        // ====================================================
        const resultEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle(winType === "JACKPOT" ? `🎰🔥 JACKPOT!!! 🔥🎰` : `🎰 KẾT QUẢ QUAY HŨ`)
            .setDescription(`Người chơi: **${message.author.displayName}**\nCược: **${betAmount.toLocaleString()} xu**`)
            .addFields(
                // Hiện kết quả đã random ra
                { name: '🔻 KẾT QUẢ 🔻', value: `# **${s1}  |  ${s2}  |  ${s3}**`, inline: false },
                { name: '📊 TỔNG KẾT', value: messageResult, inline: false }
            )
            .setFooter({ text: "Hệ thống Casino Mindy • y0M0ST" })
            .setTimestamp();

        // Sửa lại tin nhắn "Đang quay" thành kết quả thật
        await replyMsg.edit({ embeds: [resultEmbed] });
    },
};