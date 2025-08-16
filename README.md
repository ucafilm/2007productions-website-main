# 2007 Productions Website

A cutting-edge creative portfolio website showcasing the team and work of 2007 Productions. Built with advanced web technologies and creative effects inspired by Locomotive.ca and modern design studios.

## 🎯 Overview

**2007 Productions** is a creative powerhouse specializing in Films, Webisodes, Music Production, and Sound Design. Our tagline: "it's just a video thang" - we break rules for fun and guarantee weirdness in everything we create.

**Live Site**: [2007productions.com](https://2007productions.com)

## ✨ Key Features

### 🎨 Advanced Visual Effects
- **Locomotive-inspired Cursor**: Magnetic interactions with elements
- **Kinetic Typography**: Robot-style animated text sequences  
- **Pixelated Image Reveals**: Baillat Studio-style hover effects
- **Text Morphing**: Dynamic text transformations on hover
- **GSAP Animations**: Smooth, professional transitions
- **Parallax Scrolling**: Multi-layer depth effects
- **Bokeh Particles**: Floating ambient elements

### 🤖 AI Assistant (ARIA)
- **Google Gemini Integration**: Powered by advanced AI
- **Context-Aware**: Knows all team members and company info
- **Quirky Personality**: Matches the "it's just a video thang" brand tone
- **Serverless Function**: Netlify Functions backend
- **Real-time Chat**: Instant responses with typing indicators

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Conditional Loading**: Desktop effects only load on larger screens
- **Touch Optimized**: Mobile-friendly interactions
- **Progressive Enhancement**: Works without JavaScript

### 🎵 Team Showcase
Individual pages for each team member:
- **Collin** - Co-Founder/Director ("The Rule Breaker")
- **Corey** - Cinematographer/Editor ("The Frame Wizard") 
- **Levi** - Producer/Sound Designer ("The Sound Alchemist")
- **Tim** - Co-Founder/Creative Director ("The Idea Whisperer")
- **Terrell** - Music Producer/Composer ("The Beat Architect")

### 🏃‍♂️ Stryd PWA Integration
- **Nested PWA**: `/stryd/` subdirectory contains full Progressive Web App
- **Instagram Stories**: Transform Stryd run data into social media content
- **Offline Capable**: Service Worker with caching
- **Brand Integrated**: Uses 2007 Productions design system

## 🛠 Technical Stack

### Frontend
- **HTML5**: Semantic markup with accessibility focus
- **Modern CSS**: CSS Grid, Flexbox, Custom Properties
- **Vanilla JavaScript**: No framework dependencies for main site
- **GSAP**: Professional animation library
- **ScrollTrigger**: Scroll-based animations
- **ScrollSmoother**: Smooth scrolling experience

### Effects System
Modular effect loading system:
```
effects/
├── core/                    # Base effect utilities
├── kinetic-typography/      # Robot-style text animations  
├── locomotive-cursor/       # Magnetic cursor interactions
└── mouse-effects/          # Advanced hover effects
```

### Backend
- **Netlify Functions**: Serverless backend
- **Google Gemini AI**: AI chatbot integration
- **Node.js 18**: Runtime environment
- **CORS Enabled**: Cross-origin resource sharing

### Deployment
- **Netlify**: Auto-deployment from Git
- **Custom Domain**: 2007productions.com
- **SSL/HTTPS**: Automatic certificate management
- **CDN**: Global content delivery
- **Form Handling**: Netlify Forms integration

## 📁 Project Structure

```
2007productions-website/
├── index.html                    # Main site entry point
├── style.css                     # Core styles
├── script.js                     # Main JavaScript
├── netlify.toml                  # Deployment configuration
├── 2007_productions_reel_1.mp4   # Hero background video
│
├── effects/                      # Modular effect system
│   ├── core/                     # Base utilities
│   ├── kinetic-typography/       # Text animations
│   ├── locomotive-cursor/        # Cursor effects
│   └── mouse-effects/           # Hover interactions
│
├── netlify/
│   └── functions/
│       └── get-ai-response.js    # AI chatbot backend
│
└── stryd/                        # Nested PWA
    ├── index.html                # PWA shell
    ├── app.js                    # React application
    ├── manifest.json             # PWA manifest
    ├── sw.js                     # Service Worker
    └── icons/                    # PWA icons
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- Netlify CLI (for development)

### Local Development
```bash
# Clone the repository
git clone [repository-url]
cd 2007productions-website

# Install Netlify CLI
npm install -g netlify-cli

# Start development server
netlify dev

# Open browser to http://localhost:8888
```

### Environment Variables
Create `.env` file for AI functionality:
```
GEMINI_API_KEY=your_google_gemini_api_key
```

## 🎨 Design System

### Colors
```css
--primary-bg: #0a0a0a          /* Deep black background */
--accent-electric: #ff6b35      /* Electric orange */
--accent-cyber: #4a9eff        /* Cyber blue */
--accent-neon: #c84fff         /* Neon purple */
--text-primary: #ffffff        /* Pure white */
--text-secondary: #a0a0a0      /* Medium gray */
--surface: #1a1a1a            /* Elevated surface */
```

### Typography
- **Display**: Space Grotesk (300-900 weights)
- **Monospace**: JetBrains Mono (200-600 weights)  
- **Body**: Inter (100-900 weights)

### Animation Principles
- **Easing**: Custom cubic-bezier curves
- **Duration**: 0.3s-1.5s based on complexity
- **Stagger**: 0.05s-0.2s for sequential animations
- **Performance**: GPU-accelerated transforms

## 🎯 Features in Detail

### Kinetic Typography System
Robot-style text animations with 9 sequential reveals:
- 2007 → PRODUCTIONS → it's just a → video thang → CREATIVE → POWERHOUSE → FEARLESS → INNOVATION → WELCOME

### AI Assistant (ARIA)
Context-aware chatbot with personality:
- Knows all team member specialties and quirks
- Responds in brand-appropriate "weird" tone
- Handles company info, project inquiries, and general chat
- Typing indicators and smooth UX

### Member Visual System
Advanced hover effects for portfolio showcases:
- Pixelated overlays with color gradients
- Smooth text morphing and scaling
- Magnetic cursor attraction
- Click-to-view modal system

### Mode Switching
Dynamic content transformation:
- **WORK Mode**: Technical focus, personality-driven
- **AGENCY Mode**: Professional positioning, service-oriented
- Text morphing animations during transitions

## 📱 Mobile Experience

### Responsive Breakpoints
- **Desktop**: 1024px+ (full effects)
- **Tablet**: 768px-1023px (simplified effects)
- **Mobile**: <768px (essential features only)

### Performance Optimizations
- Conditional effect loading based on screen size
- CSS `@media` queries for resource management
- Touch-optimized interactions
- Reduced motion for accessibility

## 🔧 Customization

### Adding New Team Members
1. Add member data to `script.js` member objects
2. Create new page section in `index.html`
3. Add navigation link to menu
4. Include member-specific styles

### Modifying Effects
Effects are modular and can be enabled/disabled:
```html
<!-- Conditional loading based on screen size -->
<link rel="stylesheet" href="effects/kinetic-typography/kinetic-typography.css" 
      media="screen and (min-width: 769px)">
```

### AI Personality Updates
Modify the context in `netlify/functions/get-ai-response.js`:
```javascript
const context = `You are ARIA, the witty, creative AI assistant...`;
```

## 🚀 Deployment

### Automatic Deployment
- **Git Push**: Auto-deploys on push to main branch
- **Build Process**: Netlify handles static site generation
- **Domain**: Custom domain with SSL
- **CDN**: Global edge caching

### Manual Deployment
```bash
# Build and deploy
netlify build
netlify deploy --prod
```

### Environment Setup
Required environment variables in Netlify:
- `GEMINI_API_KEY`: Google Gemini API key for AI chat
- `NODE_VERSION`: Set to "18"

## 📊 Performance Metrics

### Core Web Vitals
- **LCP**: <2.5s (optimized with preloading)
- **FID**: <100ms (efficient event handling)
- **CLS**: <0.1 (stable layout)

### Bundle Size
- **CSS**: ~50KB (compressed)
- **JavaScript**: ~30KB (excluding GSAP CDN)
- **Video**: Optimized MP4 background
- **Total**: <2MB initial load

## 🎨 Brand Integration

### Visual Identity
- Maintains 2007 Productions brand consistency
- "it's just a video thang" tagline integration
- Professional portfolio presentation
- Creative personality expression

### Content Strategy
- Team member personalities and quirks
- Technical expertise showcasing
- Company culture representation
- Client engagement focus

## 🔮 Future Enhancements

### Planned Features
- **3D Elements**: Three.js integration for depth
- **Video Testimonials**: Client success stories
- **Project Case Studies**: Detailed work showcases
- **Blog Integration**: Company insights and updates
- **E-commerce**: Merchandise and service booking

### Technical Improvements
- **React Migration**: Component-based architecture
- **TypeScript**: Type safety and better DX
- **Bundle Optimization**: Code splitting and lazy loading
- **PWA Features**: Offline capability and push notifications
- **Analytics**: User behavior tracking

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request
5. Code review and merge

### Code Standards
- **ES6+**: Modern JavaScript syntax
- **CSS Grid/Flexbox**: Modern layout techniques
- **Semantic HTML**: Accessibility-first markup
- **Performance**: Mobile-first optimization

## 📄 License

© 2025 2007 Productions. All rights reserved.

This project is proprietary and confidential. No part of this codebase may be reproduced, distributed, or transmitted without prior written permission.

## 📞 Contact

**2007 Productions**
- **Website**: [2007productions.com](https://2007productions.com)
- **Email**: Contact individual team members via their profile pages
- **AI Assistant**: Chat with ARIA directly on the website

---

*Built with ❤️ and a healthy dose of weirdness by the 2007 Productions team.*