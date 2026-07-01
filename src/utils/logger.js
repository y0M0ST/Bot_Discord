import { WebhookClient, EmbedBuilder } from 'discord.js';
import { config } from '../config/env.js';

// Khởi tạo các Webhook Client nếu có URL
const crashWebhook = config.webhooks.crash ? new WebhookClient({ url: config.webhooks.crash }) : null;
const musicWebhook = config.webhooks.music ? new WebhookClient({ url: config.webhooks.music }) : null;
const statusWebhook = config.webhooks.status ? new WebhookClient({ url: config.webhooks.status }) : null;
const activityWebhook = config.webhooks.activity ? new WebhookClient({ url: config.webhooks.activity }) : null;

class Logger {
    static crash(error, context = "Uncaught Exception") {
        console.error(`[CRASH - ${context}]`, error);
        if (!crashWebhook) return;

        const embed = new EmbedBuilder()
            .setTitle(`🚨 [CRASH] ${context}`)
            .setColor("DarkRed")
            .setDescription(`\`\`\`js\n${error.stack ? String(error.stack).slice(0, 4000) : error.message}\n\`\`\``)
            .setTimestamp();

        crashWebhook.send({ embeds: [embed] }).catch(() => {});
    }

    static music(error, queue = null) {
        console.error("[MUSIC ERROR]", error);
        if (!musicWebhook) return;

        const embed = new EmbedBuilder()
            .setTitle("🎵 [Music Error]")
            .setColor("Orange")
            .setDescription(`\`\`\`js\n${error.message || error}\n\`\`\``)
            .setTimestamp();
        
        if (queue && queue.textChannel) {
            embed.addFields({ name: "Server", value: `${queue.textChannel.guild.name} (${queue.textChannel.guildId})` });
        }

        musicWebhook.send({ embeds: [embed] }).catch(() => {});
    }

    static status(title, message, color = "Green") {
        console.log(`[STATUS] ${title} - ${message}`);
        if (!statusWebhook) return;

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(color)
            .setDescription(message)
            .setTimestamp();

        statusWebhook.send({ embeds: [embed] }).catch(() => {});
    }

    static activity(action, guild) {
        console.log(`[ACTIVITY] ${action}: ${guild.name}`);
        if (!activityWebhook) return;

        const isJoin = action === "JOIN";
        const embed = new EmbedBuilder()
            .setTitle(isJoin ? "👋 Bot đã tham gia Server mới" : "🚪 Bot bị đá khỏi Server")
            .setColor(isJoin ? "Green" : "Red")
            .addFields(
                { name: "Tên Server", value: `${guild.name}`, inline: true },
                { name: "ID", value: `${guild.id}`, inline: true },
                { name: "Số thành viên", value: `${guild.memberCount}`, inline: true }
            )
            .setTimestamp();

        activityWebhook.send({ embeds: [embed] }).catch(() => {});
    }

    static command(author, commandName, channel) {
        console.log(`[COMMAND] ${author.tag} dùng lệnh ${commandName} ở #${channel.name}`);
    }

    static error(context, error) {
        console.error(`[ERROR] ${context}`, error);
        this.crash(error, context);
    }
}

export default Logger;
