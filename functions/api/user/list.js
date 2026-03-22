export async function onRequestGet(context) {
    const { env } = context;

    if (!env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "KV DB not configured." }), { status: 500 });
    }

    // List all user keys
    const list = await env.J2ST_DB.list({ prefix: "user:" });
    const keys = list.keys;

    const profiles = [];
    
    // Fetch a subset or all (limit for performance in real apps, but here we can try all)
    // We only want users who have saved profileSettings
    for (const keyObj of keys) {
        const raw = await env.J2ST_DB.get(keyObj.name);
        if (raw) {
            const u = JSON.parse(raw);
            if (u.profileSettings) {
                profiles.push(u.profileSettings);
            }
        }
    }

    // Sort by views or most recent? Let's do random or recent.
    profiles.reverse(); // Newest first (roughly)

    return new Response(JSON.stringify({ 
        success: true, 
        profiles: profiles.slice(0, 50) 
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
