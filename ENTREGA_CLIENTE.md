# Checklist de Entrega Final - Mental8Works

Este documento contém todos os passos vitais para configurar o ambiente do cliente e finalizar a ligação entre os serviços de terceiros e o código desenvolvido.

---

## 🔒 1. Acesso ao Backoffice (Decap CMS)
*Para que o cliente consiga gerir o Blog, a Equipa e as Páginas em `mental8works.pt/admin`.*

- [ ] **1.** Pedir ao cliente para criar uma conta gratuita no [GitHub](https://github.com/).
- [ ] **2.** Pedir ao cliente que faculte o *username* escolhido.
- [ ] **3.** Ir ao repositório no GitHub (`SuesteCreative/mental8works-website`).
- [ ] **4.** Aceder a `Settings` > `Collaborators` > `Add people` e convidar o *username* do cliente.
- [ ] **5.** O cliente deve aceitar o convite (recebido no email do GitHub).
- [ ] **6.** Confirmar se o cliente já acede sem erros via `mental8works.pt/admin` autenticando-se com o botão _"Login with GitHub"_.

---

## ✉️ 2. Ativação dos Formulários (FormSubmit)
*O formulário de contactos envia emails para `mental8works@gmail.com`, mas precisa de permissão inicial do recetor.*

- [ ] **1.** O Pedro ou o Cliente devem ir à página real do site que contém o formulário.
- [ ] **2.** Preencher os campos com dados de "TESTE" e carregar no botão Enviar.
- [ ] **3.** Avisar o cliente para ir urgentemente à caixa de correio do Gmail (`mental8works@gmail.com`).
- [ ] **4.** Procurar por um email automático da plataforma "FormSubmit".
- [ ] **5.** **Clicar no grande botão verde "Activate Form"** que está no email. A partir desse segundo mágico, caem lá todos os contactos.

---

## 🔍 3. Indexação e SEO (Google Search Console)
*Garantir que o Google "vê" toda a performance brutal e a acessibilidade instaladas esta semana.*

- [ ] **1.** Entrar na [Google Search Console](https://search.google.com/search-console).
- [ ] **2.** Adicionar ou validar a propriedade com o URL: `https://mental8works.pt`.
- [ ] **3.** Conceder acesso à conta de email do cliente (para o cliente ver gráficos das visitas nas pesquisas).
- [ ] **4.** Aceder ao menu lateral esquerdo em **Sitemaps**.
- [ ] **5.** Inserir o endereço exato do sitemap que atualizámos: `https://mental8works.pt/sitemap.xml` e clicar "Submeter".
- [ ] **6.** Pedir inspeção/indexação forçada da página inicial para que o motor Google Search reconheça rapidamente as schemas internas e mostre FAQs e LocalBusiness.

---

## 📍 4. Google My Business (Ficha de Empresa / Google Maps)
*Capitalizar sobre a tecnologia de Schema "LocalBusiness" injetada invisivelmente.*

- [ ] **1.** O cliente deve ter a Ficha de Perfil de Empresa do Google atualizada e validada.
- [ ] **2.** Introduzir (ou atualizar) rigorosamente o link `https://mental8works.pt` dentro das definições do Perfil My Business, criando a ponte técnica perfeita para as pesquisas nas imediações da clínica.

---

## 🤝 5. Formação Rápida ao Cliente (Expectativas)
*Pontos rápidos a explicar na reunião de passagem da chave (ou num email):*

- [ ] **Sistema em Tempo Real vs. Nuvem:** Isto não é Wordpress. A arquitetura de ponta significa que, quando clicam em "Guardar / Publicar" num artigo, o servidor da Cloudflare precisa de cerca de **2 a 3 minutos** para compilar, reconstruir ficheiros e esmagar fotografias pesadas. Têm de publicar, esperar calmamente sem atualizar 5 vezes a página, e o conteúdo surgirá rápido como a luz.
- [ ] **A Vacina de Imagens:** Podem atirar fotos para dentro do sistema vindas de câmaras fotográficas ou iPhones até 10 MB. O nosso robô está configurado para comprimir e converter essa foto instantaneamente ao publicar para ficar com poucos *Kilobytes*, poupando de vez o limite dos telemóveis dos clientes deles.
- [ ] **Fotos da Equipa:** Apenas uma dica técnica — submeter idealmente as fotos da Equipa centralizadas e o mais quadradas possíveis, para a moldura circular do site assumir o rosto com primor.
