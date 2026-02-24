const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imgDir = path.join(__dirname, '..', 'assets', 'images');

const tasks = [
    { file: 'logo-mental8works-color.webp', width: 400 },
    { file: 'logo-mental8works-white.webp', width: 400 },
    { file: 'about-us.webp', width: 800 },
    { file: 'hero-banner.webp', width: 1000 }
];

async function resizeImages() {
    for (const task of tasks) {
        const filePath = path.join(imgDir, task.file);
        if (fs.existsSync(filePath)) {
            const tempPath = path.join(imgDir, 'temp-' + task.file);
            try {
                // Resize
                await sharp(filePath)
                    .resize({ width: task.width, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(tempPath);

                // Replace original
                fs.copyFileSync(tempPath, filePath);
                fs.unlinkSync(tempPath);
                console.log('Resized ' + task.file + ' to width ' + task.width);
            } catch (e) {
                console.error('Failed to resize ' + task.file, e);
            }
        }
    }
}

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

    // 1. Defer Cookie Consent CSS
    const cookieRegex = /<link rel="stylesheet" href="https:\/\/cdn\.jsdelivr\.net\/gh\/orestbida\/cookieconsent[^>]*>/g;
    html = html.replace(cookieRegex, (match) => {
        if (!match.includes('media="print"')) {
            changed = true;
            return match.replace(/rel="stylesheet"/, "rel=\"stylesheet\" media=\"print\" onload=\"this.media='all'\"");
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(file, html, 'utf8');
        console.log('Applied render block fixes to: ' + file);
    }
});

resizeImages().then(() => console.log('All image resizing tasks completed.'));
