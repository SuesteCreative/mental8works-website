const fs = require('fs');
const path = require('path');

// --- Helper Functions ---

function readCollection(dirPath) {
    const fullPath = path.join(__dirname, '..', dirPath);
    if (!fs.existsSync(fullPath)) return [];

    return fs.readdirSync(fullPath)
        .filter(file => file.endsWith('.json'))
        .map(file => JSON.parse(fs.readFileSync(path.join(fullPath, file), 'utf8')));
}

// --- Build Logic ---

function buildTeamPage() {
    const teamNodes = readCollection('data/team');
    const templatePath = path.join(__dirname, '..', 'team', 'index.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Generate Team HTML
    const teamItemsHtml = teamNodes.map((member, idx) => `
                <!-- ${member.name} (Dynamic) -->
                <div class="team-card-detailed reveal" style="transition-delay: ${0.05 + (idx * 0.05)}s;">
                    <div class="team-card-image">
                        <img src="${member.photo.startsWith('/') ? '..' + member.photo : member.photo}" alt="${member.name}"
                            style="object-fit: cover; width: 100%; height: 100%;">
                    </div>
                    <div class="team-card-info">
                        <h2>${member.name}</h2>
                        ${member.linkedin ? `
                        <a href="${member.linkedin}" target="_blank" rel="noopener noreferrer" class="linkedin-icon"
                            style="color: #0077b5; margin-bottom: 0.5rem; display: inline-flex;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                fill="currentColor">
                                <path
                                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                        </a>` : ''}
                        <p class="role">${member.role}</p>
                        <ul class="bio-list">
                            ${(member.bio_items || []).map(item => `<li>${item}</li>`).join('\n                            ')}
                        </ul>
                    </div>
                </div>`).join('\n');

    // Find the container and replace its content
    // Regex to find <div class="team-grid-full"> ... </div>
    const containerRegex = /<div class="team-grid-full">[\s\S]*?<\/div>/;
    const newContainerHtml = `<div class="team-grid-full">\n                <!-- CMS_TEAM_MEMBERS -->\n${teamItemsHtml}\n            </div>`;

    if (containerRegex.test(html)) {
        html = html.replace(containerRegex, newContainerHtml);
        fs.writeFileSync(templatePath, html);
        console.log('✅ Team page updated.');
    } else {
        console.error('❌ Could not find team-grid-full container in team/index.html');
    }
}

function buildHomePage() {
    const homeDataPath = path.join(__dirname, '..', 'data', 'home.json');
    if (!fs.existsSync(homeDataPath)) return;

    const home = JSON.parse(fs.readFileSync(homeDataPath, 'utf8'));
    const templatePath = path.join(__dirname, '..', 'index.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    if (home.hero && home.hero.words) {
        const wordsArray = JSON.stringify(home.hero.words);
        html = html.replace(/window\.CMS_DYNAMIC_WORDS\s*=\s*\[.*?\]/, `window.CMS_DYNAMIC_WORDS = ${wordsArray}`);
    }

    fs.writeFileSync(templatePath, html);
    console.log('✅ Homepage updated.');
}

// Run
try {
    buildTeamPage();
    buildHomePage();
} catch (err) {
    console.error('❌ Build script error:', err);
    process.exit(1);
}
