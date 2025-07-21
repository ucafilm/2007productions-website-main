// Stryd Stories PWA - Main Application
// Built for 2007productions.com/stryd

// Import React (CDN version for simplicity)
const { useState, useRef, useCallback, useEffect } = React;

// Theme configurations matching Nike Run Club inspiration
const THEMES = {
  'stryd-orange': { 
    primary: '#FF6B35', 
    secondary: '#FFFFFF', 
    accent: '#1a1a1a',
    name: 'Stryd Orange' 
  },
  'nike-volt': { 
    primary: '#DFFF00', 
    secondary: '#000000', 
    accent: '#FFFFFF',
    name: 'Nike Volt' 
  },
  'run-blue': { 
    primary: '#4A9EFF', 
    secondary: '#FFFFFF', 
    accent: '#003366',
    name: 'Run Blue' 
  },
  'sunset': { 
    primary: '#FF6B6B', 
    secondary: '#FFFFFF', 
    accent: '#4ECDC4',
    name: 'Sunset' 
  },
  'forest': { 
    primary: '#2ECC71', 
    secondary: '#FFFFFF', 
    accent: '#27AE60',
    name: 'Forest' 
  },
  'midnight': {
    primary: '#C84FFF',
    secondary: '#FFFFFF',
    accent: '#4A1A4A',
    name: 'Midnight'
  }
};

const FONTS = {
  'space-grotesk': { 
    primary: 'Space Grotesk, system-ui, sans-serif', 
    weight: '800',
    name: 'Space Grotesk'
  },
  'inter': { 
    primary: 'Inter, system-ui, sans-serif', 
    weight: '700',
    name: 'Inter'
  },
  'jetbrains': { 
    primary: 'JetBrains Mono, monospace', 
    weight: '600',
    name: 'JetBrains Mono'
  },
  'athletic': { 
    primary: 'Impact, Arial Black, sans-serif', 
    weight: 'bold',
    name: 'Athletic'
  }
};

// Notification system
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    color: 'white',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: '600',
    fontSize: '0.875rem',
    zIndex: '10001',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease',
    maxWidth: '300px',
    wordWrap: 'break-word'
  });
  
  if (type === 'success') {
    notification.style.background = 'linear-gradient(135deg, #2ECC71, #27AE60)';
  } else if (type === 'error') {
    notification.style.background = 'linear-gradient(135deg, #E74C3C, #C0392B)';
  } else {
    notification.style.background = 'linear-gradient(135deg, #FF6B35, #4A9EFF)';
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
};

// Main Stryd Stories Component
const StrydStoriesApp = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageType, setImageType] = useState('map');
  const [overlayStyle, setOverlayStyle] = useState('gradient');
  const [overlayPosition, setOverlayPosition] = useState('bottom');
  const [colorTheme, setColorTheme] = useState('stryd-orange');
  const [fontStyle, setFontStyle] = useState('space-grotesk');
  const [runData, setRunData] = useState({
    distance: '11.63 km',
    time: '1:30:51',
    pace: '7:47 /km',
    power: '201W'
  });
  const [strydUrl, setStrydUrl] = useState('');
  const [showOverlay, setShowOverlay] = useState(true);
  const [isLoadingStrydData, setIsLoadingStrydData] = useState(false);
  const [currentStep, setCurrentStep] = useState('upload');
  
  // Route overlay state
  const [showRouteOverlay, setShowRouteOverlay] = useState(false);
  const [routeStyle, setRouteStyle] = useState('gradient');
  const [routeType, setRouteType] = useState('loop');
  const [routeOpacity, setRouteOpacity] = useState(0.9);
  const [routeColorMode, setRouteColorMode] = useState('none');
  const [mockRouteData, setMockRouteData] = useState(null);
  
  // Additional state for modern UI
  const [previewZoom, setPreviewZoom] = useState(0.7);
  const [showDataEditor, setShowDataEditor] = useState(false);
  const [showOverlaySettings, setShowOverlaySettings] = useState(false);
  const liveCanvasRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stryd API simulation
  const fetchStrydData = useCallback(async () => {
    if (!strydUrl) return;
    
    setIsLoadingStrydData(true);
    try {
      const runIdMatch = strydUrl.match(/\/run\/(\d+)/);
      if (!runIdMatch) {
        showNotification('Invalid Stryd URL format. Please use a valid PowerCenter URL.', 'error');
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData = {
        distance: '11.63 km',
        time: '1:30:51',
        pace: '7:47 /km',
        power: '201W'
      };
      
      setRunData(mockData);
      showNotification('Run data loaded successfully!', 'success');
    } catch (error) {
      showNotification('Failed to fetch Stryd data. Please check your URL and try again.', 'error');
    } finally {
      setIsLoadingStrydData(false);
    }
  }, [strydUrl]);

  // Enhanced image processing
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!file) {
      throw new Error('No file selected');
    }
    
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please select a JPEG, PNG, WebP, or GIF image.');
    }
    
    if (file.size > maxSize) {
      throw new Error('Image too large. Maximum size is 10MB.');
    }
    
    return true;
  };
  
  const processImageFile = async (file) => {
    return new Promise((resolve, reject) => {
      try {
        validateFile(file);
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const img = new Image();
          
          img.onload = () => {
            console.log('Image loaded successfully:', {
              width: img.width,
              height: img.height,
              size: file.size,
              type: file.type
            });
            
            resolve({
              image: img,
              file: file,
              dataUrl: e.target.result,
              metadata: {
                width: img.width,
                height: img.height,
                size: file.size,
                type: file.type,
                name: file.name
              }
            });
          };
          
          img.onerror = () => {
            reject(new Error('Failed to load image. The file may be corrupted.'));
          };
          
          // Add timeout for large files
          setTimeout(() => {
            if (!img.complete) {
              reject(new Error('Image loading timed out. Please try a smaller file.'));
            }
          }, 10000);
          
          img.src = e.target.result;
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file. Please try again.'));
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Enhanced upload handler
  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setIsProcessing(true);
      const result = await processImageFile(file);
      
      setUploadedImage(result.image);
      setCurrentStep('customize');
      showNotification('Image uploaded successfully!', 'success');
      
    } catch (error) {
      console.error('Upload error:', error);
      showNotification(error.message, 'error');
    } finally {
      setIsProcessing(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  }, []);
  
  // Helper functions for modern UI
  const applyQuickStyle = useCallback((preset) => {
    setColorTheme(preset.theme);
    setFontStyle(preset.font);
    setOverlayStyle(preset.overlay);
    showNotification(`Applied ${preset.name} style!`, 'success');
  }, []);
  
  const isCurrentStyle = useCallback((preset) => {
    return colorTheme === preset.theme && 
           fontStyle === preset.font && 
           overlayStyle === preset.overlay;
  }, [colorTheme, fontStyle, overlayStyle]);
  
  const drawRouteStylePreview = useCallback((canvas, style) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const routeStyle = ROUTE_STYLES[style] || ROUTE_STYLES.gradient;
    
    ctx.clearRect(0, 0, 60, 40);
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    if (typeof routeStyle.strokeStyle === 'function') {
      ctx.strokeStyle = routeStyle.strokeStyle(ctx, 60, 40);
    } else {
      ctx.strokeStyle = routeStyle.strokeStyle;
    }
    
    ctx.beginPath();
    ctx.moveTo(10, 30);
    ctx.quadraticCurveTo(30, 10, 50, 30);
    ctx.stroke();
  }, [ROUTE_STYLES]);
  
  // Live preview canvas effect
  useEffect(() => {
    if (liveCanvasRef.current && uploadedImage) {
      const timer = setTimeout(() => {
        const liveCanvas = liveCanvasRef.current;
        const liveCtx = liveCanvas.getContext('2d');
        
        // Copy the main canvas content to live preview
        if (canvasRef.current) {
          liveCtx.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
          liveCtx.drawImage(canvasRef.current, 0, 0);
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [uploadedImage, colorTheme, fontStyle, overlayStyle, overlayPosition, runData, showOverlay, showRouteOverlay, mockRouteData, routeStyle, routeOpacity]);
  
  // Route overlay system
  const ROUTE_STYLES = {
    'gradient': {
      strokeStyle: (ctx, width, height) => {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#ff6b35');
        gradient.addColorStop(0.5, '#4a9eff');
        gradient.addColorStop(1, '#c84fff');
        return gradient;
      },
      lineWidth: 8,
      lineCap: 'round',
      lineJoin: 'round',
      shadowBlur: 6,
      shadowColor: 'rgba(0, 0, 0, 0.3)'
    },
    'solid': {
      strokeStyle: '#ff6b35',
      lineWidth: 6,
      lineCap: 'round',
      lineJoin: 'round',
      shadowBlur: 4,
      shadowColor: 'rgba(0, 0, 0, 0.2)'
    },
    'neon': {
      strokeStyle: '#4a9eff',
      lineWidth: 4,
      lineCap: 'round',
      lineJoin: 'round',
      shadowBlur: 12,
      shadowColor: '#4a9eff',
      glowEffect: true
    },
    'minimal': {
      strokeStyle: '#ffffff',
      lineWidth: 3,
      lineCap: 'round',
      lineJoin: 'round',
      shadowBlur: 2,
      shadowColor: 'rgba(0, 0, 0, 0.5)'
    }
  };
  
  const generateMockRouteData = useCallback((routeType = 'loop') => {
    const basePoints = [];
    const numPoints = 50;
    
    if (routeType === 'loop') {
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        const radius = 0.3 + Math.random() * 0.1;
        const x = 0.5 + Math.cos(angle) * radius;
        const y = 0.5 + Math.sin(angle) * radius;
        
        basePoints.push({
          x: Math.max(0.1, Math.min(0.9, x)),
          y: Math.max(0.1, Math.min(0.9, y)),
          elevation: 100 + Math.sin(angle * 3) * 20,
          pace: 300 + Math.random() * 60,
          power: 180 + Math.random() * 40
        });
      }
    } else if (routeType === 'outback') {
      for (let i = 0; i < numPoints; i++) {
        const progress = i / (numPoints - 1);
        let x, y;
        
        if (progress <= 0.5) {
          const t = progress * 2;
          x = 0.2 + t * 0.6;
          y = 0.5 + Math.sin(t * Math.PI * 2) * 0.1;
        } else {
          const t = (progress - 0.5) * 2;
          x = 0.8 - t * 0.6;
          y = 0.5 + Math.sin((1 - t) * Math.PI * 2) * 0.1;
        }
        
        basePoints.push({
          x: Math.max(0.1, Math.min(0.9, x)),
          y: Math.max(0.1, Math.min(0.9, y)),
          elevation: 100 + Math.sin(progress * Math.PI * 4) * 30,
          pace: 280 + Math.random() * 80,
          power: 170 + Math.random() * 50
        });
      }
    } else {
      let x = 0.2;
      let y = 0.5;
      
      for (let i = 0; i < numPoints; i++) {
        x += (Math.random() - 0.5) * 0.1;
        y += (Math.random() - 0.5) * 0.1;
        
        x = Math.max(0.1, Math.min(0.9, x));
        y = Math.max(0.1, Math.min(0.9, y));
        
        basePoints.push({
          x,
          y,
          elevation: 100 + Math.random() * 100,
          pace: 250 + Math.random() * 100,
          power: 150 + Math.random() * 80
        });
      }
    }
    
    return basePoints;
  }, []);
  
  const generateRoute = useCallback(() => {
    const routeData = generateMockRouteData(routeType);
    setMockRouteData(routeData);
    showNotification('Route generated successfully!', 'success');
  }, [routeType, generateMockRouteData]);
  
  const drawRoute = useCallback((canvas, ctx, routeData, style, options = {}) => {
    const {
      opacity = 0.9,
      showStartEnd = true,
      showDirectionArrows = true
    } = options;
    
    if (!routeData || routeData.length < 2) return;
    
    const routeStyle = ROUTE_STYLES[style] || ROUTE_STYLES.gradient;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    
    const points = routeData.map(point => ({
      x: point.x * canvas.width,
      y: point.y * canvas.height,
      ...point
    }));
    
    // Set line style
    ctx.lineWidth = routeStyle.lineWidth;
    ctx.lineCap = routeStyle.lineCap;
    ctx.lineJoin = routeStyle.lineJoin;
    
    if (routeStyle.shadowBlur) {
      ctx.shadowBlur = routeStyle.shadowBlur;
      ctx.shadowColor = routeStyle.shadowColor;
    }
    
    // Draw glow effect for neon style
    if (routeStyle.glowEffect) {
      ctx.save();
      ctx.lineWidth = routeStyle.lineWidth + 4;
      ctx.strokeStyle = routeStyle.shadowColor;
      ctx.globalAlpha = 0.3;
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
    
    // Set stroke style
    if (typeof routeStyle.strokeStyle === 'function') {
      ctx.strokeStyle = routeStyle.strokeStyle(ctx, canvas.width, canvas.height);
    } else {
      ctx.strokeStyle = routeStyle.strokeStyle;
    }
    
    // Draw the path
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    
    // Draw start marker
    if (showStartEnd) {
      const startPoint = points[0];
      
      ctx.fillStyle = '#2ECC71';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 12, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText('S', startPoint.x, startPoint.y + 6);
    }
    
    ctx.restore();
  }, [ROUTE_STYLES]);
  
  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);
  
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);
  
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (!imageFile) {
      showNotification('Please drop an image file.', 'error');
      return;
    }
    
    try {
      setIsProcessing(true);
      const result = await processImageFile(imageFile);
      
      setUploadedImage(result.image);
      setCurrentStep('customize');
      showNotification('Image uploaded successfully!', 'success');
      
    } catch (error) {
      console.error('Drop error:', error);
      showNotification(error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Canvas story generation
  const generateStoryImage = useCallback(() => {
    if (!uploadedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const storyWidth = 1080;
    const storyHeight = 1920;
    
    canvas.width = storyWidth;
    canvas.height = storyHeight;
    ctx.clearRect(0, 0, storyWidth, storyHeight);

    // Calculate image scaling
    const imgAspect = uploadedImage.width / uploadedImage.height;
    const storyAspect = storyWidth / storyHeight;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgAspect > storyAspect) {
      drawHeight = storyHeight;
      drawWidth = drawHeight * imgAspect;
      offsetX = (storyWidth - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = storyWidth;
      drawHeight = drawWidth / imgAspect;
      offsetX = 0;
      offsetY = (storyHeight - drawHeight) / 2;
    }

    // Draw background image
    try {
      ctx.drawImage(uploadedImage, offsetX, offsetY, drawWidth, drawHeight);
    } catch (error) {
      console.error('Error drawing image:', error);
      return;
    }
    
    // Draw route overlay if enabled and route data exists
    if (showRouteOverlay && mockRouteData && mockRouteData.length > 0) {
      drawRoute(canvas, ctx, mockRouteData, routeStyle, {
        opacity: routeOpacity,
        showStartEnd: true,
        showDirectionArrows: true
      });
    }

    if (showOverlay) {
      const theme = THEMES[colorTheme];
      const font = FONTS[fontStyle];
      
      // Calculate overlay position
      let overlayY, overlayHeight;
      const overlayWidth = storyWidth;
      
      if (imageType === 'personal') {
        overlayHeight = 350;
        if (overlayPosition === 'bottom') {
          overlayY = storyHeight - overlayHeight;
        } else if (overlayPosition === 'top') {
          overlayY = 250;
        } else {
          overlayY = (storyHeight - overlayHeight) / 2;
        }
      } else {
        overlayHeight = 450;
        overlayY = storyHeight - overlayHeight;
      }

      // Draw overlay background
      if (overlayStyle === 'gradient') {
        const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, overlayY, overlayWidth, overlayHeight);
      } else if (overlayStyle === 'solid') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, overlayY, overlayWidth, overlayHeight);
      } else if (overlayStyle === 'blur') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(0, overlayY, overlayWidth, overlayHeight);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, overlayY, overlayWidth, overlayHeight);
      } else if (overlayStyle === 'branded') {
        const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
        const hexToRgba = (hex, alpha) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        gradient.addColorStop(0, hexToRgba(theme.primary, 0));
        gradient.addColorStop(1, hexToRgba(theme.primary, 0.9));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, overlayY, overlayWidth, overlayHeight);
      }

      // Set text properties
      ctx.fillStyle = theme.secondary;
      ctx.textAlign = 'left';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      
      const textStartY = overlayY + (imageType === 'personal' ? 100 : 120);
      const leftMargin = 60;

      if (imageType === 'personal') {
        // Compact layout
        ctx.font = `${font.weight} 56px ${font.primary}`;
        ctx.fillStyle = theme.primary;
        ctx.fillText(runData.distance, leftMargin, textStartY);
        
        ctx.font = `600 36px ${font.primary}`;
        ctx.fillStyle = theme.secondary;
        ctx.fillText(`🏃 ${runData.time} • ${runData.pace}`, leftMargin, textStartY + 80);
        ctx.fillText(`⚡ ${runData.power}`, leftMargin, textStartY + 130);
      } else {
        // Full layout for maps
        ctx.font = `${font.weight} 82px ${font.primary}`;
        ctx.fillStyle = theme.primary;
        ctx.fillText(runData.distance, leftMargin, textStartY);
        
        ctx.font = `600 44px ${font.primary}`;
        ctx.fillStyle = theme.secondary;
        const statsY = textStartY + 100;
        
        ctx.fillText(`⏱️ ${runData.time}`, leftMargin, statsY);
        ctx.fillText(`🏃 ${runData.pace}`, 420, statsY);
        ctx.fillText(`⚡ ${runData.power}`, leftMargin, statsY + 80);
      }

      // Add STRYD branding
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      // STRYD logo text (bottom right)
      ctx.font = `bold 36px ${font.primary}`;
      ctx.fillStyle = '#FF6B35';
      ctx.textAlign = 'right';
      ctx.fillText('STRYD', storyWidth - 60, storyHeight - 80);
      
      // Small "powered by" text
      ctx.font = `400 20px ${font.primary}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('powered by', storyWidth - 60, storyHeight - 115);
    }
  }, [uploadedImage, imageType, overlayStyle, overlayPosition, colorTheme, fontStyle, runData, showOverlay, showRouteOverlay, mockRouteData, routeStyle, routeOpacity]);

  // Download functionality
  const downloadImage = useCallback(() => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `stryd-story-${timestamp}.png`;
      link.download = filename;
      link.href = dataURL;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('Story downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading image:', error);
      showNotification('Error downloading image. Please try again.', 'error');
    }
  }, []);

  // Auto-generate when settings change
  useEffect(() => {
    const timer = setTimeout(() => {
      generateStoryImage();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [generateStoryImage]);
  
  // Initialize with a demo route
  useEffect(() => {
    const demoRoute = generateMockRouteData('loop');
    setMockRouteData(demoRoute);
  }, [generateMockRouteData]);

  // Step navigation
  const nextStep = () => {
    if (currentStep === 'upload' && uploadedImage) {
      setCurrentStep('customize');
    } else if (currentStep === 'customize') {
      setCurrentStep('preview');
    }
  };

  const prevStep = () => {
    if (currentStep === 'preview') {
      setCurrentStep('customize');
    } else if (currentStep === 'customize') {
      setCurrentStep('upload');
    }
  };

  return React.createElement('div', { className: 'stryd-app' },
    // Progress indicator
    React.createElement('div', { className: 'progress-bar' },
      React.createElement('div', { className: 'progress-steps' },
        React.createElement('div', { 
          className: `progress-step ${currentStep === 'upload' ? 'active' : currentStep !== 'upload' ? 'completed' : ''}` 
        }, '1. Upload'),
        React.createElement('div', { 
          className: `progress-step ${currentStep === 'customize' ? 'active' : currentStep === 'preview' ? 'completed' : ''}` 
        }, '2. Customize'),
        React.createElement('div', { 
          className: `progress-step ${currentStep === 'preview' ? 'active' : ''}` 
        }, '3. Preview')
      )
    ),

    // Main content based on current step
    currentStep === 'upload' && React.createElement('div', { className: 'upload-section' },
      React.createElement('div', { className: 'section-header' },
        React.createElement('h2', null, 'Upload Your Image'),
        React.createElement('p', null, 'Upload a Stryd map screenshot or personal photo to get started')
      ),

      // Stryd URL import
      React.createElement('div', { className: 'stryd-import' },
        React.createElement('h3', null, 'Import from Stryd PowerCenter'),
        React.createElement('div', { className: 'input-group' },
          React.createElement('input', {
            type: 'text',
            value: strydUrl,
            onChange: (e) => setStrydUrl(e.target.value),
            placeholder: 'https://www.stryd.com/powercenter/run/5575392593608704',
            className: 'stryd-url-input'
          }),
          React.createElement('button', {
            onClick: fetchStrydData,
            disabled: !strydUrl || isLoadingStrydData,
            className: `load-data-btn ${isLoadingStrydData ? 'loading' : ''}`
          }, isLoadingStrydData ? 'Loading...' : 'Load Data')
        )
      ),

      // Image type selection
      React.createElement('div', { className: 'image-type-selector' },
        React.createElement('h3', null, 'Image Type'),
        React.createElement('div', { className: 'type-buttons' },
          React.createElement('button', {
            onClick: () => setImageType('map'),
            className: `type-btn ${imageType === 'map' ? 'active' : ''}`
          }, '🗺️ Run Map'),
          React.createElement('button', {
            onClick: () => setImageType('personal'),
            className: `type-btn ${imageType === 'personal' ? 'active' : ''}`
          }, '📸 Personal Photo')
        )
      ),

      // Enhanced upload area with drag & drop
      React.createElement('div', { 
        className: `upload-area ${
          dragOver ? 'drag-over' : ''
        } ${
          isProcessing ? 'processing' : ''
        } ${
          uploadedImage ? 'has-image' : ''
        }`.trim(),
        onClick: () => !isProcessing && fileInputRef.current?.click(),
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        style: {
          cursor: isProcessing ? 'wait' : 'pointer',
          opacity: isProcessing ? 0.7 : 1
        }
      },
        React.createElement('div', { className: 'upload-content' },
          isProcessing ? [
            React.createElement('div', { key: 'processing', className: 'upload-processing' },
              React.createElement('div', { className: 'processing-spinner' }, '⏳'),
              React.createElement('p', null, 'Processing image...'),
              React.createElement('small', null, 'Please wait while we load your image')
            )
          ] : uploadedImage ? [
            React.createElement('div', { key: 'success', className: 'upload-success' },
              React.createElement('div', { className: 'success-icon' }, '✅'),
              React.createElement('p', null, `${imageType === 'map' ? 'Map' : 'Photo'} uploaded successfully!`),
              React.createElement('small', null, 'Click to change image or drag a new one here')
            )
          ] : [
            React.createElement('div', { key: 'upload', className: 'upload-placeholder' },
              React.createElement('div', { className: 'upload-icon' }, dragOver ? '🎯' : '📤'),
              React.createElement('p', null, dragOver 
                ? 'Drop your image here!'
                : `Click to upload or drag & drop your ${imageType === 'map' ? 'Stryd run map' : 'personal photo'}`
              ),
              React.createElement('small', null, 'Supports PNG, JPG, WebP files (max 10MB)')
            )
          ]
        )
      ),

      React.createElement('input', {
        ref: fileInputRef,
        type: 'file',
        accept: 'image/*',
        onChange: handleImageUpload,
        style: { display: 'none' },
        disabled: isProcessing
      }),

      uploadedImage && React.createElement('div', { className: 'step-navigation' },
        React.createElement('button', {
          onClick: nextStep,
          className: 'next-btn'
        }, 'Continue to Customize →')
      )
    ),

    // Modern Customize Step with Split-Screen Layout
    currentStep === 'customize' && React.createElement('div', { className: 'modern-customize-section' },
      React.createElement('div', { className: 'customize-split-container' },
        
        // LEFT PANEL - Live Preview
        React.createElement('div', { className: 'customize-preview-panel' },
          React.createElement('div', { className: 'preview-header' },
            React.createElement('h3', null, 'Live Preview'),
            React.createElement('div', { className: 'preview-controls' },
              React.createElement('button', { 
                className: 'preview-zoom-btn',
                onClick: () => setPreviewZoom(prev => prev === 1 ? 0.7 : 1)
              }, previewZoom === 1 ? 'Fit to Screen' : 'Actual Size')
            )
          ),
          
          React.createElement('div', { className: 'live-preview-container' },
            React.createElement('div', { 
              className: 'phone-mockup-live',
              style: { transform: `scale(${previewZoom})` }
            },
              React.createElement('div', { className: 'phone-screen-live' },
                React.createElement('div', { className: 'instagram-header' },
                  React.createElement('div', { className: 'story-progress-live' },
                    React.createElement('div', { className: 'progress-line active' })
                  ),
                  React.createElement('div', { className: 'story-time' }, 'now')
                ),
                
                React.createElement('canvas', {
                  ref: liveCanvasRef,
                  width: 1080,
                  height: 1920,
                  className: 'live-story-canvas'
                }),
                
                React.createElement('div', { className: 'preview-indicators' },
                  React.createElement('div', { className: 'safe-zone-indicator' }, 'Safe Zone'),
                  React.createElement('div', { className: 'text-zone-indicator' }, 'Text Area')
                )
              )
            )
          )
        ),
        
        // RIGHT PANEL - Modern Controls
        React.createElement('div', { className: 'customize-controls-panel' },
          React.createElement('div', { className: 'controls-header' },
            React.createElement('h3', null, 'Customize'),
            React.createElement('p', null, 'Changes apply instantly')
          ),
          
          React.createElement('div', { className: 'controls-scroll-area' },
            
            // Quick Style Presets
            React.createElement('div', { className: 'control-section priority' },
              React.createElement('h4', null, 'Quick Style'),
              React.createElement('div', { className: 'quick-style-grid' },
                [
                  { theme: 'stryd-orange', font: 'space-grotesk', overlay: 'gradient', name: 'Stryd Classic' },
                  { theme: 'nike-volt', font: 'athletic', overlay: 'solid', name: 'Athletic Bold' },
                  { theme: 'midnight', font: 'inter', overlay: 'blur', name: 'Night Mode' },
                  { theme: 'sunset', font: 'space-grotesk', overlay: 'branded', name: 'Sunset Vibes' }
                ].map(preset => 
                  React.createElement('button', {
                    key: preset.name,
                    className: `quick-style-btn ${isCurrentStyle(preset) ? 'active' : ''}`,
                    onClick: () => applyQuickStyle(preset)
                  },
                    React.createElement('div', { 
                      className: 'quick-style-preview',
                      style: { backgroundColor: THEMES[preset.theme].primary }
                    }),
                    React.createElement('span', null, preset.name)
                  )
                )
              )
            ),
            
            // Modern Theme Selector
            React.createElement('div', { className: 'control-section' },
              React.createElement('h4', null, 'Color Theme'),
              React.createElement('div', { className: 'theme-grid-modern' },
                Object.keys(THEMES).map(themeKey => 
                  React.createElement('button', {
                    key: themeKey,
                    onClick: () => setColorTheme(themeKey),
                    className: `theme-btn-modern ${colorTheme === themeKey ? 'active' : ''}`
                  },
                    React.createElement('div', { className: 'theme-preview-circle' },
                      React.createElement('div', { 
                        className: 'theme-color-main',
                        style: { backgroundColor: THEMES[themeKey].primary }
                      }),
                      React.createElement('div', { 
                        className: 'theme-color-accent',
                        style: { backgroundColor: THEMES[themeKey].secondary }
                      })
                    ),
                    React.createElement('span', { className: 'theme-name' }, THEMES[themeKey].name)
                  )
                )
              )
            ),
            
            // Modern Font Selector
            React.createElement('div', { className: 'control-section' },
              React.createElement('h4', null, 'Typography'),
              React.createElement('div', { className: 'font-grid-modern' },
                Object.keys(FONTS).map(fontKey => 
                  React.createElement('button', {
                    key: fontKey,
                    onClick: () => setFontStyle(fontKey),
                    className: `font-btn-modern ${fontStyle === fontKey ? 'active' : ''}`,
                    style: { fontFamily: FONTS[fontKey].primary }
                  },
                    React.createElement('div', { className: 'font-preview' },
                      React.createElement('span', { 
                        className: 'font-demo-large',
                        style: { 
                          fontFamily: FONTS[fontKey].primary,
                          fontWeight: FONTS[fontKey].weight 
                        }
                      }, '11.63'),
                      React.createElement('span', { 
                        className: 'font-demo-small',
                        style: { fontFamily: FONTS[fontKey].primary }
                      }, 'km • 7:47 /km')
                    ),
                    React.createElement('span', { className: 'font-name' }, FONTS[fontKey].name)
                  )
                )
              )
            ),
            
            // Modern Route Overlay
            React.createElement('div', { className: 'control-section' },
              React.createElement('h4', null, 'Route Overlay'),
              React.createElement('div', { className: 'route-toggle-modern' },
                React.createElement('label', { className: 'modern-switch' },
                  React.createElement('input', {
                    type: 'checkbox',
                    checked: showRouteOverlay,
                    onChange: (e) => setShowRouteOverlay(e.target.checked)
                  }),
                  React.createElement('span', { className: 'switch-slider' }),
                  React.createElement('span', { className: 'switch-label' }, 'Show Route')
                )
              ),
              
              showRouteOverlay && React.createElement('div', { className: 'route-controls-modern' },
                React.createElement('div', { className: 'route-style-grid' },
                  ['gradient', 'solid', 'neon', 'minimal'].map(style =>
                    React.createElement('button', {
                      key: style,
                      onClick: () => setRouteStyle(style),
                      className: `route-style-btn ${routeStyle === style ? 'active' : ''}`
                    },
                      React.createElement('canvas', {
                        className: 'route-style-preview',
                        width: 60,
                        height: 40,
                        ref: (canvas) => drawRouteStylePreview(canvas, style)
                      }),
                      React.createElement('span', null, style.charAt(0).toUpperCase() + style.slice(1))
                    )
                  )
                ),
                
                React.createElement('div', { className: 'route-type-modern' },
                  React.createElement('label', null, 'Route Type'),
                  React.createElement('div', { className: 'route-type-selector' },
                    [
                      { key: 'loop', icon: 'Loop', name: 'Loop' },
                      { key: 'outback', icon: 'Out&Back', name: 'Out & Back' },
                      { key: 'zigzag', icon: 'Zigzag', name: 'Zigzag' }
                    ].map(type =>
                      React.createElement('button', {
                        key: type.key,
                        onClick: () => setRouteType(type.key),
                        className: `route-type-btn ${routeType === type.key ? 'active' : ''}`
                      }, 
                        React.createElement('span', { className: 'route-icon' }, type.icon),
                        React.createElement('span', null, type.name)
                      )
                    )
                  )
                ),
                
                React.createElement('div', { className: 'opacity-control-modern' },
                  React.createElement('label', null, `Opacity ${Math.round(routeOpacity * 100)}%`),
                  React.createElement('input', {
                    type: 'range',
                    min: '0.1',
                    max: '1',
                    step: '0.1',
                    value: routeOpacity,
                    onChange: (e) => setRouteOpacity(parseFloat(e.target.value)),
                    className: 'modern-slider'
                  })
                ),
                
                React.createElement('button', {
                  onClick: generateRoute,
                  className: 'generate-route-btn-modern'
                }, 'Generate New Route')
              )
            ),
            
            // Collapsible Data Editor
            React.createElement('div', { className: 'control-section collapsible' },
              React.createElement('button', { 
                className: 'section-toggle',
                onClick: () => setShowDataEditor(!showDataEditor)
              },
                React.createElement('h4', null, 'Run Data'),
                React.createElement('span', { className: `toggle-arrow ${showDataEditor ? 'open' : ''}` }, '▼')
              ),
              
              showDataEditor && React.createElement('div', { className: 'data-inputs-modern' },
                Object.entries(runData).map(([key, value]) =>
                  React.createElement('div', { key, className: 'input-group-modern' },
                    React.createElement('label', null, key.charAt(0).toUpperCase() + key.slice(1)),
                    React.createElement('input', {
                      type: 'text',
                      value: value,
                      onChange: (e) => setRunData(prev => ({...prev, [key]: e.target.value})),
                      className: 'modern-input'
                    })
                  )
                )
              )
            ),
            
            // Collapsible Overlay Settings
            React.createElement('div', { className: 'control-section collapsible' },
              React.createElement('button', { 
                className: 'section-toggle',
                onClick: () => setShowOverlaySettings(!showOverlaySettings)
              },
                React.createElement('h4', null, 'Text Overlay'),
                React.createElement('span', { className: `toggle-arrow ${showOverlaySettings ? 'open' : ''}` }, '▼')
              ),
              
              showOverlaySettings && React.createElement('div', { className: 'overlay-controls-modern' },
                React.createElement('div', { className: 'overlay-style-grid' },
                  ['gradient', 'solid', 'blur', 'branded'].map(style =>
                    React.createElement('button', {
                      key: style,
                      onClick: () => setOverlayStyle(style),
                      className: `overlay-style-btn ${overlayStyle === style ? 'active' : ''}`
                    }, style.charAt(0).toUpperCase() + style.slice(1))
                  )
                ),
                
                imageType === 'personal' && React.createElement('div', { className: 'position-controls' },
                  React.createElement('label', null, 'Position'),
                  React.createElement('div', { className: 'position-grid' },
                    ['top', 'center', 'bottom'].map(position =>
                      React.createElement('button', {
                        key: position,
                        onClick: () => setOverlayPosition(position),
                        className: `position-btn ${overlayPosition === position ? 'active' : ''}`
                      }, position.charAt(0).toUpperCase() + position.slice(1))
                    )
                  )
                )
              )
            )
          ),
          
          // Action Buttons
          React.createElement('div', { className: 'customize-actions' },
            React.createElement('button', {
              onClick: prevStep,
              className: 'action-btn secondary'
            }, 'Upload Different Image'),
            React.createElement('button', {
              onClick: nextStep,
              className: 'action-btn primary'
            }, 'Download Story')
          )
        )
      )
    ),

    // Preview Step
    currentStep === 'preview' && React.createElement('div', { className: 'preview-section' },
      React.createElement('div', { className: 'section-header' },
        React.createElement('h2', null, 'Preview & Download'),
        React.createElement('p', null, 'Your Instagram Story is ready!')
      ),

      React.createElement('div', { className: 'preview-container' },
        React.createElement('div', { className: 'phone-mockup' },
          React.createElement('div', { className: 'phone-screen' },
            React.createElement('div', { className: 'instagram-ui' },
              React.createElement('div', { className: 'story-progress' },
                React.createElement('div', { className: 'progress-line active' })
              ),
              React.createElement('canvas', {
                ref: canvasRef,
                width: 1080,
                height: 1920,
                className: 'story-canvas'
              })
            )
          )
        ),

        React.createElement('div', { className: 'preview-actions' },
          React.createElement('div', { className: 'action-card' },
            React.createElement('h3', null, 'Ready to Share'),
            React.createElement('p', null, 'Your story is optimized for Instagram with perfect dimensions and safe zones.'),
            React.createElement('div', { className: 'action-buttons' },
              React.createElement('button', {
                onClick: downloadImage,
                className: 'download-btn primary'
              }, '📥 Download Story'),
              React.createElement('button', {
                onClick: prevStep,
                className: 'edit-btn'
              }, '✏️ Edit More')
            )
          ),

          React.createElement('div', { className: 'specs-card' },
            React.createElement('h4', null, 'Story Specifications'),
            React.createElement('div', { className: 'specs-list' },
              React.createElement('div', { className: 'spec-item' }, '✅ 1080×1920 pixels'),
              React.createElement('div', { className: 'spec-item' }, '✅ 9:16 aspect ratio'),
              React.createElement('div', { className: 'spec-item' }, '✅ Safe zone compliant'),
              React.createElement('div', { className: 'spec-item' }, '✅ STRYD branded')
            )
          )
        )
      )
    )
  );
};

// PWA functionality
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.initPWA();
  }

  initPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
      showNotification('App installed successfully!', 'success');
      this.hideInstallPrompt();
    });

    const installButton = document.getElementById('installButton');
    const installDismiss = document.getElementById('installDismiss');

    if (installButton) {
      installButton.addEventListener('click', this.installApp.bind(this));
    }

    if (installDismiss) {
      installDismiss.addEventListener('click', this.hideInstallPrompt.bind(this));
    }
  }

  showInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
      prompt.classList.add('show');
    }
  }

  hideInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
      prompt.classList.remove('show');
    }
  }

  async installApp() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      showNotification('Installing app...', 'info');
    }
    
    this.deferredPrompt = null;
    this.hideInstallPrompt();
  }
}

// App initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  
  setTimeout(() => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  }, 1500);

  try {
    new PWAManager();
    console.log('PWA Manager initialized');
  } catch (error) {
    console.error('PWA Manager failed:', error);
  }

  const reactRoot = document.getElementById('react-root');
  if (reactRoot && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
    try {
      ReactDOM.render(React.createElement(StrydStoriesApp), reactRoot);
      console.log('React app mounted successfully');
    } catch (error) {
      console.error('React mount failed:', error);
      showReactError(reactRoot);
    }
  } else {
    console.error('React not loaded properly');
    showReactError(reactRoot);
  }
});

// Fallback UI for React errors
function showReactError(reactRoot) {
  if (reactRoot) {
    reactRoot.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        text-align: center;
        color: #fff;
        font-family: 'Space Grotesk', sans-serif;
        padding: 2rem;
      ">
        <h2 style="margin-bottom: 1rem; color: #ff6b35;">Loading Stryd Stories...</h2>
        <p style="color: #888; margin-bottom: 2rem; max-width: 400px; line-height: 1.5;">
          If this message persists, please try refreshing the page or using a different browser.
        </p>
        <button onclick="location.reload()" style="
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #ff6b35, #4a9eff);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
        ">Refresh Page</button>
        <p style="color: #666; margin-top: 2rem; font-size: 0.875rem;">
          For best experience, use Chrome or Safari on mobile.
        </p>
      </div>
    `;
  }
}, 'Click to change image')
            )
          ] : [
            React.createElement('div', { key: 'upload', className: 'upload-placeholder' },
              React.createElement('div', { className: 'upload-icon' }, '📤'),
              React.createElement('p', null, `Click to upload your ${imageType === 'map' ? 'Stryd run map' : 'personal photo'}`),
              React.createElement('small', null, 'Supports PNG, JPG files (max 10MB)')
            )
          ]
        )
      ),

      React.createElement('input', {
        ref: fileInputRef,
        type: 'file',
        accept: 'image/*',
        onChange: handleImageUpload,
        style: { display: 'none' }
      }),

      uploadedImage && React.createElement('div', { className: 'step-navigation' },
        React.createElement('button', {
          onClick: nextStep,
          className: 'next-btn'
        }, 'Continue to Customize →')
      )
    ),storyHeight - overlayHeight) / 2;
        }
      } else {
        overlayHeight = 450;
        overlayY = storyHeight - overlayHeight;
      }

      // Draw overlay background
      if (overlayStyle === 'gradient') {
        const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, overlayY, overlayWidth, overlayHeight);
      } else if (overlayStyle === 'solid') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, overlayY, overlayWidth, overlayHeight);
      } else if (overlayStyle === 'blur') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(0, overlayY, overlayWidth, overlayHeight);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, overlayY, overlayWidth, overlayHeight);
      } else if (overlayStyle === 'branded') {
        const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
        const hexToRgba = (hex, alpha) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        gradient.addColorStop(0, hexToRgba(theme.primary, 0));
        gradient.addColorStop(1, hexToRgba(theme.primary, 0.9));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, overlayY, overlayWidth, overlayHeight);
      }

      // Set text properties
      ctx.fillStyle = theme.secondary;
      ctx.textAlign = 'left';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      
      const textStartY = overlayY + (imageType === 'personal' ? 100 : 120);
      const leftMargin = 60;

      if (imageType === 'personal') {
        // Compact layout
        ctx.font = `${font.weight} 56px ${font.primary}`;
        ctx.fillStyle = theme.primary;
        ctx.fillText(runData.distance, leftMargin, textStartY);
        
        ctx.font = `600 36px ${font.primary}`;
        ctx.fillStyle = theme.secondary;
        ctx.fillText(`🏃 ${runData.time} • ${runData.pace}`, leftMargin, textStartY + 80);
        ctx.fillText(`⚡ ${runData.power}`, leftMargin, textStartY + 130);
      } else {
        // Full layout for maps
        ctx.font = `${font.weight} 82px ${font.primary}`;
        ctx.fillStyle = theme.primary;
        ctx.fillText(runData.distance, leftMargin, textStartY);
        
        ctx.font = `600 44px ${font.primary}`;
        ctx.fillStyle = theme.secondary;
        const statsY = textStartY + 100;
        
        ctx.fillText(`⏱️ ${runData.time}`, leftMargin, statsY);
        ctx.fillText(`🏃 ${runData.pace}`, 420, statsY);
        ctx.fillText(`⚡ ${runData.power}`, leftMargin, statsY + 80);
      }

      // Add STRYD branding
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      // STRYD logo text (bottom right)
      ctx.font = `bold 36px ${font.primary}`;
      ctx.fillStyle = '#FF6B35';
      ctx.textAlign = 'right';
      ctx.fillText('STRYD', storyWidth - 60, storyHeight - 80);
      
      // Small "powered by" text
      ctx.font = `400 20px ${font.primary}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('powered by', storyWidth - 60, storyHeight - 115);
    }
  }, [uploadedImage, imageType, overlayStyle, overlayPosition, colorTheme, fontStyle, runData, showOverlay]);

  // Download functionality
  const downloadImage = useCallback(() => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `stryd-story-${timestamp}.png`;
      link.download = filename;
      link.href = dataURL;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('Story downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading image:', error);
      showNotification('Error downloading image. Please try again.', 'error');
    }
  }, []);

  // Auto-generate when settings change
  useEffect(() => {
    const timer = setTimeout(() => {
      generateStoryImage();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [generateStoryImage]);

  // Step navigation
  const nextStep = () => {
    if (currentStep === 'upload' && uploadedImage) {
      setCurrentStep('customize');
    } else if (currentStep === 'customize') {
      setCurrentStep('preview');
    }
  };

  const prevStep = () => {
    if (currentStep === 'preview') {
      setCurrentStep('customize');
    } else if (currentStep === 'customize') {
      setCurrentStep('upload');
    }
  };

  return React.createElement('div', { className: 'stryd-app' },
    // Progress indicator
    React.createElement('div', { className: 'progress-bar' },
      React.createElement('div', { className: 'progress-steps' },
        React.createElement('div', { 
          className: `progress-step ${currentStep === 'upload' ? 'active' : currentStep !== 'upload' ? 'completed' : ''}` 
        }, '1. Upload'),
        React.createElement('div', { 
          className: `progress-step ${currentStep === 'customize' ? 'active' : currentStep === 'preview' ? 'completed' : ''}` 
        }, '2. Customize'),
        React.createElement('div', { 
          className: `progress-step ${currentStep === 'preview' ? 'active' : ''}` 
        }, '3. Preview')
      )
    ),

    // Main content based on current step
    currentStep === 'upload' && React.createElement('div', { className: 'upload-section' },
      React.createElement('div', { className: 'section-header' },
        React.createElement('h2', null, 'Upload Your Image'),
        React.createElement('p', null, 'Upload a Stryd map screenshot or personal photo to get started')
      ),

      // Stryd URL import
      React.createElement('div', { className: 'stryd-import' },
        React.createElement('h3', null, 'Import from Stryd PowerCenter'),
        React.createElement('div', { className: 'input-group' },
          React.createElement('input', {
            type: 'text',
            value: strydUrl,
            onChange: (e) => setStrydUrl(e.target.value),
            placeholder: 'https://www.stryd.com/powercenter/run/5575392593608704',
            className: 'stryd-url-input'
          }),
          React.createElement('button', {
            onClick: fetchStrydData,
            disabled: !strydUrl || isLoadingStrydData,
            className: `load-data-btn ${isLoadingStrydData ? 'loading' : ''}`
          }, isLoadingStrydData ? 'Loading...' : 'Load Data')
        )
      ),

      // Image type selection
      React.createElement('div', { className: 'image-type-selector' },
        React.createElement('h3', null, 'Image Type'),
        React.createElement('div', { className: 'type-buttons' },
          React.createElement('button', {
            onClick: () => setImageType('map'),
            className: `type-btn ${imageType === 'map' ? 'active' : ''}`
          }, '🗺️ Run Map'),
          React.createElement('button', {
            onClick: () => setImageType('personal'),
            className: `type-btn ${imageType === 'personal' ? 'active' : ''}`
          }, '📸 Personal Photo')
        )
      ),

      // Upload area
      React.createElement('div', { 
        className: 'upload-area',
        onClick: () => fileInputRef.current?.click()
      },
        React.createElement('div', { className: 'upload-content' },
          uploadedImage ? [
            React.createElement('div', { key: 'success', className: 'upload-success' },
              React.createElement('div', { className: 'success-icon' }, '✅'),
              React.createElement('p', null, `${imageType === 'map' ? 'Map' : 'Photo'} uploaded successfully!`),
              React.createElement('small', null, 'Click to change image')
            )
          ] : [
            React.createElement('div', { key: 'upload', className: 'upload-placeholder' },
              React.createElement('div', { className: 'upload-icon' }, '📤'),
              React.createElement('p', null, `Click to upload your ${imageType === 'map' ? 'Stryd run map' : 'personal photo'}`),
              React.createElement('small', null, 'Supports PNG, JPG files (max 10MB)')
            )
          ]
        )
      ),

      React.createElement('input', {
        ref: fileInputRef,
        type: 'file',
        accept: 'image/*',
        onChange: handleImageUpload,
        style: { display: 'none' }
      }),

      uploadedImage && React.createElement('div', { className: 'step-navigation' },
        React.createElement('button', {
          onClick: nextStep,
          className: 'next-btn'
        }, 'Continue to Customize →')
      )
    ),

    // Customize Step
    currentStep === 'customize' && React.createElement('div', { className: 'customize-section' },
      React.createElement('div', { className: 'section-header' },
        React.createElement('h2', null, 'Customize Your Story'),
        React.createElement('p', null, 'Adjust the style and data for your Instagram Story')
      ),

      React.createElement('div', { className: 'customize-grid' },
        // Run data editor
        React.createElement('div', { className: 'customize-card' },
          React.createElement('h3', null, 'Run Statistics'),
          React.createElement('div', { className: 'data-inputs' },
            React.createElement('div', { className: 'input-row' },
              React.createElement('label', null, 'Distance'),
              React.createElement('input', {
                type: 'text',
                value: runData.distance,
                onChange: (e) => setRunData(prev => ({...prev, distance: e.target.value}))
              })
            ),
            React.createElement('div', { className: 'input-row' },
              React.createElement('label', null, 'Time'),
              React.createElement('input', {
                type: 'text',
                value: runData.time,
                onChange: (e) => setRunData(prev => ({...prev, time: e.target.value}))
              })
            ),
            React.createElement('div', { className: 'input-row' },
              React.createElement('label', null, 'Pace'),
              React.createElement('input', {
                type: 'text',
                value: runData.pace,
                onChange: (e) => setRunData(prev => ({...prev, pace: e.target.value}))
              })
            ),
            React.createElement('div', { className: 'input-row' },
              React.createElement('label', null, 'Power'),
              React.createElement('input', {
                type: 'text',
                value: runData.power,
                onChange: (e) => setRunData(prev => ({...prev, power: e.target.value}))
              })
            )
          )
        ),

        // Theme selector
        React.createElement('div', { className: 'customize-card' },
          React.createElement('h3', null, 'Color Theme'),
          React.createElement('div', { className: 'theme-grid' },
            Object.keys(THEMES).map(themeKey => 
              React.createElement('button', {
                key: themeKey,
                onClick: () => setColorTheme(themeKey),
                className: `theme-btn ${colorTheme === themeKey ? 'active' : ''}`,
                style: { '--theme-color': THEMES[themeKey].primary }
              },
                React.createElement('div', { 
                  className: 'theme-color',
                  style: { backgroundColor: THEMES[themeKey].primary }
                }),
                React.createElement('span', null, THEMES[themeKey].name)
              )
            )
          )
        ),

        // Font selector
        React.createElement('div', { className: 'customize-card' },
          React.createElement('h3', null, 'Font Style'),
          React.createElement('div', { className: 'font-grid' },
            Object.keys(FONTS).map(fontKey => 
              React.createElement('button', {
                key: fontKey,
                onClick: () => setFontStyle(fontKey),
                className: `font-btn ${fontStyle === fontKey ? 'active' : ''}`,
                style: { fontFamily: FONTS[fontKey].primary }
              }, FONTS[fontKey].name)
            )
          )
        ),

        // Overlay settings
        React.createElement('div', { className: 'customize-card' },
          React.createElement('h3', null, 'Overlay Settings'),
          React.createElement('div', { className: 'overlay-controls' },
            React.createElement('div', { className: 'control-group' },
              React.createElement('label', null, 'Style'),
              React.createElement('div', { className: 'style-buttons' },
                ['gradient', 'solid', 'blur', 'branded'].map(style =>
                  React.createElement('button', {
                    key: style,
                    onClick: () => setOverlayStyle(style),
                    className: `style-btn ${overlayStyle === style ? 'active' : ''}`
                  }, style.charAt(0).toUpperCase() + style.slice(1))
                )
              )
            ),
            imageType === 'personal' && React.createElement('div', { className: 'control-group' },
              React.createElement('label', null, 'Position'),
              React.createElement('div', { className: 'position-buttons' },
                ['top', 'center', 'bottom'].map(position =>
                  React.createElement('button', {
                    key: position,
                    onClick: () => setOverlayPosition(position),
                    className: `position-btn ${overlayPosition === position ? 'active' : ''}`
                  }, position.charAt(0).toUpperCase() + position.slice(1))
                )
              )
            )
          )
        )
      ),

      React.createElement('div', { className: 'step-navigation' },
        React.createElement('button', {
          onClick: prevStep,
          className: 'prev-btn'
        }, '← Back to Upload'),
        React.createElement('button', {
          onClick: nextStep,
          className: 'next-btn'
        }, 'Preview Story →')
      )
    ),

    // Preview Step
    currentStep === 'preview' && React.createElement('div', { className: 'preview-section' },
      React.createElement('div', { className: 'section-header' },
        React.createElement('h2', null, 'Preview & Download'),
        React.createElement('p', null, 'Your Instagram Story is ready!')
      ),

      React.createElement('div', { className: 'preview-container' },
        React.createElement('div', { className: 'phone-mockup' },
          React.createElement('div', { className: 'phone-screen' },
            React.createElement('div', { className: 'instagram-ui' },
              React.createElement('div', { className: 'story-progress' },
                React.createElement('div', { className: 'progress-line active' })
              ),
              React.createElement('canvas', {
                ref: canvasRef,
                width: 1080,
                height: 1920,
                className: 'story-canvas'
              })
            )
          )
        ),

        React.createElement('div', { className: 'preview-actions' },
          React.createElement('div', { className: 'action-card' },
            React.createElement('h3', null, 'Ready to Share'),
            React.createElement('p', null, 'Your story is optimized for Instagram with perfect dimensions and safe zones.'),
            React.createElement('div', { className: 'action-buttons' },
              React.createElement('button', {
                onClick: downloadImage,
                className: 'download-btn primary'
              }, '📥 Download Story'),
              React.createElement('button', {
                onClick: prevStep,
                className: 'edit-btn'
              }, '✏️ Edit More')
            )
          ),

          React.createElement('div', { className: 'specs-card' },
            React.createElement('h4', null, 'Story Specifications'),
            React.createElement('div', { className: 'specs-list' },
              React.createElement('div', { className: 'spec-item' }, '✅ 1080×1920 pixels'),
              React.createElement('div', { className: 'spec-item' }, '✅ 9:16 aspect ratio'),
              React.createElement('div', { className: 'spec-item' }, '✅ Safe zone compliant'),
              React.createElement('div', { className: 'spec-item' }, '✅ STRYD branded')
            )
          )
        )
      )
    )
  );
};

// PWA functionality
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.initPWA();
  }

  initPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
      showNotification('App installed successfully!', 'success');
      this.hideInstallPrompt();
    });

    const installButton = document.getElementById('installButton');
    const installDismiss = document.getElementById('installDismiss');

    if (installButton) {
      installButton.addEventListener('click', this.installApp.bind(this));
    }

    if (installDismiss) {
      installDismiss.addEventListener('click', this.hideInstallPrompt.bind(this));
    }
  }

  showInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
      prompt.classList.add('show');
    }
  }

  hideInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
      prompt.classList.remove('show');
    }
  }

  async installApp() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      showNotification('Installing app...', 'info');
    }
    
    this.deferredPrompt = null;
    this.hideInstallPrompt();
  }
}

// App initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  
  setTimeout(() => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  }, 1500);

  try {
    new PWAManager();
    console.log('PWA Manager initialized');
  } catch (error) {
    console.error('PWA Manager failed:', error);
  }

  const reactRoot = document.getElementById('react-root');
  if (reactRoot && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
    try {
      ReactDOM.render(React.createElement(StrydStoriesApp), reactRoot);
      console.log('React app mounted successfully');
    } catch (error) {
      console.error('React mount failed:', error);
      showReactError(reactRoot);
    }
  } else {
    console.error('React not loaded properly');
    showReactError(reactRoot);
  }
});

// Fallback UI for React errors
function showReactError(reactRoot) {
  if (reactRoot) {
    reactRoot.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        text-align: center;
        color: #fff;
        font-family: 'Space Grotesk', sans-serif;
        padding: 2rem;
      ">
        <h2 style="margin-bottom: 1rem; color: #ff6b35;">Loading Stryd Stories...</h2>
        <p style="color: #888; margin-bottom: 2rem; max-width: 400px; line-height: 1.5;">
          If this message persists, please try refreshing the page or using a different browser.
        </p>
        <button onclick="location.reload()" style="
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #ff6b35, #4a9eff);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
        ">Refresh Page</button>
        <p style="color: #666; margin-top: 2rem; font-size: 0.875rem;">
          For best experience, use Chrome or Safari on mobile.
        </p>
      </div>
    `;
  }
}
      )
    ),

    currentStep === 'customize' && React.createElement('div', { className: 'customize-section' },
      React.createElement('div', { className: 'section-header' },
        React.createElement('h2', null, 'Customize Your Story'),
        React.createElement('p', null, 'Adjust the style and data for your Instagram Story')
      ),

      React.createElement('div', { className: 'customize-grid' },
        // Run data editor
        React.createElement('div', { className: 'customize-card' },
          React.createElement('h3', null, 'Run Statistics'),
          React.createElement('div', { className: 'data-inputs' },
            React.createElement('div', { className: 'input-row' },
              React.createElement('label', null, 'Distance'),
              React.createElement('input', {
                type: 'text',
                value: runData.distance,
                onChange: (e) => setRunData(prev => ({...prev, distance: e.target.value}))
              })
            ),
            React.createElement('div', { className: 'input-row' },
              React.createElement('label', null, 'Time'),
              React.createElement('input', {
                type: 'text',
                value: runData.time,
                onChange: (e) => setRunData(prev => ({...prev, time: e.target.value}))
              })
            ),
            React.createElement('div', { className: 'input-row' },
              React.createElement('label', null, 'Pace'),
              React.createElement('input', {
                type: 'text',
                value: runData.pace,
                onChange: (e) => setRunData(prev => ({...prev, pace: e.target.value}))
              })
            ),
            React.createElement('div', { className: 'input-row' },
              React.createElement('label', null, 'Power'),
              React.createElement('input', {
                type: 'text',
                value: runData.power,
                onChange: (e) => setRunData(prev => ({...prev, power: e.target.value}))
              })
            )
          )
        ),

        // Theme selector
        React.createElement('div', { className: 'customize-card' },
          React.createElement('h3', null, 'Color Theme'),
          React.createElement('div', { className: 'theme-grid' },
            Object.keys(THEMES).map(themeKey => 
              React.createElement('button', {
                key: themeKey,
                onClick: () => setColorTheme(themeKey),
                className: `theme-btn ${colorTheme === themeKey ? 'active' : ''}`,
                style: { '--theme-color': THEMES[themeKey].primary }
              },
                React.createElement('div', { 
                  className: 'theme-color',
                  style: { backgroundColor: THEMES[themeKey].primary }
                }),
                React.createElement('span', null, THEMES[themeKey].name)
              )
            )
          )
        ),

        // Font selector
        React.createElement('div', { className: 'customize-card' },
          React.createElement('h3', null, 'Font Style'),
          React.createElement('div', { className: 'font-grid' },
            Object.keys(FONTS).map(fontKey => 
              React.createElement('button', {
                key: fontKey,
                onClick: () => setFontStyle(fontKey),
                className: `font-btn ${fontStyle === fontKey ? 'active' : ''}`,
                style: { fontFamily: FONTS[fontKey].primary }
              }, FONTS[fontKey].name)
            )
          )
        ),

        // Overlay settings
        React.createElement('div', { className: 'customize-card' },
          React.createElement('h3', null, 'Overlay Settings'),
          React.createElement('div', { className: 'overlay-controls' },
            React.createElement('div', { className: 'control-group' },
              React.createElement('label', null, 'Style'),
              React.createElement('div', { className: 'style-buttons' },
                ['gradient', 'solid', 'blur', 'branded'].map(style =>
                  React.createElement('button', {
                    key: style,
                    onClick: () => setOverlayStyle(style),
                    className: `style-btn ${overlayStyle === style ? 'active' : ''}`
                  }, style.charAt(0).toUpperCase() + style.slice(1))
                )
              )
            ),
            imageType === 'personal' && React.createElement('div', { className: 'control-group' },
              React.createElement('label', null, 'Position'),
              React.createElement('div', { className: 'position-buttons' },
                ['top', 'center', 'bottom'].map(position =>
                  React.createElement('button', {
                    key: position,
                    onClick: () => setOverlayPosition(position),
                    className: `position-btn ${overlayPosition === position ? 'active' : ''}`
                  }, position.charAt(0).toUpperCase() + position.slice(1))
                )
              )
            )
          )
        )
      ),

      React.createElement('div', { className: 'step-navigation' },
        React.createElement('button', {
          onClick: prevStep,
          className: 'prev-btn'
        }, '← Back to Upload'),
        React.createElement('button', {
          onClick: nextStep,
          className: 'next-btn'
        }, 'Preview Story →')
      )
    ),

      React.createElement('div', { className: 'section-header' },
        React.createElement('h2', null, 'Preview & Download'),
        React.createElement('p', null, 'Your Instagram Story is ready!')
      ),

      React.createElement('div', { className: 'preview-container' },
        React.createElement('div', { className: 'phone-mockup' },
          React.createElement('div', { className: 'phone-screen' },
            React.createElement('div', { className: 'instagram-ui' },
              React.createElement('div', { className: 'story-progress' },
                React.createElement('div', { className: 'progress-line active' })
              ),
              React.createElement('canvas', {
                ref: canvasRef,
                width: 1080,
                height: 1920,
                className: 'story-canvas'
              })
            )
          )
        ),

        React.createElement('div', { className: 'preview-actions' },
          React.createElement('div', { className: 'action-card' },
            React.createElement('h3', null, 'Ready to Share'),
            React.createElement('p', null, 'Your story is optimized for Instagram with perfect dimensions and safe zones.'),
            React.createElement('div', { className: 'action-buttons' },
              React.createElement('button', {
                onClick: downloadImage,
                className: 'download-btn primary'
              }, '📥 Download Story'),
              React.createElement('button', {
                onClick: prevStep,
                className: 'edit-btn'
              }, '✏️ Edit More')
            )
          ),

          React.createElement('div', { className: 'specs-card' },
            React.createElement('h4', null, 'Story Specifications'),
            React.createElement('div', { className: 'specs-list' },
              React.createElement('div', { className: 'spec-item' }, '✅ 1080×1920 pixels'),
              React.createElement('div', { className: 'spec-item' }, '✅ 9:16 aspect ratio'),
              React.createElement('div', { className: 'spec-item' }, '✅ Safe zone compliant'),
              React.createElement('div', { className: 'spec-item' }, '✅ STRYD branded')
            )
          )
        )
      )
    )
  );
};

// PWA functionality
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.initPWA();
  }

  initPWA() {
    // Install prompt handling
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      showNotification('App installed successfully!', 'success');
      this.hideInstallPrompt();
    });

    // Setup install button
    const installButton = document.getElementById('installButton');
    const installDismiss = document.getElementById('installDismiss');

    if (installButton) {
      installButton.addEventListener('click', this.installApp.bind(this));
    }

    if (installDismiss) {
      installDismiss.addEventListener('click', this.hideInstallPrompt.bind(this));
    }
  }

  showInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
      prompt.classList.add('show');
    }
  }

  hideInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
      prompt.classList.remove('show');
    }
  }

  async installApp() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      showNotification('Installing app...', 'info');
    }
    
    this.deferredPrompt = null;
    this.hideInstallPrompt();
  }
}

// App initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  
  // Hide loading screen
  setTimeout(() => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  }, 1500);

  // Initialize PWA
  try {
    new PWAManager();
    console.log('PWA Manager initialized');
  } catch (error) {
    console.error('PWA Manager failed:', error);
  }

  // Mount React app
  const reactRoot = document.getElementById('react-root');
  if (reactRoot && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
    try {
      ReactDOM.render(React.createElement(StrydStoriesApp), reactRoot);
      console.log('React app mounted successfully');
    } catch (error) {
      console.error('React mount failed:', error);
      showReactError(reactRoot);
    }
  } else {
    console.error('React not loaded properly');
    showReactError(reactRoot);
  }
});

// Fallback UI for React errors
function showReactError(reactRoot) {
  if (reactRoot) {
    reactRoot.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        text-align: center;
        color: #fff;
        font-family: 'Space Grotesk', sans-serif;
        padding: 2rem;
      ">
        <h2 style="margin-bottom: 1rem; color: #ff6b35;">Loading Stryd Stories...</h2>
        <p style="color: #888; margin-bottom: 2rem; max-width: 400px; line-height: 1.5;">
          If this message persists, please try refreshing the page or using a different browser.
        </p>
        <button onclick="location.reload()" style="
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #ff6b35, #4a9eff);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
        ">Refresh Page</button>
        <p style="color: #666; margin-top: 2rem; font-size: 0.875rem;">
          For best experience, use Chrome or Safari on mobile.
        </p>
      </div>
    `;
  }
} null, 'Your Instagram Story is ready!')
      ),

      React.createElement('div', { className: 'preview-container' },
        React.createElement('div', { className: 'phone-mockup' },
          React.createElement('div', { className: 'phone-screen' },
            React.createElement('div', { className: 'instagram-ui' },
              React.createElement('div', { className: 'story-progress' },
                React.createElement('div', { className: 'progress-line active' })
              ),
              React.createElement('canvas', {
                ref: canvasRef,
                width: 1080,
                height: 1920,
                className: 'story-canvas'
              })
            )
          )
        ),

        React.createElement('div', { className: 'preview-actions' },
          React.createElement('div', { className: 'action-card' },
            React.createElement('h3', null, 'Ready to Share'),
            React.createElement('p', null, 'Your story is optimized for Instagram with perfect dimensions and safe zones.'),
            React.createElement('div', { className: 'action-buttons' },
              React.createElement('button', {
                onClick: downloadImage,
                className: 'download-btn primary'
              }, '📥 Download Story'),
              React.createElement('button', {
                onClick: prevStep,
                className: 'edit-btn'
              }, '✏️ Edit More')
            )
          ),

          React.createElement('div', { className: 'specs-card' },
            React.createElement('h4', null, 'Story Specifications'),
            React.createElement('div', { className: 'specs-list' },
              React.createElement('div', { className: 'spec-item' }, '✅ 1080×1920 pixels'),
              React.createElement('div', { className: 'spec-item' }, '✅ 9:16 aspect ratio'),
              React.createElement('div', { className: 'spec-item' }, '✅ Safe zone compliant'),
              React.createElement('div', { className: 'spec-item' }, '✅ STRYD branded')
            )
          )
        )
      )
    )
  );
};

// PWA functionality
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.initPWA();
  }

  initPWA() {
    // Install prompt handling
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      showNotification('App installed successfully!', 'success');
      this.hideInstallPrompt();
    });

    // Setup install button
    const installButton = document.getElementById('installButton');
    const installDismiss = document.getElementById('installDismiss');

    if (installButton) {
      installButton.addEventListener('click', this.installApp.bind(this));
    }

    if (installDismiss) {
      installDismiss.addEventListener('click', this.hideInstallPrompt.bind(this));
    }
  }

  showInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
      prompt.classList.add('show');
    }
  }

  hideInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
      prompt.classList.remove('show');
    }
  }

  async installApp() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      showNotification('Installing app...', 'info');
    }
    
    this.deferredPrompt = null;
    this.hideInstallPrompt();
  }
}

// App initialization
document.addEventListener('DOMContentLoaded', () => {
  // Hide loading screen
  setTimeout(() => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  }, 1500);

  // Initialize PWA
  new PWAManager();

  // Mount React app
  const reactRoot = document.getElementById('react-root');
  if (reactRoot && typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
    ReactDOM.render(React.createElement(StrydStoriesApp), reactRoot);
  } else {
    console.error('React not loaded properly');
    // Show fallback message
    const reactRoot = document.getElementById('react-root');
    if (reactRoot) {
      reactRoot.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          color: #fff;
          font-family: 'Space Grotesk', sans-serif;
        ">
          <h2 style="margin-bottom: 1rem; color: #ff6b35;">Loading Stryd Stories...</h2>
          <p style="color: #888; margin-bottom: 2rem;">If this persists, please refresh the page.</p>
          <button onclick="location.reload()" style="
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #ff6b35, #4a9eff);
            border: none;
            border-radius: 12px;
            color: white;
            font-weight: 700;
            cursor: pointer;
          ">Refresh Page</button>
        </div>
      `;
    }
  }
});