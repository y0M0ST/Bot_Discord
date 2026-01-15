// src/events/ready.js
import { ActivityType, Events } from 'discord.js'; // 👈 Thêm Events vào import

export default {
    name: Events.ClientReady, // 👈 Đổi 'ready' thành Events.ClientReady
    once: true,
    execute(client) {
        console.log(`✅ Bot đã khởi động thành công: ${client.user.tag}`);

        const updateStatus = () => {
            const serverCount = client.guilds.cache.size;

            client.user.setPresence({
                activities: [{
                    name: `${serverCount} Server | =help`,
                    type: ActivityType.Watching
                }],
                status: 'dnd', // 'online', 'idle', 'dnd', 'invisible'
            });
        };

        updateStatus();
        setInterval(updateStatus, 1 * 1000); // Cập nhật mỗi 1 phút
    },
};