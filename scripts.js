/**
 * @fileoverview Main JavaScript for the X Academy website.
 * This script handles all interactive and dynamic features, including
 * a living canvas background, a magnetic cursor, theme toggling,
 * scroll-based animations, and modal functionality.
 * The code is written in modern ES6+ and is well-documented.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('X Academy Website Reinvention - Scripts loaded.');
    
    // Initialize all core components
    initLivingBackground();
    initThemeToggle();
    initNavigation();
    initMagneticCursor();
    initScrollAnimations();
    initModals();
    initRegistrationForm(); // ✅ Added for thank you message
});

/**
 * Creates a dynamic, living background using the HTML Canvas API.
 * This background features a particle field that forms a subtle
 * light wave effect, adding a futuristic and premium feel.
 */
function initLivingBackground() {
    const canvas = document.getElementById('living-background');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null, radius: 100 };

    // Resize canvas to fill window
    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < (width * height) / 9000; i++) {
            particles.push(new Particle());
        }
    }

    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    
    // Fallback for when the mouse is not on the screen (e.g., mobile)
    document.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle class for the background
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Reverse direction if particle hits canvas edge
            if (this.x > width || this.x < 0) this.speedX *= -1;
            if (this.y > height || this.y < 0) this.speedY *= -1;

            // Check proximity to mouse
            if (mouse.x && mouse.y) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= dx * force * 0.05;
                    this.y -= dy * force * 0.05;
                }
            }
        }

        draw() {
            ctx.fillStyle = `rgba(20, 195, 142, ${this.opacity})`; // Using the accent color
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        requestAnimationFrame(animate);
    }

    resizeCanvas();
    animate();
}

/**
 * Handles the dark/light theme toggle functionality.
 * It uses localStorage to remember the user's preference.
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark for premium feel
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

/**
 * Manages the main and mobile navigation behavior.
 * Includes smooth scrolling and an elegant hamburger menu animation.
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeBtn = mobileMenu.querySelector('.close-btn');

    // Smooth scroll for all links with a hash
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.hash !== '') {
                e.preventDefault();
                const targetId = link.hash;
                const targetSection = document.querySelector(targetId);
                const navHeight = document.querySelector('.main-nav').offsetHeight;
                
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - navHeight - 30, // Offset for fixed nav
                        behavior: 'smooth'
                    });
                }

                // Close mobile menu after clicking a link
                if (mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                }
            }
        });
    });

    // Toggle mobile menu visibility
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });

    // Update active link on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY + 150; // Add an offset

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Update nav links
                document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

/**
 * Implements a "magnetic" cursor effect, where certain elements
 * pull the custom cursor towards them on hover.
 */
function initMagneticCursor() {
    const cursor = document.getElementById('magnetic-cursor');
    const magneticElements = document.querySelectorAll('[data-magnetic]');

    // Return if the cursor or elements are not found
    if (!cursor || magneticElements.length === 0) return;
    
    document.body.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) scale(1)`;
        cursor.classList.add('active');
    });

    magneticElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('grow');
            cursor.style.backgroundColor = 'white'; // Change color on hover
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('grow');
            // Revert to accent color for dark theme and black for light theme
            cursor.style.backgroundColor = document.body.getAttribute('data-theme') === 'dark' ? 'var(--color-accent)' : 'black';
        });

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const elX = rect.left + rect.width / 2;
            const elY = rect.top + rect.height / 2;

            const x = e.clientX - elX;
            const y = e.clientY - elY;

            // Apply a small magnetic effect on the element itself
            el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        el.addEventListener('mouseleave', () => {
            // Reset the element's transform on mouse leave
            el.style.transform = 'translate(0, 0)';
        });
    });
}

/**
 * Adds scroll-based animations to elements with a 'reveal' class.
 * Uses the Intersection Observer API for performance.
 */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // observer.unobserve(entry.target); // Optional: unobserve after revealing
            }
        });
    }, {
        threshold: 0.2 // Trigger when 20% of the element is visible
    });

    const revealElements = document.querySelectorAll('.reveal-text, .reveal-fade-up, .reveal-scale, .reveal-fade-in');
    revealElements.forEach(el => observer.observe(el));
}

/**
 * Handles opening and closing of course details modals.
 */
function initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal-close-btn');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = trigger.getAttribute('data-modal-target');
            const targetModal = document.getElementById(targetId);
            if (targetModal) {
                targetModal.style.display = 'block';
                setTimeout(() => targetModal.classList.add('active'), 10); // Add a small delay for animation
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            }
        });
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.style.display = 'none', 500); // Wait for animation to finish
                document.body.style.overflow = 'auto';
            }
        });
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.style.display = 'none', 500);
                document.body.style.overflow = 'auto';
            }
        });
    });

    // ✅ NEW CODE: Close modal when clicking "سجل الان" buttons
    const registerButtons = document.querySelectorAll('.modal-link.cta-btn.primary');
    registerButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Find the parent modal and close it
            const modal = button.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 500);
            }
            
            // Optional: Scroll to registration section
            const registrationSection = document.getElementById('registration');
            if (registrationSection) {
                const navHeight = document.querySelector('.main-nav').offsetHeight;
                window.scrollTo({
                    top: registrationSection.offsetTop - navHeight - 30,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Handles registration form submission and thank you message
 */
function initRegistrationForm() {
    const registrationForm = document.getElementById('registration-form');
    const thankYouMessage = document.getElementById('thank-you-message');
    const closeThankYou = document.querySelector('.close-thank-you');

    if (!registrationForm || !thankYouMessage) return;

    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // هنا يمكنك إضافة كود إرسال البيانات إلى الخادم
        
        // إخفاء النموذج
        registrationForm.style.opacity = '0';
        registrationForm.style.transform = 'translateY(20px)';
        
        // إظهار رسالة الشكر بعد تأخير بسيط
        setTimeout(() => {
            thankYouMessage.style.display = 'flex';
            setTimeout(() => {
                thankYouMessage.classList.add('active');
            }, 50);
        }, 500);
    });

    // إغلاق رسالة الشكر
    if (closeThankYou) {
        closeThankYou.addEventListener('click', () => {
            thankYouMessage.classList.remove('active');
            setTimeout(() => {
                thankYouMessage.style.display = 'none';
                // إعادة تعيين النموذج
                registrationForm.reset();
                registrationForm.style.opacity = '1';
                registrationForm.style.transform = 'translateY(0)';
            }, 300);
        });
    }

    // إغلاق رسالة الشكر عند النقر خارجها
    thankYouMessage.addEventListener('click', (e) => {
        if (e.target === thankYouMessage) {
            thankYouMessage.classList.remove('active');
            setTimeout(() => {
                thankYouMessage.style.display = 'none';
                registrationForm.reset();
                registrationForm.style.opacity = '1';
                registrationForm.style.transform = 'translateY(0)';
            }, 300);
        }
    });
}
