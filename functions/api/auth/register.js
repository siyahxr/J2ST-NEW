export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { email, username, password } = body;

    if (!env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "KV DB not configured." }), { status: 500 });
    }

    // Check if user exists
    const existing = await env.J2ST_DB.get(`user:${username.toLowerCase()}`);
    if (existing) {
        return new Response(JSON.stringify({ error: "Username already exists." }), { status: 400 });
    }

    const emailCheck = await env.J2ST_DB.get(`email:${email.toLowerCase()}`);
    if (emailCheck) {
        return new Response(JSON.stringify({ error: "Email already exists." }), { status: 400 });
    }

    // Hash password
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const verifyToken = crypto.randomUUID();
    const newUser = {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        created_at: new Date().toISOString(),
        verified: true, // AUTO-VERIFIED FOR SPEED FOR NOW
        invite_key: body.key || "WEB-DIRECT"
    };

    // Store user
    await env.J2ST_DB.put(`user:${username.toLowerCase()}`, JSON.stringify(newUser));
    await env.J2ST_DB.put(`email:${email.toLowerCase()}`, username.toLowerCase());

    // SEND MAIL via RESEND API (Async)
    if (env.RESEND_API_KEY) {
        try {
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'j2st.lol <onboarding@resend.dev>',
                    to: email,
                    subject: 'Welcome to j2st.lol',
                    html: `<h1>Welcome to the Void</h1><p>Your account <b>${username}</b> has been activated.</p>`
                })
            });
        } catch (e) {
            console.error("Mail failed, but user created.");
        }
    }

    return new Response(JSON.stringify({ success: true, message: "Registered successfully." }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
