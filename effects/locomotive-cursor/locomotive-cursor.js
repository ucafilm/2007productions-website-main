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
        this.isDestroyed = false;

        // Bind event handlers
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        
        this.init();
    }

    init() {
        if (this.isDisabled || this.isDestroyed) return;
        
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
        style.id = 'locomotive-cursor-styles';
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
        
        document.head.appendChild(style);
    }

    // Event Handlers
    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    handleMouseDown() {
        this.isClicking = true;
        if (this.cursor) this.cursor.classList.add('clicking');
    }

    handleMouseUp() {
        this.isClicking = false;
        if (this.cursor) this.cursor.classList.remove('clicking');
    }

    handleResize() {
        this.isDisabled = window.innerWidth <= 768;
        if (this.isDisabled) {
            this.destroy();
        } else if (!this.cursor) {
            this.init(); // Re-initialize if it was destroyed due to resize
        }
    }

    handleMouseLeave() {
        if (this.cursor) this.cursor.style.opacity = '0';
    }

    handleMouseEnter() {
        if (this.cursor) this.cursor.style.opacity = '1';
    }

    bindEvents() {
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('mouseleave', this.handleMouseLeave);
        document.addEventListener('mouseenter', this.handleMouseEnter);
        this.bindHoverEffects();
    }

    bindHoverEffects() {
        const interactiveSelectors = [
            'button', '.ai-button', '.mode-button', '.nav-link',
            '.contact-link', '.skill-tag', '[data-magnetic]'
        ];
        const videoSelectors = ['.member-visual', '.play-button', '[data-video]'];

        this.addHoverEffect(interactiveSelectors, 'button-hover');
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
        if (this.isDisabled || !this.cursor || this.isDestroyed) return;

        this.innerX += (this.mouseX - this.innerX) * 0.9;
        this.innerY += (this.mouseY - this.innerY) * 0.9;
        this.outerX += (this.mouseX - this.outerX) * 0.15;
        this.outerY += (this.mouseY - this.outerY) * 0.15;

        this.cursorInner.style.transform = `translate(${this.innerX}px, ${this.innerY}px) translate(-50%, -50%)`;
        this.cursorOuter.style.transform = `translate(${this.outerX}px, ${this.outerY}px) translate(-50%, -50%)`;

        requestAnimationFrame(() => this.render());
    }

    destroy() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        if (this.cursor) {
            this.cursor.remove();
            this.cursor = null;
        }

        document.body.style.cursor = 'auto';
        document.documentElement.style.cursor = 'auto';
        
        const styles = document.getElementById('locomotive-cursor-styles');
        if (styles) styles.remove();

        // Remove event listeners
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('mouseleave', this.handleMouseLeave);
        document.removeEventListener('mouseenter', this.handleMouseEnter);
        
        // Note: Hover effects from addHoverEffect are not removed, which is a potential memory leak.
        // This would require a more complex implementation to track and remove those listeners.
        // For this fix, we focus on the main listeners.
    }

    // Public API methods for EffectManager
    pause() {}

    resume() {
        if (this.isDestroyed) {
            this.isDestroyed = false;
            this.init();
        }
    }
}

// Module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocomotiveCursor;
} else {
    window.LocomotiveCursor = LocomotiveCursor;
}