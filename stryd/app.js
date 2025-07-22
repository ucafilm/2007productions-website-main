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
    createStroke: (ctx, width, height) => {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#FFD700');  // Gold start
      gradient.addColorStop(0.3, '#FF6B35'); // Orange middle
      gradient.addColorStop(0.7, '#4A9EFF'); // Blue
      gradient.addColorStop(1, '#FF1744');   // Red finish
      return gradient;
    },
    lineWidth: 12, lineCap: 'round', lineJoin: 'round', 
    shadowBlur: 8, shadowColor: 'rgba(0, 0, 0, 0.4)'
  },
  'nike': {
    createStroke: (ctx, width, height) => {
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#00D4FF');   // Nike cyan
      gradient.addColorStop(0.5, '#5433FF'); // Nike purple
      gradient.addColorStop(1, '#20FFAF');   // Nike green
      return gradient;
    },
    lineWidth: 10, lineCap: 'round', lineJoin: 'round',
    shadowBlur: 12, shadowColor: 'rgba(84, 51, 255, 0.3)'
  },
  'strava': {
    createStroke: () => '#FC4C02', // Strava orange
    lineWidth: 8, lineCap: 'round', lineJoin: 'round',
    shadowBlur: 6, shadowColor: 'rgba(252, 76, 2, 0.4)'
  },
  'minimal': {
    createStroke: () => '#FFFFFF',
    lineWidth: 6, lineCap: 'round', lineJoin: 'round',
    shadowBlur: 4, shadowColor: 'rgba(0, 0, 0, 0.6)'
  }
};

// --- STRYD POWERCENTER INTEGRATION --- //
const extractStrydRunId = (url) => {
  const match = url.match(/\/runs\/(\d+)/);
  return match ? match[1] : null;
};

const fetchStrydGPSData = async (url) => {
  try {
    const runId = extractStrydRunId(url);
    if (!runId) {
      throw new Error('Invalid Stryd PowerCenter URL format');
    }
    
    // Attempt to fetch the page and extract GPS data
    // Note: This might be blocked by CORS, so we'll need to handle that
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error('Unable to access Stryd PowerCenter data. The run may be private or require authentication.');
    }
    
    const html = await response.text();
    
    // Look for GPS data in the HTML
    // Stryd PowerCenter typically embeds GPS data in script tags or data attributes
    const gpsDataMatch = html.match(/"gps_data"\s*:\s*(\[.*?\])/s) || 
                         html.match(/gpsData\s*=\s*(\[.*?\])/s) ||
                         html.match(/"trackpoints"\s*:\s*(\[.*?\])/s);
    
    if (gpsDataMatch) {
      const gpsData = JSON.parse(gpsDataMatch[1]);
      return parseStrydGPSPoints(gpsData);
    }
    
    // If no GPS data found in the obvious places, return null
    return null;
    
  } catch (error) {
    console.error('Error fetching Stryd data:', error);
    throw new Error('Unable to extract GPS data from Stryd PowerCenter. This could be due to privacy settings or network restrictions.');
  }
};

const parseStrydGPSPoints = (gpsData) => {
  if (!Array.isArray(gpsData) || gpsData.length === 0) {
    return null;
  }
  
  const points = [];
  
  gpsData.forEach(point => {
    // Handle different possible GPS data formats from Stryd
    let lat, lon;
    
    if (point.latitude && point.longitude) {
      lat = parseFloat(point.latitude);
      lon = parseFloat(point.longitude);
    } else if (point.lat && point.lng) {
      lat = parseFloat(point.lat);
      lon = parseFloat(point.lng);
    } else if (point.lat && point.lon) {
      lat = parseFloat(point.lat);
      lon = parseFloat(point.lon);
    } else if (Array.isArray(point) && point.length >= 2) {
      lat = parseFloat(point[0]);
      lon = parseFloat(point[1]);
    }
    
    if (!isNaN(lat) && !isNaN(lon)) {
      points.push({ lat, lon });
    }
  });
  
  if (points.length === 0) {
    return null;
  }
  
  // Convert GPS coordinates to normalized canvas coordinates
  const minLat = Math.min(...points.map(p => p.lat));
  const maxLat = Math.max(...points.map(p => p.lat));
  const minLon = Math.min(...points.map(p => p.lon));
  const maxLon = Math.max(...points.map(p => p.lon));
  
  const latRange = maxLat - minLat;
  const lonRange = maxLon - minLon;
  
  // Add padding and maintain aspect ratio
  const padding = 0.1;
  
  return points.map(point => ({
    x: padding + ((point.lon - minLon) / lonRange) * (1 - 2 * padding),
    y: padding + ((maxLat - point.lat) / latRange) * (1 - 2 * padding) // Flip Y axis
  }));
};

// --- GPX/TCX PARSING FUNCTIONS --- //
const parseGPXData = (xmlString) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parsing errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid XML format');
    }
    
    const points = [];
    
    // Try GPX format first
    const trkpts = doc.querySelectorAll('trkpt');
    if (trkpts.length > 0) {
      // GPX track points
      trkpts.forEach(point => {
        const lat = parseFloat(point.getAttribute('lat'));
        const lon = parseFloat(point.getAttribute('lon'));
        if (!isNaN(lat) && !isNaN(lon)) {
          points.push({ lat, lon });
        }
      });
    } else {
      // Try TCX format
      const tcxPoints = doc.querySelectorAll('Position');
      tcxPoints.forEach(position => {
        const latElement = position.querySelector('LatitudeDegrees');
        const lonElement = position.querySelector('LongitudeDegrees');
        if (latElement && lonElement) {
          const lat = parseFloat(latElement.textContent);
          const lon = parseFloat(lonElement.textContent);
          if (!isNaN(lat) && !isNaN(lon)) {
            points.push({ lat, lon });
          }
        }
      });
    }
    
    if (points.length === 0) {
      return null;
    }
    
    // Convert GPS coordinates to normalized canvas coordinates
    const minLat = Math.min(...points.map(p => p.lat));
    const maxLat = Math.max(...points.map(p => p.lat));
    const minLon = Math.min(...points.map(p => p.lon));
    const maxLon = Math.max(...points.map(p => p.lon));
    
    const latRange = maxLat - minLat;
    const lonRange = maxLon - minLon;
    
    // Add padding and maintain aspect ratio
    const padding = 0.1;
    
    return points.map(point => ({
      x: padding + ((point.lon - minLon) / lonRange) * (1 - 2 * padding),
      y: padding + ((maxLat - point.lat) / latRange) * (1 - 2 * padding) // Flip Y axis
    }));
    
  } catch (error) {
    console.error('Error parsing GPS data:', error);
    return null;
  }
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
  const [routeType, setRouteType] = useState('realistic');
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

  // File upload with GPX/TCX parsing
  const handleImageUpload = useCallback(async (file) => {
    if (!file) return;
    setIsProcessing(true);
    try {
      if (file.type.includes('xml') || file.name.toLowerCase().endsWith('.gpx') || file.name.toLowerCase().endsWith('.tcx')) {
        // Handle GPX/TCX route files
        const text = await file.text();
        const routeData = parseGPXData(text);
        if (routeData && routeData.length > 0) {
          setMockRouteData(routeData);
          setCurrentStep('customize');
          showNotification('Route file loaded!', 'success');
        } else {
          showNotification('No valid route data found in file', 'error');
        }
      } else {
        // Handle image files
        const image = await processImageFile(file);
        setUploadedImage(image);
        setCurrentStep('customize');
        showNotification('Image uploaded!', 'success');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [processImageFile]);
  
  const generateMockRouteData = useCallback((type) => {
    const points = [];
    const numPoints = 80;
    
    if (type === 'realistic') {
      // Generate realistic GPS-style route data
      const startLat = 0.3;
      const startLng = 0.2;
      let currentLat = startLat;
      let currentLng = startLng;
      
      for (let i = 0; i < numPoints; i++) {
        const progress = i / numPoints;
        
        // Create realistic turns and variations
        const turn = Math.sin(progress * 8) * 0.15;
        const variation = (Math.random() - 0.5) * 0.02;
        
        currentLat += 0.008 + variation;
        currentLng += turn + variation;
        
        // Keep within bounds
        currentLat = Math.max(0.1, Math.min(0.9, currentLat));
        currentLng = Math.max(0.1, Math.min(0.9, currentLng));
        
        points.push({ x: currentLng, y: currentLat });
      }
    } else if (type === 'loop') {
      // Generate a realistic running loop
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI;
        const radius = 0.25 + Math.sin(angle * 3) * 0.1;
        const x = 0.5 + Math.cos(angle) * radius;
        const y = 0.5 + Math.sin(angle) * radius * 0.8; // Oval shape
        points.push({ x, y });
      }
    } else {
      // Zigzag or other patterns
      for (let i = 0; i < numPoints; i++) {
        const progress = i / numPoints;
        const x = 0.2 + progress * 0.6;
        const y = 0.5 + Math.sin(progress * 12) * 0.2;
        points.push({ x, y });
      }
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
  
  // Handle Stryd PowerCenter URL loading
  const handleStrydUrlLoad = useCallback(async () => {
    const urlInput = document.querySelector('.stryd-url-input');
    if (!urlInput || !urlInput.value.trim()) {
      showNotification('Please enter a Stryd PowerCenter URL', 'error');
      return;
    }
    
    const url = urlInput.value.trim();
    
    if (!url.includes('stryd.com/powercenter/runs/')) {
      showNotification('Please enter a valid Stryd PowerCenter run URL', 'error');
      return;
    }
    
    setIsProcessing(true);
    try {
      const routeData = await fetchStrydGPSData(url);
      if (routeData && routeData.length > 0) {
        setMockRouteData(routeData);
        setCurrentStep('customize');
        showNotification('Stryd GPS data loaded successfully!', 'success');
      } else {
        showNotification('No GPS data found in this Stryd run. It may not have location tracking.', 'error');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, []);
  
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
    
    // Set stroke style (handle both functions and strings)
    if (typeof style.createStroke === 'function') {
      ctx.strokeStyle = style.createStroke(ctx, width, height);
    } else {
      ctx.strokeStyle = style.createStroke || '#ff6b35';
    }
    
    // Draw the route path with smooth curves
    ctx.beginPath();
    
    if (routeData.length > 0) {
      const firstPoint = routeData[0];
      ctx.moveTo(firstPoint.x * width, firstPoint.y * height);
      
      // Use quadratic curves for smoother lines
      for (let i = 1; i < routeData.length - 1; i++) {
        const current = routeData[i];
        const next = routeData[i + 1];
        
        const currentX = current.x * width;
        const currentY = current.y * height;
        const nextX = next.x * width;
        const nextY = next.y * height;
        
        // Control point for smooth curve
        const controlX = (currentX + nextX) / 2;
        const controlY = (currentY + nextY) / 2;
        
        ctx.quadraticCurveTo(currentX, currentY, controlX, controlY);
      }
      
      // Connect to the last point
      if (routeData.length > 1) {
        const lastPoint = routeData[routeData.length - 1];
        ctx.lineTo(lastPoint.x * width, lastPoint.y * height);
      }
    }
    
    ctx.stroke();
    
    // Add start/end markers with better styling
    if (routeData.length > 0) {
      const start = routeData[0];
      const end = routeData[routeData.length - 1];
      
      // Start marker (green with white center)
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      
      ctx.fillStyle = '#00E676'; // Bright green
      ctx.beginPath();
      ctx.arc(start.x * width, start.y * height, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(start.x * width, start.y * height, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // End marker (red with white center)
      ctx.fillStyle = '#FF1744'; // Bright red
      ctx.beginPath();
      ctx.arc(end.x * width, end.y * height, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(end.x * width, end.y * height, 6, 0, Math.PI * 2);
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
    
    // Draw route overlay only if enabled
    if (showRouteOverlay && mockRouteData && mockRouteData.length > 0) {
      console.log('Drawing route overlay with', mockRouteData.length, 'points');
      drawRoute(ctx, canvas, mockRouteData, routeStyle, { opacity: routeOpacity });
    } else {
      console.log('Route overlay disabled or no route data');
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
    
    // Draw run data with professional Nike-style layout (no overlapping)
    if (runData) {
      console.log('Drawing run data:', runData);
      
      // Create a more compact stats area at the bottom
      const statsHeight = storyHeight * 0.20; // Reduced from 0.25
      const statsY = storyHeight - statsHeight;
      
      // Professional gradient background
      const statsGradient = ctx.createLinearGradient(0, statsY, 0, storyHeight);
      statsGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      statsGradient.addColorStop(0.2, 'rgba(0, 0, 0, 0.3)');
      statsGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
      ctx.fillStyle = statsGradient;
      ctx.fillRect(0, statsY, storyWidth, statsHeight);
      
      // Main stat (distance) - prominent but not huge
      ctx.font = `900 ${storyWidth * 0.10}px ${font.primary}`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(runData.distance, storyWidth * 0.06, storyHeight * 0.87);
      
      // Distance label
      ctx.font = `600 ${storyWidth * 0.035}px ${font.primary}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('DISTANCE', storyWidth * 0.06, storyHeight * 0.89);
      
      // Secondary stats in a clean row
      const statsRowY = storyHeight * 0.95;
      
      // Time
      ctx.font = `700 ${storyWidth * 0.045}px ${font.primary}`;
      ctx.fillStyle = theme.primary;
      ctx.textAlign = 'left';
      ctx.fillText(runData.time, storyWidth * 0.06, statsRowY);
      
      ctx.font = `500 ${storyWidth * 0.022}px ${font.primary}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('TIME', storyWidth * 0.06, statsRowY + storyWidth * 0.025);
      
      // Pace
      ctx.font = `700 ${storyWidth * 0.045}px ${font.primary}`;
      ctx.fillStyle = theme.primary;
      ctx.fillText(runData.pace, storyWidth * 0.32, statsRowY);
      
      ctx.font = `500 ${storyWidth * 0.022}px ${font.primary}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('PACE', storyWidth * 0.32, statsRowY + storyWidth * 0.025);
      
      // Power
      ctx.font = `700 ${storyWidth * 0.045}px ${font.primary}`;
      ctx.fillStyle = theme.primary;
      ctx.fillText(runData.power, storyWidth * 0.58, statsRowY);
      
      ctx.font = `500 ${storyWidth * 0.022}px ${font.primary}`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('POWER', storyWidth * 0.58, statsRowY + storyWidth * 0.025);
    }
    
    // Add Stryd branding - positioned to NOT overlap stats
    ctx.font = `bold ${storyWidth * 0.045}px ${font.primary}`;
    ctx.fillStyle = theme.primary;
    ctx.textAlign = 'center';
    ctx.fillText('POWERED BY STRYD', storyWidth / 2, storyHeight * 0.75); // Moved much higher
    
    // Add 2007 Productions watermark - top right corner
    ctx.font = `${storyWidth * 0.025}px ${font.primary}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'right';
    ctx.fillText('2007productions.com', storyWidth * 0.94, storyHeight * 0.06);
    
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
  }, [uploadedImage, colorTheme, routeStyle, mockRouteData, showRouteOverlay]); // Added showRouteOverlay
  
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
    setMockRouteData(generateMockRouteData('realistic'));
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
        React.createElement('p', { className: 'stryd-help' }, 
          'Paste a Stryd PowerCenter run URL to automatically extract GPS route data'
        ),
        React.createElement('div', { className: 'stryd-input-group' },
          React.createElement('input', { 
            type: 'url', 
            placeholder: 'https://www.stryd.com/powercenter/runs/5413337932660736', 
            className: 'stryd-url-input' 
          }),
          React.createElement('button', { 
            className: 'load-data-btn',
            onClick: handleStrydUrlLoad,
            disabled: isProcessing
          }, isProcessing ? 'Loading...' : 'Load Data')
        ),
        React.createElement('p', { className: 'stryd-note' }, 
          '⚠️ Note: Only works with public Stryd runs that have GPS tracking enabled'
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
            imageType === 'map' ? 'Upload Stryd map image or GPS file (.gpx/.tcx)' : 'Upload your personal photo'
          ),
          React.createElement('p', { className: 'upload-sub' }, 'Images: PNG, JPG files (max 10MB) • GPS: GPX, TCX files')
        ),
        React.createElement('input', {
          type: 'file',
          ref: fileInputRef,
          accept: 'image/*,.gpx,.tcx',
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
        React.createElement('div', { className: 'control-group' },
          React.createElement('h3', null, 'Route Overlay'),
          React.createElement('label', { className: 'toggle-switch' },
            React.createElement('input', {
              type: 'checkbox',
              checked: showRouteOverlay,
              onChange: (e) => setShowRouteOverlay(e.target.checked)
            }),
            React.createElement('span', { className: 'toggle-slider' }),
            React.createElement('span', { className: 'toggle-label' }, 
              showRouteOverlay ? 'Route Visible' : 'Route Hidden'
            )
          )
        ),
        
        // Route Style Selection
        showRouteOverlay && React.createElement('div', { className: 'control-group' },
          React.createElement('h3', null, 'Route Style'),
          React.createElement('div', { className: 'route-style-buttons' },
            React.createElement('button', {
              className: 'route-style-btn' + (routeStyle === 'gradient' ? ' active' : ''),
              onClick: () => setRouteStyle('gradient')
            }, '🌈 Gradient'),
            React.createElement('button', {
              className: 'route-style-btn' + (routeStyle === 'nike' ? ' active' : ''),
              onClick: () => setRouteStyle('nike')
            }, '💙 Nike'),
            React.createElement('button', {
              className: 'route-style-btn' + (routeStyle === 'strava' ? ' active' : ''),
              onClick: () => setRouteStyle('strava')
            }, '🧡 Strava'),
            React.createElement('button', {
              className: 'route-style-btn' + (routeStyle === 'minimal' ? ' active' : ''),
              onClick: () => setRouteStyle('minimal')
            }, '⚪ Minimal')
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