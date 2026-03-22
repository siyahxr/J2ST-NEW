export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { email, username, password } = body;

    if (!env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "KV DB not configured." }), { status: 500 });
    }

    const usernameLower = username.toLowerCase();
    const emailLower = email.toLowerCase();
    const token = crypto.randomUUID();

    // Check if user exists
    const existing = await env.J2ST_DB.get(`user:${usernameLower}`);
    if (existing) return new Response(JSON.stringify({ error: "Username already exists." }), { status: 400 });

    const emailCheck = await env.J2ST_DB.get(`email:${emailLower}`);
    if (emailCheck) return new Response(JSON.stringify({ error: "Email already exists." }), { status: 400 });

    // Hash password
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const newUser = {
        username: usernameLower,
        email: emailLower,
        password: hashedPassword,
        created_at: new Date().toISOString(),
        verified: false,
        token: token,
        invite_key: body.key || "WEB-DIRECT"
    };

    // Store user data & token bridge
    await env.J2ST_DB.put(`user:${usernameLower}`, JSON.stringify(newUser));
    await env.J2ST_DB.put(`email:${emailLower}`, usernameLower);
    await env.J2ST_DB.put(`verify_token:${token}`, usernameLower, { expirationTtl: 86400 });

    // SEND MAIL via RESEND API
    if (env.RESEND_API_KEY) {
        const HOST = request.headers.get('host');
        try {
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'onboarding@resend.dev',
                    to: emailLower,
                    subject: 'Verify your j2st.lol identity',
                    html: `
                        <div style="background:#000; color:#fff; padding:40px; font-family:sans-serif; text-align:center;">
                            <h1>IDENTITY GATEWAY</h1>
                            <p>Confirm your access signature to breach the void.</p>
                            <a href="https://${HOST}/api/auth/verify?token=${token}" 
                               style="background:#fff; color:#000; padding:15px 30px; text-decoration:none; display:inline-block; border-radius:5px; font-weight:bold; margin-top:20px;">
                               BREACH ACCESS
                            </a>
                        </div>
                    `
                })
            });
        } catch (e) {
            console.error("Transmission failed.");
        }
    }

    return new Response(JSON.stringify({ 
        success: true, 
        message: "Identity recorded. Transmission sent." 
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
