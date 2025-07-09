/**
 * Kinetic Typography Effect
 * Locomotive.ca inspired text animations with entrance/exit effects
 * 
 * @version 1.0.0
 * @author 2007 Productions
 */

class KineticTypography {
    constructor(container, options = {}) {
        this.container = container;
        this.textWrappers = container.querySelectorAll('.text-wrapper');
        this.currentIndex = 0;
        this.displayDuration = options.displayDuration || 4000;
        this.transitionDuration = options.transitionDuration || 1000;
        this.autoStart = options.autoStart !== false;
        this.intervalId = null;
        this.isDestroyed = false;
        
        this.validateContainer();
        if (this.autoStart) this.init();
    }

    validateContainer() {
        if (!this.container) {
            throw new Error('KineticTypography: Container element is required');
        }
        if (this.textWrappers.length === 0) {
            console.warn('KineticTypography: No text wrappers found in container');
            return false;
        }
        return true;
    }

    init() {
        if (!this.validateContainer() || this.isDestroyed) return;
        this.start();
    }

    start() {
        if (this.isDestroyed) return;
        
        this.showText(this.currentIndex);
        this.intervalId = setInterval(() => {
            if (!this.isDestroyed) {
                this.nextText();
            }
        }, this.displayDuration + this.transitionDuration);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.textWrappers.forEach(wrapper => {
            wrapper.classList.remove('active', 'exiting');
            gsap.set(wrapper, { opacity: 0, x: 0, y: 0 });
        });
    }

    showText(index) {
        if (this.isDestroyed) return;
        
        const wrapper = this.textWrappers[index];
        if (!wrapper) return;

        wrapper.classList.remove('exiting');
        gsap.set(wrapper, { opacity: 0 });

        gsap.to(wrapper, {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            onComplete: () => {
                if (!this.isDestroyed) {
                    wrapper.classList.add('active');
                }
            }
        });
    }

    hideText(index) {
        if (this.isDestroyed) return;
        
        const wrapper = this.textWrappers[index];
        if (!wrapper) return;

        wrapper.classList.remove('active');
        wrapper.classList.add('exiting');

        const exitDirection = wrapper.getAttribute('data-exit');
        let exitProps = {};
        
        switch(exitDirection) {
            case 'left': exitProps = { x: '-100%' }; break;
            case 'right': exitProps = { x: '100%' }; break;
            case 'top': exitProps = { y: '-100%' }; break;
            case 'bottom': exitProps = { y: '100%' }; break;
            default: exitProps = { opacity: 0 };
        }

        gsap.to(wrapper, {
            ...exitProps,
            opacity: 0,
            duration: 1,
            ease: 'power3.in',
            onComplete: () => {
                if (!this.isDestroyed) {
                    gsap.set(wrapper, { x: 0, y: 0 });
                }
            }
        });
    }

    nextText() {
        if (this.isDestroyed) return;
        
        this.hideText(this.currentIndex);
        this.currentIndex = (this.currentIndex + 1) % this.textWrappers.length;
        
        setTimeout(() => {
            if (!this.isDestroyed) {
                this.showText(this.currentIndex);
            }
        }, this.transitionDuration);
    }

    destroy() {
        this.isDestroyed = true;
        this.stop();
        
        // Clean up any remaining animations
        this.textWrappers.forEach(wrapper => {
            gsap.killTweensOf(wrapper);
        });
    }

    // Public API methods
    pause() { this.stop(); }
    resume() { if (!this.isDestroyed) this.start(); }
    goToText(index) {
        if (index >= 0 && index < this.textWrappers.length) {
            this.currentIndex = index;
            this.showText(index);
        }
    }
}

// Module export pattern
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KineticTypography;
} else {
    window.KineticTypography = KineticTypography;
}
