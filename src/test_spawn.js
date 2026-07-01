import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YTDLP_PATH = path.join(__dirname, "..", "node_modules", "@distube", "yt-dlp", "bin", "yt-dlp.exe");

const url = "https://www.youtube.com/watch?v=vwtsSCYVW3k";
const flags = {
  dumpSingleJson: true,
  noWarnings: true,
  preferFreeFormats: true,
  skipDownload: true,
  simulate: true
};

import dargs from 'dargs';
const args = [url].concat(dargs(flags, { useEquals: false })).filter(Boolean);

console.log('Spawning:', YTDLP_PATH, args.join(' '));

const process2 = spawn(YTDLP_PATH, args);

let stdout = "";
let stderr = "";

process2.stdout.on('data', (chunk) => {
  stdout += chunk;
});

process2.stderr.on('data', (chunk) => {
  stderr += chunk;
});

process2.on('close', (code) => {
  console.log('Exit Code:', code);
  console.log('--- STDOUT (First 300 chars) ---');
  console.log(stdout.substring(0, 300));
  console.log('--- STDERR (First 300 chars) ---');
  console.log(stderr.substring(0, 300));
  process.exit(0);
});
