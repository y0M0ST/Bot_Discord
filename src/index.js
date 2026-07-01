import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { setupGlobalErrors } from './utils/logger.js'; // Nhập hàm bắt lỗi

// --- THƯ VIỆN CHO NHẠC (DISTUBE) ---
import { DisTube } from 'distube';
import { YtDlpPlugin } from '@distube/yt-dlp';
import { SoundCloudPlugin } from '@distube/soundcloud';

// --- THƯ VIỆN CHO BANKING & WEB SERVER ---
import express from 'express';
import bodyParser from 'body-parser';
import { Rcon } from 'rcon-client';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================
// 1️⃣ CẤU HÌNH BOT & WEB SERVER
// ======================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates, // Yêu cầu để dùng tính năng Voice/Music
    ],
});
setupGlobalErrors(client); // 🟢 Kích hoạt "Báo Động Đỏ" - Fix warning src

// --- CẤU HÌNH DISTUBE ---
client.distube = new DisTube(client, {
    plugins: [
        new SoundCloudPlugin(),
        new YtDlpPlugin()
    ],
});

// --- LẮNG NGHE SỰ KIỆN NHẠC ---
client.distube
    .on("debug", (message) => {
        console.log(`[DisTube Debug]: ${message}`);
    })
    .on("playSong", (queue, song) => {
        queue.textChannel.send(`🎶 Đang phát: **${song.name}** - \`[${song.formattedDuration}]\``);
    })
    .on("addSong", (queue, song) => {
        queue.textChannel.send(`✅ Đã thêm: **${song.name}** - \`[${song.formattedDuration}]\``);
    })
    .on("addList", (queue, playlist) => {
        queue.textChannel.send(`✅ Đã thêm playlist: **${playlist.name}** (${playlist.songs.length} bài)`);
    })
    .on("error", (error, queue, song) => {
        console.error("❌ DISTUBE ERROR LOG:", error);
        if (queue && queue.textChannel) {
            queue.textChannel.send(`❌ Có lỗi: ${String(error.message).slice(0, 2000)}`).catch(console.error);
        }
    });

client.commands = new Collection();

const app = express();
app.use(bodyParser.json());

// Kết nối Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Cấu hình RCON
const RCON_CONFIG = {
    host: process.env.RCON_IP,      // IP Server từ .env
    port: parseInt(process.env.RCON_PORT), // Port RCON
    password: process.env.RCON_PASS // Mật khẩu từ .env
};

// ======================================================
// 2️⃣ CÁC HÀM XỬ LÝ BANKING (Giữ nguyên logic của bà)
// ======================================================

function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}

async function sendRconCommand(command) {
    try {
        const rcon = await Rcon.connect(RCON_CONFIG);
        await rcon.send(command);
        await rcon.end();
        return true;
    } catch (error) {
        console.error(`[RCON ERROR] ❌ Không kết nối được Server: ${error.message}`);
        return false;
    }
}

// --- API WEBHOOK BANKING ---
app.post('/webhook-bank', async (req, res) => {
    try {
        const data = req.body;
        const amount = data.transferAmount || data.amount;
        const content = data.content || data.description || "";

        if (!amount || !content) return res.status(400).send("Missing Data");

        const match = content.match(/(MD\d{6})/i);
        if (match) {
            const transactionCode = match[1].toUpperCase();

            const { data: transaction } = await supabase
                .from('pending_transactions')
                .delete()
                .eq('code', transactionCode)
                .select()
                .single();

            if (transaction) {
                const realIgn = transaction.ign;
                const points = Math.floor(amount / 1000);

                if (amount >= transaction.amount) {
                    console.log(`[LOGIC] 🔄 Đang nạp ${points} Point cho ${realIgn}...`);
                    const cmdPoints = `points give ${realIgn} ${points}`;
                    const success = await sendRconCommand(cmdPoints);

                    if (success) {
                        const msgContent = `&a[BlastMC BANK] &eBan da nhan duoc &6${points} Coin &etu ma GD &b${transactionCode}. Cam on ban!`;
                        await sendRconCommand(`msg ${realIgn} ${removeVietnameseTones(msgContent)}`);
                        return res.status(200).json({ success: true });
                    } else {
                        await supabase.from('pending_transactions').insert({
                            code: transaction.code,
                            ign: transaction.ign,
                            amount: transaction.amount
                        });
                        return res.status(500).send("Minecraft Server Offline - Retry later");
                    }
                }
            }
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("[CRITICAL ERROR]", error);
        res.status(500).send("Server Error");
    }
});

// Trang chủ để UptimeRobot ping
app.get('/', (req, res) => res.send('Bot Mindy & Banking Online! 🤖'));


// ======================================================
// 3️⃣ HÀM NẠP LỆNH & KHỞI ĐỘNG (Logic cũ của bà)
// ======================================================

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

    // 2. NẠP EVENTS
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

    // ========================================================
    // 🔥 SỬA ĐOẠN NÀY: MỞ SERVER TRƯỚC - LOGIN SAU
    // ========================================================

    // 3. START SERVER (Chạy ngay lập tức để Render thấy cổng mở)
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`🚀 Server Banking đang chạy port ${port}!`);
        // Bot Mindy & Banking Online!
    });

    // 4. START BOT (Login sau cũng được)
    try {
        await client.login(process.env.DISCORD_TOKEN);
        console.log("✅ Bot Online! Sẵn sàng phục vụ!");
    } catch (err) {
        console.error("❌ Lỗi Login:", err);
    }
}

main();