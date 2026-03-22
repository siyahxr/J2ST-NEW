export async function onRequestGet(context) {
    const { env, params } = context;
    const username = params.username;

    if (!env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "KV DB not configured." }), { status: 500 });
    }

    const usernameLower = username.toLowerCase();
    
    // Fetch user from KV
    const uRaw = await env.J2ST_DB.get(`user:${usernameLower}`);
    
    // SPECIAL CASE: $ (Universal Admin Alias) or 'siyah' if missing from KV
    if (!uRaw && (username === '$' || usernameLower === 'siyah')) {
        return new Response(JSON.stringify({ 
            success: true, 
            profile: {
                username: "$", 
                displayName: "siyah",
                bio: "The Void Master. Synchronizing the collective.",
                avatar: "https://j2st.lol/assest/icons/user_dragon.png",
                accent: "#ffffff",
                glow: 15,
                opacity: 70,
                badges: ["Premium", "Verified", "OG", "Booster", "Developer", "Staff", "J2ST"],
                badgeColor: "#ffffff",
                views: 1337,
                joined: "The Beginning"
            }
        }), { 
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!uRaw) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: "User not found." 
        }), { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const u = JSON.parse(uRaw);
    
    // Return profile (even if not strictly verified, if they have settings)
    const profile = u.profileSettings || { 
        username: u.username, 
        displayName: u.username,
        bio: "Joined the void collective.",
        avatar: "https://j2st.lol/assest/icons/user_dragon.png",
        badges: ["Verified"]
    };

    return new Response(JSON.stringify({ 
        success: true, 
        profile: profile
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
