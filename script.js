// Main application script

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Core GSAP setup
    if (typeof gsap === 'undefined') { 
        console.error("GSAP not loaded!"); 
        return; 
    }
    
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    // Initialize EffectManager
    window.effectManager = new EffectManager();

    // Initialize smooth scrolling
    ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5,
        effects: true
    });
    
    """    // Handle loading overlay
    gsap.to("#loadingOverlay", { 
        opacity: 0, 
        duration: 0.8, 
        delay: 0.5, 
        onComplete: () => {
            document.getElementById('loadingOverlay').style.display = 'none';
            initializeCore();
        }
    });
    
    // Core functionality is initialized once the loading overlay is complete.
}"""""



function initializeCore() {
    // Basic animations that don't depend on effects
    initializeAnimations(); // Existing function for hero animations
    createBokeh(); // Existing function
    setInterval(createChaosElement, 5000); // Existing function

    // Navigation and UI
    initializeInteractions(); // Existing function for magnetic effects, etc.
    initializeMobileMenu(); // Existing function
    initializeEasterEggs(); // Existing function
    
    // Initialize LocomotiveCursor globally if enabled by DeviceOptimizer
    if (window.LocomotiveCursor && window.deviceOptimizer.shouldEnableEffect('cursor')) {
        window.locomotiveCursor = new LocomotiveCursor();
        window.effectManager.registerEffect('locomotiveCursor', window.locomotiveCursor);
    }

    // Page management
    showPage('home');
    
    // AI assistant
    // Assuming advancedAI, toggleAI, handleAIInput, sendAIMessage, addAIMessage, showTypingIndicator are defined elsewhere or will be moved
}

function initializeAboutPageEffects() {
    // This function is called by the progressive loader
    // when the about page is accessed and effects are ready
    
    const kineticContainer = document.querySelector('.kinetic-container');
    const mouseEffectContainer = document.getElementById('mouseEffectContainer');
    const imagePool = document.querySelector('.image-pool');
    
    if (kineticContainer && window.KineticTypography) {
        const optimizer = window.deviceOptimizer; // Use global optimizer
        const settings = optimizer.getOptimizedSettings('kinetic');
        
        const kinetic = new KineticTypography(kineticContainer, settings);
        window.effectManager.registerEffect('kinetic', kinetic);
    }
    
    if (mouseEffectContainer && imagePool && window.MouseImageEffect) {
        const optimizer = window.deviceOptimizer; // Use global optimizer
        const settings = optimizer.getOptimizedSettings('mouse');
        
        const mouseEffect = new MouseImageEffect(mouseEffectContainer, imagePool, settings);
        window.effectManager.registerEffect('mouseEffect', mouseEffect);
    }
}

// Updated showPage function with effect management
function showPage(pageId) {
    // Selectively destroy effects not present on the new page
    if (window.effectManager) {
        if (pageId !== 'about') {
            window.effectManager.destroyEffect('kinetic');
            window.effectManager.destroyEffect('mouseEffect');
        }
    }
    
    // Standard page switching logic
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId)?.classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-link[href="#${pageId}"]`)?.classList.add('active');
    
    // Initialize page-specific effects
    if (pageId === 'about') {
        setTimeout(() => {
            initializeAboutPageEffects();
        }, 100);
    }
    
    // Trigger page animations for other pages (existing logic)
    const targetPage = document.getElementById(pageId);
    if (targetPage && pageId !== 'home' && pageId !== 'about') {
        // Reset animations
        gsap.set(targetPage.querySelectorAll('[data-reveal]'), { opacity: 0, y: 50 });
        
        // Animate elements in
        gsap.to(targetPage.querySelectorAll('[data-reveal]'), {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.2
        });
    }
}

// Existing functions that are still part of script.js
function initializeAnimations() {
    document.querySelectorAll('.anim-chars').forEach(el => {
        el.innerHTML = el.textContent.trim().split('').map(char => `<span>${char === ' ' ? '&nbsp;' : char}</span>`).join('');
    });

    let tl = gsap.timeline({delay: 0.2});
    tl.from(".hero-year > span", { yPercent: 110, stagger: 0.05, duration: 1, ease: "power3.out" });
    tl.from(".hero-company > span", { yPercent: 110, stagger: 0.03, duration: 0.8, ease: "power3.out" }, "-=0.8");
    tl.from(".hero-descriptor", { opacity: 0, y: 20, duration: 1, ease: "power3.out" }, "-=0.5");
}

function createBokeh() {
    const container = document.querySelector('.hero-video-background');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'bokeh-particle';
        container.appendChild(particle);
        gsap.set(particle, { 
            x: gsap.utils.random(0, window.innerWidth), 
            y: gsap.utils.random(0, window.innerHeight), 
            scale: gsap.utils.random(0.2, 1.5), 
            background: gsap.utils.random(['var(--accent-electric)', 'var(--accent-cyber)']) 
        });
        gsap.to(particle, { 
            duration: gsap.utils.random(10, 20), 
            x: "+=" + gsap.utils.random(-100, 100), 
            y: "+=" + gsap.utils.random(-100, 100), 
            opacity: gsap.utils.random(0.1, 0.5), 
            repeat: -1, 
            yoyo: true, 
            ease: "sine.inOut" 
        });
    }
}

function switchMode(mode, event) {
    document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    document.body.className = mode === 'agency' ? 'agency-mode' : '';
    
    // Text morphing effect
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
           heroDescriptor.textContent = mode === 'agency' ? 'Creating Legendary Experiences' : 'Where Stories Get Weird';
        }
        document.querySelectorAll('.member-label').forEach((label, i) => {
            if(labels[i]) label.textContent = labels[i];
        });
    }, 300);
}

function initializeInteractions() {
    // Add magnetic attribute to interactive elements
    document.querySelectorAll('button, .nav-link, .skill-tag, .contact-link').forEach(el => {
        if (!el.hasAttribute('data-magnetic')) {
            el.setAttribute('data-magnetic', '');
        }
    });
    
    // Add reveal attributes to text elements
    document.querySelectorAll('.member-bio, .member-role, .skills-title').forEach(el => {
        if (!el.hasAttribute('data-reveal')) {
            el.setAttribute('data-reveal', '');
        }
    });
}

function initializeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');

    if (mobileMenu && mobileNavOverlay) {
        mobileMenu.addEventListener('click', toggleMobileMenu);
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    
    if (mobileMenu && mobileNavOverlay) {
        mobileMenu.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        document.body.style.overflow = mobileNavOverlay.classList.contains('active') ? 'hidden' : 'auto';
    }
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    
    if (mobileMenu && mobileNavOverlay) {
        mobileMenu.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function initializeEasterEggs() {
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let konamiCode = [];
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.code);
        konamiCode.splice(-konamiSequence.length - 1, konamiCode.length - konamiSequence.length);
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            document.body.classList.toggle('konami-mode');
            console.log('Konami code activated! 🎮');
        }
    });
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
    element.style.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    document.body.appendChild(element);
    
    setTimeout(() => element.remove(), 20000);
}

// Enhanced AI CHATBOT LOGIC
const advancedAI = {
    isTyping: false,
    async getAIResponse(userMessage) {
        if (this.isTyping) return;
        this.isTyping = true;
        const typingIndicator = showTypingIndicator();
        try {
            const response = await fetch('/.netlify/functions/get-ai-response', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage })
            });
            if (!response.ok) throw new Error('Network error.');
            const data = await response.json();
            addAIMessage(data.reply, 'bot');
        } catch (error) {
            console.error('AI Response Error:', error);
            addAIMessage("My circuits are tangled. Try again!", 'bot');
        } finally {
            this.isTyping = false;
            typingIndicator.remove();
        }
    }
};

function toggleAI() {
    const aiChat = document.getElementById('aiChat');
    if (aiChat) {
        aiChat.classList.toggle('active');
        if (aiChat.classList.contains('active')) {
            setTimeout(() => {
                const input = aiChat.querySelector('.ai-input');
                if (input) input.focus();
            }, 400);
        }
    }
}

function handleAIInput(event) { 
    if (event.key === 'Enter') sendAIMessage(); 
}

function sendAIMessage() {
    const input = document.querySelector('.ai-input');
    if (!input) return;
    const message = input.value.trim();
    if (!message || advancedAI.isTyping) return;
    addAIMessage(message, 'user');
    input.value = '';
    advancedAI.getAIResponse(message);
}

function addAIMessage(text, type) {
    const messagesContainer = document.getElementById('aiMessages');
    if (!messagesContainer) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${type}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('aiMessages');
    if (!messagesContainer) return { remove: () => {} };
    const indicator = document.createElement('div');
    indicator.className = 'ai-message bot';
    indicator.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
    messagesContainer.appendChild(indicator);
    return indicator;
}