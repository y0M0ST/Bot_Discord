//src/commands/hello.js
export default {
    name: "hello",
    description: "Bot chào bạn",
    category: "Systems",
    async execute(message) {
        await message.reply(`Xin chào ${message.author.username} 👋`);
    },
};
