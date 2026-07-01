import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';

let supabase = null;

if (config.SUPABASE_URL && config.SUPABASE_KEY) {
    supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);
    console.log("📦 Đã khởi tạo kết nối Supabase.");
} else {
    console.warn("⚠️ CẢNH BÁO: Thiếu thông tin kết nối Supabase trong .env!");
}

export default supabase;
