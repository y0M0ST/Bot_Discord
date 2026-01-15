import express from 'express';
import bodyParser from 'body-parser';
import { Rcon } from 'rcon-client';

const app = express();
app.use(bodyParser.json());

// --- CẤU HÌNH RCON ---
const RCON_CONFIG = {
    host: process.env.RCON_HOST,
    port: parseInt(process.env.RCON_PORT) || 25575,
    password: process.env.RCON_PASSWORD
};

// 🛠️ LOG DEBUG: Kiểm tra xem đã đọc được config chưa (Che pass lại)
console.log(`[INIT] RCON Config Loaded -> Host: ${RCON_CONFIG.host} | Port: ${RCON_CONFIG.port} | Pass: ${RCON_CONFIG.password ? '******' : 'MISSING ⚠️'}`);

// Hàm gửi lệnh vào Minecraft
async function sendRconCommand(command) {
    console.log(`[RCON] 🔄 Đang kết nối tới Server để gửi lệnh: "${command}"...`);
    try {
        const rcon = await Rcon.connect(RCON_CONFIG);
        console.log(`[RCON] ✅ Kết nối thành công! Đang gửi lệnh...`);

        const response = await rcon.send(command);
        rcon.end();

        console.log(`[RCON] 🎉 Gửi thành công! Server trả lời: "${response}"`);
        return true;
    } catch (error) {
        console.error(`[RCON] ❌ LỖI KẾT NỐI: ${error.message}`);
        if (error.code === 'ECONNREFUSED') console.error("👉 Gợi ý: Kiểm tra IP, Port hoặc xem Server đã bật RCON chưa?");
        if (error.message.includes('Authentication failed')) console.error("👉 Gợi ý: Sai mật khẩu RCON rồi bà ơi!");
        return false;
    }
}

// --- WEBHOOK NHẬN TIỀN ---
app.post('/webhook-bank', async (req, res) => {
    try {
        const data = req.body;
        console.log("-------------------------------------------------");
        console.log(`[WEBHOOK] 📩 Nhận dữ liệu mới:`, JSON.stringify(data, null, 2)); // In đẹp json

        const amount = data.transferAmount || data.amount;
        const content = data.content || data.description || "";

        // Debug xem lấy đúng trường chưa
        console.log(`[DEBUG] Parsed Data -> Amount: ${amount} | Content: "${content}"`);

        if (!amount || !content) {
            console.warn(`[WARNING] ⚠️ Thiếu dữ liệu quan trọng (Amount hoặc Content bị null)`);
            return res.status(400).send("Thiếu dữ liệu");
        }

        // --- XỬ LÝ LOGIC ---
        // Regex tìm tên sau chữ NAP
        const match = content.match(/NAP\s+([a-zA-Z0-9_]+)/i);
        console.log(`[DEBUG] Kết quả Regex Match:`, match ? `Tìm thấy tên: ${match[1]}` : "Không khớp mẫu 'NAP <ten>'");

        if (match) {
            const ign = match[1];

            if (amount >= 1000) {
                const points = Math.floor(amount / 1000);
                console.log(`[LOGIC] ✅ Duyệt đơn nạp: User=${ign}, Tiền=${amount}, Point=${points}`);

                // Gửi lệnh Give Point
                const cmd1 = await sendRconCommand(`points give ${ign} ${points}`);

                // Gửi thông báo
                if (cmd1) {
                    await sendRconCommand(`say §aCảm ơn §e${ign} §ađã donate §6${amount.toLocaleString()}đ §avà nhận §b${points} Point!`);
                } else {
                    console.error(`[ERROR] ❌ Tính toán xong xuôi nhưng gửi RCON thất bại.`);
                }
            } else {
                console.warn(`[LOGIC] ⚠️ Số tiền quá nhỏ (${amount}đ), không đủ min 1000đ.`);
            }
        } else {
            console.warn(`[LOGIC] ⚠️ Nội dung chuyển khoản không đúng cú pháp (Thiếu chữ NAP hoặc tên).`);
        }

        // Báo cho cổng thanh toán là đã nhận ok
        res.status(200).json({ success: true });
        console.log("[WEBHOOK] ✅ Đã phản hồi HTTP 200 OK cho Gateway.");

    } catch (error) {
        console.error("[ERROR] 💥 Lỗi Webhook Crash:", error);
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