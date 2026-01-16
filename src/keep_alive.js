import express from 'express';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const app = express();
app.use(bodyParser.json());

// Kết nối Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Biến lưu client Discord
let discordClient = null;

// --- WEBHOOK NHẬN TIỀN ---
app.post('/webhook-bank', async (req, res) => {
    try {
        const data = req.body;
        console.log("-------------------------------------------------");
        console.log(`[WEBHOOK] 📩 Nhận dữ liệu:`, JSON.stringify(data));

        const amount = data.transferAmount || data.amount;
        const content = data.content || data.description || "";

        if (!amount || !content) return res.status(400).send("Missing Data");

        // 1. TÌM MÃ GIAO DỊCH (MD + 6 số)
        const match = content.match(/(MD\d{6})/i);

        if (match) {
            const transactionCode = match[1].toUpperCase(); // Lấy mã: MD123456

            // 2. TRA CỨU DATABASE
            const { data: transaction, error } = await supabase
                .from('pending_transactions')
                .select('*')
                .eq('code', transactionCode)
                .single();

            if (transaction) {
                // ✅ TÌM THẤY ĐƠN NẠP HỢP LỆ
                const realIgn = transaction.ign; // Tên thật
                const expectedAmount = transaction.amount;

                // Kiểm tra số tiền
                if (amount >= expectedAmount) {
                    const points = Math.floor(amount / 1000); // 1000đ = 1 Point

                    if (discordClient) {
                        const consoleChannelId = process.env.CONSOLE_CHANNEL_ID;
                        const channel = discordClient.channels.cache.get(consoleChannelId);

                        if (channel) {
                            // --- THỰC HIỆN LỆNH NẠP ---

                            // 1. Lệnh cộng Point (Sửa thành 'p give')
                            await channel.send(`p give ${realIgn} ${points}`);

                            // 2. Lệnh cảm ơn thầm kín (Sửa thành 'msg')
                            setTimeout(() => {
                                // Chỉ gửi tin nhắn riêng cho người chơi đó
                                channel.send(`msg ${realIgn} §a[Banking] §eCảm ơn bạn đã donate §6${amount.toLocaleString()}đ §avà nhận §b${points} Point! §7(Mã: ${transactionCode})`);
                            }, 1000);

                            console.log(`[SUCCESS] ✅ Đã nạp ${points} Point cho ${realIgn} (Mã: ${transactionCode})`);

                            // 3. XOÁ MÃ KHỎI DB
                            await supabase.from('pending_transactions').delete().eq('code', transactionCode);
                        } else {
                            console.error(`[ERROR] ❌ Không tìm thấy kênh Console ID: ${consoleChannelId}`);
                        }
                    } else {
                        console.error(`[ERROR] ❌ Bot chưa sẵn sàng (discordClient is null)`);
                    }
                } else {
                    console.warn(`[WARNING] ⚠️ Nạp thiếu tiền! Khách nạp ${amount}, Lệnh gốc ${expectedAmount}`);
                }
            } else {
                console.warn(`[INFO] ⚠️ Mã giao dịch ${transactionCode} không tồn tại hoặc đã hết hạn.`);
            }
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("[ERROR] 💥 Webhook Crash:", error);
        res.status(500).send("Server Error");
    }
});

app.get('/', (req, res) => {
    res.send('Bot Auto-Donate is Online! 🤖');
});

export function keepAlive(client) {
    discordClient = client;
    app.listen(3000, () => {
        console.log("🚀 Server Banking đang chạy ở port 3000!");
    });
}