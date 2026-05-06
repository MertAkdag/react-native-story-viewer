/**
 * useStoryViewer — Story Viewer Business Logic Hook
 *
 * This hook encapsulates ALL state management, animation logic,
 * gesture handling, and seen-tracking functions of the StoryViewer component.
 *
 * The component itself (StoryViewer.tsx) remains a thin "orchestrator",
 * while this hook acts as the "brain".
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import type {
  StoryGroup,
  StoryItem,
  StoryViewerConfig,
  StoryViewerCallbacks,
} from '../types/story.types';

// ─────────────────────────────────────────────
// Config Defaults
// ─────────────────────────────────────────────

const DEFAULT_CONFIG: Required<StoryViewerConfig> = {
  defaultDurationMs: 5000,
  dismissThreshold: 150,
};

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useStoryViewer(params: {
  groups: StoryGroup[];
  initialGroupIndex?: number;
  isVisible: boolean;
  config?: StoryViewerConfig;
  callbacks: StoryViewerCallbacks;
}) {
  const { groups, isVisible, callbacks } = params;
  const config = { ...DEFAULT_CONFIG, ...params.config };

  // ── State ──
  const [currentGroupIndex, setCurrentGroupIndex] = useState(
    params.initialGroupIndex ?? 0,
  );
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMediaReady, setIsMediaReady] = useState(false);

  // ── Reanimated Shared Values ──
  const progress = useSharedValue(0);
  const translateY = useSharedValue(0);

  // ── Refs (prevent stale closure) ──
  const handleNextRef = useRef<() => void>(() => {});
  const handlePrevRef = useRef<() => void>(() => {});
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // ── Derived Values ──
  const currentGroup: StoryGroup | undefined = groups[currentGroupIndex];
  const currentStory: StoryItem | undefined =
    currentGroup?.stories[currentStoryIndex];

  // ─────────────────────────────────────────
  // Navigation (ref-based to avoid stale closures)
  // ─────────────────────────────────────────

  /** Go to next story or group. If last story, call onComplete and close. */
  const handleNext = useCallback(() => {
    handleNextRef.current();
  }, []);

  /** Go back to previous story or group. Do nothing if first story. */
  const handlePrev = useCallback(() => {
    handlePrevRef.current();
  }, []);

  // Ref updates — capture current state on every render
  useEffect(() => {
    handleNextRef.current = () => {
      if (!currentGroup) return;

      if (currentStoryIndex < currentGroup.stories.length - 1) {
        const nextIndex = currentStoryIndex + 1;
        setCurrentStoryIndex(nextIndex);
      } else if (currentGroupIndex < groups.length - 1) {
        const nextGroupIndex = currentGroupIndex + 1;
        setCurrentGroupIndex(nextGroupIndex);
        setCurrentStoryIndex(0);
        callbacksRef.current.onGroupChange?.(groups[nextGroupIndex]!, nextGroupIndex);
      } else {
        callbacksRef.current.onComplete?.();
        callbacksRef.current.onClose();
      }
    };
  }, [currentGroup, currentStoryIndex, currentGroupIndex, groups]);

  useEffect(() => {
    handlePrevRef.current = () => {
      if (currentStoryIndex > 0) {
        setCurrentStoryIndex(currentStoryIndex - 1);
      } else if (currentGroupIndex > 0) {
        const prevGroupIndex = currentGroupIndex - 1;
        const prevGroup = groups[prevGroupIndex];
        setCurrentGroupIndex(prevGroupIndex);
        setCurrentStoryIndex(
          prevGroup ? prevGroup.stories.length - 1 : 0,
        );
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
  const startProgress = useCallback(() => {
    if (!currentStory) return;

    const duration = currentStory.durationMs && currentStory.durationMs > 0
      ? currentStory.durationMs
      : config.defaultDurationMs;

    cancelAnimation(progress);
    progress.value = 0;

    progress.value = withTiming(
      1,
      { duration, easing: Easing.linear },
      (isFinished) => {
        if (isFinished) {
          runOnJS(handleNext)();
        }
      },
    );
  }, [currentStory, config.defaultDurationMs, handleNext, progress]);

  /**
   * Pause animation (for long press or pan gesture).
   * Preserves current progress value, cancels withTiming.
   */
  const pauseProgress = useCallback(() => {
    cancelAnimation(progress);
    setIsPaused(true);
  }, [progress]);

  /**
   * Resumes paused animation from where it left off.
   */
  const resumeProgress = useCallback(() => {
    if (!currentStory) return;
    setIsPaused(false);

    const duration = currentStory.durationMs && currentStory.durationMs > 0
      ? currentStory.durationMs
      : config.defaultDurationMs;

    // Calculate remaining time
    const remaining = duration * (1 - progress.value);

    progress.value = withTiming(
      1,
      { duration: Math.max(remaining, 100), easing: Easing.linear },
      (isFinished) => {
        if (isFinished) {
          runOnJS(handleNext)();
        }
      },
    );
  }, [currentStory, config.defaultDurationMs, handleNext, progress]);

  // ─────────────────────────────────────────
  // Media Ready Callback
  // ─────────────────────────────────────────

  /**
   * Called when media is loaded by the StoryMedia component.
   * Progress bar only starts after this function is called.
   */
  const notifyMediaReady = useCallback(() => {
    setIsMediaReady(true);
  }, []);

  /**
   * Called by StoryMedia when the video ends.
   * Immediately transitions to the next story.
   */
  const notifyVideoEnd = useCallback(() => {
    handleNext();
  }, [handleNext]);

  // ─────────────────────────────────────────
  // Pan Gesture (Swipe Down → Close)
  // ─────────────────────────────────────────

  const handleClose = useCallback(() => {
    callbacksRef.current.onClose();
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Pause progress when pan starts
      runOnJS(pauseProgress)();
    })
    .onChange((event) => {
      // Only allow downward swiping
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > config.dismissThreshold) {
        // Swiped down enough → close
        runOnJS(handleClose)();
      } else {
        // Not enough → spring back and resume progress
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
        runOnJS(resumeProgress)();
      }
    });

  /**
   * Long press gesture: pause on press, resume on release.
   */
  const longPressGesture = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      runOnJS(pauseProgress)();
    })
    .onEnd(() => {
      runOnJS(resumeProgress)();
    });

  // ─────────────────────────────────────────
  // Animated Styles
  // ─────────────────────────────────────────

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // ─────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────

  // Reset when viewer opens
  useEffect(() => {
    if (isVisible) {
      setCurrentGroupIndex(params.initialGroupIndex ?? 0);
      setCurrentStoryIndex(0);
      setIsPaused(false);
      setIsMediaReady(false);
      translateY.value = 0;
      cancelAnimation(progress);
      progress.value = 0;
    } else {
      // Cleanup on close
      cancelAnimation(progress);
      translateY.value = 0;
    }
  }, [isVisible]);

  // When story changes: mark media as not ready, track seen
  useEffect(() => {
    if (!isVisible || !currentStory || !currentGroup) return;

    // New story → media not ready yet, reset progress
    setIsMediaReady(false);
    cancelAnimation(progress);
    progress.value = 0;

    callbacksRef.current.onStorySeen?.(currentStory, currentGroup);
    
    callbacksRef.current.onStoryChange?.(
      currentStory,
      currentGroup,
      currentStoryIndex,
    );
  }, [currentStoryIndex, currentGroupIndex, isVisible]);

  // Start progress when media is ready
  useEffect(() => {
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
    notifyVideoEnd,
  };
}
