import chalk from "chalk";
import { EmbedBuilder } from "discord.js";

class Logger {
    constructor() {
        this.client = null;
    }

    // Nạp Client Discord vào để gửi log
    setClient(client) {
        this.client = client;
    }

    log(type, message, err = null) {
        const timestamp = new Date().toISOString();
        const formatted = `[${type}] ${timestamp} - ${message}`;

        // 1. Log ra Terminal (Giữ màu mè cho đẹp)
        switch (type) {
            case "INFO":
                console.log(chalk.blue(formatted));
                break;
            case "WARN":
                console.log(chalk.yellow(formatted));
                break;
            case "ERROR":
                console.log(chalk.red(formatted));
                if (err) console.error(err);
                break;
            default:
                console.log(formatted);
        }

        // 2. Gửi về Discord (Nếu đã nạp Client và có Channel ID)
        this.sendToDiscord(type, message, err);
    }

    info(message) { this.log("INFO", message); }
    warn(message) { this.log("WARN", message); }
    error(message, err = null) { this.log("ERROR", message, err); }

    async sendToDiscord(type, message, err) {
        // Chỉ gửi ERROR và WARN để đỡ spam, hoặc INFO nếu cần
        if (!this.client) return;

        const channelId = process.env.CONSOLE_CHANNEL_ID;
        if (!channelId) return;

        const channel = this.client.channels.cache.get(channelId);
        if (!channel) return;

        try {
            const embed = new EmbedBuilder()
                .setTitle(`🚨 LOG: ${type}`)
                .setDescription(`**Message:** ${message}\n${err ? `\`\`\`js\n${err.stack || err}\n\`\`\`` : ''}`)
                .setColor(type === 'ERROR' ? '#FF0000' : (type === 'WARN' ? '#FFA500' : '#0099FF'))
                .setTimestamp();

            await channel.send({ embeds: [embed] });
        } catch (e) {
            console.error("❌ Không gửi được log về Discord:", e);
        }
    }

    // 🔥 LOG LỆNH NGƯỜI DÙNG
    async command(user, cmdName, channel) {
        // Log Terminal
        console.log(chalk.magenta(`[CMD] ${user.tag} dùng lệnh [${cmdName}] tại #${channel.name}`));

        if (!this.client) return;
        const channelId = process.env.CONSOLE_CHANNEL_ID;
        if (!channelId) return;
        const logChannel = this.client.channels.cache.get(channelId);
        if (!logChannel) return;

        try {
            const embed = new EmbedBuilder()
                .setTitle(`🤖 User Used Command`)
                .addFields(
                    { name: 'User', value: `${user.tag} (<@${user.id}>)`, inline: true },
                    { name: 'Command', value: `\`${cmdName}\``, inline: true },
                    { name: 'Channel', value: `#${channel.name}`, inline: true }
                )
                .setColor('#9B59B6') // Màu tím mộng mơ
                .setTimestamp()
                .setFooter({ text: 'Audit Log' });

            await logChannel.send({ embeds: [embed] });
        } catch (e) {
            console.error("❌ Lỗi gửi log lệnh:", e);
        }
    }
}

const logger = new Logger();

// Hàm kích hoạt bắt lỗi toàn hệ thống
export function setupGlobalErrors(client) {
    logger.setClient(client);

    // Bắt lỗi Promise (ví dụ quên try-catch)
    process.on('unhandledRejection', (reason, promise) => {
        logger.error("Unhandled Rejection (Lỗi chưa xử lý)", reason);
    });

    // Bắt lỗi Code (ví dụ sai cú pháp, biến null)
    process.on('uncaughtException', (err) => {
        logger.error("Uncaught Exception (Lỗi nghiêm trọng)", err);
    });

    // Lỗi từ Discord
    client.on('error', (err) => logger.error("Discord Client Error", err));
    client.on('warn', (info) => logger.warn(`Discord Warning: ${info}`));

    console.log(chalk.green("✅ Đã kích hoạt hệ thống báo lỗi tự động!"));
}

export default logger;
