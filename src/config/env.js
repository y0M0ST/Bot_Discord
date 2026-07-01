import 'dotenv/config';

// Xác thực và xuất các biến môi trường
export const config = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    ALLOWED_CHANNEL_ID: process.env.ALLOWED_CHANNEL_ID,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    webhooks: {
        crash: process.env.WEBHOOK_CRASH,
        music: process.env.WEBHOOK_MUSIC,
        status: process.env.WEBHOOK_STATUS,
        activity: process.env.WEBHOOK_ACTIVITY
    }
};

// Kiểm tra xem có thiếu biến môi trường quan trọng nào không
const requiredVars = ['DISCORD_TOKEN', 'SUPABASE_URL', 'SUPABASE_KEY'];
for (const reqVar of requiredVars) {
    if (!config[reqVar]) {
        console.warn(`[CẢNH BÁO] Thiếu biến môi trường quan trọng: ${reqVar}`);
    }
}
