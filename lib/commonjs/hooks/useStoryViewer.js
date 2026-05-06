"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useStoryViewer = useStoryViewer;
var _react = require("react");
var _reactNativeReanimated = require("react-native-reanimated");
var _reactNativeGestureHandler = require("react-native-gesture-handler");
/**
 * useStoryViewer — Story Viewer Business Logic Hook
 *
 * This hook encapsulates ALL state management, animation logic,
 * gesture handling, and seen-tracking functions of the StoryViewer component.
 *
 * The component itself (StoryViewer.tsx) remains a thin "orchestrator",
 * while this hook acts as the "brain".
 */

// ─────────────────────────────────────────────
// Config Defaults
// ─────────────────────────────────────────────

const DEFAULT_CONFIG = {
  defaultDurationMs: 5000,
  dismissThreshold: 150
};

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

function useStoryViewer(params) {
  const {
    groups,
    isVisible,
    callbacks
  } = params;
  const config = {
    ...DEFAULT_CONFIG,
    ...params.config
  };

  // ── State ──
  const [currentGroupIndex, setCurrentGroupIndex] = (0, _react.useState)(params.initialGroupIndex ?? 0);
  const [currentStoryIndex, setCurrentStoryIndex] = (0, _react.useState)(0);
  const [isPaused, setIsPaused] = (0, _react.useState)(false);
  const [isMediaReady, setIsMediaReady] = (0, _react.useState)(false);

  // ── Reanimated Shared Values ──
  const progress = (0, _reactNativeReanimated.useSharedValue)(0);
  const translateY = (0, _reactNativeReanimated.useSharedValue)(0);

  // ── Refs (prevent stale closure) ──
  const handleNextRef = (0, _react.useRef)(() => {});
  const handlePrevRef = (0, _react.useRef)(() => {});
  const callbacksRef = (0, _react.useRef)(callbacks);
  callbacksRef.current = callbacks;

  // ── Derived Values ──
  const currentGroup = groups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];

  // ─────────────────────────────────────────
  // Navigation (ref-based to avoid stale closures)
  // ─────────────────────────────────────────

  /** Go to next story or group. If last story, call onComplete and close. */
  const handleNext = (0, _react.useCallback)(() => {
    handleNextRef.current();
  }, []);

  /** Go back to previous story or group. Do nothing if first story. */
  const handlePrev = (0, _react.useCallback)(() => {
    handlePrevRef.current();
  }, []);

  // Ref updates — capture current state on every render
  (0, _react.useEffect)(() => {
    handleNextRef.current = () => {
      if (!currentGroup) return;
      if (currentStoryIndex < currentGroup.stories.length - 1) {
        const nextIndex = currentStoryIndex + 1;
        setCurrentStoryIndex(nextIndex);
      } else if (currentGroupIndex < groups.length - 1) {
        const nextGroupIndex = currentGroupIndex + 1;
        setCurrentGroupIndex(nextGroupIndex);
        setCurrentStoryIndex(0);
        callbacksRef.current.onGroupChange?.(groups[nextGroupIndex], nextGroupIndex);
      } else {
        callbacksRef.current.onComplete?.();
        callbacksRef.current.onClose();
      }
    };
  }, [currentGroup, currentStoryIndex, currentGroupIndex, groups]);
  (0, _react.useEffect)(() => {
    handlePrevRef.current = () => {
      if (currentStoryIndex > 0) {
        setCurrentStoryIndex(currentStoryIndex - 1);
      } else if (currentGroupIndex > 0) {
        const prevGroupIndex = currentGroupIndex - 1;
        const prevGroup = groups[prevGroupIndex];
        setCurrentGroupIndex(prevGroupIndex);
        setCurrentStoryIndex(prevGroup ? prevGroup.stories.length - 1 : 0);
        if (prevGroup) {
          callbacksRef.current.onGroupChange?.(prevGroup, prevGroupIndex);
        }
      }
    };
  }, [currentStoryIndex, currentGroupIndex, groups]);

  // ─────────────────────────────────────────
  // Progress Animation
  // ─────────────────────────────────────────

  /**
   * Starts or restarts the progress bar.
   * Uses story's own durationMs, fallback to config.defaultDurationMs.
   */
  const startProgress = (0, _react.useCallback)(() => {
    if (!currentStory) return;
    const duration = currentStory.durationMs && currentStory.durationMs > 0 ? currentStory.durationMs : config.defaultDurationMs;
    (0, _reactNativeReanimated.cancelAnimation)(progress);
    progress.value = 0;
    progress.value = (0, _reactNativeReanimated.withTiming)(1, {
      duration,
      easing: _reactNativeReanimated.Easing.linear
    }, isFinished => {
      if (isFinished) {
        (0, _reactNativeReanimated.runOnJS)(handleNext)();
      }
    });
  }, [currentStory, config.defaultDurationMs, handleNext, progress]);

  /**
   * Pause animation (for long press or pan gesture).
   * Preserves current progress value, cancels withTiming.
   */
  const pauseProgress = (0, _react.useCallback)(() => {
    (0, _reactNativeReanimated.cancelAnimation)(progress);
    setIsPaused(true);
  }, [progress]);

  /**
   * Resumes paused animation from where it left off.
   */
  const resumeProgress = (0, _react.useCallback)(() => {
    if (!currentStory) return;
    setIsPaused(false);
    const duration = currentStory.durationMs && currentStory.durationMs > 0 ? currentStory.durationMs : config.defaultDurationMs;

    // Calculate remaining time
    const remaining = duration * (1 - progress.value);
    progress.value = (0, _reactNativeReanimated.withTiming)(1, {
      duration: Math.max(remaining, 100),
      easing: _reactNativeReanimated.Easing.linear
    }, isFinished => {
      if (isFinished) {
        (0, _reactNativeReanimated.runOnJS)(handleNext)();
      }
    });
  }, [currentStory, config.defaultDurationMs, handleNext, progress]);

  // ─────────────────────────────────────────
  // Media Ready Callback
  // ─────────────────────────────────────────

  /**
   * Called when media is loaded by the StoryMedia component.
   * Progress bar only starts after this function is called.
   */
  const notifyMediaReady = (0, _react.useCallback)(() => {
    setIsMediaReady(true);
  }, []);

  /**
   * Called by StoryMedia when the video ends.
   * Immediately transitions to the next story.
   */
  const notifyVideoEnd = (0, _react.useCallback)(() => {
    handleNext();
  }, [handleNext]);

  // ─────────────────────────────────────────
  // Pan Gesture (Swipe Down → Close)
  // ─────────────────────────────────────────

  const handleClose = (0, _react.useCallback)(() => {
    callbacksRef.current.onClose();
  }, []);
  const panGesture = _reactNativeGestureHandler.Gesture.Pan().onStart(() => {
    // Pause progress when pan starts
    (0, _reactNativeReanimated.runOnJS)(pauseProgress)();
  }).onChange(event => {
    // Only allow downward swiping
    if (event.translationY > 0) {
      translateY.value = event.translationY;
    }
  }).onEnd(event => {
    if (event.translationY > config.dismissThreshold) {
      // Swiped down enough → close
      (0, _reactNativeReanimated.runOnJS)(handleClose)();
    } else {
      // Not enough → spring back and resume progress
      translateY.value = (0, _reactNativeReanimated.withSpring)(0, {
        damping: 20,
        stiffness: 300
      });
      (0, _reactNativeReanimated.runOnJS)(resumeProgress)();
    }
  });

  /**
   * Long press gesture: pause on press, resume on release.
   */
  const longPressGesture = _reactNativeGestureHandler.Gesture.LongPress().minDuration(200).onStart(() => {
    (0, _reactNativeReanimated.runOnJS)(pauseProgress)();
  }).onEnd(() => {
    (0, _reactNativeReanimated.runOnJS)(resumeProgress)();
  });

  // ─────────────────────────────────────────
  // Animated Styles
  // ─────────────────────────────────────────

  const containerAnimatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => ({
    transform: [{
      translateY: translateY.value
    }]
  }));

  // ─────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────

  // Reset when viewer opens
  (0, _react.useEffect)(() => {
    if (isVisible) {
      setCurrentGroupIndex(params.initialGroupIndex ?? 0);
      setCurrentStoryIndex(0);
      setIsPaused(false);
      setIsMediaReady(false);
      translateY.value = 0;
      (0, _reactNativeReanimated.cancelAnimation)(progress);
      progress.value = 0;
    } else {
      // Cleanup on close
      (0, _reactNativeReanimated.cancelAnimation)(progress);
      translateY.value = 0;
    }
  }, [isVisible]);

  // When story changes: mark media as not ready, track seen
  (0, _react.useEffect)(() => {
    if (!isVisible || !currentStory || !currentGroup) return;

    // New story → media not ready yet, reset progress
    setIsMediaReady(false);
    (0, _reactNativeReanimated.cancelAnimation)(progress);
    progress.value = 0;
    callbacksRef.current.onStorySeen?.(currentStory, currentGroup);
    callbacksRef.current.onStoryChange?.(currentStory, currentGroup, currentStoryIndex);
  }, [currentStoryIndex, currentGroupIndex, isVisible]);

  // Start progress when media is ready
  (0, _react.useEffect)(() => {
    if (!isVisible || !isMediaReady || !currentStory) return;
    startProgress();
  }, [isMediaReady, isVisible, currentStory]);

  // ─────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────

  return {
    // Current state
    currentGroup,
    currentStory,
    currentGroupIndex,
    currentStoryIndex,
    isPaused,
    isMediaReady,
    // Shared values (Reanimated)
    progress,
    translateY,
    // Animated styles
    containerAnimatedStyle,
    // Gestures
    panGesture,
    longPressGesture,
    // Actions
    handleNext,
    handlePrev,
    pauseProgress,
    resumeProgress,
    // Media callbacks (to be passed to StoryMedia)
    notifyMediaReady,
    notifyVideoEnd
  };
}
//# sourceMappingURL=useStoryViewer.js.map