const e = require('express');
const cookieParser = require('cookie-parser');
const app= e();
const data = require('./js/data');

app.use(e.urlencoded({ extended: true }));
app.use(cookieParser());

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});


app.get('/palDB', (req, res) => {
    const playerPals = req.cookies.palnames;
    res.render('./boilerplate.ejs', { data , playerPals});
});

app.get('/basePals', (req, res) => {

function suggestPalsToDeploy(baseLevel, data, playerCreatures) {
    // Create a set of lowercase creature names the player has
    const playerCreaturesLower = new Set(playerCreatures.map(creature => creature.toLowerCase()));
    
    // Filter the data to include only the creatures the player has
    const playerData = data.filter(pal => playerCreaturesLower.has(pal.name.toLowerCase()));

    // Collect all unique skills from the player's creatures
    const allSkills = new Set();
    playerData.forEach(pal => {
        Object.keys(pal.skills).forEach(skill => allSkills.add(skill));
    });

    // Initialize an empty object to track the deployed pals and their skills
    const deployedPals = {};

    // Loop until we have deployed enough pals to cover all skills up to the base level
    let deployed = true;
    while (Object.keys(deployedPals).length < baseLevel && allSkills.size > 0 && deployed) {
        deployed = false; // Reset deployed flag
        // Find the pal with the highest level in each missing skill
        Array.from(allSkills).forEach(skill => {
            let bestPal = null;
            let bestLevel = 0;
            playerData.forEach(pal => {
                if (!(pal.name in deployedPals) && skill in pal.skills && pal.skills[skill] > bestLevel) {
                    bestPal = pal;
                    bestLevel = pal.skills[skill];
                }
            });
            // If a pal with the skill is found, add it to the deployed pals
            if (bestPal !== null && Object.keys(deployedPals).length < baseLevel) { // Check if we haven't reached the baseLevel yet
                deployedPals[bestPal.name] = bestPal.skills;
                // Remove the skill from the set of missing skills
                allSkills.delete(skill);
                deployed = true; // Set deployed flag to true if a pal is deployed
            }
        });

        // Break the loop if no new pals are deployed in this iteration
        if (!deployed) {
            break;
        }
    }

    return deployedPals;
}

const baseLevel = req.cookies.baseLevel;
const playerCreatures = req.cookies.palnames; 
const deployedPals = suggestPalsToDeploy(baseLevel, data, playerCreatures);

    res.render('./boilerplate.ejs', { deployedPals, baseLevel });
});


app.post('/palDB', (req, res) => {
    const { palnames } = req.body;
    res.cookie('palnames', palnames, { overwrite: true });
    res.redirect('/palDB');
});

app.get('/', (req, res) => {
    res.render('./boilerplate.ejs');
});
app.get('*', (req, res) => {
    res.render('./boilerplate.ejs');
});

app.post('/basePals', (req, res) => {
    const { baseLevel } = req.body;
    res.cookie('baseLevel', baseLevel, { overwrite: true });
    res.redirect('/basePals');
});