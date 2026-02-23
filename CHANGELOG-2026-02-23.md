# Relatório de Alterações — Sessão Claude Sonnet (23 Fev 2026)

---

## 1. `about-us/index.html`

### Gráfico "Componente Social"
- **Problema:** As labels de anos (2014, 2019, 2026) e valores (1200+, etc.) ficavam cortadas/sobrepostas porque usavam `position: absolute` com `bottom: -25px` sem espaço suficiente
- **Correção:** Reorganização do padding do gráfico (`padding: 3rem 2rem 3.5rem 3rem`), remoção do label rotacionado, `margin-bottom: 2rem` na área das barras, labels posicionadas corretamente (valor em cima, ano em baixo)

### Subtítulo "Órgãos Sociais"
- **Problema:** "A estrutura que garante o rigor e a transparência..." não estava centrada
- **Correção:** Adicionado `text-align: center` ao `<p>` do subtítulo

### Tags `</p>` duplicadas
- **Problema:** Os cards da Assembleia Geral e Conselho Fiscal tinham 7 tags `</p>` extra (bug do `build.js`)
- **Correção:** HTML limpo manualmente; causa raiz corrigida no `build.js`

---

## 2. `scripts/build.js`

### Correção do regex `buildAboutUsPage()`
- **Problema:** O regex substituía o conteúdo do Assembleia/Conselho mas não fechava os tags `</div></div>`, deixando HTML inválido com `</p>` a multiplicar a cada build
- **Correção:** Regex alargado para capturar o bloco completo `</div>\s*</div>` e substituir com HTML bem formado e fechado corretamente

### Nova função `buildBlogPreview()`
- **Adicionado:** Função que lê os artigos de `data/blog/`, ordena por data, exclui posts sem título, e injeta os 3 mais recentes na homepage via comentários âncora `<!-- CMS_BLOG_PREVIEW -->`
- O post de teste `odeio-segundas` é explicitamente excluído pelo `_filename`

### Correção do regex `buildHomePage()` — `title_prefix`
- **Problema:** O regex `/(\\<h1\\>)([^<]*?)(\\<br\\>)/` usava escapamentos incorretos e falha silenciosamente
- **Correção:** `(<h1>[^<]*?)(<br>)` — mais robusto e sem duplo escape

### Pipeline de build atualizado
```
buildTeamPage()
  → buildBlogIndex()
  → buildHomePage()
  → buildBlogPreview()   ← novo
  → buildAboutUsPage()
  → syncSettings()
```

---

## 3. `contactos/index.html`

### Formulário de contacto
- **Problema:** O `action` apontava para `https://formspree.io/f/mental8works@gmail.com` — endereço inválido (Formspree requer um ID hash, não um email)
- **Correção:** Substituído por `onsubmit="sendMail(event)"` (usa o cliente de email nativo)
- **IDs adicionados** aos campos: `contactName`, `contactEmail`, `contactMessage`
- **Link da política de privacidade** corrigido: `./privacidade/` → `../privacidade/`

---

## 4. `index.html` (Homepage)

### Blog Preview dinâmico
- **Problema:** Os 3 cards do blog eram hardcoded com caminhos errados (`/index.html` em vez de `.html`) e conteúdo desatualizado que não refletia o CMS
- **Correção:** Substituídos por âncoras que o `build.js` povoa automaticamente:
  ```html
  <!-- CMS_BLOG_PREVIEW -->
  <!-- END_CMS_BLOG_PREVIEW -->
  ```
- A cada build, os 3 artigos mais recentes do CMS aparecem automaticamente na homepage

---

## 5. `socios/index.html` (Sócio)

### Conteúdo Invisível
- **Problema:** O texto estava guardado no HTML da página mas aparecia em branco no site. O CSS usava classes `.reveal` (opacidade zero). Como a página terminava de repente, faltava o tag `</body>` e a inclusão do `assets/js/script.js`. Assim a animação do script (que retira a invisibilidade) nunca era despoletada.
- **Correção:** Adicionadas a fecho do ficheiro `</script>` com o respectivo JavaScript e a tag de encerramento html `</body>\n</html>`.

### Design e Alinhamentos Desconfigurados
- **Problema Geral:** A página exibia lacunas falsas e blocos vazios à esquerda porque o CSS (`grid-cards`) estritamente impunha largura, enquanto o texto global da classe `section` forçava `text-align: left` em ecrãs com largura superior a 900px, contrariando o `text-center`. Além disso, a simetria ilusória formava falsas colunas de texto desalinhado nas quebras de linha automáticas.
- **Correções aplicadas:**
  - Substituiu-se a opacidade falha do Display Grid por CSS Flexbox na galeria de cartões inferior (`display: flex; justify-content: center;`).
  - Estabeleceu-se uma relação paramétrica nos cartões de Apoio e Tarifa Social para dividirem sempre 50/50 o Desktop (`flex: 1 1 320px`) e quebrarem empilhados no ecrã de telemóvel.
  - O cartão IBAN inferior absorveu a mesma classe de largura máxima (`max-width: 960px; width: 100%`) para fechar visualmente o fundo e manter as arestas dos 2 cartões paralelos em cima.
  - Todos os blocos de leitura (como o "Impacto do seu Apoio") receberam declaração expressa de `margin: 0 auto; text-align: center;` com quebras lineares manuais de HTML (`<br class="d-none d-md-block">`) para contornar qualquer dependência em cadeia ou ilusões de ótica com o layout anterior.

---

## 6. `privacidade/index.html` & Cookies
- **Problema:** O banner de cookies antigo tinha apenas o botão "Aceitar", forçando os utilizadores a aceitarem tudo sem alternativa. Na página da Política omitia-se detalhes sobre opções de cookies.
- **Correção:** O banner em `assets/js/script.js` foi redesenhado para ter os botões "Aceitar Todas" e "Apenas Essenciais" (conforme regulamentos do RGPD/ePrivacy). O clique dispara de forma independente a gravação do `localStorage`.
- **Política Atualizada:** O texto da cláusula "6. Cookies" na página de Privacidade foi modificado para diferenciar as Cookies Essenciais das Analíticas.

---

## 7. Ficheiros eliminados

| Ficheiro | Motivo |
|---|---|
| `data/blog/odeio-segundas.json` | Post de teste publicado acidentalmente |
| `blog/posts/odeio-segundas.html` | HTML gerado do post de teste |

---

## 8. Ficheiro auxiliar criado

| Ficheiro | Propósito |
|---|---|
| `scripts/fix-blog-preview.js` | Script one-time usado para injetar as âncoras CMS no `index.html` de forma segura sem corromper o resto do ficheiro |

---

## 9. Cloudflare Pages — Configuração

- **Problema raiz:** O Build command estava **vazio** no Cloudflare Pages, logo o `npm run build` nunca corria após commits do CMS — o site nunca refletia as alterações do backoffice
- **Solução:** Configurar no painel Cloudflare Pages → Settings → Builds & Deployments:

| Campo | Valor |
|---|---|
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `/` |

---

## 10. Commits realizados

```
8c6af6c  fix: about-us graph, subtitle, duplicate tags, contact form, address sync, build.js Assembleia/Conselho regex
[...]    fix: homepage blog preview dynamic from CMS, removed test post 'odeio-segundas', buildBlogPreview()
618b80c  build: regenerate HTML with CMS changes (Encontre a sua paz hero, blog preview)
```

---

## 11. SEO & Metadados (Fase 2)

### Dados Estruturados (JSON-LD)
- **Implementação:** Adicionado esquema `MedicalOrganization` e `LocalBusiness` em todas as páginas principais e utilitárias.
- **Automação:** O `scripts/build.js` agora gera e sincroniza automaticamente o schema JSON-LD com base nas definições de `data/settings.json`.

### Correções de Metadados
- **Localização:** Substituídas todas as referências residuais à morada antiga (Av. Miguel Bombarda) nos meta tags de descrição pela morada atual na **Rua de Campolide**.
- **Sitemap Inteligente:** O script de build agora regenera o `sitemap.xml` incluindo automaticamente os novos slugs de artigos do blog.

---

## 12. Rodapé (Footer) e Uniformização Global

### Redesign do Footer
- **Estética:** Altura reduzida (padding de 3rem) e layout mais limpo.
- **Redes Sociais:** Ícones movidos da coluna principal para a coluna de **Contactos**, posicionados logo abaixo da morada para melhor hierarquia de informação.
- **Créditos:** Texto de copyright e créditos padronizado com a **restauração do efeito de animação da "onda"** no link da Sueste Creative Agency.

### Sincronização em Escala
- **Inovação:** Criada a função `syncFooter()` no `build.js` que percorre **todos** os ficheiros HTML do projeto e injeta o rodapé atualizado. Isto garante 100% de consistência entre páginas de serviços, blog e políticas de privacidade.

---

## 13. Refinamentos de UI/UX

### Landing Page (index.html)
- **Navegação:** Adicionado botão **"Saber Mais"** na secção "Sobre Nós" ligando à página institucional completa.
- **Visual:** Restaurado o ícone do envelope no campo de email da secção de contactos.

### Formulários e Alinhamento
- **Filtro de Contactos:** Adicionada a opção **"Sócios"** ao dropdown de assuntos no formulário de contacto.
- **Fix "Sobre Nós":** Corrigido o alinhamento e centragem absoluta do subtítulo dos "Órgãos Sociais" (CSS fix + HTML cleanup).

---

## 14. Commits realizados (Fase 2)

```
06fb7eb  chore(seo): implemented sitewide JSON-LD schema and updated sitemap generation
2b9c122  fix: user requests - footer redesign, about-us alignment, and landing page button
22da0ed  fix: landing page about us button
9bc8cd2  fix: restored sueste wave brand effect in footer
```

---

*Gerado/Atualizado em 2026-02-23 às 22:20 UTC*
