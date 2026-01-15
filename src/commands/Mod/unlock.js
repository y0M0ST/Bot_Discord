//src/commands/unlock.js
export default {
    name: "unlock",
    description: "Mở khoá kênh text hoặc voice bằng ID hoặc mention",
    category: "Mod",
    async execute(message, args) {
        if (!message.member.permissions.has("ManageChannels")) {
            return message.reply("⚠️ Bạn không có quyền để mở khoá kênh.");
        }

        // Lấy kênh từ mention hoặc ID
        let channel = message.mentions.channels.first();
        if (!channel && args.length > 0) {
            channel = message.guild.channels.cache.get(args[0]);
        }
        if (!channel) {
            return message.reply("⚠️ Vui lòng mention hoặc nhập ID kênh.");
        }

        // Nếu là kênh text
        if (channel.type === 0) { // GuildText
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: true,
                ViewChannel: true,
            });
            return message.reply(`🔓 Kênh text ${channel.name} đã được mở khoá.`);
        }

        // Nếu là kênh voice
        if (channel.type === 2) { // GuildVoice
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                Connect: true,
                ViewChannel: true,
            });
            return message.reply(`🔓 Kênh voice ${channel.name} đã được mở khoá.`);
        }

        return message.reply("⚠️ Loại kênh này chưa được hỗ trợ.");
    },
};
