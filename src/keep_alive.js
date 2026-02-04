import express from 'express';
import bodyParser from 'body-parser';
import { Rcon } from 'rcon-client'; // Thư viện RCON
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const app = express();
app.use(bodyParser.json());

// Kết nối Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- ⚙️ CẤU HÌNH RCON ---
const RCON_CONFIG = {
    host: "blastmc.mcrft.top",  // IP Server
    port: 24094,                // Port RCON
    password: "0147"            // Mật khẩu RCON
};

// Hàm xoá dấu Tiếng Việt (Để gửi RCON không lỗi font)
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

// Hàm gửi lệnh RCON
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

// --- WEBHOOK NHẬN TIỀN ---
app.post('/webhook-bank', async (req, res) => {
    try {
        const data = req.body;
        // console.log(`[WEBHOOK] 📩 Data:`, JSON.stringify(data)); // Bật lên nếu muốn soi log

        const amount = data.transferAmount || data.amount;
        const content = data.content || data.description || "";

        if (!amount || !content) return res.status(400).send("Missing Data");

        // 1. TÌM MÃ GIAO DỊCH (MD + 6 số)
        const match = content.match(/(MD\d{6})/i);

        if (match) {
            const transactionCode = match[1].toUpperCase();

            // 🔥 BƯỚC QUAN TRỌNG: XOÁ LUÔN ĐỂ "CHIẾM" GIAO DỊCH
            // (Ngăn chặn việc nạp đôi nếu Webhook gửi 2 lần)
            const { data: transaction } = await supabase
                .from('pending_transactions')
                .delete()
                .eq('code', transactionCode)
                .select()
                .single();

            if (transaction) {
                // Nếu xoá thành công -> Tức là chưa ai xử lý -> Tiến hành nạp
                const realIgn = transaction.ign;
                const points = Math.floor(amount / 1000);

                if (amount >= transaction.amount) {
                    console.log(`[LOGIC] 🔄 Đang nạp ${points} Point cho ${realIgn}...`);

                    // 2. GỬI LỆNH CỘNG TIỀN
                    const cmdPoints = `points give ${realIgn} ${points}`;
                    const success = await sendRconCommand(cmdPoints);

                    if (success) {
                        // ✅ THÀNH CÔNG: Gửi tin nhắn cảm ơn (msg/tell)
                        // Dùng &a, &b để tô màu cho đẹp
                        const msgContent = `&a[BlastMC BANK] &eBan da nhan duoc &6${points} Coin &etu ma GD &b${transactionCode}. Cam on ban!`;

                        // 👇 Dùng lệnh msg theo yêu cầu của bà
                        await sendRconCommand(`msg ${realIgn} ${removeVietnameseTones(msgContent)}`);

                        console.log(`[SUCCESS] ✅ Đã nạp xong cho ${realIgn}`);
                        return res.status(200).json({ success: true });
                    } else {
                        // ❌ RCON LỖI (Server tắt): PHẢI HOÀN TÁC DATABASE
                        // Nhét lại dữ liệu vào DB để lần sau SePay gửi lại thì nạp tiếp
                        console.warn(`[WARNING] ⚠️ RCON lỗi! Đang hoàn tác dữ liệu...`);

                        await supabase.from('pending_transactions').insert({
                            code: transaction.code,
                            ign: transaction.ign,
                            amount: transaction.amount
                        });

                        return res.status(500).send("Minecraft Server Offline - Retry later");
                    }
                } else {
                    console.warn(`[WARNING] Nạp thiếu tiền (Khách: ${amount}, Lệnh: ${transaction.amount})`);
                }
            } else {
                console.log(`[INFO] Mã ${transactionCode} không tồn tại hoặc đã xử lý.`);
            }
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("[CRITICAL ERROR]", error);
        res.status(500).send("Server Error");
    }
});

app.get('/', (req, res) => res.send('Bot Banking RCON Online! 🤖'));

export function keepAlive() {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`🚀 Server Banking đang chạy port ${port}!`));
}
keepAlive();