const fs = require('fs');
const path = require('path');

function getAllHtmlFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                arrayOfFiles = getAllHtmlFiles(dirPath + '/' + file, arrayOfFiles);
            }
        } else {
            if (file.endsWith('.html') || file.endsWith('.js')) {
                arrayOfFiles.push(path.join(dirPath, '/', file));
            }
        }
    });
    return arrayOfFiles;
}

const allFiles = getAllHtmlFiles(path.join(__dirname, '..'));

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (content.includes('alt=\"Logótipo Mental8Works Branco\"')) {
        content = content.replace(/alt=\"Logótipo Mental8Works Branco\"/g, 'alt=\"Mental8Works Associação\"');
        changed = true;
    }
    if (content.includes('alt=\"Logótipo Mental8Works - Saúde Mental em Lisboa\"')) {
        content = content.replace(/alt=\"Logótipo Mental8Works - Saúde Mental em Lisboa\"/g, 'alt=\"Mental8Works - Saúde Mental em Lisboa\"');
        changed = true;
    }
    if (content.includes('alt=\"Equipa Mental8Works\"')) {
        content = content.replace(/alt=\"Equipa Mental8Works\"/g, 'alt=\"Fotografia da equipa de psicólogos e psiquiatras da Mental8Works em Lisboa\"');
        changed = true;
    }
    if (content.includes('alt=\"Mental8Works Logo\"')) {
        content = content.replace(/alt=\"Mental8Works Logo\"/g, 'alt=\"Mental8Works - Instituição de Saúde Mental\"');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed alts in: ' + file);
    }
});
