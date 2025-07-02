// --- APP INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    if (typeof gsap === 'undefined') {
        console.error("GSAP not loaded! Animations will not work.");
        return;
    }
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    // 1. Initialize Smooth Scrolling (Locomotive Style)
    ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5,
        effects: true
    });
    
    // 2. Hide loading overlay and start animations
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        gsap.to(loadingOverlay, { 
            opacity: 0, 
            duration: 0.8, 
            delay: 0.5, 
            onComplete: () => {
                loadingOverlay.style.display = 'none';
                initializeAnimations();
            }
        });
    }
    
    // 3. Initialize all other systems
    showPage('home');
    initializeInteractions();
    initializeCursor();
    initializeMobileMenu();
    initializeEasterEggs();
    
    setInterval(createChaosElement, 5000);
}

// --- CORE SYSTEMS ---

function initializeCursor() {
    const cursor = document.getElementById('cursor');
    const cursorTrail = document.getElementById('cursorTrail');
    if (!cursor || !cursorTrail || window.innerWidth <= 768) {
        if (cursor) cursor.style.display = 'none';
        if (cursorTrail) cursorTrail.style.display = 'none';
        document.body.style.cursor = 'auto';
        return;
    }
    
    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        gsap.to(cursor, { duration: 0.2, x: mouseX, y: mouseY, ease: "power2.out" });
        gsap.to(cursorTrail, { duration: 0.5, x: mouseX, y: mouseY, ease: "power2.out" });
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => l.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
    
    document.querySelector(`.nav-link[href="#${pageId}"]`)?.classList.add('active');
    document.querySelector(`.mobile-nav-link[href="#${pageId}"]`)?.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initializeAnimations() {
    // Split text for advanced animations
    document.querySelectorAll('.anim-chars').forEach(el => {
        el.innerHTML = el.textContent.split('').map(char => `<span>${char}</span>`).join('');
    });
    
    // 1. Locomotive-style hero text animation
    gsap.timeline({delay: 0.5})
        .from(".hero-year > span", { yPercent: 110, stagger: 0.05, duration: 1, ease: "power3.out" })
        .from(".hero-company > span", { yPercent: 110, stagger: 0.03, duration: 0.8, ease: "power3.out" }, "-=0.8")
        .from(".hero-descriptor", { opacity: 0, y: 20, duration: 1, ease: "power3.out" }, "-=0.5");

    // 2. Animate elements as they scroll into view
    document.querySelectorAll('.member-layout').forEach(section => {
        gsap.from(section.querySelectorAll('.member-info > *, .member-visual'), {
            scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none none" },
            opacity: 0, y: 50, duration: 1, stagger: 0.1
        });
    });

    // 3. Floating bokeh/particle effect
    createBokeh();
}

// --- UI & INTERACTION FUNCTIONS ---

function initializeInteractions() {
    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => document.getElementById('cursor')?.classList.add('hover'));
        el.addEventListener('mouseleave', () => document.getElementById('cursor')?.classList.remove('hover'));
    });
}

function initializeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    if (mobileMenu && mobileNavOverlay) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            mobileNavOverlay.classList.toggle('active');
        });
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    if (mobileMenu && mobileNavOverlay) {
        mobileMenu.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
    }
}

function switchMode(mode, event) {
    document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
    if (event.target) event.target.classList.add('active');
    document.body.className = mode === 'agency' ? 'agency-mode' : '';
}

function createChaosElement() {
    const symbols = ['◊', '∆', '○', '□'];
    const element = document.createElement('div');
    element.className = 'chaos-element'; // Use CSS for styling
    element.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    document.body.appendChild(element);
    gsap.to(element, { y: window.innerHeight + 100, rotation: 360, duration: Math.random() * 10 + 10, ease: 'none', onComplete: () => element.remove() });
}

function createBokeh() {
    const container = document.querySelector('.hero-video-background');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'bokeh-particle';
        container.appendChild(particle);
        gsap.set(particle, { x: gsap.utils.random(0, window.innerWidth), y: gsap.utils.random(0, window.innerHeight), scale: gsap.utils.random(0.2, 1.5), background: gsap.utils.random(['var(--accent-electric)', 'var(--accent-cyber)']) });
        gsap.to(particle, { duration: gsap.utils.random(10, 20), x: "+=" + gsap.utils.random(-100, 100), y: "+=" + gsap.utils.random(-100, 100), opacity: gsap.utils.random(0.1, 0.5), repeat: -1, yoyo: true, ease: "sine.inOut" });
    }
}

// --- AI CHATBOT LOGIC ---

const advancedAI = {
    isTyping: false,
    async getAIResponse(userMessage) {
        if (this.isTyping) return;
        this.isTyping = true;
        
        const typingIndicator = showTypingIndicator();
        try {
            const response = await fetch('/.netlify/functions/get-ai-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });
            if (!response.ok) throw new Error('Network error.');
            const data = await response.json();
            addAIMessage(data.reply, 'bot');
        } catch (error) {
            addAIMessage("Sorry, my circuits are tangled. Please try again.", 'bot');
        } finally {
            this.isTyping = false;
            typingIndicator.remove();
        }
    }
};

function toggleAI() {
    const aiChat = document.getElementById('aiChat');
    aiChat.classList.toggle('active');
    if (aiChat.classList.contains('active')) {
        setTimeout(() => {
            const input = aiChat.querySelector('.ai-input');
            if (input) input.focus();
        }, 400);
    }
}

function handleAIInput(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendAIMessage();
    }
}

function sendAIMessage() {
    const input = document.querySelector('.ai-input');
    const message = input.value.trim();
    if (!message || advancedAI.isTyping) return;
    addAIMessage(message, 'user');
    input.value = '';
    advancedAI.getAIResponse(message);
}

function addAIMessage(text, type) {
    const messagesContainer = document.getElementById('aiMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${type}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'ai-message bot';
    indicator.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
    document.getElementById('aiMessages').appendChild(indicator);
    return indicator;
}

// --- EASTER EGG ---
function initializeEasterEggs() {
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiCode = [];
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.key.toLowerCase());
        konamiCode.splice(-konamiSequence.length - 1, konamiCode.length - konamiSequence.length);
        if (konamiCode.join('') === konamiSequence.join('')) {
            document.body.classList.toggle('konami-mode');
        }
    });
}