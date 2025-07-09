# Mouse Image Effect

Velocity-based image spawning system.

## Installation

```html
<link rel="stylesheet" href="mouse-image-effect.css">
<script src="mouse-image-effect.js"></script>
```

## Basic Usage

```html
<div class="mouse-effect-container" id="mouseEffectContainer"></div>
<div class="image-pool" style="display: none;">
    <img src="path/to/image1.jpg" alt="">
    <img src="path/to/image2.jpg" alt="">
</div>
```

```javascript
const container = document.getElementById('mouseEffectContainer');
const imagePool = document.querySelector('.image-pool');
const mouseEffect = new MouseImageEffect(container, imagePool, {
    velocityThreshold: 5,
    maxImages: 10
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| velocityThreshold | number | 5 | Minimum mouse velocity to trigger spawning |
| maxImages | number | 10 | Maximum number of images to spawn simultaneously |
| throttleRate | number | 16 | Mousemove event throttle rate (ms) |
| imageDuration | number | 1500 | Duration for spawned images to fade out (ms) |

## API Methods

- `pause()` - Pause image spawning
- `resume()` - Resume image spawning
- `setVelocityThreshold(threshold)` - Set new velocity threshold
- `setMaxImages(max)` - Set new maximum images
- `destroy()` - Clean up and remove all effects

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Notes

- Uses a throttle mechanism for mouse events
- Images are removed from DOM after animation
- Optimized for 60fps animations
- Mobile-friendly fallbacks included
