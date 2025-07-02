// --- SETUP & INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    if (typeof gsap === 'undefined') { console.error("GSAP not loaded!"); return; }
    gsap.registerPlugin(ScrollTrigger);
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        gsap.to(loadingOverlay, { opacity: 0, duration: 0.8, delay: 0.5, onComplete: () => {
            loadingOverlay.style.display = 'none';
            initializeAnimations();
        }});
    }
    
    showPage('home');
    initializeInteractions();
    initializeCursor();
    initializeMobileMenu();
}

// --- PAGE NAVIGATION & ANIMATIONS ---
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
    // Staggered hero text animation
    gsap.from(".hero-content > *", {
        duration: 1.2,
        y: 50,
        opacity: 0,
        ease: "power3.out",
        stagger: 0.2,
        delay: 0.5
    });

    // Animate elements on scroll (the "locomotive" effect)
    document.querySelectorAll('.page').forEach(page => {
        const elementsToAnimate = page.querySelectorAll('.slide-in-left, .slide-in-right, .member-skill, .member-contact > *');
        gsap.from(elementsToAnimate, {
            scrollTrigger: {
                trigger: page,
                start: "top 80%",
                toggleActions: "play none none none",
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.15
        });
    });

    // Nav shadow on scroll
    ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: { className: 'scrolled', targets: '.nav' }
    });
}

// --- MODE SWITCHING ---
function switchMode(mode, event) {
    document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
    if (event.target) event.target.classList.add('active');
    
    if (mode === 'agency') {
        document.body.classList.add('agency-mode');
    } else {
        document.body.classList.remove('agency-mode');
    }
}

// --- AI CHATBOT & OTHER FUNCTIONS ---
// (No changes needed for the AI, cursor, or mobile menu logic. Keep them as they are.)
// ... (Your existing code for AI, cursor, etc. goes here)

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
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            addAIMessage(data.reply, 'bot');
        } catch (error) {
            console.error('AI Error:', error);
            addAIMessage("My circuits seem to be tangled. Please try again later.", 'bot');
        } finally {
            this.isTyping = false;
            typingIndicator.remove();
        }
    }
};

function toggleAI() {
    document.getElementById('aiChat').classList.toggle('active');
}

function handleAIInput(event) {
    if (event.key === 'Enter') sendAIMessage();
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

// --- OTHER INITIALIZATIONS ---
function initializeInteractions() { /* ... desktop hover effects ... */ }
function initializeMobileMenu() { /* ... mobile menu logic ... */ }
function initializeEasterEggs() { /* ... konami code etc. ... */ }
function createChaosElement() { /* ... chaos element logic ... */ }
function switchMode(mode, event) { /* ... mode switching logic ... */ }