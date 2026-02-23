// Global Functions for HTML interactions
window.openModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Mailto Form Handler
window.sendMail = function (e) {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const msg = document.getElementById('contactMessage').value;

    const subject = `Contacto Site: ${name}`;
    const body = `Nome: ${name}\nEmail: ${email}\n\n${msg}`;

    window.location.href = `mailto:mental8works@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Mental8Works Script Initialized v2.2');
    // Mobile Menu Toggle Logic
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const overlay = document.querySelector('.menu-overlay');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            if (overlay) overlay.classList.toggle('active');
        });

        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            });
        });

        // Close on overlay click
        if (overlay) {
            overlay.addEventListener('click', () => {
                navMenu.classList.remove('active');
                overlay.classList.remove('active');
            });
        }
    }

    // Smooth Scroll for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // If href is just # or empty, do nothing
            if (!targetId || targetId === "#") return;

            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                e.preventDefault();
                // Offset for fixed header (approx 80px)
                const headerOffset = 80;
                const elementPosition = targetSection.getBoundingClientRect().top;
                // Use window.scrollY instead of pageYOffset (deprecated)
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Safety check for mobile constraints to prevent overflow issues
    // Just a helper to ensure smooth experience
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            if (navMenu) navMenu.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        }
    });

    // ── Navbar transparent-on-top (landing page only) ────────────────────────
    const header = document.querySelector('.header');
    const path = window.location.pathname;
    const isLandingPage = path === '/' || path.endsWith('/index.html') && !path.includes('/blog/') && !path.includes('/about-us/') && !path.includes('/contactos/') && !path.includes('/agendamentos/') && !path.includes('/socios/') && !path.includes('/team/');

    if (header) {
        if (isLandingPage) {
            // Start transparent, transition to white on scroll
            const updateNavbar = () => {
                if (window.scrollY > 40) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            };
            window.addEventListener('scroll', updateNavbar, { passive: true });
            updateNavbar(); // initial check
        } else {
            // All other pages: always opaque
            header.classList.add('opaque');
        }
    }

    // Carousel Logic Removed - Reverted to Grid Layout

    // ── Hero Dynamic Word – smooth slide-clip animation ──────────────────
    const dynamicWord = document.getElementById('dynamic-word');
    if (dynamicWord) {
        const words = window.CMS_DYNAMIC_WORDS ||
            ["interior", "emocional", "mental", "pessoal", "pleno", "espiritual", "connosco"];
        let wordIndex = 0;
        let wordInterval;
        let animating = false;

        let loopsCompleted = 0;

        const cycleWord = () => {
            if (animating) return;
            animating = true;

            // slide out
            dynamicWord.classList.add('word-exit');

            setTimeout(() => {
                wordIndex = (wordIndex + 1) % words.length;

                // If we've returned to index 0, increment loop counter
                if (wordIndex === 0) {
                    loopsCompleted++;
                }

                dynamicWord.textContent = words[wordIndex];
                dynamicWord.classList.remove('word-exit');
                dynamicWord.classList.add('word-enter');

                setTimeout(() => {
                    dynamicWord.classList.remove('word-enter');
                    animating = false;

                    // Stop after one full loop is completed AND we are back at the first word
                    if (loopsCompleted >= 1 && wordIndex === 0) {
                        stopWordRotation();
                    }
                }, 380);
            }, 380);
        };

        const startWordRotation = () => {
            if (wordInterval || loopsCompleted >= 1) return;
            wordInterval = setInterval(cycleWord, 2500);
        };
        const stopWordRotation = () => {
            if (wordInterval) {
                clearInterval(wordInterval);
                wordInterval = null;
            }
        };

        // Initial start
        startWordRotation();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopWordRotation();
            else if (loopsCompleted < 1) startWordRotation();
        });
    }

    // ── Mission Section – scroll-driven tentacle diagram ─────────────────
    const missionVisual = document.getElementById('mission-visual');
    if (missionVisual) {
        const logo = document.getElementById('mission-logo');
        const paths = Array.from(missionVisual.querySelectorAll('.tentacle-line'));
        const bubbles = Array.from(missionVisual.querySelectorAll('.bubble-node'));

        const revealStep = (step) => {
            if (step === 0) {
                logo.classList.add('visible');
            } else if (step >= 1 && step <= paths.length) {
                const idx = step - 1;
                const path = paths[idx];
                const pulse = missionVisual.querySelector(`#pulse-${step}`);
                const len = path.getTotalLength ? path.getTotalLength() : 300;

                path.style.strokeDasharray = len;
                path.style.strokeDashoffset = len;
                path.getBoundingClientRect();
                path.style.strokeDashoffset = 0;

                setTimeout(() => {
                    if (bubbles[idx]) bubbles[idx].classList.add('visible');
                    if (pulse) pulse.classList.add('active');
                }, 600);
            }
        };

        const missionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const ratio = entry.intersectionRatio;

                if (ratio >= 0.10 && !logo.classList.contains('visible')) {
                    revealStep(0);
                }
                for (let i = 0; i < paths.length; i++) {
                    const threshold = 0.20 + i * 0.12;
                    if (ratio >= threshold && !paths[i].classList.contains('drawn')) {
                        paths[i].classList.add('drawn');
                        revealStep(i + 1);
                    }
                }
            });
        }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9] });

        missionObserver.observe(missionVisual);
    }

    // ── Intersection Observer for general Reveal on Scroll ────────────────
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // ── Cookie Consent Library (vanilla-cookieconsent) ──────────────────
    // This uses the professional library from CDN
    if (typeof CookieConsent !== 'undefined') {
        CookieConsent.run({
            revision: 2,
            guiOptions: {
                consentModal: {
                    layout: "cloud",
                    position: "bottom center",
                    equalWeightButtons: true,
                    flipButtons: false
                },
                preferencesModal: {
                    layout: "list",
                    position: "right",
                    equalWeightButtons: true,
                    flipButtons: false
                }
            },
            categories: {
                necessary: {
                    readOnly: true
                },
                analytics: {}
            },
            language: {
                default: "pt",
                autoDetect: "browser",
                translations: {
                    pt: {
                        consentModal: {
                            title: "Olá, respeitamos a sua privacidade! 🍪",
                            description: "Utilizamos cookies essenciais para o funcionamento do site. Se concordar, usaremos também cookies analíticos para melhorar a sua experiência.",
                            acceptAllBtn: "Aceitar Todas",
                            acceptNecessaryBtn: "Apenas Essenciais",
                            showPreferencesBtn: "Gerir preferências",
                            footer: `
                                <a href="/privacidade/index.html">Política de Privacidade</a>
                            `
                        },
                        preferencesModal: {
                            title: "Preferências de Cookies",
                            acceptAllBtn: "Aceitar Todas",
                            acceptNecessaryBtn: "Apenas Essenciais",
                            savePreferencesBtn: "Guardar definições",
                            closeIconLabel: "Fechar",
                            serviceCounterLabel: "Serviço|Serviços",
                            sections: [
                                {
                                    title: "Uso de Cookies",
                                    description: "Pode gerir as suas preferências sobre que cookies permitimos no nosso site."
                                },
                                {
                                    title: "Cookies Estritamente Necessários <span class=\"pm__badge\">Sempre Ativos</span>",
                                    description: "Essenciais para o funcionamento correto do site, como navegação e segurança.",
                                    linkedCategory: "necessary"
                                },
                                {
                                    title: "Cookies Analíticos",
                                    description: "Permitem-nos compreender como os visitantes interagem com o site, ajudando-nos a melhorar o serviço.",
                                    linkedCategory: "analytics"
                                },
                                {
                                    title: "Mais Informação",
                                    description: "Para qualquer dúvida sobre a nossa política de cookies, por favor contacte-nos."
                                }
                            ]
                        }
                    }
                }
            },
            onConsent: ({ cookie }) => {
                if (CookieConsent.acceptedCategory('analytics')) {
                    window.dispatchEvent(new Event('cookies-accepted'));
                }
            }
        });
    }
});
