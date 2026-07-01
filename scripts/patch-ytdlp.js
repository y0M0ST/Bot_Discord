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
        // Xoá cờ --no-call-home
        if (content.includes('--no-call-home')) {
            content = content.replace(/--no-call-home/g, '');
            fs.writeFileSync(file, content);
            console.log(`✅ Đã vá thành công file: ${file}`);
            patched = true;
        }
    }
}

if (!patched) {
    console.log("✨ Không tìm thấy lỗi nào cần vá (Đã vá từ trước hoặc phiên bản đã sửa).");
}
