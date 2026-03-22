const i18n = {
    "tr": {
        "nav_home": "Ana Sayfa",
        "nav_features": "Özellikler",
        "nav_login": "Giriş Yap",
        "nav_register": "Kayıt Ol",
        "nav_dashboard": "Panel",
        "nav_admin": "Admin",
        "home_hero_title": "Dijital Kimliğin, Mükemmelleşti.",
        "home_hero_sub": "Her şeyi sergileyen şık bir sayfa — bağlantıların, sesin, rozetlerin ve kişiliğin. Öne çıkmak isteyen oyuncular için tasarlandı.",
        "home_cta": "Şimdi başla. Ücretsiz.",
        "loading_essence": "ESANS SENKRONİZE EDİLİYOR..."
    },
    "en": {
        "nav_home": "Home",
        "nav_features": "Features",
        "nav_login": "Login",
        "nav_register": "Register",
        "nav_dashboard": "Dashboard",
        "nav_admin": "Admin",
        "home_hero_title": "Your Digital Identity, Perfected.",
        "home_hero_sub": "One sleek page to showcase everything — your links, sound, badges, and personality. Built for gamers who want to stand out.",
        "home_cta": "Start now. It's free.",
        "loading_essence": "SYNCHRONIZING ESSENCE..."
    }
};

window.getTranslation = (key, lang = 'tr') => {
    return i18n[lang][key] || key;
};

// Auto loader for some routes (simulated)
if (window.location.pathname === '/admin' || window.location.pathname === '/dashboard') {
    console.log("Checking session via i18n.js...");
}
