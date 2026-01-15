import { EmbedBuilder } from 'discord.js';

export default {
    name: "qr", // Hoặc "donate", "napthe"
    description: "Hiện mã QR để ủng hộ Admin (Ví dụ: =qr 50000)",
    category: "Info",
    execute(message, args) {
        // --- 1. CẤU HÌNH TÀI KHOẢN CỦA BÀ Ở ĐÂY ---
        const BANK_ID = 'MB';         // Mã ngân hàng (MB, VCB, ACB, TPBank, VPBank...)
        const ACCOUNT_NO = '0833745633'; // Số tài khoản của bà
        const ACCOUNT_NAME = 'NGUYEN GIANG TRI BAO'; // Tên chủ tài khoản (Viết hoa không dấu)
        const TEMPLATE = 'print';     // Kiểu hiển thị: 'compact', 'qr_only', 'print'

        // --- 2. XỬ LÝ SỐ TIỀN (Nếu người dùng nhập) ---
        // Ví dụ: =qr 20000 -> Tạo QR sẵn 20k
        let amount = parseInt(args[0]);
        let description = "";

        if (!isNaN(amount) && amount > 0) {
            description = `Mã QR chuyển nhanh **${amount.toLocaleString()} VNĐ**`;
        } else {
            amount = 0; // Nếu không nhập số tiền thì để trống
            description = "Quét mã để ủng hộ (Số tiền tuỳ tâm)";
        }

        // Nội dung chuyển khoản mặc định (Không dấu)
        const content = `Ung ho server ${message.author.username}`;

        // --- 3. TẠO LINK VIETQR ---
        // Link API thần thánh: https://img.vietqr.io/image/<BANK>-<ACC>-<TEMPLATE>.png
        const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

        // --- 4. TẠO EMBED ---
        const embed = new EmbedBuilder()
            .setColor("#E91E63") // Màu hồng nam tính
            .setTitle(`💸 CỔNG DONATE: ${ACCOUNT_NAME}`)
            .setDescription(`Cảm ơn **${message.author.username}** đã có lòng ủng hộ server! 💖\n${description}`)
            .setImage(qrUrl) // Đặt ảnh QR to đùng ở giữa
            .setFooter({ text: "Lưu ý: Đây là donate ủng hộ, không phải nạp xu vào bot nha!" })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};