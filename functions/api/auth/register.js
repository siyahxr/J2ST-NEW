export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { email, username, password } = body;

    if (!env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "KV DB not configured." }), { status: 500 });
    }

    const usernameLower = username.toLowerCase();
    const emailLower = email.toLowerCase();

    // Check if user exists
    const existing = await env.J2ST_DB.get(`user:${usernameLower}`);
    if (existing) {
        return new Response(JSON.stringify({ error: "Username already exists." }), { status: 400 });
    }

    const emailCheck = await env.J2ST_DB.get(`email:${emailLower}`);
    if (emailCheck) {
        return new Response(JSON.stringify({ error: "Email already exists." }), { status: 400 });
    }

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
        verified: true, // EXPLICIT AUTO-VERIFY TO BYPASS MAIL ISSUES
        invite_key: body.key || "WEB-DIRECT"
    };

    // Store user
    await env.J2ST_DB.put(`user:${usernameLower}`, JSON.stringify(newUser));
    await env.J2ST_DB.put(`email:${emailLower}`, usernameLower);

    return new Response(JSON.stringify({ 
        success: true, 
        message: "Account forged. Access granted.",
        status: "BREACHED"
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
