import { DisTube } from 'distube';
import { YtDlpPlugin } from '@distube/yt-dlp';
import { SoundCloudPlugin } from '@distube/soundcloud';
import client from './discord.js';

const distube = new DisTube(client, {
    plugins: [
        new SoundCloudPlugin(),
        new YtDlpPlugin()
    ],
});

distube
    .on("debug", (message) => {
        console.log(`[DisTube Debug]: ${message}`);
    })
    .on("playSong", (queue, song) => {
        queue.textChannel.send(`🎶 Đang phát: **${song.name}** - \`[${song.formattedDuration}]\``);
    })
    .on("addSong", (queue, song) => {
        queue.textChannel.send(`✅ Đã thêm: **${song.name}** - \`[${song.formattedDuration}]\``);
    })
    .on("addList", (queue, playlist) => {
        queue.textChannel.send(`✅ Đã thêm playlist: **${playlist.name}** (${playlist.songs.length} bài)`);
    })
    .on("error", (error, queue, song) => {
        console.error("❌ DISTUBE ERROR LOG:", error);
        if (queue && queue.textChannel) {
            queue.textChannel.send(`❌ Có lỗi: ${String(error.message).slice(0, 2000)}`).catch(console.error);
        }
    });

client.distube = distube;

export default distube;
