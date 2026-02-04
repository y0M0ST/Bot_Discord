import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import 'dotenv/config';

// --- PHẦN BANKING & WEB SERVER ---
import express from 'express';
import bodyParser from 'body-parser';
import { Rcon } from 'rcon-client';
import { createClient } from '@supabase/supabase-js';

// Khởi tạo Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();

// Khởi tạo Web Server
const app = express();
app.use(bodyParser.json());

// Kết nối Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- ⚙️ CẤU HÌNH RCON ---
const RCON_CONFIG = {
    host: "blastmc.mcrft.top",
    port: 24094,
    password: "0147"
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================
// 1️⃣ PHẦN XỬ LÝ BANKING (Code bà gửi)
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

app.get('/', (req, res) => res.send('Bot Mindy & Banking Online! 🤖'));

// ======================================================
// 2️⃣ PHẦN NẠP DISCORD BOT (Phần bị thiếu nãy giờ nè)
// ======================================================

const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

(async () => {
    // 1. Nạp Lệnh
    let commandCount = 0;
    for (const folder of commandFolders) {
        const commandsPath = path.join(__dirname, 'commands', folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = await import(`file://${filePath}`);
            if ('data' in command.default && 'execute' in command.default) {
                client.commands.set(command.default.data.name, command.default);
            } else if ('name' in command.default && 'execute' in command.default) {
                client.commands.set(command.default.name, command.default);
            }
            commandCount++;
        }
    }
    console.log(`📦 Tìm thấy ${commandCount} lệnh... Đang nạp!`);

    // 2. Nạp Sự Kiện
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    console.log(`🔔 Tìm thấy ${eventFiles.length} events... Đang nạp!`);

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = await import(`file://${filePath}`);
        if (event.default.once) {
            client.once(event.default.name, (...args) => event.default.execute(...args));
        } else {
            client.on(event.default.name, (...args) => event.default.execute(...args));
        }
    }

    // 3. Đăng nhập Discord
    await client.login(process.env.DISCORD_TOKEN);

    // 4. Mở Port cho Render (QUAN TRỌNG)
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`🚀 Server Web & Bot đang chạy trên port ${port}!`);
    });

})(); // Kết thúc hàm async main