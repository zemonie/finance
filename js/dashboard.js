/* 
   ==========================================================================
   VenturaFin - Dashboard Page Business Logic (GRAFIK & RINGKASAN)
   File ini menangani proses kalkulasi data transaksi untuk ditampilkan
   menjadi statistik visual (Chart.js Bar & Doughnut).
   ==========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cek Login Terlebih Dahulu (Wajib Front-End Auth)
    const user = VenturaAuth.requireAuth();
    if (!user) return;

    // 2. Jalankan Render UI Berdasarkan Data Memori (Mock Data)
    renderSummaryCards();
    renderBarChart('6m'); // Default 6 bulan
    renderPieChart('6m'); // Default 6 bulan
    renderRecentTransactions();

    // Setup event listener untuk selector jangka waktu
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update UI tombol aktif
            periodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Ambil jangka waktu (6m, 1y, dll)
            const period = btn.dataset.period;
            renderBarChart(period);
            renderPieChart(period);
        });
    });
});

// --- Fungsi 1: Kalkulasi & Tampilkan Kartu Ringkasan (Saldo, Masuk, Keluar) ---
function renderSummaryCards() {
    const txns = VenturaData.getTransactions();
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    // Filter transaksi bulan ini saja
    const thisMonthTxns = txns.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
    });

    // Kalkulasi Total Pemasukan, Pengeluaran & Saldo (Logic Front-End)
    const pemasukan = thisMonthTxns.filter(t => t.type === 'pemasukan').reduce((s, t) => s + t.nominal, 0);
    const pengeluaran = thisMonthTxns.filter(t => t.type === 'pengeluaran').reduce((s, t) => s + t.nominal, 0);
    const totalSaldo = txns.filter(t => t.type === 'pemasukan').reduce((s, t) => s + t.nominal, 0) -
                       txns.filter(t => t.type === 'pengeluaran').reduce((s, t) => s + t.nominal, 0);

    // Tempelkan angka ke Elemen HTML (DOM Manipulation)
    const ts = document.getElementById('totalSaldo'); if(ts) ts.textContent = VenturaData.formatCurrency(totalSaldo);
    const tp = document.getElementById('totalPemasukan'); if(tp) tp.textContent = VenturaData.formatCurrency(pemasukan);
    const tpe = document.getElementById('totalPengeluaran'); if(tpe) tpe.textContent = VenturaData.formatCurrency(pengeluaran);
    const tt = document.getElementById('totalTransaksi'); if(tt) tt.textContent = thisMonthTxns.length;
}

// --- Fungsi 2: Render Bar Chart (Perbandingan Masuk vs Keluar Sesuai Jangka Waktu) ---
function renderBarChart(period) {
    const txns = VenturaData.getTransactions();
    const now = new Date();
    const labels = [];
    const incomeData = [];
    const expenseData = [];

    let steps = 6;
    let stepType = 'month'; // Agregasi per bulan

    if (period === '1y') steps = 12;
    if (period === '2y') steps = 24;
    if (period === '5y') { steps = 5; stepType = 'year'; } // Agregasi per tahun
    if (period === '10y') { steps = 10; stepType = 'year'; } // Agregasi per tahun

    // Loop mundur sesuai jangka waktu (Logic Visualisasi Data)
    for (let i = steps - 1; i >= 0; i--) {
        let currentLabel = '';
        let mTxns = [];

        if (stepType === 'month') {
            const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const month = m.getMonth();
            const year = m.getFullYear();
            currentLabel = VenturaData.getMonthName(month).substring(0, 3) + ' ' + year;

            mTxns = txns.filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === month && d.getFullYear() === year;
            });
        } else if (stepType === 'year') {
            const currentYear = now.getFullYear() - i;
            currentLabel = currentYear.toString();

            mTxns = txns.filter(t => {
                const d = new Date(t.date);
                return d.getFullYear() === currentYear;
            });
        }

        labels.push(currentLabel);
        incomeData.push(mTxns.filter(t => t.type === 'pemasukan').reduce((s, t) => s + t.nominal, 0));
        expenseData.push(mTxns.filter(t => t.type === 'pengeluaran').reduce((s, t) => s + t.nominal, 0));
    }

    const ctx = document.getElementById('barChart');
    if (!ctx) return;
    
    // Simpan instance chart di window agar bisa di-destroy saat update
    if (window.myBarChart) window.myBarChart.destroy();
    
    // Inisialisasi Library Chart.js (Visualisasi Front-End)
    window.myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Pemasukan',
                    data: incomeData,
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: '#22C55E',
                    borderWidth: 1,
                    borderRadius: 6
                },
                {
                    label: 'Pengeluaran',
                    data: expenseData,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: '#EF4444',
                    borderWidth: 1,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 10 },
                        // Kurangi label agar tidak tumpang tindih untuk 24 bulan
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: steps > 12 ? 8 : 12
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: '#F1F5F9' },
                    ticks: {
                        font: { size: 10 },
                        callback: v => v >= 1e6 ? (v/1e6).toFixed(0)+'jt' : v>=1e3 ? (v/1e3).toFixed(0)+'rb' : v
                    }
                }
            }
        }
    });
}

// --- Fungsi 3: Render Pie/Doughnut Chart (Distribusi Pengeluaran Per Kategori) ---
function renderPieChart(period) {
    const txns = VenturaData.getTransactions();
    const now = new Date();
    let startDate = new Date();

    // Logic penentuan tanggal mulai berdasarkan periode
    if (period === '6m') startDate.setMonth(now.getMonth() - 6);
    else if (period === '1y') startDate.setFullYear(now.getFullYear() - 1);
    else if (period === '2y') startDate.setFullYear(now.getFullYear() - 2);
    else if (period === '5y') startDate.setFullYear(now.getFullYear() - 5);
    else if (period === '10y') startDate.setFullYear(now.getFullYear() - 10);

    // Filter transaksi pengeluaran sesuai jangka waktu
    const periodExpenses = txns.filter(t => {
        const d = new Date(t.date);
        return t.type === 'pengeluaran' && d >= startDate && d <= now;
    });

    // Kalkulasi distribusi kategori (Logic Akumulasi)
    const catTotals = {};
    periodExpenses.forEach(t => catTotals[t.category] = (catTotals[t.category] || 0) + t.nominal);

    const cats = Object.keys(catTotals);
    const values = Object.values(catTotals);

    const ctx = document.getElementById('pieChart');
    if (!ctx) return;
    
    // Hancurkan chart lama jika ada agar tidak tumpang tindih
    if (window.myPieChart) window.myPieChart.destroy();

    if (cats.length === 0) {
        // Tampilkan pesan jika tidak ada data di periode tsb
        return;
    }
    
    window.myPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: cats,
            datasets: [{
                data: values,
                backgroundColor: ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'],
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

// --- Fungsi 4: Menampilkan Daftar Transaksi Terbaru ke Tabel ---
function renderRecentTransactions() {
    const txns = [...VenturaData.getTransactions()].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = txns.slice(0, 5); // Ambil 5 terakhir (Logic Limitasi)
    const tbody = document.getElementById('recentTransactionsBody');
    if (!tbody) return;

    // Render baris tabel secara dinamis denga Template Literal
    tbody.innerHTML = recent.map(t => `
        <tr>
            <td>${VenturaData.formatDate(t.date)}</td>
            <td>${t.description}</td>
            <td><span class="badge ${t.type === 'pemasukan' ? 'badge-income' : 'badge-expense'}">${t.category}</span></td>
            <td class="${t.type === 'pemasukan' ? 'nominal-income' : 'nominal-expense'}">${t.type === 'pemasukan' ? '+' : '-'}${VenturaData.formatCurrency(t.nominal)}</td>
        </tr>`).join('');
}
