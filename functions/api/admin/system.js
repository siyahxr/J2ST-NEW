export async function onRequestPost(context) {
    const { request, env } = context;
    const { action, secret, target, newName } = await request.json();

    if (secret !== env.ADMIN_SECRET_KEY) {
        return new Response(JSON.stringify({ error: "Unauthorized." }), { status: 401 });
    }

    const db = env.J2ST_DB;
    if (!db) return new Response(JSON.stringify({ error: "DB not found." }), { status: 500 });

    if (action === 'rename') {
        const oldKey = `user:${target.toLowerCase()}`;
        const newKey = `user:${newName.toLowerCase()}`;
        
        const raw = await db.get(oldKey);
        if (!raw) return new Response(JSON.stringify({ error: "Target user not found." }), { status: 404 });
        
        const user = JSON.parse(raw);
        user.username = newName.toLowerCase();
        
        // Move to new key
        await db.put(newKey, JSON.stringify(user));
        // Delete old key
        await db.delete(oldKey);
        
        // Update email index if it exists
        if (user.email) {
            await db.put(`email:${user.email.toLowerCase()}`, user.username);
        }

        return new Response(JSON.stringify({ success: true, message: `Renamed ${target} to ${newName}.` }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ error: "Invalid action." }), { status: 400 });
}
