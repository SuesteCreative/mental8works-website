# REGRAS DO PROJECTO - MENTAL8WORKS

**IMPORTANTE: NENHUMA TAREFA PODE COMEÇAR SEM LER ESTE FICHEIRO.**

Este ficheiro é a fonte única de verdade (Single Source of Truth) do projecto. Qualquer instrução ou decisão técnica deve ser validada contra este documento.

## 1. Stack e Hosting Oficiais
- **Hospedagem:** Cloudflare Pages
- **Repositório:** GitHub (`SuesteCreative/mental8works-website`)
- **CMS:** Decap CMS (antigo Netlify CMS, mas configurado como decap-cms)
- **Autenticação CMS:** GitHub OAuth via Cloudflare Workers/Functions (localizado em `/functions/api/`)
- **Frontend:** HTML5, Vanilla CSS, Javascript (puro)
- **Build System:** Script customizado em Node.js (`scripts/build.js`)

## 2. Ferramentas Explicitamente PROIBIDAS
- **NETLIFY:** Proibido o uso de hosting, Netlify Identity, Netlify CLI ou qualquer ferramenta da Netlify. **SEM EXCEPÇÕES.**
- **TailwindCSS:** Não utilizar a menos que seja explicitamente solicitado pelo utilizador.

## 3. Regras Invioláveis
1. **Zero Netlify:** Qualquer detecção de código ou configuração Netlify deve ser removida e corrigida imediatamente.
2. **Build Local Prioritário:** O script `node scripts/build.js` deve ser executado localmente para validar alterações antes do push.
3. **Deploy via Git:** O deploy é feito exclusivamente através de `git push origin main`.
4. **Respeito às Âncoras:** Nunca remover ou alterar as âncoras de comentário (ex: `<!-- CMS_... -->`) que o script de build utiliza, a menos que seja para expandir o CMS.
5. **Consistência de Navbar/Footer:** Qualquer alteração no header ou footer deve ser feita através dos ficheiros na raiz e propagada via script de build para todas as subpáginas.

## 4. Fluxo de Trabalho
1. Ler este ficheiro (`PROJECT_RULES.md`).
2. Executar alterações no código.
3. Correr `node scripts/build.js`.
4. Verificar resultados localmente.
5. Fazer commit e `git push origin main`.

## 5. Re-anchor check (Obrigatório em cada resposta)
Todas as respostas devem terminar com esta validação:
- PROJECT_RULES.md lido
- Regras respeitadas
- Nenhuma violação detectada
