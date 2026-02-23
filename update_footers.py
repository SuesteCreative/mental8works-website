import os
import re

# Precise footer template matching the user image
footer_template = """<footer class="footer reveal">
    <div class="container">
        <div class="footer-grid">
            <div class="footer-col">
                <a href="{home_link}" class="footer-logo-link">
                    <img src="{rel}assets/images/logo-mental8works-white.webp" alt="Mental8Works White Logo"
                        class="footer-logo-img">
                </a>
                <p style="opacity: 0.8; font-size: 0.9rem; margin-top: 1.5rem; max-width: 300px;">
                    Promovendo a saúde mental com excelência e humanidade desde 2014.
                </p>
            </div>
            
            <div class="footer-col">
                <h4 style="margin-bottom: 1.5rem; color: white; font-weight: 600;">Website</h4>
                <ul style="opacity: 0.9; list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;"><a href="{home_link}">Início</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="{services_link}">Serviços</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="{rel}about-us/index.html">Sobre Nós</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="{rel}team/index.html">Equipa</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="{rel}socios/index.html">Sócio</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="{rel}blog/index.html">Blog</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="{rel}agendamentos/index.html">Agendar</a></li>
                </ul>
            </div>
            
            <div class="footer-col">
                <h4 style="margin-bottom: 1.5rem; color: white; font-weight: 600;">Contactos</h4>
                <ul style="opacity: 0.9; list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;"><a href="mailto:mental8works@gmail.com">mental8works@gmail.com</a></li>
                    <li style="margin-bottom: 0.75rem; line-height: 1.6;">
                        Avenida Miguel Bombarda,<br>123, 2º piso,<br>1050-164 Lisboa
                    </li>
                </ul>
            </div>

            <div class="footer-col footer-social-col">
                <div class="footer-social-icons">
                    <a href="https://www.facebook.com/mental8works/" target="_blank" aria-label="Facebook">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <a href="https://www.instagram.com/mental8works/" target="_blank" aria-label="Instagram">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                    <a href="https://www.linkedin.com/company/mental8works/" target="_blank" aria-label="LinkedIn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                </div>
            </div>
        </div>

        <div class="footer-bottom" style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;">
            <div style="font-size: 0.85rem; opacity: 0.7;">
                &copy; 2026 Mental8Works &mdash; designed by
                <a href="https://sueste-creative.pt/" class="sueste-link" target="_blank" style="color: inherit; text-decoration: none;">
                    Sueste - Creative Agency
                    <span class="wave-brand">
                        <svg viewBox="0 0 60 10" preserveAspectRatio="none" style="width: 60px; height: 10px; display: inline-block; vertical-align: middle; margin-left: 4px;">
                            <path d="M0 5 Q 7.5 0, 15 5 T 30 5 T 45 5 T 60 5" fill="none" stroke="white" stroke-width="1"></path>
                        </svg>
                    </span>
                </a>. Todos os direitos reservados.
            </div>
            <div class="footer-bottom-links" style="display: flex; gap: 2rem; font-size: 0.85rem; opacity: 0.8;">
                <a href="#" style="color: white; text-decoration: none;">Política de Privacidade</a>
                <a href="#" style="color: white; text-decoration: none;">Termos e Condições</a>
                <a href="#" style="color: white; text-decoration: none;">Cookies</a>
                <a href="{rel}contactos/index.html" style="color: white; text-decoration: none;">Contactos</a>
            </div>
        </div>
    </div>
</footer>"""

def update_footer(filepath):
    rel_path = filepath.replace(os.getcwd() + os.sep, "")
    depth = rel_path.count(os.sep)
    rel = "../" * depth
    
    if rel_path == "index.html":
        home_link = "#home"
        services_link = "#services"
    else:
        home_link = rel + "index.html"
        services_link = rel + "index.html#services"
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_footer = footer_template.replace("{rel}", rel).replace("{home_link}", home_link).replace("{services_link}", services_link)
    
    if re.search(r'<footer.*?>.*?</footer>', content, flags=re.DOTALL):
        content = re.sub(r'<footer.*?>.*?</footer>', new_footer, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk(os.getcwd()):
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if '.git' in dirs:
        dirs.remove('.git')
    for file in files:
        if file.endswith('.html') and file != 'admin/index.html':
            filepath = os.path.join(root, file)
            update_footer(filepath)
