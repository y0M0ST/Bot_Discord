export default {
    name: "stop",
    description: "Dừng nhạc",
    category: "Music",
    async execute(message) {
        const queue = message.client.distube.getQueue(message);
        if (!queue) return message.reply("📭 Có nhạc đâu mà dừng?");

        queue.stop();
        message.reply("🛑 Đã dừng nhạc!");
    },
};