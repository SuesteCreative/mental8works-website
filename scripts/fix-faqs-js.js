const fs = require('fs');
const path = require('path');

// --- 1. Fix script.js ---
const scriptPath = path.join(__dirname, '..', 'assets', 'js', 'script.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

const faqLogic = `    // ── FAQs Accordion ────────────────────────────────────
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if(question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all others
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherQuestion = otherItem.querySelector('.faq-question');
                    if (otherQuestion) otherQuestion.classList.remove('active');
                });
                
                // Toggle current
                if (!isActive) {
                    item.classList.add('active');
                    question.classList.add('active');
                }
            });
        }
    });

`;

// Remove it from the end if it's there
if (scriptContent.includes('// ── FAQs Accordion ────────────────────────────────────')) {
    scriptContent = scriptContent.replace(faqLogic, '');
}

// Inject it inside DOMContentLoaded before the closing brackets
if (!scriptContent.includes('// ── FAQs Accordion ────────────────────────────────────')) {
    const hook = `        // Forced 1-second delay before showing the banner as requested
        setTimeout(() => {
            if (!CookieConsent.getCookie('cc_cookie')) {
                CookieConsent.show();
            }
        }, 1000);
    }`;

    const replacement = `        // Forced 1-second delay before showing the banner as requested
        setTimeout(() => {
            if (!CookieConsent.getCookie('cc_cookie')) {
                CookieConsent.show();
            }
        }, 1000);
    }

${faqLogic}`;

    scriptContent = scriptContent.replace(hook, replacement);
    fs.writeFileSync(scriptPath, scriptContent, 'utf8');
    console.log('script.js updated to include FAQ inside DOMContentLoaded.');
}

// --- 2. Update Cache Buster ---
function getAllHtmlFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                arrayOfFiles = getAllHtmlFiles(dirPath + "/" + file, arrayOfFiles);
            }
        } else {
            if (file.endsWith('.html')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });
    return arrayOfFiles;
}

const htmlFiles = getAllHtmlFiles(path.join(__dirname, '..'));

htmlFiles.forEach(file => {
    let html = fs.readFileSync(file, 'utf8');
    if (html.includes('v=2.8')) {
        let newHtml = html.replace(/\?v=2\.8/g, '?v=2.9');
        fs.writeFileSync(file, newHtml, 'utf8');
    }
});
console.log('Cache busters updated from 2.8 to 2.9.');
