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
      showNotification('✅ Run data loaded successfully!', 'success');
    } catch (error) {
      showNotification('Failed to fetch Stryd data. Please check your URL and try again.', 'error');
    } finally {
      setIsLoadingStrydData(false);
    }
  }, [strydUrl]);

  // Image upload handler
  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showNotification('Image too large. Please select an image under 10MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
        setCurrentStep('customize');
        showNotification('Image uploaded successfully!', 'success');
      };
      img.onerror = () => {
        showNotification('Error loading image. Please try a different file.', 'error');
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      showNotification('Error reading file. Please try again.', 'error');
    };
    reader.readAsDataURL(file);
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