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

export async function loadCommands(client) {
    const commandsPath = path.join(__dirname, "..", "commands");
    const commandFiles = getAllFiles(commandsPath);
    console.log(`📦 Tìm thấy ${commandFiles.length} lệnh... Đang nạp!`);

    for (const { filePath } of commandFiles) {
        try {
            const commandModule = await import(pathToFileURL(filePath).href);
            const cmd = commandModule.default;
            if (cmd?.name && cmd?.execute) {
                client.commands.set(cmd.name, cmd);
            }
        } catch (e) {
            console.error(`❌ Lỗi khi nạp lệnh từ tệp: ${filePath}`, e);
        }
    }
}
