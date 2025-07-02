// --- SETUP & INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    if (typeof gsap === 'undefined') {
        console.error("GSAP not loaded!");
        return;
    }
    gsap.registerPlugin(ScrollTrigger);

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
    initializeEasterEggs();

    setInterval(createChaosElement, 5000);
}

// --- CURSOR SYSTEM ---
function initializeCursor() {
    const cursor = document.getElementById('cursor');
    const cursorTrail = document.getElementById('cursorTrail');
    if (!cursor || !cursorTrail || window.innerWidth <= 768) return;

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
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

    if (pageId !== 'home' && targetPage) {
        gsap.fromTo(targetPage.querySelectorAll('.slide-in-left, .slide-in-right'),
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }
        );
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initializeAnimations() {
    gsap.from(".hero-year", { duration: 1.2, y: 100, opacity: 0, ease: 'power3.out', delay: 0.5 });
    gsap.from(".hero-company", { duration: 1.2, y: 50, opacity: 0, ease: 'power3.out', delay: 0.7 });
}

function initTextMorph() {
    // This function is for the WORK/AGENCY text swapping
    document.querySelectorAll('.hero-descriptor, .member-label').forEach(el => el.classList.add('text-morph'));
}

function createChaosElement() {
    // This function creates the floating shapes, if you want them
}

// --- INTERACTIVE ELEMENTS ---
function initializeInteractions() {
    // Add any general interactive element setups here
}

// --- MOBILE MENU ---
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
    const aiChat = document.getElementById('aiChat');
    aiChat.classList.toggle('active');
    if (aiChat.classList.contains('active')) {
        // Correctly focus on the input field
        setTimeout(() => aiChat.querySelector('.ai-input').focus(), 400);
    }
}


function handleAIInput(event) {
    if (event.key === 'Enter') {
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
    // Your konami code logic can go here
}