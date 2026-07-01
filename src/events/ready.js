import { ActivityType, Events } from 'discord.js';

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ Bot: ${client.user.tag} đã online!`);

        // Cả một rổ status cute, bà có thể tự nghĩ thêm và thêm vào mảng này nha
        const cuteStatuses = [
            // { text: 'Linh Đan là số 1 💖', type: ActivityType.Playing },
            // { text: 'giọng Linh Đan 🎧', type: ActivityType.Listening },
            // { text: 'chờ Linh Đan rep tin nhắn 🥺', type: ActivityType.Watching },
            { text: 'với Linh Đan 🎮', type: ActivityType.Playing }
        ];

        let i = 0;

        // Cho bot tự động đổi status liên tục (hiện tại đang để 15 giây đổi 1 lần)
        setInterval(() => {
            const status = cuteStatuses[i % cuteStatuses.length];

            client.user.setActivity(status.text, {
                type: status.type
            });

            i++;
        }, 3000); // 15000 mili-giây = 15 giây (bà muốn chậm hơn thì chỉnh lên 30000 nha)
    },
};