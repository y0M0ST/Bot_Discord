//src/commands/setwelcome.js
export default {
    name: "setwelcome",
    description: "Chọn kênh để gửi welcome/goodbye",
    category: "Mod",
    async execute(message, args) {
        // Chỉ admin mới được dùng
        if (!message.member.permissions.has("Administrator")) {
            return message.reply("❌ Bạn cần quyền Administrator để dùng lệnh này.");
        }

        const channel = message.mentions.channels.first();
        if (!channel) {
            return message.reply("⚠️ Vui lòng tag một kênh, ví dụ: =setwelcome #general");
        }

        // Lưu ID kênh vào memory tạm (có thể nâng cấp dùng database)
        message.client.welcomeChannelId = channel.id;

        return message.reply(`✅ Đã đặt kênh welcome/goodbye là ${channel}`);
    },
};
