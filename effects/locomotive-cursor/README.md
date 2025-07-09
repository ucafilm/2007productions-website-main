# Locomotive Cursor Effect

Custom cursor system inspired by Locomotive.ca, with interactive hover effects.

## Installation

```html
<link rel="stylesheet" href="locomotive-cursor.css">
<script src="locomotive-cursor.js"></script>
```

## Basic Usage

```javascript
// Initialize the cursor
const cursor = new LocomotiveCursor();

// Register with EffectManager if available
if (window.effectManager) {
    window.effectManager.registerEffect('locomotiveCursor', cursor);
}
```

## Configuration Options

None directly via constructor. Behavior is controlled by CSS classes and `data-magnetic` attributes.

## API Methods

- `destroy()` - Clean up and remove the cursor
- `pause()` - (No specific pause logic, cursor always tracks mouse)
- `resume()` - Re-initializes cursor if destroyed (e.g., on mobile resize)

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Notes

- Uses `requestAnimationFrame` for smooth rendering
- CSS `mix-blend-mode` for visual effects
- Automatically disabled on mobile devices
