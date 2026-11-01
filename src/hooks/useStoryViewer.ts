import { useState, useEffect, useCallback, useRef } from 'react';
import { Image } from 'expo-image';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import type {
  StoryGroup,
  StoryItem,
  StoryMediaReadyMeta,
  StoryViewerConfig,
  StoryViewerCallbacks,
} from '../types/story.types';
import {
  getPrefetchUrls,
  resolveInitialStoryIndex,
  resolveStoryDurationMs,
} from '../utils/story.utils';

const DEFAULT_CONFIG: Required<StoryViewerConfig> = {
  defaultDurationMs: 5000,
  dismissThreshold: 150,
  swipeHorizontalThreshold: 60,
  defaultMuted: false,
  showMuteButton: true,
  startFromFirstUnseen: true,
  prefetchNextMedia: true,
  pauseOnCtaPress: true,
};

export type UseStoryViewerParams = {
  groups: StoryGroup[];
  initialGroupIndex?: number;
  initialStoryIndex?: number;
  isVisible: boolean;
  config?: StoryViewerConfig;
  callbacks: StoryViewerCallbacks;
};

export function useStoryViewer(params: UseStoryViewerParams) {
  const { groups, isVisible, callbacks } = params;
  const config: Required<StoryViewerConfig> = {
    ...DEFAULT_CONFIG,
    ...params.config,
  };

  const initialGroupIdx = Math.max(
    0,
    Math.min(params.initialGroupIndex ?? 0, Math.max(groups.length - 1, 0)),
  );

  // ── State ──
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIdx);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(() =>
    resolveInitialStoryIndex(
      groups[initialGroupIdx],
      params.initialStoryIndex,
      config.startFromFirstUnseen,
    ),
  );
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(config.defaultMuted);
  const [isMediaReady, setIsMediaReady] = useState(false);

  // ── Reanimated Shared Values ──
  const progress = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const gestureAxis = useSharedValue<'none' | 'vertical' | 'horizontal'>('none');

  // ── Refs (prevent stale closures inside gestures & animation callbacks) ──
  const handleNextRef = useRef<() => void>(() => {});
  const handlePrevRef = useRef<() => void>(() => {});
  const handleNextGroupRef = useRef<() => void>(() => {});
  const handlePrevGroupOrResumeRef = useRef<() => void>(() => {});
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const isMediaReadyRef = useRef(isMediaReady);
  isMediaReadyRef.current = isMediaReady;
  const detectedDurationMsRef = useRef<number | undefined>(undefined);
  const activeDurationMsRef = useRef<number>(config.defaultDurationMs);

  // ── Derived Values ──
  const currentGroup: StoryGroup | undefined = groups[currentGroupIndex];
  const currentStory: StoryItem | undefined =
    currentGroup?.stories[currentStoryIndex];

  // ─────────────────────────────────────────
  // Progress Animation
  // ─────────────────────────────────────────

  const handleNext = useCallback(() => {
    handleNextRef.current();
  }, []);

  const handlePrev = useCallback(() => {
    handlePrevRef.current();
  }, []);

  const handleNextGroup = useCallback(() => {
    handleNextGroupRef.current();
  }, []);

  const handlePrevGroup = useCallback(() => {
    handlePrevGroupOrResumeRef.current();
  }, []);

  const startProgress = useCallback(() => {
    if (!currentStory) return;

    const duration = resolveStoryDurationMs(
      currentStory,
      detectedDurationMsRef.current,
      config.defaultDurationMs,
    );
    activeDurationMsRef.current = duration;

    cancelAnimation(progress);
    progress.value = 0;

    if (isPausedRef.current) {
      return;
    }

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

  const pauseProgress = useCallback(() => {
    cancelAnimation(progress);
    isPausedRef.current = true;
    setIsPaused(true);
  }, [progress]);

  const resumeProgress = useCallback(() => {
    if (!currentStory) return;
    isPausedRef.current = false;
    setIsPaused(false);

    if (!isMediaReadyRef.current) {
      return;
    }

    const duration =
      activeDurationMsRef.current ||
      resolveStoryDurationMs(
        currentStory,
        detectedDurationMsRef.current,
        config.defaultDurationMs,
      );

    const remaining = duration * (1 - progress.value);

    progress.value = withTiming(
      1,
      { duration: Math.max(remaining, 80), easing: Easing.linear },
      (isFinished) => {
        if (isFinished) {
          runOnJS(handleNext)();
        }
      },
    );
  }, [currentStory, config.defaultDurationMs, handleNext, progress]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // ─────────────────────────────────────────
  // Navigation Ref Implementations
  // ─────────────────────────────────────────

  useEffect(() => {
    handleNextGroupRef.current = () => {
      if (currentGroupIndex < groups.length - 1) {
        const nextGroupIdx = currentGroupIndex + 1;
        const nextGroup = groups[nextGroupIdx];
        setCurrentGroupIndex(nextGroupIdx);
        setCurrentStoryIndex(
          resolveInitialStoryIndex(
            nextGroup,
            undefined,
            config.startFromFirstUnseen,
          ),
        );
        isPausedRef.current = false;
        setIsPaused(false);
        if (nextGroup) {
          callbacksRef.current.onGroupChange?.(nextGroup, nextGroupIdx);
        }
      } else {
        callbacksRef.current.onComplete?.();
        callbacksRef.current.onClose();
      }
    };
  }, [currentGroupIndex, groups, config.startFromFirstUnseen]);

  useEffect(() => {
    handlePrevGroupOrResumeRef.current = () => {
      if (currentGroupIndex > 0) {
        const prevGroupIdx = currentGroupIndex - 1;
        const prevGroup = groups[prevGroupIdx];
        setCurrentGroupIndex(prevGroupIdx);
        setCurrentStoryIndex(
          resolveInitialStoryIndex(
            prevGroup,
            undefined,
            config.startFromFirstUnseen,
          ),
        );
        isPausedRef.current = false;
        setIsPaused(false);
        if (prevGroup) {
          callbacksRef.current.onGroupChange?.(prevGroup, prevGroupIdx);
        }
      } else {
        resumeProgress();
      }
    };
  }, [currentGroupIndex, groups, config.startFromFirstUnseen, resumeProgress]);

  useEffect(() => {
    handleNextRef.current = () => {
      if (!currentGroup) return;

      if (currentStoryIndex < currentGroup.stories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
        isPausedRef.current = false;
        setIsPaused(false);
      } else {
        handleNextGroupRef.current();
      }
    };
  }, [currentGroup, currentStoryIndex]);

  useEffect(() => {
    handlePrevRef.current = () => {
      if (currentStoryIndex > 0) {
        setCurrentStoryIndex(currentStoryIndex - 1);
        isPausedRef.current = false;
        setIsPaused(false);
      } else if (currentGroupIndex > 0) {
        const prevGroupIdx = currentGroupIndex - 1;
        const prevGroup = groups[prevGroupIdx];
        setCurrentGroupIndex(prevGroupIdx);
        setCurrentStoryIndex(
          prevGroup ? Math.max(prevGroup.stories.length - 1, 0) : 0,
        );
        isPausedRef.current = false;
        setIsPaused(false);
        if (prevGroup) {
          callbacksRef.current.onGroupChange?.(prevGroup, prevGroupIdx);
        }
      } else {
        // Restart first story when tapping back at the beginning
        isPausedRef.current = false;
        setIsPaused(false);
        startProgress();
      }
    };
  }, [currentStoryIndex, currentGroupIndex, groups, startProgress]);

  // ─────────────────────────────────────────
  // Media Callbacks
  // ─────────────────────────────────────────

  const notifyMediaReady = useCallback((meta?: StoryMediaReadyMeta) => {
    detectedDurationMsRef.current = meta?.durationMs;
    isMediaReadyRef.current = true;
    setIsMediaReady(true);
  }, []);

  const notifyVideoEnd = useCallback(() => {
    handleNext();
  }, [handleNext]);

  // ─────────────────────────────────────────
  // Gestures (Vertical Dismiss + Horizontal Group Swipe + LongPress Pause)
  // ─────────────────────────────────────────

  const handleClose = useCallback(() => {
    callbacksRef.current.onClose();
  }, []);

  const panGesture = Gesture.Pan()
    .minDistance(12)
    .onStart(() => {
      gestureAxis.value = 'none';
      runOnJS(pauseProgress)();
    })
    .onChange((event) => {
      if (gestureAxis.value === 'none') {
        gestureAxis.value =
          Math.abs(event.translationX) > Math.abs(event.translationY)
            ? 'horizontal'
            : 'vertical';
      }

      if (gestureAxis.value === 'vertical') {
        translateY.value = Math.max(0, event.translationY);
      } else {
        translateX.value = event.translationX * 0.85;
      }
    })
    .onEnd((event) => {
      const axis = gestureAxis.value;
      gestureAxis.value = 'none';

      if (axis === 'vertical') {
        if (
          event.translationY > config.dismissThreshold ||
          event.velocityY > 900
        ) {
          runOnJS(handleClose)();
        } else {
          translateY.value = withSpring(0, { damping: 22, stiffness: 320 });
          runOnJS(resumeProgress)();
        }
      } else if (axis === 'horizontal') {
        translateX.value = withSpring(0, { damping: 24, stiffness: 320 });

        if (
          event.translationX < -config.swipeHorizontalThreshold ||
          event.velocityX < -700
        ) {
          runOnJS(handleNextGroup)();
        } else if (
          event.translationX > config.swipeHorizontalThreshold ||
          event.velocityX > 700
        ) {
          runOnJS(handlePrevGroup)();
        } else {
          runOnJS(resumeProgress)();
        }
      } else {
        translateX.value = 0;
        translateY.value = 0;
        runOnJS(resumeProgress)();
      }
    });

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

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [0, 320],
      [1, 0.92],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale },
      ],
    };
  });

  // ─────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────

  // Reset state whenever modal opens/closes
  useEffect(() => {
    if (isVisible) {
      const targetGroupIdx = Math.max(
        0,
        Math.min(params.initialGroupIndex ?? 0, Math.max(groups.length - 1, 0)),
      );
      const targetGroup = groups[targetGroupIdx];
      setCurrentGroupIndex(targetGroupIdx);
      setCurrentStoryIndex(
        resolveInitialStoryIndex(
          targetGroup,
          params.initialStoryIndex,
          config.startFromFirstUnseen,
        ),
      );
      isPausedRef.current = false;
      setIsPaused(false);
      setIsMuted(config.defaultMuted);
      isMediaReadyRef.current = false;
      setIsMediaReady(false);
      detectedDurationMsRef.current = undefined;
      translateX.value = 0;
      translateY.value = 0;
      cancelAnimation(progress);
      progress.value = 0;
    } else {
      cancelAnimation(progress);
      translateX.value = 0;
      translateY.value = 0;
    }
  }, [isVisible]);

  // Reset progress & emit seen/change events whenever the active story changes
  useEffect(() => {
    if (!isVisible || !currentStory || !currentGroup) return;

    isMediaReadyRef.current = false;
    setIsMediaReady(false);
    detectedDurationMsRef.current = undefined;
    cancelAnimation(progress);
    progress.value = 0;

    callbacksRef.current.onStorySeen?.(currentStory, currentGroup);
    callbacksRef.current.onStoryChange?.(
      currentStory,
      currentGroup,
      currentStoryIndex,
    );
  }, [currentStoryIndex, currentGroupIndex, isVisible]);

  // Start progress animation once media reports ready
  useEffect(() => {
    if (!isVisible || !isMediaReady || !currentStory) return;
    startProgress();
  }, [isMediaReady, isVisible, currentStory, startProgress]);

  // Prefetch upcoming story images/posters in the background
  useEffect(() => {
    if (!isVisible || !config.prefetchNextMedia) return;

    const urls = getPrefetchUrls(
      groups,
      currentGroupIndex,
      currentStoryIndex,
      config.startFromFirstUnseen,
    );

    urls.forEach((url) => {
      Promise.resolve(Image.prefetch(url)).catch(() => {
        // Ignore background prefetch errors
      });
    });
  }, [
    isVisible,
    config.prefetchNextMedia,
    config.startFromFirstUnseen,
    groups,
    currentGroupIndex,
    currentStoryIndex,
  ]);

  return {
    // Current state
    currentGroup,
    currentStory,
    currentGroupIndex,
    currentStoryIndex,
    isPaused,
    isMuted,
    isMediaReady,

    // Shared values (Reanimated)
    progress,
    translateX,
    translateY,

    // Animated styles
    containerAnimatedStyle,

    // Gestures
    panGesture,
    longPressGesture,

    // Actions
    handleNext,
    handlePrev,
    handleNextGroup,
    handlePrevGroup,
    pauseProgress,
    resumeProgress,
    toggleMute,
    setIsMuted,

    // Media callbacks (pass to StoryMedia)
    notifyMediaReady,
    notifyVideoEnd,
  };
}
