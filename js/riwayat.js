/* ========================================
   VenturaFin - Riwayat Transaksi Page Logic
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const user = VenturaAuth.requireAuth();
    if (!user) return;

    const ITEMS_PER_PAGE = 10;
    let currentPage = 1;
    let filteredData = [];
    let deleteTargetId = null;

    const searchInput = document.getElementById('filterSearch');
    const filterTipe = document.getElementById('filterTipe');
    const filterKategori = document.getElementById('filterKategori');
    const filterDari = document.getElementById('filterDari');
    const filterSampai = document.getElementById('filterSampai');
    const btnResetFilter = document.getElementById('btnResetFilter');

    // Load all categories for filter
    function loadFilterCategories() {
        if(!filterKategori) return;
        const cats = VenturaData.getCategories();
        const allCats = [...cats.pemasukan, ...cats.pengeluaran];
        filterKategori.innerHTML = '<option value="">Semua</option>';
        allCats.forEach(c => {
            filterKategori.innerHTML += `<option value="${c.name}">${c.name}</option>`;
        });
    }
    loadFilterCategories();

    // Apply filters and render
    function applyFilters() {
        let txns = VenturaData.getTransactions();

        if (searchInput && searchInput.value) {
            const search = searchInput.value.toLowerCase().trim();
            txns = txns.filter(t => t.description.toLowerCase().includes(search) || t.category.toLowerCase().includes(search));
        }

        if (filterTipe && filterTipe.value) {
            txns = txns.filter(t => t.type === filterTipe.value);
        }

        if (filterKategori && filterKategori.value) {
            txns = txns.filter(t => t.category === filterKategori.value);
        }

        if (filterDari && filterDari.value) {
            txns = txns.filter(t => t.date >= filterDari.value);
        }
        if (filterSampai && filterSampai.value) {
            txns = txns.filter(t => t.date <= filterSampai.value);
        }

        txns.sort((a, b) => new Date(b.date) - new Date(a.date));

        filteredData = txns;
        currentPage = 1;
        renderTable();
    }

    function renderTable() {
        const tbody = document.getElementById('riwayatBody');
        const tableCount = document.getElementById('tableCount');
        const emptyState = document.getElementById('emptyState');
        const pagination = document.getElementById('pagination');
        const tableWrapper = document.querySelector('.table-wrapper');

        if(!tbody) return;

        if (filteredData.length === 0) {
            tbody.innerHTML = '';
            if(emptyState) emptyState.style.display = 'block';
            if (tableWrapper) tableWrapper.style.display = 'none';
            if(pagination) pagination.innerHTML = '';
            if(tableCount) tableCount.textContent = '0 transaksi';
            return;
        }

        if(emptyState) emptyState.style.display = 'none';
        if (tableWrapper) tableWrapper.style.display = 'block';

        const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const pageData = filteredData.slice(start, start + ITEMS_PER_PAGE);

        if(tableCount) tableCount.textContent = `${filteredData.length} transaksi ditemukan`;

        tbody.innerHTML = pageData.map(t => `
            <tr>
                <td>${VenturaData.formatDate(t.date)}</td>
                <td>${t.description}</td>
                <td><span class="badge ${t.type === 'pemasukan' ? 'badge-income' : 'badge-expense'}">${t.category}</span></td>
                <td><span class="badge ${t.type === 'pemasukan' ? 'badge-income' : 'badge-expense'}">${t.type === 'pemasukan' ? '↑ Masuk' : '↓ Keluar'}</span></td>
                <td class="${t.type === 'pemasukan' ? 'nominal-income' : 'nominal-expense'}">${t.type === 'pemasukan' ? '+' : '-'}${VenturaData.formatCurrency(t.nominal)}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn delete" title="Hapus" data-id="${t.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        renderPagination(totalPages);

        tbody.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                deleteTargetId = parseInt(btn.dataset.id);
                document.getElementById('deleteModal').style.display = 'flex';
            });
        });
    }

    function renderPagination(totalPages) {
        const pagination = document.getElementById('pagination');
        if(!pagination) return;
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '';
        html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">‹</button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += `<span class="page-btn" style="cursor:default">…</span>`;
            }
        }

        html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">›</button>`;

        pagination.innerHTML = html;

        pagination.querySelectorAll('.page-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (page >= 1 && page <= totalPages) {
                    currentPage = page;
                    renderTable();
                }
            });
        });
    }

    function debounce(fn, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    if(searchInput) searchInput.addEventListener('input', debounce(applyFilters, 300));
    if(filterTipe) filterTipe.addEventListener('change', applyFilters);
    if(filterKategori) filterKategori.addEventListener('change', applyFilters);
    if(filterDari) filterDari.addEventListener('change', applyFilters);
    if(filterSampai) filterSampai.addEventListener('change', applyFilters);

    if(btnResetFilter) {
        btnResetFilter.addEventListener('click', () => {
            searchInput.value = '';
            filterTipe.value = '';
            filterKategori.value = '';
            filterDari.value = '';
            filterSampai.value = '';
            applyFilters();
        });
    }

    const btnCancelDelete = document.getElementById('btnCancelDelete');
    if(btnCancelDelete) {
        btnCancelDelete.addEventListener('click', () => {
            document.getElementById('deleteModal').style.display = 'none';
            deleteTargetId = null;
        });
    }

    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    if(btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', () => {
            if (deleteTargetId) {
                VenturaData.deleteTransaction(deleteTargetId);
                document.getElementById('deleteModal').style.display = 'none';
                deleteTargetId = null;
                applyFilters();
            }
        });
    }

    const deleteModal = document.getElementById('deleteModal');
    if(deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.style.display = 'none';
                deleteTargetId = null;
            }
        });
    }

    applyFilters();
});
