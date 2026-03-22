export async function onRequestPost(context) {
    const { request, env } = context;
    const { username, secret, badges } = await request.json();

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
    
    // Ensure nested profileSettings structure exists
    if (!user.profileSettings) user.profileSettings = {};
    
    // Add badges. Ensure uniqueness if needed or just replace.
    // badges should be an array of badge names like ["Premium", "Verified"]
    if (!user.profileSettings.ownedBadges) user.profileSettings.ownedBadges = [];
    
    badges.forEach(b => {
        if (!user.profileSettings.ownedBadges.includes(b)) {
            user.profileSettings.ownedBadges.push(b);
        }
    });

    // Also populate the current equipped badges if it's empty
    if (!user.profileSettings.badges || user.profileSettings.badges.length === 0) {
        user.profileSettings.badges = [...badges];
    }

    await env.J2ST_DB.put(`user:${usernameLower}`, JSON.stringify(user));

    return new Response(JSON.stringify({ success: true, message: `Badges awarded successfully.` }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
