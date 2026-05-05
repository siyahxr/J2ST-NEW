document.addEventListener('DOMContentLoaded', () => {
    // --- Scroll Reveal Logic ---
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });
    reveals.forEach(el => revealObserver.observe(el));

    // --- Modal Mouse Tracking ---
    document.addEventListener('mousemove', e => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        document.documentElement.style.setProperty('--mouse-x', `${x}%`);
        document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    });

    // --- Modal System ---
    const authModal = document.getElementById('auth-modal');
    const legalModal = document.getElementById('legal-modal');

    function openAuth(tab = 'signup') {
        if (!authModal) return;
        authModal.classList.add('active');
        switchAuthTab(tab);
    }

    function switchAuthTab(tabId) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-view').forEach(v => v.classList.remove('active'));
        const targetTab = document.querySelector(`.auth-tab[data-tab="${tabId}"]`);
        const targetView = document.getElementById(`${tabId}-view`);
        if (targetTab) targetTab.classList.add('active');
        if (targetView) targetView.classList.add('active');
    }

    const currentUser = localStorage.getItem('j2st_currentUser');

    // Auto-open modal based on path (Yönlendirmeyi kaldırdık)
    if (window.location.pathname === '/login') setTimeout(() => openAuth('login'), 100);
    if (window.location.pathname === '/signup') setTimeout(() => openAuth('signup'), 100);

    document.querySelectorAll('[data-auth]').forEach(btn => {
        if (currentUser) {
            if (btn.dataset.auth === 'login') {
                btn.innerText = 'Dashboard';
                btn.onclick = () => window.location.href = '/dashboard';
                return;
            } else if (btn.dataset.auth === 'signup') {
                btn.innerText = 'My Profile';
                btn.onclick = () => window.location.href = `/${currentUser}`;
                return;
            }
        }
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openAuth(btn.dataset.auth);
        });
    });

    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
        }
    });

    // --- Background Particles ---
    const canvas = document.getElementById('bg-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let pts = [];
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize); resize();
        for(let i=0; i<60; i++) pts.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, s: Math.random() * 2, a: Math.random() * 0.5 + 0.1 });
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pts.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if(p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) { p.x = Math.random() * canvas.width; p.y = Math.random() * canvas.height; }
                ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${p.a})`; ctx.fill();
            });
            requestAnimationFrame(animate);
        }
        animate();
    }

    // --- Legal Modal Logic ---
    const legalContentMap = {
        terms: { 
            title: 'Terms of Service', 
            body: `
                <h4>1. Acceptance of Terms</h4>
                <p>By accessing and using J2ST (the "Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
                <h4>2. User Accounts</h4>
                <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
                <h4>3. Content Ownership</h4>
                <p>You retain all rights to the content you post on J2ST. However, by posting content, you grant J2ST a non-exclusive, worldwide license to display and distribute it.</p>
                <h4>4. Prohibited Conduct</h4>
                <p>You agree not to use the Service for any unlawful purposes, including but not limited to harassment, impersonation, or distributing malware.</p>
                <h4>5. Termination</h4>
                <p>We reserve the right to suspend or terminate your account at any time for violations of these terms.</p>
                <h4>6. Changes to Terms</h4>
                <p>We may update these terms from time to time. Continued use of the service constitutes acceptance of the new terms.</p>
            ` 
        },
        privacy: { 
            title: 'Privacy Policy', 
            body: `
                <h4>1. Information We Collect</h4>
                <p>We collect information you provide directly to us, such as your username, email address, and social media links.</p>
                <h4>2. How We Use Information</h4>
                <p>We use your information to provide, maintain, and improve our services, and to communicate with you about your account.</p>
                <h4>3. Data Sharing</h4>
                <p>We do not sell your personal data to third parties. We may share data with service providers who assist in our operations.</p>
                <h4>4. Security</h4>
                <p>We implement reasonable security measures to protect your data, but no system is 100% secure.</p>
                <h4>5. Your Choices</h4>
                <p>You can update or delete your account information at any time through your dashboard settings.</p>
                <h4>6. Contact Us</h4>
                <p>If you have any questions about this Privacy Policy, please contact our support team.</p>
            ` 
        }
    };

    document.querySelectorAll('[data-legal]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const key = el.dataset.legal;
            const data = legalContentMap[key];
            if (data && legalModal) {
                const titleEl = document.getElementById('legal-title');
                const contentEl = document.getElementById('legal-content');
                if (titleEl) titleEl.innerText = data.title;
                if (contentEl) contentEl.innerHTML = data.body;
                legalModal.classList.add('active');
                legalModal.style.display = 'flex';
                legalModal.style.opacity = '1';
            }
        });
    });

    // --- Username Claim ---
    const claimBtn = document.getElementById('claim-btn');
    const usernameInput = document.getElementById('username-input');
    if (claimBtn && usernameInput) {
        claimBtn.addEventListener('click', () => {
            const val = usernameInput.value.trim();
            if (val.length > 2) {
                openAuth('signup');
                const modalUser = document.getElementById('modal-username-input');
                if (modalUser) modalUser.value = val;
            }
        });
    }

    // --- Mock Authentication Logic ---
    function setupAuthButton(selector, type) {
        const btns = document.querySelectorAll(selector);
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const originalText = btn.innerText;
                btn.innerText = 'Connecting...';
                btn.style.opacity = '0.7';
                btn.style.pointerEvents = 'none';
                
                setTimeout(() => {
                    let username = 'demo_user';
                    if (type === 'signup') {
                        const input = document.getElementById('modal-username-input');
                        if (input && input.value.trim() !== '') {
                            username = input.value.trim();
                        }
                    } else if (type === 'login') {
                        const emailInput = document.querySelector('#login-view input[type="email"]');
                        if (emailInput && emailInput.value.trim() !== '') {
                            username = emailInput.value.trim().split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
                        }
                    }
                    localStorage.setItem('j2st_currentUser', username);
                    window.location.href = '/dashboard';
                }, 800);
            });
        });
    }

    setupAuthButton('#login-view .btn-primary', 'login');
    setupAuthButton('#signup-view .btn-primary', 'signup');
    setupAuthButton('.btn-social', 'social');
    
    // --- Google Identity Logic ---
    window.handleGoogleResponse = (response) => {
        try {
            // Safer JWT Decoding
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            const payload = JSON.parse(jsonPayload);
            
            console.log('Google User:', payload);
            const username = payload.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
            localStorage.setItem('j2st_currentUser', username);
            
            const modalBox = document.querySelector('.modal-box');
            if (modalBox) {
                modalBox.innerHTML = `
                    <div style="padding:40px; text-align:center;">
                        <div class="success-icon" style="font-size:40px; margin-bottom:15px;">✅</div>
                        <h2 style="margin-bottom:10px;">Welcome, ${payload.given_name || payload.name}!</h2>
                        <p style="opacity:0.6;">Redirecting to dashboard...</p>
                    </div>
                `;
            }
            setTimeout(() => window.location.href = '/dashboard', 1200);
        } catch (err) {
            console.error('Google Auth Error:', err);
        }
    };

    function initGoogle() {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: "88039540835-0cjbl0al9chadov9qidjd2c3l9v70ar3.apps.googleusercontent.com",
                callback: handleGoogleResponse
            });

            const btnOptions = { 
                theme: "filled_black", 
                size: "large", 
                width: "320", 
                text: "continue_with", 
                shape: "pill",
                logo_alignment: "center" 
            };
            
            const loginContainer = document.getElementById('google-login-btn');
            const signupContainer = document.getElementById('google-signup-btn');
            
            if (loginContainer) google.accounts.id.renderButton(loginContainer, btnOptions);
            if (signupContainer) google.accounts.id.renderButton(signupContainer, btnOptions);
            
            // Also enable One Tap (Optional)
            google.accounts.id.prompt();
        } else {
            setTimeout(initGoogle, 100); // Retry if not loaded yet
        }
    }

    initGoogle();
});
