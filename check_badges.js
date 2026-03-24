const fs = require('fs');
const path = 'c:\\Users\\taski\\OneDrive\\Masaüstü\\J2STLOLPUB\\users.db.json';

try {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    let foundVerified = 0;
    let foundBeta = 0;
    
    data.forEach(user => {
        if (user.profileSettings && user.profileSettings.ownedBadges) {
            if (user.profileSettings.ownedBadges.includes('Verified')) {
                foundVerified++;
            }
            if (user.profileSettings.ownedBadges.includes('Beta Tester')) {
                foundBeta++;
            }
        }
        if (user.profileSettings && user.profileSettings.badges) {
             if (user.profileSettings.badges.includes('Verified')) {
                foundVerified++;
            }
            if (user.profileSettings.badges.includes('Beta Tester')) {
                foundBeta++;
            }
        }
    });
    
    console.log(`Summary:`);
    console.log(`Users with 'Verified': ${foundVerified}`);
    console.log(`Users with 'Beta Tester': ${foundBeta}`);

} catch (e) {
    console.error(e);
}
