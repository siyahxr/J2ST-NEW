export async function onRequestPost(context) {
    const { request, env } = context;
    const { username, settings } = await request.json();

    if (!env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "KV DB not configured." }), { status: 500 });
    }

    const usernameLower = username.toLowerCase();
    
    // Fetch existing user
    const existingRaw = await env.J2ST_DB.get(`user:${usernameLower}`);
    if (!existingRaw) {
        return new Response(JSON.stringify({ error: "User not found." }), { status: 404 });
    }

    const user = JSON.parse(existingRaw);
    user.profileSettings = settings; // Update settings

    // Save back to KV
    await env.J2ST_DB.put(`user:${usernameLower}`, JSON.stringify(user));

    return new Response(JSON.stringify({ 
        success: true, 
        message: "Aesthetics synchronized with the void." 
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
