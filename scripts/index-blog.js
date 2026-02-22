
import fs from 'fs';
import path from 'path';

const blogDir = './data/blog';
const outputFile = './data/blog-index.json';

// Garantir que a pasta existe
if (!fs.existsSync(blogDir)) {
    console.error(`Erro: Pasta ${blogDir} não encontrada.`);
    process.exit(1);
}

const files = fs.readdirSync(blogDir);
const posts = files
    .filter(file => file.endsWith('.json'))
    .map(file => {
        const content = JSON.parse(fs.readFileSync(path.join(blogDir, file), 'utf8'));
        return {
            title: content.title,
            date: content.date,
            image: content.image,
            summary: content.summary,
            slug: file.replace('.json', '')
        };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
console.log(`Blog indexado: ${posts.length} artigos encontrados em ${outputFile}`);
