
// Kinetic Typography Implementation
class KineticTypography {
    constructor(container) {
        this.container = container;
        this.textWrappers = container.querySelectorAll('.text-wrapper');
        this.currentIndex = 0;
        this.displayDuration = 4000; // 4 seconds per text
        this.transitionDuration = 1000; // 1 second transition

        this.start();
    }

    start() {
        this.showText(this.currentIndex);
        setInterval(() => {
            this.nextText();
        }, this.displayDuration + this.transitionDuration);
    }

    showText(index) {
        const wrapper = this.textWrappers[index];
        wrapper.classList.add('active');
        wrapper.classList.remove('exiting');
    }

    hideText(index) {
        const wrapper = this.textWrappers[index];
        wrapper.classList.add('exiting');
        wrapper.classList.remove('active');
    }

    nextText() {
        // Hide current text
        this.hideText(this.currentIndex);

        // Show next text after transition
        setTimeout(() => {
            this.currentIndex = (this.currentIndex + 1) % this.textWrappers.length;
            this.showText(this.currentIndex);
        }, this.transitionDuration);
    }
}

function initKineticTypography() {
    const kineticsContainer = document.querySelector('.kinetic-container');
    if (kineticsContainer) {
        new KineticTypography(kineticsContainer);
    }
}

// Velocity-Based Image Spawning Implementation
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

class MouseImageEffect {
    constructor(container, imagePool) {
        this.container = container;
        this.imagePool = Array.from(imagePool.querySelectorAll('img'));
        this.lastMousePosition = { x: 0, y: 0 };
        this.lastTimestamp = Date.now();
        this.velocityThreshold = 5;
        this.maxImages = 10;
        this.imageCounter = 0;

        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('mousemove', throttle((e) => {
            this.handleMouseMove(e);
        }, 16)); // ~60fps
    }

    calculateVelocity(currentPos, currentTime) {
        const deltaX = currentPos.x - this.lastMousePosition.x;
        const deltaY = currentPos.y - this.lastMousePosition.y;
        const deltaTime = currentTime - this.lastTimestamp;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const velocity = distance / (deltaTime || 1) * 10; // Scale factor
        return velocity;
    }

    handleMouseMove(e) {
        const currentPos = { x: e.clientX, y: e.clientY };
        const currentTime = Date.now();

        const velocity = this.calculateVelocity(currentPos, currentTime);

        if (velocity > this.velocityThreshold) {
            this.spawnImages(currentPos, velocity);
        }

        this.lastMousePosition = currentPos;
        this.lastTimestamp = currentTime;
    }

    spawnImages(position, velocity) {
        // Calculate number of images based on velocity
        const numImages = Math.min(
            Math.floor(velocity / 3),
            this.maxImages
        );

        for (let i = 0; i < numImages; i++) {
            this.createImage(position);
        }
    }

    createImage(centerPos) {
        const img = document.createElement('img');
        const randomImage = this.imagePool[
            Math.floor(Math.random() * this.imagePool.length)
        ];

        img.src = randomImage.src;
        img.className = 'spawned-image';
        img.id = `img-${this.imageCounter++}`;

        // Random positioning around mouse
        const offsetX = (Math.random() - 0.5) * 120;
        const offsetY = (Math.random() - 0.5) * 120;
        const rotation = Math.random() * 360;
        const scale = 0.5 + Math.random() * 0.8;

        img.style.left = (centerPos.x + offsetX - 40) + 'px';
        img.style.top = (centerPos.y + offsetY - 40) + 'px';
        img.style.transform = `rotate(${rotation}deg) scale(${scale})`;
        img.style.opacity = '0.8';

        this.container.appendChild(img);

        // Trigger fade out animation
        setTimeout(() => {
            img.classList.add('fade-out');
        }, 100);

        // Remove from DOM
        setTimeout(() => {
            if (img.parentNode) {
                img.parentNode.removeChild(img);
            }
        }, 1600);
    }
}

function initMouseImageEffect() {
    const container = document.getElementById('mouseContainer');
    const imagePool = document.querySelector('.image-pool');
    if (container && imagePool) {
        new MouseImageEffect(container, imagePool);
    }
}
