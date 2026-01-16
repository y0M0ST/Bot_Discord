import express from 'express';
import bodyParser from 'body-parser';
import 'dotenv/config';

const app = express();
app.use(bodyParser.json());

// Biến lưu client Discord để dùng trong Webhook
let discordClient = null;

// --- WEBHOOK NHẬN TIỀN TỪ SEPAY ---
app.post('/webhook-bank', async (req, res) => {
    try {
        const data = req.body;
        console.log("-------------------------------------------------");
        console.log(`[WEBHOOK] 📩 Nhận dữ liệu mới:`, JSON.stringify(data, null, 2));

        const amount = data.transferAmount || data.amount;
        const content = data.content || data.description || "";

        if (!amount || !content) {
            return res.status(400).send("Thiếu dữ liệu Amount hoặc Content");
        }

        // --- XỬ LÝ LOGIC ---
        // Regex tìm tên sau chữ NAP (Ví dụ: NAP MINDY -> lấy MINDY)
        const match = content.match(/NAP\s+([a-zA-Z0-9_]+)/i);

        if (match) {
            const ign = match[1]; // Tên người chơi

            if (amount >= 1000) {
                const points = Math.floor(amount / 1000); // Tỷ lệ: 1000đ = 1 Point
                console.log(`[LOGIC] ✅ Duyệt đơn nạp: User=${ign}, Tiền=${amount}, Point=${points}`);

                // --- 👇 PHẦN QUAN TRỌNG: GỬI LỆNH VÀO KÊNH CONSOLE DISCORD ---
                if (discordClient) {
                    // Lấy ID kênh Console từ .env
                    const consoleChannelId = process.env.CONSOLE_CHANNEL_ID;
                    const channel = discordClient.channels.cache.get(consoleChannelId);

                    if (channel) {
                        // 1. Gửi lệnh cộng point (DiscordSRV sẽ đọc dòng này)
                        await channel.send(`points give ${ign} ${points}`);

                        // 2. Gửi lệnh thông báo lên màn hình game (cho ngầu)
                        // (Mẹo: Đợi 1 xíu để lệnh trên chạy xong hãy thông báo)
                        setTimeout(() => {
                            channel.send(`say §aCảm ơn §e${ign} §ađã donate §6${amount.toLocaleString()}đ §avà nhận §b${points} Point!`);
                        }, 1000);

                        console.log(`[SUCCESS] ✅ Đã gửi lệnh vào kênh Console Discord: p give ${ign} ${points}`);
                    } else {
                        console.error(`[ERROR] ❌ Không tìm thấy kênh Console! Kiểm tra lại ID trong .env: ${consoleChannelId}`);
                    }
                } else {
                    console.error(`[ERROR] ❌ Bot chưa sẵn sàng (discordClient is null)`);
                }
                // -----------------------------------------------------------

            } else {
                console.warn(`[LOGIC] ⚠️ Số tiền quá nhỏ (${amount}đ).`);
            }
        } else {
            console.warn(`[LOGIC] ⚠️ Sai cú pháp (Không thấy chữ NAP + Tên). Content: ${content}`);
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("[ERROR] 💥 Lỗi Webhook:", error);
        res.status(500).send("Lỗi Server Bot");
    }
});

app.get('/', (req, res) => {
    res.send('Bot Banking & Console Bridge is Online! 🤖');
});

// 👇 Hàm này giờ nhận thêm tham số 'client' từ index.js truyền qua
export function keepAlive(client) {
    discordClient = client; // Lưu client vào biến toàn cục để Webhook dùng
    app.listen(3000, () => {
        console.log("🚀 Server Banking đang chạy ở port 3000!");
    });
}