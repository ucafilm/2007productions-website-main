// Enhanced JavaScript for 2007 Productions - Mobile Optimized

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Mobile Detection
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768 ||
           ('ontouchstart' in window);
}

function initializeApp() {
    if (typeof gsap === 'undefined') { 
        console.error("GSAP not loaded!"); 
        return; 
    }
    
    gsap.registerPlugin(ScrollTrigger);
    
    // *** MOBILE-FIRST SCROLLSMOOTHER SETUP ***
    const isMobile = isMobileDevice();
    
    if (!isMobile) {
        // Desktop only - full effects
        gsap.registerPlugin(ScrollSmoother);
        ScrollSmoother.create({
            wrapper: "#smooth-wrapper",
            content: "#smooth-content",
            smooth: 1.5,
            effects: true,
            normalizeScroll: false  // Prevents mobile issues
        });
    } else {
        // Mobile - disable ScrollSmoother completely
        console.log('Mobile detected - ScrollSmoother disabled');
        
        // Remove smooth wrapper constraints for native mobile scroll
        const smoothWrapper = document.getElementById('smooth-wrapper');
        const smoothContent = document.getElementById('smooth-content');
        
        if (smoothWrapper && smoothContent) {
            // Reset mobile scroll behavior
            smoothWrapper.style.position = 'static';
            smoothWrapper.style.height = 'auto';
            smoothWrapper.style.overflow = 'visible';
            smoothContent.style.overflow = 'visible';
            smoothContent.style.width = 'auto';
        }
        
        // Disable problematic scroll triggers on mobile
        ScrollTrigger.config({
            limitCallbacks: true,
            ignoreMobileResize: true
        });
    }
    
    // Loading animation
    gsap.to("#loadingOverlay", { 
        opacity: 0, 
        duration: 0.8, 
        delay: 0.5, 
        onComplete: () => {
            document.getElementById('loadingOverlay').style.display = 'none';
            initializeAnimations();
            if (!isMobile) {
                new EnhancedInteractions(); // Desktop only
            }
        }
    });
    
    showPage('home');
    initializeCursor();
    initializeMobileMenu();
    initializeEasterEggs();
    
    // Reduce chaos elements on mobile
    if (!isMobile) {
        setInterval(createChaosElement, 5000);
    }
}

// Enhanced Interactions Class (Desktop Only)
class EnhancedInteractions {
    constructor() {
        if (isMobileDevice()) return; // Skip on mobile
        
        this.cursor = document.querySelector('.cursor');
        this.cursorTrail = document.querySelector('.cursor-trail');
        this.magneticElements = document.querySelectorAll('[data-magnetic]');
        this.pixelatedElements = document.querySelectorAll('.member-visual');
        
        this.init();
    }

    init() {
        this.initMagneticCursor();
        this.initPixelatedHovers();
        this.initTextMorphing();
        this.initAdvancedScrollEffects();
    }

    // Magnetic Cursor Effect (Desktop only)
    initMagneticCursor() {
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const updateCursor = () => {
            const dx = mouseX - cursorX;
            const dy = mouseY - cursorY;
            
            cursorX += dx * 0.1;
            cursorY += dy * 0.1;
            
            if (this.cursor) {
                this.cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
            }
            
            requestAnimationFrame(updateCursor);
        };
        updateCursor();

        // Magnetic effect for special elements
        this.magneticElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (this.cursor) {
                    gsap.to(this.cursor, {
                        scale: 2,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });

            element.addEventListener('mouseleave', () => {
                if (this.cursor) {
                    gsap.to(this.cursor, {
                        scale: 1,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
                gsap.to(element, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.3)"
                });
            });

            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const deltaX = (e.clientX - centerX) * 0.2;
                const deltaY = (e.clientY - centerY) * 0.2;
                
                gsap.to(element, {
                    x: deltaX,
                    y: deltaY,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
    }

    // Simplified hover effects
    initPixelatedHovers() {
        this.pixelatedElements.forEach((element) => {
            const memberName = element.getAttribute('data-member');
            
            element.addEventListener('click', () => {
                this.showVideoModal(memberName || 'member');
            });
        });
    }

    // Text Morphing (simplified for mobile performance)
    initTextMorphing() {
        const morphTexts = document.querySelectorAll('[data-morph]');
        
        morphTexts.forEach(element => {
            const originalText = element.textContent;
            const morphText = element.getAttribute('data-morph');
            
            element.addEventListener('mouseenter', () => {
                element.textContent = morphText;
            });

            element.addEventListener('mouseleave', () => {
                element.textContent = originalText;
            });
        });
    }

    // Mobile-optimized scroll effects
    initAdvancedScrollEffects() {
        // Simplified scroll triggers for better mobile performance
        gsap.utils.toArray('[data-reveal]').forEach(element => {
            gsap.fromTo(element, 
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: element,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });
    }

    // Video Modal Function
    showVideoModal(memberName) {
        const memberData = {
            collin: { title: "Collin's Director Showcase", description: "Narrative-driven pieces showcasing directorial vision and storytelling mastery" },
            corey: { title: "Corey's Cinematography Portfolio", description: "Dynamic visual storytelling through expert cinematography and precision editing" },
            levi: { title: "Levi's Production Archives", description: "Production excellence and immersive soundscapes across diverse projects" },
            tim: { title: "Tim's Creative Collection", description: "Strategic creative solutions and innovative brand experiences" },
            terrell: { title: "Terrell's Musical Repertoire", description: "Original compositions and production work spanning multiple genres and moods" }
        };
        
        const data = memberData[memberName] || { 
            title: "Demo Reel", 
            description: "A showcase of creative work and technical expertise" 
        };
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(0,0,0,0.9); 
            z-index: 10000; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            backdrop-filter: blur(10px);
        `;
        
        modal.innerHTML = `
            <div style="
                background: var(--surface); 
                border: 1px solid var(--border); 
                border-radius: 20px; 
                padding: 40px; 
                max-width: 90%; 
                width: 600px; 
                text-align: center; 
                position: relative;
            ">
                <h3 style="
                    font-family: var(--font-primary); 
                    font-size: 2rem; 
                    color: var(--accent-electric); 
                    margin-bottom: 20px;
                ">${data.title}</h3>
                <p style="
                    font-family: var(--font-primary); 
                    color: var(--text-secondary); 
                    margin-bottom: 30px; 
                    line-height: 1.6;
                ">${data.description}</p>
                <div style="
                    width: 100%; 
                    padding-top: 56.25%; 
                    background: linear-gradient(135deg, var(--accent-electric), var(--accent-cyber)); 
                    border-radius: 10px; 
                    margin: 0 auto 30px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 3rem; 
                    color: white; 
                    position: relative;
                ">
                    <div style="
                        position: absolute; 
                        top: 50%; 
                        left: 50%; 
                        transform: translate(-50%, -50%);
                    ">📹</div>
                </div>
                <button style="
                    background: var(--accent-electric); 
                    border: none; 
                    color: white; 
                    padding: 12px 24px; 
                    border-radius: 25px; 
                    font-family: var(--font-primary); 
                    font-weight: 600; 
                    cursor: pointer; 
                    letter-spacing: 1px;
                    transition: all 0.3s ease;
                ">CLOSE</button>
            </div>
        `;
        
        modal.querySelector('button').onclick = () => {
            modal.remove();
        };
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    }
}

// Cursor initialization (Desktop only)
function initializeCursor() {
    if (isMobileDevice()) {
        const cursor = document.getElementById('cursor');
        const cursorTrail = document.getElementById('cursorTrail');
        if(cursor) cursor.style.display = 'none';
        if(cursorTrail) cursorTrail.style.display = 'none';
        document.body.style.cursor = 'auto';
        return;
    }

    const cursor = document.getElementById('cursor');
    const cursorTrail = document.getElementById('cursorTrail');
    if (!cursor || !cursorTrail) return;

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    
    function animate() {
        gsap.to(cursor, { duration: 0.2, x: mouseX, y: mouseY });
        gsap.to(cursorTrail, { duration: 0.4, x: mouseX, y: mouseY });
        requestAnimationFrame(animate);
    }
    animate();
}

// Mobile-optimized page navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId)?.classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-link[href="#${pageId}"]`)?.classList.add('active');
    
    // Mobile-optimized animations
    const targetPage = document.getElementById(pageId);
    if (targetPage && pageId !== 'home') {
        const isMobile = isMobileDevice();
        
        if (isMobile) {
            // Simple fade-in for mobile
            gsap.set(targetPage.querySelectorAll('[data-reveal]'), { opacity: 0, y: 20 });
            gsap.to(targetPage.querySelectorAll('[data-reveal]'), {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.1
            });
        } else {
            // Full animations for desktop
            gsap.set(targetPage.querySelectorAll('[data-reveal]'), { opacity: 0, y: 50 });
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
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mobile-optimized animations
function initializeAnimations() {
    const isMobile = isMobileDevice();
    
    // Text animation setup
    document.querySelectorAll('.anim-chars').forEach(el => {
        el.innerHTML = el.textContent.trim().split('').map(char => 
            `<span>${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('');
    });

    let tl = gsap.timeline({delay: 0.2});
    
    if (isMobile) {
        // Simplified mobile animations
        tl.from(".hero-year > span", { 
            opacity: 0, 
            y: 30, 
            stagger: 0.03, 
            duration: 0.6, 
            ease: "power2.out" 
        });
        tl.from(".hero-company > span", { 
            opacity: 0, 
            y: 20, 
            stagger: 0.02, 
            duration: 0.5, 
            ease: "power2.out" 
        }, "-=0.4");
        tl.from(".hero-descriptor", { 
            opacity: 0, 
            y: 15, 
            duration: 0.5, 
            ease: "power2.out" 
        }, "-=0.3");
    } else {
        // Full desktop animations
        tl.from(".hero-year > span", { 
            yPercent: 110, 
            stagger: 0.05, 
            duration: 1, 
            ease: "power3.out" 
        });
        tl.from(".hero-company > span", { 
            yPercent: 110, 
            stagger: 0.03, 
            duration: 0.8, 
            ease: "power3.out" 
        }, "-=0.8");
        tl.from(".hero-descriptor", { 
            opacity: 0, 
            y: 20, 
            duration: 1, 
            ease: "power3.out" 
        }, "-=0.5");
        
        createBokeh(); // Desktop only
    }
}

// Desktop-only bokeh effect
function createBokeh() {
    if (isMobileDevice()) return;
    
    const container = document.querySelector('.hero-video-background');
    if (!container) return;
    
    for (let i = 0; i < 15; i++) {  // Reduced from 20 to 15
        const particle = document.createElement('div');
        particle.className = 'bokeh-particle';
        container.appendChild(particle);
        gsap.set(particle, { 
            x: gsap.utils.random(0, window.innerWidth), 
            y: gsap.utils.random(0, window.innerHeight), 
            scale: gsap.utils.random(0.2, 1.2), 
            background: gsap.utils.random(['var(--accent-electric)', 'var(--accent-cyber)']) 
        });
        gsap.to(particle, { 
            duration: gsap.utils.random(15, 25),  // Slower animation
            x: "+=" + gsap.utils.random(-80, 80), 
            y: "+=" + gsap.utils.random(-80, 80), 
            opacity: gsap.utils.random(0.1, 0.4), 
            repeat: -1, 
            yoyo: true, 
            ease: "sine.inOut" 
        });
    }
}

// Mode switching (simplified for mobile)
function switchMode(mode, event) {
    document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    document.body.className = mode === 'agency' ? 'agency-mode' : '';
    
    // Simplified mobile text morphing
    const isMobile = isMobileDevice();
    
    if (!isMobile) {
        document.querySelectorAll('.text-morph').forEach(el => {
            el.classList.add('text-rearranging');
            setTimeout(() => el.classList.remove('text-rearranging'), 600);
        });
    }
    
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
    }, isMobile ? 100 : 300);
}

function initializeInteractions() {
    // Add magnetic attribute to interactive elements (desktop only)
    if (!isMobileDevice()) {
        document.querySelectorAll('button, .nav-link, .skill-tag, .contact-link').forEach(el => {
            if (!el.hasAttribute('data-magnetic')) {
                el.setAttribute('data-magnetic', '');
            }
        });
    }
    
    // Add reveal attributes to text elements
    document.querySelectorAll('.member-bio, .member-role, .skills-title').forEach(el => {
        if (!el.hasAttribute('data-reveal')) {
            el.setAttribute('data-reveal', '');
        }
    });
}

function initializeMobileMenu() { 
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    
    if (mobileMenu && mobileNavOverlay) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            mobileNavOverlay.classList.toggle('active');
            document.body.style.overflow = mobileNavOverlay.classList.contains('active') ? 'hidden' : 'auto';
        });
        
        // Close mobile menu on outside click
        mobileNavOverlay.addEventListener('click', (e) => {
            if (e.target === mobileNavOverlay) {
                mobileMenu.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
}

function initializeEasterEggs() {
    if (isMobileDevice()) return; // Skip on mobile
    
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
    if (isMobileDevice()) return; // Skip on mobile
    
    const symbols = ['◊', '∆', '○', '□'];
    const element = document.createElement('div');
    element.className = 'chaos-element';
    element.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    element.style.left = Math.random() * 100 + 'vw';
    element.style.top = '-50px';
    element.style.animationDuration = (Math.random() * 15 + 15) + 's'; // Slower
    element.style.fontSize = (Math.random() * 1.5 + 1) + 'rem'; // Smaller
    element.style.color = `hsl(${Math.random() * 360}, 60%, 45%)`; // Less bright
    document.body.appendChild(element);
    
    setTimeout(() => element.remove(), 25000);
}

// *** AI CHATBOT (Mobile Optimized) ***
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
    aiChat.classList.toggle('active');
    if (aiChat.classList.contains('active')) {
        setTimeout(() => aiChat.querySelector('.ai-input').focus(), 400);
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

// Global page function
window.showPage = showPage;
