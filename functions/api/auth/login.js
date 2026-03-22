export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const emailOrUser = body.emailOrUser || body.email;
    const password = body.password;

    if (!env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "KV DB not configured." }), { status: 500 });
    }

    // Email or Username login
    let username = emailOrUser.toLowerCase();
    const isEmail = emailOrUser.includes('@');
    if (isEmail) {
        const foundUsername = await env.J2ST_DB.get(`email:${emailOrUser.toLowerCase()}`);
        if (!foundUsername) return new Response(JSON.stringify({ error: "Invalid credentials." }), { status: 401 });
        username = foundUsername;
    }

    const rawUser = await env.J2ST_DB.get(`user:${username}`);
    if (!rawUser) return new Response(JSON.stringify({ error: "Invalid credentials." }), { status: 401 });

    const user = JSON.parse(rawUser);

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

