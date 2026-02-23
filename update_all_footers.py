import os
import re

footer_template = """        <div class="footer-grid">
            <div class="footer-col">
                <a href="{root}index.html" class="footer-logo-link">
                    <img src="{root}assets/images/logo-mental8works-white.webp" alt="Mental8Works White Logo" class="footer-logo-img">
                </a>
                <p style="opacity: 0.8; font-size: 0.9rem; margin-top: 1.5rem; line-height: 1.6;">
                    Promovendo a saúde mental com excelência e humanidade desde 2014. Uma associação dedicada ao seu bem-estar.
                </p>
                <div class="footer-social-icons" style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                    <a href="https://www.facebook.com/mental8works/" target="_blank" aria-label="Facebook">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <a href="https://www.instagram.com/mental8works/" target="_blank" aria-label="Instagram">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                    <a href="https://www.linkedin.com/company/mental8works/" target="_blank" aria-label="LinkedIn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                </div>
            </div>
            
            <div class="footer-col">
                <h4 style="margin-bottom: 1.5rem; color: white; font-weight: 600; font-size: 1.1rem; border-bottom: 2px solid var(--color-primary); display: inline-block; padding-bottom: 5px;">Empresa</h4>
                <ul style="opacity: 0.9; list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;"><a href="{root}index.html">Início</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="{root}about-us/index.html">Sobre Nós</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="{root}team/index.html">Equipa</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="{root}socios/index.html">Sócio</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h4 style="margin-bottom: 1.5rem; color: white; font-weight: 600; font-size: 1.1rem; border-bottom: 2px solid var(--color-primary); display: inline-block; padding-bottom: 5px;">Intervenção</h4>
                <ul style="opacity: 0.9; list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;"><a href="{root}index.html#services">Serviços</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="{root}blog/index.html">Blog</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="{root}agendamentos/index.html">Agendamentos</a></li>
                </ul>
            </div>
            
            <div class="footer-col">
                <h4 style="margin-bottom: 1.5rem; color: white; font-weight: 600; font-size: 1.1rem; border-bottom: 2px solid var(--color-primary); display: inline-block; padding-bottom: 5px;">Contactos</h4>
                <ul style="opacity: 0.9; list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        <a href="mailto:mental8works@gmail.com">mental8works@gmail.com</a>
                    </li>
                    <li style="margin-bottom: 0.75rem; line-height: 1.6; display: flex; align-items: flex-start; gap: 8px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span>Av. Miguel Bombarda,<br>123, 2º piso,<br>1050-164 Lisboa</span>
                    </li>
                </ul>
            </div>
        </div>"""

def update_footer(file_path):
    print(f"Checking: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Calculate depth
    rel_path = os.path.relpath(file_path, base_dir)
    depth = rel_path.count(os.sep)
    root = "../" * depth if depth > 0 else "./"
    
    new_footer_grid = footer_template.format(root=root)
    
    # Replace the footer-grid div
    # We look for the start of footer-grid and the end of its parent container's first child part
    pattern = re.compile(r'<div class="footer-grid">.*?</div>\s*</div>', re.DOTALL)
    
    new_content = pattern.sub(new_footer_grid + "\n        </div>", content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(new_content)
        print(f"Updated: {file_path}")
    else:
        print(f"No changes for: {file_path}")

base_dir = r'c:\Users\pedro\Downloads\mental8works'
for root_dir, dirs, files in os.walk(base_dir):
    # Skip .git and node_modules
    if '.git' in dirs: dirs.remove('.git')
    for file in files:
        if file.endswith('.html'):
            update_footer(os.path.join(root_dir, file))
