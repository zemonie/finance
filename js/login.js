/* 
   ==========================================================================
   VenturaFin - Login Logic (AUTHENTICATION UI LAYER)
   File ini menangani proses interaksi pada halaman login (form login).
   ==========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cek Apakah User Sudah Login (Session Check)
    const session = VenturaData.getSession();
    if (session) {
        window.location.href = 'dashboard.html'; // Langsung masuk ke dashboard if session exists
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const loginError = document.getElementById('loginError');
    const loginErrorText = document.getElementById('loginErrorText');
    const btnLogin = document.getElementById('btnLogin');
    const demoAccounts = document.querySelectorAll('.demo-account');

    // 2. Fitur Toggle Password (UI Helper)
    const toggleBtn = document.getElementById('togglePassword');
    const eyeOpen = toggleBtn.querySelector('.eye-open');
    const eyeClosed = toggleBtn.querySelector('.eye-closed');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            
            // Ubah icon mata secara eksplisit
            if (isPassword) {
                eyeOpen.style.display = 'none';
                eyeClosed.style.display = 'block';
            } else {
                eyeOpen.style.display = 'block';
                eyeClosed.style.display = 'none';
            }
        });
    }

    // 3. Proses Pengiriman Form Login (Event Handler Login)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showError('Silakan isi email dan password');
            return;
        }

        const loader = btnLogin.querySelector('.btn-loader');
        const btnText = btnLogin.querySelector('.btn-text');
        
        btnText.style.display = 'none';
        loader.style.display = 'flex';
        btnLogin.disabled = true;

        setTimeout(() => {
            try {
                const result = VenturaAuth.login(email, password);

                if (result.success) {
                    btnLogin.style.background = '#22C55E';
                    loader.style.display = 'none';
                    btnText.textContent = '✓ Berhasil';
                    btnText.style.display = 'block';
                    setTimeout(() => { window.location.href = 'dashboard.html'; }, 500);
                } else {
                    showError(result.message);
                    resetButton();
                }
            } catch (err) {
                console.error('Login Error:', err);
                showError('Terjadi kesalahan sistem. Silakan muat ulang.');
                resetButton();
            }
        }, 600);

        function resetButton() {
            btnText.style.display = 'block';
            btnText.textContent = 'Masuk';
            loader.style.display = 'none';
            btnLogin.disabled = false;
            btnLogin.style.background = '';
        }
    });

    // --- Fungsi Helper: Tampilkan Pesan Error (Feedback UI Interaction) ---
    function showError(msg) {
        loginErrorText.textContent = msg;
        loginError.style.display = 'flex';
        loginError.style.animation = 'slideUp 0.3s ease';
    }
});
