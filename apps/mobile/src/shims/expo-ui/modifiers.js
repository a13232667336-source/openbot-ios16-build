/**
 * iOS 16.0 port shim for `@expo/ui/swift-ui/modifiers`.
 *
 * Every modifier returns a no-op value; the React Native approximations in `swift-ui.tsx` ignore
 * them. A Proxy keeps unknown modifier names working without listing them all.
 */
function modifierFactory(name) {
  return function modifier(...args) {
    return { __expoUiModifier: name, args };
  };
}

const cache = new Map();

const modifiers = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === "__esModule") return false;
      if (typeof prop !== "string") return undefined;
      if (!cache.has(prop)) cache.set(prop, modifierFactory(prop));
      return cache.get(prop);
    },
    has() {
      return true;
    },
  },
);

module.exports = modifiers;
