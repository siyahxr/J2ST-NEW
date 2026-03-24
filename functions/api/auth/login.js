export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const emailOrUser = body.emailOrUser || body.email;
    const password = body.password;
    const turnstileToken = body['cf-turnstile-response'];

    if (!env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "KV DB not configured." }), { status: 500 });
    }

    // --- CAPTCHA VALIDATION ---
    if (env.TURNSTILE_SECRET_KEY) {
        if (!turnstileToken) {
            return new Response(JSON.stringify({ error: "Security check failed. Please complete the captcha." }), { status: 400 });
        }

        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${encodeURIComponent(env.TURNSTILE_SECRET_KEY)}&response=${encodeURIComponent(turnstileToken)}&remoteip=${encodeURIComponent(request.headers.get("CF-Connecting-IP") || "0.0.0.0")}`
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
            return new Response(JSON.stringify({ error: "Security verification failed. Try again." }), { status: 400 });
        }
    }

    // Email or Username login
    let username = (emailOrUser || "").toLowerCase();
    const isEmail = username.includes('@');
    if (isEmail) {
        const foundUsername = await env.J2ST_DB.get(`email:${username}`);
        if (!foundUsername) return new Response(JSON.stringify({ error: "Invalid credentials." }), { status: 401 });
        username = foundUsername;
    }

    const rawUser = await env.J2ST_DB.get(`user:${username}`);
    if (!rawUser) return new Response(JSON.stringify({ error: "Invalid credentials." }), { status: 401 });

    const user = JSON.parse(rawUser);

    if (user.is_banned) {
        return new Response(JSON.stringify({ error: "Your access is suspended. Breach sequence denied." }), { status: 403 });
    }

    if (user.verified === false) {
        return new Response(JSON.stringify({ error: "Lütfen e-posta adresinizi onaylayın." }), { status: 403 });
    }

    // Hash input password
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (user.password !== hashedPassword) {
        return new Response(JSON.stringify({ error: "Invalid password." }), { status: 401 });
    }

    // Success
    const token = crypto.randomUUID();
    await env.J2ST_DB.put(`session:${token}`, username, { expirationTtl: 86400 });

    const role = (user.username.toLowerCase() === 'siyah' || user.username === '$') ? 'admin' : 'user';
    return new Response(JSON.stringify({ 
        success: true, 
        token, 
        user: { username: user.username, email: user.email, role: role } 
    }), { headers: { 'Content-Type': 'application/json' } });
}


