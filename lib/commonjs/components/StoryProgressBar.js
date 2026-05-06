"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StoryProgressBar = StoryProgressBar;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * StoryProgressBar — Animated Story Progress Bar
 *
 * Instagram/Snapchat style segmented progress bar.
 * Each segment represents a story:
 *  - Past stories → completely filled (white)
 *  - Active story     → animated fill (with SharedValue)
 *  - Future stories → semi-transparent background
 *
 * Provides 60fps animation without blocking JS thread
 * using Reanimated SharedValue.
 */

/**
 * Individual progress segment component.
 * Memoized for performance — re-renders only when its own state changes.
 */
const ProgressSegment = /*#__PURE__*/_react.default.memo(function ProgressSegment({
  state,
  progress
}) {
  // Create animated style only for active segment
  // static style is used for past and future
  const animatedFillStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    if (state !== 'active') return {
      width: '0%'
    };
    return {
      width: `${progress.value * 100}%`
    };
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
    style: styles.segmentBackground,
    children: [state === 'past' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: [styles.segmentFill, styles.fullWidth]
    }), state === 'active' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeReanimated.default.View, {
      style: [styles.segmentFill, animatedFillStyle]
    })]
  });
});
function StoryProgressBar({
  totalCount,
  currentIndex,
  progress
}) {
  if (totalCount <= 0) return null;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: styles.container,
    children: Array.from({
      length: totalCount
    }, (_, index) => {
      let state;
      if (index < currentIndex) state = 'past';else if (index === currentIndex) state = 'active';else state = 'future';
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(ProgressSegment, {
        state: state,
        progress: progress
      }, index);
    })
  });
}
const styles = _reactNative.StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10
  },
  segmentBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  segmentFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2
  },
  fullWidth: {
    width: '100%'
  }
});
//# sourceMappingURL=StoryProgressBar.js.map