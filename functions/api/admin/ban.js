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
        // Also blacklist the email
        if (user.email) {
            await env.J2ST_DB.put(`blacklist:${user.email.toLowerCase()}`, "true");
        }
    } else if (action === 'unban') {
        user.is_banned = false;
        if (user.profileSettings) {
            delete user.profileSettings.is_suspended;
            delete user.profileSettings.suspended;
        }
        if (user.email) {
            await env.J2ST_DB.delete(`blacklist:${user.email.toLowerCase()}`);
        }
    }

    await env.J2ST_DB.put(`user:${usernameLower}`, JSON.stringify(user));

    return new Response(JSON.stringify({ success: true, message: `User ${action}ned successfully.` }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
