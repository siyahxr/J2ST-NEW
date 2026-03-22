require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json({ limit: '50mb' }));

// Multer (Dosya Yükleme) Ayarları
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Statik dosyalar
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Geçici Veritabanı Dosyası (Gerçek bir veritabanı kurulana kadar JSON ile çalışacak)
const DB_FILE = path.join(__dirname, 'users.db.json');
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}
const getUsers = () => JSON.parse(fs.readFileSync(DB_FILE));
const saveUsers = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// E-posta Gönderici (SMTP) Tanımlaması
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.resend.com',
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER || 'resend',
        pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY || 're_MnEPtdJ3_MHy7Wx3L36vnC8p4GCqfGnqK'
    }
});

// INVITE SYSTEM (PRE-ACCESS GATE)
const KEYS_FILE = path.join(__dirname, 'keys.db.json');
const getKeys = () => {
    if (!fs.existsSync(KEYS_FILE)) fs.writeFileSync(KEYS_FILE, '[]');
    return JSON.parse(fs.readFileSync(KEYS_FILE));
};

const STATIC_KEYS = ['J2ST-ACCESS-2026', 'SIYAH-PRIVATE', 'OP-GATE-99', 'ELITE-VOID'];

app.post('/api/verify-invite', (req, res) => {
    const { key } = req.body;
    const inputKey = key.toUpperCase();
    
    // Check static keys
    if (STATIC_KEYS.includes(inputKey)) {
        return res.json({ success: true, key: inputKey });
    }

    // Check dynamic keys
    const keys = getKeys();
    const found = keys.find(k => k.value === inputKey && !k.used);
    
    if (found) {
        // Mark key as used (optional, user might want multi-use)
        // found.used = true;
        // fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
        return res.json({ success: true, key: inputKey });
    }

    res.status(401).json({ success: false, error: "Invalid invite signature." });
});

// Basit Şifreleme (Şifreleri olduğu gibi kaydetmemek için)
const hashPass = (p) => crypto.createHash('sha256').update(p).digest('hex');

// 1. KAYIT İŞLEMİ (E-posta doğrulama tokeni üretir ve mail atar)
app.post('/api/auth/register', async (req, res) => {
    const { email, username, password } = req.body;
    let users = getUsers();
    
    // Kullanıcı adı veya e-posta zaten var mı kontrol et
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ error: "Bu kullanıcı adı veya e-posta zaten kullanımda." });
    }

    const verifyToken = uuidv4();
    const newUser = {
        id: uuidv4(),
        email,
        username,
        password: hashPass(password),
        is_verified: false, // ONAYLANMADI OLARAK DOĞUYOR
        verifyToken,
        created_at: Date.now()
    };
    
    users.push(newUser);
    saveUsers(users);

    // Doğrulama Mailini Gönder
    const verifyLink = `https://j2st.lol/verify.html?token=${verifyToken}`;
    const mailOptions = {
        from: '"j2st.lol Account Verification" <verified@j2st.lol>', 
        to: email, 
        subject: 'Verify your j2st.lol account',
        html: `
            <div style="background-color: #050505; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <div style="background-color: #0a0a0a; width: 100%; max-width: 500px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 40px; text-align: left; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
                    <!-- Title & Header -->
                    <h2 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 10px 0; letter-spacing: -0.5px;">Welcome to j2st.lol, ${username}</h2>
                    <p style="color: #bbbbbb; font-size: 16px; margin: 0 0 15px 0;">Confirm your email to activate your account.</p>
                    <p style="color: #777777; font-size: 14px; margin: 0 0 35px 0;">This link expires in 30 minutes.</p>
                    
                    <!-- Verify Button -->
                    <div style="text-align: center; margin-bottom: 35px;">
                        <a href="${verifyLink}" style="background-color: #ffffff; color: #000000; padding: 12px 30px; text-decoration: none; font-size: 15px; font-weight: 800; border-radius: 9999px; display: inline-block; box-shadow: 0 0 15px rgba(255,255,255,0.2);">Verify account</a>
                    </div>
                    
                    <!-- Fallback Link -->
                    <p style="color: #777777; font-size: 13px; margin: 0 0 5px 0;">Or copy and paste this link:</p>
                    <p style="margin: 0 0 40px 0; word-break: break-all;">
                        <a href="${verifyLink}" style="color: #60a5fa; font-size: 13px; text-decoration: none;">${verifyLink}</a>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.05); margin: 0 0 20px 0;" />
                    
                    <!-- Footer Info -->
                    <p style="color: #555555; font-size: 12px; margin: 0 0 5px 0;">If you didn't create this account, you can ignore this email.</p>
                    <p style="color: #555555; font-size: 12px; margin: 0;">Need help? <a href="mailto:support@j2st.lol" style="color: #555555; text-decoration: underline;">support@j2st.lol</a></p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Doğrulama maili gönderildi. Lütfen e-posta kutunu (ve spam klasörünü) kontrol et." });
    } catch (err) {
        console.error("Mail gönderme hatası:", err);
        // Mail gönderilmese bile kullanıcı kaydedildi ama onay şansı yok. (Gerçek projede silinebilir)
        res.status(500).json({ error: "Doğrulama e-postası gönderilemedi. Lütfen sistem yöneticisiyle iletişime geçin." });
    }
});

// 2. GİRİŞ İŞLEMİ (Onaylanmayanları geri çevirir)
app.post('/api/auth/login', (req, res) => {
    const { emailOrUser, password } = req.body;
    const users = getUsers();
    const hp = hashPass(password);
    
    const u = users.find(u => 
        (u.username.toLowerCase() === emailOrUser.toLowerCase() || u.email.toLowerCase() === emailOrUser.toLowerCase()) 
        && u.password === hp
    );
    
    if (!u) return res.status(400).json({ error: "Yanlış giriş bilgileri." });
    if (!u.is_verified) return res.status(403).json({ error: "Hesabın doğrulanmamış. Lütfen e-postanı kontrol ederek hesabını onayla." });

    res.json({ user: { username: u.username, email: u.email, role: 'user' } });
});

// 3. DOĞRULAMA (LINK TIKLANDIĞINDA ÇALIŞIR)
app.post('/api/auth/verify', (req, res) => {
    const { token } = req.body;
    let users = getUsers();
    let u = users.find(x => x.verifyToken === token);
    
    if (!u) return res.status(400).json({ error: "Geçersiz veya süresi dolmuş doğrulama linki." });
    if (u.is_verified) return res.json({ success: true, message: "Hesabın zaten doğrulanmış!" });

    // Onayla ve token'i sıfırla
    u.is_verified = true;
    u.verifyToken = null; 
    saveUsers(users);

    res.json({ success: true, message: "Elit kimliğin doğrulandı! Artık giriş yapabilirsin." });
});

// ==========================================
// DİNAMİK PROFİL VE API BÖLÜMÜ
// ==========================================

// 4. KULLANICI AYARLARINI KAYDETME (DASHBOARD)
app.post('/api/user/settings', (req, res) => {
    // Gerçekte burada Authentication token kontrolü yapılır
    const { username, settings } = req.body;
    let users = getUsers();
    let u = users.find(x => x.username.toLowerCase() === username.toLowerCase());
    
    if (!u) return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    
    u.profileSettings = settings;
    saveUsers(users);
    
    res.json({ success: true, message: "Ayarlar başarıyla sunucuya kaydedildi." });
});

// 5. MESAJ GÖNDERME (CHAT SİSTEMİ)
app.post('/api/user/messages/send', (req, res) => {
    const { from, to, text } = req.body;
    let users = getUsers();
    
    // Alıcıyı bul
    let recipient = users.find(x => x.username.toLowerCase() === to.toLowerCase());
    let sender = users.find(x => x.username.toLowerCase() === from.toLowerCase());
    
    if (!recipient) return res.status(404).json({ error: "Alıcı bulunamadı." });
    
    const newMessage = {
        from,
        to,
        text,
        time: Date.now(),
        id: uuidv4()
    };
    
    // Alıcının mesaj kutusuna ekle
    if (!recipient.profileSettings) recipient.profileSettings = {};
    if (!recipient.profileSettings.messages) recipient.profileSettings.messages = [];
    recipient.profileSettings.messages.push(newMessage);
    
    // Gönderenin mesaj kutusuna da ekle (senkron kalsın diye)
    if (sender) {
        if (!sender.profileSettings) sender.profileSettings = {};
        if (!sender.profileSettings.messages) sender.profileSettings.messages = [];
        sender.profileSettings.messages.push(newMessage);
    }
    
    saveUsers(users);
    res.json({ success: true, message: "Mesaj iletildi." });
});

// 6. DOSYA YÜKLEME (AVATAR & ARKA PLAN)
app.post('/api/user/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Lütfen bir dosya seçin." });
    }
    // Yüklenen dosyanın dışarıdan erişilebilecek URL'sini oluştur
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, url: fileUrl });
});

// 6. PROFİL BİLGİLERİNİ ÇEKME (API)
app.get('/api/user/:username', (req, res) => {
    let users = getUsers();
    let u = users.find(x => x.username.toLowerCase() === req.params.username.toLowerCase());
    
    if (!u || !u.is_verified) return res.status(404).json({ error: "Böyle bir profil bulunamadı veya henüz onaylanmadı." });
    
    // Yalnızca public profili gönder, şifreleri filan gizle
    res.json({ success: true, profile: u.profileSettings || {} });
});

// 7. DİNAMİK PROFİL SAYFASI YÖNLENDİRİCİSİ (j2st.lol/username)
app.get('/:username', (req, res) => {
    // Özel klasörleri dosyaları bypass et
    const ignored = ['api', 'uploads', 'css', 'assest'];
    if (ignored.includes(req.params.username.toLowerCase()) || req.params.username.includes('.')) {
        return res.status(404).end();
    }
    
    let users = getUsers();
    let u = users.find(x => x.username.toLowerCase() === req.params.username.toLowerCase());
    
    if (u && u.is_verified) {
        // Eğer kullanıcı varsa profile.html dosyasını gönder. 
        // Oradaki JavaScript URL'i okuyup backendden datayı çekecek.
        res.sendFile(path.join(__dirname, 'profile.html'));
    } else {
        res.status(404).send("<h1>404 - Profil Bulunamadı</h1><p>Böyle bir kullanıcı yok veya hesabı onaylanmamış.</p>");
    }
});

const PORT = 5500;
app.listen(PORT, () => {
    console.log(`\n🚀 J2ST Backend Başlatıldı!`);
    console.log(`Port: http://localhost:${PORT}`);
    console.log(`Gerçekten e-posta atabilmek için klasörde bulunan .env dosyasındaki SMTP_PASS şifreni doldurmayı unutma!\n`);
});
