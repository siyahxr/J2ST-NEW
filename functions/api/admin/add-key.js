export async function onRequestPost(context) {
    const { request, env } = context;
    const { key, memo, secret } = await request.json();

    // Validate admin secret
    if (secret !== env.ADMIN_SECRET_KEY) {
        return new Response(JSON.stringify({ error: "Access Denied." }), { status: 401 });
    }

    if (!env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "KV DB not configured." }), { status: 500 });
    }

    const keyData = {
        value: key.toUpperCase(),
        memo: memo || 'Generated via Sentinel',
        used: false,
        created_at: Date.now()
    };

    await env.J2ST_DB.put(`invite:${key.toUpperCase()}`, JSON.stringify(keyData));

    return new Response(JSON.stringify({ success: true, key: keyData }), { 
        headers: { 'Content-Type': 'application/json' } 
    });
}
