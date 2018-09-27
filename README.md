# keystroke-visualizer
Visualize the keystrokes on the current page. Inspired by https://github.com/keycastr/keycastr

![keystroke visualizer in action](https://rawgit.com/fernandojsg/keystroke-visualizer/master/img/keystrokes.gif)
    
# Usage

## NPM

```
npm install keystroke-visualizer
```

```javascript
import KeystrokeVisualizer from  'keystroke-visualizer';

KeystrokeVisualizer.enable(options);
```

## Browser

```html
<script src="https://rawgit.com/fernandojsg/keystroke-visualizer/master/build/keystroke-visualizer.js"></script>

<script>
  KEYVIS.enable(options);
<script>
```

## Options
```javascript
const DEFAULT_OPTIONS = {
  fontSize: 16,
  keyStrokeDelay: 200, // Time before the line breaks
  lingerDelay: 1000, // Time before the text fades away
  fadeDuration: 1000,
  bezelColor: '#000',
  textColor: '#fff',
  unmodifiedKey: true, // If pressing Alt+e show e, instead of €
  showSymbol: true, // Convert ArrowLeft on ->
  appendModifiers: {Meta: true, Alt: true, Shift: false}, // Append modifier to key all the time
  position: 'bottom-left' // bottom-left, bottom-right, top-left, top-right
};
```
