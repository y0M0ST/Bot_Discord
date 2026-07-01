import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Mindy Bot is running 24/7 on Render! 🚀');
});

export function keepAlive() {
    app.listen(port, () => {
        console.log(`🌐 [Web Server] Đang lắng nghe trên cổng ${port} để giữ bot sống!`);
    });
}
