export async function onRequestGet(context) {
    const { env } = context;

    if (!env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "KV DB not configured." }), { status: 500 });
    }

    try {
        // List all keys starting with 'user:'
        const listResult = await env.J2ST_DB.list({ prefix: 'user:' });
        const users = [];

        for (const key of listResult.keys) {
            const rawUser = await env.J2ST_DB.get(key.name);
            if (rawUser) {
                const u = JSON.parse(rawUser);
                const username = u.username || key.name.split(':')[1];
                users.push({
                    username: username,
                    email: u.email || "N/A",
                    is_verified: u.is_verified || u.verified || false,
                    is_banned: u.is_banned || false,
                    role: (username.toLowerCase() === 'siyah' || username === '$' || username === 'admin') ? 'admin' : 'user',
                    created_at: u.created_at || Date.now()
                });
            }
        }

        // Fallback for Master Admin if not in KV list yet
        if (!users.find(u => u.username === '$')) {
            users.unshift({ username: '$', email: 'master@void.lol', is_verified: true, role: 'admin', created_at: Date.now() });
        }
        if (!users.find(u => u.username === 'siyah')) {
            users.unshift({ username: 'siyah', email: 'siyah@void.lol', is_verified: true, role: 'admin', created_at: Date.now() });
        }

        return new Response(JSON.stringify({ success: true, users: users }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
