const fs = require('fs');
const path = require('path');

// 1. Add :focus-visible CSS for accessibility
const cssPath = path.join(__dirname, '..', 'assets', 'css', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes(':focus-visible')) {
    const focusCSS = `\n/* ── Acessibilidade: Keyboard Focus ── */\n:focus-visible {\n    outline: 3px solid var(--color-primary) !important;\n    outline-offset: 3px !important;\n}\n`;
    css += focusCSS;
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('✅ Added :focus-visible to styles.css');
}

// 2. Add FAQPage schema to agendamentos
const appPath = path.join(__dirname, '..', 'agendamentos', 'index.html');
let appHtml = fs.readFileSync(appPath, 'utf8');

// Check if we already have FAQPage
if (!appHtml.includes('"@type": "FAQPage"')) {
    // Instead of replacing the existing MedicalOrganization, let's append a second script tag before </head>
    const appDataPath = path.join(__dirname, '..', 'data', 'appointments.json');
    if (fs.existsSync(appDataPath)) {
        const appData = JSON.parse(fs.readFileSync(appDataPath, 'utf8'));
        if (appData.faqs) {
            let faqSchema = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": appData.faqs.map(f => ({
                    "@type": "Question",
                    "name": f.faq.question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": f.faq.answer.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>').replace(/\\*(.*?)\\*/g, '<em>$1</em>')
                    }
                }))
            };
            const scriptTag = `\n    <!-- JSON-LD: FAQPage -->\n    <script type="application/ld+json">\n${JSON.stringify(faqSchema, null, 6)}\n    </script>\n</head>`;
            appHtml = appHtml.replace('</head>', scriptTag);
            fs.writeFileSync(appPath, appHtml, 'utf8');
            console.log('✅ Added FAQPage schema to agendamentos/index.html');
        }
    }
}

// 3. Add Person schema to Equipa
const equipaPath = path.join(__dirname, '..', 'equipa', 'index.html');
let equipaHtml = fs.readFileSync(equipaPath, 'utf8');

if (!equipaHtml.includes('"@type": "Person"')) {
    const equipaDataPath = path.join(__dirname, '..', 'data', 'team.json');
    if (fs.existsSync(equipaDataPath)) {
        const equipaData = JSON.parse(fs.readFileSync(equipaDataPath, 'utf8'));
        if (equipaData.members) {
            let persons = equipaData.members.map(m => ({
                "@context": "https://schema.org",
                "@type": "Person",
                "name": m.name,
                "jobTitle": m.role,
                "worksFor": {
                    "@type": "Organization",
                    "name": "Mental8Works"
                },
                "image": "https://mental8works.pt" + m.image
            }));

            const scriptTag = `\n    <!-- JSON-LD: Person -->\n    <script type="application/ld+json">\n${JSON.stringify(persons, null, 6)}\n    </script>\n</head>`;
            equipaHtml = equipaHtml.replace('</head>', scriptTag);
            fs.writeFileSync(equipaPath, equipaHtml, 'utf8');
            console.log('✅ Added Person mapping schema to equipa/index.html');
        }
    }
}

