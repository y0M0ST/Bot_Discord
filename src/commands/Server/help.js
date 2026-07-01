// src/commands/help.js
import {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ComponentType
} from "discord.js";

export default {
    name: "help",
    description: "Xem danh sách lệnh (Giao diện Pro)",
    category: "System",
    async execute(message, args) {
        const { commands } = message.client;

        // 1. Gom nhóm các lệnh dựa theo category
        const categories = new Map();

        commands.forEach((cmd) => {
            let category = cmd.category || "Khác";
            
            // Chuẩn hóa và Việt hóa tên danh mục cho siêu gọn
            if (["System", "Systems", "Utility", "Info", "Server"].includes(category)) category = "Hệ thống";
            if (["Mod", "Moderation"].includes(category)) category = "Quản trị";
            if (["Game", "Games", "Mini-Games", "Fun"].includes(category)) category = "Giải trí";
            if (["Economy"].includes(category)) category = "Kinh tế";
            if (["Music"].includes(category)) category = "Âm nhạc";

            if (!categories.has(category)) {
                categories.set(category, []);
            }
            categories.get(category).push(cmd);
        });

        // 2. Tạo các lựa chọn cho Menu Dropdown
        // Map icon cho đẹp đội hình
        const emojis = {
            "Âm nhạc": "🎵",
            "Quản trị": "🛡️",
            "Hệ thống": "⚙️",
            "Giải trí": "🎮",
            "Kinh tế": "💰",
            "Khác": "📂"
        };

        const options = [];
        categories.forEach((_, key) => {
            options.push({
                label: key,
                description: `Xem các lệnh thuộc nhóm ${key}`,
                value: key,
                emoji: emojis[key] || "🔹",
            });
        });

        // 3. Tạo Menu Select
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("help_menu")
            .setPlaceholder("🔻 Chọn danh mục lệnh cần xem...")
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // 4. Tạo Embed mặc định ban đầu
        const embed = new EmbedBuilder()
            .setColor(0x00bfff)
            .setTitle("🤖 Hướng dẫn sử dụng Bot")
            .setDescription(
                `Chào **${message.author.username}**! 👋\n` +
                `Tui hiện có tổng cộng **${commands.size}** lệnh.\n\n` +
                `👉 **Hãy chọn một danh mục bên dưới để xem chi tiết nha!**`
            )
            .setThumbnail(message.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: "Menu sẽ tự đóng sau 60 giây" });

        // 5. Gửi tin nhắn kèm Menu
        const reply = await message.reply({
            embeds: [embed],
            components: [row]
        });

        // 6. Tạo bộ lắng nghe (Collector) để bắt sự kiện chọn menu
        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60000, // Menu tồn tại 60 giây
        });

        collector.on("collect", async (interaction) => {
            // Chỉ người gọi lệnh mới được bấm
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({
                    content: "❌ Cái này hông phải của em nha. Em muốn xài thì em gõ lệnh giống bạn nha!",
                    ephemeral: true // Chỉ hiện cho người bấm thấy
                });
            }

            const selectedCategory = interaction.values[0];
            const cmds = categories.get(selectedCategory);

            // Tạo list lệnh để hiển thị
            const list = cmds.map((cmd) => `\`=${cmd.name}\`: ${cmd.description}`).join("\n");

            // Update lại Embed
            const categoryEmbed = new EmbedBuilder()
                .setColor(0x00ff99)
                .setTitle(`${emojis[selectedCategory] || "🔹"} Danh mục: ${selectedCategory}`)
                .setDescription(list)
                .setFooter({ text: `Yêu cầu bởi ${message.author.tag}` });

            await interaction.update({ embeds: [categoryEmbed] });
        });

        collector.on("end", () => {
            // Hết giờ thì vô hiệu hóa menu
            const disabledRow = new ActionRowBuilder().addComponents(
                selectMenu.setDisabled(true).setPlaceholder("Hết thời gian thao tác")
            );
            reply.edit({ components: [disabledRow] }).catch(() => { });
        });
    },
};