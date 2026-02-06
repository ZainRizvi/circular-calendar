/**
 * Intuitive Islamic Circle Calendar - Landing Page Scripts
 * Handles animations, interactions, and scroll effects
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initScrollAnimations();
    initNavbarScroll();
    initCalendarAnimation();
    initFAQAccordion();
    initSmoothScroll();
});

/**
 * Scroll-triggered animations using Intersection Observer
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.section-header, .feature-card, .benefit-item, .testimonial-card, ' +
        '.package-item, .faq-item, .problem-content, .quote-card'
    );

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the animation based on element position
                const delay = index * 50;
                entry.target.style.transitionDelay = `${delay}ms`;
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add initial styles and observe
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add CSS for the animated state
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Navbar background change on scroll
 */
function initNavbarScroll() {
    const nav = document.querySelector('.nav');
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateNav = () => {
        const scrollY = window.scrollY;

        if (scrollY > 100) {
            nav.style.backgroundColor = 'rgba(250, 247, 242, 0.95)';
            nav.style.boxShadow = '0 2px 20px rgba(60, 46, 36, 0.08)';
        } else {
            nav.style.backgroundColor = 'rgba(250, 247, 242, 0.85)';
            nav.style.boxShadow = 'none';
        }

        lastScrollY = scrollY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNav);
            ticking = true;
        }
    }, { passive: true });
}

/**
 * Interactive calendar preview animation
 */
function initCalendarAnimation() {
    const calendarPreview = document.querySelector('.calendar-preview');
    if (!calendarPreview) return;

    const arrow = calendarPreview.querySelector('.calendar-arrow');
    if (!arrow) return;

    let currentAngle = -90; // Start at top (January)
    let targetAngle = -90;
    let animating = false;

    // Slowly rotate the arrow to simulate time passing
    const rotateArrow = () => {
        targetAngle += 0.5; // Move half a degree
        if (targetAngle >= 270) targetAngle = -90; // Reset after full rotation

        const animate = () => {
            const diff = targetAngle - currentAngle;
            currentAngle += diff * 0.1;

            arrow.style.transform = `rotate(${currentAngle}deg)`;

            if (Math.abs(diff) > 0.1) {
                requestAnimationFrame(animate);
            }
        };

        if (!animating) {
            animating = true;
            animate();
            setTimeout(() => { animating = false; }, 100);
        }
    };

    // Rotate every 3 seconds
    setInterval(rotateArrow, 3000);

    // Add hover interaction
    calendarPreview.addEventListener('mouseenter', () => {
        calendarPreview.style.animationPlayState = 'paused';
    });

    calendarPreview.addEventListener('mouseleave', () => {
        calendarPreview.style.animationPlayState = 'running';
    });
}

/**
 * FAQ accordion enhancement
 */
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const summary = item.querySelector('summary');
        const answer = item.querySelector('.faq-answer');

        // Set initial max-height for animation
        if (answer) {
            answer.style.maxHeight = item.open ? answer.scrollHeight + 'px' : '0';
            answer.style.overflow = 'hidden';
            answer.style.transition = 'max-height 0.3s ease, padding 0.3s ease';
        }

        summary.addEventListener('click', (e) => {
            e.preventDefault();

            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.open) {
                    otherItem.open = false;
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherAnswer) {
                        otherAnswer.style.maxHeight = '0';
                    }
                }
            });

            // Toggle current item
            if (item.open) {
                answer.style.maxHeight = '0';
                setTimeout(() => { item.open = false; }, 300);
            } else {
                item.open = true;
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                const navHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Utility: Throttle function for performance
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Add parallax effect to background glows (optional enhancement)
 */
function initParallax() {
    const glows = document.querySelectorAll('.bg-glow');

    const handleScroll = throttle(() => {
        const scrollY = window.scrollY;
        glows.forEach((glow, index) => {
            const speed = 0.1 + (index * 0.05);
            glow.style.transform = `translateY(${scrollY * speed}px)`;
        });
    }, 16);

    window.addEventListener('scroll', handleScroll, { passive: true });
}

// Initialize parallax if user prefers reduced motion is not set
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    initParallax();
}
