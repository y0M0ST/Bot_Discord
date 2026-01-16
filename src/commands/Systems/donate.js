import { EmbedBuilder } from 'discord.js';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Kết nối Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default {
    name: "qr",
    description: "Tạo mã nạp định danh (Hỗ trợ mọi tên nhân vật)",
    category: "Info",
    async execute(message, args) {
        // --- 1. CẤU HÌNH NGÂN HÀNG ---
        const BANK_CONFIG = {
            BANK_ID: 'MB',
            ACCOUNT_NO: '0833745633',
            ACCOUNT_NAME: 'NGUYEN GIANG TRI BAO',
            TEMPLATE: 'print'
        };

        // --- 2. LẤY DỮ LIỆU ---
        const amount = parseInt(args[0]);
        const ign = args[1]; // Tên Ingame (Chấp nhận mọi kí tự: _, ., @...)

        // --- 3. VALIDATE CƠ BẢN ---
        if (!amount || isNaN(amount) || amount < 2000) {
            return message.reply("⚠️ **Lỗi:** Số tiền nạp tối thiểu là **2.000 VNĐ**.\n👉 Ví dụ: `=qr 20000 Steve`");
        }

        if (!ign) {
            return message.reply("⚠️ **Thiếu tên:** Vui lòng nhập tên nhân vật.\n👉 Ví dụ: `=qr 20000 Steve`");
        }

        // --- 4. SINH MÃ GIAO DỊCH NGẪU NHIÊN (Ví dụ: MD839201) ---
        // Mã này an toàn tuyệt đối, ngân hàng đọc không bao giờ sai
        const randomCode = Math.floor(100000 + Math.random() * 900000);
        const transactionCode = `MD${randomCode}`;

        // --- 5. LƯU VÀO DATABASE (CHỜ NẠP) ---
        const { error } = await supabase
            .from('pending_transactions')
            .insert({
                code: transactionCode,
                ign: ign,    // Lưu cái tên "khó chịu" (regetonchampan_) vào đây
                amount: amount
            });

        if (error) {
            console.error(error);
            return message.reply("❌ Lỗi kết nối Database. Vui lòng thử lại sau!");
        }

        // --- 6. TẠO QR VỚI NỘI DUNG LÀ MÃ GIAO DỊCH ---
        // Nội dung CK: "NAP MD839201"
        const content = `NAP ${transactionCode}`;

        const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-${BANK_CONFIG.TEMPLATE}.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`;

        const embed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle(`💎 MÃ GIAO DỊCH: ${transactionCode}`)
            .setDescription(`Hệ thống đã tạo mã riêng cho **${ign}**.\nVui lòng quét mã bên dưới để hoàn tất.`)
            .setThumbnail("https://cdn-icons-png.flaticon.com/512/2534/2534204.png")
            .addFields(
                { name: "👤 Nạp cho", value: `\`${ign}\``, inline: true },
                { name: "💰 Số tiền", value: `\`${amount.toLocaleString()} VNĐ\``, inline: true },
                { name: "🔑 Mã Giao Dịch", value: `\`${transactionCode}\``, inline: true },
            )
            .setImage(qrUrl)
            .setFooter({
                text: `⚠️ Mã này chỉ dùng 1 lần! Không sửa nội dung chuyển khoản.`,
                iconURL: message.guild.iconURL()
            })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};