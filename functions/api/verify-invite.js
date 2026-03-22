export async function onRequestPost(context) {
    const { request, env } = context;
    const { key } = await request.json();
    const inputKey = key.toUpperCase();

    const STATIC_KEYS = ['J2ST-ACCESS-2026', 'SIYAH-PRIVATE', 'OP-GATE-99', 'ELITE-VOID'];

    if (STATIC_KEYS.includes(inputKey)) {
        return new Response(JSON.stringify({ success: true, key: inputKey }), { 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    // Check Cloudflare KV
    if (env.J2ST_DB) {
        const storedKey = await env.J2ST_DB.get(`invite:${inputKey}`);
        if (storedKey) {
            const data = JSON.parse(storedKey);
            if (!data.used) {
                return new Response(JSON.stringify({ success: true, key: inputKey }), { 
                    headers: { 'Content-Type': 'application/json' } 
                });
            }
        }
    }

    return new Response(JSON.stringify({ success: false, error: "Invalid signature." }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' } 
    });
}
