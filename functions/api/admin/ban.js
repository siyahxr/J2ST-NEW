export async function onRequestPost(context) {
    const { request, env } = context;
    const { username, secret, action } = await request.json();

    if (secret !== env.ADMIN_SECRET_KEY) {
        return new Response(JSON.stringify({ error: "Unauthorized." }), { status: 401 });
    }

    if (!env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "KV DB not configured." }), { status: 500 });
    }

    const usernameLower = username.toLowerCase();
    const rawUser = await env.J2ST_DB.get(`user:${usernameLower}`);
    if (!rawUser) return new Response(JSON.stringify({ error: "User not found." }), { status: 404 });

    const user = JSON.parse(rawUser);
    
    if (action === 'ban') {
        user.is_banned = true;
        // Blacklist Email, IP, and Fingerprint
        if (user.email) await env.J2ST_DB.put(`blacklist:${user.email.toLowerCase()}`, "true");
        if (user.ip) await env.J2ST_DB.put(`blacklist_ip:${user.ip}`, "true");
        if (user.fingerprint) await env.J2ST_DB.put(`blacklist_fingerprint:${user.fingerprint}`, "true");
    } else if (action === 'unban') {
        user.is_banned = false;
        if (user.profileSettings) {
            delete user.profileSettings.is_suspended;
            delete user.profileSettings.suspended;
        }
        if (user.email) await env.J2ST_DB.delete(`blacklist:${user.email.toLowerCase()}`);
        if (user.ip) await env.J2ST_DB.delete(`blacklist_ip:${user.ip}`);
        if (user.fingerprint) await env.J2ST_DB.delete(`blacklist_fingerprint:${user.fingerprint}`);
    }

    await env.J2ST_DB.put(`user:${usernameLower}`, JSON.stringify(user));

    return new Response(JSON.stringify({ success: true, message: `User ${action}ned successfully.` }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
