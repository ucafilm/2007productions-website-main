// Stryd Stories PWA - Main Application
// Built for 2007productions.com/stryd
// Version 2.0.0 - Updated with full React UI and debugging
// Last modified: 2025-07-21

console.log('🚀 Stryd Stories App.js loaded - Version 2.0.0');

// Import React (CDN version for simplicity)
const { useState, useRef, useCallback, useEffect } = React;

// --- CONFIGURATION CONSTANTS (Defined globally) --- //

const THEMES = {
  'stryd-orange': { primary: '#FF6B35', secondary: '#FFFFFF', accent: '#1a1a1a', name: 'Stryd Orange' },
  'nike-volt': { primary: '#DFFF00', secondary: '#000000', accent: '#FFFFFF', name: 'Nike Volt' },
  'run-blue': { primary: '#4A9EFF', secondary: '#FFFFFF', accent: '#003366', name: 'Run Blue' },
  'sunset': { primary: '#FF6B6B', secondary: '#FFFFFF', accent: '#4ECDC4', name: 'Sunset' },
  'forest': { primary: '#2ECC71', secondary: '#FFFFFF', accent: '#27AE60', name: 'Forest' },
  'midnight': { primary: '#C84FFF', secondary: '#FFFFFF', accent: '#4A1A4A', name: 'Midnight' }
};

const FONTS = {
  'space-grotesk': { primary: 'Space Grotesk, system-ui, sans-serif', weight: '800', name: 'Space Grotesk' },
  'inter': { primary: 'Inter, system-ui, sans-serif', weight: '700', name: 'Inter' },
  'jetbrains': { primary: 'JetBrains Mono, monospace', weight: '600', name: 'JetBrains Mono' },
  'athletic': { primary: 'Impact, Arial Black, sans-serif', weight: 'bold', name: 'Athletic' }
};

const ROUTE_STYLES = {
  'gradient': {
    strokeStyle: (ctx, width) => {
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#ff6b35');
      gradient.addColorStop(0.5, '#4a9eff');
      gradient.addColorStop(1, '#c84fff');
      return gradient;
    },
    lineWidth: 8, lineCap: 'round', lineJoin: 'round', shadowBlur: 6, shadowColor: 'rgba(0, 0, 0, 0.3)'
  },
  'solid': { strokeStyle: '#ff6b35', lineWidth: 6, lineCap: 'round', lineJoin: 'round', shadowBlur: 4, shadowColor: 'rgba(0, 0, 0, 0.2)' },
  'neon': { strokeStyle: '#4a9eff', lineWidth: 4, lineCap: 'round', lineJoin: 'round', shadowBlur: 12, shadowColor: '#4a9eff' },
  'minimal': { strokeStyle: '#ffffff', lineWidth: 3, lineCap: 'round', lineJoin: 'round', shadowBlur: 2, shadowColor: 'rgba(0, 0, 0, 0.5)' }
};

// --- UTILITY FUNCTIONS --- //
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  Object.assign(notification.style, {
    position: 'fixed', top: '20px', right: '20px', padding: '1rem 1.5rem', borderRadius: '8px', color: 'white',
    fontFamily: 'Space Grotesk, sans-serif', fontWeight: '600', zIndex: '10001', transform: 'translateX(120%)',
    transition: 'transform 0.3s ease-out', maxWidth: '300px',
  });
  notification.textContent = message;
  const gradients = {
    success: 'linear-gradient(135deg, #2ECC71, #27AE60)',
    error: 'linear-gradient(135deg, #E74C3C, #C0392B)',
    info: 'linear-gradient(135deg, #FF6B35, #4A9EFF)'
  };
  notification.style.background = gradients[type] || gradients.info;
  document.body.appendChild(notification);
  setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 100);
  setTimeout(() => {
    notification.style.transform = 'translateX(120%)';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
};

// --- MAIN REACT COMPONENT --- //
const StrydStoriesApp = () => {
  // State
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageType, setImageType] = useState('map');
  const [overlayStyle, setOverlayStyle] = useState('gradient');
  const [overlayPosition, setOverlayPosition] = useState('bottom');
  const [colorTheme, setColorTheme] = useState('stryd-orange');
  const [fontStyle, setFontStyle] = useState('space-grotesk');
  const [runData, setRunData] = useState({ distance: '11.63 km', time: '1:30:51', pace: '7:47 /km', power: '201W' });
  const [currentStep, setCurrentStep] = useState('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showRouteOverlay, setShowRouteOverlay] = useState(true);
  const [routeStyle, setRouteStyle] = useState('gradient');
  const [routeType, setRouteType] = useState('loop');
  const [routeOpacity, setRouteOpacity] = useState(0.9);
  const [mockRouteData, setMockRouteData] = useState(null);

  // Refs
  const canvasRef = useRef(null);
  const liveCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handlers & Logic
  const processImageFile = useCallback(async (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!file || !validTypes.includes(file.type)) throw new Error('Invalid file type. Please use JPG, PNG, or GIF.');
    if (file.size > 10 * 1024 * 1024) throw new Error('Image is too large (max 10MB).');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image. It may be corrupted.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleImageUpload = useCallback(async (file) => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const image = await processImageFile(file);
      setUploadedImage(image);
      setCurrentStep('customize');
      showNotification('Image uploaded!', 'success');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [processImageFile]);
  
  const generateMockRouteData = useCallback((type) => {
      const points = [];
      const numPoints = 50;
      // This logic can be expanded as you had it
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        const x = 0.5 + Math.cos(angle) * (0.3 + (type === 'zigzag' ? Math.sin(angle * 5) * 0.1 : 0));
        const y = 0.5 + Math.sin(angle) * 0.3;
        points.push({ x, y });
      }
      return points;
  }, []);

  const handleFileSelect = useCallback((files) => {
    const file = files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showNotification('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showNotification('Image too large. Max 10MB allowed.', 'error');
      return;
    }

    handleImageUpload(file);
  }, [handleImageUpload]);
  
  const generateRoute = useCallback(() => {
    setMockRouteData(generateMockRouteData(routeType));
    showNotification('New route generated!', 'success');
  }, [routeType, generateMockRouteData]);
  
  const drawRoute = useCallback((ctx, canvas, routeData, styleKey, options = {}) => {
    if (!ctx || !canvas || !routeData || routeData.length === 0) return;
    
    const style = ROUTE_STYLES[styleKey] || ROUTE_STYLES.gradient;
    const { width, height } = canvas;
    
    // Apply route styling
    ctx.save();
    ctx.globalAlpha = options.opacity || 1;
    ctx.lineWidth = style.lineWidth || 6;
    ctx.lineCap = style.lineCap || 'round';
    ctx.lineJoin = style.lineJoin || 'round';
    
    if (style.shadowBlur) {
      ctx.shadowBlur = style.shadowBlur;
      ctx.shadowColor = style.shadowColor || 'rgba(0, 0, 0, 0.3)';
    }
    
    // Set stroke style (handle both strings and gradient functions)
    if (typeof style.strokeStyle === 'function') {
      ctx.strokeStyle = style.strokeStyle(ctx, width);
    } else {
      ctx.strokeStyle = style.strokeStyle || '#ff6b35';
    }
    
    // Draw the route path
    ctx.beginPath();
    routeData.forEach((point, index) => {
      const x = point.x * width;
      const y = point.y * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Add start/end markers
    if (routeData.length > 0) {
      const start = routeData[0];
      const end = routeData[routeData.length - 1];
      
      // Start marker (green)
      ctx.fillStyle = '#2ECC71';
      ctx.beginPath();
      ctx.arc(start.x * width, start.y * height, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // End marker (red)
      ctx.fillStyle = '#E74C3C';
      ctx.beginPath();
      ctx.arc(end.x * width, end.y * height, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }, []);
  
  const generateStoryImage = useCallback(() => {
    console.log('generateStoryImage called', { uploadedImage: !!uploadedImage, canvasRef: !!canvasRef.current });
    if (!uploadedImage || !canvasRef.current) {
      console.log('generateStoryImage early return - missing uploadedImage or canvasRef');
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width: storyWidth, height: storyHeight } = canvas;
    console.log('Canvas dimensions:', storyWidth, 'x', storyHeight);
    ctx.clearRect(0, 0, storyWidth, storyHeight);

    // Draw background image
    console.log('Drawing background image:', uploadedImage.width, 'x', uploadedImage.height);
    const imgAspect = uploadedImage.width / uploadedImage.height;
    const canvasAspect = storyWidth / storyHeight;
    let sx, sy, sWidth, sHeight;
    if (imgAspect > canvasAspect) { // image wider than canvas
        sHeight = uploadedImage.height;
        sWidth = sHeight * canvasAspect;
        sx = (uploadedImage.width - sWidth) / 2;
        sy = 0;
    } else { // image taller than canvas
        sWidth = uploadedImage.width;
        sHeight = sWidth / canvasAspect;
        sx = 0;
        sy = (uploadedImage.height - sHeight) / 2;
    }
    console.log('Drawing image with params:', { sx, sy, sWidth, sHeight, destWidth: storyWidth, destHeight: storyHeight });
    ctx.drawImage(uploadedImage, sx, sy, sWidth, sHeight, 0, 0, storyWidth, storyHeight);
    
    // Draw route overlay
    if (showRouteOverlay && mockRouteData) {
      console.log('Drawing route overlay with', mockRouteData.length, 'points');
      drawRoute(ctx, canvas, mockRouteData, routeStyle, { opacity: routeOpacity });
    }

    // Draw text overlay and branding
    const theme = THEMES[colorTheme] || THEMES['stryd-orange'];
    const font = FONTS[fontStyle] || FONTS['space-grotesk'];
    
    // Add gradient overlay for text readability
    const overlayGradient = ctx.createLinearGradient(0, storyHeight * 0.7, 0, storyHeight);
    overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(0, storyHeight * 0.7, storyWidth, storyHeight * 0.3);
    
    // Draw run data if available
    if (runData) {
      console.log('Drawing run data:', runData);
      ctx.font = `bold ${storyWidth * 0.08}px ${font.primary}`;
      ctx.fillStyle = theme.secondary;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const dataY = storyHeight * 0.85;
      
      // Distance
      ctx.fillText(runData.distance, storyWidth * 0.2, dataY);
      
      // Time
      ctx.fillText(runData.time, storyWidth * 0.4, dataY);
      
      // Pace
      ctx.fillText(runData.pace, storyWidth * 0.6, dataY);
      
      // Power
      ctx.fillText(runData.power, storyWidth * 0.8, dataY);
    }
    
    // Add Stryd branding
    ctx.font = `bold ${storyWidth * 0.06}px ${font.primary}`;
    ctx.fillStyle = theme.primary;
    ctx.textAlign = 'center';
    ctx.fillText('POWERED BY STRYD', storyWidth / 2, storyHeight * 0.95);
    
    // Add 2007 Productions watermark
    ctx.font = `${storyWidth * 0.03}px ${font.primary}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'right';
    ctx.fillText('2007productions.com', storyWidth * 0.95, storyHeight * 0.05);
    
    console.log('generateStoryImage completed');
  }, [uploadedImage, imageType, overlayPosition, colorTheme, fontStyle, runData, showRouteOverlay, mockRouteData, routeStyle, routeOpacity, drawRoute]);

  // Effects
  useEffect(() => {
    console.log('generateStoryImage useEffect triggered', { uploadedImage: !!uploadedImage, canvasRef: !!canvasRef.current });
    generateStoryImage();
  }, [generateStoryImage]);

  useEffect(() => {
    console.log('liveCanvas useEffect triggered', { liveCanvasRef: !!liveCanvasRef.current, canvasRef: !!canvasRef.current });
    if (liveCanvasRef.current && canvasRef.current) {
      const liveCtx = liveCanvasRef.current.getContext('2d');
      liveCtx.clearRect(0, 0, liveCanvasRef.current.width, liveCanvasRef.current.height);
      liveCtx.drawImage(canvasRef.current, 0, 0);
      console.log('Live canvas updated');
    }
  }, [uploadedImage, colorTheme, routeStyle, mockRouteData]); // More specific dependencies
  
  // Initialize canvas dimensions when component mounts
  useEffect(() => {
    console.log('Canvas initialization useEffect');
    if (canvasRef.current) {
      canvasRef.current.width = 405;
      canvasRef.current.height = 720;
      console.log('Main canvas dimensions set:', canvasRef.current.width, 'x', canvasRef.current.height);
    }
    if (liveCanvasRef.current) {
      liveCanvasRef.current.width = 405;
      liveCanvasRef.current.height = 720;
      console.log('Live canvas dimensions set:', liveCanvasRef.current.width, 'x', liveCanvasRef.current.height);
    }
  }, []);
  
  useEffect(() => {
    setMockRouteData(generateMockRouteData('loop'));
  }, [generateMockRouteData]);

  const nextStep = () => setCurrentStep(current => (current === 'upload' ? 'customize' : 'preview'));
  const prevStep = () => setCurrentStep(current => (current === 'preview' ? 'customize' : 'upload'));

  // Complete UI Component with proper file handling
  return React.createElement('div', { className: 'stryd-app' },
    // Step Progress Indicator
    React.createElement('div', { className: 'step-progress' },
      React.createElement('div', { className: 'step-item' + (currentStep === 'upload' ? ' active' : ' completed') }, '1. Upload'),
      React.createElement('div', { className: 'step-item' + (currentStep === 'customize' ? ' active' : currentStep === 'preview' ? ' completed' : '') }, '2. Customize'),
      React.createElement('div', { className: 'step-item' + (currentStep === 'preview' ? ' active' : '') }, '3. Preview')
    ),

    // Upload Step
    currentStep === 'upload' && React.createElement('div', { className: 'upload-section' },
      React.createElement('div', { className: 'upload-header' },
        React.createElement('h2', null, 'Upload Your Image'),
        React.createElement('p', null, 'Upload a Stryd map screenshot or personal photo to get started')
      ),
      
      // Stryd PowerCenter Integration
      React.createElement('div', { className: 'stryd-integration' },
        React.createElement('h3', null, 'Import from Stryd PowerCenter'),
        React.createElement('div', { className: 'stryd-input-group' },
          React.createElement('input', { 
            type: 'url', 
            placeholder: 'https://www.stryd.com/powercenter/...', 
            className: 'stryd-url-input' 
          }),
          React.createElement('button', { className: 'load-data-btn' }, 'Load Data')
        )
      ),
      
      // Image Type Selection
      React.createElement('div', { className: 'image-type-section' },
        React.createElement('h3', null, 'Image Type'),
        React.createElement('div', { className: 'type-buttons' },
          React.createElement('button', {
            className: 'type-btn' + (imageType === 'map' ? ' active' : ''),
            onClick: () => setImageType('map')
          }, '🗺️ Run Map'),
          React.createElement('button', {
            className: 'type-btn' + (imageType === 'photo' ? ' active' : ''),
            onClick: () => setImageType('photo')
          }, '📸 Personal Photo')
        )
      ),
      
      // File Upload Area
      React.createElement('div', { 
        className: 'file-upload-area' + (dragOver ? ' drag-over' : ''),
        onDragOver: (e) => { e.preventDefault(); setDragOver(true); },
        onDragLeave: () => setDragOver(false),
        onDrop: (e) => {
          e.preventDefault();
          setDragOver(false);
          const files = Array.from(e.dataTransfer.files);
          if (files.length > 0) handleFileSelect(files);
        },
        onClick: () => fileInputRef.current?.click()
      },
        React.createElement('div', { className: 'upload-icon' }, '📁'),
        React.createElement('div', { className: 'upload-text' },
          React.createElement('p', { className: 'upload-main' }, 
            imageType === 'map' ? 'Click to upload your Stryd run map' : 'Click to upload your personal photo'
          ),
          React.createElement('p', { className: 'upload-sub' }, 'Supports PNG, JPG files (max 10MB)')
        ),
        React.createElement('input', {
          type: 'file',
          ref: fileInputRef,
          accept: 'image/*',
          style: { display: 'none' },
          onChange: (e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) handleFileSelect(files);
          }
        })
      ),
      
      isProcessing && React.createElement('div', { className: 'processing-indicator' },
        React.createElement('div', { className: 'spinner' }),
        React.createElement('p', null, 'Processing image...')
      )
    ),

    // Customize Step
    currentStep === 'customize' && React.createElement('div', { className: 'customize-section' },
      React.createElement('div', { className: 'customize-header' },
        React.createElement('h2', null, 'Customize Your Story'),
        React.createElement('button', { 
          className: 'back-btn',
          onClick: prevStep
        }, '← Back')
      ),
      
      // Image Preview
      React.createElement('div', { className: 'image-preview' },
        React.createElement('canvas', {
          ref: liveCanvasRef,
          width: 405,
          height: 720,
          className: 'preview-canvas',
          style: { border: '1px solid #333', maxWidth: '100%', height: 'auto' }
        })
      ),
      
      // Customization Controls
      React.createElement('div', { className: 'controls-panel' },
        // Theme Selection
        React.createElement('div', { className: 'control-group' },
          React.createElement('h3', null, 'Color Theme'),
          React.createElement('div', { className: 'theme-buttons' },
            Object.entries(THEMES).map(([key, theme]) =>
              React.createElement('button', {
                key: key,
                className: 'theme-btn' + (colorTheme === key ? ' active' : ''),
                style: { backgroundColor: theme.primary },
                onClick: () => setColorTheme(key)
              }, theme.name)
            )
          )
        ),
        
        // Route Overlay Toggle
        showRouteOverlay && React.createElement('div', { className: 'control-group' },
          React.createElement('h3', null, 'Route Style'),
          React.createElement('div', { className: 'route-style-buttons' },
            Object.keys(ROUTE_STYLES).map(style =>
              React.createElement('button', {
                key: style,
                className: 'route-style-btn' + (routeStyle === style ? ' active' : ''),
                onClick: () => setRouteStyle(style)
              }, style.charAt(0).toUpperCase() + style.slice(1))
            )
          )
        )
      ),
      
      React.createElement('button', {
        className: 'next-btn',
        onClick: nextStep,
        disabled: !uploadedImage
      }, 'Next: Preview →')
    ),

    // Preview Step
    currentStep === 'preview' && React.createElement('div', { className: 'preview-section' },
      React.createElement('div', { className: 'preview-header' },
        React.createElement('h2', null, 'Preview & Download'),
        React.createElement('button', { 
          className: 'back-btn',
          onClick: prevStep
        }, '← Back')
      ),
      
      // Final Preview
      React.createElement('div', { className: 'final-preview' },
        React.createElement('canvas', {
          ref: canvasRef,
          width: 405,
          height: 720,
          className: 'final-canvas'
        })
      ),
      
      // Download Button
      React.createElement('button', {
        className: 'download-btn',
        onClick: () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const link = document.createElement('a');
            link.download = 'stryd-story.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            showNotification('Story downloaded!', 'success');
          }
        }
      }, '📥 Download Instagram Story')
    ),

    // Hidden canvas for image generation
    React.createElement('canvas', {
      ref: canvasRef,
      width: 405,
      height: 720,
      style: { display: 'none' }
    })
  );
};

// --- PWA & APP INITIALIZATION --- //
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.initPWA();
  }
  initPWA() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });
    // ... other PWA logic
  }
  // ... other methods
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing Stryd Stories App...');
  
  // Hide loading overlay
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    setTimeout(() => loadingOverlay.classList.add('hidden'), 1000);
  }

  // Initialize PWA features
  try {
    new PWAManager();
    console.log('PWA Manager initialized.');
  } catch (error) {
    console.error('PWA Manager initialization failed:', error);
  }
  
  // Mount React App using the new createRoot API
  const container = document.getElementById('react-root');
  if (container && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
    try {
      const root = ReactDOM.createRoot(container);
      root.render(React.createElement(StrydStoriesApp));
      console.log('React app mounted successfully.');
    } catch (error) {
       console.error('React mounting failed:', error);
       container.innerHTML = '<h2>Error: Could not load the application.</h2>';
    }
  } else {
    console.error('React, ReactDOM, or the root container was not found.');
  }
});