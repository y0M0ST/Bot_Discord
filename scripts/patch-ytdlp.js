import fs from 'fs';
import path from 'path';

console.log("🛠️ Đang vá lỗi yt-dlp (--no-call-home)...");

const filesToPatch = [
    path.join('node_modules', '@distube', 'yt-dlp', 'dist', 'index.js'),
    path.join('node_modules', '@distube', 'yt-dlp', 'dist', 'index.mjs')
];

let patched = false;

for (const file of filesToPatch) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let fileChanged = false;

        // 1. Xoá cờ --no-call-home nếu còn sót
        if (content.includes('--no-call-home')) {
            content = content.replace(/--no-call-home/g, '');
            console.log(`✅ Đã vá lỗi --no-call-home trong file: ${file}`);
            fileChanged = true;
        }

        // 2. Sửa lỗi "Requested format is not available" bằng cách cho phép tải cả video nếu không có audio
        if (content.includes('format: "ba/ba*"')) {
            content = content.replace(/format: "ba\/ba\*"/g, 'format: "ba/ba*/best"');
            console.log(`✅ Đã vá lỗi Format Audio trong file: ${file}`);
            fileChanged = true;
        }

        if (fileChanged) {
            fs.writeFileSync(file, content);
            patched = true;
        }
    }
}

if (!patched) {
    console.log("✨ Không tìm thấy lỗi nào cần vá (Đã vá từ trước hoặc phiên bản đã sửa).");
}
