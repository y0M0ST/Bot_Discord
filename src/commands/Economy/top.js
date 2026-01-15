import { EmbedBuilder } from 'discord.js';
import { getTopRich } from '../../utils/economyHandler.js';

export default {
    name: "top", // Hoặc "rich", "leaderboard"
    description: "Xem Bảng Xếp Hạng đại gia server",
    category: "Economy",
    async execute(message, args) {
        // 1. Lấy dữ liệu từ Database
        const rawLeaderboard = await getTopRich(20); // Lấy top 10

        if (rawLeaderboard.length === 0) {
            return message.reply("😔 Server nghèo quá, chưa ai có đồng nào trong túi cả!");
        }

        // 2. Chuẩn bị nội dung hiển thị
        let description = "";

        // Duyệt qua từng người trong danh sách
        for (let i = 0; i < rawLeaderboard.length; i++) {
            const data = rawLeaderboard[i];
            const userId = data.user_id;
            const money = data.money.toLocaleString(); // Thêm dấu phẩy: 100,000

            // Huy chương cho Top 3
            let medal = "";
            if (i === 0) medal = "🥇";
            else if (i === 1) medal = "🥈";
            else if (i === 2) medal = "🥉";
            else medal = `**#${i + 1}**`; // Top 4 trở đi hiện số thứ tự

            // Cố gắng tìm tên người dùng trong Server
            // (Phải fetch để chắc chắn lấy được tên mới nhất)
            let memberName = "Người lạ bí ẩn";
            try {
                const member = await message.guild.members.fetch(userId);
                memberName = member.user.username; // Lấy tên nick
                // Nếu muốn hiện tên hiển thị trong server (nickname) thì dùng: member.displayName
            } catch (e) {
                // Nếu người đó đã thoát server thì bot không tìm thấy -> giữ nguyên "Người lạ"
                memberName = `<@${userId}> (Đã rời server)`;
            }

            // Ghi vào danh sách
            description += `${medal} **${memberName}** \n └─ 💰 \`${money} Xu\`\n\n`;
        }

        // 3. Tạo bảng Embed đẹp đẽ
        const embed = new EmbedBuilder()
            .setColor("#FFD700") // Màu vàng chói lọi
            .setTitle("🏆 BẢNG PHONG THẦN (TOP ĐẠI GIA)")
            .setDescription(description)
            .setThumbnail("https://tenor.com/view/ok-jk-gif-27201181") // Gif mèo rải tiền
            .setFooter({ text: "Muốn lên top thì cày (=work) hoặc liều (=taixiu) đi cưng!", iconURL: message.guild.iconURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};