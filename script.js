// --- SETUP & INITIALIZATION --- 
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    gsap.to(loadingOverlay, { 
        opacity: 0, 
        duration: 0.5, 
        delay: 0.5, 
        onComplete: () => loadingOverlay.style.display = 'none' 
    });
    showPage('home');
    initializeAnimations();
    initTextMorph();
    setInterval(createChaosElement, 5000);
});

// --- PAGE & ANIMATION FUNCTIONS ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');

    const activeLink = document.querySelector(`.nav-link[href="#${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');
}

function initializeAnimations() {
    gsap.from('.hero-year', { duration: 1, y: 100, opacity: 0, ease: 'power3.out', delay: 1 });
    gsap.from('.hero-company', { duration: 1, y: 50, opacity: 0, ease: 'power3.out', delay: 1.2 });
    gsap.from('.hero-descriptor', { duration: 1, opacity: 0, delay: 1.4 });
}

function initTextMorph() {
    document.querySelectorAll('.hero-descriptor, .member-label').forEach(el => el.classList.add('text-morph'));
}

function createChaosElement() {
    const element = document.createElement('div');
    element.className = 'chaos-element';
    element.style.left = `${Math.random() * 100}vw`;
    element.style.animationDuration = `${Math.random() * 10 + 10}s`;
    document.body.appendChild(element);
    setTimeout(() => element.remove(), 20000);
}

// --- AI CHATBOT LOGIC ---
const AI_CONFIG = {
    GEMINI: {
        apiKey: 'YOUR_GEMINI_API_KEY_GOES_HERE'
    }
};
const COMPANY_CONTEXT = `You are ARIA, the witty, creative, and slightly quirky AI assistant for 2007 Productions. Your company's tagline is "Where Stories Get Weird." Match this tone. Be helpful but not boring. Use the following internal data to answer questions. Do not mention "internal data" or "context". Just use it to form your answers naturally. Company Info: 2007 Productions specializes in Films, Webisodes, Music Production, and Sound Design. Our style is creative, unconventional, and rule-breaking. Team Members: Collin is the Co-Founder & Director, specializing in visionary storytelling. Corey is the Cinematographer & Editor, a master of frame sorcery.`;

class AdvancedAIBot {
    constructor() {
        this.isTyping = false;
    }

    async getAIResponse(userMessage) {
        if (this.isTyping) return;
        this.isTyping = true;
        
        const typingIndicator = showTypingIndicator();
        try {
            const response = await this.callYourServerlessFunction(userMessage);
            addAIMessage(response, 'bot');
        } catch (error) {
            console.error('AI Error:', error);
            addAIMessage("My circuits are a bit fried. Try again.", 'bot');
        } finally {
            this.isTyping = false;
            typingIndicator.remove();
        }
    }

    async callYourServerlessFunction(message) {
        const response = await fetch('/.netlify/functions/get-ai-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        if (!response.ok) {
            throw new Error('Serverless function failed to respond.');
        }
        const data = await response.json();
        return data.reply;
    }
}

const advancedAI = new AdvancedAIBot();

function toggleAI() {
    document.getElementById('aiChat').classList.toggle('active');
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

// --- CURSOR LOGIC ---
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { duration: 0.2, x: e.clientX, y: e.clientY });
    gsap.to(cursorTrail, { duration: 0.5, x: e.clientX, y: e.clientY });
});