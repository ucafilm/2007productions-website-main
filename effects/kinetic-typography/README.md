# Kinetic Typography Effect

Locomotive.ca inspired text animation system with customizable entrance and exit effects.

## Installation

```html
<link rel="stylesheet" href="kinetic-typography.css">
<script src="kinetic-typography.js"></script>
```

## Basic Usage

```html
<div class="kinetic-container">
    <div class="text-wrapper" data-enter="left" data-exit="right">
        <h2>AMAZING TEXT</h2>
    </div>
    <div class="text-wrapper" data-enter="top" data-exit="bottom">
        <h2>ANOTHER TEXT</h2>
    </div>
</div>
```

```javascript
const container = document.querySelector('.kinetic-container');
const kinetic = new KineticTypography(container, {
    displayDuration: 4000,
    transitionDuration: 1000
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| displayDuration | number | 4000 | Time each text is displayed (ms) |
| transitionDuration | number | 1000 | Animation transition time (ms) |
| autoStart | boolean | true | Start animation automatically |

## API Methods

- `start()` - Start the animation cycle
- `stop()` - Stop and reset animations
- `pause()` - Pause the current cycle
- `resume()` - Resume from pause
- `goToText(index)` - Jump to specific text
- `destroy()` - Clean up and remove all effects

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Notes

- Uses hardware-accelerated CSS transforms
- Automatic cleanup prevents memory leaks
- Optimized for 60fps animations
- Mobile-friendly fallbacks included
