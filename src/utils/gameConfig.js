export const ITEMS = {
    // --- KHOÁNG SẢN (Giảm giá bán để tránh lạm phát) ---
    stone: { name: "Đá Cuội", emoji: "<:6939cobblestone:1461244392865140767>", price: 1, type: "material" }, // Rẻ như cho
    coal: { name: "Than", emoji: "<:9359_MCcoal:1461244740426141736>", price: 5, type: "material" }, // Giảm từ 10 -> 5
    iron: { name: "Sắt", emoji: "<:iron:1461242535832846469>", price: 20, type: "material" }, // Giảm từ 50 -> 20
    gold: { name: "Vàng", emoji: "<:gold:1461242658994262036> ", price: 50, type: "material" }, // Giảm từ 150 -> 50
    emerald: { name: "Ngọc Lục Bảo", emoji: "<:86184emerald:1461245077694189619>", price: 150, type: "material" }, // Giảm từ 400 -> 150
    diamond: { name: "Kim Cương", emoji: "<:diamond:1461242587842089099>", price: 500, type: "material" }, // Giảm từ 1000 -> 500
    netherite: { name: "Mảnh Netherite", emoji: "<:netherite:1461242498814050456>", price: 2000, type: "material" }, // Giảm từ 5000 -> 2000

    // --- CÔNG CỤ (Tăng giá theo cấp số nhân) ---
    // Mua xong là nghèo rớt mồng tơi, nhưng đào được nhiều hơn
    pickaxe_wood: {
        name: "Cúp Gỗ", emoji: "<:Wood_Pick:1461243159421128877>", price: 500, type: "tool",
        level: 1, limit: 5
    },
    pickaxe_stone: {
        name: "Cúp Đá", emoji: "<:stonepickaxe:1461242708013224102>", price: 5000, type: "tool", // Tăng lên 5k
        level: 2, limit: 10
    },
    pickaxe_iron: {
        name: "Cúp Sắt", emoji: "<:ironpickaxe:1461242875693105193>", price: 50000, type: "tool", // Tăng lên 50k
        level: 3, limit: 15
    },
    pickaxe_gold: {
        name: "Cúp Vàng", emoji: "<:goldpickaxe:1461242931120705536>", price: 200000, type: "tool", // Tăng lên 200k
        level: 4, limit: 25
    },
    pickaxe_diamond: {
        name: "Cúp Kim Cương", emoji: "<:4441_MCdiamondpickaxe:1461242960145547358>", price: 1000000, type: "tool", // 1 Triệu xu
        level: 5, limit: 40
    },
    pickaxe_netherite: {
        name: "Cúp Netherite", emoji: "<:netheritepickaxe:1461243073928630293>", price: 5000000, type: "tool", // 5 Triệu xu (Mục tiêu tối thượng)
        level: 6, limit: 80
    }
};

// Tỉ lệ rơi đồ (Hardcore hơn: Toàn đá với than thôi)
export const MINE_RATES = [
    { item: "netherite", chance: 0.1 }, // 0.1% (Siêu siêu hiếm - 1000 block mới ra 1)
    { item: "diamond", chance: 1 },     // 1%
    { item: "emerald", chance: 3 },     // 3%
    { item: "gold", chance: 7 },        // 7%
    { item: "iron", chance: 15 },       // 15%
    { item: "coal", chance: 25 },       // 25%
    { item: "stone", chance: 100 }      // 48.9% là Đá
];