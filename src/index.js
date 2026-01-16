// src/index.js
import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { keepAlive } from './keep_alive.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();

// Hàm quét file đệ quy (quét cả thư mục con)
function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (file.endsWith(".js")) {
            fileList.push({ filePath, fileName: file });
        }
    }
    return fileList;
}

async function main() {
    // 1. NẠP COMMANDS
    const commandsPath = path.join(__dirname, "commands");
    const commandFiles = getAllFiles(commandsPath);
    console.log(`📦 Tìm thấy ${commandFiles.length} lệnh... Đang nạp!`);

    for (const { filePath } of commandFiles) {
        try {
            const commandModule = await import(pathToFileURL(filePath).href);
            const cmd = commandModule.default;
            if (cmd?.name && cmd?.execute) {
                client.commands.set(cmd.name, cmd);
            }
        } catch (e) { console.error(e); }
    }

    // 2. NẠP EVENTS (Sẽ tự động nạp file mindyChat.js vừa tạo)
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = getAllFiles(eventsPath);
    console.log(`🔔 Tìm thấy ${eventFiles.length} events... Đang nạp!`);

    for (const { filePath } of eventFiles) {
        try {
            const eventModule = await import(pathToFileURL(filePath).href);
            const event = eventModule.default;
            if (event?.name && event?.execute) {
                if (event.once) client.once(event.name, (...args) => event.execute(...args));
                else client.on(event.name, (...args) => event.execute(...args));
            }
        } catch (e) { console.error(e); }
    }

    // 3. START BOT
    try {
        await client.login(process.env.DISCORD_TOKEN);
        keepAlive(); // Khởi động Webhook Banking
        console.log("✅ Bot Online! Sẵn sàng phục vụ!");
    } catch (err) {
        console.error("❌ Lỗi Login:", err);
    }
}

main();