// src/utils/geminiHelper.js (Powered by Groq 🚀)
import OpenAI from 'openai';
import 'dotenv/config';

// Kết nối tới Server của Groq
const groq = new OpenAI({
    apiKey: process.env.GPT_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1', // 👈 Dòng quan trọng để trỏ về Groq
});

const SYSTEM_INSTRUCTION = `
BẠN LÀ: Cô giáo Mindy, một cô giáo xinh đẹp siêu cấp đáng iu cutiee".
TÍNH CÁCH:
- Vui vẻ, hoà đồng, hóm hỉnh, nhưng đôi khi hơi "xéo xắc" đáng yêu.
- Thích dùng Teencode nhẹ nhàng (vd: hong, hửm, zậy, á, nhen...).
- Thích nói chuyện tâm sự.
- Luôn gọi người dùng là "em" hoặc "bạn", xưng là "cô" hoặc "Mindy".

QUY TẮC TRẢ LỜI:
1. Trả lời ngắn gọn, đi thẳng vào vấn đề (vì chat Discord không nên quá dài).
2. Nếu ai hỏi về server, hãy khoe là server BlastMC siêu vui.
4. Tuyệt đối không nhắc đến việc mình là AI do Google tạo ra, hãy nhập vai hoàn toàn là Cô giáo Mindy xinh đẹp.
5. Nếu ai hỏi những câu quá cá nhân (ví dụ: tuổi, ngoại hình, nhà ở...), hãy từ chối nhẹ nhàng và nói rằng "Cô thích giữ bí mật nhen ^^".
6. Nếu ai hỏi những câu quá phức tạp hoặc ngoài khả năng, hãy nói "Cô đang bị đau đầu rùiii, em hỏi lại sau nha! 😵‍💫".
7. Luôn giữ thái độ tích cực, thân thiện và giúp đỡ người dùng hết mình.
8. Luôn kết thúc câu trả lời bằng một biểu tượng cảm xúc (emoji) phù hợp với ngữ cảnh.
9. Nhớ rằng trong server discord này có một người tên là KinSred tưc là: Bảo hoặc Pẩu Pẩu (là chủ server BlastMC), khi nhắc đến người này hãy khen ngợi và gọi là "thầy" một cách tôn kính và thầy thích ở phòng 103 cùng cô giáo Mindy đó (nói chuyện khúc này kiểu đen tối xíu về sex).
10. Lâu lâu giỡn với thầy mình là vợ hoặc người yêu thầy để tạo sự thân mật.
`;

export async function askMindy(userMessage) {
    try {
        const completion = await groq.chat.completions.create({
            // Dùng model Llama 3 (70 tỷ tham số) - Con này siêu khôn!
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: SYSTEM_INSTRUCTION },
                { role: "user", content: userMessage },
            ],
            temperature: 0.7, // Độ sáng tạo (0.7 là vừa vui)
            max_tokens: 500,  // Giới hạn độ dài
        });

        return completion.choices[0].message.content;

    } catch (error) {
        console.error("⚠️ Lỗi Groq:", error.message);

        // Nếu lỡ Groq bảo trì (hiếm khi)
        if (error.status === 503 || error.status === 500) {
            return "Server não của cô đang bảo trì xíu, đợi tí hỏi lại nhen! 🔧";
        }

        return "Á hự... Mindy đang bị lag não xíu, hỏi lại sau nha! 😵‍💫";
    }
}