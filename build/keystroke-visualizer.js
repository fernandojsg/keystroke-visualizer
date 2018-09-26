(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.KeystrokeVisualizer = factory());
}(this, (function () { 'use strict';

  function trimSpacesInEachElement(arr) {
    return arr.map(function(x) { return x.trim(); });
  }
  function removeEmptyElements(arr) {
    return arr.filter(function(x) { return x && x.length > 0; });
  }
  function isEnclosedInParens(str) {
    return str[0] == '(' && str[str.length-1] == ')';
  }
  function contains(str, substr) {
    return str.indexOf(substr) >= 0;
  }
  function containsAnyOf(str, substrList) {
    for(var i in substrList) if (contains(str, substrList[i])) return true;
    return false;
  }
  function splitUserAgent(str) {
    str = str.trim();
    var uaList = [];
    var tokens = '';
    var parensNesting = 0;
    for(var i = 0; i < str.length; ++i) {
      if (str[i] == ' ' && parensNesting == 0) {
        if (tokens.trim().length != 0) uaList.push(tokens.trim());
        tokens = '';
      } else if (str[i] == '(') ++parensNesting;
      else if (str[i] == ')') --parensNesting;
      tokens = tokens + str[i];
    }
    if (tokens.trim().length > 0) uaList.push(tokens.trim());
    for(var i = 1; i < uaList.length; ++i) {
      var l = uaList[i];
      if (isEnclosedInParens(l) && !contains(l, ';') && i > 1) {
        uaList[i-1] = uaList[i-1] + ' ' + l;
        uaList[i] = '';
      }
    }
    uaList = removeEmptyElements(uaList);
    for(var i = 0; i < uaList.length-1; ++i) {
      var l = uaList[i];
      var next = uaList[i+1];
      if (/^[a-zA-Z]+$/.test(l) && contains(next, '/')) {
        uaList[i+1] = l + ' ' + next;
        uaList[i] = '';
      }
    }
    uaList = removeEmptyElements(uaList);
    return uaList;
  }
  function splitPlatformInfo(uaList) {
    for(var i = 0; i < uaList.length; ++i) {
      var item = uaList[i];
      if (isEnclosedInParens(item)) {
        return removeEmptyElements(trimSpacesInEachElement(item.substr(1, item.length-2).split(';')));
      }
    }
  }
  function findOS(uaPlatformInfo) {
    var oses = ['Android', 'BSD', 'Linux', 'Windows', 'iPhone OS', 'Mac OS', 'BSD', 'CrOS', 'Darwin', 'Dragonfly', 'Fedora', 'Gentoo', 'Ubuntu', 'debian', 'HP-UX', 'IRIX', 'SunOS', 'Macintosh', 'Win 9x', 'Win98', 'Win95', 'WinNT'];
    for(var os in oses) {
      for(var i in uaPlatformInfo) {
        var item = uaPlatformInfo[i];
        if (contains(item, oses[os])) return item;
      }
    }
    return 'Other';
  }
  function parseProductComponents(uaList) {
    uaList = uaList.filter(function(x) { return contains(x, '/') && !isEnclosedInParens(x); });
    var productComponents = {};
    for(var i in uaList) {
      var x = uaList[i];
      if (contains(x, '/')) {
        x = x.split('/');
        if (x.length != 2) throw uaList[i];
        productComponents[x[0].trim()] = x[1].trim();
      } else {
        productComponents[x] = true;
      }
    }
    return productComponents;
  }
  function windowsDistributionName(winNTVersion) {
    var vers = {
      '5.0': '2000',
      '5.1': 'XP',
      '5.2': 'XP',
      '6.0': 'Vista',
      '6.1': '7',
      '6.2': '8',
      '6.3': '8.1',
      '10.0': '10'
    };
    if (!vers[winNTVersion]) return 'NT ' + winNTVersion;
    return vers[winNTVersion];
  }
  function deduceUserAgent(userAgent) {
    userAgent = userAgent || navigator.userAgent;
    var ua = {
      userAgent: userAgent,
      productComponents: {},
      platformInfo: []
    };
    try {
      var uaList = splitUserAgent(userAgent);
      var uaPlatformInfo = splitPlatformInfo(uaList);
      var productComponents = parseProductComponents(uaList);
      ua.productComponents = productComponents;
      ua.platformInfo = uaPlatformInfo;
      var ual = userAgent.toLowerCase();
      if (contains(ual, 'wow64')) {
        ua.bitness = '32-on-64';
        ua.arch = 'x86_64';
      } else if (containsAnyOf(ual, ['x86_64', 'amd64', 'ia64', 'win64', 'x64'])) {
        ua.bitness = 64;
        ua.arch = 'x86_64';
      } else if (contains(ual, 'ppc64')) {
        ua.bitness = 64;
        ua.arch = 'PPC';
      } else if (contains(ual, 'sparc64')) {
        ua.bitness = 64;
        ua.arch = 'SPARC';
      } else if (containsAnyOf(ual, ['i386', 'i486', 'i586', 'i686', 'x86'])) {
        ua.bitness = 32;
        ua.arch = 'x86';
      } else if (contains(ual, 'arm7') || contains(ual, 'android') || contains(ual, 'mobile')) {
        ua.bitness = 32;
        ua.arch = 'ARM';
      } else if (contains(ual, 'intel mac os')) {
        ua.bitness = 64;
        ua.arch = 'x86_64';
      } else {
        ua.bitness = 32;
      }
      var os = findOS(uaPlatformInfo);
      var m = os.match('(.*)\\s+Mac OS X\\s+(.*)');
      if (m) {
        ua.platform = 'Mac';
        ua.arch = m[1];
        ua.os = 'Mac OS';
        ua.osVersion = m[2].replace(/_/g, '.');
      }
      if (!m) {
        m = os.match('Android\\s+(.*)');
        if (m) {
          ua.platform = 'Android';
          ua.os = 'Android';
          ua.osVersion = m[1];
        }
      }
      if (!m) {
        m = os.match('Windows NT\\s+(.*)');
        if (m) {
          ua.platform = 'PC';
          ua.os = 'Windows';
          ua.osVersion = windowsDistributionName(m[1]);
          if (!ua.arch) ua.arch = 'x86';
        }
      }
      if (!m) {
        if (contains(uaPlatformInfo[0], 'iPhone') || contains(uaPlatformInfo[0], 'iPad') || contains(uaPlatformInfo[0], 'iPod') || contains(os, 'iPhone') || os.indexOf('CPU OS') == 0) {
          m = os.match('.*OS (.*) like Mac OS X');
          if (m) {
            ua.platform = uaPlatformInfo[0];
            ua.os = 'iOS';
            ua.osVersion = m[1].replace(/_/g, '.');
            ua.bitness = parseInt(ua.osVersion) >= 7 ? 64 : 32;
          }
        }
      }
      if (!m) {
        m = contains(os, 'BSD') || contains(os, 'Linux');
        if (m) {
          ua.platform = 'PC';
          ua.os = os.split(' ')[0];
          if (!ua.arch) ua.arch = 'x86';
        }
      }
      if (!m) {
        ua.os = os;
      }
      var browsers = [['SamsungBrowser', 'Samsung'], ['Edge', 'Microsoft'], ['OPR', 'Opera'], ['Chrome', 'Google'], ['Safari', 'Apple'], ['Firefox', 'Mozilla']];
      for(var i in browsers) {
        var b = browsers[i][0];
        if (productComponents[b]) {
          ua.browserVendor = browsers[i][1];
          ua.browserProduct = browsers[i][0];
          if (ua.browserProduct == 'OPR') ua.browserProduct = 'Opera';
          if (ua.browserProduct == 'Trident') ua.browserProduct = 'Internet Explorer';
          ua.browserVersion = productComponents[b];
          break;
        }
      }
      if (!ua.browserProduct) {
        var matchIE = userAgent.match(/MSIE\s([\d.]+)/);
        if (matchIE) {
          ua.browserVendor = 'Microsoft';
          ua.browserProduct = 'Internet Explorer';
          ua.browserVersion = matchIE[1];
        } else if (contains(uaPlatformInfo, 'Trident/7.0')) {
          ua.browserVendor = 'Microsoft';
          ua.browserProduct = 'Internet Explorer';
          ua.browserVersion =  userAgent.match(/rv:([\d.]+)/)[1];
        }
      }
      for(var i = 0; i < uaPlatformInfo.length; ++i) {
        var item = uaPlatformInfo[i];
        var iteml = item.toLowerCase();
        if (contains(iteml, 'nexus') || contains(iteml, 'samsung')) {
          ua.platform = item;
          ua.arch = 'ARM';
          break;
        }
      }
      if (contains(ual, 'tablet') || contains(ual, 'ipad')) ua.formFactor = 'Tablet';
      else if (contains(ual, 'mobile') || contains(ual, 'iphone') || contains(ual, 'ipod')) ua.formFactor = 'Mobile';
      else if (contains(ual, 'smart tv') || contains(ual, 'smart-tv')) ua.formFactor = 'TV';
      else ua.formFactor = 'Desktop';
    } catch(e) {
      ua.internalError = 'Failed to parse user agent string: ' + e.toString();
    }
    return ua;
  }

  const DEFAULT_OPTIONS = {
    fontSize: 16,
    keyStrokeDelay: 200,
    lingerDelay: 1000,
    fadeDuration: 1000,
    bezelColor: '#000',
    textColor: '#fff',
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
        'top-right': 'top: 0; right: 0;',
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
    keydown(e) {
      if (!this.currentChunk) {
        this.currentChunk = document.createElement('li');
        this.container.appendChild(this.currentChunk);
      }
      var mac = deduceUserAgent().platform === 'Mac';
      function convert(key) {
        const conversionCommon = {
          'ArrowRight': '→',
          'ArrowLeft': '←',
          'ArrowUp': '↑',
          'ArrowDown': '↓',
          ' ': '␣',
          'Enter': '↩',
          'Shift': '⇧',
          'Control': '⌃',
          'Tab': '↹',
          'CapsLock': '⇪'
        };
        const conversionMac = {
          'Alt': '⌥',
          'Backspace': '⌫',
          'Meta': '⌘',
          'Tab': '⇥',
          'PageDown': '⇟',
          'PageUp': '⇞',
          'Home': '↖',
          'End': '↘'
        };
        return (mac ? conversionMac[key] : null ) || conversionCommon[key] || key;
      }
      this.currentChunk.textContent += convert(e.key);
    }
    keyup(e) {
      if (!this.currentChunk) return;
      var options = this.options;
      clearTimeout(this.keyStrokeTimeout);
      this.keyStrokeTimeout = setTimeout(() => {
        (function(previousChunk) {
          setTimeout(() => {
            previousChunk.style.opacity = 0;
            setTimeout(() => {previousChunk.parentNode.removeChild(previousChunk);}, options.fadeDuration);
          }, options.lingerDelay);
        })(this.currentChunk);
        this.currentChunk = null;
      }, options.keyStrokeDelay);
    }
    enable(options) {
      this.cleanUp();
      this.options = Object.assign( {}, DEFAULT_OPTIONS, options || this.options);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5c3Ryb2tlLXZpc3VhbGl6ZXIuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy91c2VyYWdlbnQtaW5mby9pbmRleC5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUcmltcyB3aGl0ZXNwYWNlIGluIGVhY2ggc3RyaW5nIGZyb20gYW4gYXJyYXkgb2Ygc3RyaW5nc1xuZnVuY3Rpb24gdHJpbVNwYWNlc0luRWFjaEVsZW1lbnQoYXJyKSB7XG4gIHJldHVybiBhcnIubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHgudHJpbSgpOyB9KTtcbn1cblxuLy8gUmV0dXJucyBhIGNvcHkgb2YgdGhlIGdpdmVuIGFycmF5IHdpdGggZW1wdHkvdW5kZWZpbmVkIHN0cmluZyBlbGVtZW50cyByZW1vdmVkIGluIGJldHdlZW5cbmZ1bmN0aW9uIHJlbW92ZUVtcHR5RWxlbWVudHMoYXJyKSB7XG4gIHJldHVybiBhcnIuZmlsdGVyKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHggJiYgeC5sZW5ndGggPiAwOyB9KTtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBzdHJpbmcgaXMgZW5jbG9zZWQgaW4gcGFyZW50aGVzZXMsIGUuZy4gaXMgb2YgZm9ybSBcIihzb21ldGhpbmcpXCJcbmZ1bmN0aW9uIGlzRW5jbG9zZWRJblBhcmVucyhzdHIpIHtcbiAgcmV0dXJuIHN0clswXSA9PSAnKCcgJiYgc3RyW3N0ci5sZW5ndGgtMV0gPT0gJyknO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHN1YnN0cmluZyBpcyBjb250YWluZWQgaW4gdGhlIHN0cmluZyAoY2FzZSBzZW5zaXRpdmUpXG5mdW5jdGlvbiBjb250YWlucyhzdHIsIHN1YnN0cikge1xuICByZXR1cm4gc3RyLmluZGV4T2Yoc3Vic3RyKSA+PSAwO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIGFueSBvZiB0aGUgZ2l2ZW4gc3Vic3RyaW5ncyBpbiB0aGUgbGlzdCBpcyBjb250YWluZWQgaW4gdGhlIGZpcnN0IHBhcmFtZXRlciBzdHJpbmcgKGNhc2Ugc2Vuc2l0aXZlKVxuZnVuY3Rpb24gY29udGFpbnNBbnlPZihzdHIsIHN1YnN0ckxpc3QpIHtcbiAgZm9yKHZhciBpIGluIHN1YnN0ckxpc3QpIGlmIChjb250YWlucyhzdHIsIHN1YnN0ckxpc3RbaV0pKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbi8vIFNwbGl0cyBhbiB1c2VyIGFnZW50IHN0cmluZyBsb2dpY2FsbHkgaW50byBhbiBhcnJheSBvZiB0b2tlbnMsIGUuZy5cbi8vICdNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wLjE7IE5leHVzIDUgQnVpbGQvTU9CMzBNKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNTEuMC4yNzA0LjgxIE1vYmlsZSBTYWZhcmkvNTM3LjM2J1xuLy8gLT4gWydNb3ppbGxhLzUuMCcsICcoTGludXg7IEFuZHJvaWQgNi4wLjE7IE5leHVzIDUgQnVpbGQvTU9CMzBNKScsICdBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKScsICdDaHJvbWUvNTEuMC4yNzA0LjgxJywgJ01vYmlsZSBTYWZhcmkvNTM3LjM2J11cbmZ1bmN0aW9uIHNwbGl0VXNlckFnZW50KHN0cikge1xuICBzdHIgPSBzdHIudHJpbSgpO1xuICB2YXIgdWFMaXN0ID0gW107XG4gIHZhciB0b2tlbnMgPSAnJztcbiAgLy8gU3BsaXQgYnkgc3BhY2VzLCB3aGlsZSBrZWVwaW5nIHRvcCBsZXZlbCBwYXJlbnRoZXNlcyBpbnRhY3QsIHNvXG4gIC8vIFwiTW96aWxsYS81LjAgKExpbnV4OyBBbmRyb2lkIDYuMC4xKSBNb2JpbGUgU2FmYXJpLzUzNy4zNlwiIGJlY29tZXNcbiAgLy8gWydNb3ppbGxhLzUuMCcsICcoTGludXg7IEFuZHJvaWQgNi4wLjEpJywgJ01vYmlsZScsICdTYWZhcmkvNTM3LjM2J11cbiAgdmFyIHBhcmVuc05lc3RpbmcgPSAwO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKHN0cltpXSA9PSAnICcgJiYgcGFyZW5zTmVzdGluZyA9PSAwKSB7XG4gICAgICBpZiAodG9rZW5zLnRyaW0oKS5sZW5ndGggIT0gMCkgdWFMaXN0LnB1c2godG9rZW5zLnRyaW0oKSk7XG4gICAgICB0b2tlbnMgPSAnJztcbiAgICB9IGVsc2UgaWYgKHN0cltpXSA9PSAnKCcpICsrcGFyZW5zTmVzdGluZztcbiAgICBlbHNlIGlmIChzdHJbaV0gPT0gJyknKSAtLXBhcmVuc05lc3Rpbmc7XG4gICAgdG9rZW5zID0gdG9rZW5zICsgc3RyW2ldO1xuICB9XG4gIGlmICh0b2tlbnMudHJpbSgpLmxlbmd0aCA+IDApIHVhTGlzdC5wdXNoKHRva2Vucy50cmltKCkpO1xuXG4gIC8vIFdoYXQgZm9sbG93cyBpcyBhIG51bWJlciBvZiBoZXVyaXN0aWMgYWRhcHRhdGlvbnMgdG8gYWNjb3VudCBmb3IgVUEgc3RyaW5ncyBtZXQgaW4gdGhlIHdpbGQ6XG5cbiAgLy8gRnVzZSBbJ2EvdmVyJywgJyhzb21laW5mbyknXSB0b2dldGhlci4gRm9yIGV4YW1wbGU6XG4gIC8vICdNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wLjE7IE5leHVzIDUgQnVpbGQvTU9CMzBNKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNTEuMC4yNzA0LjgxIE1vYmlsZSBTYWZhcmkvNTM3LjM2J1xuICAvLyAtPiBmdXNlICdBcHBsZVdlYktpdC81MzcuMzYnIGFuZCAnKEtIVE1MLCBsaWtlIEdlY2tvKScgdG9nZXRoZXJcbiAgZm9yKHZhciBpID0gMTsgaSA8IHVhTGlzdC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBsID0gdWFMaXN0W2ldO1xuICAgIGlmIChpc0VuY2xvc2VkSW5QYXJlbnMobCkgJiYgIWNvbnRhaW5zKGwsICc7JykgJiYgaSA+IDEpIHtcbiAgICAgIHVhTGlzdFtpLTFdID0gdWFMaXN0W2ktMV0gKyAnICcgKyBsO1xuICAgICAgdWFMaXN0W2ldID0gJyc7XG4gICAgfVxuICB9XG4gIHVhTGlzdCA9IHJlbW92ZUVtcHR5RWxlbWVudHModWFMaXN0KTtcblxuICAvLyBGdXNlIFsnZm9vJywgJ2Jhci92ZXInXSB0b2dldGhlciwgaWYgJ2ZvbycgaGFzIG9ubHkgYXNjaWkgY2hhcnMuIEZvciBleGFtcGxlOlxuICAvLyAnTW96aWxsYS81LjAgKExpbnV4OyBBbmRyb2lkIDYuMC4xOyBOZXh1cyA1IEJ1aWxkL01PQjMwTSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzUxLjAuMjcwNC44MSBNb2JpbGUgU2FmYXJpLzUzNy4zNidcbiAgLy8gLT4gZnVzZSBbJ01vYmlsZScsICdTYWZhcmkvNTM3LjM2J10gdG9nZXRoZXJcbiAgZm9yKHZhciBpID0gMDsgaSA8IHVhTGlzdC5sZW5ndGgtMTsgKytpKSB7XG4gICAgdmFyIGwgPSB1YUxpc3RbaV07XG4gICAgdmFyIG5leHQgPSB1YUxpc3RbaSsxXTtcbiAgICBpZiAoL15bYS16QS1aXSskLy50ZXN0KGwpICYmIGNvbnRhaW5zKG5leHQsICcvJykpIHtcbiAgICAgIHVhTGlzdFtpKzFdID0gbCArICcgJyArIG5leHQ7XG4gICAgICB1YUxpc3RbaV0gPSAnJztcbiAgICB9XG4gIH1cbiAgdWFMaXN0ID0gcmVtb3ZlRW1wdHlFbGVtZW50cyh1YUxpc3QpO1xuICByZXR1cm4gdWFMaXN0O1xufVxuXG4vLyBGaW5kcyB0aGUgc3BlY2lhbCB0b2tlbiBpbiB0aGUgdXNlciBhZ2VudCB0b2tlbiBsaXN0IHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHBsYXRmb3JtIGluZm8uXG4vLyBUaGlzIGlzIHRoZSBmaXJzdCBlbGVtZW50IGNvbnRhaW5lZCBpbiBwYXJlbnRoZXNlcyB0aGF0IGhhcyBzZW1pY29sb24gZGVsaW1pdGVkIGVsZW1lbnRzLlxuLy8gUmV0dXJucyB0aGUgcGxhdGZvcm0gaW5mbyBhcyBhbiBhcnJheSBzcGxpdCBieSB0aGUgc2VtaWNvbG9ucy5cbmZ1bmN0aW9uIHNwbGl0UGxhdGZvcm1JbmZvKHVhTGlzdCkge1xuICBmb3IodmFyIGkgPSAwOyBpIDwgdWFMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGl0ZW0gPSB1YUxpc3RbaV07XG4gICAgaWYgKGlzRW5jbG9zZWRJblBhcmVucyhpdGVtKSkge1xuICAgICAgcmV0dXJuIHJlbW92ZUVtcHR5RWxlbWVudHModHJpbVNwYWNlc0luRWFjaEVsZW1lbnQoaXRlbS5zdWJzdHIoMSwgaXRlbS5sZW5ndGgtMikuc3BsaXQoJzsnKSkpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBEZWR1Y2VzIHRoZSBvcGVyYXRpbmcgc3lzdGVtIGZyb20gdGhlIHVzZXIgYWdlbnQgcGxhdGZvcm0gaW5mbyB0b2tlbiBsaXN0LlxuZnVuY3Rpb24gZmluZE9TKHVhUGxhdGZvcm1JbmZvKSB7XG4gIHZhciBvc2VzID0gWydBbmRyb2lkJywgJ0JTRCcsICdMaW51eCcsICdXaW5kb3dzJywgJ2lQaG9uZSBPUycsICdNYWMgT1MnLCAnQlNEJywgJ0NyT1MnLCAnRGFyd2luJywgJ0RyYWdvbmZseScsICdGZWRvcmEnLCAnR2VudG9vJywgJ1VidW50dScsICdkZWJpYW4nLCAnSFAtVVgnLCAnSVJJWCcsICdTdW5PUycsICdNYWNpbnRvc2gnLCAnV2luIDl4JywgJ1dpbjk4JywgJ1dpbjk1JywgJ1dpbk5UJ107XG4gIGZvcih2YXIgb3MgaW4gb3Nlcykge1xuICAgIGZvcih2YXIgaSBpbiB1YVBsYXRmb3JtSW5mbykge1xuICAgICAgdmFyIGl0ZW0gPSB1YVBsYXRmb3JtSW5mb1tpXTtcbiAgICAgIGlmIChjb250YWlucyhpdGVtLCBvc2VzW29zXSkpIHJldHVybiBpdGVtO1xuICAgIH1cbiAgfVxuICByZXR1cm4gJ090aGVyJztcbn1cblxuLy8gRmlsdGVycyB0aGUgcHJvZHVjdCBjb21wb25lbnRzIChpdGVtcyBvZiBmb3JtYXQgJ2Zvby92ZXJzaW9uJykgZnJvbSB0aGUgdXNlciBhZ2VudCB0b2tlbiBsaXN0LlxuZnVuY3Rpb24gcGFyc2VQcm9kdWN0Q29tcG9uZW50cyh1YUxpc3QpIHtcbiAgdWFMaXN0ID0gdWFMaXN0LmZpbHRlcihmdW5jdGlvbih4KSB7IHJldHVybiBjb250YWlucyh4LCAnLycpICYmICFpc0VuY2xvc2VkSW5QYXJlbnMoeCk7IH0pO1xuICB2YXIgcHJvZHVjdENvbXBvbmVudHMgPSB7fTtcbiAgZm9yKHZhciBpIGluIHVhTGlzdCkge1xuICAgIHZhciB4ID0gdWFMaXN0W2ldO1xuICAgIGlmIChjb250YWlucyh4LCAnLycpKSB7XG4gICAgICB4ID0geC5zcGxpdCgnLycpO1xuICAgICAgaWYgKHgubGVuZ3RoICE9IDIpIHRocm93IHVhTGlzdFtpXTtcbiAgICAgIHByb2R1Y3RDb21wb25lbnRzW3hbMF0udHJpbSgpXSA9IHhbMV0udHJpbSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9kdWN0Q29tcG9uZW50c1t4XSA9IHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBwcm9kdWN0Q29tcG9uZW50cztcbn1cblxuLy8gTWFwcyBXaW5kb3dzIE5UIHZlcnNpb24gdG8gaHVtYW4tcmVhZGFibGUgV2luZG93cyBQcm9kdWN0IHZlcnNpb25cbmZ1bmN0aW9uIHdpbmRvd3NEaXN0cmlidXRpb25OYW1lKHdpbk5UVmVyc2lvbikge1xuICB2YXIgdmVycyA9IHtcbiAgICAnNS4wJzogJzIwMDAnLFxuICAgICc1LjEnOiAnWFAnLFxuICAgICc1LjInOiAnWFAnLFxuICAgICc2LjAnOiAnVmlzdGEnLFxuICAgICc2LjEnOiAnNycsXG4gICAgJzYuMic6ICc4JyxcbiAgICAnNi4zJzogJzguMScsXG4gICAgJzEwLjAnOiAnMTAnXG4gIH1cbiAgaWYgKCF2ZXJzW3dpbk5UVmVyc2lvbl0pIHJldHVybiAnTlQgJyArIHdpbk5UVmVyc2lvbjtcbiAgcmV0dXJuIHZlcnNbd2luTlRWZXJzaW9uXTtcbn1cblxuLy8gVGhlIGZ1bGwgZnVuY3Rpb24gdG8gZGVjb21wb3NlIGEgZ2l2ZW4gdXNlciBhZ2VudCB0byB0aGUgaW50ZXJlc3RpbmcgbG9naWNhbCBpbmZvIGJpdHMuXG4vLyBcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlZHVjZVVzZXJBZ2VudCh1c2VyQWdlbnQpIHtcbiAgdXNlckFnZW50ID0gdXNlckFnZW50IHx8IG5hdmlnYXRvci51c2VyQWdlbnQ7XG4gIHZhciB1YSA9IHtcbiAgICB1c2VyQWdlbnQ6IHVzZXJBZ2VudCxcbiAgICBwcm9kdWN0Q29tcG9uZW50czoge30sXG4gICAgcGxhdGZvcm1JbmZvOiBbXVxuICB9O1xuXG4gIHRyeSB7XG4gICAgdmFyIHVhTGlzdCA9IHNwbGl0VXNlckFnZW50KHVzZXJBZ2VudCk7XG4gICAgdmFyIHVhUGxhdGZvcm1JbmZvID0gc3BsaXRQbGF0Zm9ybUluZm8odWFMaXN0KTtcbiAgICB2YXIgcHJvZHVjdENvbXBvbmVudHMgPSBwYXJzZVByb2R1Y3RDb21wb25lbnRzKHVhTGlzdCk7XG4gICAgdWEucHJvZHVjdENvbXBvbmVudHMgPSBwcm9kdWN0Q29tcG9uZW50cztcbiAgICB1YS5wbGF0Zm9ybUluZm8gPSB1YVBsYXRmb3JtSW5mbztcbiAgICB2YXIgdWFsID0gdXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyBEZWR1Y2UgYXJjaCBhbmQgYml0bmVzc1xuICAgIHZhciBiMzJPbjY0ID0gWyd3b3c2NCddO1xuICAgIGlmIChjb250YWlucyh1YWwsICd3b3c2NCcpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gJzMyLW9uLTY0JztcbiAgICAgIHVhLmFyY2ggPSAneDg2XzY0JztcbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zQW55T2YodWFsLCBbJ3g4Nl82NCcsICdhbWQ2NCcsICdpYTY0JywgJ3dpbjY0JywgJ3g2NCddKSkge1xuICAgICAgdWEuYml0bmVzcyA9IDY0O1xuICAgICAgdWEuYXJjaCA9ICd4ODZfNjQnO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbnModWFsLCAncHBjNjQnKSkge1xuICAgICAgdWEuYml0bmVzcyA9IDY0O1xuICAgICAgdWEuYXJjaCA9ICdQUEMnO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbnModWFsLCAnc3BhcmM2NCcpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gNjQ7XG4gICAgICB1YS5hcmNoID0gJ1NQQVJDJztcbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zQW55T2YodWFsLCBbJ2kzODYnLCAnaTQ4NicsICdpNTg2JywgJ2k2ODYnLCAneDg2J10pKSB7XG4gICAgICB1YS5iaXRuZXNzID0gMzI7XG4gICAgICB1YS5hcmNoID0gJ3g4Nic7XG4gICAgfSBlbHNlIGlmIChjb250YWlucyh1YWwsICdhcm03JykgfHwgY29udGFpbnModWFsLCAnYW5kcm9pZCcpIHx8IGNvbnRhaW5zKHVhbCwgJ21vYmlsZScpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gMzI7XG4gICAgICB1YS5hcmNoID0gJ0FSTSc7XG4gICAgLy8gSGV1cmlzdGljOiBBc3N1bWUgYWxsIE9TIFggYXJlIDY0LWJpdCwgYWx0aG91Z2ggdGhpcyBpcyBub3QgY2VydGFpbi4gT24gT1MgWCwgNjQtYml0IGJyb3dzZXJzXG4gICAgLy8gZG9uJ3QgYWR2ZXJ0aXNlIGJlaW5nIDY0LWJpdC5cbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zKHVhbCwgJ2ludGVsIG1hYyBvcycpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gNjQ7XG4gICAgICB1YS5hcmNoID0gJ3g4Nl82NCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVhLmJpdG5lc3MgPSAzMjtcbiAgICB9XG5cbiAgICAvLyBEZWR1Y2Ugb3BlcmF0aW5nIHN5c3RlbVxuICAgIHZhciBvcyA9IGZpbmRPUyh1YVBsYXRmb3JtSW5mbyk7XG4gICAgdmFyIG0gPSBvcy5tYXRjaCgnKC4qKVxcXFxzK01hYyBPUyBYXFxcXHMrKC4qKScpO1xuICAgIGlmIChtKSB7XG4gICAgICB1YS5wbGF0Zm9ybSA9ICdNYWMnO1xuICAgICAgdWEuYXJjaCA9IG1bMV07XG4gICAgICB1YS5vcyA9ICdNYWMgT1MnO1xuICAgICAgdWEub3NWZXJzaW9uID0gbVsyXS5yZXBsYWNlKC9fL2csICcuJyk7XG4gICAgfVxuICAgIGlmICghbSkge1xuICAgICAgbSA9IG9zLm1hdGNoKCdBbmRyb2lkXFxcXHMrKC4qKScpO1xuICAgICAgaWYgKG0pIHtcbiAgICAgICAgdWEucGxhdGZvcm0gPSAnQW5kcm9pZCc7XG4gICAgICAgIHVhLm9zID0gJ0FuZHJvaWQnO1xuICAgICAgICB1YS5vc1ZlcnNpb24gPSBtWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW0pIHtcbiAgICAgIG0gPSBvcy5tYXRjaCgnV2luZG93cyBOVFxcXFxzKyguKiknKTtcbiAgICAgIGlmIChtKSB7XG4gICAgICAgIHVhLnBsYXRmb3JtID0gJ1BDJztcbiAgICAgICAgdWEub3MgPSAnV2luZG93cyc7XG4gICAgICAgIHVhLm9zVmVyc2lvbiA9IHdpbmRvd3NEaXN0cmlidXRpb25OYW1lKG1bMV0pO1xuICAgICAgICBpZiAoIXVhLmFyY2gpIHVhLmFyY2ggPSAneDg2JztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFtKSB7XG4gICAgICBpZiAoY29udGFpbnModWFQbGF0Zm9ybUluZm9bMF0sICdpUGhvbmUnKSB8fCBjb250YWlucyh1YVBsYXRmb3JtSW5mb1swXSwgJ2lQYWQnKSB8fCBjb250YWlucyh1YVBsYXRmb3JtSW5mb1swXSwgJ2lQb2QnKSB8fCBjb250YWlucyhvcywgJ2lQaG9uZScpIHx8IG9zLmluZGV4T2YoJ0NQVSBPUycpID09IDApIHtcbiAgICAgICAgbSA9IG9zLm1hdGNoKCcuKk9TICguKikgbGlrZSBNYWMgT1MgWCcpO1xuICAgICAgICBpZiAobSkge1xuICAgICAgICAgIHVhLnBsYXRmb3JtID0gdWFQbGF0Zm9ybUluZm9bMF07XG4gICAgICAgICAgdWEub3MgPSAnaU9TJztcbiAgICAgICAgICB1YS5vc1ZlcnNpb24gPSBtWzFdLnJlcGxhY2UoL18vZywgJy4nKTtcbiAgICAgICAgICB1YS5iaXRuZXNzID0gcGFyc2VJbnQodWEub3NWZXJzaW9uKSA+PSA3ID8gNjQgOiAzMjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gIFxuICAgIGlmICghbSkge1xuICAgICAgbSA9IGNvbnRhaW5zKG9zLCAnQlNEJykgfHwgY29udGFpbnMob3MsICdMaW51eCcpO1xuICAgICAgaWYgKG0pIHtcbiAgICAgICAgdWEucGxhdGZvcm0gPSAnUEMnO1xuICAgICAgICB1YS5vcyA9IG9zLnNwbGl0KCcgJylbMF07XG4gICAgICAgIGlmICghdWEuYXJjaCkgdWEuYXJjaCA9ICd4ODYnO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW0pIHtcbiAgICAgIHVhLm9zID0gb3M7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmluZFByb2R1Y3QocHJvZHVjdENvbXBvbmVudHMsIHByb2R1Y3QpIHtcbiAgICAgIGZvcih2YXIgaSBpbiBwcm9kdWN0Q29tcG9uZW50cykge1xuICAgICAgICBpZiAocHJvZHVjdENvbXBvbmVudHNbaV0gPT0gcHJvZHVjdCkgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgLy8gRGVkdWNlIGh1bWFuLXJlYWRhYmxlIGJyb3dzZXIgdmVuZG9yLCBwcm9kdWN0IGFuZCB2ZXJzaW9uIG5hbWVzXG4gICAgdmFyIGJyb3dzZXJzID0gW1snU2Ftc3VuZ0Jyb3dzZXInLCAnU2Ftc3VuZyddLCBbJ0VkZ2UnLCAnTWljcm9zb2Z0J10sIFsnT1BSJywgJ09wZXJhJ10sIFsnQ2hyb21lJywgJ0dvb2dsZSddLCBbJ1NhZmFyaScsICdBcHBsZSddLCBbJ0ZpcmVmb3gnLCAnTW96aWxsYSddXTtcbiAgICBmb3IodmFyIGkgaW4gYnJvd3NlcnMpIHtcbiAgICAgIHZhciBiID0gYnJvd3NlcnNbaV1bMF07XG4gICAgICBpZiAocHJvZHVjdENvbXBvbmVudHNbYl0pIHtcbiAgICAgICAgdWEuYnJvd3NlclZlbmRvciA9IGJyb3dzZXJzW2ldWzFdO1xuICAgICAgICB1YS5icm93c2VyUHJvZHVjdCA9IGJyb3dzZXJzW2ldWzBdO1xuICAgICAgICBpZiAodWEuYnJvd3NlclByb2R1Y3QgPT0gJ09QUicpIHVhLmJyb3dzZXJQcm9kdWN0ID0gJ09wZXJhJztcbiAgICAgICAgaWYgKHVhLmJyb3dzZXJQcm9kdWN0ID09ICdUcmlkZW50JykgdWEuYnJvd3NlclByb2R1Y3QgPSAnSW50ZXJuZXQgRXhwbG9yZXInO1xuICAgICAgICB1YS5icm93c2VyVmVyc2lvbiA9IHByb2R1Y3RDb21wb25lbnRzW2JdO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRGV0ZWN0IElFc1xuICAgIGlmICghdWEuYnJvd3NlclByb2R1Y3QpIHtcbiAgICAgIHZhciBtYXRjaElFID0gdXNlckFnZW50Lm1hdGNoKC9NU0lFXFxzKFtcXGQuXSspLyk7XG4gICAgICBpZiAobWF0Y2hJRSkge1xuICAgICAgICB1YS5icm93c2VyVmVuZG9yID0gJ01pY3Jvc29mdCc7XG4gICAgICAgIHVhLmJyb3dzZXJQcm9kdWN0ID0gJ0ludGVybmV0IEV4cGxvcmVyJztcbiAgICAgICAgdWEuYnJvd3NlclZlcnNpb24gPSBtYXRjaElFWzFdO1xuICAgICAgfSBlbHNlIGlmIChjb250YWlucyh1YVBsYXRmb3JtSW5mbywgJ1RyaWRlbnQvNy4wJykpIHtcbiAgICAgICAgdWEuYnJvd3NlclZlbmRvciA9ICdNaWNyb3NvZnQnO1xuICAgICAgICB1YS5icm93c2VyUHJvZHVjdCA9ICdJbnRlcm5ldCBFeHBsb3Jlcic7XG4gICAgICAgIHVhLmJyb3dzZXJWZXJzaW9uID0gIHVzZXJBZ2VudC5tYXRjaCgvcnY6KFtcXGQuXSspLylbMV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVkdWNlIG1vYmlsZSBwbGF0Zm9ybSwgaWYgcHJlc2VudFxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB1YVBsYXRmb3JtSW5mby5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGl0ZW0gPSB1YVBsYXRmb3JtSW5mb1tpXTtcbiAgICAgIHZhciBpdGVtbCA9IGl0ZW0udG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChjb250YWlucyhpdGVtbCwgJ25leHVzJykgfHwgY29udGFpbnMoaXRlbWwsICdzYW1zdW5nJykpIHtcbiAgICAgICAgdWEucGxhdGZvcm0gPSBpdGVtO1xuICAgICAgICB1YS5hcmNoID0gJ0FSTSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZHVjZSBmb3JtIGZhY3RvclxuICAgIGlmIChjb250YWlucyh1YWwsICd0YWJsZXQnKSB8fCBjb250YWlucyh1YWwsICdpcGFkJykpIHVhLmZvcm1GYWN0b3IgPSAnVGFibGV0JztcbiAgICBlbHNlIGlmIChjb250YWlucyh1YWwsICdtb2JpbGUnKSB8fCBjb250YWlucyh1YWwsICdpcGhvbmUnKSB8fCBjb250YWlucyh1YWwsICdpcG9kJykpIHVhLmZvcm1GYWN0b3IgPSAnTW9iaWxlJztcbiAgICBlbHNlIGlmIChjb250YWlucyh1YWwsICdzbWFydCB0dicpIHx8IGNvbnRhaW5zKHVhbCwgJ3NtYXJ0LXR2JykpIHVhLmZvcm1GYWN0b3IgPSAnVFYnO1xuICAgIGVsc2UgdWEuZm9ybUZhY3RvciA9ICdEZXNrdG9wJztcbiAgfSBjYXRjaChlKSB7XG4gICAgdWEuaW50ZXJuYWxFcnJvciA9ICdGYWlsZWQgdG8gcGFyc2UgdXNlciBhZ2VudCBzdHJpbmc6ICcgKyBlLnRvU3RyaW5nKCk7XG4gIH1cblxuICByZXR1cm4gdWE7XG59XG4iLCJpbXBvcnQgdXNlcmFnZW50SW5mbyBmcm9tICd1c2VyYWdlbnQtaW5mbyc7XG5cbmNvbnN0IERFRkFVTFRfT1BUSU9OUyA9IHtcbiAgZm9udFNpemU6IDE2LFxuICBrZXlTdHJva2VEZWxheTogMjAwLCAvLyBUaW1lIGJlZm9yZSB0aGUgbGluZSBicmVha3NcbiAgbGluZ2VyRGVsYXk6IDEwMDAsIC8vIFRpbWUgYmVmb3JlIHRoZSB0ZXh0IGZhZGVzIGF3YXlcbiAgZmFkZUR1cmF0aW9uOiAxMDAwLFxuICBiZXplbENvbG9yOiAnIzAwMCcsXG4gIHRleHRDb2xvcjogJyNmZmYnLFxuICBwb3NpdGlvbjogJ2JvdHRvbS1sZWZ0JyAvLyBib3R0b20tbGVmdCwgYm90dG9tLXJpZ2h0LCB0b3AtbGVmdCwgdG9wLXJpZ2h0XG59O1xuXG5jbGFzcyBLZXlzdHJva2VWaXN1YWxpemVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgICB0aGlzLnN0eWxlID0gbnVsbDtcbiAgICB0aGlzLmtleVN0cm9rZVRpbWVvdXQgPSBudWxsO1xuICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICAgIHRoaXMuY3VycmVudENodW5rID0gbnVsbDtcbiAgICB0aGlzLmtleWRvd24gPSB0aGlzLmtleWRvd24uYmluZCh0aGlzKTtcbiAgICB0aGlzLmtleXVwID0gdGhpcy5rZXl1cC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY2xlYW5VcCgpIHtcbiAgICBmdW5jdGlvbiByZW1vdmVOb2RlKG5vZGUpIHtcbiAgICAgIGlmIChub2RlKSB7XG4gICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlbW92ZU5vZGUodGhpcy5jb250YWluZXIpO1xuICAgIHJlbW92ZU5vZGUodGhpcy5zdHlsZSk7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMua2V5U3Ryb2tlVGltZW91dCk7XG4gICAgdGhpcy5jdXJyZW50Q2h1bmsgPSBudWxsO1xuICAgIHRoaXMuY29udGFpbmVyID0gdGhpcy5zdHlsZSA9IG51bGw7XG5cbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5ZG93bik7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5rZXl1cCk7XG4gIH1cblxuICBpbmplY3RDb21wb25lbnRzKCkgeyAgICBcbiAgICAvLyBBZGQgY29udGFpbmVyXG4gICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jb250YWluZXIpO1xuICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTmFtZSA9ICdrZXlzdHJva2VzJztcbiAgICBcbiAgICBjb25zdCBwb3NpdGlvbnMgPSB7XG4gICAgICAnYm90dG9tLWxlZnQnOiAnYm90dG9tOiAwOyBsZWZ0OiAwOycsXG4gICAgICAnYm90dG9tLXJpZ2h0JzogJ2JvdHRvbTogMDsgcmlnaHQ6IDA7JyxcbiAgICAgICd0b3AtbGVmdCc6ICd0b3A6IDA7IGxlZnQ6IDA7JyxcbiAgICAgICd0b3AtcmlnaHQnOiAndG9wOiAwOyByaWdodDogMDsnLFxuICAgIH07XG5cbiAgICBpZiAoIXBvc2l0aW9uc1t0aGlzLm9wdGlvbnMucG9zaXRpb25dKSB7XG4gICAgICBjb25zb2xlLndhcm4oYEludmFsaWQgcG9zaXRpb24gJyR7dGhpcy5vcHRpb25zLnBvc2l0aW9ufScsIHVzaW5nIGRlZmF1bHQgJ2JvdHRvbS1sZWZ0Jy4gVmFsaWQgcG9zaXRpb25zOiBgLCBPYmplY3Qua2V5cyhwb3NpdGlvbnMpKTtcbiAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbiA9ICdib3R0b20tbGVmdCc7XG4gICAgfVxuXG4gICAgLy8gQWRkIGNsYXNzZXNcbiAgICB0aGlzLnN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICB0aGlzLnN0eWxlLmlubmVySFRNTCA9IGBcbiAgICAgIHVsLmtleXN0cm9rZXMge1xuICAgICAgICBwYWRkaW5nLWxlZnQ6IDEwcHg7XG4gICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgJHtwb3NpdGlvbnNbdGhpcy5vcHRpb25zLnBvc2l0aW9uXX1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgdWwua2V5c3Ryb2tlcyBsaSB7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBBcmlhbDtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHt0aGlzLm9wdGlvbnMuYmV6ZWxDb2xvcn07XG4gICAgICAgIG9wYWNpdHk6IDAuOTtcbiAgICAgICAgY29sb3I6ICR7dGhpcy5vcHRpb25zLnRleHRDb2xvcn07XG4gICAgICAgIHBhZGRpbmc6IDVweCAxMHB4O1xuICAgICAgICBtYXJnaW4tYm90dG9tOiA1cHg7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgICAgIG9wYWNpdHk6IDE7XG4gICAgICAgIGZvbnQtc2l6ZTogJHt0aGlzLm9wdGlvbnMuZm9udFNpemV9cHg7XG4gICAgICAgIGRpc3BsYXk6IHRhYmxlO1xuICAgICAgICAtd2Via2l0LXRyYW5zaXRpb246IG9wYWNpdHkgJHt0aGlzLm9wdGlvbnMuZmFkZUR1cmF0aW9ufW1zIGxpbmVhcjtcbiAgICAgICAgdHJhbnNpdGlvbjogb3BhY2l0eSAke3RoaXMub3B0aW9ucy5mYWRlRHVyYXRpb259bXMgbGluZWFyO1xuICAgICAgfWA7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnN0eWxlKTtcbiAgfVxuXG4gIGtleWRvd24oZSkge1xuICAgIGlmICghdGhpcy5jdXJyZW50Q2h1bmspIHtcbiAgICAgIHRoaXMuY3VycmVudENodW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY3VycmVudENodW5rKTtcbiAgICB9XG5cbiAgICB2YXIgbWFjID0gdXNlcmFnZW50SW5mbygpLnBsYXRmb3JtID09PSAnTWFjJztcblxuICAgIGZ1bmN0aW9uIGNvbnZlcnQoa2V5KSB7XG4gICAgICBjb25zdCBjb252ZXJzaW9uQ29tbW9uID0ge1xuICAgICAgICAnQXJyb3dSaWdodCc6ICfihpInLFxuICAgICAgICAnQXJyb3dMZWZ0JzogJ+KGkCcsXG4gICAgICAgICdBcnJvd1VwJzogJ+KGkScsXG4gICAgICAgICdBcnJvd0Rvd24nOiAn4oaTJyxcbiAgICAgICAgJyAnOiAn4pCjJyxcbiAgICAgICAgJ0VudGVyJzogJ+KGqScsXG4gICAgICAgICdTaGlmdCc6ICfih6cnLFxuICAgICAgICAnQ29udHJvbCc6ICfijIMnLFxuICAgICAgICAnVGFiJzogJ+KGuScsXG4gICAgICAgICdDYXBzTG9jayc6ICfih6onXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBjb252ZXJzaW9uTWFjID0ge1xuICAgICAgICAnQWx0JzogJ+KMpScsXG4gICAgICAgICdCYWNrc3BhY2UnOiAn4oyrJyxcbiAgICAgICAgJ01ldGEnOiAn4oyYJyxcbiAgICAgICAgJ1RhYic6ICfih6UnLFxuICAgICAgICAnUGFnZURvd24nOiAn4oefJyxcbiAgICAgICAgJ1BhZ2VVcCc6ICfih54nLFxuICAgICAgICAnSG9tZSc6ICfihpYnLFxuICAgICAgICAnRW5kJzogJ+KGmCdcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiAobWFjID8gY29udmVyc2lvbk1hY1trZXldIDogbnVsbCApIHx8IGNvbnZlcnNpb25Db21tb25ba2V5XSB8fCBrZXk7XG4gICAgfVxuICAgIFxuICAgIHRoaXMuY3VycmVudENodW5rLnRleHRDb250ZW50ICs9IGNvbnZlcnQoZS5rZXkpO1xuICB9XG5cbiAga2V5dXAoZSkge1xuICAgIGlmICghdGhpcy5jdXJyZW50Q2h1bmspIHJldHVybjtcbiAgICBcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgIGNsZWFyVGltZW91dCh0aGlzLmtleVN0cm9rZVRpbWVvdXQpO1xuICAgIHRoaXMua2V5U3Ryb2tlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgKGZ1bmN0aW9uKHByZXZpb3VzQ2h1bmspIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgcHJldmlvdXNDaHVuay5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtwcmV2aW91c0NodW5rLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocHJldmlvdXNDaHVuayl9LCBvcHRpb25zLmZhZGVEdXJhdGlvbik7XG4gICAgICAgIH0sIG9wdGlvbnMubGluZ2VyRGVsYXkpO1xuICAgICAgfSkodGhpcy5jdXJyZW50Q2h1bmspO1xuICAgICAgXG4gICAgICB0aGlzLmN1cnJlbnRDaHVuayA9IG51bGw7XG4gICAgfSwgb3B0aW9ucy5rZXlTdHJva2VEZWxheSk7XG4gIH1cblxuICBlbmFibGUob3B0aW9ucykge1xuICAgIHRoaXMuY2xlYW5VcCgpOyAgICBcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKCB7fSwgREVGQVVMVF9PUFRJT05TLCBvcHRpb25zIHx8IHRoaXMub3B0aW9ucyk7XG4gICAgdGhpcy5pbmplY3RDb21wb25lbnRzKCk7ICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5ZG93bik7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5rZXl1cCk7XG4gIH1cblxuICBkaXNhYmxlKCkge1xuICAgIHRoaXMuY2xlYW5VcCgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBLZXlzdHJva2VWaXN1YWxpemVyKCk7Il0sIm5hbWVzIjpbInVzZXJhZ2VudEluZm8iXSwibWFwcGluZ3MiOiI7Ozs7OztFQUNBLFNBQVMsdUJBQXVCLENBQUMsR0FBRyxFQUFFO0VBQ3RDLEVBQUUsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDbkQsQ0FBQztFQUdELFNBQVMsbUJBQW1CLENBQUMsR0FBRyxFQUFFO0VBQ2xDLEVBQUUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FB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
