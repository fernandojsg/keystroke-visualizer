import useragentInfo from 'useragent-info';

class KeystrokeVisualizer {
  constructor() {
    this.initialized = false;    
  }

  init(options) {
    var DEFAULT_OPTIONS = {
      fontSize: 16,
      keyStrokeDelay: 200, // Time before the line breaks
      lingerDelay: 1000, // Time before the text fades away
      fadeDuration: 1000,
      bezelColor: '#000',
      textColor: '#fff'
    };
    
		this.options = Object.assign( {}, DEFAULT_OPTIONS, options );


    // Add container
    this.container = document.createElement('ul');
    document.body.appendChild(this.container);
    this.container.className = 'keystrokes';
    
    // Add classes
    var node = document.createElement('style');
    node.innerHTML = `
      ul.keystrokes {
        padding-left: 10px;
        position: fixed;
        bottom: 0;
        left: 0px;
      }
      
      ul.keystrokes li {
        font-family: Arial;
        background-color: ${this.options.bezelColor};
        opacity: 0.9;
        color: ${this.options.textColor};
        padding: 5px 10px;
        margin-bottom: 5px;
        border-radius: 10px;
        opacity: 1;
        font-size: ${this.options.fontSize}px;
        display: table;
        -webkit-transition: opacity ${this.options.fadeDuration}ms linear;
        transition: opacity ${this.options.fadeDuration}ms linear;
      }`;
    document.body.appendChild(node);

    this.initialized = true;
  }
  enable() {
    if (!this.initialized) {
      this.init();
    }
    var currentChunk = null;
    var timeout = null;
  
    window.addEventListener('keydown', e => {
      if (!currentChunk) {
        currentChunk = document.createElement('li');
        this.container.appendChild(currentChunk);
      }

      var mac = useragentInfo().platform === 'Mac';

      function convert(key) {
        const conversion = {
          'ArrowRight': '→',
          'ArrowLeft': '←',
          'ArrowUp': '↑',
          'ArrowDown': '↓',
          ' ': '␣',
          'Enter': '↩',
          'Alt': '⌥',
          'Backspace': '⌫',
          'Meta': '⌘',
          'Shift': '⇧',
          'Control': '⌃',
          'CapsLock': '⇪',
          'Escape': '⎋',
          'Tab': '⇥',
          'PageDown': '⇟',
          'PageUp': '⇞',
          'Home': '↖',
          'End': '↘'
        };
        
        return conversion[key] ||key;
      }
      
      currentChunk.textContent += convert(e.key);
    });
    
    var options = this.options;
    window.addEventListener('keyup', e => {
      if (!currentChunk) return;

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        (function(previousChunk) {
          setTimeout(() => {
            previousChunk.style.opacity = 0;
            setTimeout(() => {previousChunk.parentNode.removeChild(previousChunk)}, options.fadeDuration);
          }, options.lingerDelay);
        })(currentChunk);
        
        currentChunk = null;
      }, options.keyStrokeDelay);
    });  
  }
}

export default new KeystrokeVisualizer();