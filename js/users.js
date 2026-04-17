/* ========================================
   VenturaFin - Users Management Page Logic
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const user = VenturaAuth.requireAdmin();
    if (!user) return;

    let editingUserId = null;

    renderUsersTable();

    const btnAddUser = document.getElementById('btnAddUser');
    if(btnAddUser) btnAddUser.addEventListener('click', () => openUserModal());
    
    const btnCloseUserModal = document.getElementById('btnCloseUserModal');
    if(btnCloseUserModal) btnCloseUserModal.addEventListener('click', closeUserModal);
    
    const btnCancelUser = document.getElementById('btnCancelUser');
    if(btnCancelUser) btnCancelUser.addEventListener('click', closeUserModal);
    
    const userForm = document.getElementById('userForm');
    if(userForm) userForm.addEventListener('submit', saveUser);

    const userModal = document.getElementById('userModal');
    if(userModal) {
        userModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeUserModal();
        });
    }

    function renderUsersTable() {
        const users = VenturaData.getUsers();
        const tbody = document.getElementById('usersBody');
        if (!tbody) return;

        tbody.innerHTML = users.map(u => `
            <tr>
                <td>
                    <div class="user-row-avatar">
                        <div class="user-mini-avatar ${u.role === 'admin' ? 'admin-avatar' : ''}">
                            <span>${VenturaData.getInitials(u.name)}</span>
                        </div>
                        <span>${u.name}</span>
                    </div>
                </td>
                <td>${u.email}</td>
                <td><span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}">${u.role === 'admin' ? 'Admin' : 'User'}</span></td>
                <td>
                    <span class="status-toggle ${u.status}">
                        <span class="status-dot"></span>
                        ${u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                </td>
                <td>${VenturaData.formatDateTime(u.lastLogin)}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn" title="Edit" onclick="editUser(${u.id})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function openUserModal(userId) {
        editingUserId = userId || null;
        const modal = document.getElementById('userModal');
        const title = document.getElementById('userModalTitle');
        const form = document.getElementById('userForm');
        const passGroup = document.getElementById('passwordGroup');

        form.reset();

        if (editingUserId) {
            title.textContent = 'Edit User';
            const u = VenturaData.getUserById(editingUserId);
            if (u) {
                document.getElementById('userName').value = u.name;
                document.getElementById('userEmail').value = u.email;
                document.getElementById('userRole').value = u.role;
                document.getElementById('userStatus').value = u.status;
            }
            passGroup.querySelector('label').textContent = 'Password Baru (kosongkan jika tidak diubah)';
            document.getElementById('userPassword').required = false;
        } else {
            title.textContent = 'Tambah User Baru';
            passGroup.querySelector('label').textContent = 'Password';
            document.getElementById('userPassword').required = true;
        }

        modal.style.display = 'flex';
    }

    window.editUser = function(id) {
        openUserModal(id);
    };

    function closeUserModal() {
        document.getElementById('userModal').style.display = 'none';
        editingUserId = null;
    }

    function saveUser(e) {
        e.preventDefault();
        const name = document.getElementById('userName').value.trim();
        const email = document.getElementById('userEmail').value.trim();
        const role = document.getElementById('userRole').value;
        const status = document.getElementById('userStatus').value;
        const password = document.getElementById('userPassword').value;

        if (!name || !email) return;

        if (editingUserId) {
            const updateData = { name, email, role, status };
            if (password) updateData.password = password;
            VenturaData.updateUser(editingUserId, updateData);
        } else {
            if (!password || password.length < 6) {
                alert('Password minimal 6 karakter');
                return;
            }
            VenturaData.addUser({ name, email, role, status, password });
        }

        closeUserModal();
        renderUsersTable();
    }
});
