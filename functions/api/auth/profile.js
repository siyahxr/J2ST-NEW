export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const username = url.searchParams.get('u');

    if (!username || !env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "No user specified." }), { status: 400 });
    }

    const rawUser = await env.J2ST_DB.get(`user:${username.toLowerCase()}`);
    if (!rawUser) {
        // Fallback for $ if not in DB yet
        if (username === '$') {
             return new Response(JSON.stringify({ 
                username: "$", 
                displayName: "$siyah",
                bio: "The Void Master",
                avatar: "https://i.ibb.co/Lkv2yX7/dragon.png",
                badges: ["Premium", "Verified", "OG", "Booster", "Developer", "Staff"],
                badgeColor: "#ffffff"
             }), { headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ error: "User not found." }), { status: 404 });
    }

    const user = JSON.parse(rawUser);
    
    // OMNIPOTENCE: Give $ all badges
    if (username === '$') {
        user.badges = ["Premium", "Verified", "OG", "Booster", "Developer", "Staff"];
    }

    // Security: Don't leak sensitive data
    delete user.password;
    delete user.token;

    return new Response(JSON.stringify(user), {
        headers: { 'Content-Type': 'application/json' }
    });
}
