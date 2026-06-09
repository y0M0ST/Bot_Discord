import { ActivityType, Events } from 'discord.js';
import { getPlayerCount } from '../utils/fivemHelper.js';

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ Bot đã khởi động: ${client.user.tag}`);

        const updateFiveMStatus = async () => {
            try {
                const count = await getPlayerCount();
                client.user.setActivity(`Đang soi ${count} giang hồ ở Haven RP`, {
                    type: ActivityType.Watching,
                });
            } catch (error) {
                console.error('[FiveM Status]', error.message);
                client.user.setActivity('Haven RP offline hoặc bật khiên API', {
                    type: ActivityType.Watching,
                });
            }
        };

        updateFiveMStatus();
        setInterval(updateFiveMStatus, 3 * 60 * 1000);
    },
};
