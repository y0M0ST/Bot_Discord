import { EmbedBuilder } from 'discord.js';

export default {
    name: "msg",
    aliases: ["say", "loa", "phatbieu"],
    description: "Phát biểu trước lớp (Xoá tin nhắn gốc, hiện Embed)",
    category: "Utility",
    async execute(message, args) {
        // 1. Kiểm tra nội dung
        const content = args.join(" ");

        // Nếu không nhập gì thì nhắc nhẹ rồi xoá
        if (!content) {
            if (message.deletable) message.delete().catch(() => { });
            const warning = await message.channel.send("⚠️ **Nói gì đi em?** Ví dụ: `=msg Em xin phép đi vệ sinh ạ`");
            setTimeout(() => warning.delete().catch(() => { }), 5000);
            return;
        }

        // 2. Chặn spam ping @everyone
        if (content.includes("@everyone") || content.includes("@here")) {
            if (message.deletable) message.delete().catch(() => { });
            const warning = await message.channel.send(`🚫 **${message.author.username}**, không được spam ping cả lớp nha!`);
            setTimeout(() => warning.delete().catch(() => { }), 5000);
            return;
        }

        // 3. XOÁ TIN NHẮN GỐC (Phi tang lệnh)
        if (message.deletable) {
            await message.delete().catch(err => console.log("Lỗi xoá tin nhắn:", err));
        }

        // 4. Tạo Embed "Phát Biểu"
        const embed = new EmbedBuilder()
            .setColor("#00BFFF") // Màu xanh dương tươi sáng (hoặc đổi màu bà thích)
            .setAuthor({
                name: `${message.author.displayName} đã nói:`, // Dùng displayName để lấy tên hiển thị (nickname) trong server
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setDescription(`**${content}**`) // Nội dung in đậm cho rõ
            .setFooter({ text: "📢 Tin nhắn được chuyển lời bởi Cô giáo Mindy" })
            .setTimestamp();

        // 5. Gửi Embed
        message.channel.send({ embeds: [embed] });
    },
};