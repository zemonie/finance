/* 
   ==========================================================================
   VenturaFin - Input Transaksi Logic (FORM PROCESSING)
   File ini menangani proses input data transaksi baru dari Form ke 
   dalam Memori Browser (LocalStorage).
   ==========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cek Autentikasi Pengguna
    const user = VenturaAuth.requireAuth();
    if (!user) return;

    // 2. Inisialisasi Elemen Form (DOM Binding)
    let currentType = 'pemasukan'; // State Default
    const form = document.getElementById('transaksiForm');
    const typeInput = document.getElementById('transaksiType');
    const nominalInput = document.getElementById('transaksiNominal');
    const kategoriSelect = document.getElementById('transaksiKategori');
    const keteranganInput = document.getElementById('transaksiKeterangan');
    const btnPemasukan = document.getElementById('btnPemasukan');
    const btnPengeluaran = document.getElementById('btnPengeluaran');

    // 3. Set Tanggal Hari Ini Sebagai Default (Auto-Fill)
    const today = new Date().toISOString().split('T')[0];
    const tglInput = document.getElementById('transaksiTanggal');
    if(tglInput) tglInput.value = today;

    // --- Fungsi 1: Load Kategori Berdasarkan Tipe (Pemasukan vs Pengeluaran) ---
    function loadCategories() {
        if(!kategoriSelect) return;
        const cats = VenturaData.getCategories();
        const list = cats[currentType] || [];
        kategoriSelect.innerHTML = '<option value="">Pilih Kategori</option>';
        list.forEach(c => {
            kategoriSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
        });
    }

    loadCategories(); // Panggil saat pertama buka

    // --- Fungsi 2: Tombol Toggle Tipe (Logic Switcher Interaction) ---
    if(btnPemasukan && btnPengeluaran) {
        btnPemasukan.addEventListener('click', () => {
            currentType = 'pemasukan';
            typeInput.value = 'pemasukan';
            btnPemasukan.classList.add('active');
            btnPengeluaran.classList.remove('active');
            loadCategories(); // Refresh list kategori
        });

        btnPengeluaran.addEventListener('click', () => {
            currentType = 'pengeluaran';
            typeInput.value = 'pengeluaran';
            btnPengeluaran.classList.add('active');
            btnPemasukan.classList.remove('active');
            loadCategories(); // Refresh list kategori
        });
    }

    // --- Fungsi 3: Format Input Nominal Jadi Ribuan (UI Masking Interaction) ---
    if(nominalInput) {
        nominalInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, ''); // Hapus semua kecuali angka
            if (val) { e.target.value = Number(val).toLocaleString('id-ID'); }
        });
    }

    // --- Fungsi 4: Simpan Data Transaksi (Submit Handler & Logic CRUD) ---
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Mencegah refresh halaman (SPA Logic)

            const nominalRaw = nominalInput.value.replace(/\D/g, '');
            const nominal = parseInt(nominalRaw);

            // Validasi Input (Front-End Validation)
            if (!nominal || nominal <= 0) { alert('Nominal harus lebih dari 0'); return; }
            if (!kategoriSelect.value) { alert('Pilih kategori'); return; }
            if (!keteranganInput.value.trim()) { alert('Isi keterangan'); return; }

            // Menyusun Objek Transaksi Baru (Data Structuring)
            const txn = {
                type: currentType,
                nominal: nominal,
                category: kategoriSelect.value,
                date: tglInput.value,
                description: keteranganInput.value.trim(),
                userId: user.id
            };

            // Simpan ke LocalStorage (Data Layer Interaction)
            VenturaData.addTransaction(txn);

            // Respon Berhasil (Feedback)
            if(typeof showToast === 'function') showToast('successToast', 'Berhasil disimpan!');
            
            // Bersihkan form (Reset Interaction)
            form.reset();
            tglInput.value = today;
            nominalInput.value = '';
            loadCategories();
        });
    }
});
