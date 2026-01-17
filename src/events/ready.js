import { ActivityType, Events } from 'discord.js';

export default {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ Bot đã khởi động: ${client.user.tag}`);

        // Danh sách các trạng thái muốn hiển thị
        const activities = [
            // { name: "Minecraft Server: blastmc.mcrft.top", type: ActivityType.Playing },
            { name: "🎀 Bot được code bởi y0M0ST 🎀", type: ActivityType.Listening },
            { name: "🎶 Anh đi mòn đôi tất, mất đôi mươi", type: ActivityType.Listening },
            { name: "🎼 Em thì đẹp đôi mắt, mất đôi môi", type: ActivityType.Listening },
            { name: "🎤 Vậy là cô ta quan trọng với anh phải không", type: ActivityType.Listening },
            { name: "🎵 Em khóc bao đêm còn chẳng bằng cô ta đỏ mắt", type: ActivityType.Listening },
            // { name: "Minigame hấp dẫn", type: ActivityType.Watching },
            // { name: "Server dân cày", type: ActivityType.Competing },
            // { name: "Có làm thì mới có ăn", type: ActivityType.Competing },

        ];

        let i = 0;

        // Hàm đổi status
        const updateStatus = () => {
            // Lấy thông tin từ danh sách theo vòng tròn
            const activity = activities[i++ % activities.length];

            client.user.setPresence({
                activities: [{
                    name: activity.name,
                    type: activity.type
                }],
                status: 'dnd', // Trạng thái có thể là 'online', 'idle', 'dnd', hoặc 'invisible'
            });
        };

        // Chạy ngay lập tức lần đầu
        updateStatus();
        setInterval(updateStatus, 5 * 1000);
    },
};