/* 
   ==========================================================================
   VenturaFin - Mock Data & Data Layer (PENYIMPANAN DATA)
   File ini berfungsi sebagai pengganti DATABASE (Back-End) untuk tugas Front-End.
   Semua data disimpan di memory browser (LocalStorage).
   ==========================================================================
*/

const VenturaData = {
    // --- Akun Pengguna Default (Dummy Users) ---
    defaultUsers: [
        {
            id: 1,
            name: 'Admin Ventura',
            email: 'admin@ventura.com',
            password: 'admin123',
            role: 'admin',
            status: 'active',
            lastLogin: '2026-04-07T09:30:00',
            photo: ''
        },
        {
            id: 2,
            name: 'Budi Santoso',
            email: 'user@ventura.com',
            password: 'user123',
            role: 'user',
            status: 'active',
            lastLogin: '2026-04-06T14:00:00',
            photo: ''
        }
    ],

    // --- Kategori Transaksi Default ---
    defaultCategories: {
        pemasukan: [
            { id: 1, name: 'Penjualan Produk' },
            { id: 2, name: 'Jasa/Layanan' },
            { id: 3, name: 'Investasi' },
            { id: 4, name: 'Lainnya' }
        ],
        pengeluaran: [
            { id: 5, name: 'Gaji Karyawan' },
            { id: 6, name: 'Sewa & Utilitas' },
            { id: 7, name: 'Bahan Baku' },
            { id: 8, name: 'Marketing' },
            { id: 9, name: 'Operasional' },
            { id: 11, name: 'Lainnya' }
        ]
    },

    // --- Data Transaksi Awal (Tampil di Grafik) ---
    defaultTransactions: [
        { id: 1, type: 'pemasukan', nominal: 45000000, category: 'Penjualan Produk', date: '2026-04-01', description: 'Closing proyek besar', userId: 1 },
        { id: 2, type: 'pengeluaran', nominal: 15000000, category: 'Gaji Karyawan', date: '2026-04-03', description: 'Gaji bulanan tim', userId: 1 }
    ],

    // --- Inisialisasi: Menyiapkan data di LocalStorage saat pertama kali dibuka ---
    init() {
        // Cek pengguna dengan penanganan error jika data LocalStorage rusak
        try {
            let users = JSON.parse(localStorage.getItem('ventura_users') || '[]');
            if (!Array.isArray(users) || users.length === 0) {
                localStorage.setItem('ventura_users', JSON.stringify(this.defaultUsers));
            } else {
                // Pastikan admin ada di daftar (Case-insensitive check)
                const hasAdmin = users.some(u => u.email.toLowerCase() === 'admin@ventura.com');
                if (!hasAdmin) {
                    users.push(this.defaultUsers[0]);
                    localStorage.setItem('ventura_users', JSON.stringify(users));
                }
            }
        } catch (e) {
            console.warn('LocalStorage Corrupted, resetting users...');
            localStorage.setItem('ventura_users', JSON.stringify(this.defaultUsers));
        }
        
        // Inisialisasi Kategori
        if (!localStorage.getItem('ventura_categories')) {
            localStorage.setItem('ventura_categories', JSON.stringify(this.defaultCategories));
        }
        // Inisialisasi Transaksi
        if (!localStorage.getItem('ventura_transactions')) {
            localStorage.setItem('ventura_transactions', JSON.stringify(this.defaultTransactions));
        }
    },

    // --- Mengambil & Menyimpan Data USER (CRUD) ---
    getUsers() { return JSON.parse(localStorage.getItem('ventura_users') || '[]'); },
    saveUsers(users) { localStorage.setItem('ventura_users', JSON.stringify(users)); },
    getUserById(id) { return this.getUsers().find(u => u.id === id); },
    updateUser(id, data) {
        const users = this.getUsers();
        const idx = users.findIndex(u => u.id === id);
        if (idx !== -1) {
            users[idx] = { ...users[idx], ...data };
            this.saveUsers(users);
        }
    },
    // Tambah User Baru ke LocalStorage (Front-End CRUD)
    addUser(userData) {
        const users = this.getUsers();
        const newUser = {
            id: Date.now(), // ID unik berdasarkan timestamp
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role || 'user',
            status: userData.status || 'active',
            lastLogin: '-',
            photo: ''
        };
        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    },
    // Hapus User dari LocalStorage
    deleteUser(id) {
        const users = this.getUsers().filter(u => u.id !== id);
        this.saveUsers(users);
    },

    // --- Mengambil & Menyimpan Data KATEGORI (CRUD) ---
    getCategories() { return JSON.parse(localStorage.getItem('ventura_categories') || '{"pemasukan":[],"pengeluaran":[]}'); },
    saveCategories(cats) { localStorage.setItem('ventura_categories', JSON.stringify(cats)); },

    // --- Mengambil & Menyimpan Data TRANSAKSI (CRUD) ---
    getTransactions() { return JSON.parse(localStorage.getItem('ventura_transactions') || '[]'); },
    saveTransactions(txns) { localStorage.setItem('ventura_transactions', JSON.stringify(txns)); },
    addTransaction(txn) {
        const txns = this.getTransactions();
        txn.id = Date.now(); // ID unik sederhana
        txns.push(txn);
        this.saveTransactions(txns);
        return txn;
    },

    // --- Manajemen Session (Login Aktif) ---
    setSession(user) { sessionStorage.setItem('ventura_session', JSON.stringify(user)); },
    getSession() { return JSON.parse(sessionStorage.getItem('ventura_session') || 'null'); },
    clearSession() { sessionStorage.removeItem('ventura_session'); },

    // --- Fungsi Helper (Format Rupiah & Tanggal) ---
    formatCurrency(num) { return 'Rp ' + Number(num).toLocaleString('id-ID'); },
    formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    // Format tanggal beserta jam (untuk halaman user)
    formatDateTime(dateStr) {
        if (!dateStr || dateStr === '-') return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
               ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    },
    getInitials(name) { return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); },
    getMonthName(idx) { return ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][idx]; }
};

// Jalankan fungsi inisialisasi
VenturaData.init();
