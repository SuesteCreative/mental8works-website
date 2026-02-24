const fs = require('fs');
const path = require('path');

// 1. Update admin/config.yml
const configPath = path.join(__dirname, '..', 'admin', 'config.yml');
let config = fs.readFileSync(configPath, 'utf8');

const newFaqField = `
          - label: "Perguntas Frequentes (FAQs)"
            name: "faqs"
            widget: "list"
            label_singular: "Pergunta"
            field:
              label: "FAQ"
              name: "faq"
              widget: "object"
              fields:
                - {label: "Pergunta", name: "question", widget: "string"}
                - {label: "Resposta", name: "answer", widget: "markdown"}
      - name: "socios"`;

if (!config.includes('name: "faqs"')) {
    config = config.replace('      - name: "socios"', newFaqField);
    fs.writeFileSync(configPath, config, 'utf8');
}

// 2. Update data/appointments.json
const dataPath = path.join(__dirname, '..', 'data', 'appointments.json');
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

if (!data.faqs) {
    data.faqs = [
        {
            faq: {
                question: "Realizam consultas de psicologia online?",
                answer: "Sim! Na Mental8Works garantimos excelentes resultados através de **consultas de psicologia online** ou presenciais (nas nossas instalações em Campolide, Lisboa). Independentemente do formato, será sempre acompanhado por um psicólogo especializado de forma rígida e confidencial."
            }
        },
        {
            faq: {
                question: "Qual é o preço da consulta de psicologia?",
                answer: "O **preço da primeira consulta de psicologia** e triagem tem o valor base de 55€, sendo que as sessões seguintes são substancialmente ajustadas e fixadas nos 45€. Pode conferir o preçário tabelado em detalhe na grelha comparativa no topo desta página."
            }
        },
        {
            faq: {
                question: "De que forma as consultas são mais baratas ou acessíveis a quem precisa?",
                answer: "Sendo a Mental8Works uma Associação de saúde mental sem fins lucrativos, lutamos por uma rede inclusiva médica. É por isso que aplicamos condições de **Preço Social** (descidas que podem chegar a 10 euros por consulta no ato do pagamento) destinadas a pessoas desempregadas, de baixa médica ou estudantes em dificuldades. Consulte o nosso plano de Valores Sociais."
            }
        },
        {
            faq: {
                question: "Qual o valor da consulta de psiquiatria?",
                answer: "Para a área de especialidade médica de acompanhamento contínuo, a consulta de psiquiatria arranca a partir dos 60€ (Avaliação base/Diagnóstico), fixando-se também a valores muito inferiores no regime de tratamento contínuo ou abrigo social."
            }
        }
    ];
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf8');
}

// 3. Update agendamentos/index.html
const htmlPath = path.join(__dirname, '..', 'agendamentos', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

if (!html.includes('<!-- CMS_APPOINTMENTS_FAQS -->')) {
    html = html.replace('<div class="faq-container">', '<!-- CMS_APPOINTMENTS_FAQS -->\n            <div class="faq-container">');
    html = html.replace('</div>\n        </div>\n    </section>', '</div>\n            <!-- END_CMS_APPOINTMENTS_FAQS -->\n        </div>\n    </section>');
    fs.writeFileSync(htmlPath, html, 'utf8');
}

// 4. Update scripts/build.js
const buildPath = path.join(__dirname, '..', 'scripts', 'build.js');
let buildJs = fs.readFileSync(buildPath, 'utf8');

const buildFaqLogic = `
    if (data.faqs) {
        let faqsHtml = '<!-- CMS_APPOINTMENTS_FAQS -->\\n            <div class="faq-container">\\n';
        data.faqs.forEach(f => {
            const mdAnswer = f.faq.answer
                .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
                .replace(/\\*(.*?)\\*/g, '<em>$1</em>');
                
            faqsHtml += \`                <div class="faq-item">
                    <button class="faq-question">
                        \${f.faq.question}
                        <svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <div class="faq-answer">
                        <p>\${mdAnswer}</p>
                    </div>
                </div>\\n\`;
        });
        faqsHtml += '            </div>\\n            <!-- END_CMS_APPOINTMENTS_FAQS -->';
        
        html = html.replace(/<!-- CMS_APPOINTMENTS_FAQS -->[\\s\\S]*?<!-- END_CMS_APPOINTMENTS_FAQS -->/, faqsHtml);
    }
`;

if (!buildJs.includes('// Build FAQS logic snippet')) {
    buildJs = buildJs.replace("if (data.social_info)", "// Build FAQS logic snippet\n    " + buildFaqLogic + "\n    if (data.social_info)");
    fs.writeFileSync(buildPath, buildJs, 'utf8');
}

console.log('CMS updated with FAQS section.');
