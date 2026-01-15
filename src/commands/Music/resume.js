export default {
    name: "resume",
    description: "Tiếp tục phát nhạc",
    category: "Music",
    async execute(message) {
        const queue = message.client.distube.getQueue(message);
        if (!queue) return message.reply("📭 Im ru à.");

        if (queue.paused) {
            queue.resume();
            message.reply("▶️ Nhạc lên! Quẩy tiếp 💃. Ey ey ey");
        } else {
            message.reply("⚠️ Đang hát bình thường mà?");
        }
    },
};