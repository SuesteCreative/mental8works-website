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

---

## 6. Ficheiros eliminados

| Ficheiro | Motivo |
|---|---|
| `data/blog/odeio-segundas.json` | Post de teste publicado acidentalmente |
| `blog/posts/odeio-segundas.html` | HTML gerado do post de teste |

---

## 6. Ficheiro auxiliar criado

| Ficheiro | Propósito |
|---|---|
| `scripts/fix-blog-preview.js` | Script one-time usado para injetar as âncoras CMS no `index.html` de forma segura sem corromper o resto do ficheiro |

---

## 8. Cloudflare Pages — Configuração

- **Problema raiz:** O Build command estava **vazio** no Cloudflare Pages, logo o `npm run build` nunca corria após commits do CMS — o site nunca refletia as alterações do backoffice
- **Solução:** Configurar no painel Cloudflare Pages → Settings → Builds & Deployments:

| Campo | Valor |
|---|---|
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `/` |

---

## 9. Commits realizados

```
8c6af6c  fix: about-us graph, subtitle, duplicate tags, contact form, address sync, build.js Assembleia/Conselho regex
[...]    fix: homepage blog preview dynamic from CMS, removed test post 'odeio-segundas', buildBlogPreview()
618b80c  build: regenerate HTML with CMS changes (Encontre a sua paz hero, blog preview)
```

---

*Gerado em 2026-02-23 às 18:52 UTC*
