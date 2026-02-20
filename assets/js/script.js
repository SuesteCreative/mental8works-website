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

    // Hero Dynamic Title Word changing logic
    const dynamicWord = document.getElementById('dynamic-word');
    if (dynamicWord) {
        const words = ["emocional", "pessoal", "mental", "pleno", "espiritual", "connosco", "interior"];
        let wordIndex = 0;
        let wordInterval;

        const startWordRotation = () => {
            if (wordInterval) return;
            wordInterval = setInterval(changeWord, 2000);
        };

        const stopWordRotation = () => {
            clearInterval(wordInterval);
            wordInterval = null;
        };

        const changeWord = () => {
            dynamicWord.style.opacity = '0';
            dynamicWord.style.transition = 'opacity 0.4s ease';

            setTimeout(() => {
                dynamicWord.textContent = words[wordIndex % words.length];
                dynamicWord.style.opacity = '1';
                wordIndex++;
            }, 400);
        };

        // Initialize
        startWordRotation();

        // Pause rotation when page is not visible to save main thread on mobile
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopWordRotation();
            } else {
                startWordRotation();
            }
        });

        // Also stop on pagehide
        window.addEventListener('pagehide', stopWordRotation);
    }

    // Intersection Observer for Reveal on Scroll
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
