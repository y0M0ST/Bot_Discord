//src/commands/createchannel.js
import { EmbedBuilder } from "discord.js";

export default {
    name: "newch",
    description: "Tạo kênh chat/voice mới, có thể tạo luôn category chứa kênh",
    category: "Mod",
    async execute(message, args) {
        if (!message.member.permissions.has("Administrator")) {
            return message.reply("❌ Bạn cần quyền Administrator để dùng lệnh này.");
        }

        const type = args[0]; // text hoặc voice
        const name = args[1]; // tên kênh
        const categoryArg = args[2]; // category (tên hoặc ID, hoặc 'new:<TênCategory>')
        const extraArg = args[3]; // topic (text) hoặc user limit (voice)

        if (!type || !["text", "voice"].includes(type)) {
            return message.reply(
                "⚠️ Vui lòng nhập loại kênh hợp lệ: `text` hoặc `voice`\n" +
                "Ví dụ:\n" +
                "`=newch text general-chat CategoryName \"Nơi thảo luận chung\"`\n" +
                "`=newch voice GamingRoom CategoryName 10`\n" +
                "`=newch text news new:TinTuc \"Kênh tin tức\"` (tạo mới category TinTuc)"
            );
        }

        if (!name) {
            return message.reply("⚠️ Vui lòng nhập tên kênh. Ví dụ: `=newch text general-chat`");
        }

        let parentCategory = null;
        if (categoryArg) {
            if (categoryArg.startsWith("new:")) {
                // Tạo category mới
                const newCatName = categoryArg.replace("new:", "");
                parentCategory = await message.guild.channels.create({
                    name: newCatName,
                    type: 4, // 4 = category
                    reason: `Tạo category bởi ${message.author.tag}`,
                });
            } else {
                // Nếu nhập ID thì lấy theo ID
                parentCategory = message.guild.channels.cache.get(categoryArg);
                // Nếu không phải ID, thử tìm theo tên
                if (!parentCategory) {
                    parentCategory = message.guild.channels.cache.find(
                        (ch) => ch.type === 4 && ch.name.toLowerCase() === categoryArg.toLowerCase()
                    );
                }
            }
        }

        try {
            let options = {
                name: name,
                type: type === "text" ? 0 : 2, // 0 = text, 2 = voice
                parent: parentCategory ? parentCategory.id : null,
                reason: `Tạo bởi ${message.author.tag}`,
            };

            if (type === "text" && extraArg) {
                options.topic = extraArg.replace(/"/g, "");
            }

            if (type === "voice" && extraArg && !isNaN(extraArg)) {
                options.userLimit = parseInt(extraArg);
            }

            const channel = await message.guild.channels.create(options);

            // Embed thông báo đẹp
            const embed = new EmbedBuilder()
                .setColor(type === "text" ? 0x2ecc71 : 0x3498db)
                .setTitle("✅ Kênh mới đã được tạo")
                .addFields(
                    { name: "📌 Loại kênh", value: type.toUpperCase(), inline: true },
                    { name: "🆔 Tên kênh", value: channel.name, inline: true },
                    { name: "📂 Category", value: parentCategory ? parentCategory.name : "Không có", inline: true }
                )
                .setFooter({ text: `Tạo bởi ${message.author.tag}` })
                .setTimestamp();

            if (type === "text" && options.topic) {
                embed.addFields({ name: "💬 Topic", value: options.topic, inline: false });
            }

            if (type === "voice" && options.userLimit) {
                embed.addFields({ name: "👥 User Limit", value: options.userLimit.toString(), inline: false });
            }

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return message.reply("❌ Có lỗi xảy ra khi tạo kênh.");
        }
    },
};
