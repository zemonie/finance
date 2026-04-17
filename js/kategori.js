/* ========================================
   VenturaFin - Kategori Page Logic
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const user = VenturaAuth.requireAuth();
    if (!user) return;

    let editKatId = null;
    let editKatType = '';
    let deleteKatId = null;
    let deleteKatType = '';

    renderCategories();

    const btnAddKatPemasukan = document.getElementById('btnAddKatPemasukan');
    if(btnAddKatPemasukan) {
        btnAddKatPemasukan.addEventListener('click', () => {
            openKatModal('pemasukan');
        });
    }
    const btnAddKatPengeluaran = document.getElementById('btnAddKatPengeluaran');
    if(btnAddKatPengeluaran) {
        btnAddKatPengeluaran.addEventListener('click', () => {
            openKatModal('pengeluaran');
        });
    }

    const btnCloseKategoriModal = document.getElementById('btnCloseKategoriModal');
    if(btnCloseKategoriModal) btnCloseKategoriModal.addEventListener('click', closeKatModal);
    
    const btnCancelKategori = document.getElementById('btnCancelKategori');
    if(btnCancelKategori) btnCancelKategori.addEventListener('click', closeKatModal);
    
    const kategoriForm = document.getElementById('kategoriForm');
    if(kategoriForm) kategoriForm.addEventListener('submit', saveKategori);
    
    const kategoriModal = document.getElementById('kategoriModal');
    if(kategoriModal) {
        kategoriModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeKatModal();
        });
    }

    const btnCancelDeleteKat = document.getElementById('btnCancelDeleteKat');
    if(btnCancelDeleteKat) {
        btnCancelDeleteKat.addEventListener('click', () => {
            document.getElementById('deleteKatModal').style.display = 'none';
        });
    }
    
    const btnConfirmDeleteKat = document.getElementById('btnConfirmDeleteKat');
    if(btnConfirmDeleteKat) btnConfirmDeleteKat.addEventListener('click', confirmDeleteKat);
    
    const deleteKatModal = document.getElementById('deleteKatModal');
    if(deleteKatModal) {
        deleteKatModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
        });
    }

    function renderCategories() {
        const cats = VenturaData.getCategories();
        renderList('listKatPemasukan', cats.pemasukan, 'pemasukan');
        renderList('listKatPengeluaran', cats.pengeluaran, 'pengeluaran');
    }

    function renderList(containerId, list, type) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (list.length === 0) {
            container.innerHTML = '<div class="kategori-empty">Belum ada kategori</div>';
            return;
        }

        container.innerHTML = list.map(c => `
            <div class="kategori-item ${type}">
                <span class="kategori-item-name">${c.name}</span>
                <div class="kategori-item-actions">
                    <button class="kat-action-btn" title="Edit" onclick="window.editKat('${type}',${c.id},'${c.name.replace(/'/g, "\\'")}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="kat-action-btn delete" title="Hapus" onclick="window.deleteKat('${type}',${c.id})">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    function openKatModal(type, id, name) {
        editKatId = id || null;
        editKatType = type;
        document.getElementById('editKategoriType').value = type;
        document.getElementById('editKategoriId').value = id || '';
        document.getElementById('kategoriName').value = name || '';
        document.getElementById('kategoriModalTitle').textContent = id ? 'Edit Kategori' : 'Tambah Kategori ' + (type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran');
        document.getElementById('kategoriModal').style.display = 'flex';
    }

    function closeKatModal() {
        document.getElementById('kategoriModal').style.display = 'none';
        editKatId = null;
    }

    function saveKategori(e) {
        e.preventDefault();
        const name = document.getElementById('kategoriName').value.trim();
        const type = document.getElementById('editKategoriType').value;
        if (!name) return;

        if (editKatId) {
            VenturaData.updateCategory(type, editKatId, name);
        } else {
            VenturaData.addCategory(type, name);
        }

        closeKatModal();
        renderCategories();
        if(typeof showToast === 'function') showToast('kategoriToast', editKatId ? 'Kategori diperbarui!' : 'Kategori ditambahkan!');
    }

    function confirmDeleteKat() {
        if (deleteKatId && deleteKatType) {
            VenturaData.deleteCategory(deleteKatType, deleteKatId);
            renderCategories();
            if(typeof showToast === 'function') showToast('kategoriToast', 'Kategori dihapus');
        }
        document.getElementById('deleteKatModal').style.display = 'none';
        deleteKatId = null;
    }

    window.editKat = function(type, id, name) {
        openKatModal(type, id, name);
    };
    window.deleteKat = function(type, id) {
        deleteKatId = id;
        deleteKatType = type;
        document.getElementById('deleteKatModal').style.display = 'flex';
    };
});
