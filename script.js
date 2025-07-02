// --- SETUP & INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    if (typeof gsap === 'undefined') {
        console.error("GSAP not loaded!");
        return;
    }
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    // Activate smooth scrolling
    ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5,
        effects: true
    });

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

    showPage('home');
    initializeInteractions();
    initializeCursor();
    initializeMobileMenu();
}

// --- CURSOR SYSTEM ---
function initializeCursor() {
    const cursor = document.getElementById('cursor');
    const cursorTrail = document.getElementById('cursorTrail');
    if (!cursor || !cursorTrail || window.innerWidth <= 768) {
        if(cursor) cursor.style.display = 'none';
        if(cursorTrail) cursorTrail.style.display = 'none';
        return;
    }
    
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => {
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
    gsap.from(".hero-content > *", {
        duration: 1.2,
        y: 50,
        opacity: 0,
        ease: "power3.out",
        stagger: 0.2
    });

    // Locomotive-style scroll-in animations
    document.querySelectorAll('.slide-in-left, .slide-in-right').forEach(elem => {
        gsap.from(elem, {
            scrollTrigger: {
                trigger: elem,
                start: "top 85%",
                toggleActions: "play none none none",
            },
            opacity: 0,
            y: 50,
            duration: 1,
            ease: "power3.out"
        });
    });
}

// --- UI & INTERACTION INITIALIZERS ---
function initializeInteractions() { /* For future hover effects etc. */ }
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
function initializeEasterEggs() { /* For Konami code etc. */ }
function createChaosElement() { /* For floating shapes etc. */ }
function switchMode(mode, event) {
    document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
    if (event.target) event.target.classList.add('active');
    document.body.className = mode === 'agency' ? 'agency-mode' : '';
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
                body: JSON.stringify({ message: userMessage })
            });
            if (!response.ok) throw new Error('Network error.');
            const data = await response.json();
            addAIMessage(data.reply, 'bot');
        } catch (error) {
            addAIMessage("My circuits are tangled. Please try again.", 'bot');
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
        // This is the corrected code
        setTimeout(() => {
            const input = aiChat.querySelector('.ai-input');
            if (input) { // Check if the input exists before trying to focus
                input.focus();
            }
        }, 400);
    }
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