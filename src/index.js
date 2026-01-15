import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from './utils/logger.js';
import { keepAlive } from './keep_alive.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        // Đã xoá GuildVoiceStates vì không cần vào Voice nữa
    ],
});

// =======================
// NẠP COMMANDS (LOG CHI TIẾT)
// =======================
client.commands = new Collection();

function getAllCommandFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getAllCommandFiles(filePath, fileList);
        } else if (file.endsWith(".js")) {
            fileList.push({ filePath, fileName: file });
        }
    }
    return fileList;
}

async function main() {
    const commandsPath = path.join(__dirname, "commands");

    // Kiểm tra thư mục
    if (!fs.existsSync(commandsPath)) {
        console.error(`❌ [ERROR] Không tìm thấy thư mục commands tại: ${commandsPath}`);
        return;
    }

    const commandFiles = getAllCommandFiles(commandsPath);

    console.log("-------------------------------------------------");
    console.log(`📦 Đang quét lệnh trong thư mục: ${commandsPath}`);
    console.log(`🔎 Tìm thấy tổng cộng ${commandFiles.length} file... bắt đầu nạp!`);
    console.log("-------------------------------------------------");

    for (const { filePath, fileName } of commandFiles) {
        try {
            const commandModule = await import(pathToFileURL(filePath).href);
            const commands = Array.isArray(commandModule.default) ? commandModule.default : [commandModule.default];

            for (const cmd of commands) {
                if (cmd?.name && cmd?.execute) {
                    client.commands.set(cmd.name, cmd);
                    console.log(`✅ [LOADED] ${fileName.padEnd(20)} -> Lệnh: [${cmd.name}]`);
                } else {
                    console.log(`⚠️ [SKIP]   ${fileName.padEnd(20)} -> Thiếu 'name' hoặc 'execute'.`);
                }
            }
        } catch (err) {
            console.error(`❌ [ERROR] Lỗi khi nạp file ${fileName}:`, err.message);
        }
    }

    console.log("-------------------------------------------------");
    console.log(`🎉 Tổng cộng: Đã nạp thành công ${client.commands.size} lệnh.`);
    console.log("-------------------------------------------------");

    // --- NẠP EVENTS ---
    const eventsPath = path.join(__dirname, 'events');
    if (fs.existsSync(eventsPath)) {
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            try {
                const eventModule = await import(pathToFileURL(filePath).href);
                const event = eventModule.default;
                if (event?.name && event?.execute) {
                    if (event.once) client.once(event.name, (...args) => event.execute(...args));
                    else client.on(event.name, (...args) => event.execute(...args));
                }
            } catch (err) {
                console.error(`❌ Lỗi nạp Event ${file}:`, err);
            }
        }
    }

    try {
        keepAlive(); // Server Banking & Ping
        await client.login(process.env.DISCORD_TOKEN);
    } catch (err) {
        console.error("❌ Lỗi đăng nhập:", err);
    }
}

main();