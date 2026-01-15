import express from 'express';
import bodyParser from 'body-parser';
import { Rcon } from 'rcon-client';

const app = express();
app.use(bodyParser.json());

// --- CẤU HÌNH RCON (Lấy từ .env cho bảo mật) ---
const RCON_CONFIG = {
    host: process.env.RCON_HOST,     // IP Server Minecraft
    port: parseInt(process.env.RCON_PORT) || 25575,
    password: process.env.RCON_PASSWORD
};

// Hàm gửi lệnh vào Minecraft
async function sendRconCommand(command) {
    try {
        const rcon = await Rcon.connect(RCON_CONFIG);
        const response = await rcon.send(command);
        rcon.end();
        console.log(`✅ RCON Sent: ${command} | Response: ${response}`);
        return true;
    } catch (error) {
        console.error("❌ Lỗi kết nối RCON:", error.message);
        return false;
    }
}

// --- WEBHOOK NHẬN TIỀN (Kết nối với SePay/Casso) ---
app.post('/webhook-bank', async (req, res) => {
    try {
        const data = req.body; // Dữ liệu Ngân hàng gửi qua
        console.log("💰 Có biến động số dư:", JSON.stringify(data));

        // Kiểm tra xem data có đúng format không (Tuỳ bên SePay hay Casso)
        // Ví dụ dưới đây là logic chung:
        const amount = data.transferAmount || data.amount; // Số tiền thực nhận
        const content = data.content || data.description;   // Nội dung CK: "NAP y0M0ST 50 coin"

        if (!amount || !content) return res.status(400).send("Thiếu dữ liệu");

        // --- XỬ LÝ LOGIC ---
        // Regex tìm tên sau chữ NAP. 
        // Nó sẽ bắt được "y0M0ST" trong chuỗi "NAP y0M0ST 50 coin"
        const match = content.match(/NAP\s+([a-zA-Z0-9_]+)/i);

        if (match && amount >= 1000) {
            const ign = match[1]; // Lấy tên nhân vật

            // Tính số point dựa trên TIỀN THẬT (Để an toàn, không tin vào chữ "50 coin" trong ndck)
            const points = Math.floor(amount / 1000);

            console.log(`=> Đang nạp ${points} Point cho ${ign}...`);

            // 1. Gửi lệnh Give Point
            // (Sửa lệnh này tuỳ theo plugin point bà dùng: playerpoints, cmi, essentials...)
            await sendRconCommand(`p give ${ign} ${points}`);

            // 2. Gửi thông báo lên màn hình game cho oai
            await sendRconCommand(`say §aCảm ơn §e${ign} §ađã donate §6${amount.toLocaleString()}đ §avà nhận §b${points} Point!`);
        }

        // Báo cho cổng thanh toán là đã nhận ok
        res.status(200).json({ success: true });

    } catch (error) {
        console.error("Lỗi Webhook:", error);
        res.status(500).send("Lỗi Server Bot");
    }
});

app.get('/', (req, res) => {
    res.send('Bot Auto-Donate is Online! 🤖');
});

export function keepAlive() {
    app.listen(3000, () => {
        console.log("🚀 Server Banking đang chạy ở port 3000!");
    });
}