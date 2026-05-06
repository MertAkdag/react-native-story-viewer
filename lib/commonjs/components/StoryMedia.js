"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StoryMedia = StoryMedia;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _expoVideo = require("expo-video");
var _expoImage = require("expo-image");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * StoryMedia — Story Media Renderer
 *
 * Renders the background media of the story:
 * - `image` → full-screen display with expo-image
 * - `video` → with expo-video VideoView component
 *
 * Performance:
 * - expo-image already uses disk/memory cache
 * - Video `shouldPlay` and `isLooping` controls are managed via `isPaused` prop
 *
 * Synchronization:
 * - Progress bar doesn't start until `onMediaReady` callback is triggered
 * - Transitions to the next story when the video ends via `onVideoEnd` callback
 *
 * Error state:
 * - Shows a black background if media fails to load (graceful degradation)
 */

function StoryMedia({
  mediaUrl,
  mediaType,
  posterUrl,
  isPaused = false,
  onMediaReady,
  onVideoEnd
}) {
  const [isLoading, setIsLoading] = (0, _react.useState)(true);
  const [hasError, setHasError] = (0, _react.useState)(false);

  // Reset states when mediaUrl changes
  (0, _react.useEffect)(() => {
    setIsLoading(true);
    setHasError(false);
  }, [mediaUrl]);
  if (hasError || !mediaUrl) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: [styles.media, styles.errorFallback]
    });
  }
  console.log(`[StoryMedia] Loaded Media URL (${mediaType}):`, mediaUrl);
  if (mediaType === 'video') {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(VideoPlayer, {
      uri: mediaUrl,
      posterUrl: posterUrl,
      isPaused: isPaused,
      onReady: onMediaReady,
      onEnd: onVideoEnd,
      onError: () => setHasError(true)
    });
  }

  // Image rendering
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
    style: styles.media,
    children: [isLoading && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: styles.loaderOverlay,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.ActivityIndicator, {
        size: "large",
        color: "rgba(255, 255, 255, 0.7)"
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_expoImage.Image, {
      source: {
        uri: mediaUrl
      },
      style: styles.media,
      contentFit: "cover",
      transition: 200,
      onLoadStart: () => setIsLoading(true),
      onLoadEnd: () => {
        setIsLoading(false);
        onMediaReady?.();
      },
      onError: () => {
        setIsLoading(false);
        setHasError(true);
      }
    })]
  });
}

/**
 * Video player sub-component.
 * Uses expo-video (SDK 54+).
 *
 * Lifecycle:
 * 1. Player is created → video buffering starts
 * 2. When status is 'readyToPlay' → `onReady` is called (progress bar starts)
 * 3. When status is 'idle' (and was previously playing) → `onEnd` is called
 */
function VideoPlayer({
  uri,
  posterUrl,
  isPaused,
  onReady,
  onEnd,
  onError
}) {
  const readyFiredRef = (0, _react.useRef)(false);
  const player = (0, _expoVideo.useVideoPlayer)(uri, player => {
    player.loop = false;
    player.muted = false;
    // Do not trigger playback — wait for readyToPlay callback
  });

  // Listen for status changes
  (0, _react.useEffect)(() => {
    if (!player) return;

    // Reset ref for each new video
    readyFiredRef.current = false;

    // @ts-ignore: expo-video types might not expose addListener correctly
    const statusSub = player.addListener('statusChange', event => {
      if (event.error) {
        console.warn(`[StoryMedia] Video error (${uri}):`, event.error.message, event.error);
        onError();
        return;
      }
      if (event.status === 'readyToPlay' && !readyFiredRef.current) {
        readyFiredRef.current = true;
        onReady?.();
        if (!isPaused) {
          player.play();
        }
      }
    });

    // Triggered when video reaches the end
    // @ts-ignore
    const endSub = player.addListener('playToEnd', () => {
      onEnd?.();
    });
    return () => {
      statusSub.remove();
      endSub.remove();
    };
  }, [player, uri]);

  // Play/pause when isPaused prop changes
  (0, _react.useEffect)(() => {
    if (!player || !readyFiredRef.current) return;
    if (isPaused) {
      player.pause();
    } else {
      player.play();
    }
  }, [isPaused, player]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_expoVideo.VideoView, {
    style: styles.media,
    player: player,
    nativeControls: false,
    contentFit: "cover"
  });
}
const styles = _reactNative.StyleSheet.create({
  media: {
    ..._reactNative.StyleSheet.absoluteFillObject
  },
  errorFallback: {
    backgroundColor: '#111111'
  },
  loaderOverlay: {
    ..._reactNative.StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  }
});
//# sourceMappingURL=StoryMedia.js.map