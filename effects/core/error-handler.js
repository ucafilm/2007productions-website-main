class EffectErrorHandler {
    constructor() {
        this.errorLog = [];
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        // Catch JavaScript errors
        window.addEventListener('error', (event) => {
            if (this.isEffectRelatedError(event.error)) {
                this.handleEffectError('runtime', event.error);
            }
        });

        // Catch promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            if (this.isEffectRelatedError(event.reason)) {
                this.handleEffectError('promise', event.reason);
            }
        });
    }

    isEffectRelatedError(error) {
        if (!error) return false;
        
        const errorMessage = error.message || error.toString();
        const effectKeywords = ['kinetic', 'mouse', 'cursor', 'gsap', 'scrolltrigger'];
        
        return effectKeywords.some(keyword => 
            errorMessage.toLowerCase().includes(keyword)
        );
    }

    handleEffectError(type, error) {
        const errorInfo = {
            type,
            message: error.message || error.toString(),
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.errorLog.push(errorInfo);
        
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Effect Error:', errorInfo);
        }

        // Attempt graceful degradation
        this.gracefulDegradation(error);
        
        // Report to analytics (if available)
        this.reportError(errorInfo);
    }

    gracefulDegradation(error) {
        // Disable effects that are causing issues
        if (error.message.includes('KineticTypography')) {
            console.warn('Disabling kinetic typography due to error');
            window.effectManager.destroyEffect('kinetic');
        }
        
        if (error.message.includes('MouseImageEffect')) {
            console.warn('Disabling mouse effects due to error');
            window.effectManager.destroyEffect('mouse');
        }
    }

    reportError(errorInfo) {
        // Send to analytics service (Google Analytics, Sentry, etc.)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: errorInfo.message,
                fatal: false
            });
        }
    }

    getErrorReport() {
        return {
            totalErrors: this.errorLog.length,
            recentErrors: this.errorLog.slice(-10),
            errorsByType: this.errorLog.reduce((acc, error) => {
                acc[error.type] = (acc[error.type] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

// Initialize error handler
window.effectErrorHandler = new EffectErrorHandler();
