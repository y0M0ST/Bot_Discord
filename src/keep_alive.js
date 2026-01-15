import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send('Bot đang sống nhăn răng! 🤖');
});

export function keepAlive() {
    app.listen(3000, () => {
        console.log("Server 'máy thở' đã chạy ở port 3000!");
    });
}