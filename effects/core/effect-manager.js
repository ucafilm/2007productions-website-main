class EffectManager {
    constructor() {
        this.activeEffects = new Map();
        this.setupCleanupHandlers();
    }

    setupCleanupHandlers() {
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.destroyAllEffects();
        });

        // Cleanup on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAllEffects();
            } else {
                this.resumeAllEffects();
            }
        });
    }

    registerEffect(name, effect) {
        this.activeEffects.set(name, effect);
    }

    destroyEffect(name) {
        const effect = this.activeEffects.get(name);
        if (effect && typeof effect.destroy === 'function') {
            effect.destroy();
            this.activeEffects.delete(name);
        }
    }

    destroyAllEffects() {
        this.activeEffects.forEach((effect, name) => {
            this.destroyEffect(name);
        });
    }

    pauseAllEffects() {
        this.activeEffects.forEach(effect => {
            if (typeof effect.pause === 'function') {
                effect.pause();
            }
        });
    }

    resumeAllEffects() {
        this.activeEffects.forEach(effect => {
            if (typeof effect.resume === 'function') {
                effect.resume();
            }
        });
    }
}

// Global effect manager
window.effectManager = new EffectManager();