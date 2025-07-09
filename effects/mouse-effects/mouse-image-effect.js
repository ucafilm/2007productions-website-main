/**
 * Mouse Image Effect
 * Velocity-based image spawning system
 * 
 * @version 1.0.0
 * @author 2007 Productions
 */

class MouseImageEffect {
    constructor(container, imagePool, options = {}) {
        this.container = container;
        this.imagePool = this.validateImagePool(imagePool);
        this.options = {
            velocityThreshold: 5,
            maxImages: 10,
            throttleRate: 16, // ~60fps
            imageDuration: 1500,
            ...options
        };
        
        this.lastMousePosition = { x: 0, y: 0 };
        this.lastTimestamp = Date.now();
        this.imageCounter = 0;
        this.activeImages = [];
        this.isDestroyed = false;
        this.throttledMouseMove = this.throttle(
            this.handleMouseMove.bind(this), 
            this.options.throttleRate
        );
        
        this.bindEvents();
    }

    validateImagePool(imagePool) {
        if (!imagePool) {
            console.warn('MouseImageEffect: No image pool provided');
            return [];
        }
        
        const images = Array.from(imagePool.querySelectorAll('img'));
        if (images.length === 0) {
            console.warn('MouseImageEffect: No images found in pool');
        }
        
        return images;
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    bindEvents() {
        document.addEventListener('mousemove', this.throttledMouseMove);
    }

    calculateVelocity(currentPos, currentTime) {
        const deltaX = currentPos.x - this.lastMousePosition.x;
        const deltaY = currentPos.y - this.lastMousePosition.y;
        const deltaTime = currentTime - this.lastTimestamp;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        return distance / (deltaTime || 1) * 10; // Scale factor
    }

    handleMouseMove(e) {
        if (this.isDestroyed) return;
        
        const currentPos = { x: e.clientX, y: e.clientY };
        const currentTime = Date.now();
        const velocity = this.calculateVelocity(currentPos, currentTime);

        if (velocity > this.options.velocityThreshold) {
            this.spawnImages(currentPos, velocity);
        }

        this.lastMousePosition = currentPos;
        this.lastTimestamp = currentTime;
    }

    spawnImages(position, velocity) {
        if (this.imagePool.length === 0) return;
        
        const numImages = Math.min(
            Math.floor(velocity / 3),
            this.options.maxImages - this.activeImages.length
        );

        for (let i = 0; i < numImages; i++) {
            this.createImage(position);
        }
    }

    createImage(centerPos) {
        const img = document.createElement('img');
        const randomImageSrc = this.imagePool[
            Math.floor(Math.random() * this.imagePool.length)
        ].src;
        
        img.src = randomImageSrc;
        img.className = 'spawned-image';
        img.id = `spawned-img-${this.imageCounter++}`;

        // Random positioning and styling
        const offsetX = (Math.random() - 0.5) * 120;
        const offsetY = (Math.random() - 0.5) * 120;
        const rotation = Math.random() * 360;
        const scale = 0.5 + Math.random() * 0.8;

        gsap.set(img, {
            x: centerPos.x + offsetX,
            y: centerPos.y + offsetY,
            rotation: rotation,
            scale: scale,
            opacity: 0.8,
            pointerEvents: 'none',
            zIndex: 999
        });

        this.container.appendChild(img);
        this.activeImages.push(img);

        // Animate out
        gsap.to(img, {
            opacity: 0,
            scale: scale * 0.8,
            y: '-=50',
            duration: this.options.imageDuration / 1000,
            ease: 'power1.out',
            onComplete: () => {
                this.removeImage(img);
            }
        });
    }

    removeImage(img) {
        if (img.parentNode) {
            img.parentNode.removeChild(img);
        }
        this.activeImages = this.activeImages.filter(item => item !== img);
    }

    destroy() {
        this.isDestroyed = true;
        
        // Remove event listeners
        document.removeEventListener('mousemove', this.throttledMouseMove);
        
        // Clean up active images
        this.activeImages.forEach(img => {
            gsap.killTweensOf(img);
            this.removeImage(img);
        });
        
        this.activeImages = [];
    }

    // Public API methods
    pause() {
        document.removeEventListener('mousemove', this.throttledMouseMove);
    }
    
    resume() {
        if (!this.isDestroyed) {
            document.addEventListener('mousemove', this.throttledMouseMove);
        }
    }
    
    setVelocityThreshold(threshold) {
        this.options.velocityThreshold = threshold;
    }
    
    setMaxImages(max) {
        this.options.maxImages = max;
    }
}

// Module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MouseImageEffect;
} else {
    window.MouseImageEffect = MouseImageEffect;
}
