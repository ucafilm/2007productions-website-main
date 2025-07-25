// Robot-Style Kinetic Typography Functions
function initializeKineticHero() {
    const kineticSequence = [
        { id: 'kinetic1', delay: 500, duration: 2000 },   // 2007
        { id: 'kinetic2', delay: 2800, duration: 2200 },  // PRODUCTIONS
        { id: 'kinetic3', delay: 5300, duration: 1800 },  // WHERE STORIES
        { id: 'kinetic4', delay: 7400, duration: 2000 },  // GET WEIRD
        { id: 'kinetic5', delay: 9700, duration: 1800 },  // CREATIVE
        { id: 'kinetic6', delay: 11800, duration: 2000 }, // POWERHOUSE
        { id: 'kinetic7', delay: 14100, duration: 1500 }, // FEARLESS
        { id: 'kinetic8', delay: 15900, duration: 1800 }, // INNOVATION
        { id: 'kinetic9', delay: 18000, duration: 3000 }  // WELCOME (final)
    ];

    let kineticTimeouts = [];
    let kineticStep = 0;

    function showKineticText(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('visible');
        }
    }

    function hideKineticText(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('exit');
            setTimeout(() => {
                element.classList.remove('visible', 'exit');
            }, 800);
        }
    }

    function updateKineticProgress(step) {
        const dots = document.querySelectorAll('.kinetic-progress .progress-dot');
        dots.forEach((dot, index) => {
            if (index <= Math.floor(step / 2)) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function startKineticSequence() {
        kineticSequence.forEach((item, index) => {
            // Show text
            const showTimeout = setTimeout(() => {
                showKineticText(item.id);
                updateKineticProgress(index);
                kineticStep = index;
            }, item.delay);
            kineticTimeouts.push(showTimeout);

            // Hide text (except the last one)
            if (index < kineticSequence.length - 1) {
                const hideTimeout = setTimeout(() => {
                    hideKineticText(item.id);
                }, item.delay + item.duration);
                kineticTimeouts.push(hideTimeout);
            }
        });

        // Final transition to main site
        const finalTimeout = setTimeout(() => {
            transitionToMainSite();
        }, 21500);
        kineticTimeouts.push(finalTimeout);
    }

    function transitionToMainSite() {
        const kineticHero = document.getElementById('kineticHero');
        const originalHero = document.getElementById('originalHero');
        const nav = document.querySelector('.nav');

        if (kineticHero && originalHero) {
            // Fade out kinetic hero
            kineticHero.style.transition = 'opacity 1s ease';
            kineticHero.style.opacity = '0';

            setTimeout(() => {
                kineticHero.style.display = 'none';
                originalHero.style.display = 'block';
                
                // Show navigation
                if (nav) {
                    nav.style.opacity = '1';
                    nav.style.pointerEvents = 'auto';
                }
                
                // Initialize original hero animations if GSAP is available
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo('.hero-year > span', 
                        { yPercent: 110 }, 
                        { yPercent: 0, stagger: 0.05, duration: 1, ease: 'power3.out' }
                    );
                }
                
                console.log('Transitioned to main 2007 Productions site');
            }, 1000);
        }
    }

    // Global skip function
    window.skipKineticIntro = function() {
        // Clear all timeouts
        kineticTimeouts.forEach(timeout => clearTimeout(timeout));
        
        // Hide all text
        kineticSequence.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                element.classList.remove('visible');
                element.classList.add('exit');
            }
        });

        // Transition immediately
        setTimeout(transitionToMainSite, 500);
    };

    // Click anywhere to advance
    document.addEventListener('click', (e) => {
        // Don't trigger on skip button clicks
        if (e.target.classList.contains('kinetic-skip')) return;
        
        if (kineticStep < kineticSequence.length - 1) {
            // Skip to next text immediately
            kineticStep++;
        } else {
            window.skipKineticIntro();
        }
    });

    // Start the kinetic sequence
    startKineticSequence();
}

// Main application script

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    console.log('Initializing 2007 Productions app...');
    
    // Core GSAP setup
    if (typeof gsap === 'undefined') { 
        console.error("GSAP not loaded!"); 
        // Even without GSAP, try to show the page
        fallbackInitialization();
        return; 
    }
    
    try {
        gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    } catch (e) {
        console.warn('GSAP plugins failed to register:', e);
    }

    // Initialize EffectManager (if available)
    if (typeof EffectManager !== 'undefined') {
        window.effectManager = new EffectManager();
    } else {
        console.warn('EffectManager not available, continuing without effects');
        window.effectManager = { registerEffect: () => {}, destroyEffect: () => {} };
    }

    // Initialize smooth scrolling
    ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5,
        effects: true
    });
    
    // Hide loading overlay after setup
    try {
        gsap.to("#loadingOverlay", { 
            opacity: 0, 
            duration: 0.8, 
            delay: 0.5, 
            onComplete: () => {
                document.getElementById('loadingOverlay').style.display = 'none';
                initializeCore();
            }
        });
    } catch (error) {
        console.error('GSAP animation failed, using fallback:', error);
        // Fallback without animation
        setTimeout(() => {
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            initializeCore();
        }, 1000);
    }
}

// Fallback initialization if GSAP fails to load
function fallbackInitialization() {
    console.log('Using fallback initialization...');
    
    // Hide loading overlay without animation
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            loadingOverlay.style.display = 'none';
        }
        
        // Initialize basic functionality
        try {
            showPage('home');
            initializeMobileMenu();
            console.log('Fallback initialization complete');
        } catch (error) {
            console.error('Even fallback initialization failed:', error);
        }
    }, 500);
}

function initializeCore() {
    try {
        // Basic animations that don't depend on effects
        initializeAnimations();
        createBokeh();
        setInterval(createChaosElement, 5000);

        // Navigation and UI
        initializeInteractions();
        initializeMobileMenu();
        initializeEasterEggs();
        
        // Initialize LocomotiveCursor globally if enabled by DeviceOptimizer
        if (window.LocomotiveCursor && window.deviceOptimizer && window.deviceOptimizer.shouldEnableEffect) {
            try {
                if (window.deviceOptimizer.shouldEnableEffect('cursor')) {
                    window.locomotiveCursor = new LocomotiveCursor();
                    window.effectManager.registerEffect('locomotiveCursor', window.locomotiveCursor);
                }
            } catch (e) {
                console.warn('LocomotiveCursor initialization failed:', e);
            }
        }

        // Page management
        showPage('home');
        
        // Initialize Robot-style kinetic hero
        if (document.getElementById('kineticHero')) {
            // Hide navigation initially during kinetic intro
            const nav = document.querySelector('.nav');
            if (nav) {
                nav.style.opacity = '0';
                nav.style.pointerEvents = 'none';
            }
            
            // Start kinetic sequence
            setTimeout(() => {
                initializeKineticHero();
            }, 500);
        }
        
        console.log('Core initialization complete');
    } catch (error) {
        console.error('Core initialization error:', error);
        // Still try to show the home page even if other things fail
        showPage('home');
    }
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

// Bandcamp Player Integration
class BandcampPlayer {
    constructor() {
        this.playerConfig = {
            // Replace these with actual Bandcamp album details
            albumId: null,
            bandcampUrl: null,
            size: 'large',
            bgColor: '0a0a0a',      // Dark background to match site
            linkColor: 'ff6b35',    // 2007 Productions orange
            tracklist: 'false',     // Show tracklist
            artwork: 'small',       // Show artwork
            transparent: 'true'     // Transparent background
        };
        this.init();
    }

    init() {
        // Initialize player when page loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupPlayer());
        } else {
            this.setupPlayer();
        }
    }

    setupPlayer() {
        const player = document.getElementById('collinsAlbumPlayer');
        const buyButton = document.getElementById('buyAlbumBtn');
        
        if (!player) return;

        // TODO: Replace with actual Bandcamp album details
        // For now, we'll set up a placeholder that can be easily configured
        this.loadAlbum({
            albumId: 'NEEDS_ALBUM_ID', // Changed to trigger placeholder
            bandcampUrl: 'https://collinbuchanan.bandcamp.com/album/lost-motel', // Replace with actual URL
            title: 'Lost Motel' // Replace with actual title
        });
    }

    loadAlbum(config) {
        if (!config.albumId || config.albumId === '1234567890' || config.albumId === '1234567890') {
            // Show placeholder until real album is configured
            this.showPlaceholder();
            return;
        }

        const player = document.getElementById('collinsAlbumPlayer');
        const buyButton = document.getElementById('buyAlbumBtn');
        
        if (player) {
            // Remove any existing placeholder
            const existingPlaceholder = player.parentNode.querySelector('.bandcamp-placeholder');
            if (existingPlaceholder) {
                existingPlaceholder.remove();
            }
            
            // Show the iframe and load the album
            player.style.display = 'block';
            
            // Construct Bandcamp embed URL
            const embedUrl = this.buildEmbedUrl(config.albumId);
            player.src = embedUrl;
            
            // Set up buy button
            if (buyButton && config.bandcampUrl) {
                buyButton.href = config.bandcampUrl;
                buyButton.title = `Buy ${config.title || 'album'} on Bandcamp`;
            }
        }
    }

    buildEmbedUrl(albumId) {
        // Use the official Bandcamp embed format from the share dialog
        return `https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=${this.playerConfig.size}/bgcol=${this.playerConfig.bgColor}/linkcol=${this.playerConfig.linkColor}/tracklist=${this.playerConfig.tracklist}/artwork=${this.playerConfig.artwork}/transparent=${this.playerConfig.transparent}/`;
    }

    showPlaceholder() {
        const player = document.getElementById('collinsAlbumPlayer');
        const buyButton = document.getElementById('buyAlbumBtn');
        
        if (player) {
            // Create a styled placeholder
            const placeholderHtml = `
                <div style="
                    width: 100%;
                    height: 120px;
                    background: linear-gradient(135deg, var(--surface) 0%, var(--border) 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    font-family: 'Space Grotesk', sans-serif;
                    color: var(--text-secondary);
                    text-align: center;
                    padding: 20px;
                ">
                    <div>
                        <div style="font-size: 2rem; margin-bottom: 8px;">🎵</div>
                        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Bandcamp Player</div>
                        <div style="font-size: 12px; opacity: 0.7;">Album configuration needed</div>
                    </div>
                </div>
            `;
            
            player.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.innerHTML = placeholderHtml;
            placeholder.className = 'bandcamp-placeholder';
            player.parentNode.insertBefore(placeholder, player);
        }
        
        if (buyButton) {
            buyButton.href = '#';
            buyButton.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Bandcamp album configuration needed. Please add album ID and URL.');
            });
        }
    }

    // Method to easily configure the album (can be called externally)
    configure(albumConfig) {
        console.log('BandcampPlayer.configure called with:', albumConfig);
        this.loadAlbum(albumConfig);
    }
    
    // Rich fallback for when embed doesn't work
    showAlbumFallback(albumInfo) {
        const player = document.getElementById('collinsAlbumPlayer');
        const container = player?.parentNode;
        
        if (!container) return;
        
        // Remove iframe and any existing content
        if (player) player.style.display = 'none';
        const existingFallback = container.querySelector('.album-fallback');
        if (existingFallback) existingFallback.remove();
        
        // Create rich album display
        const fallbackHtml = `
            <div class="album-fallback" style="
                background: linear-gradient(135deg, var(--surface) 0%, var(--border) 100%);
                border-radius: 12px;
                padding: 24px;
                border: 1px solid var(--border);
                transition: all 0.3s ease;
            ">
                <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                    <div style="
                        width: 80px;
                        height: 80px;
                        background: linear-gradient(135deg, var(--accent-electric), var(--accent-cyber));
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 2rem;
                        flex-shrink: 0;
                    ">
                        🎵
                    </div>
                    <div style="flex: 1;">
                        <h3 style="
                            font-family: 'Space Grotesk', sans-serif;
                            font-size: 1.4rem;
                            font-weight: 600;
                            color: var(--text-primary);
                            margin: 0 0 8px 0;
                        ">${albumInfo.title}</h3>
                        <p style="
                            font-family: 'Inter', sans-serif;
                            color: var(--text-secondary);
                            margin: 0 0 12px 0;
                            font-size: 1.1rem;
                        ">by ${albumInfo.artist}</p>
                        <p style="
                            font-family: 'Inter', sans-serif;
                            color: var(--text-muted);
                            font-size: 0.95rem;
                            line-height: 1.4;
                            margin: 0;
                        ">${albumInfo.description}</p>
                    </div>
                </div>
                
                <div style="
                    background: rgba(255, 107, 53, 0.05);
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                ">
                    <h4 style="
                        font-family: 'Space Grotesk', sans-serif;
                        font-size: 0.9rem;
                        font-weight: 600;
                        color: var(--accent-electric);
                        margin: 0 0 12px 0;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    ">Track Listing</h4>
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                        gap: 8px;
                    ">
                        ${albumInfo.tracks.map((track, i) => `
                            <div style="
                                font-family: 'JetBrains Mono', monospace;
                                font-size: 0.85rem;
                                color: var(--text-secondary);
                                padding: 4px 0;
                            ">
                                ${String(i + 1).padStart(2, '0')}. ${track}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div style="
                    text-align: center;
                    padding: 16px;
                    background: rgba(74, 158, 255, 0.05);
                    border-radius: 8px;
                    border: 1px dashed var(--accent-cyber);
                ">
                    <p style="
                        font-family: 'Inter', sans-serif;
                        color: var(--text-secondary);
                        margin: 0 0 12px 0;
                        font-size: 0.9rem;
                    ">Listen & Purchase on Bandcamp</p>
                    <a href="${albumInfo.url}" target="_blank" style="
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        background: var(--accent-cyber);
                        color: white;
                        text-decoration: none;
                        padding: 10px 20px;
                        border-radius: 20px;
                        font-family: 'Space Grotesk', sans-serif;
                        font-weight: 600;
                        font-size: 0.9rem;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='var(--accent-electric)'; this.style.transform='scale(1.05)'" 
                       onmouseout="this.style.background='var(--accent-cyber)'; this.style.transform='scale(1)'">
                        🎵 Open in Bandcamp
                    </a>
                </div>
            </div>
        `;
        
        const fallbackDiv = document.createElement('div');
        fallbackDiv.innerHTML = fallbackHtml;
        container.insertBefore(fallbackDiv, player);
        
        console.log('Showing rich album fallback for:', albumInfo.title);
    }
}

// Initialize Bandcamp player
window.bandcampPlayer = new BandcampPlayer();

// Expose configuration function globally for easy setup
window.configureBandcampAlbum = function(albumId, bandcampUrl, title) {
    console.log('configureBandcampAlbum called with:', { albumId, bandcampUrl, title });
    if (window.bandcampPlayer) {
        window.bandcampPlayer.configure({
            albumId: albumId,
            bandcampUrl: bandcampUrl,
            title: title
        });
    } else {
        console.error('Bandcamp player not initialized yet');
    }
};

// SETUP INSTRUCTIONS FOR COLLIN'S BANDCAMP:
// 1. Go to: https://collinbuchanan.bandcamp.com/album/lost-motel
// 2. Open browser console (F12)
// 3. Run: JSON.parse(document.querySelector('meta[name="bc-page-properties"]').content).item_id
// 4. Replace 'NEEDS_ALBUM_ID' below with the number that appears
// 
// Configure Collin's Bandcamp Album - "Lost Motel"
// This will override the default placeholder
setTimeout(() => {
    console.log('Configuring Collin\'s Bandcamp album...');
    
    // Use the correct album ID from official Bandcamp embed
    window.configureBandcampAlbum(
        '3117557672',  // ✅ Correct Album ID from Bandcamp embed code!
        'https://collinbuchanan.bandcamp.com/album/lost-motel',
        'Lost Motel by Collin Tyler Buchanan'
    );
    
    // Reduced fallback timeout since embed should work now
    setTimeout(() => {
        const player = document.getElementById('collinsAlbumPlayer');
        if (player && player.src && player.src.includes('3117557672')) {
            // Only show fallback if embed definitely failed after 5 seconds
            setTimeout(() => {
                // Check if iframe shows error content
                try {
                    if (player.style.display !== 'none') {
                        window.bandcampPlayer.showAlbumFallback({
                            title: 'Lost Motel',
                            artist: 'Collin Tyler Buchanan',
                            tracks: [
                                'Intro',
                                'Lost Highway',
                                'Neon Dreams', 
                                'Empty Rooms',
                                'Static Memories',
                                'Outro'
                            ],
                            description: 'Atmospheric soundscapes that blur the line between music and emotion.',
                            url: 'https://collinbuchanan.bandcamp.com/album/lost-motel'
                        });
                    }
                } catch (e) {
                    console.log('Embed appears to be working');
                }
            }, 5000);
        }
    }, 1000);
}, 1000); // Wait 1 second for DOM to be ready