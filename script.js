// Enhanced JavaScript for 2007 Productions - Locomotive.ca Inspired

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    if (typeof gsap === 'undefined') { 
        console.error("GSAP not loaded!"); 
        return; 
    }
    
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5,
        effects: true
    });
    
    gsap.to("#loadingOverlay", { 
        opacity: 0, 
        duration: 0.8, 
        delay: 0.5, 
        onComplete: () => {
            document.getElementById('loadingOverlay').style.display = 'none';
            initializeAnimations();
            // Initialize enhanced interactions after loading
            new EnhancedInteractions();
        }
    });
    
    showPage('home');
    initializeCursor();
    initializeInteractions();
    initializeMobileMenu();
    initializeEasterEggs();
    setInterval(createChaosElement, 5000);
}

// Enhanced Interactions Class
class EnhancedInteractions {
    constructor() {
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
        this.initSoundFeedback();
    }

    // Magnetic Cursor Effect (Locomotive-style)
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
                    this.cursor.classList.add('hover');
                }
            });

            element.addEventListener('mouseleave', () => {
                if (this.cursor) {
                    gsap.to(this.cursor, {
                        scale: 1,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                    this.cursor.classList.remove('hover');
                }
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

            element.addEventListener('mouseleave', () => {
                gsap.to(element, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }

    // Pixelated Image Reveal (Baillat Studio style)
    initPixelatedHovers() {
        this.pixelatedElements.forEach((element, index) => {
            const memberName = element.getAttribute('data-member');
            
            // Create pixelated overlay
            const pixelOverlay = document.createElement('div');
            pixelOverlay.className = 'pixel-overlay';
            pixelOverlay.innerHTML = `
                <canvas class="pixel-canvas"></canvas>
                <div class="reveal-content">
                    <h3>${memberName ? memberName.toUpperCase() : 'REEL'}</h3>
                    <p>Click to view showcase</p>
                </div>
            `;
            element.appendChild(pixelOverlay);

            const canvas = pixelOverlay.querySelector('.pixel-canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size
            const updateCanvasSize = () => {
                canvas.width = element.offsetWidth;
                canvas.height = element.offsetHeight;
            };
            updateCanvasSize();
            window.addEventListener('resize', updateCanvasSize);

            // Pixelation effect
            let isHovered = false;
            let animationFrame;
            
            const animatePixels = (progress) => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                const pixelSize = Math.max(1, 20 * (1 - progress));
                const cols = Math.ceil(canvas.width / pixelSize);
                const rows = Math.ceil(canvas.height / pixelSize);
                
                for (let i = 0; i < cols; i++) {
                    for (let j = 0; j < rows; j++) {
                        const x = i * pixelSize;
                        const y = j * pixelSize;
                        
                        // Create gradient effect
                        const hue = (i + j + Date.now() * 0.001) % 360;
                        const alpha = 0.1 + (progress * 0.3);
                        
                        ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
                        ctx.fillRect(x, y, pixelSize, pixelSize);
                    }
                }
            };

            element.addEventListener('mouseenter', () => {
                if (isHovered) return;
                isHovered = true;
                
                gsap.to(pixelOverlay, {
                    opacity: 1,
                    duration: 0.6,
                    ease: "power2.out"
                });

                let startTime = Date.now();
                const animate = () => {
                    if (!isHovered) return;
                    
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / 1000, 1);
                    
                    animatePixels(progress);
                    
                    if (progress < 1) {
                        animationFrame = requestAnimationFrame(animate);
                    }
                };
                animate();
            });

            element.addEventListener('mouseleave', () => {
                isHovered = false;
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }
                
                gsap.to(pixelOverlay, {
                    opacity: 0,
                    duration: 0.4,
                    ease: "power2.out"
                });
            });

            // Click handler for video modal
            element.addEventListener('click', () => {
                this.showVideoModal(memberName || 'member');
            });
        });
    }

    // Text Morphing Animation
    initTextMorphing() {
        const morphTexts = document.querySelectorAll('[data-morph]');
        
        morphTexts.forEach(element => {
            const originalText = element.textContent;
            const morphText = element.getAttribute('data-morph');
            
            // Split text into spans
            element.innerHTML = originalText.split('').map(char => 
                `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`
            ).join('');
            
            const chars = element.querySelectorAll('.char');
            
            element.addEventListener('mouseenter', () => {
                chars.forEach((char, i) => {
                    gsap.to(char, {
                        y: -30,
                        opacity: 0,
                        duration: 0.3,
                        delay: i * 0.02,
                        ease: "power2.in",
                        onComplete: () => {
                            if (i < morphText.length) {
                                char.textContent = morphText[i];
                            }
                            gsap.to(char, {
                                y: 0,
                                opacity: 1,
                                duration: 0.3,
                                ease: "power2.out"
                            });
                        }
                    });
                });
            });

            element.addEventListener('mouseleave', () => {
                chars.forEach((char, i) => {
                    gsap.to(char, {
                        y: -30,
                        opacity: 0,
                        duration: 0.3,
                        delay: i * 0.02,
                        ease: "power2.in",
                        onComplete: () => {
                            char.textContent = originalText[i] || '';
                            gsap.to(char, {
                                y: 0,
                                opacity: 1,
                                duration: 0.3,
                                ease: "power2.out"
                            });
                        }
                    });
                });
            });
        });
    }

    // Advanced Scroll Effects
    initAdvancedScrollEffects() {
        // Parallax sections
        gsap.utils.toArray('.parallax-section').forEach(section => {
            const bg = section.querySelector('.parallax-bg');
            const content = section.querySelector('.parallax-content');
            
            if (bg) {
                gsap.to(bg, {
                    yPercent: -50,
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                });
            }
            
            if (content) {
                gsap.fromTo(content, 
                    { y: 100, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: content,
                            start: "top 80%",
                            end: "bottom 20%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            }
        });

        // Text reveal on scroll
        gsap.utils.toArray('[data-reveal]').forEach(element => {
            const text = element.textContent;
            element.innerHTML = text.split(' ').map(word => 
                `<span class="word">${word}</span>`
            ).join(' ');
            
            const words = element.querySelectorAll('.word');
            
            gsap.set(words, { y: 100, opacity: 0 });
            
            gsap.to(words, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 80%"
                }
            });
        });
    }

    // Sound Feedback System
    initSoundFeedback() {
        // Create audio context for subtle sound effects
        let audioContext;
        
        const createSound = (frequency, duration, type = 'sine') => {
            if (!audioContext) {
                try {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                } catch (e) {
                    console.log('Audio context not supported');
                    return;
                }
            }
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };

        // Add sound to hover events
        document.querySelectorAll('.nav-link, .member-visual, .skill-tag').forEach(element => {
            element.addEventListener('mouseenter', () => {
                createSound(800, 0.1);
            });
        });

        // Add sound to clicks
        document.querySelectorAll('button, .ai-send').forEach(element => {
            element.addEventListener('click', () => {
                createSound(1000, 0.15);
            });
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
                " onmouseover="this.style.background='var(--accent-cyber)'" 
                   onmouseout="this.style.background='var(--accent-electric)'">CLOSE</button>
            </div>
        `;
        
        modal.querySelector('button').onclick = () => {
            gsap.to(modal, { 
                opacity: 0, 
                duration: 0.3, 
                onComplete: () => modal.remove() 
            });
        };
        
        document.body.appendChild(modal);
        
        gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        gsap.fromTo(modal.querySelector('div > div'), 
            { scale: 0.8, y: 50 }, 
            { scale: 1, y: 0, duration: 0.4, delay: 0.1, ease: 'back.out(1.7)' }
        );
    }
}

// Original functions (preserved)
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
    
    // Trigger page animations
    const targetPage = document.getElementById(pageId);
    if (targetPage && pageId !== 'home') {
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
    // Mobile menu implementation would go here
    console.log('Mobile menu initialized');
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