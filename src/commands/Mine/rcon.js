import { RCON } from 'minecraft-server-util';

export default {
    name: "cmd", // Tên lệnh ngắn gọn là cmd cho lẹ
    description: "Gửi lệnh vào Console Server Minecraft (Admin Only)",
    category: "Minecraft",
    async execute(message, args) {
        // 1. CHỐT CHẶN BẢO MẬT: Kiểm tra ID người dùng
        if (message.author.id !== process.env.OWNER_ID) {
            return message.reply("⛔ **CẤM!** Chỉ có chủ server mới được dùng lệnh này nha cưng!");
        }

        // 2. Kiểm tra cú pháp
        if (!args[0]) {
            return message.reply("⚠️ Nhập lệnh cần gửi đi bà! Ví dụ: `=cmd time set day` hoặc `=cmd whitelist add TenNguoiChoi`");
        }

        const commandToSend = args.join(" ");
        const msg = await message.reply(`🔄 Đang gửi lệnh: \`/${commandToSend}\`...`);

        // Khởi tạo RCON Client
        const client = new RCON();

        try {
            // 3. Kết nối tới Server Minecraft
            // IP và Port lấy từ .env
            await client.connect(process.env.RCON_IP, parseInt(process.env.RCON_PORT) || 25575);

            // 4. Đăng nhập
            await client.login(process.env.RCON_PASS);

            // 5. Gửi lệnh và nhận phản hồi
            const response = await client.run(commandToSend);

            // 6. Đóng kết nối ngay lập tức (cho an toàn)
            await client.close();

            // 7. Báo cáo kết quả
            // Nếu phản hồi dài quá 2000 ký tự thì cắt bớt để không lỗi Discord
            let output = response || "✅ Lệnh đã thực thi (Không có phản hồi từ server)";
            if (output.length > 1900) output = output.substring(0, 1900) + "... (Dài quá cắt bớt)";

            await msg.edit({
                content: `✅ **Thành công!** Server trả lời:`,
                embeds: [], // Xoá embed cũ nếu có
                components: []
            });
            // Gửi kết quả dạng Code Block cho dễ nhìn
            await message.channel.send(`\`\`\`yaml\n${output}\n\`\`\``);

        } catch (error) {
            console.error(error);
            await msg.edit(`❌ **Lỗi RCON:** Không thể kết nối hoặc sai mật khẩu! \nLỗi: \`${error.message}\``);
            // Cố gắng đóng kết nối nếu bị kẹt
            try { await client.close(); } catch (e) { }
        }
    },
};