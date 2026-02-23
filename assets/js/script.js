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
    // Carousel Logic Removed - Reverted to Grid Layout

    // ── Hero Dynamic Word – smooth slide-clip animation ──────────────────
    const dynamicWord = document.getElementById('dynamic-word');
    if (dynamicWord) {
        const words = window.CMS_DYNAMIC_WORDS ||
            ["interior", "emocional", "mental", "pessoal", "pleno", "espiritual", "connosco"];
        let wordIndex = 0;
        let wordInterval;
        let animating = false;

        const cycleWord = () => {
            if (animating) return;
            animating = true;

            // slide out
            dynamicWord.classList.add('word-exit');

            setTimeout(() => {
                wordIndex = (wordIndex + 1) % words.length;
                dynamicWord.textContent = words[wordIndex];
                dynamicWord.classList.remove('word-exit');
                dynamicWord.classList.add('word-enter');

                setTimeout(() => {
                    dynamicWord.classList.remove('word-enter');
                    animating = false;
                }, 380);
            }, 380);
        };

        const startWordRotation = () => {
            if (wordInterval) return;
            wordInterval = setInterval(cycleWord, 2500);
        };
        const stopWordRotation = () => {
            clearInterval(wordInterval);
            wordInterval = null;
        };

        startWordRotation();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopWordRotation();
            else startWordRotation();
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
                const len = path.getTotalLength ? path.getTotalLength() : 300;

                path.style.strokeDasharray = len;
                path.style.strokeDashoffset = len;
                path.getBoundingClientRect();
                path.style.strokeDashoffset = 0;

                setTimeout(() => {
                    if (bubbles[idx]) bubbles[idx].classList.add('visible');
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
});
