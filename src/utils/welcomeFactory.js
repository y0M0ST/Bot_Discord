// src/utils/welcomeFactory.js
import { createCanvas, loadImage } from '@napi-rs/canvas';

export async function createWelcomeCard(member, type = "welcome") {
    // 1. Tạo khung tranh (Rộng hơn chút để chứa nhiều chữ)
    const width = 900;
    const height = 300;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // --- MÀU SẮC CHỦ ĐẠO ---
    const color = type === "welcome" ? "#43b581" : "#f04747"; // Xanh lá hoặc Đỏ
    const bgColor = "#23272a"; // Màu đen xám Discord

    // 2. VẼ NỀN (Dark Mode)
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Vẽ một cái thanh màu bên trái làm điểm nhấn
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 20, height);

    // Vẽ thêm họa tiết nền mờ mờ cho đỡ trống
    ctx.fillStyle = "#2c2f33";
    ctx.beginPath();
    ctx.arc(800, 300, 150, 0, Math.PI * 2, true);
    ctx.fill();

    // 3. XỬ LÝ AVATAR (Hình tròn có viền màu)
    try {
        const avatarURL = member.user.displayAvatarURL({
            extension: 'png',
            forceStatic: true,
            size: 256
        });
        const avatar = await loadImage(avatarURL);

        // Vẽ khung tròn avatar
        const avatarX = 150;
        const avatarY = 150;
        const avatarRadius = 110;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
        ctx.restore();

        // Viền avatar theo màu trạng thái
        ctx.strokeStyle = color;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.stroke();

    } catch (err) {
        // Fallback nếu lỗi avatar
        ctx.fillStyle = '#7289da';
        ctx.beginPath();
        ctx.arc(150, 150, 110, 0, Math.PI * 2, true);
        ctx.fill();
    }

    // 4. VIẾT THÔNG TIN CHI TIẾT 📝
    const textX = 300; // Lề trái cho chữ

    // -- Tiêu đề (WELCOME / GOODBYE)
    ctx.fillStyle = color;
    ctx.font = 'bold 50px Sans';
    const title = type === "welcome" ? "WELCOME" : "GOODBYE";
    ctx.fillText(title, textX, 70);

    // -- Tên người dùng (Tự co nhỏ nếu dài)
    ctx.fillStyle = '#ffffff';
    let fontSize = 60;
    ctx.font = `bold ${fontSize}px Sans`;
    const name = member.user.username; // Tên tài khoản

    // Co font nếu tên dài quá
    while (ctx.measureText(name).width > 550) {
        fontSize -= 5;
        ctx.font = `bold ${fontSize}px Sans`;
    }
    ctx.fillText(name, textX, 135);

    // -- Thông tin chi tiết (Dòng nhỏ bên dưới)
    ctx.fillStyle = '#b9bbbe'; // Màu xám nhạt
    ctx.font = '26px Sans';

    // Định dạng ngày tạo tài khoản (dd/mm/yyyy)
    const createdDate = member.user.createdAt.toLocaleDateString('vi-VN');
    const memberCount = member.guild.memberCount;

    // Dòng 1: ID người dùng
    ctx.fillText(`🆔 ID: ${member.id}`, textX, 180);

    // Dòng 2: Ngày tạo acc (Quan trọng để soi clone)
    ctx.fillText(`📅 Ngày tạo Acc: ${createdDate}`, textX, 220);

    // Dòng 3: Thứ tự thành viên
    if (type === "welcome") {
        ctx.fillText(`users Thành viên thứ: #${memberCount}`, textX, 260);
    } else {
        ctx.fillText(`👋 Hẹn gặp lại sau nha!`, textX, 260);
    }

    return canvas.toBuffer('image/png');
}