import { EmbedBuilder } from 'discord.js';

export default {
    name: "qr",
    description: "Tạo mã QR nạp Coin tự động (Ví dụ: =qr 50000 y0M0ST)",
    category: "Info",
    async execute(message, args) {
        // --- CẤU HÌNH NGÂN HÀNG CỦA BÀ Ở ĐÂY ---
        const BANK_CONFIG = {
            BANK_ID: 'MB',          // Mã ngân hàng (MB, VCB, ACB...)
            ACCOUNT_NO: '0833745633', // Số tài khoản
            ACCOUNT_NAME: 'NGUYEN GIANG TRI BAO', // Tên chủ TK (Viết hoa không dấu)
            TEMPLATE: 'print'       // Kiểu ảnh QR: 'compact', 'qr_only', 'print'
        };
        // ----------------------------------------

        // 1. Lấy dữ liệu người dùng nhập
        const amount = parseInt(args[0]); // Số tiền
        const ign = args[1]; // Tên Ingame

        // 2. Validate (Kiểm tra lỗi nhập)
        if (!amount || isNaN(amount) || amount < 1000) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("⚠️ Lỗi cú pháp!")
                .setDescription("Số tiền phải là số và tối thiểu **5.000 VNĐ**.")
                .addFields({ name: "Ví dụ mẫu:", value: "`=qr 50000 Steve`" });
            return message.reply({ embeds: [errorEmbed] });
        }

        if (!ign) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("⚠️ Thiếu tên Ingame!")
                .setDescription("Em muốn nạp học phí hả? Nhớ ghi đúng tên nhân vật của em vào nha.")
                .addFields({ name: "Ví dụ mẫu:", value: "`=qr 50000 Steve`" });
            return message.reply({ embeds: [errorEmbed] });
        }

        // 3. Tính toán Coin (Tỉ lệ: 1.000 VNĐ = 1 Point)
        const coins = Math.floor(amount / 1000);

        // 4. Tạo Nội dung chuyển khoản (Memo)
        // Kết quả: "NAP y0M0ST 50 coin"
        const content = `NAP ${ign} ${coins} coin`;

        // 5. Tạo Link QR VietQR xịn sò
        const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-${BANK_CONFIG.TEMPLATE}.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`;

        // 6. Tạo Embed ĐẸP LUNG LINH ✨
        const embed = new EmbedBuilder()
            .setColor("#00FF00") // Màu xanh lá uy tín
            .setTitle(`💎 CỔNG THANH TOÁN TỰ ĐỘNG`)
            .setDescription(`Hệ thống nạp Point tự động 24/7.\nQuét mã bên dưới để nạp cho nhân vật **${ign}**.`)
            .setThumbnail("https://cdn-icons-png.flaticon.com/512/2534/2534204.png") // Icon tiền
            .addFields(
                { name: "👤 Người nhận", value: `\`${ign}\``, inline: true },
                { name: "💰 Số tiền", value: `\`${amount.toLocaleString()} VNĐ\``, inline: true },
                { name: "💎 Nhận được", value: `**${coins} Point**`, inline: true },
            )
            .setImage(qrUrl) // Ảnh QR to đùng
            .setFooter({
                text: `⚠️ QUAN TRỌNG: Không sửa nội dung chuyển khoản để hệ thống tự động duyệt!`,
                iconURL: message.guild.iconURL()
            })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};