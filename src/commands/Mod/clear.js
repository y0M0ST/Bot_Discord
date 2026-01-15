import { PermissionsBitField } from 'discord.js';

export default {
    name: "clear",
    description: "Xoá tin nhắn hàng loạt (Chỉ Admin)",
    category: "Mod",
    async execute(message, args) {
        // 1. CHỐT CHẶN BẢO MẬT: Soi quyền Admin 👮‍♀️
        // Nếu không có quyền Administrator -> Cấm cửa ngay
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("⛔ **Á à!** Bà không có quyền Admin mà đòi xoá chat hả? Mơ đi cưng!");
        }

        // 2. Kiểm tra số lượng nhập vào
        const amount = parseInt(args[0]);

        if (isNaN(amount)) {
            return message.reply("⚠️ Bà phải nhập số lượng cần xoá chứ! (Ví dụ: `=clear 10`)");
        }

        if (amount < 1 || amount > 99) {
            return message.reply("⚠️ Chỉ xoá được từ **1 đến 99** tin nhắn mỗi lần thôi nha (Luật Discord nó thế)!");
        }

        // 3. Tiến hành dọn dẹp 🧹
        try {
            // bulkDelete(số lượng, true) -> true nghĩa là bỏ qua tin nhắn cũ quá 14 ngày (đỡ bị lỗi)
            // Tự động xoá luôn cả cái câu lệnh =clear của bà
            const deleted = await message.channel.bulkDelete(amount + 1, true);

            // Gửi tin nhắn báo cáo (trừ đi 1 là cái lệnh =clear)
            const msg = await message.channel.send(`✅ Đã thổi bay **${deleted.size - 1}** tin nhắn! Sạch bong kin kít ✨`);

            // 4. Tự huỷ tin nhắn báo cáo sau 5 giây (Cho kênh chat sạch sẽ hoàn toàn)
            setTimeout(() => {
                msg.delete().catch(err => { }); // Bắt lỗi lỡ tin nhắn bị xoá trước đó rồi
            }, 5000);

        } catch (error) {
            console.error(error);
            message.channel.send("❌ Lỗi rồi! Có thể là tin nhắn **quá cũ (hơn 14 ngày)** nên bot không xoá được.");
        }
    },
};