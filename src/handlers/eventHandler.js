import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (file.endsWith(".js")) {
            fileList.push({ filePath, fileName: file });
        }
    }
    return fileList;
}

export async function loadEvents(client) {
    const eventsPath = path.join(__dirname, "..", "events");
    const eventFiles = getAllFiles(eventsPath);
    console.log(`🔔 Tìm thấy ${eventFiles.length} events... Đang nạp!`);

    for (const { filePath } of eventFiles) {
        try {
            const eventModule = await import(pathToFileURL(filePath).href);
            const event = eventModule.default;
            if (event?.name && event?.execute) {
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args));
                } else {
                    client.on(event.name, (...args) => event.execute(...args));
                }
            }
        } catch (e) {
            console.error(`❌ Lỗi khi nạp event từ tệp: ${filePath}`, e);
        }
    }
}
