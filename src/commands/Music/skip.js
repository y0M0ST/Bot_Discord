export default {
    name: "skip",
    description: "Qua bài",
    category: "Music",
    async execute(message) {
        const queue = message.client.distube.getQueue(message);
        if (!queue) return message.reply("📭 Có nhạc đâu mà skip?");

        try {
            // Nếu chỉ còn 1 bài thì stop luôn
            if (queue.songs.length === 1) {
                queue.stop();
                message.reply("🛑 Hết bài rồi, dừng luôn nha.");
            } else {
                await queue.skip();
                message.reply("⏩ Đã qua bài!");
            }
        } catch (e) {
            message.reply("❌ Lỗi: " + e.message);
        }
    },
};