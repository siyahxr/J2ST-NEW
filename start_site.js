const express = require('express');
const path = require('path');
const app = express();

// Serve all static files from the current directory
app.use(express.static(__dirname));

const PORT = 5500;
app.listen(PORT, () => {
    console.log(`
🌍 J2ST Website is LIVE on Localhost!
-------------------------------------
Address: http://localhost:${PORT}

Click the link above to open your site in the browser.
    `);
});
