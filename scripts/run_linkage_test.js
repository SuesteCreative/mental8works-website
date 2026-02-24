const fs = require('fs');
const path = require('path');

const filesToTest = [
    {
        path: 'data/home.json',
        updates: { 'hero.title_prefix': 'TESTE DE LIGAÇÃO CMS' }
    },
    {
        path: 'data/about.json',
        updates: { 'hero.title': 'SOBRE TESTE' }
    },
    {
        path: 'data/socios.json',
        updates: { 'iban': 'IBAN TESTE 0000' }
    },
    {
        path: 'data/appointments.json',
        updates: { 'psychiatry.first': '999€' }
    },
    {
        path: 'data/settings.json',
        updates: { 'email': 'teste@exemplo.com' }
    }
];

filesToTest.forEach(test => {
    const fullPath = path.join(process.cwd(), test.path);
    if (fs.existsSync(fullPath)) {
        let data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

        for (const [key, value] of Object.entries(test.updates)) {
            const keys = key.split('.');
            let current = data;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
        }

        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
        console.log(`Updated ${test.path}`);
    }
});
