"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StoryCta = StoryCta;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * StoryCta — Call-to-Action Overlay Button
 *
 * Action button displayed at the bottom of the story.
 * - Shows CTA label (e.g. "View Product", "See Campaign")
 * - Gives swipe-up feel with an up arrow
 * - Attracts attention with subtle bounce animation
 * - Remains readable over media with glassmorphism background
 */

function StoryCta({
  cta,
  onPress,
  renderCtaIcon
}) {
  // Up-down "bounce" animation — attracts user attention
  const bounceY = (0, _reactNativeReanimated.useSharedValue)(0);
  (0, _react.useEffect)(() => {
    bounceY.value = (0, _reactNativeReanimated.withRepeat)((0, _reactNativeReanimated.withSequence)((0, _reactNativeReanimated.withTiming)(-4, {
      duration: 600,
      easing: _reactNativeReanimated.Easing.inOut(_reactNativeReanimated.Easing.ease)
    }), (0, _reactNativeReanimated.withTiming)(0, {
      duration: 600,
      easing: _reactNativeReanimated.Easing.inOut(_reactNativeReanimated.Easing.ease)
    })), -1,
    // infinite repeat
    false);
  }, [bounceY]);
  const animatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => ({
    transform: [{
      translateY: bounceY.value
    }]
  }));
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeReanimated.default.View, {
    style: [styles.wrapper, animatedStyle],
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.TouchableOpacity, {
      style: styles.button,
      onPress: onPress,
      activeOpacity: 0.8,
      children: [renderCtaIcon ? renderCtaIcon() : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        style: styles.defaultIcon,
        children: "\u25B4"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        style: styles.label,
        numberOfLines: 1,
        children: cta.label
      })]
    })
  });
}
const styles = _reactNative.StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    // Glassmorphism effect
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    // Shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  defaultIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    marginTop: -2 // Optical alignment for the triangle
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {
      width: 0,
      height: 1
    },
    textShadowRadius: 3
  }
});
//# sourceMappingURL=StoryCta.js.map