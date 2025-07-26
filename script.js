// Mobile Navigation Toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animate hamburger menu
    const bars = navToggle.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
        if (navMenu.classList.contains('active')) {
            if (index === 0) bar.style.transform = 'rotate(-45deg) translate(-5px, 6px)';
            if (index === 1) bar.style.opacity = '0';
            if (index === 2) bar.style.transform = 'rotate(45deg) translate(-5px, -6px)';
        } else {
            bar.style.transform = 'none';
            bar.style.opacity = '1';
        }
    });
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const bars = navToggle.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.style.transform = 'none';
            bar.style.opacity = '1';
        });
    });
});

// Follow Me Section Functionality
const followForm = document.getElementById('followForm');
const followEmail = document.getElementById('followEmail');
const verifyBtn = document.getElementById('verifyBtn');
const followBtn = document.getElementById('followBtn');
const successMessage = document.getElementById('successMessage');

let isEmailVerified = false;

// Email verification
verifyBtn.addEventListener('click', function() {
    const email = followEmail.value.trim();
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Simulate email verification
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    verifyBtn.disabled = true;
    
    setTimeout(() => {
        verifyBtn.innerHTML = '<i class="fas fa-check"></i> Verified';
        verifyBtn.classList.add('verified');
        followBtn.classList.remove('disabled');
        followBtn.disabled = false;
        isEmailVerified = true;
        
        // Add glow effect to follow button
        followBtn.style.animation = 'glow 1.5s ease-in-out infinite alternate';
    }, 2000);
});

// Follow form submission
followForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!isEmailVerified) {
        alert('Please verify your email first');
        return;
    }
    
    const email = followEmail.value.trim();
    
    // Show loading state
    followBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining...';
    followBtn.disabled = true;
    
    // Submit to FormSubmit (free backend service)
    submitToBackend(email).then(() => {
        // Hide form and show success message
        followForm.style.display = 'none';
        successMessage.classList.add('show');
        
        // Add confetti effect
        createConfetti();
        
        // Reset form after 5 seconds
        setTimeout(() => {
            followForm.style.display = 'flex';
            successMessage.classList.remove('show');
            resetFollowForm();
        }, 5000);
    }).catch(error => {
        console.error('Submission error:', error);
        alert('Something went wrong. Please try again.');
        followBtn.innerHTML = '<i class="fas fa-rocket"></i> Follow Me';
        followBtn.disabled = false;
    });
});

// Submit email to backend
async function submitToBackend(email) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('source', 'Follow Me Section');
    formData.append('timestamp', new Date().toISOString());
    formData.append('domain', 'fuelupwithmrarchak.com');
    
    // Using FormSubmit.co (free service)
    const response = await fetch('https://formsubmit.co/ajax/your-email@example.com', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    
    return response.json();
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Reset follow form
function resetFollowForm() {
    followEmail.value = '';
    verifyBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Verify Email';
    verifyBtn.classList.remove('verified');
    verifyBtn.disabled = false;
    followBtn.innerHTML = '<i class="fas fa-rocket"></i> Follow Me';
    followBtn.classList.add('disabled');
    followBtn.disabled = true;
    followBtn.style.animation = '';
    isEmailVerified = false;
}

// Confetti effect
function createConfetti() {
    const colors = ['#ff6b35', '#f7931e', '#ffffff', '#10b981'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Add confetti animation CSS
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

// Animate follow stats when section is visible
const followStatsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.follow-stats .stat-number');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                if (!stat.classList.contains('animated')) {
                    stat.classList.add('animated');
                    animateCounter(stat, target, 2000);
                }
            });
        }
    });
}, { threshold: 0.5 });

const followStats = document.querySelector('.follow-stats');
if (followStats) {
    followStatsObserver.observe(followStats);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    }
});

// Form submission
const contactForm = document.querySelector('.form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const message = this.querySelector('textarea').value;
        
        // Simple validation
        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return;
        }
        
        // Show success message (you can integrate with a real form service)
        alert('Thank you for your message! I\'ll get back to you soon.');
        this.reset();
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service-card, .schedule-item, .social-link').forEach(el => {
    observer.observe(el);
});

// Add loading animation to CTA buttons
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('click', function(e) {
        // Don't prevent default for external links
        if (this.href && this.href.startsWith('http')) {
            return;
        }
        
        // Add loading state for form buttons
        if (this.type === 'submit') {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            }, 2000);
        }
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Dynamic typing effect for hero tagline
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
window.addEventListener('load', () => {
    const tagline = document.querySelector('.hero-tagline');
    if (tagline) {
        const originalText = tagline.textContent;
        setTimeout(() => {
            typeWriter(tagline, originalText, 80);
        }, 1000);
    }
});

// Add hover effects to service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Stats counter animation
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    }
    
    updateCounter();
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                if (number && !stat.classList.contains('animated')) {
                    stat.classList.add('animated');
                    animateCounter(stat, number);
                }
            });
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// Add click tracking for analytics (placeholder)
document.querySelectorAll('a[href^="http"]').forEach(link => {
    link.addEventListener('click', function() {
        // You can add Google Analytics or other tracking here
        console.log('External link clicked:', this.href);
    });
});

// Preload critical images
function preloadImages() {
    const imageUrls = [
        // Add your actual image URLs here when you replace placeholders
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Initialize preloading
window.addEventListener('load', preloadImages);

// Add smooth reveal animation for sections
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

// Apply reveal animation to sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(section);
});

// Add active state to navigation links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Add CSS for active nav link
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: #ff6b35 !important;
    }
    .nav-link.active::after {
        width: 100% !important;
    }
`;
document.head.appendChild(style);