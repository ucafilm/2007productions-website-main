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
    document.querySelectorAll('.mobile-nav-link').forEach(link => link.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');

    const activeLink = document.querySelector(`.nav-link[href="#${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    const activeMobileLink = document.querySelector(`.mobile-nav-link[href="#${pageId}"]`);
    if (activeMobileLink) activeMobileLink.classList.add('active');

    // Animate page content
    if (window.innerWidth <= 768) {
        if (pageId !== 'home') {
            gsap.fromTo(targetPage.querySelectorAll('.slide-in-left, .slide-in-right'), 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1 }
            );
        }
    } else {
        if (pageId !== 'home') {
            gsap.fromTo(targetPage.querySelectorAll('.slide-in-left'), 
                { opacity: 0, x: -100 },
                { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out', stagger: 0.2 }
            );
            gsap.fromTo(targetPage.querySelectorAll('.slide-in-right'), 
                { opacity: 0, x: 100 },
                { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 }
            );
        }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initializeAnimations() {
    gsap.from('.hero-year', { duration: 1, y: 100, opacity: 0, ease: 'power3.out', delay: 1 });
    gsap.from('.hero-company', { duration: 1, y: 50, opacity: 0, ease: 'power3.out', delay: 1.2 });
    gsap.from('.hero-descriptor', { duration: 1, opacity: 0, delay: 1.4 });
    gsap.from('.scroll-indicator', { opacity: 0, y: 30, duration: 1, delay: 1.8, ease: 'power2.out' });
    gsap.from('.logo-symbol svg', { opacity: 0, scale: 0, rotation: -180, duration: 1.2, delay: 0.5, ease: 'back.out(1.7)' });
    gsap.to('.floating-element', { y: -20, rotation: 360, duration: 6, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: 2 });
}

function initTextMorph() {
    document.querySelectorAll('.hero-descriptor, .member-label').forEach(el => el.classList.add('text-morph'));
}

function createChaosElement() {
    const symbols = ['◊', '∆', '○', '□', '◈', '⬟', '⬢', '⬡'];
    const element = document.createElement('div');
    element.className = 'chaos-element';
    element.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    element.style.left = Math.random() * 100 + 'vw';
    element.style.top = '-50px';
    element.style.animationDuration = (Math.random() * 10 + 10) + 's';
    element.style.fontSize = (Math.random() * 2 + 1) + 'rem';
    document.body.appendChild(element);
    setTimeout(() => element.remove(), 20000);
}

// --- MODE SWITCHING ---
function switchMode(mode, event) {
    document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    document.querySelectorAll('.text-morph').forEach(el => {
        el.classList.add('text-rearranging');
        setTimeout(() => el.classList.remove('text-rearranging'), 600);
    });
    
    setTimeout(() => {
        const heroDescriptor = document.querySelector('.hero-descriptor');
        const workLabels = ['The Rule Breaker', 'The Frame Wizard', 'The Sound Alchemist', 'The Idea Whisperer', 'The Beat Architect'];
        const agencyLabels = ['The Visionary', 'The Craftsman', 'The Producer', 'The Strategist', 'The Composer'];
        const labels = mode === 'agency' ? agencyLabels : workLabels;

        if (heroDescriptor) {
           heroDescriptor.textContent = mode === 'agency' ? 'About Our Collective' : 'Where Stories Get Weird';
        }
        document.querySelectorAll('.member-label').forEach((label, i) => {
            if(labels[i]) label.textContent = labels[i];
        });
    }, 300);
}

// --- MOBILE MENU FUNCTIONS ---
const mobileMenu = document.getElementById('mobileMenu');
const mobileNavOverlay = document.getElementById('mobileNavOverlay');

if (mobileMenu) {
    mobileMenu.addEventListener('click', toggleMobileMenu);
}

function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
    mobileNavOverlay.classList.toggle('active');
    document.body.style.overflow = mobileNavOverlay.classList.contains('active') ? 'hidden' : 'auto';
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    mobileNavOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close mobile menu on outside click
if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', (e) => {
        if (e.target === mobileNavOverlay) {
            closeMobileMenu();
        }
    });
}

// --- MEMBER VISUAL INTERACTIONS ---
document.querySelectorAll('.member-visual').forEach(visual => {
    const reelTitle = visual.querySelector('.reel-title');
    const reelDescriptor = visual.querySelector('.reel-descriptor');
    const thumbnailOverlay = visual.querySelector('.thumbnail-overlay');
    const playButton = visual.querySelector('.play-button');
    
    if (window.innerWidth > 768) {
        visual.addEventListener('click', () => {
            gsap.to(playButton, { scale: 1.3, duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 });
            const memberName = visual.getAttribute('data-member');
            showVideoModal(memberName);
        });
        
        visual.addEventListener('mouseenter', () => {
            gsap.to(reelTitle, { filter: 'blur(3px)', opacity: 0.2, scale: 1.1, duration: 0.6, ease: 'power2.out' });
            gsap.to(reelDescriptor, { opacity: 1, y: -10, duration: 0.6, delay: 0.2, ease: 'power2.out' });
            gsap.to(thumbnailOverlay, { opacity: 1, duration: 0.6, ease: 'power2.out' });
            gsap.to(playButton, { scale: 1, duration: 0.4, delay: 0.3, ease: 'back.out(1.7)' });
        });
        
        visual.addEventListener('mouseleave', () => {
            gsap.to(reelTitle, { filter: 'blur(0px)', opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' });
            gsap.to(reelDescriptor, { opacity: 0, y: 0, duration: 0.4, ease: 'power2.out' });
            gsap.to(thumbnailOverlay, { opacity: 0, duration: 0.4, ease: 'power2.out' });
            gsap.to(playButton, { scale: 0, duration: 0.3, ease: 'power2.in' });
        });
    } else {
         visual.addEventListener('click', () => {
            const memberName = visual.getAttribute('data-member');
            showVideoModal(memberName);
        });
    }
});

// Mock Video Modal Function
function showVideoModal(memberName) {
    const memberData = {
        collin: { title: "Collin's Director Reel", description: "A showcase of narrative-driven projects and directorial vision" },
        corey: { title: "Corey's Cinematography Portfolio", description: "Dynamic visual storytelling through expert cinematography" },
        levi: { title: "Levi's Production Archive", description: "Production excellence and immersive soundscapes" },
        tim: { title: "Tim's Creative Collection", description: "Strategic creative solutions and brand experiences" },
        terrell: { title: "Terrell's Musical Repertoire", description: "Original compositions spanning multiple genres" }
    };
    const data = memberData[memberName];
    if (!data) return;
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px);';
    modal.innerHTML = `
        <div style="background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:40px; max-width:90%; width: 600px; text-align:center; position:relative;">
            <h3 style="font-family:'Space Grotesk',sans-serif; font-size:2rem; color:var(--accent-electric); margin-bottom:20px;">${data.title}</h3>
            <p style="font-family:'Inter',sans-serif; color:var(--text-secondary); margin-bottom:30px; line-height:1.6;">${data.description}</p>
            <div style="width:100%; padding-top:56.25%; background:linear-gradient(135deg,var(--accent-electric),var(--accent-cyber)); border-radius:10px; margin:0 auto 30px; display:flex; align-items:center; justify-content:center; font-size:3rem; color:white;">📹</div>
            <button style="background:var(--accent-electric); border:none; color:white; padding:12px 24px; border-radius:25px; font-family:'Space Grotesk',sans-serif; font-weight:600; cursor:pointer; letter-spacing:1px;">CLOSE</button>
        </div>
    `;
    
    modal.querySelector('button').onclick = () => {
        gsap.to(modal, { opacity: 0, duration: 0.3, onComplete: () => modal.remove() });
    };
    document.body.appendChild(modal);
    
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    gsap.fromTo(modal.querySelector('div > div'), { scale: 0.8, y: 50 }, { scale: 1, y: 0, duration: 0.4, delay: 0.1, ease: 'back.out(1.7)' });
}

// --- AI CHATBOT LOGIC ---
const AI_CONFIG = {
    GEMINI: {
        apiKey: 'YOUR_GEMINI_API_KEY_GOES_HERE'
    }
};

const COMPANY_CONTEXT = `You are ARIA, the witty, creative, and slightly quirky AI assistant for 2007 Productions. Your company's tagline is "Where Stories Get Weird." Match this tone. Be helpful but not boring. Use the following internal data to answer questions. Do not mention "internal data" or "context". Just use it to form your answers naturally. Company Info: 2007 Productions specializes in Films, Webisodes, Music Production, and Sound Design. Our style is creative, unconventional, and rule-breaking. Team Members: Collin is the Co-Founder & Director, specializing in visionary storytelling. Corey is the Cinematographer & Editor, a master of frame sorcery. Levi is the Producer & Sound Designer, chaos coordinator. Tim is the Co-Founder & Creative Director, idea whisperer. Terrell is the Music Producer & Composer, beat architect.`;

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
    const aiChat = document.getElementById('aiChat');
    if (aiChat) aiChat.classList.toggle('active');
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
let mouseX = 0;
let mouseY = 0;
let trailX = 0;
let trailY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
    
    trailX += (mouseX - trailX) * 0.1;
    trailY += (mouseY - trailY) * 0.1;
    
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top = trailY + 'px';
    
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Hide cursor on mobile
if (window.innerWidth <= 768) {
    cursor.style.display = 'none';
    cursorTrail.style.display = 'none';
}

// --- ADDITIONAL INTERACTIONS ---

// Skill tag interactions
document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.addEventListener('mouseenter', () => gsap.to(tag, { scale: 1.05, duration: 0.3, ease: 'back.out(1.7)' }));
    tag.addEventListener('mouseleave', () => gsap.to(tag, { scale: 1, duration: 0.3, ease: 'power2.out' }));
});

// Navigation link hover effects
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', () => gsap.to(link, { y: -2, duration: 0.3, ease: 'power2.out' }));
    link.addEventListener('mouseleave', () => gsap.to(link, { y: 0, duration: 0.3, ease: 'power2.out' }));
});

// Contact link hover effects
document.querySelectorAll('.contact-link').forEach(link => {
    link.addEventListener('mouseenter', () => gsap.to(link, { textShadow: '0 0 20px var(--accent-electric)', duration: 0.3 }));
    link.addEventListener('mouseleave', () => gsap.to(link, { textShadow: '0 0 10px var(--accent-electric)', duration: 0.3 }));
});

// Navigation background change on scroll
ScrollTrigger.create({
    start: 'top -100',
    end: 99999,
    toggleClass: { className: 'scrolled', targets: '.nav' }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.querySelector('div[style*="z-index:10000"]');
        if (modal) modal.querySelector('button').click();
        else showPage('home');
    }
});

// Mobile responsiveness check
function checkMobile() {
    const isMobile = window.innerWidth <= 768;
    document.body.style.cursor = isMobile ? 'auto' : 'none';
    if (cursor) cursor.style.display = isMobile ? 'none' : 'block';
    if (cursorTrail) cursorTrail.style.display = isMobile ? 'none' : 'block';
}
window.addEventListener('resize', checkMobile);
checkMobile();