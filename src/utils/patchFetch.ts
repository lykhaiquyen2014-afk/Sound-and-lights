// Ensure window.fetch has both getter and setter across all browser contexts
// to prevent "TypeError: Cannot set property fetch of #<Window> which has only a getter"
(function initFetchPatch() {
  if (typeof window === 'undefined') return;

  try {
    const originalFetch = window.fetch ? window.fetch.bind(window) : undefined;
    let currentFetch = originalFetch;

    // 1. If Window.prototype has a fetch getter without setter, provide one
    if (typeof Window !== 'undefined' && Window.prototype) {
      const protoDesc = Object.getOwnPropertyDescriptor(Window.prototype, 'fetch');
      if (protoDesc && protoDesc.get && !protoDesc.set) {
        try {
          Object.defineProperty(Window.prototype, 'fetch', {
            get: protoDesc.get,
            set: function (newFetch) {
              Object.defineProperty(this, 'fetch', {
                value: newFetch,
                writable: true,
                configurable: true,
                enumerable: true,
              });
            },
            configurable: true,
            enumerable: true,
          });
        } catch (_) {}
      }
    }

    // 2. Ensure window instance has a writable accessor or property
    const winDesc = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (!winDesc || !winDesc.set) {
      Object.defineProperty(window, 'fetch', {
        get: function () {
          return currentFetch;
        },
        set: function (newFetch) {
          currentFetch = newFetch;
        },
        configurable: true,
        enumerable: true,
      });
    }

    // 3. Ensure globalThis is also safe
    if (typeof globalThis !== 'undefined' && globalThis !== window) {
      try {
        const gtDesc = Object.getOwnPropertyDescriptor(globalThis, 'fetch');
        if (!gtDesc || !gtDesc.set) {
          Object.defineProperty(globalThis, 'fetch', {
            get: function () {
              return currentFetch;
            },
            set: function (newFetch) {
              currentFetch = newFetch;
            },
            configurable: true,
            enumerable: true,
          });
        }
      } catch (_) {}
    }
  } catch (err) {
    console.warn('Fetch setter compatibility error:', err);
  }
})();

export {};
