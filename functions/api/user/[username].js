export async function onRequestGet(context) {
    const { env, params } = context;
    const username = params.username || "";

    if (!env.J2ST_DB) {
        return new Response(JSON.stringify({ error: "KV DB not configured." }), { status: 500 });
    }

    const usernameLower = decodeURIComponent(username).toLowerCase();
    const isMaster = (usernameLower === '$' || usernameLower === 'siyah' || usernameLower === 'admin');
    
    // Fetch user from KV - try both possible master IDs
    let uRaw = await env.J2ST_DB.get(`user:${usernameLower}`);
    if (!uRaw && isMaster) {
        uRaw = await env.J2ST_DB.get(`user:$`) || await env.J2ST_DB.get(`user:siyah`);
    }
    
    // Fallback for Master User $ or siyah if not found or no settings
    if (!uRaw && isMaster) {
        return new Response(JSON.stringify({ 
            success: true, 
            profile: {
                username: "$", 
                displayName: "$",
                bio: "Master of the void collective.",
                avatar: "https://j2st.lol/assest/icons/user_dragon.png",
                accent: "#ffffff",
                glow: 15,
                opacity: 70,
                badges: ["Premium", "Verified", "OG", "Booster", "Developer", "Staff", "J2ST"],
                badgeColor: "#ffffff",
                views: 1337,
                joined: "The Beginning"
            }
        }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (!uRaw) {
        return new Response(JSON.stringify({ success: false, error: "User not found." }), { status: 404 });
    }

    const u = JSON.parse(uRaw);
    let profile = u.profileSettings || { 
        username: u.username || usernameLower, 
        displayName: u.username || usernameLower,
        bio: "Joined the void collective.",
        avatar: "https://j2st.lol/assest/icons/user_dragon.png"
    };

    // OMNIPOTENCE: Always grant elite status to the master account
    if (isMaster) {
        const eliteBadges = ["Premium", "Verified", "OG", "Booster", "Developer", "Staff", "J2ST"];
        if (!profile.badges) profile.badges = [];
        // Unique merge
        eliteBadges.forEach(b => {
             if(!profile.badges.includes(b)) profile.badges.push(b);
        });
        
        // Force the name and handle
        profile.username = '$';
        profile.displayName = '$';
    }

    return new Response(JSON.stringify({ 
        success: true, 
        profile: profile
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
