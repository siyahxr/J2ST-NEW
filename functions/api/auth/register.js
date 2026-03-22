export async function onRequestPost(context) {
    const { request, env } = context;
    const { email, username, password } = await request.json();

    if (!env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "KV Database not configured." }), { status: 500 });
    }

    const checkUser = await env.J2ST_DB.get(`user:${username.toLowerCase()}`);
    if (checkUser) {
        return new Response(JSON.stringify({ error: "Username or email already in use." }), { status: 400 });
    }

    // SHA-256 Hashing using Web Crypto API
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const newUser = {
        id: crypto.randomUUID(),
        email,
        username,
        password: hashedPassword,
        is_verified: true, // Auto-verify for simplicity on serverless
        created_at: Date.now()
    };

    await env.J2ST_DB.put(`user:${username.toLowerCase()}`, JSON.stringify(newUser));
    // Index email too for login
    await env.J2ST_DB.put(`email:${email.toLowerCase()}`, username.toLowerCase());

    return new Response(JSON.stringify({ success: true, user: { username, email } }), { 
        headers: { 'Content-Type': 'application/json' } 
    });
}
