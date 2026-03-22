const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

// --- CONFIGURATION ---
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1405175521255624777';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'nO_1vGT5Lb9YXfLZAEG-W-VF1aHej5a8';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/callback';
const FRONTEND_URL = 'http://localhost:5500/dashboard.html'; // Adjust this to your live server port (usually 5500 for Live Server)

// 1. Redirect user to Discord
app.get('/login', (req, res) => {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
    res.redirect(url);
});

// 2. Handle the callback from Discord
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send("No authorization code provided.");

    try {
        // Exchange code for token
        const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = tokenRes.data.access_token;

        // Fetch user profile
        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const discordId = userRes.data.id;
        console.log("Success! Linked User ID:", discordId);

        // Redirect back to dashboard with the ID as a param
        res.redirect(`${FRONTEND_URL}?discord_linked_id=${discordId}`);

    } catch (err) {
        console.error("Auth Error:", err.response?.data || err.message);
        res.status(500).send("Communication failure with Discord. Check your Client ID/Secret.");
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`
🚀 Discord Sync Server Ready!
------------------------------
1. Backend: http://localhost:${PORT}
2. Link URL: http://localhost:${PORT}/login

Make sure your Redirect URI on Discord Portal matches: ${REDIRECT_URI}
    `);
});
