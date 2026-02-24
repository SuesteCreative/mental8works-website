const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'agendamentos', 'index.html');
let html = fs.readFileSync(targetPath, 'utf8');

// 1. Update descriptions for SEO
html = html.replace('content="Agende a sua consulta de psicologia ou psiquiatria na Mental8Works. Atendimento presencial em Lisboa e online. Preço social disponível."',
    'content="Agende a sua consulta de psicologia ou psiquiatria online ou presencial em Lisboa. A Mental8Works disponibiliza também consultas a preços acessíveis e tarifa social."');

html = html.replace('content="Agende a sua consulta de psicologia ou psiquiatria. Atendimento presencial em Lisboa e online. Preço social disponível."',
    'content="Agende a sua consulta de psicologia ou psiquiatria. Atendimento presencial em Lisboa e online. Tarifas sociais e preços acessíveis."');

// 2. Add FAQS Stylesheet
if (!html.includes('faqs.css')) {
    html = html.replace('<link rel="stylesheet" href="../assets/css/styles.css?v=2.5">',
        '<link rel="stylesheet" href="../assets/css/styles.css?v=2.5">\n    <link rel="stylesheet" href="../assets/css/faqs.css">');
}

// 3. Inject FAQ HTML 
const faqHtml = `

    <!-- FAQs SEO -->
    <section class="section reveal" style="padding-top: 2rem; padding-bottom: 5rem; background-color: var(--color-surface); z-index: 2; position: relative;">
        <div class="container" style="max-width: 800px;">
            <div style="text-align: center; margin-bottom: 2.5rem;">
                <h2 style="font-size: 2rem; color: var(--color-primary); font-family: var(--font-serif);">Perguntas Frequentes</h2>
                <p style="color: var(--color-text-main); font-size: 1.1rem; opacity: 0.9;">Tudo o que precisa de saber para iniciar o acompanhamento clínico associativo.</p>
            </div>

            <div class="faq-container">
                <div class="faq-item">
                    <button class="faq-question">
                        Realizam consultas de psicologia online?
                        <svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <div class="faq-answer">
                        <p>Sim! Na Mental8Works garantimos excelentes resultados através de <strong>consultas de psicologia online</strong> ou presenciais (nas nossas instalações em Campolide, Lisboa). Independentemente do formato, será sempre acompanhado por um psicólogo especializado de forma confidencial.</p>
                    </div>
                </div>

                <div class="faq-item">
                    <button class="faq-question">
                        Qual é o preço da consulta de psicologia face à de psiquiatria?
                        <svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <div class="faq-answer">
                        <p>O <strong>preço base da primeira consulta de psicologia</strong> ronda os 55€, ao passo que a primeira avaliação base em psiquiatria tem o custo de 60€. Todavia, os valores ajustam-se bastante nas sessões seguintes e prevemos reduções diretas de tarifa para a tabela social. Consulte a demonstração de preços acima na íntegra para preparar o seu plano.</p>
                    </div>
                </div>

                <div class="faq-item">
                    <button class="faq-question">
                        De que forma as consultas são mais baratas ou acessíveis a quem precisa?
                        <svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <div class="faq-answer">
                        <p>Sendo a Mental8Works uma Associação sem fins lucrativos, lutamos por uma rede inclusiva médica. É por isso que aplicamos condições de <strong>Preço Social</strong> tornando o acompanhamento clínico acessível para Estudantes, Trabalhador-Estudantes, desempregados ou utentes de baixa médica com descidas acentuadas.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
`;

if (!html.includes('<!-- FAQs SEO -->')) {
    html = html.replace('</section>\n\n    <!-- Footer -->', '</section>' + faqHtml + '\n\n    <!-- Footer -->');
}

fs.writeFileSync(targetPath, html, 'utf8');

// 4. Inject script logic for Accordion
const jsPath = path.join(__dirname, '..', 'assets', 'js', 'script.js');
let js = fs.readFileSync(jsPath, 'utf8');
if (!js.includes('FAQs Accordion')) {
    const faqJs = `
    // ── FAQs Accordion ────────────────────────────────────
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
    js = js + faqJs;
    fs.writeFileSync(jsPath, js, 'utf8');
}
console.log('Done injecting FAQs SEO package');
