const fs = require('fs');
const path = 'c:\\Users\\taski\\OneDrive\\Masaüstü\\J2STLOLPUB\\users.db.json';

try {
    let raw = fs.readFileSync(path, 'utf8');
    let fixed = raw;
    
    // Check for "Verified"
    const verifiedRegex = /"Verified"/g;
    const matches = raw.match(verifiedRegex);
    
    if (matches) {
        console.log(`Found ${matches.length} instances of "Verified" in JSON string.`);
        fixed = raw.replace(verifiedRegex, '"Beta Tester"');
        fs.writeFileSync(path, fixed, 'utf8');
        console.log('Successfully replaced all "Verified" with "Beta Tester".');
    } else {
        console.log('No "Verified" strings found in users.db.json.');
    }

} catch (e) {
    console.error('Error processing users.db.json:', e);
}
