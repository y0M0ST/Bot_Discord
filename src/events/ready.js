import { ActivityType, Events } from 'discord.js';

export default {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ Bot đã khởi động: ${client.user.tag}`);

        // Danh sách các trạng thái muốn hiển thị
        const activities = [
            { name: "Minecraft Server: blastmc.mcrft.top", type: ActivityType.Playing },
            { name: "gõ =help để xem lệnh", type: ActivityType.Listening },
            { name: "Minigame hấp dẫn", type: ActivityType.Watching },
            { name: "Server dân cày", type: ActivityType.Competing },
            { name: "Có làm thì mới có ăn", type: ActivityType.Competing },

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
                status: 'online', // Trạng thái có thể là 'online', 'idle', 'dnd', hoặc 'invisible'
            });
        };

        // Chạy ngay lập tức lần đầu
        updateStatus();

        // Cài đặt đổi mỗi 10 giây (10 * 1000)
        // Đừng để 1 giây nha, Discord nó chặn đó!
        setInterval(updateStatus, 10 * 1000);
    },
};