// src/utils/discordHelper.js
export async function safeReply(message, contentPayload) {
    try {
        await message.reply(contentPayload);
    } catch (error) {
        // Mã lỗi 10008 hoặc 50035: Tin nhắn gốc không tồn tại
        if (error.code === 10008 || error.code === 50035) {
            if (message.channel) {
                // Gửi tin nhắn thường thay vì reply
                await message.channel.send(contentPayload);
            }
        } else {
            console.error("❌ Lỗi gửi tin nhắn:", error);
        }
    }
}