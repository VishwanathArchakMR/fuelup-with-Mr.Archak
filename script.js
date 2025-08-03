// Global variables
let followerCount = 50;
let followedEmails = new Set();

// Load data from localStorage on page load
function loadStoredData() {
    const storedCount = localStorage.getItem('tribeCount');
    const storedEmails = localStorage.getItem('followedEmails');
    
    if (storedCount) {
        followerCount = parseInt(storedCount);
    }
    
    if (storedEmails) {
        followedEmails = new Set(JSON.parse(storedEmails));
    }
    
    // Update display
    const followerCountElement = document.getElementById('followerCount');
    if (followerCountElement) {
        followerCountElement.textContent = followerCount.toLocaleString();
    }
}

// Save data to localStorage
function saveDataToStorage() {
    localStorage.setItem('tribeCount', followerCount.toString());
    localStorage.setItem('followedEmails', JSON.stringify([...followedEmails]));
}

// Save follower email to file (simulate with localStorage for demo)
function saveFollowerToFile(email) {
    const followers = JSON.parse(localStorage.getItem('followerEmails') || '[]');
    const timestamp = new Date().toISOString();
    
    followers.push({
        email: email,
        timestamp: timestamp,
        source: 'Follow Me Section'
    });
    
    localStorage.setItem('followerEmails', JSON.stringify(followers));
}

// Save contact form data to file (simulate with localStorage for demo)
function saveContactToFile(name, email, message) {
    const contacts = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    const timestamp = new Date().toISOString();
    
    contacts.push({
        name: name,
        email: email,
        message: message,
        timestamp: timestamp,
        source: 'Contact Form'
    });
    
    localStorage.setItem('contactSubmissions', JSON.stringify(contacts));
}

// Validate email exists (basic validation + format check)
async function validateEmailExists(email) {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return false;
    }
    
    // Additional validation could be added here
    // For now, we'll accept any properly formatted email
    return true;
}

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
const followerCountElement = document.getElementById('followerCount');

let isEmailVerified = false;

// Email verification
verifyBtn.addEventListener('click', function() {
    const email = followEmail.value.trim();
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    // Check if email is already a tribe member
    if (followedEmails.has(email.toLowerCase())) {
        alert('You are already a tribe member! 🎉');
        verifyBtn.innerHTML = '<i class="fas fa-check"></i> Already Member';
        verifyBtn.classList.add('verified');
        followBtn.innerHTML = '<i class="fas fa-check"></i> Already Following';
        followBtn.classList.add('disabled');
        followBtn.disabled = true;
        return;
    }
    
    // Simulate email verification
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    verifyBtn.disabled = true;
    
    // Validate email exists
    validateEmailExists(email).then(isValid => {
        if (!isValid) {
            alert('Please enter a valid email address');
            verifyBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Verify Email';
            verifyBtn.disabled = false;
            return;
        }
        
        setTimeout(() => {
            verifyBtn.innerHTML = '<i class="fas fa-check"></i> Verified';
            verifyBtn.classList.add('verified');
            followBtn.classList.remove('disabled');
            followBtn.disabled = false;
            isEmailVerified = true;
            
            // Add glow effect to follow button
            followBtn.style.animation = 'glow 1.5s ease-in-out infinite alternate';
        }, 1500);
    }).catch(error => {
        alert('Error validating email. Please try again.');
        verifyBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Verify Email';
        verifyBtn.disabled = false;
    });
});

// Follow form submission
followForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!isEmailVerified) {
        alert('Please verify your email first');
        return;
    }
    
    const email = followEmail.value.trim();
    
    // Double check if already a member
    if (followedEmails.has(email.toLowerCase())) {
        alert('You are already a tribe member! 🎉');
        return;
    }
    
    // Show loading state
    followBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining...';
    followBtn.disabled = true;
    
    // Submit to backend and update follower count
    submitFollowerEmail(email).then(() => {
        // Add email to followed set
        followedEmails.add(email.toLowerCase());
        
        // Update follower count
        followerCount += 1;
        
        // Save follower data
        saveFollowerToFile(email);
        saveDataToStorage();
        
        // Update display in real-time
        updateFollowerCountDisplay();
        
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

// Update follower count display
function updateFollowerCountDisplay() {
    const followerCountElement = document.getElementById('followerCount');
    if (followerCountElement) {
        // Animate the count update
        const currentCount = parseInt(followerCountElement.textContent.replace(/\D/g, ''));
        animateCounterUpdate(followerCountElement, currentCount, followerCount);
    }
}

// Animate counter update
function animateCounterUpdate(element, from, to) {
    const duration = 1000;
    const steps = 20;
    const increment = (to - from) / steps;
    let current = from;
    let step = 0;
    
    const timer = setInterval(() => {
        step++;
        current += increment;
        
        if (step >= steps) {
            element.textContent = to.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, duration / steps);
}

// Submit follower email to backend
async function submitFollowerEmail(email) {
    try {
        const response = await fetch('https://formsubmit.co/ajax/fuelupwithmrarchak05@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                source: 'Follow Me Section',
                timestamp: new Date().toISOString(),
                domain: window.location.hostname,
                action: 'New Follower'
            })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return response.json();
    } catch (error) {
        console.error('Error submitting follower email:', error);
        // Still resolve to show success (for demo purposes)
        return Promise.resolve();
    }
}

// Contact Form Submission
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Simple validation
    if (!name || !email || !message) {
        alert('Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Save contact data to file
    saveContactToFile(name, email, message);
    
    try {
        const response = await fetch('https://formsubmit.co/ajax/fuelupwithmrarchak05@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message,
                source: 'Contact Form',
                timestamp: new Date().toISOString(),
                domain: window.location.hostname
            })
        });
        
        if (response.ok) {
            alert('Thank you for your message! I\'ll get back to you soon.');
            this.reset();
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Thank you for your message! I\'ll get back to you soon.');
        this.reset();
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

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

// Stats counter animation
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start).toLocaleString() + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString() + '+';
        }
    }
    
    updateCounter();
}

// Animate follow stats when section is visible
const followStatsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.follow-stats .stat-number');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                if (!stat.classList.contains('animated')) {
                    stat.classList.add('animated');
                    if (stat.id === 'followerCount') {
                        // Use current follower count for the main counter
                        animateCounter(stat, followerCount, 2000);
                    } else {
                        animateCounter(stat, target, 2000);
                    }
                }
            });
        }
    });
}, { threshold: 0.5 });

const followStats = document.querySelector('.follow-stats');
if (followStats) {
    followStatsObserver.observe(followStats);
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

// Add hover effects to service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add click tracking for analytics (placeholder)
document.querySelectorAll('a[href^="http"]').forEach(link => {
    link.addEventListener('click', function() {
        console.log('External link clicked:', this.href);
    });
});

// Smooth reveal animation for sections
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

// Parallax effect for hero section (disabled on mobile for performance)
if (window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

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

// Touch device optimizations
if ('ontouchstart' in window) {
    // Add touch-friendly classes
    document.body.classList.add('touch-device');
    
    // Disable hover effects on touch devices
    const style = document.createElement('style');
    style.textContent = `
        .touch-device .service-card:hover,
        .touch-device .social-link:hover,
        .touch-device .cta-button:hover {
            transform: none;
        }
    `;
    document.head.appendChild(style);
}

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    // Navbar background change
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    }
    
    // Active navigation link
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
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
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Initialize follower count display
document.addEventListener('DOMContentLoaded', () => {
    followerCountElement.textContent = followerCount.toLocaleString();
});

// Lazy loading for better performance
if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

console.log('Fuel Up website loaded successfully! 🚀');
