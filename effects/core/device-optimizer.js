class DeviceOptimizer {
    constructor() {
        this.deviceInfo = this.getDeviceInfo();
        this.performanceLevel = this.getPerformanceLevel();
    }

    getDeviceInfo() {
        return {
            isMobile: window.innerWidth <= 768 || 'ontouchstart' in window,
            isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
            isLowEnd: navigator.hardwareConcurrency <= 2,
            hasReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            memoryLimit: navigator.deviceMemory || 4 // GB, fallback to 4GB
        };
    }

    getPerformanceLevel() {
        const { isMobile, isLowEnd, memoryLimit } = this.deviceInfo;
        
        if (isMobile || isLowEnd || memoryLimit < 2) {
            return 'low';
        } else if (memoryLimit < 4) {
            return 'medium';
        } else {
            return 'high';
        }
    }

    getOptimizedSettings(effectType) {
        const settings = {
            kinetic: {
                low: { displayDuration: 6000, transitionDuration: 1500, maxTexts: 2 },
                medium: { displayDuration: 4000, transitionDuration: 1000, maxTexts: 3 },
                high: { displayDuration: 4000, transitionDuration: 1000, maxTexts: 4 }
            },
            mouse: {
                low: { velocityThreshold: 15, maxImages: 3, throttleRate: 32 },
                medium: { velocityThreshold: 10, maxImages: 6, throttleRate: 24 },
                high: { velocityThreshold: 5, maxImages: 10, throttleRate: 16 }
            },
            cursor: {
                low: { isDisabled: true },
                medium: { isDisabled: false },
                high: { isDisabled: false }
            }
        };

        return settings[effectType][this.performanceLevel];
    }

    supportsEnhancedFeatures() {
        return (
            'requestAnimationFrame' in window &&
            'IntersectionObserver' in window &&
            navigator.hardwareConcurrency > 2
        );
    }

    supportsAdvancedFeatures() {
        return (
            this.performanceLevel === 'high' &&
            !this.deviceInfo.isMobile &&
            !this.deviceInfo.hasReducedMotion
        );
    }

    shouldEnableEffect(effectType) {
        if (this.deviceInfo.hasReducedMotion) return false;
        
        switch (effectType) {
            case 'kinetic':
                return true; // Always enable, but with optimized settings
            case 'mouse':
                return this.performanceLevel !== 'low';
            case 'cursor':
                return !this.deviceInfo.isMobile;
            default:
                return true;
        }
    }
}

// Usage in effect initialization
window.deviceOptimizer = new DeviceOptimizer();
