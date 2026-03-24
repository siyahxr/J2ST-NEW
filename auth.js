// Auth Logic for j2st.lol (Local & Live Fallback)

const performLocalSuccess = (data, target) => {
    console.log("Simulating local success for:", target);
    localStorage.setItem("j2st_session_v2", JSON.stringify(data));
    setTimeout(() => {
        window.location.href = target;
    }, 500);
};

window.handleLogin = async function (e) {
    e.preventDefault();
    console.log("Login attempt...");
    const btn = document.getElementById("btn-login");
    const errBox = document.getElementById("login-error");
    const emailOrUser = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-pass").value;
    const turnstileResponse = typeof turnstile !== 'undefined' ? turnstile.getResponse() : null;

    if (!emailOrUser || !password) return;
    
    btn.disabled = true;
    btn.innerHTML = 'Bağlanıyor...';
    if (errBox) errBox.innerHTML = '';

    try {
        const res = await fetch("/api/auth/login", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ 
                emailOrUser, 
                password,
                'cf-turnstile-response': turnstileResponse
            }) 
        });
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem("j2st_session_v2", JSON.stringify(data.user || data));
            window.location.href = "dashboard.html";
        } else {
            errBox.innerText = data.error || "Giriş başarısız.";
            btn.disabled = false;
            btn.innerHTML = 'Giriş Yap →';
            if (typeof turnstile !== 'undefined') turnstile.reset();
        }
    } catch (err) {
        console.error("Sunucuya bağlanılamadı:", err);
        errBox.innerText = "Sunucu bağlantı hatası.";
        btn.disabled = false;
        btn.innerHTML = 'Giriş Yap →';
        if (typeof turnstile !== 'undefined') turnstile.reset();
    }
};

window.handleRegister = async function(e) {
    e.preventDefault();
    console.log("Register attempt...");
    const btn = document.getElementById("btn-register");
    const errBox = document.getElementById("register-error");
    const email = document.getElementById("reg-email").value.trim();
    const username = document.getElementById("reg-user").value.trim();
    const password = document.getElementById("reg-pass").value;
    const inviteKey = localStorage.getItem('j2st_used_key');
    const turnstileResponse = typeof turnstile !== 'undefined' ? turnstile.getResponse() : null;

    btn.disabled = true;
    btn.innerHTML = 'Kayıt Yapılıyor...';
    if (errBox) errBox.innerHTML = '';

    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 'N/A'
    ].join('|');

    try {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email, 
                username, 
                password, 
                fingerprint,
                key: inviteKey,
                'cf-turnstile-response': turnstileResponse
            })
        });
        const data = await res.json();
        
        if (res.ok) {
            // BAŞARILI KAYIT
            btn.innerHTML = '✓ Başarılı';
            btn.style.background = '#22c55e';
            btn.style.color = '#000';
            btn.style.boxShadow = '0 0 20px #22c55e';
            
            const successDiv = document.createElement('div');
            successDiv.style.background = 'rgba(34, 197, 94, 0.1)';
            successDiv.style.border = '1px solid #22c55e';
            successDiv.style.color = '#22c55e';
            successDiv.style.padding = '15px';
            successDiv.style.borderRadius = '12px';
            successDiv.style.marginTop = '20px';
            successDiv.style.fontSize = '14px';
            successDiv.style.fontWeight = '600';
            successDiv.innerHTML = '🎉 Kayıt başarılı!<br><br>Giriş yapabilmek için lütfen e-posta adresini (<b>' + email + '</b>) kontrol ederek hesabını onayla. Spam klasörünü kontrol etmeyi unutma!';
            
            btn.parentNode.insertBefore(successDiv, btn.nextSibling);
            
            // Reset fields
            document.getElementById("reg-email").value = '';
            document.getElementById("reg-user").value = '';
            document.getElementById("reg-pass").value = '';
        } else {
            errBox.innerText = data.error || "Kayıt başarısız.";
            btn.disabled = false;
            btn.innerHTML = 'Hesap Oluştur →';
            if (typeof turnstile !== 'undefined') turnstile.reset();
        }
    } catch (err) {
        console.error("Sunucu hatası:", err);
        errBox.innerText = "Sunucu bağlantı hatası.";
        btn.disabled = false;
        btn.innerHTML = 'Hesap Oluştur →';
        if (typeof turnstile !== 'undefined') turnstile.reset();
    }
};


window.togglePw = function(id, btn) {
    const input = document.getElementById(id);
    if (input.type === 'password') {
        input.type = 'text';
        btn.innerText = '🔒';
    } else {
        input.type = 'password';
        btn.innerText = '👁';
    }
};

// Auto-Login: Redirect to dashboard if session already exists
(function checkAutoLogin() {
    const session = localStorage.getItem("j2st_session_v2");
    if (session) {
        try {
            const data = JSON.parse(session);
            if (data && (data.username || data.email)) {
                console.log("Active session found. Redirecting to dashboard...");
                // Only redirect if we are on landing, login or register pages
                const p = window.location.pathname.toLowerCase();
                const isHome = p === '/' || p === '/index.html' || p === '/index';
                const isAuth = p.includes('login') || p.includes('register');
                
                if (isHome || isAuth) {
                    window.location.href = "dashboard.html";
                }
            }
        } catch(e) {
            console.warn("Invalid session data. Clearing...");
            localStorage.removeItem("j2st_session_v2");
        }
    }
})();

console.log("Auth module loaded successfully.");
