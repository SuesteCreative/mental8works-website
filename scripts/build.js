const fs = require('fs');
const path = require('path');

// --- Helper Functions ---

/**
 * Reads all JSON files in a directory and returns an array of objects.
 */
function readCollection(dirPath) {
    const fullPath = path.join(__dirname, '..', dirPath);
    if (!fs.existsSync(fullPath)) return [];

    return fs.readdirSync(fullPath)
        .filter(file => file.endsWith('.json'))
        .map(file => JSON.parse(fs.readFileSync(path.join(fullPath, file), 'utf8')));
}

// --- Main Build Logic ---

function buildTeamPage() {
    const teamNodes = readCollection('data/team');
    const templatePath = path.join(__dirname, '..', 'team', 'index.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Generate Team HTML
    const teamHtml = teamNodes.map((member, idx) => `
                <!-- ${member.name} (Dynamic) -->
                <div class="team-card-detailed reveal" style="transition-delay: ${0.1 + (idx * 0.05)}s;">
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
                </div>
  `).join('\n');

    // Replace the container content
    // We look for the grid container and replace its children
    const regex = /<div class="team-grid[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/;
    const match = html.match(regex);

    if (match) {
        const newGrid = `<div class="team-grid reveal-grid">\n${teamHtml}\n                </div>`;
        html = html.replace(match[0], `${newGrid}\n            </div>\n        </section>`);
    }

    fs.writeFileSync(templatePath, html);
    console.log('✅ Team page updated from JSON data.');
}

function buildHomePage() {
    const homeDataPath = path.join(__dirname, '..', 'data', 'home.json');
    if (!fs.existsSync(homeDataPath)) return;

    const home = JSON.parse(fs.readFileSync(homeDataPath, 'utf8'));
    const templatePath = path.join(__dirname, '..', 'index.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Update Hero dynamic words
    if (home.hero && home.hero.words) {
        const wordsArray = JSON.stringify(home.hero.words);
        html = html.replace(/window\.CMS_DYNAMIC_WORDS\s*=\s*\[.*?\]/, `window.CMS_DYNAMIC_WORDS = ${wordsArray}`);
    }

    fs.writeFileSync(templatePath, html);
    console.log('✅ Homepage updated from JSON data.');
}

// Run all
try {
    buildTeamPage();
    buildHomePage();
    // Add blog mapping here later if needed
} catch (err) {
    console.error('❌ Build failed:', err);
    process.exit(1);
}
