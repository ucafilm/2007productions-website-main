document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    if (typeof gsap === 'undefined') { console.error("GSAP not loaded!"); return; }
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5,
        effects: true
    });
    
    gsap.to("#loadingOverlay", { opacity: 0, duration: 0.8, delay: 0.5, onComplete: () => {
        document.getElementById('loadingOverlay').style.display = 'none';
        initializeAnimations();
    }});
    
    showPage('home');
    initializeCursor();
    initializeInteractions();
    initializeMobileMenu();
    initializeEasterEggs();
    setInterval(createChaosElement, 5000);
}

function initializeCursor() {
    const cursor = document.getElementById('cursor');
    const cursorTrail = document.getElementById('cursorTrail');
    if (!cursor || !cursorTrail || window.innerWidth <= 768) {
        if(cursor) cursor.style.display = 'none';
        if(cursorTrail) cursorTrail.style.display = 'none';
        document.body.style.cursor = 'auto';
        return;
    }
    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    function animate() {
        gsap.to(cursor, { duration: 0.2, x: mouseX, y: mouseY });
        gsap.to(cursorTrail, { duration: 0.4, x: mouseX, y: mouseY });
        requestAnimationFrame(animate);
    }
    animate();
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId)?.classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-link[href="#${pageId}"]`)?.classList.add('active');
}

function initializeAnimations() {
    document.querySelectorAll('.anim-chars').forEach(el => {
        el.innerHTML = el.textContent.trim().split('').map(char => `<span>${char === ' ' ? '&nbsp;' : char}</span>`).join('');
    });

    let tl = gsap.timeline({delay: 0.2});
    tl.from(".hero-year > span", { yPercent: 110, stagger: 0.05, duration: 1, ease: "power3.out" });
    tl.from(".hero-company > span", { yPercent: 110, stagger: 0.03, duration: 0.8, ease: "power3.out" }, "-=0.8");
    tl.from(".hero-descriptor", { opacity: 0, y: 20, duration: 1, ease: "power3.out" }, "-=0.5");

    createBokeh();
}

function createBokeh() {
    const container = document.querySelector('.hero-video-background');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'bokeh-particle';
        container.appendChild(particle);
        gsap.set(particle, { x: gsap.utils.random(0, window.innerWidth), y: gsap.utils.random(0, window.innerHeight), scale: gsap.utils.random(0.2, 1.5), background: gsap.utils.random(['var(--accent-electric)', 'var(--accent-cyber)']) });
        gsap.to(particle, { duration: gsap.utils.random(10, 20), x: "+=" + gsap.utils.random(-100, 100), y: "+=" + gsap.utils.random(-100, 100), opacity: gsap.utils.random(0.1, 0.5), repeat: -1, yoyo: true, ease: "sine.inOut" });
    }
}

function switchMode(mode, event) {
    document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
    if (event.target) event.target.classList.add('active');
    document.body.className = mode === 'agency' ? 'agency-mode' : '';
}

function initializeInteractions() { /* Add hover/click interactions here */ }
function initializeMobileMenu() { /* Add mobile menu logic here */ }
function initializeEasterEggs() { /* Add Konami code logic here */ }
function createChaosElement() { /* Add floating shapes logic here */ }

// --- AI CHATBOT LOGIC ---
const advancedAI = {
    isTyping: false,
    async getAIResponse(userMessage) {
        if (this.isTyping) return;
        this.isTyping = true;
        const typingIndicator = showTypingIndicator();
        try {
            const response = await fetch('/.netlify/functions/get-ai-response', {
                method: 'POST', body: JSON.stringify({ message: userMessage })
            });
            if (!response.ok) throw new Error('Network error.');
            const data = await response.json();
            addAIMessage(data.reply, 'bot');
        } catch (error) {
            addAIMessage("My circuits are tangled. Try again.", 'bot');
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
        setTimeout(() => aiChat.querySelector('.ai-input').focus(), 400);
    }
}
function handleAIInput(event) { if (event.key === 'Enter') sendAIMessage(); }
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