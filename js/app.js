/* 
   ==========================================================================
   VenturaFin - App Core (SIDEBAR & HEADER UI LAYER)
   File ini menangani proses rendering Sidebar & Navbar secara dinamis
   di semua halaman agar tidak perlu menulis ulang kode HTML yg sama.
   ==========================================================================
*/

/* ============================================================
   KONFIGURASI FITUR
   Atur opsi di bawah sesuai kebutuhan tampilan aplikasi Anda.
   ============================================================ */
const VenturaConfig = {
    // ✅ OPSI FOTO PROFIL DI NAVBAR
    // true  → Tampilkan foto profil (jika ada) di avatar navbar & dropdown
    // false → Selalu tampilkan inisial teks saja (tanpa foto)
    ENABLE_NAVBAR_PHOTO: true,

    // ✅ OPSI INFO USER DI SIDEBAR (bagian bawah)
    // true  → Tampilkan nama + foto kecil di bawah sidebar
    // false → Sembunyikan, hanya tampil tombol logout
    ENABLE_SIDEBAR_USER_INFO: true,
};
/* ============================================================ */


document.addEventListener('DOMContentLoaded', () => {
    const user = VenturaAuth.requireAuth();
    if (!user) return;

    // Ambil data user terbaru (termasuk foto terbaru dari localStorage)
    const freshUser = VenturaData.getUserById(user.id) || user;

    renderSidebar(freshUser);
    renderHeader(freshUser);
    setupSidebarToggle();
    setupUserMenu(freshUser);
    highlightActiveNav();
    
    if (freshUser.role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
});

/* ------------------------------------------------------------------
   HELPER: Buat HTML avatar (foto atau inisial)
   ------------------------------------------------------------------ */
function buildAvatarHTML(user) {
    const initials = VenturaData.getInitials(user.name);
    if (VenturaConfig.ENABLE_NAVBAR_PHOTO && user.photo) {
        return `<img src="${user.photo}" alt="${user.name}" class="avatar-img">`;
    }
    return `<span class="avatar-initials">${initials}</span>`;
}

/* ------------------------------------------------------------------
   FUNGSI 1: Render Sidebar
   ------------------------------------------------------------------ */
function renderSidebar(user) {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar || sidebar.children.length > 0) return;

    const userInfoHTML = VenturaConfig.ENABLE_SIDEBAR_USER_INFO ? `
        <div class="sidebar-user-info">
            <div class="sidebar-user-avatar">${buildAvatarHTML(user)}</div>
            <div class="sidebar-user-text">
                <span class="sidebar-user-name">${user.name}</span>
                <span class="sidebar-user-role">${user.role === 'admin' ? 'Administrator' : 'User'}</span>
            </div>
        </div>` : '';

    sidebar.innerHTML = `
        <div class="sidebar-header">
            <div class="sidebar-logo">
                </svg>
                <span class="sidebar-brand">Ventura Financial</span>
            </div>
            <button class="sidebar-close" id="sidebarClose" aria-label="Tutup sidebar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
        <nav class="sidebar-nav">
            <a href="dashboard.html" class="nav-item" id="navDashboard">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                <span>Dashboard</span>
            </a>
            <a href="transaksi.html" class="nav-item" id="navTransaksi">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>Input Transaksi</span>
            </a>
            <a href="riwayat.html" class="nav-item" id="navRiwayat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <span>Riwayat Transaksi</span>
            </a>
            <a href="laporan.html" class="nav-item" id="navLaporan">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                <span>Laporan</span>
            </a>
            <a href="kategori.html" class="nav-item" id="navKategori">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                <span>Kategori</span>
            </a>
            <div class="nav-divider"></div>
            <a href="users.html" class="nav-item admin-only" id="navUsers">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>Manajemen User</span>
            </a>
            <a href="profil.html" class="nav-item" id="navProfil">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>Profil</span>
            </a>
        </nav>
        <div class="sidebar-footer">
            <button class="btn-logout" id="btnLogout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span>Keluar</span>
            </button>
        </div>`;
}

/* ------------------------------------------------------------------
   FUNGSI 2: Render Header/Navbar
   ------------------------------------------------------------------ */
function renderHeader(user) {
    const header = document.getElementById('topHeader');
    if (!header || header.children.length > 0) return;

    const titles = {
        'transaksi.html': 'Input Transaksi',
        'riwayat.html': 'Riwayat Transaksi',
        'laporan.html': 'Laporan Keuangan',
        'users.html': 'Manajemen User',
        'profil.html': 'Profil Saya',
        'kategori.html': 'Pengaturan Kategori',
        'dashboard.html': 'Dashboard'
    };
    const page = window.location.pathname.split('/').pop() || 'dashboard.html';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
    const firstName = user.name.split(' ')[0];

    header.innerHTML = `
        <div class="header-left">
            <button class="hamburger" id="hamburgerBtn" aria-label="Toggle sidebar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
            </button>
            <div class="page-title">
                <h1>${titles[page] || 'Dashboard'}</h1>
                <p class="page-subtitle">${greeting}, ${firstName}!</p>
            </div>
        </div>
        <div class="header-right">
            <div class="header-date" id="headerDate"></div>
            <div class="user-menu" id="userMenu">
                <div class="user-avatar" id="userAvatar" title="${user.name}">
                    ${buildAvatarHTML(user)}
                </div>
                <div class="user-dropdown" id="userDropdown">
                    <div class="dropdown-header">
                        <div class="dropdown-avatar-wrap">
                            <div class="dropdown-avatar-thumb">
                                ${buildAvatarHTML(user)}
                            </div>
                            <div class="dropdown-user-info">
                                <span class="dropdown-name">${user.name}</span>
                                <span class="dropdown-email">${user.email}</span>
                            </div>
                        </div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="profil.html" class="dropdown-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        Profil Saya
                    </a>
                    <a href="transaksi.html" class="dropdown-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Tambah Transaksi
                    </a>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item dropdown-item-danger" id="dropdownLogout">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Keluar
                    </button>
                </div>
            </div>
        </div>`;

   
}

/* ------------------------------------------------------------------
   FUNGSI 3: Setup User Menu Dropdown + Logout
   ------------------------------------------------------------------ */
function setupUserMenu(user) {
    const avatar = document.getElementById('userAvatar');
    const dropdown = document.getElementById('userDropdown');
    if (avatar && dropdown) {
        avatar.addEventListener('click', e => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        document.addEventListener('click', () => dropdown.classList.remove('show'));
    }
    const logoutBtn = document.getElementById('btnLogout');
    const dropdownLogout = document.getElementById('dropdownLogout');
    if (logoutBtn) logoutBtn.addEventListener('click', () => VenturaAuth.logout());
    if (dropdownLogout) dropdownLogout.addEventListener('click', () => VenturaAuth.logout());
}

/* ------------------------------------------------------------------
   FUNGSI 4: Sidebar Mobile Toggle
   ------------------------------------------------------------------ */
function setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const hamburger = document.getElementById('hamburgerBtn');
    const closeBtn = document.getElementById('sidebarClose');
    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    }
    if (hamburger) hamburger.addEventListener('click', () => {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    });
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);
}

/* ------------------------------------------------------------------
   FUNGSI 5: Highlight Menu Aktif
   ------------------------------------------------------------------ */
function highlightActiveNav() {
    const page = window.location.pathname.split('/').pop() || 'dashboard.html';
    const map = {
        'dashboard.html': 'navDashboard',
        'transaksi.html': 'navTransaksi',
        'riwayat.html': 'navRiwayat',
        'laporan.html': 'navLaporan',
        'kategori.html': 'navKategori',
        'users.html': 'navUsers',
        'profil.html': 'navProfil'
    };
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const el = document.getElementById(map[page]);
    if (el) el.classList.add('active');
}

/* ------------------------------------------------------------------
   FUNGSI GLOBAL: Toast Notification
   ------------------------------------------------------------------ */
function showToast(id, msg, dur) {
    const t = document.getElementById(id);
    if (!t) return;
    const txt = t.querySelector('span');
    if (txt && msg) txt.textContent = msg;
    t.style.display = 'flex';
    t.style.animation = 'toastIn 0.4s ease';
    setTimeout(() => { t.style.display = 'none'; }, dur || 3000);
}
