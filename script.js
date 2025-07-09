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
            // Initialize new locomotive cursor
            initLocomotiveCursor();
        }
    });
    
    showPage('home');
    initializeInteractions();
    initializeMobileMenu();
    initializeEasterEggs();
    setInterval(createChaosElement, 5000);
}

// Enhanced Locomotive-Style Cursor System
class LocomotiveCursor {
    constructor() {
        this.cursor = null;
        this.cursorInner = null;
        this.cursorOuter = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.outerX = 0;
        this.outerY = 0;
        this.innerX = 0;
        this.innerY = 0;
        this.isHovered = false;
        this.isClicking = false;
        this.isDisabled = window.innerWidth <= 768;
        
        this.init();
    }

    init() {
        if (this.isDisabled) return;
        
        this.createCursor();
        this.bindEvents();
        this.render();
    }

    createCursor() {
        // Remove existing cursors
        const existingCursors = document.querySelectorAll('.cursor, .cursor-trail, .locomotive-cursor');
        existingCursors.forEach(cursor => cursor.remove());

        // Create cursor container
        this.cursor = document.createElement('div');
        this.cursor.className = 'locomotive-cursor';
        this.cursor.innerHTML = `
            <div class="cursor-inner"></div>
            <div class="cursor-outer"></div>
        `;
        
        document.body.appendChild(this.cursor);
        
        this.cursorInner = this.cursor.querySelector('.cursor-inner');
        this.cursorOuter = this.cursor.querySelector('.cursor-outer');

        // Add CSS styles
        this.addStyles();
        
        // Hide default cursor
        document.body.style.cursor = 'none';
        document.documentElement.style.cursor = 'none';
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .locomotive-cursor {
                position: fixed;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 9999;
                mix-blend-mode: difference;
            }

            .cursor-inner {
                position: absolute;
                width: 8px;
                height: 8px;
                background: #fff;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: transform 0.1s ease-out;
            }

            .cursor-outer {
                position: absolute;
                width: 32px;
                height: 32px;
                border: 1px solid rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            /* Button hover */
            .locomotive-cursor.button-hover .cursor-inner {
                transform: translate(-50%, -50%) scale(0);
            }

            .locomotive-cursor.button-hover .cursor-outer {
                transform: translate(-50%, -50%) scale(1.5);
                background: rgba(255, 107, 53, 0.2);
                border-color: var(--accent-electric, #ff6b35);
                border-width: 2px;
            }

            /* Video hover */
            .locomotive-cursor.video-hover .cursor-inner {
                width: 16px;
                height: 16px;
                background: transparent;
                border: 2px solid #fff;
            }

            .locomotive-cursor.video-hover .cursor-inner::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 16px;
                height: 16px;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fff'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E");
                background-size: contain;
            }

            .locomotive-cursor.video-hover .cursor-outer {
                transform: translate(-50%, -50%) scale(2.5);
                border-color: #fff;
                background: rgba(255, 255, 255, 0.1);
            }

            /* Hide on mobile */
            @media (max-width: 768px) {
                .locomotive-cursor {
                    display: none !important;
                }
            }

            /* Disable cursor on specific elements */
            *, *::before, *::after {
                cursor: none !important;
            }

            /* Re-enable on inputs */
            input, textarea, select {
                cursor: text !important;
            }
        `;
        
        if (!document.querySelector('#locomotive-cursor-styles')) {
            style.id = 'locomotive-cursor-styles';
            document.head.appendChild(style);
        }
    }

    bindEvents() {
        // Mouse move with high precision
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Mouse down/up
        document.addEventListener('mousedown', () => {
            this.isClicking = true;
            if (this.cursor) this.cursor.classList.add('clicking');
        });

        document.addEventListener('mouseup', () => {
            this.isClicking = false;
            if (this.cursor) this.cursor.classList.remove('clicking');
        });

        // Hover effects for different elements
        this.bindHoverEffects();

        // Handle window resize
        window.addEventListener('resize', () => {
            this.isDisabled = window.innerWidth <= 768;
            if (this.isDisabled) {
                this.destroy();
            }
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            if (this.cursor) this.cursor.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            if (this.cursor) this.cursor.style.opacity = '1';
        });
    }

    bindHoverEffects() {
        // Interactive elements
        const interactiveSelectors = [
            'button', 
            '.ai-button',
            '.mode-button',
            '.nav-link',
            '.contact-link',
            '.skill-tag',
            '[data-magnetic]'
        ];

        const videoSelectors = [
            '.member-visual',
            '.play-button',
            '[data-video]'
        ];

        // Button hover effects
        this.addHoverEffect(interactiveSelectors, 'button-hover');
        
        // Video hover effects
        this.addHoverEffect(videoSelectors, 'video-hover');
    }

    addHoverEffect(selectors, className) {
        selectors.forEach(selector => {
            document.addEventListener('mouseover', (e) => {
                if (e.target.matches(selector) || e.target.closest(selector)) {
                    if (this.cursor) this.cursor.classList.add(className);
                    this.isHovered = true;
                }
            });

            document.addEventListener('mouseout', (e) => {
                if (e.target.matches(selector) || e.target.closest(selector)) {
                    if (this.cursor) this.cursor.classList.remove(className);
                    this.isHovered = false;
                }
            });
        });
    }

    render() {
        if (this.isDisabled || !this.cursor) return;

        // Smooth animation using different easing for inner and outer
        this.innerX += (this.mouseX - this.innerX) * 0.9; // Fast and precise for inner
        this.innerY += (this.mouseY - this.innerY) * 0.9;
        
        this.outerX += (this.mouseX - this.outerX) * 0.15; // Slower for outer (trail effect)
        this.outerY += (this.mouseY - this.outerY) * 0.15;

        // Apply transforms with sub-pixel precision
        this.cursorInner.style.transform = `translate(${this.innerX}px, ${this.innerY}px) translate(-50%, -50%)`;
        this.cursorOuter.style.transform = `translate(${this.outerX}px, ${this.outerY}px) translate(-50%, -50%)`;

        // Continue animation
        requestAnimationFrame(() => this.render());
    }

    destroy() {
        if (this.cursor) {
            this.cursor.remove();
            document.body.style.cursor = 'auto';
            document.documentElement.style.cursor = 'auto';
            
            // Remove styles
            const styles = document.querySelector('#locomotive-cursor-styles');
            if (styles) styles.remove();
        }
    }
}

// Enhanced Interactions Class
class EnhancedInteractions {
    constructor() {
        this.magneticElements = document.querySelectorAll('[data-magnetic]');
        this.pixelatedElements = document.querySelectorAll('.member-visual');
        
        this.init();
    }

    init() {
        this.initMagneticEffects();
        this.initPixelatedHovers();
        this.initTextMorphing();
        this.initAdvancedScrollEffects();
    }

    // Magnetic effect for special elements
    initMagneticEffects() {
        this.magneticElements.forEach(element => {
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
            const imageSrc = element.dataset.image; // Assumes you add a data-image attribute to your .member-visual elements

            if (!imageSrc) return;

            const overlay = document.createElement('div');
            overlay.className = 'pixel-overlay';
            const canvas = document.createElement('canvas');
            canvas.className = 'pixel-canvas';
            overlay.appendChild(canvas);
            element.appendChild(overlay);

            const ctx = canvas.getContext('2d');
            const image = new Image();
            image.src = imageSrc;
            image.crossOrigin = "Anonymous"; // Required for Unsplash images

            image.onload = () => {
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                ctx.drawImage(image, 0, 0);
            };

            // Click handler for video modal
            element.addEventListener('click', () => {
                this.showVideoModal(memberName || 'member');
            });

            // Scroll-triggered reveal
            ScrollTrigger.create({
                trigger: element,
                start: "top 80%",
                onEnter: () => {
                    gsap.to(canvas, { 
                        opacity: 1, 
                        filter: 'blur(0px) saturate(1)', 
                        scale: 1, 
                        duration: 0.8, 
                        ease: 'power2.out' 
                    });
                },
                onLeaveBack: () => {
                    gsap.to(canvas, { 
                        opacity: 0, 
                        filter: 'blur(10px) saturate(0)', 
                        scale: 1.1, 
                        duration: 0.8, 
                        ease: 'power2.in' 
                    });
                }
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
        // General parallax for background elements
        gsap.utils.toArray('.parallax-bg').forEach(bg => {
            gsap.to(bg, {
                yPercent: -50,
                ease: "none",
                scrollTrigger: {
                    trigger: bg.closest('.parallax-section'),
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });

        // Enhanced parallax for member pages
        gsap.utils.toArray('.member-layout.parallax-section').forEach(section => {
            const visual = section.querySelector('.member-visual');

            if (visual) {
                gsap.to(visual, {
                    yPercent: -25, // Adjust this value for more/less parallax
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 0.5 // A bit of smoothing
                    }
                });
            }
        });

        // Text reveal on scroll (chars, words, lines)
        gsap.utils.toArray('[data-reveal]').forEach(element => {
            const revealType = element.getAttribute('data-reveal') || 'words';
            let split;

            if (revealType === 'chars') {
                const text = element.textContent;
                element.innerHTML = text.split('').map(char => 
                    `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`
                ).join('');
                split = element.querySelectorAll('.char');
            } else { // Default to words
                const text = element.textContent;
                element.innerHTML = text.split(' ').map(word => 
                    `<span class="word">${word}</span>`
                ).join(' ');
                split = element.querySelectorAll('.word');
            }
            
            gsap.set(split, { y: 100, opacity: 0 });
            
            gsap.to(split, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: revealType === 'chars' ? 0.02 : 0.1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%"
                }
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
                background: var(--surface, #1a1a1a); 
                border: 1px solid var(--border, #333); 
                border-radius: 20px; 
                padding: 40px; 
                max-width: 90%; 
                width: 600px; 
                text-align: center; 
                position: relative;
            ">
                <h3 style="
                    font-family: 'Space Grotesk', sans-serif; 
                    font-size: 2rem; 
                    color: #ff6b35; 
                    margin-bottom: 20px;
                ">${data.title}</h3>
                <p style="
                    font-family: 'Inter', sans-serif; 
                    color: #a0a0a0; 
                    margin-bottom: 30px; 
                    line-height: 1.6;
                ">${data.description}</p>
                <div style="
                    width: 100%; 
                    padding-top: 56.25%; 
                    background: linear-gradient(135deg, #ff6b35, #4a9eff); 
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
                    background: #ff6b35; 
                    border: none; 
                    color: white; 
                    padding: 12px 24px; 
                    border-radius: 25px; 
                    font-family: 'Space Grotesk', sans-serif; 
                    font-weight: 600; 
                    cursor: pointer; 
                    letter-spacing: 1px;
                    transition: all 0.3s ease;
                "><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use xlink:href="#icon-close"/></svg></button>
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

// Initialize locomotive cursor
function initLocomotiveCursor() {
    window.locomotiveCursor = new LocomotiveCursor();
}

// Original functions (preserved and optimized)
// Enhanced About Page Functionality (Locomotive-level quality)
class LocomotiveAboutPage {
    constructor() {
        this.imageGallery = document.getElementById('imageGallery');
        this.galleryImages = [];
        this.activeImage = null;
        this.mouse = { x: 0, y: 0 };
        this.isInitialized = false;
        this.imageUrls = [
            { id: "camera", url: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&q=80" },
            { id: "director", url: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80" },
            { id: "studio", url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80" },
            { id: "editing", url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80" },
            { id: "crew", url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80" },
            { id: "lights", url: "https://images.unsplash.com/photo-1518985250321-7a0d8b57ee8e?w=800&q=80" }
        ];
        this.init();
    }

    init() {
        if (!this.imageGallery) return;
        this.setupImageGallery();
        this.bindEvents();
        this.setupTextAnimations();
        this.setupScrollTriggers();
        this.isInitialized = true;
    }

    setupImageGallery() {
        this.imageUrls.forEach(imageData => {
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'gallery-image';
            imgWrapper.dataset.image = imageData.id; // Set the data-image attribute
            const img = document.createElement('img');
            img.src = imageData.url;
            img.alt = "Dynamic gallery image";
            imgWrapper.appendChild(img);
            this.imageGallery.appendChild(imgWrapper);
            this.galleryImages.push(imgWrapper);
            gsap.set(imgWrapper, { opacity: 0, scale: 0.8, rotation: gsap.utils.random(-10, 10) });
        });
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            // Update the position of the image gallery container
            gsap.to(this.imageGallery, {
                x: this.mouse.x,
                y: this.mouse.y,
                duration: 0.3, // Adjust for desired smoothness
                ease: "power2.out"
            });
            if (this.activeImage) {
                gsap.to(this.activeImage, {
                    x: this.mouse.x,
                    y: this.mouse.y,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });

        document.querySelectorAll('.story-block').forEach(block => {
            block.addEventListener('mouseenter', () => {
                const imageId = block.getAttribute('data-trigger-image');
                this.showImage(imageId);
            });
            block.addEventListener('mouseleave', () => {
                const imageId = block.getAttribute('data-trigger-image');
                this.hideImage(imageId);
            });
        });
    }

    showImage(imageId) {
        const targetImage = this.galleryImages.find(img => img.dataset.image === imageId);
        if (targetImage && targetImage !== this.activeImage) {
            if (this.activeImage) {
                gsap.to(this.activeImage, { opacity: 0, scale: 0.8, duration: 0.3 });
            }
            this.activeImage = targetImage;
            gsap.to(this.activeImage, {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "back.out(1.7)",
                x: this.mouse.x,
                y: this.mouse.y
            });
        }
    }

    hideImage(imageId) {
        const targetImage = this.galleryImages.find(img => img.dataset.image === imageId);
        if (targetImage && targetImage === this.activeImage) {
            gsap.to(targetImage, { opacity: 0, scale: 0.8, duration: 0.3 });
            this.activeImage = null;
        }
    }

    setupScrollTriggers() {
        // Existing scroll triggers for story blocks
        document.querySelectorAll('.story-block').forEach((block, index) => {
            const imageId = block.getAttribute('data-trigger-image');
            ScrollTrigger.create({
                trigger: block,
                start: 'top 70%',
                end: 'bottom 30%',
                onEnter: () => this.showImage(imageId),
                onLeave: () => this.hideImage(imageId),
                onEnterBack: () => this.showImage(imageId),
                onLeaveBack: () => this.hideImage(imageId)
            });
        });

        // Pixel fade for video section
        ScrollTrigger.create({
            trigger: ".about-video-section",
            start: "top bottom",
            end: "center center",
            scrub: true,
            onUpdate: (self) => {
                gsap.to("#pixelOverlay", { opacity: 1 - self.progress, ease: "none" });
            }
        });

        // Scrolling text animation
        gsap.utils.toArray(".scrolling-text").forEach((textElement, i) => {
            const direction = i % 2 === 0 ? 1 : -1; // Alternate direction
            gsap.to(textElement, {
                xPercent: -100 * direction,
                repeat: -1,
                duration: 20, // Adjust speed as needed
                ease: "none",
                modifiers: {
                    xPercent: gsap.utils.wrap(-100, 100)
                }
            });
        });
    }

    setupTextAnimations() {
        gsap.utils.toArray('[data-reveal="words"]').forEach(element => {
            const words = element.textContent.split(' ');
            element.innerHTML = words.map(word => `<span class="word-wrapper"><span class="word">${word}</span></span>`).join(' ');
            const wordSpans = element.querySelectorAll('.word');

            gsap.set(wordSpans, { yPercent: 110 });

            ScrollTrigger.create({
                trigger: element,
                start: 'top 85%',
                onEnter: () => {
                    gsap.to(wordSpans, {
                        yPercent: 0,
                        duration: 0.8,
                        stagger: 0.05,
                        ease: "power3.out"
                    });
                }
            });
        });
    }

    destroy() {
        if (!this.isInitialized) return;
        ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.trigger && trigger.trigger.closest('.about-container')) {
                trigger.kill();
            }
        });
        // Hide all gallery images
        this.galleryImages.forEach(img => {
            gsap.killTweensOf(img);
            gsap.set(img, { opacity: 0, scale: 0.8 });
        });
        this.activeImage = null;
        this.isInitialized = false;
    }
}

// Global instance
let locomotiveAbout = null;

// Updated showPage function

function showPage(pageId) {
    // Cleanup previous about animations if switching away from about
    if (locomotiveAbout && pageId !== 'about') {
        locomotiveAbout.destroy();
        locomotiveAbout = null;
    }
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId)?.classList.add('active');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`.nav-link[href="#${pageId}"]`)?.classList.add('active');
    
    // Initialize About page animations
    if (pageId === 'about') {
        setTimeout(() => {
            locomotiveAbout = new LocomotiveAboutPage();
        }, 100);
    }
    
    // Trigger page animations for other pages
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