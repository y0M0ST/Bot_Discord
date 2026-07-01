import { config } from './config/env.js';
import client from './core/discord.js';
import './core/distube.js'; // Khởi tạo và gán distube vào client
import { loadCommands } from './handlers/commandHandler.js';
import { loadEvents } from './handlers/eventHandler.js';
import Logger from './utils/logger.js';

// Bắt lỗi toàn cục để không bị văng bot và báo cáo về Discord
process.on('uncaughtException', (error) => {
    Logger.crash(error, "Uncaught Exception");
});

process.on('unhandledRejection', (reason, promise) => {
    Logger.crash(reason, "Unhandled Rejection");
});

async function bootstrap() {
    try {
        console.log("🔄 Bắt đầu khởi động Bot Mindy...");

        // 1. Nạp Lệnh (Commands)
        await loadCommands(client);

        // 3. Nạp Sự kiện (Events)
        await loadEvents(client);

        // 4. Đăng nhập Discord
        await client.login(config.DISCORD_TOKEN);
        
    } catch (error) {
        console.error("❌ Lỗi nghiêm trọng khi khởi động:", error);
        Logger.crash(error, "Bootstrap Error");
    }
}

bootstrap();