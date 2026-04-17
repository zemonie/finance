/* ========================================
   VenturaFin - Profil Page Logic
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const user = VenturaAuth.requireAuth();
    if (!user) return;

    const freshUser = VenturaAuth.getCurrentUser();
    loadProfileData(freshUser);

    const profilForm = document.getElementById('profilForm');
    if(profilForm) {
        profilForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('profilNama').value.trim();
            const email = document.getElementById('profilEmail').value.trim();
            if (!name || !email) return;

            VenturaData.updateUser(freshUser.id, { name, email });
            VenturaData.setSession({ ...freshUser, name, email });
            loadProfileData({ ...freshUser, name, email });
            if(typeof showToast === 'function') showToast('profilToast', 'Profil berhasil diperbarui!');
        });
    }

    const passwordForm = document.getElementById('passwordForm');
    if(passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const current = document.getElementById('currentPassword').value;
            const newPass = document.getElementById('newPassword').value;
            const confirm = document.getElementById('confirmPassword').value;

            const latest = VenturaData.getUserById(freshUser.id);
            if (current !== latest.password) {
                alert('Password saat ini salah');
                return;
            }
            if (newPass.length < 6) {
                alert('Password baru minimal 6 karakter');
                return;
            }
            if (newPass !== confirm) {
                alert('Konfirmasi password tidak cocok');
                return;
            }

            VenturaData.updateUser(freshUser.id, { password: newPass });
            document.getElementById('passwordForm').reset();
            if(typeof showToast === 'function') showToast('profilToast', 'Password berhasil diubah!');
        });
    }

    const photoUpload = document.getElementById('photoUpload');
    if(photoUpload) {
        photoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const photoData = ev.target.result;
                VenturaData.updateUser(freshUser.id, { photo: photoData });
                loadProfileData({ ...freshUser, photo: photoData });
                if(typeof showToast === 'function') showToast('profilToast', 'Foto profil diperbarui!');
            };
            reader.readAsDataURL(file);
        });
    }

    const btnRemovePhoto = document.getElementById('btnRemovePhoto');
    if(btnRemovePhoto) {
        btnRemovePhoto.addEventListener('click', () => {
            VenturaData.updateUser(freshUser.id, { photo: '' });
            loadProfileData({ ...freshUser, photo: '' });
            if(typeof showToast === 'function') showToast('profilToast', 'Foto profil dihapus');
        });
    }

    function loadProfileData(u) {
        if(document.getElementById('profilNama')) document.getElementById('profilNama').value = u.name;
        if(document.getElementById('profilEmail')) document.getElementById('profilEmail').value = u.email;
        if(document.getElementById('profileNameDisplay')) document.getElementById('profileNameDisplay').textContent = u.name;
        if(document.getElementById('profileEmailDisplay')) document.getElementById('profileEmailDisplay').textContent = u.email;
        if(document.getElementById('profileRoleDisplay')) document.getElementById('profileRoleDisplay').textContent = u.role === 'admin' ? 'Admin' : 'User';
        if(document.getElementById('photoInitials')) document.getElementById('photoInitials').textContent = VenturaData.getInitials(u.name);

        const img = document.getElementById('profileImage');
        const initials = document.getElementById('photoInitials');
        if (img && initials) {
            if (u.photo) {
                img.src = u.photo;
                img.style.display = 'block';
                initials.style.display = 'none';
            } else {
                img.style.display = 'none';
                initials.style.display = 'block';
            }
        }
    }
});
