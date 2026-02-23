const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'data', 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
    const filePath = path.join(blogDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    // Change /assets/images/filename.png to /assets/images/blog/filename.png
    content = content.replace(/"image":\s*"\/(assets\/images)\/([^"]+)"/g, '"image": "/$1/blog/$2"');
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
