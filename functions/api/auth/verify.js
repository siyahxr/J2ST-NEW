export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token || !env.J2ST_DB) {
        return new Response("INVALID TRANSMISSION", { status: 400 });
    }

    const username = await env.J2ST_DB.get(`verify_token:${token}`);
    if (!username) {
        return new Response("IDENTIFICATION EXPIRED OR INVALID", { status: 400 });
    }

    const rawUser = await env.J2ST_DB.get(`user:${username}`);
    if (!rawUser) {
        return new Response("USER CLOUD DATA NOT FOUND", { status: 404 });
    }

    const user = JSON.parse(rawUser);
    user.verified = true;
    user.verified_at = new Date().toISOString();

    // Store verified user
    await env.J2ST_DB.put(`user:${username}`, JSON.stringify(user));
    await env.J2ST_DB.delete(`verify_token:${token}`);

    // EXOTIC REDIRECT TO LOGIN
    return new Response(null, {
        status: 302,
        headers: { 'Location': '/login.html?verified=true' }
    });
}
