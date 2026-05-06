"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = StoryViewer;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireDefault(require("react-native-reanimated"));
var _reactNativeGestureHandler = require("react-native-gesture-handler");
var _useStoryViewer = require("./hooks/useStoryViewer");
var _StoryProgressBar = require("./components/StoryProgressBar");
var _reactNativeSafeAreaContext = require("react-native-safe-area-context");
var _StoryHeader = require("./components/StoryHeader");
var _StoryMedia = require("./components/StoryMedia");
var _StoryCta = require("./components/StoryCta");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * StoryViewer — Main Orchestrator Component
 *
 * Instagram/Snapchat style full-screen story viewer.
 *
 * This component is a "thin shell" — all business logic lives in the `useStoryViewer` hook,
 * all visual parts live in sub-components. This component only orchestrates them.
 *
 * Features:
 * ──────────
 * - ✅ Segmented progress bar (separate for each story, animated)
 * - ✅ Next/prev navigation with left/right tap
 * - ✅ Swipe down to close (with spring effect)
 * - ✅ Long press to pause/resume
 * - ✅ CTA buttons (optional)
 * - ✅ Image + Video media support
 * - ✅ Transition between groups
 *
 * @example
 * ```tsx
 * <StoryViewer
 *   groups={storyGroups}
 *   initialGroupIndex={0}
 *   isVisible={isVisible}
 *   onClose={() => setIsVisible(false)}
 *   onCtaPress={(cta) => router.push(cta.value)}
 *   onStorySeen={(story) => api.markSeen(story.id)}
 *   config={{ defaultDurationMs: 5000 }}
 * />
 * ```
 */

function StoryViewer(props) {
  const {
    groups,
    initialGroupIndex,
    isVisible,
    config,
    theme,
    customComponents,
    onClose,
    onCtaPress,
    onStoryChange,
    onGroupChange,
    onComplete,
    onStorySeen
  } = props;
  const viewer = (0, _useStoryViewer.useStoryViewer)({
    groups,
    initialGroupIndex,
    isVisible,
    config,
    callbacks: {
      onClose,
      onCtaPress,
      onStoryChange,
      onGroupChange,
      onComplete,
      onStorySeen
    }
  });

  // Do not render if there is no data
  if (!viewer.currentGroup || !viewer.currentStory) return null;
  const {
    currentGroup,
    currentStory
  } = viewer;
  const insets = (0, _reactNativeSafeAreaContext.useSafeAreaInsets)();
  const bgColor = theme?.backgroundColor || 'black';

  // Combine Pan + LongPress gestures
  // Simultaneous: both gestures can be active at the same time
  const composedGesture = _reactNativeGestureHandler.Gesture.Simultaneous(viewer.panGesture, viewer.longPressGesture);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Modal, {
    visible: isVisible,
    transparent: true,
    animationType: "fade",
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeGestureHandler.GestureHandlerRootView, {
      style: [styles.root, {
        backgroundColor: bgColor
      }],
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeGestureHandler.GestureDetector, {
        gesture: composedGesture,
        children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNativeReanimated.default.View, {
          style: [styles.container, viewer.containerAnimatedStyle, {
            backgroundColor: bgColor
          }],
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_StoryMedia.StoryMedia, {
            mediaUrl: currentStory.mediaUrl,
            mediaType: currentStory.mediaType,
            posterUrl: currentStory.posterUrl,
            isPaused: viewer.isPaused,
            onMediaReady: viewer.notifyMediaReady,
            onVideoEnd: viewer.notifyVideoEnd
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: [styles.header, {
              top: insets.top
            }],
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_StoryProgressBar.StoryProgressBar, {
              totalCount: currentGroup.stories.length,
              currentIndex: viewer.currentStoryIndex,
              progress: viewer.progress
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_StoryHeader.StoryHeader, {
              avatarUrl: currentGroup.avatarUrl,
              name: currentGroup.name,
              onClose: onClose,
              renderCloseButton: customComponents?.renderCloseButton
            })]
          }), currentStory.cta && onCtaPress && /*#__PURE__*/(0, _jsxRuntime.jsx)(_StoryCta.StoryCta, {
            cta: currentStory.cta,
            onPress: () => onCtaPress(currentStory.cta, currentStory, currentGroup),
            renderCtaIcon: customComponents?.renderCtaIcon
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: styles.touchAreas,
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableWithoutFeedback, {
              onPress: viewer.handlePrev,
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
                style: styles.touchLeft
              })
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableWithoutFeedback, {
              onPress: viewer.handleNext,
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
                style: styles.touchRight
              })
            })]
          })]
        })
      })
    })
  });
}
const styles = _reactNative.StyleSheet.create({
  root: {
    flex: 1
  },
  container: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden'
  },
  header: {
    position: 'absolute',
    top: 50,
    width: '100%',
    paddingHorizontal: 10,
    zIndex: 10
  },
  touchAreas: {
    flex: 1,
    flexDirection: 'row'
  },
  touchLeft: {
    flex: 1 // Left 50% of the screen → previous story
  },
  touchRight: {
    flex: 1 // Right 50% of the screen → next story
  }
});
//# sourceMappingURL=StoryViewer.js.map