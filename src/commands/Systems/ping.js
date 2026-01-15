//src/commands/ping.js
export default {
    name: "ping",
    description: "Kiểm tra độ trễ",
    category: "Systems",
    async execute(message) {
        const sent = await message.reply("Pinging…");
        const latency = sent.createdTimestamp - message.createdTimestamp;
        await sent.edit(`Pong! Độ trễ: ${latency}ms`);
    },
};
