const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '..', 'assets', 'images');

async function processDirectory(dirToProcess) {
    const files = fs.readdirSync(dirToProcess);

    for (const file of files) {
        if (file.endsWith('.temp') || file.endsWith('.opt.webp')) continue;

        const filePath = path.join(dirToProcess, file);
        if (!fs.existsSync(filePath)) continue;

        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            await processDirectory(filePath);
        } else {
            // Process images
            await optimizeImage(filePath, stats);
        }
    }
}

async function optimizeImage(filePath, stats) {
    const ext = path.extname(filePath).toLowerCase();

    // Only target common heavy image formats
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        return;
    }

    // Skip extremely small images to avoid artifacts/unnecessary work
    if (stats.size < 20 * 1024) {
        return;
    }

    try {
        // Read into buffer to avoid Windows file locks on the source file
        const fileBuffer = fs.readFileSync(filePath);
        const metadata = await sharp(fileBuffer).metadata();
        let sharpObj = sharp(fileBuffer);
        let resized = false; // Add a tracking variable

        // Resize images if extremely large, standard limit suitable for web
        if (metadata.width > 1200) {
            sharpObj = sharpObj.resize({ width: 1200, withoutEnlargement: true });
            resized = true;
        }

        const tempFilePathOrig = filePath + '.temp';

        // 1. Optimize as the EXACT SAME FORMAT to not break CMS references
        if (ext === '.png') {
            await sharpObj.png({ quality: 80, compressionLevel: 8 }).toFile(tempFilePathOrig);
        } else if (ext === '.jpg' || ext === '.jpeg') {
            await sharpObj.jpeg({ quality: 80, mozjpeg: true }).toFile(tempFilePathOrig);
        } else if (ext === '.webp') {
            await sharpObj.webp({ quality: 80, effort: 4 }).toFile(tempFilePathOrig);
        }

        if (!fs.existsSync(tempFilePathOrig)) {
            return;
        }

        const newStats = fs.statSync(tempFilePathOrig);

        // Only commit the overwrite if we made it smaller
        // E.g. save at least 10% of space
        if (resized || newStats.size < stats.size * 0.90) {
            fs.copyFileSync(tempFilePathOrig, filePath);
            console.log(`✅ Optimized ${path.basename(filePath)} (${path.basename(path.dirname(filePath))}): ${(stats.size / 1024).toFixed(1)}KB -> ${(newStats.size / 1024).toFixed(1)}KB`);
        }

        // Cleanup
        if (fs.existsSync(tempFilePathOrig)) fs.unlinkSync(tempFilePathOrig);

    } catch (err) {
        // Some images might not be valid or might fail
        console.warn(`⚠️ Skipped ${path.basename(filePath)} (Could not optimize: ${err.message})`);
    }
}

// Run It
console.log('--- Starting Image Compression & Sanitization ---');
processDirectory(imgDir)
    .then(() => {
        console.log('--- Finished Image Optimizations ---');
    })
    .catch(console.error);
