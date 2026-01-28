import { EmbedBuilder } from 'discord.js';
import { safeReply } from '../../utils/discordHelper.js';

export default {
    name: 'ip',
    description: 'Xem danh sách IP Server',
    aliases: ['address', 'connect', 'domain', 'loivo'],

    async execute(message, args) {
        // Danh sách 3 IP của bà
        const ips = [
            { name: '🔥 Cổng Chính (Ưu tiên)', value: 'blastmc.online' },
            { name: '🌊 Cổng Phụ 1', value: 'blastmc.minecraftvn.asia' },
            { name: '⚙️ Cổng Phụ 2 (Có Port)', value: 'blastmc.online:25563' }
        ];

        // API check trạng thái
        const CHECK_URL = `https://api.mcsrvstat.us/2/blastmc.online:25563`;

        // 1. Gửi tin nhắn chờ
        const loadingMsg = await message.channel.send('🔍 **Mindy đang dò sóng tìm đường vào server...** 📡');

        try {
            // 2. Gọi API kiểm tra trạng thái
            const response = await fetch(CHECK_URL);
            const data = await response.json();

            // 3. Xử lý dữ liệu hiển thị
            let statusText = '🔴 **Bảo trì / Offline**';
            let color = '#FF0000'; // Đỏ
            let players = '0';
            let version = 'Unknown';
            // 👇 Ảnh mặc định (nếu offline)
            let icon = 'https://i.imgur.com/e442x1G.png';

            // Nếu server Online
            if (data.online) {
                statusText = '🟢 **Đang hoạt động**';
                color = '#00FF00'; // Xanh lá
                players = `${data.players.online} / ${data.players.max}`;
                version = data.version;

                // 👇 FIX LỖI Ở ĐÂY: Dùng link trực tiếp thay vì lấy data.icon (base64)
                icon = `https://api.mcsrvstat.us/icon/blastmc.online:25563`;
            }

            // 4. Tạo Embed
            const embed = new EmbedBuilder()
                .setTitle(`⛏️ CỔNG KẾT NỐI BLASTMC`)
                .setDescription(
                    `Server hiện có **3 lối vào**. Nếu IP này lag, hãy thử IP khác nhé!\n` +
                    `Tình trạng: ${statusText}\n` +
                    `👥 Online: **${players}** | 📦 Version: **${version}**`
                )
                .setColor(color)
                .setThumbnail(icon) // Giờ nó là link http rồi, Discord chịu liền!
                .setFooter({ text: 'Bot Mindy - Chúc bạn chơi vui vẻ!', iconURL: message.client.user.displayAvatarURL() })
                .setTimestamp();

            // 5. Thêm danh sách IP
            ips.forEach(ip => {
                embed.addFields({
                    name: ip.name,
                    value: `\`\`\`${ip.value}\`\`\``,
                    inline: false
                });
            });

            await loadingMsg.edit({ content: null, embeds: [embed] });

        } catch (error) {
            console.error("Lỗi lấy IP:", error);
            await loadingMsg.edit({ content: "⚠️ **Lỗi dò sóng!** Nhưng IP chính là: `blastmc.online` nha!" });
        }
    }
};