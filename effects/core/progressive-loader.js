class ProgressiveEffectLoader {
    constructor() {
        this.loadingStages = [
            'basic', // Simple CSS animations
            'enhanced', // JavaScript-powered effects
            'advanced' // Full locomotive-style experience
        ];
        this.currentStage = 'basic';
    }

    async loadEffects() {
        // Stage 1: Basic CSS animations (always available)
        this.enableBasicAnimations();
        
        // Stage 2: Enhanced JavaScript effects (if supported)
        if (window.deviceOptimizer.supportsEnhancedFeatures()) {
            await this.loadEnhancedEffects();
            this.currentStage = 'enhanced';
        }
        
        // Stage 3: Advanced effects (high-performance devices only)
        if (window.deviceOptimizer.supportsAdvancedFeatures()) {
            await this.loadAdvancedEffects();
            this.currentStage = 'advanced';
        }
        
        this.reportStage();
    }

    enableBasicAnimations() {
        document.body.classList.add('basic-effects');
        
        // Simple CSS-only animations
        const style = document.createElement('style');
        style.textContent = `
            .basic-effects .text-wrapper {
                animation: fadeInUp 1s ease-out;
            }
            
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    async loadEnhancedEffects() {
        document.body.classList.add('enhanced-effects');
        
        // Load kinetic typography
        await this.loadScript('effects/kinetic-typography/kinetic-typography.js');
        // CSS is linked in index.html conditionally
        
        // Initialize with basic settings
        const container = document.querySelector('.kinetic-container');
        if (container && window.KineticTypography) {
            const settings = window.deviceOptimizer.getOptimizedSettings('kinetic');
            const kinetic = new KineticTypography(container, settings);
            window.effectManager.registerEffect('kinetic', kinetic);
        }
    }

    async loadAdvancedEffects() {
        document.body.classList.add('advanced-effects');
        
        // Load mouse effects
        await this.loadScript('effects/mouse-effects/mouse-image-effect.js');
        // CSS is linked in index.html conditionally
        
        // Load cursor effects
        await this.loadScript('effects/locomotive-cursor/locomotive-cursor.js');
        // CSS is linked in index.html conditionally
        
        // Initialize advanced effects
        const mouseEffectContainer = document.getElementById('mouseEffectContainer');
        const imagePool = document.querySelector('.image-pool');
        if (mouseEffectContainer && imagePool && window.MouseImageEffect) {
            const settings = window.deviceOptimizer.getOptimizedSettings('mouse');
            const mouseEffect = new MouseImageEffect(mouseEffectContainer, imagePool, settings);
            window.effectManager.registerEffect('mouseEffect', mouseEffect);
        }

        if (window.LocomotiveCursor && window.deviceOptimizer.shouldEnableEffect('cursor')) {
            window.locomotiveCursor = new LocomotiveCursor();
            window.effectManager.registerEffect('locomotiveCursor', window.locomotiveCursor);
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    reportStage() {
        console.log(`Effects loaded at stage: ${this.currentStage}`);
        
        // Send to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'effects_stage', {
                stage: this.currentStage,
                device_type: window.deviceOptimizer.performanceLevel
            });
        }
    }
}
