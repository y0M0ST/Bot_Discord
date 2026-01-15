// src/index.js
import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from './utils/logger.js';
import { keepAlive } from './keep_alive.js';

// 👇 IMPORT DISTUBE & PLUGINS
import { DisTube } from 'distube';
import { YtDlpPlugin } from '@distube/yt-dlp';
import { SoundCloudPlugin } from '@distube/soundcloud';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

// 👇 CẤU HÌNH DISTUBE (ĐÃ FIX LỖI INVALID_KEY)
client.distube = new DisTube(client, {
    plugins: [
        // Nạp Client ID từ file .env vào đây
        new SoundCloudPlugin(), // 👈 Để trống vầy thôi, cho nó tự xử!
        
        new YtDlpPlugin()
    ],
    // ...
});

// --- LẮNG NGHE SỰ KIỆN NHẠC ---
client.distube
    .on("playSong", (queue, song) => {
        queue.textChannel.send(`🎶 Đang phát: **${song.name}** - \`[${song.formattedDuration}]\``);
    })
    .on("addSong", (queue, song) => {
        queue.textChannel.send(`✅ Đã thêm: **${song.name}** - \`[${song.formattedDuration}]\``);
    })
    .on("addList", (queue, playlist) => {
        queue.textChannel.send(`✅ Đã thêm playlist: **${playlist.name}** (${playlist.songs.length} bài)`);
    })
    .on("error", (channel, e) => {
        console.error("❌ DISTUBE ERROR LOG:", e); // In lỗi ra terminal để mình soi

        // Lấy nội dung lỗi một cách an toàn nhất
        const errMessage = e.message || e || "Lỗi không xác định";

        if (channel) {
            channel.send(`❌ Có lỗi: ${String(errMessage).slice(0, 2000)}`);
        }
    });

// =======================
// Nạp commands (Code cũ)
// =======================
client.commands = new Map();

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
    const commandFiles = getAllCommandFiles(commandsPath);
    console.log(`🔎 Tìm thấy ${commandFiles.length} file lệnh.`);

    for (const { filePath, fileName } of commandFiles) {
        try {
            const commandModule = await import(pathToFileURL(filePath).href);
            if (!commandModule.default) continue;

            const commands = Array.isArray(commandModule.default) ? commandModule.default : [commandModule.default];
            for (const cmd of commands) {
                if (!cmd?.name || !cmd?.execute) continue;
                client.commands.set(cmd.name, cmd);
            }
        } catch (err) {
            logger.error(`❌ Lỗi nạp file ${fileName}:`, err);
        }
    }

    // Nạp Events
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath);
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        try {
            const eventModule = await import(pathToFileURL(filePath).href);
            const event = eventModule.default;
            if (event?.name && event?.execute) {
                if (event.once) client.once(event.name, (...args) => event.execute(...args));
                else client.on(event.name, (...args) => event.execute(...args));
            }
        } catch (err) { logger.error(err); }
    }

    try {
        keepAlive(); // 👈 Kích hoạt server giữ cho bot luôn online
        await client.login(process.env.DISCORD_TOKEN);
    } catch (err) { logger.error(err); }
}

main();