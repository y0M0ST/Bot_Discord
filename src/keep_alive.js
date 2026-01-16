import express from 'express';
import bodyParser from 'body-parser';
import mineflayer from 'mineflayer'; // 👈 Thư viện tạo Bot giả người
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const app = express();
app.use(bodyParser.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- 🤖 CẤU HÌNH BOT MINECRAFT ---
const botOptions = {
    host: 'blastmc.mcrft.top', // IP Server
    port: 25565,               // Port Game (Thường là 25565)
    username: 'CoGiaoMinDy',    // Tên con Bot trong game
    version: false,            // Tự động dò version
    // password: '...'         // Nếu server bản quyền thì cần điền, server crack/offline thì bỏ dòng này
};

let bot; // Biến giữ con bot

function createBot() {
    bot = mineflayer.createBot(botOptions);

    // 1. Khi Bot vào game -> Tự Login AuthMe
    bot.on('spawn', () => {
        console.log('[MINECRAFT] 🟢 Bot đã vào server!');
        // Thay 'matkhau123' bằng mật khẩu bà muốn đặt cho con bot này
        bot.chat('/register botMindy178934 botMindy178934');
        bot.chat('/login botMindy178934');
    });

    // 2. Tự động kết nối lại nếu bị kick hoặc lag
    bot.on('end', () => {
        console.log('[MINECRAFT] 🔴 Bot bị ngắt kết nối! Đang reconnect sau 10s...');
        setTimeout(createBot, 10000);
    });

    bot.on('error', (err) => console.log(`[MINECRAFT] ❌ Lỗi: ${err.message}`));
}

// Khởi động con bot ngay khi chạy server
createBot();

// ---------------------------------------------------------

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
                .select('*')
                .eq('code', transactionCode)
                .single();

            if (transaction) {
                const realIgn = transaction.ign;
                const points = Math.floor(amount / 1000);

                if (amount >= transaction.amount) {
                    if (bot && bot.player) { // Kiểm tra bot có đang online không
                        console.log(`[LOGIC] 🔄 Bot đang gõ lệnh nạp cho ${realIgn}...`);

                        // --- BOT CHAT LỆNH TRONG GAME ---
                        // Lưu ý: Bot cần được SET OP trong game mới gõ được lệnh /p give nha!
                        bot.chat(`/p give ${realIgn} ${points}`);
                        bot.chat(`/msg ${realIgn} [Banking] Da nap thanh cong ${points} Points!, cam on ban da su dung dich vu!`);

                        console.log(`[SUCCESS] ✅ Đã nạp xong!`);

                        // Xoá mã
                        await supabase.from('pending_transactions').delete().eq('code', transactionCode);
                    } else {
                        console.error(`[ERROR] ❌ Bot Minecraft đang Offline, không nạp được!`);
                    }
                }
            }
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("[ERROR]", error);
        res.status(500).send("Error");
    }
});

app.get('/', (req, res) => res.send('Bot Mineflayer Online!'));

export function keepAlive() {
    app.listen(3000, () => console.log("🚀 Server chạy port 3000!"));
}