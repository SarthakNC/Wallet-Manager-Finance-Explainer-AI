// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const typewriterText = document.getElementById('typewriterText');
const themeToggle = document.getElementById('themeToggle');

// ===== Theme Toggle (Dark Mode) =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialize theme on load
initTheme();

// Theme toggle click handler
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// ===== Navbar Scroll Effect =====
let lastScroll = 0;
window.addEventListener('scroll', () => {
    if (!navbar) return;
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
});

// ===== Mobile Menu Toggle =====
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.mobile-nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
    });
}

// ===== Typewriter Effect for AI Insight =====
const insightMessage = "You spent 28% more on food this month mainly due to late-night orders. If you reduce 2 orders/week, you can save ₹1,200.";

function typeWriter(text, element, speed = 30) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');

            // Trigger typewriter when AI insight section is visible
            if (entry.target.id === 'ai-insight' && typewriterText) {
                typeWriter(insightMessage, typewriterText);
            }
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    animateOnScroll.observe(section);
});

// ===== Smooth Scroll for Navigation Links =====
document.querySelectorAll('a[href^="index.html"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Parallax Effect for Hero Orbs =====
document.addEventListener('mousemove', (e) => {
    const orbs = document.querySelectorAll('.gradient-orb');
    const x = (window.innerWidth - e.pageX) / 100;
    const y = (window.innerHeight - e.pageY) / 100;

    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 0.5;
        orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
});

// ===== Feature Cards Hover Effect =====
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// ===== Button Ripple Effect =====
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function (e) {
        const x = e.clientX - e.target.offsetLeft;
        const y = e.clientY - e.target.offsetTop;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// ===== Add Animation Classes on Load =====
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Trigger hero animations
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');

    if (heroContent) heroContent.classList.add('animate-in');
    if (heroVisual) heroVisual.classList.add('animate-in');
});

// ===== Add CSS for animations via JS =====
const style = document.createElement('style');
style.textContent = `
    section {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    section.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .hero-content, .hero-visual {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }
    
    .hero-content.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .hero-visual.animate-in {
        opacity: 1;
        transform: translateY(0);
        transition-delay: 0.3s;
    }
    
    .step-card, .feature-card, .user-card, .security-card {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }
    
    .animate-in .step-card,
    .animate-in .feature-card,
    .animate-in .user-card,
    .animate-in .security-card {
        opacity: 1;
        transform: translateY(0);
    }
    
    .animate-in .step-card:nth-child(1) { transition-delay: 0.1s; }
    .animate-in .step-card:nth-child(3) { transition-delay: 0.2s; }
    .animate-in .step-card:nth-child(5) { transition-delay: 0.3s; }
    .animate-in .step-card:nth-child(7) { transition-delay: 0.4s; }
    
    .animate-in .feature-card:nth-child(1) { transition-delay: 0.1s; }
    .animate-in .feature-card:nth-child(2) { transition-delay: 0.2s; }
    .animate-in .feature-card:nth-child(3) { transition-delay: 0.3s; }
    .animate-in .feature-card:nth-child(4) { transition-delay: 0.4s; }
    .animate-in .feature-card:nth-child(5) { transition-delay: 0.5s; }
    .animate-in .feature-card:nth-child(6) { transition-delay: 0.6s; }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-effect 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-effect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .mobile-menu-btn.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-btn.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-btn.active span:nth-child(3) {
        transform: rotate(-45deg) translate(5px, -5px);
    }
    
    /* Hero is always visible */
    .hero {
        opacity: 1 !important;
        transform: none !important;
    }
    
    /* Theme transition */
    * {
        transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
    }
`;
document.head.appendChild(style);

// ===== Console Welcome Message =====
console.log('%c ExpenseAI - AI Expense Explainer', 'font-size: 20px; font-weight: bold; color: #14b8a6;');
console.log('%cPowered by Advanced AI Technology', 'font-size: 12px; color: #06b6d4;');
