/* ========================================
   VenturaFin - Laporan Page Logic
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const user = VenturaAuth.requireAuth();
    if (!user) return;

    let reportBarChart = null;
    let reportPieChart = null;
    let currentReportData = [];

    const bulanSelect = document.getElementById('laporanBulan');
    const tahunSelect = document.getElementById('laporanTahun');

    if (bulanSelect && tahunSelect) {
        const now = new Date();
        bulanSelect.value = now.getMonth();
        tahunSelect.value = now.getFullYear();
    }

    generateReport();

    const btnGenerateLaporan = document.getElementById('btnGenerateLaporan');
    if(btnGenerateLaporan) btnGenerateLaporan.addEventListener('click', generateReport);
    
    const btnExportPdf = document.getElementById('btnExportPdf');
    if(btnExportPdf) btnExportPdf.addEventListener('click', exportPDF);

    function generateReport() {
        if(!bulanSelect || !tahunSelect) return;
        const month = parseInt(bulanSelect.value);
        const year = parseInt(tahunSelect.value);
        const txns = VenturaData.getTransactions();
        const filtered = txns.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });
        currentReportData = filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

        const pemasukan = filtered.filter(t => t.type === 'pemasukan').reduce((s, t) => s + t.nominal, 0);
        const pengeluaran = filtered.filter(t => t.type === 'pengeluaran').reduce((s, t) => s + t.nominal, 0);
        const selisih = pemasukan - pengeluaran;

        const rptPemasukan = document.getElementById('rptPemasukan');
        if(rptPemasukan) rptPemasukan.textContent = VenturaData.formatCurrency(pemasukan);
        
        const rptPengeluaran = document.getElementById('rptPengeluaran');
        if(rptPengeluaran) rptPengeluaran.textContent = VenturaData.formatCurrency(pengeluaran);
        
        const selisihEl = document.getElementById('rptSelisih');
        if(selisihEl) {
            selisihEl.textContent = VenturaData.formatCurrency(selisih);
            selisihEl.style.color = selisih >= 0 ? '#22C55E' : '#EF4444';
        }
        
        const rptJumlah = document.getElementById('rptJumlah');
        if(rptJumlah) rptJumlah.textContent = filtered.length;

        renderReportBar(filtered, month, year);
        renderReportPie(filtered);
        renderReportTable(filtered);
    }

    function renderReportBar(data, month, year) {
        const days = new Date(year, month + 1, 0).getDate();
        const labels = [], inc = [], exp = [];
        for (let d = 1; d <= days; d++) {
            const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            labels.push(d);
            const dt = data.filter(t => t.date === ds);
            inc.push(dt.filter(t => t.type==='pemasukan').reduce((s,t)=>s+t.nominal,0));
            exp.push(dt.filter(t => t.type==='pengeluaran').reduce((s,t)=>s+t.nominal,0));
        }
        const ctx = document.getElementById('reportBarChart');
        if (!ctx) return;
        if (reportBarChart) reportBarChart.destroy();
        reportBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { label:'Pemasukan', data:inc, backgroundColor:'rgba(34,197,94,0.7)', borderRadius:4 },
                    { label:'Pengeluaran', data:exp, backgroundColor:'rgba(239,68,68,0.7)', borderRadius:4 }
                ]
            },
            options: {
                responsive:true, maintainAspectRatio:false,
                plugins: {
                    legend: { position:'top', labels:{ font:{family:'Inter',size:11}, usePointStyle:true } },
                    tooltip: { backgroundColor:'#1E293B', cornerRadius:8, callbacks:{
                        label: c => c.dataset.label+': '+VenturaData.formatCurrency(c.parsed.y)
                    }}
                },
                scales: {
                    x: { grid:{display:false}, ticks:{font:{size:10},maxTicksLimit:15} },
                    y: { beginAtZero:true, grid:{color:'#F1F5F9'}, ticks:{font:{size:10}, callback:v=>v>=1e6?(v/1e6).toFixed(0)+'jt':v>=1e3?(v/1e3).toFixed(0)+'rb':v} }
                }
            }
        });
    }

    function renderReportPie(data) {
        const catTotals = {};
        data.forEach(t => catTotals[t.category] = (catTotals[t.category]||0)+t.nominal);
        const colors = ['#3B82F6','#22C55E','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#F97316'];
        const ctx = document.getElementById('reportPieChart');
        if (!ctx) return;
        if (reportPieChart) reportPieChart.destroy();
        reportPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(catTotals),
                datasets: [{ data: Object.values(catTotals), backgroundColor: colors, borderWidth:2, borderColor:'#fff', hoverOffset:8 }]
            },
            options: {
                responsive:true, maintainAspectRatio:false, cutout:'55%',
                plugins: {
                    legend: { position:'bottom', labels:{ font:{family:'Inter',size:11}, usePointStyle:true, padding:12 } },
                    tooltip: { backgroundColor:'#1E293B', cornerRadius:8 }
                }
            }
        });
    }

    function renderReportTable(data) {
        const tbody = document.getElementById('reportBody');
        if (!tbody) return;
        if (!data.length) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:#94A3B8">Tidak ada transaksi</td></tr>';
            return;
        }
        tbody.innerHTML = data.map(t => `<tr>
            <td>${VenturaData.formatDate(t.date)}</td>
            <td>${t.description}</td>
            <td><span class="badge ${t.type==='pemasukan'?'badge-income':'badge-expense'}">${t.category}</span></td>
            <td><span class="badge ${t.type==='pemasukan'?'badge-income':'badge-expense'}">${t.type==='pemasukan'?'↑ Masuk':'↓ Keluar'}</span></td>
            <td class="${t.type==='pemasukan'?'nominal-income':'nominal-expense'}">${t.type==='pemasukan'?'+':'-'}${VenturaData.formatCurrency(t.nominal)}</td>
        </tr>`).join('');
    }

    function exportPDF() {
        if(!window.jspdf) {
            alert('jsPDF library not loaded');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const month = parseInt(bulanSelect.value);
        const year = parseInt(tahunSelect.value);
        const period = VenturaData.getMonthName(month)+' '+year;
        const pemasukan = currentReportData.filter(t=>t.type==='pemasukan').reduce((s,t)=>s+t.nominal,0);
        const pengeluaran = currentReportData.filter(t=>t.type==='pengeluaran').reduce((s,t)=>s+t.nominal,0);

        doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.setTextColor(30,58,95);
        doc.text('VenturaFin',14,20);
        doc.setFont('helvetica','normal'); doc.setFontSize(12); doc.setTextColor(71,85,105);
        doc.text('Laporan Keuangan - '+period,14,28);
        doc.setDrawColor(226,232,240); doc.line(14,32,196,32);

        doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.text('Ringkasan:',14,42);
        doc.setFont('helvetica','normal');
        doc.text('Total Pemasukan: '+VenturaData.formatCurrency(pemasukan),14,50);
        doc.text('Total Pengeluaran: '+VenturaData.formatCurrency(pengeluaran),14,57);
        doc.text('Selisih: '+VenturaData.formatCurrency(pemasukan-pengeluaran),14,64);
        doc.text('Jumlah Transaksi: '+currentReportData.length,14,71);

        if (currentReportData.length > 0) {
            doc.autoTable({
                startY:80,
                head:[['Tanggal','Keterangan','Kategori','Tipe','Nominal']],
                body: currentReportData.map(t=>[
                    VenturaData.formatDate(t.date), t.description.substring(0,35), t.category,
                    t.type==='pemasukan'?'Masuk':'Keluar',
                    (t.type==='pemasukan'?'+':'-')+VenturaData.formatCurrency(t.nominal)
                ]),
                theme:'grid',
                headStyles:{fillColor:[30,58,95],textColor:255,fontSize:9},
                bodyStyles:{fontSize:8,textColor:[71,85,105]},
                alternateRowStyles:{fillColor:[245,247,250]}
            });
        }
        doc.save(`Laporan_VenturaFin_${period.replace(' ','_')}.pdf`);
    }
});
