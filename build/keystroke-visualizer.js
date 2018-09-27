(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.KEYVIS = factory());
}(this, (function () { 'use strict';

  const DEFAULT_OPTIONS = {
    fontSize: 16,
    keyStrokeDelay: 200,
    lingerDelay: 1000,
    fadeDuration: 1000,
    bezelColor: '#000',
    textColor: '#fff',
    unmodifiedKey: true,
    showSymbol: true,
    appendModifiers: {
      Meta: true,
      Alt: true,
      Shift: false
    },
    position: 'bottom-left'
  };
  class KeystrokeVisualizer {
    constructor() {
      this.initialized = false;
      this.container = null;
      this.style = null;
      this.keyStrokeTimeout = null;
      this.options = {};
      this.currentChunk = null;
      this.keydown = this.keydown.bind(this);
      this.keyup = this.keyup.bind(this);
    }
    cleanUp() {
      function removeNode(node) {
        if (node) {
          debugger;
          node.parentNode.removeChild(node);
        }
      }
      removeNode(this.container);
      removeNode(this.style);
      clearTimeout(this.keyStrokeTimeout);
      this.currentChunk = null;
      this.container = this.style = null;
      window.removeEventListener('keydown', this.keydown);
      window.removeEventListener('keyup', this.keyup);
    }
    injectComponents() {
      this.container = document.createElement('ul');
      document.body.appendChild(this.container);
      this.container.className = 'keystrokes';
      const positions = {
        'bottom-left': 'bottom: 0; left: 0;',
        'bottom-right': 'bottom: 0; right: 0;',
        'top-left': 'top: 0; left: 0;',
        'top-right': 'top: 0; right: 0;'
      };
      if (!positions[this.options.position]) {
        console.warn(`Invalid position '${this.options.position}', using default 'bottom-left'. Valid positions: `, Object.keys(positions));
        this.options.position = 'bottom-left';
      }
      this.style = document.createElement('style');
      this.style.innerHTML = `
      ul.keystrokes {
        padding-left: 10px;
        position: fixed;
        ${positions[this.options.position]}
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
      document.body.appendChild(this.style);
    }
    convertKeyToSymbol(key) {
      const conversionCommon = {
        'ArrowRight': '→',
        'ArrowLeft': '←',
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        ' ': '␣',
        'Enter': '↩',
        'Shift': '⇧',
        'ShiftRight': '⇧',
        'ShiftLeft': '⇧',
        'Control': '⌃',
        'Tab': '↹',
        'CapsLock': '⇪'
      };
      const conversionMac = {
        'Alt': '⌥',
        'AltLeft': '⌥',
        'AltRight': '⌥',
        'Delete': '⌦',
        'Escape': '⎋',
        'Backspace': '⌫',
        'Meta': '⌘',
        'Tab': '⇥',
        'PageDown': '⇟',
        'PageUp': '⇞',
        'Home': '↖',
        'End': '↘'
      };
      return (navigator.platform === 'MacIntel' ? conversionMac[key] : null) || conversionCommon[key] || key;
    }
    keydown(e) {
      if (!this.currentChunk) {
        this.currentChunk = document.createElement('li');
        this.container.appendChild(this.currentChunk);
      }
      var key = e.key;
      if (this.options.unmodifiedKey) {
        if (e.code.indexOf('Key') !== -1) {
          key = e.code.replace('Key', '');
          if (!e.shiftKey) {
            key = key.toLowerCase();
          }
        }
      }
      var modifier = '';
      if (this.options.appendModifiers.Meta && e.metaKey && e.key !== 'Meta') {
        modifier += this.convertKeyToSymbol('Meta');
      }
      if (this.options.appendModifiers.Alt && e.altKey && e.key !== 'Alt') {
        modifier += this.convertKeyToSymbol('Alt');
      }
      if (this.options.appendModifiers.Shift && e.shiftKey && e.key !== 'Shift') {
        modifier += this.convertKeyToSymbol('Shift');
      }
      this.currentChunk.textContent += modifier + (this.options.showSymbol ? this.convertKeyToSymbol(key) : key);
    }
    keyup(e) {
      if (!this.currentChunk) return;
      var options = this.options;
      clearTimeout(this.keyStrokeTimeout);
      this.keyStrokeTimeout = setTimeout(() => {
        (function (previousChunk) {
          setTimeout(() => {
            previousChunk.style.opacity = 0;
            setTimeout(() => {
              previousChunk.parentNode.removeChild(previousChunk);
            }, options.fadeDuration);
          }, options.lingerDelay);
        })(this.currentChunk);
        this.currentChunk = null;
      }, options.keyStrokeDelay);
    }
    enable(options) {
      this.cleanUp();
      this.options = Object.assign({}, DEFAULT_OPTIONS, options || this.options);
      this.injectComponents();
      window.addEventListener('keydown', this.keydown);
      window.addEventListener('keyup', this.keyup);
    }
    disable() {
      this.cleanUp();
    }
  }
  var index = new KeystrokeVisualizer();

  return index;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5c3Ryb2tlLXZpc3VhbGl6ZXIuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBERUZBVUxUX09QVElPTlMgPSB7XG4gIGZvbnRTaXplOiAxNixcbiAga2V5U3Ryb2tlRGVsYXk6IDIwMCwgLy8gVGltZSBiZWZvcmUgdGhlIGxpbmUgYnJlYWtzXG4gIGxpbmdlckRlbGF5OiAxMDAwLCAvLyBUaW1lIGJlZm9yZSB0aGUgdGV4dCBmYWRlcyBhd2F5XG4gIGZhZGVEdXJhdGlvbjogMTAwMCxcbiAgYmV6ZWxDb2xvcjogJyMwMDAnLFxuICB0ZXh0Q29sb3I6ICcjZmZmJyxcbiAgdW5tb2RpZmllZEtleTogdHJ1ZSwgLy8gSWYgcHJlc3NpbmcgQWx0K2Ugc2hvdyBlLCBpbnN0ZWFkIG9mIOKCrFxuICBzaG93U3ltYm9sOiB0cnVlLCAvLyBDb252ZXJ0IEFycm93TGVmdCBvbiAtPlxuICBhcHBlbmRNb2RpZmllcnM6IHtNZXRhOiB0cnVlLCBBbHQ6IHRydWUsIFNoaWZ0OiBmYWxzZX0sIC8vIEFwcGVuZCBtb2RpZmllciB0byBrZXkgYWxsIHRoZSB0aW1lXG4gIHBvc2l0aW9uOiAnYm90dG9tLWxlZnQnIC8vIGJvdHRvbS1sZWZ0LCBib3R0b20tcmlnaHQsIHRvcC1sZWZ0LCB0b3AtcmlnaHRcbn07XG5cbmNsYXNzIEtleXN0cm9rZVZpc3VhbGl6ZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMuc3R5bGUgPSBudWxsO1xuICAgIHRoaXMua2V5U3Ryb2tlVGltZW91dCA9IG51bGw7XG4gICAgdGhpcy5vcHRpb25zID0ge307XG4gICAgdGhpcy5jdXJyZW50Q2h1bmsgPSBudWxsO1xuICAgIHRoaXMua2V5ZG93biA9IHRoaXMua2V5ZG93bi5iaW5kKHRoaXMpO1xuICAgIHRoaXMua2V5dXAgPSB0aGlzLmtleXVwLmJpbmQodGhpcyk7XG4gIH1cblxuICBjbGVhblVwKCkge1xuICAgIGZ1bmN0aW9uIHJlbW92ZU5vZGUobm9kZSkge1xuICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgZGVidWdnZXI7XG4gICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlTm9kZSh0aGlzLmNvbnRhaW5lcik7XG4gICAgcmVtb3ZlTm9kZSh0aGlzLnN0eWxlKTtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5rZXlTdHJva2VUaW1lb3V0KTtcbiAgICB0aGlzLmN1cnJlbnRDaHVuayA9IG51bGw7XG4gICAgdGhpcy5jb250YWluZXIgPSB0aGlzLnN0eWxlID0gbnVsbDtcblxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5rZXlkb3duKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLmtleXVwKTtcbiAgfVxuXG4gIGluamVjdENvbXBvbmVudHMoKSB7ICAgIFxuICAgIC8vIEFkZCBjb250YWluZXJcbiAgICB0aGlzLmNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNvbnRhaW5lcik7XG4gICAgdGhpcy5jb250YWluZXIuY2xhc3NOYW1lID0gJ2tleXN0cm9rZXMnO1xuICAgIFxuICAgIGNvbnN0IHBvc2l0aW9ucyA9IHtcbiAgICAgICdib3R0b20tbGVmdCc6ICdib3R0b206IDA7IGxlZnQ6IDA7JyxcbiAgICAgICdib3R0b20tcmlnaHQnOiAnYm90dG9tOiAwOyByaWdodDogMDsnLFxuICAgICAgJ3RvcC1sZWZ0JzogJ3RvcDogMDsgbGVmdDogMDsnLFxuICAgICAgJ3RvcC1yaWdodCc6ICd0b3A6IDA7IHJpZ2h0OiAwOycsXG4gICAgfTtcblxuICAgIGlmICghcG9zaXRpb25zW3RoaXMub3B0aW9ucy5wb3NpdGlvbl0pIHtcbiAgICAgIGNvbnNvbGUud2FybihgSW52YWxpZCBwb3NpdGlvbiAnJHt0aGlzLm9wdGlvbnMucG9zaXRpb259JywgdXNpbmcgZGVmYXVsdCAnYm90dG9tLWxlZnQnLiBWYWxpZCBwb3NpdGlvbnM6IGAsIE9iamVjdC5rZXlzKHBvc2l0aW9ucykpO1xuICAgICAgdGhpcy5vcHRpb25zLnBvc2l0aW9uID0gJ2JvdHRvbS1sZWZ0JztcbiAgICB9XG5cbiAgICAvLyBBZGQgY2xhc3Nlc1xuICAgIHRoaXMuc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHRoaXMuc3R5bGUuaW5uZXJIVE1MID0gYFxuICAgICAgdWwua2V5c3Ryb2tlcyB7XG4gICAgICAgIHBhZGRpbmctbGVmdDogMTBweDtcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICAke3Bvc2l0aW9uc1t0aGlzLm9wdGlvbnMucG9zaXRpb25dfVxuICAgICAgfVxuICAgICAgXG4gICAgICB1bC5rZXlzdHJva2VzIGxpIHtcbiAgICAgICAgZm9udC1mYW1pbHk6IEFyaWFsO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke3RoaXMub3B0aW9ucy5iZXplbENvbG9yfTtcbiAgICAgICAgb3BhY2l0eTogMC45O1xuICAgICAgICBjb2xvcjogJHt0aGlzLm9wdGlvbnMudGV4dENvbG9yfTtcbiAgICAgICAgcGFkZGluZzogNXB4IDEwcHg7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDVweDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogMTBweDtcbiAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgZm9udC1zaXplOiAke3RoaXMub3B0aW9ucy5mb250U2l6ZX1weDtcbiAgICAgICAgZGlzcGxheTogdGFibGU7XG4gICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogb3BhY2l0eSAke3RoaXMub3B0aW9ucy5mYWRlRHVyYXRpb259bXMgbGluZWFyO1xuICAgICAgICB0cmFuc2l0aW9uOiBvcGFjaXR5ICR7dGhpcy5vcHRpb25zLmZhZGVEdXJhdGlvbn1tcyBsaW5lYXI7XG4gICAgICB9YDtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuc3R5bGUpO1xuICB9XG5cbiAgY29udmVydEtleVRvU3ltYm9sKGtleSkge1xuICAgIGNvbnN0IGNvbnZlcnNpb25Db21tb24gPSB7XG4gICAgICAnQXJyb3dSaWdodCc6ICfihpInLFxuICAgICAgJ0Fycm93TGVmdCc6ICfihpAnLFxuICAgICAgJ0Fycm93VXAnOiAn4oaRJyxcbiAgICAgICdBcnJvd0Rvd24nOiAn4oaTJyxcbiAgICAgICcgJzogJ+KQoycsXG4gICAgICAnRW50ZXInOiAn4oapJyxcbiAgICAgICdTaGlmdCc6ICfih6cnLFxuICAgICAgJ1NoaWZ0UmlnaHQnOiAn4oenJyxcbiAgICAgICdTaGlmdExlZnQnOiAn4oenJyxcbiAgICAgICdDb250cm9sJzogJ+KMgycsXG4gICAgICAnVGFiJzogJ+KGuScsXG4gICAgICAnQ2Fwc0xvY2snOiAn4oeqJ1xuICAgIH07XG5cbiAgICBjb25zdCBjb252ZXJzaW9uTWFjID0ge1xuICAgICAgJ0FsdCc6ICfijKUnLFxuICAgICAgJ0FsdExlZnQnOiAn4oylJyxcbiAgICAgICdBbHRSaWdodCc6ICfijKUnLFxuICAgICAgJ0RlbGV0ZSc6ICfijKYnLFxuICAgICAgJ0VzY2FwZSc6ICfijosnLFxuICAgICAgJ0JhY2tzcGFjZSc6ICfijKsnLFxuICAgICAgJ01ldGEnOiAn4oyYJyxcbiAgICAgICdUYWInOiAn4oelJyxcbiAgICAgICdQYWdlRG93bic6ICfih58nLFxuICAgICAgJ1BhZ2VVcCc6ICfih54nLFxuICAgICAgJ0hvbWUnOiAn4oaWJyxcbiAgICAgICdFbmQnOiAn4oaYJ1xuICAgIH07XG5cbiAgICByZXR1cm4gKG5hdmlnYXRvci5wbGF0Zm9ybSA9PT0gJ01hY0ludGVsJyA/IGNvbnZlcnNpb25NYWNba2V5XSA6IG51bGwgKSB8fCBjb252ZXJzaW9uQ29tbW9uW2tleV0gfHwga2V5O1xuICB9XG5cbiAga2V5ZG93bihlKSB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRDaHVuaykge1xuICAgICAgdGhpcy5jdXJyZW50Q2h1bmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50Q2h1bmspO1xuICAgIH1cbiAgICBcbiAgICB2YXIga2V5ID0gZS5rZXk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy51bm1vZGlmaWVkS2V5KSB7XG4gICAgICBpZiAoZS5jb2RlLmluZGV4T2YoJ0tleScpICE9PSAtMSkge1xuICAgICAgICBrZXkgPSBlLmNvZGUucmVwbGFjZSgnS2V5JywgJycpO1xuICAgICAgICBpZiAoIWUuc2hpZnRLZXkpIHtcbiAgICAgICAgICBrZXkgPSBrZXkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBtb2RpZmllciA9ICcnO1xuICAgIFxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kTW9kaWZpZXJzLk1ldGEgJiYgZS5tZXRhS2V5ICYmIGUua2V5ICE9PSAnTWV0YScpIHsgbW9kaWZpZXIgKz0gdGhpcy5jb252ZXJ0S2V5VG9TeW1ib2woJ01ldGEnKTsgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kTW9kaWZpZXJzLkFsdCAmJiBlLmFsdEtleSAmJiBlLmtleSAhPT0gJ0FsdCcpIHsgbW9kaWZpZXIgKz0gdGhpcy5jb252ZXJ0S2V5VG9TeW1ib2woJ0FsdCcpOyB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRNb2RpZmllcnMuU2hpZnQgJiYgZS5zaGlmdEtleSAmJiBlLmtleSAhPT0gJ1NoaWZ0JykgeyBtb2RpZmllciArPSB0aGlzLmNvbnZlcnRLZXlUb1N5bWJvbCgnU2hpZnQnKTsgfVxuICAgIHRoaXMuY3VycmVudENodW5rLnRleHRDb250ZW50ICs9IG1vZGlmaWVyICsgKHRoaXMub3B0aW9ucy5zaG93U3ltYm9sID8gdGhpcy5jb252ZXJ0S2V5VG9TeW1ib2woa2V5KSA6IGtleSk7XG4gIH1cblxuICBrZXl1cChlKSB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRDaHVuaykgcmV0dXJuO1xuICAgIFxuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMua2V5U3Ryb2tlVGltZW91dCk7XG4gICAgdGhpcy5rZXlTdHJva2VUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAoZnVuY3Rpb24ocHJldmlvdXNDaHVuaykge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBwcmV2aW91c0NodW5rLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge3ByZXZpb3VzQ2h1bmsucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwcmV2aW91c0NodW5rKX0sIG9wdGlvbnMuZmFkZUR1cmF0aW9uKTtcbiAgICAgICAgfSwgb3B0aW9ucy5saW5nZXJEZWxheSk7XG4gICAgICB9KSh0aGlzLmN1cnJlbnRDaHVuayk7XG4gICAgICBcbiAgICAgIHRoaXMuY3VycmVudENodW5rID0gbnVsbDtcbiAgICB9LCBvcHRpb25zLmtleVN0cm9rZURlbGF5KTtcbiAgfVxuXG4gIGVuYWJsZShvcHRpb25zKSB7XG4gICAgdGhpcy5jbGVhblVwKCk7ICAgIFxuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oIHt9LCBERUZBVUxUX09QVElPTlMsIG9wdGlvbnMgfHwgdGhpcy5vcHRpb25zKTtcbiAgICB0aGlzLmluamVjdENvbXBvbmVudHMoKTsgIFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5rZXlkb3duKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLmtleXVwKTtcbiAgfVxuXG4gIGRpc2FibGUoKSB7XG4gICAgdGhpcy5jbGVhblVwKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEtleXN0cm9rZVZpc3VhbGl6ZXIoKTsiXSwibmFtZXMiOlsiREVGQVVMVF9PUFRJT05TIiwiZm9udFNpemUiLCJrZXlTdHJva2VEZWxheSIsImxpbmdlckRlbGF5IiwiZmFkZUR1cmF0aW9uIiwiYmV6ZWxDb2xvciIsInRleHRDb2xvciIsInVubW9kaWZpZWRLZXkiLCJzaG93U3ltYm9sIiwiYXBwZW5kTW9kaWZpZXJzIiwiTWV0YSIsIkFsdCIsIlNoaWZ0IiwicG9zaXRpb24iLCJLZXlzdHJva2VWaXN1YWxpemVyIiwiY29uc3RydWN0b3IiLCJpbml0aWFsaXplZCIsImNvbnRhaW5lciIsInN0eWxlIiwia2V5U3Ryb2tlVGltZW91dCIsIm9wdGlvbnMiLCJjdXJyZW50Q2h1bmsiLCJrZXlkb3duIiwiYmluZCIsImtleXVwIiwiY2xlYW5VcCIsInJlbW92ZU5vZGUiLCJub2RlIiwicGFyZW50Tm9kZSIsInJlbW92ZUNoaWxkIiwiY2xlYXJUaW1lb3V0Iiwid2luZG93IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImluamVjdENvbXBvbmVudHMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJjbGFzc05hbWUiLCJwb3NpdGlvbnMiLCJjb25zb2xlIiwid2FybiIsIk9iamVjdCIsImtleXMiLCJpbm5lckhUTUwiLCJjb252ZXJ0S2V5VG9TeW1ib2wiLCJrZXkiLCJjb252ZXJzaW9uQ29tbW9uIiwiY29udmVyc2lvbk1hYyIsIm5hdmlnYXRvciIsInBsYXRmb3JtIiwiZSIsImNvZGUiLCJpbmRleE9mIiwicmVwbGFjZSIsInNoaWZ0S2V5IiwidG9Mb3dlckNhc2UiLCJtb2RpZmllciIsIm1ldGFLZXkiLCJhbHRLZXkiLCJ0ZXh0Q29udGVudCIsInNldFRpbWVvdXQiLCJwcmV2aW91c0NodW5rIiwib3BhY2l0eSIsImVuYWJsZSIsImFzc2lnbiIsImFkZEV2ZW50TGlzdGVuZXIi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
