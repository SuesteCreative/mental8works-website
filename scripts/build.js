const fs = require('fs');
const path = require('path');

// --- Helper Functions ---

function readCollection(dirPath) {
    const fullPath = path.join(__dirname, '..', dirPath);
    if (!fs.existsSync(fullPath)) return [];

    return fs.readdirSync(fullPath)
        .filter(file => file.endsWith('.json'))
        .map(file => {
            const content = JSON.parse(fs.readFileSync(path.join(fullPath, file), 'utf8'));
            content._filename = file.replace('.json', '');
            return content;
        });
}

// --- Build Logic ---

function buildTeamPage() {
    const teamNodes = readCollection('data/team');
    const templatePath = path.join(__dirname, '..', 'team', 'index.html');
    if (!fs.existsSync(templatePath)) return;
    let html = fs.readFileSync(templatePath, 'utf8');

    const teamItemsHtml = teamNodes.map((member, idx) => `
                <!-- ${member.name} (Dynamic) -->
                <div class="team-card-detailed reveal" style="transition-delay: ${0.05 + (idx * 0.05)}s;">
                    <div class="team-card-image">
                        <img src="${member.photo.startsWith('/') ? '..' + member.photo : (member.photo.startsWith('assets') ? '../' + member.photo : member.photo)}" alt="${member.name}"
                            style="object-fit: cover; width: 100%; height: 100%;">
                    </div>
                    <div class="team-card-info">
                        <h2>${member.name}</h2>
                        ${(() => {
            if (!member.linkedin || !member.linkedin.includes('linkedin.com')) return '';
            const url = member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`;
            return `
                        <a href="${url}" target="_blank" rel="noopener noreferrer" class="linkedin-icon"
                            style="color: #0077b5; margin-bottom: 0.5rem; display: inline-flex;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                fill="currentColor">
                                <path
                                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                        </a>`;
        })()}
                        <p class="role">${member.role}</p>
                        <ul class="bio-list">
                            ${(member.bio_items || []).map(item => `<li>${item}</li>`).join('\n                            ')}
                        </ul>
                    </div>
                </div>`).join('\n');

    // REGEX IMPROVED: We capture everything between the placeholder and the closing div of the grid
    const startMarker = '<!-- CMS_TEAM_MEMBERS -->';
    const endOfContainer = '</div>\n            </div>\n        </section>';

    const startIndex = html.indexOf(startMarker);
    const searchPart = html.substring(startIndex);
    const endIndex = searchPart.indexOf('</div>\n            </div>');

    if (startIndex !== -1 && endIndex !== -1) {
        const before = html.substring(0, startIndex + startMarker.length);
        const after = searchPart.substring(endIndex);
        html = before + '\n' + teamItemsHtml + '\n            ' + after;
        fs.writeFileSync(templatePath, html);
        console.log('✅ Team page cleaned and updated.');
    }
}

function buildBlogIndex() {
    const posts = readCollection('data/blog').sort((a, b) => new Date(b.date) - new Date(a.date));
    const templatePath = path.join(__dirname, '..', 'blog', 'index.html');
    if (!fs.existsSync(templatePath)) return;
    let html = fs.readFileSync(templatePath, 'utf8');

    const blogItemsHtml = posts.map((post, idx) => `
                <!-- Artigo: ${post.title} -->
                <a href="posts/${post._filename}.html" class="card blog-card">
                    <div class="blog-card-img-wrapper">
                        <img src="${post.image.startsWith('/') ? '..' + post.image : post.image}" alt="${post.title}" loading="lazy">
                    </div>
                    <div class="blog-content">
                        <p style="font-size:0.8rem; opacity:0.6; margin-bottom:0.5rem;">${new Date(post.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        <h3>${post.title}</h3>
                        <p>${post.summary || ''}</p>
                        <span style="color: var(--color-primary); font-weight: 600;">Ler mais &rarr;</span>
                    </div>
                </a>`).join('\n');

    const startMarker = '<!-- CMS_BLOG_POSTS -->';
    const startIndex = html.indexOf(startMarker);
    if (startIndex !== -1) {
        const searchPart = html.substring(startIndex);
        const endIndex = searchPart.indexOf('</div>');
        const before = html.substring(0, startIndex + startMarker.length);
        const after = searchPart.substring(endIndex);
        html = before + '\n' + blogItemsHtml + '\n            ' + after;
        fs.writeFileSync(templatePath, html);
        console.log('✅ Blog index cleaned and updated.');
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
    buildBlogIndex();
    buildHomePage();
} catch (err) {
    console.error('❌ Build script error:', err);
    process.exit(1);
}
