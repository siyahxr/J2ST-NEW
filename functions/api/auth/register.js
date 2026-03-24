export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { email, username, password, fingerprint, key, 'cf-turnstile-response': turnstileToken } = body;

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

    const inviteKey = (key || "WEB-DIRECT").toUpperCase();

    const usernameLower = username.toLowerCase();
    const emailLower = email.toLowerCase();
    const token = crypto.randomUUID();
    const ip = request.headers.get("CF-Connecting-IP") || "0.0.0.0";

    // Length check
    if (usernameLower.length < 3 && usernameLower !== 'k') {
        return new Response(JSON.stringify({ error: "Username must be at least 3 characters." }), { status: 400 });
    }

    // Blacklist check
    const emailBanned = await env.J2ST_DB.get(`blacklist:${emailLower}`);
    const ipBanned = await env.J2ST_DB.get(`blacklist_ip:${ip}`);
    const fingerBanned = await env.J2ST_DB.get(`blacklist_fingerprint:${fingerprint || "unknown"}`);

    if (emailBanned || ipBanned || fingerBanned) {
        return new Response(JSON.stringify({ error: "Your access trace is blacklisted. Breach sequence denied." }), { status: 403 });
    }

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
        ip: ip,
        fingerprint: fingerprint || "unknown",
        password: hashedPassword,
        created_at: new Date().toISOString(),
        verified: false,
        token: token,
        invite_key: inviteKey
    };

    // Store user data & token bridge
    await env.J2ST_DB.put(`user:${usernameLower}`, JSON.stringify(newUser));
    await env.J2ST_DB.put(`email:${emailLower}`, usernameLower);
    await env.J2ST_DB.put(`verify_token:${token}`, usernameLower, { expirationTtl: 86400 });

    // SEND MAIL via RESEND API
    if (env.RESEND_API_KEY) {
        try {
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'j2st.lol <verified@j2st.lol>',
                    to: emailLower,
                    subject: 'Verify your j2st.lol identity',
                    html: `
                        <div style="background-color: #000; padding: 60px 20px; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center;">
                            <div style="background-color: #0d0d0d; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; max-width: 480px; margin: 0 auto; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
                                <img src="https://j2st.lol/assest/j2st.logo.png" alt="j2st.lol" style="width: 80px; height: auto; margin-bottom: 30px;">
                                <h1 style="color: #fff; font-size: 28px; font-weight: 800; letter-spacing: -1px; margin: 0 0 10px 0; text-transform: uppercase;">IDENTITY GATEWAY</h1>
                                <p style="color: rgba(255,255,255,0.6); font-size: 16px; line-height: 1.6; margin-bottom: 35px;">Confirm your access signature to breach the void and join the elite collective.</p>
                                
                                <a href="https://j2st.lol/api/auth/verify?token=${token}" 
                                   style="background-color: #fff; color: #000; padding: 16px 36px; text-decoration: none; display: inline-block; border-radius: 12px; font-weight: 900; font-size: 14px; letter-spacing: 1px; transition: transform 0.3s; box-shadow: 0 0 20px rgba(255,255,255,0.15);">
                                   BREACH ACCESS →
                                </a>

                                <div style="margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 30px;">
                                    <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0;">This transmission was sent to verify your digital identity. If you did not initiate this breach, please ignore.</p>
                                    <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin-top: 10px; text-decoration: underline;">j2st.lol © 2026</p>
                                </div>
                            </div>
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

