// src/commands/Music/play.js
export default {
    name: "play",
    description: "Phát nhạc (DisTube)",
    category: "Music",
    async execute(message, args) {
        if (!args[0]) return message.reply("⚠️ Nhập tên bài hát hoặc link đi em!");

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply("⚠️ Vào voice trước đi!");

        const query = args.join(" ");

        try {
            // Thử phát bình thường
            await message.client.distube.play(voiceChannel, query, {
                member: message.member,
                textChannel: message.channel,
                message
            });
        } catch (e) {
            console.error("[Play Error 1]:", e.message);

            // 🔥 CƠ CHẾ CỨU HỘ: NẾU LINK SOUNDCLOUD LỖI (404)
            if (query.includes("soundcloud.com")) {
                message.channel.send("⚠️ Link SoundCloud đang kén cá chọn canh. **Tui chuyển sang tìm YouTube cho lẹ nha!** 🔄");

                // Biến cái link thành từ khoá (Lấy phần đuôi của link)
                // Ví dụ: .../son-tung/con-mua-ngang-qua -> "son tung con mua ngang qua"
                const keyword = query.split("/").pop().replace(/-/g, " ");

                try {
                    await message.client.distube.play(voiceChannel, keyword, {
                        member: message.member,
                        textChannel: message.channel,
                        message
                    });
                } catch (err2) {
                    message.reply("❌ Chịu thua! Không tìm thấy bài này.");
                }
            } else {
                message.reply("❌ Lỗi rồi: " + e.message);
            }
        }
    },
};