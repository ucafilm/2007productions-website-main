class PerformanceMonitor {
    constructor() {
        this.metrics = {
            frameRate: [],
            memoryUsage: [],
            loadTimes: [],
            errorCount: 0
        };
        this.startTime = performance.now();
        this.setupMonitoring();
    }

    setupMonitoring() {
        // Monitor frame rate
        this.monitorFrameRate();
        
        // Monitor memory usage
        if ('memory' in performance) {
            this.monitorMemoryUsage();
        }
        
        // Monitor effect load times
        this.monitorLoadTimes();
        
        // Report metrics periodically
        setInterval(() => {
            this.reportMetrics();
        }, 30000); // Every 30 seconds
    }

    monitorFrameRate() {
        let frames = 0;
        let lastTime = performance.now();
        
        const countFrames = (currentTime) => {
            frames++;
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                this.recordFrameRate(fps);
                
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(countFrames);
        };
        
        requestAnimationFrame(countFrames);
    }

    recordFrameRate(fps) {
        this.metrics.frameRate.push({
            fps,
            timestamp: Date.now()
        });
        
        // Keep only last 100 measurements
        if (this.metrics.frameRate.length > 100) {
            this.metrics.frameRate.shift();
        }
        
        // Alert if performance is poor
        if (fps < 30) {
            console.warn(`Low frame rate detected: ${fps}fps`);
            this.optimizeForPerformance();
        }
    }

    monitorMemoryUsage() {
        setInterval(() => {
            const memInfo = performance.memory;
            const usage = {
                used: Math.round(memInfo.usedJSHeapSize / 1048576), // MB
                total: Math.round(memInfo.totalJSHeapSize / 1048576), // MB
                limit: Math.round(memInfo.jsHeapSizeLimit / 1048576), // MB
                timestamp: Date.now()
            };
            
            this.metrics.memoryUsage.push(usage);
            
            // Keep only last 50 measurements
            if (this.metrics.memoryUsage.length > 50) {
                this.metrics.memoryUsage.shift();
            }
            
            // Alert if memory usage is high
            const usagePercentage = usage.used / usage.limit;
            if (usagePercentage > 0.8) {
                console.warn(`High memory usage: ${Math.round(usagePercentage * 100)}%`);
                window.effectManager.optimizeMemoryUsage();
            }
        }, 5000);
    }

    monitorLoadTimes() {
        // Monitor effect initialization times
        const originalRegisterEffect = window.effectManager.registerEffect;
        window.effectManager.registerEffect = (name, effect) => {
            const loadTime = performance.now() - this.startTime;
            this.metrics.loadTimes.push({
                effect: name,
                loadTime,
                timestamp: Date.now()
            });
            
            return originalRegisterEffect.call(window.effectManager, name, effect);
        };
    }

    optimizeForPerformance() {
        // Reduce effect complexity when performance is poor
        const activeEffects = window.effectManager.activeEffects;
        
        activeEffects.forEach(effect => {
            if (effect.setVelocityThreshold) {
                effect.setVelocityThreshold(15); // Increase threshold
            }
            if (effect.setMaxImages) {
                effect.setMaxImages(3); // Reduce max images
            }
        });
    }

    getPerformanceReport() {
        const avgFps = this.metrics.frameRate.length > 0
            ? this.metrics.frameRate.reduce((sum, m) => sum + m.fps, 0) / this.metrics.frameRate.length
            : 0;
            
        const currentMemory = this.metrics.memoryUsage.length > 0
            ? this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1]
            : null;
            
        const totalLoadTime = this.metrics.loadTimes.reduce((sum, m) => sum + m.loadTime, 0);
        
        return {
            averageFps: Math.round(avgFps),
            currentMemoryUsage: currentMemory,
            totalEffectLoadTime: Math.round(totalLoadTime),
            errorCount: this.metrics.errorCount,
            isPerformant: avgFps > 50 && (currentMemory ? currentMemory.used < 100 : true)
        };
    }

    reportMetrics() {
        const report = this.getPerformanceReport();
        
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Performance Report:', report);
        }
        
        // Send to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance_metrics', {
                avg_fps: report.averageFps,
                memory_usage: report.currentMemoryUsage?.used || 0,
                load_time: report.totalEffectLoadTime,
                is_performant: report.isPerformant
            });
        }
    }
}
