/* 
   ==========================================================================
   VenturaFin - Authentication Module (SIMULASI LOGIN)
   File ini menangani proses pengecekan hak akses (Login/Admin).
   Semuanya berjalan di sisi Client (Browser).
   ==========================================================================
*/

const VenturaAuth = {
    // --- Mengecek apakah user sudah Login, jika belum maka dilempar ke index.html (Login) ---
    requireAuth() {
        const session = VenturaData.getSession();
        if (!session) {
            window.location.href = 'index.html';
            return null;
        }
        return session;
    },

    // --- Mengecek apakah user Login sebagai Admin ---
    requireAdmin() {
        const session = this.requireAuth();
        if (session && session.role !== 'admin') {
            window.location.href = 'dashboard.html';
            return null;
        }
        return session;
    },

    // --- Fungsi Simulasi Login: Mencocokan Email & Password dlm memori (LocalStorage) ---
    login(email, password) {
        const users = VenturaData.getUsers();
        // Cari user yang email dan passwordnya cocok (Email dibuat case-insensitive)
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        if (!user) {
            return { success: false, message: 'Email atau password salah' };
        }
        
        // Cek status akun aktif/tidak
        if (user.status === 'inactive') {
            return { success: false, message: 'Akun Anda telah dinonaktifkan. Hubungi admin.' };
        }

        // Update waktu login terakhir
        user.lastLogin = new Date().toISOString();
        VenturaData.updateUser(user.id, { lastLogin: user.lastLogin });
        
        // Masukkan data user ke SessionStorage (Session Login Aktif)
        VenturaData.setSession(user);
        
        return { success: true, user };
    },

    // --- Fungsi Keluar dari Sistem (Logout) ---
    logout() {
        // Hapus session dan arahkan kembali ke Login Page
        VenturaData.clearSession();
        window.location.href = 'index.html';
    },

    // --- Mengambil data user yang sedang aktif secara fresh ---
    getCurrentUser() {
        const session = VenturaData.getSession();
        if (!session) return null;
        return VenturaData.getUserById(session.id) || session;
    }
};
