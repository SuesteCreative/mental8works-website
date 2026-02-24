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
            if (file.endsWith('.html')) {
                arrayOfFiles.push(path.join(dirPath, '/', file));
            }
        }
    });
    return arrayOfFiles;
}

const htmlFiles = getAllHtmlFiles(path.join(__dirname, '..'));

htmlFiles.forEach(file => {
    let html = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Regex to match multi-line link tags pointing to Google Fonts CSS
    const fontRegex = /<link[\s\S]*?href=\"https:\/\/fonts\.googleapis\.com\/css2[^\"]*\"[\s\S]*?>/gm;

    html = html.replace(fontRegex, (match) => {
        if (!match.includes('media="print"')) {
            changed = true;
            if (match.includes('rel="stylesheet"')) {
                return match.replace(/rel="stylesheet"/, "rel=\"stylesheet\" media=\"print\" onload=\"this.media='all'\"");
            } else {
                return match.replace(/>$/, " media=\"print\" onload=\"this.media='all'\">");
            }
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(file, html, 'utf8');
        console.log(`✅ Applied font defer to: ${file}`);
    }
});
