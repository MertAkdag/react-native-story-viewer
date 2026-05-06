"use strict";

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

import React from 'react';
import { View, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector, GestureHandlerRootView, Gesture } from 'react-native-gesture-handler';
import { useStoryViewer } from './hooks/useStoryViewer';
import { StoryProgressBar } from './components/StoryProgressBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StoryHeader } from './components/StoryHeader';
import { StoryMedia } from './components/StoryMedia';
import { StoryCta } from './components/StoryCta';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function StoryViewer(props) {
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
  const viewer = useStoryViewer({
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
  const insets = useSafeAreaInsets();
  const bgColor = theme?.backgroundColor || 'black';

  // Combine Pan + LongPress gestures
  // Simultaneous: both gestures can be active at the same time
  const composedGesture = Gesture.Simultaneous(viewer.panGesture, viewer.longPressGesture);
  return /*#__PURE__*/_jsx(Modal, {
    visible: isVisible,
    transparent: true,
    animationType: "fade",
    children: /*#__PURE__*/_jsx(GestureHandlerRootView, {
      style: [styles.root, {
        backgroundColor: bgColor
      }],
      children: /*#__PURE__*/_jsx(GestureDetector, {
        gesture: composedGesture,
        children: /*#__PURE__*/_jsxs(Animated.View, {
          style: [styles.container, viewer.containerAnimatedStyle, {
            backgroundColor: bgColor
          }],
          children: [/*#__PURE__*/_jsx(StoryMedia, {
            mediaUrl: currentStory.mediaUrl,
            mediaType: currentStory.mediaType,
            posterUrl: currentStory.posterUrl,
            isPaused: viewer.isPaused,
            onMediaReady: viewer.notifyMediaReady,
            onVideoEnd: viewer.notifyVideoEnd
          }), /*#__PURE__*/_jsxs(View, {
            style: [styles.header, {
              top: insets.top
            }],
            children: [/*#__PURE__*/_jsx(StoryProgressBar, {
              totalCount: currentGroup.stories.length,
              currentIndex: viewer.currentStoryIndex,
              progress: viewer.progress
            }), /*#__PURE__*/_jsx(StoryHeader, {
              avatarUrl: currentGroup.avatarUrl,
              name: currentGroup.name,
              onClose: onClose,
              renderCloseButton: customComponents?.renderCloseButton
            })]
          }), currentStory.cta && onCtaPress && /*#__PURE__*/_jsx(StoryCta, {
            cta: currentStory.cta,
            onPress: () => onCtaPress(currentStory.cta, currentStory, currentGroup),
            renderCtaIcon: customComponents?.renderCtaIcon
          }), /*#__PURE__*/_jsxs(View, {
            style: styles.touchAreas,
            children: [/*#__PURE__*/_jsx(TouchableWithoutFeedback, {
              onPress: viewer.handlePrev,
              children: /*#__PURE__*/_jsx(View, {
                style: styles.touchLeft
              })
            }), /*#__PURE__*/_jsx(TouchableWithoutFeedback, {
              onPress: viewer.handleNext,
              children: /*#__PURE__*/_jsx(View, {
                style: styles.touchRight
              })
            })]
          })]
        })
      })
    })
  });
}
const styles = StyleSheet.create({
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