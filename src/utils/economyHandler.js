import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. Lấy thông tin user (Tiền + Thời gian làm việc)
export async function getUserData(userId) {
    const { data, error } = await supabase
        .from('economy')
        .select('money, last_worked, last_mined') // 👈 Thêm last_mined vào đây
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        return { money: 0, lastWorked: 0, lastMined: 0 };
    }
    // Trả về cả lastMined
    return {
        money: data.money,
        lastWorked: data.last_worked,
        lastMined: data.last_mined // 👈 Mapping dữ liệu
    };
}

// 2. Cập nhật tiền (Cộng/Trừ)
export async function updateMoney(userId, amount) {
    const currentUser = await getUserData(userId);
    const newBalance = currentUser.money + amount;

    if (newBalance < 0) return false; // Không cho âm tiền

    const { error } = await supabase
        .from('economy')
        .upsert({
            user_id: userId,
            money: newBalance,
            last_worked: currentUser.lastWorked // Giữ nguyên thời gian cũ
        });

    if (error) console.error("Lỗi update tiền:", error);
    return true;
}

// 3. Cập nhật thời gian làm việc (Cho lệnh Work)
export async function updateWorkTime(userId) {
    // Lấy tiền hiện tại để giữ nguyên, chỉ update giờ
    const currentUser = await getUserData(userId);

    const { error } = await supabase
        .from('economy')
        .upsert({
            user_id: userId,
            money: currentUser.money,
            last_worked: Date.now() // Lưu giờ hiện tại
        });

    if (error) console.error("Lỗi update giờ làm:", error);
}

// 4. Lấy danh sách đại gia (Top 10)
export async function getTopRich(limit = 10) {
    const { data, error } = await supabase
        .from('economy')
        .select('user_id, money')
        .order('money', { ascending: false }) // Sắp xếp giảm dần (Giàu nhất đứng đầu)
        .limit(limit); // Chỉ lấy số lượng giới hạn (mặc định 10)

    if (error) {
        console.error("Lỗi lấy BXH:", error);
        return [];
    }
    return data;
}

// 5. Lấy túi đồ của user
export async function getInventory(userId) {
    const { data, error } = await supabase
        .from('economy')
        .select('inventory')
        .eq('user_id', userId)
        .single();

    if (error || !data || !data.inventory) return {};
    return data.inventory;
}

// 6. Thêm vật phẩm vào túi (itemKey: 'stone', amount: 1)
export async function addItem(userId, itemKey, amount = 1) {
    const currentInv = await getInventory(userId);

    // Nếu chưa có món này thì = 0, có rồi thì cộng thêm
    if (!currentInv[itemKey]) currentInv[itemKey] = 0;
    currentInv[itemKey] += amount;

    // Lưu ngược lại vào Supabase
    const { error } = await supabase
        .from('economy')
        .update({ inventory: currentInv })
        .eq('user_id', userId);

    if (error) console.error("Lỗi thêm đồ:", error);
}

// 7. Xoá vật phẩm (Dùng khi Bán đồ)
export async function removeItem(userId, itemKey, amount = 1) {
    const currentInv = await getInventory(userId);

    if (!currentInv[itemKey] || currentInv[itemKey] < amount) return false; // Không đủ đồ

    currentInv[itemKey] -= amount;

    // Nếu số lượng về 0 thì xoá luôn key đó cho gọn database
    if (currentInv[itemKey] <= 0) delete currentInv[itemKey];

    const { error } = await supabase
        .from('economy')
        .update({ inventory: currentInv })
        .eq('user_id', userId);

    return true;
}

export async function updateMiningTime(userId) {
    const currentUser = await getUserData(userId);

    const { error } = await supabase
        .from('economy')
        .upsert({
            user_id: userId,
            money: currentUser.money,
            last_mined: Date.now() // Lưu giờ hiện tại vào cột last_mined
        });

    if (error) console.error("Lỗi update giờ đào:", error);
}