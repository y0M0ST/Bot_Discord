import { ActivityType, Events } from 'discord.js';
import Logger from '../utils/logger.js';

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ Bot: ${client.user.tag} đã online!`);
        Logger.status("🟢 ONLINE", `Bot: ${client.user.tag} đã sẵn sàng phục vụ Linh Đan!`, "Green");

        // Gọi ĐÚNG 1 LẦN, Discord sẽ tự động làm phần đếm giờ còn lại!
        client.user.setActivity('với Linh Đan 💖', {
            type: ActivityType.Playing,
            timestamps: {
                start: Date.now() // Báo cho Discord biết thời điểm bắt đầu
            }
        });
    },
};